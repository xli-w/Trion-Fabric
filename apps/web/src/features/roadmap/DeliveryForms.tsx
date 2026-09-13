import { useState } from 'react';
import type {
  BenefitMeasurement,
  ConfidenceLevel,
  DeliveryAction,
  Initiative,
  Milestone,
  MilestoneStatus,
  Opportunity,
  Roadmap,
  ReviewStatus,
  RoadmapPhase,
} from '@domain';
import { Button } from '@ui';

import { useFabricData } from '@app/features/fabric-data/FabricDataContext';

const phases: RoadmapPhase[] = ['Simplify', 'Connect', 'Optimise', 'Scale'];
const deliveryStatuses: Initiative['status'][] = [
  'proposed',
  'approved',
  'planned',
  'in-progress',
  'blocked',
  'complete',
  'cancelled',
];
const milestoneStatuses: MilestoneStatus[] = [
  'planned',
  'in-progress',
  'complete',
  'blocked',
];
const actionStatuses: DeliveryAction['status'][] = [
  'open',
  'in-progress',
  'blocked',
  'completed',
];
const benefitStatuses: BenefitMeasurement['status'][] = [
  'planned',
  'measuring',
  'validated',
  'not-realised',
];
const confidenceLevels: ConfidenceLevel[] = ['low', 'medium', 'high'];
const reviewStatuses: ReviewStatus[] = ['draft', 'reviewed', 'approved'];

function optional(value: string): string | undefined {
  return value.trim() || undefined;
}

