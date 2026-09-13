---
name: code-review
description: Use for reviewing Fabric changes for correctness, safety, and transformation-model fit.
---

# Code review

Use this checklist when reviewing a change. Ask whether it fits Fabric's
transformation model, preserves evidence and provenance, maintains the
internal/client boundary, and reuses existing patterns.

Review correctness, domain relationships, data integrity, security,
visibility/approval, UX consistency, accessibility, performance,
maintainability, test coverage, error handling, and unnecessary complexity.
Check that AI output is scoped, structured, validated, reviewable, and
provider-independent. Check that outputs use approved information only.

Prioritise concrete regressions and high-confidence risks. Verify claims against
the changed code and tests; do not request unrelated cleanup or generic
refactors. A good review explains impact and points to a focused remedy.
