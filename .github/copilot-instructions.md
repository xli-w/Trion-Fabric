# Trion Fabric Copilot Instructions

These instructions apply to all work in this repository. Load the focused skill in
`.github/skills/` when the task matches its scope; do not copy its content into a
new instruction file.

## Repository baseline

- Fabric is a React 18 + Vite 4 + strict TypeScript application.
- The web app lives in `apps/web`; shared domain, validation, UI, and config code
  lives in `packages/`.
- Use the existing path aliases (`@app`, `@domain`, `@ui`, `@validation`, `@config`).
- Data access crosses `FabricRepository`; development data is validated fixtures
  served by the in-memory repository. Do not put fixture data or repository calls
  in presentation components.
- Reuse the existing UI primitives and Fabric tokens before adding new ones.
- Existing checks are `npm run lint`, `npm run test`, and `npm run build`.

## Product direction

- Fabric is Trion's internal, evidence-led transformation workbench for a small
  consultancy. It is designed for one or two consultants working deeply with one
  active client engagement, not for enterprise consultancy operations.
- Centre the human workflow on a persistent active client, site, and engagement.
  The primary experience is `Clients -> Workspace | Understand | Analyse | Plan &
  Output`; secondary records belong in the relevant contextual workspace rather
  than becoming global modules.
- Preserve the connected analytical model: client, site, areas, processes,
  systems, people, data, site walks, observations, evidence, diagnostics,
  findings, opportunities, initiatives, benefits, and controlled outputs. The
  model may remain richer than the interface.
- Prefer workbenches over administrative page sequences: Site Walk, Diagnostic,
  and Transformation workbenches should make the next useful action, relevant
  evidence, and cross-navigation clear. A workspace should surface current
  position, current understanding, and the next best action rather than a
  decorative dashboard.
- Keep methodology, AI, evidence, systems, findings, actions, milestones,
  activity, knowledge, and configuration contextual or administrative unless
  there is a strong user-facing reason to promote them.
- Do not build or retain enterprise-only behaviour without a demonstrated Trion
  need: portfolio dashboards, CRM pipelines, complex team/resource management,
  elaborate approval chains, notification centres, client collaboration, or
  permission matrices.
- Use a lightweight permission model: Trion User and Trion Admin, with possible
  future read-only client access to approved outputs. Preserve meaningful
  visibility, review, approval, provenance, and audit data without adding
  operational ceremony.
- AI is contextual assistance, not a primary destination. Scope it to the record
  and evidence at hand, validate its structured output, and retain human review.
- Controlled client outputs are the Digital Landscape Map, Maturity Scorecard,
  Opportunity and Action Register, Transformation Roadmap, and Executive
  Summary. The dominant workflow is review, approve, then export.

## Direction-change refactors

For a substantial refactor under the workspace-centred direction, load
`platform-refocus` in addition to the relevant specialised skills.

1. Audit affected navigation, screens, entities, services, workflows,
   permissions, dashboards, and duplicate concepts before deleting or moving
   anything. Classify each as Keep, Simplify, Hide/Move, Deprecate, or Remove
   and record the reason.
2. Define the replacement information architecture and active-engagement context
   before changing routes or navigation. Do not merely hide old modules behind
   menus or leave duplicate workflows after a replacement is live.
3. Preserve useful analytical architecture and data compatibility while reducing
   human-facing complexity. Delete or archive only after the replacement works
   and no required workflow depends on the old surface.
4. Verify the consultant journey: select a client and active engagement,
   understand the situation, capture a site walk, assess maturity, develop and
   prioritise opportunities, build a roadmap, and review, approve, and export
   the core outputs.

## Engineering rules

1. Inspect relevant domain types, selectors, repository interfaces, components,
   routes, tests, and docs before changing code.
2. Reuse existing patterns and keep business logic out of presentation where
   practical. Do not introduce a competing framework or unnecessary abstraction.
3. Keep relationships and validation intact. Use strict types, controlled values,
   stable IDs, ISO timestamps, and explicit error handling.
4. Make focused changes. Include loading, empty, error, success, and responsive
   states for user-facing work, as appropriate.
5. For AI features, use a provider-independent service boundary, scoped context,
   structured validated output, provenance, auditability, and human review.
6. Add or update focused tests for changed domain rules, selectors, validation,
   visibility, active-context behaviour, or AI/output behaviour. Run the
   smallest relevant checks, then build when the change crosses module
   boundaries.
7. Before finishing, review workspace fit, evidence integrity, internal/client
   visibility, accessibility, maintainability, and unnecessary duplication.

When guidance conflicts, preserve data integrity, evidence provenance, human
review, and existing repository conventions.
