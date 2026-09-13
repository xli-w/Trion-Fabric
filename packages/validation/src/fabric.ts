import { z } from 'zod';

import {
  actionStatuses,
  activityActions,
  activityEntityTypes,
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
  knowledgeAreaTags,
  knowledgeEntryStatuses,
  knowledgeEntryTypes,
  knowledgeIndustryTags,
  knowledgeProcessTags,
  knowledgeSources,
  knowledgeSystemTags,
  landscapeEntityTypes,
  landscapeRelationshipTypes,
  landscapeTransferModes,
  landscapeVerificationStates,
  landscapeVersionStatuses,
  maturityLevels,
  methodologyActivityRequirements,
  methodologyActivityStatuses,
  methodologyActivityTypes,
  methodologyCompletionRuleTypes,
  methodologyLinkedDomains,
  methodologyRunStatuses,
  methodologyTemplateStatuses,
  opportunityPriorityCategories,
  outputExportAudiences,
  outputExportFormats,
  outputReviewCommentStatuses,
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
  canRecordLandscapeTransfer,
  isClientSafeLandscapeEntity,
  isClientSafeOutputSource,
  isLandscapeRelationshipCompatible,
  getOutputReportContentFingerprint,
  getOutputTemplate,
} from '@domain';

const isoDateTimeSchema = z.string().datetime({ offset: true });

const baseEntitySchema = z.object({
  id: z.string().min(1),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

const managedFileReferenceSchema = z
  .string()
  .trim()
  .min(1)
  .max(240)
  .regex(
    /^[a-z0-9][a-z0-9._/-]*$/i,
    'Use a managed-storage key, not a local path or direct URL.',
  )
  .refine(
    (value) => !value.split('/').includes('..'),
    'A managed-storage key cannot traverse parent directories.',
  );

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

export const observationSchema = baseEntitySchema
  .extend({
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
  })
  .superRefine((observation, context) => {
    if (
      observation.visibility === 'approved-client-facing' &&
      observation.status !== 'verified'
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['visibility'],
        message:
          'Approved client-facing observations must be verified before sharing.',
      });
    }

    if (
      observation.visibility === 'approved-client-facing' &&
      observation.assurance === 'assumption'
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['assurance'],
        message:
          'Assumptions cannot be approved as client-facing observations.',
      });
    }

    if (
      observation.visibility === 'approved-client-facing' &&
      (observation.aiStatus === 'suggested' ||
        observation.aiStatus === 'rejected')
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['aiStatus'],
        message:
          'Unreviewed or rejected AI content cannot be client-facing evidence.',
      });
    }
  });

export const evidenceSchema = baseEntitySchema
  .extend({
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
    fileReference: managedFileReferenceSchema.optional(),
    source: z.enum(observationSources).optional(),
    capturedByUserId: z.string().min(1).optional(),
    reviewStatus: z.enum(evidenceReviewStatuses).optional(),
  })
  .superRefine((evidenceItem, context) => {
    if (
      evidenceItem.visibility === 'approved-client-facing' &&
      (evidenceItem.approvalState !== 'approved' ||
        evidenceItem.reviewStatus !== 'verified')
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['visibility'],
        message:
          'Approved client-facing evidence requires approval and verified review.',
      });
    }
  });

export const frictionItemSchema = baseEntitySchema
  .extend({
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
    clientSummary: z.string().min(1).optional(),
    approvalState: z.enum(approvalStates).optional(),
    visibility: z.enum(visibilityScopes).optional(),
    reviewStatus: z.enum(reviewStatuses).optional(),
  })
  .superRefine((frictionItem, context) => {
    if (
      frictionItem.visibility === 'approved-client-facing' &&
      (frictionItem.approvalState !== 'approved' ||
        frictionItem.reviewStatus !== 'approved' ||
        !frictionItem.clientSummary)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['visibility'],
        message:
          'Client-facing friction requires approval, approved review, and a client summary.',
      });
    }
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
  siteId: z.string().min(1),
  type: z.enum(landscapeEntityTypes),
  name: z.string().min(1),
  description: z.string().min(1),
  sourceEntityId: z.string().min(1).optional(),
  ownerRole: z.string().min(1).optional(),
  ownerEntityId: z.string().min(1).optional(),
  documentedMethod: z.string().min(1).optional(),
  confidence: z.enum(confidenceLevels),
  verificationStatus: z.enum(landscapeVerificationStates),
  linkedObservationIds: z.array(z.string().min(1)),
  linkedEvidenceIds: z.array(z.string().min(1)),
  linkedFrictionItemIds: z.array(z.string().min(1)),
  linkedOpportunityIds: z.array(z.string().min(1)),
  internalNotes: z.string().min(1).optional(),
  visibility: z.enum(visibilityScopes),
  reviewStatus: z.enum(reviewStatuses),
});

export const landscapeRelationshipSchema = baseEntitySchema.extend({
  engagementId: z.string().min(1),
  fromEntityId: z.string().min(1),
  toEntityId: z.string().min(1),
  type: z.enum(landscapeRelationshipTypes),
  rationale: z.string().min(1).optional(),
  evidenceIds: z.array(z.string().min(1)),
  linkedObservationIds: z.array(z.string().min(1)),
  linkedOpportunityIds: z.array(z.string().min(1)),
  transferMode: z.enum(landscapeTransferModes).optional(),
  duplicateDataEntry: z.boolean().optional(),
  confidence: z.enum(confidenceLevels),
  verificationStatus: z.enum(landscapeVerificationStates),
  internalNotes: z.string().min(1).optional(),
  visibility: z.enum(visibilityScopes),
  reviewStatus: z.enum(reviewStatuses),
});

const landscapeEntitySnapshotSchema = z.object({
  landscapeEntityId: z.string().min(1),
  siteId: z.string().min(1),
  type: z.enum(landscapeEntityTypes),
  name: z.string().min(1),
  description: z.string().min(1),
  sourceEntityId: z.string().min(1).optional(),
  ownerRole: z.string().min(1).optional(),
  ownerEntityId: z.string().min(1).optional(),
  documentedMethod: z.string().min(1).optional(),
  confidence: z.enum(confidenceLevels),
  verificationStatus: z.enum(landscapeVerificationStates),
  linkedObservationIds: z.array(z.string().min(1)),
  linkedEvidenceIds: z.array(z.string().min(1)),
  linkedFrictionItemIds: z.array(z.string().min(1)),
  linkedOpportunityIds: z.array(z.string().min(1)),
  visibility: z.enum(visibilityScopes),
  reviewStatus: z.enum(reviewStatuses),
});

const landscapeRelationshipSnapshotSchema = z.object({
  landscapeRelationshipId: z.string().min(1),
  fromEntityId: z.string().min(1),
  toEntityId: z.string().min(1),
  type: z.enum(landscapeRelationshipTypes),
  rationale: z.string().min(1).optional(),
  evidenceIds: z.array(z.string().min(1)),
  linkedObservationIds: z.array(z.string().min(1)),
  linkedOpportunityIds: z.array(z.string().min(1)),
  transferMode: z.enum(landscapeTransferModes).optional(),
  duplicateDataEntry: z.boolean().optional(),
  confidence: z.enum(confidenceLevels),
  verificationStatus: z.enum(landscapeVerificationStates),
  visibility: z.enum(visibilityScopes),
  reviewStatus: z.enum(reviewStatuses),
});

