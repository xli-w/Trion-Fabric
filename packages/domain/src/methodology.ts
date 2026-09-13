import type {
  Diagnostic,
  Engagement,
  EngagementMethodologyActivity,
  EngagementMethodologyRun,
  EntityId,
  FabricDataset,
  MethodologyActivity,
  MethodologyCompletionRule,
  MethodologyLinkedDomain,
  MethodologyStage,
  MethodologyTemplate,
  SiteWalk,
} from './model';

export interface MethodologyActivityProgress {
  activity: MethodologyActivity;
  state?: EngagementMethodologyActivity;
  status: EngagementMethodologyActivity['status'];
  supportingRecordCount: number;
  isChecklistComplete: boolean;
}

export interface MethodologyCompletionRuleProgress {
  rule: MethodologyCompletionRule;
  actualCount?: number;
  isSatisfied: boolean;
}

export interface MethodologyStageProgress {
  stage: MethodologyStage;
  activities: MethodologyActivityProgress[];
  rules: MethodologyCompletionRuleProgress[];
  requiredActivityCount: number;
  completedRequiredActivityCount: number;
  checklistComplete: boolean;
  meaningfulComplete: boolean;
  weaklySupported: boolean;
  status: 'not-started' | 'in-progress' | 'complete' | 'skipped';
}

export interface MethodologyRunProgress {
  run: EngagementMethodologyRun;
  template: MethodologyTemplate;
  stages: MethodologyStageProgress[];
  completedRequiredActivityCount: number;
  requiredActivityCount: number;
  meaningfulStageCount: number;
  totalStageCount: number;
}

export interface CreatedMethodologyRun {
  run: EngagementMethodologyRun;
  activities: EngagementMethodologyActivity[];
}

export interface PreliminarySiteWalkPromotion {
  engagement: Engagement;
  preliminaryRun: EngagementMethodologyRun;
  digitalDiagnosticRun: EngagementMethodologyRun;
  digitalDiagnosticActivities: EngagementMethodologyActivity[];
  diagnostic: Diagnostic;
}

function getEvidenceEngagementId(
  dataset: FabricDataset,
  evidenceId: EntityId,
): EntityId | undefined {
  const evidence = dataset.evidence.find((item) => item.id === evidenceId);
  if (!evidence) {
    return undefined;
  }

  if (evidence.siteWalkId) {
    return dataset.siteWalks.find((item) => item.id === evidence.siteWalkId)
      ?.engagementId;
  }

  if (evidence.observationId) {
    const siteWalkId = dataset.observations.find(
      (item) => item.id === evidence.observationId,
    )?.siteWalkId;
    return dataset.siteWalks.find((item) => item.id === siteWalkId)
      ?.engagementId;
  }

  if (evidence.relatedEntityType === 'engagement') {
    return evidence.relatedEntityId;
  }

  if (evidence.relatedEntityType === 'site-walk') {
    return dataset.siteWalks.find(
      (item) => item.id === evidence.relatedEntityId,
    )?.engagementId;
  }

  if (evidence.relatedEntityType === 'observation') {
    const siteWalkId = dataset.observations.find(
      (item) => item.id === evidence.relatedEntityId,
    )?.siteWalkId;
    return dataset.siteWalks.find((item) => item.id === siteWalkId)
      ?.engagementId;
  }

  if (evidence.relatedEntityType === 'opportunity') {
    return dataset.opportunities.find(
      (item) => item.id === evidence.relatedEntityId,
    )?.engagementId;
  }

  return dataset.outputs.find((item) => item.id === evidence.relatedEntityId)
    ?.engagementId;
}

