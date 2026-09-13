import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Download, FileJson, FileText, Plus, RefreshCw } from 'lucide-react';

import type {
  OutputExportAudience,
  OutputExportFormat,
  OutputStatus,
} from '@domain';
import {
  serializeOutputReportAsAiPackage,
  serializeOutputReportAsMarkdown,
} from '@domain';
import {
  Badge,
  Button,
  Card,
  DataTable,
  PageHeader,
  Sheet,
  StatCard,
} from '@ui';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';
import {
  CreateOutputForm,
  OutputDraftEditor,
} from '@app/features/outputs/OutputReportForms';
import { OutputReportPreview } from '@app/features/outputs/OutputReportPreview';
import { downloadTextReport } from '@app/features/outputs/report-download';
import {
  buildOutputReportWorkspace,
  buildOutputsViewModel,
} from '@app/features/fabric-data/selectors';

const coreDeliverableCount = 5;

const governanceNotes = [
  'Every report is a versioned projection of structured engagement records, never a disconnected document store.',
  'Draft and internal-review reports remain internal. Only approved source data can be included in a client-facing export.',
  'A published report snapshot is frozen. Updated source data is reflected through an explicit new draft version.',
  'Markdown supports readable manual output preparation; JSON provides an auditable, AI-ingestible report package.',
];

function reportStatusTone(status: OutputStatus) {
  if (status === 'approved' || status === 'published') {
    return 'success' as const;
  }
  if (status === 'internal-review') {
    return 'warning' as const;
  }
  return 'neutral' as const;
}

export function OutputsPage() {
  const navigate = useNavigate();
  const { canPerform, createOutput } = useFabricData();
  const [createSheetOpen, setCreateSheetOpen] = useState(false);

  return (
    <FabricDataView
      emptyTitle="Outputs cannot be loaded"
      loadingDescription="Loading controlled output states and report readiness."
      loadingTitle="Loading outputs"
    >
      {(dataset) => {
        const viewModel = buildOutputsViewModel(dataset);
        const creatableEngagements = dataset.engagements
          .filter((engagement) => canPerform('output:write', engagement.id))
          .map((engagement) => ({
            id: engagement.id,
            name: engagement.name,
          }));

        return (
          <>
            <PageHeader
              eyebrow="Transformation"
              title="Controlled delivery outputs"
              description="Build coherent, client-ready reports from the same approved diagnostic, landscape, opportunity, and roadmap records used across the engagement."
              metadata={[
                'Versioned report snapshots',
                'Approved source data',
                'Markdown and AI-ready JSON',
              ]}
              actions={
                creatableEngagements.length > 0 ? (
                  <Button onClick={() => setCreateSheetOpen(true)}>
                    <Plus size={15} /> Create report draft
                  </Button>
                ) : undefined
              }
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Approved or published report snapshots with approved source data."
                label="Ready to share"
                tone="success"
                value={String(viewModel.readyToShareCount)}
              />
              <StatCard
                detail="Outputs still in draft or internal-review states."
                label="Review queue"
                tone="warning"
                value={String(viewModel.reviewQueueCount)}
              />
              <StatCard
                detail="The five core diagnostic report types represented in the register."
                label="Core deliverables"
                tone="accent"
                value={`${viewModel.coreOutputCount} / ${coreDeliverableCount}`}
              />
            </section>

            <section className="content-grid content-grid--two">
              <Card
                title="Output register"
                description="Open a controlled report to inspect its approved source coverage, preview its snapshot, and prepare its next version."
              >
                <DataTable
                  columns={[
                    {
                      header: 'Output',
                      render: (row) => (
                        <div>
                          <Link
                            className="table-link"
                            to={`/outputs/${row.id}`}
                          >
                            <strong>{row.title}</strong>
                          </Link>
                          <div className="body-copy body-copy--small">
                            {row.engagementName}
                          </div>
                        </div>
                      ),
                      width: '24%',
                    },
                    {
                      header: 'Type',
                      render: (row) => row.outputType,
                    },
                    {
                      header: 'Status',
                      render: (row) => (
                        <Badge tone={row.statusTone}>{row.status}</Badge>
                      ),
                    },
                    {
                      header: 'Sources',
                      render: (row) => (
                        <span>
                          {row.includedSourceCount} approved / {row.sourceCount}
                        </span>
                      ),
                    },
                    {
                      header: 'Report state',
                      render: (row) =>
                        row.sourceDataChanged ? (
                          <Badge tone="warning">Refresh required</Badge>
                        ) : (
                          <Badge tone="success">Snapshot current</Badge>
                        ),
                    },
                    {
                      header: 'External sharing',
                      render: (row) =>
                        row.isReadyToShare ? (
                          <Badge tone="success">Ready</Badge>
                        ) : (
                          <Badge tone="neutral">Internal only</Badge>
                        ),
                    },
                  ]}
                  getRowKey={(row) => row.id}
                  rows={viewModel.rows}
                />
              </Card>

              <Card
                title="Report governance"
                description="The same controlled projection serves preview, manual report preparation, download, and structured AI intake."
              >
                <div className="record-stack">
                  {governanceNotes.map((note) => (
                    <article
                      className="record-item record-item--note"
                      key={note}
                    >
                      <p className="body-copy">{note}</p>
                    </article>
                  ))}
                </div>
              </Card>
            </section>

            <Sheet
              description="Select an engagement, a controlled report template, and the approved source records that support its first internal draft."
              eyebrow="Controlled report"
              onOpenChange={setCreateSheetOpen}
              open={createSheetOpen}
              size="lg"
              title="Create report draft"
            >
              <CreateOutputForm
                dataset={dataset}
                engagements={creatableEngagements}
                onCancel={() => setCreateSheetOpen(false)}
                onCreate={createOutput}
                onCreated={(output) => {
                  setCreateSheetOpen(false);
                  navigate(`/outputs/${output.id}`);
                }}
              />
            </Sheet>
          </>
        );
      }}
    </FabricDataView>
  );
}

