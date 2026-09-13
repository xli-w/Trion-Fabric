import { z } from 'zod';

import {
  actionStatuses,
  aiStatuses,
  approvalStates,
  clientStatuses,
  confidenceLevels,
  engagementTypes,
  evidenceReviewStatuses,
  evidenceTypes,
  diagnosticStatuses,
  benefitMeasures,
  benefitValidationStatuses,
  benefitStatuses,
  deliveryStatuses,
  investmentBands,
  landscapeEntityTypes,
  landscapeRelationshipTypes,
  maturityLevels,
  opportunityPriorityCategories,
  outputStatuses,
  outputTypes,
  roadmapPhases,
  milestoneStatuses,
  reviewStatuses,
  effortLevels,
  engagementStatuses,
  evidenceKinds,
  informationOrigins,
  observationAssuranceLevels,
  observationSources,
  observationStatuses,
  observationTypes,
  opportunityPriorities,
  opportunityStatuses,
  opportunityTypes,
  relatedEntityTypes,
  siteWalkStatuses,
  siteWalkTypes,
  siteStatuses,
  frictionCategories,
  transformationStages,
  userRoles,
  visibilityScopes,
} from '@domain';

const isoDateTimeSchema = z.string().datetime({ offset: true });

const baseEntitySchema = z.object({
  id: z.string().min(1),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export const userSchema = baseEntitySchema.extend({
  displayName: z.string().min(1),
  role: z.enum(userRoles),
  email: z.string().email(),
});

export const clientSchema = baseEntitySchema.extend({
  name: z.string().min(1),
  slug: z.string().min(1),
  industry: z.string().min(1),
  companySize: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(clientStatuses),
  primaryContact: z.string().min(1).optional(),
  contactDetails: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});

export const siteSchema = baseEntitySchema.extend({
  clientId: z.string().min(1),
  name: z.string().min(1),
  location: z.string().min(1),
  description: z.string().min(1),
  operationalProfile: z.string().min(1),
  siteType: z.string().min(1).optional(),
  workforce: z.string().min(1).optional(),
  shifts: z.string().min(1).optional(),
  status: z.enum(siteStatuses).optional(),
  internalNotes: z.string().min(1).optional(),
  areaIds: z.array(z.string().min(1)),
  systemIds: z.array(z.string().min(1)),
});

export const areaSchema = baseEntitySchema.extend({
  siteId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
});

export const processSchema = baseEntitySchema.extend({
  siteId: z.string().min(1),
  areaId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  relatedSystemIds: z.array(z.string().min(1)),
});

export const operationalSystemSchema = baseEntitySchema.extend({
  siteId: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  ownerTeam: z.string().min(1),
});

export const engagementSchema = baseEntitySchema.extend({
  clientId: z.string().min(1),
  siteIds: z.array(z.string().min(1)).min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(engagementTypes),
  objectives: z.string().min(1).optional(),
  scope: z.string().min(1).optional(),
  commercialContext: z.string().min(1).optional(),
  internalNotes: z.string().min(1).optional(),
  status: z.enum(engagementStatuses),
  stage: z.enum(transformationStages),
  startDate: isoDateTimeSchema,
  targetDate: isoDateTimeSchema.optional(),
  leadUserId: z.string().min(1),
  teamUserIds: z.array(z.string().min(1)).min(1),
});

export const siteWalkSchema = baseEntitySchema.extend({
  engagementId: z.string().min(1),
  siteId: z.string().min(1),
  areaId: z.string().min(1).optional(),
  processId: z.string().min(1).optional(),
  title: z.string().min(1),
  scheduledAt: isoDateTimeSchema,
  consultantUserId: z.string().min(1),
  walkType: z.union([z.enum(siteWalkTypes), z.string().min(1)]),
  plannedScope: z.array(z.string().min(1)).min(1),
  completedScope: z.array(z.string().min(1)),
  status: z.enum(siteWalkStatuses),
  followUpActionIds: z.array(z.string().min(1)),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  leadConsultantId: z.string().min(1).optional(),
  participantUserIds: z.array(z.string().min(1)).optional(),
  participants: z.string().min(1).optional(),
  objectives: z.string().min(1).optional(),
  businessContext: z.string().min(1).optional(),
  focusAreas: z.array(z.string().min(1)).optional(),
  areasCovered: z.array(z.string().min(1)).optional(),
  processesCovered: z.array(z.string().min(1)).optional(),
  overallProcessSummary: z.string().min(1).optional(),
  candidateBottleneck: z.string().min(1).optional(),
  agreedNextStep: z.string().min(1).optional(),
  internalNotes: z.string().min(1).optional(),
  briefingChecklist: z.record(z.boolean()).optional(),
  postTourNotes: z.string().min(1).optional(),
  validationNotes: z.string().min(1).optional(),
  confirmedBottleneck: z.string().min(1).optional(),
  correctedMisunderstandings: z.string().min(1).optional(),
  immediateOpportunities: z.string().min(1).optional(),
  recommendDiagnostic: z.boolean().optional(),
  followUpOwnerId: z.string().min(1).optional(),
  followUpDate: z.string().optional(),
});

export const observationSchema = baseEntitySchema.extend({
  siteWalkId: z.string().min(1),
  processId: z.string().min(1).optional(),
  summary: z.string().min(1),
  detail: z.string().min(1),
  observedAt: isoDateTimeSchema,
  origin: z.enum(informationOrigins),
  assurance: z.enum(observationAssuranceLevels),
  visibility: z.enum(visibilityScopes),
  aiStatus: z.enum(aiStatuses),
  evidenceIds: z.array(z.string().min(1)),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  observationType: z.enum(observationTypes).optional(),
  areaId: z.string().min(1).optional(),
  systemId: z.string().min(1).optional(),
  stationOrLine: z.string().min(1).optional(),
  source: z.enum(observationSources).optional(),
  confidence: z.enum(confidenceLevels).optional(),
  status: z.enum(observationStatuses).optional(),
  recordedByUserId: z.string().min(1).optional(),
  internalNotes: z.string().min(1).optional(),
});

export const evidenceSchema = baseEntitySchema.extend({
  relatedEntityId: z.string().min(1),
  relatedEntityType: z.enum(relatedEntityTypes),
  kind: z.enum(evidenceKinds),
  title: z.string().min(1),
  summary: z.string().min(1),
  capturedAt: isoDateTimeSchema,
  origin: z.enum(informationOrigins),
  visibility: z.enum(visibilityScopes),
  approvalState: z.enum(approvalStates),
  observationId: z.string().min(1).optional(),
  siteWalkId: z.string().min(1).optional(),
  evidenceType: z.enum(evidenceTypes).optional(),
  description: z.string().min(1).optional(),
  fileReference: z.string().min(1).optional(),
  source: z.enum(observationSources).optional(),
  capturedByUserId: z.string().min(1).optional(),
  reviewStatus: z.enum(evidenceReviewStatuses).optional(),
});

export const frictionItemSchema = baseEntitySchema.extend({
  siteWalkId: z.string().min(1),
  stationOrLine: z.string().min(1),
  frictionPoint: z.string().min(1),
  category: z.enum(frictionCategories),
  estimatedTimeLost: z.string().min(1).optional(),
  frequency: z.string().min(1).optional(),
  peopleOrShiftsAffected: z.string().min(1).optional(),
  estimatedAnnualHours: z.number().nonnegative().optional(),
  estimatedAnnualCostImpact: z.string().min(1).optional(),
  confidence: z.enum(confidenceLevels),
  evidenceReference: z.string().min(1).optional(),
  assumptions: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});

export const diagnosticDimensionSchema = baseEntitySchema.extend({
  key: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().min(1),
  criteria: z.array(z.string().min(1)).min(1),
  anchors: z.record(z.string()),
});

export const diagnosticSchema = baseEntitySchema.extend({
  engagementId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(diagnosticStatuses),
  startDate: isoDateTimeSchema,
  completionDate: isoDateTimeSchema.optional(),
  assessorUserId: z.string().min(1),
  currentStage: z.enum(transformationStages),
  scope: z.string().min(1),
  methodologyVersion: z.string().min(1),
  overallScore: z.number().min(1).max(5).optional(),
  overallLevel: z.enum(maturityLevels).optional(),
  overallConfidence: z.enum(confidenceLevels).optional(),
  internalNotes: z.string().min(1).optional(),
});

export const maturityAssessmentSchema = baseEntitySchema
  .extend({
    diagnosticId: z.string().min(1),
    dimensionId: z.string().min(1),
    score: z.number().min(1).max(5).optional(),
    level: z.enum(maturityLevels).optional(),
    rationale: z.string().min(1).optional(),
    currentState: z.string().min(1).optional(),
    desiredState: z.string().min(1).optional(),
    gap: z.string().min(1).optional(),
    relatedObservationIds: z.array(z.string().min(1)),
    evidenceReferences: z.array(z.string().min(1)),
    relatedOpportunityIds: z.array(z.string().min(1)),
    confidence: z.enum(confidenceLevels),
    reviewStatus: z.enum(reviewStatuses),
    assessedByUserId: z.string().min(1).optional(),
    assessedAt: isoDateTimeSchema.optional(),
  })
  .superRefine((assessment, context) => {
    if (assessment.score !== undefined && !assessment.rationale) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rationale'],
        message: 'A scored dimension requires rationale.',
      });
    }
  });

