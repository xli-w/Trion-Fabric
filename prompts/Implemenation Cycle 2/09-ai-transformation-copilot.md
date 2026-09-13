# Stage 9 — AI Transformation Copilot Architecture and First Features

## Objective

Introduce AI as an embedded assistant for Trion consultants, not as a generic chatbot.

The AI must help consultants prepare, interpret, draft and review work while preserving evidence, uncertainty and human approval.

## AI principles

- AI must operate within an engagement context.
- AI must be permission-aware.
- AI must distinguish facts, reported statements, interpretations, assumptions and suggestions.
- AI must cite or reference source records where possible.
- AI must never silently invent observations, scores, benefits or client facts.
- AI-generated content must be marked as draft.
- Client-facing generation must use approved information only.
- AI must not approve its own output.
- Provider-specific code must sit behind a service boundary.
- Prompts and response schemas should be versioned.

## Architecture

Implement these boundaries:

### AI Provider Adapter

Abstract the model provider and configuration.

### AI Task

Represent:

- task type
- engagementId
- input context
- prompt/version
- requested output schema
- model metadata
- status
- result
- errors
- createdBy
- createdAt

### AI Response Record

Store:

- raw response reference where appropriate
- structured result
- source references
- confidence
- warnings
- review status
- reviewer
- reviewedAt

### Context Builder

Build small, relevant context packages for tasks such as:

- Site-walk preparation.
- Evidence synthesis.
- Diagnostic rationale drafting.
- Opportunity drafting.
- Roadmap sequencing.
- Output drafting.

Do not send the entire engagement database to every task.

## First AI features

### 1. Site-walk preparation

Generate a draft briefing containing:

- Known client and site context.
- Engagement objectives.
- Previous relevant observations.
- Areas requiring investigation.
- Suggested prompts.
- Unanswered questions.
- Existing hypotheses clearly labelled.

### 2. Evidence synthesis

Given selected observations/evidence, generate:

- Emerging patterns.
- Supporting records.
- Contradictions.
- Missing evidence.
- Questions requiring validation.
- Possible implications, clearly labelled as interpretation.

### 3. Diagnostic assistance

Draft a maturity rationale for a selected dimension using supplied evidence.

The AI may suggest a provisional score only when explicitly requested. It must explain the evidence and uncertainty and must not approve the score.

### 4. Opportunity drafting

Draft candidate opportunities using:

- Current Situation.
- Identified Issue.
- Why It Matters.
- Recommended Improvement.
- Potential Benefits.
- Evidence references.
- Assumptions.
- Confidence.
- Validation questions.

### 5. Roadmap sequencing

Suggest sequencing based on:

- Dependencies.
- Foundational improvements.
- Impact.
- Effort.
- Investment.
- Business readiness.
- Existing systems.
- Process maturity.

## UI requirements

AI actions should appear in context:

- “Prepare site walk.”
- “Summarise evidence.”
- “Draft rationale.”
- “Suggest opportunities.”
- “Suggest sequencing.”

Do not make the main experience a blank chat window.

Show:

- What data was used.
- What the AI generated.
- Source references.
- Warnings.
- Draft status.
- Accept, edit, reject and regenerate actions.

## Acceptance criteria

- AI is behind a provider abstraction.
- Tasks and responses are structured and persisted safely.
- AI context is permission-aware.
- First features work on real engagement data.
- AI content is visibly draft and reviewable.
- No unapproved AI content enters client-facing outputs.
