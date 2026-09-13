# Trion Transformation Platform — Stage 4
## Diagnostic Workspace

You are continuing development of the Trion Transformation Platform.

Stages 1–3 have established Clients, Sites, Engagements, Site Walks, Observations, Evidence, Opportunities and Actions.

Before making changes, inspect the existing architecture and reuse established patterns.

Your task is to implement the foundational Diagnostic Workspace.

This should connect Trion's structured transformation information into a coherent diagnostic experience.

## Context

Trion's Digital Diagnostic helps a manufacturing client understand how its operations work, how information flows, where operational friction exists, how mature its digital and operational practices are, which problems matter most, what opportunities should be prioritised and what transformation should happen next.

The diagnostic must be evidence-led, not a generic questionnaire that produces an arbitrary score.

Use this progression:

> Understand → Assess → Diagnose → Prioritise → Recommend

## Diagnostic Domain

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
- internalNotes
- createdAt
- updatedAt

### Maturity Dimension
- id
- diagnosticId
- name
- description
- score
- confidence
- evidenceReferences
- notes
- reviewStatus

Potential dimensions:
- Digital Foundations
- Data & Information
- Systems & Integration
- Process & Operational Excellence
- People & Capability
- Automation & Technology
- Management Visibility

Do not assume these dimensions are final or immutable.

### Finding
- id
- diagnosticId
- title
- description
- category
- severity / significance
- evidenceReferences
- relatedObservationIds
- relatedOpportunityIds
- status
- reviewStatus
- internalNotes
- clientSummary

## Required Functionality

Implement a diagnostic workspace showing engagement context, diagnostic status, progress, maturity dimensions, key findings, related observations, related opportunities, outstanding evidence and review status.

Implement an initial maturity assessment interface supporting viewing dimensions, recording scores, recording confidence, adding rationale, linking evidence, adding notes and reviewing scores.

Do not build a complex questionnaire engine yet.

Implement finding creation, editing, viewing, evidence association, observation association, opportunity association, significance, client-facing summary and review status.

## Evidence-Led Scoring

A maturity score must have context. For example, a Data & Information score of 2.5/5 should show why it was given, what evidence supports it, what remains uncertain, who assessed it and whether it has been reviewed.

Do not automatically generate scores from arbitrary formulas. Manually entered scores are acceptable initially.

## Digital Landscape Foundation

Begin supporting the underlying information required for the Trion Digital Landscape Map, including areas, processes, systems, data, people/roles, relationships, observations and opportunities.

Do not build a complex visual graph editor. Establish the domain entities, structured views and relationships needed for a future visual map generated from platform data.

## Diagnostic Progress

Show meaningful indicators such as site walks completed, areas investigated, processes mapped, evidence collected, maturity dimensions assessed, findings reviewed and opportunities identified.

Do not fabricate percentages. Use actual data or clearly marked development fixtures.

## Internal vs Client-Facing Information

Internal information includes draft scores, internal rationale, unverified findings, internal notes, uncertainty and future AI suggestions.

Client-facing information includes approved maturity scores, findings, recommendations and summaries.

Do not build the client portal yet.

## UX Requirements

The workspace should feel like a professional assessment and analysis environment. Prioritise clear progress, strong information hierarchy, evidence traceability, easy review, useful comparison and clear draft/approved distinctions.

## Scope Control

Do not implement AI-generated maturity scores, a full adaptive questionnaire engine, automated report generation, a full visual graph editor, advanced benchmarking, a client portal or complex statistical analysis.

## Acceptance Criteria

1. A diagnostic can be created and associated with an engagement.
2. Maturity dimensions can be assessed.
3. Scores have rationale and evidence references.
4. Findings can be created and associated with evidence.
5. Findings can connect to opportunities.
6. Diagnostic progress is visible.
7. Draft and approved information are distinguishable.
8. The structured landscape foundation exists.
9. The application remains consistent and functional.
10. Relevant checks pass.

After implementation, summarise the changes and identify the next logical extension.