export function countMethodologyLinkedRecords(
  dataset: FabricDataset,
  engagementId: EntityId,
  linkedDomain: MethodologyLinkedDomain,
): number {
  const engagement = dataset.engagements.find(
    (item) => item.id === engagementId,
  );
  if (!engagement) {
    return 0;
  }

  const siteIds = new Set(engagement.siteIds);
  const siteWalks = dataset.siteWalks.filter(
    (item) => item.engagementId === engagementId,
  );
  const siteWalkIds = new Set(siteWalks.map((item) => item.id));
  const diagnostics = dataset.diagnostics.filter(
    (item) => item.engagementId === engagementId,
  );
  const diagnosticIds = new Set(diagnostics.map((item) => item.id));
  const opportunities = dataset.opportunities.filter(
    (item) => item.engagementId === engagementId,
  );
  const opportunityIds = new Set(opportunities.map((item) => item.id));
  const initiatives = dataset.initiatives.filter(
    (item) => item.engagementId === engagementId,
  );
  const initiativeIds = new Set(initiatives.map((item) => item.id));

  switch (linkedDomain) {
    case 'engagement':
      return engagement.objectives || engagement.scope ? 1 : 0;
    case 'site':
      return engagement.siteIds.length;
    case 'area':
      return dataset.areas.filter((item) => siteIds.has(item.siteId)).length;
    case 'process':
      return dataset.processes.filter((item) => siteIds.has(item.siteId)).length;
    case 'system':
      return dataset.systems.filter((item) => siteIds.has(item.siteId)).length;
    case 'data-object':
      return dataset.landscapeEntities.filter(
        (item) =>
          item.engagementId === engagementId && item.type === 'data-object',
      ).length;
    case 'role':
      return dataset.landscapeEntities.filter(
        (item) => item.engagementId === engagementId && item.type === 'role',
      ).length;
    case 'site-walk':
      return siteWalks.length;
    case 'observation':
      return dataset.observations.filter((item) => siteWalkIds.has(item.siteWalkId))
        .length;
    case 'evidence':
      return dataset.evidence.filter(
        (item) => getEvidenceEngagementId(dataset, item.id) === engagementId,
      ).length;
    case 'friction-item':
      return dataset.frictionItems.filter((item) => siteWalkIds.has(item.siteWalkId))
        .length;
    case 'diagnostic':
      return diagnostics.length;
    case 'assessment':
      return dataset.maturityAssessments.filter((item) =>
        diagnosticIds.has(item.diagnosticId),
      ).length;
    case 'finding':
      return dataset.findings.filter((item) => diagnosticIds.has(item.diagnosticId))
        .length;
    case 'opportunity':
      return opportunities.length;
    case 'initiative':
      return initiatives.length;
    case 'output':
      return dataset.outputs.filter(
        (item) =>
          item.engagementId === engagementId && item.visibility !== 'archived',
      ).length;
    case 'action':
      return (
        dataset.actionItems.filter(
          (item) =>
            (item.opportunityId && opportunityIds.has(item.opportunityId)) ||
            (item.initiativeId && initiativeIds.has(item.initiativeId)),
        ).length +
        dataset.deliveryActions.filter((item) =>
          initiativeIds.has(item.initiativeId),
        ).length
      );
  }
}

function evaluateCompletionRule(
  dataset: FabricDataset,
  engagementId: EntityId,
  rule: MethodologyCompletionRule,
  activities: MethodologyActivityProgress[],
): MethodologyCompletionRuleProgress {
  if (rule.type === 'all-required-activities') {
    const activitiesRequiredForStage = activities.some(
      (activity) => activity.activity.requirement === 'required',
    )
      ? activities.filter(
          (activity) => activity.activity.requirement === 'required',
        )
      : activities;

    return {
      rule,
      isSatisfied:
        activitiesRequiredForStage.length > 0 &&
        activitiesRequiredForStage.every(
          (activity) => activity.status === 'completed',
        ),
    };
  }

  const actualCount = rule.linkedDomain
    ? countMethodologyLinkedRecords(dataset, engagementId, rule.linkedDomain)
    : 0;
  return {
    rule,
    actualCount,
    isSatisfied: actualCount >= (rule.minimumCount ?? 1),
  };
}

