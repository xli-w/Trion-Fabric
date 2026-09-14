import type {
  EntityId,
  FabricDataset,
  Output,
  OutputReportBlock,
  OutputReportContext,
  OutputReportSection,
  OutputReportSnapshot,
  OutputReportSource,
  OutputReportSourceExclusion,
  OutputType,
} from './model';
import { isOpportunityReadyForDelivery } from './access';
import {
  isClientSafeLandscapeEntity,
  isClientSafeLandscapeRelationship,
} from './landscape';

export interface OutputTemplateSection {
  id: string;
  title: string;
  description?: string;
  editable: boolean;
}

export interface OutputTemplate {
  id: OutputType;
  version: string;
  label: string;
  description: string;
  sections: OutputTemplateSection[];
}

export interface OutputSourceCandidate extends OutputReportSource {
  engagementId?: EntityId;
  updatedAt?: string;
  isClientSafe: boolean;
  exclusionReason?: string;
}

export interface OutputReport {
  schemaVersion: 'trion-output-report/v1';
  output: {
    id: EntityId;
    title: string;
    type: OutputType;
    version: string;
    status: Output['status'];
    visibility: Output['visibility'];
    createdAt: string;
    approvedAt?: string;
    publishedAt?: string;
  };
  snapshot: OutputReportSnapshot;
  clientReady: boolean;
}

export interface OutputReportComparison {
  previousVersion: string;
  currentVersion: string;
  changedSections: Array<{
    sectionId: string;
    title: string;
    change: 'added' | 'changed' | 'removed';
  }>;
  sourceReferencesChanged: boolean;
}

const templateVersion = '2026.1';

function createTemplate(
  id: OutputType,
  label: string,
  description: string,
  sections: OutputTemplateSection[],
): OutputTemplate {
  return { id, label, description, version: templateVersion, sections };
}

export const outputTemplates: Record<OutputType, OutputTemplate> = {
  'executive-summary': createTemplate(
    'executive-summary',
    'Executive Summary',
    'A concise, source-led view of the current state, priority decisions, and next steps.',
    [
      {
        id: 'engagement-context',
        title: 'Client and engagement context',
        editable: false,
      },
      {
        id: 'current-state',
        title: 'Current state',
        editable: true,
      },
      {
        id: 'key-findings',
        title: 'Key findings',
        editable: false,
      },
      {
        id: 'maturity-profile',
        title: 'Maturity profile',
        editable: false,
      },
      {
        id: 'strengths',
        title: 'Strengths',
        editable: false,
      },
      {
        id: 'priority-opportunities',
        title: 'Priority opportunities',
        editable: false,
      },
      {
        id: 'recommended-direction',
        title: 'Recommended direction',
        editable: true,
      },
      {
        id: 'roadmap-summary',
        title: 'Roadmap summary',
        editable: false,
      },
      {
        id: 'next-steps',
        title: 'Next steps',
        editable: true,
      },
    ],
  ),
  'maturity-scorecard': createTemplate(
    'maturity-scorecard',
    'Digital & Operational Maturity Scorecard',
    'A consistent ten-dimension scorecard grounded in approved assessment records.',
    [
      {
        id: 'engagement-context',
        title: 'Assessment context',
        editable: false,
      },
      {
        id: 'maturity-profile',
        title: 'Ten-dimension maturity profile',
        editable: false,
      },
      {
        id: 'current-and-desired-state',
        title: 'Current state, desired state, and gaps',
        editable: false,
      },
      {
        id: 'linked-opportunities',
        title: 'Linked opportunities',
        editable: false,
      },
      {
        id: 'scorecard-direction',
        title: 'Recommended direction',
        editable: true,
      },
    ],
  ),
  'landscape-map': createTemplate(
    'landscape-map',
    'Digital Landscape Map',
    'A client-safe view of the operating landscape and the approved improvement overlays connected to it.',
    [
      {
        id: 'engagement-context',
        title: 'Landscape context',
        editable: false,
      },
      {
        id: 'landscape-entities',
        title: 'Business areas, processes, systems, data, and roles',
        editable: false,
      },
      {
        id: 'landscape-relationships',
        title: 'Relationships and information flow',
        editable: false,
      },
      {
        id: 'friction-and-opportunities',
        title: 'Relevant friction and opportunity overlays',
        editable: false,
      },
      {
        id: 'legend-and-version',
        title: 'Legend and version information',
        editable: false,
      },
    ],
  ),
  'opportunity-action-register': createTemplate(
    'opportunity-action-register',
    'Opportunity & Action Register',
    'An approved register of practical transformation opportunities, dependencies, timing, and next actions.',
    [
      {
        id: 'engagement-context',
        title: 'Register context',
        editable: false,
      },
      {
        id: 'opportunity-register',
        title: 'Approved opportunity register',
        editable: false,
      },
      {
        id: 'action-summary',
        title: 'Suggested next actions',
        editable: true,
      },
    ],
  ),
  'transformation-roadmap': createTemplate(
    'transformation-roadmap',
    'Transformation Roadmap',
    'A sequenced, source-led roadmap using Trion’s Simplify, Connect, Optimise, and Scale phases.',
    [
      {
        id: 'engagement-context',
        title: 'Roadmap context',
        editable: false,
      },
      {
        id: 'roadmap-summary',
        title: 'Recommended sequencing',
        editable: false,
      },
      {
        id: 'roadmap-phases',
        title: 'Transformation phases',
        editable: false,
      },
      {
        id: 'initiative-plan',
        title: 'Initiatives, ownership, dependencies, and expected benefits',
        editable: false,
      },
      {
        id: 'roadmap-next-steps',
        title: 'Immediate next steps',
        editable: true,
      },
    ],
  ),
  'site-walk-summary': createTemplate(
    'site-walk-summary',
    'Site Walk Summary',
    'A controlled summary of approved observations and evidence from a fieldwork visit.',
    [
      {
        id: 'engagement-context',
        title: 'Visit context',
        editable: false,
      },
      {
        id: 'approved-observations',
        title: 'Approved observations',
        editable: false,
      },
      {
        id: 'approved-evidence',
        title: 'Approved evidence',
        editable: false,
      },
      {
        id: 'next-steps',
        title: 'Next steps',
        editable: true,
      },
    ],
  ),
  'supporting-analysis': createTemplate(
    'supporting-analysis',
    'Supporting Analysis',
    'A source-led supporting analysis for a controlled engagement decision.',
    [
      {
        id: 'engagement-context',
        title: 'Engagement context',
        editable: false,
      },
      {
        id: 'analysis',
        title: 'Approved analysis',
        editable: true,
      },
    ],
  ),
  'progress-report': createTemplate(
    'progress-report',
    'Progress Report',
    'A controlled update covering approved delivery status, actions, and milestones.',
    [
      {
        id: 'engagement-context',
        title: 'Engagement context',
        editable: false,
      },
      {
        id: 'progress-summary',
        title: 'Progress summary',
        editable: false,
      },
      {
        id: 'next-steps',
        title: 'Next steps',
        editable: true,
      },
    ],
  ),
  'benefits-report': createTemplate(
    'benefits-report',
    'Benefits Report',
    'A controlled report of validated benefits and their measurement provenance.',
    [
      {
        id: 'engagement-context',
        title: 'Engagement context',
        editable: false,
      },
      {
        id: 'validated-benefits',
        title: 'Validated benefits',
        editable: false,
      },
      {
        id: 'next-steps',
        title: 'Next steps',
        editable: true,
      },
    ],
  ),
};

