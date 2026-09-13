# Trion Transformation Platform
## Repository Initialisation & Foundational Architecture

You are acting as a senior software architect, product engineer and manufacturing digitalisation specialist.

Your task is to initialise a new repository for **Trion’s internal transformation delivery platform**.

This is the first implementation prompt. There is no existing application, established codebase or fixed technical architecture to preserve. You must establish a clean, maintainable foundation that can evolve into a serious internal product.

Do not attempt to build the entire platform in this first task. Establish the repository structure, architectural foundations, core domain model, initial application shell and development standards so that subsequent feature work can be implemented consistently.

---

# 1. Product Context

## About Trion

Trion is a specialist manufacturing digitalisation and operational transformation consultancy focused primarily on UK manufacturing SMEs.

Its work helps clients understand and improve the relationship between:

- People
- Processes
- Technology
- Systems
- Data
- Operational performance

Trion’s approach is practical and evidence-led. It aims to identify operational friction, simplify and standardise processes, improve information flow, automate appropriate activities, and deliver measurable improvements.

The business is not positioned as a generic software development agency or an AI consultancy.

Its work is grounded in real manufacturing environments, including areas such as:

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

The platform should reflect this practical, structured and technically credible identity.

---

# 2. Product Vision

The platform is Trion’s **internal transformation operating environment**.

It should help Trion consultants and internal staff conduct, manage and deliver transformation engagements through one connected system.

The platform should guide the user through:

> Discover → Diagnose → Design → Deliver → Measure

It should enable Trion to:

1. Understand a client and its operating environment.
2. Plan and conduct structured site walks.
3. Capture observations, evidence, interviews and supporting information.
4. Map processes, systems, data and operational relationships.
5. Assess digital and operational maturity.
6. Identify problems, root causes and opportunities.
7. Prioritise actions and quick wins.
8. Develop transformation initiatives and roadmaps.
9. Manage delivery and implementation progress.
10. Measure expected and realised benefits.
11. Generate selected client-facing outputs from approved internal information.

The central principle is:

> **Capture information once, structure it properly, connect it intelligently, and reuse it throughout the transformation lifecycle.**

The platform should not become a collection of disconnected forms and reports.

It should be a connected system in which observations, processes, systems, opportunities, initiatives, evidence and outcomes relate to one another.

---

# 3. Important Product Boundary

This is primarily an **internal Trion staff platform**.

It is not initially a public-facing customer application.

The primary users are:

- Trion consultants
- Trion project leads
- Trion analysts
- Trion technical delivery staff
- Trion management

Some information and outputs will eventually be shared with clients, but the internal workspace must remain the primary environment.

Therefore, design the application around:

## Internal workspace

Detailed working information, raw observations, internal analysis, notes, assumptions, evidence, calculations, draft outputs and delivery management.

## Controlled client outputs

Selected, reviewed and approved information presented through polished reports, maps, dashboards, summaries and potentially a future client portal.

Do not assume that everything entered internally should automatically become visible to a client.

The architecture should support this distinction from the beginning.

---

# 4. Product Principles

Use the following principles to guide all architectural and implementation decisions.

### 4.1 Evidence before assumption

The platform should distinguish between:

- Observed facts
- Client-provided information
- Imported data
- Consultant interpretation
- AI-generated suggestions
- Estimates
- Assumptions
- Approved conclusions

AI must not silently turn assumptions into facts.

### 4.2 Structured information before documents

Documents and reports are outputs of the platform, not the primary data store.

The underlying information should be structured and reusable.

### 4.3 One source of truth

Avoid duplicating the same information across unrelated modules.

For example, a process should be defined once and referenced by:

- Site walks
- Observations
- Systems
- Data flows
- Opportunities
- Maturity assessments
- Roadmaps
- Reports

### 4.4 Human-in-the-loop

AI may assist with analysis, suggestions, classification, summarisation and drafting.

However:

- AI suggestions must be distinguishable from approved information.
- Important conclusions require human review.
- Users must be able to correct AI output.
- The system must not fabricate client facts, financial values or evidence.

### 4.5 Practical manufacturing usability

The application should be usable by consultants working in offices, meeting rooms and manufacturing environments.

Prioritise:

- Clear navigation
- Fast data entry
- Minimal unnecessary clicks
- Strong search
- Useful filtering
- Structured forms
- Readable information density
- Responsive layouts
- Reliable operation
- Clear status and progress indicators

