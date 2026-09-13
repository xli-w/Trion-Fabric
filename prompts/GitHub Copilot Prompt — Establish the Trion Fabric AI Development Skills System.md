# Trion Fabric
## Repository AI Development Skills & Engineering Intelligence System

You are acting as a senior software architect, product engineer, AI systems designer and manufacturing digitalisation specialist.

Your task is to establish a **repository-native AI development skills system** for the Trion Fabric project.

This is not simply a request to create a few instruction files.

The objective is to make GitHub Copilot an effective, consistent and context-aware development partner for this product over its entire lifecycle.

The skills system must understand:

- What Trion is.
- What Fabric is intended to become.
- Who uses it.
- How Trion conducts transformation work.
- How the platform's domain model is structured.
- How internal working information differs from client-facing outputs.
- How the codebase should be developed and maintained.
- How AI should assist without compromising evidence, accuracy or trust.

The resulting system should empower AI-assisted development while preserving architectural discipline, product coherence and Trion's professional identity.

---

# 1. First: Inspect the Repository

Before creating anything:

1. Inspect the complete repository structure.
2. Identify the technology stack.
3. Identify the frontend architecture.
4. Identify the backend / data access architecture.
5. Identify the domain model already implemented.
6. Identify existing UI components and design tokens.
7. Identify existing testing, linting and formatting configuration.
8. Identify any existing README, architecture or instruction files.
9. Identify how routes, features, services and repositories are organised.
10. Identify whether any existing AI or Copilot instructions already exist.

Do not assume the repository uses a particular framework or folder structure.

Adapt the skills system to the actual project.

Do not overwrite useful existing instructions without reviewing them.

If an existing skills or instruction system is present, improve and extend it rather than creating a competing system.

---

# 2. Product Context — Trion

Trion is a specialist manufacturing digitalisation and operational transformation consultancy focused primarily on UK manufacturing SMEs.

Trion helps clients understand and improve the relationship between:

- People
- Processes
- Technology
- Systems
- Data
- Operational performance

Its work is practical, evidence-led and focused on meaningful improvement.

Trion is not positioned as a generic software agency, a generic AI consultancy or a provider of superficial dashboards.

Its approach is grounded in real manufacturing environments, including:

- Production
- Machining
- Assembly
- Quality
- Logistics
- Planning
- Maintenance
- Engineering
- ERP and business systems
- Production data
- Reporting and analytics
- Systems integration
- Operational improvement

The business seeks to eliminate operational friction by connecting people, processes, technology and data into a more efficient operating environment.

The platform must reflect this practical, structured and technically credible identity.

---

# 3. Product Context — Trion Fabric

The product being developed is **Trion Fabric**.

Fabric is Trion's internal transformation delivery platform.

It is intended to become the central digital environment through which Trion staff conduct, manage and deliver transformation engagements.

Fabric should guide and support the transformation lifecycle:

> Discover → Diagnose → Design → Deliver → Measure

It should help Trion staff:

- Understand a client and its operating environment.
- Plan and conduct structured site walks.
- Capture observations, interviews and evidence.
- Map processes, systems, data and operational relationships.
- Assess digital and operational maturity.
- Identify problems and root causes.
- Develop and prioritise opportunities.
- Create actions and transformation initiatives.
- Build transformation roadmaps.
- Manage delivery.
- Track expected and realised benefits.
- Generate controlled, client-facing outputs.

The central product principle is:

> **Capture information once, structure it properly, connect it intelligently, and reuse it throughout the transformation lifecycle.**

Fabric is not intended to be a collection of disconnected forms, spreadsheets or reports.

It should become a connected transformation knowledge system.

---

# 4. Critical Product Boundary

Fabric is primarily an **internal Trion staff platform**.

Its main users are:

- Trion consultants
- Project leads
- Analysts
- Technical delivery staff
- Management

It is not initially a public-facing SaaS product.

Some outputs will eventually be shared with clients, but the internal workspace remains the primary environment.

The system must therefore distinguish between:

## Internal working environment

- Raw observations
- Interview notes
- Internal commentary
- Unverified information
- Draft analysis
- Assumptions
- AI suggestions
- Internal calculations
- Delivery notes
- Internal risks
- Draft outputs

## Controlled client-facing outputs

- Approved findings
- Approved maturity scores
- Approved opportunities
- Approved recommendations
- Approved roadmaps
- Approved reports
- Approved dashboards
- Approved progress and benefits summaries