export const findingSchema = baseEntitySchema.extend({
  diagnosticId: z.string().min(1),
  title: z.string().min(1),
  currentSituation: z.string().min(1),
  whyItMatters: z.string().min(1),
  recommendedDirection: z.string().min(1),
  category: z.string().min(1),
  significance: z.enum(opportunityPriorities),
  relatedObservationIds: z.array(z.string().min(1)),
  relatedEvidenceIds: z.array(z.string().min(1)),
  relatedOpportunityIds: z.array(z.string().min(1)),
  confidence: z.enum(confidenceLevels),
  reviewStatus: z.enum(reviewStatuses),
  internalNotes: z.string().min(1).optional(),
  clientSummary: z.string().min(1).optional(),
});

export const landscapeEntitySchema = baseEntitySchema.extend({
  engagementId: z.string().min(1),
  type: z.enum(landscapeEntityTypes),
  name: z.string().min(1),
  description: z.string().min(1),
  sourceEntityId: z.string().min(1).optional(),
  ownerRole: z.string().min(1).optional(),
  reviewStatus: z.enum(reviewStatuses),
});

export const landscapeRelationshipSchema = baseEntitySchema.extend({
  engagementId: z.string().min(1),
  fromEntityId: z.string().min(1),
  toEntityId: z.string().min(1),
  type: z.enum(landscapeRelationshipTypes),
  rationale: z.string().min(1).optional(),
  evidenceIds: z.array(z.string().min(1)),
  reviewStatus: z.enum(reviewStatuses),
});

export const opportunitySchema = baseEntitySchema
  .extend({
    engagementId: z.string().min(1),
    processId: z.string().min(1).optional(),
    areaId: z.string().min(1).optional(),
    title: z.string().min(1),
    description: z.string().min(1),
    problemStatement: z.string().min(1),
    rootCause: z.string().min(1),
    type: z.enum(opportunityTypes),
    expectedImpact: z.string().min(1),
    estimatedValueRange: z.string().min(1).optional(),
    estimatedEffort: z.enum(effortLevels),
    confidence: z.enum(confidenceLevels),
    priority: z.enum(opportunityPriorities),
    status: z.enum(opportunityStatuses),
    ownerUserId: z.string().min(1).optional(),
    evidenceIds: z.array(z.string().min(1)),
    internalNotes: z.string().min(1).optional(),
    clientSummary: z.string().min(1).optional(),
    approvalState: z.enum(approvalStates),
    diagnosticId: z.string().min(1).optional(),
    systemId: z.string().min(1).optional(),
    currentSituation: z.string().min(1).optional(),
    identifiedIssue: z.string().min(1).optional(),
    whyItMatters: z.string().min(1).optional(),
    recommendedImprovement: z.string().min(1).optional(),
    potentialBenefits: z.string().min(1).optional(),
    indicativeValue: z.string().min(1).optional(),
    valueAssumptions: z.string().min(1).optional(),
    businessImpact: z.enum(opportunityPriorities).optional(),
    implementationEffort: z.enum(effortLevels).optional(),
    investment: z.enum(investmentBands).optional(),
    strategicValue: z.enum(opportunityPriorities).optional(),
    priorityCategory: z.enum(opportunityPriorityCategories).optional(),
    recommendedTiming: z.string().min(1).optional(),
    dependencies: z.string().min(1).optional(),
    suggestedNextStep: z.string().min(1).optional(),
    relatedObservationIds: z.array(z.string().min(1)).optional(),
    relatedFindingIds: z.array(z.string().min(1)).optional(),
    owner: z.string().min(1).optional(),
    reviewStatus: z.enum(reviewStatuses),
    benefitMeasures: z
      .array(
        z.object({
          id: z.string().min(1),
          createdAt: isoDateTimeSchema,
          updatedAt: isoDateTimeSchema,
          opportunityId: z.string().min(1),
          measure: z.enum(benefitMeasures),
          currentState: z.string().min(1),
          potentialState: z.string().min(1),
          unit: z.string().min(1),
          calculationOrAssumption: z.string().min(1),
          confidence: z.enum(confidenceLevels),
          validationStatus: z.enum(benefitValidationStatuses),
        }),
      )
      .optional(),
  })
  .superRefine((opportunity, context) => {
    const isDeliveryApproved =
      opportunity.status === 'approved' ||
      opportunity.status === 'in-delivery' ||
      opportunity.status === 'closed';

    if (isDeliveryApproved && opportunity.approvalState !== 'approved') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['approvalState'],
        message: 'Approved or delivery opportunities require approved content.',
      });
    }

    if (
      isDeliveryApproved &&
      opportunity.evidenceIds.length === 0 &&
      (opportunity.relatedObservationIds?.length ?? 0) === 0 &&
      (opportunity.relatedFindingIds?.length ?? 0) === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['evidenceIds'],
        message:
          'Approved or delivery opportunities require at least one evidence, observation, or finding link.',
      });
    }

    if (
      opportunity.approvalState === 'approved' &&
      opportunity.reviewStatus !== 'approved'
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reviewStatus'],
        message: 'Approved opportunity content requires an approved review.',
      });
    }

    if (
      opportunity.approvalState === 'approved' &&
      !opportunity.clientSummary
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['clientSummary'],
        message: 'Approved opportunity content requires a client-safe summary.',
      });
    }
  });

export const actionItemSchema = baseEntitySchema.extend({
  initiativeId: z.string().min(1).optional(),
  opportunityId: z.string().min(1).optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(actionStatuses),
  ownerUserId: z.string().min(1).optional(),
  dueDate: isoDateTimeSchema.optional(),
  priority: z.enum(opportunityPriorities).optional(),
  dependencies: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
  owner: z.string().min(1).optional(),
});

export const initiativeSchema = baseEntitySchema.extend({
  engagementId: z.string().min(1),
  opportunityId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  objective: z.string().min(1),
  phase: z.enum(roadmapPhases),
  status: z.enum(deliveryStatuses),
  ownerUserId: z.string().min(1),
  startDate: isoDateTimeSchema.optional(),
  targetEndDate: isoDateTimeSchema.optional(),
  priority: z.enum(opportunityPriorities),
  estimatedCost: z.string().min(1).optional(),
  expectedBenefit: z.string().min(1),
  benefitType: z.string().min(1).optional(),
  confidence: z.enum(confidenceLevels),
  scope: z.string().min(1).optional(),
  dependencies: z.string().min(1).optional(),
  prerequisites: z.string().min(1).optional(),
  risks: z.string().min(1).optional(),
  internalNotes: z.string().min(1).optional(),
  clientSummary: z.string().min(1).optional(),
  reviewStatus: z.enum(reviewStatuses),
});