function toDateTime(value: string): string | undefined {
  return value ? `${value}T09:00:00Z` : undefined;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function FormShell({
  children,
  error,
  submitLabel,
  onSubmit,
}: {
  children: React.ReactNode;
  error: string | null;
  submitLabel: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="entity-form" onSubmit={onSubmit}>
      {children}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}

export function isOpportunityReadyForDelivery(
  opportunity: Opportunity,
): boolean {
  return (
    (opportunity.status === 'approved' ||
      opportunity.status === 'in-delivery' ||
      opportunity.status === 'closed') &&
    opportunity.approvalState === 'approved' &&
    opportunity.reviewStatus === 'approved' &&
    (opportunity.evidenceIds.length > 0 ||
      (opportunity.relatedObservationIds?.length ?? 0) > 0 ||
      (opportunity.relatedFindingIds?.length ?? 0) > 0) &&
    Boolean(opportunity.clientSummary)
  );
}

export function InitiativeForm({
  opportunity,
  initiative,
  onSaved,
}: {
  opportunity: Opportunity;
  initiative?: Initiative;
  onSaved?: (initiative: Initiative) => void;
}) {
  const { dataset, createInitiative, updateInitiative } = useFabricData();
  const engagement = dataset?.engagements.find(
    (item) => item.id === opportunity.engagementId,
  );
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(
    initiative?.title ?? `${opportunity.title} delivery`,
  );
  const [description, setDescription] = useState(
    initiative?.description ??
      opportunity.recommendedImprovement ??
      opportunity.description,
  );
  const [objective, setObjective] = useState(
    initiative?.objective ??
      opportunity.potentialBenefits ??
      opportunity.expectedImpact,
  );
  const [phase, setPhase] = useState<RoadmapPhase>(
    initiative?.phase ?? 'Simplify',
  );
  const [status, setStatus] = useState<Initiative['status']>(
    initiative?.status ?? 'proposed',
  );
  const [ownerUserId, setOwnerUserId] = useState(
    initiative?.ownerUserId ??
      opportunity.ownerUserId ??
      engagement?.leadUserId ??
      '',
  );
  const [startDate, setStartDate] = useState(
    initiative?.startDate?.slice(0, 10) ?? '',
  );
  const [targetEndDate, setTargetEndDate] = useState(
    initiative?.targetEndDate?.slice(0, 10) ?? '',
  );
  const [priority, setPriority] = useState<Initiative['priority']>(
    initiative?.priority ?? opportunity.priority,
  );
  const [estimatedCost, setEstimatedCost] = useState(
    initiative?.estimatedCost ?? '',
  );
  const [expectedBenefit, setExpectedBenefit] = useState(
    initiative?.expectedBenefit ??
      opportunity.potentialBenefits ??
      opportunity.expectedImpact,
  );
  const [benefitType, setBenefitType] = useState(initiative?.benefitType ?? '');
  const [confidence, setConfidence] = useState<ConfidenceLevel>(
    initiative?.confidence ?? opportunity.confidence,
  );
  const [scope, setScope] = useState(initiative?.scope ?? '');
  const [dependencies, setDependencies] = useState(
    initiative?.dependencies ?? opportunity.dependencies ?? '',
  );
  const [prerequisites, setPrerequisites] = useState(
    initiative?.prerequisites ?? '',
  );
  const [risks, setRisks] = useState(initiative?.risks ?? '');
  const [internalNotes, setInternalNotes] = useState(
    initiative?.internalNotes ?? '',
  );
  const [clientSummary, setClientSummary] = useState(
    initiative?.clientSummary ?? opportunity.clientSummary ?? '',
  );
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    initiative?.reviewStatus ?? 'draft',
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const input = {
      engagementId: opportunity.engagementId,
      opportunityId: opportunity.id,
      title,
      description,
      objective,
      phase,
      status,
      ownerUserId,
      startDate: toDateTime(startDate),
      targetEndDate: toDateTime(targetEndDate),
      priority,
      estimatedCost: optional(estimatedCost),
      expectedBenefit,
      benefitType: optional(benefitType),
      confidence,
      scope: optional(scope),
      dependencies: optional(dependencies),
      prerequisites: optional(prerequisites),
      risks: optional(risks),
      internalNotes: optional(internalNotes),
      clientSummary: optional(clientSummary),
      reviewStatus,
    };

    try {
      const saved = initiative
        ? (await updateInitiative({ ...initiative, ...input }),
          { ...initiative, ...input })
        : await createInitiative(input);
      onSaved?.(saved);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Unable to save initiative.',
      );
    }
  }

  return (
    <FormShell
      error={error}
      submitLabel={initiative ? 'Save initiative' : 'Create initiative'}
      onSubmit={submit}
    >
      <div className="form-grid">
        <Field label="Delivery phase">
          <select
            value={phase}
            onChange={(event) => setPhase(event.target.value as RoadmapPhase)}
          >
            {phases.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Delivery status">
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as Initiative['status'])
            }
          >
            {deliveryStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Owner">
          <select
            required
            value={ownerUserId}
            onChange={(event) => setOwnerUserId(event.target.value)}
          >
            {dataset?.users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as Initiative['priority'])
            }
          >
            <option value="critical">critical</option>
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
          </select>
        </Field>
        <Field label="Start date">
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </Field>
        <Field label="Target end date">
          <input
            type="date"
            value={targetEndDate}
            onChange={(event) => setTargetEndDate(event.target.value)}
          />
        </Field>
        <Field label="Indicative cost">
          <input
            value={estimatedCost}
            onChange={(event) => setEstimatedCost(event.target.value)}
            placeholder="e.g. ££ or validate with supplier"
          />
        </Field>
        <Field label="Benefit type">
          <input
            value={benefitType}
            onChange={(event) => setBenefitType(event.target.value)}
            placeholder="e.g. time released"
          />
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
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Review status">
          <select
            value={reviewStatus}
            onChange={(event) =>
              setReviewStatus(event.target.value as ReviewStatus)
            }
          >
            {reviewStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Initiative title">
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <Field label="Description">
        <textarea
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
      </Field>
      <Field label="Objective">
        <textarea
          required
          value={objective}
          onChange={(event) => setObjective(event.target.value)}
          rows={3}
        />
      </Field>
      <Field label="Scope">
        <textarea
          value={scope}
          onChange={(event) => setScope(event.target.value)}
          rows={2}
        />
      </Field>
      <Field label="Expected benefit">
        <textarea
          required
          value={expectedBenefit}
          onChange={(event) => setExpectedBenefit(event.target.value)}
          rows={2}
        />
      </Field>
      <Field label="Dependencies">
        <textarea
          value={dependencies}
          onChange={(event) => setDependencies(event.target.value)}
          rows={2}
        />
      </Field>
      <Field label="Prerequisites">
        <textarea
          value={prerequisites}
          onChange={(event) => setPrerequisites(event.target.value)}
          rows={2}
        />
      </Field>
      <Field label="Risks">
        <textarea
          value={risks}
          onChange={(event) => setRisks(event.target.value)}
          rows={2}
        />
      </Field>
      <Field label="Client-safe summary">
        <textarea
          value={clientSummary}
          onChange={(event) => setClientSummary(event.target.value)}
          rows={2}
        />
      </Field>
      <Field label="Internal delivery notes">
        <textarea
          value={internalNotes}
          onChange={(event) => setInternalNotes(event.target.value)}
          rows={2}
        />
      </Field>
    </FormShell>
  );
}

