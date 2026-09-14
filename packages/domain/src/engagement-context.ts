import {
  canUserAccessEngagement,
  canUserPerform,
  isOpportunityReadyForDelivery,
  type WorkspacePermission,
} from './access';
import {
  buildApprovedLandscapeA3Projection,
  type LandscapeA3Projection,
} from './landscape';
import { buildMethodologyRunProgress } from './methodology';
import type {
  ActivityEvent,
  Area,
  Diagnostic,
  Engagement,
  EntityId,
  Evidence,
  FabricDataset,
  Finding,
  FrictionItem,
  Initiative,
  LandscapeEntity,
  LandscapeRelationship,
  LandscapeVersion,
  MethodologyRunStatus,
  MaturityAssessment,
  Observation,
  OperationalSystem,
  Opportunity,
  Output,
  Process,
  Site,
  SiteWalk,
  User,
} from './model';

export type EngagementContextAudience = 'internal' | 'approved-client-facing';

export interface EngagementContextOptions {
  audience?: EngagementContextAudience;
  viewer?: Pick<User, 'id' | 'role'>;
}

export interface EngagementContextAccess {
  audience: EngagementContextAudience;
  canViewInternal: boolean;
  canPerform: (permission: WorkspacePermission) => boolean;
}

export interface EngagementContextIdentity {
  id: EntityId;
  name: string;
  type: Engagement['type'];
  status: Engagement['status'];
  stage: Engagement['stage'];
}

export interface EngagementOutstandingAction {
  id: EntityId;
  title: string;
  status: string;
  source: 'action-item' | 'delivery-action' | 'milestone';
  dueAt?: string;
}

export interface InternalEngagementContext {
  engagement: Engagement;
  client?: {
    id: EntityId;
    name: string;
    industry: string;
    description?: string;
    notes?: string;
  };
  sites: Site[];
  areas: Area[];
  processes: Process[];
  systems: OperationalSystem[];
  dataObjects: LandscapeEntity[];
  roles: LandscapeEntity[];
  landscape: {
    entities: LandscapeEntity[];
    relationships: LandscapeRelationship[];
    versions: LandscapeVersion[];
  };
  siteWalks: SiteWalk[];
  observations: Observation[];
  evidence: Evidence[];
  frictionItems: FrictionItem[];
  diagnostics: Diagnostic[];
  maturityAssessments: MaturityAssessment[];
  findings: Finding[];
  opportunities: Opportunity[];
  initiatives: Initiative[];
  outputs: Output[];
  outstandingActions: EngagementOutstandingAction[];
  activityHistory: ActivityEvent[];
  methodology: {
    activeRunId?: EntityId;
    runs: Array<{
      id: EntityId;
      templateId: EntityId;
      templateName: string;
      templateVersion: string;
      status: MethodologyRunStatus;
      progress: ReturnType<typeof buildMethodologyRunProgress>;
    }>;
  };
}

export interface ApprovedClientFacingEngagementContext {
  client?: {
    id: EntityId;
    name: string;
    industry: string;
    description?: string;
  };
  sites: Array<{
    id: EntityId;
    name: string;
    location: string;
    description: string;
    operationalProfile: string;
  }>;
  processes: Array<{
    id: EntityId;
    name: string;
    description: string;
  }>;
  observations: Array<{
    id: EntityId;
    summary: string;
    observedAt: string;
  }>;
  evidence: Array<{
    id: EntityId;
    title: string;
    summary: string;
    capturedAt: string;
  }>;
  maturityAssessments: Array<{
    id: EntityId;
    score?: number;
    level?: string;
  }>;
  findings: Array<{
    id: EntityId;
    title: string;
    summary: string;
  }>;
  opportunities: Array<{
    id: EntityId;
    title: string;
    summary: string;
    priority: string;
  }>;
  initiatives: Array<{
    id: EntityId;
    title: string;
    summary?: string;
    status: string;
  }>;
  outputs: Array<{
    id: EntityId;
    title: string;
    outputType: string;
    status: string;
    version: string;
    publishedAt?: string;
  }>;
  landscape?: LandscapeA3Projection;
}

