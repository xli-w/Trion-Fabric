import { Badge, Card, DataTable, PageHeader, StatCard } from '@ui';

import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { buildEngagementsViewModel } from '@app/features/fabric-data/selectors';

export function EngagementsPage() {
  return (
    <FabricDataView
      emptyTitle="Engagements cannot be loaded"
      loadingDescription="Loading active engagement structures and stage coverage."
      loadingTitle="Loading engagements"
    >
      {(dataset) => {
        const { rows, stageSummary } = buildEngagementsViewModel(dataset);

        return (
          <>
            <PageHeader
              eyebrow="Engagements"
              title="Transformation assignments"
              description="Engagements connect clients, sites, stage, team, and linked diagnostic work without assuming that one client always maps to one project."
              metadata={['Client-linked', 'Stage-aware', 'Repository-backed']}
            />

            <section className="metric-grid metric-grid--compact">
              {stageSummary.map((item) => (
                <StatCard
                  key={item.stage}
                  detail="Engagements currently sitting in this transformation stage."
                  label={item.stage}
                  tone={item.count > 0 ? 'accent' : 'neutral'}
                  value={String(item.count)}
                />
              ))}
            </section>

            <Card title="Engagement register" description="Assignments are stage-aware and maintain explicit ties to clients, sites, and delivery teams.">
              <DataTable
                columns={[
                  {
                    header: 'Engagement',
                    render: (row) => (
                      <div>
                        <strong>{row.name}</strong>
                        <div className="body-copy body-copy--small">{row.clientName}</div>
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
                    render: (row) => <Badge tone={row.statusTone}>{row.status}</Badge>,
                  },
                  {
                    header: 'Lead',
                    render: (row) => row.leadName,
                  },
                  {
                    header: 'Coverage',
                    render: (row) => `${row.siteCount} sites · ${row.teamSize} team`,
                  },
                  {
                    header: 'Target',
                    render: (row) => row.targetDate,
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