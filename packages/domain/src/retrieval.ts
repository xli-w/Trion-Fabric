import { canUserAccessEngagement } from './access';
import type {
  EntityId,
  Evidence,
  FabricDataset,
  KnowledgeEntry,
  User,
  VisibilityScope,
} from './model';

export const retrievalSourceTypes = [
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
] as const;

export type RetrievalSourceType = (typeof retrievalSourceTypes)[number];

export interface EvidenceTrace {
  evidenceId: EntityId;
  engagementId?: EntityId;
  clientId?: EntityId;
  siteIds: EntityId[];
  areaIds: EntityId[];
  processIds: EntityId[];
  systemIds: EntityId[];
  observationIds: EntityId[];
  siteWalkIds: EntityId[];
  findingIds: EntityId[];
  opportunityIds: EntityId[];
  initiativeIds: EntityId[];
  outputIds: EntityId[];
  recordedByUserIds: EntityId[];
}

export interface RetrievalSource {
  id: EntityId;
  type: RetrievalSourceType;
  title: string;
  summary: string;
  context: string;
  engagementId?: EntityId;
  clientId?: EntityId;
  siteIds: EntityId[];
  visibility?: VisibilityScope;
  tags: string[];
  searchText: string;
}

export interface RetrievalRequest {
  actor: Pick<User, 'id' | 'role'>;
  query: string;
  engagementId?: EntityId;
  siteId?: EntityId;
  sourceTypes?: readonly RetrievalSourceType[];
  limit?: number;
}

export interface RetrievalResult {
  sourceId: EntityId;
  sourceType: RetrievalSourceType;
  title: string;
  excerpt: string;
  context: string;
  engagementId?: EntityId;
  clientId?: EntityId;
  visibility?: VisibilityScope;
  sourceIdentifiers: EntityId[];
  tags: string[];
  relevance: number;
}

const queryAliases: Record<string, string[]> = {
  automate: ['automation', 'digital', 'system'],
  automation: ['automate', 'digital', 'system'],
  data: ['information', 'record', 'status'],
  delay: ['lag', 'later', 'aged', 'slow'],
  downtime: ['machine', 'loss', 'delay', 'whiteboard'],
  erp: ['epicor', 'business-central', 'enterprise-resource-planning'],
  manual: ['paper', 'handwritten', 'transcription', 'whiteboard'],
  paper: ['manual', 'handwritten', 'paper-first', 'transcription'],
  production: ['shopfloor', 'machine', 'operator', 'shift', 'manufacturing'],
  quality: ['ncr', 'defect', 'non-conformance', 'inspection'],
  reporting: ['report', 'status', 'visibility', 'capture'],
  spreadsheet: ['excel', 'workbook', 'reconciliation'],
  tracking: ['status', 'capture', 'visibility', 'record', 'reporting'],
  workaround: ['parallel', 'duplicate', 'paper-first', 'local'],
};

function uniqueIds(values: Iterable<EntityId | undefined>) {
  return [
    ...new Set(
      [...values].filter((value): value is EntityId => Boolean(value)),
    ),
  ];
}

function matchesAny(values: Iterable<EntityId>, targetIds: Set<EntityId>) {
  return [...values].some((value) => targetIds.has(value));
}

function labelise(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normaliseSearchText(value: string) {
  return value.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
}

function queryTerms(query: string) {
  return normaliseSearchText(query)
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 1);
}

export function getSearchRelevance(query: string, searchText: string) {
  const terms = queryTerms(query);
  if (terms.length === 0) {
    return 0;
  }

  const normalisedText = normaliseSearchText(searchText);
  const phrase = normaliseSearchText(query);
  let relevance = normalisedText.includes(phrase) ? 12 : 0;

  for (const term of terms) {
    if (normalisedText.includes(term)) {
      relevance += 8;
      continue;
    }

    const aliases = queryAliases[term] ?? [];
    if (aliases.some((alias) => normalisedText.includes(alias))) {
      relevance += 4;
      continue;
    }

    return 0;
  }

  return relevance;
}

