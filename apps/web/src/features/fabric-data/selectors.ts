import type {
  ClientStatus,
  DeliveryStatus,
  EngagementStatus,
  EntityId,
  FabricDataset,
  OpportunityPriority,
  OutputStatus,
  OutputType,
  RoadmapPhase,
  SiteWalkStatus,
  TransformationStage,
  VisibilityScope,
  WorkspacePermission,
} from '@domain';
import { buildEngagementContext, canUserPerform } from '@domain';

export type DisplayTone =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const priorityWeight: Record<OpportunityPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const outputStatusWeight: Record<OutputStatus, number> = {
  draft: 0,
  'internal-review': 1,
  approved: 2,
  published: 3,
  archived: 4,
};

const outputTypeLabels: Record<OutputType, string> = {
  'executive-summary': 'Executive Summary',
  'maturity-scorecard': 'Digital & Operational Maturity Scorecard',
  'landscape-map': 'Digital Landscape Map',
  'opportunity-action-register': 'Opportunity & Action Register',
  'transformation-roadmap': 'Transformation Roadmap',
  'site-walk-summary': 'Site Walk Summary',
  'supporting-analysis': 'Supporting Analysis',
  'progress-report': 'Progress Report',
  'benefits-report': 'Benefits Report',
};

const outputStatusLabels: Record<OutputStatus, string> = {
  draft: 'Draft',
  'internal-review': 'Internal Review',
  approved: 'Approved',
  published: 'Published / Shared',
  archived: 'Archived',
};

const visibilityLabels: Record<VisibilityScope, string> = {
  internal: 'Internal',
  'draft-client-facing': 'Draft client-facing',
  'approved-client-facing': 'Approved client-facing',
  archived: 'Archived',
};

function labelise(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

function createMaps(dataset: FabricDataset) {
  return {
    clients: new Map(dataset.clients.map((client) => [client.id, client])),
    sites: new Map(dataset.sites.map((site) => [site.id, site])),
    areas: new Map(dataset.areas.map((area) => [area.id, area])),
    processes: new Map(
      dataset.processes.map((process) => [process.id, process]),
    ),
    engagements: new Map(
      dataset.engagements.map((engagement) => [engagement.id, engagement]),
    ),
    users: new Map(dataset.users.map((user) => [user.id, user])),
  };
}

function countBy<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}

function uniqueCount(values: string[]): number {
  return new Set(values).size;
}

function clientStatusTone(status: ClientStatus): DisplayTone {
  if (status === 'active') {
    return 'success';
  }

  if (status === 'prospect') {
    return 'warning';
  }

  return 'neutral';
}

function engagementStatusTone(status: EngagementStatus): DisplayTone {
  if (status === 'active') {
    return 'success';
  }

  if (status === 'at-risk') {
    return 'warning';
  }

  return 'neutral';
}

function siteWalkStatusTone(status: SiteWalkStatus): DisplayTone {
  if (status === 'completed') {
    return 'success';
  }

  if (status === 'in-progress') {
    return 'accent';
  }

  return 'warning';
}

function opportunityPriorityTone(priority: OpportunityPriority): DisplayTone {
  if (priority === 'critical' || priority === 'high') {
    return 'warning';
  }

  return 'neutral';
}

function outputStatusTone(status: OutputStatus): DisplayTone {
  if (status === 'approved' || status === 'published') {
    return 'success';
  }

  if (status === 'internal-review') {
    return 'warning';
  }

  return 'neutral';
}

function isOutputReadyToShare(
  status: OutputStatus,
  visibility: VisibilityScope,
): boolean {
  return (
    visibility === 'approved-client-facing' &&
    (status === 'approved' || status === 'published')
  );
}

function deliveryStatusTone(status: DeliveryStatus): DisplayTone {
  if (status === 'complete' || status === 'approved') {
    return 'success';
  }

  if (status === 'blocked') {
    return 'warning';
  }

  return 'accent';
}

function workStatusTone(status: string): DisplayTone {
  if (status === 'complete' || status === 'completed') {
    return 'success';
  }

  if (status === 'blocked') {
    return 'warning';
  }

  if (status === 'in-progress') {
    return 'accent';
  }

  return 'neutral';
}

