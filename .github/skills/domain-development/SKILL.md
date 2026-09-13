---
name: domain-development
description: Use for Fabric domain types, statuses, relationships, validation, and rules in simplified workbench workflows.
---

# Domain development

Use this skill for domain types, statuses, relationships, business rules, and
validation. Define the entity's purpose and lifecycle before adding fields.
Prefer the existing union constants and `BaseEntity` conventions over arbitrary
strings. Use explicit IDs and timestamps and validate both shape and references.

Model the evidence-led transformation work, not enterprise operational
ceremony. A new rule should improve the active engagement's understanding,
analysis, roadmap, or controlled output. Prefer direct relationships and
small, explainable state transitions for capture, review, approval, and
completion over assignment, escalation, queue, notification, or multi-level
workflow state machines.

Trace all consumers before changing a type: fixtures, Zod schemas, repositories,
selectors, UI, and tests. Preserve backward compatibility where possible and
make status transitions deliberate. When simplifying a legacy model, preserve
provenance and relationships until the replacement path is verified; do not
delete a useful analytical structure just because it no longer deserves a
primary UI surface.

Keep rules deterministic and testable. Avoid premature over-modeling,
duplicated denormalised facts, and breaking changes hidden behind casts.
Consider future persistence without adding database complexity to the current
in-memory boundary.
