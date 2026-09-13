---
name: testing-validation
description: Use for testing domain, UI, data, AI, and controlled-output correctness in Fabric's simplified workbench workflows.
---

# Testing and validation

Use this skill when adding or reviewing tests. Match tests to risk rather than
adding ceremony for trivial changes.

- **Domain:** relationships, validation, controlled values, lightweight review
  and approval transitions, and business rules.
- **Active context:** client/site/engagement selection, persistence or explicit
  absence of selection, direct routes, engagement switching, and isolation from
  another client's data.
- **UI:** simplified primary navigation, contextual access to secondary records,
  cross-navigation, workbench flows, Next Action, Current Understanding,
  loading/empty/error/success states, accessibility, and responsive-critical
  behaviour.
- **Data:** invalid references, repository isolation, persistence/migration
  behaviour, deprecation/removal compatibility, and data integrity.
- **AI:** scoped active-engagement context, schema validation, malformed output,
  provider failure, provenance, evidence grounding, and review state.
- **Outputs:** approved versus draft data, source references, active-engagement
  scope, visibility, and review -> approve -> export controls.

For a direction-change refactor, test the replacement journey rather than only
the individual moved screens: open an active engagement, understand the
situation, capture evidence, assess maturity, prioritise an opportunity, place
it on the roadmap, and prepare a controlled output. Confirm that retired
workflows no longer appear as confusing duplicate routes.

Use the existing Vitest setup and focused tests under `tests/`. Run the
smallest relevant command, then `npm run lint` and `npm run build` when the
change warrants broader verification. Do not weaken validation to make a test
pass.
