import type {
  EntityId,
  FabricDataset,
  LandscapeEntity,
  LandscapeEntitySnapshot,
  LandscapeEntityType,
  LandscapeRelationship,
  LandscapeRelationshipSnapshot,
  LandscapeRelationshipType,
  LandscapeVersion,
  LandscapeVerificationState,
} from './model';

export const landscapeViews = [
  'process',
  'systems',
  'data-flow',
  'people',
  'opportunities',
] as const;
export type LandscapeView = (typeof landscapeViews)[number];

export const landscapeViewLabels: Record<LandscapeView, string> = {
  process: 'Process view',
  systems: 'Systems view',
  'data-flow': 'Data flow view',
  people: 'People & responsibility',
  opportunities: 'Opportunity overlay',
};

const allLandscapeEntityTypes: readonly LandscapeEntityType[] = [
  'area',
  'process',
  'process-step',
  'system',
  'data-object',
  'role',
  'machine',
  'handoff',
];

export interface LandscapeRelationshipDefinition {
  label: string;
  fromTypes: readonly LandscapeEntityType[];
  toTypes: readonly LandscapeEntityType[];
  views: readonly LandscapeView[];
}

export const landscapeRelationshipDefinitions: Record<
  LandscapeRelationshipType,
  LandscapeRelationshipDefinition
> = {
  'contains-process': {
    label: 'contains process',
    fromTypes: ['area'],
    toTypes: ['process'],
    views: ['process'],
  },
  'contains-process-step': {
    label: 'contains process step',
    fromTypes: ['process'],
    toTypes: ['process-step'],
    views: ['process'],
  },
  'uses-system': {
    label: 'uses system',
    fromTypes: ['process'],
    toTypes: ['system'],
    views: ['process', 'systems'],
  },
  'produces-data': {
    label: 'produces data',
    fromTypes: ['process', 'system', 'machine'],
    toTypes: ['data-object'],
    views: ['process', 'systems', 'data-flow'],
  },
  'consumes-data': {
    label: 'consumes data',
    fromTypes: ['process', 'system'],
    toTypes: ['data-object'],
    views: ['process', 'systems', 'data-flow'],
  },
  'exchanges-data': {
    label: 'exchanges data',
    fromTypes: ['system'],
    toTypes: ['system'],
    views: ['systems', 'data-flow'],
  },
  'performs-process': {
    label: 'performs process',
    fromTypes: ['role'],
    toTypes: ['process'],
    views: ['process', 'people'],
  },
  'produces-machine-data': {
    label: 'produces machine data',
    fromTypes: ['machine'],
    toTypes: ['data-object'],
    views: ['systems', 'data-flow'],
  },
  'depends-on-process': {
    label: 'depends on process',
    fromTypes: ['process'],
    toTypes: ['process'],
    views: ['process'],
  },
  'has-handoff': {
    label: 'has handoff',
    fromTypes: ['process'],
    toTypes: ['handoff'],
    views: ['process', 'data-flow'],
  },
  'hands-off-to-process': {
    label: 'hands off to process',
    fromTypes: ['process'],
    toTypes: ['process'],
    views: ['process', 'data-flow'],
  },
  'observation-relates': {
    label: 'observation relates',
    fromTypes: allLandscapeEntityTypes,
    toTypes: allLandscapeEntityTypes,
    views: ['process', 'systems', 'data-flow', 'people', 'opportunities'],
  },
  'opportunity-improves': {
    label: 'opportunity improves',
    fromTypes: allLandscapeEntityTypes,
    toTypes: allLandscapeEntityTypes,
    views: ['opportunities'],
  },
};

const transferRelationshipTypes = new Set<LandscapeRelationshipType>([
  'produces-data',
  'consumes-data',
  'exchanges-data',
  'hands-off-to-process',
]);

export function isLandscapeRelationshipCompatible(
  relationshipType: LandscapeRelationshipType,
  fromEntityType: LandscapeEntityType,
  toEntityType: LandscapeEntityType,
) {
  const definition = landscapeRelationshipDefinitions[relationshipType];

  return (
    definition.fromTypes.includes(fromEntityType) &&
    definition.toTypes.includes(toEntityType)
  );
}

export function canRecordLandscapeTransfer(
  relationshipType: LandscapeRelationshipType,
) {
  return transferRelationshipTypes.has(relationshipType);
}

export function isClientSafeLandscapeEntity(
  entity: Pick<LandscapeEntity, 'reviewStatus' | 'visibility'>,
) {
  return (
    entity.reviewStatus === 'approved' &&
    entity.visibility === 'approved-client-facing'
  );
}