export const roadmapSchema = baseEntitySchema.extend({
  engagementId: z.string().min(1),
  diagnosticId: z.string().min(1).optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(deliveryStatuses),
  phases: z.array(z.enum(roadmapPhases)).min(1),
  initiativeIds: z.array(z.string().min(1)),
  assumptions: z.string().min(1).optional(),
  dependencies: z.string().min(1).optional(),
  sequencingRationale: z.string().min(1),
  internalNotes: z.string().min(1).optional(),
  reviewStatus: z.enum(reviewStatuses),
});

export const milestoneSchema = baseEntitySchema.extend({
  initiativeId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: isoDateTimeSchema,
  status: z.enum(milestoneStatuses),
  owner: z.string().min(1),
});

export const deliveryActionSchema = baseEntitySchema.extend({
  initiativeId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  owner: z.string().min(1),
  status: z.enum(actionStatuses),
  dueDate: isoDateTimeSchema.optional(),
  dependencyIds: z.array(z.string().min(1)),
  notes: z.string().min(1).optional(),
});

export const benefitMeasurementSchema = baseEntitySchema
  .extend({
    initiativeId: z.string().min(1),
    benefitType: z.string().min(1),
    measure: z.string().min(1),
    baseline: z.string().min(1),
    target: z.string().min(1),
    expectedValue: z.string().min(1),
    actualValue: z.string().min(1).optional(),
    unit: z.string().min(1),
    measurementMethod: z.string().min(1),
    measurementOwner: z.string().min(1),
    measurementDate: isoDateTimeSchema.optional(),
    confidence: z.enum(confidenceLevels),
    status: z.enum(benefitStatuses),
    notes: z.string().min(1).optional(),
  })
  .superRefine((measurement, context) => {
    if (measurement.status === 'validated' && !measurement.actualValue) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['actualValue'],
        message: 'A validated benefit requires an actual value.',
      });
    }

    if (measurement.status === 'validated' && !measurement.measurementDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['measurementDate'],
        message: 'A validated benefit requires a measurement date.',
      });
    }
  });

export const outputSchema = baseEntitySchema
  .extend({
    engagementId: z.string().min(1),
    outputType: z.enum(outputTypes),
    title: z.string().min(1),
    status: z.enum(outputStatuses),
    visibility: z.enum(visibilityScopes),
    version: z.string().min(1),
    createdByUserId: z.string().min(1),
    approvedByUserId: z.string().min(1).optional(),
    approvedAt: isoDateTimeSchema.optional(),
    publishedAt: isoDateTimeSchema.optional(),
    sourceReferences: z.array(z.string().min(1)).min(1),
    contentReference: z.string().min(1).optional(),
    internalNotes: z.string().min(1).optional(),
  })
  .superRefine((output, context) => {
    const isApproved =
      output.status === 'approved' || output.status === 'published';

    if (isApproved && !output.approvedByUserId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['approvedByUserId'],
        message: 'Approved outputs require an approving user.',
      });
    }

    if (isApproved && !output.approvedAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['approvedAt'],
        message: 'Approved outputs require an approval timestamp.',
      });
    }

    if (
      (output.status === 'draft' || output.status === 'internal-review') &&
      (output.approvedByUserId || output.approvedAt)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['approvedAt'],
        message:
          'Draft and internal-review outputs cannot carry approval metadata.',
      });
    }

    if (output.visibility === 'client-shareable' && !isApproved) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['visibility'],
        message: 'Only approved outputs can be client-shareable.',
      });
    }

    if (output.status === 'published' && !output.publishedAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['publishedAt'],
        message: 'Published outputs require a publication timestamp.',
      });
    }

    if (
      output.status === 'published' &&
      output.visibility !== 'client-shareable'
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['visibility'],
        message: 'Published outputs must be client-shareable.',
      });
    }

    if (
      (output.status === 'draft' ||
        output.status === 'internal-review' ||
        output.status === 'approved') &&
      output.publishedAt
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['publishedAt'],
        message:
          'Only published or archived outputs can carry a publication timestamp.',
      });
    }
  });

const fabricDatasetShape = z.object({
  users: z.array(userSchema),
  clients: z.array(clientSchema),
  sites: z.array(siteSchema),
  areas: z.array(areaSchema),
  processes: z.array(processSchema),
  systems: z.array(operationalSystemSchema),
  engagements: z.array(engagementSchema),
  siteWalks: z.array(siteWalkSchema),
  observations: z.array(observationSchema),
  evidence: z.array(evidenceSchema),
  frictionItems: z.array(frictionItemSchema).default([]),
  diagnosticDimensions: z.array(diagnosticDimensionSchema).default([]),
  diagnostics: z.array(diagnosticSchema).default([]),
  maturityAssessments: z.array(maturityAssessmentSchema).default([]),
  findings: z.array(findingSchema).default([]),
  landscapeEntities: z.array(landscapeEntitySchema).default([]),
  landscapeRelationships: z.array(landscapeRelationshipSchema).default([]),
  opportunities: z.array(opportunitySchema),
  actionItems: z.array(actionItemSchema),
  initiatives: z.array(initiativeSchema),
  roadmaps: z.array(roadmapSchema).default([]),
  milestones: z.array(milestoneSchema).default([]),
  deliveryActions: z.array(deliveryActionSchema).default([]),
  benefitMeasurements: z.array(benefitMeasurementSchema).default([]),
  outputs: z.array(outputSchema),
});

type IssuePath = Array<string | number>;

function addIssue(context: z.RefinementCtx, path: IssuePath, message: string) {
  context.addIssue({
    code: z.ZodIssueCode.custom,
    path,
    message,
  });
}

function ensureReference(
  context: z.RefinementCtx,
  path: IssuePath,
  id: string,
  targetIds: Set<string>,
  description: string,
) {
  if (!targetIds.has(id)) {
    addIssue(context, path, `References an unknown ${description}.`);
  }
}

function ensureReferenceList(
  context: z.RefinementCtx,
  path: IssuePath,
  ids: string[],
  targetIds: Set<string>,
  description: string,
) {
  ids.forEach((id, index) =>
    ensureReference(context, [...path, index], id, targetIds, description),
  );
}

function ensureDistinctValues(
  context: z.RefinementCtx,
  path: IssuePath,
  values: string[],
  description: string,
) {
  if (new Set(values).size !== values.length) {
    addIssue(context, path, `Must not contain duplicate ${description}.`);
  }
}

function ensureUniqueEntityIds(
  context: z.RefinementCtx,
  collections: Array<[string, ReadonlyArray<{ id: string }>]>,
) {
  const seen = new Map<string, string>();

  collections.forEach(([collectionName, records]) => {
    records.forEach((record, index) => {
      const existingCollection = seen.get(record.id);

      if (existingCollection) {
        addIssue(
          context,
          [collectionName, index, 'id'],
          `Duplicates an ID already used by ${existingCollection}.`,
        );
        return;
      }

      seen.set(record.id, collectionName);
    });
  });
}

