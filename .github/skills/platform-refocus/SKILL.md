---
name: platform-refocus
description: Use for the workspace-centred direction change, information-architecture simplification, or enterprise-scope reduction in Fabric.
---

# Platform refocus

Use this skill for work guided by
[`prompts/Direction Change Prompt.md`](../../../prompts/Direction%20Change%20Prompt.md).
The objective is to refocus Fabric around the way Trion actually works, not to
produce a visual reskin or merely move old menus.

## Operating model

Fabric is an internal transformation analysis workbench for one or two Trion
consultants working deeply with one active client engagement at a time. The
same consultant can conduct a site walk, analyse evidence, build the landscape,
develop opportunities, sequence the roadmap, and prepare controlled outputs.

Optimise for one engagement, one workspace, and one connected body of evidence.
Collaboration, permissions, administration, and client sharing remain useful
but lightweight. Do not optimise the product for high-volume client portfolios,
large teams, resource allocation, CRM pipelines, enterprise project
management, notification systems, or complex approval matrices.

## Target experience

Keep the top-level product deliberately small:

```text
Clients
Active engagement
  Workspace
  Understand
  Analyse
  Plan & Output
```

The selected client, site, and engagement must remain visible and persist as
the user moves through the application. The active engagement is a workspace
context, not a reason to duplicate or denormalise the underlying data.

| Area | Primary work |
| --- | --- |
| Workspace | Current position, Current Understanding, priority work, and Next Action |
| Understand | Site walks, observations, contextual evidence, and the digital landscape |
| Analyse | Maturity diagnostic, findings, evidence and reasoning, opportunities, and priorities |
| Plan & Output | Roadmap, actions, benefits, and controlled outputs |

Systems, evidence, findings, actions, milestones, methodology, activity, AI,
knowledge, and configuration normally belong within these workspaces or
settings. Do not give them primary navigation simply because a backing entity
exists.

## Preserve depth; remove ceremony

Preserve the useful connected architecture: clients, sites, engagements,
processes, systems, people, data, site walks, observations, evidence,
diagnostic dimensions, findings, opportunities, initiatives, benefits,
provenance, review state, approval state, and useful version history. The data
model may be more sophisticated than the interface.

Simplify the human-facing workflow instead. Prefer direct relationships and
simple review/approval states over new assignment, workflow-instance, review
queue, notification, allocation, or role-matrix concepts. Keep methodology and
AI architecture, but present them as contextual guidance and assistance rather
than destinations to administer during normal consulting work.

Do not delete a useful model only because its current UI is excessive. Do not
keep a legacy surface merely by hiding it in a menu. Replace the workflow,
verify it, then deprecate, archive, or remove genuinely redundant surfaces.

## Refactoring procedure

1. **Audit first.** Inspect routes, navigation, screens, domain entities,
   services, repositories, permissions, AI, dashboards, administration, and
   duplicate concepts. Classify each affected item as **Keep**, **Simplify**,
   **Hide/Move**, **Deprecate**, or **Remove**, with a concise reason.
2. **Define the replacement.** Establish the active-engagement context and
   target information architecture before changing navigation. Specify how a
   user reaches secondary records contextually and what replaces any removed
   workflow.
3. **Refactor in user-flow order.** Simplify navigation, centre the Workspace,
   then deliver the Site Walk, Diagnostic, and Transformation workbenches.
   Move configuration into settings or an internal/admin layer.
4. **Reduce safely.** Preserve validation, provenance, visibility, approval,
   relationships, and data compatibility. Remove dead routes and duplicate
   workflows only after the replacement is complete and covered by tests.
5. **Refine deliberately.** Check context indicators, focused search,
   information density, empty/loading/error states, evidence linking, and
   cross-navigation. Prefer decision-useful status over decorative dashboards.

## Workbench expectations

- **Site Walk:** guide Brief, Walk, Capture, Investigate, Friction, Recap, and
  Next Step. It is an investigation workflow, not a scheduling system.
- **Diagnostic:** show maturity profile and let the consultant drill into each
  dimension's current state, desired state, gap, evidence, observations,
  potential opportunity, and confidence.
- **Transformation:** use the analytical opportunity register to prioritise
  improvements, sequence them on the roadmap, and prepare outputs.
- **Current Understanding:** distinguish evidence-backed facts from interpreted
  patterns, uncertainty and assumptions, friction, strengths, priority
  opportunities, and the recommended next action. Any AI synthesis must be
  evidence-grounded and reviewable.

The core output path is: Digital Landscape Map -> Maturity Scorecard ->
Opportunity and Action Register -> Transformation Roadmap -> Executive Summary.
The output interaction should be review -> approve -> export.

## Completion test

Validate the complete consultant journey: select a client, open the active
engagement, understand the current situation, capture observations and
evidence, map process and systems, complete a maturity assessment, review
findings, build and prioritise opportunities, create a roadmap, then review,
approve, and export the five core outputs.

The final question is: could one consultant use Fabric through a real client
diagnostic without feeling they are operating a corporate software platform?
If not, simplify the workflow or context further while retaining the
analytical depth.
