# Fabric Foundation Architecture

## System Intent

Fabric is being established as Trion's internal transformation operating environment. The platform is not a static dashboard and it is not a document generator with forms attached. It is a structured knowledge system for connected transformation work across discovery, diagnosis, design, delivery, and measurement.

## Architectural Shape

The current repository is a modular monolith with explicit boundaries:

- `apps/web` contains the internal workspace application shell and feature surfaces.
- `packages/domain` defines the stable business language and repository contracts.
- `packages/validation` enforces runtime shape checks for trusted data entry points.
- `packages/ui` holds reusable presentational primitives and design tokens.
- `packages/config` contains product metadata and navigation configuration.

This structure keeps domain logic out of route components while avoiding premature distributed-system overhead.

## Data Flow

The current flow is deliberate:

```text
Page
  -> feature selector
  -> repository-backed data context
  -> repository contract
  -> validated dataset
```

Development fixtures currently back the repository. Replacing this with a database or API should happen at the repository layer without rewriting the page surfaces.

## Domain Boundaries

The initial typed model covers:

- Clients
- Sites
- Areas
- Processes
- Systems
- Engagements
- Site walks
- Observations
- Evidence
- Opportunities
- Initiatives
- Actions
- Outputs
- Users

The model already includes visibility, approval, AI status, and evidence provenance so future features do not need to retrofit these distinctions later.

## Internal And Client-Shareable Information

Fabric separates internal working data from controlled outputs at the model layer:

- observations and evidence can stay internal
- opportunities and outputs carry approval states
- outputs can be explicitly marked client-shareable

This avoids the common mistake of treating all captured information as publishable.

## AI Extension Seam

No AI provider is integrated yet. The current architecture reserves room for future AI capabilities by making provenance, approval, and human review first-class concerns in the domain model.

When AI work begins, the preferred seam is:

```text
feature request
  -> context builder
  -> prompt/task definition
  -> model provider adapter
  -> structured response validation
  -> human review
  -> approved domain update
```

## Next Feature Guidance

The next feature should not start in the page component. The preferred order is:

1. extend the domain type or repository contract
2. add validation
3. add or update repository-backed development data
4. add selectors or feature services
5. render the surface
6. add a focused test