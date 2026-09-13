import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type {
  ApprovalState,
  EffortLevel,
  InvestmentBand,
  Opportunity,
  OpportunityPriority,
  OpportunityPriorityCategory,
  OpportunityType,
  ReviewStatus,
} from '@domain';
import { Badge, Button, Card, DataTable, PageHeader, StatCard } from '@ui';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';
import { buildOpportunitiesViewModel } from '@app/features/fabric-data/selectors';
import {
  InitiativeForm,
  isOpportunityReadyForDelivery,
} from '@app/features/roadmap/DeliveryForms';

const types: OpportunityType[] = [
  'eliminate',
  'simplify',
  'standardise',
  'automate',
  'integrate',
  'improve-visibility',
  'transform',
];
const priorities: OpportunityPriority[] = ['critical', 'high', 'medium', 'low'];
const efforts: EffortLevel[] = ['low', 'medium', 'high'];
const categories: OpportunityPriorityCategory[] = [
  'Quick Win',
  'Strategic Project',
  'Foundational Improvement',
  'Incremental Improvement',
  'Reconsider / Defer',
];
const investments: InvestmentBand[] = ['£', '££', '£££', 'Unknown'];
const statuses: Opportunity['status'][] = [
  'identified',
  'triaged',
  'approved',
  'in-delivery',
  'closed',
];
const approvalStates: ApprovalState[] = [
  'draft',
  'internal-review',
  'approved',
  'rejected',
];
const reviewStatuses: ReviewStatus[] = ['draft', 'reviewed', 'approved'];
const matrixCells: Array<{
  label: string;
  impacts: OpportunityPriority[];
  effort: EffortLevel;
}> = [
  {
    label: 'High impact / low effort',
    impacts: ['critical', 'high'],
    effort: 'low',
  },
  {
    label: 'High impact / medium effort',
    impacts: ['critical', 'high'],
    effort: 'medium',
  },
  {
    label: 'High impact / high effort',
    impacts: ['critical', 'high'],
    effort: 'high',
  },
  { label: 'Medium impact / low effort', impacts: ['medium'], effort: 'low' },
  {
    label: 'Medium impact / medium effort',
    impacts: ['medium'],
    effort: 'medium',
  },
  { label: 'Medium impact / high effort', impacts: ['medium'], effort: 'high' },
  { label: 'Low impact / low effort', impacts: ['low'], effort: 'low' },
  { label: 'Low impact / medium effort', impacts: ['low'], effort: 'medium' },
  { label: 'Low impact / high effort', impacts: ['low'], effort: 'high' },
];

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