function excerptForQuery(summary: string, query: string) {
  if (summary.length <= 220) {
    return summary;
  }

  const normalisedSummary = normaliseSearchText(summary);
  const matchingTerm = queryTerms(query).find((term) =>
    normalisedSummary.includes(term),
  );
  const index = matchingTerm ? normalisedSummary.indexOf(matchingTerm) : 0;
  const start = Math.max(0, index - 48);
  const end = Math.min(summary.length, start + 220);

  return `${start > 0 ? '...' : ''}${summary.slice(start, end)}${
    end < summary.length ? '...' : ''
  }`;
}

function evidenceObservationIds(
  dataset: FabricDataset,
  evidenceItem: Evidence,
) {
  return uniqueIds([
    evidenceItem.observationId,
    evidenceItem.relatedEntityType === 'observation'
      ? evidenceItem.relatedEntityId
      : undefined,
    ...dataset.observations
      .filter((observation) =>
        observation.evidenceIds.includes(evidenceItem.id),
      )
      .map((observation) => observation.id),
  ]);
}

export function getEvidenceEngagementId(
  dataset: FabricDataset,
  evidenceItem: Evidence,
) {
  if (evidenceItem.siteWalkId) {
    return dataset.siteWalks.find((item) => item.id === evidenceItem.siteWalkId)
      ?.engagementId;
  }

  const observationId =
    evidenceItem.observationId ??
    (evidenceItem.relatedEntityType === 'observation'
      ? evidenceItem.relatedEntityId
      : undefined);
  if (observationId) {
    const siteWalkId = dataset.observations.find(
      (item) => item.id === observationId,
    )?.siteWalkId;
    return dataset.siteWalks.find((item) => item.id === siteWalkId)
      ?.engagementId;
  }

  if (evidenceItem.relatedEntityType === 'engagement') {
    return evidenceItem.relatedEntityId;
  }

  if (evidenceItem.relatedEntityType === 'site-walk') {
    return dataset.siteWalks.find(
      (item) => item.id === evidenceItem.relatedEntityId,
    )?.engagementId;
  }

  if (evidenceItem.relatedEntityType === 'opportunity') {
    return dataset.opportunities.find(
      (item) => item.id === evidenceItem.relatedEntityId,
    )?.engagementId;
  }

  return dataset.outputs.find(
    (item) => item.id === evidenceItem.relatedEntityId,
  )?.engagementId;
}