Do not design a generic enterprise dashboard full of decorative charts.

### 4.6 Professional but understated

The platform should feel like a serious engineering and transformation tool.

It should be:

- Clean
- Structured
- Modern
- Technical
- Calm
- Professional
- Information-led

Avoid:

- Excessive gradients
- Overly playful SaaS styling
- Unnecessary animations
- Generic AI visual language
- Overloaded dashboards
- Excessive colour
- Decorative components with no functional purpose

### 4.7 Build for evolution

The initial implementation should be intentionally modular.

Do not over-engineer a distributed system before there is a need.

Prefer a well-structured modular monolith with clear domain boundaries, unless the chosen technology makes another approach more appropriate.

---

# 5. Core Transformation Model

The following conceptual model should influence the architecture.

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
      ├── Owner
      ├── Timeline
      ├── Cost
      ├── Expected Benefits
      ├── Delivery Status
      └── Measured Outcomes
```

This is a conceptual model, not a demand to implement every entity immediately.

The architecture should allow these relationships to develop naturally.

---

# 6. Core Functional Areas

Establish the application structure around the following areas.

## 6.1 Workspace / Home

The internal landing area.

Should eventually provide:

- Active client engagements
- Recent activity
- Outstanding actions
- Upcoming site walks
- Diagnostic progress
- Priority opportunities
- Delivery initiatives
- Relevant alerts
- Quick access to recent projects

For the initial implementation, create a useful application shell and representative dashboard structure, but do not populate it with fabricated business metrics.

Use clearly marked empty states or realistic development fixtures.

---

## 6.2 Clients

Manage client organisations.

Potential information includes:

- Organisation name
- Industry
- Sites
- Primary contacts
- Engagements
- Notes
- Status
- Internal metadata

A client may have multiple sites and multiple engagements over time.

Do not assume one client equals one project.

---

## 6.3 Sites

Represent the physical operating environment.

Potential information includes:

- Site name
- Location
- Description
- Areas
- Processes
- Site contacts
- Relevant systems
- Engagement history

The site should become the foundation for understanding the client's operational environment.

---

## 6.4 Engagements / Projects

Represent a specific Trion assignment.

An engagement should have:

- Client
- Site or sites
- Engagement name
- Description
- Type
- Status
- Start date
- Target completion date
- Project lead
- Team members
- Current transformation stage
- Related site walks
- Related diagnostics
- Related opportunities
- Related initiatives
- Related outputs

Examples of engagement types:

- Digital Diagnostic
- Operational Improvement
- Systems Integration
- Automation Sprint
- Transformation Programme
- Advisory / Discovery

Do not hard-code these categories so rigidly that future types become difficult to add.

---

## 6.5 Site Walks

This is one of the most important future capabilities.

The platform should eventually guide consultants through structured site walks.

A site walk may contain:

- Engagement
- Site
- Area
- Process
- Date and time
- Consultant
- Walk type
- Planned scope
- Completed scope
- Observations
- Questions
- Interviews
- Evidence
- Follow-up actions

Future functionality may include:

- Guided prompts
- Checklists
- Voice notes
- Photographs
- Document attachments
- Mobile-friendly capture
- AI-assisted transcription
- AI-assisted structuring
- Offline-friendly workflows

Do not attempt to build all of these now.

Establish the domain boundary and navigation structure so they can be added properly later.

---

## 6.6 Processes & Operational Landscape

This area should eventually support the Trion Digital Landscape Map.

It should allow Trion to model:

- Areas
- Processes
- Sub-processes
- Activities
- Roles
- Systems
- Equipment
- Data
- Inputs
- Outputs
- Relationships
- Operational dependencies

The long-term goal is a structured representation of how the factory operates.

The visual Digital Landscape Map should eventually be generated from this underlying model rather than being an isolated drawing.

Do not build a complex visual graph editor in the initial task.

Establish the data model and a sensible placeholder interface.

---

## 6.7 Diagnosis

This area will eventually contain the diagnostic work.

Potential components:

- Digital & Operational Maturity Scorecard
- Assessment questions
- Assessment responses
- Maturity dimensions
- Evidence supporting scores
- Key findings
- Problem statements
- Root-cause analysis
- Diagnostic conclusions
- Diagnostic progress

The scorecard should eventually be configurable and evidence-linked.

Avoid implementing a rigid questionnaire engine prematurely.

---

## 6.8 Opportunities & Actions

This is a central domain area.

An opportunity may include:

- Title
- Description
- Problem addressed
- Related process
- Related area
- Related systems
- Evidence
- Root cause
- Opportunity type
- Expected impact
- Estimated value
- Estimated effort
- Confidence
- Priority
- Status
- Owner
- Related actions
- Related initiatives
- Internal notes
- Client-facing summary
- Approval state

Opportunity types may include:

- Eliminate
- Simplify
- Standardise
- Automate
- Integrate
- Improve visibility
- Transform

The platform should eventually support prioritisation and quick-win identification.

Do not build a complicated scoring algorithm without first establishing a clear domain model.

---

## 6.9 Roadmap & Delivery

This area will eventually support transformation delivery.

Potential entities include:

- Initiatives
- Actions
- Milestones
- Owners
- Dependencies
- Status
- Target dates
- Costs
- Expected benefits
- Actual benefits
- Risks
- Decisions
- Delivery notes

The roadmap should eventually connect directly to opportunities and diagnostic findings.

Avoid creating a separate disconnected project-management system.

---

## 6.10 Outputs & Reports

This area should eventually generate controlled outputs such as:

- Executive Summary
- Digital Landscape Map
- Maturity Scorecard
- Opportunity & Action Register
- Quick-Win Shortlist
- Transformation Roadmap
- Site Walk Summary
- Diagnostic Report
- Progress / Benefits Report

The key architectural principle is:

> **Reports are generated from structured, approved platform data.**

Do not make document editing the primary application workflow.

The initial implementation should establish an outputs area and a clear distinction between:

- Draft
- Internal review
- Approved
- Published / shared

---

# 7. AI Architecture Direction

AI is an important part of the product vision, but it must be introduced responsibly.

The platform should eventually support AI-assisted capabilities such as:

- Structuring site walk notes
- Summarising interviews
- Suggesting observations
- Classifying problems
- Identifying possible root causes
- Suggesting opportunity categories
- Detecting duplicate opportunities
- Identifying missing evidence
- Generating targeted follow-up questions
- Drafting executive summaries
- Suggesting roadmap structures
- Querying the transformation knowledge base

However, do not build an unrestricted chatbot as the primary AI architecture.

Prefer a future model where AI operates through explicit, contextual capabilities such as:

```text
AI Service
 ├── Context Builder
 ├── Prompt / Task Definition
 ├── Model Provider
 ├── Structured Response Parser
 ├── Validation
 ├── Human Review
 └── Audit / Provenance
