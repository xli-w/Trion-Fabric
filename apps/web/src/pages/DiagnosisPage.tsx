import { useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  ConfidenceLevel,
  MaturityAssessment,
  MaturityLevel,
  ReviewStatus,
} from '@domain';
import { Badge, Card, DataTable, PageHeader, StatCard } from '@ui';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';

const levels: MaturityLevel[] = [
  'Reactive',
  'Developing',
  'Controlled',
  'Integrated',
  'Optimised',
];

function levelFor(score?: number): MaturityLevel | undefined {
  return score ? levels[score - 1] : undefined;
}

export function DiagnosisPage() {
  const { saveMaturityAssessment } = useFabricData();
  const [diagnosticId, setDiagnosticId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  return (
    <FabricDataView
      emptyTitle="Diagnostics cannot be loaded"
      loadingDescription="Loading scorecard dimensions and assessment evidence."
      loadingTitle="Loading diagnostics"
    >
      {(dataset) => {
        const diagnostic = dataset.diagnostics.find(
          (item) => item.id === (diagnosticId || dataset.diagnostics[0]?.id),
        );
        if (!diagnostic)
          return (
            <>
              <PageHeader
                eyebrow="Diagnosis & outputs"
                title="Digital and operational maturity"
                description="Create a diagnostic from a client engagement to assess fit-for-purpose maturity and prepare controlled engagement outputs."
              />
              <Card title="No diagnostic yet">
                <p className="body-copy">
                  Create a Digital Diagnostic engagement first, then begin the
                  assessment.
                </p>
              </Card>
            </>
          );
        const assessments = dataset.maturityAssessments.filter(
          (item) => item.diagnosticId === diagnostic.id,
        );
        const completed = assessments.filter(
          (item) => item.score !== undefined,
        ).length;
        const reviewed = assessments.filter(
          (item) => item.reviewStatus !== 'draft',
        ).length;
        const score =
          completed === dataset.diagnosticDimensions.length && completed > 0
            ? assessments.reduce((sum, item) => sum + (item.score ?? 0), 0) /
              completed
            : undefined;
        const update = async (
          assessment: MaturityAssessment,
          patch: Partial<MaturityAssessment>,
        ) => {
          setMessage(null);
          try {
            await saveMaturityAssessment({
              ...assessment,
              ...patch,
              level: levelFor(patch.score ?? assessment.score),
              assessedAt: new Date().toISOString(),
            });
            setMessage('Assessment saved.');
          } catch (caught) {
            setMessage(
              caught instanceof Error
                ? caught.message
                : 'Assessment could not be saved.',
            );
          }
        };
        return (
          <>
            <PageHeader
              eyebrow="Diagnosis & outputs"
              title={diagnostic.title}
              description={`${diagnostic.description} Approved diagnostic records flow into controlled engagement outputs.`}
              metadata={[
                diagnostic.methodologyVersion,
                diagnostic.status,
                diagnostic.scope,
              ]}
              actions={
                <select
                  className="diagnostic-select"
                  value={diagnostic.id}
                  onChange={(event) => setDiagnosticId(event.target.value)}
                >
                  {dataset.diagnostics.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              }
            />
            {message ? (
              <p className="form-success" role="status">
                {message}
              </p>
            ) : null}
            <section className="metric-grid metric-grid--compact">
              <StatCard
                label="Dimensions assessed"
                value={`${completed} / ${dataset.diagnosticDimensions.length}`}
                detail="Scores only count when manually entered."
                tone="accent"
              />
              <StatCard
                label="Reviewed"
                value={`${reviewed} / ${dataset.diagnosticDimensions.length}`}
                detail="Draft, reviewed, or approved assessment states."
                tone="success"
              />
              <StatCard
                label="Overall score"
                value={score ? score.toFixed(1) : 'Pending'}
                detail="Calculated only when all dimensions have scores."
                tone="warning"
              />
              <StatCard
                label="Evidence signal"
                value={String(
                  new Set(
                    assessments.flatMap((item) => item.relatedObservationIds),
                  ).size,
                )}
                detail="Observation links used in current assessments."
                tone="neutral"
              />
            </section>
            <Card
              title="Maturity profile"
              description="Manual, evidence-linked scoring. A score of 5 is not automatically the objective."
            >
              <DataTable
                rows={dataset.diagnosticDimensions}
                getRowKey={(row) => row.id}
                columns={[
                  {
                    header: 'Dimension',
                    render: (row) => (
                      <div>
                        <strong>{row.name}</strong>
                        <div className="body-copy body-copy--small">
                          {row.description}
                        </div>
                      </div>
                    ),
                    width: '25%',
                  },
                  {
                    header: 'Score',
                    render: (row) => {
                      const assessment = assessments.find(
                        (item) => item.dimensionId === row.id,
                      ) ?? {
                        id: `assessment-${diagnostic.id}-${row.id}`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        diagnosticId: diagnostic.id,
                        dimensionId: row.id,
                        relatedObservationIds: [],
                        evidenceReferences: [],
                        relatedOpportunityIds: [],
                        confidence: 'medium' as const,
                        reviewStatus: 'draft' as const,
                      };
                      return (
                        <select
                          aria-label={`Score ${row.name}`}
                          value={assessment.score ?? ''}
                          onChange={(event) =>
                            update(assessment, {
                              score: event.target.value
                                ? Number(event.target.value)
                                : undefined,
                            })
                          }
                        >
                          <option value="">Unscored</option>
                          {[1, 2, 3, 4, 5].map((value) => (
                            <option key={value} value={value}>
                              {value} - {levels[value - 1]}
                            </option>
                          ))}
                        </select>
                      );
                    },
                  },
                  {
                    header: 'Level',
                    render: (row) => {
                      const assessment = assessments.find(
                        (item) => item.dimensionId === row.id,
                      );
                      return assessment?.level ? (
                        <Badge tone="accent">{assessment.level}</Badge>
                      ) : (
                        'Pending'
                      );
                    },
                  },
                  {
                    header: 'Confidence',
                    render: (row) => {
                      const assessment = assessments.find(
                        (item) => item.dimensionId === row.id,
                      );
                      return (
                        <select
                          aria-label={`Confidence ${row.name}`}
                          value={assessment?.confidence ?? 'medium'}
                          onChange={(event) => {
                            if (assessment)
                              update(assessment, {
                                confidence: event.target
                                  .value as ConfidenceLevel,
                              });
                          }}
                        >
                          <option>low</option>
                          <option>medium</option>
                          <option>high</option>
                        </select>
                      );
                    },
                  },
                  {
                    header: 'Review',
                    render: (row) => {
                      const assessment = assessments.find(
                        (item) => item.dimensionId === row.id,
                      );
                      return (
                        <select
                          aria-label={`Review ${row.name}`}
                          value={assessment?.reviewStatus ?? 'draft'}
                          onChange={(event) => {
                            if (assessment)
                              update(assessment, {
                                reviewStatus: event.target
                                  .value as ReviewStatus,
                              });
                          }}
                        >
                          <option>draft</option>
                          <option>reviewed</option>
                          <option>approved</option>
                        </select>
                      );
                    },
                  },
                  {
                    header: 'Rationale / state',
                    render: (row) => {
                      const assessment = assessments.find(
                        (item) => item.dimensionId === row.id,
                      ) ?? {
                        id: `assessment-${diagnostic.id}-${row.id}`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        diagnosticId: diagnostic.id,
                        dimensionId: row.id,
                        relatedObservationIds: [],
                        evidenceReferences: [],
                        relatedOpportunityIds: [],
                        confidence: 'medium' as const,
                        reviewStatus: 'draft' as const,
                      };
                      return (
                        <div className="assessment-rationale">
                          <input
                            aria-label={`Rationale ${row.name}`}
                            placeholder="Rationale required for a score"
                            defaultValue={assessment.rationale ?? ''}
                            onBlur={(event) =>
                              update(assessment, {
                                rationale: event.target.value || undefined,
                              })
                            }
                          />
                          <span className="body-copy body-copy--small">
                            {assessment.currentState ??
                              'Current state pending.'}
                          </span>
                        </div>
                      );
                    },
                  },
                ]}
              />
            </Card>
            <section className="content-grid content-grid--two">
              <Card title="Assessment guardrails">
                <div className="prompt-list">
                  <span>
                    Understand → Simplify → Standardise → Automate → Measure
                  </span>
                  <span>
                    Missing rationale and weak evidence remain visible.
                  </span>
                  <span>
                    Overall score stays pending until all ten dimensions are
                    scored.
                  </span>
                </div>
              </Card>
              <Card title="Findings and opportunities">
                <div className="record-stack">
                  {dataset.findings
                    .filter((item) => item.diagnosticId === diagnostic.id)
                    .map((finding) => (
                      <article className="record-item" key={finding.id}>
                        <div>
                          <strong>{finding.title}</strong>
                          <p className="body-copy">
                            {finding.currentSituation}
                          </p>
                        </div>
                        <Badge
                          tone={
                            finding.reviewStatus === 'approved'
                              ? 'success'
                              : 'warning'
                          }
                        >
                          {finding.reviewStatus}
                        </Badge>
                      </article>
                    ))}
                  {dataset.findings.filter(
                    (item) => item.diagnosticId === diagnostic.id,
                  ).length === 0 ? (
                    <p className="body-copy">
                      No findings recorded yet. Findings should remain linked to
                      observations and evidence.
                    </p>
                  ) : null}
                  <Link className="table-link" to="/opportunities">
                    Review opportunity register →
                  </Link>
                </div>
              </Card>
            </section>
          </>
        );
      }}
    </FabricDataView>
  );
}
