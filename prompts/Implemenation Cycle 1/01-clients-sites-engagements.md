# Trion Factory Transformation Platform
## Stage 1 — Clients, Sites, Engagements and Diagnostic Workspaces

You are implementing Stage 1 of the Trion Factory Transformation Platform.

Read the package-level instructions first. Inspect the existing repository before making changes. Reuse the established architecture and do not introduce a competing stack.

## Objective

Create the organisational and engagement foundation for Trion's complete transformation workflow.

The platform is primarily an internal Trion consulting workbench. It must support both:

1. A free preliminary on-site meeting / site walk.
2. A more structured Digital Diagnostic.
3. Follow-on implementation and transformation delivery.

Do not treat these as unrelated products.

## Core hierarchy

Implement a coherent hierarchy:

Client
  └── Site
       └── Engagement
            ├── Site Walks
            ├── Diagnostic
            ├── Observations
            ├── Evidence
            ├── Landscape
            ├── Findings
            ├── Opportunities
            ├── Roadmap
            └── Outputs

A client may have multiple sites. A site may have multiple engagements. An engagement may cover one or more sites.

## Domain model

### Client

Include, as appropriate:

- id
- name
- industry
- company size / approximate scale
- description
- primary contact
- contact details
- status
- internal notes
- createdAt
- updatedAt

### Site

Include:

- id
- clientId
- name
- location
- site type
- description
- principal activities
- approximate workforce / shifts where known
- status
- internal notes
- createdAt
- updatedAt

### Engagement

Include:

- id
- clientId
- name
- description
- engagementType
- status
- startDate
- targetEndDate
- projectLead
- teamMembers
- currentStage
- objectives
- scope
- commercial context
- internal notes
- createdAt
- updatedAt

Engagement types should include at least:

- Preliminary Site Walk
- Digital Diagnostic
- Operational Improvement
- Systems / ERP Review
- Data / Reporting Improvement
- Automation Sprint
- Transformation Programme
- Advisory / Discovery

Statuses should be typed and consistent.

## Required functionality

### Client area

- List clients.
- Search and filter clients.
- Create and edit clients.
- View client details.
- View associated sites.
- View associated engagements.
- Display recent activity or engagement status where useful.

### Site area

- List sites.
- Create and edit sites.
- Associate sites with clients.
- View site details.
- View associated engagements.
- Display principal activities and known scope.

### Engagement area

- List, search and filter engagements.
- Create and edit engagements.
- View engagement details.
- Associate with a client and one or more sites.
- Assign project lead and team members.
- Set engagement type and status.
- Set objectives, scope and current stage.
- Show progress indicators for later domains without fabricating progress.

## Important workflow distinction

The platform must support a lightweight preliminary site walk without forcing the user to create a full diagnostic immediately.

However, a preliminary site walk should be able to:

- Create or link a client.
- Create or link a site.
- Record the meeting purpose.
- Capture initial business context.
- Record observed friction.
- Capture a preliminary process flow.
- Identify a candidate bottleneck.
- Record agreed next steps.
- Convert or promote the engagement into a Digital Diagnostic later.

Design the model so this transition is natural.

## UX requirements

The interface should feel like a professional internal consulting workbench.

Prioritise:

- Clear hierarchy.
- Fast navigation.
- Useful tables.
- Search and filtering.
- Contextual detail pages.
- Consistent page headers.
- Clear status badges.
- Strong empty states.
- Easy movement from client to site to engagement.

Do not build a generic CRM. Do not add unnecessary sales-pipeline features.

## Data architecture

Use the existing data access boundary. Do not scatter hard-coded records through page components.

Ensure:

- Relationships are valid.
- Invalid references are prevented.
- Forms validate input.
- Development fixtures are clearly separated from future persistence.
- The model can later support a real database.
- Audit-friendly timestamps exist.
- Internal notes are not accidentally included in client-facing views.

## Scope control

Do not implement the full site-walk checklist, maturity scoring, opportunity engine, AI, report generation or client portal yet. Establish the correct foundation for them.

## Acceptance criteria

- Clients, sites and engagements are fully usable.
- Preliminary Site Walk and Digital Diagnostic are distinct but connected engagement types.
- Engagements can progress through transformation stages.
- Relationships are visible and navigable.
- Forms, validation, loading and empty states work.
- The application runs successfully and checks pass.