Never assume that information entered internally should automatically become client-facing.

This distinction must influence product design, domain modelling, permissions, workflows, AI behaviour and output generation.

---

# 5. Trion's Transformation Methodology

Fabric is not a generic project-management application.

It is a digital representation of Trion's transformation methodology.

The methodology is broadly:

## Understand

Understand the factory, its people, processes, systems, data and operational context.

## Simplify

Identify unnecessary complexity, duplication, manual effort and friction.

## Standardise

Create consistent processes, definitions, structures and ways of working.

## Automate

Automate appropriate repetitive or rule-based activities.

## Measure

Establish visibility, performance measures and evidence of improvement.

This methodology should inform:

- Domain terminology
- User workflows
- Site walk prompts
- Diagnostic logic
- Opportunity categories
- Roadmap structures
- AI suggestions
- Reports
- UI labels
- Product decisions

Do not replace this with generic business jargon.

---

# 6. Core Transformation Model

The platform should be understood as a connected model.

Conceptually:

```text
Client
 └── Site
      └── Area
           └── Process
                ├── People
                ├── Systems
                ├── Equipment
                ├── Data
                ├── Observations
                ├── Evidence
                └── Opportunities

Opportunity
 └── Initiative
      ├── Actions
      ├── Milestones
      ├── Owner
      ├── Timeline
      ├── Cost
      ├── Expected Benefits
      ├── Delivery Status
      └── Measured Outcomes
```

The following domains are especially important:

- Clients
- Sites
- Engagements
- Areas
- Processes
- Systems
- Site Walks
- Observations
- Evidence
- Diagnostics
- Maturity Assessments
- Findings
- Opportunities
- Actions
- Initiatives
- Roadmaps
- Benefits / Outcomes
- Outputs
- Users / Roles
- AI assistance

These should be treated as connected domain concepts, not unrelated CRUD pages.

---

# 7. The Skills System Objective

Create a structured skills system that allows Copilot to work effectively at different levels.

The system should support:

### Product understanding

How Fabric is intended to work and why.

### Domain understanding

How manufacturing transformation information is structured.

### Engineering execution

How to implement features correctly in this repository.

### Workflow guidance

How to plan, build, test, review and refine changes.

### AI assistance

How to use AI responsibly within the product and during development.

### Quality assurance

How to detect architectural, functional, UX and domain problems.

The skills should be concise enough to be usable, but sufficiently detailed to prevent generic or inconsistent implementation.

Do not create one enormous instruction file containing everything.

Use a layered system.

---

# 8. Recommended Skills Architecture

Adapt this structure to the actual repository, but establish a clear equivalent.

```text
.github/
├── copilot-instructions.md
│
└── skills/
    │
    ├── product-context/
    │   └── SKILL.md
    │
    ├── trion-brand/
    │   └── SKILL.md
    │
    ├── domain-model/
    │   └── SKILL.md
    │
    ├── internal-vs-client/
    │   └── SKILL.md
    │
    ├── feature-development/
    │   └── SKILL.md
    │
    ├── domain-development/
    │   └── SKILL.md
    │
    ├── ui-development/
    │   └── SKILL.md
    │
    ├── data-modeling/
    │   └── SKILL.md
    │
    ├── ai-development/
    │   └── SKILL.md
    │
    ├── site-walks/
    │   └── SKILL.md
    │
    ├── diagnostics/
    │   └── SKILL.md
    │
    ├── opportunities/
    │   └── SKILL.md
    │
    ├── roadmap-delivery/
    │   └── SKILL.md
    │
    ├── outputs-reporting/
    │   └── SKILL.md
    │
    ├── testing-validation/
    │   └── SKILL.md
    │
    ├── debugging/
    │   └── SKILL.md
    │
    └── code-review/
        └── SKILL.md
```

This is a starting point.

Do not create unnecessary skills merely to increase the number of files.

Each skill should have a clear purpose and should be discoverable when relevant.

If the repository uses a different supported skills convention, use that convention instead.

---

# 9. Global Copilot Instructions

Create or update the repository's main Copilot instruction file.

This should establish the permanent rules that apply to all development.

It should include the following principles.

## Architecture

- Inspect before changing.
- Reuse existing patterns.
- Keep domain boundaries clear.
- Keep business logic out of presentation components where possible.
- Avoid unnecessary abstraction.
- Avoid duplicated logic.
- Prefer a coherent modular architecture.
- Do not introduce competing frameworks or patterns without justification.

