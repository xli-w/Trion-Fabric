import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge, Button, Card, DataTable, PageHeader, StatCard } from '@ui';

import { ClientForm } from '@app/features/fabric-data/EntityForms';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { buildClientsViewModel } from '@app/features/fabric-data/selectors';

export function ClientsPage() {
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  return (
    <FabricDataView
      emptyTitle="Clients cannot be loaded"
      loadingDescription="Loading connected client and site context."
      loadingTitle="Loading clients"
    >
      {(dataset) => {
        const rows = buildClientsViewModel(dataset).filter((row) =>
          `${row.name} ${row.industry}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        );
        return (
          <>
            <PageHeader
              eyebrow="Client engagements"
              title="Client organisations and context"
              description="The organisation anchor for sites, engagements, and long-term transformation history."
              metadata={['Organisation model', 'Engagement context']}
              actions={
                <Button onClick={() => setShowForm((value) => !value)}>
                  {showForm ? 'Close form' : 'Add client'}
                </Button>
              }
            />
            {showForm ? (
              <Card
                title="Create client"
                description="Capture the minimum context needed to connect future site and engagement work."
              >
                <ClientForm onSaved={() => setShowForm(false)} />
              </Card>
            ) : null}
            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Organisations in the current workspace."
                label="Clients"
                tone="accent"
                value={String(dataset.clients.length)}
              />
              <StatCard
                detail="Operating environments linked to those organisations."
                label="Sites"
                tone="success"
                value={String(dataset.sites.length)}
              />
            </section>
            <Card
              title="Client register"
              description="Search by organisation or industry, then open a client to see its connected sites and engagements."
            >
              <input
                className="search-input"
                aria-label="Search clients"
                placeholder="Search clients..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <DataTable
                columns={[
                  {
                    header: 'Client',
                    render: (row) => (
                      <div>
                        <Link className="table-link" to={`/clients/${row.id}`}>
                          <strong>{row.name}</strong>
                        </Link>
                        <div className="body-copy body-copy--small">
                          {row.industry}
                        </div>
                      </div>
                    ),
                    width: '25%',
                  },
                  {
                    header: 'Status',
                    render: (row) => (
                      <Badge tone={row.statusTone}>{row.status}</Badge>
                    ),
                  },
                  { header: 'Sites', render: (row) => row.siteCount },
                  {
                    header: 'Engagements',
                    render: (row) => row.engagementCount,
                  },
                  {
                    header: 'Primary contact',
                    render: (row) => row.primaryContact,
                  },
                  {
                    header: 'Notes',
                    render: (row) => (
                      <span className="body-copy body-copy--small">
                        {row.notes}
                      </span>
                    ),
                    width: '28%',
                  },
                ]}
                getRowKey={(row) => row.id}
                rows={rows}
                emptyState="No clients match this search."
              />
            </Card>
          </>
        );
      }}
    </FabricDataView>
  );
}

export function ClientDetailPage() {
  const { clientId } = useParams();
  const [editing, setEditing] = useState(false);
  return (
    <FabricDataView
      emptyTitle="Client cannot be loaded"
      loadingDescription="Loading client context."
      loadingTitle="Loading client"
    >
      {(loadedDataset) => {
        const client = loadedDataset.clients.find(
          (item) => item.id === clientId,
        );
        if (!client) return <p className="body-copy">Client not found.</p>;
        const sites = loadedDataset.sites.filter(
          (site) => site.clientId === client.id,
        );
        const engagements = loadedDataset.engagements.filter(
          (engagement) => engagement.clientId === client.id,
        );
        return (
          <>
            <PageHeader
              eyebrow="Client detail"
              title={client.name}
              description={
                client.description ??
                client.notes ??
                'No description recorded yet.'
              }
              metadata={[client.industry, client.status]}
              actions={
                <Button
                  variant="ghost"
                  onClick={() => setEditing((value) => !value)}
                >
                  {editing ? 'Close edit' : 'Edit client'}
                </Button>
              }
            />
            {editing ? (
              <Card title="Edit client">
                <ClientForm
                  key={client.updatedAt}
                  client={client}
                  onSaved={() => setEditing(false)}
                />
              </Card>
            ) : null}
            <section className="content-grid content-grid--two">
              <Card title="Organisation context">
                <dl className="detail-list">
                  <dt>Primary contact</dt>
                  <dd>{client.primaryContact ?? 'Not recorded'}</dd>
                  <dt>Contact details</dt>
                  <dd>{client.contactDetails ?? 'Not recorded'}</dd>
                  <dt>Approximate scale</dt>
                  <dd>{client.companySize ?? 'Not recorded'}</dd>
                  <dt>Internal notes</dt>
                  <dd>{client.notes ?? 'None'}</dd>
                </dl>
              </Card>
              <Card
                title="Connected work"
                description="Navigate from the organisation into its operational footprint."
              >
                <div className="record-stack">
                  <strong>{sites.length} sites</strong>
                  {sites.map((site) => (
                    <Link
                      className="record-item table-link"
                      key={site.id}
                      to={`/sites/${site.id}`}
                    >
                      {site.name}
                      <span>{site.location}</span>
                    </Link>
                  ))}
                  <strong>{engagements.length} engagements</strong>
                  {engagements.map((engagement) => (
                    <Link
                      className="record-item table-link"
                      key={engagement.id}
                      to={`/engagements/${engagement.id}`}
                    >
                      {engagement.name}
                      <span>{engagement.type}</span>
                    </Link>
                  ))}
                </div>
              </Card>
            </section>
          </>
        );
      }}
    </FabricDataView>
  );
}
