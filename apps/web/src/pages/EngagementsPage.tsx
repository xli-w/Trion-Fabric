import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Button, Card, DataTable, PageHeader, StatCard } from '@ui';

import { EngagementForm } from '@app/features/fabric-data/EntityForms';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { buildEngagementsViewModel } from '@app/features/fabric-data/selectors';

export function EngagementsPage() {
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
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
              actions={<Button onClick={() => setShowForm((value) => !value)}>{showForm ? 'Close form' : 'Add engagement'}</Button>}
            />
            {showForm ? <Card title="Create engagement" description="A preliminary site walk can remain lightweight and later progress into a Digital Diagnostic."><EngagementForm onSaved={() => setShowForm(false)} /></Card> : null}

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
              <input className="search-input" aria-label="Search engagements" placeholder="Search engagements..." value={query} onChange={(event) => setQuery(event.target.value)} />
              <DataTable
                columns={[
                  {
                    header: 'Engagement',
                    render: (row) => (
                      <div>
                        <Link className="table-link" to={`/engagements/${row.id}`}><strong>{row.name}</strong></Link>
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
                rows={rows.filter((row) => `${row.name} ${row.clientName} ${row.type}`.toLowerCase().includes(query.toLowerCase()))}
              />
            </Card>
          </>
        );
      }}
    </FabricDataView>
  );
}