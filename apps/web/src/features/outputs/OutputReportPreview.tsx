import type { OutputReport, OutputReportBlock } from '@domain';

function ReportBlock({ block }: { block: OutputReportBlock }) {
  if (block.type === 'paragraph') {
    return <p className="body-copy">{block.content}</p>;
  }

  if (block.type === 'bullet-list') {
    return (
      <ul className="output-report__bullets">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === 'callout') {
    return (
      <p
        className={`output-report__callout output-report__callout--${block.tone}`}
      >
        {block.content}
      </p>
    );
  }

  return (
    <div className="output-report__table-wrap">
      <table className="output-report__table">
        <thead>
          <tr>
            {block.columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={`${row.join('-')}-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface OutputReportPreviewProps {
  report: OutputReport;
  showInternalAudit?: boolean;
}

export function OutputReportPreview({
  report,
  showInternalAudit = false,
}: OutputReportPreviewProps) {
  const { context, generatedAt, includedSources, excludedSources, sections } =
    report.snapshot;

  return (
    <article
      aria-label={`${report.output.title} report preview`}
      className="output-report"
    >
      <header className="output-report__header">
        <div>
          <p className="eyebrow">Controlled report preview</p>
          <h2>{report.output.title}</h2>
          <p className="body-copy">
            {context.clientName} · {context.engagementName}
          </p>
        </div>
        <dl className="output-report__metadata">
          <div>
            <dt>Version</dt>
            <dd>{report.output.version}</dd>
          </div>
          <div>
            <dt>Generated</dt>
            <dd>
              {new Intl.DateTimeFormat('en-GB').format(new Date(generatedAt))}
            </dd>
          </div>
          <div>
            <dt>Approved sources</dt>
            <dd>{includedSources.length}</dd>
          </div>
        </dl>
      </header>

      <div className="output-report__sections">
        {sections.map((section) => (
          <section className="output-report__section" key={section.id}>
            <div className="output-report__section-heading">
              <h3>{section.title}</h3>
              {section.editable ? (
                <span className="output-report__editorial-label">
                  Editorial narrative enabled
                </span>
              ) : null}
            </div>
            {section.description ? (
              <p className="output-report__section-description">
                {section.description}
              </p>
            ) : null}
            <div className="output-report__blocks">
              {section.blocks.map((block, index) => (
                <ReportBlock
                  block={block}
                  key={`${section.id}-${block.type}-${index}`}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {showInternalAudit ? (
        <footer className="output-report__audit">
          <strong>Internal source audit</strong>
          <p className="body-copy body-copy--small">
            {includedSources.length} approved sources included.{' '}
            {excludedSources.length} selected source
            {excludedSources.length === 1 ? ' is' : 's are'} excluded from the
            report.
          </p>
          {excludedSources.length > 0 ? (
            <ul className="output-report__exclusions">
              {excludedSources.map((source) => (
                <li key={source.sourceId}>
                  <code>{source.sourceId}</code>: {source.reason}
                </li>
              ))}
            </ul>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}
