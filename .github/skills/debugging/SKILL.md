---
name: debugging
description: Use for reproducing, tracing, fixing, and regression-testing defects in Fabric's active-engagement workbenches.
---

# Debugging

Use this workflow for defects and unexpected behaviour:

1. Reproduce the issue with the smallest useful case, including the selected
   client, site, engagement, route, and relevant visibility/review state.
2. Identify whether it belongs to active-context selection, domain, validation,
   repository, selector, routing, workbench UI, legacy/duplicate workflow, or
   build configuration.
3. Inspect the actual error, logs, inputs, data flow, and contextual
   cross-navigation. Check direct routes, switching engagements, and missing
   active context where relevant.
4. Identify the root cause rather than treating a symptom. Do not paper over a
   stale enterprise-style surface when the replacement workbench is the real
   source of ambiguity.
5. Make the smallest appropriate fix using existing patterns and preserve
   evidence, provenance, relationships, and controlled-output boundaries.
6. Add or update a focused regression test where useful.
7. Re-run relevant tests, lint, and build checks.
8. Explain the cause, fix, and any remaining limitation.

Do not start with speculative rewrites, broad refactors, silent fallbacks, or
catch-all error handling that hides the failure.
