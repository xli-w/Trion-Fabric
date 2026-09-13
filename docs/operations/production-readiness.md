# Fabric production-readiness review

## Current decision

Fabric is ready for controlled internal workflow validation, demonstrations, and
development with synthetic fixture data. It is **not approved to hold live
client data in production** until it has a durable, authenticated repository
implementation and the operational controls listed below.

The current Vite application intentionally uses an in-memory fixture repository.
That repository is reset on reload and is packaged into the browser, so it
cannot enforce a real security boundary.

## Capabilities ready for controlled internal use

- Connected workflow from client and site context through preliminary site walk,
  diagnostic, opportunity, initiative, roadmap, and governed output.
- Runtime validation for core references, approval transitions, version lineage,
  archive-only deletion behaviour, and preliminary-walk promotion.
- Permission policy and audited mutation enforcement at the
  `FabricRepository` persistence seam.
- Standard workspace projections that remove inaccessible engagement, client,
  site, evidence, output, and delivery records for the selected workspace
  actor.
- Client-safe output projections, source approval checks, review comments, and
  frozen report snapshots.
- Markdown and AI-ingestible JSON report downloads with source and complete
  content fingerprints recorded in export provenance.
- Retry affordances for repository-load failures, a generic application error
  boundary, and explicit confirmation before output archival or knowledge
  retirement.
- CI validation for lint, tests, and the production build.

## Security boundary and known limitations

### Authentication and authorization

The user selector is a development simulation, not authentication. The browser
selects an in-memory user, and the browser also receives development fixtures.
The engagement access projection prevents normal pages and route identifiers
from showing data outside the selected actor's engagement scope, but it is
defence in depth only. It is not protection against browser tools, a modified
request, or a malicious client.

Before using real client data:

1. Implement SSO or another centrally managed identity provider.
2. Bind the Fabric actor to the authenticated server session rather than a
   client-side selector.
3. Implement the `FabricRepository` API/database adapter on the server.
4. Apply the same role and engagement checks before every read and write,
   including direct record lookup, search, download, export, and file access.
5. Make unauthorised records indistinguishable from absent records in client
   responses, while retaining server-side security audit events.

### Controlled outputs

Every editorial narrative now records the selected approved sources that
support it. An approved or published output requires each narrative reference
to be selected, engagement-scoped, approved, client-safe, and retained in the
frozen report section's citations. Human review remains essential: a citation
establishes traceability, not automatic factual verification.

Each report snapshot has:

- a source fingerprint for the selected source state; and
- a content fingerprint over the complete frozen snapshot, including rendered
  editorial text.

Each export audit record retains both fingerprints. A changed narrative can no
longer appear as an unchanged export provenance record.

### Evidence files and secrets

Evidence `fileReference` values are limited to managed-storage keys such as
`evidence/northbank/handover-photo-01`. Local paths, direct URLs, parent
directory traversal, and credentials are not accepted. A future server adapter
must resolve a key only after it authorizes the requester, ideally with a
short-lived signed download URL.

Only public build-time values may use the `VITE_` prefix. Vite embeds those
values in the browser bundle. Do not put API keys, database credentials,
identity secrets, signed URLs, or client data in `.env` files that are exposed
to the application. Store production secrets in the hosting platform's secret
manager and pass them only to server-side services.

### Error handling and monitoring

The top-level error boundary displays generic recovery guidance and never shows
an exception message or stack trace to users. Development builds log render
errors to the browser console for diagnosis. No production telemetry provider
is configured yet.

Before production, connect the error boundary and server repository to an
approved telemetry service with:

- redaction of client content, identifiers, tokens, and file keys;
- release/version and request correlation metadata;
- alerting for authentication failures, repository errors, failed exports, and
  repeated validation failures; and
- retention rules agreed with Trion and each client.

## Environments and configuration

Use Node `20.19.0` or a newer compatible supported LTS release. The committed
[`.nvmrc`](../../.nvmrc) is used by CI, and the root package declares the same
minimum runtime.

Copy [`.env.example`](../../.env.example) for local work. These values are
validated at runtime:

