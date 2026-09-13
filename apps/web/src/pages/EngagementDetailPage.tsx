import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge, Button, Card, PageHeader } from '@ui';
import { EngagementForm } from '@app/features/fabric-data/EntityForms';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';

export function EngagementDetailPage() {
  const { engagementId } = useParams();
  const { dataset } = useFabricData();
  const engagement = dataset?.engagements.find((item) => item.id === engagementId);
  const [editing, setEditing] = useState(false);
  if (!engagement) return <p className="body-copy">Engagement not found.</p>;
  const client = dataset?.clients.find((item) => item.id === engagement.clientId);
  const sites = dataset?.sites.filter((site) => engagement.siteIds.includes(site.id)) ?? [];
  const lead = dataset?.users.find((user) => user.id === engagement.leadUserId);
  return <FabricDataView emptyTitle="Engagement cannot be loaded" loadingDescription="Loading engagement workspace." loadingTitle="Loading engagement">{() => <><PageHeader eyebrow="Engagement detail" title={engagement.name} description={engagement.description} metadata={[engagement.type, client?.name ?? 'Unknown client']} actions={<Button variant="ghost" onClick={() => setEditing((value) => !value)}>{editing ? 'Close edit' : 'Edit engagement'}</Button>} />
    <div className="detail-badges"><Badge tone="accent">{engagement.stage}</Badge><Badge tone={engagement.status === 'active' ? 'success' : engagement.status === 'at-risk' ? 'warning' : 'neutral'}>{engagement.status}</Badge></div>
    {editing ? <Card title="Edit engagement"><EngagementForm key={engagement.updatedAt} engagement={engagement} onSaved={() => setEditing(false)} /></Card> : null}
    <section className="content-grid content-grid--two"><Card title="Engagement brief"><dl className="detail-list"><dt>Project lead</dt><dd>{lead?.displayName ?? 'Unknown'}</dd><dt>Dates</dt><dd>{engagement.startDate.slice(0, 10)} → {engagement.targetDate?.slice(0, 10) ?? 'TBC'}</dd><dt>Objectives</dt><dd>{engagement.objectives ?? 'Not recorded'}</dd><dt>Scope</dt><dd>{engagement.scope ?? 'Not recorded'}</dd><dt>Commercial context</dt><dd>{engagement.commercialContext ?? 'Not recorded'}</dd><dt>Internal notes</dt><dd>{engagement.internalNotes ?? 'None'}</dd></dl></Card><Card title="Sites and downstream work"><div className="record-stack">{sites.map((site) => <Link className="record-item table-link" key={site.id} to={`/sites/${site.id}`}>{site.name}<span>{site.location}</span></Link>)}<strong>Workspace modules</strong><span className="body-copy">Site walks · Diagnostic · Observations · Evidence · Landscape · Findings · Opportunities · Roadmap · Outputs</span></div></Card></section>
  </>}</FabricDataView>;
}
