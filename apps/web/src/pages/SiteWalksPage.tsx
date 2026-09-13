import { Badge, Card, DataTable, PageHeader, StatCard } from '@ui';

import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { buildSiteWalksViewModel } from '@app/features/fabric-data/selectors';

export function SiteWalksPage() {
  return (
    <FabricDataView
      emptyTitle="Site walks cannot be loaded"
      loadingDescription="Loading structured site walk data and evidence capture status."
      loadingTitle="Loading site walks"
    >
      {(dataset) => {
        const viewModel = buildSiteWalksViewModel(dataset);

        return (
          <>
            <PageHeader
              eyebrow="Site Walks"
              title="Structured fieldwork"
              description="Site walks are treated as first-class transformation events that can anchor observations, evidence, interviews, and follow-up actions rather than remaining as free-form notes."
              metadata={['Observation-ready', 'Evidence-linked', 'Follow-up aware']}
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Completed walks already feeding observations and opportunities."
                label="Completed"
                tone="success"
                value={String(viewModel.completedCount)}
              />
              <StatCard
                detail="Upcoming or in-flight fieldwork queued in the current dataset."
                label="Upcoming"
                tone="warning"
                value={String(viewModel.upcomingCount)}
              />
              <StatCard
                detail="Structured observations already attached to completed walks."
                label="Observations"
                tone="accent"
                value={String(viewModel.observationCount)}
              />
            </section>

            <Card title="Walk register" description="Future guided prompts, transcripts, mobile capture, and offline workflows should layer onto this domain model.">
              <DataTable
                columns={[
                  {
                    header: 'Walk',
                    render: (row) => (
                      <div>
                        <strong>{row.title}</strong>
                        <div className="body-copy body-copy--small">{row.engagementName}</div>
                      </div>
                    ),
                    width: '24%',
                  },
                  {
                    header: 'Site / area',
                    render: (row) => `${row.siteName} · ${row.areaName}`,
                    width: '18%',
                  },
                  {
                    header: 'Consultant',
                    render: (row) => row.consultantName,
                  },
                  {
                    header: 'Status',
                    render: (row) => <Badge tone={row.statusTone}>{row.status}</Badge>,
                  },
                  {
                    header: 'Scope',
                    render: (row) => `${row.scopeCount} checkpoints`,
                  },
                  {
                    header: 'Follow-up',
                    render: (row) => `${row.followUpCount} actions`,
                  },
                  {
                    header: 'Scheduled',
                    render: (row) => row.scheduledAt,
                    width: '16%',
                  },
                ]}
                getRowKey={(row) => row.id}
                rows={viewModel.rows}
              />
            </Card>
          </>
        );
      }}
    </FabricDataView>
  );
}