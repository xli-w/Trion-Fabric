import { Link, useParams } from 'react-router-dom';

import { Badge, Card, EmptyState, PageHeader, StatCard } from '@ui';

import { ActiveEngagementDataView } from '@app/features/fabric-data/ActiveEngagementDataView';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';
import { withEngagementContext } from '@app/features/fabric-data/engagement-paths';
import {
  buildCurrentUnderstanding,
  buildWorkspaceSnapshot,
  type CurrentUnderstandingItem,
} from '@app/features/fabric-data/selectors';

interface UnderstandingListProps {
  title: string;
  description: string;
  items: CurrentUnderstandingItem[];
  emptyState: string;
}

function UnderstandingList({
  title,
  description,
  items,
  emptyState,
}: UnderstandingListProps) {
  return (
    <Card title={title} description={description}>
      <div className="record-stack">
        {items.length > 0 ? (
          items.map((item) => (
            <article className="record-item record-item--note" key={item.id}>
              <div>
                <Link className="table-link" to={item.path}>
                  <strong>{item.title}</strong>
                </Link>
                <p className="body-copy body-copy--small">{item.detail}</p>
              </div>
            </article>
          ))
        ) : (
          <p className="body-copy body-copy--small">{emptyState}</p>
        )}
      </div>
    </Card>
  );
}