export const landscapeVersionSchema = baseEntitySchema.extend({
  engagementId: z.string().min(1),
  siteId: z.string().min(1).optional(),
  title: z.string().min(1),
  version: z.string().min(1),
  status: z.enum(landscapeVersionStatuses),
  capturedAt: isoDateTimeSchema,
  capturedByUserId: z.string().min(1),
  notes: z.string().min(1).optional(),
  entities: z.array(landscapeEntitySnapshotSchema).min(1),
  relationships: z.array(landscapeRelationshipSnapshotSchema),
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
    visibility: z.enum(visibilityScopes),
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

    if (
      opportunity.visibility === 'approved-client-facing' &&
      (opportunity.approvalState !== 'approved' ||
        opportunity.reviewStatus !== 'approved')
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['visibility'],
        message:
          'Approved client-facing opportunities require approved content and review.',
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
  clientSummary: z.string().min(1).optional(),
  visibility: z.enum(visibilityScopes).optional(),
  reviewStatus: z.enum(reviewStatuses).optional(),
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

const outputSectionOverrideSchema = z.object({
  sectionId: z.string().min(1),
  narrative: z.string().min(1),
  sourceReferences: z.array(z.string().min(1)).min(1),
});

const outputReportBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('paragraph'),
    content: z.string().min(1),
  }),
  z.object({
    type: z.literal('bullet-list'),
    items: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    type: z.literal('table'),
    columns: z.array(z.string().min(1)).min(1),
    rows: z.array(z.array(z.string().min(1))).min(1),
  }),
  z.object({
    type: z.literal('callout'),
    tone: z.enum(['information', 'warning']),
    content: z.string().min(1),
  }),
]);

const outputReportSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  editable: z.boolean(),
  blocks: z.array(outputReportBlockSchema).min(1),
  sourceReferences: z.array(z.string().min(1)),
});

const outputReportContextSchema = z.object({
  clientId: z.string().min(1),
  clientName: z.string().min(1),
  clientIndustry: z.string().min(1),
  engagementId: z.string().min(1),
  engagementName: z.string().min(1),
  engagementType: z.enum(engagementTypes),
  engagementStage: z.enum(transformationStages),
  siteNames: z.array(z.string().min(1)),
});

const outputReportSnapshotSchema = z.object({
  schemaVersion: z.literal('trion-output-report/v1'),
  templateId: z.enum(outputTypes),
  templateVersion: z.string().min(1),
  generatedAt: isoDateTimeSchema,
  sourceFingerprint: z.string().min(1),
  contentFingerprint: z.string().min(1),
  context: outputReportContextSchema,
  sections: z.array(outputReportSectionSchema).min(1),
  includedSources: z.array(
    z.object({
      id: z.string().min(1),
      type: z.string().min(1),
      title: z.string().min(1),
    }),
  ),
  excludedSources: z.array(
    z.object({
      sourceId: z.string().min(1),
      reason: z.string().min(1),
    }),
  ),
});

export const outputReviewCommentSchema = baseEntitySchema
  .extend({
    outputId: z.string().min(1),
    body: z.string().min(1),
    authorUserId: z.string().min(1),
    status: z.enum(outputReviewCommentStatuses),
    resolvedByUserId: z.string().min(1).optional(),
    resolvedAt: isoDateTimeSchema.optional(),
  })
  .superRefine((comment, context) => {
    if (
      comment.status === 'resolved' &&
      (!comment.resolvedByUserId || !comment.resolvedAt)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['resolvedAt'],
        message:
          'A resolved output review comment requires an actor and timestamp.',
      });
    }

    if (
      comment.status === 'open' &&
      (comment.resolvedByUserId || comment.resolvedAt)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['status'],
        message:
          'An open output review comment cannot retain resolution metadata.',
      });
    }
  });

export const outputExportReferenceSchema = baseEntitySchema.extend({
  outputId: z.string().min(1),
  format: z.enum(outputExportFormats),
  audience: z.enum(outputExportAudiences),
  fileName: z.string().min(1),
  outputVersion: z.string().min(1),
  sourceFingerprint: z.string().min(1),
  contentFingerprint: z.string().min(1),
  exportedByUserId: z.string().min(1),
  exportedAt: isoDateTimeSchema,
});

export const outputSchema = baseEntitySchema
  .extend({
    engagementId: z.string().min(1),
    outputType: z.enum(outputTypes),
    title: z.string().min(1),
    status: z.enum(outputStatuses),
    visibility: z.enum(visibilityScopes),
    version: z.string().min(1),
    templateVersion: z.string().min(1).default('2026.1'),
    createdByUserId: z.string().min(1),
    approvedByUserId: z.string().min(1).optional(),
    approvedAt: isoDateTimeSchema.optional(),
    publishedAt: isoDateTimeSchema.optional(),
    sourceReferences: z.array(z.string().min(1)).min(1),
    sectionOverrides: z.array(outputSectionOverrideSchema).default([]),
    reportSnapshot: outputReportSnapshotSchema.optional(),
    supersedesOutputId: z.string().min(1).optional(),
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

    if (output.visibility === 'approved-client-facing' && !isApproved) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['visibility'],
        message: 'Only approved outputs can be approved client-facing.',
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
      output.visibility !== 'approved-client-facing'
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['visibility'],
        message: 'Published outputs must be approved client-facing.',
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

    if (isApproved && output.visibility !== 'approved-client-facing') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['visibility'],
        message: 'Approved outputs must be explicitly approved client-facing.',
      });
    }

    if (output.visibility === 'draft-client-facing' && isApproved) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['visibility'],
        message:
          'Draft client-facing outputs must complete approval before sharing.',
      });
    }

    if (output.status === 'archived' && output.visibility !== 'archived') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['visibility'],
        message: 'Archived outputs must be marked archived.',
      });
    }

    if (output.visibility === 'archived' && output.status !== 'archived') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['status'],
        message: 'Only archived outputs can use archived visibility.',
      });
    }

    if (
      output.reportSnapshot &&
      output.reportSnapshot.templateId !== output.outputType
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reportSnapshot', 'templateId'],
        message: 'A report snapshot must use the same output template type.',
      });
    }

    if (
      output.reportSnapshot &&
      output.reportSnapshot.templateVersion !== output.templateVersion
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reportSnapshot', 'templateVersion'],
        message: 'A report snapshot must retain the output template version.',
      });
    }

    if (
      output.reportSnapshot &&
      output.reportSnapshot.contentFingerprint !==
        getOutputReportContentFingerprint(output.reportSnapshot)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reportSnapshot', 'contentFingerprint'],
        message:
          'A report snapshot content fingerprint must match its complete frozen report content.',
      });
    }

    if (isApproved && !output.reportSnapshot) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reportSnapshot'],
        message:
          'Approved outputs require a generated report snapshot so published content cannot change silently.',
      });
    }

    if (isApproved && output.reportSnapshot?.includedSources.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reportSnapshot', 'includedSources'],
        message:
          'Approved outputs require at least one approved source in their report snapshot.',
      });
    }

    const template = getOutputTemplate(output.outputType);
    const overrideIds = new Set<string>();
    output.sectionOverrides.forEach((override, index) => {
      const section = template.sections.find(
        (item) => item.id === override.sectionId,
      );
      if (!section) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sectionOverrides', index, 'sectionId'],
          message:
            'The section override does not belong to this output template.',
        });
      } else if (!section.editable) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sectionOverrides', index, 'sectionId'],
          message: 'Only editorial report sections can be manually overridden.',
        });
      }

      if (overrideIds.has(override.sectionId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sectionOverrides', index, 'sectionId'],
          message: 'A report section can only have one editorial override.',
        });
      }
      overrideIds.add(override.sectionId);

      const sourceIds = new Set<string>();
      override.sourceReferences.forEach((sourceId, sourceIndex) => {
        if (sourceIds.has(sourceId)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['sectionOverrides', index, 'sourceReferences', sourceIndex],
            message:
              'An editorial narrative cannot cite the same source more than once.',
          });
        }
        sourceIds.add(sourceId);

        if (!output.sourceReferences.includes(sourceId)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['sectionOverrides', index, 'sourceReferences', sourceIndex],
            message:
              'An editorial narrative can only cite an explicitly selected output source.',
          });
        }
      });
    });
  });

export const knowledgeTagsSchema = z.object({
  areas: z.array(z.enum(knowledgeAreaTags)),
  processes: z.array(z.enum(knowledgeProcessTags)),
  systems: z.array(z.enum(knowledgeSystemTags)),
  issueCategories: z.array(z.enum(frictionCategories)),
  evidenceTypes: z.array(z.enum(evidenceTypes)),
  opportunityTypes: z.array(z.enum(opportunityTypes)),
  industries: z.array(z.enum(knowledgeIndustryTags)),
  confidence: z.enum(confidenceLevels).optional(),
  reviewStatuses: z.array(z.enum(reviewStatuses)),
});

