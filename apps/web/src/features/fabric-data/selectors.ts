import type {
  ClientStatus,
  DeliveryStatus,
  EngagementStatus,
  EntityId,
  FabricDataset,
  LandscapeEntity,
  LandscapeEntityType,
  LandscapeRelationship,
  LandscapeRelationshipType,
  LandscapeVersion,
  LandscapeView,
  OpportunityPriority,
  OutputStatus,
  OutputType,
  RoadmapPhase,
  SiteWalkStatus,
  TransformationStage,
  User,
  VisibilityScope,
  WorkspacePermission,
} from '@domain';
import {
  buildEvidenceTrace,
  buildApprovedLandscapeA3Projection,
  buildEngagementContext,
  buildLandscapeQualityIndicators,
  canUserPerform,
  compareOutputReportSnapshots,
  getOutputSourceCatalog,
  getOutputTemplate,
  getAccessibleEngagementIds,
  getEvidenceEngagementId,
  getSearchRelevance,
  hasOutputReportSourceChanges,
  isOutputReportClientReady,
  isOutputSourceSupportedByTemplate,
  isClientSafeLandscapeEntity,
  isClientSafeLandscapeRelationship,
  landscapeRelationshipDefinitions,
  resolveOutputReport,
  retrieveRelevantFabricKnowledge,
} from '@domain';

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
  const currentUser = currentUserId ? maps.users.get(currentUserId) : undefined;
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
      engagement: engagementId ? maps.engagements.get(engagementId) : undefined,
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
        opportunity.status !== 'closed' &&
        opportunity.visibility !== 'archived',
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
    .sort((left, right) => left.priorityWeight - right.priorityWeight);

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
          dataset.outputs.find((item) => item.id === output.id)
            ?.engagementId === engagementId,
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
      path: `/workspace/${engagement.id}`,
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
    path: '/workspace',
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
      path: `/workspace/${engagement.id}`,
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
      path: `/workspace/${engagement.id}`,
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

export interface CurrentUnderstandingItem {
  id: EntityId;
  title: string;
  detail: string;
  path: string;
}

export interface CurrentUnderstandingViewModel {
  known: CurrentUnderstandingItem[];
  patterns: CurrentUnderstandingItem[];
  uncertainties: CurrentUnderstandingItem[];
  friction: CurrentUnderstandingItem[];
  strengths: CurrentUnderstandingItem[];
  priorityOpportunities: CurrentUnderstandingItem[];
}

/**
 * Builds a grounded view of the engagement's current state. It deliberately
 * separates verified records, interpreted findings, and unresolved work so the
 * workspace never presents a synthesis as established fact.
 */
