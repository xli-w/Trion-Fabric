import type {
  MethodologyActivity,
  MethodologyActivityRequirement,
  MethodologyActivityType,
  MethodologyLinkedDomain,
  MethodologyStage,
  MethodologyTemplate,
  OutputType,
} from '@domain';

export const methodologyTemplateTimestamp = '2026-09-01T09:00:00Z';

interface StageDefinition {
  key: string;
  name: string;
  description: string;
  activityType: MethodologyActivityType;
  requirement: MethodologyActivityRequirement;
  linkedDomain: MethodologyLinkedDomain;
  prompts: string[];
  guidance: string[];
  completionCriteria: string[];
  minimumRecords?: number;
}

function createTemplate(input: {
  id: string;
  name: string;
  description: string;
  engagementType: MethodologyTemplate['engagementType'];
  version: string;
  definitions: StageDefinition[];
  requiredInformation: MethodologyTemplate['requiredInformation'];
  optionalInformation: MethodologyTemplate['optionalInformation'];
  expectedOutputTypes: OutputType[];
}) {
  const stages: MethodologyStage[] = input.definitions.map(
    (definition, index) => ({
      id: `methodology-stage-${input.id}-${definition.key}`,
      createdAt: methodologyTemplateTimestamp,
      updatedAt: methodologyTemplateTimestamp,
      templateId: input.id,
      name: definition.name,
      description: definition.description,
      order: index + 1,
      completionRules: [
        {
          id: `methodology-rule-${input.id}-${definition.key}-activities`,
          type: 'all-required-activities',
          description:
            definition.requirement === 'required'
              ? 'All required activity records are complete.'
              : 'The optional activity is completed when used.',
        },
        ...(definition.minimumRecords
          ? [
              {
                id: `methodology-rule-${input.id}-${definition.key}-support`,
                type: 'minimum-linked-records' as const,
                description: `At least ${definition.minimumRecords} linked ${definition.linkedDomain} record${definition.minimumRecords === 1 ? '' : 's'} is available.`,
                linkedDomain: definition.linkedDomain,
                minimumCount: definition.minimumRecords,
              },
            ]
          : []),
      ],
      activityIds: [`methodology-activity-${input.id}-${definition.key}`],
    }),
  );
  const activities: MethodologyActivity[] = input.definitions.map(
    (definition) => ({
      id: `methodology-activity-${input.id}-${definition.key}`,
      createdAt: methodologyTemplateTimestamp,
      updatedAt: methodologyTemplateTimestamp,
      templateId: input.id,
      stageId: `methodology-stage-${input.id}-${definition.key}`,
      name: definition.name,
      description: definition.description,
      activityType: definition.activityType,
      requirement: definition.requirement,
      completionCriteria: definition.completionCriteria,
      linkedDomain: definition.linkedDomain,
      prompts: definition.prompts,
      guidance: definition.guidance,
    }),
  );
  const template: MethodologyTemplate = {
    id: input.id,
    createdAt: methodologyTemplateTimestamp,
    updatedAt: methodologyTemplateTimestamp,
    name: input.name,
    description: input.description,
    engagementType: input.engagementType,
    version: input.version,
    status: 'active',
    stageIds: stages.map((stage) => stage.id),
    activityIds: activities.map((activity) => activity.id),
    prompts: input.definitions.flatMap((definition) => definition.prompts),
    requiredInformation: input.requiredInformation,
    optionalInformation: input.optionalInformation,
    expectedOutputTypes: input.expectedOutputTypes,
  };

  return { template, stages, activities };
}

