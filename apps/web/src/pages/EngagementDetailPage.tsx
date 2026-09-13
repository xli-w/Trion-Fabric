import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge, Button, Card, PageHeader } from '@ui';
import { EngagementForm } from '@app/features/fabric-data/EntityForms';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';
import { buildEngagementCommandCentre } from '@app/features/fabric-data/selectors';
import { MethodologyProgression } from '@app/features/methodology/MethodologyProgression';

export function EngagementDetailPage() {
  const { engagementId } = useParams();
  const { canPerform } = useFabricData();
  const [editing, setEditing] = useState(false);

  return (
    <FabricDataView
      emptyTitle="Engagement cannot be loaded"
      loadingDescription="Loading the connected engagement command centre."
      loadingTitle="Loading engagement"
    >
      {(dataset) => {
        const commandCentre = engagementId
          ? buildEngagementCommandCentre(dataset, engagementId)
          : undefined;

        if (!commandCentre) {
          return (
            <>
              <PageHeader
                eyebrow="Engagement command centre"
                title="Engagement not found"
                description="The requested engagement is not available in the current workspace."
              />
              <Link className="table-link" to="/engagements">
                Return to engagements
              </Link>
            </>
          );
        }

        const { engagement } = commandCentre;
        const canEdit = canPerform('context:write', engagement.id);

        return (
          <>
            <PageHeader
              eyebrow="Engagement command centre"
              title={engagement.name}
              description={engagement.description}
              metadata={[
                engagement.type,
                engagement.status,
                `${engagement.stage} methodology stage`,
              ]}
              actions={
                <Button
                  disabled={!canEdit}
                  onClick={() => setEditing((value) => !value)}
                  title={
                    canEdit
                      ? 'Edit engagement'
                      : 'Your current role cannot edit this engagement.'
                  }
                  variant="ghost"
                >
                  {editing ? 'Close edit' : 'Edit engagement'}
                </Button>
              }
            />

            {!canEdit ? (
              <p className="access-note" role="status">
                Your current role can view this engagement but cannot change its
                context.
              </p>
            ) : null}

            {editing ? (
              <Card title="Edit engagement">
                <EngagementForm
                  key={engagement.id}
                  engagement={dataset.engagements.find(
                    (item) => item.id === engagement.id,
                  )}
                  onSaved={() => setEditing(false)}
                />
              </Card>
            ) : null}

            <section className="content-grid content-grid--two">
              <Card
                title="Engagement context"
                description="Scope, people, and operational context for the work in progress."
              >
                <dl className="detail-list">
                  <dt>Client</dt>
                  <dd>
                    {commandCentre.client ? (
                      <Link
                        className="table-link"
                        to={commandCentre.client.path}
                      >
                        {commandCentre.client.name}
                      </Link>
                    ) : (
                      'Unknown client'
                    )}
                  </dd>
                  <dt>Site coverage</dt>
                  <dd className="command-centre-link-list">
                    {commandCentre.sites.length > 0
                      ? commandCentre.sites.map((site) => (
                          <Link
                            className="table-link"
                            key={site.id}
                            to={site.path}
                          >
                            {site.name} ({site.location})
                          </Link>
                        ))
                      : 'No sites recorded'}
                  </dd>
                  <dt>Project lead</dt>
                  <dd>{commandCentre.lead}</dd>
                  <dt>Purpose</dt>
                  <dd>{engagement.purpose}</dd>
                  <dt>Scope</dt>
                  <dd>{engagement.scope}</dd>
                  <dt>Target date</dt>
                  <dd>{engagement.targetDate}</dd>
                </dl>
                <div className="command-centre-team">
                  <strong>Team</strong>
                  <ul>
                    {commandCentre.team.map((member) => (
                      <li key={member.id}>
                        <span>{member.name}</span>
                        <Badge tone={member.isLead ? 'accent' : 'neutral'}>
                          {member.isLead ? 'Engagement lead' : member.role}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              <Card
                title="Meaningful completion"
                description="Progress is based on explicit completion and review states, not estimated delivery percentage."
              >
                <div className="command-centre-progress">
                  {commandCentre.progress.map((item) => (
                    <div className="progress-item" key={item.label}>
                      <div className="progress-item__header">
                        <strong>{item.label}</strong>
                        <span>
                          {item.complete} / {item.total}
                        </span>
                      </div>
                      <progress
                        aria-label={`${item.label}: ${item.complete} of ${item.total}`}
                        max={item.total || 1}
                        value={item.complete}
                      />
                      <p className="body-copy body-copy--small">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="completion-summary">
                  {commandCentre.progressTotal > 0
                    ? `${commandCentre.progressComplete} of ${commandCentre.progressTotal} tracked completion signals are recorded.`
                    : 'No tracked completion signals have been recorded yet.'}
                </p>
              </Card>
            </section>

            <section className="content-grid">
              <MethodologyProgression
                engagementId={engagement.id}
                methodology={commandCentre.methodology}
              />
            </section>

            <section className="content-grid content-grid--two">
              <Card
                title="Site walks"
                description="Fieldwork connected to this engagement."
              >
                <div className="record-stack">
                  {commandCentre.siteWalks.length > 0 ? (
                    commandCentre.siteWalks.map((siteWalk) => (
                      <article className="record-item" key={siteWalk.id}>
                        <div>
                          <Link className="table-link" to={siteWalk.path}>
                            <strong>{siteWalk.title}</strong>
                          </Link>
                          <p className="body-copy body-copy--small">
                            {siteWalk.scheduledAt}
                          </p>
                        </div>
                        <Badge tone={siteWalk.statusTone}>
                          {siteWalk.status}
                        </Badge>
                      </article>
                    ))
                  ) : (
                    <p className="body-copy">
                      No site walks have been planned for this engagement.
                    </p>
                  )}
                </div>
              </Card>

              <Card
                title="Coverage and evidence"
                description="Areas and processes covered by fieldwork, with evidence retained at its explicit visibility state."
              >
                <div className="coverage-list">
                  <div>
                    <strong>Areas covered</strong>
                    <p className="body-copy">
                      {commandCentre.coverage.areas.length > 0
                        ? commandCentre.coverage.areas.join(', ')
                        : 'No areas recorded from completed or planned fieldwork.'}
                    </p>
                  </div>
                  <div>
                    <strong>Processes covered</strong>
                    <p className="body-copy">
                      {commandCentre.coverage.processes.length > 0
                        ? commandCentre.coverage.processes.join(', ')
                        : 'No processes recorded from completed or planned fieldwork.'}
                    </p>
                  </div>
                  <div className="coverage-list__counts">
                    <Badge tone="neutral">
                      {commandCentre.evidence.total} evidence items
                    </Badge>
                    <Badge tone="neutral">
                      {commandCentre.evidence.internal} internal
                    </Badge>
                    <Badge tone="warning">
                      {commandCentre.evidence.draftClientFacing} draft
                      client-facing
                    </Badge>
                    <Badge tone="success">
                      {commandCentre.evidence.approvedClientFacing} approved
                      client-facing
                    </Badge>
                  </div>
                </div>
              </Card>
            </section>

            <section className="content-grid content-grid--two">
              <Card
                title="Diagnostic completeness"
                description="Scorecard coverage remains separate from merely opening a diagnostic."
                actions={
                  <Link className="table-link" to="/diagnosis">
                    Open diagnosis
                  </Link>
                }
              >
                <div className="record-stack">
                  {commandCentre.diagnostics.length > 0 ? (
                    commandCentre.diagnostics.map((diagnostic) => (
                      <article className="record-item" key={diagnostic.id}>
                        <div>
                          <strong>{diagnostic.title}</strong>
                          <p className="body-copy body-copy--small">
                            {diagnostic.assessedDimensions} of{' '}
                            {diagnostic.possibleDimensions} dimensions have
                            assessment records.
                          </p>
                        </div>
                        <Badge tone={diagnostic.statusTone}>
                          {diagnostic.status}
                        </Badge>
                      </article>
                    ))
                  ) : (
                    <p className="body-copy">
                      No diagnostic has been started for this engagement.
                    </p>
                  )}
                </div>
              </Card>

              <Card
                title="Findings"
                description="Reviewed findings retain their links to evidence and diagnostic context."
                actions={
                  <Link className="table-link" to="/diagnosis">
                    View findings
                  </Link>
                }
              >
                <div className="record-stack">
                  {commandCentre.findings.length > 0 ? (
                    commandCentre.findings.map((finding) => (
                      <article className="record-item" key={finding.id}>
                        <div>
                          <strong>{finding.title}</strong>
                          <p className="body-copy body-copy--small">
                            {finding.reviewStatus} review
                          </p>
                        </div>
                        <Badge tone={finding.tone}>
                          {finding.significance}
                        </Badge>
                      </article>
                    ))
                  ) : (
                    <p className="body-copy">
                      No findings have been recorded for this engagement.
                    </p>
                  )}
                </div>
              </Card>
            </section>

            <section className="content-grid content-grid--two">
              <Card
                title="Priority opportunities"
                description="Evidence-linked opportunities that guide the next recommendation work."
                actions={
                  <Link className="table-link" to="/opportunities">
                    Open register
                  </Link>
                }
              >
                <div className="record-stack">
                  {commandCentre.priorityOpportunities.length > 0 ? (
                    commandCentre.priorityOpportunities.map((opportunity) => (
                      <article className="record-item" key={opportunity.id}>
                        <div>
                          <Link className="table-link" to={opportunity.path}>
                            <strong>{opportunity.title}</strong>
                          </Link>
                          <p className="body-copy body-copy--small">
                            {opportunity.status} - {opportunity.evidenceCount}{' '}
                            evidence links
                          </p>
                        </div>
                        <Badge tone={opportunity.tone}>
                          {opportunity.priority}
                        </Badge>
                      </article>
                    ))
                  ) : (
                    <p className="body-copy">
                      No opportunities have been recorded for this engagement.
                    </p>
                  )}
                </div>
              </Card>

              <Card
                title="Roadmap initiatives"
                description="Approved opportunity work sequenced into the transformation roadmap."
                actions={
                  <Link className="table-link" to="/roadmap">
                    Open roadmap
                  </Link>
                }
              >
                <div className="record-stack">
                  {commandCentre.initiatives.length > 0 ? (
                    commandCentre.initiatives.map((initiative) => (
                      <article className="record-item" key={initiative.id}>
                        <div>
                          <Link className="table-link" to={initiative.path}>
                            <strong>{initiative.title}</strong>
                          </Link>
                          <p className="body-copy body-copy--small">
                            {initiative.phase}
                          </p>
                        </div>
                        <Badge tone={initiative.statusTone}>
                          {initiative.status}
                        </Badge>
                      </article>
                    ))
                  ) : (
                    <p className="body-copy">
                      No roadmap initiatives have been sequenced yet.
                    </p>
                  )}
                </div>
              </Card>
            </section>

            <section className="content-grid content-grid--two">
              <Card
                title="Outputs and approval status"
                description="Controlled outputs remain independent of internal working notes."
                actions={
                  <Link className="table-link" to="/outputs">
                    Open outputs
                  </Link>
                }
              >
                <div className="record-stack">
                  {commandCentre.outputs.length > 0 ? (
                    commandCentre.outputs.map((output) => (
                      <article className="record-item" key={output.id}>
                        <div>
                          <Link className="table-link" to={output.path}>
                            <strong>{output.title}</strong>
                          </Link>
                          <p className="body-copy body-copy--small">
                            {output.visibility}
                          </p>
                        </div>
                        <Badge tone={output.statusTone}>{output.status}</Badge>
                      </article>
                    ))
                  ) : (
                    <p className="body-copy">
                      No controlled outputs have been created for this
                      engagement.
                    </p>
                  )}
                </div>
              </Card>

              <Card
                title="Outstanding actions"
                description="Open work connected to the engagement's opportunities and delivery initiatives."
              >
                <div className="record-stack">
                  {commandCentre.outstandingActions.length > 0 ? (
                    commandCentre.outstandingActions.map((action) => (
                      <article className="record-item" key={action.id}>
                        <div>
                          <Link className="table-link" to={action.path}>
                            <strong>{action.title}</strong>
                          </Link>
                          <p className="body-copy body-copy--small">
                            {action.owner} - due {action.dueDate}
                          </p>
                        </div>
                        <Badge tone={action.statusTone}>{action.status}</Badge>
                      </article>
                    ))
                  ) : (
                    <p className="body-copy">
                      No outstanding actions are linked to this engagement.
                    </p>
                  )}
                </div>
              </Card>
            </section>

            <Card
              title="Recent activity"
              description="A reusable, actor-attributed record of important engagement changes."
            >
              <div className="activity-feed">
                {commandCentre.recentActivity.length > 0 ? (
                  commandCentre.recentActivity.map((activity) => (
                    <article className="activity-feed__item" key={activity.id}>
                      <div>
                        <strong>{activity.summary}</strong>
                        <p className="body-copy body-copy--small">
                          {activity.actor} - {activity.when}
                        </p>
                      </div>
                      <Badge tone="neutral">
                        {activity.action} - {activity.entityType}
                      </Badge>
                    </article>
                  ))
                ) : (
                  <p className="body-copy">
                    No activity has been recorded for this engagement.
                  </p>
                )}
              </div>
            </Card>
          </>
        );
      }}
    </FabricDataView>
  );
}