export function buildCurrentUnderstanding(
  dataset: FabricDataset,
  engagementId: EntityId,
): CurrentUnderstandingViewModel | undefined {
  const context = buildEngagementContext(dataset, engagementId);
  const internal = context?.internal;
  if (!internal) {
    return undefined;
  }

  const siteWalkById = new Map(
    internal.siteWalks.map((siteWalk) => [siteWalk.id, siteWalk]),
  );
  const dimensionById = new Map(
    dataset.diagnosticDimensions.map((dimension) => [dimension.id, dimension]),
  );
  const known: CurrentUnderstandingItem[] = [
    ...internal.observations
      .filter((observation) => observation.status === 'verified')
      .map((observation) => ({
        id: observation.id,
        title: observation.title ?? observation.summary,
        detail: observation.description ?? observation.detail,
        path: `/site-walks/${observation.siteWalkId}#observation-${observation.id}`,
      })),
    ...internal.evidence
      .filter((evidence) => evidence.approvalState === 'approved')
      .map((evidence) => ({
        id: evidence.id,
        title: evidence.title,
        detail: evidence.summary,
        path: `/evidence?evidence=${evidence.id}`,
      })),
  ].slice(0, 4);

  const patterns: CurrentUnderstandingItem[] = internal.findings
    .filter(
      (finding) =>
        finding.reviewStatus === 'reviewed' ||
        finding.reviewStatus === 'approved',
    )
    .map((finding) => ({
      id: finding.id,
      title: finding.title,
      detail: finding.recommendedDirection || finding.whyItMatters,
      path: `/diagnosis?finding=${finding.id}`,
    }))
    .slice(0, 4);

  const assessedDimensionIds = new Set(
    internal.maturityAssessments
      .filter(
        (assessment) =>
          assessment.score !== undefined && Boolean(assessment.rationale),
      )
      .map((assessment) => assessment.dimensionId),
  );
  const uncertainties: CurrentUnderstandingItem[] = [
    ...internal.observations
      .filter((observation) => observation.status !== 'verified')
      .map((observation) => ({
        id: observation.id,
        title: `Review ${observation.title ?? observation.summary}`,
        detail:
          'This observation remains internal working material until verified.',
        path: `/site-walks/${observation.siteWalkId}#observation-${observation.id}`,
      })),
    ...internal.evidence
      .filter((evidence) => evidence.approvalState !== 'approved')
      .map((evidence) => ({
        id: evidence.id,
        title: `Validate ${evidence.title}`,
        detail:
          'This evidence has not been approved as an evidence-backed conclusion.',
        path: `/evidence?evidence=${evidence.id}`,
      })),
    ...dataset.diagnosticDimensions
      .filter((dimension) => !assessedDimensionIds.has(dimension.id))
      .map((dimension) => ({
        id: dimension.id,
        title: `Assess ${dimension.name}`,
        detail:
          'No scored assessment with recorded rationale is available yet.',
        path: '/diagnosis',
      })),
  ].slice(0, 5);

  const friction: CurrentUnderstandingItem[] = internal.frictionItems
    .map((item) => ({
      id: item.id,
      title: item.frictionPoint,
      detail: `${item.stationOrLine}: ${item.category} friction (${item.confidence} confidence).`,
      path: siteWalkById.has(item.siteWalkId)
        ? `/site-walks/${item.siteWalkId}`
        : '/site-walks',
    }))
    .slice(0, 4);

  const strengths: CurrentUnderstandingItem[] = internal.maturityAssessments
    .filter((assessment) => (assessment.score ?? 0) >= 3)
    .sort((left, right) => (right.score ?? 0) - (left.score ?? 0))
    .flatMap((assessment) => {
      const dimension = dimensionById.get(assessment.dimensionId);
      if (!dimension) {
        return [];
      }

      return [
        {
          id: assessment.id,
          title: `${dimension.name}: ${assessment.score?.toFixed(1)} / 5`,
          detail:
            assessment.rationale ??
            'A completed maturity assessment indicates an established capability.',
          path: '/diagnosis',
        },
      ];
    })
    .slice(0, 4);

  const priorityOpportunities: CurrentUnderstandingItem[] =
    internal.opportunities
      .filter((opportunity) => opportunity.visibility !== 'archived')
      .sort(
        (left, right) =>
          priorityWeight[left.priority] - priorityWeight[right.priority],
      )
      .map((opportunity) => ({
        id: opportunity.id,
        title: opportunity.title,
        detail:
          opportunity.recommendedImprovement ??
          opportunity.clientSummary ??
          opportunity.description,
        path: `/opportunities/${opportunity.id}`,
      }))
      .slice(0, 4);

  return {
    known,
    patterns,
    uncertainties,
    friction,
    strengths,
    priorityOpportunities,
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
      includedSourceCount: resolveOutputReport(dataset, output).snapshot
        .includedSources.length,
      excludedSourceCount: resolveOutputReport(dataset, output).snapshot
        .excludedSources.length,
      reportGeneratedAt: output.reportSnapshot?.generatedAt
        ? formatDateTime(output.reportSnapshot.generatedAt)
        : 'Not generated',
      sourceDataChanged: hasOutputReportSourceChanges(dataset, output),
      publishedAt: output.publishedAt
        ? formatDate(output.publishedAt)
        : 'Not shared',
      isReadyToShare: isOutputReportClientReady(dataset, output),
    }));

  return {
    rows,
    readyToShareCount: countBy(dataset.outputs, (output) =>
      isOutputReportClientReady(dataset, output),
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

function compareOutputVersions(left: string, right: string) {
  const parse = (value: string) => {
    const match = /^(\d+)\.(\d+)$/.exec(value);
    return match
      ? { major: Number(match[1]), minor: Number(match[2]) }
      : { major: 0, minor: 0 };
  };
  const leftVersion = parse(left);
  const rightVersion = parse(right);
  return (
    rightVersion.major - leftVersion.major ||
    rightVersion.minor - leftVersion.minor
  );
}

export function buildOutputReportWorkspace(
  dataset: FabricDataset,
  outputId: EntityId,
) {
  const output = dataset.outputs.find((item) => item.id === outputId);
  if (!output) {
    return undefined;
  }

  const maps = createMaps(dataset);
  const report = resolveOutputReport(dataset, output);
  const previousOutput = output.supersedesOutputId
    ? dataset.outputs.find((item) => item.id === output.supersedesOutputId)
    : undefined;
  const comparison =
    previousOutput?.reportSnapshot && report.snapshot
      ? compareOutputReportSnapshots(
          previousOutput.reportSnapshot,
          report.snapshot,
          previousOutput.version,
          output.version,
        )
      : undefined;
  const sourceCatalog = getOutputSourceCatalog(
    dataset,
    output.engagementId,
  ).map((source) => ({
    ...source,
    isSelected: output.sourceReferences.includes(source.id),
    isApplicable: isOutputSourceSupportedByTemplate(
      output.outputType,
      source.type,
    ),
  }));

  return {
    output,
    report,
    template: getOutputTemplate(output.outputType),
    sourceCatalog,
    sourceDataChanged: hasOutputReportSourceChanges(dataset, output),
    openReviewCommentCount: dataset.outputReviewComments.filter(
      (comment) => comment.outputId === output.id && comment.status === 'open',
    ).length,
    reviewComments: dataset.outputReviewComments
      .filter((comment) => comment.outputId === output.id)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((comment) => ({
        ...comment,
        authorName:
          maps.users.get(comment.authorUserId)?.displayName ?? 'Unknown user',
        resolvedByName: comment.resolvedByUserId
          ? (maps.users.get(comment.resolvedByUserId)?.displayName ??
            'Unknown user')
          : undefined,
        createdAtLabel: formatDateTime(comment.createdAt),
        resolvedAtLabel: comment.resolvedAt
          ? formatDateTime(comment.resolvedAt)
          : undefined,
      })),
    exports: dataset.outputExports
      .filter((exportReference) => exportReference.outputId === output.id)
      .sort((left, right) => right.exportedAt.localeCompare(left.exportedAt))
      .map((exportReference) => ({
        ...exportReference,
        exportedByName:
          maps.users.get(exportReference.exportedByUserId)?.displayName ??
          'Unknown user',
        exportedAtLabel: formatDateTime(exportReference.exportedAt),
      })),
    previousOutput,
    comparison,
    versionHistory: dataset.outputs
      .filter(
        (item) =>
          item.engagementId === output.engagementId &&
          item.outputType === output.outputType,
      )
      .sort((left, right) => compareOutputVersions(left.version, right.version))
      .map((item) => ({
        id: item.id,
        title: item.title,
        version: item.version,
        status: outputStatusLabels[item.status],
        isCurrent: item.id === output.id,
        path: `/outputs/${item.id}`,
      })),
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
    path: `/workspace/${engagement.id}`,
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
            ? (maps.users.get(action.ownerUserId)?.displayName ?? 'Unassigned')
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
      if (
        !initiative ||
        initiative.engagementId !== engagement.id ||
        action.status === 'completed'
      ) {
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
  ].sort((left, right) => left.sortDate.localeCompare(right.sortDate));

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
        (evidenceItem) => evidenceItem.visibility === 'draft-client-facing',
      ),
      approvedClientFacing: countBy(
        evidence,
        (evidenceItem) => evidenceItem.visibility === 'approved-client-facing',
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
        actor:
          maps.users.get(activity.actorUserId)?.displayName ?? 'Unknown user',
        when: formatDateTime(activity.occurredAt),
        entityType: labelise(activity.entityType),
      })),
  };
}