export interface EngagementContext {
  access: EngagementContextAccess;
  identity: EngagementContextIdentity;
  internal?: InternalEngagementContext;
  approvedClientFacing: ApprovedClientFacingEngagementContext;
}

function evidenceBelongsToEngagement(
  dataset: FabricDataset,
  evidence: Evidence,
  engagementId: EntityId,
) {
  if (evidence.siteWalkId) {
    return (
      dataset.siteWalks.find((item) => item.id === evidence.siteWalkId)
        ?.engagementId === engagementId
    );
  }

  if (evidence.observationId) {
    const siteWalkId = dataset.observations.find(
      (item) => item.id === evidence.observationId,
    )?.siteWalkId;
    return (
      dataset.siteWalks.find((item) => item.id === siteWalkId)?.engagementId ===
      engagementId
    );
  }

  if (evidence.relatedEntityType === 'engagement') {
    return evidence.relatedEntityId === engagementId;
  }

  if (evidence.relatedEntityType === 'site-walk') {
    return (
      dataset.siteWalks.find((item) => item.id === evidence.relatedEntityId)
        ?.engagementId === engagementId
    );
  }

  if (evidence.relatedEntityType === 'observation') {
    const siteWalkId = dataset.observations.find(
      (item) => item.id === evidence.relatedEntityId,
    )?.siteWalkId;
    return (
      dataset.siteWalks.find((item) => item.id === siteWalkId)?.engagementId ===
      engagementId
    );
  }

  if (evidence.relatedEntityType === 'opportunity') {
    return (
      dataset.opportunities.find((item) => item.id === evidence.relatedEntityId)
        ?.engagementId === engagementId
    );
  }

  return (
    dataset.outputs.find((item) => item.id === evidence.relatedEntityId)
      ?.engagementId === engagementId
  );
}

function buildOutstandingActions(
  dataset: FabricDataset,
  opportunities: Opportunity[],
  initiatives: Initiative[],
): EngagementOutstandingAction[] {
  const opportunityIds = new Set(opportunities.map((item) => item.id));
  const initiativeIds = new Set(initiatives.map((item) => item.id));

  return [
    ...dataset.actionItems.flatMap((action) => {
      if (
        action.status === 'completed' ||
        ((!action.opportunityId || !opportunityIds.has(action.opportunityId)) &&
          (!action.initiativeId || !initiativeIds.has(action.initiativeId)))
      ) {
        return [];
      }

      return [
        {
          id: action.id,
          title: action.title,
          status: action.status,
          source: 'action-item' as const,
          dueAt: action.dueDate,
        },
      ];
    }),
    ...dataset.deliveryActions.flatMap((action) => {
      if (
        action.status === 'completed' ||
        !initiativeIds.has(action.initiativeId)
      ) {
        return [];
      }
      return [
        {
          id: action.id,
          title: action.title,
          status: action.status,
          source: 'delivery-action' as const,
          dueAt: action.dueDate,
        },
      ];
    }),
    ...dataset.milestones.flatMap((milestone) => {
      if (
        milestone.status === 'complete' ||
        !initiativeIds.has(milestone.initiativeId)
      ) {
        return [];
      }
      return [
        {
          id: milestone.id,
          title: milestone.title,
          status: milestone.status,
          source: 'milestone' as const,
          dueAt: milestone.dueDate,
        },
      ];
    }),
  ].sort((left, right) =>
    (left.dueAt ?? '9999-12-31T23:59:59Z').localeCompare(
      right.dueAt ?? '9999-12-31T23:59:59Z',
    ),
  );
}

