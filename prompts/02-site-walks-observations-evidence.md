# Trion Transformation Platform — Stage 2
## Site Walks, Observations & Evidence

You are continuing development of the Trion Transformation Platform.

Stage 1 has established Clients, Sites and Engagements.

Before making changes, inspect the existing architecture and reuse established patterns.

Your task is to implement the next major domain:

> Structured site walks, observations and evidence capture.

This is one of the most important workflows in the platform. It should help Trion consultants capture what they actually see, hear and learn during factory visits, rather than collecting disconnected notes.

## Context

Trion consultants may walk production areas, observe processes, speak to operators and managers, review systems and data, identify operational friction, capture photographs, record notes, identify follow-up questions and gather supporting documents.

The platform must distinguish between observed facts, client-provided information, consultant interpretation, assumptions, AI suggestions and approved conclusions.

## Domain Model

Implement or extend:

### SiteWalk
- id
- engagementId
- siteId
- title
- description
- walkType
- status
- date
- startTime
- endTime
- consultant / owner
- areasCovered
- processesCovered
- objectives
- internalNotes
- createdAt
- updatedAt

### Observation
- id
- siteWalkId
- title
- description
- observationType
- areaId where available
- processId where available
- systemId where available
- source
- confidence
- status
- observedAt
- recordedBy
- internalNotes
- createdAt
- updatedAt

### Evidence
- id
- observationId
- siteWalkId
- evidenceType
- title
- description
- file reference where applicable
- source
- capturedAt
- capturedBy
- visibility
- reviewStatus
- createdAt
- updatedAt

Evidence types may include Photograph, Document, Interview Note, Voice Note, Data Extract, Screenshot, Consultant Note and Other.

Do not implement file storage infrastructure unless the existing architecture already supports it. A structured evidence record with a placeholder file reference is acceptable initially.

## Required Functionality

### Site Walks
- List, search and filter site walks.
- Create, edit and view site walks.
- Associate them with engagements and sites.
- Assign consultants.
- Set objectives, status, date and scope.
- Display progress.

### Site Walk Workspace
Show walk overview, objectives, areas/processes covered, observations, evidence, follow-up actions and notes.

### Observations
- Create, edit and view observations.
- Associate observations with site walks and areas/processes/systems where available.
- Set type, source, confidence and review status.
- Add internal notes.

### Evidence
- Create evidence records.
- Associate evidence with observations.
- Display evidence in relevant context.
- Record evidence type and source.
- Distinguish internal evidence from future client-shareable evidence.

## Guided Workflow Direction

Establish the architecture for a future guided site walk experience:

1. Select area.
2. Select process.
3. Review prompts.
4. Record observation.
5. Add evidence.
6. Identify follow-up question.
7. Continue walking.

For this stage, implement a sensible initial workflow without advanced mobile, offline or AI functionality.

## Evidence Integrity

An observation should show who recorded it, when, where it came from, whether it is verified, what evidence supports it, and whether it is an interpretation or direct observation.

Use clear labels such as Observed, Reported by Client, Consultant Interpretation, Unverified, Reviewed and Approved. Do not invent evidence or automatically mark AI-generated content as verified.

## UX Requirements

Prioritise fast capture, clear context, minimal friction, readable information density, easy navigation between observations, clear evidence relationships, useful filtering and strong empty states.

## Scope Control

Do not implement AI transcription, AI summarisation, AI-generated observations, a full process graph editor, advanced file storage, offline synchronisation, a native mobile application, a full diagnostic engine or opportunity scoring.

## Acceptance Criteria

1. Site walks can be created and managed.
2. Observations can be captured and associated with site walks.
3. Evidence records can be associated with observations.
4. Relationships are visible and navigable.
5. Source, confidence and review status are represented.
6. The site walk workspace is genuinely useful.
7. Data is validated and persisted through the existing architecture.
8. The application remains consistent and functional.
9. Relevant tests and checks pass.

After implementation, summarise the changes and identify the next logical extension.
