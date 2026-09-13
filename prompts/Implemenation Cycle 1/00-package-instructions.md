# Trion Factory Transformation Platform
## Revised GitHub Copilot Implementation Prompt Package

This package revises the original implementation stages using Trion's actual Digital Diagnostic materials:

- Digital & Operational Maturity Scorecard
- Executive Summary
- Opportunity & Action Register
- Preliminary Site Walk Checklist
- Digital Landscape Map template
- Transformation Roadmap template

## How to use

Run the prompts in numerical order. Each prompt is intended to be used as a separate GitHub Copilot task.

Before each stage, Copilot must:

1. Inspect the current repository and understand the existing architecture.
2. Reuse established components, types, services and conventions.
3. Review the current implementation before changing it.
4. Implement the stage as a working feature, not as a mockup or collection of placeholders.
5. Run the application and relevant checks.
6. Fix errors introduced by the implementation.
7. Avoid unrelated refactoring.
8. Summarise changes, assumptions, limitations and recommended next steps.

## Product principle

This is Trion's internal transformation workbench.

It is not primarily a CRM, generic project-management tool, report-writing tool or AI chatbot.

Its purpose is to help Trion staff:

> Prepare → Walk → Capture → Understand → Assess → Diagnose → Prioritise → Recommend → Deliver → Measure

The platform should preserve the chain of reasoning from factory evidence to client-facing recommendation.

## Core principles

- Evidence before conclusions.
- Structure before automation.
- Improve the process before prescribing technology.
- Existing systems should be understood and optimised before replacement is considered.
- A maturity score is a structured baseline, not a pass/fail judgement.
- A score of 5 is not automatically the objective; fit-for-purpose maturity matters.
- Opportunities must retain their origin, rationale, assumptions and confidence.
- Indicative benefits are not guaranteed returns.
- Internal working information must never be exposed automatically as client-facing content.
- AI should assist with preparation, extraction, synthesis and drafting, but must not silently invent facts, scores, evidence or financial benefits.
- The platform should support both a quick preliminary site walk and a deeper paid diagnostic.
- The interface should be intuitive for consultants working in offices, factories and meetings.
- The platform should generate controlled outputs from structured, approved data wherever practical.

## Trion transformation logic

The system should consistently support:

Understand → Simplify → Standardise → Automate → Measure

And the diagnostic-to-delivery progression:

Discover → Diagnose → Design → Deliver → Measure

## Required output philosophy

The platform should eventually support these five diagnostic outputs:

1. Executive Summary
2. Digital & Operational Maturity Scorecard
3. Digital Landscape Map
4. Opportunity & Action Register
5. Transformation Roadmap

These should not be disconnected documents. They should be different views of the same structured engagement data.

## Internal-first architecture

Internal users may see:

- Raw observations
- Interview notes
- Photographs and evidence
- Draft findings
- Unverified assumptions
- Working calculations
- AI-generated suggestions
- Internal delivery notes
- Commercial and technical considerations

Client-facing outputs may only use:

- Approved findings
- Approved maturity scores
- Approved opportunity descriptions
- Approved values and timings
- Approved roadmap content
- Approved summaries

Build explicit visibility and approval concepts into the architecture early.
