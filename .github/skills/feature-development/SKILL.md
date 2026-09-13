---
name: feature-development
description: Use the standard workflow for delivering a workspace-centred Fabric feature or cross-cutting refactor.
---

# Feature development

Use this workflow for a new or cross-cutting feature.

1. **Orient:** identify the active client/site/engagement context and the
   workspace it belongs to: Workspace, Understand, Analyse, or Plan & Output.
   Inspect related domain types, validation, repository/service seams,
   selectors, routes, UI primitives, fixtures, docs, and tests.
2. **Frame the problem:** state the consultant task, the evidence and reasoning
   it needs, the contextual entry and exit points, affected entities and
   relationships, visibility/approval, and deliberately deferred scope. Do not
   create a top-level module merely because a new record type exists.
3. **Audit before structural refactors:** for a route, navigation, dashboard,
   workflow, permission, or administration change, load `platform-refocus` and
   classify the affected legacy surfaces before replacing them. Define the
   replacement journey and retain useful data architecture.
4. **Implement:** follow existing aliases and modular boundaries; keep business
   logic in selectors/services/domain code rather than page markup. Prefer a
   contextual workbench, meaningful next action, and cross-navigation over
   additional workflow stages, dashboards, or enterprise administration.
5. **Validate:** run focused tests, `npm run lint`, and `npm run build` when
   applicable. Manually check active-context persistence, navigation, relevant
   empty/error/success states, responsive behaviour, and the route from
   evidence to the next decision.
6. **Review:** check evidence/provenance, internal/client boundaries,
   lightweight permissions, accessibility, duplication, and whether the result
   helps a single consultant do real client work without operational ceremony.

Keep the change focused. Do not refactor unrelated areas or create a framework
just to support the feature.
