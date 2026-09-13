---
name: data-modeling
description: Use for Fabric repositories, persistence, migrations, and data integrity.
---

# Data modelling and persistence

Use this skill for repositories, persistence, migrations, and data integrity.
The current access boundary is `FabricRepository`; development uses validated
fixtures and `createInMemoryFabricRepository`. Keep persistence behind that
boundary and keep UI components free of hard-coded records.

Validate entity shape and relationships, report missing or invalid references,
use stable IDs and ISO timestamps, and clone or otherwise isolate mutable data
as the current repository does. Plan migrations for persistent stores; never
silently discard data or make destructive changes. Preserve approval,
visibility, provenance, and source references.

The structured model is more important than the first report interface. Do not
add a database or persistence framework merely to support a feature that fits
the existing seam.
