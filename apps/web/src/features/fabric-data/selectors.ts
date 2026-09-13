import type {
  ClientStatus,
  EngagementStatus,
  FabricDataset,
  OpportunityPriority,
  OutputState,
  SiteWalkStatus,
  TransformationStage,
} from '@domain';

export type DisplayTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

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

const outputStateWeight: Record<OutputState, number> = {
  draft: 0,
  'internal-review': 1,
  approved: 2,
  shared: 3,
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
    processes: new Map(dataset.processes.map((process) => [process.id, process])),
    engagements: new Map(dataset.engagements.map((engagement) => [engagement.id, engagement])),
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

function outputStateTone(state: OutputState): DisplayTone {
  if (state === 'approved' || state === 'shared') {
    return 'success';
  }

  if (state === 'internal-review') {
    return 'warning';
  }

  return 'neutral';
}

export function buildWorkspaceSnapshot(dataset: FabricDataset) {
  const maps = createMaps(dataset);
  const activeEngagements = dataset.engagements.filter(
    (engagement) => engagement.status === 'active' || engagement.status === 'at-risk',
  );
  const upcomingSiteWalks = dataset.siteWalks
    .filter((siteWalk) => siteWalk.status !== 'completed')
    .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt))
    .map((siteWalk) => ({
      id: siteWalk.id,
      title: siteWalk.title,
      when: formatDateTime(siteWalk.scheduledAt),
      engagementName: maps.engagements.get(siteWalk.engagementId)?.name ?? 'Unknown engagement',
      siteName: maps.sites.get(siteWalk.siteId)?.name ?? 'Unknown site',
      ownerName: maps.users.get(siteWalk.consultantUserId)?.displayName ?? 'Unknown consultant',
      status: labelise(siteWalk.status),
    }));

  const priorityOpportunities = [...dataset.opportunities]
    .sort((left, right) => priorityWeight[left.priority] - priorityWeight[right.priority])
    .slice(0, 4)
    .map((opportunity) => ({
      id: opportunity.id,
      title: opportunity.title,
      priority: labelise(opportunity.priority),
      status: labelise(opportunity.status),
      engagementName: maps.engagements.get(opportunity.engagementId)?.name ?? 'Unknown engagement',
      evidenceCount: opportunity.evidenceIds.length,
      tone: opportunityPriorityTone(opportunity.priority),
    }));

  const outputsAwaitingReview = [...dataset.outputs]
    .filter((output) => output.state === 'draft' || output.state === 'internal-review')
    .sort((left, right) => outputStateWeight[left.state] - outputStateWeight[right.state])
    .map((output) => ({
      id: output.id,
      title: output.title,
      kind: labelise(output.kind),
      state: labelise(output.state),
      engagementName: maps.engagements.get(output.engagementId)?.name ?? 'Unknown engagement',
      visibility: labelise(output.visibility),
    }));

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
        value: String(uniqueCount(activeEngagements.flatMap((engagement) => engagement.siteIds))),
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
        detail: 'Draft or internal-review outputs that are not yet approved for sharing.',
        tone: 'warning' as DisplayTone,
      },
    ],
    activeEngagements: activeEngagements.map((engagement) => ({
      id: engagement.id,
      name: engagement.name,
      clientName: maps.clients.get(engagement.clientId)?.name ?? 'Unknown client',
      stage: labelise(engagement.stage),
      status: labelise(engagement.status),
      targetDate: engagement.targetDate ? formatDate(engagement.targetDate) : 'TBC',
      teamSize: engagement.teamUserIds.length,
    })),
    upcomingSiteWalks,
    priorityOpportunities,
    outputsAwaitingReview,
  };
}

