---
name: domain-development
description: Use for Fabric domain types, statuses, relationships, validation, and rules.
---

# Domain development

Use this skill for domain types, statuses, relationships, business rules, and
validation. Define the entity's purpose and lifecycle before adding fields.
Prefer the existing union constants and `BaseEntity` conventions over arbitrary
strings. Use explicit IDs and timestamps and validate both shape and references.

Trace all consumers before changing a type: fixtures, Zod schemas, repositories,
selectors, UI, and tests. Preserve backward compatibility where possible and
make status transitions deliberate. Keep rules deterministic and testable.
Avoid premature over-modeling, duplicated denormalised facts, and breaking
changes hidden behind casts. Consider future persistence without adding database
complexity to the current in-memory boundary.