export const knowledgeEntrySchema = baseEntitySchema
  .extend({
    type: z.enum(knowledgeEntryTypes),
    title: z.string().min(1),
    summary: z.string().min(1),
    content: z.string().min(1),
    source: z.enum(knowledgeSources),
    status: z.enum(knowledgeEntryStatuses),
    visibility: z.literal('internal'),
    tags: knowledgeTagsSchema,
    methodologyStage: z.enum(transformationStages).optional(),
    createdByUserId: z.string().min(1),
    reviewedByUserId: z.string().min(1).optional(),
    reviewedAt: isoDateTimeSchema.optional(),
  })
  .superRefine((entry, context) => {
    const tagCount =
      entry.tags.areas.length +
      entry.tags.processes.length +
      entry.tags.systems.length +
      entry.tags.issueCategories.length +
      entry.tags.evidenceTypes.length +
      entry.tags.opportunityTypes.length +
      entry.tags.industries.length +
      entry.tags.reviewStatuses.length;
    if (tagCount === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tags'],
        message:
          'Reusable knowledge requires at least one controlled classification tag.',
      });
    }

    if (
      (entry.reviewedByUserId && !entry.reviewedAt) ||
      (!entry.reviewedByUserId && entry.reviewedAt)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reviewedAt'],
        message:
          'Knowledge review metadata requires both a reviewer and timestamp.',
      });
    }

    if (
      entry.status === 'approved' &&
      (!entry.reviewedByUserId || !entry.reviewedAt)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reviewedAt'],
        message:
          'Approved reusable knowledge requires a reviewer and timestamp.',
      });
    }
  });

export const methodologyInformationRequirementSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  linkedDomain: z.enum(methodologyLinkedDomains),
  minimumCount: z.number().int().positive().optional(),
});

export const methodologyCompletionRuleSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(methodologyCompletionRuleTypes),
    description: z.string().min(1),
    linkedDomain: z.enum(methodologyLinkedDomains).optional(),
    minimumCount: z.number().int().positive().optional(),
  })
  .superRefine((rule, context) => {
    if (
      rule.type === 'minimum-linked-records' &&
      (!rule.linkedDomain || !rule.minimumCount)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['linkedDomain'],
        message:
          'Minimum linked-record completion rules require a domain and count.',
      });
    }
  });

export const methodologyTemplateSchema = baseEntitySchema.extend({
  name: z.string().min(1),
  description: z.string().min(1),
  engagementType: z.enum(engagementTypes),
  version: z.string().min(1),
  status: z.enum(methodologyTemplateStatuses),
  stageIds: z.array(z.string().min(1)).min(1),
  activityIds: z.array(z.string().min(1)).min(1),
  prompts: z.array(z.string().min(1)),
  requiredInformation: z.array(methodologyInformationRequirementSchema),
  optionalInformation: z.array(methodologyInformationRequirementSchema),
  expectedOutputTypes: z.array(z.enum(outputTypes)),
});

export const methodologyStageSchema = baseEntitySchema.extend({
  templateId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int().positive(),
  completionRules: z.array(methodologyCompletionRuleSchema).min(1),
  activityIds: z.array(z.string().min(1)).min(1),
});

export const methodologyActivitySchema = baseEntitySchema.extend({
  templateId: z.string().min(1),
  stageId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  activityType: z.enum(methodologyActivityTypes),
  requirement: z.enum(methodologyActivityRequirements),
  completionCriteria: z.array(z.string().min(1)).min(1),
  linkedDomain: z.enum(methodologyLinkedDomains),
  prompts: z.array(z.string().min(1)),
  guidance: z.array(z.string().min(1)),
});

export const engagementMethodologyRunSchema = baseEntitySchema
  .extend({
    engagementId: z.string().min(1),
    templateId: z.string().min(1),
    templateVersion: z.string().min(1),
    templateName: z.string().min(1),
    status: z.enum(methodologyRunStatuses),
    startedAt: isoDateTimeSchema,
    currentStageId: z.string().min(1).optional(),
    pausedAt: isoDateTimeSchema.optional(),
    pausedReason: z.string().min(1).optional(),
    completedAt: isoDateTimeSchema.optional(),
    promotedToRunId: z.string().min(1).optional(),
  })
  .superRefine((run, context) => {
    if (run.status === 'paused' && (!run.pausedAt || !run.pausedReason)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pausedReason'],
        message: 'A paused methodology run requires a recorded reason.',
      });
    }
    if (run.status === 'completed' && !run.completedAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['completedAt'],
        message: 'A completed methodology run requires a completion timestamp.',
      });
    }
    if (run.status === 'promoted' && !run.promotedToRunId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['promotedToRunId'],
        message: 'A promoted methodology run requires its successor run.',
      });
    }
  });

export const engagementMethodologyActivitySchema = baseEntitySchema
  .extend({
    engagementId: z.string().min(1),
    runId: z.string().min(1),
    templateActivityId: z.string().min(1),
    stageId: z.string().min(1),
    status: z.enum(methodologyActivityStatuses),
    completedAt: isoDateTimeSchema.optional(),
    completedByUserId: z.string().min(1).optional(),
    completionNote: z.string().min(1).optional(),
    skippedAt: isoDateTimeSchema.optional(),
    skippedByUserId: z.string().min(1).optional(),
    skipReason: z.string().min(1).optional(),
    reopenedAt: isoDateTimeSchema.optional(),
    reopenedByUserId: z.string().min(1).optional(),
    reopenReason: z.string().min(1).optional(),
  })
  .superRefine((activity, context) => {
    if (
      activity.status === 'completed' &&
      (!activity.completedAt || !activity.completedByUserId)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['completedAt'],
        message:
          'A completed methodology activity requires an actor and timestamp.',
      });
    }
    if (
      activity.status === 'skipped' &&
      (!activity.skippedAt || !activity.skippedByUserId || !activity.skipReason)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['skipReason'],
        message:
          'A skipped methodology activity requires an actor, timestamp, and reason.',
      });
    }
    if (
      activity.reopenedAt &&
      (!activity.reopenedByUserId || !activity.reopenReason)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reopenReason'],
        message:
          'A reopened methodology activity requires an actor and reason.',
      });
    }
  });

