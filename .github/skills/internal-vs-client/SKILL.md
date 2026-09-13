---
name: internal-vs-client
description: Use for Fabric visibility, lightweight permissions, review, AI, and controlled-output boundaries.
---

# Internal versus client-facing information

Use this skill for forms, details, permissions, AI, reporting, and workflow
states. Fabric is primarily an internal workspace.

Internal material includes raw notes, unverified observations, assumptions,
draft analysis, AI suggestions, internal calculations, risks, and delivery
commentary. Client-facing material includes approved findings,
recommendations, roadmaps, summaries, reports, and benefits.

Make visibility and approval explicit using the existing concepts
(`visibility`, `approvalState`, `aiStatus`, and output state). Preserve source
references and who/when reviewed information. A record being useful internally
does not make it shareable. Do not infer client visibility from the presence of
an entity, and do not render internal notes in an output without an explicit
approved projection.

Keep the permission model proportionate: normal Trion work belongs to a Trion
User; system-level configuration belongs to a Trion Admin; any future client
access is limited and read-only for approved outputs. Do not add elaborate role
matrices, approval chains, review queues, or collaboration flows unless a
demonstrated requirement justifies them. Simple review -> approve -> export
behaviour can coexist with rich provenance and audit records.

Keep policy decisions at a service/domain boundary, make transitions deliberate,
and test that drafts, rejected suggestions, internal-only material, and
cross-engagement records cannot enter controlled outputs.