export function buildWorkspaceSnapshot(
  dataset: FabricDataset,
  currentUserId?: EntityId,
) {
  const maps = createMaps(dataset);
  const currentUser = currentUserId
    ? maps.users.get(currentUserId)
    : undefined;
  const canTakeAction = (
    permission: WorkspacePermission,
    engagementId?: EntityId,
  ) => {
    if (!currentUserId) {
      return true;
    }
    if (!currentUser) {
      return false;
    }

    return canUserPerform(currentUser, permission, {
      engagement: engagementId
        ? maps.engagements.get(engagementId)
        : undefined,
    });
  };
  const activeEngagements = dataset.engagements.filter(
    (engagement) =>
      engagement.status === 'active' || engagement.status === 'at-risk',
  );
  const assignedEngagements = currentUserId
    ? activeEngagements.filter(
        (engagement) =>
          engagement.leadUserId === currentUserId ||
          engagement.teamUserIds.includes(currentUserId),
      )
    : activeEngagements;
  const upcomingSiteWalks = dataset.siteWalks
    .filter(
      (siteWalk) =>
        siteWalk.status !== 'completed' && siteWalk.status !== 'cancelled',
    )
    .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt))
    .map((siteWalk) => ({
      id: siteWalk.id,
      title: siteWalk.title,
      when: formatDateTime(siteWalk.scheduledAt),
      engagementName:
        maps.engagements.get(siteWalk.engagementId)?.name ??
        'Unknown engagement',
      siteName: maps.sites.get(siteWalk.siteId)?.name ?? 'Unknown site',
      ownerName:
        maps.users.get(siteWalk.consultantUserId)?.displayName ??
        'Unknown consultant',
      status: labelise(siteWalk.status),
      engagementId: siteWalk.engagementId,
      path: `/site-walks/${siteWalk.id}`,
    }));

  const priorityOpportunities = dataset.opportunities
    .filter((opportunity) => opportunity.visibility !== 'archived')
    .sort(
      (left, right) =>
        priorityWeight[left.priority] - priorityWeight[right.priority],
    )
    .slice(0, 4)
    .map((opportunity) => ({
      id: opportunity.id,
      title: opportunity.title,
      priority: labelise(opportunity.priority),
      status: labelise(opportunity.status),
      engagementName:
        maps.engagements.get(opportunity.engagementId)?.name ??
        'Unknown engagement',
      engagementId: opportunity.engagementId,
      evidenceCount: opportunity.evidenceIds.length,
      tone: opportunityPriorityTone(opportunity.priority),
      path: `/opportunities/${opportunity.id}`,
    }));

  const outputsAwaitingReview = [...dataset.outputs]
    .filter(
      (output) =>
        output.status === 'draft' || output.status === 'internal-review',
    )
    .sort(
      (left, right) =>
        outputStatusWeight[left.status] - outputStatusWeight[right.status],
    )
    .map((output) => ({
      id: output.id,
      title: output.title,
      outputType: outputTypeLabels[output.outputType],
      status: outputStatusLabels[output.status],
      engagementName:
        maps.engagements.get(output.engagementId)?.name ?? 'Unknown engagement',
      engagementId: output.engagementId,
      visibility: visibilityLabels[output.visibility],
      path: `/outputs/${output.id}`,
    }));

  const observationsNeedingReview = dataset.observations
    .filter((observation) => observation.status === 'needs-review')
    .map((observation) => {
      const siteWalk = dataset.siteWalks.find(
        (item) => item.id === observation.siteWalkId,
      );
      return {
        id: observation.id,
        title: observation.title ?? observation.summary,
        engagementName: siteWalk
          ? (maps.engagements.get(siteWalk.engagementId)?.name ??
            'Unknown engagement')
          : 'Unknown engagement',
        engagementId: siteWalk?.engagementId,
        path: siteWalk ? `/site-walks/${siteWalk.id}` : '/site-walks',
      };
    });

  const incompleteOpportunities = dataset.opportunities
    .filter(
      (opportunity) =>
        opportunity.status !== 'closed' && opportunity.visibility !== 'archived',
    )
    .map((opportunity) => {
      const missing: string[] = [];
      const hasReasoning =
        opportunity.evidenceIds.length > 0 ||
        (opportunity.relatedObservationIds?.length ?? 0) > 0 ||
        (opportunity.relatedFindingIds?.length ?? 0) > 0;

      if (!hasReasoning) {
        missing.push('evidence or reasoning link');
      }
      if (!opportunity.ownerUserId) {
        missing.push('owner');
      }
      if (opportunity.approvalState !== 'approved') {
        missing.push('content approval');
      }
      if (opportunity.reviewStatus !== 'approved') {
        missing.push('review');
      }

      return {
        id: opportunity.id,
        title: opportunity.title,
        engagementName:
          maps.engagements.get(opportunity.engagementId)?.name ??
          'Unknown engagement',
        engagementId: opportunity.engagementId,
        missing,
        priority: labelise(opportunity.priority),
        priorityWeight: priorityWeight[opportunity.priority],
        tone: opportunityPriorityTone(opportunity.priority),
        path: `/opportunities/${opportunity.id}`,
      };
    })
    .filter((opportunity) => opportunity.missing.length > 0)
    .sort(
      (left, right) => left.priorityWeight - right.priorityWeight,
    );

  const outputsAwaitingApproval = outputsAwaitingReview.filter(
    (output) => output.status === 'Internal Review',
  );

  const engagementNeedsAttention = (engagementId: EntityId) => {
    const reasons: string[] = [];
    const engagement = maps.engagements.get(engagementId);
    if (engagement?.status === 'at-risk') {
      reasons.push('status is at risk');
    }
    if (
      dataset.siteWalks.some(
        (siteWalk) =>
          siteWalk.engagementId === engagementId &&
          siteWalk.status !== 'completed' &&
          siteWalk.status !== 'cancelled',
      )
    ) {
      reasons.push('fieldwork remains open');
    }
    if (
      observationsNeedingReview.some(
        (observation) => observation.engagementId === engagementId,
      )
    ) {
      reasons.push('observations need review');
    }
    if (
      incompleteOpportunities.some(
        (opportunity) =>
          dataset.opportunities.find((item) => item.id === opportunity.id)
            ?.engagementId === engagementId,
      )
    ) {
      reasons.push('opportunity content is incomplete');
    }
    if (
      outputsAwaitingApproval.some(
        (output) =>
          dataset.outputs.find((item) => item.id === output.id)?.engagementId ===
          engagementId,
      )
    ) {
      reasons.push('outputs await approval');
    }
    return reasons;
  };

  const engagementsNeedingAttention = assignedEngagements
    .map((engagement) => ({
      id: engagement.id,
      name: engagement.name,
      clientName:
        maps.clients.get(engagement.clientId)?.name ?? 'Unknown client',
      reasons: engagementNeedsAttention(engagement.id),
      path: `/engagements/${engagement.id}`,
    }))
    .filter((engagement) => engagement.reasons.length > 0);

  const nextActionCandidates: Array<{
    title: string;
    detail: string;
    path: string;
  }> = [];
  const reviewableObservation = observationsNeedingReview.find((observation) =>
    canTakeAction('fieldwork:write', observation.engagementId),
  );
  const approvableOutput = outputsAwaitingApproval.find((output) =>
    canTakeAction('output:approve', output.engagementId),
  );
  const editableOpportunity = incompleteOpportunities.find((opportunity) =>
    canTakeAction('opportunity:write', opportunity.engagementId),
  );
  const preparableSiteWalk = upcomingSiteWalks.find((siteWalk) =>
    canTakeAction('fieldwork:write', siteWalk.engagementId),
  );

  if (reviewableObservation) {
    nextActionCandidates.push({
      title: `Review ${reviewableObservation.title}`,
      detail: `${reviewableObservation.engagementName} has an observation awaiting verification.`,
      path: reviewableObservation.path,
    });
  }
  if (approvableOutput) {
    nextActionCandidates.push({
      title: `Approve ${approvableOutput.title}`,
      detail: `${approvableOutput.engagementName} has a controlled output in internal review.`,
      path: approvableOutput.path,
    });
  }
  if (editableOpportunity) {
    nextActionCandidates.push({
      title: `Complete ${editableOpportunity.title}`,
      detail: `Add ${editableOpportunity.missing.join(', ')} before the opportunity can progress.`,
      path: editableOpportunity.path,
    });
  }
  if (preparableSiteWalk) {
    nextActionCandidates.push({
      title: `Prepare ${preparableSiteWalk.title}`,
      detail: `${preparableSiteWalk.engagementName} is scheduled for ${preparableSiteWalk.when}.`,
      path: preparableSiteWalk.path,
    });
  }

  const nextAction = nextActionCandidates[0] ?? {
    title: currentUserId
      ? 'No queued action for your current role'
      : 'No outstanding action',
    detail: currentUserId
      ? 'The shared work queues remain visible, but none of their current actions match your role permissions.'
      : 'There are no open review, approval, opportunity, or fieldwork actions in the current workspace.',
    path: '/engagements',
  };

  return {
    metrics: [
      {
        label: 'Active engagements',
        value: String(activeEngagements.length),
        detail: `${uniqueCount(activeEngagements.map((engagement) => engagement.clientId))} client organisations currently in motion.`,
        tone: 'accent' as DisplayTone,
      },
      {
        label: 'Site coverage',
        value: String(
          uniqueCount(
            activeEngagements.flatMap((engagement) => engagement.siteIds),
          ),
        ),
        detail: 'Sites represented by the current development engagement set.',
        tone: 'success' as DisplayTone,
      },
      {
        label: 'Evidence items',
        value: String(dataset.evidence.length),
        detail: `${countBy(dataset.evidence, (item) => item.visibility === 'internal')} items retained as internal working evidence.`,
        tone: 'neutral' as DisplayTone,
      },
      {
        label: 'Outputs awaiting review',
        value: String(outputsAwaitingReview.length),
        detail:
          'Draft or internal-review outputs that are not yet approved for sharing.',
        tone: 'warning' as DisplayTone,
      },
    ],
    activeEngagements: activeEngagements.map((engagement) => ({
      id: engagement.id,
      name: engagement.name,
      clientName:
        maps.clients.get(engagement.clientId)?.name ?? 'Unknown client',
      stage: labelise(engagement.stage),
      status: labelise(engagement.status),
      targetDate: engagement.targetDate
        ? formatDate(engagement.targetDate)
        : 'TBC',
      teamSize: engagement.teamUserIds.length,
      path: `/engagements/${engagement.id}`,
    })),
    myEngagements: assignedEngagements.map((engagement) => ({
      id: engagement.id,
      name: engagement.name,
      clientName:
        maps.clients.get(engagement.clientId)?.name ?? 'Unknown client',
      stage: labelise(engagement.stage),
      status: labelise(engagement.status),
      targetDate: engagement.targetDate
        ? formatDate(engagement.targetDate)
        : 'TBC',
      path: `/engagements/${engagement.id}`,
    })),
    upcomingSiteWalks,
    priorityOpportunities,
    outputsAwaitingReview,
    outputsAwaitingApproval,
    observationsNeedingReview,
    incompleteOpportunities,
    engagementsNeedingAttention,
    nextAction,
    reviewCount:
      observationsNeedingReview.length + outputsAwaitingApproval.length,
  };
}

