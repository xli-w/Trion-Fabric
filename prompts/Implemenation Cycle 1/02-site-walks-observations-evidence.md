# Trion Factory Transformation Platform
## Stage 2 — Preliminary Site Walks, Guided Capture, Observations and Evidence

You are implementing Stage 2 of the Trion Factory Transformation Platform.

Read the package-level instructions first. Inspect the current repository and reuse existing architecture.

## Objective

Build the platform's practical factory-investigation workflow.

This stage must support both:

- The free preliminary on-site meeting / production walk.
- More detailed evidence capture during a Digital Diagnostic.

The experience should be intuitive enough to use during or immediately after a factory visit.

## Source workflow to implement

Use the following actual Trion site-walk structure as the basis:

1. Pre-tour briefing.
2. Shopfloor tour.
3. Material and process flow.
4. Data and paper-tracking red flags.
5. Machine operations and downtime.
6. High-impact diagnostic prompts.
7. Immediate friction and loss-aversion tracker.
8. Post-tour recap.
9. Agreed next step.

Do not turn the checklist into a rigid form that prevents free-form investigation. It should be a guided framework with flexible capture.

## Site Walk model

Include:

- id
- engagementId
- siteId
- title
- walkType
- status
- date
- startTime
- endTime
- leadConsultant
- participants
- objectives
- businessContext
- focusAreas
- areasCovered
- processesCovered
- overallProcessSummary
- candidateBottleneck
- agreedNextStep
- internalNotes
- createdAt
- updatedAt

Walk types should include:

- Preliminary Site Walk
- Diagnostic Site Walk
- Follow-up Investigation
- Validation Visit
- Implementation Review

Statuses may include Planned, In Progress, Completed, Needs Follow-up and Cancelled.

## Guided site-walk workspace

Create a workspace with clear sections:

### A. Pre-tour briefing

Capture:

- Why Trion is visiting.
- High-level client business.
- Overall process flow from raw materials to finished goods.
- Production / commercial goals.
- Leadership priorities.
- Known pain points.
- People present.
- Initial hypotheses, clearly labelled as hypotheses.

Include a concise briefing checklist based on the source material.

### B. Shopfloor tour

Provide guided prompts and capture areas for:

#### Material and process flow

- Raw material receiving.
- WIP and staging.
- Bottlenecks and idle inventory.
- Finished goods.
- Shipping and order verification.
- Process sequence.
- Handoffs between departments.

#### Data and paper tracking

- Paper travellers.
- Clipboards.
- Manual whiteboards.
- Spreadsheet trackers.
- Double data entry.
- Verbal communication.
- Missing or duplicated information.
- Delayed reporting.

#### Machine operations and downtime

- Downtime logging.
- Fault escalation.
- Maintenance notification.
- Quality checks.
- Scrap and rework.
- Machine utilisation.
- Operator interaction with systems.
- Production reporting.

### C. Diagnostic prompts

Include prompt cards for:

Plant managers / engineers:
- What happens when a machine goes down unexpectedly?
- How is maintenance alerted?
- Which manual administrative task would they eliminate?
- How long does it take for shift production numbers to reach management?

Operators:
- What is most frustrating about shift changeover?
- If a paper sheet is lost, how is the next job known?
- What always takes longer than it should?

Prompts must be editable and extensible.

### D. Friction and loss-aversion tracker

Implement a structured capture table with:

- station / line
- friction point
- category
- estimated time spent or lost
- frequency
- number of people / shifts affected
- estimated annual hours
- estimated annual cost impact
- confidence
- evidence reference
- notes

Do not present estimates as facts. Label them as indicative and allow the consultant to record assumptions.

### E. Post-tour recap

Support:

- A process-flow summary.
- Validation notes.
- Confirmed bottleneck.
- What was misunderstood or corrected.
- Immediate opportunities.
- Agreed next step.
- Whether to recommend a deeper diagnostic.
- Follow-up owner and date.

## Observation model

Implement:

- id
- siteWalkId
- title
- description
- observationType
- area
- process
- system
- station / line
- source
- confidence
- status
- observedAt
- recordedBy
- internalNotes
- createdAt
- updatedAt

Observation types should include Process, People, Technology, Data, Quality, Productivity, Planning, Maintenance, Logistics, Commercial and Other.

Source values should distinguish:

- Directly observed.
- Reported by client.
- Document / system review.
- Consultant interpretation.
- Assumption.
- AI suggestion, for future use.

## Evidence model

Implement structured evidence records with:

- id
- observationId
- siteWalkId
- evidenceType
- title
- description
- file reference where supported
- source
- capturedAt
- capturedBy
- visibility
- reviewStatus
- createdAt
- updatedAt

Evidence types should include Photograph, Document, Interview Note, Voice Note, Data Extract, Screenshot, Consultant Note and Other.

Do not invent a file-storage system if one does not exist. A safe initial file reference is acceptable.

## Evidence integrity

Every observation should make it possible to understand:

- Who recorded it.
- When it was recorded.
- Where it came from.
- Whether it is verified.
- What evidence supports it.
- Whether it is a fact, interpretation or assumption.

Never automatically mark AI-generated content as verified.

## UX requirements

The site-walk experience should support:

- Fast capture.
- Clear context.
- Minimal friction.
- Large readable controls where useful.
- Easy addition of multiple observations.
- Quick access to prompts.
- Easy linking to stations, lines, processes and systems.
- A clear distinction between checklist completion and actual findings.
- Strong post-visit review.

Do not make the checklist itself the product. The product is the structured understanding captured through the checklist.

## Scope control

Do not implement AI transcription, AI-generated observations, advanced offline synchronisation, native mobile apps, full graph editing, maturity scoring or opportunity prioritisation yet.

## Acceptance criteria

- Preliminary and diagnostic site walks are supported.
- The complete source checklist workflow is represented.
- Observations and evidence are structured and traceable.
- Friction estimates are captured with assumptions and confidence.
- The post-tour recap can produce a clear next step.
- The application remains usable and checks pass.