export interface LandscapeWorkbenchOptions {
  view?: LandscapeView;
  query?: string;
  entityType?: LandscapeEntityType | 'all';
  relationshipType?: LandscapeRelationshipType | 'all';
}

export interface LandscapeEntityView extends LandscapeEntity {
  [key: string]: unknown;
  siteName: string;
  areaName?: string;
  sourceName?: string;
  ownerLabel?: string;
  connectionCount: number;
  observationCount: number;
  evidenceCount: number;
  frictionCount: number;
  opportunityCount: number;
}

export interface LandscapeRelationshipView extends LandscapeRelationship {
  fromName: string;
  toName: string;
  typeLabel: string;
}

export interface LandscapeWorkbenchViewModel {
  engagement: {
    id: EntityId;
    name: string;
    description: string;
  };
  clientName: string;
  sites: Array<{ id: EntityId; name: string }>;
  activeView: LandscapeView;
  entities: LandscapeEntityView[];
  relationships: LandscapeRelationshipView[];
  versions: LandscapeVersion[];
  currentVersion?: LandscapeVersion;
  qualityIndicators: ReturnType<typeof buildLandscapeQualityIndicators>;
  a3Projection: ReturnType<typeof buildApprovedLandscapeA3Projection>;
  metrics: {
    totalEntities: number;
    totalRelationships: number;
    visibleEntities: number;
    visibleRelationships: number;
    clientSafeItems: number;
    qualityPromptCount: number;
  };
}

const landscapeViewEntityTypes: Record<
  Exclude<LandscapeView, 'opportunities'>,
  readonly LandscapeEntityType[]
> = {
  process: ['area', 'process', 'process-step', 'handoff', 'role'],
  systems: ['system', 'machine', 'process', 'data-object'],
  'data-flow': ['process', 'system', 'machine', 'data-object', 'handoff'],
  people: ['role', 'process', 'area'],
};

