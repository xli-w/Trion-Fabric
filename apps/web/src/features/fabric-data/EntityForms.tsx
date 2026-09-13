import { useState } from 'react';

import type { Client, ClientStatus, Engagement, EngagementStatus, EngagementType, Site, SiteStatus, TransformationStage, User } from '@domain';
import { Button } from '@ui';

import { useFabricData } from './FabricDataContext';

const clientStatuses: ClientStatus[] = ['prospect', 'active', 'dormant'];
const siteStatuses: SiteStatus[] = ['planned', 'active', 'inactive'];
const engagementStatuses: EngagementStatus[] = ['planned', 'active', 'at-risk', 'completed'];
const stages: TransformationStage[] = ['discover', 'diagnose', 'design', 'deliver', 'measure'];
const engagementTypes: EngagementType[] = [
  'Preliminary Site Walk',
  'Digital Diagnostic',
  'Operational Improvement',
  'Systems / ERP Review',
  'Data / Reporting Improvement',
  'Automation Sprint',
  'Transformation Programme',
  'Advisory / Discovery',
];

function optional(value: string): string | undefined {
  return value.trim() || undefined;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="form-field"><span>{label}</span>{children}</label>;
}

function FormShell({ children, error, onSubmit }: { children: React.ReactNode; error: string | null; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <form className="entity-form" onSubmit={onSubmit}>{children}{error ? <p className="form-error" role="alert">{error}</p> : null}<Button type="submit">Save</Button></form>;
}

export function ClientForm({ client, onSaved }: { client?: Client; onSaved?: (client: Client) => void }) {
  const { createClient, updateClient } = useFabricData();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(client?.name ?? '');
  const [industry, setIndustry] = useState(client?.industry ?? '');
  const [status, setStatus] = useState<ClientStatus>(client?.status ?? 'prospect');
  const [companySize, setCompanySize] = useState(client?.companySize ?? '');
  const [description, setDescription] = useState(client?.description ?? '');
  const [primaryContact, setPrimaryContact] = useState(client?.primaryContact ?? '');
  const [contactDetails, setContactDetails] = useState(client?.contactDetails ?? '');
  const [notes, setNotes] = useState(client?.notes ?? '');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const input = { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), industry, status, companySize: optional(companySize), description: optional(description), primaryContact: optional(primaryContact), contactDetails: optional(contactDetails), notes: optional(notes) };
      const saved = client ? (await updateClient({ ...client, ...input }), { ...client, ...input }) : await createClient(input);
      onSaved?.(saved);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save client.');
    }
  }

  return <FormShell error={error} onSubmit={submit}>
    <div className="form-grid">
      <Field label="Organisation name"><input required value={name} onChange={(event) => setName(event.target.value)} /></Field>
      <Field label="Industry"><input required value={industry} onChange={(event) => setIndustry(event.target.value)} /></Field>
      <Field label="Status"><select value={status} onChange={(event) => setStatus(event.target.value as ClientStatus)}>{clientStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
      <Field label="Approximate scale"><input value={companySize} onChange={(event) => setCompanySize(event.target.value)} placeholder="e.g. 250 employees" /></Field>
      <Field label="Primary contact"><input value={primaryContact} onChange={(event) => setPrimaryContact(event.target.value)} /></Field>
      <Field label="Contact details"><input value={contactDetails} onChange={(event) => setContactDetails(event.target.value)} /></Field>
    </div>
    <Field label="Description"><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></Field>
    <Field label="Internal notes"><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} /></Field>
  </FormShell>;
}

export function SiteForm({ site, onSaved }: { site?: Site; onSaved?: (site: Site) => void }) {
  const { dataset, createSite, updateSite } = useFabricData();
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState(site?.clientId ?? dataset?.clients[0]?.id ?? '');
  const [name, setName] = useState(site?.name ?? '');
  const [location, setLocation] = useState(site?.location ?? '');
  const [siteType, setSiteType] = useState(site?.siteType ?? '');
  const [description, setDescription] = useState(site?.description ?? '');
  const [operationalProfile, setOperationalProfile] = useState(site?.operationalProfile ?? '');
  const [workforce, setWorkforce] = useState(site?.workforce ?? '');
  const [shifts, setShifts] = useState(site?.shifts ?? '');
  const [status, setStatus] = useState<SiteStatus>(site?.status ?? 'planned');
  const [internalNotes, setInternalNotes] = useState(site?.internalNotes ?? '');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const input = { clientId, name, location, siteType: optional(siteType), description, operationalProfile, workforce: optional(workforce), shifts: optional(shifts), status, internalNotes: optional(internalNotes), areaIds: site?.areaIds ?? [], systemIds: site?.systemIds ?? [] };
      const saved = site ? (await updateSite({ ...site, ...input }), { ...site, ...input }) : await createSite(input);
      onSaved?.(saved);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save site.');
    }
  }

  return <FormShell error={error} onSubmit={submit}>
    <div className="form-grid">
      <Field label="Client"><select required value={clientId} onChange={(event) => setClientId(event.target.value)}>{dataset?.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></Field>
      <Field label="Site name"><input required value={name} onChange={(event) => setName(event.target.value)} /></Field>
      <Field label="Location"><input required value={location} onChange={(event) => setLocation(event.target.value)} /></Field>
      <Field label="Site type"><input value={siteType} onChange={(event) => setSiteType(event.target.value)} placeholder="e.g. manufacturing plant" /></Field>
      <Field label="Status"><select value={status} onChange={(event) => setStatus(event.target.value as SiteStatus)}>{siteStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
      <Field label="Workforce"><input value={workforce} onChange={(event) => setWorkforce(event.target.value)} /></Field>
      <Field label="Shifts"><input value={shifts} onChange={(event) => setShifts(event.target.value)} /></Field>
    </div>
    <Field label="Description"><textarea required value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></Field>
    <Field label="Principal activities"><textarea required value={operationalProfile} onChange={(event) => setOperationalProfile(event.target.value)} rows={3} /></Field>
    <Field label="Internal notes"><textarea value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} rows={3} /></Field>
  </FormShell>;
}

