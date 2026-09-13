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

## Product and domain rules

- Trion Fabric is an internal-first platform for evidence-led manufacturing
  transformation: Discover, Diagnose, Design, Deliver, Measure.
- Build for consultants, project leads, analysts, technical delivery staff, and
  management working across office and factory contexts. Fabric is not a generic
  CRM, project tracker, dashboard builder, chatbot, or document repository.
- Preserve connected relationships: client → site → area → process → systems,
  observations and evidence → findings/opportunities → initiatives/actions →
  outcomes and controlled outputs.
- Keep evidence, provenance, assurance, confidence, approval, and visibility
  explicit. Never invent client facts, evidence, values, or certainty.
- Treat internal working information and client-facing information as separate
  states. Draft, internal-review, approved, and shared are meaningful workflow
  boundaries; never expose internal notes by implication.

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
   visibility, or AI/output behaviour. Run the smallest relevant checks, then
   build when the change crosses module boundaries.
7. Before finishing, review domain fit, evidence integrity, internal/client
   visibility, accessibility, maintainability, and unnecessary duplication.

When guidance conflicts, preserve data integrity, evidence provenance, human
review, and existing repository conventions.