const sourceTypesByOutputType: Record<OutputType, Set<string>> = {
  'executive-summary': new Set([
    'maturity-assessment',
    'finding',
    'opportunity',
    'initiative',
    'roadmap',
  ]),
  'maturity-scorecard': new Set(['maturity-assessment', 'opportunity']),
  'landscape-map': new Set([
    'landscape-entity',
    'landscape-relationship',
    'friction-item',
    'opportunity',
  ]),
  'opportunity-action-register': new Set([
    'finding',
    'opportunity',
    'action-item',
  ]),
  'transformation-roadmap': new Set([
    'roadmap',
    'initiative',
    'benefit-measurement',
  ]),
  'site-walk-summary': new Set(['observation', 'evidence']),
  'supporting-analysis': new Set([
    'maturity-assessment',
    'finding',
    'opportunity',
    'initiative',
    'roadmap',
    'landscape-entity',
    'landscape-relationship',
  ]),
  'progress-report': new Set([
    'initiative',
    'action-item',
    'benefit-measurement',
  ]),
  'benefits-report': new Set(['benefit-measurement', 'initiative']),
};

const roadmapPhaseWindows: Record<string, string> = {
  Simplify: '0-3 months',
  Connect: '3-6 months',
  Optimise: '6-12 months',
  Scale: '12+ months',
};

function labelise(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function uniqueValues(values: string[]) {
  return [...new Set(values)];
}

function uniqueSources(sources: OutputReportSource[]) {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (seen.has(source.id)) {
      return false;
    }
    seen.add(source.id);
    return true;
  });
}

function createContext(
  dataset: FabricDataset,
  output: Output,
): OutputReportContext {
  const engagement = dataset.engagements.find(
    (item) => item.id === output.engagementId,
  );
  const client = engagement
    ? dataset.clients.find((item) => item.id === engagement.clientId)
    : undefined;
  const sites = engagement
    ? dataset.sites.filter((item) => engagement.siteIds.includes(item.id))
    : [];

  return {
    clientId: client?.id ?? 'unknown-client',
    clientName: client?.name ?? 'Unknown client',
    clientIndustry: client?.industry ?? 'Not recorded',
    engagementId: output.engagementId,
    engagementName: engagement?.name ?? 'Unknown engagement',
    engagementType: engagement?.type ?? 'Digital Diagnostic',
    engagementStage: engagement?.stage ?? 'diagnose',
    siteNames: sites.map((site) => site.name),
  };
}

function outputSourceCandidate(
  id: EntityId,
  type: string,
  title: string,
  engagementId: EntityId | undefined,
  updatedAt: string | undefined,
  isClientSafe: boolean,
  exclusionReason?: string,
): OutputSourceCandidate {
  return {
    id,
    type,
    title,
    engagementId,
    updatedAt,
    isClientSafe,
    exclusionReason,
  };
}

function diagnosticEngagementId(
  dataset: FabricDataset,
  diagnosticId: EntityId,
) {
  return dataset.diagnostics.find((item) => item.id === diagnosticId)
    ?.engagementId;
}

function siteWalkEngagementId(dataset: FabricDataset, siteWalkId: EntityId) {
  return dataset.siteWalks.find((item) => item.id === siteWalkId)?.engagementId;
}

function actionEngagementId(dataset: FabricDataset, actionId: EntityId) {
  const action = dataset.actionItems.find((item) => item.id === actionId);
  if (!action) {
    return undefined;
  }

  if (action.opportunityId) {
    return dataset.opportunities.find(
      (item) => item.id === action.opportunityId,
    )?.engagementId;
  }

  if (action.initiativeId) {
    return dataset.initiatives.find((item) => item.id === action.initiativeId)
      ?.engagementId;
  }

  return undefined;
}

function evidenceEngagementId(dataset: FabricDataset, evidenceId: EntityId) {
  const evidence = dataset.evidence.find((item) => item.id === evidenceId);
  if (!evidence) {
    return undefined;
  }

  if (evidence.siteWalkId) {
    return siteWalkEngagementId(dataset, evidence.siteWalkId);
  }

  if (evidence.observationId) {
    const observation = dataset.observations.find(
      (item) => item.id === evidence.observationId,
    );
    return observation
      ? siteWalkEngagementId(dataset, observation.siteWalkId)
      : undefined;
  }

  if (evidence.relatedEntityType === 'engagement') {
    return evidence.relatedEntityId;
  }

  if (evidence.relatedEntityType === 'site-walk') {
    return siteWalkEngagementId(dataset, evidence.relatedEntityId);
  }

  if (evidence.relatedEntityType === 'observation') {
    const observation = dataset.observations.find(
      (item) => item.id === evidence.relatedEntityId,
    );
    return observation
      ? siteWalkEngagementId(dataset, observation.siteWalkId)
      : undefined;
  }

  if (evidence.relatedEntityType === 'opportunity') {
    return dataset.opportunities.find(
      (item) => item.id === evidence.relatedEntityId,
    )?.engagementId;
  }

  return dataset.outputs.find((item) => item.id === evidence.relatedEntityId)
    ?.engagementId;
}

export function getOutputTemplate(outputType: OutputType) {
  return outputTemplates[outputType];
}