export function isClientSafeLandscapeRelationship(
  relationship: Pick<LandscapeRelationship, 'reviewStatus' | 'visibility'>,
) {
  return (
    relationship.reviewStatus === 'approved' &&
    relationship.visibility === 'approved-client-facing'
  );
}

function toEntitySnapshot(entity: LandscapeEntity): LandscapeEntitySnapshot {
  return {
    landscapeEntityId: entity.id,
    siteId: entity.siteId,
    type: entity.type,
    name: entity.name,
    description: entity.description,
    sourceEntityId: entity.sourceEntityId,
    ownerRole: entity.ownerRole,
    ownerEntityId: entity.ownerEntityId,
    documentedMethod: entity.documentedMethod,
    confidence: entity.confidence,
    verificationStatus: entity.verificationStatus,
    linkedObservationIds: [...entity.linkedObservationIds],
    linkedEvidenceIds: [...entity.linkedEvidenceIds],
    linkedFrictionItemIds: [...entity.linkedFrictionItemIds],
    linkedOpportunityIds: [...entity.linkedOpportunityIds],
    visibility: entity.visibility,
    reviewStatus: entity.reviewStatus,
  };
}

function toRelationshipSnapshot(
  relationship: LandscapeRelationship,
): LandscapeRelationshipSnapshot {
  return {
    landscapeRelationshipId: relationship.id,
    fromEntityId: relationship.fromEntityId,
    toEntityId: relationship.toEntityId,
    type: relationship.type,
    rationale: relationship.rationale,
    evidenceIds: [...relationship.evidenceIds],
    linkedObservationIds: [...relationship.linkedObservationIds],
    linkedOpportunityIds: [...relationship.linkedOpportunityIds],
    transferMode: relationship.transferMode,
    duplicateDataEntry: relationship.duplicateDataEntry,
    confidence: relationship.confidence,
    verificationStatus: relationship.verificationStatus,
    visibility: relationship.visibility,
    reviewStatus: relationship.reviewStatus,
  };
}

export function createLandscapeSnapshot(
  entities: LandscapeEntity[],
  relationships: LandscapeRelationship[],
) {
  const sortedEntities = [...entities].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
  const entityIds = new Set(sortedEntities.map((entity) => entity.id));
  const sortedRelationships = relationships
    .filter(
      (relationship) =>
        entityIds.has(relationship.fromEntityId) &&
        entityIds.has(relationship.toEntityId),
    )
    .sort((left, right) => left.id.localeCompare(right.id));

  return {
    entities: sortedEntities.map(toEntitySnapshot),
    relationships: sortedRelationships.map(toRelationshipSnapshot),
  };
}

export function createLandscapeVersionSnapshot(
  dataset: FabricDataset,
  engagementId: EntityId,
  siteId?: EntityId,
) {
  const entities = dataset.landscapeEntities.filter(
    (entity) =>
      entity.engagementId === engagementId &&
      (!siteId || entity.siteId === siteId),
  );
  const entityIds = new Set(entities.map((entity) => entity.id));
  const relationships = dataset.landscapeRelationships.filter(
    (relationship) =>
      relationship.engagementId === engagementId &&
      entityIds.has(relationship.fromEntityId) &&
      entityIds.has(relationship.toEntityId),
  );

  return createLandscapeSnapshot(entities, relationships);
}

export type LandscapeQualityIndicatorKind =
  | 'process-without-owner'
  | 'process-without-system-or-method'
  | 'manual-handoff'
  | 'duplicate-data-entry'
  | 'data-object-without-owner'
  | 'unvalidated-system-relationship'
  | 'process-with-friction-observation'
  | 'opportunity-without-mapped-process';

export interface LandscapeQualityIndicator {
  id: string;
  kind: LandscapeQualityIndicatorKind;
  tone: 'warning' | 'neutral';
  title: string;
  detail: string;
  entityId?: EntityId;
  relationshipId?: EntityId;
  opportunityId?: EntityId;
}

function hasLandscapeOwner(
  entity: LandscapeEntity,
  relationships: LandscapeRelationship[],
) {
  return (
    Boolean(entity.ownerRole || entity.ownerEntityId) ||
    relationships.some(
      (relationship) =>
        relationship.type === 'performs-process' &&
        relationship.toEntityId === entity.id,
    )
  );
}

function entityName(
  entitiesById: Map<EntityId, LandscapeEntity>,
  entityId: EntityId,
) {
  return entitiesById.get(entityId)?.name ?? 'Unnamed landscape item';
}

