# Stage 6 — Platform Foundations and Internal Workspace

## Objective

Turn the existing domain features into a coherent internal Trion application.

This is not a generic dashboard exercise. The workspace must help a consultant understand what is happening across their engagements and what needs attention next.

## Required implementation

### 1. Application shell

Create a consistent internal application shell with:

- Trion branding.
- Primary navigation.
- Current user context.
- Global search entry point.
- Notifications or review indicators where supported.
- Breadcrumbs showing Client → Site → Engagement → Current Area.
- Consistent page headers and actions.
- Responsive behaviour suitable for office and factory use.

Suggested navigation:

- Workspace
- Clients
- Sites
- Engagements
- Site Walks
- Diagnostics
- Landscape
- Opportunities
- Roadmaps
- Outputs
- Knowledge
- Administration

Do not show every feature as a top-level navigation item if a more coherent hierarchy is possible.

### 2. Internal workspace home

Build a useful landing page that answers:

- What am I working on?
- Which site walks are upcoming?
- Which engagements need attention?
- Which observations require review?
- Which opportunities are incomplete?
- Which outputs are awaiting approval?
- What is the next useful action?

Use real data only. Do not fabricate metrics or progress.

### 3. Engagement command centre

Create a consistent engagement overview containing:

- Client and site context.
- Engagement purpose and scope.
- Engagement type and status.
- Project lead and team.
- Current methodology stage.
- Progress based on meaningful completion.
- Site walks.
- Areas and processes covered.
- Evidence collected.
- Diagnostic completeness.
- Findings.
- Priority opportunities.
- Roadmap initiatives.
- Outputs and approval status.
- Outstanding actions.
- Recent activity.

The page should provide navigation into the underlying work rather than duplicating every record.

### 4. Activity model

Implement a reusable activity/event model for important actions:

- Created.
- Updated.
- Assigned.
- Status changed.
- Submitted for review.
- Approved.
- Published.
- Archived.
- Converted from preliminary site walk to diagnostic.

Include actor, timestamp, entity, action and useful metadata.

### 5. Internal roles and visibility

Implement a clear permission boundary for:

- Administrator.
- Engagement Lead.
- Consultant.
- Analyst.
- Reviewer.
- Read-only internal user.

Support visibility states such as:

- Internal.
- Draft client-facing.
- Approved client-facing.
- Archived.

Do not rely only on hiding buttons. Enforce permissions in the service/data layer.

## UX requirements

- Fast navigation.
- Clear empty states.
- Clear distinction between draft and approved information.
- Useful status labels.
- No decorative metrics without operational meaning.
- No unnecessary CRM pipeline functionality.

## Acceptance criteria

- A consultant can open the workspace and identify their next actions.
- An engagement has one coherent command centre.
- Activity events are reusable across domains.
- Permissions and visibility are enforced.
- Existing features use the shared shell and patterns.
- Tests and checks pass.