function OpportunityForm({
  opportunity,
  onSaved,
}: {
  opportunity?: Opportunity;
  onSaved?: (opportunity: Opportunity) => void;
}) {
  const { dataset, createOpportunity, updateOpportunity } = useFabricData();
  const [error, setError] = useState<string | null>(null);
  const [engagementId, setEngagementId] = useState(
    opportunity?.engagementId ?? dataset?.engagements[0]?.id ?? '',
  );
  const [title, setTitle] = useState(opportunity?.title ?? '');
  const [areaId, setAreaId] = useState(opportunity?.areaId ?? '');
  const [processId, setProcessId] = useState(opportunity?.processId ?? '');
  const [systemId, setSystemId] = useState(opportunity?.systemId ?? '');
  const [type, setType] = useState<OpportunityType>(
    opportunity?.type ?? 'simplify',
  );
  const [currentSituation, setCurrentSituation] = useState(
    opportunity?.currentSituation ?? opportunity?.description ?? '',
  );
  const [identifiedIssue, setIdentifiedIssue] = useState(
    opportunity?.identifiedIssue ?? opportunity?.problemStatement ?? '',
  );
  const [rootCause, setRootCause] = useState(opportunity?.rootCause ?? '');
  const [whyItMatters, setWhyItMatters] = useState(
    opportunity?.whyItMatters ?? '',
  );
  const [recommendedImprovement, setRecommendedImprovement] = useState(
    opportunity?.recommendedImprovement ?? opportunity?.description ?? '',
  );
  const [potentialBenefits, setPotentialBenefits] = useState(
    opportunity?.potentialBenefits ?? opportunity?.expectedImpact ?? '',
  );
  const [priority, setPriority] = useState<OpportunityPriority>(
    opportunity?.priority ?? 'medium',
  );
  const [effort, setEffort] = useState<EffortLevel>(
    opportunity?.implementationEffort ??
      opportunity?.estimatedEffort ??
      'medium',
  );
  const [category, setCategory] = useState<OpportunityPriorityCategory>(
    opportunity?.priorityCategory ?? 'Incremental Improvement',
  );
  const [investment, setInvestment] = useState<InvestmentBand>(
    opportunity?.investment ?? 'Unknown',
  );
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>(
    opportunity?.confidence ?? 'medium',
  );
  const [status, setStatus] = useState<Opportunity['status']>(
    opportunity?.status ?? 'identified',
  );
  const [approvalState, setApprovalState] = useState<ApprovalState>(
    opportunity?.approvalState ?? 'draft',
  );
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    opportunity?.reviewStatus ?? 'draft',
  );
  const [timing, setTiming] = useState(opportunity?.recommendedTiming ?? '');
  const [dependencies, setDependencies] = useState(
    opportunity?.dependencies ?? '',
  );
  const [nextStep, setNextStep] = useState(
    opportunity?.suggestedNextStep ?? '',
  );
  const [assumptions, setAssumptions] = useState(
    opportunity?.valueAssumptions ?? '',
  );
  const [internalNotes, setInternalNotes] = useState(
    opportunity?.internalNotes ?? '',
  );
  const [clientSummary, setClientSummary] = useState(
    opportunity?.clientSummary ?? '',
  );
  const [evidenceIds, setEvidenceIds] = useState(
    opportunity?.evidenceIds.join(', ') ?? '',
  );
  const engagement = dataset?.engagements.find(
    (item) => item.id === engagementId,
  );
  const scopedSiteIds = engagement?.siteIds ?? [];
  const areas =
    dataset?.areas.filter((item) => scopedSiteIds.includes(item.siteId)) ?? [];
  const processes =
    dataset?.processes.filter((item) => scopedSiteIds.includes(item.siteId)) ??
    [];
  const systems =
    dataset?.systems.filter((item) => scopedSiteIds.includes(item.siteId)) ??
    [];

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsedEvidenceIds = evidenceIds
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const requiresApprovedContent =
      status === 'approved' || status === 'in-delivery' || status === 'closed';
    const hasExistingReasoningLink =
      (opportunity?.relatedObservationIds?.length ?? 0) > 0 ||
      (opportunity?.relatedFindingIds?.length ?? 0) > 0;
    if (
      requiresApprovedContent &&
      parsedEvidenceIds.length === 0 &&
      !hasExistingReasoningLink
    ) {
      setError(
        'Approved or delivery opportunities need at least one evidence, observation, or finding link.',
      );
      return;
    }
    try {
      const input = {
        engagementId,
        title,
        areaId: areaId || undefined,
        processId: processId || undefined,
        systemId: systemId || undefined,
        type,
        description: recommendedImprovement,
        problemStatement: identifiedIssue,
        rootCause,
        expectedImpact: potentialBenefits,
        estimatedEffort: effort,
        confidence,
        priority,
        status,
        evidenceIds: parsedEvidenceIds,
        ownerUserId: opportunity?.ownerUserId,
        approvalState,
        diagnosticId: opportunity?.diagnosticId,
        currentSituation,
        identifiedIssue,
        whyItMatters,
        recommendedImprovement,
        potentialBenefits,
        valueAssumptions: assumptions || undefined,
        businessImpact: priority,
        implementationEffort: effort,
        investment,
        strategicValue: priority,
        priorityCategory: category,
        recommendedTiming: timing || undefined,
        dependencies: dependencies || undefined,
        suggestedNextStep: nextStep || undefined,
        relatedObservationIds: opportunity?.relatedObservationIds ?? [],
        relatedFindingIds: opportunity?.relatedFindingIds ?? [],
        reviewStatus,
        internalNotes: internalNotes || undefined,
        clientSummary: clientSummary || undefined,
      };
      const saved = opportunity
        ? (await updateOpportunity({ ...opportunity, ...input }),
          { ...opportunity, ...input })
        : await createOpportunity(input);
      onSaved?.(saved);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to save opportunity.',
      );
    }
  }

  return (
    <form className="entity-form" onSubmit={submit}>
      <div className="form-grid">
        <Field label="Engagement">
          <select
            required
            value={engagementId}
            onChange={(event) => {
              setEngagementId(event.target.value);
              setAreaId('');
              setProcessId('');
              setSystemId('');
            }}
          >
            {dataset?.engagements.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Title">
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field label="Area">
          <select
            value={areaId}
            onChange={(event) => setAreaId(event.target.value)}
          >
            <option value="">Unassigned</option>
            {areas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Process">
          <select
            value={processId}
            onChange={(event) => setProcessId(event.target.value)}
          >
            <option value="">Unassigned</option>
            {processes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="System">
          <select
            value={systemId}
            onChange={(event) => setSystemId(event.target.value)}
          >
            <option value="">Unassigned</option>
            {systems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Opportunity type">
          <select
            value={type}
            onChange={(event) => setType(event.target.value as OpportunityType)}
          >
            {types.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Business impact">
          <select
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as OpportunityPriority)
            }
          >
            {priorities.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Implementation effort">
          <select
            value={effort}
            onChange={(event) => setEffort(event.target.value as EffortLevel)}
          >
            {efforts.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Investment band">
          <select
            value={investment}
            onChange={(event) =>
              setInvestment(event.target.value as InvestmentBand)
            }
          >
            {investments.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Priority category">
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as OpportunityPriorityCategory)
            }
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Confidence">
          <select
            value={confidence}
            onChange={(event) =>
              setConfidence(event.target.value as 'low' | 'medium' | 'high')
            }
          >
            <option>low</option>
            <option>medium</option>
            <option>high</option>
          </select>
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as Opportunity['status'])
            }
          >
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Content approval">
          <select
            value={approvalState}
            onChange={(event) =>
              setApprovalState(event.target.value as ApprovalState)
            }
          >
            {approvalStates.map((item) => (
              <option key={item}>{item}</option>
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
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Current situation">
        <textarea
          required
          value={currentSituation}
          onChange={(event) => setCurrentSituation(event.target.value)}
          rows={3}
        />
      </Field>
      <Field label="Identified issue">
        <textarea
          required
          value={identifiedIssue}
          onChange={(event) => setIdentifiedIssue(event.target.value)}
          rows={3}
        />
      </Field>
      <Field label="Root cause or contributing factors">
        <textarea
          required
          value={rootCause}
          onChange={(event) => setRootCause(event.target.value)}
          rows={3}
        />
      </Field>
      <Field label="Why it matters">
        <textarea
          required
          value={whyItMatters}
          onChange={(event) => setWhyItMatters(event.target.value)}
          rows={3}
        />
      </Field>
      <Field label="Recommended improvement">
        <textarea
          required
          value={recommendedImprovement}
          onChange={(event) => setRecommendedImprovement(event.target.value)}
          rows={3}
        />
      </Field>
      <Field label="Potential benefits">
        <textarea
          required
          value={potentialBenefits}
          onChange={(event) => setPotentialBenefits(event.target.value)}
          rows={3}
        />
      </Field>
      <div className="form-grid">
        <Field label="Recommended timing">
          <input
            value={timing}
            onChange={(event) => setTiming(event.target.value)}
          />
        </Field>
        <Field label="Suggested next step">
          <input
            value={nextStep}
            onChange={(event) => setNextStep(event.target.value)}
          />
        </Field>
        <Field label="Dependencies">
          <input
            value={dependencies}
            onChange={(event) => setDependencies(event.target.value)}
          />
        </Field>
        <Field label="Evidence references">
          <input
            value={evidenceIds}
            onChange={(event) => setEvidenceIds(event.target.value)}
            placeholder="Comma-separated IDs"
          />
        </Field>
      </div>
      <Field label="Value assumptions">
        <textarea
          value={assumptions}
          onChange={(event) => setAssumptions(event.target.value)}
          rows={2}
        />
      </Field>
      <Field label="Internal notes">
        <textarea
          value={internalNotes}
          onChange={(event) => setInternalNotes(event.target.value)}
          rows={2}
        />
      </Field>
      <Field label="Client summary">
        <textarea
          value={clientSummary}
          onChange={(event) => setClientSummary(event.target.value)}
          rows={2}
        />
      </Field>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit">Save opportunity</Button>
    </form>
  );
}

export function OpportunitiesPage() {
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  return (
    <FabricDataView
      emptyTitle="Opportunities cannot be loaded"
      loadingDescription="Loading evidence-linked opportunities and approval status."
      loadingTitle="Loading opportunities"
    >
      {(dataset) => {
        const viewModel = buildOpportunitiesViewModel(dataset);
        const rows = viewModel.rows.filter((row) =>
          `${row.title} ${row.engagementName} ${row.type} ${row.priority}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        );
        const categoryCount = dataset.opportunities.filter(
          (item) => item.priorityCategory === 'Foundational Improvement',
        ).length;
        return (
          <>
            <PageHeader
              eyebrow="Transformation"
              title="Problem-led opportunity register"
              description="Move from operational landscape and evidence to a current situation, issue, improvement, benefits, priority, and a sequenced next step."
              metadata={[
                'Landscape-informed',
                'Impact / effort',
                'Approval-aware',
              ]}
              actions={
                <Button onClick={() => setShowForm((value) => !value)}>
                  {showForm ? 'Close form' : 'Add opportunity'}
                </Button>
              }
            />
            {showForm ? (
              <Card title="Create opportunity">
                <OpportunityForm onSaved={() => setShowForm(false)} />
              </Card>
            ) : null}
            <section className="metric-grid metric-grid--compact">
              <StatCard
                label="High priority"
                value={String(viewModel.highPriorityCount)}
                detail="Consultant judgement based on current impact and urgency."
                tone="warning"
              />
              <StatCard
                label="Approved"
                value={String(viewModel.approvedCount)}
                detail="Opportunities cleared for downstream use."
                tone="success"
              />
              <StatCard
                label="Evidence linked"
                value={String(viewModel.evidenceLinkedCount)}
                detail="Opportunities retaining explicit evidence references."
                tone="accent"
              />
              <StatCard
                label="Foundational"
                value={String(categoryCount)}
                detail="Important enabling work, not automatically low priority."
                tone="neutral"
              />
            </section>
            <Card
              title="Opportunity register"
              description="Search and triage recommendations before they become delivery initiatives."
            >
              <input
                className="search-input"
                aria-label="Search opportunities"
                placeholder="Search opportunities..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <DataTable
                rows={rows}
                getRowKey={(row) => row.id}
                emptyState="No opportunities match this search."
                columns={[
                  {
                    header: 'Opportunity',
                    render: (row) => (
                      <div>
                        <Link
                          className="table-link"
                          to={`/opportunities/${row.id}`}
                        >
                          <strong>{row.title}</strong>
                        </Link>
                        <div className="body-copy body-copy--small">
                          {row.engagementName}
                        </div>
                      </div>
                    ),
                    width: '25%',
                  },
                  { header: 'Type', render: (row) => row.type },
                  {
                    header: 'Priority',
                    render: (row) => (
                      <Badge tone={row.priorityTone}>{row.priority}</Badge>
                    ),
                  },
                  {
                    header: 'Category',
                    render: (row) => row.category ?? 'Uncategorised',
                  },
                  { header: 'Status', render: (row) => row.status },
                  {
                    header: 'Evidence',
                    render: (row) => `${row.evidenceCount} refs`,
                  },
                  { header: 'Actions', render: (row) => row.actionCount ?? 0 },
                ]}
              />
            </Card>
            <Card
              title="Impact versus effort matrix"
              description="High impact / low effort indicates a Quick Win; high impact / high effort indicates a Strategic Project. Medium-effort work remains visible, and foundational work is separately identifiable."
            >
              <div className="opportunity-matrix">
                {matrixCells.map(({ label, impacts, effort }) => {
                  const items = dataset.opportunities.filter(
                    (item) =>
                      impacts.includes(item.businessImpact ?? item.priority) &&
                      (item.implementationEffort ?? item.estimatedEffort) ===
                        effort,
                  );
                  return (
                    <div className="matrix-cell" key={label}>
                      <strong>{label}</strong>
                      <span>{items.length} opportunities</span>
                      {items.map((item) => (
                        <Link
                          className="table-link"
                          key={item.id}
                          to={`/opportunities/${item.id}`}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
              <div className="prompt-list">
                <span>Categories: {categories.join(' · ')}</span>
              </div>
            </Card>
          </>
        );
      }}
    </FabricDataView>
  );
}

export function OpportunityDetailPage() {
  const { opportunityId } = useParams();
  const { createAction } = useFabricData();
  const [editing, setEditing] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [showInitiative, setShowInitiative] = useState(false);
  const [actionTitle, setActionTitle] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  async function addAction(
    event: React.FormEvent<HTMLFormElement>,
    opportunity: Opportunity,
  ) {
    event.preventDefault();
    setActionError(null);

    try {
      await createAction({
        opportunityId: opportunity.id,
        title: actionTitle,
        description: actionDescription || actionTitle,
        status: 'open',
        ownerUserId: opportunity.ownerUserId,
        priority: opportunity.priority,
        dependencies: undefined,
        notes: undefined,
        owner: opportunity.owner,
      });
      setActionTitle('');
      setActionDescription('');
      setShowAction(false);
    } catch (caught) {
      setActionError(
        caught instanceof Error ? caught.message : 'Unable to create action.',
      );
    }
  }

  return (
    <FabricDataView
      emptyTitle="Opportunity cannot be loaded"
      loadingDescription="Loading opportunity workspace."
      loadingTitle="Loading opportunity"
    >
      {(dataset) => {
        const opportunity = dataset.opportunities.find(
          (item) => item.id === opportunityId,
        );
        if (!opportunity) {
          return (
            <PageHeader
              eyebrow="Transformation"
              title="Opportunity not found"
              description="The requested opportunity is not available."
            />
          );
        }

        const actions = dataset.actionItems.filter(
          (item) => item.opportunityId === opportunity.id,
        );
        const initiatives = dataset.initiatives.filter(
          (item) => item.opportunityId === opportunity.id,
        );
        const canCreateInitiative =
          isOpportunityReadyForDelivery(opportunity) &&
          initiatives.length === 0;
        const linkedObservations = dataset.observations.filter((item) =>
          opportunity.relatedObservationIds?.includes(item.id),
        );
        const linkedFindings = dataset.findings.filter((item) =>
          opportunity.relatedFindingIds?.includes(item.id),
        );
        const linkedEvidence = dataset.evidence.filter((item) =>
          opportunity.evidenceIds.includes(item.id),
        );

        return (
          <>
            <PageHeader
              eyebrow="Opportunity detail"
              title={opportunity.title}
              description={opportunity.clientSummary ?? opportunity.description}
              metadata={[
                opportunity.priorityCategory ?? 'Uncategorised',
                opportunity.status,
                opportunity.confidence,
              ]}
              actions={
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setEditing((value) => !value)}
                  >
                    {editing ? 'Close edit' : 'Edit opportunity'}
                  </Button>
                  {canCreateInitiative ? (
                    <Button
                      onClick={() => setShowInitiative((value) => !value)}
                    >
                      {showInitiative
                        ? 'Close initiative'
                        : 'Create delivery initiative'}
                    </Button>
                  ) : null}
                </>
              }
            />

            {editing ? (
              <Card title="Edit opportunity">
                <OpportunityForm
                  key={opportunity.updatedAt}
                  opportunity={opportunity}
                  onSaved={() => setEditing(false)}
                />
              </Card>
            ) : null}

            {showInitiative && canCreateInitiative ? (
              <Card
                title="Create delivery initiative"
                description="This carries the approved opportunity context into the phased roadmap without duplicating the recommendation."
              >
                <InitiativeForm
                  opportunity={opportunity}
                  onSaved={() => setShowInitiative(false)}
                />
              </Card>
            ) : null}

            <section className="content-grid content-grid--two">
              <Card title="Reasoning chain">
                <dl className="detail-list">
                  <dt>Area / process / system</dt>
                  <dd>
                    {dataset.areas.find(
                      (item) => item.id === opportunity.areaId,
                    )?.name ?? '—'}
                    {' · '}
                    {dataset.processes.find(
                      (item) => item.id === opportunity.processId,
                    )?.name ?? '—'}
                    {' · '}
                    {dataset.systems.find(
                      (item) => item.id === opportunity.systemId,
                    )?.name ?? '—'}
                  </dd>
                  <dt>Current situation</dt>
                  <dd>
                    {opportunity.currentSituation ?? opportunity.description}
                  </dd>
                  <dt>Identified issue</dt>
                  <dd>
                    {opportunity.identifiedIssue ??
                      opportunity.problemStatement}
                  </dd>
                  <dt>Root cause</dt>
                  <dd>{opportunity.rootCause}</dd>
                  <dt>Why it matters</dt>
                  <dd>{opportunity.whyItMatters ?? 'Not recorded'}</dd>
                  <dt>Recommended improvement</dt>
                  <dd>
                    {opportunity.recommendedImprovement ??
                      opportunity.description}
                  </dd>
                  <dt>Potential benefits</dt>
                  <dd>
                    {opportunity.potentialBenefits ??
                      opportunity.expectedImpact}
                  </dd>
                </dl>
              </Card>
              <Card title="Priority assessment">
                <div className="priority-panel">
                  <Badge tone="warning">{opportunity.priority}</Badge>
                  <strong>
                    {opportunity.priorityCategory ?? 'Category pending'}
                  </strong>
                  <span>
                    Impact: {opportunity.businessImpact ?? opportunity.priority}
                  </span>
                  <span>
                    Effort:{' '}
                    {opportunity.implementationEffort ??
                      opportunity.estimatedEffort}
                  </span>
                  <span>Investment: {opportunity.investment ?? 'Unknown'}</span>
                  <span>
                    Strategic value:{' '}
                    {opportunity.strategicValue ?? 'Not recorded'}
                  </span>
                  <span>
                    Timing: {opportunity.recommendedTiming ?? 'Not recorded'}
                  </span>
                </div>
              </Card>
            </section>

            <section className="content-grid content-grid--two">
              <Card title="Supporting evidence">
                <div className="record-stack">
                  {linkedObservations.map((item) => (
                    <span key={item.id}>
                      Observation: {item.title ?? item.summary}
                    </span>
                  ))}
                  {linkedFindings.map((item) => (
                    <span key={item.id}>Finding: {item.title}</span>
                  ))}
                  {linkedEvidence.map((item) => (
                    <span key={item.id}>Evidence: {item.title}</span>
                  ))}
                  {linkedObservations.length +
                    linkedFindings.length +
                    linkedEvidence.length ===
                  0 ? (
                    <span>No linked evidence recorded.</span>
                  ) : null}
                  <p className="body-copy">
                    Internal assumptions:{' '}
                    {opportunity.valueAssumptions ?? 'None recorded'}
                  </p>
                </div>
              </Card>
              <Card title="Review and approval">
                <dl className="detail-list">
                  <dt>Content approval</dt>
                  <dd>{opportunity.approvalState}</dd>
                  <dt>Review status</dt>
                  <dd>{opportunity.reviewStatus}</dd>
                  <dt>Client-safe summary</dt>
                  <dd>
                    {opportunity.clientSummary ??
                      'Not approved for client-facing use.'}
                  </dd>
                  <dt>Delivery handoff</dt>
                  <dd>
                    {initiatives.length > 0
                      ? `${initiatives.length} linked initiative${initiatives.length === 1 ? '' : 's'}`
                      : canCreateInitiative
                        ? 'Ready to become a delivery initiative.'
                        : 'Requires approved content and an approved review before delivery handoff.'}
                  </dd>
                  <dt>Internal notes</dt>
                  <dd>{opportunity.internalNotes ?? 'None'}</dd>
                </dl>
              </Card>
            </section>

            {initiatives.length > 0 ? (
              <Card title={`Delivery initiatives (${initiatives.length})`}>
                <div className="record-stack">
                  {initiatives.map((initiative) => (
                    <Link
                      className="record-item table-link"
                      key={initiative.id}
                      to={`/roadmap/${initiative.id}`}
                    >
                      <strong>{initiative.title}</strong>
                      <span>
                        {initiative.phase} · {initiative.status}
                      </span>
                    </Link>
                  ))}
                </div>
              </Card>
            ) : null}

            <Card
              title={`Actions (${actions.length})`}
              actions={
                <Button
                  variant="ghost"
                  onClick={() => setShowAction((value) => !value)}
                >
                  {showAction ? 'Close action' : 'Add action'}
                </Button>
              }
            >
              {showAction ? (
                <form
                  className="entity-form"
                  onSubmit={(event) => void addAction(event, opportunity)}
                >
                  <Field label="Action title">
                    <input
                      required
                      value={actionTitle}
                      onChange={(event) => setActionTitle(event.target.value)}
                    />
                  </Field>
                  <Field label="Specific next step">
                    <textarea
                      value={actionDescription}
                      onChange={(event) =>
                        setActionDescription(event.target.value)
                      }
                      rows={2}
                    />
                  </Field>
                  {actionError ? (
                    <p className="form-error" role="alert">
                      {actionError}
                    </p>
                  ) : null}
                  <Button type="submit">Create action</Button>
                </form>
              ) : null}
              <div className="record-stack">
                {actions.map((action) => (
                  <article className="record-item" key={action.id}>
                    <div>
                      <strong>{action.title}</strong>
                      <p className="body-copy">{action.description}</p>
                      <span>
                        {action.owner ??
                          dataset.users.find(
                            (user) => user.id === action.ownerUserId,
                          )?.displayName ??
                          'Owner pending'}{' '}
                        · {action.dueDate?.slice(0, 10) ?? 'No due date'}
                      </span>
                    </div>
                    <Badge
                      tone={
                        action.status === 'completed' ? 'success' : 'warning'
                      }
                    >
                      {action.status}
                    </Badge>
                  </article>
                ))}
              </div>
            </Card>
          </>
        );
      }}
    </FabricDataView>
  );
}
