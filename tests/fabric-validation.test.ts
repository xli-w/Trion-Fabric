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

  it('rejects published output sourced from unapproved material', () => {
    const dataset = copyDataset();
    const output = dataset.outputs.find(
      (item) => item.id === 'output-northbank-transformation-roadmap',
    );
    if (!output) throw new Error('Expected a published roadmap output.');

    output.sourceReferences = ['opportunity-unify-ncr-routing'];

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(hasIssueAtPath(result, 'outputs.4.sourceReferences.0')).toBe(true);
  });

  it('rejects approval metadata on an internal-review output', () => {
    const dataset = copyDataset();
    const output = dataset.outputs.find(
      (item) => item.id === 'output-northbank-maturity-scorecard',
    );
    if (!output) throw new Error('Expected an internal-review output.');

    output.approvedByUserId = 'user-amy-wilkinson';
    output.approvedAt = '2026-09-12T15:30:00Z';

    const result = fabricDatasetSchema.safeParse(dataset);

    expect(result.success).toBe(false);
    expect(hasIssueAtPath(result, 'outputs.1.approvedAt')).toBe(true);
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
});
