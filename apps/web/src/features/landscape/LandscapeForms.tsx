import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import type {
  ConfidenceLevel,
  FabricDataset,
  LandscapeEntity,
  LandscapeEntityType,
  LandscapeRelationship,
  LandscapeRelationshipType,
  LandscapeTransferMode,
  LandscapeVerificationState,
  ReviewStatus,
  VisibilityScope,
} from '@domain';
import {
  canRecordLandscapeTransfer,
  confidenceLevels,
  landscapeEntityTypes,
  landscapeRelationshipDefinitions,
  landscapeRelationshipTypes,
  landscapeTransferModes,
  landscapeVerificationStates,
  reviewStatuses,
  visibilityScopes,
} from '@domain';
import { Button } from '@ui';

import type {
  CreateLandscapeEntityInput,
  CreateLandscapeRelationshipInput,
} from '@app/features/fabric-data/FabricDataContext';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';

interface FieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
}

function Field({ label, children, hint }: FieldProps) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function labelise(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function optional(value: string) {
  return value.trim() || undefined;
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function isEvidenceInEngagement(
  dataset: FabricDataset,
  evidenceId: string,
  engagementId: string,
) {
  const evidence = dataset.evidence.find((item) => item.id === evidenceId);
  if (!evidence) {
    return false;
  }
  const siteWalkIds = new Set(
    dataset.siteWalks
      .filter((item) => item.engagementId === engagementId)
      .map((item) => item.id),
  );
  const observationIds = new Set(
    dataset.observations
      .filter((item) => siteWalkIds.has(item.siteWalkId))
      .map((item) => item.id),
  );
  return (
    (evidence.siteWalkId ? siteWalkIds.has(evidence.siteWalkId) : false) ||
    (evidence.observationId
      ? observationIds.has(evidence.observationId)
      : false) ||
    (evidence.relatedEntityType === 'engagement' &&
      evidence.relatedEntityId === engagementId) ||
    (evidence.relatedEntityType === 'site-walk' &&
      siteWalkIds.has(evidence.relatedEntityId)) ||
    (evidence.relatedEntityType === 'observation' &&
      observationIds.has(evidence.relatedEntityId)) ||
    (evidence.relatedEntityType === 'opportunity' &&
      dataset.opportunities.some(
        (item) =>
          item.id === evidence.relatedEntityId &&
          item.engagementId === engagementId,
      ))
  );
}

function LinkedRecordsFieldset({
  dataset,
  engagementId,
  selectedObservationIds,
  onObservationIdsChange,
  selectedEvidenceIds,
  onEvidenceIdsChange,
  selectedFrictionItemIds,
  onFrictionItemIdsChange,
  selectedOpportunityIds,
  onOpportunityIdsChange,
  includeFrictionItems = true,
}: {
  dataset: FabricDataset;
  engagementId: string;
  selectedObservationIds: string[];
  onObservationIdsChange: (ids: string[]) => void;
  selectedEvidenceIds: string[];
  onEvidenceIdsChange: (ids: string[]) => void;
  selectedFrictionItemIds: string[];
  onFrictionItemIdsChange: (ids: string[]) => void;
  selectedOpportunityIds: string[];
  onOpportunityIdsChange: (ids: string[]) => void;
  includeFrictionItems?: boolean;
}) {
  const scopedSiteWalkIds = useMemo(
    () =>
      new Set(
        dataset.siteWalks
          .filter((item) => item.engagementId === engagementId)
          .map((item) => item.id),
      ),
    [dataset.siteWalks, engagementId],
  );
  const observations = dataset.observations.filter((item) =>
    scopedSiteWalkIds.has(item.siteWalkId),
  );
  const evidence = dataset.evidence.filter((item) =>
    isEvidenceInEngagement(dataset, item.id, engagementId),
  );
  const frictionItems = dataset.frictionItems.filter((item) =>
    scopedSiteWalkIds.has(item.siteWalkId),
  );
  const opportunities = dataset.opportunities.filter(
    (item) =>
      item.engagementId === engagementId && item.visibility !== 'archived',
  );

  return (
    <fieldset className="form-fieldset">
      <legend>Traceability links</legend>
      <div className="landscape-link-groups">
        <div>
          <strong>Observations</strong>
          {observations.length === 0 ? (
            <p className="body-copy body-copy--small">
              No observations available.
            </p>
          ) : (
            observations.map((observation) => (
              <label className="checkbox-row" key={observation.id}>
                <input
                  type="checkbox"
                  checked={selectedObservationIds.includes(observation.id)}
                  onChange={() =>
                    onObservationIdsChange(
                      toggleValue(selectedObservationIds, observation.id),
                    )
                  }
                />
                {observation.summary}
              </label>
            ))
          )}
        </div>
        <div>
          <strong>Evidence</strong>
          {evidence.length === 0 ? (
            <p className="body-copy body-copy--small">No evidence available.</p>
          ) : (
            evidence.map((item) => (
              <label className="checkbox-row" key={item.id}>
                <input
                  type="checkbox"
                  checked={selectedEvidenceIds.includes(item.id)}
                  onChange={() =>
                    onEvidenceIdsChange(
                      toggleValue(selectedEvidenceIds, item.id),
                    )
                  }
                />
                {item.title}
              </label>
            ))
          )}
        </div>
        {includeFrictionItems ? (
          <div>
            <strong>Friction items</strong>
            {frictionItems.length === 0 ? (
              <p className="body-copy body-copy--small">
                No friction items available.
              </p>
            ) : (
              frictionItems.map((item) => (
                <label className="checkbox-row" key={item.id}>
                  <input
                    type="checkbox"
                    checked={selectedFrictionItemIds.includes(item.id)}
                    onChange={() =>
                      onFrictionItemIdsChange(
                        toggleValue(selectedFrictionItemIds, item.id),
                      )
                    }
                  />
                  {item.frictionPoint}
                </label>
              ))
            )}
          </div>
        ) : null}
        <div>
          <strong>Opportunities</strong>
          {opportunities.length === 0 ? (
            <p className="body-copy body-copy--small">
              No active opportunities available.
            </p>
          ) : (
            opportunities.map((item) => (
              <label className="checkbox-row" key={item.id}>
                <input
                  type="checkbox"
                  checked={selectedOpportunityIds.includes(item.id)}
                  onChange={() =>
                    onOpportunityIdsChange(
                      toggleValue(selectedOpportunityIds, item.id),
                    )
                  }
                />
                {item.title}
              </label>
            ))
          )}
        </div>
      </div>
    </fieldset>
  );
}

interface LandscapeEntityFormProps {
  dataset: FabricDataset;
  engagementId: string;
  entity?: LandscapeEntity;
  onSaved?: (entity: LandscapeEntity) => void;
}

export function LandscapeEntityForm({
  dataset,
  engagementId,
  entity,
  onSaved,
}: LandscapeEntityFormProps) {
  const { createLandscapeEntity, updateLandscapeEntity } = useFabricData();
  const engagement = dataset.engagements.find(
    (item) => item.id === engagementId,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [type, setType] = useState<LandscapeEntityType>(
    entity?.type ?? 'process',
  );
  const [siteId, setSiteId] = useState(
    entity?.siteId ?? engagement?.siteIds[0] ?? '',
  );
  const [sourceEntityId, setSourceEntityId] = useState(
    entity?.sourceEntityId ?? '',
  );
  const [name, setName] = useState(entity?.name ?? '');
  const [description, setDescription] = useState(entity?.description ?? '');
  const [ownerRole, setOwnerRole] = useState(entity?.ownerRole ?? '');
  const [ownerEntityId, setOwnerEntityId] = useState(
    entity?.ownerEntityId ?? '',
  );
  const [documentedMethod, setDocumentedMethod] = useState(
    entity?.documentedMethod ?? '',
  );
  const [confidence, setConfidence] = useState<ConfidenceLevel>(
    entity?.confidence ?? 'medium',
  );
  const [verificationStatus, setVerificationStatus] =
    useState<LandscapeVerificationState>(
      entity?.verificationStatus ?? 'to-be-validated',
    );
  const [internalNotes, setInternalNotes] = useState(
    entity?.internalNotes ?? '',
  );
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    entity?.reviewStatus ?? 'draft',
  );
  const [visibility, setVisibility] = useState<VisibilityScope>(
    entity?.visibility ?? 'internal',
  );
  const [canonicalAreaId, setCanonicalAreaId] = useState(() => {
    if (entity?.type !== 'process' || !entity.sourceEntityId) {
      return '';
    }
    return (
      dataset.processes.find((item) => item.id === entity.sourceEntityId)
        ?.areaId ?? ''
    );
  });
  const [relatedSystemIds, setRelatedSystemIds] = useState<string[]>(() => {
    if (entity?.type !== 'process' || !entity.sourceEntityId) {
      return [];
    }
    return (
      dataset.processes.find((item) => item.id === entity.sourceEntityId)
        ?.relatedSystemIds ?? []
    );
  });
  const [systemCategory, setSystemCategory] = useState('');
  const [systemOwnerTeam, setSystemOwnerTeam] = useState('');
  const [linkedObservationIds, setLinkedObservationIds] = useState(
    entity?.linkedObservationIds ?? [],
  );
  const [linkedEvidenceIds, setLinkedEvidenceIds] = useState(
    entity?.linkedEvidenceIds ?? [],
  );
  const [linkedFrictionItemIds, setLinkedFrictionItemIds] = useState(
    entity?.linkedFrictionItemIds ?? [],
  );
  const [linkedOpportunityIds, setLinkedOpportunityIds] = useState(
    entity?.linkedOpportunityIds ?? [],
  );

  const scopedAreas = dataset.areas.filter((item) => item.siteId === siteId);
  const scopedSystems = dataset.systems.filter(
    (item) => item.siteId === siteId,
  );
  const representedSourceIds = new Set(
    dataset.landscapeEntities
      .filter(
        (item) => item.engagementId === engagementId && item.id !== entity?.id,
      )
      .map((item) => item.sourceEntityId)
      .filter((item): item is string => Boolean(item)),
  );
  const availableSourceRecords =
    type === 'area'
      ? scopedAreas
      : type === 'process'
        ? dataset.processes.filter((item) => item.siteId === siteId)
        : type === 'system'
          ? scopedSystems
          : [];
  const sourceLabel =
    type === 'area'
      ? 'operational area'
      : type === 'process'
        ? 'process'
        : 'system';
  const roleRecords = dataset.landscapeEntities.filter(
    (item) => item.engagementId === engagementId && item.type === 'role',
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      if (!siteId) {
        throw new Error('Select a site for the landscape item.');
      }
      const common = {
        engagementId,
        siteId,
        type,
        name: name.trim(),
        description: description.trim(),
        ownerRole: optional(ownerRole),
        ownerEntityId: optional(ownerEntityId),
        documentedMethod: optional(documentedMethod),
        confidence,
        verificationStatus,
        linkedObservationIds,
        linkedEvidenceIds,
        linkedFrictionItemIds,
        linkedOpportunityIds,
        internalNotes: optional(internalNotes),
      };
      if (entity) {
        const updated: LandscapeEntity = {
          ...entity,
          ...common,
          reviewStatus,
          visibility,
        };
        await updateLandscapeEntity(updated);
        onSaved?.(updated);
      } else {
        const input: CreateLandscapeEntityInput = {
          ...common,
          sourceEntityId: optional(sourceEntityId),
          canonicalAreaId: optional(canonicalAreaId),
          relatedSystemIds,
          systemCategory: optional(systemCategory),
          systemOwnerTeam: optional(systemOwnerTeam),
        };
        const created = await createLandscapeEntity(input);
        onSaved?.(created);
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to save the landscape item.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="entity-form" onSubmit={submit}>
      <div className="form-grid">
        <Field label="Landscape item type">
          <select
            value={type}
            disabled={Boolean(entity)}
            onChange={(event) => {
              setType(event.target.value as LandscapeEntityType);
              setSourceEntityId('');
              setCanonicalAreaId('');
              setRelatedSystemIds([]);
            }}
          >
            {landscapeEntityTypes.map((item) => (
              <option key={item} value={item}>
                {labelise(item)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Site">
          <select
            required
            value={siteId}
            disabled={Boolean(entity)}
            onChange={(event) => {
              setSiteId(event.target.value);
              setSourceEntityId('');
              setCanonicalAreaId('');
              setRelatedSystemIds([]);
            }}
          >
            <option value="">Select a site</option>
            {dataset.sites
              .filter((site) => engagement?.siteIds.includes(site.id))
              .map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
          </select>
        </Field>
        {availableSourceRecords.length > 0 ? (
          <Field
            label={`Link an existing ${sourceLabel}`}
            hint="Leave this as a new record to add canonical area, process, or system context."
          >
            <select
              value={sourceEntityId}
              disabled={Boolean(entity)}
              onChange={(event) => {
                const nextSourceId = event.target.value;
                setSourceEntityId(nextSourceId);
                const source = availableSourceRecords.find(
                  (item) => item.id === nextSourceId,
                );
                if (source) {
                  setName(source.name);
                  setDescription(source.description);
                }
              }}
            >
              <option value="">Create a new {sourceLabel}</option>
              {availableSourceRecords
                .filter(
                  (record) =>
                    record.id === entity?.sourceEntityId ||
                    !representedSourceIds.has(record.id),
                )
                .map((record) => (
                  <option key={record.id} value={record.id}>
                    {record.name}
                  </option>
                ))}
            </select>
          </Field>
        ) : null}
        <Field label="Name">
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
      </div>

      {type === 'process' && !sourceEntityId && !entity ? (
        <fieldset className="form-fieldset">
          <legend>Canonical process context</legend>
          <Field label="Operational area">
            <select
              required
              value={canonicalAreaId}
              onChange={(event) => setCanonicalAreaId(event.target.value)}
            >
              <option value="">Select an area</option>
              {scopedAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </Field>
          <div>
            <strong>Associated systems</strong>
            {scopedSystems.length === 0 ? (
              <p className="body-copy body-copy--small">
                Add a system first, or link an existing process.
              </p>
            ) : (
              scopedSystems.map((system) => (
                <label className="checkbox-row" key={system.id}>
                  <input
                    type="checkbox"
                    checked={relatedSystemIds.includes(system.id)}
                    onChange={() =>
                      setRelatedSystemIds(
                        toggleValue(relatedSystemIds, system.id),
                      )
                    }
                  />
                  {system.name}
                </label>
              ))
            )}
          </div>
        </fieldset>
      ) : null}

      {type === 'system' && !sourceEntityId && !entity ? (
        <div className="form-grid">
          <Field label="System category">
            <input
              required
              value={systemCategory}
              onChange={(event) => setSystemCategory(event.target.value)}
              placeholder="e.g. ERP, MES, quality system"
            />
          </Field>
          <Field label="System owner team">
            <input
              required
              value={systemOwnerTeam}
              onChange={(event) => setSystemOwnerTeam(event.target.value)}
              placeholder="e.g. Operations, Quality"
            />
          </Field>
        </div>
      ) : null}

      <Field label="Description">
        <textarea
          required
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>

      <div className="form-grid">
        <Field label="Accountable role / person group">
          <input
            value={ownerRole}
            onChange={(event) => setOwnerRole(event.target.value)}
            placeholder="e.g. Production Supervisor"
          />
        </Field>
        <Field label="Link a role record">
          <select
            value={ownerEntityId}
            onChange={(event) => {
              const nextRoleId = event.target.value;
              setOwnerEntityId(nextRoleId);
              if (!ownerRole) {
                setOwnerRole(
                  roleRecords.find((item) => item.id === nextRoleId)?.name ??
                    '',
                );
              }
            }}
          >
            <option value="">No linked role record</option>
            {roleRecords.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Confidence">
          <select
            value={confidence}
            onChange={(event) =>
              setConfidence(event.target.value as ConfidenceLevel)
            }
          >
            {confidenceLevels.map((item) => (
              <option key={item} value={item}>
                {labelise(item)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Verification state">
          <select
            value={verificationStatus}
            onChange={(event) =>
              setVerificationStatus(
                event.target.value as LandscapeVerificationState,
              )
            }
          >
            {landscapeVerificationStates.map((item) => (
              <option key={item} value={item}>
                {labelise(item)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {type === 'process' ? (
        <Field
          label="Documented method"
          hint="Use this when the process is intentionally not system-supported."
        >
          <textarea
            rows={2}
            value={documentedMethod}
            onChange={(event) => setDocumentedMethod(event.target.value)}
            placeholder="Reference to standard work, document, or agreed method"
          />
        </Field>
      ) : null}

      <LinkedRecordsFieldset
        dataset={dataset}
        engagementId={engagementId}
        selectedObservationIds={linkedObservationIds}
        onObservationIdsChange={setLinkedObservationIds}
        selectedEvidenceIds={linkedEvidenceIds}
        onEvidenceIdsChange={setLinkedEvidenceIds}
        selectedFrictionItemIds={linkedFrictionItemIds}
        onFrictionItemIdsChange={setLinkedFrictionItemIds}
        selectedOpportunityIds={linkedOpportunityIds}
        onOpportunityIdsChange={setLinkedOpportunityIds}
      />

      <Field
        label="Internal working notes"
        hint="Internal only; this field is excluded from the approved A3 projection."
      >
        <textarea
          rows={3}
          value={internalNotes}
          onChange={(event) => setInternalNotes(event.target.value)}
        />
      </Field>

      {entity ? (
        <div className="form-grid">
          <Field label="Review state">
            <select
              value={reviewStatus}
              onChange={(event) =>
                setReviewStatus(event.target.value as ReviewStatus)
              }
            >
              {reviewStatuses.map((item) => (
                <option key={item} value={item}>
                  {labelise(item)}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Visibility"
            hint="Client-facing visibility requires approved review status."
          >
            <select
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as VisibilityScope)
              }
            >
              {visibilityScopes.map((item) => (
                <option key={item} value={item}>
                  {labelise(item)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      ) : (
        <p className="body-copy body-copy--small">
          New landscape items start as internal drafts. Review and client-facing
          visibility are controlled after capture.
        </p>
      )}

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isSaving}>
        {isSaving
          ? 'Saving...'
          : entity
            ? 'Save landscape item'
            : 'Add landscape item'}
      </Button>
    </form>
  );
}

interface LandscapeRelationshipFormProps {
  dataset: FabricDataset;
  engagementId: string;
  relationship?: LandscapeRelationship;
  onSaved?: (relationship: LandscapeRelationship) => void;
}

export function LandscapeRelationshipForm({
  dataset,
  engagementId,
  relationship,
  onSaved,
}: LandscapeRelationshipFormProps) {
  const { createLandscapeRelationship, updateLandscapeRelationship } =
    useFabricData();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [relationshipType, setRelationshipType] =
    useState<LandscapeRelationshipType>(relationship?.type ?? 'uses-system');
  const [fromEntityId, setFromEntityId] = useState(
    relationship?.fromEntityId ?? '',
  );
  const [toEntityId, setToEntityId] = useState(relationship?.toEntityId ?? '');
  const [rationale, setRationale] = useState(relationship?.rationale ?? '');
  const [evidenceIds, setEvidenceIds] = useState(
    relationship?.evidenceIds ?? [],
  );
  const [linkedObservationIds, setLinkedObservationIds] = useState(
    relationship?.linkedObservationIds ?? [],
  );
  const [linkedOpportunityIds, setLinkedOpportunityIds] = useState(
    relationship?.linkedOpportunityIds ?? [],
  );
  const [transferMode, setTransferMode] = useState<LandscapeTransferMode | ''>(
    relationship?.transferMode ?? '',
  );
  const [duplicateDataEntry, setDuplicateDataEntry] = useState(
    relationship?.duplicateDataEntry ?? false,
  );
  const [confidence, setConfidence] = useState<ConfidenceLevel>(
    relationship?.confidence ?? 'medium',
  );
  const [verificationStatus, setVerificationStatus] =
    useState<LandscapeVerificationState>(
      relationship?.verificationStatus ?? 'to-be-validated',
    );
  const [internalNotes, setInternalNotes] = useState(
    relationship?.internalNotes ?? '',
  );
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    relationship?.reviewStatus ?? 'draft',
  );
  const [visibility, setVisibility] = useState<VisibilityScope>(
    relationship?.visibility ?? 'internal',
  );
  const entities = dataset.landscapeEntities
    .filter((item) => item.engagementId === engagementId)
    .sort((left, right) => left.name.localeCompare(right.name));
  const definition = landscapeRelationshipDefinitions[relationshipType];
  const fromEntities = entities.filter((item) =>
    definition.fromTypes.includes(item.type),
  );
  const toEntities = entities.filter((item) =>
    definition.toTypes.includes(item.type),
  );
  const supportsTransfer = canRecordLandscapeTransfer(relationshipType);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const common = {
        engagementId,
        fromEntityId,
        toEntityId,
        type: relationshipType,
        rationale: optional(rationale),
        evidenceIds,
        linkedObservationIds,
        linkedOpportunityIds,
        transferMode: supportsTransfer ? transferMode || undefined : undefined,
        duplicateDataEntry: supportsTransfer ? duplicateDataEntry : undefined,
        confidence,
        verificationStatus,
        internalNotes: optional(internalNotes),
      };
      if (relationship) {
        const updated: LandscapeRelationship = {
          ...relationship,
          ...common,
          reviewStatus,
          visibility,
        };
        await updateLandscapeRelationship(updated);
        onSaved?.(updated);
      } else {
        const created = await createLandscapeRelationship(
          common satisfies CreateLandscapeRelationshipInput,
        );
        onSaved?.(created);
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to save the landscape relationship.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="entity-form" onSubmit={submit}>
      <div className="form-grid">
        <Field label="Relationship type">
          <select
            value={relationshipType}
            onChange={(event) => {
              setRelationshipType(
                event.target.value as LandscapeRelationshipType,
              );
              setFromEntityId('');
              setToEntityId('');
              setTransferMode('');
              setDuplicateDataEntry(false);
            }}
          >
            {landscapeRelationshipTypes.map((item) => (
              <option key={item} value={item}>
                {landscapeRelationshipDefinitions[item].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Confidence">
          <select
            value={confidence}
            onChange={(event) =>
              setConfidence(event.target.value as ConfidenceLevel)
            }
          >
            {confidenceLevels.map((item) => (
              <option key={item} value={item}>
                {labelise(item)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="From">
          <select
            required
            value={fromEntityId}
            onChange={(event) => setFromEntityId(event.target.value)}
          >
            <option value="">Select a source item</option>
            {fromEntities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({labelise(item.type)})
              </option>
            ))}
          </select>
        </Field>
        <Field label="To">
          <select
            required
            value={toEntityId}
            onChange={(event) => setToEntityId(event.target.value)}
          >
            <option value="">Select a target item</option>
            {toEntities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({labelise(item.type)})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Verification state">
          <select
            value={verificationStatus}
            onChange={(event) =>
              setVerificationStatus(
                event.target.value as LandscapeVerificationState,
              )
            }
          >
            {landscapeVerificationStates.map((item) => (
              <option key={item} value={item}>
                {labelise(item)}
              </option>
            ))}
          </select>
        </Field>
        {supportsTransfer ? (
          <Field label="Information transfer mode">
            <select
              value={transferMode}
              onChange={(event) =>
                setTransferMode(
                  event.target.value as LandscapeTransferMode | '',
                )
              }
            >
              <option value="">Not recorded</option>
              {landscapeTransferModes.map((item) => (
                <option key={item} value={item}>
                  {labelise(item)}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
      </div>

      {supportsTransfer ? (
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={duplicateDataEntry}
            onChange={(event) => setDuplicateDataEntry(event.target.checked)}
          />
          This relationship indicates potential duplicate data entry.
        </label>
      ) : null}

      <Field label="Relationship rationale">
        <textarea
          rows={3}
          value={rationale}
          onChange={(event) => setRationale(event.target.value)}
          placeholder="Describe the current-state relationship or uncertainty."
        />
      </Field>

      <LinkedRecordsFieldset
        dataset={dataset}
        engagementId={engagementId}
        selectedObservationIds={linkedObservationIds}
        onObservationIdsChange={setLinkedObservationIds}
        selectedEvidenceIds={evidenceIds}
        onEvidenceIdsChange={setEvidenceIds}
        selectedFrictionItemIds={[]}
        onFrictionItemIdsChange={() => undefined}
        selectedOpportunityIds={linkedOpportunityIds}
        onOpportunityIdsChange={setLinkedOpportunityIds}
        includeFrictionItems={false}
      />

      <Field
        label="Internal working notes"
        hint="Internal only; this field is excluded from the approved A3 projection."
      >
        <textarea
          rows={3}
          value={internalNotes}
          onChange={(event) => setInternalNotes(event.target.value)}
        />
      </Field>

      {relationship ? (
        <div className="form-grid">
          <Field label="Review state">
            <select
              value={reviewStatus}
              onChange={(event) =>
                setReviewStatus(event.target.value as ReviewStatus)
              }
            >
              {reviewStatuses.map((item) => (
                <option key={item} value={item}>
                  {labelise(item)}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Visibility"
            hint="Client-facing visibility requires approved review status and endpoints."
          >
            <select
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as VisibilityScope)
              }
            >
              {visibilityScopes.map((item) => (
                <option key={item} value={item}>
                  {labelise(item)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      ) : (
        <p className="body-copy body-copy--small">
          New relationships start as internal drafts. Review and client-facing
          visibility are controlled after capture.
        </p>
      )}

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isSaving}>
        {isSaving
          ? 'Saving...'
          : relationship
            ? 'Save relationship'
            : 'Add relationship'}
      </Button>
    </form>
  );
}

interface LandscapeVersionFormProps {
  dataset: FabricDataset;
  engagementId: string;
  onSaved?: () => void;
}

export function LandscapeVersionForm({
  dataset,
  engagementId,
  onSaved,
}: LandscapeVersionFormProps) {
  const { captureLandscapeVersion } = useFabricData();
  const engagement = dataset.engagements.find(
    (item) => item.id === engagementId,
  );
  const client = dataset.clients.find(
    (item) => item.id === engagement?.clientId,
  );
  const [title, setTitle] = useState(
    `${client?.name ?? 'Client'} current-state digital landscape`,
  );
  const [siteId, setSiteId] = useState(engagement?.siteIds[0] ?? '');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await captureLandscapeVersion(engagementId, {
        title,
        siteId: optional(siteId),
        notes: optional(notes),
      });
      onSaved?.();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to capture the landscape version.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="entity-form" onSubmit={submit}>
      <Field label="Landscape title">
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <Field
        label="Scope"
        hint="A site scope captures all landscape records for that site. Leave blank to capture the full engagement."
      >
        <select
          value={siteId}
          onChange={(event) => setSiteId(event.target.value)}
        >
          <option value="">All engagement sites</option>
          {dataset.sites
            .filter((site) => engagement?.siteIds.includes(site.id))
            .map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
        </select>
      </Field>
      <Field
        label="Internal snapshot note"
        hint="This note is retained internally and is not part of an external landscape projection."
      >
        <textarea
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </Field>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Capturing...' : 'Capture immutable version'}
      </Button>
    </form>
  );
}