```

AI-generated content should have a clear status, such as:

- Suggested
- Reviewed
- Approved
- Rejected

The architecture should allow model providers to change without rewriting the entire application.

Do not hard-code the application directly to one AI provider throughout the codebase.

---

# 8. Internal vs Client-Facing Information

This distinction is fundamental.

The platform should eventually support information visibility such as:

### Internal

- Raw notes
- Internal commentary
- Unverified observations
- Internal assumptions
- Draft analysis
- Internal financial calculations
- AI suggestions
- Internal delivery notes

### Client-shareable

- Approved findings
- Approved maturity scores
- Approved opportunities
- Approved recommendations
- Approved roadmap items
- Approved reports
- Approved dashboards

Do not implement a complex permissions matrix immediately unless necessary, but design the domain and application structure so that visibility and approval states can be introduced cleanly.

Avoid assuming that a client-facing portal must be built now.

---

# 9. Suggested Technical Direction

Choose a modern, maintainable technology stack appropriate for a serious internal business application.

Prioritise:

- Strong TypeScript support
- Clear component architecture
- Reliable data handling
- Good form and validation support
- Responsive UI
- Maintainable styling
- Testability
- Future API integration
- Future AI integration
- Future authentication and permissions
- Future document generation
- Future database persistence

A sensible initial direction would be a **TypeScript-based modular web application** with:

- A modern frontend framework
- A structured application router
- A component system
- A typed domain model
- A service / repository boundary
- A database abstraction
- Validation
- A clear configuration system
- A testing foundation

You may recommend and select the specific stack, but explain the decision briefly in the repository's architectural notes.

Do not introduce unnecessary microservices, event buses, Kubernetes, complex infrastructure or premature enterprise patterns.

The first objective is a clean, functional and extensible application.

---

# 10. Repository Structure

Establish a clear repository structure.

A suitable starting direction might resemble:

```text
trion-transformation-platform/
│
├── README.md
├── package.json
├── .env.example
├── .gitignore
├── .editorconfig
├──
├── apps/
│   └── web/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── layouts/
│       ├── lib/
│       ├── styles/
│       └── ...
│
├── packages/
│   ├── domain/
│   ├── ui/
│   ├── validation/
│   └── config/
│
├── database/
│   ├── schema/
│   ├── migrations/
│   └── seed/
│
├── docs/
│   ├── architecture/
│   ├── product/
│   └── decisions/
│
├── tests/
│
└── ...
```

This is an example, not a rigid requirement.

Adapt it to the chosen framework and explain the final structure.

The important thing is to separate:

- Application shell
- Domain logic
- Reusable UI
- Data access
- Validation
- Configuration
- Documentation
- Tests

Avoid putting all business logic inside page components.

---

# 11. Domain Architecture

Establish clear domain boundaries from the beginning.

At minimum, consider separating:

```text
Clients
Sites
Engagements
Site Walks
Processes
Systems
Evidence
Diagnosis
Opportunities
Roadmap
Delivery
Outputs
AI
```

These do not necessarily need to be separate deployable services.

They should be understandable modules with clear responsibilities.

For example:

- A site walk should reference processes.
- An observation should be associated with a site walk.
- An opportunity should reference supporting evidence.
- An initiative should reference an opportunity.
- A report should draw from approved domain information.

Avoid circular dependencies and tightly coupled feature code.

---

# 12. Design System & Brand Direction

The platform should reflect Trion's brand.

Use a restrained, professional visual language.

### Desired characteristics

- Darker, sophisticated primary interface
- Clean light content surfaces where useful
- Strong typography
- Clear hierarchy
- Subtle borders
- Controlled use of accent colour
- Technical / architectural feel
- Consistent spacing
- High information clarity
- Excellent desktop experience
- Responsive behaviour for field use

The platform should feel related to Trion's wider identity, but it does not need to replicate the public website.

Do not invent excessive branding elements.

Create a small, reusable design system with:

- Typography
- Colours / tokens
- Spacing
- Radius
- Shadows
- Buttons
- Inputs
- Selects
- Cards
- Tables
- Tabs
- Badges
- Status indicators
- Empty states
- Modals / drawers
- Navigation
- Page headers

Avoid building every component from scratch if a reliable component library is appropriate.

However, do not allow a component library's default styling to dictate the entire product.

---

# 13. Initial Application Shell

The first implementation should produce a functional application shell.

It should include:

### Global navigation

- Home
- Clients
- Sites
- Engagements
- Site Walks
- Landscape
- Diagnosis
- Opportunities
- Roadmap
- Outputs
- Settings

### Application layout

- Sidebar or appropriate navigation
- Top bar
- Breadcrumbs
- Page title
- Context indicator
- Main content area
- Responsive behaviour

### Initial pages

Create sensible initial versions of:

1. Home / Workspace
2. Clients
3. Engagements
4. Site Walks
5. Opportunities
6. Outputs

The pages should be functional enough to demonstrate the architecture.

Use realistic development fixtures where needed, but clearly distinguish them from real data.

Do not create a large amount of fake content merely to make the application look populated.

---

# 14. Initial Data Model

Establish an initial typed domain model for the most important entities.

At minimum, consider:

```text
Client
Site
Engagement
Area
Process
SiteWalk
Observation
Evidence
Opportunity
Action
Initiative
Output
User
```

Each entity should have:

- Stable identifier
- Created timestamp
- Updated timestamp
- Appropriate relationships
- Clear types
- Validation where relevant

Do not over-model every possible field immediately.

Start with a coherent foundation that can expand.

Use a consistent approach to:

- IDs
- Dates
- Statuses
- Enums
- Optional fields
- Relationships
- Validation
- Error handling

Avoid uncontrolled use of `any`.

---

# 15. Data Persistence

The application should be designed for real persistence, even if the first interface uses development data.

Do not build the architecture around hard-coded arrays scattered through components.

Use a clear data access boundary.

For example:

```text
UI
 ↓