export function buildMethodologyRunProgress(
  dataset: FabricDataset,
  runId: EntityId,
): MethodologyRunProgress | undefined {
  const run = dataset.engagementMethodologyRuns.find((item) => item.id === runId);
  if (!run) {
    return undefined;
  }

  const template = dataset.methodologyTemplates.find(
    (item) => item.id === run.templateId,
  );
  if (!template) {
    return undefined;
  }

  const stages = dataset.methodologyStages
    .filter((stage) => stage.templateId === template.id)
    .sort((left, right) => left.order - right.order);
  const templateActivitiesById = new Map(
    dataset.methodologyActivities
      .filter((activity) => activity.templateId === template.id)
      .map((activity) => [activity.id, activity]),
  );
  const activityStatesByTemplateActivityId = new Map(
    dataset.engagementMethodologyActivities
      .filter((activity) => activity.runId === run.id)
      .map((activity) => [activity.templateActivityId, activity]),
  );

  const stageProgress = stages.map((stage) => {
    const activities = stage.activityIds.flatMap((activityId) => {
      const activity = templateActivitiesById.get(activityId);
      if (!activity) {
        return [];
      }
      const state = activityStatesByTemplateActivityId.get(activity.id);
      const status = state?.status ?? 'not-started';
      return [
        {
          activity,
          state,
          status,
          supportingRecordCount: countMethodologyLinkedRecords(
            dataset,
            run.engagementId,
            activity.linkedDomain,
          ),
          isChecklistComplete: status === 'completed',
        },
      ];
    });
    const requiredActivities = activities.filter(
      (activity) => activity.activity.requirement === 'required',
    );
    const activitiesRequiredForStage =
      requiredActivities.length > 0 ? requiredActivities : activities;
    const completedRequiredActivityCount = requiredActivities.filter(
      (activity) => activity.isChecklistComplete,
    ).length;
    const checklistComplete =
      activitiesRequiredForStage.length > 0 &&
      activitiesRequiredForStage.every(
        (activity) => activity.isChecklistComplete,
      );
    const rules = stage.completionRules.map((rule) =>
      evaluateCompletionRule(dataset, run.engagementId, rule, activities),
    );
    const meaningfulComplete =
      checklistComplete && rules.every((rule) => rule.isSatisfied);
    const hasStartedActivity = activities.some(
      (activity) => activity.status !== 'not-started',
    );
    const allActivitiesSkipped =
      activities.length > 0 &&
      activities.every((activity) => activity.status === 'skipped');

    return {
      stage,
      activities,
      rules,
      requiredActivityCount: requiredActivities.length,
      completedRequiredActivityCount,
      checklistComplete,
      meaningfulComplete,
      weaklySupported: checklistComplete && !meaningfulComplete,
      status: meaningfulComplete
        ? 'complete'
        : allActivitiesSkipped
          ? 'skipped'
        : hasStartedActivity
          ? 'in-progress'
          : 'not-started',
    } satisfies MethodologyStageProgress;
  });

  return {
    run,
    template,
    stages: stageProgress,
    completedRequiredActivityCount: stageProgress.reduce(
      (total, stage) => total + stage.completedRequiredActivityCount,
      0,
    ),
    requiredActivityCount: stageProgress.reduce(
      (total, stage) => total + stage.requiredActivityCount,
      0,
    ),
    meaningfulStageCount: stageProgress.filter(
      (stage) => stage.meaningfulComplete,
    ).length,
    totalStageCount: stageProgress.length,
  };
}

export function createMethodologyRun(
  template: MethodologyTemplate,
  stages: MethodologyStage[],
  activities: MethodologyActivity[],
  input: {
    id: EntityId;
    engagementId: EntityId;
    occurredAt: string;
  },
): CreatedMethodologyRun {
  const templateStages = stages
    .filter((stage) => stage.templateId === template.id)
    .sort((left, right) => left.order - right.order);
  const stageIds = new Set(templateStages.map((stage) => stage.id));
  const templateActivities = activities.filter(
    (activity) =>
      activity.templateId === template.id && stageIds.has(activity.stageId),
  );
  const run: EngagementMethodologyRun = {
    id: input.id,
    createdAt: input.occurredAt,
    updatedAt: input.occurredAt,
    engagementId: input.engagementId,
    templateId: template.id,
    templateVersion: template.version,
    templateName: template.name,
    status: 'active',
    startedAt: input.occurredAt,
    currentStageId: templateStages[0]?.id,
  };

  return {
    run,
    activities: templateActivities.map((activity) => ({
      id: `${input.id}-${activity.id}`,
      createdAt: input.occurredAt,
      updatedAt: input.occurredAt,
      engagementId: input.engagementId,
      runId: input.id,
      templateActivityId: activity.id,
      stageId: activity.stageId,
      status: 'not-started',
    })),
  };
}