export function getOutputSourceCandidate(
  dataset: FabricDataset,
  sourceId: EntityId,
): OutputSourceCandidate {
  const observation = dataset.observations.find((item) => item.id === sourceId);
  if (observation) {
    const isClientSafe =
      observation.status === 'verified' &&
      observation.visibility === 'approved-client-facing' &&
      observation.aiStatus !== 'suggested' &&
      observation.aiStatus !== 'rejected';
    return outputSourceCandidate(
      observation.id,
      'observation',
      observation.title ?? observation.summary,
      siteWalkEngagementId(dataset, observation.siteWalkId),
      observation.updatedAt,
      isClientSafe,
      isClientSafe
        ? undefined
        : 'The observation is not verified and approved for client-facing use.',
    );
  }

  const evidence = dataset.evidence.find((item) => item.id === sourceId);
  if (evidence) {
    const isClientSafe =
      evidence.approvalState === 'approved' &&
      evidence.reviewStatus === 'verified' &&
      evidence.visibility === 'approved-client-facing';
    return outputSourceCandidate(
      evidence.id,
      'evidence',
      evidence.title,
      evidenceEngagementId(dataset, evidence.id),
      evidence.updatedAt,
      isClientSafe,
      isClientSafe
        ? undefined
        : 'The evidence is not verified and approved for client-facing use.',
    );
  }

  const frictionItem = dataset.frictionItems.find(
    (item) => item.id === sourceId,
  );
  if (frictionItem) {
    const isClientSafe =
      frictionItem.approvalState === 'approved' &&
      frictionItem.reviewStatus === 'approved' &&
      frictionItem.visibility === 'approved-client-facing' &&
      Boolean(frictionItem.clientSummary);
    return outputSourceCandidate(
      frictionItem.id,
      'friction-item',
      frictionItem.clientSummary ?? frictionItem.frictionPoint,
      siteWalkEngagementId(dataset, frictionItem.siteWalkId),
      frictionItem.updatedAt,
      isClientSafe,
      isClientSafe
        ? undefined
        : 'The friction record is working material until its client summary is approved.',
    );
  }

  const assessment = dataset.maturityAssessments.find(
    (item) => item.id === sourceId,
  );
  if (assessment) {
    const dimension = dataset.diagnosticDimensions.find(
      (item) => item.id === assessment.dimensionId,
    );
    const isClientSafe = assessment.reviewStatus === 'approved';
    return outputSourceCandidate(
      assessment.id,
      'maturity-assessment',
      dimension?.name ?? 'Maturity assessment',
      diagnosticEngagementId(dataset, assessment.diagnosticId),
      assessment.updatedAt,
      isClientSafe,
      isClientSafe
        ? undefined
        : 'The maturity assessment has not been approved for reporting.',
    );
  }

  const finding = dataset.findings.find((item) => item.id === sourceId);
  if (finding) {
    const isClientSafe =
      finding.reviewStatus === 'approved' && Boolean(finding.clientSummary);
    return outputSourceCandidate(
      finding.id,
      'finding',
      finding.title,
      diagnosticEngagementId(dataset, finding.diagnosticId),
      finding.updatedAt,
      isClientSafe,
      isClientSafe
        ? undefined
        : 'The finding needs approved review and a client summary before reporting.',
    );
  }

  const landscapeEntity = dataset.landscapeEntities.find(
    (item) => item.id === sourceId,
  );
  if (landscapeEntity) {
    const isClientSafe = isClientSafeLandscapeEntity(landscapeEntity);
    return outputSourceCandidate(
      landscapeEntity.id,
      'landscape-entity',
      landscapeEntity.name,
      landscapeEntity.engagementId,
      landscapeEntity.updatedAt,
      isClientSafe,
      isClientSafe
        ? undefined
        : 'The landscape entity is not approved for client-facing use.',
    );
  }

  const landscapeRelationship = dataset.landscapeRelationships.find(
    (item) => item.id === sourceId,
  );
  if (landscapeRelationship) {
    const from = dataset.landscapeEntities.find(
      (item) => item.id === landscapeRelationship.fromEntityId,
    );
    const to = dataset.landscapeEntities.find(
      (item) => item.id === landscapeRelationship.toEntityId,
    );
    const isClientSafe =
      isClientSafeLandscapeRelationship(landscapeRelationship) &&
      Boolean(from && isClientSafeLandscapeEntity(from)) &&
      Boolean(to && isClientSafeLandscapeEntity(to));
    return outputSourceCandidate(
      landscapeRelationship.id,
      'landscape-relationship',
      `${from?.name ?? 'Unknown'} to ${to?.name ?? 'Unknown'}`,
      landscapeRelationship.engagementId,
      landscapeRelationship.updatedAt,
      isClientSafe,
      isClientSafe
        ? undefined
        : 'The relationship and both endpoint entities must be approved for client-facing use.',
    );
  }

  const opportunity = dataset.opportunities.find(
    (item) => item.id === sourceId,
  );
  if (opportunity) {
    const isClientSafe = isOpportunityReadyForDelivery(opportunity);
    return outputSourceCandidate(
      opportunity.id,
      'opportunity',
      opportunity.title,
      opportunity.engagementId,
      opportunity.updatedAt,
      isClientSafe,
      isClientSafe
        ? undefined
        : 'The opportunity is not an approved, client-facing, evidence-linked recommendation.',
    );
  }

  const action = dataset.actionItems.find((item) => item.id === sourceId);
  if (action) {
    const parentOpportunity = action.opportunityId
      ? dataset.opportunities.find((item) => item.id === action.opportunityId)
      : undefined;
    const parentInitiative = action.initiativeId
      ? dataset.initiatives.find((item) => item.id === action.initiativeId)
      : undefined;
    const parentIsSafe = parentOpportunity
      ? isOpportunityReadyForDelivery(parentOpportunity)
      : Boolean(
          parentInitiative &&
            parentInitiative.reviewStatus === 'approved' &&
            parentInitiative.clientSummary,
        );
    const isClientSafe =
      action.visibility === 'approved-client-facing' &&
      action.reviewStatus === 'approved' &&
      Boolean(action.clientSummary) &&
      parentIsSafe;
    return outputSourceCandidate(
      action.id,
      'action-item',
      action.clientSummary ?? action.title,
      actionEngagementId(dataset, action.id),
      action.updatedAt,
      isClientSafe,
      isClientSafe
        ? undefined
        : 'The action requires approved client-facing content and an approved parent recommendation.',
    );
  }

  const initiative = dataset.initiatives.find((item) => item.id === sourceId);
  if (initiative) {
    const isClientSafe =
      initiative.reviewStatus === 'approved' &&
      Boolean(initiative.clientSummary);
    return outputSourceCandidate(
      initiative.id,
      'initiative',
      initiative.title,
      initiative.engagementId,
      initiative.updatedAt,
      isClientSafe,
      isClientSafe
        ? undefined
        : 'The initiative needs approved review and a client summary before reporting.',
    );
  }

  const roadmap = dataset.roadmaps.find((item) => item.id === sourceId);
  if (roadmap) {
    const isClientSafe = roadmap.reviewStatus === 'approved';
    return outputSourceCandidate(
      roadmap.id,
      'roadmap',
      roadmap.title,
      roadmap.engagementId,
      roadmap.updatedAt,
      isClientSafe,
      isClientSafe
        ? undefined
        : 'The roadmap has not been approved for client-facing reporting.',
    );
  }

  const benefit = dataset.benefitMeasurements.find(
    (item) => item.id === sourceId,
  );
  if (benefit) {
    const initiative = dataset.initiatives.find(
      (item) => item.id === benefit.initiativeId,
    );
    const isClientSafe = benefit.status === 'validated';
    return outputSourceCandidate(
      benefit.id,
      'benefit-measurement',
      benefit.measure,
      initiative?.engagementId,
      benefit.updatedAt,
      isClientSafe,
      isClientSafe
        ? undefined
        : 'Only validated benefit measurements can appear in a controlled report.',
    );
  }

  return outputSourceCandidate(
    sourceId,
    'unknown',
    sourceId,
    undefined,
    undefined,
    false,
    'The source record is unavailable or is not eligible for controlled output reporting.',
  );
}

export function isClientSafeOutputSource(
  dataset: FabricDataset,
  sourceId: EntityId,
) {
  return getOutputSourceCandidate(dataset, sourceId).isClientSafe;
}