## Product

- Fabric is an internal Trion transformation platform.
- Build for real consulting workflows.
- Prefer structured information over disconnected documents.
- Preserve relationships between entities.
- Do not build superficial dashboards.
- Do not assume client-facing visibility.

## Domain

- Use manufacturing and transformation terminology accurately.
- Preserve evidence and provenance.
- Distinguish observations, interpretations, assumptions and recommendations.
- Do not invent client facts.
- Do not create disconnected domain entities.

## UX

- Use the existing Trion design system.
- Prioritise clarity, speed and information hierarchy.
- Avoid excessive decoration.
- Support internal users working across office and factory environments.
- Handle loading, empty, error and success states.

## AI

- AI suggestions must be distinguishable from approved information.
- AI must not fabricate evidence, financial values or client facts.
- Important conclusions require human review.
- AI should operate through explicit contextual capabilities.
- Do not hard-code the application to one AI provider unnecessarily.

## Engineering

- Use strict typing.
- Validate inputs.
- Handle errors.
- Write maintainable code.
- Add tests where appropriate.
- Run relevant checks after changes.
- Keep changes focused.
- Explain important architectural decisions.

---

# 10. Product Context Skill

Create a skill that gives Copilot a concise but authoritative understanding of Trion and Fabric.

It should explain:

- Trion's business
- Fabric's purpose
- Internal-first usage
- Transformation lifecycle
- Evidence-led methodology
- Core domain model
- Controlled client outputs
- Brand and UX direction
- What Fabric is not

This skill should be referenced whenever Copilot is making product, domain, UX or architectural decisions.

It should prevent Copilot from treating Fabric as:

- A generic CRM
- A generic project-management tool
- A generic AI chatbot
- A generic dashboard builder
- A public SaaS application
- A document repository

---

# 11. Trion Brand Skill

Create a skill that defines how the application should express Trion's identity.

The brand should feel:

- Professional
- Technical
- Structured
- Modern
- Calm
- Practical
- Engineering-led
- Information-focused

The visual language should be:

- Restrained
- Clean
- High-clarity
- Strongly hierarchical
- Consistent
- Suitable for serious internal work

Avoid:

- Excessive gradients
- Overly playful SaaS styling
- Generic AI aesthetics
- Excessive animation
- Decorative charts
- Unnecessary colour
- Overloaded dashboards
- Buzzword-heavy language

The platform may use a darker, sophisticated primary interface with light content surfaces where useful, but the exact implementation must follow the existing design system.

The public Trion brand and internal Fabric product should feel related, but Fabric does not need to replicate the marketing website.

The skill should include guidance for:

- Typography
- Colour tokens
- Spacing
- Borders
- Status colours
- Buttons
- Forms
- Tables
- Cards
- Navigation
- Page headers
- Empty states
- Data visualisation
- Labels and terminology

Do not invent branding elements without need.

---

# 12. Domain Model Skill

Create a skill explaining how Fabric's domain should be structured.

It should cover:

- Client
- Site
- Area
- Process
- System
- Engagement
- Site Walk
- Observation
- Evidence
- Diagnostic
- Maturity Dimension
- Finding
- Opportunity
- Action
- Initiative
- Milestone
- Benefit / Outcome
- Output
- User / Role

It should explain important relationships.

For example:

- A client may have multiple sites.
- A client may have multiple engagements.
- An engagement may cover multiple sites.
- A site contains areas.
- Areas contain processes.
- Site walks investigate areas and processes.
- Observations are captured during site walks.
- Evidence supports observations.
- Findings are supported by evidence.
- Opportunities arise from findings and observations.
- Initiatives implement opportunities.
- Outputs are generated from approved structured information.

The skill should warn against:

- Duplicating the same information in multiple places.
- Creating disconnected feature-specific models.
- Treating opportunities as ordinary tasks.
- Treating reports as the primary data store.
- Mixing internal notes with approved client-facing content.

---

# 13. Internal vs Client-Facing Skill

Create a dedicated skill for information visibility and approval.

It should explain:

### Internal working information

Raw notes, unverified observations, draft analysis, assumptions, AI suggestions, internal calculations and delivery commentary.

### Client-facing information

Approved findings, approved recommendations, approved roadmap items, approved summaries and approved reports.