export const fabricDatasetSchema = fabricDatasetShape.superRefine(
  (dataset, context) => {
    const users = new Set(dataset.users.map((item) => item.id));
    const clients = new Set(dataset.clients.map((item) => item.id));
    const sites = new Set(dataset.sites.map((item) => item.id));
    const areas = new Set(dataset.areas.map((item) => item.id));
    const processes = new Set(dataset.processes.map((item) => item.id));
    const systems = new Set(dataset.systems.map((item) => item.id));
    const engagements = new Set(dataset.engagements.map((item) => item.id));
    const siteWalks = new Set(dataset.siteWalks.map((item) => item.id));
    const observations = new Set(dataset.observations.map((item) => item.id));
    const evidence = new Set(dataset.evidence.map((item) => item.id));
    const diagnostics = new Set(dataset.diagnostics.map((item) => item.id));
    const dimensions = new Set(
      dataset.diagnosticDimensions.map((item) => item.id),
    );
    const findings = new Set(dataset.findings.map((item) => item.id));
    const landscapeEntities = new Set(
      dataset.landscapeEntities.map((item) => item.id),
    );
    const opportunities = new Set(dataset.opportunities.map((item) => item.id));
    const actionItems = new Set(dataset.actionItems.map((item) => item.id));
    const initiatives = new Set(dataset.initiatives.map((item) => item.id));
    const outputs = new Set(dataset.outputs.map((item) => item.id));

    ensureUniqueEntityIds(context, [
      ['users', dataset.users],
      ['clients', dataset.clients],
      ['sites', dataset.sites],
      ['areas', dataset.areas],
      ['processes', dataset.processes],
      ['systems', dataset.systems],
      ['engagements', dataset.engagements],
      ['siteWalks', dataset.siteWalks],
      ['observations', dataset.observations],
      ['evidence', dataset.evidence],
      ['frictionItems', dataset.frictionItems],
      ['diagnosticDimensions', dataset.diagnosticDimensions],
      ['diagnostics', dataset.diagnostics],
      ['maturityAssessments', dataset.maturityAssessments],
      ['findings', dataset.findings],
      ['landscapeEntities', dataset.landscapeEntities],
      ['landscapeRelationships', dataset.landscapeRelationships],
      ['opportunities', dataset.opportunities],
      ['actionItems', dataset.actionItems],
      ['initiatives', dataset.initiatives],
      ['roadmaps', dataset.roadmaps],
      ['milestones', dataset.milestones],
      ['deliveryActions', dataset.deliveryActions],
      ['benefitMeasurements', dataset.benefitMeasurements],
      ['outputs', dataset.outputs],
    ]);

    const siteById = new Map(dataset.sites.map((item) => [item.id, item]));
    const areaById = new Map(dataset.areas.map((item) => [item.id, item]));
    const processById = new Map(
      dataset.processes.map((item) => [item.id, item]),
    );
    const systemById = new Map(dataset.systems.map((item) => [item.id, item]));
    const engagementById = new Map(
      dataset.engagements.map((item) => [item.id, item]),
    );
    const siteWalkById = new Map(
      dataset.siteWalks.map((item) => [item.id, item]),
    );
    const observationById = new Map(
      dataset.observations.map((item) => [item.id, item]),
    );
    const evidenceById = new Map(
      dataset.evidence.map((item) => [item.id, item]),
    );
    const diagnosticById = new Map(
      dataset.diagnostics.map((item) => [item.id, item]),
    );
    const opportunityById = new Map(
      dataset.opportunities.map((item) => [item.id, item]),
    );
    const initiativeById = new Map(
      dataset.initiatives.map((item) => [item.id, item]),
    );
    const milestoneById = new Map(
      dataset.milestones.map((item) => [item.id, item]),
    );
    const deliveryActionById = new Map(
      dataset.deliveryActions.map((item) => [item.id, item]),
    );
    const outputById = new Map(dataset.outputs.map((item) => [item.id, item]));

    const siteBelongsToEngagement = (siteId: string, engagementId: string) =>
      engagementById.get(engagementId)?.siteIds.includes(siteId) ?? false;

    const relatedEntityEngagementId = (
      relatedEntityType: string,
      relatedEntityId: string,
    ) => {
      if (relatedEntityType === 'engagement') {
        return engagementById.has(relatedEntityId)
          ? relatedEntityId
          : undefined;
      }
      if (relatedEntityType === 'site-walk') {
        return siteWalkById.get(relatedEntityId)?.engagementId;
      }
      if (relatedEntityType === 'observation') {
        const siteWalkId = observationById.get(relatedEntityId)?.siteWalkId;
        return siteWalkId
          ? siteWalkById.get(siteWalkId)?.engagementId
          : undefined;
      }
      if (relatedEntityType === 'opportunity') {
        return opportunityById.get(relatedEntityId)?.engagementId;
      }

      return outputById.get(relatedEntityId)?.engagementId;
    };

    const evidenceEngagementId = (
      evidenceItem: (typeof dataset.evidence)[number],
    ) => {
      if (evidenceItem.siteWalkId) {
        return siteWalkById.get(evidenceItem.siteWalkId)?.engagementId;
      }

      if (evidenceItem.observationId) {
        const siteWalkId = observationById.get(
          evidenceItem.observationId,
        )?.siteWalkId;
        return siteWalkId
          ? siteWalkById.get(siteWalkId)?.engagementId
          : undefined;
      }

      return relatedEntityEngagementId(
        evidenceItem.relatedEntityType,
        evidenceItem.relatedEntityId,
      );
    };

    const entityBelongsToEngagement = (
      entityId: string,
      engagementId: string,
    ) => {
      const site = siteById.get(entityId);
      if (site) {
        return siteBelongsToEngagement(site.id, engagementId);
      }

      const area = areaById.get(entityId);
      if (area) {
        return siteBelongsToEngagement(area.siteId, engagementId);
      }

      const process = processById.get(entityId);
      if (process) {
        return siteBelongsToEngagement(process.siteId, engagementId);
      }

      const system = systemById.get(entityId);
      if (system) {
        return siteBelongsToEngagement(system.siteId, engagementId);
      }

      const siteWalk = siteWalkById.get(entityId);
      if (siteWalk) {
        return siteWalk.engagementId === engagementId;
      }

      const observation = observationById.get(entityId);
      if (observation) {
        return (
          siteWalkById.get(observation.siteWalkId)?.engagementId ===
          engagementId
        );
      }

      const evidenceItem = evidenceById.get(entityId);
      if (evidenceItem) {
        return evidenceEngagementId(evidenceItem) === engagementId;
      }

      const diagnostic = diagnosticById.get(entityId);
      if (diagnostic) {
        return diagnostic.engagementId === engagementId;
      }

      const assessment = dataset.maturityAssessments.find(
        (item) => item.id === entityId,
      );
      if (assessment) {
        return (
          diagnosticById.get(assessment.diagnosticId)?.engagementId ===
          engagementId
        );
      }

      const finding = dataset.findings.find((item) => item.id === entityId);
      if (finding) {
        return (
          diagnosticById.get(finding.diagnosticId)?.engagementId ===
          engagementId
        );
      }

      const landscapeEntity = dataset.landscapeEntities.find(
        (item) => item.id === entityId,
      );
      if (landscapeEntity) {
        return landscapeEntity.engagementId === engagementId;
      }

      const landscapeRelationship = dataset.landscapeRelationships.find(
        (item) => item.id === entityId,
      );
      if (landscapeRelationship) {
        return landscapeRelationship.engagementId === engagementId;
      }

      const opportunity = opportunityById.get(entityId);
      if (opportunity) {
        return opportunity.engagementId === engagementId;
      }

      const action = dataset.actionItems.find((item) => item.id === entityId);
      if (action) {
        return action.opportunityId
          ? opportunityById.get(action.opportunityId)?.engagementId ===
              engagementId
          : action.initiativeId
            ? initiativeById.get(action.initiativeId)?.engagementId ===
              engagementId
            : false;
      }

      const initiative = initiativeById.get(entityId);
      if (initiative) {
        return initiative.engagementId === engagementId;
      }

      const roadmap = dataset.roadmaps.find((item) => item.id === entityId);
      if (roadmap) {
        return roadmap.engagementId === engagementId;
      }

      const milestone = milestoneById.get(entityId);
      if (milestone) {
        return (
          initiativeById.get(milestone.initiativeId)?.engagementId ===
          engagementId
        );
      }

      const deliveryAction = deliveryActionById.get(entityId);
      if (deliveryAction) {
        return (
          initiativeById.get(deliveryAction.initiativeId)?.engagementId ===
          engagementId
        );
      }

      const benefit = dataset.benefitMeasurements.find(
        (item) => item.id === entityId,
      );
      if (benefit) {
        return (
          initiativeById.get(benefit.initiativeId)?.engagementId ===
          engagementId
        );
      }

      const output = outputById.get(entityId);
      return output?.engagementId === engagementId;
    };

    const isApprovedOutputSource = (entityId: string) => {
      const observation = observationById.get(entityId);
      if (observation) {
        return (
          observation.status === 'verified' &&
          observation.visibility === 'client-shareable' &&
          observation.aiStatus !== 'suggested' &&
          observation.aiStatus !== 'rejected'
        );
      }

      const evidenceItem = evidenceById.get(entityId);
      if (evidenceItem) {
        return (
          evidenceItem.approvalState === 'approved' &&
          evidenceItem.reviewStatus === 'verified' &&
          evidenceItem.visibility === 'client-shareable'
        );
      }

      const assessment = dataset.maturityAssessments.find(
        (item) => item.id === entityId,
      );
      if (assessment) {
        return assessment.reviewStatus === 'approved';
      }

      const finding = dataset.findings.find((item) => item.id === entityId);
      if (finding) {
        return (
          finding.reviewStatus === 'approved' && Boolean(finding.clientSummary)
        );
      }

      const landscapeEntity = dataset.landscapeEntities.find(
        (item) => item.id === entityId,
      );
      if (landscapeEntity) {
        return landscapeEntity.reviewStatus === 'approved';
      }

      const landscapeRelationship = dataset.landscapeRelationships.find(
        (item) => item.id === entityId,
      );
      if (landscapeRelationship) {
        return landscapeRelationship.reviewStatus === 'approved';
      }

      const opportunity = opportunityById.get(entityId);
      if (opportunity) {
        return (
          (opportunity.status === 'approved' ||
            opportunity.status === 'in-delivery' ||
            opportunity.status === 'closed') &&
          opportunity.approvalState === 'approved' &&
          opportunity.reviewStatus === 'approved' &&
          (opportunity.evidenceIds.length > 0 ||
            (opportunity.relatedObservationIds?.length ?? 0) > 0 ||
            (opportunity.relatedFindingIds?.length ?? 0) > 0) &&
          Boolean(opportunity.clientSummary)
        );
      }

      const initiative = initiativeById.get(entityId);
      if (initiative) {
        return (
          initiative.reviewStatus === 'approved' &&
          Boolean(initiative.clientSummary)
        );
      }

      const roadmap = dataset.roadmaps.find((item) => item.id === entityId);
      if (roadmap) {
        return roadmap.reviewStatus === 'approved';
      }

      const benefit = dataset.benefitMeasurements.find(
        (item) => item.id === entityId,
      );
      return benefit?.status === 'validated';
    };

    dataset.sites.forEach((site, index) => {
      ensureReference(
        context,
        ['sites', index, 'clientId'],
        site.clientId,
        clients,
        'client',
      );
      ensureDistinctValues(
        context,
        ['sites', index, 'areaIds'],
        site.areaIds,
        'area IDs',
      );
      ensureReferenceList(
        context,
        ['sites', index, 'areaIds'],
        site.areaIds,
        areas,
        'area',
      );
      ensureDistinctValues(
        context,
        ['sites', index, 'systemIds'],
        site.systemIds,
        'system IDs',
      );
      ensureReferenceList(
        context,
        ['sites', index, 'systemIds'],
        site.systemIds,
        systems,
        'system',
      );

      site.areaIds.forEach((areaId, areaIndex) => {
        if (areaById.get(areaId)?.siteId !== site.id) {
          addIssue(
            context,
            ['sites', index, 'areaIds', areaIndex],
            'References an area assigned to a different site.',
          );
        }
      });

      site.systemIds.forEach((systemId, systemIndex) => {
        if (systemById.get(systemId)?.siteId !== site.id) {
          addIssue(
            context,
            ['sites', index, 'systemIds', systemIndex],
            'References a system assigned to a different site.',
          );
        }
      });
    });

    dataset.areas.forEach((area, index) => {
      ensureReference(
        context,
        ['areas', index, 'siteId'],
        area.siteId,
        sites,
        'site',
      );
    });

    dataset.systems.forEach((system, index) => {
      ensureReference(
        context,
        ['systems', index, 'siteId'],
        system.siteId,
        sites,
        'site',
      );
    });

    dataset.processes.forEach((process, index) => {
      ensureReference(
        context,
        ['processes', index, 'siteId'],
        process.siteId,
        sites,
        'site',
      );
      ensureReference(
        context,
        ['processes', index, 'areaId'],
        process.areaId,
        areas,
        'area',
      );
      ensureDistinctValues(
        context,
        ['processes', index, 'relatedSystemIds'],
        process.relatedSystemIds,
        'system IDs',
      );
      ensureReferenceList(
        context,
        ['processes', index, 'relatedSystemIds'],
        process.relatedSystemIds,
        systems,
        'system',
      );

      if (areaById.get(process.areaId)?.siteId !== process.siteId) {
        addIssue(
          context,
          ['processes', index, 'areaId'],
          'References an area assigned to a different site.',
        );
      }

      process.relatedSystemIds.forEach((systemId, systemIndex) => {
        if (systemById.get(systemId)?.siteId !== process.siteId) {
          addIssue(
            context,
            ['processes', index, 'relatedSystemIds', systemIndex],
            'References a system assigned to a different site.',
          );
        }
      });
    });

    dataset.engagements.forEach((engagement, index) => {
      ensureReference(
        context,
        ['engagements', index, 'clientId'],
        engagement.clientId,
        clients,
        'client',
      );
      ensureDistinctValues(
        context,
        ['engagements', index, 'siteIds'],
        engagement.siteIds,
        'site IDs',
      );
      ensureReferenceList(
        context,
        ['engagements', index, 'siteIds'],
        engagement.siteIds,
        sites,
        'site',
      );
      ensureReference(
        context,
        ['engagements', index, 'leadUserId'],
        engagement.leadUserId,
        users,
        'project lead',
      );
      ensureDistinctValues(
        context,
        ['engagements', index, 'teamUserIds'],
        engagement.teamUserIds,
        'team member IDs',
      );
      ensureReferenceList(
        context,
        ['engagements', index, 'teamUserIds'],
        engagement.teamUserIds,
        users,
        'team member',
      );

      if (!engagement.teamUserIds.includes(engagement.leadUserId)) {
        addIssue(
          context,
          ['engagements', index, 'teamUserIds'],
          'Must include the project lead.',
        );
      }

      engagement.siteIds.forEach((siteId, siteIndex) => {
        if (siteById.get(siteId)?.clientId !== engagement.clientId) {
          addIssue(
            context,
            ['engagements', index, 'siteIds', siteIndex],
            'References a site owned by a different client.',
          );
        }
      });
    });

    dataset.siteWalks.forEach((siteWalk, index) => {
      ensureReference(
        context,
        ['siteWalks', index, 'engagementId'],
        siteWalk.engagementId,
        engagements,
        'engagement',
      );
      ensureReference(
        context,
        ['siteWalks', index, 'siteId'],
        siteWalk.siteId,
        sites,
        'site',
      );
      ensureReference(
        context,
        ['siteWalks', index, 'consultantUserId'],
        siteWalk.consultantUserId,
        users,
        'consultant',
      );
      ensureReferenceList(
        context,
        ['siteWalks', index, 'followUpActionIds'],
        siteWalk.followUpActionIds,
        actionItems,
        'action',
      );

      if (!siteBelongsToEngagement(siteWalk.siteId, siteWalk.engagementId)) {
        addIssue(
          context,
          ['siteWalks', index, 'siteId'],
          'References a site outside the engagement scope.',
        );
      }

      if (siteWalk.areaId) {
        ensureReference(
          context,
          ['siteWalks', index, 'areaId'],
          siteWalk.areaId,
          areas,
          'area',
        );
        if (areaById.get(siteWalk.areaId)?.siteId !== siteWalk.siteId) {
          addIssue(
            context,
            ['siteWalks', index, 'areaId'],
            'References an area outside the selected site.',
          );
        }
      }

      if (siteWalk.processId) {
        ensureReference(
          context,
          ['siteWalks', index, 'processId'],
          siteWalk.processId,
          processes,
          'process',
        );
        if (processById.get(siteWalk.processId)?.siteId !== siteWalk.siteId) {
          addIssue(
            context,
            ['siteWalks', index, 'processId'],
            'References a process outside the selected site.',
          );
        }
      }

      siteWalk.participantUserIds?.forEach((userId, userIndex) =>
        ensureReference(
          context,
          ['siteWalks', index, 'participantUserIds', userIndex],
          userId,
          users,
          'participant user',
        ),
      );
      if (siteWalk.leadConsultantId) {
        ensureReference(
          context,
          ['siteWalks', index, 'leadConsultantId'],
          siteWalk.leadConsultantId,
          users,
          'lead consultant',
        );
      }
      if (siteWalk.followUpOwnerId) {
        ensureReference(
          context,
          ['siteWalks', index, 'followUpOwnerId'],
          siteWalk.followUpOwnerId,
          users,
          'follow-up owner',
        );
      }
    });

    dataset.observations.forEach((observation, index) => {
      ensureReference(
        context,
        ['observations', index, 'siteWalkId'],
        observation.siteWalkId,
        siteWalks,
        'site walk',
      );
      ensureDistinctValues(
        context,
        ['observations', index, 'evidenceIds'],
        observation.evidenceIds,
        'evidence IDs',
      );
      ensureReferenceList(
        context,
        ['observations', index, 'evidenceIds'],
        observation.evidenceIds,
        evidence,
        'evidence',
      );

      const siteId = siteWalkById.get(observation.siteWalkId)?.siteId;
      if (observation.processId) {
        ensureReference(
          context,
          ['observations', index, 'processId'],
          observation.processId,
          processes,
          'process',
        );
        if (
          siteId &&
          processById.get(observation.processId)?.siteId !== siteId
        ) {
          addIssue(
            context,
            ['observations', index, 'processId'],
            'References a process outside the site walk scope.',
          );
        }
      }
      if (observation.areaId) {
        ensureReference(
          context,
          ['observations', index, 'areaId'],
          observation.areaId,
          areas,
          'area',
        );
        if (siteId && areaById.get(observation.areaId)?.siteId !== siteId) {
          addIssue(
            context,
            ['observations', index, 'areaId'],
            'References an area outside the site walk scope.',
          );
        }
      }
      if (observation.systemId) {
        ensureReference(
          context,
          ['observations', index, 'systemId'],
          observation.systemId,
          systems,
          'system',
        );
        if (siteId && systemById.get(observation.systemId)?.siteId !== siteId) {
          addIssue(
            context,
            ['observations', index, 'systemId'],
            'References a system outside the site walk scope.',
          );
        }
      }
      if (observation.recordedByUserId) {
        ensureReference(
          context,
          ['observations', index, 'recordedByUserId'],
          observation.recordedByUserId,
          users,
          'recording user',
        );
      }
    });

    const relatedIdsByType = new Map([
      ['engagement', engagements],
      ['site-walk', siteWalks],
      ['observation', observations],
      ['opportunity', opportunities],
      ['output', outputs],
    ]);

    dataset.evidence.forEach((evidenceItem, index) => {
      const relatedIds = relatedIdsByType.get(evidenceItem.relatedEntityType);
      const relatedEngagementId = relatedEntityEngagementId(
        evidenceItem.relatedEntityType,
        evidenceItem.relatedEntityId,
      );
      const attachedEngagementId = evidenceEngagementId(evidenceItem);
      if (relatedIds) {
        ensureReference(
          context,
          ['evidence', index, 'relatedEntityId'],
          evidenceItem.relatedEntityId,
          relatedIds,
          evidenceItem.relatedEntityType,
        );
      }
      if (
        relatedEngagementId &&
        attachedEngagementId &&
        relatedEngagementId !== attachedEngagementId
      ) {
        addIssue(
          context,
          ['evidence', index, 'relatedEntityId'],
          'Must reference material from the same engagement as its attached site walk or observation.',
        );
      }
      if (evidenceItem.siteWalkId) {
        ensureReference(
          context,
          ['evidence', index, 'siteWalkId'],
          evidenceItem.siteWalkId,
          siteWalks,
          'site walk',
        );
      }
      if (evidenceItem.observationId) {
        ensureReference(
          context,
          ['evidence', index, 'observationId'],
          evidenceItem.observationId,
          observations,
          'observation',
        );
        const observation = observationById.get(evidenceItem.observationId);
        if (
          evidenceItem.siteWalkId &&
          observation?.siteWalkId !== evidenceItem.siteWalkId
        ) {
          addIssue(
            context,
            ['evidence', index, 'siteWalkId'],
            'Must match the linked observation site walk.',
          );
        }
      }
      if (evidenceItem.capturedByUserId) {
        ensureReference(
          context,
          ['evidence', index, 'capturedByUserId'],
          evidenceItem.capturedByUserId,
          users,
          'capturing user',
        );
      }
    });

    dataset.frictionItems.forEach((item, index) => {
      ensureReference(
        context,
        ['frictionItems', index, 'siteWalkId'],
        item.siteWalkId,
        siteWalks,
        'site walk',
      );
      if (item.evidenceReference) {
        ensureReference(
          context,
          ['frictionItems', index, 'evidenceReference'],
          item.evidenceReference,
          evidence,
          'evidence',
        );
      }
    });

    dataset.diagnostics.forEach((diagnostic, index) => {
      ensureReference(
        context,
        ['diagnostics', index, 'engagementId'],
        diagnostic.engagementId,
        engagements,
        'engagement',
      );
      ensureReference(
        context,
        ['diagnostics', index, 'assessorUserId'],
        diagnostic.assessorUserId,
        users,
        'assessor',
      );
    });

    dataset.maturityAssessments.forEach((assessment, index) => {
      ensureReference(
        context,
        ['maturityAssessments', index, 'diagnosticId'],
        assessment.diagnosticId,
        diagnostics,
        'diagnostic',
      );
      ensureReference(
        context,
        ['maturityAssessments', index, 'dimensionId'],
        assessment.dimensionId,
        dimensions,
        'diagnostic dimension',
      );
      ensureDistinctValues(
        context,
        ['maturityAssessments', index, 'relatedObservationIds'],
        assessment.relatedObservationIds,
        'observation IDs',
      );
      ensureReferenceList(
        context,
        ['maturityAssessments', index, 'relatedObservationIds'],
        assessment.relatedObservationIds,
        observations,
        'observation',
      );
      ensureDistinctValues(
        context,
        ['maturityAssessments', index, 'evidenceReferences'],
        assessment.evidenceReferences,
        'evidence IDs',
      );
      ensureReferenceList(
        context,
        ['maturityAssessments', index, 'evidenceReferences'],
        assessment.evidenceReferences,
        evidence,
        'evidence',
      );
      ensureDistinctValues(
        context,
        ['maturityAssessments', index, 'relatedOpportunityIds'],
        assessment.relatedOpportunityIds,
        'opportunity IDs',
      );
      ensureReferenceList(
        context,
        ['maturityAssessments', index, 'relatedOpportunityIds'],
        assessment.relatedOpportunityIds,
        opportunities,
        'opportunity',
      );

      const engagementId = diagnosticById.get(
        assessment.diagnosticId,
      )?.engagementId;
      if (engagementId) {
        assessment.relatedObservationIds.forEach((id, referenceIndex) => {
          if (!entityBelongsToEngagement(id, engagementId)) {
            addIssue(
              context,
              [
                'maturityAssessments',
                index,
                'relatedObservationIds',
                referenceIndex,
              ],
              'References an observation outside the diagnostic engagement.',
            );
          }
        });
        assessment.evidenceReferences.forEach((id, referenceIndex) => {
          if (!entityBelongsToEngagement(id, engagementId)) {
            addIssue(
              context,
              [
                'maturityAssessments',
                index,
                'evidenceReferences',
                referenceIndex,
              ],
              'References evidence outside the diagnostic engagement.',
            );
          }
        });
        assessment.relatedOpportunityIds.forEach((id, referenceIndex) => {
          if (!entityBelongsToEngagement(id, engagementId)) {
            addIssue(
              context,
              [
                'maturityAssessments',
                index,
                'relatedOpportunityIds',
                referenceIndex,
              ],
              'References an opportunity outside the diagnostic engagement.',
            );
          }
        });
      }

      if (assessment.assessedByUserId) {
        ensureReference(
          context,
          ['maturityAssessments', index, 'assessedByUserId'],
          assessment.assessedByUserId,
          users,
          'assessor',
        );
      }
    });

    dataset.findings.forEach((finding, index) => {
      ensureReference(
        context,
        ['findings', index, 'diagnosticId'],
        finding.diagnosticId,
        diagnostics,
        'diagnostic',
      );
      ensureReferenceList(
        context,
        ['findings', index, 'relatedObservationIds'],
        finding.relatedObservationIds,
        observations,
        'observation',
      );
      ensureReferenceList(
        context,
        ['findings', index, 'relatedEvidenceIds'],
        finding.relatedEvidenceIds,
        evidence,
        'evidence',
      );
      ensureReferenceList(
        context,
        ['findings', index, 'relatedOpportunityIds'],
        finding.relatedOpportunityIds,
        opportunities,
        'opportunity',
      );

      const engagementId = diagnosticById.get(
        finding.diagnosticId,
      )?.engagementId;
      if (engagementId) {
        [
          ...finding.relatedObservationIds,
          ...finding.relatedEvidenceIds,
          ...finding.relatedOpportunityIds,
        ].forEach((id, referenceIndex) => {
          if (!entityBelongsToEngagement(id, engagementId)) {
            addIssue(
              context,
              ['findings', index, 'relatedObservationIds', referenceIndex],
              'References material outside the diagnostic engagement.',
            );
          }
        });
      }
    });

    dataset.landscapeEntities.forEach((entity, index) => {
      ensureReference(
        context,
        ['landscapeEntities', index, 'engagementId'],
        entity.engagementId,
        engagements,
        'engagement',
      );
      if (
        entity.sourceEntityId &&
        !entityBelongsToEngagement(entity.sourceEntityId, entity.engagementId)
      ) {
        addIssue(
          context,
          ['landscapeEntities', index, 'sourceEntityId'],
          'References a source outside the engagement scope.',
        );
      }
    });

    dataset.landscapeRelationships.forEach((relationship, index) => {
      ensureReference(
        context,
        ['landscapeRelationships', index, 'engagementId'],
        relationship.engagementId,
        engagements,
        'engagement',
      );
      ensureReference(
        context,
        ['landscapeRelationships', index, 'fromEntityId'],
        relationship.fromEntityId,
        landscapeEntities,
        'landscape entity',
      );
      ensureReference(
        context,
        ['landscapeRelationships', index, 'toEntityId'],
        relationship.toEntityId,
        landscapeEntities,
        'landscape entity',
      );
      ensureReferenceList(
        context,
        ['landscapeRelationships', index, 'evidenceIds'],
        relationship.evidenceIds,
        evidence,
        'evidence',
      );

      if (
        dataset.landscapeEntities.find(
          (item) => item.id === relationship.fromEntityId,
        )?.engagementId !== relationship.engagementId
      ) {
        addIssue(
          context,
          ['landscapeRelationships', index, 'fromEntityId'],
          'References a landscape entity outside the engagement scope.',
        );
      }
      if (
        dataset.landscapeEntities.find(
          (item) => item.id === relationship.toEntityId,
        )?.engagementId !== relationship.engagementId
      ) {
        addIssue(
          context,
          ['landscapeRelationships', index, 'toEntityId'],
          'References a landscape entity outside the engagement scope.',
        );
      }
      relationship.evidenceIds.forEach((id, referenceIndex) => {
        if (!entityBelongsToEngagement(id, relationship.engagementId)) {
          addIssue(
            context,
            ['landscapeRelationships', index, 'evidenceIds', referenceIndex],
            'References evidence outside the engagement scope.',
          );
        }
      });
    });

    dataset.opportunities.forEach((opportunity, index) => {
      ensureReference(
        context,
        ['opportunities', index, 'engagementId'],
        opportunity.engagementId,
        engagements,
        'engagement',
      );
      ensureReferenceList(
        context,
        ['opportunities', index, 'evidenceIds'],
        opportunity.evidenceIds,
        evidence,
        'evidence',
      );
      if (opportunity.diagnosticId) {
        ensureReference(
          context,
          ['opportunities', index, 'diagnosticId'],
          opportunity.diagnosticId,
          diagnostics,
          'diagnostic',
        );
        if (
          diagnosticById.get(opportunity.diagnosticId)?.engagementId !==
          opportunity.engagementId
        ) {
          addIssue(
            context,
            ['opportunities', index, 'diagnosticId'],
            'References a diagnostic from a different engagement.',
          );
        }
      }
      if (opportunity.processId) {
        ensureReference(
          context,
          ['opportunities', index, 'processId'],
          opportunity.processId,
          processes,
          'process',
        );
        if (
          !entityBelongsToEngagement(
            opportunity.processId,
            opportunity.engagementId,
          )
        ) {
          addIssue(
            context,
            ['opportunities', index, 'processId'],
            'References a process outside the engagement scope.',
          );
        }
      }
      if (opportunity.areaId) {
        ensureReference(
          context,
          ['opportunities', index, 'areaId'],
          opportunity.areaId,
          areas,
          'area',
        );
        if (
          !entityBelongsToEngagement(
            opportunity.areaId,
            opportunity.engagementId,
          )
        ) {
          addIssue(
            context,
            ['opportunities', index, 'areaId'],
            'References an area outside the engagement scope.',
          );
        }
      }
      if (opportunity.systemId) {
        ensureReference(
          context,
          ['opportunities', index, 'systemId'],
          opportunity.systemId,
          systems,
          'system',
        );
        if (
          !entityBelongsToEngagement(
            opportunity.systemId,
            opportunity.engagementId,
          )
        ) {
          addIssue(
            context,
            ['opportunities', index, 'systemId'],
            'References a system outside the engagement scope.',
          );
        }
      }
      if (opportunity.ownerUserId) {
        ensureReference(
          context,
          ['opportunities', index, 'ownerUserId'],
          opportunity.ownerUserId,
          users,
          'owner',
        );
      }
      opportunity.evidenceIds.forEach((id, referenceIndex) => {
        if (!entityBelongsToEngagement(id, opportunity.engagementId)) {
          addIssue(
            context,
            ['opportunities', index, 'evidenceIds', referenceIndex],
            'References evidence outside the engagement scope.',
          );
        }
      });
      opportunity.relatedObservationIds?.forEach((id, referenceIndex) => {
        ensureReference(
          context,
          ['opportunities', index, 'relatedObservationIds', referenceIndex],
          id,
          observations,
          'observation',
        );
        if (!entityBelongsToEngagement(id, opportunity.engagementId)) {
          addIssue(
            context,
            ['opportunities', index, 'relatedObservationIds', referenceIndex],
            'References an observation outside the engagement scope.',
          );
        }
      });
      opportunity.relatedFindingIds?.forEach((id, referenceIndex) => {
        ensureReference(
          context,
          ['opportunities', index, 'relatedFindingIds', referenceIndex],
          id,
          findings,
          'finding',
        );
        if (!entityBelongsToEngagement(id, opportunity.engagementId)) {
          addIssue(
            context,
            ['opportunities', index, 'relatedFindingIds', referenceIndex],
            'References a finding outside the engagement scope.',
          );
        }
      });
    });

    dataset.actionItems.forEach((action, index) => {
      if (action.opportunityId) {
        ensureReference(
          context,
          ['actionItems', index, 'opportunityId'],
          action.opportunityId,
          opportunities,
          'opportunity',
        );
      }
      if (action.initiativeId) {
        ensureReference(
          context,
          ['actionItems', index, 'initiativeId'],
          action.initiativeId,
          initiatives,
          'initiative',
        );
      }
      if (action.ownerUserId) {
        ensureReference(
          context,
          ['actionItems', index, 'ownerUserId'],
          action.ownerUserId,
          users,
          'owner',
        );
      }
      if (action.opportunityId && action.initiativeId) {
        const opportunity = opportunityById.get(action.opportunityId);
        const initiative = initiativeById.get(action.initiativeId);
        if (
          opportunity &&
          initiative &&
          opportunity.engagementId !== initiative.engagementId
        ) {
          addIssue(
            context,
            ['actionItems', index],
            'Links an opportunity and initiative from different engagements.',
          );
        }
      }
    });

    dataset.initiatives.forEach((initiative, index) => {
      ensureReference(
        context,
        ['initiatives', index, 'engagementId'],
        initiative.engagementId,
        engagements,
        'engagement',
      );
      ensureReference(
        context,
        ['initiatives', index, 'opportunityId'],
        initiative.opportunityId,
        opportunities,
        'opportunity',
      );
      ensureReference(
        context,
        ['initiatives', index, 'ownerUserId'],
        initiative.ownerUserId,
        users,
        'owner',
      );

      const opportunity = opportunityById.get(initiative.opportunityId);
      if (opportunity && opportunity.engagementId !== initiative.engagementId) {
        addIssue(
          context,
          ['initiatives', index, 'opportunityId'],
          'References an opportunity from a different engagement.',
        );
      }
      if (opportunity && !isApprovedOutputSource(opportunity.id)) {
        addIssue(
          context,
          ['initiatives', index, 'opportunityId'],
          'Can only be created from an approved opportunity with a client-safe summary.',
        );
      }
    });

    const roadmapByInitiativeId = new Map<string, string>();

    dataset.roadmaps.forEach((roadmap, index) => {
      ensureReference(
        context,
        ['roadmaps', index, 'engagementId'],
        roadmap.engagementId,
        engagements,
        'engagement',
      );
      ensureDistinctValues(
        context,
        ['roadmaps', index, 'phases'],
        roadmap.phases,
        'roadmap phases',
      );
      ensureDistinctValues(
        context,
        ['roadmaps', index, 'initiativeIds'],
        roadmap.initiativeIds,
        'initiative IDs',
      );
      ensureReferenceList(
        context,
        ['roadmaps', index, 'initiativeIds'],
        roadmap.initiativeIds,
        initiatives,
        'initiative',
      );
      if (roadmap.diagnosticId) {
        ensureReference(
          context,
          ['roadmaps', index, 'diagnosticId'],
          roadmap.diagnosticId,
          diagnostics,
          'diagnostic',
        );
        if (
          diagnosticById.get(roadmap.diagnosticId)?.engagementId !==
          roadmap.engagementId
        ) {
          addIssue(
            context,
            ['roadmaps', index, 'diagnosticId'],
            'References a diagnostic from a different engagement.',
          );
        }
      }
      roadmap.initiativeIds.forEach((initiativeId, initiativeIndex) => {
        const initiative = initiativeById.get(initiativeId);
        if (initiative?.engagementId !== roadmap.engagementId) {
          addIssue(
            context,
            ['roadmaps', index, 'initiativeIds', initiativeIndex],
            'References an initiative from a different engagement.',
          );
        }
        if (initiative && !roadmap.phases.includes(initiative.phase)) {
          addIssue(
            context,
            ['roadmaps', index, 'initiativeIds', initiativeIndex],
            'References an initiative whose phase is not included in this roadmap.',
          );
        }

        const existingRoadmapId = roadmapByInitiativeId.get(initiativeId);
        if (existingRoadmapId && existingRoadmapId !== roadmap.id) {
          addIssue(
            context,
            ['roadmaps', index, 'initiativeIds', initiativeIndex],
            'An initiative can only appear in one roadmap sequence.',
          );
        } else {
          roadmapByInitiativeId.set(initiativeId, roadmap.id);
        }
      });
    });

    dataset.milestones.forEach((milestone, index) => {
      ensureReference(
        context,
        ['milestones', index, 'initiativeId'],
        milestone.initiativeId,
        initiatives,
        'initiative',
      );
    });

    dataset.deliveryActions.forEach((action, index) => {
      ensureReference(
        context,
        ['deliveryActions', index, 'initiativeId'],
        action.initiativeId,
        initiatives,
        'initiative',
      );
      ensureDistinctValues(
        context,
        ['deliveryActions', index, 'dependencyIds'],
        action.dependencyIds,
        'dependency IDs',
      );

      action.dependencyIds.forEach((dependencyId, dependencyIndex) => {
        if (dependencyId === action.id) {
          addIssue(
            context,
            ['deliveryActions', index, 'dependencyIds', dependencyIndex],
            'Cannot depend on itself.',
          );
          return;
        }

        const milestone = milestoneById.get(dependencyId);
        const dependentAction = deliveryActionById.get(dependencyId);
        if (!milestone && !dependentAction) {
          addIssue(
            context,
            ['deliveryActions', index, 'dependencyIds', dependencyIndex],
            'References an unknown delivery action or milestone.',
          );
          return;
        }
        if (milestone && milestone.initiativeId !== action.initiativeId) {
          addIssue(
            context,
            ['deliveryActions', index, 'dependencyIds', dependencyIndex],
            'References a milestone from a different initiative.',
          );
        }
        if (
          dependentAction &&
          dependentAction.initiativeId !== action.initiativeId
        ) {
          addIssue(
            context,
            ['deliveryActions', index, 'dependencyIds', dependencyIndex],
            'References an action from a different initiative.',
          );
        }
      });
    });

    const actionDependsOn = (
      actionId: string,
      targetActionId: string,
      visitedActionIds: Set<string>,
    ): boolean => {
      if (actionId === targetActionId) {
        return true;
      }
      if (visitedActionIds.has(actionId)) {
        return false;
      }

      visitedActionIds.add(actionId);
      const action = deliveryActionById.get(actionId);
      if (!action) {
        return false;
      }

      return action.dependencyIds.some((dependencyId) => {
        const dependency = deliveryActionById.get(dependencyId);
        return (
          dependency?.initiativeId === action.initiativeId &&
          actionDependsOn(dependencyId, targetActionId, visitedActionIds)
        );
      });
    };

    dataset.deliveryActions.forEach((action, index) => {
      action.dependencyIds.forEach((dependencyId, dependencyIndex) => {
        const dependency = deliveryActionById.get(dependencyId);
        if (
          dependency?.initiativeId === action.initiativeId &&
          actionDependsOn(dependencyId, action.id, new Set())
        ) {
          addIssue(
            context,
            ['deliveryActions', index, 'dependencyIds', dependencyIndex],
            'Creates a circular delivery-action dependency.',
          );
        }
      });
    });

    dataset.benefitMeasurements.forEach((benefit, index) => {
      ensureReference(
        context,
        ['benefitMeasurements', index, 'initiativeId'],
        benefit.initiativeId,
        initiatives,
        'initiative',
      );
    });

    dataset.outputs.forEach((output, index) => {
      ensureReference(
        context,
        ['outputs', index, 'engagementId'],
        output.engagementId,
        engagements,
        'engagement',
      );
      ensureReference(
        context,
        ['outputs', index, 'createdByUserId'],
        output.createdByUserId,
        users,
        'creating user',
      );
      ensureDistinctValues(
        context,
        ['outputs', index, 'sourceReferences'],
        output.sourceReferences,
        'source references',
      );
      if (output.approvedByUserId) {
        ensureReference(
          context,
          ['outputs', index, 'approvedByUserId'],
          output.approvedByUserId,
          users,
          'approving user',
        );
      }

      output.sourceReferences.forEach((referenceId, referenceIndex) => {
        if (!entityBelongsToEngagement(referenceId, output.engagementId)) {
          addIssue(
            context,
            ['outputs', index, 'sourceReferences', referenceIndex],
            'References source material outside the engagement scope.',
          );
        }

        if (
          (output.status === 'approved' || output.status === 'published') &&
          !isApprovedOutputSource(referenceId)
        ) {
          addIssue(
            context,
            ['outputs', index, 'sourceReferences', referenceIndex],
            'Approved outputs can only use approved, client-safe source material.',
          );
        }
      });
    });
  },
);