export function buildEngagementContext(
  dataset: FabricDataset,
  engagementId: EntityId,
  options: EngagementContextOptions = {},
): EngagementContext | undefined {
  const engagement = dataset.engagements.find(
    (item) => item.id === engagementId,
  );
  if (!engagement) {
    return undefined;
  }

  const audience = options.audience ?? 'internal';
  const siteIds = new Set(engagement.siteIds);
  const sites = dataset.sites.filter((item) => siteIds.has(item.id));
  const areas = dataset.areas.filter((item) => siteIds.has(item.siteId));
  const processes = dataset.processes.filter((item) =>
    siteIds.has(item.siteId),
  );
  const systems = dataset.systems.filter((item) => siteIds.has(item.siteId));
  const siteWalks = dataset.siteWalks.filter(
    (item) => item.engagementId === engagement.id,
  );
  const siteWalkIds = new Set(siteWalks.map((item) => item.id));
  const observations = dataset.observations.filter((item) =>
    siteWalkIds.has(item.siteWalkId),
  );
  const diagnosticIds = new Set(
    dataset.diagnostics
      .filter((item) => item.engagementId === engagement.id)
      .map((item) => item.id),
  );
  const diagnostics = dataset.diagnostics.filter((item) =>
    diagnosticIds.has(item.id),
  );
  const opportunities = dataset.opportunities.filter(
    (item) => item.engagementId === engagement.id,
  );
  const initiatives = dataset.initiatives.filter(
    (item) => item.engagementId === engagement.id,
  );
  const evidence = dataset.evidence.filter((item) =>
    evidenceBelongsToEngagement(dataset, item, engagement.id),
  );
  const maturityAssessments = dataset.maturityAssessments.filter((item) =>
    diagnosticIds.has(item.diagnosticId),
  );
  const findings = dataset.findings.filter((item) =>
    diagnosticIds.has(item.diagnosticId),
  );
  const landscapeEntities = dataset.landscapeEntities.filter(
    (item) => item.engagementId === engagement.id,
  );
  const landscapeRelationships = dataset.landscapeRelationships.filter(
    (item) => item.engagementId === engagement.id,
  );
  const landscapeVersions = dataset.landscapeVersions.filter(
    (item) => item.engagementId === engagement.id,
  );
  const outputs = dataset.outputs.filter(
    (item) => item.engagementId === engagement.id,
  );
  const activityHistory = dataset.activityEvents
    .filter((item) => item.engagementId === engagement.id)
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
  const methodologyRuns = dataset.engagementMethodologyRuns.filter(
    (item) => item.engagementId === engagement.id,
  );
  const activeRun = methodologyRuns.find(
    (item) => item.status === 'active' || item.status === 'paused',
  );
  const canPerform = (permission: WorkspacePermission) =>
    options.viewer
      ? canUserPerform(options.viewer, permission, { engagement })
      : false;

  return {
    access: {
      audience,
      canViewInternal: audience === 'internal',
      canPerform,
    },
    identity: {
      id: engagement.id,
      name: engagement.name,
      type: engagement.type,
      status: engagement.status,
      stage: engagement.stage,
    },
    internal:
      audience === 'internal'
        ? {
            engagement,
            client: dataset.clients
              .filter((item) => item.id === engagement.clientId)
              .map((item) => ({
                id: item.id,
                name: item.name,
                industry: item.industry,
                description: item.description,
                notes: item.notes,
              }))[0],
            sites,
            areas,
            processes,
            systems,
            dataObjects: landscapeEntities.filter(
              (item) => item.type === 'data-object',
            ),
            roles: landscapeEntities.filter((item) => item.type === 'role'),
            landscape: {
              entities: landscapeEntities,
              relationships: landscapeRelationships,
              versions: landscapeVersions,
            },
            siteWalks,
            observations,
            evidence,
            frictionItems: dataset.frictionItems.filter((item) =>
              siteWalkIds.has(item.siteWalkId),
            ),
            diagnostics,
            maturityAssessments,
            findings,
            opportunities,
            initiatives,
            outputs,
            outstandingActions: buildOutstandingActions(
              dataset,
              opportunities,
              initiatives,
            ),
            activityHistory,
            methodology: {
              activeRunId: activeRun?.id,
              runs: methodologyRuns.map((run) => ({
                id: run.id,
                templateId: run.templateId,
                templateName: run.templateName,
                templateVersion: run.templateVersion,
                status: run.status,
                progress: buildMethodologyRunProgress(dataset, run.id),
              })),
            },
          }
        : undefined,
    approvedClientFacing: {
      client: dataset.clients
        .filter((item) => item.id === engagement.clientId)
        .map((item) => ({
          id: item.id,
          name: item.name,
          industry: item.industry,
          description: item.description,
        }))[0],
      sites: sites.map((site) => ({
        id: site.id,
        name: site.name,
        location: site.location,
        description: site.description,
        operationalProfile: site.operationalProfile,
      })),
      processes: processes.map((process) => ({
        id: process.id,
        name: process.name,
        description: process.description,
      })),
      observations: observations
        .filter((item) => item.visibility === 'approved-client-facing')
        .map((item) => ({
          id: item.id,
          summary: item.summary,
          observedAt: item.observedAt,
        })),
      evidence: evidence
        .filter(
          (item) =>
            item.visibility === 'approved-client-facing' &&
            item.approvalState === 'approved' &&
            item.reviewStatus === 'verified',
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          capturedAt: item.capturedAt,
        })),
      maturityAssessments: maturityAssessments
        .filter((item) => item.reviewStatus === 'approved')
        .map((item) => ({
          id: item.id,
          score: item.score,
          level: item.level,
        })),
      findings: findings.flatMap((item) =>
        item.reviewStatus === 'approved' && item.clientSummary
          ? [
              {
                id: item.id,
                title: item.title,
                summary: item.clientSummary,
              },
            ]
          : [],
      ),
      opportunities: opportunities.flatMap((item) =>
        isOpportunityReadyForDelivery(item) && item.clientSummary
          ? [
              {
                id: item.id,
                title: item.title,
                summary: item.clientSummary,
                priority: item.priority,
              },
            ]
          : [],
      ),
      initiatives: initiatives
        .filter((item) => item.reviewStatus === 'approved')
        .map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.clientSummary,
          status: item.status,
        })),
      outputs: outputs
        .filter(
          (item) =>
            item.visibility === 'approved-client-facing' &&
            (item.status === 'approved' || item.status === 'published'),
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          outputType: item.outputType,
          status: item.status,
          version: item.version,
          publishedAt: item.publishedAt,
        })),
      landscape: buildApprovedLandscapeA3Projection(dataset, engagement.id),
    },
  };
}

