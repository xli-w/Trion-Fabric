---
name: debugging
description: Use for reproducing, tracing, fixing, and regression-testing Fabric defects.
---

# Debugging

Use this workflow for defects and unexpected behaviour:

1. Reproduce the issue with the smallest useful case.
2. Identify whether it belongs to domain, validation, repository, selector,
   routing, UI, or build configuration.
3. Inspect the actual error, logs, inputs, and data flow.
4. Identify the root cause rather than treating a symptom.
5. Make the smallest appropriate fix using existing patterns.
6. Add or update a focused regression test where useful.
7. Re-run relevant tests, lint, and build checks.
8. Explain the cause, fix, and any remaining limitation.

Do not start with speculative rewrites, broad refactors, silent fallbacks, or
catch-all error handling that hides the failure.