export function OutputDetailPage() {
  const { outputId } = useParams();
  const navigate = useNavigate();
  const {
    canPerform,
    createOutputRevision,
    createOutputReviewComment,
    recordOutputExport,
    regenerateOutputReport,
    resolveOutputReviewComment,
    updateOutput,
  } = useFabricData();
  const [draftEditorOpen, setDraftEditorOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <FabricDataView
      emptyTitle="Output cannot be loaded"
      loadingDescription="Loading report snapshot, source provenance, and publication controls."
      loadingTitle="Loading output report"
    >
      {(dataset) => {
        if (!outputId) {
          return null;
        }

        const workspace = buildOutputReportWorkspace(dataset, outputId);
        if (!workspace) {
          return (
            <>
              <PageHeader
                eyebrow="Controlled output"
                title="Output not found"
                description="The requested controlled output is not available."
              />
              <Link className="text-link" to="/outputs">
                Return to outputs
              </Link>
            </>
          );
        }

        const {
          comparison,
          exports,
          openReviewCommentCount,
          output,
          previousOutput,
          report,
          reviewComments,
          sourceCatalog,
          sourceDataChanged,
          versionHistory,
        } = workspace;
        const canWriteOutput = canPerform('output:write', output.engagementId);
        const canEditDraft = output.status === 'draft' && canWriteOutput;
        const canSubmitForReview = canPerform(
          'output:submit-for-review',
          output.engagementId,
        );
        const canApprove = canPerform('output:approve', output.engagementId);
        const canPublish = canPerform('output:publish', output.engagementId);
        const canArchive = canPerform('output:archive', output.engagementId);
        const canComment =
          (output.status === 'draft' || output.status === 'internal-review') &&
          canPerform('output:comment', output.engagementId);
        const canExport =
          output.status !== 'archived' &&
          canPerform('output:export', output.engagementId);
        const canCreateRevision =
          (output.status === 'approved' || output.status === 'published') &&
          canWriteOutput;
        const selectedSources = sourceCatalog.filter(
          (source) => source.isSelected,
        );

        async function transitionTo(status: typeof output.status) {
          setTransitionError(null);
          setMessage(null);

          try {
            await updateOutput({ ...output, status });
            setMessage(`Output moved to ${status.replace(/-/g, ' ')}.`);
          } catch (caught) {
            setTransitionError(
              caught instanceof Error
                ? caught.message
                : 'Unable to update the controlled output.',
            );
          }
        }

        async function refreshDraft() {
          setTransitionError(null);
          setMessage(null);
          try {
            await regenerateOutputReport(output.id);
            setMessage(
              'Draft report regenerated from its current approved sources.',
            );
          } catch (caught) {
            setTransitionError(
              caught instanceof Error
                ? caught.message
                : 'Unable to regenerate the draft report.',
            );
          }
        }

        async function createRevision() {
          setTransitionError(null);
          setMessage(null);
          try {
            const revision = await createOutputRevision(output.id);
            setMessage(`Created draft version ${revision.version}.`);
            navigate(`/outputs/${revision.id}`);
          } catch (caught) {
            setTransitionError(
              caught instanceof Error
                ? caught.message
                : 'Unable to create a draft revision.',
            );
          }
        }

        async function submitReviewComment(event: FormEvent<HTMLFormElement>) {
          event.preventDefault();
          setTransitionError(null);
          setMessage(null);
          try {
            await createOutputReviewComment({
              outputId: output.id,
              body: reviewComment,
            });
            setReviewComment('');
            setMessage('Review comment added.');
          } catch (caught) {
            setTransitionError(
              caught instanceof Error
                ? caught.message
                : 'Unable to add the review comment.',
            );
          }
        }

        async function resolveComment(commentId: string) {
          setTransitionError(null);
          setMessage(null);
          try {
            await resolveOutputReviewComment(commentId);
            setMessage('Review comment resolved.');
          } catch (caught) {
            setTransitionError(
              caught instanceof Error
                ? caught.message
                : 'Unable to resolve the review comment.',
            );
          }
        }

        async function downloadReport(
          format: OutputExportFormat,
          audience: OutputExportAudience,
        ) {
          setTransitionError(null);
          setMessage(null);
          try {
            const exportReference = await recordOutputExport(
              output.id,
              format,
              audience,
            );
            const content =
              format === 'markdown'
                ? serializeOutputReportAsMarkdown(report)
                : serializeOutputReportAsAiPackage(report);
            downloadTextReport(
              content,
              exportReference.fileName,
              format === 'markdown' ? 'text/markdown' : 'application/json',
            );
            setMessage(
              `Downloaded ${audience === 'client-facing' ? 'client-facing' : 'internal review'} ${format.toUpperCase()} report package.`,
            );
          } catch (caught) {
            setTransitionError(
              caught instanceof Error
                ? caught.message
                : 'Unable to download the report.',
            );
          }
        }

        return (
          <>
            <PageHeader
              eyebrow="Controlled output report"
              title={output.title}
              description={workspace.template.description}
              metadata={[
                `${workspace.template.label} · v${output.version}`,
                output.status.replace(/-/g, ' '),
                sourceDataChanged
                  ? 'Source refresh required'
                  : 'Snapshot current',
              ]}
              actions={
                <div className="output-report-actions">
                  {canEditDraft ? (
                    <>
                      <Button
                        onClick={() => setDraftEditorOpen(true)}
                        variant="secondary"
                      >
                        Edit report draft
                      </Button>
                      <Button
                        onClick={() => void refreshDraft()}
                        variant="ghost"
                      >
                        <RefreshCw size={14} /> Regenerate
                      </Button>
                    </>
                  ) : null}
                  {canCreateRevision ? (
                    <Button
                      onClick={() => void createRevision()}
                      variant="secondary"
                    >
                      <Plus size={14} /> New draft version
                    </Button>
                  ) : null}
                </div>
              }
            />

            {message ? (
              <p className="form-success" role="status">
                {message}
              </p>
            ) : null}
            {transitionError ? (
              <p className="form-error" role="alert">
                {transitionError}
              </p>
            ) : null}

            {sourceDataChanged ? (
              <section className="output-report-stale" role="status">
                <strong>
                  Source data has changed since this report snapshot.
                </strong>
                <span>
                  {output.status === 'draft'
                    ? 'Regenerate this draft after checking the source selection.'
                    : 'This approved report remains frozen. Create a new draft version to use the updated source data.'}
                </span>
              </section>
            ) : null}

            <section className="content-grid content-grid--two">
              <Card
                actions={
                  <div className="output-transition-actions">
                    {output.status === 'draft' && canSubmitForReview ? (
                      <Button
                        onClick={() => void transitionTo('internal-review')}
                        variant="secondary"
                      >
                        Submit for review
                      </Button>
                    ) : null}
                    {output.status === 'internal-review' && canWriteOutput ? (
                      <Button
                        onClick={() => void transitionTo('draft')}
                        variant="ghost"
                      >
                        Return to draft
                      </Button>
                    ) : null}
                    {output.status === 'internal-review' && canApprove ? (
                      <Button onClick={() => void transitionTo('approved')}>
                        Approve output
                      </Button>
                    ) : null}
                    {output.status === 'approved' && canPublish ? (
                      <Button onClick={() => void transitionTo('published')}>
                        Publish output
                      </Button>
                    ) : null}
                    {output.status !== 'archived' && canArchive ? (
                      <Button
                        onClick={() => void transitionTo('archived')}
                        variant="ghost"
                      >
                        Archive output
                      </Button>
                    ) : null}
                  </div>
                }
                title="Publication governance"
              >
                <dl className="detail-list">
                  <dt>Status</dt>
                  <dd>
                    <Badge tone={reportStatusTone(output.status)}>
                      {output.status.replace(/-/g, ' ')}
                    </Badge>
                  </dd>
                  <dt>Visibility</dt>
                  <dd>{output.visibility.replace(/-/g, ' ')}</dd>
                  <dt>Template</dt>
                  <dd>
                    {workspace.template.label} · {output.templateVersion}
                  </dd>
                  <dt>Snapshot</dt>
                  <dd>{report.snapshot.generatedAt}</dd>
                  <dt>Open review comments</dt>
                  <dd>{openReviewCommentCount}</dd>
                </dl>
              </Card>

              <Card
                title="Download and AI intake"
                description="Downloads use the same frozen report snapshot shown in the preview and are recorded as export references."
              >
                {canExport ? (
                  <div className="output-download-actions">
                    {report.clientReady ? (
                      <>
                        <Button
                          onClick={() =>
                            void downloadReport('markdown', 'client-facing')
                          }
                          variant="secondary"
                        >
                          <FileText size={14} /> Download report (.md)
                        </Button>
                        <Button
                          onClick={() =>
                            void downloadReport('json', 'client-facing')
                          }
                          variant="secondary"
                        >
                          <FileJson size={14} /> Download AI package (.json)
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() =>
                          void downloadReport('json', 'internal-review')
                        }
                        variant="secondary"
                      >
                        <Download size={14} /> Download internal review package
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="body-copy body-copy--small">
                    Your role cannot export this report.
                  </p>
                )}
                {!report.clientReady ? (
                  <p className="body-copy body-copy--small">
                    Client-facing downloads remain unavailable until the output,
                    its source selection, and its report snapshot are approved.
                  </p>
                ) : null}
              </Card>
            </section>

            <Card
              title="Report preview"
              description="A structured preview for manual client-output preparation. It deliberately excludes raw notes, unverified assumptions, and source records outside the approved selection."
            >
              <OutputReportPreview report={report} showInternalAudit />
            </Card>

            <section className="content-grid content-grid--two">
              <Card
                title={`Selected sources (${selectedSources.length})`}
                description="Only records marked client-safe become report content. Selected internal records stay visible here only as exclusions with an explicit reason."
              >
                <div className="record-stack">
                  {selectedSources.map((source) => (
                    <article className="record-item" key={source.id}>
                      <div>
                        <strong>{source.title}</strong>
                        <p className="body-copy body-copy--small">
                          {source.type.replace(/-/g, ' ')}
                        </p>
                        {!source.isClientSafe ? (
                          <p className="body-copy body-copy--small">
                            Excluded: {source.exclusionReason}
                          </p>
                        ) : null}
                      </div>
                      <Badge tone={source.isClientSafe ? 'success' : 'warning'}>
                        {source.isClientSafe ? 'Included' : 'Excluded'}
                      </Badge>
                    </article>
                  ))}
                </div>
              </Card>

              <Card
                title={`Review discussion (${reviewComments.length})`}
                description="Open review comments must be resolved before a reviewer can approve the report."
              >
                <div className="record-stack">
                  {reviewComments.length === 0 ? (
                    <p className="body-copy body-copy--small">
                      No review comments have been added.
                    </p>
                  ) : (
                    reviewComments.map((comment) => (
                      <article className="record-item" key={comment.id}>
                        <div>
                          <strong>{comment.authorName}</strong>
                          <p className="body-copy">{comment.body}</p>
                          <p className="body-copy body-copy--small">
                            {comment.createdAtLabel}
                            {comment.resolvedAtLabel
                              ? ` · Resolved by ${comment.resolvedByName} on ${comment.resolvedAtLabel}`
                              : ''}
                          </p>
                        </div>
                        <div className="output-review-comment__actions">
                          <Badge
                            tone={
                              comment.status === 'resolved'
                                ? 'success'
                                : 'warning'
                            }
                          >
                            {comment.status}
                          </Badge>
                          {comment.status === 'open' && canComment ? (
                            <Button
                              onClick={() => void resolveComment(comment.id)}
                              variant="ghost"
                            >
                              Resolve
                            </Button>
                          ) : null}
                        </div>
                      </article>
                    ))
                  )}
                </div>
                {canComment ? (
                  <form
                    className="output-review-comment-form"
                    onSubmit={(event) => void submitReviewComment(event)}
                  >
                    <label>
                      <span>Add internal review comment</span>
                      <textarea
                        onChange={(event) =>
                          setReviewComment(event.target.value)
                        }
                        placeholder="State the change or decision needed before approval..."
                        required
                        rows={3}
                        value={reviewComment}
                      />
                    </label>
                    <Button type="submit" variant="secondary">
                      Add comment
                    </Button>
                  </form>
                ) : null}
              </Card>
            </section>

            <section className="content-grid content-grid--two">
              <Card
                title="Version history"
                description="Each new source-driven report is a separate draft version; approved or published versions remain preserved."
              >
                <div className="record-stack">
                  {versionHistory.map((version) => (
                    <article className="record-item" key={version.id}>
                      <div>
                        <strong>
                          Version {version.version}
                          {version.isCurrent ? ' · Current' : ''}
                        </strong>
                        <p className="body-copy body-copy--small">
                          {version.status}
                        </p>
                      </div>
                      {version.isCurrent ? (
                        <Badge tone="accent">Viewing</Badge>
                      ) : (
                        <Link className="table-link" to={version.path}>
                          Compare source
                        </Link>
                      )}
                    </article>
                  ))}
                </div>
              </Card>

              <Card
                title={
                  previousOutput
                    ? `Changes from v${previousOutput.version}`
                    : 'Version comparison'
                }
                description="Comparison is calculated from retained report snapshots, not from live source data."
              >
                {comparison ? (
                  <div className="record-stack">
                    <p className="body-copy">
                      {comparison.changedSections.length === 0
                        ? 'No section content changes are recorded between these report versions.'
                        : `${comparison.changedSections.length} section changes are recorded between v${comparison.previousVersion} and v${comparison.currentVersion}.`}
                    </p>
                    {comparison.changedSections.map((section) => (
                      <article
                        className="record-item record-item--note"
                        key={section.sectionId}
                      >
                        <strong>{section.title}</strong>
                        <span>{section.change}</span>
                      </article>
                    ))}
                    {comparison.sourceReferencesChanged ? (
                      <p className="body-copy body-copy--small">
                        The selected source record set also changed.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="body-copy body-copy--small">
                    This is the first retained version of the report.
                  </p>
                )}
              </Card>
            </section>

            <Card
              title={`Export references (${exports.length})`}
              description="Export records retain the format, audience, version, source fingerprint, and internal user responsible for each generated file."
            >
              {exports.length === 0 ? (
                <p className="body-copy body-copy--small">
                  No report exports have been recorded.
                </p>
              ) : (
                <DataTable
                  columns={[
                    { header: 'File', render: (row) => row.fileName },
                    { header: 'Format', render: (row) => row.format },
                    { header: 'Audience', render: (row) => row.audience },
                    {
                      header: 'Exported by',
                      render: (row) => row.exportedByName,
                    },
                    {
                      header: 'Exported at',
                      render: (row) => row.exportedAtLabel,
                    },
                  ]}
                  getRowKey={(row) => row.id}
                  rows={exports}
                />
              )}
            </Card>

            <Sheet
              description="Select approved sources and add editorial narrative. Saving regenerates only this internal draft report snapshot."
              eyebrow="Internal report draft"
              onOpenChange={setDraftEditorOpen}
              open={draftEditorOpen}
              size="lg"
              title={`Edit ${output.title}`}
            >
              <OutputDraftEditor
                onCancel={() => setDraftEditorOpen(false)}
                onSave={async (nextOutput) => {
                  await updateOutput(nextOutput);
                  setDraftEditorOpen(false);
                  setMessage('Draft report saved and regenerated.');
                }}
                output={output}
                sources={sourceCatalog}
              />
            </Sheet>
          </>
        );
      }}
    </FabricDataView>
  );
}