export function buildClientsViewModel(dataset: FabricDataset) {
  return dataset.clients
    .map((client) => {
      const sites = dataset.sites.filter((site) => site.clientId === client.id);
      const engagements = dataset.engagements.filter(
        (engagement) => engagement.clientId === client.id,
      );

      return {
        id: client.id,
        name: client.name,
        industry: client.industry,
        primaryContact: client.primaryContact ?? 'Pending confirmation',
        status: labelise(client.status),
        statusTone: clientStatusTone(client.status),
        siteCount: sites.length,
        engagementCount: engagements.length,
        notes: client.notes ?? 'No internal notes yet.',
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function buildEngagementsViewModel(dataset: FabricDataset) {
  const maps = createMaps(dataset);
  const rows = dataset.engagements.map((engagement) => ({
    id: engagement.id,
    name: engagement.name,
    clientName: maps.clients.get(engagement.clientId)?.name ?? 'Unknown client',
    stage: labelise(engagement.stage),
    status: labelise(engagement.status),
    statusTone: engagementStatusTone(engagement.status),
    leadName:
      maps.users.get(engagement.leadUserId)?.displayName ?? 'Unknown lead',
    teamSize: engagement.teamUserIds.length,
    siteCount: engagement.siteIds.length,
    targetDate: engagement.targetDate
      ? formatDate(engagement.targetDate)
      : 'TBC',
    type: engagement.type,
  }));

  const stageSummary = (
    [
      'discover',
      'diagnose',
      'design',
      'deliver',
      'measure',
    ] as TransformationStage[]
  ).map((stage) => ({
    stage: labelise(stage),
    count: rows.filter((row) => row.stage === labelise(stage)).length,
  }));

  return { rows, stageSummary };
}

export function buildSiteWalksViewModel(dataset: FabricDataset) {
  const maps = createMaps(dataset);

  const rows = [...dataset.siteWalks]
    .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt))
    .map((siteWalk) => ({
      id: siteWalk.id,
      title: siteWalk.title,
      scheduledAt: formatDateTime(siteWalk.scheduledAt),
      engagementName:
        maps.engagements.get(siteWalk.engagementId)?.name ??
        'Unknown engagement',
      siteName: maps.sites.get(siteWalk.siteId)?.name ?? 'Unknown site',
      areaName: siteWalk.areaId
        ? (maps.areas.get(siteWalk.areaId)?.name ?? 'Unknown area')
        : 'Cross-area',
      consultantName:
        maps.users.get(siteWalk.consultantUserId)?.displayName ??
        'Unknown consultant',
      status: labelise(siteWalk.status),
      statusTone: siteWalkStatusTone(siteWalk.status),
      scopeCount: siteWalk.plannedScope.length,
      followUpCount: siteWalk.followUpActionIds.length,
    }));

  return {
    rows,
    completedCount: countBy(
      dataset.siteWalks,
      (siteWalk) => siteWalk.status === 'completed',
    ),
    upcomingCount: countBy(
      dataset.siteWalks,
      (siteWalk) => siteWalk.status !== 'completed',
    ),
    observationCount: dataset.observations.length,
  };
}

export function buildOpportunitiesViewModel(dataset: FabricDataset) {
  const maps = createMaps(dataset);
  const activeOpportunities = dataset.opportunities.filter(
    (opportunity) => opportunity.visibility !== 'archived',
  );

  const rows = [...dataset.opportunities]
    .sort(
      (left, right) =>
        Number(left.visibility === 'archived') -
          Number(right.visibility === 'archived') ||
        priorityWeight[left.priority] - priorityWeight[right.priority],
    )
    .map((opportunity) => ({
      id: opportunity.id,
      title: opportunity.title,
      engagementName:
        maps.engagements.get(opportunity.engagementId)?.name ??
        'Unknown engagement',
      processName: opportunity.processId
        ? (maps.processes.get(opportunity.processId)?.name ?? 'Unassigned')
        : 'Unassigned',
      priority: labelise(opportunity.priority),
      priorityTone: opportunityPriorityTone(opportunity.priority),
      status: labelise(opportunity.status),
      approvalState: labelise(opportunity.approvalState),
      visibility: visibilityLabels[opportunity.visibility],
      isArchived: opportunity.visibility === 'archived',
      ownerName: opportunity.ownerUserId
        ? (maps.users.get(opportunity.ownerUserId)?.displayName ??
          'Unknown owner')
        : 'Unassigned',
      evidenceCount: opportunity.evidenceIds.length,
      initiativeCount: dataset.initiatives.filter(
        (initiative) => initiative.opportunityId === opportunity.id,
      ).length,
      actionCount: dataset.actionItems.filter(
        (item) => item.opportunityId === opportunity.id,
      ).length,
      category: opportunity.priorityCategory ?? 'Uncategorised',
      expectedImpact: opportunity.expectedImpact,
      type: labelise(opportunity.type),
    }));

  return {
    rows,
    highPriorityCount: countBy(
      activeOpportunities,
      (opportunity) =>
        opportunity.priority === 'critical' || opportunity.priority === 'high',
    ),
    approvedCount: countBy(
      activeOpportunities,
      (opportunity) => opportunity.status === 'approved',
    ),
    evidenceLinkedCount: countBy(
      activeOpportunities,
      (opportunity) => opportunity.evidenceIds.length > 0,
    ),
  };
}

export function buildOutputsViewModel(dataset: FabricDataset) {
  const maps = createMaps(dataset);

  const rows = [...dataset.outputs]
    .sort(
      (left, right) =>
        outputStatusWeight[left.status] - outputStatusWeight[right.status],
    )
    .map((output) => ({
      id: output.id,
      title: output.title,
      engagementName:
        maps.engagements.get(output.engagementId)?.name ?? 'Unknown engagement',
      outputType: outputTypeLabels[output.outputType],
      status: outputStatusLabels[output.status],
      statusTone: outputStatusTone(output.status),
      visibility: visibilityLabels[output.visibility],
      sourceCount: output.sourceReferences.length,
      publishedAt: output.publishedAt
        ? formatDate(output.publishedAt)
        : 'Not shared',
      isReadyToShare: isOutputReadyToShare(output.status, output.visibility),
    }));

  return {
    rows,
    readyToShareCount: countBy(dataset.outputs, (output) =>
      isOutputReadyToShare(output.status, output.visibility),
    ),
    reviewQueueCount: countBy(
      dataset.outputs,
      (output) =>
        output.status === 'draft' || output.status === 'internal-review',
    ),
    coreOutputCount: new Set(
      dataset.outputs
        .filter((output) =>
          [
            'executive-summary',
            'maturity-scorecard',
            'landscape-map',
            'opportunity-action-register',
            'transformation-roadmap',
          ].includes(output.outputType),
        )
        .map((output) => output.outputType),
    ).size,
  };
}

export function buildRoadmapViewModel(dataset: FabricDataset) {
  const maps = createMaps(dataset);
  const phases: Array<{ phase: RoadmapPhase; window: string }> = [
    { phase: 'Simplify', window: '0–3 months' },
    { phase: 'Connect', window: '3–6 months' },
    { phase: 'Optimise', window: '6–12 months' },
    { phase: 'Scale', window: '12+ months' },
  ];
  const initiativeById = new Map(
    dataset.initiatives.map((initiative) => [initiative.id, initiative]),
  );
  const sequencedInitiativeIds = new Set(
    dataset.roadmaps.flatMap((roadmap) => roadmap.initiativeIds),
  );
  const initiativeRow = (initiative: FabricDataset['initiatives'][number]) => ({
    id: initiative.id,
    title: initiative.title,
    objective: initiative.objective,
    status: labelise(initiative.status),
    statusTone: deliveryStatusTone(initiative.status),
    ownerName:
      maps.users.get(initiative.ownerUserId)?.displayName ?? 'Unknown owner',
  });

  return {
    roadmaps: dataset.roadmaps.map((roadmap) => {
      const roadmapInitiatives = roadmap.initiativeIds.flatMap(
        (initiativeId) => {
          const initiative = initiativeById.get(initiativeId);
          return initiative ? [initiative] : [];
        },
      );

      return {
        id: roadmap.id,
        title: roadmap.title,
        description: roadmap.description,
        status: labelise(roadmap.status),
        statusTone: deliveryStatusTone(roadmap.status),
        reviewStatus: labelise(roadmap.reviewStatus),
        assumptions: roadmap.assumptions ?? 'None recorded',
        dependencies: roadmap.dependencies ?? 'None recorded',
        sequencingRationale: roadmap.sequencingRationale,
        phases: phases
          .filter(({ phase }) => roadmap.phases.includes(phase))
          .map(({ phase, window }) => ({
            phase,
            window,
            initiatives: roadmapInitiatives
              .filter((initiative) => initiative.phase === phase)
              .map(initiativeRow),
          })),
      };
    }),
    unsequencedInitiatives: dataset.initiatives
      .filter((initiative) => !sequencedInitiativeIds.has(initiative.id))
      .map(initiativeRow),
    initiativeCount: dataset.initiatives.length,
    milestoneCount: dataset.milestones.length,
    benefitMeasurementCount: dataset.benefitMeasurements.length,
    activeInitiativeCount: countBy(
      dataset.initiatives,
      (initiative) =>
        initiative.status === 'in-progress' || initiative.status === 'planned',
    ),
  };
}

export interface WorkspaceBreadcrumb {
  label: string;
  path?: string;
}

export interface GlobalSearchResult {
  id: EntityId;
  label: string;
  context: string;
  path: string;
  type: string;
}

function getEvidenceEngagementId(
  dataset: FabricDataset,
  evidenceItem: FabricDataset['evidence'][number],
) {
  if (evidenceItem.siteWalkId) {
    return dataset.siteWalks.find((item) => item.id === evidenceItem.siteWalkId)
      ?.engagementId;
  }

  if (evidenceItem.observationId) {
    const siteWalkId = dataset.observations.find(
      (item) => item.id === evidenceItem.observationId,
    )?.siteWalkId;
    return siteWalkId
      ? dataset.siteWalks.find((item) => item.id === siteWalkId)?.engagementId
      : undefined;
  }

  if (evidenceItem.relatedEntityType === 'engagement') {
    return evidenceItem.relatedEntityId;
  }

  if (evidenceItem.relatedEntityType === 'site-walk') {
    return dataset.siteWalks.find(
      (item) => item.id === evidenceItem.relatedEntityId,
    )?.engagementId;
  }

  if (evidenceItem.relatedEntityType === 'observation') {
    const siteWalkId = dataset.observations.find(
      (item) => item.id === evidenceItem.relatedEntityId,
    )?.siteWalkId;
    return siteWalkId
      ? dataset.siteWalks.find((item) => item.id === siteWalkId)?.engagementId
      : undefined;
  }

  if (evidenceItem.relatedEntityType === 'opportunity') {
    return dataset.opportunities.find(
      (item) => item.id === evidenceItem.relatedEntityId,
    )?.engagementId;
  }

  return dataset.outputs.find((item) => item.id === evidenceItem.relatedEntityId)
    ?.engagementId;
}

function engagementBreadcrumbs(
  dataset: FabricDataset,
  engagementId: EntityId,
): WorkspaceBreadcrumb[] {
  const engagement = dataset.engagements.find(
    (item) => item.id === engagementId,
  );
  if (!engagement) {
    return [];
  }

  const client = dataset.clients.find(
    (item) => item.id === engagement.clientId,
  );
  const primarySite = engagement.siteIds
    .map((siteId) => dataset.sites.find((site) => site.id === siteId))
    .find(Boolean);
  const breadcrumbs: WorkspaceBreadcrumb[] = [];

  if (client) {
    breadcrumbs.push({ label: client.name, path: `/clients/${client.id}` });
  }
  if (primarySite) {
    breadcrumbs.push({
      label: primarySite.name,
      path: `/sites/${primarySite.id}`,
    });
  }
  breadcrumbs.push({
    label: engagement.name,
    path: `/engagements/${engagement.id}`,
  });

  return breadcrumbs;
}

export function buildEngagementCommandCentre(
  dataset: FabricDataset,
  engagementId: EntityId,
) {
  const engagement = dataset.engagements.find(
    (item) => item.id === engagementId,
  );
  if (!engagement) {
    return undefined;
  }

  const engagementContext = buildEngagementContext(dataset, engagement.id);
  const methodology = engagementContext?.internal?.methodology;
  const activeMethodologyProgress = methodology?.runs.find(
    (run) => run.id === methodology.activeRunId,
  )?.progress;
  const maps = createMaps(dataset);
  const client = maps.clients.get(engagement.clientId);
  const sites = engagement.siteIds.flatMap((siteId) => {
    const site = maps.sites.get(siteId);
    return site ? [site] : [];
  });
  const team = engagement.teamUserIds.flatMap((userId) => {
    const user = maps.users.get(userId);
    return user
      ? [
          {
            id: user.id,
            name: user.displayName,
            role: labelise(user.role),
            isLead: user.id === engagement.leadUserId,
          },
        ]
      : [];
  });
  const siteWalks = dataset.siteWalks
    .filter((siteWalk) => siteWalk.engagementId === engagement.id)
    .sort((left, right) => right.scheduledAt.localeCompare(left.scheduledAt))
    .map((siteWalk) => ({
      id: siteWalk.id,
      title: siteWalk.title,
      scheduledAt: formatDateTime(siteWalk.scheduledAt),
      status: labelise(siteWalk.status),
      statusTone: siteWalkStatusTone(siteWalk.status),
      path: `/site-walks/${siteWalk.id}`,
    }));
  const diagnostics = dataset.diagnostics.filter(
    (diagnostic) => diagnostic.engagementId === engagement.id,
  );
  const diagnosticIds = new Set(diagnostics.map((diagnostic) => diagnostic.id));
  const assessments = dataset.maturityAssessments.filter((assessment) =>
    diagnosticIds.has(assessment.diagnosticId),
  );
  const findings = dataset.findings
    .filter((finding) => diagnosticIds.has(finding.diagnosticId))
    .map((finding) => ({
      id: finding.id,
      title: finding.title,
      reviewStatus: labelise(finding.reviewStatus),
      significance: labelise(finding.significance),
      tone: opportunityPriorityTone(finding.significance),
    }));
  const evidence = dataset.evidence.filter(
    (evidenceItem) =>
      getEvidenceEngagementId(dataset, evidenceItem) === engagement.id,
  );
  const opportunities = dataset.opportunities.filter(
    (opportunity) =>
      opportunity.engagementId === engagement.id &&
      opportunity.visibility !== 'archived',
  );
  const initiatives = dataset.initiatives.filter(
    (initiative) => initiative.engagementId === engagement.id,
  );
  const outputs = dataset.outputs.filter(
    (output) => output.engagementId === engagement.id,
  );
  const coveredAreaIds = new Set<EntityId>();
  const coveredProcessIds = new Set<EntityId>();

  dataset.siteWalks
    .filter((siteWalk) => siteWalk.engagementId === engagement.id)
    .forEach((siteWalk) => {
      if (siteWalk.areaId) {
        coveredAreaIds.add(siteWalk.areaId);
      }
      siteWalk.areasCovered?.forEach((areaId) => coveredAreaIds.add(areaId));
      if (siteWalk.processId) {
        coveredProcessIds.add(siteWalk.processId);
      }
      siteWalk.processesCovered?.forEach((processId) =>
        coveredProcessIds.add(processId),
      );
    });

  const areasCovered = [...coveredAreaIds].flatMap((areaId) => {
    const area = maps.areas.get(areaId);
    return area ? [area.name] : [];
  });
  const processesCovered = [...coveredProcessIds].flatMap((processId) => {
    const process = maps.processes.get(processId);
    return process ? [process.name] : [];
  });

  const outstandingActions = [
    ...dataset.actionItems.flatMap((action) => {
      const linkedOpportunity = action.opportunityId
        ? dataset.opportunities.find(
            (opportunity) => opportunity.id === action.opportunityId,
          )
        : undefined;
      const opportunityEngagementId = linkedOpportunity?.engagementId;
      const initiativeEngagementId = action.initiativeId
        ? dataset.initiatives.find(
            (initiative) => initiative.id === action.initiativeId,
          )?.engagementId
        : undefined;
      if (
        (opportunityEngagementId !== engagement.id &&
          initiativeEngagementId !== engagement.id) ||
        linkedOpportunity?.visibility === 'archived' ||
        action.status === 'completed'
      ) {
        return [];
      }
      return [
        {
          id: action.id,
          title: action.title,
          owner: action.ownerUserId
            ? (maps.users.get(action.ownerUserId)?.displayName ??
              'Unassigned')
            : 'Unassigned',
          status: labelise(action.status),
          statusTone: workStatusTone(action.status),
          dueDate: action.dueDate ? formatDate(action.dueDate) : 'No due date',
          sortDate: action.dueDate ?? '9999-12-31T23:59:59Z',
          path: action.opportunityId
            ? `/opportunities/${action.opportunityId}`
            : action.initiativeId
              ? `/roadmap/${action.initiativeId}`
              : '/roadmap',
        },
      ];
    }),
    ...dataset.deliveryActions.flatMap((action) => {
      const initiative = dataset.initiatives.find(
        (item) => item.id === action.initiativeId,
      );
      if (!initiative || initiative.engagementId !== engagement.id || action.status === 'completed') {
        return [];
      }
      return [
        {
          id: action.id,
          title: action.title,
          owner: action.owner,
          status: labelise(action.status),
          statusTone: workStatusTone(action.status),
          dueDate: action.dueDate ? formatDate(action.dueDate) : 'No due date',
          sortDate: action.dueDate ?? '9999-12-31T23:59:59Z',
          path: `/roadmap/${initiative.id}`,
        },
      ];
    }),
    ...dataset.milestones.flatMap((milestone) => {
      const initiative = dataset.initiatives.find(
        (item) => item.id === milestone.initiativeId,
      );
      if (
        !initiative ||
        initiative.engagementId !== engagement.id ||
        milestone.status === 'complete'
      ) {
        return [];
      }
      return [
        {
          id: milestone.id,
          title: milestone.title,
          owner: milestone.owner,
          status: labelise(milestone.status),
          statusTone: workStatusTone(milestone.status),
          dueDate: formatDate(milestone.dueDate),
          sortDate: milestone.dueDate,
          path: `/roadmap/${initiative.id}`,
        },
      ];
    }),
  ]
    .sort((left, right) => left.sortDate.localeCompare(right.sortDate));

  const progress = [
    {
      label: 'Site walks completed',
      complete: siteWalks.filter((siteWalk) => siteWalk.status === 'Completed')
        .length,
      total: siteWalks.length,
      detail: 'Completed fieldwork records.',
    },
    {
      label: 'Maturity assessments scored',
      complete: assessments.filter(
        (assessment) =>
          assessment.score !== undefined && Boolean(assessment.rationale),
      ).length,
      total: diagnostics.length * dataset.diagnosticDimensions.length,
      detail: 'Scored dimensions with recorded rationale.',
    },
    {
      label: 'Findings reviewed',
      complete: findings.filter(
        (finding) =>
          finding.reviewStatus === 'Reviewed' ||
          finding.reviewStatus === 'Approved',
      ).length,
      total: findings.length,
      detail: 'Findings with an explicit review state.',
    },
    {
      label: 'Opportunities approved',
      complete: opportunities.filter(
        (opportunity) =>
          opportunity.approvalState === 'approved' &&
          opportunity.reviewStatus === 'approved',
      ).length,
      total: opportunities.length,
      detail: 'Evidence-led opportunities cleared for progression.',
    },
    {
      label: 'Outputs approved',
      complete: outputs.filter(
        (output) =>
          output.status === 'approved' || output.status === 'published',
      ).length,
      total: outputs.length,
      detail: 'Controlled outputs with explicit approval.',
    },
    {
      label: 'Methodology stages meaningfully complete',
      complete: activeMethodologyProgress?.meaningfulStageCount ?? 0,
      total: activeMethodologyProgress?.totalStageCount ?? 0,
      detail:
        'Checklist activity is tested against connected supporting records.',
    },
  ];
  const progressTotal = progress.reduce((total, item) => total + item.total, 0);
  const progressComplete = progress.reduce(
    (total, item) => total + item.complete,
    0,
  );

  return {
    engagement: {
      id: engagement.id,
      name: engagement.name,
      description: engagement.description,
      type: engagement.type,
      status: labelise(engagement.status),
      statusTone: engagementStatusTone(engagement.status),
      stage: labelise(engagement.stage),
      purpose: engagement.objectives ?? 'Purpose not recorded',
      scope: engagement.scope ?? 'Scope not recorded',
      targetDate: engagement.targetDate
        ? formatDate(engagement.targetDate)
        : 'Target date not recorded',
    },
    client: client
      ? { id: client.id, name: client.name, path: `/clients/${client.id}` }
      : undefined,
    sites: sites.map((site) => ({
      id: site.id,
      name: site.name,
      location: site.location,
      path: `/sites/${site.id}`,
    })),
    lead: maps.users.get(engagement.leadUserId)?.displayName ?? 'Unknown lead',
    team,
    progress: progress.map((item) => ({
      ...item,
      percentage:
        item.total > 0 ? Math.round((item.complete / item.total) * 100) : 0,
    })),
    progressComplete,
    progressTotal,
    siteWalks,
    methodology,
    coverage: {
      areas: areasCovered,
      processes: processesCovered,
    },
    evidence: {
      total: evidence.length,
      internal: countBy(
        evidence,
        (evidenceItem) => evidenceItem.visibility === 'internal',
      ),
      draftClientFacing: countBy(
        evidence,
        (evidenceItem) =>
          evidenceItem.visibility === 'draft-client-facing',
      ),
      approvedClientFacing: countBy(
        evidence,
        (evidenceItem) =>
          evidenceItem.visibility === 'approved-client-facing',
      ),
    },
    diagnostics: diagnostics.map((diagnostic) => ({
      id: diagnostic.id,
      title: diagnostic.title,
      status: labelise(diagnostic.status),
      statusTone: workStatusTone(diagnostic.status),
      assessedDimensions: assessments.filter(
        (assessment) => assessment.diagnosticId === diagnostic.id,
      ).length,
      possibleDimensions: dataset.diagnosticDimensions.length,
    })),
    findings,
    priorityOpportunities: [...opportunities]
      .sort(
        (left, right) =>
          priorityWeight[left.priority] - priorityWeight[right.priority],
      )
      .map((opportunity) => ({
        id: opportunity.id,
        title: opportunity.title,
        priority: labelise(opportunity.priority),
        tone: opportunityPriorityTone(opportunity.priority),
        status: labelise(opportunity.status),
        evidenceCount: opportunity.evidenceIds.length,
        path: `/opportunities/${opportunity.id}`,
      })),
    initiatives: initiatives.map((initiative) => ({
      id: initiative.id,
      title: initiative.title,
      phase: initiative.phase,
      status: labelise(initiative.status),
      statusTone: deliveryStatusTone(initiative.status),
      path: `/roadmap/${initiative.id}`,
    })),
    outputs: outputs.map((output) => ({
      id: output.id,
      title: output.title,
      status: outputStatusLabels[output.status],
      statusTone: outputStatusTone(output.status),
      visibility: visibilityLabels[output.visibility],
      path: `/outputs/${output.id}`,
    })),
    outstandingActions,
    recentActivity: [...dataset.activityEvents]
      .filter((activity) => activity.engagementId === engagement.id)
      .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
      .slice(0, 8)
      .map((activity) => ({
        id: activity.id,
        summary: activity.summary,
        action: labelise(activity.action),
        actor: maps.users.get(activity.actorUserId)?.displayName ?? 'Unknown user',
        when: formatDateTime(activity.occurredAt),
        entityType: labelise(activity.entityType),
      })),
  };
}

export function buildGlobalSearchResults(
  dataset: FabricDataset,
  query: string,
): GlobalSearchResult[] {
  const normalisedQuery = query.trim().toLocaleLowerCase();
  if (!normalisedQuery) {
    return [];
  }

  const engagementName = (engagementId: EntityId) =>
    dataset.engagements.find((item) => item.id === engagementId)?.name ??
    'Unknown engagement';
  const searchEntries: GlobalSearchResult[] = [
    ...dataset.clients.map((client) => ({
      id: client.id,
      label: client.name,
      context: client.industry,
      path: `/clients/${client.id}`,
      type: 'Client',
    })),
    ...dataset.sites.map((site) => ({
      id: site.id,
      label: site.name,
      context:
        dataset.clients.find((client) => client.id === site.clientId)?.name ??
        site.location,
      path: `/sites/${site.id}`,
      type: 'Site',
    })),
    ...dataset.engagements.map((engagement) => ({
      id: engagement.id,
      label: engagement.name,
      context:
        dataset.clients.find((client) => client.id === engagement.clientId)
          ?.name ?? 'Unknown client',
      path: `/engagements/${engagement.id}`,
      type: 'Engagement',
    })),
    ...dataset.siteWalks.map((siteWalk) => ({
      id: siteWalk.id,
      label: siteWalk.title,
      context: engagementName(siteWalk.engagementId),
      path: `/site-walks/${siteWalk.id}`,
      type: 'Site walk',
    })),
    ...dataset.opportunities.map((opportunity) => ({
      id: opportunity.id,
      label: opportunity.title,
      context: engagementName(opportunity.engagementId),
      path: `/opportunities/${opportunity.id}`,
      type: 'Opportunity',
    })),
    ...dataset.initiatives.map((initiative) => ({
      id: initiative.id,
      label: initiative.title,
      context: engagementName(initiative.engagementId),
      path: `/roadmap/${initiative.id}`,
      type: 'Roadmap initiative',
    })),
    ...dataset.outputs.map((output) => ({
      id: output.id,
      label: output.title,
      context: engagementName(output.engagementId),
      path: `/outputs/${output.id}`,
      type: 'Output',
    })),
  ];

  return searchEntries
    .filter((entry) =>
      `${entry.label} ${entry.context} ${entry.type}`
        .toLocaleLowerCase()
        .includes(normalisedQuery),
    )
    .slice(0, 8);
}

export function buildBreadcrumbs(
  dataset: FabricDataset,
  pathname: string,
  currentArea: string,
): WorkspaceBreadcrumb[] {
  const root: WorkspaceBreadcrumb[] = [
    { label: 'Fabric', path: '/workspace' },
  ];
  const [area, recordId] = pathname.split('/').filter(Boolean);

  if (area === 'workspace') {
    return root;
  }

  if (area === 'clients' && recordId) {
    const client = dataset.clients.find((item) => item.id === recordId);
    return client ? [...root, { label: client.name }] : root;
  }

  if (area === 'sites' && recordId) {
    const site = dataset.sites.find((item) => item.id === recordId);
    const client = site
      ? dataset.clients.find((item) => item.id === site.clientId)
      : undefined;
    return [
      ...root,
      ...(client
        ? [{ label: client.name, path: `/clients/${client.id}` }]
        : []),
      ...(site ? [{ label: site.name }] : []),
    ];
  }

  if (area === 'engagements' && recordId) {
    return [...root, ...engagementBreadcrumbs(dataset, recordId), { label: 'Overview' }];
  }

  if (area === 'site-walks' && recordId) {
    const siteWalk = dataset.siteWalks.find((item) => item.id === recordId);
    return siteWalk
      ? [
          ...root,
          ...engagementBreadcrumbs(dataset, siteWalk.engagementId),
          { label: 'Site walk' },
        ]
      : root;
  }

  if (area === 'opportunities' && recordId) {
    const opportunity = dataset.opportunities.find(
      (item) => item.id === recordId,
    );
    return opportunity
      ? [
          ...root,
          ...engagementBreadcrumbs(dataset, opportunity.engagementId),
          { label: 'Opportunity' },
        ]
      : root;
  }

  if (area === 'roadmap' && recordId) {
    const initiative = dataset.initiatives.find((item) => item.id === recordId);
    return initiative
      ? [
          ...root,
          ...engagementBreadcrumbs(dataset, initiative.engagementId),
          { label: 'Roadmap initiative' },
        ]
      : root;
  }

  if (area === 'outputs' && recordId) {
    const output = dataset.outputs.find((item) => item.id === recordId);
    return output
      ? [
          ...root,
          ...engagementBreadcrumbs(dataset, output.engagementId),
          { label: 'Output' },
        ]
      : root;
  }

  return [...root, { label: currentArea }];
}
