import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  EntityId,
  Evidence,
  FabricDataset,
  FabricRepository,
  FrictionItem,
  Observation,
  MaturityAssessment,
  ActionItem,
  BenefitMeasurement,
  DeliveryAction,
  Initiative,
  Milestone,
  Roadmap,
  Opportunity,
  Output,
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
  isOpportunityReadyForDelivery,
  permissionForVisibilityTransition,
  prepareControlledOutputUpdate,
  prepareControlledOpportunityUpdate,
} from '@domain';
import {
  createAuthorizationActor,
  createImmutableSnapshot,
} from './immutable-snapshot';

interface FabricDataContextValue {
  dataset: FabricDataset | null;
  error: string | null;
  isLoading: boolean;
  currentUser: User | null;
  setCurrentUserId: (userId: EntityId) => void;
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
  createEngagement: (
    input: Omit<Engagement, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Engagement>;
  updateEngagement: (engagement: Engagement) => Promise<void>;
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
  createOutput: (
    input: Omit<Output, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Output>;
  updateOutput: (output: Output) => Promise<void>;
  repositorySource: RepositorySource;
}

const FabricDataContext = createContext<FabricDataContextValue | undefined>(
  undefined,
);

interface FabricDataProviderProps {
  children: ReactNode;
  repository: FabricRepository;
}

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
  | 'opportunities'
  | 'actionItems'
  | 'initiatives'
  | 'roadmaps'
  | 'milestones'
  | 'deliveryActions'
  | 'benefitMeasurements'
  | 'outputs';

interface ActivityTrackedRecord extends BaseEntity {
  approvalState?: string;
  status?: string;
  visibility?: VisibilityScope;
  reviewStatus?: string;
  ownerUserId?: EntityId;
  title?: string;
  name?: string;
  summary?: string;
}

interface DatasetChange {
  collection: ActivityCollection;
  previous?: ActivityTrackedRecord;
  next?: ActivityTrackedRecord;
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
  'opportunities',
  'actionItems',
  'initiatives',
  'roadmaps',
  'milestones',
  'deliveryActions',
  'benefitMeasurements',
  'outputs',
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
  opportunities: 'opportunity',
  actionItems: 'action',
  initiatives: 'initiative',
  roadmaps: 'roadmap',
  milestones: 'milestone',
  deliveryActions: 'delivery-action',
  benefitMeasurements: 'benefit-measurement',
  outputs: 'output',
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
      const evidenceItem = dataset.evidence.find((item) => item.id === record.id);
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
      return diagnosticId ? findDiagnosticEngagementId(diagnosticId) : undefined;
    }
    case 'findings': {
      const diagnosticId = dataset.findings.find(
        (item) => item.id === record.id,
      )?.diagnosticId;
      return diagnosticId ? findDiagnosticEngagementId(diagnosticId) : undefined;
    }
    case 'landscapeEntities':
      return dataset.landscapeEntities.find((item) => item.id === record.id)
        ?.engagementId;
    case 'landscapeRelationships':
      return dataset.landscapeRelationships.find((item) => item.id === record.id)
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
      return initiativeId ? findInitiativeEngagementId(initiativeId) : undefined;
    }
    case 'deliveryActions': {
      const initiativeId = dataset.deliveryActions.find(
        (item) => item.id === record.id,
      )?.initiativeId;
      return initiativeId ? findInitiativeEngagementId(initiativeId) : undefined;
    }
    case 'benefitMeasurements': {
      const initiativeId = dataset.benefitMeasurements.find(
        (item) => item.id === record.id,
      )?.initiativeId;
      return initiativeId ? findInitiativeEngagementId(initiativeId) : undefined;
    }
    case 'outputs':
      return dataset.outputs.find((item) => item.id === record.id)?.engagementId;
    case 'clients':
    case 'sites':
      return undefined;
  }
}

function permissionForChange(change: DatasetChange): WorkspacePermission {
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
    change.collection === 'landscapeRelationships'
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
    return 'created';
  }

  if (!next || next.visibility === 'archived') {
    return 'archived';
  }

  if (previous.ownerUserId !== next.ownerUserId && next.ownerUserId) {
    return 'assigned';
  }

  if (previous.status !== next.status) {
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
      change.collection === 'opportunities' &&
      next.status === 'approved' &&
      next.approvalState === 'approved' &&
      next.reviewStatus === 'approved'
    ) {
      return 'approved';
    }

    return 'status-changed';
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
  const recordLabel = record.title ?? record.name ?? record.summary ?? 'record';
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
  const currentUser = dataset
    ? dataset.users.find((user) => user.id === selectedUserId) ??
      dataset.users[0] ??
      null
    : null;
  const actingUser = useMemo(
    () => (currentUser ? createAuthorizationActor(currentUser) : null),
    [currentUser],
  );

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
        throw new Error('Select an internal user before changing workspace data.');
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
            ? dataset.engagements.find(
                (item) => item.id === sourceEngagementId,
              )
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
    async (input: Omit<Engagement, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.clients.some((client) => client.id === input.clientId) ||
        input.siteIds.some(
          (siteId) =>
            dataset.sites.find((site) => site.id === siteId)?.clientId !==
            input.clientId,
        )
      ) {
        throw new Error(
          'Select a valid client and site coverage for this engagement.',
        );
      }
      const created = {
        ...input,
        id: createId('engagement'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        engagements: [...dataset.engagements, created],
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
        throw new Error('Select an internal user before recording an observation.');
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
      assertOpportunityApprovalCanBeRevoked(
        dataset,
        existing,
        nextOpportunity,
      );
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
    async (input: Omit<Output, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.engagements.some((item) => item.id === input.engagementId)
      )
        throw new Error('Select a valid engagement for this output.');
      if (input.status !== 'draft' || input.visibility !== 'internal') {
        throw new Error(
          'New controlled outputs must start as internal drafts.',
        );
      }
      if (!actingUser) {
        throw new Error('Select an internal user before creating an output.');
      }
      const created = {
        ...input,
        id: createId('output'),
        createdAt: now(),
        updatedAt: now(),
        createdByUserId: actingUser.id,
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
      const nextOutput = prepareControlledOutputUpdate(
        existing,
        output,
        actingUser.id,
        now(),
      );
      await persist({
        ...dataset,
        outputs: replaceExistingRecord(
          dataset.outputs,
          nextOutput,
          now(),
          'output',
        ),
      });
    },
    [actingUser, dataset, persist],
  );

  useEffect(() => {
    void loadDataset();
  }, [loadDataset]);

  return (
    <FabricDataContext.Provider
      value={{
        dataset,
        error,
        isLoading,
        currentUser,
        setCurrentUserId,
        canPerform,
        refresh: loadDataset,
        createClient,
        updateClient,
        createSite,
        updateSite,
        createEngagement,
        updateEngagement,
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
