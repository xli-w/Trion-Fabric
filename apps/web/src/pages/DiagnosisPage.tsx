import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toolbar,
  ViewToggle,
} from '@ui';
import {
  Activity,
  BarChart2,
  CheckCircle2,
  Compass,
  FileCheck,
  Layers,
  Lightbulb,
  Radar as RadarIcon,
  Search,
  ShieldAlert,
} from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'visual' | 'table' | 'findings'>('visual');
  const [selectedDimensionId, setSelectedDimensionId] = useState<string | null>(null);
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
                eyebrow="Diagnosis"
                title="Digital and operational maturity"
                description="Create a diagnostic from a client engagement to assess fit-for-purpose maturity and prepare controlled engagement outputs."
              />
              <Card title="No diagnostic yet">
                <p className="body-copy">
                  Create a Digital Diagnostic engagement first, then begin the assessment.
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

        // Enrich dimensions with current assessment scores
        const enrichedDimensions = dataset.diagnosticDimensions.map((dim) => {
          const assessment = assessments.find((a) => a.dimensionId === dim.id);
          return {
            id: dim.id,
            name: dim.name,
            score: assessment?.score,
            targetScore: 4, // Industry benchmark target
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
          ? assessments.find((a) => a.dimensionId === selectedDimData.id) ?? {
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
            }
          : null;

        const diagnosticFindings = dataset.findings.filter(
          (item) => item.diagnosticId === diagnostic.id,
        );

        return (
          <>
            <PageHeader
              eyebrow="Diagnosis"
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

            {/* View Mode Toolbar */}
            <Toolbar>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 460px) 1fr', gap: '24px' }}>
                  <Card
                    title="Maturity spider / radar"
                    description="Visual comparison of assessed baseline maturity against target transformation benchmark across all 10 dimensions."
                  >
                    <MaturityRadar
                      dimensions={enrichedDimensions}
                      selectedDimensionId={selectedDimensionId}
                      onSelectDimension={(dim) => setSelectedDimensionId(dim.id)}
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
                      onSelectDimension={(dim) => setSelectedDimensionId(dim.id)}
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
                            <option value="draft">Draft</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="approved">Approved</option>
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
                      <article className="record-item" key={finding.id}>
                        <div>
                          <strong>{finding.title}</strong>
                          <p className="body-copy">
                            {finding.currentSituation}
                          </p>
                          {finding.whyItMatters && (
                            <div className="body-copy body-copy--small" style={{ marginTop: '4px', color: 'var(--fabric-text-soft)' }}>
                              Why it matters: {finding.whyItMatters}
                            </div>
                          )}
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
                    {diagnosticFindings.length === 0 ? (
                      <p className="body-copy">
                        No findings recorded yet. Findings should remain linked to
                        observations and evidence.
                      </p>
                    ) : null}
                  </div>
                </Card>

                <Card
                  title="Downstream opportunities & actions"
                  description="Diagnostic findings feed prioritized transformation opportunities."
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="prompt-list">
                      <span>
                        Understand → Simplify → Standardise → Automate → Measure
                      </span>
                      <span>
                        Missing rationale and weak evidence remain visible.
                      </span>
                      <span>
                        Overall score stays pending until all dimensions are scored.
                      </span>
                    </div>

                    <Link className="table-link" to="/opportunities">
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
              description={selectedDimData?.level ? `Maturity level: ${selectedDimData.level}` : 'Assessment details'}
              size="lg"
            >
              {selectedDimData && selectedAssessment && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ padding: '16px', background: 'var(--fabric-surface-alt)', borderRadius: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                      Assessed maturity score (1–5):
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <select
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--fabric-border)', minWidth: '200px' }}
                        value={selectedAssessment.score ?? ''}
                        onChange={(e) =>
                          update(selectedAssessment, {
                            score: e.target.value ? Number(e.target.value) : undefined,
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ padding: '12px', background: 'var(--fabric-surface-alt)', borderRadius: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                        Confidence level:
                      </label>
                      <select
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--fabric-border)' }}
                        value={selectedAssessment.confidence ?? 'medium'}
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

                    <div style={{ padding: '12px', background: 'var(--fabric-surface-alt)', borderRadius: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                        Review status:
                      </label>
                      <select
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--fabric-border)' }}
                        value={selectedAssessment.reviewStatus ?? 'draft'}
                        onChange={(e) =>
                          update(selectedAssessment, {
                            reviewStatus: e.target.value as ReviewStatus,
                          })
                        }
                      >
                        <option value="draft">Draft</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="approved">Approved</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
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
                      onBlur={(e) =>
                        update(selectedAssessment, {
                          rationale: e.target.value || undefined,
                        })
                      }
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                    <Button variant="secondary" onClick={() => setSelectedDimensionId(null)}>
                      Close inspector
                    </Button>
                  </div>
                </div>
              )}
            </Sheet>
          </>
        );
      }}
    </FabricDataView>
  );
}

