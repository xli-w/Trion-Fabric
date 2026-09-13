---
name: ai-development
description: Use for safe, contextual, structured, auditable AI capabilities in Fabric.
---

# AI development

Use this skill for AI capability inside Fabric. AI is a contextual,
provider-independent intelligence layer over structured transformation data,
not an uncontrolled chatbot.

Pass only relevant context (client, site, engagement, process, observation,
evidence, diagnostic, opportunity, or initiative). Prefer explicit tasks:
structure site-walk notes, find missing evidence, suggest questions, detect
duplicates, draft a finding, classify an opportunity, or draft an executive
summary. Do not make every feature depend on general chat.

Require structured, schema-validated output and distinguish `suggested`,
`reviewed`, `approved`, and `rejected`. AI must not invent facts, evidence,
financial values, or certainty, and must not approve its own conclusions.
Surface uncertainty and missing context. Use a service boundary so providers
can change without rewriting features.

Where appropriate, audit task, scoped context, provider/model, timestamp,
output, review status, and approving/rejecting user. Test malformed output,
provider failure, empty context, provenance, and the internal/client boundary.