/**
 * Limits the standard workspace view to engagements the current actor can access.
 * Production repositories must enforce the same boundary before returning data.
 */
export function createEngagementAccessProjection(
  dataset: FabricDataset,
  viewer: Pick<User, 'id' | 'role'>,
): FabricDataset {
  const engagements = dataset.engagements.filter((engagement) =>
    canUserAccessEngagement(viewer, engagement),
  );
  const engagementIds = new Set(engagements.map((engagement) => engagement.id));
  const clientIds = new Set(
    engagements.map((engagement) => engagement.clientId),
  );
  const siteIds = new Set(
    engagements.flatMap((engagement) => engagement.siteIds),
  );
  const sites = dataset.sites.filter((site) => siteIds.has(site.id));
  const areas = dataset.areas.filter((area) => siteIds.has(area.siteId));
  const processes = dataset.processes.filter((process) =>
    siteIds.has(process.siteId),
  );
  const systems = dataset.systems.filter((system) =>
    siteIds.has(system.siteId),
  );
  const siteWalks = dataset.siteWalks.filter((siteWalk) =>
    engagementIds.has(siteWalk.engagementId),
  );
  const siteWalkIds = new Set(siteWalks.map((siteWalk) => siteWalk.id));
  const observations = dataset.observations.filter((observation) =>
    siteWalkIds.has(observation.siteWalkId),
  );
  const diagnostics = dataset.diagnostics.filter((diagnostic) =>
    engagementIds.has(diagnostic.engagementId),
  );
  const diagnosticIds = new Set(diagnostics.map((diagnostic) => diagnostic.id));
  const opportunities = dataset.opportunities.filter((opportunity) =>
    engagementIds.has(opportunity.engagementId),
  );
  const opportunityIds = new Set(
    opportunities.map((opportunity) => opportunity.id),
  );
  const initiatives = dataset.initiatives.filter((initiative) =>
    engagementIds.has(initiative.engagementId),
  );
  const initiativeIds = new Set(initiatives.map((initiative) => initiative.id));
  const outputs = dataset.outputs.filter((output) =>
    engagementIds.has(output.engagementId),
  );
  const outputIds = new Set(outputs.map((output) => output.id));
  const methodologyRuns = dataset.engagementMethodologyRuns.filter((run) =>
    engagementIds.has(run.engagementId),
  );
  const methodologyRunIds = new Set(methodologyRuns.map((run) => run.id));

  return {
    ...dataset,
    clients: dataset.clients.filter((client) => clientIds.has(client.id)),
    sites,
    areas,
    processes,
    systems,
    engagements,
    siteWalks,
    observations,
    evidence: dataset.evidence.filter((evidence) =>
      [...engagementIds].some((engagementId) =>
        evidenceBelongsToEngagement(dataset, evidence, engagementId),
      ),
    ),
    frictionItems: dataset.frictionItems.filter((frictionItem) =>
      siteWalkIds.has(frictionItem.siteWalkId),
    ),
    diagnostics,
    maturityAssessments: dataset.maturityAssessments.filter((assessment) =>
      diagnosticIds.has(assessment.diagnosticId),
    ),
    findings: dataset.findings.filter((finding) =>
      diagnosticIds.has(finding.diagnosticId),
    ),
    landscapeEntities: dataset.landscapeEntities.filter((entity) =>
      engagementIds.has(entity.engagementId),
    ),
    landscapeRelationships: dataset.landscapeRelationships.filter(
      (relationship) => engagementIds.has(relationship.engagementId),
    ),
    landscapeVersions: dataset.landscapeVersions.filter((version) =>
      engagementIds.has(version.engagementId),
    ),
    opportunities,
    actionItems: dataset.actionItems.filter(
      (action) =>
        (action.opportunityId && opportunityIds.has(action.opportunityId)) ||
        (action.initiativeId && initiativeIds.has(action.initiativeId)),
    ),
    initiatives,
    roadmaps: dataset.roadmaps.filter((roadmap) =>
      engagementIds.has(roadmap.engagementId),
    ),
    milestones: dataset.milestones.filter((milestone) =>
      initiativeIds.has(milestone.initiativeId),
    ),
    deliveryActions: dataset.deliveryActions.filter((action) =>
      initiativeIds.has(action.initiativeId),
    ),
    benefitMeasurements: dataset.benefitMeasurements.filter((measurement) =>
      initiativeIds.has(measurement.initiativeId),
    ),
    outputs,
    outputReviewComments: dataset.outputReviewComments.filter((comment) =>
      outputIds.has(comment.outputId),
    ),
    outputExports: dataset.outputExports.filter((exportReference) =>
      outputIds.has(exportReference.outputId),
    ),
    engagementMethodologyRuns: methodologyRuns,
    engagementMethodologyActivities:
      dataset.engagementMethodologyActivities.filter((activity) =>
        methodologyRunIds.has(activity.runId),
      ),
    activityEvents: dataset.activityEvents.filter(
      (activityEvent) =>
        activityEvent.engagementId !== undefined &&
        engagementIds.has(activityEvent.engagementId),
    ),
  };
}