export function getOutputSourceCatalog(
  dataset: FabricDataset,
  engagementId: EntityId,
) {
  const sourceIds = [
    ...dataset.observations.map((item) => item.id),
    ...dataset.evidence.map((item) => item.id),
    ...dataset.frictionItems.map((item) => item.id),
    ...dataset.maturityAssessments.map((item) => item.id),
    ...dataset.findings.map((item) => item.id),
    ...dataset.landscapeEntities.map((item) => item.id),
    ...dataset.landscapeRelationships.map((item) => item.id),
    ...dataset.opportunities.map((item) => item.id),
    ...dataset.actionItems.map((item) => item.id),
    ...dataset.initiatives.map((item) => item.id),
    ...dataset.roadmaps.map((item) => item.id),
    ...dataset.benefitMeasurements.map((item) => item.id),
  ];

  return sourceIds
    .map((sourceId) => getOutputSourceCandidate(dataset, sourceId))
    .filter((source) => source.engagementId === engagementId)
    .sort((left, right) => {
      if (left.isClientSafe !== right.isClientSafe) {
        return left.isClientSafe ? -1 : 1;
      }
      return left.title.localeCompare(right.title);
    });
}

export function getRecommendedOutputSourceReferences(
  dataset: FabricDataset,
  engagementId: EntityId,
  outputType: OutputType,
) {
  const supportedTypes = sourceTypesByOutputType[outputType];
  return getOutputSourceCatalog(dataset, engagementId)
    .filter((source) => source.isClientSafe && supportedTypes.has(source.type))
    .map((source) => source.id);
}

export function isOutputSourceSupportedByTemplate(
  outputType: OutputType,
  sourceType: string,
) {
  return sourceTypesByOutputType[outputType].has(sourceType);
}

