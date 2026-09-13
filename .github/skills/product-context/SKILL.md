---
name: product-context
description: Use for Trion and Fabric product, domain, UX, or architecture decisions under the workspace-centred operating model.
---

# Product context

Use this skill for product, domain, UX, and architecture decisions.

Trion is a small, specialist manufacturing digitalisation and operational
transformation consultancy for UK manufacturing SMEs. Its work connects people,
processes, technology, systems, data, and operational performance in real
production, machining, assembly, quality, logistics, planning, maintenance,
and engineering environments.

Fabric is Trion's internal transformation analysis workbench. It lets a
consultant move from an initial site walk to structured understanding,
diagnostic, digital landscape, opportunities, roadmap, and controlled client
outputs while keeping the evidence and reasoning connected. It is designed for
one or two practitioners working deeply with an active client engagement, not
for a large consultancy operation.

The human-facing product model is:

```text
Client -> active site and engagement
  Workspace -> Understand -> Analyse -> Plan & Output
```

Build for the consultant doing the work. Make the active client, site, and
engagement persistent, surface what is currently understood and what should
happen next, and use contextual workbenches instead of administrative module
chains. The data model may stay rich even where the interface becomes simpler.

Fabric is not a generic CRM, project-management suite, portfolio dashboard,
resource planner, chatbot, document store, or client collaboration platform.
Avoid enterprise workflows, large role matrices, elaborate approvals,
notification centres, and navigation that exposes every backing entity.
Prefer connected structured information and decision-useful views over
disconnected forms, dashboards, and reports.

Every decision must preserve the distinction between internal working material
and controlled client-facing content. AI can assist at the point of work, but
important conclusions remain attributable, evidence-linked, reviewable, and
human-approved. For direction-change refactors, also load
`platform-refocus`.
