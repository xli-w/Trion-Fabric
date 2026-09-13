---
name: ui-development
description: Use for React workbenches, routes, and interaction design in the active-engagement Fabric workspace.
---

# UI development

Use this skill for React pages, components, routes, and interaction design.
Reuse `packages/ui` primitives, Fabric tokens, `AppShell`, page headers, cards,
badges, tables, and existing feature selectors before creating new patterns.

Design the primary navigation around Clients and the selected active engagement:
Workspace, Understand, Analyse, and Plan & Output. Keep the client, site, and
engagement context visible and persistent across routes. Systems, evidence,
findings, actions, milestones, methodology, AI, knowledge, and configuration
should normally open contextually from the relevant workbench, search result,
detail panel, or settings area rather than becoming primary destinations.

Keep pages focused on composition; put data shaping in feature selectors and
access in the repository/context boundary. Workspace views should make current
position, Current Understanding, priority work, and a real Next Action obvious.
Use Site Walk, Diagnostic, and Transformation workbenches to connect evidence,
reasoning, decisions, and the next step without forcing a consultant through
administrative page sequences.

Prefer information-dense, decision-useful views over decorative charts or
generic dashboards. A diagnostic dimension should drill into its evidence and
reasoning; an opportunity should lead to its supporting evidence, priority,
roadmap placement, and next step. Preserve deep linking and clear back paths
without repeatedly making the user choose their client.

Handle loading, empty, error, success, disabled, and responsive states as
appropriate. Use semantic HTML, keyboard interaction, visible focus, labels,
usable tables, and status text that does not rely on colour alone. Avoid giant
components, nested modal flows, enterprise administration patterns, decorative
charts, and speculative UI for deferred capabilities.
