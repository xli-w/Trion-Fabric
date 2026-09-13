# Trion Fabric

Fabric is the foundation of Trion's internal transformation operating environment. This repository establishes the first architecture layer for a connected workspace that can support discovery, diagnostics, opportunity shaping, delivery planning, and controlled client outputs without collapsing into disconnected forms or static reports.

## What This Foundation Includes

- A runnable TypeScript web application shell for Trion's internal teams.
- A typed domain model covering clients, sites, engagements, site walks, evidence, opportunities, initiatives, actions, outputs, systems, and users.
- A data access boundary with an in-memory repository and validated development fixtures.
- Reusable UI primitives, design tokens, and a structured application layout.
- Initial pages for workspace, clients, engagements, site walks, opportunities, and outputs.
- Planned surfaces for sites, landscape, diagnosis, roadmap, and settings so future work lands in explicit domain boundaries.
- Documentation describing architecture, product principles, and early technical decisions.

## Chosen Stack

- React 18
- Vite 4
- TypeScript (strict)
- React Router 6
- Zod for runtime validation
- ESLint + Prettier
- Vitest for focused unit tests

This stack was selected to keep the repository runnable on the current local Node 14.18 environment while still providing a clean upgrade path to newer tooling once the workspace runtime is modernised.

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
  product/
tests/
```

## Core Product Principles

- Evidence before assumption.
- Structured information before documents.
- One source of truth for connected transformation knowledge.
- Human-reviewed AI outputs, never silent fact fabrication.
- Internal working data and client-shareable outputs are deliberately separate.
- Modular monolith structure before distributed complexity.

## Run The Project

1. Install the exact dependencies from the committed lockfile with `npm ci`. Use `npm install` only when intentionally changing dependencies.
2. Start the development server with `npm run dev`.
3. Run lint checks with `npm run lint`.
4. Run tests with `npm run test`.
5. Create a production build with `npm run build`.

## How Future Features Should Be Added

1. Start in the relevant domain boundary under `packages/domain` and `packages/validation`.
2. Extend the repository interface or add a new repository-backed service rather than putting data logic in pages.
3. Shape page view models in feature selectors under `apps/web/src/features`.
4. Keep client-facing states and approval states explicit in the domain model.
5. Add focused tests around the new selector, repository, or validation slice before widening UI work.

## Intentionally Deferred

- Real database persistence
- Authentication and permissions
- AI model integration
- Graph editing for the digital landscape
- Configurable diagnostic engine
- Document generation engine
- Client portal
- Delivery automation workflows

See the architecture notes in `docs/` for the rationale behind the structure and the next implementation seam.