The skill should guide Copilot to:

- Use explicit review states.
- Avoid accidental exposure of internal information.
- Distinguish draft from approved content.
- Preserve provenance.
- Avoid assuming all fields are client-shareable.
- Design future permissions cleanly.

This skill is important whenever Copilot builds:

- Forms
- Detail pages
- Reports
- AI features
- Permissions
- Data models
- Client portal functionality

---

# 14. Feature Development Skill

Create a general skill for implementing new features.

It should instruct Copilot to follow a consistent workflow:

## Step 1 — Understand

Inspect the relevant domain, existing components, routes, services and data access patterns.

## Step 2 — Plan

Identify:

- User problem
- Domain entities
- Relationships
- UI surfaces
- Data changes
- Validation
- Permissions
- Tests
- Deferred scope

## Step 3 — Implement

Build the feature using existing patterns.

Keep business logic separate from presentation where appropriate.

## Step 4 — Validate

Run:

- Type checks
- Linting
- Tests
- Build
- Relevant manual checks

## Step 5 — Review

Check:

- Domain correctness
- UX consistency
- Internal/client visibility
- Error handling
- Empty states
- Maintainability
- Unnecessary duplication

The skill should encourage focused implementation rather than broad uncontrolled refactoring.

---

# 15. Domain Development Skill

Create a skill for adding or modifying domain functionality.

It should guide Copilot to:

- Define entities clearly.
- Establish relationships.
- Use consistent IDs and timestamps.
- Use typed statuses and enums.
- Validate inputs.
- Avoid arbitrary strings where controlled values are appropriate.
- Keep domain logic testable.
- Preserve existing relationships.
- Consider future persistence.
- Avoid over-modeling prematurely.

When changing a domain model, Copilot should inspect how existing features depend on it before making breaking changes.

---

# 16. UI Development Skill

Create a skill for building Fabric interfaces.

It should guide Copilot to:

- Reuse existing components.
- Follow established spacing and typography.
- Use consistent page layouts.
- Provide useful tables and detail views.
- Use clear status indicators.
- Include loading, empty, error and success states.
- Make forms efficient.
- Avoid excessive modal nesting.
- Avoid giant components.
- Keep responsive behaviour in mind.
- Prioritise information density and clarity.

The skill should distinguish between:

### Internal workbench UI

Detailed, information-rich, operational and editable.

### Client-facing output UI

Polished, selective, clear and presentation-ready.

Do not automatically use the same interface for both purposes.

---

# 17. Data Modelling Skill

Create a skill for database and persistence work.

It should guide Copilot to:

- Use the existing repository/data access architecture.
- Avoid hard-coded data in UI components.
- Keep persistence concerns separate from presentation.
- Validate relationships.
- Handle missing and invalid references.
- Consider migrations.
- Avoid destructive changes without explicit justification.
- Preserve data integrity.
- Use consistent date and identifier conventions.
- Avoid premature database complexity.

The skill should explain that the underlying structured model is more important than the initial reporting interface.

---

# 18. AI Development Skill

Create a dedicated skill for developing AI functionality inside Fabric.

This is one of the most important skills.

AI should be treated as an intelligence layer operating on top of structured transformation data.

It should not become an uncontrolled chatbot that invents conclusions.

The skill should establish the following principles.

## AI is contextual

AI should receive relevant context such as:

- Client
- Site
- Engagement
- Process
- Observation
- Evidence
- Diagnostic
- Opportunity
- Initiative

Do not send irrelevant or uncontrolled data by default.

## AI is structured

Prefer explicit AI tasks such as:

- Structure site walk notes.
- Suggest observation categories.
- Summarise an interview.
- Identify missing evidence.
- Suggest follow-up questions.
- Detect duplicate opportunities.
- Draft a finding.
- Suggest opportunity categories.
- Draft an executive summary.

Avoid making every feature depend on a general-purpose chat interface.

## AI is reviewable

AI output should be distinguishable from approved information.

Use statuses such as:

- Suggested
- Reviewed
- Approved
- Rejected

## AI is evidence-aware

AI must not:

- Invent client facts.
- Invent evidence.
- Invent financial values.
- Present assumptions as facts.
- Automatically approve conclusions.
- Claim certainty where evidence is weak.

## AI is provider-independent

Use a service boundary so that model providers can be changed without rewriting the application.

## AI is auditable

