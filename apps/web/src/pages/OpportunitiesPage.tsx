import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight,
  ExternalLink,
  LayoutGrid,
  Plus,
  Table as TableIcon,
} from 'lucide-react';
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
import {
  Badge,
  Button,
  Card,
  DataTable,
  FilterSelect,
  OpportunityMatrix,
  PageHeader,
  SearchInput,
  Sheet,
  StatCard,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toolbar,
  ToolbarGroup,
  ViewToggle,
} from '@ui';
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
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [sortColumn, setSortColumn] = useState<string>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sheet states
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);

  return (
    <FabricDataView
      emptyTitle="Opportunities cannot be loaded"
      loadingDescription="Loading evidence-linked opportunities and approval status."
      loadingTitle="Loading opportunities"
    >
      {(dataset) => {
        const viewModel = buildOpportunitiesViewModel(dataset);

        // Filter
        let filteredRows = viewModel.rows.filter((row) => {
          const matchesQuery = `${row.title} ${row.engagementName} ${row.type} ${row.priority} ${row.category ?? ''}`
            .toLowerCase()
            .includes(query.toLowerCase());
          const matchesType = !typeFilter || row.type === typeFilter;
          const matchesPriority = !priorityFilter || row.priority === priorityFilter;
          return matchesQuery && matchesType && matchesPriority;
        });

        // Sort
        filteredRows = [...filteredRows].sort((a, b) => {
          let aVal: string | number = '';
          let bVal: string | number = '';

          if (sortColumn === 'Opportunity') {
            aVal = a.title;
            bVal = b.title;
          } else if (sortColumn === 'type') {
            aVal = a.type;
            bVal = b.type;
          } else if (sortColumn === 'priority') {
            const rank = { critical: 4, high: 3, medium: 2, low: 1 };
            aVal = rank[a.priority as keyof typeof rank] || 0;
            bVal = rank[b.priority as keyof typeof rank] || 0;
          } else if (sortColumn === 'category') {
            aVal = a.category ?? '';
            bVal = b.category ?? '';
          } else if (sortColumn === 'status') {
            aVal = a.status;
            bVal = b.status;
          } else if (sortColumn === 'evidence') {
            aVal = a.evidenceCount;
            bVal = b.evidenceCount;
          }

          if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });

        const handleSort = (colKey: string) => {
          if (sortColumn === colKey) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
          } else {
            setSortColumn(colKey);
            setSortDirection('asc');
          }
        };

        const selectedOpp = selectedOpportunityId
          ? dataset.opportunities.find((o) => o.id === selectedOpportunityId)
          : null;

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
                <Button onClick={() => setCreateSheetOpen(true)}>
                  <Plus size={16} style={{ marginRight: 6 }} /> Add opportunity
                </Button>
              }
            />

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

            <Toolbar>
              <ToolbarGroup>
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder="Search opportunities..."
                />
                <FilterSelect
                  label="Type"
                  value={typeFilter}
                  onChange={setTypeFilter}
                  allLabel="All types"
                  options={types.map((t) => ({ value: t, label: t }))}
                />
                <FilterSelect
                  label="Priority"
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                  allLabel="All priorities"
                  options={priorities.map((p) => ({ value: p, label: p }))}
                />
              </ToolbarGroup>
              <ToolbarGroup align="right">
                <ViewToggle
                  value={viewMode}
                  onChange={setViewMode}
                  options={[
                    { id: 'table', label: 'Table', icon: <TableIcon size={14} /> },
                    { id: 'matrix', label: 'Matrix', icon: <LayoutGrid size={14} /> },
                  ]}
                />
              </ToolbarGroup>
            </Toolbar>

            {viewMode === 'table' && (
              <Card
                title="Opportunity register"
                description="Search and triage recommendations before they become delivery initiatives. Click any row to inspect."
              >
                <DataTable
                  rows={filteredRows}
                  getRowKey={(row) => row.id}
                  selectedRowKey={selectedOpportunityId ?? undefined}
                  onRowClick={(row) => setSelectedOpportunityId(row.id)}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  emptyState="No opportunities match this search."
                  columns={[
                    {
                      key: 'Opportunity',
                      header: 'Opportunity',
                      sortable: true,
                      render: (row) => (
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--fabric-text)' }}>
                            {row.title}
                          </div>
                          <div className="body-copy body-copy--small">
                            {row.engagementName}
                          </div>
                        </div>
                      ),
                      width: '32%',
                    },
                    {
                      key: 'type',
                      header: 'Type',
                      sortable: true,
                      render: (row) => (
                        <span style={{ textTransform: 'capitalize', fontSize: 13 }}>
                          {row.type}
                        </span>
                      ),
                    },
                    {
                      key: 'priority',
                      header: 'Priority',
                      sortable: true,
                      render: (row) => (
                        <Badge tone={row.priorityTone}>{row.priority}</Badge>
                      ),
                    },
                    {
                      key: 'category',
                      header: 'Category',
                      sortable: true,
                      render: (row) => row.category ?? 'Uncategorised',
                    },
                    {
                      key: 'status',
                      header: 'Status',
                      sortable: true,
                      render: (row) => (
                        <Badge
                          tone={
                            row.status === 'approved' || row.status === 'in-delivery'
                              ? 'success'
                              : 'neutral'
                          }
                        >
                          {row.status}
                        </Badge>
                      ),
                    },
                    {
                      key: 'evidence',
                      header: 'Evidence',
                      sortable: true,
                      render: (row) => `${row.evidenceCount} refs`,
                    },
                    {
                      header: '',
                      align: 'right',
                      render: (row) => (
                        <Link
                          to={`/opportunities/${row.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="table-link"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <span>Full view</span> <ChevronRight size={14} />
                        </Link>
                      ),
                    },
                  ]}
                />
              </Card>
            )}

            {viewMode === 'matrix' && (
              <Card
                title="Interactive 2x2 Impact vs Effort Matrix"
                description="High impact / low effort indicates a Quick Win; high impact / high effort indicates a Strategic Project. Filter by quadrant or click any opportunity to inspect."
              >
                <OpportunityMatrix
                  opportunities={dataset.opportunities.map((op) => ({
                    id: op.id,
                    title: op.title,
                    type: op.type,
                    businessImpact: op.businessImpact ?? op.priority,
                    implementationEffort: op.implementationEffort ?? op.estimatedEffort,
                    priorityCategory: op.priorityCategory,
                    priorityScore: op.priority === 'critical' ? 95 : op.priority === 'high' ? 80 : op.priority === 'medium' ? 60 : 40,
                    approvalStatus: op.approvalState,
                    estimatedSaving: op.potentialBenefits ? op.potentialBenefits.slice(0, 30) : undefined,
                    rationale: op.whyItMatters || op.description,
                  }))}
                  selectedOpportunityId={selectedOpportunityId}
                  onSelectOpportunity={(op) => setSelectedOpportunityId(op.id)}
                />
              </Card>
            )}

            {/* Create Drawer */}
            <Sheet
              open={createSheetOpen}
              onOpenChange={setCreateSheetOpen}
              size="lg"
              eyebrow="Transformation"
              title="Create opportunity"
              description="Capture problem statement, proposed improvement, and target value."
            >
              <OpportunityForm
                onSaved={() => {
                  setCreateSheetOpen(false);
                }}
              />
            </Sheet>

            {/* Quick Inspector Drawer */}
            <Sheet
              open={Boolean(selectedOpp)}
              onOpenChange={(open) => {
                if (!open) setSelectedOpportunityId(null);
              }}
              size="lg"
              eyebrow={selectedOpp?.priorityCategory ?? 'Opportunity Inspector'}
              title={selectedOpp?.title}
              description={selectedOpp?.description}
              footer={
                selectedOpp && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedOpportunityId(null)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        navigate(`/opportunities/${selectedOpp.id}`);
                      }}
                    >
                      Open full detail workspace <ExternalLink size={14} style={{ marginLeft: 6 }} />
                    </Button>
                  </div>
                )
              }
            >
              {selectedOpp && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="detail-badges">
                    <Badge tone="accent">{selectedOpp.type}</Badge>
                    <Badge
                      tone={
                        selectedOpp.priority === 'critical' || selectedOpp.priority === 'high'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {selectedOpp.priority} priority
                    </Badge>
                    <Badge tone="neutral">Effort: {selectedOpp.estimatedEffort}</Badge>
                    <Badge
                      tone={
                        selectedOpp.status === 'approved' || selectedOpp.status === 'in-delivery'
                          ? 'success'
                          : 'neutral'
                      }
                    >
                      {selectedOpp.status}
                    </Badge>
                  </div>

                  <Tabs defaultValue="overview" variant="underline">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="problem">Problem & Cause</TabsTrigger>
                      <TabsTrigger value="benefits">Benefits & ROI</TabsTrigger>
                      <TabsTrigger
                        value="evidence"
                        badge={selectedOpp.evidenceIds.length}
                      >
                        Evidence
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      <dl className="detail-list" style={{ marginTop: 12 }}>
                        <dt>Current situation</dt>
                        <dd>{selectedOpp.currentSituation || 'Not documented'}</dd>
                        <dt>Recommended improvement</dt>
                        <dd>{selectedOpp.recommendedImprovement || selectedOpp.description}</dd>
                        <dt>Suggested next step</dt>
                        <dd>{selectedOpp.suggestedNextStep || 'None recorded'}</dd>
                        <dt>Recommended timing</dt>
                        <dd>{selectedOpp.recommendedTiming || 'Not specified'}</dd>
                      </dl>
                    </TabsContent>

                    <TabsContent value="problem">
                      <dl className="detail-list" style={{ marginTop: 12 }}>
                        <dt>Identified issue</dt>
                        <dd>{selectedOpp.identifiedIssue || selectedOpp.problemStatement}</dd>
                        <dt>Root cause</dt>
                        <dd>{selectedOpp.rootCause || 'Not specified'}</dd>
                        <dt>Why it matters</dt>
                        <dd>{selectedOpp.whyItMatters || 'Not specified'}</dd>
                      </dl>
                    </TabsContent>

                    <TabsContent value="benefits">
                      <dl className="detail-list" style={{ marginTop: 12 }}>
                        <dt>Potential benefits</dt>
                        <dd>{selectedOpp.potentialBenefits || selectedOpp.expectedImpact}</dd>
                        <dt>Value assumptions</dt>
                        <dd>{selectedOpp.valueAssumptions || 'None recorded'}</dd>
                        <dt>Investment band</dt>
                        <dd>{selectedOpp.investment || 'Unknown'}</dd>
                      </dl>
                    </TabsContent>

                    <TabsContent value="evidence">
                      <div style={{ marginTop: 12 }}>
                        {selectedOpp.evidenceIds.length === 0 ? (
                          <div className="ui-table-empty">
                            No direct evidence IDs linked to this opportunity.
                          </div>
                        ) : (
                          <div className="record-stack">
                            {selectedOpp.evidenceIds.map((eid) => (
                              <div
                                key={eid}
                                className="record-item record-item--note"
                              >
                                <div>
                                  <strong>Evidence ID: {eid}</strong>
                                  <p className="body-copy body-copy--small">
                                    Linked transformation fieldwork item
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </Sheet>
          </>
        );
      }}
    </FabricDataView>
  );
}
export function OpportunityDetailPage() {
  const { opportunityId } = useParams();
  const { createAction } = useFabricData();
  const [editingSheetOpen, setEditingSheetOpen] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [initiativeSheetOpen, setInitiativeSheetOpen] = useState(false);

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
      setActionSheetOpen(false);
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
              eyebrow="Transformation Workbench"
              title={opportunity.title}
              description={opportunity.clientSummary ?? opportunity.description}
              metadata={[
                opportunity.priorityCategory ?? 'Uncategorised',
                opportunity.status,
                opportunity.confidence,
              ]}
              actions={
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingSheetOpen(true)}
                  >
                    Edit opportunity
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setActionSheetOpen(true)}
                  >
                    + Action item
                  </Button>
                  {canCreateInitiative ? (
                    <Button
                      onClick={() => setInitiativeSheetOpen(true)}
                    >
                      Convert to delivery initiative
                    </Button>
                  ) : null}
                </div>
              }
            />

            <div className="detail-badges">
              <Badge tone="accent">{opportunity.type}</Badge>
              <Badge
                tone={
                  opportunity.priority === 'critical' || opportunity.priority === 'high'
                    ? 'warning'
                    : 'neutral'
                }
              >
                {opportunity.priority} priority
              </Badge>
              <Badge tone="neutral">Effort: {opportunity.estimatedEffort}</Badge>
              <Badge tone="neutral">Investment: {opportunity.investment ?? '£'}</Badge>
              <Badge
                tone={
                  opportunity.status === 'approved' || opportunity.status === 'in-delivery'
                    ? 'success'
                    : 'neutral'
                }
              >
                {opportunity.status}
              </Badge>
            </div>

            <Tabs defaultValue="transformation" variant="pills" style={{ marginTop: 16 }}>
              <TabsList>
                <TabsTrigger value="transformation">Problem & Transformation</TabsTrigger>
                <TabsTrigger value="evidence" badge={linkedEvidence.length + linkedObservations.length}>
                  Evidence & Lineage
                </TabsTrigger>
                <TabsTrigger value="actions" badge={actions.length}>
                  Action Items
                </TabsTrigger>
                <TabsTrigger value="delivery" badge={initiatives.length}>
                  Delivery & Roadmaps
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transformation">
                <section className="content-grid content-grid--two">
                  <Card title="Current situation & problem">
                    <dl className="detail-list">
                      <dt>Area / Process / System</dt>
                      <dd>
                        {dataset.areas.find((item) => item.id === opportunity.areaId)?.name ?? '—'} ·{' '}
                        {dataset.processes.find((item) => item.id === opportunity.processId)?.name ?? '—'} ·{' '}
                        {dataset.systems.find((item) => item.id === opportunity.systemId)?.name ?? '—'}
                      </dd>
                      <dt>Current situation</dt>
                      <dd>{opportunity.currentSituation || 'Not recorded'}</dd>
                      <dt>Identified issue</dt>
                      <dd>{opportunity.identifiedIssue || opportunity.problemStatement}</dd>
                      <dt>Root cause</dt>
                      <dd>{opportunity.rootCause || 'Not recorded'}</dd>
                      <dt>Why it matters</dt>
                      <dd>{opportunity.whyItMatters || 'Not recorded'}</dd>
                    </dl>
                  </Card>

                  <Card title="Target improvement & benefits">
                    <dl className="detail-list">
                      <dt>Improvement</dt>
                      <dd>{opportunity.recommendedImprovement || opportunity.description}</dd>
                      <dt>Expected benefits</dt>
                      <dd>{opportunity.potentialBenefits || opportunity.expectedImpact}</dd>
                      <dt>Assumptions</dt>
                      <dd>{opportunity.valueAssumptions || 'None'}</dd>
                      <dt>Next step</dt>
                      <dd>{opportunity.suggestedNextStep || 'None recorded'}</dd>
                    </dl>
                  </Card>
                </section>
              </TabsContent>

              <TabsContent value="evidence">
                <section className="content-grid content-grid--two">
                  <Card title={`Linked evidence records (${linkedEvidence.length})`}>
                    <DataTable
                      rows={linkedEvidence}
                      getRowKey={(row) => row.id}
                      emptyState="No evidence records directly linked."
                      columns={[
                        {
                          header: 'Title',
                          render: (row) => <strong>{row.title}</strong>,
                        },
                        {
                          header: 'Type',
                          render: (row) => row.evidenceType ?? row.kind,
                        },
                        {
                          header: 'Source',
                          render: (row) => row.source ?? row.origin,
                        },
                      ]}
                    />
                  </Card>

                  <Card title={`Linked observations (${linkedObservations.length})`}>
                    <div className="record-stack">
                      {linkedObservations.length === 0 ? (
                        <div className="ui-table-empty">No linked fieldwork observations.</div>
                      ) : (
                        linkedObservations.map((obs) => (
                          <div key={obs.id} className="record-item record-item--note">
                            <div>
                              <strong>{obs.title ?? obs.summary}</strong>
                              <p className="body-copy body-copy--small">
                                {obs.description ?? obs.detail}
                              </p>
                            </div>
                            <Badge tone="neutral">{obs.status ?? obs.assurance}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </section>
              </TabsContent>

              <TabsContent value="actions">
                <Card
                  title={`Action items (${actions.length})`}
                  description="Immediate tasks required before or during transformation."
                  actions={
                    <Button variant="ghost" onClick={() => setActionSheetOpen(true)}>
                      + Add action
                    </Button>
                  }
                >
                  <DataTable
                    rows={actions}
                    getRowKey={(row) => row.id}
                    emptyState="No action items created for this opportunity."
                    columns={[
                      {
                        header: 'Action',
                        render: (row) => <strong>{row.title}</strong>,
                      },
                      {
                        header: 'Status',
                        render: (row) => <Badge tone="neutral">{row.status}</Badge>,
                      },
                      {
                        header: 'Priority',
                        render: (row) => <Badge tone="warning">{row.priority}</Badge>,
                      },
                      {
                        header: 'Owner',
                        render: (row) => row.owner ?? 'Unassigned',
                      },
                    ]}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="delivery">
                <Card
                  title={`Delivery initiatives (${initiatives.length})`}
                  description="Approved initiatives executed through the transformation roadmap."
                >
                  {initiatives.length === 0 ? (
                    <div className="ui-table-empty">
                      No initiative created yet.
                      {canCreateInitiative && (
                        <div style={{ marginTop: 10 }}>
                          <Button onClick={() => setInitiativeSheetOpen(true)}>
                            Convert to delivery initiative
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="record-stack">
                      {initiatives.map((init) => (
                        <div key={init.id} className="record-item record-item--note">
                          <div>
                            <Link to={`/roadmap/${init.id}`} className="table-link">
                              <strong>{init.title}</strong>
                            </Link>
                            <p className="body-copy">{init.description}</p>
                            <span className="record-item__meta">
                              Phase: {init.phase} · Priority: {init.priority}
                            </span>
                          </div>
                          <Badge tone="success">{init.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>

            <Sheet
              open={editingSheetOpen}
              onOpenChange={setEditingSheetOpen}
              size="lg"
              title="Edit opportunity"
              description="Update problem definition, benefits, or delivery priority."
            >
              <OpportunityForm
                key={opportunity.updatedAt}
                opportunity={opportunity}
                onSaved={() => setEditingSheetOpen(false)}
              />
            </Sheet>

            <Sheet
              open={actionSheetOpen}
              onOpenChange={setActionSheetOpen}
              size="md"
              title="Add action item"
              description="Create a task linked directly to this opportunity."
            >
              <form
                className="entity-form"
                onSubmit={(e) => void addAction(e, opportunity)}
              >
                <Field label="Action title">
                  <input
                    required
                    value={actionTitle}
                    onChange={(e) => setActionTitle(e.target.value)}
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    rows={3}
                    value={actionDescription}
                    onChange={(e) => setActionDescription(e.target.value)}
                  />
                </Field>
                {actionError && (
                  <p className="form-error" role="alert">
                    {actionError}
                  </p>
                )}
                <Button type="submit">Create action item</Button>
              </form>
            </Sheet>

            <Sheet
              open={initiativeSheetOpen}
              onOpenChange={setInitiativeSheetOpen}
              size="lg"
              title="Create delivery initiative"
              description="Promote this approved opportunity into a scheduled roadmap initiative."
            >
              <InitiativeForm
                opportunity={opportunity}
                onSaved={() => setInitiativeSheetOpen(false)}
              />
            </Sheet>
          </>
        );
      }}
    </FabricDataView>
  );
}
