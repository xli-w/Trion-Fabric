import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Archive,
  BookOpenCheck,
  CheckCircle2,
  Pencil,
  Plus,
} from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  DataTable,
  FilterSelect,
  PageHeader,
  SearchInput,
  Sheet,
  StatCard,
  Toolbar,
  ToolbarGroup,
} from '@ui';
import {
  knowledgeAreaTags,
  knowledgeEntryStatuses,
  knowledgeEntryTypes,
  knowledgeIndustryTags,
  knowledgeProcessTags,
  knowledgeSystemTags,
  opportunityTypes,
  type KnowledgeEntry,
} from '@domain';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';
import { KnowledgeEntryForm } from '@app/features/knowledge/KnowledgeEntryForm';
import {
  buildKnowledgeLibrary,
  type KnowledgeLibraryFilters,
} from '@app/features/fabric-data/selectors';

function labelise(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function selectedTaxonomyValue<T extends string>(
  value: string,
  options: readonly T[],
) {
  return options.find((option) => option === value);
}

export function KnowledgePage() {
  const { currentUser, canPerform, updateKnowledgeEntry } = useFabricData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string | null>(
    searchParams.get('knowledge'),
  );
  const [editingKnowledgeId, setEditingKnowledgeId] = useState<string | null>(
    null,
  );
  const [creating, setCreating] = useState(false);
  const [retiringKnowledgeId, setRetiringKnowledgeId] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [area, setArea] = useState('');
  const [process, setProcess] = useState('');
  const [system, setSystem] = useState('');
  const [industry, setIndustry] = useState('');
  const [opportunityType, setOpportunityType] = useState('');

  useEffect(() => {
    setSelectedKnowledgeId(searchParams.get('knowledge'));
    setRetiringKnowledgeId(null);
  }, [searchParams]);

  function selectKnowledge(knowledgeId: string) {
    setSelectedKnowledgeId(knowledgeId);
    setSearchParams({ knowledge: knowledgeId });
  }

  async function transition(
    entry: KnowledgeEntry,
    statusToApply: KnowledgeEntry['status'],
  ) {
    setMessage(null);
    setError(null);
    try {
      const saved = await updateKnowledgeEntry({
        ...entry,
        status: statusToApply,
      });
      setSelectedKnowledgeId(saved.id);
      setSearchParams({ knowledge: saved.id });
      setMessage(
        statusToApply === 'approved'
          ? 'Knowledge approved for internal reuse and retrieval.'
          : statusToApply === 'internal-review'
            ? 'Knowledge submitted for internal review.'
            : 'Knowledge entry retired from active reuse.',
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'The knowledge status could not be changed.',
      );
    }
  }

  return (
    <FabricDataView
      emptyTitle="Reusable knowledge cannot be loaded"
      loadingDescription="Loading governed Trion methodology, patterns, and approved delivery learning."
      loadingTitle="Loading reusable knowledge"
    >
      {(dataset) => {
        if (!currentUser) {
          return null;
        }

        const filters: KnowledgeLibraryFilters = {
          query: query || undefined,
          type: type || undefined,
          status: status || undefined,
          area: selectedTaxonomyValue(area, knowledgeAreaTags),
          process: selectedTaxonomyValue(process, knowledgeProcessTags),
          system: selectedTaxonomyValue(system, knowledgeSystemTags),
          industry: selectedTaxonomyValue(industry, knowledgeIndustryTags),
          opportunityType: selectedTaxonomyValue(
            opportunityType,
            opportunityTypes,
          ),
        };
        const library = buildKnowledgeLibrary(dataset, currentUser, filters);
        const selectedKnowledge = selectedKnowledgeId
          ? library.rows.find((entry) => entry.id === selectedKnowledgeId)
          : undefined;
        const editingKnowledge = editingKnowledgeId
          ? dataset.knowledgeEntries.find(
              (entry) => entry.id === editingKnowledgeId,
            )
          : undefined;
        const canEdit = canPerform('knowledge:write');
        const canApprove = canPerform('knowledge:approve');

        return (
          <>
            <PageHeader
              eyebrow="Internal practice"
              title="Reusable transformation knowledge"
              description="Governed methodology guidance, manufacturing patterns, opportunity approaches, checklists, anonymised examples, and learning that can safely support future work."
              metadata={[
                'Separate from client records',
                'Controlled taxonomy',
                'Approved entries available to retrieval',
              ]}
              actions={
                canEdit ? (
                  <Button
                    onClick={() => {
                      setEditingKnowledgeId(null);
                      setCreating(true);
                    }}
                  >
                    <Plus size={16} /> Add knowledge
                  </Button>
                ) : undefined
              }
            />

            {message ? (
              <p className="form-success" role="status">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Entries available in this internal knowledge view."
                label="Visible knowledge"
                tone="accent"
                value={String(library.metrics.total)}
              />
              <StatCard
                detail="Approved internal entries are eligible for the retrieval service."
                label="Approved for reuse"
                tone="success"
                value={String(library.metrics.approved)}
              />
              <StatCard
                detail="Entries held for explicit internal review."
                label="In review"
                tone="warning"
                value={String(library.metrics.inReview)}
              />
              <StatCard
                detail="No free-form tags: classifications use the shared taxonomy."
                label="Controlled taxonomy"
                tone="neutral"
                value="8 types"
              />
            </section>

            <Toolbar className="knowledge-library__toolbar">
              <ToolbarGroup>
                <SearchInput
                  onChange={setQuery}
                  placeholder="Search approved patterns, prompts, and checklists..."
                  value={query}
                />
                <FilterSelect
                  allLabel="All knowledge types"
                  label="Type"
                  onChange={setType}
                  options={knowledgeEntryTypes.map((value) => ({
                    value,
                    label: labelise(value),
                  }))}
                  value={type}
                />
                {library.canManage ? (
                  <FilterSelect
                    allLabel="All statuses"
                    label="Status"
                    onChange={setStatus}
                    options={knowledgeEntryStatuses.map((value) => ({
                      value,
                      label: labelise(value),
                    }))}
                    value={status}
                  />
                ) : null}
                <FilterSelect
                  allLabel="All areas"
                  label="Area"
                  onChange={setArea}
                  options={knowledgeAreaTags.map((value) => ({
                    value,
                    label: labelise(value),
                  }))}
                  value={area}
                />
                <FilterSelect
                  allLabel="All processes"
                  label="Process"
                  onChange={setProcess}
                  options={knowledgeProcessTags.map((value) => ({
                    value,
                    label: labelise(value),
                  }))}
                  value={process}
                />
                <FilterSelect
                  allLabel="All systems"
                  label="System"
                  onChange={setSystem}
                  options={knowledgeSystemTags.map((value) => ({
                    value,
                    label: labelise(value),
                  }))}
                  value={system}
                />
                <FilterSelect
                  allLabel="All industries"
                  label="Industry"
                  onChange={setIndustry}
                  options={knowledgeIndustryTags.map((value) => ({
                    value,
                    label: labelise(value),
                  }))}
                  value={industry}
                />
                <FilterSelect
                  allLabel="All opportunity types"
                  label="Opportunity"
                  onChange={setOpportunityType}
                  options={opportunityTypes.map((value) => ({
                    value,
                    label: labelise(value),
                  }))}
                  value={opportunityType}
                />
              </ToolbarGroup>
            </Toolbar>

            <Card
              title="Internal knowledge register"
              description={
                library.canManage
                  ? 'Draft, review, approved, and retired knowledge is visible to authorised maintainers.'
                  : 'Only approved internal knowledge is available for reuse. Draft client and engagement material does not enter this library.'
              }
            >
              <DataTable
                columns={[
                  {
                    header: 'Knowledge',
                    key: 'knowledge',
                    render: (row) => (
                      <div>
                        <strong>{row.title}</strong>
                        <p className="body-copy body-copy--small">
                          {row.summary}
                        </p>
                      </div>
                    ),
                    width: '36%',
                  },
                  {
                    header: 'Type',
                    render: (row) => labelise(row.type),
                  },
                  {
                    header: 'Status',
                    render: (row) => (
                      <Badge tone={row.statusTone}>
                        {labelise(row.status)}
                      </Badge>
                    ),
                  },
                  {
                    header: 'Method',
                    render: (row) =>
                      row.methodologyStage
                        ? labelise(row.methodologyStage)
                        : 'Cross-stage',
                  },
                  {
                    header: 'Classification',
                    render: (row) => (
                      <span className="knowledge-library__tag-summary">
                        {row.tags.slice(0, 3).map(labelise).join(' · ')}
                        {row.tags.length > 3 ? ` +${row.tags.length - 3}` : ''}
                      </span>
                    ),
                  },
                ]}
                emptyState="No reusable knowledge matches these filters."
                getRowKey={(row) => row.id}
                onRowClick={(row) => selectKnowledge(row.id)}
                rows={library.rows}
                selectedRowKey={selectedKnowledge?.id}
              />
            </Card>

            <Sheet
              description={
                selectedKnowledge
                  ? `${labelise(selectedKnowledge.type)} · ${labelise(
                      selectedKnowledge.source,
                    )}`
                  : undefined
              }
              eyebrow="Internal reusable knowledge"
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedKnowledgeId(null);
                  setSearchParams({});
                }
              }}
              open={Boolean(selectedKnowledge)}
              size="lg"
              title={selectedKnowledge?.title}
            >
              {selectedKnowledge ? (
                <div className="knowledge-inspector">
                  <div className="detail-badges">
                    <Badge tone={selectedKnowledge.statusTone}>
                      {labelise(selectedKnowledge.status)}
                    </Badge>
                    <Badge tone="accent">
                      {labelise(selectedKnowledge.type)}
                    </Badge>
                    <Badge tone="neutral">Internal only</Badge>
                  </div>
                  <section>
                    <h3>Reusable guidance</h3>
                    <p className="body-copy">{selectedKnowledge.content}</p>
                  </section>
                  <section>
                    <h3>Structured classification</h3>
                    <div className="knowledge-tag-list">
                      {selectedKnowledge.tags.map((tag) => (
                        <span key={tag}>{labelise(tag)}</span>
                      ))}
                    </div>
                  </section>
                  <section className="knowledge-inspector__governance">
                    <h3>Governance</h3>
                    <dl className="detail-list">
                      <dt>Source</dt>
                      <dd>{labelise(selectedKnowledge.source)}</dd>
                      <dt>Methodology stage</dt>
                      <dd>
                        {selectedKnowledge.methodologyStage
                          ? labelise(selectedKnowledge.methodologyStage)
                          : 'Cross-stage'}
                      </dd>
                      <dt>Approval</dt>
                      <dd>
                        {selectedKnowledge.entry.reviewedAt
                          ? `Reviewed ${new Intl.DateTimeFormat('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }).format(
                              new Date(selectedKnowledge.entry.reviewedAt),
                            )}`
                          : 'Not yet approved for reuse'}
                      </dd>
                    </dl>
                    <p className="body-copy body-copy--small">
                      Knowledge does not retain client or engagement
                      identifiers, and it cannot become a controlled client
                      output source.
                    </p>
                  </section>
                  <div className="knowledge-inspector__actions">
                    {canEdit ? (
                      <Button
                        onClick={() => {
                          setEditingKnowledgeId(selectedKnowledge.id);
                          setCreating(false);
                        }}
                        variant="secondary"
                      >
                        <Pencil size={15} /> Edit
                      </Button>
                    ) : null}
                    {canEdit && selectedKnowledge.status === 'draft' ? (
                      <Button
                        onClick={() =>
                          void transition(
                            selectedKnowledge.entry,
                            'internal-review',
                          )
                        }
                        variant="secondary"
                      >
                        <BookOpenCheck size={15} /> Submit for review
                      </Button>
                    ) : null}
                    {canApprove &&
                    selectedKnowledge.status === 'internal-review' ? (
                      <Button
                        onClick={() =>
                          void transition(selectedKnowledge.entry, 'approved')
                        }
                      >
                        <CheckCircle2 size={15} /> Approve for reuse
                      </Button>
                    ) : null}
                    {canEdit && selectedKnowledge.status !== 'retired' ? (
                      retiringKnowledgeId === selectedKnowledge.id ? (
                        <section
                          className="knowledge-retirement-confirmation"
                          role="alert"
                        >
                          <strong>Retire this knowledge entry?</strong>
                          <p className="body-copy body-copy--small">
                            Retired knowledge is excluded from active reuse and
                            retrieval, while its history remains retained.
                          </p>
                          <div className="knowledge-inspector__actions">
                            <Button
                              onClick={() => setRetiringKnowledgeId(null)}
                              variant="ghost"
                            >
                              Keep active
                            </Button>
                            <Button
                              onClick={() => {
                                setRetiringKnowledgeId(null);
                                void transition(
                                  selectedKnowledge.entry,
                                  'retired',
                                );
                              }}
                              variant="secondary"
                            >
                              Confirm retirement
                            </Button>
                          </div>
                        </section>
                      ) : (
                        <Button
                          onClick={() =>
                            setRetiringKnowledgeId(selectedKnowledge.id)
                          }
                          variant="ghost"
                        >
                          <Archive size={15} /> Retire
                        </Button>
                      )
                    ) : null}
                  </div>
                </div>
              ) : null}
            </Sheet>

            <Sheet
              description="Use controlled classification. Never copy client-specific notes or confidential figures into reusable knowledge."
              eyebrow={
                editingKnowledge
                  ? 'Edit internal knowledge'
                  : 'New internal knowledge'
              }
              onOpenChange={(open) => {
                if (!open) {
                  setCreating(false);
                  setEditingKnowledgeId(null);
                }
              }}
              open={creating || Boolean(editingKnowledge)}
              size="xl"
              title={
                editingKnowledge
                  ? editingKnowledge.title
                  : 'Add reusable knowledge'
              }
            >
              <KnowledgeEntryForm
                entry={editingKnowledge}
                onSaved={(saved) => {
                  setCreating(false);
                  setEditingKnowledgeId(null);
                  selectKnowledge(saved.id);
                  setMessage(
                    saved.status === 'internal-review'
                      ? 'Knowledge submitted for internal review.'
                      : 'Internal knowledge draft saved.',
                  );
                }}
              />
            </Sheet>
          </>
        );
      }}
    </FabricDataView>
  );
}