export function buildClientsViewModel(dataset: FabricDataset) {
  return dataset.clients
    .map((client) => {
      const sites = dataset.sites.filter((site) => site.clientId === client.id);
      const engagements = dataset.engagements.filter((engagement) => engagement.clientId === client.id);

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
    leadName: maps.users.get(engagement.leadUserId)?.displayName ?? 'Unknown lead',
    teamSize: engagement.teamUserIds.length,
    siteCount: engagement.siteIds.length,
    targetDate: engagement.targetDate ? formatDate(engagement.targetDate) : 'TBC',
    type: engagement.type,
  }));

  const stageSummary = (['discover', 'diagnose', 'design', 'deliver', 'measure'] as TransformationStage[]).map(
    (stage) => ({
      stage: labelise(stage),
      count: rows.filter((row) => row.stage === labelise(stage)).length,
    }),
  );

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
      engagementName: maps.engagements.get(siteWalk.engagementId)?.name ?? 'Unknown engagement',
      siteName: maps.sites.get(siteWalk.siteId)?.name ?? 'Unknown site',
      areaName: siteWalk.areaId ? maps.areas.get(siteWalk.areaId)?.name ?? 'Unknown area' : 'Cross-area',
      consultantName: maps.users.get(siteWalk.consultantUserId)?.displayName ?? 'Unknown consultant',
      status: labelise(siteWalk.status),
      statusTone: siteWalkStatusTone(siteWalk.status),
      scopeCount: siteWalk.plannedScope.length,
      followUpCount: siteWalk.followUpActionIds.length,
    }));

  return {
    rows,
    completedCount: countBy(dataset.siteWalks, (siteWalk) => siteWalk.status === 'completed'),
    upcomingCount: countBy(dataset.siteWalks, (siteWalk) => siteWalk.status !== 'completed'),
    observationCount: dataset.observations.length,
  };
}

export function buildOpportunitiesViewModel(dataset: FabricDataset) {
  const maps = createMaps(dataset);

  const rows = [...dataset.opportunities]
    .sort((left, right) => priorityWeight[left.priority] - priorityWeight[right.priority])
    .map((opportunity) => ({
      id: opportunity.id,
      title: opportunity.title,
      engagementName: maps.engagements.get(opportunity.engagementId)?.name ?? 'Unknown engagement',
      processName: opportunity.processId ? maps.processes.get(opportunity.processId)?.name ?? 'Unassigned' : 'Unassigned',
      priority: labelise(opportunity.priority),
      priorityTone: opportunityPriorityTone(opportunity.priority),
      status: labelise(opportunity.status),
      approvalState: labelise(opportunity.approvalState),
      ownerName: opportunity.ownerUserId ? maps.users.get(opportunity.ownerUserId)?.displayName ?? 'Unknown owner' : 'Unassigned',
      evidenceCount: opportunity.evidenceIds.length,
      initiativeCount: opportunity.initiativeIds.length,
      actionCount: dataset.actionItems.filter((item) => item.opportunityId === opportunity.id).length,
      category: opportunity.priorityCategory ?? 'Uncategorised',
      expectedImpact: opportunity.expectedImpact,
      type: labelise(opportunity.type),
    }));

  return {
    rows,
    highPriorityCount: countBy(dataset.opportunities, (opportunity) =>
      opportunity.priority === 'critical' || opportunity.priority === 'high'),
    approvedCount: countBy(dataset.opportunities, (opportunity) => opportunity.status === 'approved'),
    evidenceLinkedCount: countBy(dataset.opportunities, (opportunity) => opportunity.evidenceIds.length > 0),
  };
}

export function buildOutputsViewModel(dataset: FabricDataset) {
  const maps = createMaps(dataset);

  const rows = [...dataset.outputs]
    .sort((left, right) => outputStateWeight[left.state] - outputStateWeight[right.state])
    .map((output) => ({
      id: output.id,
      title: output.title,
      engagementName: maps.engagements.get(output.engagementId)?.name ?? 'Unknown engagement',
      kind: labelise(output.kind),
      state: labelise(output.state),
      stateTone: outputStateTone(output.state),
      visibility: labelise(output.visibility),
      approvedEntityCount: output.approvedEntityIds.length,
      lastPublishedAt: output.lastPublishedAt ? formatDate(output.lastPublishedAt) : 'Not shared',
    }));

  return {
    rows,
    readyToShareCount: countBy(dataset.outputs, (output) => output.state === 'approved' || output.state === 'shared'),
    reviewQueueCount: countBy(dataset.outputs, (output) => output.state === 'draft' || output.state === 'internal-review'),
  };
}