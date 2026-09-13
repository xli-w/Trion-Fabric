import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import {
  Badge,
  Button,
  Card,
  PageHeader,
  RoadmapTimeline,
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
  BenefitMeasurementForm,
  DeliveryActionForm,
  InitiativeForm,
  isOpportunityReadyForDelivery,
  MilestoneForm,
  RoadmapForm,
} from '@app/features/roadmap/DeliveryForms';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { buildRoadmapViewModel } from '@app/features/fabric-data/selectors';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flag,
  Kanban,
  Layers,
  Plus,
  TrendingUp,
  User,
} from 'lucide-react';

function statusTone(status: string) {
  if (status === 'complete' || status === 'approved') {
    return 'success' as const;
  }

  if (status === 'blocked') {
    return 'warning' as const;
  }

  return 'accent' as const;
}

function formatStatus(status: string) {
  return status
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(value?: string) {
  return value
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    : 'Not scheduled';
}

export function RoadmapPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'timeline' | 'register'>('timeline');
  const [showRoadmapForm, setShowRoadmapForm] = useState(false);
  const [editingRoadmapId, setEditingRoadmapId] = useState<string | null>(null);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null);

  function closeRoadmapForm() {
    setShowRoadmapForm(false);
    setEditingRoadmapId(null);
  }

  function openRoadmapForm(roadmapId?: string) {
    setEditingRoadmapId(roadmapId ?? null);
    setShowRoadmapForm(true);
  }

  return (
    <FabricDataView
      emptyTitle="Roadmap cannot be loaded"
      loadingDescription="Loading delivery sequencing and benefit measures."
      loadingTitle="Loading roadmap"
    >
      {(dataset) => {
        const viewModel = buildRoadmapViewModel(dataset);
        const editingRoadmap = dataset.roadmaps.find(
          (roadmap) => roadmap.id === editingRoadmapId,
        );
        const opportunitiesAwaitingDelivery = dataset.opportunities.filter(
          (opportunity) =>
            isOpportunityReadyForDelivery(opportunity) &&
            !dataset.initiatives.some(
              (initiative) => initiative.opportunityId === opportunity.id,
            ),
        );

        // Map initiatives for timeline
        const timelineInitiatives = dataset.initiatives.map((init) => {
          const owner = dataset.users.find((u) => u.id === init.ownerUserId);
          const initMilestones = dataset.milestones.filter(
            (m) => m.initiativeId === init.id,
          );
          const initBenefits = dataset.benefitMeasurements.filter(
            (b) => b.initiativeId === init.id,
          );

          const completedMilestones = initMilestones.filter(
            (m) => m.status === 'complete',
          ).length;
          const completionPct =
            initMilestones.length > 0
              ? Math.round((completedMilestones / initMilestones.length) * 100)
              : init.status === 'approved'
              ? 100
              : init.status === 'in-progress'
              ? 50
              : 10;

          return {
            id: init.id,
            title: init.title,
            description: init.description || init.objective,
            phase: init.phase || 'Simplify',
            priority: init.priority,
            status: init.status,
            owner: owner?.displayName,
            targetDate: init.targetEndDate ? formatDate(init.targetEndDate) : undefined,
            startDate: init.startDate ? formatDate(init.startDate) : undefined,
            completionPercentage: completionPct,
            milestones: initMilestones.map((m) => ({
              id: m.id,
              title: m.title,
              status: m.status,
              dueDate: m.dueDate ? formatDate(m.dueDate) : undefined,
            })),
            benefits: initBenefits.map((b) => ({
              id: b.id,
              description: b.measure,
              targetValue: b.target,
              unit: b.unit,
            })),
          };
        });

        const selectedTimelineInitiative = timelineInitiatives.find(
          (i) => i.id === selectedInitiativeId,
        );
        const selectedRawInitiative = dataset.initiatives.find(
          (i) => i.id === selectedInitiativeId,
        );

        return (
          <>
            <PageHeader
              eyebrow="Transformation"
              title="Transformation roadmap"
              description="Sequence approved opportunities into owned initiatives, milestones, measurable benefits, and governed delivery."
              metadata={[
                'Simplify → Connect → Optimise → Scale',
                `${viewModel.activeInitiativeCount} active initiatives`,
                `${viewModel.benefitMeasurementCount} benefit measures`,
              ]}
              actions={
                <Button
                  onClick={() =>
                    showRoadmapForm ? closeRoadmapForm() : openRoadmapForm()
                  }
                >
                  {showRoadmapForm ? 'Close roadmap form' : 'Create roadmap'}
                </Button>
              }
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                label="Initiatives"
                value={String(viewModel.initiativeCount)}
                detail="Approved-opportunity delivery work."
                tone="accent"
              />
              <StatCard
                label="Milestones"
                value={String(viewModel.milestoneCount)}
                detail="Named checkpoints with accountable owners."
                tone="warning"
              />
              <StatCard
                label="Benefits"
                value={String(viewModel.benefitMeasurementCount)}
                detail="Expected and actual values remain separate."
                tone="success"
              />
            </section>

            {/* View Mode Toolbar */}
            <Toolbar>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ViewToggle
                  value={viewMode}
                  onChange={(v: string) => setViewMode(v as 'timeline' | 'register')}
                  options={[
                    {
                      id: 'timeline',
                      label: 'Phased Delivery Timeline',
                      icon: <Clock size={14} />,
                    },
                    {
                      id: 'register',
                      label: 'Roadmaps & Phases',
                      icon: <Kanban size={14} />,
                    },
                  ]}
                />
              </div>
            </Toolbar>

            {showRoadmapForm ? (
              <Card
                title={editingRoadmap ? 'Edit roadmap' : 'Create roadmap'}
                description="Sequence approved delivery initiatives for one engagement; internal assumptions and dependencies remain separate from controlled output content."
                actions={
                  <Button onClick={closeRoadmapForm} variant="ghost">
                    Close
                  </Button>
                }
              >
                <RoadmapForm
                  roadmap={editingRoadmap}
                  onSaved={closeRoadmapForm}
                />
              </Card>
            ) : null}

            {opportunitiesAwaitingDelivery.length > 0 ? (
              <Card
                title="Approved opportunities awaiting delivery"
                description="Review the recommendation context before creating a phased initiative."
              >
                <div className="record-stack">
                  {opportunitiesAwaitingDelivery.map((opportunity) => (
                    <article className="record-item" key={opportunity.id}>
                      <div>
                        <strong>{opportunity.title}</strong>
                        <p className="body-copy body-copy--small">
                          {opportunity.clientSummary}
                        </p>
                      </div>
                      <Link
                        className="text-link"
                        to={`/opportunities/${opportunity.id}`}
                      >
                        Open opportunity
                      </Link>
                    </article>
                  ))}
                </div>
              </Card>
            ) : null}

            {/* Timeline View */}
            {viewMode === 'timeline' && (
              <Card
                title="Delivery Swimlanes & Phase Progression"
                description="Initiatives sequenced across delivery phases with accountable owners, milestone completion, and measurable benefit targets."
              >
                <RoadmapTimeline
                  initiatives={timelineInitiatives}
                  phases={['Simplify', 'Connect', 'Optimise', 'Scale']}
                  selectedInitiativeId={selectedInitiativeId}
                  onSelectInitiative={(init) => setSelectedInitiativeId(init.id)}
                />
              </Card>
            )}

            {/* Register / Phase Cards View */}
            {viewMode === 'register' && (
              <>
                {viewModel.roadmaps.length === 0 ? (
                  <Card
                    title="No roadmap recorded"
                    description="Create a roadmap only when approved opportunities are ready to be sequenced."
                  >
                    <p className="body-copy">
                      Unsequenced initiatives remain visible below until they are
                      assigned to a roadmap.
                    </p>
                  </Card>
                ) : null}

                {viewModel.roadmaps.map((roadmap) => (
                  <section className="roadmap-section" key={roadmap.id}>
                    <Card
                      title={roadmap.title}
                      description={roadmap.description}
                      actions={
                        <Button
                          onClick={() => openRoadmapForm(roadmap.id)}
                          variant="ghost"
                        >
                          Edit roadmap
                        </Button>
                      }
                    >
                      <div className="record-stack">
                        <div className="split-heading">
                          <Badge tone={roadmap.statusTone}>{roadmap.status}</Badge>
                          <Badge
                            tone={
                              roadmap.reviewStatus === 'Approved'
                                ? 'success'
                                : 'warning'
                            }
                          >
                            {roadmap.reviewStatus}
                          </Badge>
                        </div>
                        <p className="body-copy">{roadmap.sequencingRationale}</p>
                        <p className="body-copy body-copy--small">
                          Assumptions: {roadmap.assumptions}
                        </p>
                        <p className="body-copy body-copy--small">
                          Dependencies: {roadmap.dependencies}
                        </p>
                      </div>
                    </Card>
                    <div className="roadmap-phase-grid">
                      {roadmap.phases.map(({ phase, window, initiatives }) => (
                        <Card key={phase} title={phase} description={window}>
                          <div className="record-stack">
                            {initiatives.length === 0 ? (
                              <p className="body-copy">No initiatives assigned.</p>
                            ) : null}
                            {initiatives.map((initiative) => (
                              <article className="record-item" key={initiative.id}>
                                <div className="split-heading">
                                  <strong>{initiative.title}</strong>
                                  <Badge tone={initiative.statusTone}>
                                    {initiative.status}
                                  </Badge>
                                </div>
                                <p className="body-copy body-copy--small">
                                  {initiative.objective}
                                </p>
                                <p className="body-copy body-copy--small">
                                  Owner: {initiative.ownerName}
                                </p>
                                <Link
                                  className="text-link"
                                  to={`/roadmap/${initiative.id}`}
                                >
                                  Open initiative
                                </Link>
                              </article>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </section>
                ))}

                {viewModel.unsequencedInitiatives.length > 0 ? (
                  <Card
                    title="Delivery initiatives not yet sequenced"
                    description="These initiatives retain their delivery context but have not been added to a roadmap."
                  >
                    <div className="record-stack">
                      {viewModel.unsequencedInitiatives.map((initiative) => (
                        <article className="record-item" key={initiative.id}>
                          <div>
                            <strong>{initiative.title}</strong>
                            <p className="body-copy body-copy--small">
                              {initiative.objective}
                            </p>
                          </div>
                          <Link
                            className="text-link"
                            to={`/roadmap/${initiative.id}`}
                          >
                            Open initiative
                          </Link>
                        </article>
                      ))}
                    </div>
                  </Card>
                ) : null}
              </>
            )}

            {/* Side Inspector Sheet for Selected Initiative */}
            <Sheet
              open={Boolean(selectedTimelineInitiative)}
              onOpenChange={(open) => {
                if (!open) setSelectedInitiativeId(null);
              }}
              title={selectedTimelineInitiative?.title || 'Initiative Inspector'}
              description={
                selectedTimelineInitiative?.phase
                  ? `Phase: ${selectedTimelineInitiative.phase}`
                  : undefined
              }
              size="lg"
            >
              {selectedTimelineInitiative && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge tone={statusTone(selectedTimelineInitiative.status)}>
                      {selectedTimelineInitiative.status}
                    </Badge>
                    <Badge tone="accent">
                      {selectedTimelineInitiative.priority} priority
                    </Badge>
                  </div>

                  <Tabs defaultValue="overview" variant="underline">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger
                        value="milestones"
                        badge={String(selectedTimelineInitiative.milestones?.length ?? 0)}
                      >
                        Milestones
                      </TabsTrigger>
                      <TabsTrigger
                        value="benefits"
                        badge={String(selectedTimelineInitiative.benefits?.length ?? 0)}
                      >
                        Benefits
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <span className="body-copy body-copy--small" style={{ fontWeight: 700 }}>
                            Objective & Scope:
                          </span>
                          <p className="body-copy" style={{ marginTop: '4px' }}>
                            {selectedTimelineInitiative.description}
                          </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ padding: '12px', background: 'var(--fabric-surface-alt)', borderRadius: '6px' }}>
                            <span className="body-copy body-copy--small" style={{ fontWeight: 700 }}>
                              Owner:
                            </span>
                            <div style={{ marginTop: '4px', fontWeight: 600 }}>
                              {selectedTimelineInitiative.owner || 'Unassigned'}
                            </div>
                          </div>

                          <div style={{ padding: '12px', background: 'var(--fabric-surface-alt)', borderRadius: '6px' }}>
                            <span className="body-copy body-copy--small" style={{ fontWeight: 700 }}>
                              Target Date:
                            </span>
                            <div style={{ marginTop: '4px', fontWeight: 600 }}>
                              {selectedTimelineInitiative.targetDate || 'Not scheduled'}
                            </div>
                          </div>
                        </div>

                        {selectedRawInitiative?.risks && (
                          <div style={{ padding: '12px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '6px' }}>
                            <strong style={{ fontSize: '12px', color: '#b45309' }}>
                              Risks & Prerequisites:
                            </strong>
                            <p className="body-copy body-copy--small" style={{ marginTop: '4px', color: '#78350f' }}>
                              {selectedRawInitiative.risks}
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="milestones">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(!selectedTimelineInitiative.milestones ||
                          selectedTimelineInitiative.milestones.length === 0) ? (
                          <p className="body-copy" style={{ fontStyle: 'italic' }}>
                            No milestones defined yet.
                          </p>
                        ) : (
                          selectedTimelineInitiative.milestones.map((m) => (
                            <div
                              key={m.id}
                              style={{
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--fabric-border)',
                                background: 'var(--fabric-surface-alt)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <div>
                                <strong>{m.title}</strong>
                                {m.dueDate && (
                                  <div className="body-copy body-copy--small">
                                    Due: {m.dueDate}
                                  </div>
                                )}
                              </div>
                              <Badge tone={statusTone(m.status)}>{m.status}</Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="benefits">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(!selectedTimelineInitiative.benefits ||
                          selectedTimelineInitiative.benefits.length === 0) ? (
                          <p className="body-copy" style={{ fontStyle: 'italic' }}>
                            No benefit measures linked yet.
                          </p>
                        ) : (
                          selectedTimelineInitiative.benefits.map((b) => (
                            <div
                              key={b.id}
                              style={{
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--fabric-border)',
                                background: 'var(--fabric-surface-alt)',
                              }}
                            >
                              <strong>{b.description}</strong>
                              {b.targetValue && (
                                <div className="body-copy body-copy--small" style={{ marginTop: '2px', color: '#059669', fontWeight: 600 }}>
                                  Target: {b.targetValue} {b.unit || ''}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <Button
                      variant="primary"
                      onClick={() => {
                        navigate(`/roadmap/${selectedTimelineInitiative.id}`);
                        setSelectedInitiativeId(null);
                      }}
                    >
                      Open Full Initiative Workspace →
                    </Button>
                    <Button variant="secondary" onClick={() => setSelectedInitiativeId(null)}>
                      Close
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

export function InitiativeDetailPage() {
  const { initiativeId } = useParams();
  const [editing, setEditing] = useState(false);
  const [capture, setCapture] = useState<
    'milestone' | 'action' | 'benefit' | null
  >(null);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(
    null,
  );
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editingBenefitId, setEditingBenefitId] = useState<string | null>(null);

  function openCapture(kind: 'milestone' | 'action' | 'benefit') {
    setEditingMilestoneId(null);
    setEditingActionId(null);
    setEditingBenefitId(null);
    setCapture(kind);
  }

  function closeCapture() {
    setCapture(null);
    setEditingMilestoneId(null);
    setEditingActionId(null);
    setEditingBenefitId(null);
  }

  function editMilestone(id: string) {
    setCapture(null);
    setEditingActionId(null);
    setEditingBenefitId(null);
    setEditingMilestoneId(id);
  }

  function editAction(id: string) {
    setCapture(null);
    setEditingMilestoneId(null);
    setEditingBenefitId(null);
    setEditingActionId(id);
  }

  function editBenefit(id: string) {
    setCapture(null);
    setEditingMilestoneId(null);
    setEditingActionId(null);
    setEditingBenefitId(id);
  }

  return (
    <FabricDataView
      emptyTitle="Initiative cannot be loaded"
      loadingDescription="Loading initiative context, milestones, actions, and benefits."
      loadingTitle="Loading initiative"
    >
      {(dataset) => {
        const initiative = dataset.initiatives.find(
          (item) => item.id === initiativeId,
        );
        if (!initiative) {
          return (
            <>
              <PageHeader
                eyebrow="Transformation"
                title="Initiative not found"
                description="The requested initiative is not available."
              />
              <Link className="text-link" to="/roadmap">
                Return to roadmap
              </Link>
            </>
          );
        }

        const opportunity = dataset.opportunities.find(
          (item) => item.id === initiative.opportunityId,
        );
        const engagement = dataset.engagements.find(
          (item) => item.id === initiative.engagementId,
        );
        const owner = dataset.users.find(
          (item) => item.id === initiative.ownerUserId,
        );
        const milestones = dataset.milestones.filter(
          (item) => item.initiativeId === initiative.id,
        );
        const actions = dataset.deliveryActions.filter(
          (item) => item.initiativeId === initiative.id,
        );
        const benefits = dataset.benefitMeasurements.filter(
          (item) => item.initiativeId === initiative.id,
        );
        const editingMilestone = milestones.find(
          (item) => item.id === editingMilestoneId,
        );
        const editingAction = actions.find(
          (item) => item.id === editingActionId,
        );
        const editingBenefit = benefits.find(
          (item) => item.id === editingBenefitId,
        );
        const findings = opportunity
          ? dataset.findings.filter((item) =>
              item.relatedOpportunityIds.includes(opportunity.id),
            )
          : [];
        const roadmap = dataset.roadmaps.find((item) =>
          item.initiativeIds.includes(initiative.id),
        );

        return (
          <>
            <PageHeader
              eyebrow="Initiative"
              title={initiative.title}
              description={initiative.description}
              metadata={[
                initiative.phase,
                formatStatus(initiative.status),
                owner?.displayName ?? 'Unknown owner',
              ]}
              actions={
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setEditing((value) => !value)}
                  >
                    {editing ? 'Close edit' : 'Edit initiative'}
                  </Button>
                  <Button onClick={() => openCapture('milestone')}>
                    Add milestone
                  </Button>
                </>
              }
            />

            <div className="detail-badges">
              <Badge tone={statusTone(initiative.status)}>
                {formatStatus(initiative.status)}
              </Badge>
              <Badge
                tone={
                  initiative.reviewStatus === 'approved' ? 'success' : 'warning'
                }
              >
                {formatStatus(initiative.reviewStatus)}
              </Badge>
            </div>

            {editing && opportunity ? (
              <Card title="Edit initiative">
                <InitiativeForm
                  initiative={initiative}
                  opportunity={opportunity}
                  onSaved={() => setEditing(false)}
                />
              </Card>
            ) : null}

            {capture === 'milestone' || editingMilestone ? (
              <Card
                title={editingMilestone ? 'Edit milestone' : 'Add milestone'}
                actions={
                  <Button variant="ghost" onClick={closeCapture}>
                    Close
                  </Button>
                }
              >
                <MilestoneForm
                  initiativeId={initiative.id}
                  milestone={editingMilestone}
                  onSaved={closeCapture}
                />
              </Card>
            ) : null}
            {capture === 'action' || editingAction ? (
              <Card
                title={
                  editingAction ? 'Edit delivery action' : 'Add delivery action'
                }
                actions={
                  <Button variant="ghost" onClick={closeCapture}>
                    Close
                  </Button>
                }
              >
                <DeliveryActionForm
                  action={editingAction}
                  initiativeId={initiative.id}
                  onSaved={closeCapture}
                />
              </Card>
            ) : null}
            {capture === 'benefit' || editingBenefit ? (
              <Card
                title={
                  editingBenefit
                    ? 'Edit benefit measure'
                    : 'Add benefit measure'
                }
                actions={
                  <Button variant="ghost" onClick={closeCapture}>
                    Close
                  </Button>
                }
              >
                <BenefitMeasurementForm
                  initiativeId={initiative.id}
                  measurement={editingBenefit}
                  onSaved={closeCapture}
                />
              </Card>
            ) : null}

            <section className="content-grid content-grid--two">
              <Card title="Objective and originating recommendation">
                <dl className="detail-list">
                  <dt>Objective</dt>
                  <dd>{initiative.objective}</dd>
                  <dt>Scope</dt>
                  <dd>{initiative.scope ?? 'Scope not recorded.'}</dd>
                  <dt>Originating opportunity</dt>
                  <dd>
                    {opportunity ? (
                      <Link
                        className="text-link"
                        to={`/opportunities/${opportunity.id}`}
                      >
                        {opportunity.title}
                      </Link>
                    ) : (
                      'Unavailable'
                    )}
                  </dd>
                  <dt>Current problem</dt>
                  <dd>
                    {opportunity?.identifiedIssue ??
                      opportunity?.problemStatement ??
                      'Unavailable'}
                  </dd>
                  <dt>Engagement</dt>
                  <dd>{engagement?.name ?? 'Unknown engagement'}</dd>
                </dl>
              </Card>
              <Card title="Delivery definition">
                <dl className="detail-list">
                  <dt>Owner</dt>
                  <dd>{owner?.displayName ?? 'Unknown owner'}</dd>
                  <dt>Timeline</dt>
                  <dd>
                    {formatDate(initiative.startDate)} →{' '}
                    {formatDate(initiative.targetEndDate)}
                  </dd>
                  <dt>Priority</dt>
                  <dd>{formatStatus(initiative.priority)}</dd>
                  <dt>Indicative cost</dt>
                  <dd>{initiative.estimatedCost ?? 'Not estimated'}</dd>
                  <dt>Expected benefit</dt>
                  <dd>{initiative.expectedBenefit}</dd>
                  <dt>Benefit type</dt>
                  <dd>{initiative.benefitType ?? 'Not classified'}</dd>
                </dl>
              </Card>
            </section>

            <section className="content-grid content-grid--two">
              <Card
                title={`Milestones (${milestones.length})`}
                actions={
                  <Button
                    variant="ghost"
                    onClick={() => openCapture('milestone')}
                  >
                    Add milestone
                  </Button>
                }
              >
                <div className="record-stack">
                  {milestones.length === 0 ? (
                    <p className="body-copy">No milestones recorded yet.</p>
                  ) : null}
                  {milestones.map((milestone) => (
                    <article className="record-item" key={milestone.id}>
                      <div>
                        <strong>{milestone.title}</strong>
                        <p className="body-copy body-copy--small">
                          {milestone.description}
                        </p>
                        <p className="body-copy body-copy--small">
                          Due {formatDate(milestone.dueDate)} ·{' '}
                          {milestone.owner}
                        </p>
                      </div>
                      <div className="record-item__meta">
                        <Badge tone={statusTone(milestone.status)}>
                          {formatStatus(milestone.status)}
                        </Badge>
                        <Button
                          variant="ghost"
                          onClick={() => editMilestone(milestone.id)}
                        >
                          Edit
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </Card>
              <Card
                title={`Delivery actions (${actions.length})`}
                actions={
                  <Button variant="ghost" onClick={() => openCapture('action')}>
                    Add delivery action
                  </Button>
                }
              >
                <div className="record-stack">
                  {actions.length === 0 ? (
                    <p className="body-copy">
                      No delivery actions recorded yet.
                    </p>
                  ) : null}
                  {actions.map((action) => (
                    <article className="record-item" key={action.id}>
                      <div>
                        <strong>{action.title}</strong>
                        <p className="body-copy body-copy--small">
                          {action.description}
                        </p>
                        <p className="body-copy body-copy--small">
                          {action.owner} · Due {formatDate(action.dueDate)} ·{' '}
                          {action.dependencyIds.length} dependencies
                        </p>
                        {action.notes ? (
                          <p className="body-copy body-copy--small">
                            Notes: {action.notes}
                          </p>
                        ) : null}
                      </div>
                      <div className="record-item__meta">
                        <Badge tone={statusTone(action.status)}>
                          {formatStatus(action.status)}
                        </Badge>
                        <Button
                          variant="ghost"
                          onClick={() => editAction(action.id)}
                        >
                          Edit
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </Card>
            </section>

            <Card
              title={`Benefit measurement (${benefits.length})`}
              description="Expected value is a planned proposition; actual value is shown only when it has been measured."
              actions={
                <Button variant="ghost" onClick={() => openCapture('benefit')}>
                  Add benefit measure
                </Button>
              }
            >
              <div className="record-stack">
                {benefits.length === 0 ? (
                  <p className="body-copy">No benefit measures recorded yet.</p>
                ) : null}
                {benefits.map((benefit) => (
                  <article className="record-item" key={benefit.id}>
                    <div>
                      <strong>{benefit.measure}</strong>
                      <p className="body-copy body-copy--small">
                        Baseline: {benefit.baseline} · Target: {benefit.target}
                      </p>
                      <p className="body-copy body-copy--small">
                        Expected: {benefit.expectedValue}
                      </p>
                      <p className="body-copy body-copy--small">
                        Actual: {benefit.actualValue ?? 'Not measured'}
                      </p>
                      <p className="body-copy body-copy--small">
                        Unit: {benefit.unit} · Method:{' '}
                        {benefit.measurementMethod} · Owner:{' '}
                        {benefit.measurementOwner}
                      </p>
                      <p className="body-copy body-copy--small">
                        Measured: {formatDate(benefit.measurementDate)}
                      </p>
                    </div>
                    <div className="record-item__meta">
                      <Badge
                        tone={
                          benefit.status === 'validated' ? 'success' : 'warning'
                        }
                      >
                        {formatStatus(benefit.status)}
                      </Badge>
                      <Button
                        variant="ghost"
                        onClick={() => editBenefit(benefit.id)}
                      >
                        {benefit.actualValue
                          ? 'Edit measure'
                          : 'Record results'}
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </Card>

            <section className="content-grid content-grid--two">
              <Card title="Dependencies, prerequisites, and risks">
                <dl className="detail-list">
                  <dt>Dependencies</dt>
                  <dd>{initiative.dependencies ?? 'None recorded'}</dd>
                  <dt>Prerequisites</dt>
                  <dd>{initiative.prerequisites ?? 'None recorded'}</dd>
                  <dt>Risks</dt>
                  <dd>{initiative.risks ?? 'None recorded'}</dd>
                </dl>
              </Card>
              <Card
                title="Review and client boundary"
                description="Internal delivery notes stay in Fabric and are never used as client-facing output content automatically."
              >
                <dl className="detail-list">
                  <dt>Review status</dt>
                  <dd>{formatStatus(initiative.reviewStatus)}</dd>
                  <dt>Client-safe summary</dt>
                  <dd>
                    {initiative.clientSummary ??
                      'Not yet approved for client-facing use.'}
                  </dd>
                  <dt>Linked roadmap</dt>
                  <dd>
                    {roadmap?.title ?? 'Not yet sequenced into a roadmap'}
                  </dd>
                  <dt>Supporting findings</dt>
                  <dd>
                    {findings.length > 0
                      ? findings.map((finding) => finding.title).join('; ')
                      : 'No linked findings recorded'}
                  </dd>
                </dl>
              </Card>
            </section>
          </>
        );
      }}
    </FabricDataView>
  );
}