function createFingerprint(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function createSourceFingerprint(sources: OutputSourceCandidate[]) {
  const value = sources
    .map((source) =>
      [
        source.id,
        source.engagementId ?? '',
        source.updatedAt ?? '',
        source.type,
        source.title,
        source.isClientSafe ? 'safe' : 'excluded',
      ].join(':'),
    )
    .sort()
    .join('|');

  return createFingerprint(value);
}

function selectedSources(
  dataset: FabricDataset,
  output: Output,
): {
  included: OutputSourceCandidate[];
  excluded: OutputReportSourceExclusion[];
  all: OutputSourceCandidate[];
} {
  const all = uniqueValues(output.sourceReferences).map((sourceId) =>
    getOutputSourceCandidate(dataset, sourceId),
  );
  const included: OutputSourceCandidate[] = [];
  const excluded: OutputReportSourceExclusion[] = [];

  all.forEach((source) => {
    if (source.engagementId !== output.engagementId) {
      excluded.push({
        sourceId: source.id,
        reason: 'The source belongs to a different engagement.',
      });
      return;
    }

    if (!source.isClientSafe) {
      excluded.push({
        sourceId: source.id,
        reason:
          source.exclusionReason ??
          'The source is not approved for client-facing reporting.',
      });
      return;
    }

    included.push(source);
  });

  return { all, included, excluded };
}

function makeSection(
  template: OutputTemplate,
  id: string,
  sourceReferences: EntityId[],
  blocks: OutputReportBlock[],
): OutputReportSection {
  const definition = template.sections.find((section) => section.id === id);
  if (!definition) {
    throw new Error(`Unknown ${template.label} report section "${id}".`);
  }

  return {
    id,
    title: definition.title,
    description: definition.description,
    editable: definition.editable,
    blocks,
    sourceReferences: uniqueValues(sourceReferences),
  };
}

function noApprovedData(message: string): OutputReportBlock {
  return {
    type: 'callout',
    tone: 'warning',
    content: message,
  };
}

function recordsFor<T extends { id: EntityId }>(
  records: T[],
  sourceIds: Set<EntityId>,
) {
  return records.filter((record) => sourceIds.has(record.id));
}

function engagementContextBlocks(
  context: OutputReportContext,
): OutputReportBlock[] {
  return [
    {
      type: 'table',
      columns: ['Client', 'Industry', 'Engagement', 'Stage', 'Sites'],
      rows: [
        [
          context.clientName,
          context.clientIndustry,
          context.engagementName,
          labelise(context.engagementStage),
          context.siteNames.join(', ') || 'Not recorded',
        ],
      ],
    },
  ];
}

function maturityProfileBlocks(
  dataset: FabricDataset,
  assessments: FabricDataset['maturityAssessments'],
): OutputReportBlock[] {
  const assessmentByDimension = new Map(
    assessments.map((assessment) => [assessment.dimensionId, assessment]),
  );
  const rows = dataset.diagnosticDimensions.map((dimension) => {
    const assessment = assessmentByDimension.get(dimension.id);
    return [
      dimension.name,
      assessment?.score ? String(assessment.score) : 'Not assessed',
      assessment?.targetScore ? String(assessment.targetScore) : 'Not agreed',
      assessment?.level ?? 'Not assessed',
      assessment?.confidence ?? 'Not rated',
    ];
  });

  return [
    {
      type: 'table',
      columns: [
        'Dimension',
        'Score',
        'Agreed target',
        'Maturity level',
        'Confidence',
      ],
      rows,
    },
  ];
}

function maturityDetailBlocks(
  dataset: FabricDataset,
  assessments: FabricDataset['maturityAssessments'],
): OutputReportBlock[] {
  if (assessments.length === 0) {
    return [
      noApprovedData(
        'No approved maturity assessment has been selected for this output.',
      ),
    ];
  }

  const dimensionById = new Map(
    dataset.diagnosticDimensions.map((dimension) => [dimension.id, dimension]),
  );
  return [
    {
      type: 'table',
      columns: [
        'Dimension',
        'Current state',
        'Desired state',
        'Target score',
        'Target rationale',
        'Gap',
        'Rationale',
      ],
      rows: assessments.map((assessment) => [
        dimensionById.get(assessment.dimensionId)?.name ??
          'Maturity assessment',
        assessment.currentState ?? 'Not recorded',
        assessment.desiredState ?? 'Not recorded',
        assessment.targetScore ? String(assessment.targetScore) : 'Not agreed',
        assessment.targetRationale ?? 'Not recorded',
        assessment.gap ?? 'Not recorded',
        assessment.rationale ?? 'Not recorded',
      ]),
    },
  ];
}

function opportunityRegisterBlocks(
  dataset: FabricDataset,
  opportunities: FabricDataset['opportunities'],
): OutputReportBlock[] {
  if (opportunities.length === 0) {
    return [
      noApprovedData(
        'No approved client-facing opportunities have been selected for this output.',
      ),
    ];
  }

  const areaById = new Map(dataset.areas.map((area) => [area.id, area]));
  return [
    {
      type: 'table',
      columns: [
        'Area',
        'Current situation',
        'Identified issue',
        'Why it matters',
        'Recommended improvement',
        'Potential benefits',
        'Indicative value',
        'Priority',
        'Recommended timing',
        'Dependencies',
        'Suggested next step',
      ],
      rows: opportunities.map((opportunity) => [
        opportunity.areaId
          ? (areaById.get(opportunity.areaId)?.name ?? 'Not recorded')
          : 'Not recorded',
        opportunity.currentSituation ??
          opportunity.clientSummary ??
          'Not recorded',
        opportunity.identifiedIssue ?? opportunity.description,
        opportunity.whyItMatters ?? opportunity.expectedImpact,
        opportunity.recommendedImprovement ??
          opportunity.clientSummary ??
          'Not recorded',
        opportunity.potentialBenefits ?? opportunity.expectedImpact,
        opportunity.indicativeValue ?? 'Not recorded',
        labelise(opportunity.priority),
        opportunity.recommendedTiming ?? 'Not recorded',
        opportunity.dependencies ?? 'Not recorded',
        opportunity.suggestedNextStep ?? 'Not recorded',
      ]),
    },
  ];
}

function initiativeBlocks(
  dataset: FabricDataset,
  initiatives: FabricDataset['initiatives'],
): OutputReportBlock[] {
  if (initiatives.length === 0) {
    return [
      noApprovedData(
        'No approved initiatives have been selected for this roadmap output.',
      ),
    ];
  }

  const userById = new Map(dataset.users.map((user) => [user.id, user]));
  return [
    {
      type: 'table',
      columns: [
        'Initiative',
        'Phase',
        'Timing',
        'Ownership',
        'Dependencies',
        'Prerequisites',
        'Expected benefits',
        'Status',
      ],
      rows: initiatives.map((initiative) => [
        initiative.clientSummary ?? initiative.title,
        initiative.phase,
        roadmapPhaseWindows[initiative.phase] ?? 'Not recorded',
        userById.get(initiative.ownerUserId)?.displayName ?? 'Not recorded',
        initiative.dependencies ?? 'Not recorded',
        initiative.prerequisites ?? 'Not recorded',
        initiative.expectedBenefit,
        labelise(initiative.status),
      ]),
    },
  ];
}

function landscapeEntityBlocks(
  dataset: FabricDataset,
  entities: FabricDataset['landscapeEntities'],
): OutputReportBlock[] {
  if (entities.length === 0) {
    return [
      noApprovedData(
        'No approved landscape entities have been selected for this landscape output.',
      ),
    ];
  }

  return [
    {
      type: 'table',
      columns: ['Type', 'Name', 'Description', 'Owner role', 'Confidence'],
      rows: entities.map((entity) => [
        labelise(entity.type),
        entity.name,
        entity.description,
        entity.ownerRole ?? 'Not recorded',
        labelise(entity.confidence),
      ]),
    },
  ];
}

function landscapeRelationshipBlocks(
  dataset: FabricDataset,
  relationships: FabricDataset['landscapeRelationships'],
): OutputReportBlock[] {
  if (relationships.length === 0) {
    return [
      noApprovedData(
        'No approved landscape relationships have been selected for this output.',
      ),
    ];
  }

  const entityById = new Map(
    dataset.landscapeEntities.map((entity) => [entity.id, entity]),
  );
  return [
    {
      type: 'table',
      columns: ['From', 'Relationship', 'To', 'Transfer', 'Rationale'],
      rows: relationships.map((relationship) => [
        entityById.get(relationship.fromEntityId)?.name ?? 'Unknown',
        labelise(relationship.type),
        entityById.get(relationship.toEntityId)?.name ?? 'Unknown',
        relationship.transferMode
          ? labelise(relationship.transferMode)
          : 'Not recorded',
        relationship.rationale ?? 'Not recorded',
      ]),
    },
  ];
}

function reportSections(
  dataset: FabricDataset,
  output: Output,
  sourceIds: Set<EntityId>,
): OutputReportSection[] {
  const template = getOutputTemplate(output.outputType);
  const context = createContext(dataset, output);
  const assessments = recordsFor(dataset.maturityAssessments, sourceIds);
  const findings = recordsFor(dataset.findings, sourceIds);
  const landscapeEntities = recordsFor(dataset.landscapeEntities, sourceIds);
  const landscapeRelationships = recordsFor(
    dataset.landscapeRelationships,
    sourceIds,
  );
  const frictionItems = recordsFor(dataset.frictionItems, sourceIds);
  const opportunities = recordsFor(dataset.opportunities, sourceIds);
  const actions = recordsFor(dataset.actionItems, sourceIds);
  const initiatives = recordsFor(dataset.initiatives, sourceIds);
  const roadmaps = recordsFor(dataset.roadmaps, sourceIds);
  const observations = recordsFor(dataset.observations, sourceIds);
  const evidence = recordsFor(dataset.evidence, sourceIds);
  const benefits = recordsFor(dataset.benefitMeasurements, sourceIds);
  const contextSection = () =>
    makeSection(
      template,
      'engagement-context',
      [],
      engagementContextBlocks(context),
    );

  switch (output.outputType) {
    case 'executive-summary': {
      const currentState = assessments
        .map((assessment) => assessment.currentState)
        .filter((value): value is string => Boolean(value));
      const strengths = assessments
        .filter((assessment) => (assessment.score ?? 0) >= 4)
        .map((assessment) => {
          const dimension = dataset.diagnosticDimensions.find(
            (item) => item.id === assessment.dimensionId,
          );
          return `${dimension?.name ?? 'Maturity dimension'} is assessed at ${assessment.level ?? 'a mature level'}.`;
        });
      const directions = uniqueValues([
        ...findings
          .map((finding) => finding.recommendedDirection)
          .filter(Boolean),
        ...opportunities
          .map((opportunity) => opportunity.recommendedImprovement)
          .filter((value): value is string => Boolean(value)),
      ]);

      return [
        contextSection(),
        makeSection(
          template,
          'current-state',
          assessments.map((assessment) => assessment.id),
          currentState.length > 0
            ? [{ type: 'bullet-list', items: currentState }]
            : [
                noApprovedData(
                  'No approved current-state assessment narrative has been selected.',
                ),
              ],
        ),
        makeSection(
          template,
          'key-findings',
          findings.map((finding) => finding.id),
          findings.length > 0
            ? [
                {
                  type: 'bullet-list',
                  items: findings.map(
                    (finding) =>
                      finding.clientSummary ?? finding.recommendedDirection,
                  ),
                },
              ]
            : [
                noApprovedData(
                  'No approved findings have been selected for this summary.',
                ),
              ],
        ),
        makeSection(
          template,
          'maturity-profile',
          assessments.map((assessment) => assessment.id),
          maturityProfileBlocks(dataset, assessments),
        ),
        makeSection(
          template,
          'strengths',
          assessments.map((assessment) => assessment.id),
          strengths.length > 0
            ? [{ type: 'bullet-list', items: strengths }]
            : [
                noApprovedData(
                  'No approved maturity strengths have been recorded yet.',
                ),
              ],
        ),
        makeSection(
          template,
          'priority-opportunities',
          opportunities.map((opportunity) => opportunity.id),
          opportunityRegisterBlocks(dataset, opportunities),
        ),
        makeSection(
          template,
          'recommended-direction',
          uniqueValues([
            ...findings.map((finding) => finding.id),
            ...opportunities.map((opportunity) => opportunity.id),
          ]),
          directions.length > 0
            ? [{ type: 'bullet-list', items: directions }]
            : [
                noApprovedData(
                  'No approved recommended direction has been selected.',
                ),
              ],
        ),
        makeSection(
          template,
          'roadmap-summary',
          uniqueValues([
            ...roadmaps.map((roadmap) => roadmap.id),
            ...initiatives.map((initiative) => initiative.id),
          ]),
          roadmaps.length > 0 || initiatives.length > 0
            ? [
                {
                  type: 'bullet-list',
                  items: [
                    ...roadmaps.map((roadmap) => roadmap.description),
                    ...initiatives.map(
                      (initiative) =>
                        `${initiative.phase}: ${initiative.clientSummary ?? initiative.title}`,
                    ),
                  ],
                },
              ]
            : [
                noApprovedData(
                  'No approved roadmap or initiative has been selected.',
                ),
              ],
        ),
        makeSection(
          template,
          'next-steps',
          opportunities.map((opportunity) => opportunity.id),
          opportunities.length > 0
            ? [
                {
                  type: 'bullet-list',
                  items: opportunities
                    .map((opportunity) => opportunity.suggestedNextStep)
                    .filter((value): value is string => Boolean(value)),
                },
              ]
            : [
                noApprovedData(
                  'No approved next step has been selected for this summary.',
                ),
              ],
        ),
      ];
    }
    case 'maturity-scorecard':
      return [
        contextSection(),
        makeSection(
          template,
          'maturity-profile',
          assessments.map((assessment) => assessment.id),
          maturityProfileBlocks(dataset, assessments),
        ),
        makeSection(
          template,
          'current-and-desired-state',
          assessments.map((assessment) => assessment.id),
          maturityDetailBlocks(dataset, assessments),
        ),
        makeSection(
          template,
          'linked-opportunities',
          opportunities.map((opportunity) => opportunity.id),
          opportunityRegisterBlocks(dataset, opportunities),
        ),
        makeSection(
          template,
          'scorecard-direction',
          opportunities.map((opportunity) => opportunity.id),
          opportunities.length > 0
            ? [
                {
                  type: 'bullet-list',
                  items: opportunities
                    .map((opportunity) => opportunity.recommendedImprovement)
                    .filter((value): value is string => Boolean(value)),
                },
              ]
            : [
                noApprovedData(
                  'No approved recommendation has been selected for this scorecard.',
                ),
              ],
        ),
      ];
    case 'landscape-map': {
      const frictionAndOpportunityItems = [
        ...frictionItems
          .map((friction) => friction.clientSummary)
          .filter((value): value is string => Boolean(value)),
        ...opportunities.map(
          (opportunity) =>
            `${opportunity.title}: ${opportunity.clientSummary ?? opportunity.recommendedImprovement ?? opportunity.description}`,
        ),
      ];
      return [
        contextSection(),
        makeSection(
          template,
          'landscape-entities',
          landscapeEntities.map((entity) => entity.id),
          landscapeEntityBlocks(dataset, landscapeEntities),
        ),
        makeSection(
          template,
          'landscape-relationships',
          landscapeRelationships.map((relationship) => relationship.id),
          landscapeRelationshipBlocks(dataset, landscapeRelationships),
        ),
        makeSection(
          template,
          'friction-and-opportunities',
          uniqueValues([
            ...frictionItems.map((friction) => friction.id),
            ...opportunities.map((opportunity) => opportunity.id),
          ]),
          frictionAndOpportunityItems.length > 0
            ? [{ type: 'bullet-list', items: frictionAndOpportunityItems }]
            : [
                noApprovedData(
                  'No approved friction summary or opportunity overlay has been selected.',
                ),
              ],
        ),
        makeSection(
          template,
          'legend-and-version',
          uniqueValues([
            ...landscapeEntities.map((entity) => entity.id),
            ...landscapeRelationships.map((relationship) => relationship.id),
          ]),
          [
            {
              type: 'paragraph',
              content:
                'Landscape types identify business areas, processes, systems, data objects, and roles. Relationship arrows show the approved current-state connection captured in this output version.',
            },
          ],
        ),
      ];
    }
    case 'opportunity-action-register':
      return [
        contextSection(),
        makeSection(
          template,
          'opportunity-register',
          opportunities.map((opportunity) => opportunity.id),
          opportunityRegisterBlocks(dataset, opportunities),
        ),
        makeSection(
          template,
          'action-summary',
          uniqueValues([
            ...actions.map((action) => action.id),
            ...opportunities.map((opportunity) => opportunity.id),
          ]),
          actions.length > 0 || opportunities.length > 0
            ? [
                {
                  type: 'bullet-list',
                  items: [
                    ...actions
                      .map((action) => action.clientSummary)
                      .filter((value): value is string => Boolean(value)),
                    ...opportunities
                      .map((opportunity) => opportunity.suggestedNextStep)
                      .filter((value): value is string => Boolean(value)),
                  ],
                },
              ]
            : [
                noApprovedData(
                  'No approved actions or suggested next steps have been selected.',
                ),
              ],
        ),
      ];
    case 'transformation-roadmap': {
      const phaseRows = ['Simplify', 'Connect', 'Optimise', 'Scale'].map(
        (phase) => {
          const phaseInitiatives = initiatives.filter(
            (initiative) => initiative.phase === phase,
          );
          return [
            phase,
            roadmapPhaseWindows[phase] ?? 'Not recorded',
            phaseInitiatives.length > 0
              ? phaseInitiatives
                  .map(
                    (initiative) =>
                      initiative.clientSummary ?? initiative.title,
                  )
                  .join('; ')
              : 'No approved initiative selected',
          ];
        },
      );
      return [
        contextSection(),
        makeSection(
          template,
          'roadmap-summary',
          roadmaps.map((roadmap) => roadmap.id),
          roadmaps.length > 0
            ? [
                {
                  type: 'bullet-list',
                  items: roadmaps.map((roadmap) => roadmap.description),
                },
              ]
            : [
                noApprovedData(
                  'No approved roadmap has been selected for this output.',
                ),
              ],
        ),
        makeSection(
          template,
          'roadmap-phases',
          initiatives.map((initiative) => initiative.id),
          [
            {
              type: 'table',
              columns: ['Phase', 'Timing', 'Approved initiatives'],
              rows: phaseRows,
            },
          ],
        ),
        makeSection(
          template,
          'initiative-plan',
          initiatives.map((initiative) => initiative.id),
          initiativeBlocks(dataset, initiatives),
        ),
        makeSection(
          template,
          'roadmap-next-steps',
          initiatives.map((initiative) => initiative.id),
          initiatives.length > 0
            ? [
                {
                  type: 'bullet-list',
                  items: initiatives
                    .map((initiative) => initiative.prerequisites)
                    .filter((value): value is string => Boolean(value)),
                },
              ]
            : [
                noApprovedData(
                  'No approved initiative prerequisites have been selected.',
                ),
              ],
        ),
      ];
    }
    case 'site-walk-summary':
      return [
        contextSection(),
        makeSection(
          template,
          'approved-observations',
          observations.map((observation) => observation.id),
          observations.length > 0
            ? [
                {
                  type: 'bullet-list',
                  items: observations.map(
                    (observation) => observation.title ?? observation.summary,
                  ),
                },
              ]
            : [
                noApprovedData(
                  'No approved client-facing observations have been selected.',
                ),
              ],
        ),
        makeSection(
          template,
          'approved-evidence',
          evidence.map((evidenceItem) => evidenceItem.id),
          evidence.length > 0
            ? [
                {
                  type: 'bullet-list',
                  items: evidence.map((evidenceItem) => evidenceItem.summary),
                },
              ]
            : [
                noApprovedData(
                  'No approved client-facing evidence has been selected.',
                ),
              ],
        ),
        makeSection(
          template,
          'next-steps',
          [],
          [
            noApprovedData(
              'Add an approved next-step narrative before sharing this site walk summary.',
            ),
          ],
        ),
      ];
    case 'progress-report':
      return [
        contextSection(),
        makeSection(
          template,
          'progress-summary',
          uniqueValues([
            ...initiatives.map((initiative) => initiative.id),
            ...actions.map((action) => action.id),
          ]),
          initiatives.length > 0 || actions.length > 0
            ? [
                {
                  type: 'bullet-list',
                  items: [
                    ...initiatives.map(
                      (initiative) =>
                        `${initiative.clientSummary ?? initiative.title}: ${labelise(initiative.status)}`,
                    ),
                    ...actions
                      .map((action) => action.clientSummary)
                      .filter((value): value is string => Boolean(value)),
                  ],
                },
              ]
            : [
                noApprovedData(
                  'No approved delivery progress source has been selected.',
                ),
              ],
        ),
        makeSection(
          template,
          'next-steps',
          [],
          [
            noApprovedData(
              'Add an approved next-step narrative before sharing this progress report.',
            ),
          ],
        ),
      ];
    case 'benefits-report':
      return [
        contextSection(),
        makeSection(
          template,
          'validated-benefits',
          benefits.map((benefit) => benefit.id),
          benefits.length > 0
            ? [
                {
                  type: 'table',
                  columns: [
                    'Measure',
                    'Baseline',
                    'Actual value',
                    'Unit',
                    'Measurement date',
                  ],
                  rows: benefits.map((benefit) => [
                    benefit.measure,
                    benefit.baseline,
                    benefit.actualValue ?? 'Not recorded',
                    benefit.unit,
                    benefit.measurementDate ?? 'Not recorded',
                  ]),
                },
              ]
            : [
                noApprovedData(
                  'No validated benefit measurement has been selected.',
                ),
              ],
        ),
        makeSection(
          template,
          'next-steps',
          initiatives.map((initiative) => initiative.id),
          initiatives.length > 0
            ? [
                {
                  type: 'bullet-list',
                  items: initiatives.map(
                    (initiative) => initiative.expectedBenefit,
                  ),
                },
              ]
            : [
                noApprovedData(
                  'No approved initiative has been selected for benefit follow-up.',
                ),
              ],
        ),
      ];
    case 'supporting-analysis':
      return [
        contextSection(),
        makeSection(
          template,
          'analysis',
          uniqueValues([
            ...assessments.map((assessment) => assessment.id),
            ...findings.map((finding) => finding.id),
            ...opportunities.map((opportunity) => opportunity.id),
            ...initiatives.map((initiative) => initiative.id),
            ...roadmaps.map((roadmap) => roadmap.id),
            ...landscapeEntities.map((entity) => entity.id),
            ...landscapeRelationships.map((relationship) => relationship.id),
          ]),
          [
            {
              type: 'bullet-list',
              items: [
                ...findings.map(
                  (finding) =>
                    finding.clientSummary ?? finding.recommendedDirection,
                ),
                ...opportunities.map(
                  (opportunity) =>
                    opportunity.clientSummary ?? opportunity.title,
                ),
                ...roadmaps.map((roadmap) => roadmap.description),
              ],
            },
          ],
        ),
      ];
  }
}

function applySectionOverrides(
  output: Output,
  sections: OutputReportSection[],
  includedSourceIds: Set<EntityId>,
) {
  const overrides = new Map(
    output.sectionOverrides.map((override) => [override.sectionId, override]),
  );

  return sections.map((section) => {
    const override = overrides.get(section.id);
    const narrative = override?.narrative.trim();
    if (!section.editable || !narrative || !override) {
      return section;
    }

    return {
      ...section,
      blocks: [
        ...section.blocks,
        {
          type: 'paragraph' as const,
          content: narrative,
        },
      ],
      sourceReferences: uniqueValues([
        ...section.sourceReferences,
        ...override.sourceReferences.filter((sourceId) =>
          includedSourceIds.has(sourceId),
        ),
      ]),
    };
  });
}

type OutputReportSnapshotContent = Omit<
  OutputReportSnapshot,
  'contentFingerprint'
>;
type OutputReportSnapshotFingerprintInput = OutputReportSnapshotContent &
  Partial<Pick<OutputReportSnapshot, 'contentFingerprint'>>;

export function getOutputReportContentFingerprint(
  snapshot: OutputReportSnapshotFingerprintInput,
) {
  const content = { ...snapshot };
  delete content.contentFingerprint;
  return createFingerprint(JSON.stringify(content));
}

export function createOutputReportSnapshot(
  dataset: FabricDataset,
  output: Output,
  generatedAt: string,
): OutputReportSnapshot {
  const template = getOutputTemplate(output.outputType);
  const sources = selectedSources(dataset, output);
  const includedSourceIds = new Set(
    sources.included.map((source) => source.id),
  );
  const sections = applySectionOverrides(
    output,
    reportSections(dataset, output, includedSourceIds),
    includedSourceIds,
  );

  const snapshot: OutputReportSnapshotContent = {
    schemaVersion: 'trion-output-report/v1',
    templateId: template.id,
    templateVersion: template.version,
    generatedAt,
    sourceFingerprint: createSourceFingerprint(sources.all),
    context: createContext(dataset, output),
    sections,
    includedSources: uniqueSources(
      sources.included.map(({ id, type, title }) => ({ id, type, title })),
    ),
    excludedSources: sources.excluded,
  };

  return {
    ...snapshot,
    contentFingerprint: getOutputReportContentFingerprint(snapshot),
  };
}

export function prepareOutputExportSnapshot(
  dataset: FabricDataset,
  output: Output,
  generatedAt: string,
) {
  const snapshot =
    output.reportSnapshot ??
    createOutputReportSnapshot(dataset, output, generatedAt);
  const outputWithSnapshot = output.reportSnapshot
    ? output
    : {
        ...output,
        reportSnapshot: snapshot,
        updatedAt: generatedAt,
      };

  return { output: outputWithSnapshot, snapshot };
}

export function resolveOutputReport(
  dataset: FabricDataset,
  output: Output,
): OutputReport {
  const snapshot =
    output.reportSnapshot ??
    createOutputReportSnapshot(dataset, output, output.updatedAt);

  return {
    schemaVersion: 'trion-output-report/v1',
    output: {
      id: output.id,
      title: output.title,
      type: output.outputType,
      version: output.version,
      status: output.status,
      visibility: output.visibility,
      createdAt: output.createdAt,
      approvedAt: output.approvedAt,
      publishedAt: output.publishedAt,
    },
    snapshot,
    clientReady: isOutputReportClientReady(dataset, output),
  };
}

export function hasOutputReportSourceChanges(
  dataset: FabricDataset,
  output: Output,
) {
  if (!output.reportSnapshot) {
    return true;
  }

  const sources = selectedSources(dataset, output);
  return (
    output.reportSnapshot.sourceFingerprint !==
    createSourceFingerprint(sources.all)
  );
}

export function isOutputReportClientReady(
  dataset: FabricDataset,
  output: Output,
) {
  if (
    (output.status !== 'approved' && output.status !== 'published') ||
    output.visibility !== 'approved-client-facing'
  ) {
    return false;
  }

  const sources = selectedSources(dataset, output);
  const snapshot = output.reportSnapshot;
  if (!snapshot) {
    return false;
  }
  const includedSourceIds = new Set(
    sources.included.map((source) => source.id),
  );

  return (
    snapshot.contentFingerprint ===
      getOutputReportContentFingerprint(snapshot) &&
    sources.excluded.length === 0 &&
    sources.included.length > 0 &&
    output.sectionOverrides.every(
      (override) =>
        override.sourceReferences.length > 0 &&
        override.sourceReferences.every((sourceId) =>
          includedSourceIds.has(sourceId),
        ),
    )
  );
}

export function nextOutputVersion(existingVersions: string[]) {
  const parsedVersions = existingVersions
    .map((version) => {
      const match = /^(\d+)\.(\d+)$/.exec(version);
      return match
        ? { major: Number(match[1]), minor: Number(match[2]) }
        : undefined;
    })
    .filter(
      (version): version is { major: number; minor: number } =>
        version !== undefined,
    )
    .sort(
      (left, right) => left.major - right.major || left.minor - right.minor,
    );
  const latest = parsedVersions[parsedVersions.length - 1];

  if (!latest) {
    return '0.1';
  }

  return `${latest.major}.${latest.minor + 1}`;
}

function markdownCell(value: string) {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function markdownBlocks(blocks: OutputReportBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === 'paragraph') {
        return block.content;
      }
      if (block.type === 'bullet-list') {
        return block.items.map((item) => `- ${item}`).join('\n');
      }
      if (block.type === 'callout') {
        return `> ${block.tone === 'warning' ? 'Note' : 'Information'}: ${block.content}`;
      }
      const header = `| ${block.columns.map(markdownCell).join(' | ')} |`;
      const divider = `| ${block.columns.map(() => '---').join(' | ')} |`;
      const rows = block.rows
        .map((row) => `| ${row.map(markdownCell).join(' | ')} |`)
        .join('\n');
      return [header, divider, rows].join('\n');
    })
    .filter(Boolean)
    .join('\n\n');
}

