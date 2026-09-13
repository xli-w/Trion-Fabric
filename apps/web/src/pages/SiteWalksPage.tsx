import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge, Button, Card, DataTable, PageHeader, StatCard } from '@ui';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { EvidenceForm, FrictionForm, ObservationForm, SiteWalkForm } from '@app/features/site-walks/SiteWalkForms';
import { siteWalkSections } from '@app/features/site-walks/site-walk-prompts';
import { buildSiteWalksViewModel } from '@app/features/fabric-data/selectors';

export function SiteWalksPage() {
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  return <FabricDataView emptyTitle="Site walks cannot be loaded" loadingDescription="Loading structured site walk data and evidence capture status." loadingTitle="Loading site walks">
    {(dataset) => {
      const viewModel = buildSiteWalksViewModel(dataset);
      const rows = viewModel.rows.filter((row) => `${row.title} ${row.engagementName} ${row.siteName}`.toLowerCase().includes(query.toLowerCase()));
      return <><PageHeader eyebrow="Site Walks" title="Structured fieldwork" description="A flexible investigation workspace for preliminary walks and deeper diagnostic visits. Capture context, findings, evidence, friction, and next steps without turning the checklist into the product." metadata={['Fast capture', 'Traceable evidence', 'Review-ready']} actions={<Button onClick={() => setShowForm((value) => !value)}>{showForm ? 'Close form' : 'Plan site walk'}</Button>} />
        {showForm ? <Card title="Plan a site walk"><SiteWalkForm onSaved={() => setShowForm(false)} /></Card> : null}
        <section className="metric-grid metric-grid--compact"><StatCard detail="Completed walks with structured findings." label="Completed" tone="success" value={String(viewModel.completedCount)} /><StatCard detail="Planned or in-flight fieldwork." label="Upcoming" tone="warning" value={String(viewModel.upcomingCount)} /><StatCard detail="Observations attached to site walks." label="Observations" tone="accent" value={String(viewModel.observationCount)} /><StatCard detail="Friction items with indicative assumptions." label="Friction items" tone="neutral" value={String(dataset.frictionItems.length)} /></section>
        <Card title="Walk register" description="Open a walk to capture observations, evidence, friction estimates, and post-tour decisions."><input className="search-input" aria-label="Search site walks" placeholder="Search walks..." value={query} onChange={(event) => setQuery(event.target.value)} /><DataTable rows={rows} getRowKey={(row) => row.id} emptyState="No site walks match this search." columns={[
          { header: 'Walk', render: (row) => <div><Link className="table-link" to={`/site-walks/${row.id}`}><strong>{row.title}</strong></Link><div className="body-copy body-copy--small">{row.engagementName}</div></div>, width: '25%' },
          { header: 'Site / area', render: (row) => `${row.siteName} · ${row.areaName}` },
          { header: 'Consultant', render: (row) => row.consultantName },
          { header: 'Status', render: (row) => <Badge tone={row.statusTone}>{row.status}</Badge> },
          { header: 'Capture', render: (row) => `${row.scopeCount} scope · ${row.followUpCount} follow-up` },
          { header: 'Scheduled', render: (row) => row.scheduledAt },
        ]} /></Card>
      </>;
    }}
  </FabricDataView>;
}