export const activityEventSchema = baseEntitySchema.extend({
  actorUserId: z.string().min(1),
  occurredAt: isoDateTimeSchema,
  engagementId: z.string().min(1).optional(),
  entityId: z.string().min(1),
  entityType: z.enum(activityEntityTypes),
  action: z.enum(activityActions),
  summary: z.string().min(1),
  metadata: z.record(z.string()),
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
  landscapeVersions: z.array(landscapeVersionSchema).default([]),
  opportunities: z.array(opportunitySchema),
  actionItems: z.array(actionItemSchema),
  initiatives: z.array(initiativeSchema),
  roadmaps: z.array(roadmapSchema).default([]),
  milestones: z.array(milestoneSchema).default([]),
  deliveryActions: z.array(deliveryActionSchema).default([]),
  benefitMeasurements: z.array(benefitMeasurementSchema).default([]),
  outputs: z.array(outputSchema),
  outputReviewComments: z.array(outputReviewCommentSchema).default([]),
  outputExports: z.array(outputExportReferenceSchema).default([]),
  knowledgeEntries: z.array(knowledgeEntrySchema).default([]),
  methodologyTemplates: z.array(methodologyTemplateSchema).default([]),
  methodologyStages: z.array(methodologyStageSchema).default([]),
  methodologyActivities: z.array(methodologyActivitySchema).default([]),
  engagementMethodologyRuns: z
    .array(engagementMethodologyRunSchema)
    .default([]),
  engagementMethodologyActivities: z
    .array(engagementMethodologyActivitySchema)
    .default([]),
  activityEvents: z.array(activityEventSchema).default([]),
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
    const landscapeVersions = new Set(
      dataset.landscapeVersions.map((item) => item.id),
    );
    const opportunities = new Set(dataset.opportunities.map((item) => item.id));
    const actionItems = new Set(dataset.actionItems.map((item) => item.id));
    const initiatives = new Set(dataset.initiatives.map((item) => item.id));
    const outputs = new Set(dataset.outputs.map((item) => item.id));
    const outputReviewComments = new Set(
      dataset.outputReviewComments.map((item) => item.id),
    );
    const outputExports = new Set(dataset.outputExports.map((item) => item.id));
    const knowledgeEntries = new Set(
      dataset.knowledgeEntries.map((item) => item.id),
    );
    const methodologyTemplates = new Set(
      dataset.methodologyTemplates.map((item) => item.id),
    );
    const methodologyStages = new Set(
      dataset.methodologyStages.map((item) => item.id),
    );
    const methodologyActivities = new Set(
      dataset.methodologyActivities.map((item) => item.id),
    );
    const methodologyRuns = new Set(
      dataset.engagementMethodologyRuns.map((item) => item.id),
    );
    const methodologyActivityStates = new Set(
      dataset.engagementMethodologyActivities.map((item) => item.id),
    );
    const activityEntityIds: Record<
      (typeof activityEntityTypes)[number],
      Set<string>
    > = {
      client: clients,
      site: sites,
      engagement: engagements,
      'site-walk': siteWalks,
      observation: observations,
      evidence,
      'friction-item': new Set(dataset.frictionItems.map((item) => item.id)),
      diagnostic: diagnostics,
      assessment: new Set(dataset.maturityAssessments.map((item) => item.id)),
      finding: findings,
      'landscape-entity': landscapeEntities,
      'landscape-relationship': new Set(
        dataset.landscapeRelationships.map((item) => item.id),
      ),
      'landscape-version': landscapeVersions,
      opportunity: opportunities,
      action: actionItems,
      initiative: initiatives,
      roadmap: new Set(dataset.roadmaps.map((item) => item.id)),
      milestone: new Set(dataset.milestones.map((item) => item.id)),
      'delivery-action': new Set(
        dataset.deliveryActions.map((item) => item.id),
      ),
      'benefit-measurement': new Set(
        dataset.benefitMeasurements.map((item) => item.id),
      ),
      output: outputs,
      'output-review-comment': outputReviewComments,
      'output-export': outputExports,
      'knowledge-entry': knowledgeEntries,
      'methodology-run': methodologyRuns,
      'methodology-activity': methodologyActivityStates,
    };

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
      ['landscapeVersions', dataset.landscapeVersions],
      ['opportunities', dataset.opportunities],
      ['actionItems', dataset.actionItems],
      ['initiatives', dataset.initiatives],
      ['roadmaps', dataset.roadmaps],
      ['milestones', dataset.milestones],
      ['deliveryActions', dataset.deliveryActions],
      ['benefitMeasurements', dataset.benefitMeasurements],
      ['outputs', dataset.outputs],
      ['outputReviewComments', dataset.outputReviewComments],
      ['outputExports', dataset.outputExports],
      ['knowledgeEntries', dataset.knowledgeEntries],
      ['methodologyTemplates', dataset.methodologyTemplates],
      ['methodologyStages', dataset.methodologyStages],
      ['methodologyActivities', dataset.methodologyActivities],
      ['engagementMethodologyRuns', dataset.engagementMethodologyRuns],
      [
        'engagementMethodologyActivities',
        dataset.engagementMethodologyActivities,
      ],
      ['activityEvents', dataset.activityEvents],
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
    const frictionItemById = new Map(
      dataset.frictionItems.map((item) => [item.id, item]),
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
    const methodologyTemplateById = new Map(
      dataset.methodologyTemplates.map((item) => [item.id, item]),
    );
    const methodologyStageById = new Map(
      dataset.methodologyStages.map((item) => [item.id, item]),
    );
    const methodologyActivityById = new Map(
      dataset.methodologyActivities.map((item) => [item.id, item]),
    );
    const methodologyRunById = new Map(
      dataset.engagementMethodologyRuns.map((item) => [item.id, item]),
    );
    const landscapeEntityById = new Map(
      dataset.landscapeEntities.map((item) => [item.id, item]),
    );

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

      const frictionItem = frictionItemById.get(entityId);
      if (frictionItem) {
        return (
          siteWalkById.get(frictionItem.siteWalkId)?.engagementId ===
          engagementId
        );
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

    const isApprovedOutputSource = (entityId: string): boolean =>
      isClientSafeOutputSource(dataset, entityId);

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

    dataset.knowledgeEntries.forEach((entry, index) => {
      ensureReference(
        context,
        ['knowledgeEntries', index, 'createdByUserId'],
        entry.createdByUserId,
        users,
        'knowledge author',
      );
      if (entry.reviewedByUserId) {
        ensureReference(
          context,
          ['knowledgeEntries', index, 'reviewedByUserId'],
          entry.reviewedByUserId,
          users,
          'knowledge reviewer',
        );
      }

      ensureDistinctValues(
        context,
        ['knowledgeEntries', index, 'tags', 'areas'],
        entry.tags.areas,
        'knowledge area tags',
      );
      ensureDistinctValues(
        context,
        ['knowledgeEntries', index, 'tags', 'processes'],
        entry.tags.processes,
        'knowledge process tags',
      );
      ensureDistinctValues(
        context,
        ['knowledgeEntries', index, 'tags', 'systems'],
        entry.tags.systems,
        'knowledge system tags',
      );
      ensureDistinctValues(
        context,
        ['knowledgeEntries', index, 'tags', 'issueCategories'],
        entry.tags.issueCategories,
        'knowledge issue category tags',
      );
      ensureDistinctValues(
        context,
        ['knowledgeEntries', index, 'tags', 'evidenceTypes'],
        entry.tags.evidenceTypes,
        'knowledge evidence type tags',
      );
      ensureDistinctValues(
        context,
        ['knowledgeEntries', index, 'tags', 'opportunityTypes'],
        entry.tags.opportunityTypes,
        'knowledge opportunity type tags',
      );
      ensureDistinctValues(
        context,
        ['knowledgeEntries', index, 'tags', 'industries'],
        entry.tags.industries,
        'knowledge industry tags',
      );
      ensureDistinctValues(
        context,
        ['knowledgeEntries', index, 'tags', 'reviewStatuses'],
        entry.tags.reviewStatuses,
        'knowledge review status tags',
      );

      if (
        entry.type === 'anonymised-example' &&
        entry.source !== 'anonymised-client-learning'
      ) {
        addIssue(
          context,
          ['knowledgeEntries', index, 'source'],
          'An anonymised example must be marked as anonymised client learning.',
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

    const landscapeSourceKeys = new Set<string>();
    dataset.landscapeEntities.forEach((entity, index) => {
      ensureReference(
        context,
        ['landscapeEntities', index, 'engagementId'],
        entity.engagementId,
        engagements,
        'engagement',
      );
      ensureReference(
        context,
        ['landscapeEntities', index, 'siteId'],
        entity.siteId,
        sites,
        'site',
      );
      if (!siteBelongsToEngagement(entity.siteId, entity.engagementId)) {
        addIssue(
          context,
          ['landscapeEntities', index, 'siteId'],
          'References a site outside the engagement scope.',
        );
      }
      ensureDistinctValues(
        context,
        ['landscapeEntities', index, 'linkedObservationIds'],
        entity.linkedObservationIds,
        'linked observations',
      );
      ensureDistinctValues(
        context,
        ['landscapeEntities', index, 'linkedEvidenceIds'],
        entity.linkedEvidenceIds,
        'linked evidence',
      );
      ensureDistinctValues(
        context,
        ['landscapeEntities', index, 'linkedFrictionItemIds'],
        entity.linkedFrictionItemIds,
        'linked friction items',
      );
      ensureDistinctValues(
        context,
        ['landscapeEntities', index, 'linkedOpportunityIds'],
        entity.linkedOpportunityIds,
        'linked opportunities',
      );
      ensureReferenceList(
        context,
        ['landscapeEntities', index, 'linkedObservationIds'],
        entity.linkedObservationIds,
        observations,
        'observation',
      );
      ensureReferenceList(
        context,
        ['landscapeEntities', index, 'linkedEvidenceIds'],
        entity.linkedEvidenceIds,
        evidence,
        'evidence',
      );
      ensureReferenceList(
        context,
        ['landscapeEntities', index, 'linkedFrictionItemIds'],
        entity.linkedFrictionItemIds,
        new Set(dataset.frictionItems.map((item) => item.id)),
        'friction item',
      );
      ensureReferenceList(
        context,
        ['landscapeEntities', index, 'linkedOpportunityIds'],
        entity.linkedOpportunityIds,
        opportunities,
        'opportunity',
      );
      (
        [
          ['linkedObservationIds', entity.linkedObservationIds],
          ['linkedEvidenceIds', entity.linkedEvidenceIds],
          ['linkedFrictionItemIds', entity.linkedFrictionItemIds],
          ['linkedOpportunityIds', entity.linkedOpportunityIds],
        ] as const
      ).forEach(([field, referenceIds]) => {
        referenceIds.forEach((referenceId, referenceIndex) => {
          if (!entityBelongsToEngagement(referenceId, entity.engagementId)) {
            addIssue(
              context,
              ['landscapeEntities', index, field, referenceIndex],
              'References material outside the engagement scope.',
            );
          }
        });
      });
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
      if (entity.sourceEntityId) {
        const sourceMatchesEntityType =
          (entity.type === 'area' &&
            areaById.get(entity.sourceEntityId)?.siteId === entity.siteId) ||
          (entity.type === 'process' &&
            processById.get(entity.sourceEntityId)?.siteId === entity.siteId) ||
          (entity.type === 'system' &&
            systemById.get(entity.sourceEntityId)?.siteId === entity.siteId);
        if (!sourceMatchesEntityType) {
          addIssue(
            context,
            ['landscapeEntities', index, 'sourceEntityId'],
            'Must reference a matching area, process, or system at the selected site.',
          );
        }
        const sourceKey = `${entity.engagementId}:${entity.sourceEntityId}`;
        if (landscapeSourceKeys.has(sourceKey)) {
          addIssue(
            context,
            ['landscapeEntities', index, 'sourceEntityId'],
            'A canonical source can only be represented once per engagement landscape.',
          );
        }
        landscapeSourceKeys.add(sourceKey);
      }
      if (entity.ownerEntityId) {
        ensureReference(
          context,
          ['landscapeEntities', index, 'ownerEntityId'],
          entity.ownerEntityId,
          landscapeEntities,
          'landscape owner',
        );
        const owner = landscapeEntityById.get(entity.ownerEntityId);
        if (
          owner &&
          (owner.engagementId !== entity.engagementId || owner.type !== 'role')
        ) {
          addIssue(
            context,
            ['landscapeEntities', index, 'ownerEntityId'],
            'Must reference a role or person group in the same engagement.',
          );
        }
      }
      if (
        entity.visibility === 'approved-client-facing' &&
        entity.reviewStatus !== 'approved'
      ) {
        addIssue(
          context,
          ['landscapeEntities', index, 'visibility'],
          'Client-facing landscape items must be approved.',
        );
      }
    });

    const relationshipKeys = new Set<string>();
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
      ensureDistinctValues(
        context,
        ['landscapeRelationships', index, 'evidenceIds'],
        relationship.evidenceIds,
        'evidence references',
      );
      ensureDistinctValues(
        context,
        ['landscapeRelationships', index, 'linkedObservationIds'],
        relationship.linkedObservationIds,
        'linked observations',
      );
      ensureDistinctValues(
        context,
        ['landscapeRelationships', index, 'linkedOpportunityIds'],
        relationship.linkedOpportunityIds,
        'linked opportunities',
      );
      ensureReferenceList(
        context,
        ['landscapeRelationships', index, 'linkedObservationIds'],
        relationship.linkedObservationIds,
        observations,
        'observation',
      );
      ensureReferenceList(
        context,
        ['landscapeRelationships', index, 'linkedOpportunityIds'],
        relationship.linkedOpportunityIds,
        opportunities,
        'opportunity',
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
      (
        [
          ['linkedObservationIds', relationship.linkedObservationIds],
          ['linkedOpportunityIds', relationship.linkedOpportunityIds],
        ] as const
      ).forEach(([field, referenceIds]) => {
        referenceIds.forEach((id, referenceIndex) => {
          if (!entityBelongsToEngagement(id, relationship.engagementId)) {
            addIssue(
              context,
              ['landscapeRelationships', index, field, referenceIndex],
              'References material outside the engagement scope.',
            );
          }
        });
      });

      const fromEntity = landscapeEntityById.get(relationship.fromEntityId);
      const toEntity = landscapeEntityById.get(relationship.toEntityId);
      if (relationship.fromEntityId === relationship.toEntityId) {
        addIssue(
          context,
          ['landscapeRelationships', index, 'toEntityId'],
          'A landscape relationship cannot point to the same item.',
        );
      }
      if (
        fromEntity &&
        toEntity &&
        !isLandscapeRelationshipCompatible(
          relationship.type,
          fromEntity.type,
          toEntity.type,
        )
      ) {
        addIssue(
          context,
          ['landscapeRelationships', index, 'type'],
          'The relationship type is not compatible with its source and target items.',
        );
      }
      if (
        relationship.transferMode &&
        !canRecordLandscapeTransfer(relationship.type)
      ) {
        addIssue(
          context,
          ['landscapeRelationships', index, 'transferMode'],
          'Transfer mode can only be recorded for information-flow or handoff relationships.',
        );
      }
      if (
        relationship.duplicateDataEntry &&
        !canRecordLandscapeTransfer(relationship.type)
      ) {
        addIssue(
          context,
          ['landscapeRelationships', index, 'duplicateDataEntry'],
          'Duplicate-entry prompts can only be recorded for information-flow or handoff relationships.',
        );
      }
      if (
        relationship.visibility === 'approved-client-facing' &&
        relationship.reviewStatus !== 'approved'
      ) {
        addIssue(
          context,
          ['landscapeRelationships', index, 'visibility'],
          'Client-facing landscape relationships must be approved.',
        );
      }
      if (
        relationship.visibility === 'approved-client-facing' &&
        fromEntity &&
        toEntity &&
        (!isClientSafeLandscapeEntity(fromEntity) ||
          !isClientSafeLandscapeEntity(toEntity))
      ) {
        addIssue(
          context,
          ['landscapeRelationships', index, 'visibility'],
          'Client-facing relationships require approved client-facing source and target items.',
        );
      }

      const relationshipKey = [
        relationship.engagementId,
        relationship.fromEntityId,
        relationship.type,
        relationship.toEntityId,
      ].join(':');
      if (relationshipKeys.has(relationshipKey)) {
        addIssue(
          context,
          ['landscapeRelationships', index, 'type'],
          'Duplicates an existing landscape relationship.',
        );
      }
      relationshipKeys.add(relationshipKey);
    });

    const currentVersionScopes = new Set<string>();
    const versionKeys = new Set<string>();
    dataset.landscapeVersions.forEach((version, index) => {
      ensureReference(
        context,
        ['landscapeVersions', index, 'engagementId'],
        version.engagementId,
        engagements,
        'engagement',
      );
      ensureReference(
        context,
        ['landscapeVersions', index, 'capturedByUserId'],
        version.capturedByUserId,
        users,
        'capturing user',
      );
      if (version.siteId) {
        ensureReference(
          context,
          ['landscapeVersions', index, 'siteId'],
          version.siteId,
          sites,
          'site',
        );
        if (!siteBelongsToEngagement(version.siteId, version.engagementId)) {
          addIssue(
            context,
            ['landscapeVersions', index, 'siteId'],
            'References a site outside the engagement scope.',
          );
        }
      }

      const scopeKey = `${version.engagementId}:${version.siteId ?? 'engagement'}`;
      const versionKey = `${scopeKey}:${version.version}`;
      if (versionKeys.has(versionKey)) {
        addIssue(
          context,
          ['landscapeVersions', index, 'version'],
          'Version identifiers must be unique within the landscape scope.',
        );
      }
      versionKeys.add(versionKey);
      if (version.status === 'current') {
        if (currentVersionScopes.has(scopeKey)) {
          addIssue(
            context,
            ['landscapeVersions', index, 'status'],
            'Only one current landscape version is allowed for this scope.',
          );
        }
        currentVersionScopes.add(scopeKey);
      }

      const snapshotEntityIds = new Set<string>();
      version.entities.forEach((entity, entityIndex) => {
        if (snapshotEntityIds.has(entity.landscapeEntityId)) {
          addIssue(
            context,
            [
              'landscapeVersions',
              index,
              'entities',
              entityIndex,
              'landscapeEntityId',
            ],
            'A landscape snapshot cannot contain the same item twice.',
          );
        }
        snapshotEntityIds.add(entity.landscapeEntityId);
        const currentEntity = landscapeEntityById.get(entity.landscapeEntityId);
        if (
          !currentEntity ||
          currentEntity.engagementId !== version.engagementId
        ) {
          addIssue(
            context,
            [
              'landscapeVersions',
              index,
              'entities',
              entityIndex,
              'landscapeEntityId',
            ],
            'Snapshot items must reference landscape items in the same engagement.',
          );
        }
        if (version.siteId && entity.siteId !== version.siteId) {
          addIssue(
            context,
            ['landscapeVersions', index, 'entities', entityIndex, 'siteId'],
            'Snapshot items must belong to the selected site scope.',
          );
        }
      });

      const snapshotRelationshipIds = new Set<string>();
      version.relationships.forEach((relationship, relationshipIndex) => {
        if (snapshotRelationshipIds.has(relationship.landscapeRelationshipId)) {
          addIssue(
            context,
            [
              'landscapeVersions',
              index,
              'relationships',
              relationshipIndex,
              'landscapeRelationshipId',
            ],
            'A landscape snapshot cannot contain the same relationship twice.',
          );
        }
        snapshotRelationshipIds.add(relationship.landscapeRelationshipId);
        if (!snapshotEntityIds.has(relationship.fromEntityId)) {
          addIssue(
            context,
            [
              'landscapeVersions',
              index,
              'relationships',
              relationshipIndex,
              'fromEntityId',
            ],
            'Snapshot relationships must connect items included in the same snapshot.',
          );
        }
        if (!snapshotEntityIds.has(relationship.toEntityId)) {
          addIssue(
            context,
            [
              'landscapeVersions',
              index,
              'relationships',
              relationshipIndex,
              'toEntityId',
            ],
            'Snapshot relationships must connect items included in the same snapshot.',
          );
        }
        const currentRelationship = dataset.landscapeRelationships.find(
          (item) => item.id === relationship.landscapeRelationshipId,
        );
        if (
          !currentRelationship ||
          currentRelationship.engagementId !== version.engagementId
        ) {
          addIssue(
            context,
            [
              'landscapeVersions',
              index,
              'relationships',
              relationshipIndex,
              'landscapeRelationshipId',
            ],
            'Snapshot relationships must reference relationships in the same engagement.',
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

      if (
        action.visibility === 'approved-client-facing' &&
        (action.reviewStatus !== 'approved' || !action.clientSummary)
      ) {
        addIssue(
          context,
          ['actionItems', index, 'visibility'],
          'Client-facing actions require approved review and a client summary.',
        );
      }

      if (action.visibility === 'approved-client-facing') {
        const parentSourceId = action.opportunityId ?? action.initiativeId;
        if (!parentSourceId || !isApprovedOutputSource(parentSourceId)) {
          addIssue(
            context,
            ['actionItems', index, 'visibility'],
            'Client-facing actions require an approved parent opportunity or initiative.',
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

    dataset.methodologyTemplates.forEach((template, index) => {
      ensureDistinctValues(
        context,
        ['methodologyTemplates', index, 'stageIds'],
        template.stageIds,
        'template stage IDs',
      );
      ensureDistinctValues(
        context,
        ['methodologyTemplates', index, 'activityIds'],
        template.activityIds,
        'template activity IDs',
      );
      ensureDistinctValues(
        context,
        ['methodologyTemplates', index, 'expectedOutputTypes'],
        template.expectedOutputTypes,
        'expected output types',
      );
      ensureDistinctValues(
        context,
        ['methodologyTemplates', index, 'requiredInformation'],
        template.requiredInformation.map((item) => item.id),
        'required information IDs',
      );
      ensureDistinctValues(
        context,
        ['methodologyTemplates', index, 'optionalInformation'],
        template.optionalInformation.map((item) => item.id),
        'optional information IDs',
      );

      template.stageIds.forEach((stageId, stageIndex) => {
        ensureReference(
          context,
          ['methodologyTemplates', index, 'stageIds', stageIndex],
          stageId,
          methodologyStages,
          'methodology stage',
        );
        if (methodologyStageById.get(stageId)?.templateId !== template.id) {
          addIssue(
            context,
            ['methodologyTemplates', index, 'stageIds', stageIndex],
            'References a stage from another methodology template.',
          );
        }
      });
      template.activityIds.forEach((activityId, activityIndex) => {
        ensureReference(
          context,
          ['methodologyTemplates', index, 'activityIds', activityIndex],
          activityId,
          methodologyActivities,
          'methodology activity',
        );
        if (
          methodologyActivityById.get(activityId)?.templateId !== template.id
        ) {
          addIssue(
            context,
            ['methodologyTemplates', index, 'activityIds', activityIndex],
            'References an activity from another methodology template.',
          );
        }
      });
    });

    dataset.methodologyStages.forEach((stage, index) => {
      ensureReference(
        context,
        ['methodologyStages', index, 'templateId'],
        stage.templateId,
        methodologyTemplates,
        'methodology template',
      );
      ensureDistinctValues(
        context,
        ['methodologyStages', index, 'activityIds'],
        stage.activityIds,
        'stage activity IDs',
      );
      if (
        !methodologyTemplateById
          .get(stage.templateId)
          ?.stageIds.includes(stage.id)
      ) {
        addIssue(
          context,
          ['methodologyStages', index, 'id'],
          'Must be listed by its methodology template.',
        );
      }
      stage.activityIds.forEach((activityId, activityIndex) => {
        ensureReference(
          context,
          ['methodologyStages', index, 'activityIds', activityIndex],
          activityId,
          methodologyActivities,
          'methodology activity',
        );
        const activity = methodologyActivityById.get(activityId);
        if (
          activity &&
          (activity.stageId !== stage.id ||
            activity.templateId !== stage.templateId)
        ) {
          addIssue(
            context,
            ['methodologyStages', index, 'activityIds', activityIndex],
            'References an activity outside this stage or template.',
          );
        }
      });
    });

    dataset.methodologyActivities.forEach((activity, index) => {
      ensureReference(
        context,
        ['methodologyActivities', index, 'templateId'],
        activity.templateId,
        methodologyTemplates,
        'methodology template',
      );
      ensureReference(
        context,
        ['methodologyActivities', index, 'stageId'],
        activity.stageId,
        methodologyStages,
        'methodology stage',
      );
      const stage = methodologyStageById.get(activity.stageId);
      const template = methodologyTemplateById.get(activity.templateId);
      if (stage && stage.templateId !== activity.templateId) {
        addIssue(
          context,
          ['methodologyActivities', index, 'stageId'],
          'References a stage from another methodology template.',
        );
      }
      if (template && !template.activityIds.includes(activity.id)) {
        addIssue(
          context,
          ['methodologyActivities', index, 'id'],
          'Must be listed by its methodology template.',
        );
      }
      if (stage && !stage.activityIds.includes(activity.id)) {
        addIssue(
          context,
          ['methodologyActivities', index, 'id'],
          'Must be listed by its methodology stage.',
        );
      }
    });

    const activeMethodologyRunByEngagement = new Map<string, string>();
    dataset.engagementMethodologyRuns.forEach((run, index) => {
      ensureReference(
        context,
        ['engagementMethodologyRuns', index, 'engagementId'],
        run.engagementId,
        engagements,
        'engagement',
      );
      ensureReference(
        context,
        ['engagementMethodologyRuns', index, 'templateId'],
        run.templateId,
        methodologyTemplates,
        'methodology template',
      );
      const template = methodologyTemplateById.get(run.templateId);
      const engagement = engagementById.get(run.engagementId);
      if (
        template &&
        (template.version !== run.templateVersion ||
          template.name !== run.templateName)
      ) {
        addIssue(
          context,
          ['engagementMethodologyRuns', index, 'templateVersion'],
          'Must retain the template version and name assigned to the engagement.',
        );
      }
      if (
        template &&
        engagement &&
        run.status !== 'promoted' &&
        template.engagementType !== engagement.type
      ) {
        addIssue(
          context,
          ['engagementMethodologyRuns', index, 'templateId'],
          'An active methodology run must match the engagement type.',
        );
      }
      if (run.currentStageId) {
        ensureReference(
          context,
          ['engagementMethodologyRuns', index, 'currentStageId'],
          run.currentStageId,
          methodologyStages,
          'methodology stage',
        );
        if (
          methodologyStageById.get(run.currentStageId)?.templateId !==
          run.templateId
        ) {
          addIssue(
            context,
            ['engagementMethodologyRuns', index, 'currentStageId'],
            'References a stage from another methodology template.',
          );
        }
      }
      if (run.promotedToRunId) {
        ensureReference(
          context,
          ['engagementMethodologyRuns', index, 'promotedToRunId'],
          run.promotedToRunId,
          methodologyRuns,
          'successor methodology run',
        );
        if (
          methodologyRunById.get(run.promotedToRunId)?.engagementId !==
          run.engagementId
        ) {
          addIssue(
            context,
            ['engagementMethodologyRuns', index, 'promotedToRunId'],
            'References a methodology run from another engagement.',
          );
        }
        const successorRun = methodologyRunById.get(run.promotedToRunId);
        const successorTemplate = successorRun
          ? methodologyTemplateById.get(successorRun.templateId)
          : undefined;
        if (
          run.status === 'promoted' &&
          successorTemplate?.engagementType !== 'Digital Diagnostic'
        ) {
          addIssue(
            context,
            ['engagementMethodologyRuns', index, 'promotedToRunId'],
            'A preliminary site-walk promotion must create a Digital Diagnostic run.',
          );
        }
      }
      if (run.status === 'promoted') {
        if (template?.engagementType !== 'Preliminary Site Walk') {
          addIssue(
            context,
            ['engagementMethodologyRuns', index, 'templateId'],
            'Only a Preliminary Site Walk methodology run can be promoted.',
          );
        }
        if (run.currentStageId) {
          addIssue(
            context,
            ['engagementMethodologyRuns', index, 'currentStageId'],
            'A promoted methodology run cannot retain an active stage.',
          );
        }
      } else if (run.promotedToRunId) {
        addIssue(
          context,
          ['engagementMethodologyRuns', index, 'promotedToRunId'],
          'Only a promoted methodology run can reference a successor.',
        );
      }
      if (run.status === 'active' || run.status === 'paused') {
        const existingRunId = activeMethodologyRunByEngagement.get(
          run.engagementId,
        );
        if (existingRunId) {
          addIssue(
            context,
            ['engagementMethodologyRuns', index, 'engagementId'],
            'An engagement can only have one active or paused methodology run.',
          );
        } else {
          activeMethodologyRunByEngagement.set(run.engagementId, run.id);
        }
      }
    });

    const activityStateKeys = new Set<string>();
    dataset.engagementMethodologyActivities.forEach((activity, index) => {
      ensureReference(
        context,
        ['engagementMethodologyActivities', index, 'engagementId'],
        activity.engagementId,
        engagements,
        'engagement',
      );
      ensureReference(
        context,
        ['engagementMethodologyActivities', index, 'runId'],
        activity.runId,
        methodologyRuns,
        'methodology run',
      );
      ensureReference(
        context,
        ['engagementMethodologyActivities', index, 'templateActivityId'],
        activity.templateActivityId,
        methodologyActivities,
        'template activity',
      );
      ensureReference(
        context,
        ['engagementMethodologyActivities', index, 'stageId'],
        activity.stageId,
        methodologyStages,
        'methodology stage',
      );
      const run = methodologyRunById.get(activity.runId);
      const templateActivity = methodologyActivityById.get(
        activity.templateActivityId,
      );
      if (run && run.engagementId !== activity.engagementId) {
        addIssue(
          context,
          ['engagementMethodologyActivities', index, 'engagementId'],
          'Must match the engagement of its methodology run.',
        );
      }
      if (
        templateActivity &&
        (templateActivity.stageId !== activity.stageId ||
          templateActivity.templateId !== run?.templateId)
      ) {
        addIssue(
          context,
          ['engagementMethodologyActivities', index, 'templateActivityId'],
          'Must match the template and stage of its methodology run.',
        );
      }
      if (
        templateActivity?.requirement === 'required' &&
        activity.status === 'skipped'
      ) {
        addIssue(
          context,
          ['engagementMethodologyActivities', index, 'status'],
          'Required methodology activities cannot be skipped.',
        );
      }
      if (activity.completedByUserId) {
        ensureReference(
          context,
          ['engagementMethodologyActivities', index, 'completedByUserId'],
          activity.completedByUserId,
          users,
          'completing user',
        );
      }
      if (activity.skippedByUserId) {
        ensureReference(
          context,
          ['engagementMethodologyActivities', index, 'skippedByUserId'],
          activity.skippedByUserId,
          users,
          'skipping user',
        );
      }
      if (activity.reopenedByUserId) {
        ensureReference(
          context,
          ['engagementMethodologyActivities', index, 'reopenedByUserId'],
          activity.reopenedByUserId,
          users,
          'reopening user',
        );
      }
      const activityStateKey = `${activity.runId}:${activity.templateActivityId}`;
      if (activityStateKeys.has(activityStateKey)) {
        addIssue(
          context,
          ['engagementMethodologyActivities', index, 'templateActivityId'],
          'An activity can only have one state in a methodology run.',
        );
      } else {
        activityStateKeys.add(activityStateKey);
      }
    });

    dataset.engagementMethodologyRuns.forEach((run, index) => {
      const template = methodologyTemplateById.get(run.templateId);
      if (!template) {
        return;
      }
      template.activityIds.forEach((activityId, activityIndex) => {
        if (!activityStateKeys.has(`${run.id}:${activityId}`)) {
          addIssue(
            context,
            ['engagementMethodologyRuns', index, 'templateId', activityIndex],
            'Must create a state for each activity in the assigned template.',
          );
        }
      });
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

      if (output.supersedesOutputId) {
        ensureReference(
          context,
          ['outputs', index, 'supersedesOutputId'],
          output.supersedesOutputId,
          outputs,
          'previous output version',
        );
        const previousOutput = outputById.get(output.supersedesOutputId);
        if (
          previousOutput &&
          (previousOutput.engagementId !== output.engagementId ||
            previousOutput.outputType !== output.outputType)
        ) {
          addIssue(
            context,
            ['outputs', index, 'supersedesOutputId'],
            'A new output version must supersede the same output type in the same engagement.',
          );
        }

        const visitedOutputIds = new Set<string>([output.id]);
        let predecessorId: string | undefined = output.supersedesOutputId;
        while (predecessorId) {
          if (visitedOutputIds.has(predecessorId)) {
            addIssue(
              context,
              ['outputs', index, 'supersedesOutputId'],
              'Output versions cannot form a revision cycle.',
            );
            break;
          }
          visitedOutputIds.add(predecessorId);
          predecessorId = outputById.get(predecessorId)?.supersedesOutputId;
        }
      }

      if (
        (output.status === 'approved' || output.status === 'published') &&
        dataset.outputReviewComments.some(
          (comment) =>
            comment.outputId === output.id && comment.status === 'open',
        )
      ) {
        addIssue(
          context,
          ['outputs', index, 'status'],
          'Resolve all output review comments before approving the report.',
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

      output.sectionOverrides.forEach((override, overrideIndex) => {
        ensureDistinctValues(
          context,
          [
            'outputs',
            index,
            'sectionOverrides',
            overrideIndex,
            'sourceReferences',
          ],
          override.sourceReferences,
          'editorial narrative source references',
        );

        override.sourceReferences.forEach((referenceId, referenceIndex) => {
          if (!entityBelongsToEngagement(referenceId, output.engagementId)) {
            addIssue(
              context,
              [
                'outputs',
                index,
                'sectionOverrides',
                overrideIndex,
                'sourceReferences',
                referenceIndex,
              ],
              'An editorial narrative cannot cite source material outside the engagement scope.',
            );
          }

          if (!output.sourceReferences.includes(referenceId)) {
            addIssue(
              context,
              [
                'outputs',
                index,
                'sectionOverrides',
                overrideIndex,
                'sourceReferences',
                referenceIndex,
              ],
              'An editorial narrative can only cite an explicitly selected output source.',
            );
          }

          if (
            (output.status === 'approved' || output.status === 'published') &&
            !isApprovedOutputSource(referenceId)
          ) {
            addIssue(
              context,
              [
                'outputs',
                index,
                'sectionOverrides',
                overrideIndex,
                'sourceReferences',
                referenceIndex,
              ],
              'Approved outputs require every editorial narrative to cite approved, client-safe source material.',
            );
          }
        });

        if (
          (output.status === 'approved' || output.status === 'published') &&
          output.reportSnapshot &&
          !override.sourceReferences.every((sourceId) =>
            output.reportSnapshot?.sections
              .find((section) => section.id === override.sectionId)
              ?.sourceReferences.includes(sourceId),
          )
        ) {
          addIssue(
            context,
            [
              'outputs',
              index,
              'reportSnapshot',
              'sections',
              override.sectionId,
              'sourceReferences',
            ],
            'An approved report snapshot must retain the source citation for each editorial narrative.',
          );
        }
      });

      if (output.reportSnapshot) {
        if (
          output.reportSnapshot.context.engagementId !== output.engagementId
        ) {
          addIssue(
            context,
            ['outputs', index, 'reportSnapshot', 'context', 'engagementId'],
            'The report snapshot context must match the output engagement.',
          );
        }
        ensureDistinctValues(
          context,
          ['outputs', index, 'reportSnapshot', 'includedSources'],
          output.reportSnapshot.includedSources.map((source) => source.id),
          'included report source references',
        );
        ensureDistinctValues(
          context,
          ['outputs', index, 'reportSnapshot', 'excludedSources'],
          output.reportSnapshot.excludedSources.map(
            (source) => source.sourceId,
          ),
          'excluded report source references',
        );
        output.reportSnapshot.includedSources.forEach((source, sourceIndex) => {
          if (!output.sourceReferences.includes(source.id)) {
            addIssue(
              context,
              [
                'outputs',
                index,
                'reportSnapshot',
                'includedSources',
                sourceIndex,
                'id',
              ],
              'A report snapshot can only include an explicitly selected output source.',
            );
          }
        });
        output.reportSnapshot.excludedSources.forEach((source, sourceIndex) => {
          if (!output.sourceReferences.includes(source.sourceId)) {
            addIssue(
              context,
              [
                'outputs',
                index,
                'reportSnapshot',
                'excludedSources',
                sourceIndex,
                'sourceId',
              ],
              'A report snapshot exclusion must refer to an explicitly selected output source.',
            );
          }
        });
        output.reportSnapshot.sections.forEach((section, sectionIndex) => {
          section.blocks.forEach((block, blockIndex) => {
            if (
              block.type === 'table' &&
              block.rows.some((row) => row.length !== block.columns.length)
            ) {
              addIssue(
                context,
                [
                  'outputs',
                  index,
                  'reportSnapshot',
                  'sections',
                  sectionIndex,
                  'blocks',
                  blockIndex,
                  'rows',
                ],
                'Each report table row must contain a value for every column.',
              );
            }
          });
          ensureDistinctValues(
            context,
            [
              'outputs',
              index,
              'reportSnapshot',
              'sections',
              sectionIndex,
              'sourceReferences',
            ],
            section.sourceReferences,
            'report section source references',
          );
          section.sourceReferences.forEach((sourceId, sourceIndex) => {
            if (
              !output.reportSnapshot?.includedSources.some(
                (source) => source.id === sourceId,
              )
            ) {
              addIssue(
                context,
                [
                  'outputs',
                  index,
                  'reportSnapshot',
                  'sections',
                  sectionIndex,
                  'sourceReferences',
                  sourceIndex,
                ],
                'A report section can only cite an included client-safe source.',
              );
            }
          });
        });
      }
    });

    dataset.outputReviewComments.forEach((comment, index) => {
      ensureReference(
        context,
        ['outputReviewComments', index, 'outputId'],
        comment.outputId,
        outputs,
        'output',
      );
      ensureReference(
        context,
        ['outputReviewComments', index, 'authorUserId'],
        comment.authorUserId,
        users,
        'comment author',
      );
      if (comment.resolvedByUserId) {
        ensureReference(
          context,
          ['outputReviewComments', index, 'resolvedByUserId'],
          comment.resolvedByUserId,
          users,
          'resolving user',
        );
      }
    });

    dataset.outputExports.forEach((exportReference, index) => {
      ensureReference(
        context,
        ['outputExports', index, 'outputId'],
        exportReference.outputId,
        outputs,
        'output',
      );
      ensureReference(
        context,
        ['outputExports', index, 'exportedByUserId'],
        exportReference.exportedByUserId,
        users,
        'exporting user',
      );

      const output = outputById.get(exportReference.outputId);
      if (output && exportReference.outputVersion !== output.version) {
        addIssue(
          context,
          ['outputExports', index, 'outputVersion'],
          'An export reference must retain the version of its output.',
        );
      }
      if (
        output &&
        exportReference.audience === 'client-facing' &&
        output.status !== 'approved' &&
        output.status !== 'published'
      ) {
        addIssue(
          context,
          ['outputExports', index, 'audience'],
          'Client-facing report exports require an approved or published output.',
        );
      }
      if (
        output &&
        exportReference.audience === 'client-facing' &&
        output.visibility !== 'approved-client-facing'
      ) {
        addIssue(
          context,
          ['outputExports', index, 'audience'],
          'Client-facing report exports require approved client-facing visibility.',
        );
      }
      if (output && output.status === 'archived') {
        addIssue(
          context,
          ['outputExports', index, 'outputId'],
          'Archived outputs cannot retain new report export references.',
        );
      }
      if (!output?.reportSnapshot) {
        addIssue(
          context,
          ['outputExports', index, 'sourceFingerprint'],
          'An output export reference requires a frozen report snapshot.',
        );
      } else if (
        exportReference.sourceFingerprint !==
        output.reportSnapshot.sourceFingerprint
      ) {
        addIssue(
          context,
          ['outputExports', index, 'sourceFingerprint'],
          'An export reference must retain the source fingerprint of its report snapshot.',
        );
      }
      if (
        output?.reportSnapshot &&
        exportReference.contentFingerprint !==
          output.reportSnapshot.contentFingerprint
      ) {
        addIssue(
          context,
          ['outputExports', index, 'contentFingerprint'],
          'An export reference must retain the complete content fingerprint of its report snapshot.',
        );
      }
    });

    dataset.activityEvents.forEach((activityEvent, index) => {
      ensureReference(
        context,
        ['activityEvents', index, 'actorUserId'],
        activityEvent.actorUserId,
        users,
        'activity actor',
      );

      if (activityEvent.engagementId) {
        ensureReference(
          context,
          ['activityEvents', index, 'engagementId'],
          activityEvent.engagementId,
          engagements,
          'engagement',
        );
      }

      ensureReference(
        context,
        ['activityEvents', index, 'entityId'],
        activityEvent.entityId,
        activityEntityIds[activityEvent.entityType],
        activityEvent.entityType,
      );
    });
  },
);
