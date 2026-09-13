import { useState } from 'react';
import type { Evidence, EvidenceType, FrictionCategory, FrictionItem, Observation, ObservationSource, ObservationStatus, ObservationType, SiteWalk, SiteWalkStatus, SiteWalkType } from '@domain';
import { Button } from '@ui';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';

const walkTypes: SiteWalkType[] = ['Preliminary Site Walk', 'Diagnostic Site Walk', 'Follow-up Investigation', 'Validation Visit', 'Implementation Review'];
const statuses: SiteWalkStatus[] = ['planned', 'in-progress', 'completed', 'needs-follow-up', 'cancelled'];
const observationTypes: ObservationType[] = ['Process', 'People', 'Technology', 'Data', 'Quality', 'Productivity', 'Planning', 'Maintenance', 'Logistics', 'Commercial', 'Other'];
const observationSources: ObservationSource[] = ['Directly observed', 'Reported by client', 'Document / system review', 'Consultant interpretation', 'Assumption', 'AI suggestion'];
const observationStatuses: ObservationStatus[] = ['draft', 'needs-review', 'verified', 'disputed'];
const evidenceTypes: EvidenceType[] = ['Photograph', 'Document', 'Interview Note', 'Voice Note', 'Data Extract', 'Screenshot', 'Consultant Note', 'Other'];
const frictionCategories: FrictionCategory[] = ['Time', 'Quality', 'Cost', 'Flow', 'Data', 'People', 'Technology', 'Other'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="form-field"><span>{label}</span>{children}</label>;
}