export function synchroniseMethodologyRun(
  dataset: FabricDataset,
  run: EngagementMethodologyRun,
  activities: EngagementMethodologyActivity[],
  occurredAt: string,
): EngagementMethodologyRun {
  if (run.status === 'paused' || run.status === 'promoted') {
    return run;
  }

  const progress = buildMethodologyRunProgress(
    {
      ...dataset,
      engagementMethodologyActivities: activities,
    },
    run.id,
  );
  if (!progress) {
    return run;
  }

  const currentStage = progress.stages.find(
    (stage) =>
      stage.activities.some(
        (activity) => activity.activity.requirement === 'required',
      ) && !stage.meaningfulComplete,
  );
  if (!currentStage) {
    return {
      ...run,
      updatedAt: occurredAt,
      status: 'completed',
      currentStageId: undefined,
      completedAt: occurredAt,
      pausedAt: undefined,
      pausedReason: undefined,
    };
  }

  return {
    ...run,
    updatedAt: occurredAt,
    status: 'active',
    currentStageId: currentStage.stage.id,
    completedAt: undefined,
    pausedAt: undefined,
    pausedReason: undefined,
  };
}

export function preparePreliminarySiteWalkPromotion(input: {
  engagement: Engagement;
  siteWalk: SiteWalk;
  preliminaryRun: EngagementMethodologyRun;
  digitalDiagnosticTemplate: MethodologyTemplate;
  digitalDiagnosticStages: MethodologyStage[];
  digitalDiagnosticActivities: MethodologyActivity[];
  actorUserId: EntityId;
  occurredAt: string;
  digitalDiagnosticRunId: EntityId;
  diagnosticId: EntityId;
}): PreliminarySiteWalkPromotion {
  const {
    engagement,
    siteWalk,
    preliminaryRun,
    digitalDiagnosticTemplate,
    digitalDiagnosticStages,
    digitalDiagnosticActivities,
    actorUserId,
    occurredAt,
    digitalDiagnosticRunId,
    diagnosticId,
  } = input;

  if (engagement.type !== 'Preliminary Site Walk') {
    throw new Error('Only a Preliminary Site Walk engagement can be promoted.');
  }
  if (
    siteWalk.engagementId !== engagement.id ||
    siteWalk.walkType !== 'Preliminary Site Walk'
  ) {
    throw new Error(
      'Select a Preliminary Site Walk from the engagement being promoted.',
    );
  }
  if (
    (siteWalk.status !== 'completed' && siteWalk.status !== 'needs-follow-up') ||
    !siteWalk.recommendDiagnostic
  ) {
    throw new Error(
      'Record a completed or follow-up Preliminary Site Walk with a recommended diagnostic before promotion.',
    );
  }
  if (preliminaryRun.engagementId !== engagement.id) {
    throw new Error('Select the active preliminary methodology run.');
  }
  if (
    digitalDiagnosticTemplate.engagementType !== 'Digital Diagnostic' ||
    digitalDiagnosticTemplate.status !== 'active'
  ) {
    throw new Error('Select an active Digital Diagnostic methodology template.');
  }

  const createdRun = createMethodologyRun(
    digitalDiagnosticTemplate,
    digitalDiagnosticStages,
    digitalDiagnosticActivities,
    {
      id: digitalDiagnosticRunId,
      engagementId: engagement.id,
      occurredAt,
    },
  );

  return {
    engagement: {
      ...engagement,
      updatedAt: occurredAt,
      type: 'Digital Diagnostic',
      status: 'active',
      stage: 'diagnose',
    },
    preliminaryRun: {
      ...preliminaryRun,
      updatedAt: occurredAt,
      status: 'promoted',
      currentStageId: undefined,
      pausedAt: undefined,
      pausedReason: undefined,
      promotedToRunId: createdRun.run.id,
    },
    digitalDiagnosticRun: createdRun.run,
    digitalDiagnosticActivities: createdRun.activities,
    diagnostic: {
      id: diagnosticId,
      createdAt: occurredAt,
      updatedAt: occurredAt,
      engagementId: engagement.id,
      title: `${engagement.name} digital diagnostic`,
      description:
        'A Digital Diagnostic promoted from the preliminary site walk and its retained fieldwork evidence.',
      status: 'in-progress',
      startDate: occurredAt,
      assessorUserId: actorUserId,
      currentStage: 'diagnose',
      scope: engagement.scope ?? engagement.description,
      methodologyVersion: digitalDiagnosticTemplate.version,
    },
  };
}