export function RoadmapForm({
  roadmap,
  onSaved,
}: {
  roadmap?: Roadmap;
  onSaved?: (roadmap: Roadmap) => void;
}) {
  const { dataset, createRoadmap, updateRoadmap } = useFabricData();
  const [error, setError] = useState<string | null>(null);
  const [engagementId, setEngagementId] = useState(
    roadmap?.engagementId ?? dataset?.engagements[0]?.id ?? '',
  );
  const [diagnosticId, setDiagnosticId] = useState(roadmap?.diagnosticId ?? '');
  const [title, setTitle] = useState(roadmap?.title ?? '');
  const [description, setDescription] = useState(roadmap?.description ?? '');
  const [status, setStatus] = useState<Roadmap['status']>(
    roadmap?.status ?? 'proposed',
  );
  const [selectedPhases, setSelectedPhases] = useState<RoadmapPhase[]>(
    roadmap?.phases ?? phases,
  );
  const [initiativeIds, setInitiativeIds] = useState(
    roadmap?.initiativeIds ?? [],
  );
  const [assumptions, setAssumptions] = useState(roadmap?.assumptions ?? '');
  const [dependencies, setDependencies] = useState(roadmap?.dependencies ?? '');
  const [sequencingRationale, setSequencingRationale] = useState(
    roadmap?.sequencingRationale ?? '',
  );
  const [internalNotes, setInternalNotes] = useState(
    roadmap?.internalNotes ?? '',
  );
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    roadmap?.reviewStatus ?? 'draft',
  );

  const diagnostics =
    dataset?.diagnostics.filter((item) => item.engagementId === engagementId) ??
    [];
  const existingRoadmaps = dataset?.roadmaps ?? [];
  const initiatives =
    (dataset?.initiatives ?? []).filter((initiative) => {
      if (
        initiative.engagementId !== engagementId ||
        !selectedPhases.includes(initiative.phase)
      ) {
        return false;
      }

      return !existingRoadmaps.some(
        (existingRoadmap) =>
          existingRoadmap.id !== roadmap?.id &&
          existingRoadmap.initiativeIds.includes(initiative.id),
      );
    }) ?? [];
  const initiativesById = new Map(
    initiatives.map((initiative) => [initiative.id, initiative]),
  );

  function togglePhase(phase: RoadmapPhase) {
    const nextPhases = selectedPhases.includes(phase)
      ? selectedPhases.filter((item) => item !== phase)
      : [...selectedPhases, phase];
    setSelectedPhases(nextPhases);
    setInitiativeIds((current) =>
      current.filter((initiativeId) => {
        const initiative = dataset?.initiatives.find(
          (item) => item.id === initiativeId,
        );
        return initiative ? nextPhases.includes(initiative.phase) : false;
      }),
    );
  }

  function toggleInitiative(initiativeId: string) {
    setInitiativeIds((current) =>
      current.includes(initiativeId)
        ? current.filter((item) => item !== initiativeId)
        : [...current, initiativeId],
    );
  }

  function moveInitiative(initiativeId: string, direction: -1 | 1) {
    setInitiativeIds((current) => {
      const position = current.indexOf(initiativeId);
      const targetPosition = position + direction;
      if (
        position === -1 ||
        targetPosition < 0 ||
        targetPosition >= current.length
      ) {
        return current;
      }

      const next = [...current];
      const currentId = next[position];
      const targetId = next[targetPosition];
      if (!currentId || !targetId) {
        return current;
      }

      next[position] = targetId;
      next[targetPosition] = currentId;
      return next;
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const input = {
      engagementId,
      diagnosticId: optional(diagnosticId),
      title,
      description,
      status,
      phases: selectedPhases,
      initiativeIds,
      assumptions: optional(assumptions),
      dependencies: optional(dependencies),
      sequencingRationale,
      internalNotes: optional(internalNotes),
      reviewStatus,
    };

    try {
      const saved = roadmap
        ? (await updateRoadmap({ ...roadmap, ...input }),
          { ...roadmap, ...input })
        : await createRoadmap(input);
      onSaved?.(saved);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Unable to save roadmap.',
      );
    }
  }

  return (
    <FormShell
      error={error}
      submitLabel={roadmap ? 'Save roadmap' : 'Create roadmap'}
      onSubmit={submit}
    >
      <div className="form-grid">
        <Field label="Engagement">
          <select
            required
            value={engagementId}
            onChange={(event) => {
              setEngagementId(event.target.value);
              setDiagnosticId('');
              setInitiativeIds([]);
            }}
          >
            {dataset?.engagements.map((engagement) => (
              <option key={engagement.id} value={engagement.id}>
                {engagement.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Diagnostic">
          <select
            value={diagnosticId}
            onChange={(event) => setDiagnosticId(event.target.value)}
          >
            <option value="">Not linked to a diagnostic</option>
            {diagnostics.map((diagnostic) => (
              <option key={diagnostic.id} value={diagnostic.id}>
                {diagnostic.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Delivery status">
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as Roadmap['status'])
            }
          >
            {deliveryStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Review status">
          <select
            value={reviewStatus}
            onChange={(event) =>
              setReviewStatus(event.target.value as ReviewStatus)
            }
          >
            {reviewStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Roadmap title">
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <Field label="Description">
        <textarea
          required
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      <fieldset className="form-fieldset">
        <legend>Roadmap phases</legend>
        {phases.map((phase) => (
          <label className="checkbox-row" key={phase}>
            <input
              checked={selectedPhases.includes(phase)}
              onChange={() => togglePhase(phase)}
              type="checkbox"
            />
            {phase}
          </label>
        ))}
      </fieldset>
      <fieldset className="form-fieldset">
        <legend>Initiatives to sequence</legend>
        {initiatives.length === 0 ? (
          <p className="body-copy">
            No unsequenced initiatives are available for this engagement.
          </p>
        ) : (
          initiatives.map((initiative) => (
            <label className="checkbox-row" key={initiative.id}>
              <input
                checked={initiativeIds.includes(initiative.id)}
                onChange={() => toggleInitiative(initiative.id)}
                type="checkbox"
              />
              {initiative.title} · {initiative.phase}
            </label>
          ))
        )}
      </fieldset>
      {initiativeIds.length > 1 ? (
        <fieldset className="form-fieldset">
          <legend>Sequence order</legend>
          {initiativeIds.map((initiativeId, index) => {
            const initiative = initiativesById.get(initiativeId);
            return (
              <div className="checkbox-row" key={initiativeId}>
                <span>
                  {index + 1}. {initiative?.title ?? initiativeId}
                </span>
                <span>
                  <Button
                    disabled={index === 0}
                    onClick={() => moveInitiative(initiativeId, -1)}
                    variant="ghost"
                  >
                    Earlier
                  </Button>
                  <Button
                    disabled={index === initiativeIds.length - 1}
                    onClick={() => moveInitiative(initiativeId, 1)}
                    variant="ghost"
                  >
                    Later
                  </Button>
                </span>
              </div>
            );
          })}
        </fieldset>
      ) : null}
      <Field label="Sequencing rationale">
        <textarea
          required
          rows={3}
          value={sequencingRationale}
          onChange={(event) => setSequencingRationale(event.target.value)}
        />
      </Field>
      <Field label="Assumptions">
        <textarea
          rows={2}
          value={assumptions}
          onChange={(event) => setAssumptions(event.target.value)}
        />
      </Field>
      <Field label="Dependencies">
        <textarea
          rows={2}
          value={dependencies}
          onChange={(event) => setDependencies(event.target.value)}
        />
      </Field>
      <Field label="Internal roadmap notes">
        <textarea
          rows={2}
          value={internalNotes}
          onChange={(event) => setInternalNotes(event.target.value)}
        />
      </Field>
    </FormShell>
  );
}

export function MilestoneForm({
  initiativeId,
  milestone,
  onSaved,
}: {
  initiativeId: string;
  milestone?: Milestone;
  onSaved?: (milestone: Milestone) => void;
}) {
  const { createMilestone, updateMilestone } = useFabricData();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(milestone?.title ?? '');
  const [description, setDescription] = useState(milestone?.description ?? '');
  const [dueDate, setDueDate] = useState(milestone?.dueDate.slice(0, 10) ?? '');
  const [status, setStatus] = useState<MilestoneStatus>(
    milestone?.status ?? 'planned',
  );
  const [owner, setOwner] = useState(milestone?.owner ?? '');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const input = {
      initiativeId,
      title,
      description,
      dueDate: `${dueDate}T17:00:00Z`,
      status,
      owner,
    };

    try {
      const saved = milestone
        ? (await updateMilestone({ ...milestone, ...input }),
          { ...milestone, ...input })
        : await createMilestone(input);
      onSaved?.(saved);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Unable to save milestone.',
      );
    }
  }

  return (
    <FormShell
      error={error}
      submitLabel={milestone ? 'Save milestone' : 'Add milestone'}
      onSubmit={submit}
    >
      <div className="form-grid">
        <Field label="Milestone">
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field label="Owner">
          <input
            required
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
          />
        </Field>
        <Field label="Due date">
          <input
            required
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as MilestoneStatus)
            }
          >
            {milestoneStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Description">
        <textarea
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
        />
      </Field>
    </FormShell>
  );
}

export function DeliveryActionForm({
  initiativeId,
  action,
  onSaved,
}: {
  initiativeId: string;
  action?: DeliveryAction;
  onSaved?: (action: DeliveryAction) => void;
}) {
  const { dataset, createDeliveryAction, updateDeliveryAction } =
    useFabricData();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(action?.title ?? '');
  const [description, setDescription] = useState(action?.description ?? '');
  const [owner, setOwner] = useState(action?.owner ?? '');
  const [status, setStatus] = useState<DeliveryAction['status']>(
    action?.status ?? 'open',
  );
  const [dueDate, setDueDate] = useState(action?.dueDate?.slice(0, 10) ?? '');
  const [dependencyIds, setDependencyIds] = useState(
    action?.dependencyIds ?? [],
  );
  const [notes, setNotes] = useState(action?.notes ?? '');
  const dependencies = [
    ...(
      dataset?.milestones.filter(
        (item) => item.initiativeId === initiativeId,
      ) ?? []
    ).map((item) => ({ id: item.id, label: `Milestone: ${item.title}` })),
    ...(
      dataset?.deliveryActions.filter(
        (item) => item.initiativeId === initiativeId && item.id !== action?.id,
      ) ?? []
    ).map((item) => ({ id: item.id, label: `Action: ${item.title}` })),
  ];

  function toggleDependency(id: string) {
    setDependencyIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const input = {
      initiativeId,
      title,
      description,
      owner,
      status,
      dueDate: toDateTime(dueDate),
      dependencyIds,
      notes: optional(notes),
    };

    try {
      const saved = action
        ? (await updateDeliveryAction({ ...action, ...input }),
          { ...action, ...input })
        : await createDeliveryAction(input);
      onSaved?.(saved);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to save delivery action.',
      );
    }
  }

  return (
    <FormShell
      error={error}
      submitLabel={action ? 'Save delivery action' : 'Add delivery action'}
      onSubmit={submit}
    >
      <div className="form-grid">
        <Field label="Action">
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field label="Owner">
          <input
            required
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
          />
        </Field>
        <Field label="Due date">
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as DeliveryAction['status'])
            }
          >
            {actionStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Description">
        <textarea
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
        />
      </Field>
      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
        />
      </Field>
      {dependencies.length > 0 ? (
        <fieldset className="form-fieldset">
          <legend>Depends on</legend>
          {dependencies.map((dependency) => (
            <label className="checkbox-row" key={dependency.id}>
              <input
                checked={dependencyIds.includes(dependency.id)}
                onChange={() => toggleDependency(dependency.id)}
                type="checkbox"
              />
              {dependency.label}
            </label>
          ))}
        </fieldset>
      ) : null}
    </FormShell>
  );
}

export function BenefitMeasurementForm({
  initiativeId,
  measurement,
  onSaved,
}: {
  initiativeId: string;
  measurement?: BenefitMeasurement;
  onSaved?: (measurement: BenefitMeasurement) => void;
}) {
  const { createBenefitMeasurement, updateBenefitMeasurement } =
    useFabricData();
  const [error, setError] = useState<string | null>(null);
  const [benefitType, setBenefitType] = useState(
    measurement?.benefitType ?? '',
  );
  const [measure, setMeasure] = useState(measurement?.measure ?? '');
  const [baseline, setBaseline] = useState(measurement?.baseline ?? '');
  const [target, setTarget] = useState(measurement?.target ?? '');
  const [expectedValue, setExpectedValue] = useState(
    measurement?.expectedValue ?? '',
  );
  const [actualValue, setActualValue] = useState(
    measurement?.actualValue ?? '',
  );
  const [unit, setUnit] = useState(measurement?.unit ?? '');
  const [measurementMethod, setMeasurementMethod] = useState(
    measurement?.measurementMethod ?? '',
  );
  const [measurementOwner, setMeasurementOwner] = useState(
    measurement?.measurementOwner ?? '',
  );
  const [measurementDate, setMeasurementDate] = useState(
    measurement?.measurementDate?.slice(0, 10) ?? '',
  );
  const [confidence, setConfidence] = useState<ConfidenceLevel>(
    measurement?.confidence ?? 'medium',
  );
  const [status, setStatus] = useState<BenefitMeasurement['status']>(
    measurement?.status ?? 'planned',
  );
  const [notes, setNotes] = useState(measurement?.notes ?? '');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const input = {
      initiativeId,
      benefitType,
      measure,
      baseline,
      target,
      expectedValue,
      actualValue: optional(actualValue),
      unit,
      measurementMethod,
      measurementOwner,
      measurementDate: toDateTime(measurementDate),
      confidence,
      status,
      notes: optional(notes),
    };

    try {
      const saved = measurement
        ? (await updateBenefitMeasurement({ ...measurement, ...input }),
          { ...measurement, ...input })
        : await createBenefitMeasurement(input);
      onSaved?.(saved);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to save benefit measurement.',
      );
    }
  }

  return (
    <FormShell
      error={error}
      submitLabel={measurement ? 'Save benefit measure' : 'Add benefit measure'}
      onSubmit={submit}
    >
      <div className="form-grid">
        <Field label="Benefit type">
          <input
            required
            value={benefitType}
            onChange={(event) => setBenefitType(event.target.value)}
            placeholder="e.g. time released"
          />
        </Field>
        <Field label="Measure">
          <input
            required
            value={measure}
            onChange={(event) => setMeasure(event.target.value)}
          />
        </Field>
        <Field label="Unit">
          <input
            required
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            placeholder="e.g. minutes / shift"
          />
        </Field>
        <Field label="Measurement owner">
          <input
            required
            value={measurementOwner}
            onChange={(event) => setMeasurementOwner(event.target.value)}
          />
        </Field>
        <Field label="Measurement status">
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as BenefitMeasurement['status'])
            }
          >
            {benefitStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
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
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Measurement date">
          <input
            required={status === 'validated'}
            type="date"
            value={measurementDate}
            onChange={(event) => setMeasurementDate(event.target.value)}
          />
        </Field>
      </div>
      <div className="form-grid">
        <Field label="Baseline">
          <input
            required
            value={baseline}
            onChange={(event) => setBaseline(event.target.value)}
          />
        </Field>
        <Field label="Target">
          <input
            required
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          />
        </Field>
        <Field label="Expected value">
          <input
            required
            value={expectedValue}
            onChange={(event) => setExpectedValue(event.target.value)}
          />
        </Field>
        <Field label="Actual value">
          <input
            required={status === 'validated'}
            value={actualValue}
            onChange={(event) => setActualValue(event.target.value)}
          />
        </Field>
      </div>
      <Field label="Measurement method">
        <textarea
          required
          value={measurementMethod}
          onChange={(event) => setMeasurementMethod(event.target.value)}
          rows={2}
        />
      </Field>
      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
        />
      </Field>
    </FormShell>
  );
}
