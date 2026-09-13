import { useState } from 'react';

import type {
  EntityId,
  InternalEngagementContext,
  MethodologyLinkedDomain,
} from '@domain';
import { Badge, Button, Card } from '@ui';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';

type MethodologyAction =
  | { kind: 'skip'; activityId: EntityId; activityName: string }
  | { kind: 'reopen'; activityId: EntityId; activityName: string }
  | { kind: 'pause'; runId: EntityId; runName: string };

interface MethodologyProgressionProps {
  engagementId: EntityId;
  methodology: InternalEngagementContext['methodology'] | undefined;
}

function labelise(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function stageTone(
  stage: NonNullable<
    InternalEngagementContext['methodology']['runs'][number]['progress']
  >['stages'][number],
) {
  if (stage.meaningfulComplete) {
    return 'success' as const;
  }
  if (stage.weaklySupported) {
    return 'warning' as const;
  }
  return stage.status === 'in-progress' ? ('accent' as const) : ('neutral' as const);
}

function activityTone(status: string) {
  if (status === 'completed') {
    return 'success' as const;
  }
  if (status === 'skipped') {
    return 'warning' as const;
  }
  return status === 'in-progress' ? ('accent' as const) : ('neutral' as const);
}

function linkedDomainLabel(
  linkedDomain: MethodologyLinkedDomain | undefined,
  count: number,
) {
  const labels: Record<MethodologyLinkedDomain, [string, string]> = {
    engagement: ['engagement', 'engagements'],
    site: ['site', 'sites'],
    area: ['area', 'areas'],
    process: ['process', 'processes'],
    system: ['system', 'systems'],
    'data-object': ['data object', 'data objects'],
    role: ['role', 'roles'],
    'site-walk': ['site walk', 'site walks'],
    observation: ['observation', 'observations'],
    evidence: ['evidence item', 'evidence items'],
    'friction-item': ['friction item', 'friction items'],
    diagnostic: ['diagnostic', 'diagnostics'],
    assessment: ['assessment', 'assessments'],
    finding: ['finding', 'findings'],
    opportunity: ['opportunity', 'opportunities'],
    initiative: ['initiative', 'initiatives'],
    output: ['output', 'outputs'],
    action: ['action', 'actions'],
  };
  const label = linkedDomain ? labels[linkedDomain] : ['record', 'records'];

  return label[count === 1 ? 0 : 1];
}

export function MethodologyProgression({
  engagementId,
  methodology,
}: MethodologyProgressionProps) {
  const {
    canPerform,
    completeMethodologyActivity,
    skipMethodologyActivity,
    reopenMethodologyActivity,
    pauseMethodologyRun,
    resumeMethodologyRun,
  } = useFabricData();
  const [pendingAction, setPendingAction] = useState<MethodologyAction | null>(
    null,
  );
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const canManageRun = canPerform('context:write', engagementId);
  const canUpdateActivities = canPerform('methodology:write', engagementId);

  async function complete(activityId: EntityId) {
    setError(null);
    try {
      await completeMethodologyActivity(activityId);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to complete the methodology activity.',
      );
    }
  }

  async function resume(runId: EntityId) {
    setError(null);
    try {
      await resumeMethodologyRun(runId);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to resume the methodology run.',
      );
    }
  }

  async function submitReason(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pendingAction) {
      return;
    }

    setError(null);
    try {
      if (pendingAction.kind === 'skip') {
        await skipMethodologyActivity(pendingAction.activityId, reason);
      } else if (pendingAction.kind === 'reopen') {
        await reopenMethodologyActivity(pendingAction.activityId, reason);
      } else {
        await pauseMethodologyRun(pendingAction.runId, reason);
      }
      setPendingAction(null);
      setReason('');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to update methodology progress.',
      );
    }
  }

  function requestAction(action: MethodologyAction) {
    setError(null);
    setReason('');
    setPendingAction(action);
  }

  if (!methodology || methodology.runs.length === 0) {
    return (
      <Card
        title="Methodology progression"
        description="No methodology template has been assigned to this engagement."
      >
        <p className="body-copy">
          Create a Preliminary Site Walk or Digital Diagnostic from an active
          template to guide the work without replacing professional judgement.
        </p>
      </Card>
    );
  }

  return (
    <Card
      title="Methodology progression"
      description="Checklist activity is visible, but completion also needs sufficient connected evidence and working records."
    >
      <div className="methodology-progressions">
        {methodology.runs.map((runEntry) => {
          const { progress, status } = runEntry;
          const isActiveRun = runEntry.id === methodology.activeRunId;

          if (!progress) {
            return (
              <article className="methodology-run" key={runEntry.id}>
                <div className="methodology-run__header">
                  <div>
                    <strong>{runEntry.templateName}</strong>
                    <p className="body-copy body-copy--small">
                      Version {runEntry.templateVersion}
                    </p>
                  </div>
                  <Badge tone="neutral">{labelise(status)}</Badge>
                </div>
                <p className="body-copy body-copy--small">
                  This historical template is unavailable for progress
                  calculation.
                </p>
              </article>
            );
          }

          const canAdvance =
            canUpdateActivities && progress.run.status === 'active';
          const canReopen =
            canUpdateActivities &&
            progress.run.status !== 'paused' &&
            progress.run.status !== 'promoted';

          return (
            <article
              className="methodology-run"
              data-active={isActiveRun || undefined}
              key={runEntry.id}
            >
              <div className="methodology-run__header">
                <div>
                  <strong>{progress.template.name}</strong>
                  <p className="body-copy body-copy--small">
                    Version {progress.template.version} - {progress.template.description}
                  </p>
                </div>
                <Badge
                  tone={
                    progress.run.status === 'active'
                      ? 'accent'
                      : progress.run.status === 'completed'
                        ? 'success'
                        : 'neutral'
                  }
                >
                  {labelise(progress.run.status)}
                </Badge>
              </div>

              <div className="methodology-run__summary">
                <span>
                  {progress.completedRequiredActivityCount} /{' '}
                  {progress.requiredActivityCount} required activities recorded
                </span>
                <span>
                  {progress.meaningfulStageCount} / {progress.totalStageCount}{' '}
                  stages meaningfully complete
                </span>
              </div>
              {progress.run.status === 'completed' &&
              progress.meaningfulStageCount < progress.totalStageCount ? (
                <p className="body-copy body-copy--small">
                  Required stages are complete; remaining optional stages are
                  retained as documented professional-judgement decisions.
                </p>
              ) : null}

              {progress.run.status === 'active' && canManageRun ? (
                <div className="methodology-run__actions">
                  <Button
                    onClick={() =>
                      requestAction({
                        kind: 'pause',
                        runId: progress.run.id,
                        runName: progress.template.name,
                      })
                    }
                    variant="secondary"
                  >
                    Pause methodology
                  </Button>
                </div>
              ) : null}
              {progress.run.status === 'paused' ? (
                <div className="methodology-paused">
                  <p className="body-copy body-copy--small">
                    Paused: {progress.run.pausedReason}
                  </p>
                  {canManageRun ? (
                    <Button
                      onClick={() => void resume(progress.run.id)}
                      variant="secondary"
                    >
                      Resume methodology
                    </Button>
                  ) : null}
                </div>
              ) : null}

              <div className="methodology-stage-list">
                {progress.stages.map((stage) => (
                  <section className="methodology-stage" key={stage.stage.id}>
                    <div className="methodology-stage__header">
                      <div>
                        <strong>
                          {stage.stage.order}. {stage.stage.name}
                        </strong>
                        <p className="body-copy body-copy--small">
                          {stage.stage.description}
                        </p>
                      </div>
                      <Badge tone={stageTone(stage)}>
                        {stage.meaningfulComplete
                          ? 'Meaningfully complete'
                          : stage.weaklySupported
                            ? 'Needs supporting records'
                            : labelise(stage.status)}
                      </Badge>
                    </div>

                    <div className="methodology-stage__coverage">
                      <span>
                        {stage.requiredActivityCount > 0
                          ? `Checklist: ${stage.completedRequiredActivityCount} / ${stage.requiredActivityCount} required`
                          : `Checklist: ${stage.activities.filter((activity) => activity.isChecklistComplete).length} / ${stage.activities.length} optional`}
                      </span>
                      {stage.rules.map((rule) => (
                        <span
                          data-satisfied={rule.isSatisfied || undefined}
                          key={rule.rule.id}
                        >
                          {rule.actualCount !== undefined
                            ? `${rule.actualCount} linked ${linkedDomainLabel(rule.rule.linkedDomain, rule.actualCount)}`
                            : rule.rule.description}
                        </span>
                      ))}
                    </div>

                    {stage.weaklySupported ? (
                      <p className="methodology-warning" role="status">
                        Required prompts are recorded, but the completion rules
                        still need stronger connected evidence or records.
                      </p>
                    ) : null}

                    <div className="methodology-activity-list">
                      {stage.activities.map((activityProgress) => {
                        const state = activityProgress.state;
                        const isReopenable =
                          activityProgress.status === 'completed' ||
                          activityProgress.status === 'skipped';
                        return (
                          <article
                            className="methodology-activity"
                            key={activityProgress.activity.id}
                          >
                            <div className="methodology-activity__main">
                              <div className="methodology-activity__heading">
                                <strong>{activityProgress.activity.name}</strong>
                                <Badge tone={activityTone(activityProgress.status)}>
                                  {labelise(activityProgress.status)}
                                </Badge>
                              </div>
                              <p className="body-copy body-copy--small">
                                {activityProgress.activity.requirement ===
                                'required'
                                  ? 'Required'
                                  : 'Optional'}{' '}
                                - {activityProgress.supportingRecordCount}{' '}
                                linked{' '}
                                {linkedDomainLabel(
                                  activityProgress.activity.linkedDomain,
                                  activityProgress.supportingRecordCount,
                                )}
                              </p>
                              {state?.skipReason ? (
                                <p className="body-copy body-copy--small">
                                  Skipped: {state.skipReason}
                                </p>
                              ) : null}
                              {state?.reopenReason ? (
                                <p className="body-copy body-copy--small">
                                  Reopened: {state.reopenReason}
                                </p>
                              ) : null}
                            </div>
                            <div className="methodology-activity__actions">
                              {canAdvance &&
                              state &&
                              activityProgress.status !== 'completed' &&
                              activityProgress.status !== 'skipped' ? (
                                <Button
                                  onClick={() =>
                                    void complete(state.id)
                                  }
                                  variant="secondary"
                                >
                                  Complete
                                </Button>
                              ) : null}
                              {canAdvance &&
                              state &&
                              activityProgress.activity.requirement ===
                                'optional' &&
                              activityProgress.status !== 'completed' &&
                              activityProgress.status !== 'skipped' ? (
                                <Button
                                  onClick={() =>
                                    requestAction({
                                      kind: 'skip',
                                      activityId: state.id,
                                      activityName:
                                        activityProgress.activity.name,
                                    })
                                  }
                                  variant="ghost"
                                >
                                  Skip
                                </Button>
                              ) : null}
                              {canReopen && isReopenable && state ? (
                                <Button
                                  onClick={() =>
                                    requestAction({
                                      kind: 'reopen',
                                      activityId: state.id,
                                      activityName:
                                        activityProgress.activity.name,
                                    })
                                  }
                                  variant="ghost"
                                >
                                  Reopen
                                </Button>
                              ) : null}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      {pendingAction ? (
        <form className="methodology-action-form" onSubmit={submitReason}>
          <label className="form-field">
            <span>
              {pendingAction.kind === 'pause'
                ? `Why pause ${pendingAction.runName}?`
                : pendingAction.kind === 'skip'
                  ? `Why skip ${pendingAction.activityName}?`
                  : `Why reopen ${pendingAction.activityName}?`}
            </span>
            <textarea
              autoFocus
              onChange={(event) => setReason(event.target.value)}
              required
              rows={2}
              value={reason}
            />
          </label>
          <div className="methodology-action-form__actions">
            <Button type="submit">
              {pendingAction.kind === 'pause'
                ? 'Pause'
                : pendingAction.kind === 'skip'
                  ? 'Skip activity'
                  : 'Reopen activity'}
            </Button>
            <Button
              onClick={() => setPendingAction(null)}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {error ? (
        <p className="form-error methodology-error" role="alert">
          {error}
        </p>
      ) : null}
    </Card>
  );
}
