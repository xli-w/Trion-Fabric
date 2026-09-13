import { describe, expect, it } from 'vitest';

import { fabricFixtures } from '@app/data/development/fabric-fixtures';
import {
  buildEngagementContext,
  buildMethodologyRunProgress,
  preparePreliminarySiteWalkPromotion,
  synchroniseMethodologyRun,
} from '@domain';
import { fabricDatasetSchema } from '@validation';

function copyDataset() {
  return fabricDatasetSchema.parse(fabricFixtures);
}

function requireRecord<T>(record: T | undefined, description: string): T {
  if (!record) {
    throw new Error(`Expected ${description}.`);
  }
  return record;
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

describe('methodology templates and engagement context', () => {
  it('seeds the full Preliminary Site Walk and Digital Diagnostic stage structures', () => {
    const dataset = copyDataset();
    const preliminaryStages = dataset.methodologyStages
      .filter((stage) => stage.templateId === 'preliminary-site-walk-2026-1')
      .sort((left, right) => left.order - right.order);
    const digitalDiagnosticStages = dataset.methodologyStages
      .filter((stage) => stage.templateId === 'digital-diagnostic-2026-1')
      .sort((left, right) => left.order - right.order);

    expect(preliminaryStages.map((stage) => stage.name)).toEqual([
      'Pre-tour Briefing',
      'Shopfloor Tour',
      'Material and Process Flow',
      'Data and Paper-Tracking Red Flags',
      'Machine Operations and Downtime',
      'High-Impact Diagnostic Prompts',
      'Immediate Friction and Loss-Aversion Tracker',
      'Post-tour Recap',
      'Agreed Next Step',
    ]);
    expect(digitalDiagnosticStages.map((stage) => stage.name)).toEqual([
      'Engagement Setup',
      'Business Context',
      'Site Walks',
      'Process and Landscape Mapping',
      'Evidence Collection',
      'Maturity Assessment',
      'Findings',
      'Opportunity and Action Register',
      'Prioritisation',
      'Executive Summary',
      'Transformation Roadmap',
    ]);
  });

  it('distinguishes a completed checklist from a meaningfully supported stage', () => {
    const dataset = copyDataset();
    const run = requireRecord(
      dataset.engagementMethodologyRuns.find(
        (item) => item.id === 'methodology-run-airedale-preliminary-2026-1',
      ),
      'the Airedale Preliminary Site Walk run',
    );
    const stage = requireRecord(
      dataset.methodologyStages.find(
        (item) =>
          item.templateId === run.templateId &&
          item.name === 'Data and Paper-Tracking Red Flags',
      ),
      'the evidence collection preliminary stage',
    );
    const state = requireRecord(
      dataset.engagementMethodologyActivities.find(
        (item) =>
          item.runId === run.id && item.stageId === stage.id,
      ),
      'the evidence collection activity state',
    );

    dataset.evidence = [];
    state.status = 'completed';
    state.completedAt = '2026-09-13T10:00:00Z';
    state.completedByUserId = 'user-sarah-mitchell';
    state.completionNote = 'Prompt reviewed during the site walk.';

    const progress = requireRecord(
      buildMethodologyRunProgress(dataset, run.id),
      'methodology progress',
    );
    const evidenceStage = requireRecord(
      progress.stages.find((item) => item.stage.id === stage.id),
      'the evidence stage progress',
    );

    expect(evidenceStage.checklistComplete).toBe(true);
    expect(evidenceStage.meaningfulComplete).toBe(false);
    expect(evidenceStage.weaklySupported).toBe(true);
  });

  it('does not credit an optional skipped activity as completed diagnostic work', () => {
    const dataset = copyDataset();
    const progress = requireRecord(
      buildMethodologyRunProgress(
        dataset,
        'methodology-run-airedale-preliminary-2026-1',
      ),
      'Airedale methodology progress',
    );
    const optionalStage = requireRecord(
      progress.stages.find(
        (stage) => stage.stage.name === 'High-Impact Diagnostic Prompts',
      ),
      'the optional preliminary stage',
    );

    expect(optionalStage.requiredActivityCount).toBe(0);
    expect(optionalStage.checklistComplete).toBe(false);
    expect(optionalStage.meaningfulComplete).toBe(false);
    expect(optionalStage.status).toBe('skipped');
  });

  it('does not let an optional skipped stage prevent required work from completing', () => {
    const dataset = copyDataset();
    const run = requireRecord(
      dataset.engagementMethodologyRuns.find(
        (item) => item.id === 'methodology-run-airedale-preliminary-2026-1',
      ),
      'the Airedale Preliminary Site Walk run',
    );
    const sourceObservation = requireRecord(
      dataset.observations[0],
      'a source observation',
    );
    const sourceFrictionItem = requireRecord(
      dataset.frictionItems[0],
      'a source friction item',
    );
    const completedAt = '2026-09-13T10:00:00Z';
    const nextStates = dataset.engagementMethodologyActivities.map(
      (
        state,
      ): (typeof dataset.engagementMethodologyActivities)[number] => {
        const templateActivity = dataset.methodologyActivities.find(
          (activity) => activity.id === state.templateActivityId,
        );
        if (
          state.runId !== run.id ||
          templateActivity?.requirement !== 'required'
        ) {
          return state;
        }

        return {
          ...state,
          updatedAt: completedAt,
          status: 'completed',
          completedAt,
          completedByUserId: 'user-sarah-mitchell',
          completionNote: 'Required work completed for progression test.',
        };
      },
    );
    const completedRun = synchroniseMethodologyRun(
      {
        ...dataset,
        observations: [
          ...dataset.observations,
          {
            ...sourceObservation,
            id: 'observation-airedale-methodology-completion',
            siteWalkId: 'walk-airedale-intake-01',
          },
        ],
        frictionItems: [
          ...dataset.frictionItems,
          {
            ...sourceFrictionItem,
            id: 'friction-airedale-methodology-completion',
            siteWalkId: 'walk-airedale-intake-01',
          },
        ],
        engagementMethodologyActivities: nextStates,
      },
      run,
      nextStates,
      completedAt,
    );

    expect(completedRun.status).toBe('completed');
  });

  it('requires a reason for skipped optional activities and never permits required skips', () => {
    const optionalSkipDataset = copyDataset();
    const optionalActivity = requireRecord(
      optionalSkipDataset.methodologyActivities.find(
        (item) =>
          item.templateId === 'preliminary-site-walk-2026-1' &&
          item.requirement === 'optional',
      ),
      'an optional preliminary activity',
    );
    const optionalStateIndex =
      optionalSkipDataset.engagementMethodologyActivities.findIndex(
        (item) =>
          item.runId === 'methodology-run-airedale-preliminary-2026-1' &&
          item.templateActivityId === optionalActivity.id,
      );
    if (optionalStateIndex < 0) {
      throw new Error('Expected an optional preliminary activity state.');
    }
    const optionalState =
      optionalSkipDataset.engagementMethodologyActivities[optionalStateIndex];
    optionalState.status = 'skipped';
    optionalState.skippedAt = '2026-09-13T10:00:00Z';
    optionalState.skippedByUserId = 'user-sarah-mitchell';
    optionalState.skipReason = undefined;

    const optionalResult = fabricDatasetSchema.safeParse(optionalSkipDataset);
    expect(optionalResult.success).toBe(false);
    expect(
      hasIssueAtPath(
        optionalResult,
        `engagementMethodologyActivities.${optionalStateIndex}.skipReason`,
      ),
    ).toBe(true);

    const requiredSkipDataset = copyDataset();
    const requiredActivity = requireRecord(
      requiredSkipDataset.methodologyActivities.find(
        (item) =>
          item.templateId === 'preliminary-site-walk-2026-1' &&
          item.requirement === 'required',
      ),
      'a required preliminary activity',
    );
    const requiredStateIndex =
      requiredSkipDataset.engagementMethodologyActivities.findIndex(
        (item) =>
          item.runId === 'methodology-run-airedale-preliminary-2026-1' &&
          item.templateActivityId === requiredActivity.id,
      );
    if (requiredStateIndex < 0) {
      throw new Error('Expected a required preliminary activity state.');
    }
    const requiredState =
      requiredSkipDataset.engagementMethodologyActivities[requiredStateIndex];
    requiredState.status = 'skipped';
    requiredState.skippedAt = '2026-09-13T10:00:00Z';
    requiredState.skippedByUserId = 'user-sarah-mitchell';
    requiredState.skipReason = 'Attempted invalid required skip.';

    const requiredResult = fabricDatasetSchema.safeParse(requiredSkipDataset);
    expect(requiredResult.success).toBe(false);
    expect(
      hasIssueAtPath(
        requiredResult,
        `engagementMethodologyActivities.${requiredStateIndex}.status`,
      ),
    ).toBe(true);
  });

  it('reopens a completed activity as incomplete while retaining the reason', () => {
    const dataset = copyDataset();
    const run = requireRecord(
      dataset.engagementMethodologyRuns.find(
        (item) => item.id === 'methodology-run-northbank-diagnostic-2026-1',
      ),
      'the Northbank diagnostic run',
    );
    const completedState = requireRecord(
      dataset.engagementMethodologyActivities.find(
        (item) => item.runId === run.id && item.status === 'completed',
      ),
      'a completed diagnostic activity state',
    );
    const reopenedAt = '2026-09-13T10:00:00Z';
    const nextStates = dataset.engagementMethodologyActivities.map(
      (
        item,
      ): (typeof dataset.engagementMethodologyActivities)[number] =>
        item.id === completedState.id
          ? {
              ...item,
              updatedAt: reopenedAt,
              status: 'not-started',
              completedAt: undefined,
              completedByUserId: undefined,
              completionNote: undefined,
              reopenedAt,
              reopenedByUserId: 'user-amy-wilkinson',
              reopenReason: 'Evidence needs further confirmation.',
            }
          : item,
    );
    const nextRun = synchroniseMethodologyRun(
      {
        ...dataset,
        engagementMethodologyActivities: nextStates,
      },
      run,
      nextStates,
      reopenedAt,
    );
    const progress = requireRecord(
      buildMethodologyRunProgress(
        {
          ...dataset,
          engagementMethodologyRuns: dataset.engagementMethodologyRuns.map(
            (item) => (item.id === run.id ? nextRun : item),
          ),
          engagementMethodologyActivities: nextStates,
        },
        run.id,
      ),
      'reopened methodology progress',
    );

    expect(nextRun.status).toBe('active');
    expect(
      progress.stages.flatMap((stage) => stage.activities).find(
        (activity) => activity.state?.id === completedState.id,
      )?.status,
    ).toBe('not-started');
    expect(
      nextStates.find((item) => item.id === completedState.id)?.reopenReason,
    ).toBe('Evidence needs further confirmation.');
  });

  it('keeps a run pinned to its assigned template version and name', () => {
    const dataset = copyDataset();
    const runIndex = dataset.engagementMethodologyRuns.findIndex(
      (item) => item.id === 'methodology-run-northbank-diagnostic-2026-1',
    );
    if (runIndex < 0) {
      throw new Error('Expected the Northbank diagnostic methodology run.');
    }

    dataset.engagementMethodologyRuns[runIndex].templateVersion = '2027.1';

    const result = fabricDatasetSchema.safeParse(dataset);
    expect(result.success).toBe(false);
    expect(
      hasIssueAtPath(
        result,
        `engagementMethodologyRuns.${runIndex}.templateVersion`,
      ),
    ).toBe(true);
  });

  it('separates internal material from approved client-facing context', () => {
    const dataset = copyDataset();
    const engagement = requireRecord(
      dataset.engagements.find(
        (item) => item.id === 'engagement-northbank-diagnostic',
      ),
      'the Northbank engagement',
    );
    const client = requireRecord(
      dataset.clients.find((item) => item.id === engagement.clientId),
      'the Northbank client',
    );
    engagement.internalNotes = 'Restricted internal engagement note.';
    engagement.commercialContext = 'Restricted commercial context.';
    client.notes = 'Restricted internal client note.';

    const internal = requireRecord(
      buildEngagementContext(dataset, engagement.id),
      'internal engagement context',
    );
    const clientFacing = requireRecord(
      buildEngagementContext(dataset, engagement.id, {
        audience: 'approved-client-facing',
      }),
      'approved client-facing engagement context',
    );

    expect(internal.access.canViewInternal).toBe(true);
    expect(internal.internal?.engagement.internalNotes).toBe(
      'Restricted internal engagement note.',
    );
    expect(internal.internal?.client?.notes).toBe(
      'Restricted internal client note.',
    );
    expect(clientFacing.access.canViewInternal).toBe(false);
    expect(clientFacing.internal).toBeUndefined();
    expect(JSON.stringify(clientFacing)).not.toContain(
      'Restricted internal engagement note.',
    );
    expect(JSON.stringify(clientFacing)).not.toContain(
      'Restricted commercial context.',
    );
    expect(JSON.stringify(clientFacing)).not.toContain(
      'Restricted internal client note.',
    );
  });

  it('promotes an eligible preliminary site walk while retaining its connected records', () => {
    const dataset = copyDataset();
    const engagement = requireRecord(
      dataset.engagements.find(
        (item) => item.id === 'engagement-airedale-discovery',
      ),
      'the Airedale preliminary engagement',
    );
    const siteWalk = requireRecord(
      dataset.siteWalks.find(
        (item) => item.id === 'walk-airedale-intake-01',
      ),
      'the Airedale preliminary site walk',
    );
    const preliminaryRun = requireRecord(
      dataset.engagementMethodologyRuns.find(
        (item) => item.id === 'methodology-run-airedale-preliminary-2026-1',
      ),
      'the Airedale preliminary run',
    );
    const diagnosticTemplate = requireRecord(
      dataset.methodologyTemplates.find(
        (item) =>
          item.engagementType === 'Digital Diagnostic' &&
          item.status === 'active',
      ),
      'the Digital Diagnostic template',
    );
    const promoted = preparePreliminarySiteWalkPromotion({
      engagement,
      siteWalk,
      preliminaryRun,
      digitalDiagnosticTemplate: diagnosticTemplate,
      digitalDiagnosticStages: dataset.methodologyStages,
      digitalDiagnosticActivities: dataset.methodologyActivities,
      actorUserId: 'user-amy-wilkinson',
      occurredAt: '2026-09-13T10:00:00Z',
      digitalDiagnosticRunId: 'methodology-run-airedale-diagnostic-2026-1',
      diagnosticId: 'diagnostic-airedale-promoted-2026-1',
    });
    const promotedDataset = {
      ...dataset,
      engagements: dataset.engagements.map((item) =>
        item.id === engagement.id ? promoted.engagement : item,
      ),
      diagnostics: [...dataset.diagnostics, promoted.diagnostic],
      engagementMethodologyRuns: [
        ...dataset.engagementMethodologyRuns.map((item) =>
          item.id === preliminaryRun.id ? promoted.preliminaryRun : item,
        ),
        promoted.digitalDiagnosticRun,
      ],
      engagementMethodologyActivities: [
        ...dataset.engagementMethodologyActivities,
        ...promoted.digitalDiagnosticActivities,
      ],
    };

    expect(promoted.engagement.type).toBe('Digital Diagnostic');
    expect(promoted.preliminaryRun.status).toBe('promoted');
    expect(promoted.preliminaryRun.promotedToRunId).toBe(
      promoted.digitalDiagnosticRun.id,
    );
    expect(promoted.digitalDiagnosticActivities).toHaveLength(
      diagnosticTemplate.activityIds.length,
    );
    expect(promotedDataset.siteWalks).toEqual(dataset.siteWalks);
    expect(promotedDataset.observations).toEqual(dataset.observations);
    expect(promotedDataset.evidence).toEqual(dataset.evidence);
    expect(fabricDatasetSchema.safeParse(promotedDataset).success).toBe(true);
  });
});