export function buildEvidenceTrace(
  dataset: FabricDataset,
  evidenceItem: Evidence,
): EvidenceTrace {
  const observationIds = evidenceObservationIds(dataset, evidenceItem);
  const observationIdSet = new Set(observationIds);
  const siteWalkIds = uniqueIds([
    evidenceItem.siteWalkId,
    evidenceItem.relatedEntityType === 'site-walk'
      ? evidenceItem.relatedEntityId
      : undefined,
    ...dataset.observations
      .filter((observation) => observationIdSet.has(observation.id))
      .map((observation) => observation.siteWalkId),
  ]);
  const siteWalkIdSet = new Set(siteWalkIds);

  const findingIds = uniqueIds(
    dataset.findings
      .filter(
        (finding) =>
          finding.relatedEvidenceIds.includes(evidenceItem.id) ||
          matchesAny(finding.relatedObservationIds, observationIdSet),
      )
      .map((finding) => finding.id),
  );
  const findingIdSet = new Set(findingIds);
  const directOpportunityIds = dataset.opportunities
    .filter(
      (opportunity) =>
        opportunity.evidenceIds.includes(evidenceItem.id) ||
        matchesAny(opportunity.relatedObservationIds ?? [], observationIdSet) ||
        matchesAny(opportunity.relatedFindingIds ?? [], findingIdSet) ||
        (evidenceItem.relatedEntityType === 'opportunity' &&
          opportunity.id === evidenceItem.relatedEntityId),
    )
    .map((opportunity) => opportunity.id);
  const landscapeOpportunityIds = dataset.landscapeEntities
    .filter(
      (entity) =>
        entity.linkedEvidenceIds.includes(evidenceItem.id) ||
        matchesAny(entity.linkedObservationIds, observationIdSet),
    )
    .flatMap((entity) => entity.linkedOpportunityIds);
  const opportunityIds = uniqueIds([
    ...directOpportunityIds,
    ...landscapeOpportunityIds,
  ]);
  const opportunityIdSet = new Set(opportunityIds);
  const initiativeIds = uniqueIds(
    dataset.initiatives
      .filter((initiative) => opportunityIdSet.has(initiative.opportunityId))
      .map((initiative) => initiative.id),
  );

  const areaIds = new Set<EntityId>();
  const processIds = new Set<EntityId>();
  const systemIds = new Set<EntityId>();
  const siteIds = new Set<EntityId>();
  const recordedByUserIds = new Set<EntityId>();

  dataset.siteWalks
    .filter((siteWalk) => siteWalkIdSet.has(siteWalk.id))
    .forEach((siteWalk) => {
      siteIds.add(siteWalk.siteId);
      if (siteWalk.areaId) {
        areaIds.add(siteWalk.areaId);
      }
      if (siteWalk.processId) {
        processIds.add(siteWalk.processId);
      }
      recordedByUserIds.add(siteWalk.consultantUserId);
    });

  dataset.observations
    .filter((observation) => observationIdSet.has(observation.id))
    .forEach((observation) => {
      if (observation.areaId) {
        areaIds.add(observation.areaId);
      }
      if (observation.processId) {
        processIds.add(observation.processId);
      }
      if (observation.systemId) {
        systemIds.add(observation.systemId);
      }
      if (observation.recordedByUserId) {
        recordedByUserIds.add(observation.recordedByUserId);
      }
    });

  dataset.opportunities
    .filter((opportunity) => opportunityIdSet.has(opportunity.id))
    .forEach((opportunity) => {
      if (opportunity.areaId) {
        areaIds.add(opportunity.areaId);
      }
      if (opportunity.processId) {
        processIds.add(opportunity.processId);
      }
      if (opportunity.systemId) {
        systemIds.add(opportunity.systemId);
      }
    });

  const relatedLandscapeEntities = dataset.landscapeEntities.filter(
    (entity) =>
      entity.linkedEvidenceIds.includes(evidenceItem.id) ||
      matchesAny(entity.linkedObservationIds, observationIdSet) ||
      matchesAny(entity.linkedOpportunityIds, opportunityIdSet),
  );
  relatedLandscapeEntities.forEach((entity) => {
    siteIds.add(entity.siteId);
    if (entity.type === 'area' && entity.sourceEntityId) {
      areaIds.add(entity.sourceEntityId);
    }
    if (entity.type === 'process' && entity.sourceEntityId) {
      processIds.add(entity.sourceEntityId);
    }
    if (entity.type === 'system' && entity.sourceEntityId) {
      systemIds.add(entity.sourceEntityId);
    }
  });

  dataset.areas
    .filter((area) => areaIds.has(area.id))
    .forEach((area) => siteIds.add(area.siteId));
  dataset.processes
    .filter((process) => processIds.has(process.id))
    .forEach((process) => siteIds.add(process.siteId));
  dataset.systems
    .filter((system) => systemIds.has(system.id))
    .forEach((system) => siteIds.add(system.siteId));

  if (evidenceItem.capturedByUserId) {
    recordedByUserIds.add(evidenceItem.capturedByUserId);
  }

  const outputSourceIds = new Set([
    evidenceItem.id,
    ...observationIds,
    ...findingIds,
    ...opportunityIds,
    ...initiativeIds,
  ]);
  const outputIds = uniqueIds([
    ...(evidenceItem.relatedEntityType === 'output'
      ? [evidenceItem.relatedEntityId]
      : []),
    ...dataset.outputs
      .filter((output) =>
        output.sourceReferences.some((sourceId) =>
          outputSourceIds.has(sourceId),
        ),
      )
      .map((output) => output.id),
  ]);
  const engagementId = getEvidenceEngagementId(dataset, evidenceItem);
  const clientId = engagementId
    ? dataset.engagements.find((engagement) => engagement.id === engagementId)
        ?.clientId
    : undefined;

  return {
    evidenceId: evidenceItem.id,
    engagementId,
    clientId,
    siteIds: uniqueIds(siteIds),
    areaIds: uniqueIds(areaIds),
    processIds: uniqueIds(processIds),
    systemIds: uniqueIds(systemIds),
    observationIds,
    siteWalkIds,
    findingIds,
    opportunityIds,
    initiativeIds,
    outputIds,
    recordedByUserIds: uniqueIds(recordedByUserIds),
  };
}

