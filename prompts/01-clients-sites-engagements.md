# Trion Transformation Platform — Stage 1
## Clients, Sites & Engagements

You are continuing development of the Trion Transformation Platform.

The repository has already been initialised with an application shell, foundational architecture, reusable UI components, typed domain models and a data access boundary.

Before making changes, inspect the existing repository and understand its architecture. Reuse established patterns. Do not replace the existing stack or introduce a competing architecture.

Your task is to implement the first substantial functional domain:

> Clients → Sites → Engagements

This is the organisational foundation for the entire transformation platform.

## Context

Trion is a manufacturing digitalisation and operational transformation consultancy. The platform is primarily for internal Trion staff to manage and deliver transformation engagements.

A client may have multiple sites, multiple engagements, multiple areas and processes, and a history of previous work. An engagement represents a specific piece of Trion work for a client and may cover one or more sites.

Do not assume that one client equals one project.

## Domain Model

Implement a coherent initial model for:

### Client
Potential fields:
- id
- name
- industry
- description
- status
- primary contact information
- internal notes
- createdAt
- updatedAt

### Site
Potential fields:
- id
- clientId
- name
- location
- description
- status
- internal notes
- createdAt
- updatedAt

### Engagement
Potential fields:
- id
- clientId
- name
- description
- engagementType
- status
- startDate
- targetEndDate
- projectLead
- teamMembers
- currentStage
- internalNotes
- createdAt
- updatedAt

Engagement types may include Digital Diagnostic, Operational Improvement, Systems Integration, Automation Sprint, Transformation Programme, and Advisory / Discovery.

Statuses should be represented consistently rather than as arbitrary strings.

## Required Functionality

### Clients
- List, search, filter and view clients.
- Create and edit clients.
- View associated sites and engagements.

### Sites
- List, view, create and edit sites.
- Associate sites with clients.
- View associated engagements.

### Engagements
- List, search and filter engagements.
- Create and edit engagements.
- View engagement details.
- Associate engagements with clients and one or more sites.
- Assign a project lead.
- Display current transformation stage, status and dates.

Use sensible forms, validation, loading states, empty states and error handling.

## UX Requirements

The interface should feel like a professional internal consulting workbench. Prioritise clear hierarchy, fast navigation, useful tables, search, filtering, contextual detail pages, consistent page headers, clear status badges and good empty states.

A user should be able to:

> Open a client → see its sites → open an engagement → understand its scope and current status.

Use the existing Trion design system. Do not introduce excessive decorative UI.

## Data Architecture

Use the existing data access boundary. Do not scatter hard-coded client arrays throughout page components.

Ensure relationships are represented correctly, invalid references are prevented, forms validate input, development data is separated from future persistent data, and the implementation can later connect to a real database without rewriting the UI.

## Internal-First Design

This is an internal Trion workspace. Include internal notes and operational metadata where appropriate. Do not build client-facing sharing functionality yet, but keep the model extensible for future approved client-facing information.

## Scope Control

Do not implement site walks, observations, evidence, diagnostics, opportunities, AI functionality, client portal, advanced permissions or complex CRM functionality.

## Acceptance Criteria

1. Clients can be created, viewed, edited and listed.
2. Sites can be associated with clients.
3. Engagements can be associated with clients and sites.
4. Relationships are visible and navigable.
5. Search and filtering work.
6. Forms validate input.
7. Empty and loading states are handled.
8. The UI is consistent with the existing application.
9. No major architectural duplication has been introduced.
10. The application runs successfully and relevant checks pass.

After implementation, summarise the changes, assumptions and deferred work.
