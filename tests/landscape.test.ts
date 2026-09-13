import { describe, expect, it } from 'vitest';

import { fabricFixtures } from '@app/data/development/fabric-fixtures';
import { buildLandscapeWorkbench } from '@app/features/fabric-data/selectors';
import {
  buildApprovedLandscapeA3Projection,
  buildEngagementContext,
  buildLandscapeQualityIndicators,
  createLandscapeVersionSnapshot,
  landscapeViews,
} from '@domain';
import { fabricDatasetSchema } from '@validation';

const northbankEngagementId = 'engagement-northbank-diagnostic';

function copyDataset() {
  return fabricDatasetSchema.parse(fabricFixtures);
}

function hasIssueAtPath(
  result: ReturnType<typeof fabricDatasetSchema.safeParse>,
  path: string,
) {
  return (
    !result.success &&
    result.error.issues.some((issue) => issue.path.join('.') === path)
  );
}

describe('digital landscape builder', () => {
  it('preserves a version snapshot when the live landscape changes afterwards', () => {
    const dataset = copyDataset();
    const snapshot = createLandscapeVersionSnapshot(
      dataset,
      northbankEngagementId,
      'site-northbank-sheffield',
    );
    const liveEntity = dataset.landscapeEntities.find(
      (entity) => entity.id === 'landscape-process-shift-handover',
    );
    if (!liveEntity) {
      throw new Error('Expected the Northbank shift handover landscape item.');
    }

    liveEntity.name = 'Revised live shift handover';

    expect(
      snapshot.entities.find(
        (entity) =>
          entity.landscapeEntityId === 'landscape-process-shift-handover',
      )?.name,
    ).toBe('Shift handover');
    expect(snapshot.relationships).toHaveLength(
      dataset.landscapeRelationships.filter(
        (relationship) => relationship.engagementId === northbankEngagementId,
      ).length,
    );
  });

  it('rejects a landscape link to evidence from a different engagement', () => {
    const dataset = copyDataset();
    const entityIndex = dataset.landscapeEntities.findIndex(
      (entity) => entity.id === 'landscape-process-shift-handover',
    );
    if (entityIndex < 0) {
      throw new Error('Expected the Northbank shift handover landscape item.');
    }
    dataset.landscapeEntities[entityIndex].linkedEvidenceIds = [
      'evidence-receipts-interview',
    ];

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(
      hasIssueAtPath(
        result,
        `landscapeEntities.${entityIndex}.linkedEvidenceIds.0`,
      ),
    ).toBe(true);
  });

  it('rejects incompatible relationships and cross-engagement relationship evidence', () => {
    const incompatibleDataset = copyDataset();
    const relationshipIndex =
      incompatibleDataset.landscapeRelationships.findIndex(
        (relationship) => relationship.id === 'relationship-handover-epicor',
      );
    if (relationshipIndex < 0) {
      throw new Error('Expected the Northbank handover system relationship.');
    }
    incompatibleDataset.landscapeRelationships[relationshipIndex].type =
      'contains-process';

    const incompatibleResult =
      fabricDatasetSchema.safeParse(incompatibleDataset);

    expect(incompatibleResult.success).toBe(false);
    expect(
      hasIssueAtPath(
        incompatibleResult,
        `landscapeRelationships.${relationshipIndex}.type`,
      ),
    ).toBe(true);

    const evidenceDataset = copyDataset();
    evidenceDataset.landscapeRelationships[relationshipIndex].evidenceIds = [
      'evidence-receipts-interview',
    ];
    const evidenceResult = fabricDatasetSchema.safeParse(evidenceDataset);

    expect(evidenceResult.success).toBe(false);
    expect(
      hasIssueAtPath(
        evidenceResult,
        `landscapeRelationships.${relationshipIndex}.evidenceIds.0`,
      ),
    ).toBe(true);
  });

  it('returns review prompts rather than conclusions from structured landscape signals', () => {
    const indicators = buildLandscapeQualityIndicators(
      copyDataset(),
      northbankEngagementId,
    );
    const kinds = new Set(indicators.map((indicator) => indicator.kind));

    expect(kinds).toContain('manual-handoff');
    expect(kinds).toContain('duplicate-data-entry');
    expect(kinds).toContain('data-object-without-owner');
    expect(kinds).toContain('unvalidated-system-relationship');
    expect(kinds).toContain('process-with-friction-observation');
  });

  it('builds the five views from the same engagement-scoped records', () => {
    const dataset = copyDataset();
    const landscapeIds = new Set(
      dataset.landscapeEntities
        .filter((entity) => entity.engagementId === northbankEngagementId)
        .map((entity) => entity.id),
    );
    const viewModels = landscapeViews.map((view) => {
      const workbench = buildLandscapeWorkbench(
        dataset,
        northbankEngagementId,
        { view },
      );
      if (!workbench) {
        throw new Error(`Expected the ${view} landscape view.`);
      }
      return workbench;
    });

    viewModels.forEach((workbench) => {
      expect(
        workbench.entities.every((entity) => landscapeIds.has(entity.id)),
      ).toBe(true);
      expect(
        workbench.relationships.every((relationship) =>
          dataset.landscapeRelationships.some(
            (item) => item.id === relationship.id,
          ),
        ),
      ).toBe(true);
    });
    expect(
      viewModels[0]?.entities.some(
        (entity) => entity.id === 'landscape-process-shift-handover',
      ),
    ).toBe(true);
    expect(
      viewModels[1]?.entities.some(
        (entity) => entity.id === 'landscape-system-epicor',
      ),
    ).toBe(true);
    expect(
      viewModels[2]?.entities.some(
        (entity) => entity.id === 'landscape-data-shift-status',
      ),
    ).toBe(true);
    expect(
      viewModels[3]?.entities.some(
        (entity) => entity.id === 'landscape-role-machine-operator',
      ),
    ).toBe(true);
    expect(
      viewModels[4]?.entities.some(
        (entity) => entity.id === 'landscape-process-shift-handover',
      ),
    ).toBe(true);
  });

  it('keeps relationship matches visible when searching the landscape', () => {
    const workbench = buildLandscapeWorkbench(
      copyDataset(),
      northbankEngagementId,
      {
        view: 'systems',
        query: 'exact integration route',
      },
    );

    expect(
      workbench?.relationships.some(
        (relationship) =>
          relationship.id === 'relationship-qms-exchanges-epicor',
      ),
    ).toBe(true);
    expect(workbench?.entities.map((entity) => entity.id)).toEqual(
      expect.arrayContaining([
        'landscape-system-qms-sharepoint',
        'landscape-system-epicor',
      ]),
    );
  });

  it('excludes internal and unapproved landscape material from the client projection', () => {
    const dataset = copyDataset();
    const internal = buildEngagementContext(dataset, northbankEngagementId);
    const clientFacing = buildEngagementContext(
      dataset,
      northbankEngagementId,
      {
        audience: 'approved-client-facing',
      },
    );
    const projection = buildApprovedLandscapeA3Projection(
      dataset,
      northbankEngagementId,
    );

    expect(
      internal?.internal?.landscape.entities.some(
        (entity) =>
          entity.internalNotes ===
          'The paper-first handover is a current-state observation, not a recommended future design.',
      ),
    ).toBe(true);
    expect(clientFacing?.internal).toBeUndefined();
    expect(JSON.stringify(clientFacing)).not.toContain(
      'The paper-first handover is a current-state observation, not a recommended future design.',
    );
    expect(
      projection?.entities.some(
        (entity) => entity.id === 'landscape-process-ncr-reporting',
      ),
    ).toBe(false);
    expect(
      projection?.relationships.some(
        (relationship) => relationship.id === 'relationship-ncr-qms',
      ),
    ).toBe(false);
    expect(projection?.legend).toHaveLength(8);
  });

  it('requires snapshot relationships to remain within their version snapshot', () => {
    const dataset = copyDataset();
    const versionIndex = dataset.landscapeVersions.findIndex(
      (version) => version.id === 'landscape-version-northbank-baseline',
    );
    if (versionIndex < 0) {
      throw new Error('Expected the Northbank baseline landscape version.');
    }
    const relationship =
      dataset.landscapeVersions[versionIndex].relationships[0];
    if (!relationship) {
      throw new Error('Expected a relationship in the baseline snapshot.');
    }
    relationship.toEntityId = 'landscape-data-ncr-record';

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(
      hasIssueAtPath(
        result,
        `landscapeVersions.${versionIndex}.relationships.0.toEntityId`,
      ),
    ).toBe(true);
  });
});