| Variable             | Allowed values / purpose                           |
| -------------------- | -------------------------------------------------- |
| `VITE_APP_TITLE`     | Public browser title only.                         |
| `VITE_RELEASE_STAGE` | `development`, `test`, `staging`, or `production`. |
| `VITE_DATA_SOURCE`   | `development-fixtures`, `api`, or `database`.      |

Only `development-fixtures` has a browser adapter today. A `production` stage
with fixture data fails configuration validation. Selecting `api` or `database`
also fails clearly until an authenticated adapter is implemented. This prevents
a deployment from silently treating fixture storage as durable production
persistence.

| Environment | Current intended use                         | Required data policy                                                                     |
| ----------- | -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Development | Local feature work with fixture data.        | Synthetic data only.                                                                     |
| Test/CI     | Repeatable lint, test, and build validation. | Synthetic data only.                                                                     |
| Staging     | Future integration and release verification. | Separate sanitized or synthetic data and a real server repository.                       |
| Production  | Future live internal service.                | Durable data store, authenticated API, approved monitoring, backups, and access reviews. |

## Build, CI, and deployment process

The [CI workflow](../../.github/workflows/ci.yml) installs the committed
dependencies with `npm ci`, then runs lint, the Vitest suite, and
`npm run build`. It is a quality gate, not a deployment workflow.

The current production build emits one JavaScript bundle of approximately
1.4 MB before gzip and Vite's chunk-size warning. This does not prevent
controlled internal use, but a production rollout should code-split
chart-heavy and specialist workbench routes before setting user-facing
performance targets.

For a future deployment:

1. Run the CI checks on the exact commit to release.
2. Build an immutable artifact with Node 20.19.0 and record its commit SHA.
3. Apply database migrations through a privileged server-side release job
   before serving the new artifact.
4. Deploy the server repository/API and browser artifact into the intended
   environment using environment-specific secret bindings.
5. Execute a smoke test for sign-in, an authorised engagement read, a rejected
   cross-engagement read, a controlled output export, and health/telemetry
   reporting.
6. Promote only after the release owner confirms migration, backup, monitoring,
   and access-control checks.

No hosting provider is prescribed in this repository. The selected platform
must support private server-side networking, secret management, access logging,
TLS, and separate non-production environments.

## Data migration, seeds, backup, and recovery

There is no database migration framework or durable seed process yet. The
future repository adapter should make migrations versioned, reviewed, and
idempotent where practical. Use forward-only corrective migrations rather than
editing applied migrations.

- Keep fixture seeds separate from production data and use them only in
  development/test environments.
- Import live data through a validated, audited migration/import workflow that
  preserves IDs, source references, version lineage, timestamps, and actor
  attribution where available.
- Back up the database and managed evidence store independently, encrypt both,
  test restoration regularly, and set retention/recovery objectives with
  Trion.
- Verify a restore into an isolated environment before declaring a production
  recovery procedure complete.

## AI limitation

Fabric currently has no external AI model provider. Retrieval is
engagement-aware and output JSON is structured for controlled manual
preparation, but there is no runtime model invocation, model telemetry, prompt
retention policy, or automated factual validation.

Any future AI integration must retrieve only server-authorized context, attach
source provenance to responses, validate structured output, prevent a model
from directly publishing client material, and retain human review/approval as
the only route to a client-facing output.

## Release gates and recommended next work

Do not deploy live client data until all of these gates pass:

- Authenticated server-side repository with read/write engagement enforcement.
- Real database schema, migrations, rollback/recovery procedure, and backup
  restore drill.
- Managed evidence storage with authorized signed retrieval.
- Staging environment with sanitized data and production-like telemetry.
- Independent security review of authentication, authorization, exports, file
  handling, and audit logs.
- CI green for lint, tests, and build, plus the critical workflow regression
  test.
- A named release owner has reviewed open output comments, current access
  assignments, configuration, and release evidence.

The highest-priority implementation sequence is: server authentication and
engagement-scoped repository reads; durable database and migration tooling;
managed evidence storage; then monitoring, backup automation, and deployment
runbooks.
