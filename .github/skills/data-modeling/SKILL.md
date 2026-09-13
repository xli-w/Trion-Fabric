---
name: data-modeling
description: Use for Fabric repositories, persistence, migrations, and data integrity while simplifying workflow surfaces.
---

# Data modelling and persistence

Use this skill for repositories, persistence, migrations, and data integrity.
The current access boundary is `FabricRepository`; development uses validated
fixtures and `createInMemoryFabricRepository`. Keep persistence behind that
boundary and keep UI components free of hard-coded records.

The analytical model may remain richer than the workbench UI. Preserve the
connected client/site/engagement context and the records that support evidence,
diagnostics, opportunities, roadmaps, benefits, provenance, visibility, and
approval. Build contextual projections from the model rather than flattening or
duplicating it to fit a simplified navigation.

Store or retain active client/engagement selection at the appropriate user or
workspace boundary, with an explicit fallback when it is unavailable. Do not
turn it into repository-global mutable state or leak records between clients.
When retiring enterprise-oriented entities or data, audit consumers, plan a
compatible migration or archival path, and remove only after the replacement
workflow is live.

Validate entity shape and relationships, report missing or invalid references,
use stable IDs and ISO timestamps, and clone or otherwise isolate mutable data
as the current repository does. Plan migrations for persistent stores; never
silently discard data or make destructive changes. Preserve approval,
visibility, provenance, and source references.

Do not add a database or persistence framework merely to support a feature that
fits the existing seam. Do not add workflow-instance, assignment, notification,
or allocation persistence solely to recreate enterprise process complexity.
