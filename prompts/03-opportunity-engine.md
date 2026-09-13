# Trion Transformation Platform — Stage 3
## Opportunity Engine

You are continuing development of the Trion Transformation Platform.

Stages 1 and 2 have established Clients, Sites, Engagements, Site Walks, Observations and Evidence.

Before making changes, inspect the existing architecture and reuse established patterns.

Your task is to implement the Opportunity & Action domain.

This is a central part of Trion's transformation methodology. The purpose is to turn evidence-led findings into structured, prioritised and actionable opportunities.

## Context

Trion's work is not simply to identify problems. It is to understand what is happening, why it is happening, what impact it has, what could be improved, what should be done first, what it may cost and what value it could create.

Use this progression:

> Observation → Problem → Root Cause → Opportunity → Action → Initiative → Outcome

Do not require every stage to be completed before an opportunity can exist. Support incomplete but clearly labelled opportunities.

## Domain Model

### Opportunity
Potential fields:
- id
- engagementId
- title
- description
- problemStatement
- rootCause
- areaId
- processId
- systemId
- opportunityType
- impact
- effort
- priority
- estimatedValue
- valueType
- implementationCost
- confidence
- status
- owner
- evidenceReferences
- relatedObservationIds
- internalNotes
- clientSummary
- reviewStatus
- createdAt
- updatedAt

Opportunity types:
- Eliminate
- Simplify
- Standardise
- Automate
- Integrate
- Improve Visibility
- Transform

Impact categories may include Productivity, Cost, Quality, Delivery, Safety, Data, Visibility, Customer Service, Risk and Other.

### Action
Potential fields:
- id
- opportunityId
- title
- description
- owner
- status
- dueDate
- priority
- notes
- createdAt
- updatedAt

## Required Functionality

Implement opportunity listing, searching, filtering, sorting, creation, editing and detail views.

Allow opportunities to be associated with engagements, processes, areas and systems where available, and with observations and evidence.

Support setting opportunity type, impact, effort, priority, estimated value, confidence, review status and internal notes. Include a client-facing summary field.

Implement an opportunity detail workspace showing the problem, root cause, proposed improvement, supporting evidence, related observations, impact, effort, value, priority, actions and review status.

## Prioritisation

Support dimensions such as impact, effort, confidence, urgency and estimated value.

Use a simple, transparent approach. If a calculated priority is introduced, make the calculation visible and explainable. Avoid false precision.

Distinguish between quantified value, estimated value, potential value, strategic value and unknown value.

## Quick-Win Support

Support identifying potential quick wins using factors such as high impact, low or moderate effort, strong evidence, clear ownership, limited dependency and short implementation timeframe.

Do not automatically classify every low-effort item as a quick win. Provide a classification that can be reviewed by a consultant.

## Evidence & Provenance

Every opportunity should show where it came from. Do not imply an opportunity is evidence-backed if it has no supporting evidence. Clearly distinguish evidence, interpretation, estimate and recommendation.

## Internal vs Client-Facing Information

Internal information includes raw notes, internal commentary, draft estimates, unverified assumptions, internal prioritisation and future AI suggestions.

Client-facing information includes approved opportunity title, description, value and recommendation. Do not implement a full client portal yet.

## UX Requirements

Prioritise clear tables, strong filtering, easy comparison, visible priority, evidence traceability, useful detail pages, quick editing, clear status and good empty states.

An opportunity is a transformation recommendation, not merely a to-do item.

## Scope Control

Do not implement AI opportunity generation, a full roadmap engine, full financial modelling, a client portal, advanced workflow automation, complex dependency management or automated ROI claims.

## Acceptance Criteria

1. Opportunities can be created, edited and viewed.
2. Opportunities are associated with engagements.
3. Opportunities can reference observations and evidence.
4. Impact, effort, value and priority are represented.
5. Actions can be created against opportunities.
6. Review status is clear.
7. Internal and client-facing information are distinguishable.
8. The workspace is useful for real consulting work.
9. Data is validated and persisted correctly.
10. Relevant checks pass.

After implementation, summarise the changes, assumptions and next logical stage.
