import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ExternalLink, Plus } from 'lucide-react';

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toolbar,
  ToolbarGroup,
} from '@ui';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import {
  EvidenceForm,
  FrictionForm,
  ObservationForm,
  SiteWalkForm,
} from '@app/features/site-walks/SiteWalkForms';
import { siteWalkSections } from '@app/features/site-walks/site-walk-prompts';
import { buildSiteWalksViewModel } from '@app/features/fabric-data/selectors';

export function SiteWalksPage() {
  const navigate = useNavigate();
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [selectedWalkId, setSelectedWalkId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('Scheduled');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  return (
    <FabricDataView
      emptyTitle="Site walks cannot be loaded"
      loadingDescription="Loading structured site walk data and evidence capture status."
      loadingTitle="Loading site walks"
    >
      {(dataset) => {
        const viewModel = buildSiteWalksViewModel(dataset);

        let filteredRows = viewModel.rows.filter((row) => {
          const matchesQuery = `${row.title} ${row.engagementName} ${row.siteName} ${row.areaName} ${row.consultantName}`
            .toLowerCase()
            .includes(query.toLowerCase());
          const matchesStatus = !statusFilter || row.status === statusFilter;
          return matchesQuery && matchesStatus;
        });

        filteredRows = [...filteredRows].sort((a, b) => {
          let aVal: string | number = '';
          let bVal: string | number = '';

          if (sortColumn === 'Walk') {
            aVal = a.title;
            bVal = b.title;
          } else if (sortColumn === 'status') {
            aVal = a.status;
            bVal = b.status;
          } else if (sortColumn === 'Scheduled') {
            aVal = a.scheduledAt;
            bVal = b.scheduledAt;
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

        const selectedWalk = selectedWalkId
          ? dataset.siteWalks.find((w) => w.id === selectedWalkId)
          : null;
        const selectedSite = selectedWalk
          ? dataset.sites.find((s) => s.id === selectedWalk.siteId)
          : null;
        const selectedEngagement = selectedWalk
          ? dataset.engagements.find((e) => e.id === selectedWalk.engagementId)
          : null;
        const selectedObservations = selectedWalk
          ? dataset.observations.filter((o) => o.siteWalkId === selectedWalk.id)
          : [];

        return (
          <>
            <PageHeader
              eyebrow="Sites & site walks"
              title="Structured fieldwork & investigation"
              description="A flexible investigation workspace for preliminary walks and deeper diagnostic visits. Capture context, findings, evidence, friction, and next steps without turning the checklist into the product."
              metadata={['Fast capture', 'Traceable evidence', 'Review-ready']}
              actions={
                <Button onClick={() => setCreateSheetOpen(true)}>
                  <Plus size={16} style={{ marginRight: 6 }} /> Plan site walk
                </Button>
              }
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Completed walks with structured findings."
                label="Completed"
                tone="success"
                value={String(viewModel.completedCount)}
              />
              <StatCard
                detail="Planned or in-flight fieldwork."
                label="Upcoming"
                tone="warning"
                value={String(viewModel.upcomingCount)}
              />
              <StatCard
                detail="Observations attached to site walks."
                label="Observations"
                tone="accent"
                value={String(viewModel.observationCount)}
              />
              <StatCard
                detail="Friction items with indicative assumptions."
                label="Friction items"
                tone="neutral"
                value={String(dataset.frictionItems.length)}
              />
            </section>

            <Toolbar>
              <ToolbarGroup>
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder="Search walks by title, site, client..."
                />
                <FilterSelect
                  label="Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  allLabel="All statuses"
                  options={[
                    { value: 'planned', label: 'planned' },
                    { value: 'in-progress', label: 'in-progress' },
                    { value: 'completed', label: 'completed' },
                    { value: 'needs-follow-up', label: 'needs-follow-up' },
                  ]}
                />
              </ToolbarGroup>
            </Toolbar>

            <Card
              title="Fieldwork register"
              description="Click any row to open the inspector or navigate to the full investigation workspace."
            >
              <DataTable
                rows={filteredRows}
                getRowKey={(row) => row.id}
                selectedRowKey={selectedWalkId ?? undefined}
                onRowClick={(row) => setSelectedWalkId(row.id)}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                emptyState="No site walks match this search."
                columns={[
                  {
                    key: 'Walk',
                    header: 'Walk',
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
                    width: '30%',
                  },
                  {
                    key: 'site',
                    header: 'Site / area',
                    render: (row) => `${row.siteName} · ${row.areaName}`,
                  },
                  {
                    key: 'consultant',
                    header: 'Consultant',
                    render: (row) => row.consultantName,
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    sortable: true,
                    render: (row) => (
                      <Badge tone={row.statusTone}>{row.status}</Badge>
                    ),
                  },
                  {
                    key: 'capture',
                    header: 'Findings capture',
                    render: (row) =>
                      `${row.scopeCount} observations · ${row.followUpCount} follow-up`,
                  },
                  {
                    key: 'Scheduled',
                    header: 'Scheduled',
                    sortable: true,
                    render: (row) => row.scheduledAt,
                  },
                  {
                    header: '',
                    align: 'right',
                    render: (row) => (
                      <Link
                        to={`/site-walks/${row.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="table-link"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <span>Workspace</span> <ChevronRight size={14} />
                      </Link>
                    ),
                  },
                ]}
              />
            </Card>

            {/* Create Sheet */}
            <Sheet
              open={createSheetOpen}
              onOpenChange={setCreateSheetOpen}
              size="lg"
              eyebrow="Fieldwork"
              title="Plan a site walk"
              description="Schedule a factory tour, define focus areas, and record participants."
            >
              <SiteWalkForm onSaved={() => setCreateSheetOpen(false)} />
            </Sheet>

            {/* Quick Inspector Sheet */}
            <Sheet
              open={Boolean(selectedWalk)}
              onOpenChange={(open) => {
                if (!open) setSelectedWalkId(null);
              }}
              size="lg"
              eyebrow="Fieldwork inspector"
              title={selectedWalk?.title}
              description={`${selectedSite?.name ?? 'Site'} · ${selectedEngagement?.name ?? 'Engagement'}`}
              footer={
                selectedWalk && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedWalkId(null)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        navigate(`/site-walks/${selectedWalk.id}`);
                      }}
                    >
                      Open full workspace <ExternalLink size={14} style={{ marginLeft: 6 }} />
                    </Button>
                  </div>
                )
              }
            >
              {selectedWalk && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="detail-badges">
                    <Badge tone="accent">{selectedWalk.walkType}</Badge>
                    <Badge
                      tone={
                        selectedWalk.status === 'completed'
                          ? 'success'
                          : selectedWalk.status === 'needs-follow-up'
                            ? 'warning'
                            : 'neutral'
                      }
                    >
                      {selectedWalk.status}
                    </Badge>
                  </div>

                  <Tabs defaultValue="overview" variant="underline">
                    <TabsList>
                      <TabsTrigger value="overview">Briefing & Focus</TabsTrigger>
                      <TabsTrigger
                        value="observations"
                        badge={selectedObservations.length}
                      >
                        Observations
                      </TabsTrigger>
                      <TabsTrigger value="recap">Post-Tour Recap</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      <dl className="detail-list" style={{ marginTop: 12 }}>
                        <dt>Objectives</dt>
                        <dd>{selectedWalk.objectives || 'Not recorded'}</dd>
                        <dt>Business context</dt>
                        <dd>{selectedWalk.businessContext || 'Not recorded'}</dd>
                        <dt>Participants</dt>
                        <dd>{selectedWalk.participants || 'Not recorded'}</dd>
                        <dt>Focus areas</dt>
                        <dd>{selectedWalk.focusAreas?.join(', ') || 'General walk'}</dd>
                        <dt>Candidate bottleneck</dt>
                        <dd>{selectedWalk.candidateBottleneck || 'None identified'}</dd>
                      </dl>
                    </TabsContent>

                    <TabsContent value="observations">
                      <div style={{ marginTop: 12 }}>
                        {selectedObservations.length === 0 ? (
                          <div className="ui-table-empty">
                            No observations captured for this walk yet.
                          </div>
                        ) : (
                          <div className="record-stack">
                            {selectedObservations.map((obs) => (
                              <div
                                key={obs.id}
                                className="record-item record-item--note"
                              >
                                <div>
                                  <strong>{obs.title || obs.summary}</strong>
                                  <p className="body-copy body-copy--small">
                                    {obs.description || obs.detail}
                                  </p>
                                </div>
                                <Badge
                                  tone={
                                    obs.status === 'verified'
                                      ? 'success'
                                      : 'warning'
                                  }
                                >
                                  {obs.status || obs.assurance}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="recap">
                      <dl className="detail-list" style={{ marginTop: 12 }}>
                        <dt>Process summary</dt>
                        <dd>{selectedWalk.overallProcessSummary || 'Not recorded'}</dd>
                        <dt>Confirmed bottleneck</dt>
                        <dd>{selectedWalk.confirmedBottleneck || 'None'}</dd>
                        <dt>Agreed next step</dt>
                        <dd>{selectedWalk.agreedNextStep || 'None'}</dd>
                        <dt>Diagnostic recommendation</dt>
                        <dd>
                          {selectedWalk.recommendDiagnostic === undefined
                            ? 'Not assessed'
                            : selectedWalk.recommendDiagnostic
                              ? 'Recommended'
                              : 'Not recommended'}
                        </dd>
                      </dl>
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

export function SiteWalkWorkspacePage() {
  const { siteWalkId } = useParams();
  const [editingSheetOpen, setEditingSheetOpen] = useState(false);
  const [capture, setCapture] = useState<
    'observation' | 'evidence' | 'friction' | null
  >(null);

  return (
    <FabricDataView
      emptyTitle="Site walk cannot be loaded"
      loadingDescription="Loading investigation workspace."
      loadingTitle="Loading site walk"
    >
      {(loadedDataset) => {
        const walk = loadedDataset.siteWalks.find(
          (item) => item.id === siteWalkId,
        );
        if (!walk) return <p className="body-copy">Site walk not found.</p>;
        const observations = loadedDataset.observations.filter(
          (item) => item.siteWalkId === walk.id,
        );
        const evidence = loadedDataset.evidence.filter(
          (item) =>
            item.siteWalkId === walk.id ||
            item.relatedEntityId === walk.id ||
            observations.some(
              (observation) => observation.id === item.relatedEntityId,
            ),
        );
        const friction = loadedDataset.frictionItems.filter(
          (item) => item.siteWalkId === walk.id,
        );
        const site = loadedDataset.sites.find(
          (item) => item.id === walk.siteId,
        );
        const engagement = loadedDataset.engagements.find(
          (item) => item.id === walk.engagementId,
        );
        return (
          <>
            <PageHeader
              eyebrow="Fieldwork Investigation"
              title={walk.title}
              description={`${site?.name ?? 'Unknown site'} · ${engagement?.name ?? 'Unknown engagement'}`}
              metadata={[walk.walkType, walk.status]}
              actions={
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingSheetOpen(true)}
                  >
                    Edit walk
                  </Button>
                  <Button onClick={() => setCapture('observation')}>
                    + Capture observation
                  </Button>
                  <Button variant="secondary" onClick={() => setCapture('evidence')}>
                    + Attach evidence
                  </Button>
                </div>
              }
            />

            <div className="detail-badges">
              <Badge tone="accent">{walk.walkType}</Badge>
              <Badge
                tone={
                  walk.status === 'completed'
                    ? 'success'
                    : walk.status === 'needs-follow-up'
                      ? 'warning'
                      : 'neutral'
                }
              >
                {walk.status}
              </Badge>
            </div>

            <Tabs defaultValue="findings" variant="pills" style={{ marginTop: 16 }}>
              <TabsList>
                <TabsTrigger value="findings" badge={observations.length}>
                  Observations & Findings
                </TabsTrigger>
                <TabsTrigger value="evidence" badge={evidence.length}>
                  Evidence & Media
                </TabsTrigger>
                <TabsTrigger value="friction" badge={friction.length}>
                  Friction & Loss Points
                </TabsTrigger>
                <TabsTrigger value="briefing">Pre-Tour & Guidance</TabsTrigger>
                <TabsTrigger value="recap">Post-Tour Recap</TabsTrigger>
              </TabsList>

              {/* Tab 1: Observations */}
              <TabsContent value="findings">
                <Card
                  title={`Observations (${observations.length})`}
                  actions={
                    <Button
                      variant="ghost"
                      onClick={() => setCapture('observation')}
                    >
                      + Add observation
                    </Button>
                  }
                >
                  <div className="record-stack">
                    {observations.length === 0 ? (
                      <div className="ui-table-empty">
                        No observations recorded during this walk yet.
                      </div>
                    ) : (
                      observations.map((observation) => (
                        <article
                          className="record-item record-item--note"
                          key={observation.id}
                        >
                          <div>
                            <strong>
                              {observation.title ?? observation.summary}
                            </strong>
                            <p className="body-copy">
                              {observation.description ?? observation.detail}
                            </p>
                            <span className="record-item__meta">
                              {observation.observationType ?? 'Uncategorised'} ·{' '}
                              {observation.source ?? observation.origin} ·{' '}
                              {observation.confidence ?? 'unrated'} confidence
                            </span>
                          </div>
                          <Badge
                            tone={
                              observation.status === 'verified'
                                ? 'success'
                                : 'warning'
                            }
                          >
                            {observation.status ?? observation.assurance}
                          </Badge>
                        </article>
                      ))
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Tab 2: Evidence */}
              <TabsContent value="evidence">
                <Card
                  title={`Attached evidence (${evidence.length})`}
                  actions={
                    <Button variant="ghost" onClick={() => setCapture('evidence')}>
                      + Add evidence
                    </Button>
                  }
                >
                  <DataTable
                    rows={evidence}
                    getRowKey={(row) => row.id}
                    emptyState="No evidence attached yet."
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
                      {
                        header: 'Review',
                        render: (row) => (
                          <Badge
                            tone={
                              row.reviewStatus === 'verified' ||
                              row.approvalState === 'approved'
                                ? 'success'
                                : 'warning'
                            }
                          >
                            {row.reviewStatus ?? row.approvalState}
                          </Badge>
                        ),
                      },
                      {
                        header: 'Reference',
                        render: (row) => row.fileReference ?? 'No file reference',
                      },
                    ]}
                  />
                </Card>
              </TabsContent>

              {/* Tab 3: Friction */}
              <TabsContent value="friction">
                <Card
                  title={`Friction & loss-aversion (${friction.length})`}
                  description="All time, hours, and cost values are indicative until assumptions are validated."
                  actions={
                    <Button variant="ghost" onClick={() => setCapture('friction')}>
                      + Add friction
                    </Button>
                  }
                >
                  <DataTable
                    rows={friction}
                    getRowKey={(row) => row.id}
                    emptyState="No friction items recorded yet."
                    columns={[
                      {
                        header: 'Station / Line',
                        render: (row) => row.stationOrLine,
                      },
                      { header: 'Friction point', render: (row) => row.frictionPoint },
                      {
                        header: 'Indicative impact',
                        render: (row) =>
                          `${row.estimatedAnnualHours ?? '—'} hours · ${row.estimatedAnnualCostImpact ?? '—'}`,
                      },
                      { header: 'Confidence', render: (row) => row.confidence },
                      {
                        header: 'Assumptions',
                        render: (row) => row.assumptions ?? 'Required',
                      },
                    ]}
                  />
                </Card>
              </TabsContent>

              {/* Tab 4: Pre-Tour & Guidance */}
              <TabsContent value="briefing">
                <section className="content-grid content-grid--two">
                  <Card
                    title="Pre-tour briefing"
                    description="Context and hypotheses remain separate from verified findings."
                  >
                    <dl className="detail-list">
                      <dt>Objectives</dt>
                      <dd>{walk.objectives ?? 'Not recorded'}</dd>
                      <dt>Business context</dt>
                      <dd>{walk.businessContext ?? 'Not recorded'}</dd>
                      <dt>People present</dt>
                      <dd>{walk.participants ?? 'Not recorded'}</dd>
                      <dt>Focus areas</dt>
                      <dd>{walk.focusAreas?.join(', ') ?? 'Not recorded'}</dd>
                      <dt>Candidate bottleneck</dt>
                      <dd>{walk.candidateBottleneck ?? 'Not recorded'}</dd>
                    </dl>
                    <div className="prompt-checklist">
                      {siteWalkSections[0].prompts.map((prompt) => (
                        <span key={prompt}>□ {prompt}</span>
                      ))}
                    </div>
                  </Card>
                  <Card
                    title="Guided investigation prompts"
                    description="Use prompts as a flexible framework; findings live in observations and evidence."
                  >
                    <div className="prompt-section-list">
                      {siteWalkSections.slice(1, 5).map((section) => (
                        <details key={section.key}>
                          <summary>{section.title}</summary>
                          <div className="prompt-list">
                            {section.prompts.map((prompt) => (
                              <span key={prompt}>{prompt}</span>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  </Card>
                </section>
              </TabsContent>

              {/* Tab 5: Post-Tour Recap */}
              <TabsContent value="recap">
                <Card
                  title="Post-tour recap"
                  description="Close the loop with validation, ownership, and an explicit next step."
                >
                  <dl className="detail-list">
                    <dt>Process summary</dt>
                    <dd>{walk.overallProcessSummary ?? 'Not recorded'}</dd>
                    <dt>Confirmed bottleneck</dt>
                    <dd>
                      {walk.confirmedBottleneck ??
                        walk.candidateBottleneck ??
                        'Not recorded'}
                    </dd>
                    <dt>Agreed next step</dt>
                    <dd>{walk.agreedNextStep ?? 'Not recorded'}</dd>
                    <dt>Deeper diagnostic</dt>
                    <dd>
                      {walk.recommendDiagnostic === undefined
                        ? 'Not decided'
                        : walk.recommendDiagnostic
                          ? 'Recommended'
                          : 'Not currently recommended'}
                    </dd>
                  </dl>
                  <div className="prompt-list" style={{ marginTop: 16 }}>
                    {siteWalkSections[5].prompts.map((prompt) => (
                      <span key={prompt}>{prompt}</span>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Sheets */}
            <Sheet
              open={editingSheetOpen}
              onOpenChange={setEditingSheetOpen}
              size="lg"
              title="Edit walk context"
              description="Update objectives, participants, or focus areas."
            >
              <SiteWalkForm
                key={walk.updatedAt}
                walk={walk}
                onSaved={() => setEditingSheetOpen(false)}
              />
            </Sheet>

            <Sheet
              open={capture === 'observation'}
              onOpenChange={(open) => {
                if (!open) setCapture(null);
              }}
              size="lg"
              title="Capture observation"
              description="Record what is known, where it came from, and whether it has been verified."
            >
              <ObservationForm
                siteWalkId={walk.id}
                onSaved={() => setCapture(null)}
              />
            </Sheet>

            <Sheet
              open={capture === 'evidence'}
              onOpenChange={(open) => {
                if (!open) setCapture(null);
              }}
              size="md"
              title="Attach evidence"
              description="Use a safe file reference where storage is not yet configured."
            >
              <EvidenceForm
                siteWalkId={walk.id}
                onSaved={() => setCapture(null)}
              />
            </Sheet>

            <Sheet
              open={capture === 'friction'}
              onOpenChange={(open) => {
                if (!open) setCapture(null);
              }}
              size="lg"
              title="Record friction or loss"
              description="Estimate annual hours and cost impact with explicit confidence."
            >
              <FrictionForm
                siteWalkId={walk.id}
                onSaved={() => setCapture(null)}
              />
            </Sheet>
          </>
        );
      }}
    </FabricDataView>
  );
}