export function getAccessibleEngagementIds(
  dataset: FabricDataset,
  actor: Pick<User, 'id' | 'role'>,
) {
  const matchingWorkspaceUser = dataset.users.find(
    (user) => user.id === actor.id && user.role === actor.role,
  );
  if (!matchingWorkspaceUser) {
    return new Set<EntityId>();
  }

  return new Set(
    dataset.engagements
      .filter((engagement) => canUserAccessEngagement(actor, engagement))
      .map((engagement) => engagement.id),
  );
}

function source(item: Omit<RetrievalSource, 'searchText'>): RetrievalSource {
  return {
    ...item,
    searchText: [item.title, item.summary, item.context, ...item.tags].join(
      ' ',
    ),
  };
}

function isApprovedInternalKnowledge(entry: KnowledgeEntry) {
  return entry.status === 'approved' && entry.visibility === 'internal';
}

export function buildPermissionFilteredRetrievalSources(
  dataset: FabricDataset,
  actor: Pick<User, 'id' | 'role'>,
) {
  const accessibleEngagementIds = getAccessibleEngagementIds(dataset, actor);
  const accessibleEngagements = dataset.engagements.filter((engagement) =>
    accessibleEngagementIds.has(engagement.id),
  );
  const accessibleSiteIds = new Set(
    accessibleEngagements.flatMap((engagement) => engagement.siteIds),
  );
  const accessibleClientIds = new Set(
    accessibleEngagements.map((engagement) => engagement.clientId),
  );
  const clientName = (clientId: EntityId) =>
    dataset.clients.find((client) => client.id === clientId)?.name ??
    'Unknown client';
  const siteName = (siteId: EntityId) =>
    dataset.sites.find((site) => site.id === siteId)?.name ?? 'Unknown site';
  const engagementName = (engagementId: EntityId) =>
    dataset.engagements.find((engagement) => engagement.id === engagementId)
      ?.name ?? 'Unknown engagement';
  const sources: RetrievalSource[] = [];

  dataset.clients
    .filter((client) => accessibleClientIds.has(client.id))
    .forEach((client) => {
      const siteIds = dataset.sites
        .filter(
          (site) =>
            site.clientId === client.id && accessibleSiteIds.has(site.id),
        )
        .map((site) => site.id);
      sources.push(
        source({
          id: client.id,
          type: 'client',
          title: client.name,
          summary: client.description ?? client.industry,
          context: client.industry,
          clientId: client.id,
          siteIds,
          tags: [client.industry, client.status],
        }),
      );
    });

  dataset.sites
    .filter((site) => accessibleSiteIds.has(site.id))
    .forEach((site) => {
      sources.push(
        source({
          id: site.id,
          type: 'site',
          title: site.name,
          summary: site.description,
          context: clientName(site.clientId),
          clientId: site.clientId,
          siteIds: [site.id],
          tags: [
            site.location,
            site.operationalProfile,
            site.status ?? 'active',
          ],
        }),
      );
    });

  accessibleEngagements.forEach((engagement) => {
    sources.push(
      source({
        id: engagement.id,
        type: 'engagement',
        title: engagement.name,
        summary: engagement.description,
        context: clientName(engagement.clientId),
        engagementId: engagement.id,
        clientId: engagement.clientId,
        siteIds: engagement.siteIds,
        tags: [
          engagement.type,
          engagement.stage,
          engagement.status,
          engagement.objectives ?? '',
          engagement.scope ?? '',
        ],
      }),
    );
  });

  dataset.siteWalks
    .filter((siteWalk) => accessibleEngagementIds.has(siteWalk.engagementId))
    .forEach((siteWalk) => {
      sources.push(
        source({
          id: siteWalk.id,
          type: 'site-walk',
          title: siteWalk.title,
          summary: [...siteWalk.plannedScope, ...siteWalk.completedScope].join(
            ' ',
          ),
          context: `${engagementName(siteWalk.engagementId)} · ${siteName(
            siteWalk.siteId,
          )}`,
          engagementId: siteWalk.engagementId,
          clientId: dataset.engagements.find(
            (engagement) => engagement.id === siteWalk.engagementId,
          )?.clientId,
          siteIds: [siteWalk.siteId],
          tags: [siteWalk.walkType, siteWalk.status],
        }),
      );
    });

  dataset.observations.forEach((observation) => {
    const siteWalk = dataset.siteWalks.find(
      (item) => item.id === observation.siteWalkId,
    );
    if (!siteWalk || !accessibleEngagementIds.has(siteWalk.engagementId)) {
      return;
    }

    sources.push(
      source({
        id: observation.id,
        type: 'observation',
        title: observation.title ?? observation.summary,
        summary: observation.description ?? observation.detail,
        context: `${engagementName(siteWalk.engagementId)} · ${siteName(
          siteWalk.siteId,
        )}`,
        engagementId: siteWalk.engagementId,
        clientId: dataset.engagements.find(
          (engagement) => engagement.id === siteWalk.engagementId,
        )?.clientId,
        siteIds: [siteWalk.siteId],
        visibility: observation.visibility,
        tags: [
          observation.observationType ?? '',
          observation.source ?? observation.origin,
          observation.assurance,
          observation.status ?? '',
          observation.confidence ?? '',
        ],
      }),
    );
  });

  dataset.evidence.forEach((evidenceItem) => {
    const trace = buildEvidenceTrace(dataset, evidenceItem);
    if (
      !trace.engagementId ||
      !accessibleEngagementIds.has(trace.engagementId)
    ) {
      return;
    }
    sources.push(
      source({
        id: evidenceItem.id,
        type: 'evidence',
        title: evidenceItem.title,
        summary: evidenceItem.description ?? evidenceItem.summary,
        context: `${engagementName(trace.engagementId)}${
          trace.siteIds[0] ? ` · ${siteName(trace.siteIds[0])}` : ''
        }`,
        engagementId: trace.engagementId,
        clientId: trace.clientId,
        siteIds: trace.siteIds,
        visibility: evidenceItem.visibility,
        tags: [
          evidenceItem.kind,
          evidenceItem.evidenceType ?? '',
          evidenceItem.source ?? evidenceItem.origin,
          evidenceItem.reviewStatus ?? evidenceItem.approvalState,
        ],
      }),
    );
  });

  dataset.findings.forEach((finding) => {
    const diagnostic = dataset.diagnostics.find(
      (item) => item.id === finding.diagnosticId,
    );
    if (!diagnostic || !accessibleEngagementIds.has(diagnostic.engagementId)) {
      return;
    }
    const engagement = dataset.engagements.find(
      (item) => item.id === diagnostic.engagementId,
    );
    sources.push(
      source({
        id: finding.id,
        type: 'finding',
        title: finding.title,
        summary: `${finding.currentSituation} ${finding.whyItMatters}`,
        context: engagementName(diagnostic.engagementId),
        engagementId: diagnostic.engagementId,
        clientId: engagement?.clientId,
        siteIds: engagement?.siteIds ?? [],
        tags: [
          finding.category,
          finding.significance,
          finding.confidence,
          finding.reviewStatus,
        ],
      }),
    );
  });

  dataset.opportunities
    .filter((opportunity) =>
      accessibleEngagementIds.has(opportunity.engagementId),
    )
    .forEach((opportunity) => {
      const engagement = dataset.engagements.find(
        (item) => item.id === opportunity.engagementId,
      );
      sources.push(
        source({
          id: opportunity.id,
          type: 'opportunity',
          title: opportunity.title,
          summary: `${opportunity.description} ${opportunity.problemStatement}`,
          context: engagementName(opportunity.engagementId),
          engagementId: opportunity.engagementId,
          clientId: engagement?.clientId,
          siteIds: engagement?.siteIds ?? [],
          visibility: opportunity.visibility,
          tags: [
            opportunity.type,
            opportunity.priority,
            opportunity.status,
            opportunity.confidence,
          ],
        }),
      );
    });

  dataset.initiatives
    .filter((initiative) =>
      accessibleEngagementIds.has(initiative.engagementId),
    )
    .forEach((initiative) => {
      const engagement = dataset.engagements.find(
        (item) => item.id === initiative.engagementId,
      );
      sources.push(
        source({
          id: initiative.id,
          type: 'initiative',
          title: initiative.title,
          summary: `${initiative.description} ${initiative.objective}`,
          context: engagementName(initiative.engagementId),
          engagementId: initiative.engagementId,
          clientId: engagement?.clientId,
          siteIds: engagement?.siteIds ?? [],
          tags: [
            initiative.phase,
            initiative.status,
            initiative.priority,
            initiative.confidence,
          ],
        }),
      );
    });

  dataset.outputs
    .filter((output) => accessibleEngagementIds.has(output.engagementId))
    .forEach((output) => {
      const engagement = dataset.engagements.find(
        (item) => item.id === output.engagementId,
      );
      sources.push(
        source({
          id: output.id,
          type: 'output',
          title: output.title,
          summary: output.contentReference ?? output.outputType,
          context: engagementName(output.engagementId),
          engagementId: output.engagementId,
          clientId: engagement?.clientId,
          siteIds: engagement?.siteIds ?? [],
          visibility: output.visibility,
          tags: [output.outputType, output.status, output.version],
        }),
      );
    });

  dataset.landscapeEntities
    .filter((entity) => accessibleEngagementIds.has(entity.engagementId))
    .forEach((entity) => {
      const engagement = dataset.engagements.find(
        (item) => item.id === entity.engagementId,
      );
      sources.push(
        source({
          id: entity.id,
          type: 'landscape-entity',
          title: entity.name,
          summary: entity.description,
          context: `${engagementName(entity.engagementId)} · ${siteName(
            entity.siteId,
          )}`,
          engagementId: entity.engagementId,
          clientId: engagement?.clientId,
          siteIds: [entity.siteId],
          visibility: entity.visibility,
          tags: [
            labelise(entity.type),
            entity.ownerRole ?? '',
            entity.confidence,
            entity.verificationStatus,
          ],
        }),
      );
    });

  dataset.knowledgeEntries
    .filter(isApprovedInternalKnowledge)
    .forEach((entry) => {
      sources.push(
        source({
          id: entry.id,
          type: 'knowledge',
          title: entry.title,
          summary: entry.summary,
          context: 'Approved Trion reusable knowledge',
          siteIds: [],
          tags: [
            entry.type,
            entry.source,
            entry.methodologyStage ?? '',
            ...entry.tags.areas,
            ...entry.tags.processes,
            ...entry.tags.systems,
            ...entry.tags.issueCategories,
            ...entry.tags.evidenceTypes,
            ...entry.tags.opportunityTypes,
            ...entry.tags.industries,
            entry.tags.confidence ?? '',
            ...entry.tags.reviewStatuses,
          ],
        }),
      );
    });

  return sources;
}

