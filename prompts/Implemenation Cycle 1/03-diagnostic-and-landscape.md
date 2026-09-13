# Trion Factory Transformation Platform
## Stage 3 — Digital Diagnostic, Maturity Scorecard and Digital Landscape

You are implementing Stage 3 of the Trion Factory Transformation Platform.

Read the package-level instructions first. Inspect the existing repository and reuse established patterns.

## Objective

Build the structured diagnostic workspace that turns site-walk information into a defensible assessment of the client's current operation.

This stage must reflect Trion's actual Digital & Operational Maturity Scorecard and Digital Landscape Map.

## Diagnostic principle

The diagnostic is not an assessment of how fashionable or technologically advanced a business is.

It assesses how effectively the business uses its people, processes, technology, systems and data to operate today and improve tomorrow.

Do not assume the answer is:

- A new ERP.
- Extensive automation.
- Artificial intelligence.
- A major transformation programme.
- Replacing systems that already work.

Use the principle:

> Understand → Simplify → Standardise → Automate → Measure

## Diagnostic model

Implement:

### Diagnostic

- id
- engagementId
- title
- description
- status
- startDate
- completionDate
- assessor
- currentStage
- scope
- methodologyVersion
- overallScore
- overallLevel
- overallConfidence
- internalNotes
- createdAt
- updatedAt

### Maturity Assessment

- id
- diagnosticId
- dimensionId
- score
- level
- rationale
- currentState
- desiredState
- gap
- relatedObservationIds
- evidenceReferences
- relatedOpportunityIds
- confidence
- reviewStatus
- assessedBy
- assessedAt

### Finding

- id
- diagnosticId
- title
- currentSituation
- whyItMatters
- recommendedDirection
- category
- significance
- relatedObservations
- relatedEvidence
- relatedOpportunities
- confidence
- reviewStatus
- internalNotes
- clientSummary

## Implement the exact ten scorecard dimensions

Use these as seeded, versioned assessment dimensions:

1. Strategy & Digital Direction
2. People & Digital Capability
3. Processes & Standardisation
4. Production & Operational Control
5. Planning & Scheduling
6. Data & Performance Intelligence
7. Systems & ERP
8. Integration & Information Flow
9. Automation & Technology
10. Continuous Improvement & Scalability

Do not rename or merge these casually.

## Maturity scale

Implement the five-level scale:

1 — Reactive
Processes are largely informal, manual or dependent on individuals. Problems are generally addressed after they occur.

2 — Developing
Some processes and systems are established, but application is inconsistent and significant manual intervention remains.

3 — Controlled
Core processes are defined and reasonably consistent. Systems and data support day-to-day operations, although gaps remain.

4 — Integrated
Processes, systems and data work together effectively. Performance is actively managed and improvement is structured.

5 — Optimised
Operations are highly integrated, measurable and continuously improved. Technology is deliberately used to improve business performance.

Important: A score of 5 is not automatically the objective. A well-designed 3 or 4 may be more appropriate for an SME. The objective is fit-for-purpose maturity, not technology for its own sake.

## Assessment content

Seed each dimension with its actual assessment criteria and maturity anchors from the source scorecard.

At minimum include:

### Strategy & Digital Direction
- Business objectives.
- Productivity, quality, delivery and cost objectives.
- Digital direction.
- Technology investment logic.
- Improvement pipeline.
- Leadership support.
- Evidence-based decisions.
- Ownership.

### People & Digital Capability
- Digital skills.
- Training.
- Adoption.
- Reliance on individual knowledge.
- Process ownership.
- Employee involvement.
- Ability to maintain solutions.
- Internal technical capability.

### Processes & Standardisation
- Documented processes.
- Process ownership.
- Standard work.
- Process variation.
- Duplicate activity.
- Manual administration.
- Bottlenecks.
- Rework.
- Process visibility.
- Simplification opportunities.

Include the key question:
> Are you automating a good process—or simply automating a bad one?