function Shell({ children, error, onSubmit }: { children: React.ReactNode; error: string | null; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <form className="entity-form" onSubmit={onSubmit}>{children}{error ? <p className="form-error" role="alert">{error}</p> : null}<Button type="submit">Save capture</Button></form>;
}

const optional = (value: string) => value.trim() || undefined;

export function SiteWalkForm({ walk, onSaved }: { walk?: SiteWalk; onSaved?: (walk: SiteWalk) => void }) {
  const { dataset, createSiteWalk, updateSiteWalk } = useFabricData();
  const [error, setError] = useState<string | null>(null);
  const [engagementId, setEngagementId] = useState(walk?.engagementId ?? dataset?.engagements[0]?.id ?? '');
  const engagement = dataset?.engagements.find((item) => item.id === engagementId);
  const [siteId, setSiteId] = useState(walk?.siteId ?? engagement?.siteIds[0] ?? '');
  const [title, setTitle] = useState(walk?.title ?? '');
  const [walkType, setWalkType] = useState<SiteWalkType>((walk?.walkType as SiteWalkType) ?? 'Preliminary Site Walk');
  const [status, setStatus] = useState<SiteWalkStatus>(walk?.status ?? 'planned');
  const [date, setDate] = useState(walk?.date ?? walk?.scheduledAt.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState(walk?.startTime ?? '09:00');
  const [endTime, setEndTime] = useState(walk?.endTime ?? '12:00');
  const [consultantUserId, setConsultantUserId] = useState(walk?.leadConsultantId ?? walk?.consultantUserId ?? dataset?.users[0]?.id ?? '');
  const [participants, setParticipants] = useState(walk?.participants ?? '');
  const [objectives, setObjectives] = useState(walk?.objectives ?? '');
  const [businessContext, setBusinessContext] = useState(walk?.businessContext ?? '');
  const [focusAreas, setFocusAreas] = useState(walk?.focusAreas?.join(', ') ?? '');
  const [candidateBottleneck, setCandidateBottleneck] = useState(walk?.candidateBottleneck ?? '');
  const [agreedNextStep, setAgreedNextStep] = useState(walk?.agreedNextStep ?? '');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null);
    try {
      const input = {
        engagementId, siteId, title, walkType, status, date, startTime, endTime,
        scheduledAt: `${date}T${startTime}:00Z`, consultantUserId, leadConsultantId: consultantUserId,
        participantUserIds: [], participants: optional(participants), objectives: optional(objectives),
        businessContext: optional(businessContext), focusAreas: focusAreas.split(',').map((item) => item.trim()).filter(Boolean),
        candidateBottleneck: optional(candidateBottleneck), agreedNextStep: optional(agreedNextStep),
        plannedScope: walk?.plannedScope ?? ['Pre-tour briefing', 'Shopfloor tour', 'Post-tour recap'],
        completedScope: walk?.completedScope ?? [], followUpActionIds: walk?.followUpActionIds ?? [],
      };
      const saved = walk ? (await updateSiteWalk({ ...walk, ...input }), { ...walk, ...input }) : await createSiteWalk(input);
      onSaved?.(saved);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save site walk.'); }
  }

  const sites = dataset?.sites.filter((site) => engagement?.siteIds.includes(site.id)) ?? [];
  return <Shell error={error} onSubmit={submit}>
    <div className="form-grid">
      <Field label="Engagement"><select required value={engagementId} onChange={(event) => { setEngagementId(event.target.value); setSiteId(''); }}>{dataset?.engagements.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
      <Field label="Site"><select required value={siteId} onChange={(event) => setSiteId(event.target.value)}>{sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}</select></Field>
      <Field label="Walk title"><input required value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
      <Field label="Walk type"><select value={walkType} onChange={(event) => setWalkType(event.target.value as SiteWalkType)}>{walkTypes.map((item) => <option key={item}>{item}</option>)}</select></Field>
      <Field label="Status"><select value={status} onChange={(event) => setStatus(event.target.value as SiteWalkStatus)}>{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
      <Field label="Lead consultant"><select value={consultantUserId} onChange={(event) => setConsultantUserId(event.target.value)}>{dataset?.users.map((user) => <option key={user.id} value={user.id}>{user.displayName}</option>)}</select></Field>
      <Field label="Date"><input required type="date" value={date} onChange={(event) => setDate(event.target.value)} /></Field>
      <Field label="Start / end"><div className="inline-fields"><input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /><input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></div></Field>
    </div>
    <Field label="People present"><input value={participants} onChange={(event) => setParticipants(event.target.value)} placeholder="Names, roles, or teams" /></Field>
    <Field label="Objectives"><textarea value={objectives} onChange={(event) => setObjectives(event.target.value)} rows={2} /></Field>
    <Field label="Business context"><textarea value={businessContext} onChange={(event) => setBusinessContext(event.target.value)} rows={2} /></Field>
    <Field label="Focus areas"><input value={focusAreas} onChange={(event) => setFocusAreas(event.target.value)} placeholder="Comma-separated areas or themes" /></Field>
    <Field label="Candidate bottleneck / hypothesis"><textarea value={candidateBottleneck} onChange={(event) => setCandidateBottleneck(event.target.value)} rows={2} /></Field>
    <Field label="Agreed next step"><textarea value={agreedNextStep} onChange={(event) => setAgreedNextStep(event.target.value)} rows={2} /></Field>
  </Shell>;
}

export function ObservationForm({ siteWalkId, observation, onSaved }: { siteWalkId: string; observation?: Observation; onSaved?: (observation: Observation) => void }) {
  const { dataset, createObservation, updateObservation } = useFabricData();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(observation?.title ?? observation?.summary ?? '');
  const [description, setDescription] = useState(observation?.description ?? observation?.detail ?? '');
  const [observationType, setObservationType] = useState<ObservationType>(observation?.observationType ?? 'Process');
  const [source, setSource] = useState<ObservationSource>(observation?.source ?? 'Directly observed');
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>(observation?.confidence ?? 'medium');
  const [status, setStatus] = useState<ObservationStatus>(observation?.status ?? 'draft');
  const [stationOrLine, setStationOrLine] = useState(observation?.stationOrLine ?? '');
  const [processId, setProcessId] = useState(observation?.processId ?? '');
  const [areaId, setAreaId] = useState(observation?.areaId ?? '');
  const [internalNotes, setInternalNotes] = useState(observation?.internalNotes ?? '');
  const walk = dataset?.siteWalks.find((item) => item.id === siteWalkId);
  const areas = dataset?.areas.filter((item) => item.siteId === walk?.siteId) ?? [];
  const processes = dataset?.processes.filter((item) => item.siteId === walk?.siteId) ?? [];
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null);
    try {
      const input = { siteWalkId, title, description, summary: title, detail: description, observationType, source, confidence, status, stationOrLine: optional(stationOrLine), processId: optional(processId), areaId: optional(areaId), observedAt: new Date().toISOString(), origin: source === 'Reported by client' ? 'client' as const : 'consultant' as const, assurance: source === 'Directly observed' ? 'observed-fact' as const : 'interpreted' as const, visibility: 'internal' as const, aiStatus: 'not-applicable' as const, evidenceIds: observation?.evidenceIds ?? [], internalNotes: optional(internalNotes) };
      const saved = observation ? (await updateObservation({ ...observation, ...input }), { ...observation, ...input }) : await createObservation(input);
      onSaved?.(saved);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save observation.'); }
  }
  return <Shell error={error} onSubmit={submit}><div className="form-grid"><Field label="Title"><input required value={title} onChange={(event) => setTitle(event.target.value)} /></Field><Field label="Type"><select value={observationType} onChange={(event) => setObservationType(event.target.value as ObservationType)}>{observationTypes.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Source"><select value={source} onChange={(event) => setSource(event.target.value as ObservationSource)}>{observationSources.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Confidence"><select value={confidence} onChange={(event) => setConfidence(event.target.value as 'low' | 'medium' | 'high')}><option>low</option><option>medium</option><option>high</option></select></Field><Field label="Review status"><select value={status} onChange={(event) => setStatus(event.target.value as ObservationStatus)}>{observationStatuses.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Station / line"><input value={stationOrLine} onChange={(event) => setStationOrLine(event.target.value)} /></Field><Field label="Area"><select value={areaId} onChange={(event) => setAreaId(event.target.value)}><option value="">Unassigned</option>{areas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Process"><select value={processId} onChange={(event) => setProcessId(event.target.value)}><option value="">Unassigned</option>{processes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field></div><Field label="Description"><textarea required value={description} onChange={(event) => setDescription(event.target.value)} rows={4} /></Field><Field label="Internal notes"><textarea value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} rows={2} /></Field></Shell>;
}

export function EvidenceForm({ siteWalkId, observationId, onSaved }: { siteWalkId: string; observationId?: string; onSaved?: (evidence: Evidence) => void }) {
  const { createEvidence } = useFabricData();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [evidenceType, setEvidenceType] = useState<EvidenceType>('Consultant Note'); const [fileReference, setFileReference] = useState(''); const [source, setSource] = useState<ObservationSource>('Directly observed');
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(null); try { const input = { relatedEntityId: observationId ?? siteWalkId, relatedEntityType: observationId ? 'observation' as const : 'site-walk' as const, kind: 'document' as const, title, summary: description, capturedAt: new Date().toISOString(), origin: source === 'Reported by client' ? 'client' as const : 'consultant' as const, visibility: 'internal' as const, approvalState: 'draft' as const, siteWalkId, observationId, evidenceType, description, fileReference: optional(fileReference), source, reviewStatus: 'draft' as const }; const saved = await createEvidence(input); onSaved?.(saved); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save evidence.'); } }
  return <Shell error={error} onSubmit={submit}><div className="form-grid"><Field label="Title"><input required value={title} onChange={(event) => setTitle(event.target.value)} /></Field><Field label="Evidence type"><select value={evidenceType} onChange={(event) => setEvidenceType(event.target.value as EvidenceType)}>{evidenceTypes.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Source"><select value={source} onChange={(event) => setSource(event.target.value as ObservationSource)}>{observationSources.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="File reference"><input value={fileReference} onChange={(event) => setFileReference(event.target.value)} placeholder="Optional path, URL, or reference" /></Field></div><Field label="Description"><textarea required value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></Field></Shell>;
}

export function FrictionForm({ siteWalkId, item, onSaved }: { siteWalkId: string; item?: FrictionItem; onSaved?: (item: FrictionItem) => void }) {
  const { createFrictionItem, updateFrictionItem } = useFabricData(); const [error, setError] = useState<string | null>(null);
  const [stationOrLine, setStationOrLine] = useState(item?.stationOrLine ?? ''); const [frictionPoint, setFrictionPoint] = useState(item?.frictionPoint ?? ''); const [category, setCategory] = useState<FrictionCategory>(item?.category ?? 'Time'); const [estimatedTimeLost, setEstimatedTimeLost] = useState(item?.estimatedTimeLost ?? ''); const [frequency, setFrequency] = useState(item?.frequency ?? ''); const [peopleOrShiftsAffected, setPeopleOrShiftsAffected] = useState(item?.peopleOrShiftsAffected ?? ''); const [estimatedAnnualHours, setEstimatedAnnualHours] = useState(item?.estimatedAnnualHours?.toString() ?? ''); const [estimatedAnnualCostImpact, setEstimatedAnnualCostImpact] = useState(item?.estimatedAnnualCostImpact ?? ''); const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>(item?.confidence ?? 'medium'); const [evidenceReference, setEvidenceReference] = useState(item?.evidenceReference ?? ''); const [assumptions, setAssumptions] = useState(item?.assumptions ?? ''); const [notes, setNotes] = useState(item?.notes ?? '');
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(null); try { const input = { siteWalkId, stationOrLine, frictionPoint, category, estimatedTimeLost: optional(estimatedTimeLost), frequency: optional(frequency), peopleOrShiftsAffected: optional(peopleOrShiftsAffected), estimatedAnnualHours: estimatedAnnualHours ? Number(estimatedAnnualHours) : undefined, estimatedAnnualCostImpact: optional(estimatedAnnualCostImpact), confidence, evidenceReference: optional(evidenceReference), assumptions: optional(assumptions), notes: optional(notes) }; const saved = item ? (await updateFrictionItem({ ...item, ...input }), { ...item, ...input }) : await createFrictionItem(input); onSaved?.(saved); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save friction item.'); } }
  return <Shell error={error} onSubmit={submit}><div className="form-grid"><Field label="Station / line"><input required value={stationOrLine} onChange={(event) => setStationOrLine(event.target.value)} /></Field><Field label="Category"><select value={category} onChange={(event) => setCategory(event.target.value as FrictionCategory)}>{frictionCategories.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Friction point"><input required value={frictionPoint} onChange={(event) => setFrictionPoint(event.target.value)} /></Field><Field label="Time lost"><input value={estimatedTimeLost} onChange={(event) => setEstimatedTimeLost(event.target.value)} /></Field><Field label="Frequency"><input value={frequency} onChange={(event) => setFrequency(event.target.value)} /></Field><Field label="People / shifts affected"><input value={peopleOrShiftsAffected} onChange={(event) => setPeopleOrShiftsAffected(event.target.value)} /></Field><Field label="Indicative annual hours"><input type="number" min="0" value={estimatedAnnualHours} onChange={(event) => setEstimatedAnnualHours(event.target.value)} /></Field><Field label="Indicative cost impact"><input value={estimatedAnnualCostImpact} onChange={(event) => setEstimatedAnnualCostImpact(event.target.value)} /></Field><Field label="Confidence"><select value={confidence} onChange={(event) => setConfidence(event.target.value as 'low' | 'medium' | 'high')}><option>low</option><option>medium</option><option>high</option></select></Field><Field label="Evidence reference"><input value={evidenceReference} onChange={(event) => setEvidenceReference(event.target.value)} /></Field></div><Field label="Assumptions"><textarea required value={assumptions} onChange={(event) => setAssumptions(event.target.value)} rows={2} /></Field><Field label="Notes"><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} /></Field></Shell>;
}