Where appropriate, record:

- Task
- Context
- Model/provider
- Timestamp
- Output
- Review status
- User who approved or rejected it

The skill should also guide prompt design, structured outputs, validation, error handling, fallbacks and human review.

---

# 19. Site Walk Skill

Create a domain-specific skill for site walk functionality.

It should explain that site walks are not generic forms.

They are structured investigations of the factory.

A site walk may involve:

- Areas
- Processes
- People
- Systems
- Equipment
- Data
- Observations
- Evidence
- Questions
- Follow-up actions

The skill should guide Copilot to prioritise:

- Fast capture
- Clear context
- Minimal friction
- Evidence provenance
- Source classification
- Review status
- Future mobile and offline extensibility

It should also explain that future AI may assist with:

- Transcription
- Structuring notes
- Suggesting categories
- Identifying missing information
- Generating follow-up questions

But AI must not automatically turn notes into verified facts.

---

# 20. Diagnostic Skill

Create a domain-specific skill for diagnostic functionality.

It should explain the purpose of the Digital Diagnostic:

- Understand the operating environment.
- Assess digital and operational maturity.
- Identify key findings.
- Connect findings to evidence.
- Connect findings to opportunities.
- Support recommendations and roadmaps.

The skill should guide Copilot to:

- Preserve assessment rationale.
- Link scores to evidence.
- Record confidence.
- Distinguish draft and approved scores.
- Avoid arbitrary scoring formulas.
- Avoid generic questionnaires that are disconnected from the factory context.

It should also cover the future Digital Landscape Map and its relationship to structured areas, processes, systems, data and observations.

---

# 21. Opportunity Skill

Create a domain-specific skill for opportunity functionality.

It should explain that an opportunity is a transformation recommendation, not merely a task.

An opportunity should be able to express:

- Problem
- Root cause
- Proposed improvement
- Related process
- Related system
- Evidence
- Impact
- Effort
- Value
- Confidence
- Priority
- Actions
- Future initiative

The skill should guide Copilot to distinguish:

- Evidence
- Interpretation
- Estimate
- Recommendation
- Approved conclusion

It should support Trion's opportunity categories:

- Eliminate
- Simplify
- Standardise
- Automate
- Integrate
- Improve Visibility
- Transform

It should discourage false precision and unsupported ROI claims.

---

# 22. Roadmap & Delivery Skill

Create a domain-specific skill for transformation delivery.

It should explain that initiatives originate from opportunities and retain their context.

The skill should guide Copilot to model:

- Initiative
- Scope
- Owner
- Actions
- Milestones
- Dependencies
- Status
- Cost
- Expected benefits
- Actual benefits
- Risks
- Decisions
- Outcomes

It should distinguish expected benefits from realised benefits.

It should discourage turning Fabric into a generic project-management suite.

The purpose is to manage transformation initiatives and measure their impact.

---

# 23. Outputs & Reporting Skill

Create a skill for client-facing outputs.

It should explain that reports and deliverables are generated from structured platform data.

Potential outputs include:

- Executive Summary
- Digital Landscape Map
- Maturity Scorecard
- Opportunity & Action Register
- Quick-Win Shortlist
- Transformation Roadmap
- Site Walk Summary
- Diagnostic Report
- Progress Report
- Benefits Report

The skill should guide Copilot to:

- Use approved information.
- Preserve source references.
- Support draft and review states.
- Avoid exposing internal notes.
- Avoid duplicating business logic in report templates.
- Keep output generation separate from the underlying domain model.
- Preserve consistency across outputs.

---

# 24. Testing & Validation Skill

Create a skill for testing and validation.

It should guide Copilot to test:

### Domain correctness

Relationships, validation, status transitions and business rules.

### UI correctness

Forms, navigation, loading states, empty states, errors and responsive behaviour.

### Data integrity

Invalid references, missing fields, persistence and migrations.

### AI correctness

Structured output validation, failure handling, provenance and review states.

### Output correctness

Approved versus draft information, source references and client-facing visibility.

The skill should encourage appropriate testing without requiring excessive test code for trivial changes.

---

# 25. Debugging Skill

Create a skill for debugging.

It should instruct Copilot to:

1. Reproduce the issue.
2. Identify the relevant layer.
3. Inspect logs and errors.
4. Trace the data flow.
5. Identify the root cause.
6. Make the smallest appropriate fix.
7. Add or update a regression test where useful.
8. Re-run relevant checks.
9. Explain the cause and fix.

