import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import type {
  ActivityAction,
  ActivityEntityType,
  ActivityEvent,
  BaseEntity,
  Client,
  Diagnostic,
  Engagement,
  EngagementMethodologyActivity,
  EngagementMethodologyRun,
  EntityId,
  Evidence,
  FabricDataset,
  FabricRepository,
  FrictionItem,
  Observation,
  MaturityAssessment,
  MethodologyActivity,
  ActionItem,
  Area,
  BenefitMeasurement,
  DeliveryAction,
  Initiative,
  KnowledgeEntry,
  LandscapeEntity,
  LandscapeRelationship,
  LandscapeVersion,
  Milestone,
  OperationalSystem,
  Process,
  Roadmap,
  Opportunity,
  Output,
  OutputExportAudience,
  OutputExportFormat,
  OutputExportReference,
  OutputReport,
  OutputReviewComment,
  RepositorySource,
  Site,
  SiteWalk,
  User,
  VisibilityScope,
  WorkspacePermission,
} from '@domain';
import {
  assertUserCanPerformAcrossEngagements,
  canUserPerform,
  createEngagementAccessProjection,
  createEngagementWorkspaceProjection,
  createMethodologyRun,
  createLandscapeVersionSnapshot,
  createOutputReportSnapshot,
  getOutputReportFileName,
  getOutputTemplate,
  isOutputReportClientReady,
  isOpportunityReadyForDelivery,
  nextOutputVersion,
  permissionForVisibilityTransition,
  prepareOutputExportSnapshot,
  preparePreliminarySiteWalkPromotion,
  prepareControlledOutputUpdate,
  prepareControlledOpportunityUpdate,
  prepareKnowledgeEntryUpdate,
  synchroniseMethodologyRun,
  resolveOutputReport,
} from '@domain';
import {
  createAuthorizationActor,
  createImmutableSnapshot,
} from './immutable-snapshot';

