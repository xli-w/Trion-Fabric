---
name: ai-development
description: Use for safe, contextual, structured, and auditable AI assistance inside Fabric workbenches.
---

# AI development

Use this skill for AI capability inside Fabric. AI is a contextual,
provider-independent intelligence layer over structured transformation data,
not an uncontrolled chatbot or a primary product destination.

Start with a concrete action at the active client, site, engagement, or record:
structure a site-walk note, summarise what was found, find missing evidence,
suggest investigation questions, draft diagnostic rationale, detect duplicates,
suggest a potential improvement, suggest roadmap sequencing, or draft an
executive summary from approved findings. Put the assistance where the
consultant is already working; do not create a giant "AI Assistant" route or
force normal work through a generic chat flow.

Pass only the relevant context (client, site, engagement, process, observation,
evidence, diagnostic, opportunity, initiative, and applicable approval state).
The Current Understanding view may synthesise what is known, interpreted
patterns, uncertainty, friction, strengths, priority opportunities, and the
next action, but each claim must remain grounded in underlying evidence and be
clearly distinguishable from human-reviewed fact.

Require structured, schema-validated output and distinguish `suggested`,
`reviewed`, `approved`, and `rejected`. AI must not invent facts, evidence,
financial values, or certainty, and must not approve its own conclusions.
Surface uncertainty and missing context. Use a service boundary so providers
can change without rewriting features.

Keep provider or prompt configuration in the internal/admin layer rather than
the primary consulting workflow. Where appropriate, audit task, scoped context,
provider/model, timestamp, output, review status, and approving/rejecting user.
Test malformed output, provider failure, empty or cross-engagement context,
provenance, review state, and the internal/client boundary.
