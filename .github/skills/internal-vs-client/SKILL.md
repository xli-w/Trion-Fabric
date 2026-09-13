---
name: internal-vs-client
description: Use for Fabric visibility, approval, permissions, AI, and output boundaries.
---

# Internal versus client-facing information

Use this skill for forms, details, permissions, AI, reporting, and workflow
states. Fabric is primarily an internal workspace.

Internal material includes raw notes, unverified observations, assumptions,
draft analysis, AI suggestions, internal calculations, risks, and delivery
commentary. Client-facing material includes approved findings, recommendations,
roadmaps, summaries, reports, dashboards, and benefits.

Make visibility and approval explicit using the existing concepts
(`visibility`, `approvalState`, `aiStatus`, and output state). Preserve source
references and who/when reviewed information. A record being useful internally
does not make it shareable. Do not infer client visibility from the presence of
an entity, and do not render internal notes in an output without an explicit
approved projection.

Design future permissions cleanly: keep policy decisions at a service/domain
boundary, make transitions deliberate, and test that drafts and rejected or
internal-only material cannot enter controlled outputs.