export function SiteWalkWorkspacePage() {
  const { siteWalkId } = useParams();
  const [editing, setEditing] = useState(false);
  const [capture, setCapture] = useState<'observation' | 'evidence' | 'friction' | null>(null);
  return <FabricDataView emptyTitle="Site walk cannot be loaded" loadingDescription="Loading investigation workspace." loadingTitle="Loading site walk">{(loadedDataset) => {
    const walk = loadedDataset.siteWalks.find((item) => item.id === siteWalkId);
    if (!walk) return <p className="body-copy">Site walk not found.</p>;
    const observations = loadedDataset.observations.filter((item) => item.siteWalkId === walk.id);
    const evidence = loadedDataset.evidence.filter((item) => item.siteWalkId === walk.id || item.relatedEntityId === walk.id || observations.some((observation) => observation.id === item.relatedEntityId));
    const friction = loadedDataset.frictionItems.filter((item) => item.siteWalkId === walk.id);
    const site = loadedDataset.sites.find((item) => item.id === walk.siteId);
    const engagement = loadedDataset.engagements.find((item) => item.id === walk.engagementId);
    return <><PageHeader eyebrow="Investigation workspace" title={walk.title} description={`${site?.name ?? 'Unknown site'} · ${engagement?.name ?? 'Unknown engagement'}`} metadata={[walk.walkType, walk.status]} actions={<><Button variant="ghost" onClick={() => setEditing((value) => !value)}>{editing ? 'Close edit' : 'Edit walk'}</Button><Button onClick={() => setCapture('observation')}>Add observation</Button></>} />
      <div className="detail-badges"><Badge tone="accent">{walk.walkType}</Badge><Badge tone={walk.status === 'completed' ? 'success' : walk.status === 'needs-follow-up' ? 'warning' : 'neutral'}>{walk.status}</Badge></div>
      {editing ? <Card title="Walk context"><SiteWalkForm key={walk.updatedAt} walk={walk} onSaved={() => setEditing(false)} /></Card> : null}
      {capture === 'observation' ? <Card title="Capture observation" description="Record what is known, where it came from, and whether it has been verified."><ObservationForm siteWalkId={walk.id} onSaved={() => setCapture(null)} /></Card> : null}
      {capture === 'evidence' ? <Card title="Attach evidence" description="Use a safe file reference where storage is not yet configured."><EvidenceForm siteWalkId={walk.id} onSaved={() => setCapture(null)} /></Card> : null}
      {capture === 'friction' ? <Card title="Record friction or loss"><FrictionForm siteWalkId={walk.id} onSaved={() => setCapture(null)} /></Card> : null}
      <section className="content-grid content-grid--two"><Card title="Pre-tour briefing" description="Context and hypotheses remain separate from verified findings."><dl className="detail-list"><dt>Objectives</dt><dd>{walk.objectives ?? 'Not recorded'}</dd><dt>Business context</dt><dd>{walk.businessContext ?? 'Not recorded'}</dd><dt>People present</dt><dd>{walk.participants ?? 'Not recorded'}</dd><dt>Focus areas</dt><dd>{walk.focusAreas?.join(', ') ?? 'Not recorded'}</dd><dt>Candidate bottleneck</dt><dd>{walk.candidateBottleneck ?? 'Not recorded'}</dd></dl><div className="prompt-checklist">{siteWalkSections[0].prompts.map((prompt) => <span key={prompt}>□ {prompt}</span>)}</div></Card>
        <Card title="Guided investigation" description="Use prompts as a flexible framework; findings live in observations and evidence."><div className="prompt-section-list">{siteWalkSections.slice(1, 5).map((section) => <details key={section.key}><summary>{section.title}</summary><div className="prompt-list">{section.prompts.map((prompt) => <span key={prompt}>{prompt}</span>)}</div></details>)}</div></Card>
      </section>
      <Card title={`Observations (${observations.length})`} actions={<Button variant="ghost" onClick={() => setCapture('observation')}>Add observation</Button>}><div className="record-stack">{observations.map((observation) => <article className="record-item record-item--note" key={observation.id}><div><strong>{observation.title ?? observation.summary}</strong><p className="body-copy">{observation.description ?? observation.detail}</p><span className="record-item__meta">{observation.observationType ?? 'Uncategorised'} · {observation.source ?? observation.origin} · {observation.confidence ?? 'unrated'} confidence</span></div><Badge tone={observation.status === 'verified' ? 'success' : 'warning'}>{observation.status ?? observation.assurance}</Badge></article>)}</div></Card>
      <Card title={`Evidence (${evidence.length})`} actions={<Button variant="ghost" onClick={() => setCapture('evidence')}>Add evidence</Button>}><DataTable rows={evidence} getRowKey={(row) => row.id} emptyState="No evidence attached yet." columns={[{ header: 'Title', render: (row) => <strong>{row.title}</strong> }, { header: 'Type', render: (row) => row.evidenceType ?? row.kind }, { header: 'Source', render: (row) => row.source ?? row.origin }, { header: 'Review', render: (row) => <Badge tone={row.reviewStatus === 'verified' || row.approvalState === 'approved' ? 'success' : 'warning'}>{row.reviewStatus ?? row.approvalState}</Badge> }, { header: 'Reference', render: (row) => row.fileReference ?? 'No file reference' }]} /></Card>
      <Card title={`Friction and loss-aversion (${friction.length})`} description="All time, hours, and cost values are indicative until assumptions are validated." actions={<Button variant="ghost" onClick={() => setCapture('friction')}>Add friction</Button>}><DataTable rows={friction} getRowKey={(row) => row.id} emptyState="No friction items recorded yet." columns={[{ header: 'Station / line', render: (row) => row.stationOrLine }, { header: 'Friction', render: (row) => row.frictionPoint }, { header: 'Indicative impact', render: (row) => `${row.estimatedAnnualHours ?? '—'} hours · ${row.estimatedAnnualCostImpact ?? '—'}` }, { header: 'Confidence', render: (row) => row.confidence }, { header: 'Assumptions', render: (row) => row.assumptions ?? 'Required' }]} /></Card>
      <Card title="Post-tour recap" description="Close the loop with validation, ownership, and an explicit next step."><dl className="detail-list"><dt>Process summary</dt><dd>{walk.overallProcessSummary ?? 'Not recorded'}</dd><dt>Confirmed bottleneck</dt><dd>{walk.confirmedBottleneck ?? walk.candidateBottleneck ?? 'Not recorded'}</dd><dt>Agreed next step</dt><dd>{walk.agreedNextStep ?? 'Not recorded'}</dd><dt>Deeper diagnostic</dt><dd>{walk.recommendDiagnostic === undefined ? 'Not decided' : walk.recommendDiagnostic ? 'Recommended' : 'Not currently recommended'}</dd></dl><div className="prompt-list">{siteWalkSections[5].prompts.map((prompt) => <span key={prompt}>{prompt}</span>)}</div></Card>
    </>;
  }}</FabricDataView>;
}
