# Fabric Foundation Architecture

## System Intent

Fabric is Trion's internal transformation analysis workbench. It is not a
static dashboard, a document generator with forms attached, or an enterprise
consultancy platform. It is a structured knowledge system for one or two
consultants to carry connected transformation work through understanding,
analysis, planning, and controlled outputs.

## Architectural Shape

The current repository is a modular monolith with explicit boundaries:

- `apps/web` contains the internal workspace application shell and feature surfaces.
- `packages/domain` defines the stable business language, activity events, access policy, and repository contracts.
- `packages/validation` enforces runtime shape checks for trusted data entry points.
- `packages/ui` holds reusable presentational primitives and design tokens.
- `packages/config` contains product metadata and navigation configuration.

This structure keeps domain logic out of route components while avoiding premature distributed-system overhead.

## Workspace-Centred Interaction Model

The user-facing architecture is deliberately smaller than the domain model:

```text
Clients
Active engagement
  Workspace
  Understand
  Analyse
  Plan & Output
```

The selected active engagement is persisted per development user and resolves
the active client and site context. An engagement workspace projection narrows
the authorised dataset for normal workbench pages without changing or
denormalising the source model. Direct links to a site walk, opportunity,
initiative, output, evidence, finding, or landscape item restore the related
active engagement.

Site walks, evidence, systems, findings, actions, milestones, methodology, AI,
knowledge, and configuration remain valuable concepts, but are contextual
records or utility settings rather than primary product modules. This lets the
application retain analytical depth without forcing consultants through
enterprise navigation or workflow sequences.

## Data Flow

The current flow is deliberate:

```text
Page
  -> active-engagement projection, where appropriate
  -> feature selector
  -> repository-backed data context
  -> repository contract
  -> validated dataset
```

Development fixtures currently back the repository. Replacing this with a
database or API should happen at the repository layer without rewriting the
page surfaces. The browser project now rejects fixture storage for a production
release stage; it does not include a production repository adapter.

## Domain Boundaries

The initial typed model covers:

- Clients
- Sites
- Areas
- Processes
- Systems
- Engagements
- Site walks
- Observations
- Evidence
- Opportunities
- Initiatives
- Actions
- Outputs
- Users

The model already includes visibility, approval, AI status, evidence provenance, and actor-attributed activity events so future features do not need to retrofit these distinctions later.

## Internal And Client-Facing Information

Fabric separates internal working data from controlled outputs at the model layer:

- observations and evidence can stay internal
- opportunities and outputs carry approval and explicit visibility states
- draft client-facing material cannot be treated as approved client-facing content
- approved outputs can only use approved, engagement-scoped source material
- archived records remain explicit rather than being silently deleted

Revising approved opportunity content creates an internal draft revision, which
must be reviewed again before it can become client-facing. Records already
supporting an approved output or delivery initiative must be superseded by a
new opportunity instead.

This avoids the common mistake of treating all captured information as publishable.

## Workspace Activity And Access

The internal workbench records important changes as reusable activity events
with an actor, timestamp, affected entity, action, and metadata. The
repository-backed data context applies the domain access policy before saving
changes, so a button is not the sole permission boundary. It exposes immutable
UI snapshots and keeps the authorization actor separate from those snapshots.
The standard workspace view projects data to the selected actor's accessible
engagements, then the active-engagement projection narrows normal workbench
views to one connected client context. This prevents normal route enumeration
from exposing another engagement's records and keeps the consultant from
repeatedly reselecting context.

The visible product vocabulary is intentionally lightweight: Trion User and
Trion Admin, with possible future read-only client access to approved outputs.
The current development workspace retains granular simulated roles to exercise
the enforcement boundary; that selector is not authentication. A production
repository must bind the actor to a server-authenticated session and enforce the
same engagement boundary for every read and write.

## AI Extension Seam

No AI provider is integrated yet. The current architecture reserves room for future AI capabilities by making provenance, approval, and human review first-class concerns in the domain model. Controlled report downloads are structured for AI ingestion, but they remain context for manual preparation rather than a model integration or authorization grant.

When AI work begins, the preferred seam is:

```text
feature request
  -> context builder
  -> prompt/task definition
  -> model provider adapter
  -> structured response validation
  -> human review
  -> approved domain update
```

## Next Feature Guidance

The next feature should not start in the page component. The preferred order is:

1. extend the domain type or repository contract
2. add validation
3. add or update repository-backed development data
4. add selectors or feature services
5. render the surface
6. add a focused test
