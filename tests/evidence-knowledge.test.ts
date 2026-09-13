import { describe, expect, it } from 'vitest';

import { fabricFixtures } from '@app/data/development/fabric-fixtures';
import {
  buildEvidenceLibrary,
  buildGlobalSearchResults,
  buildKnowledgeLibrary,
} from '@app/features/fabric-data/selectors';
import {
  buildPermissionFilteredRetrievalSources,
  prepareKnowledgeEntryUpdate,
  retrieveRelevantFabricKnowledge,
} from '@domain';
import { fabricDatasetSchema } from '@validation';

function copyDataset() {
  return fabricDatasetSchema.parse(fabricFixtures);
}

function requireUser(dataset: ReturnType<typeof copyDataset>, userId: string) {
  const user = dataset.users.find((item) => item.id === userId);
  if (!user) {
    throw new Error(`Expected user ${userId}.`);
  }
  return user;
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

describe('evidence search and reusable knowledge', () => {
  it('indexes every required engagement domain without exposing inaccessible records', () => {
    const dataset = copyDataset();
    const actor = requireUser(dataset, 'user-amy-wilkinson');
    const sources = buildPermissionFilteredRetrievalSources(dataset, actor);
    const sourceTypes = new Set(sources.map((source) => source.type));

    const requiredSourceTypes: Array<(typeof sources)[number]['type']> = [
      'client',
      'site',
      'engagement',
      'site-walk',
      'observation',
      'evidence',
      'finding',
      'opportunity',
      'initiative',
      'output',
      'landscape-entity',
      'knowledge',
    ];
    requiredSourceTypes.forEach((sourceType) => {
      expect(sourceTypes.has(sourceType)).toBe(true);
    });
    expect(
      sources.some(
        (source) => source.engagementId === 'engagement-airedale-discovery',
      ),
    ).toBe(false);
  });

  it('builds a traceable, scoped evidence library with structured filters', () => {
    const dataset = copyDataset();
    const actor = requireUser(dataset, 'user-amy-wilkinson');
    const library = buildEvidenceLibrary(dataset, actor, {
      processId: 'process-shift-handover',
      evidenceType: 'Photograph',
    });
    const downtimeEvidence = library.rows.find(
      (item) => item.id === 'evidence-manual-downtime-log',
    );

    expect(library.rows).toHaveLength(2);
    expect(downtimeEvidence?.source).toBe('Directly observed');
    expect(downtimeEvidence?.recordedByNames).toContain('Amy Wilkinson');
    expect(downtimeEvidence?.links.map((link) => link.type)).toEqual(
      expect.arrayContaining([
        'Observation',
        'Site walk',
        'Finding',
        'Opportunity',
        'Roadmap initiative',
        'Output',
      ]),
    );
  });

  it('matches consultant language rather than only database labels', () => {
    const dataset = copyDataset();
    const actor = requireUser(dataset, 'user-amy-wilkinson');
    const paperTracking = buildGlobalSearchResults(
      dataset,
      'paper production tracking',
      actor,
    );
    const spreadsheetWorkaround = buildGlobalSearchResults(
      dataset,
      'ERP spreadsheet workaround',
      actor,
    );

    expect(
      paperTracking.some(
        (item) => item.type === 'Evidence' || item.type === 'Observation',
      ),
    ).toBe(true);
    expect(
      spreadsheetWorkaround.some(
        (item) => item.id === 'evidence-erp-spreadsheet-workaround',
      ),
    ).toBe(true);
  });

  it('does not retrieve another engagement’s raw records for an assigned consultant', () => {
    const dataset = copyDataset();
    const actor = requireUser(dataset, 'user-sarah-mitchell');
    const results = retrieveRelevantFabricKnowledge(dataset, {
      actor,
      query: 'handover',
      limit: 20,
    });

    expect(results).not.toEqual([]);
    expect(
      results.every(
        (result) =>
          result.sourceType === 'knowledge' ||
          result.engagementId === 'engagement-airedale-discovery',
      ),
    ).toBe(true);
    expect(
      results.some((result) => result.sourceId === 'evidence-handover-photo'),
    ).toBe(false);
  });

  it('retrieves only approved internal knowledge with source identifiers', () => {
    const dataset = copyDataset();
    const actor = requireUser(dataset, 'user-james-carter');
    const results = retrieveRelevantFabricKnowledge(dataset, {
      actor,
      query: 'spreadsheet workaround',
      sourceTypes: ['knowledge'],
    });

    expect(results.map((result) => result.sourceId)).toContain(
      'knowledge-pattern-paper-first-tracking',
    );
    expect(results.map((result) => result.sourceId)).not.toContain(
      'knowledge-checklist-system-workaround-review',
    );
    expect(results[0]?.sourceIdentifiers).toEqual([results[0]?.sourceId]);
    expect(results[0]?.excerpt).toBeTruthy();
    expect(results[0]?.relevance).toBeGreaterThan(0);
  });

  it('keeps draft knowledge out of standard knowledge views for non-maintainers', () => {
    const dataset = copyDataset();
    const readOnlyActor = requireUser(dataset, 'user-daniel-ward');
    const maintainer = requireUser(dataset, 'user-amy-wilkinson');

    const readOnlyLibrary = buildKnowledgeLibrary(dataset, readOnlyActor);
    const maintainerLibrary = buildKnowledgeLibrary(dataset, maintainer);

    expect(
      readOnlyLibrary.rows.every((entry) => entry.status === 'approved'),
    ).toBe(true);
    expect(
      maintainerLibrary.rows.some(
        (entry) => entry.id === 'knowledge-checklist-system-workaround-review',
      ),
    ).toBe(true);
  });

  it('returns revised approved knowledge to a draft and retains explicit approval provenance', () => {
    const dataset = copyDataset();
    const approved = dataset.knowledgeEntries.find(
      (entry) => entry.id === 'knowledge-pattern-paper-first-tracking',
    );
    const inReview = dataset.knowledgeEntries.find(
      (entry) => entry.id === 'knowledge-checklist-system-workaround-review',
    );
    if (!approved || !inReview) {
      throw new Error('Expected knowledge fixtures.');
    }

    const revised = prepareKnowledgeEntryUpdate(
      approved,
      { ...approved, content: `${approved.content} Revised guidance.` },
      'user-amy-wilkinson',
      '2026-09-13T12:00:00Z',
    );
    const approvedForReuse = prepareKnowledgeEntryUpdate(
      inReview,
      { ...inReview, status: 'approved' },
      'user-nadia-khan',
      '2026-09-13T12:00:00Z',
    );

    expect(revised.status).toBe('draft');
    expect(revised.reviewedAt).toBeUndefined();
    expect(approvedForReuse.status).toBe('approved');
    expect(approvedForReuse.reviewedByUserId).toBe('user-nadia-khan');
  });

  it('rejects reusable knowledge that could be marked client-facing or lacks approval provenance', () => {
    const dataset = copyDataset();
    const invalidVisibilityDataset = {
      ...dataset,
      knowledgeEntries: dataset.knowledgeEntries.map((entry, index) =>
        index === 0 ? { ...entry, visibility: 'draft-client-facing' } : entry,
      ),
    };
    const invalidApprovalDataset = {
      ...dataset,
      knowledgeEntries: dataset.knowledgeEntries.map((entry, index) =>
        index === 0
          ? {
              ...entry,
              reviewedByUserId: undefined,
              reviewedAt: undefined,
            }
          : entry,
      ),
    };
    const invalidOutputSourceDataset = {
      ...dataset,
      outputs: dataset.outputs.map((output, index) =>
        index === 0
          ? {
              ...output,
              sourceReferences: ['knowledge-pattern-paper-first-tracking'],
            }
          : output,
      ),
    };

    const visibilityResult = fabricDatasetSchema.safeParse(
      invalidVisibilityDataset,
    );
    const approvalResult = fabricDatasetSchema.safeParse(
      invalidApprovalDataset,
    );
    const outputSourceResult = fabricDatasetSchema.safeParse(
      invalidOutputSourceDataset,
    );

    expect(visibilityResult.success).toBe(false);
    expect(
      hasIssueAtPath(visibilityResult, 'knowledgeEntries.0.visibility'),
    ).toBe(true);
    expect(approvalResult.success).toBe(false);
    expect(
      hasIssueAtPath(approvalResult, 'knowledgeEntries.0.reviewedAt'),
    ).toBe(true);
    expect(outputSourceResult.success).toBe(false);
    expect(
      hasIssueAtPath(outputSourceResult, 'outputs.0.sourceReferences.0'),
    ).toBe(true);
  });
});