/**
 * Narrows an already-authorised dataset to the selected engagement without
 * changing the richer underlying records. The workbench can therefore stay
 * context-first without duplicating or flattening the analytical model.
 */
export function createEngagementWorkspaceProjection(
  dataset: FabricDataset,
  engagementId: EntityId,
): FabricDataset | undefined {
  const engagement = dataset.engagements.find(
    (item) => item.id === engagementId,
  );
  if (!engagement) {
    return undefined;
  }

  const siteIds = new Set(engagement.siteIds);
  const siteWalks = dataset.siteWalks.filter(
    (siteWalk) => siteWalk.engagementId === engagement.id,
  );
  const siteWalkIds = new Set(siteWalks.map((siteWalk) => siteWalk.id));
  const observations = dataset.observations.filter((observation) =>
    siteWalkIds.has(observation.siteWalkId),
  );
  const diagnostics = dataset.diagnostics.filter(
    (diagnostic) => diagnostic.engagementId === engagement.id,
  );
  const diagnosticIds = new Set(diagnostics.map((diagnostic) => diagnostic.id));
  const opportunities = dataset.opportunities.filter(
    (opportunity) => opportunity.engagementId === engagement.id,
  );
  const opportunityIds = new Set(
    opportunities.map((opportunity) => opportunity.id),
  );
  const initiatives = dataset.initiatives.filter(
    (initiative) => initiative.engagementId === engagement.id,
  );
  const initiativeIds = new Set(initiatives.map((initiative) => initiative.id));
  const outputs = dataset.outputs.filter(
    (output) => output.engagementId === engagement.id,
  );
  const outputIds = new Set(outputs.map((output) => output.id));
  const methodologyRuns = dataset.engagementMethodologyRuns.filter(
    (run) => run.engagementId === engagement.id,
  );
  const methodologyRunIds = new Set(methodologyRuns.map((run) => run.id));

  return {
    ...dataset,
    clients: dataset.clients.filter(
      (client) => client.id === engagement.clientId,
    ),
    sites: dataset.sites.filter((site) => siteIds.has(site.id)),
    areas: dataset.areas.filter((area) => siteIds.has(area.siteId)),
    processes: dataset.processes.filter((process) =>
      siteIds.has(process.siteId),
    ),
    systems: dataset.systems.filter((system) => siteIds.has(system.siteId)),
    engagements: [engagement],
    siteWalks,
    observations,
    evidence: dataset.evidence.filter((evidence) =>
      evidenceBelongsToEngagement(dataset, evidence, engagement.id),
    ),
    frictionItems: dataset.frictionItems.filter((frictionItem) =>
      siteWalkIds.has(frictionItem.siteWalkId),
    ),
    diagnostics,
    maturityAssessments: dataset.maturityAssessments.filter((assessment) =>
      diagnosticIds.has(assessment.diagnosticId),
    ),
    findings: dataset.findings.filter((finding) =>
      diagnosticIds.has(finding.diagnosticId),
    ),
    landscapeEntities: dataset.landscapeEntities.filter(
      (entity) => entity.engagementId === engagement.id,
    ),
    landscapeRelationships: dataset.landscapeRelationships.filter(
      (relationship) => relationship.engagementId === engagement.id,
    ),
    landscapeVersions: dataset.landscapeVersions.filter(
      (version) => version.engagementId === engagement.id,
    ),
    opportunities,
    actionItems: dataset.actionItems.filter(
      (action) =>
        (action.opportunityId && opportunityIds.has(action.opportunityId)) ||
        (action.initiativeId && initiativeIds.has(action.initiativeId)),
    ),
    initiatives,
    roadmaps: dataset.roadmaps.filter(
      (roadmap) => roadmap.engagementId === engagement.id,
    ),
    milestones: dataset.milestones.filter((milestone) =>
      initiativeIds.has(milestone.initiativeId),
    ),
    deliveryActions: dataset.deliveryActions.filter((action) =>
      initiativeIds.has(action.initiativeId),
    ),
    benefitMeasurements: dataset.benefitMeasurements.filter((measurement) =>
      initiativeIds.has(measurement.initiativeId),
    ),
    outputs,
    outputReviewComments: dataset.outputReviewComments.filter((comment) =>
      outputIds.has(comment.outputId),
    ),
    outputExports: dataset.outputExports.filter((exportReference) =>
      outputIds.has(exportReference.outputId),
    ),
    engagementMethodologyRuns: methodologyRuns,
    engagementMethodologyActivities:
      dataset.engagementMethodologyActivities.filter((activity) =>
        methodologyRunIds.has(activity.runId),
      ),
    activityEvents: dataset.activityEvents.filter(
      (activityEvent) => activityEvent.engagementId === engagement.id,
    ),
  };
}
