# Stage 11 — Controlled Output and Report Generation Engine

## Objective

Generate Trion's diagnostic deliverables from structured platform data while preserving professional judgement, approval and version control.

The outputs must be different views of the same engagement model, not disconnected documents.

## Output architecture

Implement:

- Output definition.
- Output template.
- Output section.
- Source selection.
- Draft content.
- Review status.
- Approval.
- Version.
- Export reference.
- Publication/share status.

Each output should record:

- engagementId
- outputType
- title
- version
- status
- sourceReferences
- createdBy
- reviewedBy
- approvedBy
- approvedAt
- createdAt
- updatedAt

Statuses:

- Draft.
- Internal Review.
- Approved.
- Published / Shared.
- Archived.

## Required outputs

### 1. Executive Summary

Include:

- Client and engagement context.
- Current state.
- Key findings.
- Maturity profile.
- Strengths.
- Priority opportunities.
- Recommended direction.
- Roadmap summary.
- Next steps.

### 2. Digital & Operational Maturity Scorecard

Include:

- Ten dimensions.
- Scores.
- Maturity level.
- Rationale.
- Confidence.
- Current state.
- Desired state.
- Gaps.
- Linked opportunities.

### 3. Digital Landscape Map

Include:

- Business areas.
- Processes.
- Systems.
- Data.
- Roles.
- Relationships.
- Relevant friction points.
- Approved opportunity overlays.
- Legend and version information.

### 4. Opportunity & Action Register

Include:

- Area.
- Current Situation.
- Identified Issue.
- Why It Matters.
- Recommended Improvement.
- Potential Benefits.
- Indicative Value.
- Priority.
- Recommended Timing.
- Dependencies.
- Suggested Next Step.

### 5. Transformation Roadmap

Use Trion's phases:

- Simplify — 0–3 months.
- Connect — 3–6 months.
- Optimise — 6–12 months.
- Scale — 12+ months.

Include:

- Initiatives.
- Timing.
- Dependencies.
- Prerequisites.
- Expected benefits.
- Ownership.
- Status.

## Approved-data rule

Implement a strict rule:

Only approved client-facing information may appear in a client-facing output.

Internal-only information includes:

- Raw notes.
- Draft AI content.
- Unverified assumptions.
- Internal commercial commentary.
- Unapproved estimates.
- Internal risks.

The system must show which records are excluded and why where useful.

## Preview and editing

Support:

- Preview.
- Section-level editing where appropriate.
- Regeneration from updated source data.
- Review comments.
- Approval.
- Version comparison.
- Export.

Do not silently overwrite an approved version.

## Acceptance criteria

- All five core outputs are represented.
- Outputs draw from structured data.
- Approval and versioning are explicit.
- Internal information cannot leak into external outputs.
- Output previews are coherent and professional.
- Changes to source data can be reflected in a new draft version.
