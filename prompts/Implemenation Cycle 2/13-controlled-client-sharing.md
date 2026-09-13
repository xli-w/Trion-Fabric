# Stage 13 — Controlled Client Sharing

## Objective

Create a secure, limited client-facing layer that exposes approved information without exposing Trion's internal working environment.

This is not a full client portal or collaboration suite.

## Visibility architecture

Implement explicit visibility rules for:

- Internal-only.
- Draft client-facing.
- Approved client-facing.
- Published/shared.
- Archived.

Visibility must be enforced in the data/service layer.

## Client-facing content

A client may eventually access:

- Approved Executive Summary.
- Approved Maturity Scorecard.
- Approved Digital Landscape Map.
- Approved Opportunity & Action Register.
- Approved Transformation Roadmap.
- Agreed actions.
- Approved progress updates.
- Approved benefits summaries.

A client must not access:

- Raw consultant notes.
- Internal commentary.
- Draft AI outputs.
- Unapproved assumptions.
- Internal commercial discussions.
- Unapproved estimates.
- Other clients or engagements.
- Trion's internal knowledge base.

## Required functionality

- Select an approved output for sharing.
- Show publication status.
- Record who approved and shared it.
- Allow revocation or archival.
- Show the client-facing version, not the internal editing view.
- Maintain an audit trail.
- Prevent accidental sharing of draft content.

## UX requirements

The client-facing view should be simpler than the internal application:

- Clear engagement summary.
- Approved documents and outputs.
- Clear dates and versions.
- Clear next steps.
- No internal navigation.
- No AI workspace.
- No raw evidence library.

## Acceptance criteria

- Only approved content is visible externally.
- Sharing and revocation are auditable.
- Draft and internal content are inaccessible.
- The client view is intentionally limited and coherent.
