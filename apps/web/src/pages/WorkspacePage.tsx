import { Badge, Card, PageHeader, StatCard } from '@ui';

import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { buildWorkspaceSnapshot } from '@app/features/fabric-data/selectors';

export function WorkspacePage() {
  return (
    <FabricDataView
      emptyTitle="Workspace data is unavailable"
      loadingDescription="Loading the current Fabric repository snapshot."
      loadingTitle="Loading workspace"
    >
      {(dataset) => {
        const snapshot = buildWorkspaceSnapshot(dataset);

        return (
          <>
            <PageHeader
              eyebrow="Workspace"
              title="Connected transformation workspace"
              description="This shell establishes Fabric as one structured internal environment for engagements, evidence, opportunities, and controlled outputs. The current content is validated development data rather than production client records."
              metadata={[
                'Evidence-led',
                'Modular monolith',
                'Internal-first governance',
              ]}
              actions={<Badge tone="accent">Development baseline</Badge>}
            />

            <section className="metric-grid">
              {snapshot.metrics.map((metric) => (
                <StatCard
                  key={metric.label}
                  detail={metric.detail}
                  label={metric.label}
                  tone={metric.tone === 'danger' ? 'warning' : metric.tone}
                  value={metric.value}
                />
              ))}
            </section>

            <section className="content-grid content-grid--two">
              <Card
                title="Active engagements"
                description="Current transformation assignments connected to the internal workspace model."
              >
                <div className="record-stack">
                  {snapshot.activeEngagements.map((engagement) => (
                    <article className="record-item" key={engagement.id}>
                      <div>
                        <h4>{engagement.name}</h4>
                        <p className="body-copy">{engagement.clientName}</p>
                      </div>
                      <div className="record-item__meta">
                        <Badge tone="neutral">{engagement.stage}</Badge>
                        <span>{engagement.teamSize} team members</span>
                        <span>Target {engagement.targetDate}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </Card>

              <Card
                title="Upcoming site walks"
                description="Structured fieldwork that will feed observations, evidence, and follow-up actions."
              >
                <div className="record-stack">
                  {snapshot.upcomingSiteWalks.map((siteWalk) => (
                    <article className="record-item" key={siteWalk.id}>
                      <div>
                        <h4>{siteWalk.title}</h4>
                        <p className="body-copy">
                          {siteWalk.engagementName} · {siteWalk.siteName}
                        </p>
                      </div>
                      <div className="record-item__meta">
                        <Badge tone="warning">{siteWalk.status}</Badge>
                        <span>{siteWalk.when}</span>
                        <span>{siteWalk.ownerName}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </Card>
            </section>

            <section className="content-grid content-grid--two">
              <Card
                title="Priority opportunities"
                description="Evidence-linked opportunities with the highest current implementation signal."
              >
                <div className="record-stack">
                  {snapshot.priorityOpportunities.map((opportunity) => (
                    <article className="record-item" key={opportunity.id}>
                      <div>
                        <h4>{opportunity.title}</h4>
                        <p className="body-copy">
                          {opportunity.engagementName}
                        </p>
                      </div>
                      <div className="record-item__meta">
                        <Badge
                          tone={
                            opportunity.tone === 'danger'
                              ? 'warning'
                              : opportunity.tone
                          }
                        >
                          {opportunity.priority}
                        </Badge>
                        <span>{opportunity.status}</span>
                        <span>{opportunity.evidenceCount} evidence links</span>
                      </div>
                    </article>
                  ))}
                </div>
              </Card>

              <Card
                title="Outputs awaiting review"
                description="Controlled deliverables remain downstream of approved internal information."
              >
                <div className="record-stack">
                  {snapshot.outputsAwaitingReview.map((output) => (
                    <article className="record-item" key={output.id}>
                      <div>
                        <h4>{output.title}</h4>
                        <p className="body-copy">
                          {output.outputType} · {output.engagementName}
                        </p>
                      </div>
                      <div className="record-item__meta">
                        <Badge
                          tone={
                            output.status === 'Internal Review'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {output.status}
                        </Badge>
                        <span>{output.visibility}</span>
                      </div>
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