export function buildLandscapeWorkbench(
  dataset: FabricDataset,
  engagementId: EntityId,
  options: LandscapeWorkbenchOptions = {},
): LandscapeWorkbenchViewModel | undefined {
  const engagement = dataset.engagements.find(
    (item) => item.id === engagementId,
  );
  if (!engagement) {
    return undefined;
  }

  const activeView = options.view ?? 'process';
  const query = options.query?.trim().toLocaleLowerCase() ?? '';
  const entityType = options.entityType ?? 'all';
  const relationshipType = options.relationshipType ?? 'all';
  const scopedEntities = dataset.landscapeEntities.filter(
    (item) => item.engagementId === engagement.id,
  );
  const scopedEntityIds = new Set(scopedEntities.map((item) => item.id));
  const scopedRelationships = dataset.landscapeRelationships.filter(
    (item) =>
      item.engagementId === engagement.id &&
      scopedEntityIds.has(item.fromEntityId) &&
      scopedEntityIds.has(item.toEntityId),
  );
  const entityById = new Map(
    scopedEntities.map((entity) => [entity.id, entity]),
  );
  const roleById = new Map(
    scopedEntities
      .filter((entity) => entity.type === 'role')
      .map((entity) => [entity.id, entity]),
  );
  const siteById = new Map(dataset.sites.map((site) => [site.id, site]));
  const processById = new Map(
    dataset.processes.map((process) => [process.id, process]),
  );
  const areaById = new Map(dataset.areas.map((area) => [area.id, area]));

  const relationshipMatchesView = (relationship: LandscapeRelationship) => {
    const definition = landscapeRelationshipDefinitions[relationship.type];
    if (activeView === 'opportunities') {
      return (
        relationship.linkedOpportunityIds.length > 0 ||
        relationship.type === 'opportunity-improves' ||
        (entityById.get(relationship.fromEntityId)?.linkedOpportunityIds
          .length ?? 0) > 0 ||
        (entityById.get(relationship.toEntityId)?.linkedOpportunityIds.length ??
          0) > 0
      );
    }

    return definition.views.includes(activeView);
  };

  const relationshipCandidates = scopedRelationships.filter(
    (relationship) =>
      relationshipMatchesView(relationship) &&
      (relationshipType === 'all' || relationship.type === relationshipType),
  );
  const relationshipMatchesQuery = (relationship: LandscapeRelationship) => {
    if (!query) {
      return true;
    }
    const fromName = entityById.get(relationship.fromEntityId)?.name ?? '';
    const toName = entityById.get(relationship.toEntityId)?.name ?? '';
    return `${relationship.rationale ?? ''} ${
      landscapeRelationshipDefinitions[relationship.type].label
    } ${fromName} ${toName}`
      .toLocaleLowerCase()
      .includes(query);
  };
  const relationshipSearchEntityIds = new Set(
    relationshipCandidates
      .filter(relationshipMatchesQuery)
      .flatMap((relationship) => [
        relationship.fromEntityId,
        relationship.toEntityId,
      ]),
  );
  const visibleEntityIds = new Set<EntityId>();
  if (activeView === 'opportunities') {
    const activeOpportunities = dataset.opportunities.filter(
      (opportunity) =>
        opportunity.engagementId === engagement.id &&
        opportunity.visibility !== 'archived',
    );
    const activeOpportunityIds = new Set(
      activeOpportunities.map((opportunity) => opportunity.id),
    );
    scopedEntities.forEach((entity) => {
      if (
        entity.linkedOpportunityIds.some((id) =>
          activeOpportunityIds.has(id),
        ) ||
        activeOpportunities.some(
          (opportunity) =>
            entity.type === 'process' &&
            entity.sourceEntityId === opportunity.processId,
        )
      ) {
        visibleEntityIds.add(entity.id);
      }
    });
  } else {
    scopedEntities
      .filter((entity) =>
        landscapeViewEntityTypes[activeView].includes(entity.type),
      )
      .forEach((entity) => visibleEntityIds.add(entity.id));
  }
  relationshipCandidates.forEach((relationship) => {
    visibleEntityIds.add(relationship.fromEntityId);
    visibleEntityIds.add(relationship.toEntityId);
  });

  const entities = scopedEntities
    .filter((entity) => visibleEntityIds.has(entity.id))
    .filter((entity) => entityType === 'all' || entity.type === entityType)
    .filter(
      (entity) =>
        !query ||
        `${entity.name} ${entity.description} ${entity.ownerRole ?? ''}`
          .toLocaleLowerCase()
          .includes(query) ||
        relationshipSearchEntityIds.has(entity.id),
    )
    .map((entity): LandscapeEntityView => {
      const sourceProcess =
        entity.type === 'process' && entity.sourceEntityId
          ? processById.get(entity.sourceEntityId)
          : undefined;
      const sourceName =
        entity.type === 'area' && entity.sourceEntityId
          ? areaById.get(entity.sourceEntityId)?.name
          : entity.name;
      return {
        ...entity,
        siteName: siteById.get(entity.siteId)?.name ?? 'Unknown site',
        areaName: sourceProcess
          ? areaById.get(sourceProcess.areaId)?.name
          : undefined,
        sourceName,
        ownerLabel:
          roleById.get(entity.ownerEntityId ?? '')?.name ?? entity.ownerRole,
        connectionCount: scopedRelationships.filter(
          (relationship) =>
            relationship.fromEntityId === entity.id ||
            relationship.toEntityId === entity.id,
        ).length,
        observationCount: entity.linkedObservationIds.length,
        evidenceCount: entity.linkedEvidenceIds.length,
        frictionCount: entity.linkedFrictionItemIds.length,
        opportunityCount: entity.linkedOpportunityIds.length,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
  const renderedEntityIds = new Set(entities.map((entity) => entity.id));
  const relationships = relationshipCandidates
    .filter(
      (relationship) =>
        renderedEntityIds.has(relationship.fromEntityId) &&
        renderedEntityIds.has(relationship.toEntityId),
    )
    .filter(relationshipMatchesQuery)
    .map(
      (relationship): LandscapeRelationshipView => ({
        ...relationship,
        fromName:
          entityById.get(relationship.fromEntityId)?.name ??
          relationship.fromEntityId,
        toName:
          entityById.get(relationship.toEntityId)?.name ??
          relationship.toEntityId,
        typeLabel: landscapeRelationshipDefinitions[relationship.type].label,
      }),
    )
    .sort((left, right) => left.typeLabel.localeCompare(right.typeLabel));
  const versions = dataset.landscapeVersions
    .filter((version) => version.engagementId === engagement.id)
    .sort((left, right) => right.capturedAt.localeCompare(left.capturedAt));
  const currentVersion = versions.find(
    (version) => version.status === 'current',
  );
  const qualityIndicators = buildLandscapeQualityIndicators(
    dataset,
    engagement.id,
  );

  return {
    engagement: {
      id: engagement.id,
      name: engagement.name,
      description: engagement.description,
    },
    clientName:
      dataset.clients.find((client) => client.id === engagement.clientId)
        ?.name ?? 'Unknown client',
    sites: dataset.sites
      .filter((site) => engagement.siteIds.includes(site.id))
      .map((site) => ({ id: site.id, name: site.name })),
    activeView,
    entities,
    relationships,
    versions,
    currentVersion,
    qualityIndicators,
    a3Projection: buildApprovedLandscapeA3Projection(dataset, engagement.id),
    metrics: {
      totalEntities: scopedEntities.length,
      totalRelationships: scopedRelationships.length,
      visibleEntities: entities.length,
      visibleRelationships: relationships.length,
      clientSafeItems:
        scopedEntities.filter(isClientSafeLandscapeEntity).length +
        scopedRelationships.filter(isClientSafeLandscapeRelationship).length,
      qualityPromptCount: qualityIndicators.length,
    },
  };
}

export interface EvidenceLibraryFilters {
  query?: string;
  clientId?: EntityId;
  siteId?: EntityId;
  engagementId?: EntityId;
  areaId?: EntityId;
  processId?: EntityId;
  systemId?: EntityId;
  evidenceType?: string;
  source?: string;
  reviewStatus?: string;
  visibility?: VisibilityScope;
  capturedDate?: string;
  recordedByUserId?: EntityId;
}

export interface EvidenceTraceLink {
  id: EntityId;
  type:
    | 'Observation'
    | 'Site walk'
    | 'Finding'
    | 'Opportunity'
    | 'Roadmap initiative'
    | 'Output';
  label: string;
  path: string;
}

export interface EvidenceLibraryRow {
  id: EntityId;
  title: string;
  summary: string;
  description?: string;
  fileReference?: string;
  clientId: EntityId;
  clientName: string;
  siteIds: EntityId[];
  siteNames: string[];
  engagementId: EntityId;
  engagementName: string;
  areaIds: EntityId[];
  areaNames: string[];
  processIds: EntityId[];
  processNames: string[];
  systemIds: EntityId[];
  systemNames: string[];
  evidenceType: string;
  source: string;
  reviewStatus: string;
  visibility: VisibilityScope;
  capturedAt: string;
  capturedDate: string;
  recordedByUserIds: EntityId[];
  recordedByNames: string[];
  links: EvidenceTraceLink[];
  searchText: string;
}

export interface EvidenceLibraryFilterOptions {
  clients: Array<{ value: string; label: string }>;
  sites: Array<{ value: string; label: string }>;
  engagements: Array<{ value: string; label: string }>;
  areas: Array<{ value: string; label: string }>;
  processes: Array<{ value: string; label: string }>;
  systems: Array<{ value: string; label: string }>;
  evidenceTypes: Array<{ value: string; label: string }>;
  sources: Array<{ value: string; label: string }>;
  reviewStatuses: Array<{ value: string; label: string }>;
  visibilities: Array<{ value: string; label: string }>;
  recordedBy: Array<{ value: string; label: string }>;
}

export interface EvidenceLibraryViewModel {
  rows: EvidenceLibraryRow[];
  allAccessibleRows: EvidenceLibraryRow[];
  filterOptions: EvidenceLibraryFilterOptions;
  metrics: {
    total: number;
    visible: number;
    needsReview: number;
    verified: number;
    linkedRecords: number;
  };
}

function filterOptions(
  values: Array<{ value: string; label: string }>,
): Array<{ value: string; label: string }> {
  return [...new Map(values.map((item) => [item.value, item])).values()].sort(
    (left, right) => left.label.localeCompare(right.label),
  );
}

function evidenceLinks(
  dataset: FabricDataset,
  evidenceId: EntityId,
): EvidenceTraceLink[] {
  const evidence = dataset.evidence.find((item) => item.id === evidenceId);
  if (!evidence) {
    return [];
  }

  const trace = buildEvidenceTrace(dataset, evidence);
  const links: EvidenceTraceLink[] = [];
  trace.observationIds.forEach((observationId) => {
    const observation = dataset.observations.find(
      (item) => item.id === observationId,
    );
    if (!observation) {
      return;
    }
    links.push({
      id: observation.id,
      type: 'Observation',
      label: observation.title ?? observation.summary,
      path: `/site-walks/${observation.siteWalkId}#observation-${observation.id}`,
    });
  });
  trace.siteWalkIds.forEach((siteWalkId) => {
    const siteWalk = dataset.siteWalks.find((item) => item.id === siteWalkId);
    if (siteWalk) {
      links.push({
        id: siteWalk.id,
        type: 'Site walk',
        label: siteWalk.title,
        path: `/site-walks/${siteWalk.id}`,
      });
    }
  });
  trace.findingIds.forEach((findingId) => {
    const finding = dataset.findings.find((item) => item.id === findingId);
    if (finding) {
      links.push({
        id: finding.id,
        type: 'Finding',
        label: finding.title,
        path: `/diagnosis?finding=${finding.id}`,
      });
    }
  });
  trace.opportunityIds.forEach((opportunityId) => {
    const opportunity = dataset.opportunities.find(
      (item) => item.id === opportunityId,
    );
    if (opportunity) {
      links.push({
        id: opportunity.id,
        type: 'Opportunity',
        label: opportunity.title,
        path: `/opportunities/${opportunity.id}`,
      });
    }
  });
  trace.initiativeIds.forEach((initiativeId) => {
    const initiative = dataset.initiatives.find(
      (item) => item.id === initiativeId,
    );
    if (initiative) {
      links.push({
        id: initiative.id,
        type: 'Roadmap initiative',
        label: initiative.title,
        path: `/roadmap/${initiative.id}`,
      });
    }
  });
  trace.outputIds.forEach((outputId) => {
    const output = dataset.outputs.find((item) => item.id === outputId);
    if (output) {
      links.push({
        id: output.id,
        type: 'Output',
        label: output.title,
        path: `/outputs/${output.id}`,
      });
    }
  });

  return [
    ...new Map(links.map((link) => [`${link.type}:${link.id}`, link])).values(),
  ];
}

export function buildEvidenceLibrary(
  dataset: FabricDataset,
  actor: Pick<User, 'id' | 'role'>,
  filters: EvidenceLibraryFilters = {},
): EvidenceLibraryViewModel {
  const accessibleEngagementIds = getAccessibleEngagementIds(dataset, actor);
  const clientById = new Map(dataset.clients.map((item) => [item.id, item]));
  const siteById = new Map(dataset.sites.map((item) => [item.id, item]));
  const areaById = new Map(dataset.areas.map((item) => [item.id, item]));
  const processById = new Map(dataset.processes.map((item) => [item.id, item]));
  const systemById = new Map(dataset.systems.map((item) => [item.id, item]));
  const engagementById = new Map(
    dataset.engagements.map((item) => [item.id, item]),
  );
  const userById = new Map(dataset.users.map((item) => [item.id, item]));
  const allAccessibleRows: EvidenceLibraryRow[] = [];

  dataset.evidence.forEach((evidenceItem) => {
    const trace = buildEvidenceTrace(dataset, evidenceItem);
    const engagement = trace.engagementId
      ? engagementById.get(trace.engagementId)
      : undefined;
    if (!engagement || !accessibleEngagementIds.has(engagement.id)) {
      return;
    }
    const client = clientById.get(engagement.clientId);
    const siteNames = trace.siteIds.map(
      (siteId) => siteById.get(siteId)?.name ?? siteId,
    );
    const areaNames = trace.areaIds.map(
      (areaId) => areaById.get(areaId)?.name ?? areaId,
    );
    const processNames = trace.processIds.map(
      (processId) => processById.get(processId)?.name ?? processId,
    );
    const systemNames = trace.systemIds.map(
      (systemId) => systemById.get(systemId)?.name ?? systemId,
    );
    const recordedByNames = trace.recordedByUserIds.map(
      (userId) => userById.get(userId)?.displayName ?? userId,
    );
    const evidenceType =
      evidenceItem.evidenceType ?? labelise(evidenceItem.kind);
    const source = evidenceItem.source ?? labelise(evidenceItem.origin);
    const reviewStatus =
      evidenceItem.reviewStatus ?? labelise(evidenceItem.approvalState);
    const summary = evidenceItem.description ?? evidenceItem.summary;
    const searchText = [
      evidenceItem.title,
      summary,
      engagement.name,
      client?.name ?? '',
      ...siteNames,
      ...areaNames,
      ...processNames,
      ...systemNames,
      evidenceType,
      source,
      reviewStatus,
      evidenceItem.visibility,
      ...recordedByNames,
    ].join(' ');

    allAccessibleRows.push({
      id: evidenceItem.id,
      title: evidenceItem.title,
      summary: evidenceItem.summary,
      description: evidenceItem.description,
      fileReference: evidenceItem.fileReference,
      clientId: engagement.clientId,
      clientName: client?.name ?? 'Unknown client',
      siteIds: trace.siteIds,
      siteNames,
      engagementId: engagement.id,
      engagementName: engagement.name,
      areaIds: trace.areaIds,
      areaNames,
      processIds: trace.processIds,
      processNames,
      systemIds: trace.systemIds,
      systemNames,
      evidenceType,
      source,
      reviewStatus,
      visibility: evidenceItem.visibility,
      capturedAt: evidenceItem.capturedAt,
      capturedDate: evidenceItem.capturedAt.slice(0, 10),
      recordedByUserIds: trace.recordedByUserIds,
      recordedByNames,
      links: evidenceLinks(dataset, evidenceItem.id),
      searchText,
    });
  });

  const rows = allAccessibleRows
    .filter((row) => {
      if (
        filters.query &&
        getSearchRelevance(filters.query, row.searchText) === 0
      ) {
        return false;
      }
      if (filters.clientId && row.clientId !== filters.clientId) {
        return false;
      }
      if (filters.siteId && !row.siteIds.includes(filters.siteId)) {
        return false;
      }
      if (filters.engagementId && row.engagementId !== filters.engagementId) {
        return false;
      }
      if (filters.areaId && !row.areaIds.includes(filters.areaId)) {
        return false;
      }
      if (filters.processId && !row.processIds.includes(filters.processId)) {
        return false;
      }
      if (filters.systemId && !row.systemIds.includes(filters.systemId)) {
        return false;
      }
      if (filters.evidenceType && row.evidenceType !== filters.evidenceType) {
        return false;
      }
      if (filters.source && row.source !== filters.source) {
        return false;
      }
      if (filters.reviewStatus && row.reviewStatus !== filters.reviewStatus) {
        return false;
      }
      if (filters.visibility && row.visibility !== filters.visibility) {
        return false;
      }
      if (filters.capturedDate && row.capturedDate !== filters.capturedDate) {
        return false;
      }
      if (
        filters.recordedByUserId &&
        !row.recordedByUserIds.includes(filters.recordedByUserId)
      ) {
        return false;
      }
      return true;
    })
    .sort((left, right) => right.capturedAt.localeCompare(left.capturedAt));

  return {
    rows,
    allAccessibleRows,
    filterOptions: {
      clients: filterOptions(
        allAccessibleRows.map((row) => ({
          value: row.clientId,
          label: row.clientName,
        })),
      ),
      sites: filterOptions(
        allAccessibleRows.flatMap((row) =>
          row.siteIds.map((value, index) => ({
            value,
            label: row.siteNames[index] ?? value,
          })),
        ),
      ),
      engagements: filterOptions(
        allAccessibleRows.map((row) => ({
          value: row.engagementId,
          label: row.engagementName,
        })),
      ),
      areas: filterOptions(
        allAccessibleRows.flatMap((row) =>
          row.areaIds.map((value, index) => ({
            value,
            label: row.areaNames[index] ?? value,
          })),
        ),
      ),
      processes: filterOptions(
        allAccessibleRows.flatMap((row) =>
          row.processIds.map((value, index) => ({
            value,
            label: row.processNames[index] ?? value,
          })),
        ),
      ),
      systems: filterOptions(
        allAccessibleRows.flatMap((row) =>
          row.systemIds.map((value, index) => ({
            value,
            label: row.systemNames[index] ?? value,
          })),
        ),
      ),
      evidenceTypes: filterOptions(
        allAccessibleRows.map((row) => ({
          value: row.evidenceType,
          label: row.evidenceType,
        })),
      ),
      sources: filterOptions(
        allAccessibleRows.map((row) => ({
          value: row.source,
          label: row.source,
        })),
      ),
      reviewStatuses: filterOptions(
        allAccessibleRows.map((row) => ({
          value: row.reviewStatus,
          label: labelise(row.reviewStatus),
        })),
      ),
      visibilities: filterOptions(
        allAccessibleRows.map((row) => ({
          value: row.visibility,
          label: visibilityLabels[row.visibility],
        })),
      ),
      recordedBy: filterOptions(
        allAccessibleRows.flatMap((row) =>
          row.recordedByUserIds.map((value, index) => ({
            value,
            label: row.recordedByNames[index] ?? value,
          })),
        ),
      ),
    },
    metrics: {
      total: allAccessibleRows.length,
      visible: rows.length,
      needsReview: allAccessibleRows.filter(
        (row) =>
          row.reviewStatus === 'draft' || row.reviewStatus === 'needs-review',
      ).length,
      verified: allAccessibleRows.filter(
        (row) => row.reviewStatus === 'verified',
      ).length,
      linkedRecords: rows.reduce((count, row) => count + row.links.length, 0),
    },
  };
}

export interface KnowledgeLibraryFilters {
  query?: string;
  type?: string;
  status?: string;
  area?: FabricDataset['knowledgeEntries'][number]['tags']['areas'][number];
  process?: FabricDataset['knowledgeEntries'][number]['tags']['processes'][number];
  system?: FabricDataset['knowledgeEntries'][number]['tags']['systems'][number];
  industry?: FabricDataset['knowledgeEntries'][number]['tags']['industries'][number];
  opportunityType?: FabricDataset['knowledgeEntries'][number]['tags']['opportunityTypes'][number];
}

export interface KnowledgeLibraryRow {
  id: EntityId;
  title: string;
  summary: string;
  content: string;
  type: string;
  source: string;
  status: string;
  statusTone: DisplayTone;
  methodologyStage?: TransformationStage;
  tags: string[];
  entry: FabricDataset['knowledgeEntries'][number];
}

export interface KnowledgeLibraryViewModel {
  rows: KnowledgeLibraryRow[];
  canManage: boolean;
  metrics: {
    total: number;
    approved: number;
    inReview: number;
  };
}

function knowledgeStatusTone(status: string): DisplayTone {
  if (status === 'approved') {
    return 'success';
  }
  if (status === 'internal-review') {
    return 'warning';
  }
  if (status === 'retired') {
    return 'neutral';
  }
  return 'accent';
}

export function buildKnowledgeLibrary(
  dataset: FabricDataset,
  actor: Pick<User, 'id' | 'role'>,
  filters: KnowledgeLibraryFilters = {},
): KnowledgeLibraryViewModel {
  const isWorkspaceUser = dataset.users.some(
    (user) => user.id === actor.id && user.role === actor.role,
  );
  const canManage =
    isWorkspaceUser &&
    (canUserPerform(actor, 'knowledge:write') ||
      canUserPerform(actor, 'knowledge:approve'));
  const visibleEntries = isWorkspaceUser
    ? dataset.knowledgeEntries.filter(
        (entry) => canManage || entry.status === 'approved',
      )
    : [];
  const rows = visibleEntries
    .map((entry) => {
      const tags = [
        ...entry.tags.areas,
        ...entry.tags.processes,
        ...entry.tags.systems,
        ...entry.tags.issueCategories,
        ...entry.tags.evidenceTypes,
        ...entry.tags.opportunityTypes,
        ...entry.tags.industries,
        entry.tags.confidence ?? '',
        ...entry.tags.reviewStatuses,
      ].filter(Boolean);
      return {
        id: entry.id,
        title: entry.title,
        summary: entry.summary,
        content: entry.content,
        type: entry.type,
        source: entry.source,
        status: entry.status,
        statusTone: knowledgeStatusTone(entry.status),
        methodologyStage: entry.methodologyStage,
        tags,
        entry,
      };
    })
    .filter((entry) => {
      if (
        filters.query &&
        getSearchRelevance(
          filters.query,
          `${entry.title} ${entry.summary} ${entry.content} ${entry.tags.join(
            ' ',
          )}`,
        ) === 0
      ) {
        return false;
      }
      if (filters.type && entry.type !== filters.type) {
        return false;
      }
      if (filters.status && entry.status !== filters.status) {
        return false;
      }
      if (filters.area && !entry.entry.tags.areas.includes(filters.area)) {
        return false;
      }
      if (
        filters.process &&
        !entry.entry.tags.processes.includes(filters.process)
      ) {
        return false;
      }
      if (
        filters.system &&
        !entry.entry.tags.systems.includes(filters.system)
      ) {
        return false;
      }
      if (
        filters.industry &&
        !entry.entry.tags.industries.includes(filters.industry)
      ) {
        return false;
      }
      if (
        filters.opportunityType &&
        !entry.entry.tags.opportunityTypes.includes(filters.opportunityType)
      ) {
        return false;
      }
      return true;
    })
    .sort(
      (left, right) =>
        Number(right.status === 'approved') -
          Number(left.status === 'approved') ||
        left.title.localeCompare(right.title),
    );

  return {
    rows,
    canManage,
    metrics: {
      total: visibleEntries.length,
      approved: visibleEntries.filter((entry) => entry.status === 'approved')
        .length,
      inReview: visibleEntries.filter(
        (entry) => entry.status === 'internal-review',
      ).length,
    },
  };
}

function globalSearchPath(
  dataset: FabricDataset,
  sourceType: ReturnType<
    typeof retrieveRelevantFabricKnowledge
  >[number]['sourceType'],
  sourceId: EntityId,
) {
  switch (sourceType) {
    case 'client':
      return `/clients/${sourceId}`;
    case 'site':
      return `/sites/${sourceId}`;
    case 'engagement':
      return `/workspace/${sourceId}`;
    case 'site-walk':
      return `/site-walks/${sourceId}`;
    case 'observation': {
      const siteWalkId = dataset.observations.find(
        (observation) => observation.id === sourceId,
      )?.siteWalkId;
      return siteWalkId
        ? `/site-walks/${siteWalkId}#observation-${sourceId}`
        : '/site-walks';
    }
    case 'evidence':
      return `/evidence?evidence=${sourceId}`;
    case 'finding':
      return `/diagnosis?finding=${sourceId}`;
    case 'opportunity':
      return `/opportunities/${sourceId}`;
    case 'initiative':
      return `/roadmap/${sourceId}`;
    case 'output':
      return `/outputs/${sourceId}`;
    case 'landscape-entity':
      return `/landscape?entity=${sourceId}`;
    case 'knowledge':
      return `/knowledge?knowledge=${sourceId}`;
  }
}

const globalSearchTypeLabels: Record<
  ReturnType<typeof retrieveRelevantFabricKnowledge>[number]['sourceType'],
  string
> = {
  client: 'Client',
  site: 'Site',
  engagement: 'Engagement',
  'site-walk': 'Site walk',
  observation: 'Observation',
  evidence: 'Evidence',
  finding: 'Finding',
  opportunity: 'Opportunity',
  initiative: 'Roadmap initiative',
  output: 'Output',
  'landscape-entity': 'Landscape item',
  knowledge: 'Reusable knowledge',
};

export function buildGlobalSearchResults(
  dataset: FabricDataset,
  query: string,
  actor: Pick<User, 'id' | 'role'>,
): GlobalSearchResult[] {
  if (!query.trim()) {
    return [];
  }

  return retrieveRelevantFabricKnowledge(dataset, {
    actor,
    query,
    limit: 16,
  }).map((result) => ({
    id: result.sourceId,
    label: result.title,
    context: result.context,
    path: globalSearchPath(dataset, result.sourceType, result.sourceId),
    type: globalSearchTypeLabels[result.sourceType],
  }));
}

/**
 * Resolves the engagement implied by a contextual route so direct links retain
 * the same active workspace context as normal in-app navigation.
 */
export function resolveEngagementIdForPath(
  dataset: FabricDataset,
  pathname: string,
  search = '',
): EntityId | undefined {
  const [area, recordId] = pathname.split('/').filter(Boolean);
  const searchParams = new URLSearchParams(search);

  if (
    (area === 'workspace' || area === 'engagements') &&
    recordId &&
    dataset.engagements.some((engagement) => engagement.id === recordId)
  ) {
    return recordId;
  }

  if (area === 'site-walks' && recordId) {
    return dataset.siteWalks.find((siteWalk) => siteWalk.id === recordId)
      ?.engagementId;
  }

  if (area === 'opportunities' && recordId) {
    return dataset.opportunities.find(
      (opportunity) => opportunity.id === recordId,
    )?.engagementId;
  }

  if (area === 'roadmap' && recordId) {
    return dataset.initiatives.find((initiative) => initiative.id === recordId)
      ?.engagementId;
  }

  if (area === 'outputs' && recordId) {
    return dataset.outputs.find((output) => output.id === recordId)
      ?.engagementId;
  }

  if (area === 'diagnosis') {
    const findingId = searchParams.get('finding');
    const diagnosticId = findingId
      ? dataset.findings.find((finding) => finding.id === findingId)
          ?.diagnosticId
      : undefined;
    return dataset.diagnostics.find(
      (diagnostic) => diagnostic.id === diagnosticId,
    )?.engagementId;
  }

  if (area === 'evidence') {
    const evidenceId = searchParams.get('evidence');
    const evidence = evidenceId
      ? dataset.evidence.find((item) => item.id === evidenceId)
      : undefined;
    return evidence ? getEvidenceEngagementId(dataset, evidence) : undefined;
  }

  if (area === 'landscape') {
    const entityId = searchParams.get('entity');
    return entityId
      ? dataset.landscapeEntities.find((entity) => entity.id === entityId)
          ?.engagementId
      : undefined;
  }

  return undefined;
}

export function buildBreadcrumbs(
  dataset: FabricDataset,
  pathname: string,
  currentArea: string,
): WorkspaceBreadcrumb[] {
  const root: WorkspaceBreadcrumb[] = [{ label: 'Fabric', path: '/workspace' }];
  const [area, recordId] = pathname.split('/').filter(Boolean);

  if (area === 'workspace') {
    return recordId &&
      dataset.engagements.some((engagement) => engagement.id === recordId)
      ? [
          ...root,
          ...engagementBreadcrumbs(dataset, recordId),
          { label: 'Workspace' },
        ]
      : root;
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
    return [
      ...root,
      ...engagementBreadcrumbs(dataset, recordId),
      { label: 'Workspace' },
    ];
  }

  if (area === 'understand' || area === 'analyse' || area === 'plan-output') {
    return [...root, { label: currentArea }];
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

  if (area === 'evidence') {
    return [...root, { label: 'Evidence library' }];
  }

  if (area === 'knowledge') {
    return [...root, { label: 'Reusable knowledge' }];
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