Feature / Application Logic
 ↓
Domain / Service Layer
 ↓
Repository / Data Access
 ↓
Database
```

If a database is not fully configured in the initial task, create a sensible abstraction and development implementation.

Make it straightforward to replace development fixtures with real persistence.

---

# 16. Authentication & Permissions

This is an internal business application.

Authentication and role-based access will eventually be important.

For the initial implementation:

- Establish a clear location for authentication logic.
- Avoid scattering user checks throughout components.
- Define a basic user / role concept.
- Make it possible to introduce organisation-level permissions later.
- Do not implement a full enterprise identity system unless required for the initial application to run.

Potential future roles include:

- Administrator
- Consultant
- Project Lead
- Analyst
- Technical Delivery
- Management
- Client User

Do not assume all roles need to be fully implemented now.

---

# 17. Development Standards

Establish strong engineering standards.

The repository should include:

- TypeScript strictness
- Linting
- Formatting
- Sensible naming conventions
- Reusable components
- Typed interfaces
- Validation
- Error handling
- Loading states
- Empty states
- Basic testing setup
- Environment configuration
- Clear README instructions

Prefer small, understandable functions.

Avoid:

- Giant components
- Duplicated UI
- Hard-coded business logic in pages
- Unclear state management
- Unnecessary abstraction
- Magic strings
- Inconsistent naming
- Unvalidated user input
- Silent failures

---

# 18. AI Coding Behaviour

You are working as a senior engineer within an evolving product.

Before implementing anything:

1. Understand the existing repository structure.
2. Identify the relevant domain boundary.
3. Reuse existing components and patterns.
4. Avoid introducing duplicate architecture.
5. Consider how the feature will connect to the wider transformation model.
6. Keep implementation scope appropriate.
7. Explain important architectural decisions.
8. Prefer maintainability over cleverness.

When a requirement is ambiguous:

- Make a sensible assumption.
- State the assumption.
- Implement a flexible foundation.
- Avoid blocking progress unnecessarily.

Do not ask unnecessary questions when a reasonable default exists.

---

# 19. First Task — What You Must Do Now

Complete the following in this initial task.

## A. Establish the repository

Create the initial project structure and configuration.

## B. Select and initialise the technology stack

Choose a sensible stack for this product and briefly explain why.

## C. Create the application shell

Implement the main layout, navigation and initial pages.

## D. Establish the domain model

Create the initial typed entities and relationships.

## E. Establish the data access boundary

Create a clean approach for development data and future persistence.

## F. Establish the design system

Create reusable UI foundations consistent with Trion's brand direction.

## G. Establish development standards

Configure formatting, linting, typing and testing foundations.

## H. Create initial documentation

Include a concise README and architectural notes explaining:

- What the platform is
- Who it is for
- Core product principles
- Chosen technology stack
- Repository structure
- Domain boundaries
- How to run the project
- How future feature work should be organised

Do not create a large documentation portal.

The documentation should be useful, concise and maintainable.

---

# 20. What Not to Build Yet

Do not attempt to implement the following in this initial task:

- Full AI assistant
- AI model integrations
- Complex graph editor
- Full maturity assessment engine
- Full report generation engine
- Client portal
- Advanced permissions system
- Complex workflow automation
- Full CRM
- Full project management suite
- Complex financial modelling
- Mobile native application
- Offline synchronisation
- Production deployment infrastructure
- Enterprise integrations
- Overly complex database architecture

Instead, establish the foundations that make these features straightforward to add later.

---

# 21. Expected Result

At the end of this task, the repository should contain:

1. A clean and runnable application.
2. A professional Trion-inspired interface.
3. A coherent navigation structure.
4. A sensible initial domain model.
5. A clear architectural separation.
6. A foundation for real data persistence.
7. A foundation for AI-assisted workflows.
8. A foundation for internal/client information separation.
9. Reusable UI components.
10. Clear instructions for continuing development.

The result should feel like the beginning of a serious internal product — not a disposable prototype.

---

# 22. Final Instruction

Think carefully about the long-term product, but implement only the appropriate first layer.

**Do not build a superficial dashboard. Build the foundation of a connected transformation platform.**

The most important architectural idea is:

> **The platform is a structured transformation knowledge system, with guided workflows and generated outputs built on top.**

Begin by inspecting the empty repository, selecting the stack, establishing the structure, and implementing the initial application shell and foundations.

When complete, summarise:

- What you created
- The chosen stack
- The repository structure
- The core architectural decisions
- What is intentionally deferred
- How the next feature should be implemented