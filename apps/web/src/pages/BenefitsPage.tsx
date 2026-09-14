import { Link } from 'react-router-dom';

import { Badge, Card, DataTable, PageHeader, StatCard } from '@ui';

import { ActiveEngagementDataView } from '@app/features/fabric-data/ActiveEngagementDataView';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';
import { withEngagementContext } from '@app/features/fabric-data/engagement-paths';

function benefitTone(status: string) {
  if (status === 'validated') {
    return 'success' as const;
  }
  if (status === 'not-realised') {
    return 'danger' as const;
  }
  if (status === 'measuring') {
    return 'warning' as const;
  }
  return 'neutral' as const;
}

function formatStatus(status: string) {
  return status
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function BenefitsPage() {
  const { activeClient, activeEngagement, activeEngagementId } =
    useFabricData();

  return (
    <ActiveEngagementDataView
      emptyTitle="Benefit measures are unavailable"
      loadingDescription="Loading expected and realised benefit measures."
      loadingTitle="Loading benefits"
    >
      {(dataset) => {
        const engagement = activeEngagement ?? dataset.engagements[0];
        if (!engagement) {
          return null;
        }

        const initiativesById = new Map(
          dataset.initiatives.map((initiative) => [initiative.id, initiative]),
        );
        const validatedCount = dataset.benefitMeasurements.filter(
          (measurement) => measurement.status === 'validated',
        ).length;
        const measuringCount = dataset.benefitMeasurements.filter(
          (measurement) => measurement.status === 'measuring',
        ).length;

        return (
          <>
            <PageHeader
              eyebrow="Plan & Output"
              title="Benefits"
              description={`Keep expected benefits, measurement assumptions, and realised impact clear for ${activeClient?.name ?? 'the active client'}.`}
              metadata={[
                engagement.name,
                'Expected vs realised',
                'Evidence-led',
              ]}
              actions={
                <Link
                  className="table-link"
                  to={withEngagementContext('/roadmap', activeEngagementId)}
                >
                  Open Roadmap
                </Link>
              }
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Measures connected to active-engagement initiatives."
                label="Benefit measures"
                tone="accent"
                value={String(dataset.benefitMeasurements.length)}
              />
              <StatCard
                detail="Measures with a recorded validation outcome."
                label="Validated"
                tone="success"
                value={String(validatedCount)}
              />
              <StatCard
                detail="Measures currently collecting or comparing evidence."
                label="Measuring"
                tone="warning"
                value={String(measuringCount)}
              />
            </section>

            <Card
              title="Benefit register"
              description="Open the connected initiative to update its measurement plan and delivery context."
            >
              <DataTable
                columns={[
                  {
                    header: 'Initiative',
                    render: (row) => {
                      const initiative = initiativesById.get(row.initiativeId);
                      return initiative ? (
                        <Link
                          className="table-link"
                          to={`/roadmap/${initiative.id}`}
                        >
                          {initiative.title}
                        </Link>
                      ) : (
                        'Unknown initiative'
                      );
                    },
                    width: '22%',
                  },
                  { header: 'Measure', render: (row) => row.measure },
                  {
                    header: 'Expected',
                    render: (row) => `${row.expectedValue} ${row.unit}`,
                  },
                  {
                    header: 'Actual',
                    render: (row) =>
                      row.actualValue !== undefined
                        ? `${row.actualValue} ${row.unit}`
                        : 'Not measured',
                  },
                  {
                    header: 'Status',
                    render: (row) => (
                      <Badge tone={benefitTone(row.status)}>
                        {formatStatus(row.status)}
                      </Badge>
                    ),
                  },
                  {
                    header: 'Confidence',
                    render: (row) => formatStatus(row.confidence),
                  },
                ]}
                emptyState="No benefit measures are connected to this engagement yet."
                getRowKey={(row) => row.id}
                rows={dataset.benefitMeasurements}
              />
            </Card>
          </>
        );
      }}
    </ActiveEngagementDataView>
  );
}
