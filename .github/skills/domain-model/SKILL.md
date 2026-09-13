---
name: domain-model
description: Use when adding Fabric entities, relationships, or lightweight workflows for active-engagement workbenches.
---

# Domain model

Use this skill whenever entities or relationships change. The canonical types
are in `packages/domain/src/model.ts` and validation is in
`packages/validation/src/fabric.ts`.

The model is connected around the consulting context: a `Client`, its `Site`
records, and an `Engagement` provide the active transformation context; a site
contains `Area`, `Process`, and `OperationalSystem`; a `SiteWalk` investigates
a site/area/process; `Observation` records what was learned; `Evidence`
supports records with provenance; diagnostics and findings lead to
`Opportunity`; opportunities lead to `Initiative`, `ActionItem`, milestones,
and outcomes; `Output` exposes only approved structured information.

Preserve this analytical depth while simplifying the visible workflow. Active
client and engagement selection is workspace/user context, not a reason to
duplicate every record or create a global singleton domain entity. Keep
supporting models where they preserve valuable relationships, but do not add
first-class enterprise concepts for assignments, workflow instances, review
queues, notifications, resource allocation, or role matrices without a real
Trion need.

Use stable IDs, ISO timestamps, controlled status unions, and explicit foreign
keys. Preserve links instead of copying the same fact into feature-specific
records. Opportunities are recommendations, not ordinary tasks. Reports are
projections of structured data, never the primary store. Prefer lightweight,
intentional review and approval transitions over long operational state chains.

Before changing a type, inspect fixtures, validation, repository consumers,
selectors, routes, and tests. For a direction-change simplification, classify
the existing surface before removing a model or relationship. Do not add
disconnected CRUD entities or mix internal notes with approved client content.
