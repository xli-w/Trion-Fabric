import { Link } from 'react-router-dom';

import { Badge, Card, PageHeader, StatCard } from '@ui';

import { ActiveEngagementDataView } from '@app/features/fabric-data/ActiveEngagementDataView';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';
import { withEngagementContext } from '@app/features/fabric-data/engagement-paths';

export function AnalysePage() {
  const { activeClient, activeEngagement, activeEngagementId } =
    useFabricData();

  return (
    <ActiveEngagementDataView
      emptyTitle="Analysis workspace is unavailable"
      loadingDescription="Loading diagnostic evidence, findings, and opportunities."
      loadingTitle="Loading Analyse"
    >
      {(dataset) => {
        const engagement = activeEngagement ?? dataset.engagements[0];
        if (!engagement) {
          return null;
        }

        const assessments = dataset.maturityAssessments.filter(
          (assessment) => assessment.score !== undefined,
        );
        const maturity =
          assessments.length > 0
            ? assessments.reduce(
                (total, assessment) => total + (assessment.score ?? 0),
                0,
              ) / assessments.length
            : undefined;
        const findingsToReview = dataset.findings.filter(
          (finding) => finding.reviewStatus === 'draft',
        );
        const highPriorityOpportunities = dataset.opportunities.filter(
          (opportunity) =>
            opportunity.visibility !== 'archived' &&
            (opportunity.priority === 'critical' ||
              opportunity.priority === 'high'),
        );

        return (
          <>
            <PageHeader
              eyebrow="Analyse workbench"
              title="Turn evidence into direction"
              description={`Assess ${activeClient?.name ?? 'the active client'} with a clear maturity profile, evidence-linked reasoning, and a practical opportunity register.`}
              metadata={[
                engagement.name,
                'Maturity diagnostic',
                'Evidence-led opportunities',
              ]}
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Average of manually scored dimensions with recorded context."
                label="Overall maturity"
                tone="accent"
                value={maturity ? `${maturity.toFixed(1)} / 5` : 'Not assessed'}
              />
              <StatCard
                detail="Dimensions currently carrying a score."
                label="Dimensions assessed"
                tone="success"
                value={`${assessments.length} / ${dataset.diagnosticDimensions.length}`}
              />
              <StatCard
                detail="Findings that still need an explicit review."
                label="Findings to review"
                tone="warning"
                value={String(findingsToReview.length)}
              />
              <StatCard
                detail="High and critical recommendations in the current register."
                label="Priority opportunities"
                tone="neutral"
                value={String(highPriorityOpportunities.length)}
              />
            </section>

            <section className="content-grid content-grid--two">
              <Card
                eyebrow="Assess"
                title="Diagnostic"
                description="Open a maturity dimension to see its current state, desired state, gap, evidence, observations, opportunity, and confidence."
                actions={
                  <Link
                    className="table-link"
                    to={withEngagementContext('/diagnosis', activeEngagementId)}
                  >
                    Open Diagnostic
                  </Link>
                }
              >
                <div className="record-stack">
                  {dataset.diagnostics.map((diagnostic) => (
                    <article
                      className="record-item record-item--note"
                      key={diagnostic.id}
                    >
                      <div>
                        <strong>{diagnostic.title}</strong>
                        <p className="body-copy body-copy--small">
                          {diagnostic.description}
                        </p>
                      </div>
                      <Badge tone="accent">{diagnostic.status}</Badge>
                    </article>
                  ))}
                  {dataset.diagnostics.length === 0 ? (
                    <p className="body-copy body-copy--small">
                      No diagnostic has been started for this engagement.
                    </p>
                  ) : null}
                </div>
              </Card>

              <Card
                eyebrow="Recommend"
                title="Opportunity Register"
                description="Prioritise recommendations by impact, effort, indicative value, confidence, dependencies, timing, and evidence."
                actions={
                  <Link
                    className="table-link"
                    to={withEngagementContext(
                      '/opportunities',
                      activeEngagementId,
                    )}
                  >
                    Open Opportunities
                  </Link>
                }
              >
                <div className="record-stack">
                  {highPriorityOpportunities.slice(0, 3).map((opportunity) => (
                    <Link
                      className="record-item table-link"
                      key={opportunity.id}
                      to={`/opportunities/${opportunity.id}`}
                    >
                      <div>
                        <strong>{opportunity.title}</strong>
                        <p className="body-copy body-copy--small">
                          {opportunity.recommendedImprovement ??
                            opportunity.description}
                        </p>
                      </div>
                      <Badge tone="warning">{opportunity.priority}</Badge>
                    </Link>
                  ))}
                  {highPriorityOpportunities.length === 0 ? (
                    <p className="body-copy body-copy--small">
                      No high-priority opportunities are recorded yet.
                    </p>
                  ) : null}
                </div>
              </Card>
            </section>
          </>
        );
      }}
    </ActiveEngagementDataView>
  );
}
