# Trion Factory Transformation Platform
## Stage 4 — Evidence-Led Opportunity and Action Engine

You are implementing Stage 4 of the Trion Factory Transformation Platform.

Read the package-level instructions first. Inspect the current repository and reuse existing architecture.

## Objective

Turn diagnostic findings and site-walk evidence into a prioritised, practical Opportunity & Action Register.

This must reflect Trion's actual methodology and output structure.

## Core principle

The platform must identify the right improvements in the right order.

It must not recommend technology for its own sake.

Use this reasoning chain:

Observation → Current Situation → Identified Issue → Why It Matters → Recommended Improvement → Benefits → Priority → Next Step

An opportunity should retain its evidence and reasoning.

## Opportunity model

Implement:

- id
- engagementId
- diagnosticId
- title
- area
- process
- system
- currentSituation
- identifiedIssue
- whyItMatters
- recommendedImprovement
- opportunityType
- potentialBenefits
- indicativeValue
- valueAssumptions
- businessImpact
- implementationEffort
- investment
- strategicValue
- confidence
- priority
- priorityCategory
- recommendedTiming
- dependencies
- suggestedNextStep
- relatedObservationIds
- relatedFindingIds
- evidenceReferences
- status
- owner
- internalNotes
- clientSummary
- reviewStatus
- createdAt
- updatedAt

## Opportunity categories

Support:

- Quick Win
- Strategic Project
- Foundational Improvement
- Incremental Improvement
- Reconsider / Defer

These categories should be based on transparent judgement, not an opaque formula.

## Prioritisation factors

Implement the five factors from the source register:

### Business Impact

Potential effect on:

- Productivity.
- Cost.
- Quality.
- Delivery.
- Capacity.
- Visibility.
- Customer service.
- Risk or resilience.

### Implementation Effort

Consider:

- Technical complexity.
- Process change.
- Integration requirements.
- Internal resource.
- Implementation time.

### Investment

Represent likely investment as a qualitative band initially:

- £
- ££
- £££
- Unknown

Allow a numeric estimate later, but do not require false precision.

### Strategic Value

Whether the opportunity creates a foundation for future improvements or supports an important business objective.

### Confidence

How well the opportunity and its potential benefits are currently understood.

Where appropriate, opportunities should be validated further before significant investment is committed.

## Priority matrix

Implement a clear impact-versus-effort matrix:

- High impact / low effort = Quick Wins.
- High impact / high effort = Strategic Projects.
- Low impact / low effort = Incremental Improvements.
- Low impact / high effort = Reconsider / Defer.

Foundational Improvements must be separately identifiable because they may be strategically important even if their immediate financial return is limited.

Examples:

- Standardising processes.
- Improving master data.
- Establishing consistent KPI definitions.
- Removing duplicate data sources.
- Improving ERP configuration.
- Establishing data ownership.
- Connecting existing systems.

Do not treat foundational work as automatically low priority.

## Indicative value

Support measures such as:

- Administrative time.
- Reporting delay.
- Estimated annual saving.
- Capacity.
- Scrap / rework.
- Quality.
- Delivery.
- Other benefit.

For each measure support:

- Current state.
- Potential state.
- Unit.
- Calculation or assumption.
- Confidence.
- Validation status.

Clearly label figures as indicative. Never present them as guaranteed returns.

## Required functionality

Implement:

- Opportunity list.
- Search, filtering and sorting.
- Priority matrix.
- Opportunity detail workspace.
- Create and edit opportunity.
- Link observations, findings and evidence.
- Record current situation, issue, recommendation and benefits.
- Record impact, effort, investment, strategic value and confidence.
- Record timing, dependencies and next step.
- Create actions against opportunities.
- Identify recommended immediate actions.
- Identify foundational opportunities.
- Produce an opportunity summary view.

## Action model

Implement:

- id
- opportunityId
- title
- description
- owner
- status
- dueDate
- priority
- dependencies
- notes
- createdAt
- updatedAt

Actions should be specific next steps, not just generic tasks.

## Opportunity detail layout

Use the source register structure:

1. Area.
2. Current Situation.
3. Identified Issue.
4. Why It Matters.
5. Recommended Improvement.
6. Potential Benefits.
7. Indicative Value.
8. Priority Assessment.
9. Recommended Timing.
10. Dependencies.
11. Suggested Next Step.
12. Supporting Evidence.
13. Review and approval.

## Internal versus client-facing

Internal:
- Raw notes.
- Working estimates.
- Assumptions.
- Unverified benefits.
- Internal commentary.
- AI suggestions in future.

Client-facing:
- Approved title.
- Approved current situation.
- Approved recommendation.
- Approved benefits.
- Approved timing.
- Approved priority.

Do not expose internal content automatically.

## Scope control

Do not implement AI opportunity generation, full financial modelling, automated ROI claims, advanced workflow automation or the full roadmap engine.

## Acceptance criteria

- Opportunities preserve their evidence and reasoning.
- The five prioritisation factors are represented.
- The impact-effort matrix works.
- Quick wins, strategic, foundational, incremental and deferred categories are supported.
- Indicative value is clearly qualified.
- Actions and suggested next steps are useful.
- The output structure aligns with Trion's actual register.
- Checks pass.