Do not encourage speculative rewrites or broad refactors as the first response to a bug.

---

# 26. Code Review Skill

Create a skill for reviewing changes.

It should guide Copilot to review:

- Correctness
- Architecture
- Domain consistency
- Data integrity
- Security
- Internal/client visibility
- UX consistency
- Accessibility
- Performance
- Maintainability
- Testing
- Unnecessary complexity

The reviewer should ask:

> Does this feature fit Fabric's transformation model?

> Does it preserve evidence and provenance?

> Does it maintain the distinction between internal working information and client-facing outputs?

> Does it reuse existing patterns?

> Does it introduce unnecessary complexity?

---

# 27. Skill Usage Guidance

The skills system should make it clear when each skill is relevant.

For example:

### New site walk feature

Use:

- Product Context
- Domain Model
- Site Walks
- Feature Development
- UI Development
- Data Modelling
- Testing

### New AI summarisation feature

Use:

- Product Context
- AI Development
- Domain Model
- Internal vs Client-Facing
- Feature Development
- Testing

### New report output

Use:

- Product Context
- Outputs & Reporting
- Internal vs Client-Facing
- Domain Model
- Feature Development
- Testing

### Database change

Use:

- Domain Model
- Data Modelling
- Feature Development
- Testing

Do not require every skill to be loaded for every task.

The system should remain practical.

---

# 28. Avoid Skill Duplication

Do not repeat the same long explanations across every skill.

Use:

- Global instructions for permanent rules.
- Product Context for business and product understanding.
- Domain Model for relationships.
- Specific skills for specialised workflows.
- Engineering skills for implementation standards.

Each skill should have a clear responsibility.

---

# 29. Skill Quality Requirements

Each skill should be:

- Clear
- Concise
- Actionable
- Context-aware
- Relevant to actual development
- Consistent with the repository
- Easy for Copilot to apply

Avoid vague statements such as:

> "Write good code."

Prefer:

> "Inspect the existing feature and data-access patterns before introducing a new implementation. Reuse established abstractions unless there is a documented reason not to."

Avoid generic AI advice that could apply to any application.

The skills must be specific to **Trion Fabric**.

---

# 30. Documentation of the Skills System

Create a concise index explaining:

- What the skills system is.
- Where the skills are stored.
- What each skill is for.
- How Copilot should use them.
- How developers should add or update skills.
- How to avoid duplication.
- How to keep the system aligned with the product.

Do not create a large documentation portal.

The purpose is to make the development system understandable and maintainable.

---

# 31. Final Implementation Requirements

Complete the following:

1. Inspect the repository.
2. Identify the actual technology and architecture.
3. Create or improve the global Copilot instructions.
4. Create the product context skill.
5. Create the Trion brand skill.
6. Create the domain model skill.
7. Create the internal/client visibility skill.
8. Create the feature development skill.
9. Create the domain development skill.
10. Create the UI development skill.
11. Create the data modelling skill.
12. Create the AI development skill.
13. Create the site walk skill.
14. Create the diagnostic skill.
15. Create the opportunity skill.
16. Create the roadmap and delivery skill.
17. Create the outputs and reporting skill.
18. Create the testing and validation skill.
19. Create the debugging skill.
20. Create the code review skill.
21. Create a concise skills index.
22. Ensure all instructions are consistent with the actual repository.

Do not implement unrelated application features during this task.

Do not redesign the application unnecessarily.

Do not introduce a new framework merely to support the skills system.

---

# 32. Final Quality Check

Before finishing, verify that:

- The skills are discoverable by Copilot.
- The instruction files use the correct supported format.
- The skills do not contradict one another.
- The skills reflect Trion's actual product intention.
- The skills distinguish Fabric from a generic SaaS application.
- The skills distinguish internal working information from client-facing outputs.
- The skills preserve evidence-led transformation.
- The skills support future AI functionality.
- The skills are concise enough to be practical.
- The repository remains runnable.
- No unrelated code has been changed.

Finally, summarise:

- What skills were created.
- Where they are located.
- How Copilot should use them.
- Any architectural decisions made.
- Any assumptions.
- Any future improvements recommended.

**The goal is not merely to give Copilot more instructions. The goal is to establish a reusable AI development capability that understands Trion Fabric and helps build it consistently over time.**