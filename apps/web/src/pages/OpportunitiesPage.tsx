import { Badge, Card, DataTable, PageHeader, StatCard } from '@ui';

import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { buildOpportunitiesViewModel } from '@app/features/fabric-data/selectors';

export function OpportunitiesPage() {
  return (
    <FabricDataView
      emptyTitle="Opportunities cannot be loaded"
      loadingDescription="Loading evidence-linked opportunities and approval status."
      loadingTitle="Loading opportunities"
    >
      {(dataset) => {
        const viewModel = buildOpportunitiesViewModel(dataset);

        return (
          <>
            <PageHeader
              eyebrow="Opportunities"
              title="Problem-led opportunity register"
              description="Opportunities are connected to evidence, processes, ownership, and future delivery seams so prioritisation does not become a disconnected scoring exercise."
              metadata={['Evidence-linked', 'Approval-aware', 'Delivery-connected']}
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Critical or high-priority opportunities based on current evidence and consultant judgement."
                label="High priority"
                tone="warning"
                value={String(viewModel.highPriorityCount)}
              />
              <StatCard
                detail="Opportunities with an approved status in the current dataset."
                label="Approved"
                tone="success"
                value={String(viewModel.approvedCount)}
              />
              <StatCard
                detail="Opportunities already tied to explicit evidence references."
                label="Evidence linked"
                tone="accent"
                value={String(viewModel.evidenceLinkedCount)}
              />
            </section>

            <Card title="Opportunity register" description="The next implementation seam is prioritisation logic and roadmap conversion, not more ad hoc page-level status fields.">
              <DataTable
                columns={[
                  {
                    header: 'Opportunity',
                    render: (row) => (
                      <div>
                        <strong>{row.title}</strong>
                        <div className="body-copy body-copy--small">{row.engagementName}</div>
                      </div>
                    ),
                    width: '25%',
                  },
                  {
                    header: 'Type',
                    render: (row) => row.type,
                  },
                  {
                    header: 'Process',
                    render: (row) => row.processName,
                  },
                  {
                    header: 'Priority',
                    render: (row) => <Badge tone={row.priorityTone}>{row.priority}</Badge>,
                  },
                  {
                    header: 'Status',
                    render: (row) => row.status,
                  },
                  {
                    header: 'Approval',
                    render: (row) => row.approvalState,
                  },
                  {
                    header: 'Owner',
                    render: (row) => row.ownerName,
                  },
                  {
                    header: 'Evidence',
                    render: (row) => `${row.evidenceCount} refs`,
                  },
                  {
                    header: 'Initiatives',
                    render: (row) => row.initiativeCount,
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