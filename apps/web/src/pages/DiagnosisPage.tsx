import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type {
  ConfidenceLevel,
  MaturityAssessment,
  MaturityLevel,
  ReviewStatus,
} from '@domain';
import {
  Badge,
  Button,
  Card,
  DataTable,
  MaturityRadar,
  MaturityScorecardVisualizer,
  PageHeader,
  Sheet,
  StatCard,
  Toolbar,
  ViewToggle,
} from '@ui';
import { BarChart2, Lightbulb, Radar as RadarIcon } from 'lucide-react';
import { ActiveEngagementDataView } from '@app/features/fabric-data/ActiveEngagementDataView';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';
import {
  buildOpportunityCreationPath,
  withEngagementContext,
} from '@app/features/fabric-data/engagement-paths';

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

function TargetStateEditor({
  assessment,
  disabled,
  onSave,
}: {
  assessment: MaturityAssessment;
  disabled: boolean;
  onSave: (patch: Partial<MaturityAssessment>) => Promise<void>;
}) {
  const [targetScore, setTargetScore] = useState(
    assessment.targetScore?.toString() ?? '',
  );
  const [desiredState, setDesiredState] = useState(
    assessment.desiredState ?? '',
  );
  const [targetRationale, setTargetRationale] = useState(
    assessment.targetRationale ?? '',
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTargetScore(assessment.targetScore?.toString() ?? '');
    setDesiredState(assessment.desiredState ?? '');
    setTargetRationale(assessment.targetRationale ?? '');
  }, [
    assessment.desiredState,
    assessment.id,
    assessment.targetRationale,
    assessment.targetScore,
  ]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTargetScore = targetScore ? Number(targetScore) : undefined;
    const nextTargetRationale = targetRationale.trim();

    if (nextTargetScore !== undefined && !nextTargetRationale) {
      setError('Explain why this target is appropriate before saving it.');
      return;
    }

    setError(null);
    await onSave({
      targetScore: nextTargetScore,
      targetRationale: nextTargetScore
        ? nextTargetRationale || undefined
        : undefined,
      desiredState: desiredState.trim() || undefined,
    });
  }

  return (
    <form className="assessment-target-editor" onSubmit={submit}>
      <div className="assessment-target-editor__header">
        <div>
          <strong>Agreed target state</strong>
          <p className="body-copy body-copy--small">
            Targets are optional and must reflect this engagement, not a
            universal maturity benchmark.
          </p>
        </div>
      </div>
      <label className="form-field">
        <span>Target maturity score</span>
        <select
          value={targetScore}
          onChange={(event) => setTargetScore(event.target.value)}
          disabled={disabled}
        >
          <option value="">Not agreed yet</option>
          {[1, 2, 3, 4, 5].map((score) => (
            <option key={score} value={score}>
              Level {score} - {levels[score - 1]}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        <span>Desired operational state</span>
        <textarea
          onChange={(event) => setDesiredState(event.target.value)}
          placeholder="Describe the practical capability this operation needs."
          rows={2}
          value={desiredState}
          disabled={disabled}
        />
      </label>
      <label className="form-field">
        <span>Why this target is appropriate</span>
        <textarea
          onChange={(event) => setTargetRationale(event.target.value)}
          placeholder="Record the operational need, constraint, or agreed outcome."
          rows={2}
          value={targetRationale}
          disabled={disabled}
        />
      </label>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button disabled={disabled} type="submit" variant="secondary">
        Save target state
      </Button>
    </form>
  );
}

export function DiagnosisPage() {
  const {
    activeEngagement,
    activeEngagementId,
    canPerform,
    saveMaturityAssessment,
  } = useFabricData();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'visual' | 'table' | 'findings'>(
    searchParams.has('finding') ? 'findings' : 'visual',
  );
  const [selectedDimensionId, setSelectedDimensionId] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <ActiveEngagementDataView
      emptyTitle="Diagnostics cannot be loaded"
      loadingDescription="Loading scorecard dimensions and assessment evidence."
      loadingTitle="Loading diagnostics"
    >
      {(dataset) => {
        const highlightedFindingId = searchParams.get('finding');
        const findingDiagnosticId = highlightedFindingId
          ? dataset.findings.find((item) => item.id === highlightedFindingId)
              ?.diagnosticId
          : undefined;
        const selectedDiagnosticId =
          findingDiagnosticId ??
          (activeEngagement
            ? dataset.diagnostics.find(
                (candidate) => candidate.engagementId === activeEngagement.id,
              )?.id
            : dataset.diagnostics[0]?.id);
        const diagnostic = dataset.diagnostics.find(
          (item) => item.id === selectedDiagnosticId,
        );
        if (!diagnostic)
          return (
            <>
              <PageHeader
                eyebrow="Analyse"
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
          setError(null);
          try {
            await saveMaturityAssessment({
              ...assessment,
              ...patch,
              level: levelFor(patch.score ?? assessment.score),
              assessedAt: new Date().toISOString(),
            });
            setMessage('Assessment saved.');
          } catch (caught) {
            setError(
              caught instanceof Error
                ? caught.message
                : 'Assessment could not be saved.',
            );
          }
        };

        const enrichedDimensions = dataset.diagnosticDimensions.map((dim) => {
          const assessment = assessments.find((a) => a.dimensionId === dim.id);
          return {
            id: dim.id,
            name: dim.name,
            score: assessment?.score,
            targetScore: assessment?.targetScore,
            level: assessment?.level,
            confidence: assessment?.confidence,
            reviewStatus: assessment?.reviewStatus,
            rationale: assessment?.rationale,
            evidenceCount: assessment?.relatedObservationIds.length ?? 0,
          };
        });

        const selectedDimData = enrichedDimensions.find(
          (d) => d.id === selectedDimensionId,
        );
        const selectedAssessment = selectedDimData
          ? (assessments.find((a) => a.dimensionId === selectedDimData.id) ?? {
              id: `assessment-${diagnostic.id}-${selectedDimData.id}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              diagnosticId: diagnostic.id,
              dimensionId: selectedDimData.id,
              relatedObservationIds: [],
              evidenceReferences: [],
              relatedOpportunityIds: [],
              confidence: 'medium' as const,
              reviewStatus: 'draft' as const,
            })
          : null;

        const diagnosticFindings = dataset.findings.filter(
          (item) => item.diagnosticId === diagnostic.id,
        );
        const canCreateOpportunity = canPerform(
          'opportunity:write',
          diagnostic.engagementId,
        );
        const canEditDiagnostic = canPerform(
          'diagnostic:write',
          diagnostic.engagementId,
        );
        const canApproveDiagnostic = canPerform(
          'diagnostic:approve',
          diagnostic.engagementId,
        );

        return (
          <>
            <PageHeader
              eyebrow="Analyse"
              title="Diagnostic workspace"
              description={`${diagnostic.description} Select a maturity dimension to inspect its evidence, reasoning, gap, and potential opportunity.`}
              metadata={[
                diagnostic.methodologyVersion,
                diagnostic.status,
                diagnostic.scope,
              ]}
              actions={<Badge tone="accent">Active engagement</Badge>}
            />

            {message ? (
              <p className="form-success" role="status">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
            {!canEditDiagnostic ? (
              <p className="body-copy body-copy--small">
                You have view-only access to this diagnostic. Assessment changes
                require diagnostic editing permission.
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

            {/* View Mode Toolbar */}
            <Toolbar>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <ViewToggle
                  value={viewMode}
                  onChange={(v: string) =>
                    setViewMode(v as 'visual' | 'table' | 'findings')
                  }
                  options={[
                    {
                      id: 'visual',
                      label: 'Radar & heatmap',
                      icon: <RadarIcon size={14} />,
                    },
                    {
                      id: 'table',
                      label: 'Scoring matrix',
                      icon: <BarChart2 size={14} />,
                    },
                    {
                      id: 'findings',
                      label: `Findings (${diagnosticFindings.length})`,
                      icon: <Lightbulb size={14} />,
                    },
                  ]}
                />
              </div>
            </Toolbar>

            {/* Visual Radar & Heatmap Mode */}
            {viewMode === 'visual' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
              >
                <div className="diagnostic-visual-grid">
                  <Card
                    title="Maturity spider / radar"
                    description="Visual comparison of assessed baseline maturity against agreed target states where they have been set."
                  >
                    <MaturityRadar
                      dimensions={enrichedDimensions}
                      selectedDimensionId={selectedDimensionId}
                      onSelectDimension={(dim) =>
                        setSelectedDimensionId(dim.id)
                      }
                      height={400}
                    />
                  </Card>

                  <Card
                    title="Dimension progression tracks"
                    description="Progress across 5 maturity tiers: Reactive → Developing → Controlled → Integrated → Optimised. Click any dimension to inspect or edit."
                  >
                    <MaturityScorecardVisualizer
                      dimensions={enrichedDimensions}
                      selectedDimensionId={selectedDimensionId}
                      onSelectDimension={(dim) =>
                        setSelectedDimensionId(dim.id)
                      }
                    />
                  </Card>
                </div>
              </div>
            )}

            {/* Table Scoring Mode */}
            {viewMode === 'table' && (
              <Card
                title="Maturity profile"
                description="Manual, evidence-linked scoring. A score of 5 is not automatically the objective."
              >
                <DataTable
                  rows={dataset.diagnosticDimensions}
                  getRowKey={(row) => row.id}
                  selectedRowKey={selectedDimensionId ?? undefined}
                  onRowClick={(row) => setSelectedDimensionId(row.id)}
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
                            disabled={!canEditDiagnostic}
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
                            disabled={!canEditDiagnostic}
                            value={assessment?.confidence ?? 'medium'}
                            onChange={(event) => {
                              if (assessment)
                                update(assessment, {
                                  confidence: event.target
                                    .value as ConfidenceLevel,
                                });
                            }}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
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
                        if (assessment?.reviewStatus === 'approved') {
                          return <Badge tone="success">Approved</Badge>;
                        }
                        return (
                          <select
                            aria-label={`Review ${row.name}`}
                            disabled={!canEditDiagnostic}
                            value={assessment?.reviewStatus ?? 'draft'}
                            onChange={(event) => {
                              if (assessment)
                                update(assessment, {
                                  reviewStatus: event.target
                                    .value as ReviewStatus,
                                });
                            }}
                          >
                            <option value="draft">Draft</option>
                            <option value="reviewed">Reviewed</option>
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
                              disabled={!canEditDiagnostic}
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
            )}

            {/* Findings & Opportunities Mode */}
            {viewMode === 'findings' && (
              <section className="content-grid content-grid--two">
                <Card
                  title="Diagnostic findings"
                  description="Evidence-grounded observations synthesized into formal diagnostic conclusions."
                >
                  <div className="record-stack">
                    {diagnosticFindings.map((finding) => (
                      <article
                        className={`record-item${
                          finding.id === highlightedFindingId
                            ? ' record-item--highlighted'
                            : ''
                        }`}
                        id={`finding-${finding.id}`}
                        key={finding.id}
                      >
                        <div>
                          <strong>{finding.title}</strong>
                          <p className="body-copy">
                            {finding.currentSituation}
                          </p>
                          {finding.whyItMatters && (
                            <div
                              className="body-copy body-copy--small"
                              style={{
                                marginTop: '4px',
                                color: 'var(--fabric-text-soft)',
                              }}
                            >
                              Why it matters: {finding.whyItMatters}
                            </div>
                          )}
                        </div>
                        <div className="record-item__actions">
                          <Badge
                            tone={
                              finding.reviewStatus === 'approved'
                                ? 'success'
                                : 'warning'
                            }
                          >
                            {finding.reviewStatus}
                          </Badge>
                          {canCreateOpportunity ? (
                            <Link
                              className="table-link"
                              to={buildOpportunityCreationPath(
                                diagnostic.engagementId,
                                { type: 'finding', id: finding.id },
                              )}
                            >
                              Develop opportunity
                            </Link>
                          ) : null}
                        </div>
                      </article>
                    ))}
                    {diagnosticFindings.length === 0 ? (
                      <p className="body-copy">
                        No findings recorded yet. Findings should remain linked
                        to observations and evidence.
                      </p>
                    ) : null}
                  </div>
                </Card>

                <Card
                  title="Downstream opportunities & actions"
                  description="Diagnostic findings feed prioritized transformation opportunities."
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                    }}
                  >
                    <div className="prompt-list">
                      <span>
                        Understand → Simplify → Standardise → Automate → Measure
                      </span>
                      <span>
                        Missing rationale and weak evidence remain visible.
                      </span>
                      <span>
                        Overall score stays pending until all dimensions are
                        scored.
                      </span>
                    </div>

                    <Link
                      className="table-link"
                      to={withEngagementContext(
                        '/opportunities',
                        activeEngagementId,
                      )}
                    >
                      Open opportunity register →
                    </Link>
                  </div>
                </Card>
              </section>
            )}

            {/* Dimension Assessment Inspector Sheet */}
            <Sheet
              open={Boolean(selectedDimData && selectedAssessment)}
              onOpenChange={(open) => {
                if (!open) setSelectedDimensionId(null);
              }}
              title={selectedDimData?.name || 'Dimension assessment'}
              description={
                selectedDimData?.level
                  ? `Maturity level: ${selectedDimData.level}`
                  : 'Assessment details'
              }
              size="lg"
            >
              {selectedDimData && selectedAssessment && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                  }}
                >
                  <div
                    style={{
                      padding: '16px',
                      background: 'var(--fabric-surface-alt)',
                      borderRadius: '8px',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      Assessed maturity score (1–5):
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <select
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--fabric-border)',
                          minWidth: '200px',
                        }}
                        value={selectedAssessment.score ?? ''}
                        disabled={!canEditDiagnostic}
                        onChange={(e) =>
                          update(selectedAssessment, {
                            score: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      >
                        <option value="">Unscored</option>
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <option key={lvl} value={lvl}>
                            Level {lvl} - {levels[lvl - 1]}
                          </option>
                        ))}
                      </select>
                      {selectedAssessment.level && (
                        <Badge tone="accent">{selectedAssessment.level}</Badge>
                      )}
                    </div>
                  </div>

                  <TargetStateEditor
                    assessment={selectedAssessment}
                    disabled={!canEditDiagnostic}
                    onSave={(patch) => update(selectedAssessment, patch)}
                  />

                  {selectedAssessment.reviewStatus === 'reviewed' &&
                  canApproveDiagnostic ? (
                    <Button
                      onClick={() =>
                        void update(selectedAssessment, {
                          reviewStatus: 'approved',
                        })
                      }
                    >
                      Approve assessment
                    </Button>
                  ) : null}

                  <div className="assessment-detail-grid">
                    <div
                      style={{
                        padding: '12px',
                        background: 'var(--fabric-surface-alt)',
                        borderRadius: '6px',
                      }}
                    >
                      <label
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'block',
                          marginBottom: '6px',
                        }}
                      >
                        Confidence level:
                      </label>
                      <select
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: '1px solid var(--fabric-border)',
                        }}
                        value={selectedAssessment.confidence ?? 'medium'}
                        disabled={!canEditDiagnostic}
                        onChange={(e) =>
                          update(selectedAssessment, {
                            confidence: e.target.value as ConfidenceLevel,
                          })
                        }
                      >
                        <option value="low">Low confidence</option>
                        <option value="medium">Medium confidence</option>
                        <option value="high">High confidence</option>
                      </select>
                    </div>

                    <div
                      style={{
                        padding: '12px',
                        background: 'var(--fabric-surface-alt)',
                        borderRadius: '6px',
                      }}
                    >
                      <label
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'block',
                          marginBottom: '6px',
                        }}
                      >
                        Review status:
                      </label>
                      {selectedAssessment.reviewStatus === 'approved' ? (
                        <Badge tone="success">Approved</Badge>
                      ) : (
                        <select
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: '1px solid var(--fabric-border)',
                          }}
                          value={selectedAssessment.reviewStatus ?? 'draft'}
                          disabled={!canEditDiagnostic}
                          onChange={(e) =>
                            update(selectedAssessment, {
                              reviewStatus: e.target.value as ReviewStatus,
                            })
                          }
                        >
                          <option value="draft">Draft</option>
                          <option value="reviewed">Reviewed</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      Evidence rationale & observation notes:
                    </label>
                    <textarea
                      style={{
                        width: '100%',
                        minHeight: '100px',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--fabric-border)',
                        background: 'var(--fabric-surface-alt)',
                        fontSize: '13px',
                      }}
                      placeholder="Detail the operational evidence and observations justifying this score..."
                      defaultValue={selectedAssessment.rationale ?? ''}
                      disabled={!canEditDiagnostic}
                      onBlur={(e) =>
                        update(selectedAssessment, {
                          rationale: e.target.value || undefined,
                        })
                      }
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '8px',
                      marginTop: '12px',
                    }}
                  >
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedDimensionId(null)}
                    >
                      Close inspector
                    </Button>
                  </div>
                </div>
              )}
            </Sheet>
          </>
        );
      }}
    </ActiveEngagementDataView>
  );
}
