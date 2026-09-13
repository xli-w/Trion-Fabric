# Stage 8 — Digital Landscape Builder

## Objective

Turn the Digital Landscape Map into a living structured model of the client's operation.

The landscape should describe how business areas, processes, people, systems, data and machines relate to one another. It should not begin as a complicated diagramming application.

## Domain model

Implement or refine these entities:

- Business Area.
- Process.
- Process Step.
- System.
- Data Object.
- Role / Person Group.
- Machine / Asset.
- Handoff.
- Relationship.
- Landscape Version.

Support relationships such as:

- Area contains process.
- Process contains process step.
- Role performs process.
- Process uses system.
- Process produces data.
- Process consumes data.
- System exchanges data with system.
- Machine produces data.
- Process hands off to process.
- Observation relates to process or system.
- Opportunity improves process, system or information flow.

## Required functionality

### Structured editor

Allow a consultant to:

- Create and edit areas.
- Create and edit processes.
- Add process steps.
- Associate systems and data.
- Associate roles and machines.
- Record handoffs.
- Record manual or automated information transfer.
- Link observations and evidence.
- Link opportunities.
- Add notes and confidence.
- Mark items as confirmed, reported, assumed or to be validated.

### Views

Implement useful views over the same data:

1. Process view.
2. Systems view.
3. Data flow view.
4. People / responsibility view.
5. Opportunity overlay.

Do not duplicate data for each view.

### Landscape quality indicators

Identify useful warnings such as:

- Process without an owner.
- Process without a system or documented method.
- Manual handoff.
- Duplicate data entry.
- Data object with unclear owner.
- System relationship not validated.
- Process with linked friction observations.
- Opportunity without a mapped process.

These are prompts for review, not automatic conclusions.

### Versioning

Support landscape versions or snapshots so that a client’s current state can be preserved before future changes.

## Visualisation

Create a first visual landscape view, but prioritise:

- Readability.
- Filtering.
- Clear labels.
- Search.
- Relationship visibility.
- Avoiding visual overload.

Do not build a complex free-form graph editor unless the structured model is already stable.

## A3 output foundation

Prepare the landscape data for eventual professional A3-style export:

- Clear hierarchy.
- Consistent labels.
- Legend.
- Internal/client-facing visibility.
- Approved content only for external output.
- Landscape title, client, site, date and version.

## Acceptance criteria

- The landscape is structured rather than only a drawing.
- Multiple views use the same underlying model.
- Observations and opportunities can be overlaid.
- Uncertainty and ownership are represented.
- Landscape versions can be preserved.
- The first visualisation is useful and readable.
