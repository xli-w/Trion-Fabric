# Fabric skills

This directory contains focused, repository-native guidance for AI-assisted
development. The global rules are in [../copilot-instructions.md](../copilot-instructions.md);
each skill adds only the specialised context needed for a task.

## Skills

| Skill | Use when |
| --- | --- |
| [product-context](product-context/SKILL.md) | Making product, domain, UX, or architecture decisions |
| [trion-brand](trion-brand/SKILL.md) | Designing or reviewing Fabric visual language and copy |
| [domain-model](domain-model/SKILL.md) | Adding entities, relationships, or domain workflows |
| [internal-vs-client](internal-vs-client/SKILL.md) | Handling visibility, approval, permissions, AI, or outputs |
| [feature-development](feature-development/SKILL.md) | Delivering a cross-cutting feature |
| [domain-development](domain-development/SKILL.md) | Changing types, statuses, rules, or domain behaviour |
| [ui-development](ui-development/SKILL.md) | Building or changing React screens and components |
| [data-modeling](data-modeling/SKILL.md) | Changing repositories, persistence, or data integrity |
| [ai-development](ai-development/SKILL.md) | Adding AI-assisted product capability |
| [site-walks](site-walks/SKILL.md) | Working on factory investigation and capture workflows |
| [diagnostics](diagnostics/SKILL.md) | Working on maturity, findings, or diagnostic logic |
| [opportunities](opportunities/SKILL.md) | Creating or prioritising transformation opportunities |
| [roadmap-delivery](roadmap-delivery/SKILL.md) | Turning opportunities into initiatives and measured delivery |
| [outputs-reporting](outputs-reporting/SKILL.md) | Generating or reviewing controlled client outputs |
| [testing-validation](testing-validation/SKILL.md) | Planning or validating tests and quality gates |
| [debugging](debugging/SKILL.md) | Investigating a defect or unexpected behaviour |
| [code-review](code-review/SKILL.md) | Reviewing a change for correctness and Fabric fit |

## How to apply them

Start with `product-context` for product decisions, then add only the skills
relevant to the work. For example, a site-walk feature uses
`domain-model`, `site-walks`, `feature-development`, `ui-development`,
`data-modeling`, and `testing-validation`. An AI summary uses
`ai-development`, `internal-vs-client`, `domain-model`, `feature-development`,
and `testing-validation`.

Keep skills concise and non-duplicative. Update the narrowest skill when a
reusable rule changes, update the global file only for rules that apply to every
change, and keep both aligned with the actual codebase. A skill is guidance, not
a substitute for inspecting code or validating the implementation.