export function EngagementForm({ engagement, onSaved }: { engagement?: Engagement; onSaved?: (engagement: Engagement) => void }) {
  const { dataset, createEngagement, updateEngagement } = useFabricData();
  const users = dataset?.users ?? [];
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState(engagement?.clientId ?? dataset?.clients[0]?.id ?? '');
  const [siteIds, setSiteIds] = useState<string[]>(engagement?.siteIds ?? (dataset?.sites[0] ? [dataset.sites[0].id] : []));
  const [name, setName] = useState(engagement?.name ?? '');
  const [description, setDescription] = useState(engagement?.description ?? '');
  const [type, setType] = useState<EngagementType>((engagement?.type as EngagementType) ?? 'Preliminary Site Walk');
  const [status, setStatus] = useState<EngagementStatus>(engagement?.status ?? 'planned');
  const [stage, setStage] = useState<TransformationStage>(engagement?.stage ?? 'discover');
  const [startDate, setStartDate] = useState(engagement?.startDate.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [targetDate, setTargetDate] = useState(engagement?.targetDate?.slice(0, 10) ?? '');
  const [leadUserId, setLeadUserId] = useState(engagement?.leadUserId ?? users[0]?.id ?? '');
  const [teamUserIds, setTeamUserIds] = useState<string[]>(engagement?.teamUserIds ?? (users[0] ? [users[0].id] : []));
  const [objectives, setObjectives] = useState(engagement?.objectives ?? '');
  const [scope, setScope] = useState(engagement?.scope ?? '');
  const [commercialContext, setCommercialContext] = useState(engagement?.commercialContext ?? '');
  const [internalNotes, setInternalNotes] = useState(engagement?.internalNotes ?? '');
  const availableSites = dataset?.sites.filter((site) => site.clientId === clientId) ?? [];

  function toggle(values: string[], value: string, setter: (next: string[]) => void) {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const input = { clientId, siteIds, name, description, type, status, stage, startDate: `${startDate}T09:00:00Z`, targetDate: targetDate ? `${targetDate}T17:00:00Z` : undefined, leadUserId, teamUserIds, objectives: optional(objectives), scope: optional(scope), commercialContext: optional(commercialContext), internalNotes: optional(internalNotes) };
      const saved = engagement ? (await updateEngagement({ ...engagement, ...input }), { ...engagement, ...input }) : await createEngagement(input);
      onSaved?.(saved);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save engagement.');
    }
  }

  return <FormShell error={error} onSubmit={submit}>
    <div className="form-grid">
      <Field label="Client"><select required value={clientId} onChange={(event) => { setClientId(event.target.value); setSiteIds([]); }}>{dataset?.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></Field>
      <Field label="Engagement name"><input required value={name} onChange={(event) => setName(event.target.value)} /></Field>
      <Field label="Type"><select value={type} onChange={(event) => setType(event.target.value as EngagementType)}>{engagementTypes.map((item) => <option key={item}>{item}</option>)}</select></Field>
      <Field label="Status"><select value={status} onChange={(event) => setStatus(event.target.value as EngagementStatus)}>{engagementStatuses.map((item) => <option key={item}>{item}</option>)}</select></Field>
      <Field label="Current stage"><select value={stage} onChange={(event) => setStage(event.target.value as TransformationStage)}>{stages.map((item) => <option key={item}>{item}</option>)}</select></Field>
      <Field label="Project lead"><select required value={leadUserId} onChange={(event) => setLeadUserId(event.target.value)}>{users.map((user: User) => <option key={user.id} value={user.id}>{user.displayName}</option>)}</select></Field>
      <Field label="Start date"><input required type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></Field>
      <Field label="Target end date"><input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} /></Field>
    </div>
    <Field label="Description"><textarea required value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></Field>
    <fieldset className="form-fieldset"><legend>Site coverage</legend>{availableSites.map((site) => <label className="checkbox-row" key={site.id}><input type="checkbox" checked={siteIds.includes(site.id)} onChange={() => toggle(siteIds, site.id, setSiteIds)} />{site.name}</label>)}</fieldset>
    <fieldset className="form-fieldset"><legend>Team members</legend>{users.map((user) => <label className="checkbox-row" key={user.id}><input type="checkbox" checked={teamUserIds.includes(user.id)} onChange={() => toggle(teamUserIds, user.id, setTeamUserIds)} />{user.displayName}</label>)}</fieldset>
    <Field label="Objectives"><textarea value={objectives} onChange={(event) => setObjectives(event.target.value)} rows={3} /></Field>
    <Field label="Scope"><textarea value={scope} onChange={(event) => setScope(event.target.value)} rows={3} /></Field>
    <Field label="Commercial context"><textarea value={commercialContext} onChange={(event) => setCommercialContext(event.target.value)} rows={2} /></Field>
    <Field label="Internal notes"><textarea value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} rows={2} /></Field>
  </FormShell>;
}