const preliminarySiteWalk = createTemplate({
  id: 'preliminary-site-walk-2026-1',
  name: 'Preliminary Site Walk',
  description:
    'A structured, lightweight factory investigation that guides a practical next-step decision without assuming a full diagnostic.',
  engagementType: 'Preliminary Site Walk',
  version: '2026.1',
  requiredInformation: [
    {
      id: 'preliminary-engagement-context',
      label: 'Visit purpose and scope',
      description: 'Why Trion is visiting and what the walk must clarify.',
      linkedDomain: 'engagement',
      minimumCount: 1,
    },
    {
      id: 'preliminary-site-walk',
      label: 'Recorded site walk',
      description: 'A site walk connected to the scoped engagement.',
      linkedDomain: 'site-walk',
      minimumCount: 1,
    },
  ],
  optionalInformation: [
    {
      id: 'preliminary-friction',
      label: 'Friction and loss tracker',
      description: 'Immediate friction or loss observations where they are evidenced.',
      linkedDomain: 'friction-item',
      minimumCount: 1,
    },
  ],
  expectedOutputTypes: ['site-walk-summary'],
  definitions: [
    {
      key: 'pre-tour-briefing',
      name: 'Pre-tour Briefing',
      description: 'Set visit purpose, practical scope, and hypotheses to test.',
      activityType: 'context',
      requirement: 'required',
      linkedDomain: 'engagement',
      prompts: [
        'Why is Trion visiting?',
        'What does the client make or deliver?',
        'Which priorities or pain points need testing?',
      ],
      guidance: [
        'Record the business context before entering the shop floor.',
        'Treat early hypotheses as prompts to test, not conclusions.',
      ],
      completionCriteria: [
        'Objectives or scope are recorded.',
        'The visit focus is clear to the delivery team.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'shopfloor-tour',
      name: 'Shopfloor Tour',
      description: 'Observe the real working environment and the people, process, and equipment involved.',
      activityType: 'fieldwork',
      requirement: 'required',
      linkedDomain: 'site-walk',
      prompts: [
        'Which work is physically observed?',
        'Who performs or supervises each handoff?',
        'Where does work wait, stop, or require clarification?',
      ],
      guidance: [
        'Capture observed fact separately from reported explanations.',
      ],
      completionCriteria: [
        'The scoped walk has been recorded.',
        'The material or process area observed is clear.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'material-process-flow',
      name: 'Material and Process Flow',
      description: 'Trace the practical sequence from material receipt through handoff, work in progress, and dispatch.',
      activityType: 'mapping',
      requirement: 'required',
      linkedDomain: 'process',
      prompts: [
        'Where does raw material enter?',
        'How does work move through WIP and staging?',
        'Which departmental handoffs introduce delay or ambiguity?',
      ],
      guidance: [
        'Map the actual flow, including informal workarounds.',
      ],
      completionCriteria: [
        'At least one relevant process is connected to the engagement.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'data-paper-red-flags',
      name: 'Data and Paper-Tracking Red Flags',
      description: 'Identify paper, spreadsheet, whiteboard, duplicate-entry, and information-delay signals.',
      activityType: 'evidence',
      requirement: 'required',
      linkedDomain: 'evidence',
      prompts: [
        'Where are paper travellers, clipboards, or manual trackers used?',
        'Where is the same information re-keyed or verbally relayed?',
        'Which information is missing, duplicated, or delayed?',
      ],
      guidance: [
        'Attach evidence where practical rather than treating an observation as proof by itself.',
      ],
      completionCriteria: [
        'At least one evidence item or evidence-linked observation is recorded.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'machine-operations-downtime',
      name: 'Machine Operations and Downtime',
      description: 'Understand how machine status, downtime, maintenance, and quality signals are captured and escalated.',
      activityType: 'fieldwork',
      requirement: 'required',
      linkedDomain: 'observation',
      prompts: [
        'What happens when a machine goes down unexpectedly?',
        'How is maintenance alerted?',
        'How are scrap, rework, and quality checks recorded?',
      ],
      guidance: [
        'Do not infer a root cause from a single incident.',
      ],
      completionCriteria: [
        'At least one observation describes the operating or downtime context.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'high-impact-prompts',
      name: 'High-Impact Diagnostic Prompts',
      description: 'Use targeted prompts to surface the most valuable areas for further investigation.',
      activityType: 'analysis',
      requirement: 'optional',
      linkedDomain: 'observation',
      prompts: [
        'Which manual administrative task would you eliminate?',
        'How long until production numbers reach management?',
        'What is most frustrating about shift changeover?',
      ],
      guidance: [
        'Skip only when the prompt set is not relevant to the visit scope, and record why.',
      ],
      completionCriteria: [
        'Useful responses are recorded as observations or follow-up questions.',
      ],
    },
    {
      key: 'friction-loss-tracker',
      name: 'Immediate Friction and Loss-Aversion Tracker',
      description: 'Capture immediate operational friction with explicit assumptions and confidence.',
      activityType: 'analysis',
      requirement: 'required',
      linkedDomain: 'friction-item',
      prompts: [
        'What always takes longer than it should?',
        'Where is avoidable rework or waiting visible?',
        'Who is affected and how often?',
      ],
      guidance: [
        'Keep estimates indicative until they are validated.',
      ],
      completionCriteria: [
        'At least one friction item is recorded or the absence of observed friction is documented.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'post-tour-recap',
      name: 'Post-tour Recap',
      description: 'Record the observed process summary, corrected assumptions, and confirmed bottleneck where known.',
      activityType: 'analysis',
      requirement: 'required',
      linkedDomain: 'site-walk',
      prompts: [
        'What was validated, misunderstood, or corrected?',
        'What is the confirmed bottleneck?',
        'What immediate opportunities are visible?',
      ],
      guidance: [
        'Separate confirmed findings from areas needing a deeper diagnostic.',
      ],
      completionCriteria: [
        'Post-tour recap or validation notes are recorded against the walk.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'agreed-next-step',
      name: 'Agreed Next Step',
      description: 'Capture the practical decision and ownership after the preliminary visit.',
      activityType: 'decision',
      requirement: 'required',
      linkedDomain: 'action',
      prompts: [
        'What should happen next?',
        'Is a deeper Digital Diagnostic recommended?',
        'Who owns the follow-up and by when?',
      ],
      guidance: [
        'Promotion is a consulting decision supported by the walk, not a checkbox outcome.',
      ],
      completionCriteria: [
        'A follow-up action or agreed next step is recorded.',
      ],
      minimumRecords: 1,
    },
  ],
});

const digitalDiagnostic = createTemplate({
  id: 'digital-diagnostic-2026-1',
  name: 'Digital Diagnostic',
  description:
    'A structured, evidence-led diagnostic that moves from business context and fieldwork to maturity, findings, prioritisation, and controlled outputs.',
  engagementType: 'Digital Diagnostic',
  version: '2026.1',
  requiredInformation: [
    {
      id: 'diagnostic-engagement-context',
      label: 'Engagement objectives and scope',
      description: 'The intended improvement context and boundaries are explicit.',
      linkedDomain: 'engagement',
      minimumCount: 1,
    },
    {
      id: 'diagnostic-site-walks',
      label: 'Site-walk evidence',
      description: 'Fieldwork is connected to the diagnostic engagement.',
      linkedDomain: 'site-walk',
      minimumCount: 1,
    },
    {
      id: 'diagnostic-evidence',
      label: 'Evidence collection',
      description: 'Evidence supports the observed operational picture.',
      linkedDomain: 'evidence',
      minimumCount: 1,
    },
  ],
  optionalInformation: [
    {
      id: 'diagnostic-data-objects',
      label: 'Data objects',
      description: 'Key data objects can be mapped when they are relevant to the diagnostic.',
      linkedDomain: 'data-object',
      minimumCount: 1,
    },
    {
      id: 'diagnostic-roles',
      label: 'Operational roles',
      description: 'Roles can be mapped where handoffs or ownership need clarification.',
      linkedDomain: 'role',
      minimumCount: 1,
    },
  ],
  expectedOutputTypes: [
    'executive-summary',
    'maturity-scorecard',
    'landscape-map',
    'opportunity-action-register',
    'transformation-roadmap',
  ],
  definitions: [
    {
      key: 'engagement-setup',
      name: 'Engagement Setup',
      description: 'Confirm the client, site coverage, delivery team, and diagnostic boundaries.',
      activityType: 'context',
      requirement: 'required',
      linkedDomain: 'engagement',
      prompts: [
        'What is in and out of scope?',
        'Which site and teams are covered?',
        'What does success need to inform?',
      ],
      guidance: ['Keep commercial context internal to the workbench.'],
      completionCriteria: [
        'Client, site coverage, and team are recorded.',
        'Objectives or scope are recorded.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'business-context',
      name: 'Business Context',
      description: 'Record the operating context, priorities, constraints, and known hypotheses.',
      activityType: 'context',
      requirement: 'required',
      linkedDomain: 'engagement',
      prompts: [
        'What operational, commercial, or leadership priorities matter?',
        'Which constraints shape the practical recommendation?',
      ],
      guidance: [
        'Treat client statements as client-provided information until evidenced.',
      ],
      completionCriteria: [
        'Business context and intended outcome are clear.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'site-walks',
      name: 'Site Walks',
      description: 'Plan and capture fieldwork across the relevant operating areas.',
      activityType: 'fieldwork',
      requirement: 'required',
      linkedDomain: 'site-walk',
      prompts: [
        'Which areas and processes require direct observation?',
        'Which roles should be spoken with during the walk?',
      ],
      guidance: ['Use structured site walks rather than generic meeting notes.'],
      completionCriteria: [
        'At least one connected site walk is recorded.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'process-landscape-mapping',
      name: 'Process and Landscape Mapping',
      description: 'Map relevant processes, systems, data objects, and operational handoffs.',
      activityType: 'mapping',
      requirement: 'required',
      linkedDomain: 'process',
      prompts: [
        'Which process steps, systems, and data handoffs are material?',
        'Where is the current landscape unclear or duplicated?',
      ],
      guidance: [
        'Map the current reality before recommending replacement or automation.',
      ],
      completionCriteria: [
        'Relevant process or landscape context is connected.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'evidence-collection',
      name: 'Evidence Collection',
      description: 'Capture evidence that can support later findings and recommendations.',
      activityType: 'evidence',
      requirement: 'required',
      linkedDomain: 'evidence',
      prompts: [
        'Which observations need a photograph, document, export, or interview note?',
        'What supports the current-state picture?',
      ],
      guidance: [
        'Evidence supports a conclusion; it does not automatically prove it.',
      ],
      completionCriteria: [
        'Evidence is captured and connected to the engagement.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'maturity-assessment',
      name: 'Maturity Assessment',
      description: 'Assess the Digital & Operational Maturity Scorecard with rationale and evidence links.',
      activityType: 'assessment',
      requirement: 'required',
      linkedDomain: 'assessment',
      prompts: [
        'What is the evidenced current state for each relevant dimension?',
        'Which scores remain unknown or need validation?',
      ],
      guidance: [
        'A score without rationale or evidence is incomplete, not diagnostic proof.',
      ],
      completionCriteria: [
        'Maturity dimensions are scored with rationale where assessed.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'findings',
      name: 'Findings',
      description: 'Formulate evidence-led findings that explain the current situation and why it matters.',
      activityType: 'analysis',
      requirement: 'required',
      linkedDomain: 'finding',
      prompts: [
        'What has been evidenced?',
        'Why does it matter operationally?',
        'What remains uncertain?',
      ],
      guidance: [
        'Keep findings traceable to observations and evidence.',
      ],
      completionCriteria: [
        'At least one reviewed finding is recorded.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'opportunity-action-register',
      name: 'Opportunity and Action Register',
      description: 'Shape evidence-led opportunities and immediate actions without turning the diagnostic into generic project management.',
      activityType: 'analysis',
      requirement: 'required',
      linkedDomain: 'opportunity',
      prompts: [
        'What is the Current Situation?',
        'What is the Identified Issue and Why It Matters?',
        'What Recommended Improvement and Potential Benefits are credible?',
      ],
      guidance: [
        'Keep indicative value distinct from guaranteed benefits.',
      ],
      completionCriteria: [
        'At least one opportunity or action is connected.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'prioritisation',
      name: 'Prioritisation',
      description: 'Review priorities, evidence strength, dependencies, timing, and next steps.',
      activityType: 'prioritisation',
      requirement: 'required',
      linkedDomain: 'opportunity',
      prompts: [
        'What should happen first and why?',
        'Which dependencies or assumptions must be validated?',
      ],
      guidance: [
        'Prioritisation is a consulting judgement supported by evidence, not a formula alone.',
      ],
      completionCriteria: [
        'Priority opportunities have a recommended timing or next step.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'executive-summary',
      name: 'Executive Summary',
      description: 'Prepare the controlled summary of the evidence-led diagnostic narrative.',
      activityType: 'output',
      requirement: 'required',
      linkedDomain: 'output',
      prompts: [
        'What should a decision-maker understand about the current state and direction?',
      ],
      guidance: [
        'Use only approved structured sources in client-facing output.',
      ],
      completionCriteria: [
        'An Executive Summary output is prepared and approved for its intended audience.',
      ],
      minimumRecords: 1,
    },
    {
      key: 'transformation-roadmap',
      name: 'Transformation Roadmap',
      description: 'Prepare the governed roadmap sequencing approved opportunities into practical phases.',
      activityType: 'output',
      requirement: 'required',
      linkedDomain: 'output',
      prompts: [
        'How should approved work sequence through Simplify, Connect, Optimise, and Scale?',
      ],
      guidance: [
        'Do not add a roadmap item without a connected approved opportunity or initiative.',
      ],
      completionCriteria: [
        'A Transformation Roadmap output is prepared and approved for its intended audience.',
      ],
      minimumRecords: 1,
    },
  ],
});

export const methodologyTemplates = [
  preliminarySiteWalk.template,
  digitalDiagnostic.template,
];

export const methodologyStages = [
  ...preliminarySiteWalk.stages,
  ...digitalDiagnostic.stages,
];

export const methodologyActivities = [
  ...preliminarySiteWalk.activities,
  ...digitalDiagnostic.activities,
];
