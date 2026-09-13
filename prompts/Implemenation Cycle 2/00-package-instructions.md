# Trion Factory Transformation Platform
## Second Implementation Prompt Package

This package builds upon the first implementation package. It assumes the repository already contains the initial client, site, engagement, site-walk, observation, evidence, diagnostic, maturity, opportunity, roadmap and output foundations.

The purpose of this package is to turn those foundations into a coherent internal transformation workbench for Trion.

## Product context

Trion is a manufacturing digitalisation and operational transformation consultancy. The platform is primarily for Trion internal staff. Some information will eventually be exposed through approved client-facing outputs, but internal working information must remain separate.

The platform supports the progression:

Prepare → Walk → Capture → Understand → Assess → Diagnose → Prioritise → Recommend → Deliver → Measure

It should embody:

Understand → Simplify → Standardise → Automate → Measure

It should support the actual Trion diagnostic outputs:

1. Executive Summary
2. Digital & Operational Maturity Scorecard
3. Digital Landscape Map
4. Opportunity & Action Register
5. Transformation Roadmap

## Source-grounded terminology

Preserve the terminology and logic of the existing diagnostic materials:

- Preliminary Site Walk
- Pre-tour Briefing
- Shopfloor Tour
- Material and Process Flow
- Data and Paper-Tracking Red Flags
- Machine Operations and Downtime
- High-Impact Diagnostic Prompts
- Immediate Friction and Loss-Aversion Tracker
- Post-tour Recap
- Digital & Operational Maturity Scorecard
- Current Situation
- Identified Issue
- Why It Matters
- Recommended Improvement
- Potential Benefits
- Indicative Value
- Priority
- Recommended Timing
- Dependencies
- Suggested Next Step
- Simplify
- Connect
- Optimise
- Scale

Do not replace these with generic product-management terminology unless there is a clear technical reason.

## Non-negotiable product principles

- Evidence before conclusions.
- Every important finding should be traceable to observations and evidence.
- A score is not valid merely because a field has been completed.
- Unknown, not assessed, not applicable, estimated and to be validated are distinct states.
- AI suggestions are drafts until reviewed by a Trion user.
- Indicative benefits are not guaranteed returns.
- Existing systems should be understood and optimised before replacement is recommended.
- The platform should guide consultants without preventing professional judgement.
- Internal notes, assumptions, draft content and commercial information must not leak into client-facing outputs.
- Avoid building generic CRM, generic project management or generic chatbot features.
- Prefer a small number of coherent, useful workflows over a large number of disconnected screens.

## Implementation protocol

For each stage:

1. Inspect the current repository and existing architecture.
2. Identify what is already implemented.
3. Reuse existing components, domain models, services and styling.
4. Do not create duplicate models or competing patterns.
5. Implement working functionality, not placeholder screens.
6. Add validation, loading, empty, error and permission states.
7. Add or update tests for important domain behaviour.
8. Run the application and relevant checks.
9. Fix issues introduced by the change.
10. Summarise changes, assumptions, limitations and next steps.

Do not implement future stages prematurely unless a small supporting abstraction is required.