export function buildLandscapeQualityIndicators(
  dataset: FabricDataset,
  engagementId: EntityId,
): LandscapeQualityIndicator[] {
  const entities = dataset.landscapeEntities.filter(
    (entity) => entity.engagementId === engagementId,
  );
  const entityIds = new Set(entities.map((entity) => entity.id));
  const relationships = dataset.landscapeRelationships.filter(
    (relationship) =>
      relationship.engagementId === engagementId &&
      entityIds.has(relationship.fromEntityId) &&
      entityIds.has(relationship.toEntityId),
  );
  const entitiesById = new Map(entities.map((entity) => [entity.id, entity]));
  const indicators: LandscapeQualityIndicator[] = [];

  entities
    .filter(
      (entity) =>
        entity.type === 'process' && !hasLandscapeOwner(entity, relationships),
    )
    .forEach((entity) => {
      indicators.push({
        id: `process-owner-${entity.id}`,
        kind: 'process-without-owner',
        tone: 'warning',
        title: 'Process without an owner',
        detail: `${entity.name} has no recorded accountable role or person group.`,
        entityId: entity.id,
      });
    });

  entities
    .filter((entity) => entity.type === 'process')
    .forEach((entity) => {
      const hasSystem = relationships.some(
        (relationship) =>
          relationship.type === 'uses-system' &&
          relationship.fromEntityId === entity.id,
      );
      if (!hasSystem && !entity.documentedMethod) {
        indicators.push({
          id: `process-method-${entity.id}`,
          kind: 'process-without-system-or-method',
          tone: 'warning',
          title: 'Process without a system or documented method',
          detail: `${entity.name} is not connected to a system and has no documented method.`,
          entityId: entity.id,
        });
      }
    });

  relationships
    .filter((relationship) => relationship.transferMode === 'manual')
    .forEach((relationship) => {
      indicators.push({
        id: `manual-transfer-${relationship.id}`,
        kind: 'manual-handoff',
        tone: 'neutral',
        title: 'Manual information transfer',
        detail: `${entityName(
          entitiesById,
          relationship.fromEntityId,
        )} manually transfers information to ${entityName(
          entitiesById,
          relationship.toEntityId,
        )}.`,
        relationshipId: relationship.id,
      });
    });

  relationships
    .filter((relationship) => relationship.duplicateDataEntry)
    .forEach((relationship) => {
      indicators.push({
        id: `duplicate-entry-${relationship.id}`,
        kind: 'duplicate-data-entry',
        tone: 'warning',
        title: 'Potential duplicate data entry',
        detail: `${entityName(
          entitiesById,
          relationship.fromEntityId,
        )} may require the same information to be entered again for ${entityName(
          entitiesById,
          relationship.toEntityId,
        )}.`,
        relationshipId: relationship.id,
      });
    });

  entities
    .filter(
      (entity) =>
        entity.type === 'data-object' &&
        !hasLandscapeOwner(entity, relationships),
    )
    .forEach((entity) => {
      indicators.push({
        id: `data-owner-${entity.id}`,
        kind: 'data-object-without-owner',
        tone: 'warning',
        title: 'Data object with an unclear owner',
        detail: `${entity.name} has no recorded accountable role or person group.`,
        entityId: entity.id,
      });
    });

  relationships
    .filter((relationship) => {
      const from = entitiesById.get(relationship.fromEntityId);
      const to = entitiesById.get(relationship.toEntityId);
      return (
        (from?.type === 'system' || to?.type === 'system') &&
        relationship.verificationStatus !== 'confirmed'
      );
    })
    .forEach((relationship) => {
      indicators.push({
        id: `system-validation-${relationship.id}`,
        kind: 'unvalidated-system-relationship',
        tone: 'neutral',
        title: 'System relationship needs validation',
        detail: `${entityName(
          entitiesById,
          relationship.fromEntityId,
        )} and ${entityName(
          entitiesById,
          relationship.toEntityId,
        )} are recorded as ${relationship.verificationStatus.replace(
          /-/g,
          ' ',
        )}.`,
        relationshipId: relationship.id,
      });
    });

  entities
    .filter(
      (entity) =>
        entity.type === 'process' && entity.linkedFrictionItemIds.length > 0,
    )
    .forEach((entity) => {
      indicators.push({
        id: `process-friction-${entity.id}`,
        kind: 'process-with-friction-observation',
        tone: 'neutral',
        title: 'Process has linked friction observations',
        detail: `${entity.name} is linked to ${entity.linkedFrictionItemIds.length} captured friction ${
          entity.linkedFrictionItemIds.length === 1 ? 'item' : 'items'
        }.`,
        entityId: entity.id,
      });
    });

  const processEntities = entities.filter(
    (entity) => entity.type === 'process',
  );
  const relationshipOpportunityIds = new Set(
    relationships.flatMap((relationship) => relationship.linkedOpportunityIds),
  );
  const entityOpportunityIds = new Set(
    entities.flatMap((entity) => entity.linkedOpportunityIds),
  );
  dataset.opportunities
    .filter(
      (opportunity) =>
        opportunity.engagementId === engagementId &&
        opportunity.visibility !== 'archived',
    )
    .forEach((opportunity) => {
      const hasMappedProcess =
        processEntities.some(
          (entity) =>
            entity.sourceEntityId === opportunity.processId ||
            entity.linkedOpportunityIds.includes(opportunity.id),
        ) ||
        relationshipOpportunityIds.has(opportunity.id) ||
        entityOpportunityIds.has(opportunity.id);
      if (!hasMappedProcess) {
        indicators.push({
          id: `opportunity-process-${opportunity.id}`,
          kind: 'opportunity-without-mapped-process',
          tone: 'neutral',
          title: 'Opportunity without a mapped process',
          detail: `${opportunity.title} is not linked to a mapped process.`,
          opportunityId: opportunity.id,
        });
      }
    });

  return indicators;
}