export function serializeOutputReportAsMarkdown(report: OutputReport) {
  const header = [
    `# ${report.output.title}`,
    '',
    `**Report type:** ${getOutputTemplate(report.output.type).label}`,
    `**Version:** ${report.output.version}`,
    `**Status:** ${labelise(report.output.status)}`,
    `**Generated:** ${report.snapshot.generatedAt}`,
    `**Content fingerprint:** ${report.snapshot.contentFingerprint}`,
    '',
    'This controlled report is derived from approved, engagement-scoped source data.',
  ];
  const sections = report.snapshot.sections.map((section) =>
    [
      `## ${section.title}`,
      '',
      markdownBlocks(section.blocks),
      ...(section.sourceReferences.length > 0
        ? ['', `**Sources:** ${section.sourceReferences.join(', ')}`]
        : []),
    ].join('\n'),
  );
  const provenance = [
    '## Provenance',
    '',
    `Frozen report content: ${report.snapshot.contentFingerprint}`,
    `Selected source state: ${report.snapshot.sourceFingerprint}`,
    `Included source records: ${report.snapshot.includedSources.length}`,
    ...report.snapshot.includedSources.map(
      (source) => `- ${source.type}: ${source.title} (${source.id})`,
    ),
  ];

  return [...header, ...sections, ...provenance].join('\n\n').trimEnd() + '\n';
}

