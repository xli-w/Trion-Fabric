import { Link } from 'react-router-dom';

import { Badge, Card, PageHeader, StatCard } from '@ui';

import { ActiveEngagementDataView } from '@app/features/fabric-data/ActiveEngagementDataView';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';
import { withEngagementContext } from '@app/features/fabric-data/engagement-paths';

export function UnderstandPage() {
  const { activeClient, activeEngagement, activeEngagementId, activeSites } =
    useFabricData();

  return (
    <ActiveEngagementDataView
      emptyTitle="Understanding workspace is unavailable"
      loadingDescription="Loading active fieldwork, evidence, and landscape context."
      loadingTitle="Loading Understand"
    >
      {(dataset) => {
        const engagement = activeEngagement ?? dataset.engagements[0];
        if (!engagement) {
          return null;
        }

        const openSiteWalks = dataset.siteWalks.filter(
          (siteWalk) =>
            siteWalk.status !== 'completed' && siteWalk.status !== 'cancelled',
        );
        const evidenceNeedingReview = dataset.evidence.filter(
          (evidence) => evidence.approvalState !== 'approved',
        );
        const siteLabel =
          activeSites.length > 0
            ? activeSites.map((site) => site.name).join(', ')
            : 'No site recorded';
        const recentWalks = [...dataset.siteWalks]
          .sort((left, right) =>
            right.scheduledAt.localeCompare(left.scheduledAt),
          )
          .slice(0, 3);

        return (
          <>
            <PageHeader
              eyebrow="Understand workbench"
              title="Understand the operation"
              description={`Investigate ${activeClient?.name ?? 'the client'} at ${siteLabel}: capture what is seen, retain evidence, and map the operating environment.`}
              metadata={[
                engagement.name,
                'Site walks',
                'Evidence-led landscape',
              ]}
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Planned or in-progress investigations in this engagement."
                label="Open site walks"
                tone="warning"
                value={String(openSiteWalks.length)}
              />
              <StatCard
                detail="Captured source material linked to the active engagement."
                label="Evidence"
                tone="accent"
                value={String(dataset.evidence.length)}
              />
              <StatCard
                detail="Structured areas, processes, systems, data, and handoffs."
                label="Landscape items"
                tone="success"
                value={String(dataset.landscapeEntities.length)}
              />
              <StatCard
                detail="Evidence that remains internal or needs a fuller review."
                label="Evidence to validate"
                tone="neutral"
                value={String(evidenceNeedingReview.length)}
              />
            </section>

            <section className="content-grid content-grid--three">
              <Card
                eyebrow="Investigate"
                title="Site Walk"
                description="Brief, walk, capture, investigate, identify friction, recap, and agree the next step."
                actions={
                  <Link
                    className="table-link"
                    to={withEngagementContext(
                      '/site-walks',
                      activeEngagementId,
                    )}
                  >
                    Open Site Walk
                  </Link>
                }
              >
                <div className="record-stack">
                  {recentWalks.length > 0 ? (
                    recentWalks.map((siteWalk) => (
                      <Link
                        className="record-item table-link"
                        key={siteWalk.id}
                        to={`/site-walks/${siteWalk.id}`}
                      >
                        <div>
                          <strong>{siteWalk.title}</strong>
                          <p className="body-copy body-copy--small">
                            {siteWalk.walkType}
                          </p>
                        </div>
                        <Badge
                          tone={
                            siteWalk.status === 'completed'
                              ? 'success'
                              : 'warning'
                          }
                        >
                          {siteWalk.status}
                        </Badge>
                      </Link>
                    ))
                  ) : (
                    <p className="body-copy body-copy--small">
                      Start a site walk to capture the operational context.
                    </p>
                  )}
                </div>
              </Card>

              <Card
                eyebrow="Trace"
                title="Evidence"
                description="Review photos, documents, interviews, extracts, and observations where they support the current work."
                actions={
                  <Link
                    className="table-link"
                    to={withEngagementContext('/evidence', activeEngagementId)}
                  >
                    Open Evidence
                  </Link>
                }
              >
                <p className="body-copy">
                  Evidence stays contextual to the observation, diagnostic
                  dimension, opportunity, or output it supports. The library is
                  filtered to this engagement by default.
                </p>
              </Card>

              <Card
                eyebrow="Map"
                title="Digital Landscape"
                description="Model the processes, systems, people, data, equipment, and handoffs that make up the current operation."
                actions={
                  <Link
                    className="table-link"
                    to={withEngagementContext('/landscape', activeEngagementId)}
                  >
                    Open Landscape
                  </Link>
                }
              >
                <p className="body-copy">
                  The landscape remains one connected structure, with focused
                  views rather than separate diagrams for each team.
                </p>
              </Card>
            </section>
          </>
        );
      }}
    </ActiveEngagementDataView>
  );
}
