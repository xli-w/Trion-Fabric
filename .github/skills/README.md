# Fabric skills

This directory contains focused, repository-native guidance for AI-assisted
development. The global rules are in
[../copilot-instructions.md](../copilot-instructions.md); each skill adds only
the specialised context needed for a task.

## Skills

| Skill | Use when |
| --- | --- |
| [product-context](product-context/SKILL.md) | Making product, domain, UX, or architecture decisions |
| [platform-refocus](platform-refocus/SKILL.md) | Implementing the workspace-centred direction change or simplifying existing surfaces |
| [trion-brand](trion-brand/SKILL.md) | Designing or reviewing Fabric visual language and copy |
| [domain-model](domain-model/SKILL.md) | Adding entities, relationships, or domain workflows |
| [internal-vs-client](internal-vs-client/SKILL.md) | Handling visibility, lightweight permissions, review, AI, or outputs |
| [feature-development](feature-development/SKILL.md) | Delivering a cross-cutting feature or refactor |
| [domain-development](domain-development/SKILL.md) | Changing types, statuses, rules, or domain behaviour |
| [ui-development](ui-development/SKILL.md) | Building React workbenches, routes, or interaction design |
| [data-modeling](data-modeling/SKILL.md) | Changing repositories, persistence, data integrity, or legacy data surfaces |
| [ai-development](ai-development/SKILL.md) | Adding contextual, evidence-grounded AI assistance |
| [site-walks](site-walks/SKILL.md) | Working on factory investigation and capture workflows |
| [diagnostics](diagnostics/SKILL.md) | Working on diagnostic workbenches, maturity, findings, or evidence |
| [opportunities](opportunities/SKILL.md) | Creating, analysing, prioritising, or approving transformation opportunities |
| [roadmap-delivery](roadmap-delivery/SKILL.md) | Sequencing opportunities into a transformation roadmap and measuring delivery |
| [outputs-reporting](outputs-reporting/SKILL.md) | Generating or reviewing the five controlled client outputs |
| [testing-validation](testing-validation/SKILL.md) | Planning or validating tests and quality gates |
| [debugging](debugging/SKILL.md) | Investigating a defect or unexpected behaviour |
| [code-review](code-review/SKILL.md) | Reviewing a change for correctness and workspace-centred Fabric fit |

## How to apply them

Start with `product-context` for product decisions. For work implementing the
direction change, always add `platform-refocus`, then only the skills relevant
to the affected workflow. For example, a Site Walk Workbench refactor uses
`platform-refocus`, `domain-model`, `site-walks`, `feature-development`,
`ui-development`, `data-modeling`, and `testing-validation`. An evidence-based
Current Understanding feature uses `platform-refocus`, `ai-development`,
`internal-vs-client`, `diagnostics`, `feature-development`, and
`testing-validation`.

Keep skills concise and non-duplicative. Update the narrowest skill when a
reusable rule changes, update the global file only for rules that apply to every
change, and keep both aligned with the actual codebase. A skill is guidance, not
a substitute for inspecting code or validating the implementation.