export function serializeOutputReportAsAiPackage(report: OutputReport) {
  return JSON.stringify(
    {
      schemaVersion: 'trion-output-ai-package/v1',
      intendedUse:
        'Use this controlled report as source context for manual client-output preparation. Do not treat it as approval to introduce new facts, estimates, or conclusions.',
      report,
      dataGaps: report.snapshot.excludedSources.map((source) => ({
        sourceId: source.sourceId,
        reason: source.reason,
      })),
    },
    null,
    2,
  );
}

export function getOutputReportFileName(
  output: Pick<Output, 'title' | 'version'>,
  extension: 'md' | 'json',
) {
  const stem =
    output.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'trion-output-report';
  return `${stem}-v${output.version.replace(/\./g, '-')}.${extension}`;
}

export function compareOutputReportSnapshots(
  previous: OutputReportSnapshot,
  current: OutputReportSnapshot,
  previousVersion: string,
  currentVersion: string,
): OutputReportComparison {
  const previousById = new Map(
    previous.sections.map((section) => [section.id, section]),
  );
  const currentById = new Map(
    current.sections.map((section) => [section.id, section]),
  );
  const sectionIds = new Set([...previousById.keys(), ...currentById.keys()]);
  const changedSections: OutputReportComparison['changedSections'] = [];

  sectionIds.forEach((sectionId) => {
    const prior = previousById.get(sectionId);
    const next = currentById.get(sectionId);
    if (!prior && next) {
      changedSections.push({
        sectionId,
        title: next.title,
        change: 'added',
      });
      return;
    }
    if (prior && !next) {
      changedSections.push({
        sectionId,
        title: prior.title,
        change: 'removed',
      });
      return;
    }
    if (
      prior &&
      next &&
      JSON.stringify(prior.blocks) !== JSON.stringify(next.blocks)
    ) {
      changedSections.push({
        sectionId,
        title: next.title,
        change: 'changed',
      });
    }
  });

  return {
    previousVersion,
    currentVersion,
    changedSections,
    sourceReferencesChanged:
      JSON.stringify(
        previous.includedSources.map((source) => source.id).sort(),
      ) !==
      JSON.stringify(current.includedSources.map((source) => source.id).sort()),
  };
}
