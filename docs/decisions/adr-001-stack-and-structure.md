# ADR 001: Initial Stack And Repository Structure

## Status

Accepted

## Context

Fabric needs a maintainable first implementation layer that is immediately runnable in the current workspace. The local environment currently provides Node 14.18 and npm 6.14, which removes newer Next.js-based options from consideration without an environment upgrade.

The repository also needs explicit domain and application boundaries from the beginning because the product is expected to evolve into a serious internal operating platform.

## Decision

Adopt a Vite 4 + React 18 + TypeScript architecture with package-style source boundaries in a single repository package.

- `apps/web` hosts the internal application shell.
- `packages/domain` owns business entities and repository contracts.
- `packages/validation` owns runtime data validation.
- `packages/ui` owns reusable presentational primitives and tokens.
- `packages/config` owns navigation and product metadata.

## Consequences

Positive:

- The repository is runnable on the current local runtime.
- The modular monolith shape is clear from day one.
- Repositories, selectors, and pages remain separated.
- Validation and information-governance concerns are established early.

Trade-offs:

- The project does not yet use newer framework features that require a newer Node baseline.
- Server-driven routing, authentication hooks, and data loaders remain deferred until the runtime is modernised or a backend is introduced.

## Review Trigger

Revisit this decision when the team upgrades to Node 20 LTS or when Fabric needs authenticated persistence and server-managed workflows.