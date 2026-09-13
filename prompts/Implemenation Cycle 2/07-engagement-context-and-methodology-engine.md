# Stage 7 — Engagement Context and Methodology Engine

## Objective

Create the shared context and configurable methodology layer that connects Trion's process without making it rigid.

The platform should guide consultants through a repeatable process while allowing professional judgement and unexpected findings.

## Part A — Shared Engagement Context

Create a reusable engagement-context service or domain abstraction that can assemble:

- Client.
- Site.
- Engagement.
- Objectives.
- Scope.
- Business context.
- Areas.
- Processes.
- Systems.
- Data objects.
- Roles.
- Site walks.
- Observations.
- Evidence.
- Diagnostic assessments.
- Findings.
- Opportunities.
- Roadmap initiatives.
- Outputs.
- Outstanding actions.
- Activity history.

The context must be permission-aware and must distinguish internal information from approved client-facing information.

Do not pass large unstructured objects around the application. Define clear typed contracts and context slices.

The shared context should be usable by:

- Engagement command centre.
- AI features.
- Search.
- Progress calculations.
- Output generation.
- Review queues.

## Part B — Methodology Engine

Create a configurable model for:

### Methodology Template

- id
- name
- description
- engagement type
- version
- status
- stages
- activities
- prompts
- required information
- optional information
- expected outputs

### Methodology Stage

- id
- templateId
- name
- description
- order
- completion rules
- activities

### Methodology Activity

- id
- stageId
- name
- description
- activity type
- required/optional
- completion criteria
- linked domain
- prompts
- guidance

## Seed templates

### Preliminary Site Walk

Use the actual Trion structure:

1. Pre-tour Briefing
2. Shopfloor Tour
3. Material and Process Flow
4. Data and Paper-Tracking Red Flags
5. Machine Operations and Downtime
6. High-Impact Diagnostic Prompts
7. Immediate Friction and Loss-Aversion Tracker
8. Post-tour Recap
9. Agreed Next Step

### Digital Diagnostic

Use:

1. Engagement Setup
2. Business Context
3. Site Walks
4. Process and Landscape Mapping
5. Evidence Collection
6. Maturity Assessment
7. Findings
8. Opportunity and Action Register
9. Prioritisation
10. Executive Summary
11. Transformation Roadmap

## Required behaviour

- Create an engagement from a template.
- Show stage progression.
- Show meaningful completion.
- Show incomplete or weakly supported work.
- Allow optional activities to be skipped with a reason.
- Allow activities to be reopened.
- Allow a preliminary site walk to be promoted into a Digital Diagnostic.
- Preserve existing data during promotion.
- Version templates without changing historical engagements.

## Important distinction

Checklist completion is not the same as diagnostic completion.

For example, a completed prompt does not prove that a process has been understood or that evidence is sufficient.

Make this distinction visible in the UI.

## Acceptance criteria

- Templates are data-driven.
- Preliminary Site Walk and Digital Diagnostic workflows are supported.
- Engagements can progress, pause, reopen and be promoted.
- Progress is meaningful and explainable.
- Template versions do not corrupt historical work.
- Shared engagement context is typed, permission-aware and reusable.