export interface LandscapeA3Projection {
  title: string;
  clientName: string;
  siteName: string;
  date: string;
  version: string;
  legend: Array<{ key: LandscapeEntityType; label: string }>;
  entities: Array<{
    id: EntityId;
    label: string;
    type: LandscapeEntityType;
    description: string;
    owner?: string;
    verificationStatus: LandscapeVerificationState;
  }>;
  relationships: Array<{
    id: EntityId;
    fromEntityId: EntityId;
    toEntityId: EntityId;
    label: string;
    transferMode?: 'manual' | 'automated';
  }>;
}

function labelise(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function snapshotForVersion(version: LandscapeVersion) {
  return {
    entities: version.entities,
    relationships: version.relationships,
  };
}

export function buildApprovedLandscapeA3Projection(
  dataset: FabricDataset,
  engagementId: EntityId,
  versionId?: EntityId,
): LandscapeA3Projection | undefined {
  const engagement = dataset.engagements.find(
    (item) => item.id === engagementId,
  );
  if (!engagement) {
    return undefined;
  }

  const version =
    (versionId
      ? dataset.landscapeVersions.find(
          (item) => item.id === versionId && item.engagementId === engagementId,
        )
      : undefined) ??
    dataset.landscapeVersions
      .filter(
        (item) =>
          item.engagementId === engagementId && item.status === 'current',
      )
      .sort((left, right) =>
        right.capturedAt.localeCompare(left.capturedAt),
      )[0];
  if (!version) {
    return undefined;
  }

  const snapshot = snapshotForVersion(version);
  const entities = snapshot.entities.filter(
    (entity) =>
      entity.reviewStatus === 'approved' &&
      entity.visibility === 'approved-client-facing',
  );
  const entityIds = new Set(entities.map((entity) => entity.landscapeEntityId));
  const relationships = snapshot.relationships.filter(
    (relationship) =>
      relationship.reviewStatus === 'approved' &&
      relationship.visibility === 'approved-client-facing' &&
      entityIds.has(relationship.fromEntityId) &&
      entityIds.has(relationship.toEntityId),
  );
  const site = dataset.sites.find(
    (item) =>
      item.id === version.siteId ||
      (!version.siteId && engagement.siteIds.includes(item.id)),
  );
  const client = dataset.clients.find(
    (item) => item.id === engagement.clientId,
  );

  return {
    title: version.title,
    clientName: client?.name ?? 'Unknown client',
    siteName: site?.name ?? 'Engagement scope',
    date: version.capturedAt,
    version: version.version,
    legend: allLandscapeEntityTypes.map((type) => ({
      key: type,
      label: labelise(type),
    })),
    entities: entities.map((entity) => ({
      id: entity.landscapeEntityId,
      label: entity.name,
      type: entity.type,
      description: entity.description,
      owner: entity.ownerRole,
      verificationStatus: entity.verificationStatus,
    })),
    relationships: relationships.map((relationship) => ({
      id: relationship.landscapeRelationshipId,
      fromEntityId: relationship.fromEntityId,
      toEntityId: relationship.toEntityId,
      label: landscapeRelationshipDefinitions[relationship.type].label,
      transferMode: relationship.transferMode,
    })),
  };
}
