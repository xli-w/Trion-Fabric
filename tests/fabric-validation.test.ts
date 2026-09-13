import { describe, expect, it } from 'vitest';

import { fabricFixtures } from '@app/data/development/fabric-fixtures';
import { fabricDatasetSchema } from '@validation';

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

describe('Fabric dataset relationship and governance validation', () => {
  it('accepts the validated development engagement baseline', () => {
    expect(fabricDatasetSchema.safeParse(fabricFixtures).success).toBe(true);
  });

  it('rejects an initiative promoted from an unapproved opportunity', () => {
    const dataset = copyDataset();
    const initiative = dataset.initiatives[0];
    if (!initiative) throw new Error('Expected a fixture initiative.');

    initiative.opportunityId = 'opportunity-unify-ncr-routing';

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(hasIssueAtPath(result, 'initiatives.0.opportunityId')).toBe(true);
  });

  it('rejects an approved opportunity without evidence or reasoning provenance', () => {
    const dataset = copyDataset();
    const opportunity = dataset.opportunities.find(
      (item) => item.id === 'opportunity-digitise-handover',
    );
    if (!opportunity)
      throw new Error('Expected an approved fixture opportunity.');

    opportunity.evidenceIds = [];
    opportunity.relatedObservationIds = [];
    opportunity.relatedFindingIds = [];

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(hasIssueAtPath(result, 'opportunities.0.evidenceIds')).toBe(true);
  });

  it('rejects cross-engagement roadmap initiatives', () => {
    const dataset = copyDataset();
    const roadmap = dataset.roadmaps[0];
    if (!roadmap) throw new Error('Expected a fixture roadmap.');

    roadmap.initiativeIds = ['initiative-handover-foundation'];
    roadmap.engagementId = 'engagement-airedale-discovery';

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(hasIssueAtPath(result, 'roadmaps.0.initiativeIds.0')).toBe(true);
  });

  it('requires roadmap phases to include each sequenced initiative phase', () => {
    const dataset = copyDataset();
    const roadmap = dataset.roadmaps[0];
    if (!roadmap) throw new Error('Expected a fixture roadmap.');

    roadmap.phases = ['Connect'];

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(hasIssueAtPath(result, 'roadmaps.0.initiativeIds.0')).toBe(true);
  });

  it('rejects evidence attached to a different engagement than its declared relation', () => {
    const dataset = copyDataset();
    const evidence = dataset.evidence.find(
      (item) => item.id === 'evidence-handover-photo',
    );
    if (!evidence) throw new Error('Expected a fixture evidence record.');

    evidence.siteWalkId = 'walk-airedale-intake-01';

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(hasIssueAtPath(result, 'evidence.0.relatedEntityId')).toBe(true);
  });

  it('accepts managed file keys and rejects local or direct file references', () => {
    const safeDataset = copyDataset();
    const safeEvidence = safeDataset.evidence[0];
    if (!safeEvidence) throw new Error('Expected an evidence fixture.');

    safeEvidence.fileReference = 'evidence/northbank/handover-photo-01';
    expect(fabricDatasetSchema.safeParse(safeDataset).success).toBe(true);

    const unsafeDataset = copyDataset();
    const unsafeEvidence = unsafeDataset.evidence[0];
    if (!unsafeEvidence) throw new Error('Expected an evidence fixture.');

    unsafeEvidence.fileReference = 'file:///C:/Users/example/private-photo.jpg';
    const result = fabricDatasetSchema.safeParse(unsafeDataset);

    expect(result.success).toBe(false);
    expect(hasIssueAtPath(result, 'evidence.0.fileReference')).toBe(true);
  });

  it('rejects published output sourced from unapproved material', () => {
    const dataset = copyDataset();
    const output = dataset.outputs.find(
      (item) => item.id === 'output-northbank-transformation-roadmap',
    );
    if (!output) throw new Error('Expected a published roadmap output.');

    output.sourceReferences = ['opportunity-unify-ncr-routing'];
    const outputIndex = dataset.outputs.findIndex(
      (item) => item.id === output.id,
    );

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(
      hasIssueAtPath(result, `outputs.${outputIndex}.sourceReferences.0`),
    ).toBe(true);
  });

  it('rejects approval metadata on an internal-review output', () => {
    const dataset = copyDataset();
    const output = dataset.outputs.find(
      (item) => item.id === 'output-northbank-maturity-scorecard',
    );
    if (!output) throw new Error('Expected an internal-review output.');

    output.approvedByUserId = 'user-amy-wilkinson';
    output.approvedAt = '2026-09-12T15:30:00Z';
    const outputIndex = dataset.outputs.findIndex(
      (item) => item.id === output.id,
    );

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(hasIssueAtPath(result, `outputs.${outputIndex}.approvedAt`)).toBe(
      true,
    );
  });

  it('requires client-facing observations to be verified before approval', () => {
    const dataset = copyDataset();
    const observation = dataset.observations.find(
      (item) => item.id === 'observation-paper-handover',
    );
    if (!observation)
      throw new Error('Expected an observation requiring review.');

    observation.visibility = 'approved-client-facing';

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(hasIssueAtPath(result, 'observations.0.visibility')).toBe(true);
  });

  it('rejects client-facing opportunity visibility before approval', () => {
    const dataset = copyDataset();
    const opportunity = dataset.opportunities.find(
      (item) => item.id === 'opportunity-standardise-receipts',
    );
    if (!opportunity) throw new Error('Expected a draft fixture opportunity.');

    opportunity.visibility = 'approved-client-facing';

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(hasIssueAtPath(result, 'opportunities.2.visibility')).toBe(true);
  });

  it('requires each activity event to retain a valid actor and entity reference', () => {
    const dataset = copyDataset();
    const activity = dataset.activityEvents[0];
    if (!activity) throw new Error('Expected an activity event.');

    activity.actorUserId = 'user-not-in-workspace';

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(hasIssueAtPath(result, 'activityEvents.0.actorUserId')).toBe(true);
  });

  it('requires observed values and dates before validating a benefit', () => {
    const dataset = copyDataset();
    const benefit = dataset.benefitMeasurements[0];
    if (!benefit) throw new Error('Expected a fixture benefit measurement.');

    benefit.status = 'validated';

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(hasIssueAtPath(result, 'benefitMeasurements.0.actualValue')).toBe(
      true,
    );
    expect(
      hasIssueAtPath(result, 'benefitMeasurements.0.measurementDate'),
    ).toBe(true);
  });

  it('rejects circular delivery-action dependencies', () => {
    const dataset = copyDataset();
    const action = dataset.deliveryActions[0];
    if (!action) throw new Error('Expected a fixture delivery action.');

    const dependentAction = {
      ...action,
      id: 'delivery-action-handover-validate',
      title: 'Validate pilot results',
      dependencyIds: [action.id],
    };
    action.dependencyIds = [dependentAction.id];
    dataset.deliveryActions.push(dependentAction);

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(hasIssueAtPath(result, 'deliveryActions.0.dependencyIds.0')).toBe(
      true,
    );
  });

  it('accepts a validated benefit after actual results and a measurement date are recorded', () => {
    const dataset = copyDataset();
    const benefit = dataset.benefitMeasurements[0];
    if (!benefit) throw new Error('Expected a fixture benefit measurement.');

    benefit.status = 'validated';
    benefit.actualValue = '12 minutes per shift';
    benefit.measurementDate = '2026-11-01T09:00:00Z';

    expect(fabricDatasetSchema.safeParse(dataset).success).toBe(true);
  });

  it('requires a frozen report snapshot before an output can be approved or published', () => {
    const dataset = copyDataset();
    const output = dataset.outputs.find(
      (item) => item.id === 'output-northbank-transformation-roadmap',
    );
    if (!output) throw new Error('Expected a published roadmap output.');

    output.reportSnapshot = undefined;
    const outputIndex = dataset.outputs.findIndex(
      (item) => item.id === output.id,
    );
    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(
      hasIssueAtPath(result, `outputs.${outputIndex}.reportSnapshot`),
    ).toBe(true);
  });

  it('rejects invalid, non-editorial, and duplicate report overrides', () => {
    const dataset = copyDataset();
    const output = dataset.outputs.find(
      (item) => item.id === 'output-northbank-executive-summary',
    );
    if (!output) throw new Error('Expected an executive-summary output.');

    output.sectionOverrides = [
      {
        sectionId: 'missing-report-section',
        narrative: 'A report section that is not part of this template.',
        sourceReferences: ['opportunity-digitise-handover'],
      },
      {
        sectionId: 'key-findings',
        narrative: 'An attempt to replace generated findings.',
        sourceReferences: ['opportunity-digitise-handover'],
      },
      {
        sectionId: 'current-state',
        narrative: 'First controlled editorial narrative.',
        sourceReferences: ['opportunity-digitise-handover'],
      },
      {
        sectionId: 'current-state',
        narrative: 'Duplicate controlled editorial narrative.',
        sourceReferences: ['opportunity-digitise-handover'],
      },
    ];
    const outputIndex = dataset.outputs.findIndex(
      (item) => item.id === output.id,
    );
    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(
      hasIssueAtPath(
        result,
        `outputs.${outputIndex}.sectionOverrides.0.sectionId`,
      ),
    ).toBe(true);
    expect(
      hasIssueAtPath(
        result,
        `outputs.${outputIndex}.sectionOverrides.1.sectionId`,
      ),
    ).toBe(true);
    expect(
      hasIssueAtPath(
        result,
        `outputs.${outputIndex}.sectionOverrides.3.sectionId`,
      ),
    ).toBe(true);
  });

  it('keeps report snapshot sources and tables structurally aligned', () => {
    const dataset = copyDataset();
    const output = dataset.outputs.find(
      (item) => item.id === 'output-northbank-transformation-roadmap',
    );
    if (!output?.reportSnapshot) {
      throw new Error('Expected a roadmap report snapshot.');
    }
    const reportSectionIndex = output.reportSnapshot.sections.findIndex(
      (section) => section.blocks.some((block) => block.type === 'table'),
    );
    const reportSection = output.reportSnapshot.sections[reportSectionIndex];
    const reportBlockIndex = reportSection?.blocks.findIndex(
      (block) => block.type === 'table',
    );
    const reportTable =
      reportBlockIndex === undefined || reportBlockIndex < 0
        ? undefined
        : reportSection?.blocks[reportBlockIndex];
    if (!reportTable || reportTable.type !== 'table') {
      throw new Error('Expected a report table.');
    }

    const includedSourceIndex = output.reportSnapshot.includedSources.length;
    output.reportSnapshot.includedSources.push({
      id: 'source-not-selected-by-output',
      type: 'finding',
      title: 'A source that is not selected by the output',
    });

    it('requires approved editorial narratives to retain approved source citations', () => {
      const dataset = copyDataset();
      const output = dataset.outputs.find(
        (item) => item.id === 'output-northbank-transformation-roadmap',
      );
      if (!output) throw new Error('Expected a published roadmap output.');

      output.sourceReferences.push('opportunity-unify-ncr-routing');
      output.sectionOverrides = [
        {
          sectionId: 'roadmap-next-steps',
          narrative:
            'An editorial narrative that improperly draws on unapproved material.',
          sourceReferences: ['opportunity-unify-ncr-routing'],
        },
      ];

      const outputIndex = dataset.outputs.findIndex(
        (item) => item.id === output.id,
      );
      const result = fabricDatasetSchema.safeParse(dataset);

      expect(result.success).toBe(false);
      expect(
        hasIssueAtPath(
          result,
          `outputs.${outputIndex}.sectionOverrides.0.sourceReferences.0`,
        ),
      ).toBe(true);
    });

    it('rejects a report snapshot whose full-content fingerprint was altered', () => {
      const dataset = copyDataset();
      const output = dataset.outputs.find(
        (item) => item.id === 'output-northbank-transformation-roadmap',
      );
      if (!output?.reportSnapshot) {
        throw new Error('Expected a roadmap report snapshot.');
      }

      const section = output.reportSnapshot.sections.find(
        (item) => item.id === 'roadmap-next-steps',
      );
      const paragraph = section?.blocks.find(
        (block) => block.type === 'paragraph',
      );
      if (!paragraph || paragraph.type !== 'paragraph') {
        throw new Error('Expected a roadmap editorial paragraph.');
      }
      paragraph.content = 'Altered report content without a new fingerprint.';

      const outputIndex = dataset.outputs.findIndex(
        (item) => item.id === output.id,
      );
      const result = fabricDatasetSchema.safeParse(dataset);

      expect(result.success).toBe(false);
      expect(
        hasIssueAtPath(
          result,
          `outputs.${outputIndex}.reportSnapshot.contentFingerprint`,
        ),
      ).toBe(true);
    });
    reportTable.rows[0]?.push('Unexpected extra table cell');

    const outputIndex = dataset.outputs.findIndex(
      (item) => item.id === output.id,
    );
    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(
      hasIssueAtPath(
        result,
        `outputs.${outputIndex}.reportSnapshot.includedSources.${includedSourceIndex}.id`,
      ),
    ).toBe(true);
    expect(
      result.success ||
        result.error.issues.some(
          (issue) =>
            issue.path.join('.') ===
            `outputs.${outputIndex}.reportSnapshot.sections.${reportSectionIndex}.blocks.${reportBlockIndex}.rows`,
        ),
    ).toBe(true);
  });

  it('rejects output revision cycles and approval with open review comments', () => {
    const dataset = copyDataset();
    const current = dataset.outputs.find(
      (item) => item.id === 'output-northbank-maturity-scorecard',
    );
    const predecessor = dataset.outputs.find(
      (item) => item.id === 'output-northbank-maturity-scorecard-v01',
    );
    const published = dataset.outputs.find(
      (item) => item.id === 'output-northbank-transformation-roadmap',
    );
    if (!current || !predecessor || !published) {
      throw new Error('Expected versioned and published output fixtures.');
    }

    predecessor.supersedesOutputId = current.id;
    dataset.outputReviewComments.push({
      id: 'output-review-comment-published-open',
      createdAt: '2026-09-13T11:00:00Z',
      updatedAt: '2026-09-13T11:00:00Z',
      outputId: published.id,
      body: 'Confirm the owner wording before approval.',
      authorUserId: 'user-nadia-khan',
      status: 'open',
    });

    const currentIndex = dataset.outputs.findIndex(
      (item) => item.id === current.id,
    );
    const publishedIndex = dataset.outputs.findIndex(
      (item) => item.id === published.id,
    );
    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(
      hasIssueAtPath(result, `outputs.${currentIndex}.supersedesOutputId`),
    ).toBe(true);
    expect(hasIssueAtPath(result, `outputs.${publishedIndex}.status`)).toBe(
      true,
    );
  });

  it('rejects unsafe client-facing friction and action summaries', () => {
    const dataset = copyDataset();
    const friction = dataset.frictionItems[0];
    const action = dataset.actionItems.find(
      (item) => item.id === 'action-map-handover-fields',
    );
    if (!friction || !action) {
      throw new Error('Expected client-facing friction and action fixtures.');
    }

    friction.clientSummary = undefined;
    action.clientSummary = undefined;
    const actionIndex = dataset.actionItems.findIndex(
      (item) => item.id === action.id,
    );
    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(hasIssueAtPath(result, 'frictionItems.0.visibility')).toBe(true);
    expect(
      hasIssueAtPath(result, `actionItems.${actionIndex}.visibility`),
    ).toBe(true);
  });

  it('rejects client-facing and mismatched-fingerprint export references', () => {
    const dataset = copyDataset();
    const draft = dataset.outputs.find(
      (item) => item.id === 'output-northbank-executive-summary',
    );
    const published = dataset.outputs.find(
      (item) => item.id === 'output-northbank-transformation-roadmap',
    );
    const existingExport = dataset.outputExports[0];
    if (!draft || !published || !existingExport) {
      throw new Error('Expected report export fixtures.');
    }

    dataset.outputExports.push({
      ...existingExport,
      id: 'output-export-draft-client-facing',
      outputId: draft.id,
      outputVersion: draft.version,
      audience: 'client-facing',
      fileName: 'draft-client-facing-report.md',
      sourceFingerprint: draft.reportSnapshot?.sourceFingerprint ?? 'missing',
      contentFingerprint: draft.reportSnapshot?.contentFingerprint ?? 'missing',
    });
    const fingerprintExportIndex = dataset.outputExports.length;
    dataset.outputExports.push({
      ...existingExport,
      id: 'output-export-wrong-fingerprint',
      outputId: published.id,
      outputVersion: published.version,
      sourceFingerprint: 'not-the-report-snapshot-fingerprint',
      contentFingerprint:
        published.reportSnapshot?.contentFingerprint ?? 'missing',
    });
    const contentFingerprintExportIndex = dataset.outputExports.length;
    dataset.outputExports.push({
      ...existingExport,
      id: 'output-export-wrong-content-fingerprint',
      outputId: published.id,
      outputVersion: published.version,
      sourceFingerprint:
        published.reportSnapshot?.sourceFingerprint ?? 'missing',
      contentFingerprint: 'not-the-report-content-fingerprint',
    });
    const draftExportIndex = dataset.outputExports.findIndex(
      (item) => item.id === 'output-export-draft-client-facing',
    );
    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(
      hasIssueAtPath(result, `outputExports.${draftExportIndex}.audience`),
    ).toBe(true);
    expect(
      hasIssueAtPath(
        result,
        `outputExports.${fingerprintExportIndex}.sourceFingerprint`,
      ),
    ).toBe(true);
    expect(
      hasIssueAtPath(
        result,
        `outputExports.${contentFingerprintExportIndex}.contentFingerprint`,
      ),
    ).toBe(true);
  });
});
