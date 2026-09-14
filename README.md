# Trion Fabric

Fabric is Trion's internal transformation operating environment. It connects
client and site context, fieldwork, diagnostics, opportunity shaping, delivery
planning, and governed outputs through one structured engagement model rather
than disconnected forms or static reports.

## What Fabric Includes

- A runnable TypeScript workbench for Trion consultants working in an active
  client engagement.
- Typed, runtime-validated domain models for clients, sites, engagements, site
  walks, evidence, diagnostics, opportunities, initiatives, roadmaps, benefits,
  outputs, reusable knowledge, and users.
- Methodology templates/runs and promotion from preliminary site walk to digital
  diagnostic.
- A versioned digital landscape model with controlled client-safe projections.
- Engagement-aware evidence retrieval and internal knowledge lifecycle controls.
- Controlled reports aligned to the same underlying scorecard, landscape,
  opportunity, roadmap, and benefit records; Markdown and AI-ingestible JSON
  downloads; review comments; source freshness; version lineage; and export
  audit records.
- Permission checks at the repository persistence seam, persistent active
  engagement selection, engagement-scoped workbench projections, activity
  events, retry states, and destructive-action confirmation.
- Reusable UI primitives, design tokens, focused Vitest coverage, and CI checks
  for lint, tests, and build.

See the [production-readiness review](docs/operations/production-readiness.md)
for the current operating boundary, known limitations, and release gates.

## Workspace-Centred Product Model

Fabric is intentionally designed for one or two consultants working deeply
with one active client engagement, not for a high-volume consultancy operation.
The selected client, site, and engagement persist while the consultant moves
through the primary workbench areas:

```text
Clients
Active engagement
  Workspace
  Understand
  Analyse
  Plan & Output
```

- **Workspace** surfaces the current position, Current Understanding, and the
  next action derived from real incomplete work.
- **Contextual workbench links** retain the active engagement, so a reopened or
  shared link cannot silently fall back to another local client context.
- **Understand** brings together site walks, observations, contextual evidence,
  and the digital landscape.
- **Analyse** connects maturity assessment, findings, evidence, and the
  opportunity register.
- **Plan & Output** sequences approved recommendations into the roadmap,
  benefit measures, and the five controlled outputs.

Underlying records remain connected and rich even when they are not primary
navigation concepts. Evidence, systems, findings, actions, milestones,
methodology, AI, knowledge, and configuration are accessed contextually or in
settings rather than as standalone workstreams.

## Chosen Stack

- React 18
- Vite 4
- TypeScript (strict)
- React Router 6
- Zod for runtime validation
- ESLint + Prettier
- Vitest for focused unit and workflow tests
- Node 20.19.0 or newer compatible supported LTS release

## Repository Structure

```text
apps/
  web/
    index.html
    src/
      app/
      data/
      features/
      layouts/
      pages/
      styles/
packages/
  config/
  domain/
  ui/
  validation/
docs/
  architecture/
  decisions/
  operations/
  product/
tests/
```

## Core Product Principles

- Evidence before assumption.
- Structured information before documents.
- One source of truth for connected transformation knowledge.
- Human-reviewed AI outputs, never silent fact fabrication.
- Internal working data and approved client-facing outputs are deliberately separate.
- One engagement, one workspace, and one connected body of evidence.
- Contextual workbenches over enterprise-style navigation and workflow ceremony.
- Modular monolith structure before distributed complexity.

## Run The Project

1. Use the Node version in [`.nvmrc`](.nvmrc).
2. Copy [`.env.example`](.env.example) to `.env.local` for local
   development. Only use synthetic fixture data.
3. Install the exact dependencies from the committed lockfile with `npm ci`.
   Use `npm install` only when intentionally changing dependencies.
4. Start the development server with `npm run dev`.
5. Run lint checks with `npm run lint`.
6. Run tests with `npm run test`.
7. Create a production build with `npm run build`.

## How Future Features Should Be Added

1. Identify the active-engagement workbench the capability belongs to before
   adding a route or a page.
2. Start in the relevant domain boundary under `packages/domain` and
   `packages/validation`.
3. Extend the repository interface or add a new repository-backed service
   rather than putting data logic in pages.
4. Shape page view models in feature selectors under `apps/web/src/features`;
   use an engagement projection rather than duplicating connected data.
5. Keep client-facing states and approval states explicit in the domain model.
6. Add focused tests around the new selector, repository, validation, or
   active-context slice before widening UI work.

## Intentionally Deferred

- Authenticated server-side API/database persistence and server-enforced
  engagement isolation.
- Managed evidence-file storage and authorized download delivery.
- External AI model integration and telemetry.
- Database migration, backup, monitoring, and deployment infrastructure.
- Client portal and delivery automation workflows.

The application intentionally fails rather than using in-memory fixtures in a
production release stage. See the
[production-readiness review](docs/operations/production-readiness.md) for the
next implementation sequence.
