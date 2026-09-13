import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge, Button, Card, DataTable, PageHeader, StatCard } from '@ui';
import { SiteForm } from '@app/features/fabric-data/EntityForms';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { SiteWalkForm } from '@app/features/site-walks/SiteWalkForms';
import { buildSiteWalksViewModel } from '@app/features/fabric-data/selectors';

export function SitesPage() {
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showSiteWalkForm, setShowSiteWalkForm] = useState(false);
  return (
    <FabricDataView
      emptyTitle="Sites cannot be loaded"
      loadingDescription="Loading operating environments and client links."
      loadingTitle="Loading sites"
    >
      {(dataset) => {
        const clients = new Map(
          dataset.clients.map((client) => [client.id, client.name]),
        );
        const rows = dataset.sites.filter((site) =>
          `${site.name} ${site.location} ${clients.get(site.clientId) ?? ''}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        );
        const siteWalkView = buildSiteWalksViewModel(dataset);
        const upcomingWalks = siteWalkView.rows.filter(
          (walk) => walk.status !== 'Completed',
        );
        return (
          <>
            <PageHeader
              eyebrow="Clients & sites"
              title="Operational context and fieldwork"
              description="Maintain the operating environment, then use structured visits to capture observations, evidence, friction, and next steps."
              metadata={['Site context', 'Guided fieldwork', 'Evidence-led']}
              actions={
                <>
                  <Button
                    variant="secondary"
                    onClick={() => setShowForm((value) => !value)}
                  >
                    {showForm ? 'Close site form' : 'Add site'}
                  </Button>
                  <Button
                    onClick={() => setShowSiteWalkForm((value) => !value)}
                  >
                    {showSiteWalkForm
                      ? 'Close site walk form'
                      : 'Plan site walk'}
                  </Button>
                </>
              }
            />
            {showForm ? (
              <Card title="Create site">
                <SiteForm onSaved={() => setShowForm(false)} />
              </Card>
            ) : null}
            {showSiteWalkForm ? (
              <Card
                title="Plan site walk"
                description="A preliminary visit can remain lightweight and progress into a deeper diagnostic when the evidence justifies it."
              >
                <SiteWalkForm onSaved={() => setShowSiteWalkForm(false)} />
              </Card>
            ) : null}
            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Operating environments across client organisations."
                label="Sites"
                tone="accent"
                value={String(dataset.sites.length)}
              />
              <StatCard
                detail="Areas currently modelled for site context."
                label="Areas"
                tone="success"
                value={String(dataset.areas.length)}
              />
              <StatCard
                detail="Known operational systems linked to sites."
                label="Systems"
                tone="neutral"
                value={String(dataset.systems.length)}
              />
              <StatCard
                detail="Planned or active visits linked to operational context."
                label="Upcoming fieldwork"
                tone="warning"
                value={String(upcomingWalks.length)}
              />
            </section>
            <Card
              title="Fieldwork at a glance"
              description="Open a site walk to capture the operational detail that will inform diagnostic and transformation work."
              actions={
                <Link className="text-link" to="/site-walks">
                  Open site walks
                </Link>
              }
            >
              <div className="record-stack">
                {upcomingWalks.length ? (
                  upcomingWalks.map((walk) => (
                    <Link
                      className="record-item table-link"
                      key={walk.id}
                      to={`/site-walks/${walk.id}`}
                    >
                      <div>
                        <strong>{walk.title}</strong>
                        <p className="body-copy body-copy--small">
                          {walk.siteName} · {walk.engagementName}
                        </p>
                      </div>
                      <span>
                        {walk.status} · {walk.scheduledAt}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="body-copy">
                    No upcoming site walks are scheduled.
                  </p>
                )}
              </div>
            </Card>
            <Card title="Site register">
              <input
                className="search-input"
                aria-label="Search sites"
                placeholder="Search sites..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <DataTable
                rows={rows}
                getRowKey={(row) => row.id}
                emptyState="No sites match this search."
                columns={[
                  {
                    header: 'Site',
                    render: (row) => (
                      <div>
                        <Link className="table-link" to={`/sites/${row.id}`}>
                          <strong>{row.name}</strong>
                        </Link>
                        <div className="body-copy body-copy--small">
                          {row.location}
                        </div>
                      </div>
                    ),
                    width: '25%',
                  },
                  {
                    header: 'Client',
                    render: (row) =>
                      clients.get(row.clientId) ?? 'Unknown client',
                  },
                  {
                    header: 'Status',
                    render: (row) => (
                      <Badge
                        tone={row.status === 'active' ? 'success' : 'neutral'}
                      >
                        {row.status ?? 'planned'}
                      </Badge>
                    ),
                  },
                  {
                    header: 'Activities',
                    render: (row) => row.operationalProfile,
                  },
                  {
                    header: 'Coverage',
                    render: (row) =>
                      `${row.areaIds.length} areas · ${row.systemIds.length} systems`,
                  },
                ]}
              />
            </Card>
          </>
        );
      }}
    </FabricDataView>
  );
}

export function SiteDetailPage() {
  const { siteId } = useParams();
  const [editing, setEditing] = useState(false);
  return (
    <FabricDataView
      emptyTitle="Site cannot be loaded"
      loadingDescription="Loading site context."
      loadingTitle="Loading site"
    >
      {(loadedDataset) => {
        const site = loadedDataset.sites.find((item) => item.id === siteId);
        if (!site) return <p className="body-copy">Site not found.</p>;
        const engagements = loadedDataset.engagements.filter((engagement) =>
          engagement.siteIds.includes(site.id),
        );
        const client = loadedDataset.clients.find(
          (item) => item.id === site.clientId,
        );
        return (
          <>
            <PageHeader
              eyebrow="Site detail"
              title={site.name}
              description={site.description}
              metadata={[client?.name ?? 'Unknown client', site.location]}
              actions={
                <Button
                  variant="ghost"
                  onClick={() => setEditing((value) => !value)}
                >
                  {editing ? 'Close edit' : 'Edit site'}
                </Button>
              }
            />
            {editing ? (
              <Card title="Edit site">
                <SiteForm
                  key={site.updatedAt}
                  site={site}
                  onSaved={() => setEditing(false)}
                />
              </Card>
            ) : null}
            <section className="content-grid content-grid--two">
              <Card title="Operational profile">
                <dl className="detail-list">
                  <dt>Principal activities</dt>
                  <dd>{site.operationalProfile}</dd>
                  <dt>Site type</dt>
                  <dd>{site.siteType ?? 'Not recorded'}</dd>
                  <dt>Workforce / shifts</dt>
                  <dd>
                    {site.workforce ?? 'Not recorded'}
                    {site.shifts ? ` · ${site.shifts}` : ''}
                  </dd>
                  <dt>Internal notes</dt>
                  <dd>{site.internalNotes ?? 'None'}</dd>
                </dl>
              </Card>
              <Card title="Engagement coverage">
                {engagements.length ? (
                  <div className="record-stack">
                    {engagements.map((engagement) => (
                      <Link
                        className="record-item table-link"
                        key={engagement.id}
                        to={`/engagements/${engagement.id}`}
                      >
                        {engagement.name}
                        <span>
                          {engagement.type} · {engagement.stage}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="body-copy">
                    No engagements cover this site yet.
                  </p>
                )}
              </Card>
            </section>
          </>
        );
      }}
    </FabricDataView>
  );
}