export function WorkspacePage() {
  const { engagementId: requestedEngagementId } = useParams();
  const {
    activeClient,
    activeEngagement,
    activeEngagementId,
    activeSites,
    currentUser,
    dataset,
  } = useFabricData();
  const requestedEngagement = requestedEngagementId
    ? dataset?.engagements.find(
        (engagement) => engagement.id === requestedEngagementId,
      )
    : undefined;

  if (requestedEngagementId && dataset && !requestedEngagement) {
    return (
      <>
        <PageHeader
          eyebrow="Active engagement workspace"
          title="Engagement unavailable"
          description="The requested engagement is unavailable in the current workspace."
        />
        <EmptyState
          action={
            <Link className="table-link" to="/workspace">
              Open active workspace
            </Link>
          }
          description="Choose an accessible engagement from the active context selector or return to the current workspace."
          title="This workspace cannot be opened"
        />
      </>
    );
  }

  if (requestedEngagement && activeEngagementId !== requestedEngagement.id) {
    return (
      <Card title="Opening active workspace">
        <p className="body-copy">
          Restoring the selected client and engagement context.
        </p>
      </Card>
    );
  }

  return (
    <ActiveEngagementDataView
      emptyTitle="Workspace data is unavailable"
      loadingDescription="Loading the active transformation workspace."
      loadingTitle="Loading workspace"
    >
      {(dataset) => {
        const engagement = activeEngagement ?? dataset.engagements[0];
        if (!engagement) {
          return null;
        }

        const snapshot = buildWorkspaceSnapshot(dataset, currentUser?.id);
        const understanding = buildCurrentUnderstanding(dataset, engagement.id);
        const assessments = dataset.maturityAssessments.filter(
          (assessment) => assessment.score !== undefined,
        );
        const overallMaturity =
          assessments.length > 0
            ? assessments.reduce(
                (total, assessment) => total + (assessment.score ?? 0),
                0,
              ) / assessments.length
            : undefined;
        const priorityOpportunityCount = dataset.opportunities.filter(
          (opportunity) =>
            opportunity.visibility !== 'archived' &&
            (opportunity.priority === 'critical' ||
              opportunity.priority === 'high'),
        ).length;
        const activeSiteLabel =
          activeSites.length > 0
            ? activeSites.map((site) => site.name).join(', ')
            : 'No site recorded';

        return (
          <>
            <PageHeader
              eyebrow="Active engagement workspace"
              title={engagement.name}
              description={`One connected body of evidence for ${activeClient?.name ?? 'this client'} at ${activeSiteLabel}.`}
              metadata={[engagement.type, engagement.stage, engagement.status]}
              actions={
                <Link className="table-link" to="/clients">
                  Change engagement
                </Link>
              }
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Average of manually scored maturity assessments."
                label="Maturity"
                tone="accent"
                value={
                  overallMaturity
                    ? `${overallMaturity.toFixed(1)} / 5`
                    : 'Not assessed'
                }
              />
              <StatCard
                detail="Evidence-linked recommendations in this engagement."
                label="Opportunities"
                tone="neutral"
                value={String(dataset.opportunities.length)}
              />
              <StatCard
                detail="High or critical opportunities requiring consultant attention."
                label="Priority opportunities"
                tone="warning"
                value={String(priorityOpportunityCount)}
              />
              <StatCard
                detail="Structured fieldwork and source material in the current context."
                label="Fieldwork / evidence"
                tone="success"
                value={`${dataset.siteWalks.length} / ${dataset.evidence.length}`}
              />
            </section>

            <section className="workspace-focus-grid">
              <Card
                eyebrow="Next action"
                title={snapshot.nextAction.title}
                description={snapshot.nextAction.detail}
                actions={
                  <Link className="table-link" to={snapshot.nextAction.path}>
                    Continue
                  </Link>
                }
              >
                <p className="body-copy">
                  This recommendation is drawn from incomplete fieldwork,
                  review, approval, and opportunity records in the active
                  engagement.
                </p>
              </Card>

              <Card
                eyebrow="Current position"
                title={`${activeClient?.name ?? 'Client'} · ${activeSiteLabel}`}
                description="Use this workspace to move naturally from understanding the operation to analysing evidence, planning improvements, and preparing controlled outputs."
              >
                <div className="workspace-stage-links">
                  <Link
                    to={withEngagementContext('/understand', engagement.id)}
                  >
                    <span>Understand</span>
                    <strong>Site walk, evidence, landscape</strong>
                  </Link>
                  <Link to={withEngagementContext('/analyse', engagement.id)}>
                    <span>Analyse</span>
                    <strong>Diagnostic, findings, opportunities</strong>
                  </Link>
                  <Link
                    to={withEngagementContext('/plan-output', engagement.id)}
                  >
                    <span>Plan & Output</span>
                    <strong>Roadmap, benefits, outputs</strong>
                  </Link>
                </div>
              </Card>
            </section>

            <section id="current-understanding">
              <div className="workspace-section-heading">
                <p>Evidence-grounded view</p>
                <h2>Current Understanding</h2>
                <span>
                  A live distinction between what is verified, what is
                  interpreted, and what still needs investigation.
                </span>
              </div>
              <div className="current-understanding-grid">
                <UnderstandingList
                  description="Verified observations and approved evidence."
                  emptyState="No verified evidence-backed facts have been recorded yet."
                  items={understanding?.known ?? []}
                  title="What we know"
                />
                <UnderstandingList
                  description="Reviewed findings that explain emerging patterns."
                  emptyState="No reviewed patterns have been recorded yet."
                  items={understanding?.patterns ?? []}
                  title="What appears to be happening"
                />
                <UnderstandingList
                  description="Draft, unverified, or incomplete assessment work."
                  emptyState="No current uncertainty is recorded."
                  items={understanding?.uncertainties ?? []}
                  title="What is uncertain"
                />
                <UnderstandingList
                  description="Operational constraints observed during the work."
                  emptyState="No friction points have been captured yet."
                  items={understanding?.friction ?? []}
                  title="Where the friction is"
                />
                <UnderstandingList
                  description="Established capability indicated by maturity evidence."
                  emptyState="No evidence-backed strengths have been assessed yet."
                  items={understanding?.strengths ?? []}
                  title="What is working well"
                />
                <UnderstandingList
                  description="The recommendations with the greatest current priority."
                  emptyState="No active opportunities have been recorded yet."
                  items={understanding?.priorityOpportunities ?? []}
                  title="Where the biggest opportunities are"
                />
              </div>
            </section>

            <section className="content-grid content-grid--three">
              <Card
                title="Understand"
                description="Capture what is happening on site and connect it to the landscape."
                actions={
                  <Link
                    className="table-link"
                    to={withEngagementContext('/understand', engagement.id)}
                  >
                    Open Understand
                  </Link>
                }
              >
                <Badge
                  tone={
                    snapshot.upcomingSiteWalks.length > 0
                      ? 'warning'
                      : 'success'
                  }
                >
                  {snapshot.upcomingSiteWalks.length} open site walks
                </Badge>
              </Card>
              <Card
                title="Analyse"
                description="Review maturity evidence, findings, and recommendations."
                actions={
                  <Link
                    className="table-link"
                    to={withEngagementContext('/analyse', engagement.id)}
                  >
                    Open Analyse
                  </Link>
                }
              >
                <Badge
                  tone={
                    snapshot.observationsNeedingReview.length > 0
                      ? 'warning'
                      : 'success'
                  }
                >
                  {snapshot.observationsNeedingReview.length} observations need
                  review
                </Badge>
              </Card>
              <Card
                title="Plan & Output"
                description="Sequence work and prepare the five controlled outputs."
                actions={
                  <Link
                    className="table-link"
                    to={withEngagementContext('/plan-output', engagement.id)}
                  >
                    Open Plan & Output
                  </Link>
                }
              >
                <Badge
                  tone={
                    snapshot.outputsAwaitingApproval.length > 0
                      ? 'warning'
                      : 'success'
                  }
                >
                  {snapshot.outputsAwaitingApproval.length} outputs await
                  approval
                </Badge>
              </Card>
            </section>
          </>
        );
      }}
    </ActiveEngagementDataView>
  );
}
