---
name: code-review
description: Use for reviewing Fabric changes for correctness, safety, and workspace-centred transformation-model fit.
---

# Code review

Use this checklist when reviewing a change. Ask whether it fits Fabric's
workspace-centred transformation model, preserves evidence and provenance,
maintains the internal/client boundary, and reuses existing patterns.

For routes, navigation, screens, workflows, permissions, dashboards, or
administration, check that the change serves a consultant working in an active
client/site/engagement context. The primary workflow should remain Workspace,
Understand, Analyse, and Plan & Output. Secondary entities should be
contextual, not top-level modules by default; AI and methodology should assist
work rather than dominate it.

For a direction-change refactor, require a clear replacement for each affected
legacy surface. Flag changes that merely hide an enterprise workflow, leave
dead duplicate routes, flatten useful analytical data, lose cross-navigation,
or introduce CRM, project-management, resource-planning, portfolio, or
complex approval behaviour without a real need. Verify that lightweight
permissions and review states still protect controlled outputs.

Review correctness, domain relationships, data integrity, security,
visibility/approval, UX consistency, accessibility, performance,
maintainability, test coverage, error handling, and unnecessary complexity.
Check that AI output is scoped, structured, validated, reviewable, and
provider-independent. Check that outputs use approved information only.

Prioritise concrete regressions and high-confidence risks. Verify claims against
the changed code and tests; do not request unrelated cleanup or generic
refactors. A good review explains impact and points to a focused remedy.
