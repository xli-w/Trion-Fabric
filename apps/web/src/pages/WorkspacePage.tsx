import { Link } from 'react-router-dom';

import { Badge, Card, PageHeader, StatCard } from '@ui';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';
import { buildWorkspaceSnapshot } from '@app/features/fabric-data/selectors';

export function WorkspacePage() {
  const { currentUser } = useFabricData();

  return (
    <FabricDataView
      emptyTitle="Workspace data is unavailable"
      loadingDescription="Loading the current Fabric workbench."
      loadingTitle="Loading workspace"
    >
      {(dataset) => {
        const snapshot = buildWorkspaceSnapshot(dataset, currentUser?.id);
        const userRole = currentUser?.role.replace(/-/g, ' ') ?? 'internal user';

        return (
          <>
            <PageHeader
              eyebrow="Workspace"
              title={
                currentUser
                  ? `${currentUser.displayName}'s transformation workbench`
                  : 'Transformation workbench'
              }
              description="Use the connected work queues below to move from field evidence through assessment, recommendation, delivery, and controlled output approval."
              metadata={[
                userRole,
                `${snapshot.reviewCount} review items`,
                `${snapshot.myEngagements.length} active assignments`,
              ]}
              actions={
                <Link className="table-link" to="/engagements">
                  Open engagements
                </Link>
              }
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Active engagements where the current user is the lead or a team member."
                label="My active engagements"
                tone="accent"
                value={String(snapshot.myEngagements.length)}
              />
              <StatCard
                detail="Planned or in-progress fieldwork that has not been completed or cancelled."
                label="Upcoming site walks"
                tone="warning"
                value={String(snapshot.upcomingSiteWalks.length)}
              />
              <StatCard
                detail="Observations requiring review plus outputs in internal review."
                label="Review queue"
                tone="warning"
                value={String(snapshot.reviewCount)}
              />
              <StatCard
                detail="Open opportunities missing an explicit approval, review, ownership, or provenance signal."
                label="Incomplete opportunities"
                tone="neutral"
                value={String(snapshot.incompleteOpportunities.length)}
              />
            </section>

            <Card
              eyebrow="Next useful action"
              title={snapshot.nextAction.title}
              description={snapshot.nextAction.detail}
              actions={
                <Link className="table-link" to={snapshot.nextAction.path}>
                  Open action
                </Link>
              }
            >
              <p className="body-copy">
                This recommendation is selected from actual review, approval,
                opportunity, and fieldwork records rather than a generic
                progress score.
              </p>
            </Card>

            <section className="content-grid content-grid--two">
              <Card
                title="What I am working on"
                description="Current assignments based on the selected internal user and engagement team membership."
              >
                <div className="record-stack">
                  {snapshot.myEngagements.length > 0 ? (
                    snapshot.myEngagements.map((engagement) => (
                      <article className="record-item" key={engagement.id}>
                        <div>
                          <Link className="table-link" to={engagement.path}>
                            <strong>{engagement.name}</strong>
                          </Link>
                          <p className="body-copy body-copy--small">
                            {engagement.clientName}
                          </p>
                        </div>
                        <div className="record-item__meta">
                          <Badge tone="accent">{engagement.stage}</Badge>
                          <span>{engagement.status}</span>
                          <span>Target {engagement.targetDate}</span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="body-copy">
                      You are not assigned to an active engagement. Review the
                      shared queues or change the internal user context.
                    </p>
                  )}
                </div>
              </Card>

              <Card
                title="Upcoming site walks"
                description="Fieldwork still open in the shared transformation workspace."
                actions={
                  <Link className="table-link" to="/site-walks">
                    Open site walks
                  </Link>
                }
              >
                <div className="record-stack">
                  {snapshot.upcomingSiteWalks.length > 0 ? (
                    snapshot.upcomingSiteWalks.map((siteWalk) => (
                      <article className="record-item" key={siteWalk.id}>
                        <div>
                          <Link className="table-link" to={siteWalk.path}>
                            <strong>{siteWalk.title}</strong>
                          </Link>
                          <p className="body-copy body-copy--small">
                            {siteWalk.engagementName} - {siteWalk.siteName}
                          </p>
                        </div>
                        <div className="record-item__meta">
                          <Badge tone="warning">{siteWalk.status}</Badge>
                          <span>{siteWalk.when}</span>
                          <span>{siteWalk.ownerName}</span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="body-copy">
                      No upcoming site walks need attention.
                    </p>
                  )}
                </div>
              </Card>
            </section>

            <section className="content-grid content-grid--two">
              <Card
                title="Engagements needing attention"
                description="Workstreams with a recorded risk, open fieldwork, review, incomplete opportunity, or output approval task."
              >
                <div className="record-stack">
                  {snapshot.engagementsNeedingAttention.length > 0 ? (
                    snapshot.engagementsNeedingAttention.map((engagement) => (
                      <article className="record-item" key={engagement.id}>
                        <div>
                          <Link className="table-link" to={engagement.path}>
                            <strong>{engagement.name}</strong>
                          </Link>
                          <p className="body-copy body-copy--small">
                            {engagement.clientName}
                          </p>
                        </div>
                        <span>{engagement.reasons.join('; ')}</span>
                      </article>
                    ))
                  ) : (
                    <p className="body-copy">
                      No active assigned engagements have recorded attention
                      signals.
                    </p>
                  )}
                </div>
              </Card>

              <Card
                title="Observations requiring review"
                description="Raw observations remain internal until a consultant verifies their status and suitability."
                actions={
                  <Link className="table-link" to="/site-walks">
                    Review fieldwork
                  </Link>
                }
              >
                <div className="record-stack">
                  {snapshot.observationsNeedingReview.length > 0 ? (
                    snapshot.observationsNeedingReview.map((observation) => (
                      <article className="record-item" key={observation.id}>
                        <div>
                          <Link className="table-link" to={observation.path}>
                            <strong>{observation.title}</strong>
                          </Link>
                          <p className="body-copy body-copy--small">
                            {observation.engagementName}
                          </p>
                        </div>
                        <Badge tone="warning">Needs review</Badge>
                      </article>
                    ))
                  ) : (
                    <p className="body-copy">
                      No observations are currently awaiting review.
                    </p>
                  )}
                </div>
              </Card>
            </section>

            <section className="content-grid content-grid--two">
              <Card
                title="Incomplete opportunities"
                description="Opportunity work remains visible until evidence, ownership, review, and approval are explicit."
                actions={
                  <Link className="table-link" to="/opportunities">
                    Open register
                  </Link>
                }
              >
                <div className="record-stack">
                  {snapshot.incompleteOpportunities.length > 0 ? (
                    snapshot.incompleteOpportunities.map((opportunity) => (
                      <article className="record-item" key={opportunity.id}>
                        <div>
                          <Link className="table-link" to={opportunity.path}>
                            <strong>{opportunity.title}</strong>
                          </Link>
                          <p className="body-copy body-copy--small">
                            {opportunity.engagementName}
                          </p>
                        </div>
                        <div className="record-item__meta">
                          <Badge tone={opportunity.tone}>
                            {opportunity.priority}
                          </Badge>
                          <span>{opportunity.missing.join(', ')}</span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="body-copy">
                      No open opportunities have a missing completion signal.
                    </p>
                  )}
                </div>
              </Card>

              <Card
                title="Outputs awaiting approval"
                description="Only internal-review outputs are in this approval queue; drafts remain working material."
                actions={
                  <Link className="table-link" to="/outputs">
                    Open outputs
                  </Link>
                }
              >
                <div className="record-stack">
                  {snapshot.outputsAwaitingApproval.length > 0 ? (
                    snapshot.outputsAwaitingApproval.map((output) => (
                      <article className="record-item" key={output.id}>
                        <div>
                          <Link className="table-link" to={output.path}>
                            <strong>{output.title}</strong>
                          </Link>
                          <p className="body-copy body-copy--small">
                            {output.outputType} - {output.engagementName}
                          </p>
                        </div>
                        <div className="record-item__meta">
                          <Badge tone="warning">{output.status}</Badge>
                          <span>{output.visibility}</span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="body-copy">
                      No controlled outputs are awaiting approval.
                    </p>
                  )}
                </div>
              </Card>
            </section>
          </>
        );
      }}
    </FabricDataView>
  );
}
