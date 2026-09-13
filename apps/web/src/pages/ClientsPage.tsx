import { Badge, Card, DataTable, PageHeader, StatCard } from '@ui';

import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { buildClientsViewModel } from '@app/features/fabric-data/selectors';

export function ClientsPage() {
  return (
    <FabricDataView
      emptyTitle="Clients cannot be loaded"
      loadingDescription="Loading connected client and site context."
      loadingTitle="Loading clients"
    >
      {(dataset) => {
        const rows = buildClientsViewModel(dataset);

        return (
          <>
            <PageHeader
              eyebrow="Clients"
              title="Client organisations and context"
              description="Clients are distinct from engagements so Fabric can preserve organisation context, sites, and transformation history across multiple assignments."
              metadata={['Organisation model', 'Engagement separation', 'Internal context']}
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Client organisations currently represented in the validated development dataset."
                label="Clients"
                tone="accent"
                value={String(rows.length)}
              />
              <StatCard
                detail="Physical operating environments linked back to those organisations."
                label="Sites"
                tone="success"
                value={String(dataset.sites.length)}
              />
            </section>

            <Card title="Client register" description="A stable client entity becomes the anchor for sites, contacts, engagements, and long-term context.">
              <DataTable
                columns={[
                  {
                    header: 'Client',
                    render: (row) => (
                      <div>
                        <strong>{row.name}</strong>
                        <div className="body-copy body-copy--small">{row.industry}</div>
                      </div>
                    ),
                    width: '24%',
                  },
                  {
                    header: 'Status',
                    render: (row) => <Badge tone={row.statusTone}>{row.status}</Badge>,
                  },
                  {
                    header: 'Sites',
                    render: (row) => row.siteCount,
                  },
                  {
                    header: 'Engagements',
                    render: (row) => row.engagementCount,
                  },
                  {
                    header: 'Primary contact',
                    render: (row) => row.primaryContact,
                    width: '20%',
                  },
                  {
                    header: 'Notes',
                    render: (row) => <span className="body-copy body-copy--small">{row.notes}</span>,
                    width: '28%',
                  },
                ]}
                getRowKey={(row) => row.id}
                rows={rows}
              />
            </Card>
          </>
        );
      }}
    </FabricDataView>
  );
}