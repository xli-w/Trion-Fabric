---
name: testing-validation
description: Use for testing domain, UI, data, AI, and output correctness in Fabric.
---

# Testing and validation

Use this skill when adding or reviewing tests. Match tests to risk rather than
adding ceremony for trivial changes.

- **Domain:** relationships, validation, controlled values, transitions, and
  business rules.
- **UI:** navigation, forms, loading/empty/error/success states, accessibility,
  and responsive-critical behaviour.
- **Data:** invalid references, repository isolation, persistence/migration
  behaviour, and data integrity.
- **AI:** scoped context, schema validation, malformed output, provider
  failure, provenance, and review state.
- **Outputs:** approved versus draft data, source references, and visibility.

Use the existing Vitest setup and focused tests under `tests/`. Run the
smallest relevant command, then `npm run lint` and `npm run build` when the
change warrants broader verification. Do not weaken validation to make a test
pass.
