import { Badge, Card, DataTable, PageHeader, StatCard } from '@ui';

import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { buildOutputsViewModel } from '@app/features/fabric-data/selectors';

const governanceNotes = [
  'Draft outputs can consolidate approved internal information but are not client-shareable by default.',
  'Internal review is an explicit state, not an informal assumption.',
  'Client-shareable outputs should only point to approved domain information.',
];

export function OutputsPage() {
  return (
    <FabricDataView
      emptyTitle="Outputs cannot be loaded"
      loadingDescription="Loading controlled output states and publication readiness."
      loadingTitle="Loading outputs"
    >
      {(dataset) => {
        const viewModel = buildOutputsViewModel(dataset);

        return (
          <>
            <PageHeader
              eyebrow="Outputs"
              title="Controlled delivery outputs"
              description="Reports and summaries are generated from structured, approved information. They are not the primary data store for the platform."
              metadata={['Draft -> review -> approved -> shared', 'Internal vs client-shareable', 'Structured source data']}
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Outputs already approved or shared beyond the internal workspace."
                label="Ready to share"
                tone="success"
                value={String(viewModel.readyToShareCount)}
              />
              <StatCard
                detail="Outputs still in draft or internal-review states."
                label="Review queue"
                tone="warning"
                value={String(viewModel.reviewQueueCount)}
              />
            </section>

            <section className="content-grid content-grid--two">
              <Card title="Output register" description="The publication model is explicit so future report generation can remain governed.">
                <DataTable
                  columns={[
                    {
                      header: 'Output',
                      render: (row) => (
                        <div>
                          <strong>{row.title}</strong>
                          <div className="body-copy body-copy--small">{row.engagementName}</div>
                        </div>
                      ),
                      width: '24%',
                    },
                    {
                      header: 'Kind',
                      render: (row) => row.kind,
                    },
                    {
                      header: 'State',
                      render: (row) => <Badge tone={row.stateTone}>{row.state}</Badge>,
                    },
                    {
                      header: 'Visibility',
                      render: (row) => row.visibility,
                    },
                    {
                      header: 'Approved refs',
                      render: (row) => row.approvedEntityCount,
                    },
                    {
                      header: 'Last shared',
                      render: (row) => row.lastPublishedAt,
                    },
                  ]}
                  getRowKey={(row) => row.id}
                  rows={viewModel.rows}
                />
              </Card>

              <Card title="Governance rules" description="These rules are established now so future report generation cannot bypass review and approval boundaries.">
                <div className="record-stack">
                  {governanceNotes.map((note) => (
                    <article className="record-item record-item--note" key={note}>
                      <p className="body-copy">{note}</p>
                    </article>
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