### Production & Operational Control
- Production visibility.
- Output monitoring.
- Downtime.
- OEE / performance measurement.
- Quality information.
- Scrap and rework.
- Machine utilisation.
- Production reporting.
- Escalation.
- Shopfloor information.

### Planning & Scheduling
- Production scheduling.
- Capacity planning.
- Material availability.
- Inventory visibility.
- Order prioritisation.
- Schedule adherence.
- Changeover planning.
- Bottleneck management.
- Rescheduling.
- Planning-to-production communication.

### Data & Performance Intelligence
- Data availability.
- Accuracy.
- Ownership.
- Accessibility.
- Reporting.
- KPIs.
- Dashboarding.
- Consistency.
- Historical analysis.
- Root-cause analysis.
- Data-led decisions.

### Systems & ERP
- ERP utilisation.
- Configuration.
- Master data.
- Transaction accuracy.
- Inventory.
- Production information.
- Purchasing.
- Sales / order management.
- Finance integration.
- Reporting.
- Unused functionality.
- Spreadsheet workarounds.

This dimension must explicitly avoid assuming the client needs a different ERP.

### Integration & Information Flow
- System-to-system integration.
- ERP and production.
- Production and quality.
- Production and planning.
- Machine and data systems.
- Automated data transfer.
- API / database connectivity.
- Duplicate data entry.
- Information latency.
- Data silos.

### Automation & Technology
- Workflow automation.
- Administrative automation.
- Machine automation.
- Robotics.
- Automated data collection.
- Sensors / IoT.
- Digital tools.
- AI / advanced analytics where appropriate.
- Technology maintenance.
- Technology ROI.
- Scalability.

### Continuous Improvement & Scalability
- Improvement culture.
- Root-cause analysis.
- KPI review.
- Improvement ownership.
- Lessons learned.
- Standardisation.
- Benefits tracking.
- Technology scalability.
- Change management.
- Replication of successful improvements.

## Scoring behaviour

Do not generate arbitrary scores.

Support:

- Manual scoring.
- Rationale.
- Evidence links.
- Confidence.
- Draft / reviewed / approved status.
- Overall score calculation only when dimension scores are sufficiently complete.
- Clear indication of missing or weak evidence.

The system should be able to show:

- Current state.
- Desired state.
- Gap.
- Opportunity.
- Priority.

This mirrors the actual scorecard output.

## Digital Landscape Map foundation

Create structured entities for:

- Business areas.
- Processes.
- Process steps.
- Systems.
- Data objects.
- People / roles.
- Machines / assets where relevant.
- Handoffs.
- Relationships.
- Observations.
- Opportunities.

Support relationships such as:

- Process uses system.
- Process produces data.
- System exchanges data with system.
- Role performs process.
- Machine produces data.
- Process depends on process.
- Observation relates to process.
- Opportunity improves process or information flow.

Do not build a complex graph editor yet. Build a structured landscape workspace that can later render a visual Digital Landscape Map.

## Diagnostic progress

Use real completeness indicators:

- Site walks completed.
- Areas investigated.
- Processes mapped.
- Evidence collected.
- Dimensions assessed.
- Findings reviewed.
- Opportunities identified.

Never fabricate percentages.

## UX requirements

The diagnostic workspace should feel like an assessment and analysis environment, not a generic survey.

Prioritise:

- Evidence traceability.
- Clear maturity profile.
- Dimension-by-dimension review.
- Current / desired / gap structure.
- Clear confidence.
- Draft versus approved state.
- Easy movement from finding to opportunity.
- Structured landscape information.

## Scope control

Do not implement AI-generated scores, advanced benchmarking, a full adaptive questionnaire engine, automated report generation or a complex visual graph editor.

## Acceptance criteria

- The ten scorecard dimensions are implemented accurately.
- The five-level maturity scale is represented.
- Scores require rationale and can reference evidence.
- Current state, desired state, gap and opportunity are supported.
- Landscape entities and relationships exist.
- Diagnostic progress is meaningful.
- The application remains coherent and checks pass.
