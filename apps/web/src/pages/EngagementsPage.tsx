import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Button, Card, DataTable, PageHeader, StatCard } from '@ui';

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
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
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

        return (
          <>
            <PageHeader
              eyebrow="Client engagements"
              title="Client and engagement workspace"
              description="Start with the client context, then define scoped transformation assignments, delivery teams, and the work that follows."
              metadata={['Client context', 'Scoped engagements', 'Stage-aware']}
              actions={
                <>
                  <Button
                    variant="secondary"
                    onClick={() => setShowClientForm((value) => !value)}
                  >
                    {showClientForm ? 'Close client form' : 'Add client'}
                  </Button>
                  <Button onClick={() => setShowForm((value) => !value)}>
                    {showForm ? 'Close engagement form' : 'Add engagement'}
                  </Button>
                </>
              }
            />
            {showClientForm ? (
              <Card
                title="Create client"
                description="Capture the organisation context before creating sites and scoped engagement work."
              >
                <ClientForm onSaved={() => setShowClientForm(false)} />
              </Card>
            ) : null}
            {showForm ? (
              <Card
                title="Create engagement"
                description="A preliminary site walk can remain lightweight and later progress into a Digital Diagnostic."
              >
                <EngagementForm onSaved={() => setShowForm(false)} />
              </Card>
            ) : null}

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

            <Card
              title="Client portfolio"
              description="Open a client to see its operational footprint and the transformation work connected to it."
              actions={
                <Link className="text-link" to="/clients">
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
                    <span>
                      {client.siteCount} sites · {client.engagementCount}{' '}
                      engagements
                    </span>
                  </Link>
                ))}
              </div>
            </Card>

            <Card
              title="Engagement register"
              description="Assignments are stage-aware and maintain explicit ties to clients, sites, and delivery teams."
            >
              <input
                className="search-input"
                aria-label="Search engagements"
                placeholder="Search engagements..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <DataTable
                columns={[
                  {
                    header: 'Engagement',
                    render: (row) => (
                      <div>
                        <Link
                          className="table-link"
                          to={`/engagements/${row.id}`}
                        >
                          <strong>{row.name}</strong>
                        </Link>
                        <div className="body-copy body-copy--small">
                          {row.clientName}
                        </div>
                      </div>
                    ),
                    width: '26%',
                  },
                  {
                    header: 'Type',
                    render: (row) => row.type,
                  },
                  {
                    header: 'Stage',
                    render: (row) => <Badge tone="accent">{row.stage}</Badge>,
                  },
                  {
                    header: 'Status',
                    render: (row) => (
                      <Badge tone={row.statusTone}>{row.status}</Badge>
                    ),
                  },
                  {
                    header: 'Lead',
                    render: (row) => row.leadName,
                  },
                  {
                    header: 'Coverage',
                    render: (row) =>
                      `${row.siteCount} sites · ${row.teamSize} team`,
                  },
                  {
                    header: 'Target',
                    render: (row) => row.targetDate,
                  },
                ]}
                getRowKey={(row) => row.id}
                rows={rows.filter((row) =>
                  `${row.name} ${row.clientName} ${row.type}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                )}
              />
            </Card>
          </>
        );
      }}
    </FabricDataView>
  );
}
