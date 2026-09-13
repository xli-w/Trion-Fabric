import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

import {
  ClientForm,
  EngagementForm,
} from '@app/features/fabric-data/EntityForms';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import {
  buildClientsViewModel,
  buildEngagementsViewModel,
} from '@app/features/fabric-data/selectors';

export function EngagementsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showEngagementSheet, setShowEngagementSheet] = useState(false);
  const [showClientSheet, setShowClientSheet] = useState(false);
  const [selectedEngagementId, setSelectedEngagementId] = useState<string | null>(null);

  const [sortColumn, setSortColumn] = useState<string>('Engagement');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  return (
    <FabricDataView
      emptyTitle="Engagements cannot be loaded"
      loadingDescription="Loading active engagement structures and stage coverage."
      loadingTitle="Loading engagements"
    >
      {(dataset) => {
        const { rows } = buildEngagementsViewModel(dataset);
        const clients = buildClientsViewModel(dataset);
        const activeEngagementCount = dataset.engagements.filter(
          (engagement) =>
            engagement.status === 'active' || engagement.status === 'at-risk',
        ).length;
        const siteCoverageCount = new Set(
          dataset.engagements.flatMap((engagement) => engagement.siteIds),
        ).size;

        let filteredRows = rows.filter((row) => {
          const matchesQuery = `${row.name} ${row.clientName} ${row.type} ${row.leadName}`
            .toLowerCase()
            .includes(query.toLowerCase());
          const matchesStage = !stageFilter || row.stage === stageFilter;
          const matchesStatus = !statusFilter || row.status === statusFilter;
          return matchesQuery && matchesStage && matchesStatus;
        });

        filteredRows = [...filteredRows].sort((a, b) => {
          let aVal: string | number = '';
          let bVal: string | number = '';

          if (sortColumn === 'Engagement') {
            aVal = a.name;
            bVal = b.name;
          } else if (sortColumn === 'Stage') {
            aVal = a.stage;
            bVal = b.stage;
          } else if (sortColumn === 'Status') {
            aVal = a.status;
            bVal = b.status;
          } else if (sortColumn === 'Target') {
            aVal = a.targetDate;
            bVal = b.targetDate;
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

        const selectedEng = selectedEngagementId
          ? dataset.engagements.find((e) => e.id === selectedEngagementId)
          : null;
        const selectedEngClient = selectedEng
          ? dataset.clients.find((c) => c.id === selectedEng.clientId)
          : null;
        const selectedEngSites = selectedEng
          ? dataset.sites.filter((s) => selectedEng.siteIds.includes(s.id))
          : [];

        return (
          <>
            <PageHeader
              eyebrow="Client engagements"
              title="Client and engagement workspace"
              description="Start with the client context, then define scoped transformation assignments, delivery teams, and the work that follows."
              metadata={['Client context', 'Scoped engagements', 'Stage-aware']}
              actions={
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="secondary"
                    onClick={() => setShowClientSheet(true)}
                  >
                    <Plus size={16} style={{ marginRight: 6 }} /> Add client
                  </Button>
                  <Button onClick={() => setShowEngagementSheet(true)}>
                    <Plus size={16} style={{ marginRight: 6 }} /> Add engagement
                  </Button>
                </div>
              }
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Organisations with sites and engagement history in Fabric."
                label="Clients"
                tone="accent"
                value={String(clients.length)}
              />
              <StatCard
                detail="Active or at-risk consulting assignments."
                label="Current engagements"
                tone="success"
                value={String(activeEngagementCount)}
              />
              <StatCard
                detail="Operational sites represented by engagement scope."
                label="Site coverage"
                tone="neutral"
                value={String(siteCoverageCount)}
              />
            </section>

            <Toolbar>
              <ToolbarGroup>
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder="Search engagements or clients..."
                />
                <FilterSelect
                  label="Stage"
                  value={stageFilter}
                  onChange={setStageFilter}
                  allLabel="All stages"
                  options={[
                    { value: 'Discover', label: 'Discover' },
                    { value: 'Diagnose', label: 'Diagnose' },
                    { value: 'Design', label: 'Design' },
                    { value: 'Deliver', label: 'Deliver' },
                    { value: 'Measure', label: 'Measure' },
                  ]}
                />
                <FilterSelect
                  label="Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  allLabel="All statuses"
                  options={[
                    { value: 'active', label: 'active' },
                    { value: 'planning', label: 'planning' },
                    { value: 'at-risk', label: 'at-risk' },
                    { value: 'completed', label: 'completed' },
                  ]}
                />
              </ToolbarGroup>
            </Toolbar>

            <section className="content-grid content-grid--two">
              <Card
                title="Engagement register"
                description="Click any row to inspect details or jump straight into the full engagement space."
              >
                <DataTable
                  columns={[
                    {
                      key: 'Engagement',
                      header: 'Engagement',
                      sortable: true,
                      render: (row) => (
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--fabric-text)' }}>
                            {row.name}
                          </div>
                          <div className="body-copy body-copy--small">
                            {row.clientName}
                          </div>
                        </div>
                      ),
                      width: '32%',
                    },
                    {
                      key: 'Type',
                      header: 'Type',
                      render: (row) => row.type,
                    },
                    {
                      key: 'Stage',
                      header: 'Stage',
                      sortable: true,
                      render: (row) => <Badge tone="accent">{row.stage}</Badge>,
                    },
                    {
                      key: 'Status',
                      header: 'Status',
                      sortable: true,
                      render: (row) => (
                        <Badge tone={row.statusTone}>{row.status}</Badge>
                      ),
                    },
                    {
                      key: 'Lead',
                      header: 'Lead',
                      render: (row) => row.leadName,
                    },
                    {
                      header: '',
                      align: 'right',
                      render: (row) => (
                        <Link
                          to={`/engagements/${row.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="table-link"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <span>Workspace</span> <ChevronRight size={14} />
                        </Link>
                      ),
                    },
                  ]}
                  getRowKey={(row) => row.id}
                  rows={filteredRows}
                  selectedRowKey={selectedEngagementId ?? undefined}
                  onRowClick={(row) => setSelectedEngagementId(row.id)}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  emptyState="No engagements match your search or filters."
                />
              </Card>

              <Card
                title="Client portfolio"
                description="Open a client to see its operational footprint and the transformation work connected to it."
                actions={
                  <Link className="table-link" to="/clients">
                    Open client register
                  </Link>
                }
              >
                <div className="record-stack">
                  {clients.map((client) => (
                    <Link
                      className="record-item table-link"
                      key={client.id}
                      to={`/clients/${client.id}`}
                    >
                      <div>
                        <strong>{client.name}</strong>
                        <p className="body-copy body-copy--small">
                          {client.industry}
                        </p>
                      </div>
                      <span className="record-item__meta">
                        {client.siteCount} sites · {client.engagementCount}{' '}
                        engagements
                      </span>
                    </Link>
                  ))}
                </div>
              </Card>
            </section>

            {/* Create Client Sheet */}
            <Sheet
              open={showClientSheet}
              onOpenChange={setShowClientSheet}
              size="lg"
              eyebrow="Organisation"
              title="Create client"
              description="Capture the organisation context before creating sites and scoped engagement work."
            >
              <ClientForm onSaved={() => setShowClientSheet(false)} />
            </Sheet>

            {/* Create Engagement Sheet */}
            <Sheet
              open={showEngagementSheet}
              onOpenChange={setShowEngagementSheet}
              size="lg"
              eyebrow="Transformation"
              title="Create engagement"
              description="A preliminary site walk can remain lightweight and later progress into a Digital Diagnostic."
            >
              <EngagementForm onSaved={() => setShowEngagementSheet(false)} />
            </Sheet>

            {/* Quick Inspector Sheet */}
            <Sheet
              open={Boolean(selectedEng)}
              onOpenChange={(open) => {
                if (!open) setSelectedEngagementId(null);
              }}
              size="lg"
              eyebrow="Engagement inspector"
              title={selectedEng?.name}
              description={selectedEngClient?.name}
              footer={
                selectedEng && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedEngagementId(null)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        navigate(`/engagements/${selectedEng.id}`);
                      }}
                    >
                      Open full workspace <ExternalLink size={14} style={{ marginLeft: 6 }} />
                    </Button>
                  </div>
                )
              }
            >
              {selectedEng && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="detail-badges">
                    <Badge tone="accent">{selectedEng.stage}</Badge>
                    <Badge
                      tone={
                        selectedEng.status === 'active'
                          ? 'success'
                          : selectedEng.status === 'at-risk'
                            ? 'danger'
                            : 'neutral'
                      }
                    >
                      {selectedEng.status}
                    </Badge>
                  </div>

                  <dl className="detail-list">
                    <dt>Client</dt>
                    <dd>{selectedEngClient?.name || 'Unknown'}</dd>
                    <dt>Industry</dt>
                    <dd>{selectedEngClient?.industry || 'Unknown'}</dd>
                    <dt>Objectives</dt>
                    <dd>{selectedEng.objectives || 'Not specified'}</dd>
                    <dt>Scope</dt>
                    <dd>{selectedEng.scope || 'Not specified'}</dd>
                    <dt>Linked Sites</dt>
                    <dd>
                      {selectedEngSites.length === 0
                        ? 'No sites assigned'
                        : selectedEngSites.map((s) => s.name).join(', ')}
                    </dd>
                    <dt>Target date</dt>
                    <dd>{selectedEng.targetDate || 'Not set'}</dd>
                  </dl>
                </div>
              )}
            </Sheet>
          </>
        );
      }}
    </FabricDataView>
  );
}
