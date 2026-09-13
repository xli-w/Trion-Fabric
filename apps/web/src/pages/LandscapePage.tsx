import { Badge, Card, DataTable, PageHeader, StatCard } from '@ui';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';

export function LandscapePage() {
  return (
    <FabricDataView
      emptyTitle="Landscape cannot be loaded"
      loadingDescription="Loading structured areas, processes, systems, and relationships."
      loadingTitle="Loading landscape"
    >
      {(dataset) => {
        const relationships = dataset.landscapeRelationships;
        return (
          <>
            <PageHeader
              eyebrow="Transformation"
              title="Digital landscape structure"
              description="A structured projection of areas, processes, systems, data, and information flow that informs evidence-led opportunities and delivery sequencing."
              metadata={[
                'Operational context',
                'Relationship-aware',
                'Opportunity input',
              ]}
            />
            <section className="metric-grid metric-grid--compact">
              <StatCard
                label="Areas"
                value={String(dataset.areas.length)}
                detail="Operational areas linked to sites."
                tone="accent"
              />
              <StatCard
                label="Processes"
                value={String(dataset.processes.length)}
                detail="Processes available for assessment."
                tone="success"
              />
              <StatCard
                label="Systems"
                value={String(dataset.systems.length)}
                detail="Known operational systems."
                tone="neutral"
              />
              <StatCard
                label="Relationships"
                value={String(relationships.length)}
                detail="Explicit information and process relationships."
                tone="warning"
              />
            </section>
            <section className="content-grid content-grid--two">
              <Card
                title="Landscape entities"
                description="Existing areas, processes, and systems remain the source of truth; engagement-specific projections add traceability."
              >
                <DataTable
                  rows={dataset.landscapeEntities}
                  getRowKey={(row) => row.id}
                  columns={[
                    {
                      header: 'Entity',
                      render: (row) => (
                        <div>
                          <strong>{row.name}</strong>
                          <div className="body-copy body-copy--small">
                            {row.description}
                          </div>
                        </div>
                      ),
                    },
                    {
                      header: 'Type',
                      render: (row) => <Badge tone="accent">{row.type}</Badge>,
                    },
                    {
                      header: 'Source',
                      render: (row) =>
                        row.sourceEntityId ?? 'Structured directly',
                    },
                    {
                      header: 'Owner',
                      render: (row) => row.ownerRole ?? 'Not recorded',
                    },
                  ]}
                />
              </Card>
              <Card title="Operational structure">
                <div className="record-stack">
                  {dataset.areas.map((area) => (
                    <article className="record-item" key={area.id}>
                      <div>
                        <strong>{area.name}</strong>
                        <p className="body-copy">{area.description}</p>
                      </div>
                      <span>
                        {
                          dataset.processes.filter(
                            (item) => item.areaId === area.id,
                          ).length
                        }{' '}
                        processes
                      </span>
                    </article>
                  ))}
                </div>
              </Card>
            </section>
            <Card
              title="Relationships and information flow"
              description="Relationships should be justified by operational context or evidence before they feed diagnostic conclusions."
            >
              <DataTable
                rows={relationships}
                getRowKey={(row) => row.id}
                columns={[
                  {
                    header: 'From',
                    render: (row) =>
                      dataset.landscapeEntities.find(
                        (item) => item.id === row.fromEntityId,
                      )?.name ?? row.fromEntityId,
                  },
                  {
                    header: 'Relationship',
                    render: (row) => <Badge tone="accent">{row.type}</Badge>,
                  },
                  {
                    header: 'To',
                    render: (row) =>
                      dataset.landscapeEntities.find(
                        (item) => item.id === row.toEntityId,
                      )?.name ?? row.toEntityId,
                  },
                  {
                    header: 'Rationale',
                    render: (row) => row.rationale ?? 'No rationale recorded',
                  },
                  {
                    header: 'Evidence',
                    render: (row) => `${row.evidenceIds.length} links`,
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
