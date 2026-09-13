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
  effortLevels,
  engagementStatuses,
  evidenceKinds,
  informationOrigins,
  initiativeStatuses,
  observationAssuranceLevels,
  observationSources,
  observationStatuses,
  observationTypes,
  opportunityPriorities,
  opportunityStatuses,
  opportunityTypes,
  outputKinds,
  outputStates,
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

export const opportunitySchema = baseEntitySchema.extend({
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
  initiativeIds: z.array(z.string().min(1)),
});

export const actionItemSchema = baseEntitySchema.extend({
  initiativeId: z.string().min(1).optional(),
  opportunityId: z.string().min(1).optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(actionStatuses),
  ownerUserId: z.string().min(1).optional(),
  dueDate: isoDateTimeSchema.optional(),
});

export const initiativeSchema = baseEntitySchema.extend({
  engagementId: z.string().min(1),
  opportunityIds: z.array(z.string().min(1)).min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  status: z.enum(initiativeStatuses),
  ownerUserId: z.string().min(1),
  targetWindow: z.string().min(1),
  expectedBenefits: z.string().min(1),
  actualBenefits: z.string().min(1).optional(),
  actionIds: z.array(z.string().min(1)),
});

export const outputSchema = baseEntitySchema.extend({
  engagementId: z.string().min(1),
  kind: z.enum(outputKinds),
  title: z.string().min(1),
  state: z.enum(outputStates),
  visibility: z.enum(visibilityScopes),
  approvedEntityIds: z.array(z.string().min(1)),
  lastPublishedAt: isoDateTimeSchema.optional(),
});

export const fabricDatasetSchema = z.object({
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
  opportunities: z.array(opportunitySchema),
  actionItems: z.array(actionItemSchema),
  initiatives: z.array(initiativeSchema),
  outputs: z.array(outputSchema),
});