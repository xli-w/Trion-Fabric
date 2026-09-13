import { Link, useParams } from 'react-router-dom';

import { Badge, Card, DataTable, PageHeader, StatCard } from '@ui';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { buildOutputsViewModel } from '@app/features/fabric-data/selectors';

const coreDeliverableCount = 5;

const governanceNotes = [
  'Draft and internal-review outputs stay internal even when their source material is useful.',
  'Approved and published outputs are checked against approved, engagement-scoped source records.',
  'Published outputs require an approval record, an approval timestamp, client-shareable visibility, and a publication timestamp.',
  'Internal notes and working assumptions remain excluded from this controlled output view.',
];

function sourceSummary(
  dataset: Parameters<typeof buildOutputsViewModel>[0],
  sourceId: string,
) {
  const source = [
    ...dataset.maturityAssessments.map((item) => ({
      id: item.id,
      type: 'Maturity assessment',
      title: item.dimensionId,
    })),
    ...dataset.findings.map((item) => ({
      id: item.id,
      type: 'Finding',
      title: item.title,
    })),
    ...dataset.landscapeEntities.map((item) => ({
      id: item.id,
      type: 'Landscape entity',
      title: item.name,
    })),
    ...dataset.landscapeRelationships.map((item) => ({
      id: item.id,
      type: 'Landscape relationship',
      title: item.rationale ?? item.type,
    })),
    ...dataset.opportunities.map((item) => ({
      id: item.id,
      type: 'Opportunity',
      title: item.title,
    })),
    ...dataset.actionItems.map((item) => ({
      id: item.id,
      type: 'Action',
      title: item.title,
    })),
    ...dataset.initiatives.map((item) => ({
      id: item.id,
      type: 'Initiative',
      title: item.title,
    })),
    ...dataset.roadmaps.map((item) => ({
      id: item.id,
      type: 'Roadmap',
      title: item.title,
    })),
    ...dataset.milestones.map((item) => ({
      id: item.id,
      type: 'Milestone',
      title: item.title,
    })),
    ...dataset.deliveryActions.map((item) => ({
      id: item.id,
      type: 'Delivery action',
      title: item.title,
    })),
    ...dataset.benefitMeasurements.map((item) => ({
      id: item.id,
      type: 'Benefit measure',
      title: item.measure,
    })),
    ...dataset.observations.map((item) => ({
      id: item.id,
      type: 'Observation',
      title: item.title ?? item.summary,
    })),
    ...dataset.evidence.map((item) => ({
      id: item.id,
      type: 'Evidence',
      title: item.title,
    })),
  ].find((item) => item.id === sourceId);

  return source ?? { id: sourceId, type: 'Unknown source', title: sourceId };
}

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
              eyebrow="Diagnosis & outputs"
              title="Controlled delivery outputs"
              description="Outputs are governed projections of structured engagement information, not a separate document store."
              metadata={[
                'Draft → review → approved → published',
                'Internal vs client-shareable',
                'Approved source data',
              ]}
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Approved or published outputs with explicit client-shareable visibility."
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
              <StatCard
                detail="The five core diagnostic deliverable types represented in the register."
                label="Core deliverables"
                tone="accent"
                value={`${viewModel.coreOutputCount} / ${coreDeliverableCount}`}
              />
            </section>

            <section className="content-grid content-grid--two">
              <Card
                title="Output register"
                description="Opening an output shows its controlled source references and approval record, never a manually duplicated report body."
              >
                <DataTable
                  columns={[
                    {
                      header: 'Output',
                      render: (row) => (
                        <div>
                          <Link
                            className="table-link"
                            to={`/outputs/${row.id}`}
                          >
                            <strong>{row.title}</strong>
                          </Link>
                          <div className="body-copy body-copy--small">
                            {row.engagementName}
                          </div>
                        </div>
                      ),
                      width: '25%',
                    },
                    {
                      header: 'Type',
                      render: (row) => row.outputType,
                    },
                    {
                      header: 'Status',
                      render: (row) => (
                        <Badge tone={row.statusTone}>{row.status}</Badge>
                      ),
                    },
                    {
                      header: 'Visibility',
                      render: (row) => row.visibility,
                    },
                    {
                      header: 'Sources',
                      render: (row) => row.sourceCount,
                    },
                    {
                      header: 'External sharing',
                      render: (row) =>
                        row.isReadyToShare ? (
                          <Badge tone="success">Ready</Badge>
                        ) : (
                          <Badge tone="neutral">Internal only</Badge>
                        ),
                    },
                    {
                      header: 'Published',
                      render: (row) => row.publishedAt,
                    },
                  ]}
                  getRowKey={(row) => row.id}
                  rows={viewModel.rows}
                />
              </Card>

              <Card
                title="Governance rules"
                description="These rules keep controlled client outputs downstream of reviewed source information."
              >
                <div className="record-stack">
                  {governanceNotes.map((note) => (
                    <article
                      className="record-item record-item--note"
                      key={note}
                    >
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

export function OutputDetailPage() {
  const { outputId } = useParams();

  return (
    <FabricDataView
      emptyTitle="Output cannot be loaded"
      loadingDescription="Loading output governance and structured source references."
      loadingTitle="Loading output"
    >
      {(dataset) => {
        const output = dataset.outputs.find((item) => item.id === outputId);
        if (!output) {
          return (
            <>
              <PageHeader
                eyebrow="Diagnosis & outputs"
                title="Output not found"
                description="The requested controlled output is not available."
              />
              <Link className="text-link" to="/outputs">
                Return to outputs
              </Link>
            </>
          );
        }

        const createdBy = dataset.users.find(
          (item) => item.id === output.createdByUserId,
        );
        const approvedBy = output.approvedByUserId
          ? dataset.users.find((item) => item.id === output.approvedByUserId)
          : undefined;
        const row = buildOutputsViewModel({ ...dataset, outputs: [output] })
          .rows[0];
        const sources = output.sourceReferences.map((sourceId) =>
          sourceSummary(dataset, sourceId),
        );

        return (
          <>
            <PageHeader
              eyebrow="Controlled output"
              title={output.title}
              description={row?.outputType ?? output.outputType}
              metadata={[
                row?.status ?? output.status,
                row?.visibility ?? output.visibility,
                `Version ${output.version}`,
              ]}
            />

            <section className="content-grid content-grid--two">
              <Card title="Publication governance">
                <dl className="detail-list">
                  <dt>Status</dt>
                  <dd>
                    <Badge tone={row?.statusTone ?? 'neutral'}>
                      {row?.status ?? output.status}
                    </Badge>
                  </dd>
                  <dt>Visibility</dt>
                  <dd>{row?.visibility ?? output.visibility}</dd>
                  <dt>Created by</dt>
                  <dd>{createdBy?.displayName ?? 'Unknown user'}</dd>
                  <dt>Approved by</dt>
                  <dd>{approvedBy?.displayName ?? 'Not yet approved'}</dd>
                  <dt>Approved at</dt>
                  <dd>
                    {output.approvedAt
                      ? new Intl.DateTimeFormat('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }).format(new Date(output.approvedAt))
                      : 'Not yet approved'}
                  </dd>
                  <dt>Published at</dt>
                  <dd>{row?.publishedAt ?? 'Not shared'}</dd>
                </dl>
              </Card>
              <Card
                title="Controlled content reference"
                description="This reference identifies the governed projection; its content remains derived from the structured sources below."
              >
                <p className="body-copy">
                  {output.contentReference ??
                    'No content reference has been recorded.'}
                </p>
                <p className="body-copy body-copy--small">
                  Internal output notes and working assumptions are
                  intentionally excluded from this view.
                </p>
              </Card>
            </section>

            <Card
              title={`Structured sources (${sources.length})`}
              description="The output remains connected to the records that support it."
            >
              <div className="record-stack">
                {sources.map((source) => (
                  <article className="record-item" key={source.id}>
                    <div>
                      <strong>{source.title}</strong>
                      <p className="body-copy body-copy--small">
                        {source.type}
                      </p>
                    </div>
                    <Badge tone="accent">Linked source</Badge>
                  </article>
                ))}
              </div>
            </Card>
          </>
        );
      }}
    </FabricDataView>
  );
}
