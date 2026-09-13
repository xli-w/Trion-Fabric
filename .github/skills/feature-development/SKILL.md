---
name: feature-development
description: Use the standard workflow for delivering a new or cross-cutting Fabric feature.
---

# Feature development

Use this workflow for a new or cross-cutting feature.

1. **Understand:** inspect related domain types, validation, repository/service
   seams, selectors, routes, UI primitives, fixtures, docs, and tests.
2. **Plan:** state the user problem, entities and relationships, screens,
   validation, visibility/permissions, tests, and deliberately deferred scope.
3. **Implement:** follow existing aliases and modular boundaries; keep business
   logic in selectors/services/domain code rather than page markup.
4. **Validate:** run focused tests, `npm run lint`, and `npm run build` when
   applicable; manually check navigation and key empty/error/success states.
5. **Review:** check evidence/provenance, internal/client boundaries, responsive
   UX, accessibility, error handling, duplication, and maintainability.

Keep the change focused. Do not refactor unrelated areas or create a framework
just to support the feature.
