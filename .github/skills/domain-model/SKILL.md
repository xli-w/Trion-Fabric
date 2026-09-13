---
name: domain-model
description: Use when adding Fabric entities, relationships, or domain workflows.
---

# Domain model

Use this skill whenever entities or relationships change. The canonical types
are in `packages/domain/src/model.ts` and validation is in
`packages/validation/src/fabric.ts`.

The model is connected: a `Client` has `Site` and `Engagement` records; a site
contains `Area`, `Process`, and `OperationalSystem`; an engagement covers sites
and a transformation stage; a `SiteWalk` investigates a site/area/process;
`Observation` records what was learned; `Evidence` supports records with
provenance; findings and diagnostics lead to `Opportunity`; opportunities lead
to `Initiative`, `ActionItem`, milestones and outcomes; `Output` exposes only
approved structured information.

Use stable IDs, ISO timestamps, controlled status unions, and explicit foreign
keys. Preserve links instead of copying the same fact into feature-specific
records. Opportunities are recommendations, not ordinary tasks. Reports are
projections of structured data, never the primary store.

Before changing a type, inspect fixtures, validation, repository consumers,
selectors, routes, and tests. Do not add disconnected CRUD entities or mix
internal notes with approved client content.