interface FabricDataContextValue {
  dataset: FabricDataset | null;
  activeDataset: FabricDataset | null;
  activeEngagementId: EntityId | null;
  activeEngagement: Engagement | null;
  activeClient: Client | null;
  activeSites: Site[];
  error: string | null;
  isLoading: boolean;
  currentUser: User | null;
  setCurrentUserId: (userId: EntityId) => void;
  setActiveEngagementId: (engagementId: EntityId | null) => void;
  canPerform: (
    permission: WorkspacePermission,
    engagementId?: EntityId,
  ) => boolean;
  refresh: () => Promise<void>;
  createClient: (
    input: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Client>;
  updateClient: (client: Client) => Promise<void>;
  createSite: (
    input: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Site>;
  updateSite: (site: Site) => Promise<void>;
  createEngagement: (input: CreateEngagementInput) => Promise<Engagement>;
  updateEngagement: (engagement: Engagement) => Promise<void>;
  completeMethodologyActivity: (
    activityId: EntityId,
    completionNote?: string,
  ) => Promise<void>;
  skipMethodologyActivity: (
    activityId: EntityId,
    reason: string,
  ) => Promise<void>;
  reopenMethodologyActivity: (
    activityId: EntityId,
    reason: string,
  ) => Promise<void>;
  pauseMethodologyRun: (runId: EntityId, reason: string) => Promise<void>;
  resumeMethodologyRun: (runId: EntityId) => Promise<void>;
  promotePreliminarySiteWalk: (siteWalkId: EntityId) => Promise<Engagement>;
  createSiteWalk: (
    input: Omit<SiteWalk, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<SiteWalk>;
  updateSiteWalk: (walk: SiteWalk) => Promise<void>;
  createObservation: (
    input: Omit<Observation, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Observation>;
  updateObservation: (observation: Observation) => Promise<void>;
  createEvidence: (
    input: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Evidence>;
  createFrictionItem: (
    input: Omit<FrictionItem, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<FrictionItem>;
  updateFrictionItem: (item: FrictionItem) => Promise<void>;
  createDiagnostic: (
    input: Omit<Diagnostic, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Diagnostic>;
  updateDiagnostic: (diagnostic: Diagnostic) => Promise<void>;
  saveMaturityAssessment: (assessment: MaturityAssessment) => Promise<void>;
  createOpportunity: (
    input: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Opportunity>;
  updateOpportunity: (opportunity: Opportunity) => Promise<Opportunity>;
  createAction: (
    input: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<ActionItem>;
  updateAction: (action: ActionItem) => Promise<void>;
  createInitiative: (
    input: Omit<Initiative, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Initiative>;
  updateInitiative: (initiative: Initiative) => Promise<void>;
  createMilestone: (
    input: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Milestone>;
  updateMilestone: (milestone: Milestone) => Promise<void>;
  createDeliveryAction: (
    input: Omit<DeliveryAction, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<DeliveryAction>;
  updateDeliveryAction: (action: DeliveryAction) => Promise<void>;
  createBenefitMeasurement: (
    input: Omit<BenefitMeasurement, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<BenefitMeasurement>;
  updateBenefitMeasurement: (measurement: BenefitMeasurement) => Promise<void>;
  createRoadmap: (
    input: Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Roadmap>;
  updateRoadmap: (roadmap: Roadmap) => Promise<void>;
  createOutput: (input: CreateOutputInput) => Promise<Output>;
  updateOutput: (output: Output) => Promise<void>;
  regenerateOutputReport: (outputId: EntityId) => Promise<Output>;
  createOutputRevision: (outputId: EntityId) => Promise<Output>;
  createOutputReviewComment: (
    input: CreateOutputReviewCommentInput,
  ) => Promise<OutputReviewComment>;
  resolveOutputReviewComment: (commentId: EntityId) => Promise<void>;
  recordOutputExport: (
    outputId: EntityId,
    format: OutputExportFormat,
    audience: OutputExportAudience,
  ) => Promise<OutputExportResult>;
  createKnowledgeEntry: (
    input: CreateKnowledgeEntryInput,
  ) => Promise<KnowledgeEntry>;
  updateKnowledgeEntry: (entry: KnowledgeEntry) => Promise<KnowledgeEntry>;
  createLandscapeEntity: (
    input: CreateLandscapeEntityInput,
  ) => Promise<LandscapeEntity>;
  updateLandscapeEntity: (entity: LandscapeEntity) => Promise<void>;
  createLandscapeRelationship: (
    input: CreateLandscapeRelationshipInput,
  ) => Promise<LandscapeRelationship>;
  updateLandscapeRelationship: (
    relationship: LandscapeRelationship,
  ) => Promise<void>;
  captureLandscapeVersion: (
    engagementId: EntityId,
    input: CaptureLandscapeVersionInput,
  ) => Promise<LandscapeVersion>;
  repositorySource: RepositorySource;
}

const FabricDataContext = createContext<FabricDataContextValue | undefined>(
  undefined,
);

function activeEngagementStorageKey(userId: EntityId) {
  return `trion-fabric:active-engagement:${userId}`;
}

interface FabricDataProviderProps {
  children: ReactNode;
  repository: FabricRepository;
}

export interface CreateEngagementInput
  extends Omit<Engagement, 'id' | 'createdAt' | 'updatedAt'> {
  methodologyTemplateId?: EntityId;
}

export interface CreateOutputInput {
  engagementId: EntityId;
  outputType: Output['outputType'];
  title: string;
  sourceReferences: EntityId[];
}

export interface CreateOutputReviewCommentInput {
  outputId: EntityId;
  body: string;
}

export interface OutputExportResult {
  exportReference: OutputExportReference;
  report: OutputReport;
}

export interface CreateLandscapeEntityInput
  extends Omit<
    LandscapeEntity,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'sourceEntityId'
    | 'visibility'
    | 'reviewStatus'
  > {
  sourceEntityId?: EntityId;
  canonicalAreaId?: EntityId;
  relatedSystemIds?: EntityId[];
  systemCategory?: string;
  systemOwnerTeam?: string;
}

export type CreateLandscapeRelationshipInput = Omit<
  LandscapeRelationship,
  'id' | 'createdAt' | 'updatedAt' | 'visibility' | 'reviewStatus'
>;

export interface CaptureLandscapeVersionInput {
  title: string;
  siteId?: EntityId;
  notes?: string;
}

export type CreateKnowledgeEntryInput = Omit<
  KnowledgeEntry,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'status'
  | 'visibility'
  | 'createdByUserId'
  | 'reviewedByUserId'
  | 'reviewedAt'
>;

type ActivityCollection =
  | 'clients'
  | 'sites'
  | 'engagements'
  | 'siteWalks'
  | 'observations'
  | 'evidence'
  | 'frictionItems'
  | 'diagnostics'
  | 'maturityAssessments'
  | 'findings'
  | 'landscapeEntities'
  | 'landscapeRelationships'
  | 'landscapeVersions'
  | 'opportunities'
  | 'actionItems'
  | 'initiatives'
  | 'roadmaps'
  | 'milestones'
  | 'deliveryActions'
  | 'benefitMeasurements'
  | 'outputs'
  | 'outputReviewComments'
  | 'outputExports'
  | 'knowledgeEntries'
  | 'engagementMethodologyRuns'
  | 'engagementMethodologyActivities';

interface ActivityTrackedRecord extends BaseEntity {
  approvalState?: string;
  status?: string;
  visibility?: VisibilityScope;
  reviewStatus?: string;
  ownerUserId?: EntityId;
  title?: string;
  name?: string;
  summary?: string;
  type?: string;
  engagementId?: EntityId;
  templateId?: EntityId;
  templateName?: string;
  reopenedAt?: string;
  reportSnapshot?: Output['reportSnapshot'];
}

interface DatasetChange {
  collection: ActivityCollection;
  previous?: ActivityTrackedRecord;
  next?: ActivityTrackedRecord;
}

interface MethodologyActivityStateUpdate {
  state: EngagementMethodologyActivity;
  activity: MethodologyActivity;
  run: EngagementMethodologyRun;
  actorUserId: EntityId;
  occurredAt: string;
}

const activityCollections: ActivityCollection[] = [
  'clients',
  'sites',
  'engagements',
  'siteWalks',
  'observations',
  'evidence',
  'frictionItems',
  'diagnostics',
  'maturityAssessments',
  'findings',
  'landscapeEntities',
  'landscapeRelationships',
  'landscapeVersions',
  'opportunities',
  'actionItems',
  'initiatives',
  'roadmaps',
  'milestones',
  'deliveryActions',
  'benefitMeasurements',
  'outputs',
  'outputReviewComments',
  'outputExports',
  'knowledgeEntries',
  'engagementMethodologyRuns',
  'engagementMethodologyActivities',
];

const activityEntityTypesByCollection: Record<
  ActivityCollection,
  ActivityEntityType
> = {
  clients: 'client',
  sites: 'site',
  engagements: 'engagement',
  siteWalks: 'site-walk',
  observations: 'observation',
  evidence: 'evidence',
  frictionItems: 'friction-item',
  diagnostics: 'diagnostic',
  maturityAssessments: 'assessment',
  findings: 'finding',
  landscapeEntities: 'landscape-entity',
  landscapeRelationships: 'landscape-relationship',
  landscapeVersions: 'landscape-version',
  opportunities: 'opportunity',
  actionItems: 'action',
  initiatives: 'initiative',
  roadmaps: 'roadmap',
  milestones: 'milestone',
  deliveryActions: 'delivery-action',
  benefitMeasurements: 'benefit-measurement',
  outputs: 'output',
  outputReviewComments: 'output-review-comment',
  outputExports: 'output-export',
  knowledgeEntries: 'knowledge-entry',
  engagementMethodologyRuns: 'methodology-run',
  engagementMethodologyActivities: 'methodology-activity',
};

function recordsFor(
  dataset: FabricDataset,
  collection: ActivityCollection,
): ActivityTrackedRecord[] {
  switch (collection) {
    case 'clients':
      return dataset.clients;
    case 'sites':
      return dataset.sites;
    case 'engagements':
      return dataset.engagements;
    case 'siteWalks':
      return dataset.siteWalks;
    case 'observations':
      return dataset.observations;
    case 'evidence':
      return dataset.evidence;
    case 'frictionItems':
      return dataset.frictionItems;
    case 'diagnostics':
      return dataset.diagnostics;
    case 'maturityAssessments':
      return dataset.maturityAssessments;
    case 'findings':
      return dataset.findings;
    case 'landscapeEntities':
      return dataset.landscapeEntities;
    case 'landscapeRelationships':
      return dataset.landscapeRelationships;
    case 'landscapeVersions':
      return dataset.landscapeVersions;
    case 'opportunities':
      return dataset.opportunities;
    case 'actionItems':
      return dataset.actionItems;
    case 'initiatives':
      return dataset.initiatives;
    case 'roadmaps':
      return dataset.roadmaps;
    case 'milestones':
      return dataset.milestones;
    case 'deliveryActions':
      return dataset.deliveryActions;
    case 'benefitMeasurements':
      return dataset.benefitMeasurements;
    case 'outputs':
      return dataset.outputs;
    case 'outputReviewComments':
      return dataset.outputReviewComments;
    case 'outputExports':
      return dataset.outputExports;
    case 'knowledgeEntries':
      return dataset.knowledgeEntries;
    case 'engagementMethodologyRuns':
      return dataset.engagementMethodologyRuns;
    case 'engagementMethodologyActivities':
      return dataset.engagementMethodologyActivities;
  }
}

function recordsMatch(
  previous: ActivityTrackedRecord,
  next: ActivityTrackedRecord,
) {
  return (
    JSON.stringify({ ...previous, updatedAt: undefined }) ===
    JSON.stringify({ ...next, updatedAt: undefined })
  );
}

function getDatasetChanges(
  previousDataset: FabricDataset,
  nextDataset: FabricDataset,
) {
  const changes: DatasetChange[] = [];

  activityCollections.forEach((collection) => {
    const previousById = new Map(
      recordsFor(previousDataset, collection).map((record) => [
        record.id,
        record,
      ]),
    );
    const nextById = new Map(
      recordsFor(nextDataset, collection).map((record) => [record.id, record]),
    );
    const ids = new Set([...previousById.keys(), ...nextById.keys()]);

    ids.forEach((id) => {
      const previous = previousById.get(id);
      const next = nextById.get(id);

      if (!previous || !next || !recordsMatch(previous, next)) {
        changes.push({ collection, previous, next });
      }
    });
  });

  return changes;
}

function changedFieldNames(
  previous: ActivityTrackedRecord | undefined,
  next: ActivityTrackedRecord | undefined,
) {
  if (!previous || !next) {
    return [];
  }

  const previousValues = new Map(Object.entries(previous));

  return Object.entries(next)
    .filter(
      ([field, value]) =>
        field !== 'updatedAt' &&
        JSON.stringify(value) !== JSON.stringify(previousValues.get(field)),
    )
    .map(([field]) => field)
    .sort();
}

function getEngagementIdForChange(
  dataset: FabricDataset,
  change: DatasetChange,
) {
  const record = change.next ?? change.previous;
  if (!record) {
    return undefined;
  }

  const findDiagnosticEngagementId = (diagnosticId: EntityId) =>
    dataset.diagnostics.find((item) => item.id === diagnosticId)?.engagementId;
  const findSiteWalkEngagementId = (siteWalkId: EntityId) =>
    dataset.siteWalks.find((item) => item.id === siteWalkId)?.engagementId;
  const findInitiativeEngagementId = (initiativeId: EntityId) =>
    dataset.initiatives.find((item) => item.id === initiativeId)?.engagementId;

  switch (change.collection) {
    case 'engagements':
      return record.id;
    case 'siteWalks':
      return findSiteWalkEngagementId(record.id);
    case 'observations': {
      const siteWalkId = dataset.observations.find(
        (item) => item.id === record.id,
      )?.siteWalkId;
      return siteWalkId ? findSiteWalkEngagementId(siteWalkId) : undefined;
    }
    case 'evidence': {
      const evidenceItem = dataset.evidence.find(
        (item) => item.id === record.id,
      );
      if (evidenceItem?.siteWalkId) {
        return findSiteWalkEngagementId(evidenceItem.siteWalkId);
      }
      if (evidenceItem?.observationId) {
        const siteWalkId = dataset.observations.find(
          (item) => item.id === evidenceItem.observationId,
        )?.siteWalkId;
        return siteWalkId ? findSiteWalkEngagementId(siteWalkId) : undefined;
      }
      if (evidenceItem?.relatedEntityType === 'engagement') {
        return evidenceItem.relatedEntityId;
      }
      if (evidenceItem?.relatedEntityType === 'site-walk') {
        return findSiteWalkEngagementId(evidenceItem.relatedEntityId);
      }
      if (evidenceItem?.relatedEntityType === 'observation') {
        const siteWalkId = dataset.observations.find(
          (item) => item.id === evidenceItem.relatedEntityId,
        )?.siteWalkId;
        return siteWalkId ? findSiteWalkEngagementId(siteWalkId) : undefined;
      }
      if (evidenceItem?.relatedEntityType === 'opportunity') {
        return dataset.opportunities.find(
          (item) => item.id === evidenceItem.relatedEntityId,
        )?.engagementId;
      }
      return dataset.outputs.find(
        (item) => item.id === evidenceItem?.relatedEntityId,
      )?.engagementId;
    }
    case 'frictionItems': {
      const siteWalkId = dataset.frictionItems.find(
        (item) => item.id === record.id,
      )?.siteWalkId;
      return siteWalkId ? findSiteWalkEngagementId(siteWalkId) : undefined;
    }
    case 'diagnostics':
      return findDiagnosticEngagementId(record.id);
    case 'maturityAssessments': {
      const diagnosticId = dataset.maturityAssessments.find(
        (item) => item.id === record.id,
      )?.diagnosticId;
      return diagnosticId
        ? findDiagnosticEngagementId(diagnosticId)
        : undefined;
    }
    case 'findings': {
      const diagnosticId = dataset.findings.find(
        (item) => item.id === record.id,
      )?.diagnosticId;
      return diagnosticId
        ? findDiagnosticEngagementId(diagnosticId)
        : undefined;
    }
    case 'landscapeEntities':
      return dataset.landscapeEntities.find((item) => item.id === record.id)
        ?.engagementId;
    case 'landscapeRelationships':
      return dataset.landscapeRelationships.find(
        (item) => item.id === record.id,
      )?.engagementId;
    case 'landscapeVersions':
      return dataset.landscapeVersions.find((item) => item.id === record.id)
        ?.engagementId;
    case 'opportunities':
      return dataset.opportunities.find((item) => item.id === record.id)
        ?.engagementId;
    case 'actionItems': {
      const action = dataset.actionItems.find((item) => item.id === record.id);
      if (action?.opportunityId) {
        return dataset.opportunities.find(
          (item) => item.id === action.opportunityId,
        )?.engagementId;
      }
      return action?.initiativeId
        ? findInitiativeEngagementId(action.initiativeId)
        : undefined;
    }
    case 'initiatives':
      return findInitiativeEngagementId(record.id);
    case 'roadmaps':
      return dataset.roadmaps.find((item) => item.id === record.id)
        ?.engagementId;
    case 'milestones': {
      const initiativeId = dataset.milestones.find(
        (item) => item.id === record.id,
      )?.initiativeId;
      return initiativeId
        ? findInitiativeEngagementId(initiativeId)
        : undefined;
    }
    case 'deliveryActions': {
      const initiativeId = dataset.deliveryActions.find(
        (item) => item.id === record.id,
      )?.initiativeId;
      return initiativeId
        ? findInitiativeEngagementId(initiativeId)
        : undefined;
    }
    case 'benefitMeasurements': {
      const initiativeId = dataset.benefitMeasurements.find(
        (item) => item.id === record.id,
      )?.initiativeId;
      return initiativeId
        ? findInitiativeEngagementId(initiativeId)
        : undefined;
    }
    case 'outputs':
      return dataset.outputs.find((item) => item.id === record.id)
        ?.engagementId;
    case 'outputReviewComments': {
      const outputId = dataset.outputReviewComments.find(
        (item) => item.id === record.id,
      )?.outputId;
      return outputId
        ? dataset.outputs.find((item) => item.id === outputId)?.engagementId
        : undefined;
    }
    case 'outputExports': {
      const outputId = dataset.outputExports.find(
        (item) => item.id === record.id,
      )?.outputId;
      return outputId
        ? dataset.outputs.find((item) => item.id === outputId)?.engagementId
        : undefined;
    }
    case 'knowledgeEntries':
      return undefined;
    case 'engagementMethodologyRuns':
      return dataset.engagementMethodologyRuns.find(
        (item) => item.id === record.id,
      )?.engagementId;
    case 'engagementMethodologyActivities': {
      const runId = dataset.engagementMethodologyActivities.find(
        (item) => item.id === record.id,
      )?.runId;
      return runId
        ? dataset.engagementMethodologyRuns.find((item) => item.id === runId)
            ?.engagementId
        : undefined;
    }
    case 'clients':
    case 'sites':
      return undefined;
  }
}

function permissionForChange(change: DatasetChange): WorkspacePermission {
  if (change.collection === 'outputReviewComments') {
    return 'output:comment';
  }

  if (change.collection === 'outputExports') {
    return 'output:export';
  }

  if (change.collection === 'outputs') {
    const previousStatus = change.previous?.status;
    const nextStatus = change.next?.status;

    if (previousStatus !== nextStatus && nextStatus === 'internal-review') {
      return 'output:submit-for-review';
    }
    if (previousStatus !== nextStatus && nextStatus === 'approved') {
      return 'output:approve';
    }
    if (previousStatus !== nextStatus && nextStatus === 'published') {
      return 'output:publish';
    }
    if (previousStatus !== nextStatus && nextStatus === 'archived') {
      return 'output:archive';
    }
    return 'output:write';
  }

  if (change.collection === 'knowledgeEntries') {
    if (
      change.previous?.status !== change.next?.status &&
      change.next?.status === 'approved'
    ) {
      return 'knowledge:approve';
    }
    return 'knowledge:write';
  }

  if (
    change.collection === 'opportunities' &&
    change.previous &&
    change.next?.approvalState === 'approved' &&
    change.next?.reviewStatus === 'approved' &&
    (change.previous?.approvalState !== 'approved' ||
      change.previous?.reviewStatus !== 'approved')
  ) {
    return 'visibility:approve-client-facing';
  }

  if (change.collection === 'clients' || change.collection === 'sites') {
    return 'context:write';
  }

  if (change.collection === 'engagementMethodologyRuns') {
    if (
      !change.previous ||
      change.previous.templateId !== change.next?.templateId ||
      change.previous.engagementId !== change.next?.engagementId
    ) {
      return 'context:write';
    }
    if (
      (change.previous.status === 'paused' &&
        change.next?.status === 'active') ||
      change.next?.status === 'paused' ||
      change.next?.status === 'promoted'
    ) {
      return 'context:write';
    }
    return 'methodology:write';
  }

  if (change.collection === 'engagementMethodologyActivities') {
    return 'methodology:write';
  }

  if (
    change.collection === 'siteWalks' ||
    change.collection === 'observations' ||
    change.collection === 'evidence' ||
    change.collection === 'frictionItems'
  ) {
    return 'fieldwork:write';
  }

  if (
    change.collection === 'diagnostics' ||
    change.collection === 'maturityAssessments' ||
    change.collection === 'findings' ||
    change.collection === 'landscapeEntities' ||
    change.collection === 'landscapeRelationships' ||
    change.collection === 'landscapeVersions'
  ) {
    return 'diagnostic:write';
  }

  if (
    change.collection === 'opportunities' ||
    change.collection === 'actionItems'
  ) {
    return 'opportunity:write';
  }

  if (change.collection === 'engagements') {
    return 'context:write';
  }

  return 'delivery:write';
}

function activityActionForChange(change: DatasetChange): ActivityAction {
  const previous = change.previous;
  const next = change.next;

  if (!previous) {
    if (change.collection === 'outputReviewComments') {
      return 'commented';
    }
    if (change.collection === 'outputExports') {
      return 'exported';
    }
    return 'created';
  }

  if (!next || next.visibility === 'archived') {
    return 'archived';
  }

  if (previous.ownerUserId !== next.ownerUserId && next.ownerUserId) {
    return 'assigned';
  }

  if (
    change.collection === 'engagements' &&
    previous.type === 'Preliminary Site Walk' &&
    next.type === 'Digital Diagnostic'
  ) {
    return 'converted-from-preliminary-site-walk-to-diagnostic';
  }

  if (
    change.collection === 'engagementMethodologyActivities' &&
    previous.reopenedAt !== next.reopenedAt &&
    next.reopenedAt
  ) {
    return 'reopened';
  }

  if (previous.status !== next.status) {
    if (change.collection === 'engagementMethodologyRuns') {
      if (next.status === 'paused') {
        return 'paused';
      }
      if (previous.status === 'paused' && next.status === 'active') {
        return 'resumed';
      }
    }

    if (change.collection === 'engagementMethodologyActivities') {
      if (next.status === 'completed') {
        return 'completed';
      }
      if (next.status === 'skipped') {
        return 'skipped';
      }
    }

    if (change.collection === 'outputs') {
      if (next.status === 'internal-review') {
        return 'submitted-for-review';
      }
      if (next.status === 'approved') {
        return 'approved';
      }
      if (next.status === 'published') {
        return 'published';
      }
      if (next.status === 'archived') {
        return 'archived';
      }
    }

    if (
      change.collection === 'outputReviewComments' &&
      next.status === 'resolved'
    ) {
      return 'resolved';
    }

    if (change.collection === 'knowledgeEntries') {
      if (next.status === 'internal-review') {
        return 'submitted-for-review';
      }
      if (next.status === 'approved') {
        return 'approved';
      }
      if (next.status === 'retired') {
        return 'archived';
      }
    }

    if (
      change.collection === 'opportunities' &&
      next.status === 'approved' &&
      next.approvalState === 'approved' &&
      next.reviewStatus === 'approved'
    ) {
      return 'approved';
    }

    return 'status-changed';
  }

  if (
    change.collection === 'outputs' &&
    previous.reportSnapshot !== next.reportSnapshot
  ) {
    return 'regenerated';
  }

  return 'updated';
}

function createActivityEvent(
  change: DatasetChange,
  actorUserId: EntityId,
  engagementId: EntityId | undefined,
  occurredAt: string,
  index: number,
): ActivityEvent {
  const record = change.next ?? change.previous;
  if (!record) {
    throw new Error('An activity event requires an affected record.');
  }

  const action = activityActionForChange(change);
  const actionLabel = action.replace(/-/g, ' ');
  const recordLabel =
    record.title ??
    record.name ??
    record.summary ??
    (change.collection === 'engagementMethodologyRuns'
      ? (record.templateName ?? 'methodology run')
      : change.collection === 'engagementMethodologyActivities'
        ? 'methodology activity'
        : change.collection === 'outputReviewComments'
          ? 'output review comment'
          : change.collection === 'outputExports'
            ? 'output report export'
            : 'record');
  const changedFields = changedFieldNames(change.previous, change.next);
  const metadata: Record<string, string> = {
    collection: change.collection,
    action,
  };

  if (changedFields.length > 0) {
    metadata.changedFields = changedFields.join(', ');
  }
  if (change.previous?.status && change.previous.status !== record.status) {
    metadata.previousStatus = change.previous.status;
  }
  if (record.status) {
    metadata.status = record.status;
  }
  if (
    change.previous?.visibility &&
    change.previous.visibility !== record.visibility
  ) {
    metadata.previousVisibility = change.previous.visibility;
  }
  if (record.visibility) {
    metadata.visibility = record.visibility;
  }

  return {
    id: `activity-${Date.now()}-${index}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    createdAt: occurredAt,
    updatedAt: occurredAt,
    actorUserId,
    occurredAt,
    engagementId,
    entityId: record.id,
    entityType: activityEntityTypesByCollection[change.collection],
    action,
    summary: `${actionLabel.charAt(0).toUpperCase()}${actionLabel.slice(1)} ${recordLabel}.`,
    metadata,
  };
}

function replaceExistingRecord<T extends { id: string; updatedAt: string }>(
  records: T[],
  record: T,
  timestamp: string,
  entityName: string,
) {
  if (!records.some((item) => item.id === record.id)) {
    throw new Error(`The ${entityName} no longer exists.`);
  }

  return records.map((item) =>
    item.id === record.id ? { ...record, updatedAt: timestamp } : item,
  );
}

function assertInitiativeContext(
  dataset: FabricDataset,
  initiative: Pick<
    Initiative,
    'engagementId' | 'opportunityId' | 'ownerUserId'
  >,
) {
  const opportunity = dataset.opportunities.find(
    (item) => item.id === initiative.opportunityId,
  );

  if (
    !dataset.engagements.some((item) => item.id === initiative.engagementId)
  ) {
    throw new Error('Select a valid engagement for this initiative.');
  }

  if (!opportunity || opportunity.engagementId !== initiative.engagementId) {
    throw new Error('Select an opportunity from the same engagement.');
  }

  if (!isOpportunityReadyForDelivery(opportunity)) {
    throw new Error(
      'An initiative requires an approved client-facing, evidence-linked opportunity with a client-safe summary.',
    );
  }

  if (!dataset.users.some((item) => item.id === initiative.ownerUserId)) {
    throw new Error('Select a valid owner for this initiative.');
  }
}

function assertOpportunityApprovalCanBeRevoked(
  dataset: FabricDataset,
  existing: Opportunity,
  candidate: Opportunity,
) {
  if (
    !isOpportunityReadyForDelivery(existing) ||
    isOpportunityReadyForDelivery(candidate)
  ) {
    return;
  }

  const controlledOutput = dataset.outputs.find(
    (output) =>
      (output.status === 'approved' || output.status === 'published') &&
      output.sourceReferences.includes(existing.id),
  );
  if (controlledOutput) {
    throw new Error(
      `Create a new opportunity revision instead: "${existing.title}" is a source for the ${controlledOutput.status} output "${controlledOutput.title}".`,
    );
  }

  const initiative = dataset.initiatives.find(
    (item) => item.opportunityId === existing.id,
  );
  if (initiative) {
    throw new Error(
      `Create a new opportunity revision instead: "${existing.title}" is already linked to the delivery initiative "${initiative.title}".`,
    );
  }
}

function assertRoadmapContext(
  dataset: FabricDataset,
  roadmap: Pick<
    Roadmap,
    'engagementId' | 'diagnosticId' | 'initiativeIds' | 'phases'
  >,
  existingRoadmapId?: string,
) {
  if (!dataset.engagements.some((item) => item.id === roadmap.engagementId)) {
    throw new Error('Select a valid engagement for this roadmap.');
  }

  if (
    roadmap.diagnosticId &&
    dataset.diagnostics.find((item) => item.id === roadmap.diagnosticId)
      ?.engagementId !== roadmap.engagementId
  ) {
    throw new Error('Select a diagnostic from the same engagement.');
  }

  if (
    roadmap.initiativeIds.some(
      (initiativeId) =>
        dataset.initiatives.find((item) => item.id === initiativeId)
          ?.engagementId !== roadmap.engagementId,
    )
  ) {
    throw new Error(
      'Roadmaps can only sequence initiatives from the same engagement.',
    );
  }

  if (
    roadmap.initiativeIds.some((initiativeId) => {
      const initiative = dataset.initiatives.find(
        (item) => item.id === initiativeId,
      );
      return initiative ? !roadmap.phases.includes(initiative.phase) : false;
    })
  ) {
    throw new Error('Include each selected initiative phase in the roadmap.');
  }

  if (
    roadmap.initiativeIds.some((initiativeId) =>
      dataset.roadmaps.some(
        (existingRoadmap) =>
          existingRoadmap.id !== existingRoadmapId &&
          existingRoadmap.initiativeIds.includes(initiativeId),
      ),
    )
  ) {
    throw new Error('An initiative can only appear in one active roadmap.');
  }
}

export function FabricDataProvider({
  children,
  repository,
}: FabricDataProviderProps) {
  const [dataset, setDataset] = useState<FabricDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<EntityId | null>(null);
  const [activeEngagementId, setActiveEngagementIdState] =
    useState<EntityId | null>(null);
  const activeEngagementUserIdRef = useRef<EntityId | null>(null);
  const currentUser = dataset
    ? (dataset.users.find((user) => user.id === selectedUserId) ??
      dataset.users[0] ??
      null)
    : null;
  const actingUser = useMemo(
    () => (currentUser ? createAuthorizationActor(currentUser) : null),
    [currentUser],
  );
  const scopedDataset = useMemo(
    () =>
      dataset && actingUser
        ? createImmutableSnapshot(
            createEngagementAccessProjection(dataset, actingUser),
          )
        : null,
    [actingUser, dataset],
  );
  const activeEngagement = useMemo(
    () =>
      activeEngagementId
        ? (scopedDataset?.engagements.find(
            (engagement) => engagement.id === activeEngagementId,
          ) ?? null)
        : null,
    [activeEngagementId, scopedDataset],
  );
  const activeClient = useMemo(
    () =>
      activeEngagement
        ? (scopedDataset?.clients.find(
            (client) => client.id === activeEngagement.clientId,
          ) ?? null)
        : null,
    [activeEngagement, scopedDataset],
  );
  const activeSites = useMemo(
    () =>
      activeEngagement
        ? (scopedDataset?.sites.filter((site) =>
            activeEngagement.siteIds.includes(site.id),
          ) ?? [])
        : [],
    [activeEngagement, scopedDataset],
  );
  const activeDataset = useMemo(() => {
    if (!scopedDataset || !activeEngagement) {
      return null;
    }

    const projection = createEngagementWorkspaceProjection(
      scopedDataset,
      activeEngagement.id,
    );
    return projection ? createImmutableSnapshot(projection) : null;
  }, [activeEngagement, scopedDataset]);

  const loadDataset = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextDataset = await repository.getDataset();
      setDataset(createImmutableSnapshot(nextDataset));
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Unknown data loading error.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  const setCurrentUserId = useCallback(
    (userId: EntityId) => {
      if (!dataset?.users.some((user) => user.id === userId)) {
        throw new Error('Select a user from the current Fabric workspace.');
      }

      setSelectedUserId(userId);
    },
    [dataset],
  );

  const setActiveEngagementId = useCallback(
    (engagementId: EntityId | null) => {
      if (
        engagementId &&
        !scopedDataset?.engagements.some(
          (engagement) => engagement.id === engagementId,
        )
      ) {
        throw new Error(
          'Select an engagement available in the current Fabric workspace.',
        );
      }

      setActiveEngagementIdState(engagementId);
    },
    [scopedDataset],
  );

  const canPerform = useCallback(
    (permission: WorkspacePermission, engagementId?: EntityId) => {
      if (!actingUser) {
        return false;
      }

      const engagement = engagementId
        ? dataset?.engagements.find((item) => item.id === engagementId)
        : undefined;
      return canUserPerform(actingUser, permission, { engagement });
    },
    [actingUser, dataset],
  );

  const persist = useCallback(
    async (nextDataset: FabricDataset) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      if (!actingUser) {
        throw new Error(
          'Select an internal user before changing workspace data.',
        );
      }

      const changes = getDatasetChanges(dataset, nextDataset);
      const sourceEngagementIds = changes.map((change) =>
        getEngagementIdForChange(dataset, change),
      );
      const destinationEngagementIds = changes.map((change) =>
        getEngagementIdForChange(nextDataset, change),
      );

      changes.forEach((change, index) => {
        if (!change.next) {
          throw new Error(
            'Records cannot be deleted from Fabric. Archive the record instead.',
          );
        }

        const sourceEngagementId = sourceEngagementIds[index];
        const destinationEngagementId = destinationEngagementIds[index];
        const authorizationContexts = [
          sourceEngagementId
            ? dataset.engagements.find((item) => item.id === sourceEngagementId)
            : undefined,
          destinationEngagementId &&
          destinationEngagementId !== sourceEngagementId
            ? nextDataset.engagements.find(
                (item) => item.id === destinationEngagementId,
              )
            : undefined,
        ].filter(
          (engagement): engagement is Engagement => engagement !== undefined,
        );

        assertUserCanPerformAcrossEngagements(
          actingUser,
          permissionForChange(change),
          authorizationContexts,
        );

        const visibilityPermission = permissionForVisibilityTransition(
          change.previous?.visibility,
          change.next.visibility,
        );
        if (visibilityPermission) {
          assertUserCanPerformAcrossEngagements(
            actingUser,
            visibilityPermission,
            authorizationContexts,
          );
        }
      });

      const occurredAt = new Date().toISOString();
      const datasetWithActivity: FabricDataset = {
        ...nextDataset,
        activityEvents: [
          ...nextDataset.activityEvents,
          ...changes.map((change, index) =>
            createActivityEvent(
              change,
              actingUser.id,
              destinationEngagementIds[index],
              occurredAt,
              index,
            ),
          ),
        ],
      };

      await repository.saveDataset(datasetWithActivity);
      setDataset(createImmutableSnapshot(datasetWithActivity));
    },
    [actingUser, dataset, repository],
  );

  const now = () => new Date().toISOString();
  const createId = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const createClient = useCallback(
    async (input: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!dataset) throw new Error('The repository dataset is not loaded.');
      const created = {
        ...input,
        id: createId('client'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({ ...dataset, clients: [...dataset.clients, created] });
      return created;
    },
    [dataset, persist],
  );

  const updateClient = useCallback(
    async (client: Client) => {
      if (!dataset) throw new Error('The repository dataset is not loaded.');
      await persist({
        ...dataset,
        clients: replaceExistingRecord(
          dataset.clients,
          client,
          now(),
          'client',
        ),
      });
    },
    [dataset, persist],
  );

  const createSite = useCallback(
    async (input: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.clients.some((client) => client.id === input.clientId)
      )
        throw new Error('Select a valid client for this site.');
      const created = {
        ...input,
        id: createId('site'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({ ...dataset, sites: [...dataset.sites, created] });
      return created;
    },
    [dataset, persist],
  );

  const updateSite = useCallback(
    async (site: Site) => {
      if (
        !dataset ||
        !dataset.clients.some((client) => client.id === site.clientId)
      )
        throw new Error('Select a valid client for this site.');
      await persist({
        ...dataset,
        sites: replaceExistingRecord(dataset.sites, site, now(), 'site'),
      });
    },
    [dataset, persist],
  );

  const createEngagement = useCallback(
    async (input: CreateEngagementInput) => {
      const { methodologyTemplateId, ...engagementInput } = input;
      if (
        !dataset ||
        !dataset.clients.some(
          (client) => client.id === engagementInput.clientId,
        ) ||
        engagementInput.siteIds.some(
          (siteId) =>
            dataset.sites.find((site) => site.id === siteId)?.clientId !==
            engagementInput.clientId,
        )
      ) {
        throw new Error(
          'Select a valid client and site coverage for this engagement.',
        );
      }
      const matchingTemplates = dataset.methodologyTemplates.filter(
        (template) =>
          template.status === 'active' &&
          template.engagementType === engagementInput.type,
      );
      const template = methodologyTemplateId
        ? matchingTemplates.find((item) => item.id === methodologyTemplateId)
        : matchingTemplates.length === 1
          ? matchingTemplates[0]
          : undefined;
      if (methodologyTemplateId && !template) {
        throw new Error(
          'Select an active methodology template for the chosen engagement type.',
        );
      }
      if (
        !template &&
        (engagementInput.type === 'Preliminary Site Walk' ||
          engagementInput.type === 'Digital Diagnostic')
      ) {
        throw new Error(
          'Select an active methodology template before creating this engagement.',
        );
      }

      const occurredAt = now();
      const created: Engagement = {
        ...engagementInput,
        id: createId('engagement'),
        createdAt: occurredAt,
        updatedAt: occurredAt,
      };
      const createdMethodologyRun = template
        ? createMethodologyRun(
            template,
            dataset.methodologyStages,
            dataset.methodologyActivities,
            {
              id: createId('methodology-run'),
              engagementId: created.id,
              occurredAt,
            },
          )
        : undefined;
      await persist({
        ...dataset,
        engagements: [...dataset.engagements, created],
        engagementMethodologyRuns: createdMethodologyRun
          ? [...dataset.engagementMethodologyRuns, createdMethodologyRun.run]
          : dataset.engagementMethodologyRuns,
        engagementMethodologyActivities: createdMethodologyRun
          ? [
              ...dataset.engagementMethodologyActivities,
              ...createdMethodologyRun.activities,
            ]
          : dataset.engagementMethodologyActivities,
      });
      return created;
    },
    [dataset, persist],
  );

  const updateEngagement = useCallback(
    async (engagement: Engagement) => {
      if (
        !dataset ||
        !dataset.clients.some((client) => client.id === engagement.clientId) ||
        engagement.siteIds.some(
          (siteId) =>
            dataset.sites.find((site) => site.id === siteId)?.clientId !==
            engagement.clientId,
        )
      ) {
        throw new Error(
          'Select a valid client and site coverage for this engagement.',
        );
      }
      const existing = dataset.engagements.find(
        (item) => item.id === engagement.id,
      );
      if (!existing) {
        throw new Error('The engagement no longer exists.');
      }
      const methodologyRuns = dataset.engagementMethodologyRuns.filter(
        (run) => run.engagementId === engagement.id,
      );
      if (methodologyRuns.length > 0 && existing.type !== engagement.type) {
        throw new Error(
          'Use preliminary site-walk promotion to change an engagement with methodology history.',
        );
      }
      const activeRun = methodologyRuns.find(
        (run) => run.status === 'active' || run.status === 'paused',
      );
      if (
        activeRun?.status === 'paused' &&
        engagement.status !== existing.status
      ) {
        throw new Error(
          'Resume the methodology run before changing the engagement status.',
        );
      }
      if (
        activeRun?.status === 'active' &&
        engagement.status === 'paused' &&
        engagement.status !== existing.status
      ) {
        throw new Error(
          'Pause the methodology run to pause an engagement with active methodology.',
        );
      }
      await persist({
        ...dataset,
        engagements: replaceExistingRecord(
          dataset.engagements,
          engagement,
          now(),
          'engagement',
        ),
      });
    },
    [dataset, persist],
  );

  const updateMethodologyActivityState = useCallback(
    async (
      activityId: EntityId,
      update: (
        input: MethodologyActivityStateUpdate,
      ) => EngagementMethodologyActivity,
    ) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      if (!actingUser) {
        throw new Error(
          'Select an internal user before updating methodology activity.',
        );
      }

      const state = dataset.engagementMethodologyActivities.find(
        (item) => item.id === activityId,
      );
      if (!state) {
        throw new Error('The methodology activity no longer exists.');
      }
      const activity = dataset.methodologyActivities.find(
        (item) => item.id === state.templateActivityId,
      );
      const run = dataset.engagementMethodologyRuns.find(
        (item) => item.id === state.runId,
      );
      if (!activity || !run) {
        throw new Error(
          'The methodology activity is not connected to a valid run and template.',
        );
      }

      const occurredAt = now();
      const nextState = update({
        state,
        activity,
        run,
        actorUserId: actingUser.id,
        occurredAt,
      });
      const nextActivities = dataset.engagementMethodologyActivities.map(
        (item) => (item.id === state.id ? nextState : item),
      );
      const nextRun = synchroniseMethodologyRun(
        {
          ...dataset,
          engagementMethodologyActivities: nextActivities,
        },
        run,
        nextActivities,
        occurredAt,
      );

      await persist({
        ...dataset,
        engagementMethodologyRuns: replaceExistingRecord(
          dataset.engagementMethodologyRuns,
          nextRun,
          occurredAt,
          'methodology run',
        ),
        engagementMethodologyActivities: nextActivities,
      });
    },
    [actingUser, dataset, persist],
  );

  const completeMethodologyActivity = useCallback(
    async (activityId: EntityId, completionNote?: string) => {
      const note = completionNote?.trim() || undefined;
      await updateMethodologyActivityState(activityId, (input) => {
        if (input.run.status !== 'active') {
          throw new Error(
            'Resume the methodology run before completing its activities.',
          );
        }
        if (input.state.status === 'completed') {
          throw new Error('This methodology activity is already completed.');
        }
        if (input.state.status === 'skipped') {
          throw new Error(
            'Reopen a skipped methodology activity before completing it.',
          );
        }

        return {
          ...input.state,
          updatedAt: input.occurredAt,
          status: 'completed',
          completedAt: input.occurredAt,
          completedByUserId: input.actorUserId,
          completionNote: note,
          skippedAt: undefined,
          skippedByUserId: undefined,
          skipReason: undefined,
        };
      });
    },
    [updateMethodologyActivityState],
  );

  const skipMethodologyActivity = useCallback(
    async (activityId: EntityId, reason: string) => {
      const skipReason = reason.trim();
      if (!skipReason) {
        throw new Error('Provide a reason when skipping an optional activity.');
      }

      await updateMethodologyActivityState(activityId, (input) => {
        if (input.run.status !== 'active') {
          throw new Error(
            'Resume the methodology run before skipping its activities.',
          );
        }
        if (input.activity.requirement !== 'optional') {
          throw new Error('Required methodology activities cannot be skipped.');
        }
        if (input.state.status === 'completed') {
          throw new Error(
            'Reopen a completed methodology activity before skipping it.',
          );
        }
        if (input.state.status === 'skipped') {
          throw new Error('This methodology activity is already skipped.');
        }

        return {
          ...input.state,
          updatedAt: input.occurredAt,
          status: 'skipped',
          completedAt: undefined,
          completedByUserId: undefined,
          completionNote: undefined,
          skippedAt: input.occurredAt,
          skippedByUserId: input.actorUserId,
          skipReason,
        };
      });
    },
    [updateMethodologyActivityState],
  );

  const reopenMethodologyActivity = useCallback(
    async (activityId: EntityId, reason: string) => {
      const reopenReason = reason.trim();
      if (!reopenReason) {
        throw new Error('Provide a reason when reopening an activity.');
      }

      await updateMethodologyActivityState(activityId, (input) => {
        if (input.run.status === 'promoted') {
          throw new Error(
            'Promoted methodology runs are historical and cannot be reopened.',
          );
        }
        if (input.run.status === 'paused') {
          throw new Error(
            'Resume the methodology run before reopening an activity.',
          );
        }
        if (
          input.state.status !== 'completed' &&
          input.state.status !== 'skipped'
        ) {
          throw new Error(
            'Only completed or skipped methodology activities can be reopened.',
          );
        }

        return {
          ...input.state,
          updatedAt: input.occurredAt,
          status: 'not-started',
          completedAt: undefined,
          completedByUserId: undefined,
          completionNote: undefined,
          skippedAt: undefined,
          skippedByUserId: undefined,
          skipReason: undefined,
          reopenedAt: input.occurredAt,
          reopenedByUserId: input.actorUserId,
          reopenReason,
        };
      });
    },
    [updateMethodologyActivityState],
  );

  const pauseMethodologyRun = useCallback(
    async (runId: EntityId, reason: string) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      const pausedReason = reason.trim();
      if (!pausedReason) {
        throw new Error('Provide a reason when pausing a methodology run.');
      }
      const run = dataset.engagementMethodologyRuns.find(
        (item) => item.id === runId,
      );
      if (!run) {
        throw new Error('The methodology run no longer exists.');
      }
      if (run.status !== 'active') {
        throw new Error('Only active methodology runs can be paused.');
      }
      const engagement = dataset.engagements.find(
        (item) => item.id === run.engagementId,
      );
      if (!engagement || engagement.status === 'completed') {
        throw new Error('Only an active engagement can have work paused.');
      }

      const occurredAt = now();
      await persist({
        ...dataset,
        engagements: replaceExistingRecord(
          dataset.engagements,
          { ...engagement, status: 'paused' },
          occurredAt,
          'engagement',
        ),
        engagementMethodologyRuns: replaceExistingRecord(
          dataset.engagementMethodologyRuns,
          {
            ...run,
            status: 'paused',
            pausedAt: occurredAt,
            pausedReason,
            completedAt: undefined,
          },
          occurredAt,
          'methodology run',
        ),
      });
    },
    [dataset, persist],
  );

  const resumeMethodologyRun = useCallback(
    async (runId: EntityId) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      const run = dataset.engagementMethodologyRuns.find(
        (item) => item.id === runId,
      );
      if (!run) {
        throw new Error('The methodology run no longer exists.');
      }
      if (run.status !== 'paused') {
        throw new Error('Only paused methodology runs can be resumed.');
      }
      const engagement = dataset.engagements.find(
        (item) => item.id === run.engagementId,
      );
      if (!engagement) {
        throw new Error(
          'The methodology run is not connected to an engagement.',
        );
      }

      const occurredAt = now();
      const resumedRun = synchroniseMethodologyRun(
        dataset,
        {
          ...run,
          status: 'active',
          pausedAt: undefined,
          pausedReason: undefined,
        },
        dataset.engagementMethodologyActivities,
        occurredAt,
      );
      await persist({
        ...dataset,
        engagements: replaceExistingRecord(
          dataset.engagements,
          {
            ...engagement,
            status: resumedRun.status === 'completed' ? 'completed' : 'active',
          },
          occurredAt,
          'engagement',
        ),
        engagementMethodologyRuns: replaceExistingRecord(
          dataset.engagementMethodologyRuns,
          resumedRun,
          occurredAt,
          'methodology run',
        ),
      });
    },
    [dataset, persist],
  );

  const promotePreliminarySiteWalk = useCallback(
    async (siteWalkId: EntityId) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      if (!actingUser) {
        throw new Error(
          'Select an internal user before promoting preliminary fieldwork.',
        );
      }
      const siteWalk = dataset.siteWalks.find((item) => item.id === siteWalkId);
      if (!siteWalk) {
        throw new Error('The preliminary site walk no longer exists.');
      }
      const engagement = dataset.engagements.find(
        (item) => item.id === siteWalk.engagementId,
      );
      if (!engagement) {
        throw new Error('The site walk is not connected to an engagement.');
      }
      if (
        dataset.diagnostics.some((item) => item.engagementId === engagement.id)
      ) {
        throw new Error(
          'This engagement already has a diagnostic. Continue it instead of promoting the site walk.',
        );
      }
      const preliminaryRun = dataset.engagementMethodologyRuns.find((run) => {
        const template = dataset.methodologyTemplates.find(
          (item) => item.id === run.templateId,
        );
        return (
          run.engagementId === engagement.id &&
          run.status !== 'promoted' &&
          template?.engagementType === 'Preliminary Site Walk'
        );
      });
      if (!preliminaryRun) {
        throw new Error(
          'The engagement needs a Preliminary Site Walk methodology run before promotion.',
        );
      }
      const digitalDiagnosticTemplates = dataset.methodologyTemplates.filter(
        (template) =>
          template.status === 'active' &&
          template.engagementType === 'Digital Diagnostic',
      );
      if (digitalDiagnosticTemplates.length !== 1) {
        throw new Error(
          'Select exactly one active Digital Diagnostic template before promotion.',
        );
      }

      const occurredAt = now();
      const promotion = preparePreliminarySiteWalkPromotion({
        engagement,
        siteWalk,
        preliminaryRun,
        digitalDiagnosticTemplate: digitalDiagnosticTemplates[0],
        digitalDiagnosticStages: dataset.methodologyStages,
        digitalDiagnosticActivities: dataset.methodologyActivities,
        actorUserId: actingUser.id,
        occurredAt,
        digitalDiagnosticRunId: createId('methodology-run'),
        diagnosticId: createId('diagnostic'),
      });
      await persist({
        ...dataset,
        engagements: replaceExistingRecord(
          dataset.engagements,
          promotion.engagement,
          occurredAt,
          'engagement',
        ),
        diagnostics: [...dataset.diagnostics, promotion.diagnostic],
        engagementMethodologyRuns: [
          ...replaceExistingRecord(
            dataset.engagementMethodologyRuns,
            promotion.preliminaryRun,
            occurredAt,
            'methodology run',
          ),
          promotion.digitalDiagnosticRun,
        ],
        engagementMethodologyActivities: [
          ...dataset.engagementMethodologyActivities,
          ...promotion.digitalDiagnosticActivities,
        ],
      });
      return promotion.engagement;
    },
    [actingUser, dataset, persist],
  );

  const createSiteWalk = useCallback(
    async (input: Omit<SiteWalk, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.engagements
          .find((item) => item.id === input.engagementId)
          ?.siteIds.includes(input.siteId) ||
        !dataset.sites.some((item) => item.id === input.siteId)
      ) {
        throw new Error('Select a valid engagement and site for this walk.');
      }
      const created = {
        ...input,
        id: createId('walk'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({ ...dataset, siteWalks: [...dataset.siteWalks, created] });
      return created;
    },
    [dataset, persist],
  );

  const updateSiteWalk = useCallback(
    async (walk: SiteWalk) => {
      if (
        !dataset ||
        !dataset.engagements
          .find((item) => item.id === walk.engagementId)
          ?.siteIds.includes(walk.siteId) ||
        !dataset.sites.some((item) => item.id === walk.siteId)
      ) {
        throw new Error('Select a valid engagement and site for this walk.');
      }
      await persist({
        ...dataset,
        siteWalks: replaceExistingRecord(
          dataset.siteWalks,
          walk,
          now(),
          'site walk',
        ),
      });
    },
    [dataset, persist],
  );

  const createObservation = useCallback(
    async (input: Omit<Observation, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.siteWalks.some((item) => item.id === input.siteWalkId)
      )
        throw new Error('Select a valid site walk for this observation.');
      if (!actingUser) {
        throw new Error(
          'Select an internal user before recording an observation.',
        );
      }
      const created = {
        ...input,
        id: createId('observation'),
        createdAt: now(),
        updatedAt: now(),
        recordedByUserId: actingUser.id,
      };
      await persist({
        ...dataset,
        observations: [...dataset.observations, created],
      });
      return created;
    },
    [actingUser, dataset, persist],
  );

  const updateObservation = useCallback(
    async (observation: Observation) => {
      if (
        !dataset ||
        !dataset.siteWalks.some((item) => item.id === observation.siteWalkId)
      )
        throw new Error('Select a valid site walk for this observation.');
      const existing = dataset.observations.find(
        (item) => item.id === observation.id,
      );
      if (!existing) throw new Error('The observation no longer exists.');
      await persist({
        ...dataset,
        observations: replaceExistingRecord(
          dataset.observations,
          {
            ...observation,
            recordedByUserId: existing.recordedByUserId,
          },
          now(),
          'observation',
        ),
      });
    },
    [dataset, persist],
  );

  const createEvidence = useCallback(
    async (input: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        (input.siteWalkId &&
          !dataset.siteWalks.some((item) => item.id === input.siteWalkId)) ||
        (input.observationId &&
          !dataset.observations.some((item) => item.id === input.observationId))
      ) {
        throw new Error(
          'Select a valid site walk or observation for this evidence.',
        );
      }
      if (!actingUser) {
        throw new Error('Select an internal user before recording evidence.');
      }
      const created = {
        ...input,
        id: createId('evidence'),
        createdAt: now(),
        updatedAt: now(),
        capturedByUserId: actingUser.id,
      };
      await persist({ ...dataset, evidence: [...dataset.evidence, created] });
      return created;
    },
    [actingUser, dataset, persist],
  );

  const createFrictionItem = useCallback(
    async (input: Omit<FrictionItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.siteWalks.some((item) => item.id === input.siteWalkId)
      )
        throw new Error('Select a valid site walk for this friction item.');
      const created = {
        ...input,
        id: createId('friction'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        frictionItems: [...dataset.frictionItems, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateFrictionItem = useCallback(
    async (item: FrictionItem) => {
      if (
        !dataset ||
        !dataset.siteWalks.some((walk) => walk.id === item.siteWalkId)
      )
        throw new Error('Select a valid site walk for this friction item.');
      await persist({
        ...dataset,
        frictionItems: replaceExistingRecord(
          dataset.frictionItems,
          item,
          now(),
          'friction item',
        ),
      });
    },
    [dataset, persist],
  );

  const createDiagnostic = useCallback(
    async (input: Omit<Diagnostic, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.engagements.some((item) => item.id === input.engagementId)
      )
        throw new Error('Select a valid engagement for this diagnostic.');
      const created = {
        ...input,
        id: createId('diagnostic'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        diagnostics: [...dataset.diagnostics, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateDiagnostic = useCallback(
    async (diagnostic: Diagnostic) => {
      if (
        !dataset ||
        !dataset.engagements.some((item) => item.id === diagnostic.engagementId)
      )
        throw new Error('Select a valid engagement for this diagnostic.');
      await persist({
        ...dataset,
        diagnostics: replaceExistingRecord(
          dataset.diagnostics,
          diagnostic,
          now(),
          'diagnostic',
        ),
      });
    },
    [dataset, persist],
  );

  const createLandscapeEntity = useCallback(
    async (input: CreateLandscapeEntityInput) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      const engagement = dataset.engagements.find(
        (item) => item.id === input.engagementId,
      );
      if (!engagement || !engagement.siteIds.includes(input.siteId)) {
        throw new Error(
          'Select a site that is included in the landscape engagement.',
        );
      }
      if (!dataset.sites.some((item) => item.id === input.siteId)) {
        throw new Error('Select a valid site for this landscape item.');
      }

      const occurredAt = now();
      const {
        sourceEntityId,
        canonicalAreaId,
        relatedSystemIds,
        systemCategory,
        systemOwnerTeam,
        ...landscapeInput
      } = input;
      let resolvedSourceEntityId = sourceEntityId;
      let nextAreas = dataset.areas;
      let nextProcesses = dataset.processes;
      let nextSystems = dataset.systems;
      let nextSites = dataset.sites;

      if (sourceEntityId) {
        const matchesSource =
          (input.type === 'area' &&
            dataset.areas.some(
              (item) =>
                item.id === sourceEntityId && item.siteId === input.siteId,
            )) ||
          (input.type === 'process' &&
            dataset.processes.some(
              (item) =>
                item.id === sourceEntityId && item.siteId === input.siteId,
            )) ||
          (input.type === 'system' &&
            dataset.systems.some(
              (item) =>
                item.id === sourceEntityId && item.siteId === input.siteId,
            ));
        if (!matchesSource) {
          throw new Error(
            'Link an area, process, or system record that matches the item type and site.',
          );
        }
      } else if (input.type === 'area') {
        const createdArea: Area = {
          id: createId('area'),
          createdAt: occurredAt,
          updatedAt: occurredAt,
          siteId: input.siteId,
          name: input.name,
          description: input.description,
        };
        resolvedSourceEntityId = createdArea.id;
        nextAreas = [...dataset.areas, createdArea];
        nextSites = dataset.sites.map((site) =>
          site.id === input.siteId
            ? {
                ...site,
                updatedAt: occurredAt,
                areaIds: [...site.areaIds, createdArea.id],
              }
            : site,
        );
      } else if (input.type === 'process') {
        const area = canonicalAreaId
          ? dataset.areas.find((item) => item.id === canonicalAreaId)
          : undefined;
        if (!area || area.siteId !== input.siteId) {
          throw new Error(
            'Select an operational area at the same site before creating a process.',
          );
        }
        const selectedSystemIds = relatedSystemIds ?? [];
        if (
          selectedSystemIds.some(
            (systemId) =>
              dataset.systems.find((item) => item.id === systemId)?.siteId !==
              input.siteId,
          )
        ) {
          throw new Error(
            'Only associate systems that belong to the selected process site.',
          );
        }
        const createdProcess: Process = {
          id: createId('process'),
          createdAt: occurredAt,
          updatedAt: occurredAt,
          siteId: input.siteId,
          areaId: area.id,
          name: input.name,
          description: input.description,
          relatedSystemIds: selectedSystemIds,
        };
        resolvedSourceEntityId = createdProcess.id;
        nextProcesses = [...dataset.processes, createdProcess];
      } else if (input.type === 'system') {
        const category = systemCategory?.trim();
        const ownerTeam = systemOwnerTeam?.trim();
        if (!category || !ownerTeam) {
          throw new Error(
            'Provide a category and owner team before creating a system.',
          );
        }
        const createdSystem: OperationalSystem = {
          id: createId('system'),
          createdAt: occurredAt,
          updatedAt: occurredAt,
          siteId: input.siteId,
          name: input.name,
          description: input.description,
          category,
          ownerTeam,
        };
        resolvedSourceEntityId = createdSystem.id;
        nextSystems = [...dataset.systems, createdSystem];
        nextSites = dataset.sites.map((site) =>
          site.id === input.siteId
            ? {
                ...site,
                updatedAt: occurredAt,
                systemIds: [...site.systemIds, createdSystem.id],
              }
            : site,
        );
      }

      const created: LandscapeEntity = {
        ...landscapeInput,
        id: createId('landscape-entity'),
        createdAt: occurredAt,
        updatedAt: occurredAt,
        sourceEntityId: resolvedSourceEntityId,
        visibility: 'internal',
        reviewStatus: 'draft',
      };
      await persist({
        ...dataset,
        sites: nextSites,
        areas: nextAreas,
        processes: nextProcesses,
        systems: nextSystems,
        landscapeEntities: [...dataset.landscapeEntities, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateLandscapeEntity = useCallback(
    async (entity: LandscapeEntity) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      const existing = dataset.landscapeEntities.find(
        (item) => item.id === entity.id,
      );
      if (!existing) {
        throw new Error('The landscape item no longer exists.');
      }
      if (
        existing.engagementId !== entity.engagementId ||
        existing.siteId !== entity.siteId ||
        existing.type !== entity.type ||
        existing.sourceEntityId !== entity.sourceEntityId ||
        existing.createdAt !== entity.createdAt
      ) {
        throw new Error(
          'Landscape item scope, type, source, and creation history cannot be changed.',
        );
      }

      const occurredAt = now();
      let nextAreas = dataset.areas;
      let nextProcesses = dataset.processes;
      let nextSystems = dataset.systems;
      if (entity.type === 'area' && entity.sourceEntityId) {
        const source = dataset.areas.find(
          (item) => item.id === entity.sourceEntityId,
        );
        if (!source) {
          throw new Error('The linked operational area no longer exists.');
        }
        nextAreas = replaceExistingRecord(
          dataset.areas,
          { ...source, name: entity.name, description: entity.description },
          occurredAt,
          'area',
        );
      }
      if (entity.type === 'process' && entity.sourceEntityId) {
        const source = dataset.processes.find(
          (item) => item.id === entity.sourceEntityId,
        );
        if (!source) {
          throw new Error('The linked process no longer exists.');
        }
        nextProcesses = replaceExistingRecord(
          dataset.processes,
          { ...source, name: entity.name, description: entity.description },
          occurredAt,
          'process',
        );
      }
      if (entity.type === 'system' && entity.sourceEntityId) {
        const source = dataset.systems.find(
          (item) => item.id === entity.sourceEntityId,
        );
        if (!source) {
          throw new Error('The linked system no longer exists.');
        }
        nextSystems = replaceExistingRecord(
          dataset.systems,
          { ...source, name: entity.name, description: entity.description },
          occurredAt,
          'system',
        );
      }

      await persist({
        ...dataset,
        areas: nextAreas,
        processes: nextProcesses,
        systems: nextSystems,
        landscapeEntities: replaceExistingRecord(
          dataset.landscapeEntities,
          entity,
          occurredAt,
          'landscape item',
        ),
      });
    },
    [dataset, persist],
  );

  const createLandscapeRelationship = useCallback(
    async (input: CreateLandscapeRelationshipInput) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      const fromEntity = dataset.landscapeEntities.find(
        (item) => item.id === input.fromEntityId,
      );
      const toEntity = dataset.landscapeEntities.find(
        (item) => item.id === input.toEntityId,
      );
      if (
        !fromEntity ||
        !toEntity ||
        fromEntity.engagementId !== input.engagementId ||
        toEntity.engagementId !== input.engagementId
      ) {
        throw new Error(
          'Connect landscape items that belong to the selected engagement.',
        );
      }

      const occurredAt = now();
      const created: LandscapeRelationship = {
        ...input,
        id: createId('landscape-relationship'),
        createdAt: occurredAt,
        updatedAt: occurredAt,
        visibility: 'internal',
        reviewStatus: 'draft',
      };
      await persist({
        ...dataset,
        landscapeRelationships: [...dataset.landscapeRelationships, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateLandscapeRelationship = useCallback(
    async (relationship: LandscapeRelationship) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      const existing = dataset.landscapeRelationships.find(
        (item) => item.id === relationship.id,
      );
      if (!existing) {
        throw new Error('The landscape relationship no longer exists.');
      }
      if (
        existing.engagementId !== relationship.engagementId ||
        existing.createdAt !== relationship.createdAt
      ) {
        throw new Error(
          'Landscape relationship scope and creation history cannot be changed.',
        );
      }
      const fromEntity = dataset.landscapeEntities.find(
        (item) => item.id === relationship.fromEntityId,
      );
      const toEntity = dataset.landscapeEntities.find(
        (item) => item.id === relationship.toEntityId,
      );
      if (
        !fromEntity ||
        !toEntity ||
        fromEntity.engagementId !== relationship.engagementId ||
        toEntity.engagementId !== relationship.engagementId
      ) {
        throw new Error(
          'Connect landscape items that belong to the relationship engagement.',
        );
      }
      await persist({
        ...dataset,
        landscapeRelationships: replaceExistingRecord(
          dataset.landscapeRelationships,
          relationship,
          now(),
          'landscape relationship',
        ),
      });
    },
    [dataset, persist],
  );

  const captureLandscapeVersion = useCallback(
    async (engagementId: EntityId, input: CaptureLandscapeVersionInput) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      const engagement = dataset.engagements.find(
        (item) => item.id === engagementId,
      );
      if (
        !engagement ||
        (input.siteId && !engagement.siteIds.includes(input.siteId))
      ) {
        throw new Error(
          'Select a valid engagement and, when needed, a covered site for the landscape snapshot.',
        );
      }
      if (!actingUser) {
        throw new Error(
          'Select an internal user before capturing a landscape version.',
        );
      }
      const snapshot = createLandscapeVersionSnapshot(
        dataset,
        engagementId,
        input.siteId,
      );
      if (snapshot.entities.length === 0) {
        throw new Error(
          'Add at least one landscape item before capturing a version.',
        );
      }

      const occurredAt = now();
      const scopedVersions = dataset.landscapeVersions.filter(
        (item) =>
          item.engagementId === engagementId && item.siteId === input.siteId,
      );
      const highestVersion = scopedVersions.reduce((highest, item) => {
        const numericVersion = Number.parseFloat(item.version);
        return Number.isFinite(numericVersion)
          ? Math.max(highest, numericVersion)
          : highest;
      }, 0);
      const created: LandscapeVersion = {
        id: createId('landscape-version'),
        createdAt: occurredAt,
        updatedAt: occurredAt,
        engagementId,
        siteId: input.siteId,
        title: input.title.trim(),
        version: (highestVersion + 0.1).toFixed(1),
        status: 'current',
        capturedAt: occurredAt,
        capturedByUserId: actingUser.id,
        notes: input.notes?.trim() || undefined,
        ...snapshot,
      };
      if (!created.title) {
        throw new Error('Provide a title for the landscape version.');
      }

      await persist({
        ...dataset,
        landscapeVersions: [
          ...dataset.landscapeVersions.map((item) =>
            item.engagementId === engagementId &&
            item.siteId === input.siteId &&
            item.status === 'current'
              ? {
                  ...item,
                  status: 'superseded' as const,
                  updatedAt: occurredAt,
                }
              : item,
          ),
          created,
        ],
      });
      return created;
    },
    [actingUser, dataset, persist],
  );

  const saveMaturityAssessment = useCallback(
    async (assessment: MaturityAssessment) => {
      if (
        !dataset ||
        !dataset.diagnostics.some(
          (item) => item.id === assessment.diagnosticId,
        ) ||
        !dataset.diagnosticDimensions.some(
          (item) => item.id === assessment.dimensionId,
        )
      ) {
        throw new Error('Select a valid diagnostic and scorecard dimension.');
      }
      const exists = dataset.maturityAssessments.some(
        (item) => item.id === assessment.id,
      );
      const next = { ...assessment, updatedAt: now() };
      await persist({
        ...dataset,
        maturityAssessments: exists
          ? dataset.maturityAssessments.map((item) =>
              item.id === assessment.id ? next : item,
            )
          : [...dataset.maturityAssessments, next],
      });
    },
    [dataset, persist],
  );

  const createOpportunity = useCallback(
    async (input: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.engagements.some((item) => item.id === input.engagementId)
      )
        throw new Error('Select a valid engagement for this opportunity.');
      const timestamp = now();
      const created: Opportunity = {
        ...input,
        id: createId('opportunity'),
        createdAt: timestamp,
        updatedAt: timestamp,
        status: 'identified',
        approvalState: 'draft',
        reviewStatus: 'draft',
        visibility: 'internal',
      };
      await persist({
        ...dataset,
        opportunities: [...dataset.opportunities, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateOpportunity = useCallback(
    async (opportunity: Opportunity) => {
      if (
        !dataset ||
        !dataset.engagements.some(
          (item) => item.id === opportunity.engagementId,
        )
      )
        throw new Error('Select a valid engagement for this opportunity.');
      const existing = dataset.opportunities.find(
        (item) => item.id === opportunity.id,
      );
      if (!existing) throw new Error('The opportunity no longer exists.');
      const nextOpportunity = prepareControlledOpportunityUpdate(
        existing,
        opportunity,
      );
      assertOpportunityApprovalCanBeRevoked(dataset, existing, nextOpportunity);
      const updatedAt = now();
      await persist({
        ...dataset,
        opportunities: replaceExistingRecord(
          dataset.opportunities,
          nextOpportunity,
          updatedAt,
          'opportunity',
        ),
      });
      return { ...nextOpportunity, updatedAt };
    },
    [dataset, persist],
  );

  const createAction = useCallback(
    async (input: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        (input.opportunityId &&
          !dataset.opportunities.some(
            (item) => item.id === input.opportunityId,
          )) ||
        (input.initiativeId &&
          !dataset.initiatives.some((item) => item.id === input.initiativeId))
      )
        throw new Error(
          'Select a valid opportunity or initiative for this action.',
        );

      if (
        input.opportunityId &&
        input.initiativeId &&
        dataset.opportunities.find((item) => item.id === input.opportunityId)
          ?.engagementId !==
          dataset.initiatives.find((item) => item.id === input.initiativeId)
            ?.engagementId
      )
        throw new Error(
          'An action cannot combine records from different engagements.',
        );

      const created = {
        ...input,
        id: createId('action'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        actionItems: [...dataset.actionItems, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateAction = useCallback(
    async (action: ActionItem) => {
      if (
        !dataset ||
        (action.opportunityId &&
          !dataset.opportunities.some(
            (item) => item.id === action.opportunityId,
          )) ||
        (action.initiativeId &&
          !dataset.initiatives.some((item) => item.id === action.initiativeId))
      )
        throw new Error(
          'Select a valid opportunity or initiative for this action.',
        );

      if (
        action.opportunityId &&
        action.initiativeId &&
        dataset.opportunities.find((item) => item.id === action.opportunityId)
          ?.engagementId !==
          dataset.initiatives.find((item) => item.id === action.initiativeId)
            ?.engagementId
      )
        throw new Error(
          'An action cannot combine records from different engagements.',
        );

      await persist({
        ...dataset,
        actionItems: replaceExistingRecord(
          dataset.actionItems,
          action,
          now(),
          'action',
        ),
      });
    },
    [dataset, persist],
  );

  const createInitiative = useCallback(
    async (input: Omit<Initiative, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!dataset) throw new Error('The repository dataset is not loaded.');
      assertInitiativeContext(dataset, input);
      const created = {
        ...input,
        id: createId('initiative'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        initiatives: [...dataset.initiatives, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateInitiative = useCallback(
    async (initiative: Initiative) => {
      if (!dataset) throw new Error('The repository dataset is not loaded.');
      assertInitiativeContext(dataset, initiative);
      await persist({
        ...dataset,
        initiatives: replaceExistingRecord(
          dataset.initiatives,
          initiative,
          now(),
          'initiative',
        ),
      });
    },
    [dataset, persist],
  );

  const createMilestone = useCallback(
    async (input: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.initiatives.some((item) => item.id === input.initiativeId)
      )
        throw new Error('Select a valid initiative for this milestone.');
      const created = {
        ...input,
        id: createId('milestone'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        milestones: [...dataset.milestones, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateMilestone = useCallback(
    async (milestone: Milestone) => {
      if (
        !dataset ||
        !dataset.initiatives.some((item) => item.id === milestone.initiativeId)
      )
        throw new Error('Select a valid initiative for this milestone.');
      await persist({
        ...dataset,
        milestones: replaceExistingRecord(
          dataset.milestones,
          milestone,
          now(),
          'milestone',
        ),
      });
    },
    [dataset, persist],
  );

  const createDeliveryAction = useCallback(
    async (input: Omit<DeliveryAction, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.initiatives.some((item) => item.id === input.initiativeId)
      )
        throw new Error('Select a valid initiative for this delivery action.');
      const created = {
        ...input,
        id: createId('delivery-action'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        deliveryActions: [...dataset.deliveryActions, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateDeliveryAction = useCallback(
    async (action: DeliveryAction) => {
      if (
        !dataset ||
        !dataset.initiatives.some((item) => item.id === action.initiativeId)
      )
        throw new Error('Select a valid initiative for this delivery action.');
      await persist({
        ...dataset,
        deliveryActions: replaceExistingRecord(
          dataset.deliveryActions,
          action,
          now(),
          'delivery action',
        ),
      });
    },
    [dataset, persist],
  );

  const createBenefitMeasurement = useCallback(
    async (
      input: Omit<BenefitMeasurement, 'id' | 'createdAt' | 'updatedAt'>,
    ) => {
      if (
        !dataset ||
        !dataset.initiatives.some((item) => item.id === input.initiativeId)
      )
        throw new Error('Select a valid initiative for this benefit measure.');
      const created = {
        ...input,
        id: createId('benefit'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        benefitMeasurements: [...dataset.benefitMeasurements, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateBenefitMeasurement = useCallback(
    async (measurement: BenefitMeasurement) => {
      if (
        !dataset ||
        !dataset.initiatives.some(
          (item) => item.id === measurement.initiativeId,
        )
      )
        throw new Error('Select a valid initiative for this benefit measure.');
      await persist({
        ...dataset,
        benefitMeasurements: replaceExistingRecord(
          dataset.benefitMeasurements,
          measurement,
          now(),
          'benefit measurement',
        ),
      });
    },
    [dataset, persist],
  );

  const createRoadmap = useCallback(
    async (input: Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!dataset) throw new Error('The repository dataset is not loaded.');
      assertRoadmapContext(dataset, input);
      const created = {
        ...input,
        id: createId('roadmap'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({ ...dataset, roadmaps: [...dataset.roadmaps, created] });
      return created;
    },
    [dataset, persist],
  );

  const updateRoadmap = useCallback(
    async (roadmap: Roadmap) => {
      if (!dataset) throw new Error('The repository dataset is not loaded.');
      assertRoadmapContext(dataset, roadmap, roadmap.id);
      await persist({
        ...dataset,
        roadmaps: replaceExistingRecord(
          dataset.roadmaps,
          roadmap,
          now(),
          'roadmap',
        ),
      });
    },
    [dataset, persist],
  );

  const createOutput = useCallback(
    async (input: CreateOutputInput) => {
      if (
        !dataset ||
        !dataset.engagements.some((item) => item.id === input.engagementId)
      )
        throw new Error('Select a valid engagement for this output.');
      if (!actingUser) {
        throw new Error('Select an internal user before creating an output.');
      }
      const timestamp = now();
      const outputBase: Output = {
        id: createId('output'),
        createdAt: timestamp,
        updatedAt: timestamp,
        engagementId: input.engagementId,
        outputType: input.outputType,
        title: input.title,
        status: 'draft',
        visibility: 'internal',
        version: nextOutputVersion(
          dataset.outputs
            .filter(
              (output) =>
                output.engagementId === input.engagementId &&
                output.outputType === input.outputType,
            )
            .map((output) => output.version),
        ),
        templateVersion: getOutputTemplate(input.outputType).version,
        createdByUserId: actingUser.id,
        sourceReferences: input.sourceReferences,
        sectionOverrides: [],
      };
      const created: Output = {
        ...outputBase,
        reportSnapshot: createOutputReportSnapshot(
          dataset,
          outputBase,
          timestamp,
        ),
      };
      await persist({ ...dataset, outputs: [...dataset.outputs, created] });
      return created;
    },
    [actingUser, dataset, persist],
  );

  const updateOutput = useCallback(
    async (output: Output) => {
      if (
        !dataset ||
        !dataset.engagements.some((item) => item.id === output.engagementId)
      )
        throw new Error('Select a valid engagement for this output.');
      if (!actingUser) {
        throw new Error('Select an internal user before changing an output.');
      }
      const existing = dataset.outputs.find((item) => item.id === output.id);
      if (!existing) throw new Error('The output no longer exists.');
      const timestamp = now();
      let nextOutput = prepareControlledOutputUpdate(
        existing,
        output,
        actingUser.id,
        timestamp,
      );
      if (
        nextOutput.status === 'approved' &&
        existing.status !== 'approved' &&
        dataset.outputReviewComments.some(
          (comment) =>
            comment.outputId === nextOutput.id && comment.status === 'open',
        )
      ) {
        throw new Error(
          'Resolve all output review comments before approving the report.',
        );
      }

      if (nextOutput.status === 'draft') {
        nextOutput = {
          ...nextOutput,
          reportSnapshot: createOutputReportSnapshot(
            dataset,
            nextOutput,
            timestamp,
          ),
        };
      }
      await persist({
        ...dataset,
        outputs: replaceExistingRecord(
          dataset.outputs,
          nextOutput,
          timestamp,
          'output',
        ),
      });
    },
    [actingUser, dataset, persist],
  );

  const regenerateOutputReport = useCallback(
    async (outputId: EntityId) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      const output = dataset.outputs.find((item) => item.id === outputId);
      if (!output) {
        throw new Error('The output no longer exists.');
      }
      if (output.status !== 'draft') {
        throw new Error(
          'Return the output to draft before regenerating its report.',
        );
      }

      const timestamp = now();
      const regenerated: Output = {
        ...output,
        reportSnapshot: createOutputReportSnapshot(dataset, output, timestamp),
      };
      await persist({
        ...dataset,
        outputs: replaceExistingRecord(
          dataset.outputs,
          regenerated,
          timestamp,
          'output',
        ),
      });
      return { ...regenerated, updatedAt: timestamp };
    },
    [dataset, persist],
  );

  const createOutputRevision = useCallback(
    async (outputId: EntityId) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      if (!actingUser) {
        throw new Error(
          'Select an internal user before creating a new output version.',
        );
      }
      const existing = dataset.outputs.find((item) => item.id === outputId);
      if (!existing) {
        throw new Error('The output no longer exists.');
      }

      const timestamp = now();
      const revisionBase: Output = {
        ...existing,
        id: createId('output'),
        createdAt: timestamp,
        updatedAt: timestamp,
        version: nextOutputVersion(
          dataset.outputs
            .filter(
              (output) =>
                output.engagementId === existing.engagementId &&
                output.outputType === existing.outputType,
            )
            .map((output) => output.version),
        ),
        templateVersion: getOutputTemplate(existing.outputType).version,
        status: 'draft',
        visibility: 'internal',
        createdByUserId: actingUser.id,
        approvedByUserId: undefined,
        approvedAt: undefined,
        publishedAt: undefined,
        sectionOverrides: [...existing.sectionOverrides],
        reportSnapshot: undefined,
        supersedesOutputId: existing.id,
      };
      const revision: Output = {
        ...revisionBase,
        reportSnapshot: createOutputReportSnapshot(
          dataset,
          revisionBase,
          timestamp,
        ),
      };
      await persist({
        ...dataset,
        outputs: [...dataset.outputs, revision],
      });
      return revision;
    },
    [actingUser, dataset, persist],
  );

  const createOutputReviewComment = useCallback(
    async (input: CreateOutputReviewCommentInput) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      if (!actingUser) {
        throw new Error(
          'Select an internal user before adding an output review comment.',
        );
      }
      const output = dataset.outputs.find((item) => item.id === input.outputId);
      if (!output) {
        throw new Error('Select a valid output for the review comment.');
      }
      if (output.status !== 'draft' && output.status !== 'internal-review') {
        throw new Error(
          'Review comments can only be added while an output is in draft or internal review.',
        );
      }
      const body = input.body.trim();
      if (!body) {
        throw new Error('Write a review comment before saving it.');
      }

      const timestamp = now();
      const comment: OutputReviewComment = {
        id: createId('output-review-comment'),
        createdAt: timestamp,
        updatedAt: timestamp,
        outputId: input.outputId,
        body,
        authorUserId: actingUser.id,
        status: 'open',
      };
      await persist({
        ...dataset,
        outputReviewComments: [...dataset.outputReviewComments, comment],
      });
      return comment;
    },
    [actingUser, dataset, persist],
  );

  const resolveOutputReviewComment = useCallback(
    async (commentId: EntityId) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      if (!actingUser) {
        throw new Error(
          'Select an internal user before resolving an output review comment.',
        );
      }
      const comment = dataset.outputReviewComments.find(
        (item) => item.id === commentId,
      );
      if (!comment) {
        throw new Error('The output review comment no longer exists.');
      }
      if (comment.status === 'resolved') {
        throw new Error('This output review comment is already resolved.');
      }
      const output = dataset.outputs.find(
        (item) => item.id === comment.outputId,
      );
      if (
        !output ||
        (output.status !== 'draft' && output.status !== 'internal-review')
      ) {
        throw new Error(
          'Review comments can only be resolved while their output is in draft or internal review.',
        );
      }

      const timestamp = now();
      const resolved: OutputReviewComment = {
        ...comment,
        status: 'resolved',
        resolvedByUserId: actingUser.id,
        resolvedAt: timestamp,
      };
      await persist({
        ...dataset,
        outputReviewComments: replaceExistingRecord(
          dataset.outputReviewComments,
          resolved,
          timestamp,
          'output review comment',
        ),
      });
    },
    [actingUser, dataset, persist],
  );

  const recordOutputExport = useCallback(
    async (
      outputId: EntityId,
      format: OutputExportFormat,
      audience: OutputExportAudience,
    ) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      if (!actingUser) {
        throw new Error('Select an internal user before exporting a report.');
      }
      const output = dataset.outputs.find((item) => item.id === outputId);
      if (!output) {
        throw new Error('The output no longer exists.');
      }
      if (output.status === 'archived') {
        throw new Error('Archived outputs cannot be exported.');
      }
      if (
        audience === 'client-facing' &&
        !isOutputReportClientReady(dataset, output)
      ) {
        throw new Error(
          'Client-facing report exports require an approved report with approved source data.',
        );
      }

      const timestamp = now();
      const { output: outputWithSnapshot, snapshot } =
        prepareOutputExportSnapshot(dataset, output, timestamp);
      const extension = format === 'markdown' ? 'md' : 'json';
      const exportReference: OutputExportReference = {
        id: createId('output-export'),
        createdAt: timestamp,
        updatedAt: timestamp,
        outputId: output.id,
        format,
        audience,
        fileName: getOutputReportFileName(output, extension),
        outputVersion: output.version,
        sourceFingerprint: snapshot.sourceFingerprint,
        contentFingerprint: snapshot.contentFingerprint,
        exportedByUserId: actingUser.id,
        exportedAt: timestamp,
      };
      const nextDataset: FabricDataset = {
        ...dataset,
        outputs:
          outputWithSnapshot === output
            ? dataset.outputs
            : replaceExistingRecord(
                dataset.outputs,
                outputWithSnapshot,
                timestamp,
                'controlled output',
              ),
        outputExports: [...dataset.outputExports, exportReference],
      };
      await persist(nextDataset);
      return {
        exportReference,
        report: resolveOutputReport(nextDataset, outputWithSnapshot),
      };
    },
    [actingUser, dataset, persist],
  );

  const createKnowledgeEntry = useCallback(
    async (input: CreateKnowledgeEntryInput) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      if (!actingUser) {
        throw new Error(
          'Select an internal user before creating reusable knowledge.',
        );
      }

      const created: KnowledgeEntry = {
        ...input,
        id: createId('knowledge'),
        createdAt: now(),
        updatedAt: now(),
        status: 'draft',
        visibility: 'internal',
        createdByUserId: actingUser.id,
      };
      await persist({
        ...dataset,
        knowledgeEntries: [...dataset.knowledgeEntries, created],
      });
      return created;
    },
    [actingUser, dataset, persist],
  );

  const updateKnowledgeEntry = useCallback(
    async (entry: KnowledgeEntry) => {
      if (!dataset) {
        throw new Error('The repository dataset is not loaded.');
      }
      if (!actingUser) {
        throw new Error(
          'Select an internal user before changing reusable knowledge.',
        );
      }
      const existing = dataset.knowledgeEntries.find(
        (item) => item.id === entry.id,
      );
      if (!existing) {
        throw new Error('The reusable knowledge entry no longer exists.');
      }

      const nextEntry = prepareKnowledgeEntryUpdate(
        existing,
        entry,
        actingUser.id,
        now(),
      );
      await persist({
        ...dataset,
        knowledgeEntries: replaceExistingRecord(
          dataset.knowledgeEntries,
          nextEntry,
          now(),
          'reusable knowledge entry',
        ),
      });
      return nextEntry;
    },
    [actingUser, dataset, persist],
  );

  useEffect(() => {
    void loadDataset();
  }, [loadDataset]);

  useEffect(() => {
    if (!scopedDataset || !currentUser) {
      activeEngagementUserIdRef.current = null;
      setActiveEngagementIdState(null);
      return;
    }

    const userChanged = activeEngagementUserIdRef.current !== currentUser.id;
    const savedEngagementId = window.localStorage.getItem(
      activeEngagementStorageKey(currentUser.id),
    );
    const defaultEngagement =
      scopedDataset.engagements.find(
        (engagement) =>
          engagement.status === 'active' || engagement.status === 'at-risk',
      ) ?? scopedDataset.engagements[0];

    setActiveEngagementIdState((selectedEngagementId) => {
      if (
        !userChanged &&
        selectedEngagementId &&
        scopedDataset.engagements.some(
          (engagement) => engagement.id === selectedEngagementId,
        )
      ) {
        return selectedEngagementId;
      }

      if (
        savedEngagementId &&
        scopedDataset.engagements.some(
          (engagement) => engagement.id === savedEngagementId,
        )
      ) {
        return savedEngagementId;
      }

      return defaultEngagement?.id ?? null;
    });
    activeEngagementUserIdRef.current = currentUser.id;
  }, [currentUser, scopedDataset]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const storageKey = activeEngagementStorageKey(currentUser.id);
    if (activeEngagementId) {
      window.localStorage.setItem(storageKey, activeEngagementId);
    } else {
      window.localStorage.removeItem(storageKey);
    }
  }, [activeEngagementId, currentUser]);

  return (
    <FabricDataContext.Provider
      value={{
        dataset: scopedDataset,
        activeDataset,
        activeEngagementId,
        activeEngagement,
        activeClient,
        activeSites,
        error,
        isLoading,
        currentUser,
        setCurrentUserId,
        setActiveEngagementId,
        canPerform,
        refresh: loadDataset,
        createClient,
        updateClient,
        createSite,
        updateSite,
        createEngagement,
        updateEngagement,
        completeMethodologyActivity,
        skipMethodologyActivity,
        reopenMethodologyActivity,
        pauseMethodologyRun,
        resumeMethodologyRun,
        promotePreliminarySiteWalk,
        createSiteWalk,
        updateSiteWalk,
        createObservation,
        updateObservation,
        createEvidence,
        createFrictionItem,
        updateFrictionItem,
        createDiagnostic,
        updateDiagnostic,
        saveMaturityAssessment,
        createOpportunity,
        updateOpportunity,
        createAction,
        updateAction,
        createInitiative,
        updateInitiative,
        createMilestone,
        updateMilestone,
        createDeliveryAction,
        updateDeliveryAction,
        createBenefitMeasurement,
        updateBenefitMeasurement,
        createRoadmap,
        updateRoadmap,
        createOutput,
        updateOutput,
        regenerateOutputReport,
        createOutputRevision,
        createOutputReviewComment,
        resolveOutputReviewComment,
        recordOutputExport,
        createKnowledgeEntry,
        updateKnowledgeEntry,
        createLandscapeEntity,
        updateLandscapeEntity,
        createLandscapeRelationship,
        updateLandscapeRelationship,
        captureLandscapeVersion,
        repositorySource: repository.source,
      }}
    >
      {children}
    </FabricDataContext.Provider>
  );
}

export function useFabricData() {
  const context = useContext(FabricDataContext);

  if (!context) {
    throw new Error('useFabricData must be used inside a FabricDataProvider.');
  }

  return context;
}