export function retrieveRelevantFabricKnowledge(
  dataset: FabricDataset,
  request: RetrievalRequest,
): RetrievalResult[] {
  const limit = Math.max(1, Math.min(request.limit ?? 12, 50));
  const permittedTypes = request.sourceTypes
    ? new Set(request.sourceTypes)
    : undefined;

  return buildPermissionFilteredRetrievalSources(dataset, request.actor)
    .filter((item) => {
      if (permittedTypes && !permittedTypes.has(item.type)) {
        return false;
      }
      if (
        request.engagementId &&
        item.type !== 'knowledge' &&
        item.engagementId !== request.engagementId
      ) {
        return false;
      }
      if (
        request.siteId &&
        item.type !== 'knowledge' &&
        !item.siteIds.includes(request.siteId)
      ) {
        return false;
      }
      return true;
    })
    .map((item) => ({
      item,
      relevance: getSearchRelevance(request.query, item.searchText),
    }))
    .filter((item) => item.relevance > 0)
    .sort(
      (left, right) =>
        right.relevance - left.relevance ||
        left.item.title.localeCompare(right.item.title),
    )
    .slice(0, limit)
    .map(({ item, relevance }) => ({
      sourceId: item.id,
      sourceType: item.type,
      title: item.title,
      excerpt: excerptForQuery(item.summary, request.query),
      context: item.context,
      engagementId: item.engagementId,
      clientId: item.clientId,
      visibility: item.visibility,
      sourceIdentifiers: [item.id],
      tags: item.tags.filter(Boolean),
      relevance,
    }));
}
