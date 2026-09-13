export type EntityId = string;
export type IsoDateTimeString = string;

export const transformationStages = [
  'discover',
  'diagnose',
  'design',
  'deliver',
  'measure',
] as const;
export type TransformationStage = (typeof transformationStages)[number];

export const userRoles = [
  'administrator',
  'engagement-lead',
  'consultant',
  'analyst',
  'reviewer',
  'read-only',
] as const;
export type UserRole = (typeof userRoles)[number];

export const clientStatuses = ['prospect', 'active', 'dormant'] as const;
export type ClientStatus = (typeof clientStatuses)[number];

export const siteStatuses = ['planned', 'active', 'inactive'] as const;
export type SiteStatus = (typeof siteStatuses)[number];

export const engagementTypes = [
  'Preliminary Site Walk',
  'Digital Diagnostic',
  'Operational Improvement',
  'Systems / ERP Review',
  'Data / Reporting Improvement',
  'Automation Sprint',
  'Transformation Programme',
  'Advisory / Discovery',
] as const;
export type EngagementType = (typeof engagementTypes)[number];

export const engagementStatuses = [
  'planned',
  'active',
  'at-risk',
  'paused',
  'completed',
] as const;
export type EngagementStatus = (typeof engagementStatuses)[number];

export const siteWalkStatuses = [
  'planned',
  'in-progress',
  'completed',
  'needs-follow-up',
  'cancelled',
] as const;
export type SiteWalkStatus = (typeof siteWalkStatuses)[number];

export const informationOrigins = [
  'consultant',
  'client',
  'imported',
  'ai',
] as const;
export type InformationOrigin = (typeof informationOrigins)[number];

export const siteWalkTypes = [
  'Preliminary Site Walk',
  'Diagnostic Site Walk',
  'Follow-up Investigation',
  'Validation Visit',
  'Implementation Review',
] as const;
export type SiteWalkType = (typeof siteWalkTypes)[number];

export const observationTypes = [
  'Process',
  'People',
  'Technology',
  'Data',
  'Quality',
  'Productivity',
  'Planning',
  'Maintenance',
  'Logistics',
  'Commercial',
  'Other',
] as const;
export type ObservationType = (typeof observationTypes)[number];

export const observationSources = [
  'Directly observed',
  'Reported by client',
  'Document / system review',
  'Consultant interpretation',
  'Assumption',
  'AI suggestion',
] as const;
export type ObservationSource = (typeof observationSources)[number];

export const observationStatuses = [
  'draft',
  'needs-review',
  'verified',
  'disputed',
] as const;
export type ObservationStatus = (typeof observationStatuses)[number];

export const evidenceTypes = [
  'Photograph',
  'Document',
  'Interview Note',
  'Voice Note',
  'Data Extract',
  'Screenshot',
  'Consultant Note',
  'Other',
] as const;
export type EvidenceType = (typeof evidenceTypes)[number];

export const evidenceReviewStatuses = [
  'draft',
  'needs-review',
  'verified',
  'rejected',
] as const;
export type EvidenceReviewStatus = (typeof evidenceReviewStatuses)[number];

export const frictionCategories = [
  'Time',
  'Quality',
  'Cost',
  'Flow',
  'Data',
  'People',
  'Technology',
  'Other',
] as const;
export type FrictionCategory = (typeof frictionCategories)[number];

export const diagnosticStatuses = [
  'draft',
  'in-progress',
  'internal-review',
  'completed',
] as const;
export type DiagnosticStatus = (typeof diagnosticStatuses)[number];
export const reviewStatuses = ['draft', 'reviewed', 'approved'] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];
export const maturityLevels = [
  'Reactive',
  'Developing',
  'Controlled',
  'Integrated',
  'Optimised',
] as const;
export type MaturityLevel = (typeof maturityLevels)[number];
export const landscapeEntityTypes = [
  'area',
  'process',
  'process-step',
  'system',
  'data-object',
  'role',
  'machine',
  'handoff',
] as const;
export type LandscapeEntityType = (typeof landscapeEntityTypes)[number];
export const landscapeRelationshipTypes = [
  'contains-process',
  'contains-process-step',
  'uses-system',
  'produces-data',
  'consumes-data',
  'exchanges-data',
  'performs-process',
  'produces-machine-data',
  'depends-on-process',
  'has-handoff',
  'hands-off-to-process',
  'observation-relates',
  'opportunity-improves',
] as const;
export type LandscapeRelationshipType =
  (typeof landscapeRelationshipTypes)[number];

export const landscapeVerificationStates = [
  'confirmed',
  'reported',
  'assumed',
  'to-be-validated',
] as const;
export type LandscapeVerificationState =
  (typeof landscapeVerificationStates)[number];

export const landscapeTransferModes = ['manual', 'automated'] as const;
export type LandscapeTransferMode = (typeof landscapeTransferModes)[number];

export const landscapeVersionStatuses = ['current', 'superseded'] as const;
export type LandscapeVersionStatus = (typeof landscapeVersionStatuses)[number];

export const observationAssuranceLevels = [
  'observed-fact',
  'client-provided',
  'interpreted',
  'assumption',
] as const;
export type ObservationAssuranceLevel =
  (typeof observationAssuranceLevels)[number];

export const evidenceKinds = [
  'photo',
  'interview-note',
  'observation-note',
  'system-export',
  'document',
] as const;
export type EvidenceKind = (typeof evidenceKinds)[number];

export const visibilityScopes = [
  'internal',
  'draft-client-facing',
  'approved-client-facing',
  'archived',
] as const;
export type VisibilityScope = (typeof visibilityScopes)[number];

export const approvalStates = [
  'draft',
  'internal-review',
  'approved',
  'rejected',
] as const;
export type ApprovalState = (typeof approvalStates)[number];

export const aiStatuses = [
  'not-applicable',
  'suggested',
  'reviewed',
  'approved',
  'rejected',
] as const;
export type AiStatus = (typeof aiStatuses)[number];

export const opportunityTypes = [
  'eliminate',
  'simplify',
  'standardise',
  'automate',
  'integrate',
  'improve-visibility',
  'transform',
] as const;
export type OpportunityType = (typeof opportunityTypes)[number];
export const opportunityPriorityCategories = [
  'Quick Win',
  'Strategic Project',
  'Foundational Improvement',
  'Incremental Improvement',
  'Reconsider / Defer',
] as const;
export type OpportunityPriorityCategory =
  (typeof opportunityPriorityCategories)[number];
export const investmentBands = ['£', '££', '£££', 'Unknown'] as const;
export type InvestmentBand = (typeof investmentBands)[number];
export const benefitMeasures = [
  'Administrative time',
  'Reporting delay',
  'Estimated annual saving',
  'Capacity',
  'Scrap / rework',
  'Quality',
  'Delivery',
  'Other',
] as const;
export type BenefitMeasure = (typeof benefitMeasures)[number];
export const benefitValidationStatuses = [
  'indicative',
  'to-validate',
  'validated',
] as const;
export type BenefitValidationStatus =
  (typeof benefitValidationStatuses)[number];

export const opportunityPriorities = [
  'critical',
  'high',
  'medium',
  'low',
] as const;
export type OpportunityPriority = (typeof opportunityPriorities)[number];

export const opportunityStatuses = [
  'identified',
  'triaged',
  'approved',
  'in-delivery',
  'closed',
] as const;
export type OpportunityStatus = (typeof opportunityStatuses)[number];

export const effortLevels = ['low', 'medium', 'high'] as const;
export type EffortLevel = (typeof effortLevels)[number];

export const confidenceLevels = ['low', 'medium', 'high'] as const;
export type ConfidenceLevel = (typeof confidenceLevels)[number];

export const knowledgeEntryTypes = [
  'diagnostic-prompt',
  'manufacturing-pattern',
  'opportunity-pattern',
  'implementation-consideration',
  'methodology-guidance',
  'checklist',
  'anonymised-example',
  'lesson-learned',
] as const;
export type KnowledgeEntryType = (typeof knowledgeEntryTypes)[number];

export const knowledgeEntryStatuses = [
  'draft',
  'internal-review',
  'approved',
  'retired',
] as const;
export type KnowledgeEntryStatus = (typeof knowledgeEntryStatuses)[number];

export const knowledgeSources = [
  'trion-methodology',
  'curated-practice',
  'anonymised-client-learning',
  'delivery-learning',
] as const;
export type KnowledgeSource = (typeof knowledgeSources)[number];

export const knowledgeAreaTags = [
  'production',
  'quality',
  'planning',
  'engineering',
  'maintenance',
  'logistics',
  'warehouse',
  'commercial',
  'cross-functional',
] as const;
export type KnowledgeAreaTag = (typeof knowledgeAreaTags)[number];

export const knowledgeProcessTags = [
  'material-receipt',
  'production-control',
  'shift-handover',
  'quality-management',
  'maintenance-management',
  'planning-and-scheduling',
  'inventory-and-dispatch',
  'continuous-improvement',
] as const;
export type KnowledgeProcessTag = (typeof knowledgeProcessTags)[number];

export const knowledgeSystemTags = [
  'erp',
  'mes',
  'qms',
  'cmms',
  'spreadsheet',
  'shopfloor-data-capture',
  'reporting-and-bi',
  'document-management',
  'integration',
] as const;
export type KnowledgeSystemTag = (typeof knowledgeSystemTags)[number];

export const knowledgeIndustryTags = [
  'aerospace-and-defence',
  'automotive',
  'food-and-beverage',
  'industrial-manufacturing',
  'machining-and-fabrication',
  'pharmaceutical-and-life-sciences',
  'consumer-products',
  'cross-industry',
] as const;
export type KnowledgeIndustryTag = (typeof knowledgeIndustryTags)[number];

export const roadmapPhases = [
  'Simplify',
  'Connect',
  'Optimise',
  'Scale',
] as const;
export type RoadmapPhase = (typeof roadmapPhases)[number];
export const deliveryStatuses = [
  'proposed',
  'approved',
  'planned',
  'in-progress',
  'blocked',
  'complete',
  'cancelled',
] as const;
export type DeliveryStatus = (typeof deliveryStatuses)[number];
export const benefitStatuses = [
  'planned',
  'measuring',
  'validated',
  'not-realised',
] as const;
export type BenefitStatus = (typeof benefitStatuses)[number];
export const milestoneStatuses = [
  'planned',
  'in-progress',
  'complete',
  'blocked',
] as const;
export type MilestoneStatus = (typeof milestoneStatuses)[number];

export const actionStatuses = [
  'open',
  'in-progress',
  'blocked',
  'completed',
] as const;
export type ActionStatus = (typeof actionStatuses)[number];

export const outputTypes = [
  'executive-summary',
  'maturity-scorecard',
  'landscape-map',
  'opportunity-action-register',
  'transformation-roadmap',
  'site-walk-summary',
  'supporting-analysis',
  'progress-report',
  'benefits-report',
] as const;
export type OutputType = (typeof outputTypes)[number];
export const outputStatuses = [
  'draft',
  'internal-review',
  'approved',
  'published',
  'archived',
] as const;
export type OutputStatus = (typeof outputStatuses)[number];

export const methodologyTemplateStatuses = [
  'draft',
  'active',
  'retired',
] as const;
export type MethodologyTemplateStatus =
  (typeof methodologyTemplateStatuses)[number];

export const methodologyRunStatuses = [
  'active',
  'paused',
  'completed',
  'promoted',
] as const;
export type MethodologyRunStatus = (typeof methodologyRunStatuses)[number];

export const methodologyActivityRequirements = [
  'required',
  'optional',
] as const;
export type MethodologyActivityRequirement =
  (typeof methodologyActivityRequirements)[number];

export const methodologyActivityStatuses = [
  'not-started',
  'in-progress',
  'completed',
  'skipped',
] as const;
export type MethodologyActivityStatus =
  (typeof methodologyActivityStatuses)[number];

export const methodologyActivityTypes = [
  'context',
  'fieldwork',
  'mapping',
  'evidence',
  'assessment',
  'analysis',
  'prioritisation',
  'output',
  'decision',
] as const;
export type MethodologyActivityType = (typeof methodologyActivityTypes)[number];

export const methodologyLinkedDomains = [
  'engagement',
  'site',
  'area',
  'process',
  'system',
  'data-object',
  'role',
  'site-walk',
  'observation',
  'evidence',
  'friction-item',
  'diagnostic',
  'assessment',
  'finding',
  'opportunity',
  'initiative',
  'output',
  'action',
] as const;
export type MethodologyLinkedDomain = (typeof methodologyLinkedDomains)[number];

export const methodologyCompletionRuleTypes = [
  'all-required-activities',
  'minimum-linked-records',
] as const;
export type MethodologyCompletionRuleType =
  (typeof methodologyCompletionRuleTypes)[number];

export const activityActions = [
  'created',
  'updated',
  'assigned',
  'status-changed',
  'completed',
  'skipped',
  'reopened',
  'paused',
  'resumed',
  'submitted-for-review',
  'approved',
  'published',
  'archived',
  'converted-from-preliminary-site-walk-to-diagnostic',
] as const;
export type ActivityAction = (typeof activityActions)[number];

export const activityEntityTypes = [
  'client',
  'site',
  'engagement',
  'site-walk',
  'observation',
  'evidence',
  'friction-item',
  'diagnostic',
  'assessment',
  'finding',
  'landscape-entity',
  'landscape-relationship',
  'landscape-version',
  'opportunity',
  'action',
  'initiative',
  'roadmap',
  'milestone',
  'delivery-action',
  'benefit-measurement',
  'output',
  'knowledge-entry',
  'methodology-run',
  'methodology-activity',
] as const;
export type ActivityEntityType = (typeof activityEntityTypes)[number];

export const relatedEntityTypes = [
  'engagement',
  'site-walk',
  'observation',
  'opportunity',
  'output',
] as const;
export type RelatedEntityType = (typeof relatedEntityTypes)[number];

export interface BaseEntity {
  id: EntityId;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface User extends BaseEntity {
  displayName: string;
  role: UserRole;
  email: string;
}

export interface Client extends BaseEntity {
  name: string;
  slug: string;
  industry: string;
  companySize?: string;
  description?: string;
  status: ClientStatus;
  primaryContact?: string;
  contactDetails?: string;
  notes?: string;
}

export interface Site extends BaseEntity {
  clientId: EntityId;
  name: string;
  location: string;
  description: string;
  operationalProfile: string;
  siteType?: string;
  workforce?: string;
  shifts?: string;
  status?: SiteStatus;
  internalNotes?: string;
  areaIds: EntityId[];
  systemIds: EntityId[];
}

export interface Area extends BaseEntity {
  siteId: EntityId;
  name: string;
  description: string;
}

export interface Process extends BaseEntity {
  siteId: EntityId;
  areaId: EntityId;
  name: string;
  description: string;
  relatedSystemIds: EntityId[];
}

export interface OperationalSystem extends BaseEntity {
  siteId: EntityId;
  name: string;
  category: string;
  description: string;
  ownerTeam: string;
}

export interface Engagement extends BaseEntity {
  clientId: EntityId;
  siteIds: EntityId[];
  name: string;
  description: string;
  type: EngagementType;
  objectives?: string;
  scope?: string;
  commercialContext?: string;
  internalNotes?: string;
  status: EngagementStatus;
  stage: TransformationStage;
  startDate: IsoDateTimeString;
  targetDate?: IsoDateTimeString;
  leadUserId: EntityId;
  teamUserIds: EntityId[];
}

export interface SiteWalk extends BaseEntity {
  engagementId: EntityId;
  siteId: EntityId;
  areaId?: EntityId;
  processId?: EntityId;
  title: string;
  scheduledAt: IsoDateTimeString;
  consultantUserId: EntityId;
  walkType: string;
  plannedScope: string[];
  completedScope: string[];
  status: SiteWalkStatus;
  followUpActionIds: EntityId[];
  date?: string;
  startTime?: string;
  endTime?: string;
  leadConsultantId?: EntityId;
  participantUserIds?: EntityId[];
  participants?: string;
  objectives?: string;
  businessContext?: string;
  focusAreas?: string[];
  areasCovered?: EntityId[];
  processesCovered?: EntityId[];
  overallProcessSummary?: string;
  candidateBottleneck?: string;
  agreedNextStep?: string;
  internalNotes?: string;
  briefingChecklist?: Record<string, boolean>;
  postTourNotes?: string;
  validationNotes?: string;
  confirmedBottleneck?: string;
  correctedMisunderstandings?: string;
  immediateOpportunities?: string;
  recommendDiagnostic?: boolean;
  followUpOwnerId?: EntityId;
  followUpDate?: string;
}

export interface Observation extends BaseEntity {
  siteWalkId: EntityId;
  processId?: EntityId;
  summary: string;
  detail: string;
  observedAt: IsoDateTimeString;
  origin: InformationOrigin;
  assurance: ObservationAssuranceLevel;
  visibility: VisibilityScope;
  aiStatus: AiStatus;
  evidenceIds: EntityId[];
  title?: string;
  description?: string;
  observationType?: ObservationType;
  areaId?: EntityId;
  systemId?: EntityId;
  stationOrLine?: string;
  source?: ObservationSource;
  confidence?: ConfidenceLevel;
  status?: ObservationStatus;
  recordedByUserId?: EntityId;
  internalNotes?: string;
}

export interface Evidence extends BaseEntity {
  relatedEntityId: EntityId;
  relatedEntityType: RelatedEntityType;
  kind: EvidenceKind;
  title: string;
  summary: string;
  capturedAt: IsoDateTimeString;
  origin: InformationOrigin;
  visibility: VisibilityScope;
  approvalState: ApprovalState;
  observationId?: EntityId;
  siteWalkId?: EntityId;
  evidenceType?: EvidenceType;
  description?: string;
  fileReference?: string;
  source?: ObservationSource;
  capturedByUserId?: EntityId;
  reviewStatus?: EvidenceReviewStatus;
}

export interface FrictionItem extends BaseEntity {
  siteWalkId: EntityId;
  stationOrLine: string;
  frictionPoint: string;
  category: FrictionCategory;
  estimatedTimeLost?: string;
  frequency?: string;
  peopleOrShiftsAffected?: string;
  estimatedAnnualHours?: number;
  estimatedAnnualCostImpact?: string;
  confidence: ConfidenceLevel;
  evidenceReference?: string;
  assumptions?: string;
  notes?: string;
}

export interface DiagnosticDimension extends BaseEntity {
  key: string;
  name: string;
  version: string;
  description: string;
  criteria: string[];
  anchors: Record<string, string>;
}

export interface Diagnostic extends BaseEntity {
  engagementId: EntityId;
  title: string;
  description: string;
  status: DiagnosticStatus;
  startDate: IsoDateTimeString;
  completionDate?: IsoDateTimeString;
  assessorUserId: EntityId;
  currentStage: TransformationStage;
  scope: string;
  methodologyVersion: string;
  overallScore?: number;
  overallLevel?: MaturityLevel;
  overallConfidence?: ConfidenceLevel;
  internalNotes?: string;
}

export interface MaturityAssessment extends BaseEntity {
  diagnosticId: EntityId;
  dimensionId: EntityId;
  score?: number;
  level?: MaturityLevel;
  rationale?: string;
  currentState?: string;
  desiredState?: string;
  gap?: string;
  relatedObservationIds: EntityId[];
  evidenceReferences: string[];
  relatedOpportunityIds: EntityId[];
  confidence: ConfidenceLevel;
  reviewStatus: ReviewStatus;
  assessedByUserId?: EntityId;
  assessedAt?: IsoDateTimeString;
}

export interface Finding extends BaseEntity {
  diagnosticId: EntityId;
  title: string;
  currentSituation: string;
  whyItMatters: string;
  recommendedDirection: string;
  category: string;
  significance: OpportunityPriority;
  relatedObservationIds: EntityId[];
  relatedEvidenceIds: EntityId[];
  relatedOpportunityIds: EntityId[];
  confidence: ConfidenceLevel;
  reviewStatus: ReviewStatus;
  internalNotes?: string;
  clientSummary?: string;
}

export interface LandscapeEntity extends BaseEntity {
  engagementId: EntityId;
  siteId: EntityId;
  type: LandscapeEntityType;
  name: string;
  description: string;
  sourceEntityId?: EntityId;
  ownerRole?: string;
  ownerEntityId?: EntityId;
  documentedMethod?: string;
  confidence: ConfidenceLevel;
  verificationStatus: LandscapeVerificationState;
  linkedObservationIds: EntityId[];
  linkedEvidenceIds: EntityId[];
  linkedFrictionItemIds: EntityId[];
  linkedOpportunityIds: EntityId[];
  internalNotes?: string;
  visibility: VisibilityScope;
  reviewStatus: ReviewStatus;
}

export interface LandscapeRelationship extends BaseEntity {
  engagementId: EntityId;
  fromEntityId: EntityId;
  toEntityId: EntityId;
  type: LandscapeRelationshipType;
  rationale?: string;
  evidenceIds: EntityId[];
  linkedObservationIds: EntityId[];
  linkedOpportunityIds: EntityId[];
  transferMode?: LandscapeTransferMode;
  duplicateDataEntry?: boolean;
  confidence: ConfidenceLevel;
  verificationStatus: LandscapeVerificationState;
  internalNotes?: string;
  visibility: VisibilityScope;
  reviewStatus: ReviewStatus;
}

export interface LandscapeEntitySnapshot {
  landscapeEntityId: EntityId;
  siteId: EntityId;
  type: LandscapeEntityType;
  name: string;
  description: string;
  sourceEntityId?: EntityId;
  ownerRole?: string;
  ownerEntityId?: EntityId;
  documentedMethod?: string;
  confidence: ConfidenceLevel;
  verificationStatus: LandscapeVerificationState;
  linkedObservationIds: EntityId[];
  linkedEvidenceIds: EntityId[];
  linkedFrictionItemIds: EntityId[];
  linkedOpportunityIds: EntityId[];
  visibility: VisibilityScope;
  reviewStatus: ReviewStatus;
}

export interface LandscapeRelationshipSnapshot {
  landscapeRelationshipId: EntityId;
  fromEntityId: EntityId;
  toEntityId: EntityId;
  type: LandscapeRelationshipType;
  rationale?: string;
  evidenceIds: EntityId[];
  linkedObservationIds: EntityId[];
  linkedOpportunityIds: EntityId[];
  transferMode?: LandscapeTransferMode;
  duplicateDataEntry?: boolean;
  confidence: ConfidenceLevel;
  verificationStatus: LandscapeVerificationState;
  visibility: VisibilityScope;
  reviewStatus: ReviewStatus;
}

export interface LandscapeVersion extends BaseEntity {
  engagementId: EntityId;
  siteId?: EntityId;
  title: string;
  version: string;
  status: LandscapeVersionStatus;
  capturedAt: IsoDateTimeString;
  capturedByUserId: EntityId;
  notes?: string;
  entities: LandscapeEntitySnapshot[];
  relationships: LandscapeRelationshipSnapshot[];
}

export interface Opportunity extends BaseEntity {
  engagementId: EntityId;
  diagnosticId?: EntityId;
  processId?: EntityId;
  areaId?: EntityId;
  systemId?: EntityId;
  title: string;
  description: string;
  problemStatement: string;
  rootCause: string;
  type: OpportunityType;
  expectedImpact: string;
  estimatedValueRange?: string;
  estimatedEffort: EffortLevel;
  confidence: ConfidenceLevel;
  priority: OpportunityPriority;
  status: OpportunityStatus;
  ownerUserId?: EntityId;
  evidenceIds: EntityId[];
  internalNotes?: string;
  clientSummary?: string;
  approvalState: ApprovalState;
  visibility: VisibilityScope;
  currentSituation?: string;
  identifiedIssue?: string;
  whyItMatters?: string;
  recommendedImprovement?: string;
  potentialBenefits?: string;
  indicativeValue?: string;
  valueAssumptions?: string;
  businessImpact?: OpportunityPriority;
  implementationEffort?: EffortLevel;
  investment?: InvestmentBand;
  strategicValue?: OpportunityPriority;
  priorityCategory?: OpportunityPriorityCategory;
  recommendedTiming?: string;
  dependencies?: string;
  suggestedNextStep?: string;
  relatedObservationIds?: EntityId[];
  relatedFindingIds?: EntityId[];
  owner?: string;
  reviewStatus?: ReviewStatus;
  benefitMeasures?: BenefitMeasureRecord[];
}

export interface BenefitMeasureRecord extends BaseEntity {
  opportunityId: EntityId;
  measure: BenefitMeasure;
  currentState: string;
  potentialState: string;
  unit: string;
  calculationOrAssumption: string;
  confidence: ConfidenceLevel;
  validationStatus: BenefitValidationStatus;
}

export interface ActionItem extends BaseEntity {
  initiativeId?: EntityId;
  opportunityId?: EntityId;
  title: string;
  description: string;
  status: ActionStatus;
  ownerUserId?: EntityId;
  dueDate?: IsoDateTimeString;
  priority?: OpportunityPriority;
  dependencies?: string;
  notes?: string;
  owner?: string;
}

export interface Initiative extends BaseEntity {
  engagementId: EntityId;
  opportunityId: EntityId;
  title: string;
  description: string;
  objective: string;
  phase: RoadmapPhase;
  status: DeliveryStatus;
  ownerUserId: EntityId;
  startDate?: IsoDateTimeString;
  targetEndDate?: IsoDateTimeString;
  priority: OpportunityPriority;
  estimatedCost?: string;
  expectedBenefit: string;
  benefitType?: string;
  confidence: ConfidenceLevel;
  scope?: string;
  dependencies?: string;
  prerequisites?: string;
  risks?: string;
  internalNotes?: string;
  clientSummary?: string;
  reviewStatus: ReviewStatus;
}

export interface Roadmap extends BaseEntity {
  engagementId: EntityId;
  diagnosticId?: EntityId;
  title: string;
  description: string;
  status: DeliveryStatus;
  phases: RoadmapPhase[];
  initiativeIds: EntityId[];
  assumptions?: string;
  dependencies?: string;
  sequencingRationale: string;
  internalNotes?: string;
  reviewStatus: ReviewStatus;
}

export interface Milestone extends BaseEntity {
  initiativeId: EntityId;
  title: string;
  description: string;
  dueDate: IsoDateTimeString;
  status: MilestoneStatus;
  owner: string;
}

export interface DeliveryAction extends BaseEntity {
  initiativeId: EntityId;
  title: string;
  description: string;
  owner: string;
  status: ActionStatus;
  dueDate?: IsoDateTimeString;
  dependencyIds: EntityId[];
  notes?: string;
}

export interface BenefitMeasurement extends BaseEntity {
  initiativeId: EntityId;
  benefitType: string;
  measure: string;
  baseline: string;
  target: string;
  expectedValue: string;
  actualValue?: string;
  unit: string;
  measurementMethod: string;
  measurementOwner: string;
  measurementDate?: IsoDateTimeString;
  confidence: ConfidenceLevel;
  status: BenefitStatus;
  notes?: string;
}

export interface Output extends BaseEntity {
  engagementId: EntityId;
  outputType: OutputType;
  title: string;
  status: OutputStatus;
  visibility: VisibilityScope;
  version: string;
  createdByUserId: EntityId;
  approvedByUserId?: EntityId;
  approvedAt?: IsoDateTimeString;
  publishedAt?: IsoDateTimeString;
  sourceReferences: EntityId[];
  contentReference?: string;
  internalNotes?: string;
}

export interface KnowledgeTags {
  areas: KnowledgeAreaTag[];
  processes: KnowledgeProcessTag[];
  systems: KnowledgeSystemTag[];
  issueCategories: FrictionCategory[];
  evidenceTypes: EvidenceType[];
  opportunityTypes: OpportunityType[];
  industries: KnowledgeIndustryTag[];
  confidence?: ConfidenceLevel;
  reviewStatuses: ReviewStatus[];
}

export interface KnowledgeEntry extends BaseEntity {
  type: KnowledgeEntryType;
  title: string;
  summary: string;
  content: string;
  source: KnowledgeSource;
  status: KnowledgeEntryStatus;
  visibility: 'internal';
  tags: KnowledgeTags;
  methodologyStage?: TransformationStage;
  createdByUserId: EntityId;
  reviewedByUserId?: EntityId;
  reviewedAt?: IsoDateTimeString;
}

export interface MethodologyInformationRequirement {
  id: string;
  label: string;
  description: string;
  linkedDomain: MethodologyLinkedDomain;
  minimumCount?: number;
}

export interface MethodologyCompletionRule {
  id: string;
  type: MethodologyCompletionRuleType;
  description: string;
  linkedDomain?: MethodologyLinkedDomain;
  minimumCount?: number;
}

export interface MethodologyTemplate extends BaseEntity {
  name: string;
  description: string;
  engagementType: EngagementType;
  version: string;
  status: MethodologyTemplateStatus;
  stageIds: EntityId[];
  activityIds: EntityId[];
  prompts: string[];
  requiredInformation: MethodologyInformationRequirement[];
  optionalInformation: MethodologyInformationRequirement[];
  expectedOutputTypes: OutputType[];
}

export interface MethodologyStage extends BaseEntity {
  templateId: EntityId;
  name: string;
  description: string;
  order: number;
  completionRules: MethodologyCompletionRule[];
  activityIds: EntityId[];
}

export interface MethodologyActivity extends BaseEntity {
  templateId: EntityId;
  stageId: EntityId;
  name: string;
  description: string;
  activityType: MethodologyActivityType;
  requirement: MethodologyActivityRequirement;
  completionCriteria: string[];
  linkedDomain: MethodologyLinkedDomain;
  prompts: string[];
  guidance: string[];
}

export interface EngagementMethodologyRun extends BaseEntity {
  engagementId: EntityId;
  templateId: EntityId;
  templateVersion: string;
  templateName: string;
  status: MethodologyRunStatus;
  startedAt: IsoDateTimeString;
  currentStageId?: EntityId;
  pausedAt?: IsoDateTimeString;
  pausedReason?: string;
  completedAt?: IsoDateTimeString;
  promotedToRunId?: EntityId;
}

export interface EngagementMethodologyActivity extends BaseEntity {
  engagementId: EntityId;
  runId: EntityId;
  templateActivityId: EntityId;
  stageId: EntityId;
  status: MethodologyActivityStatus;
  completedAt?: IsoDateTimeString;
  completedByUserId?: EntityId;
  completionNote?: string;
  skippedAt?: IsoDateTimeString;
  skippedByUserId?: EntityId;
  skipReason?: string;
  reopenedAt?: IsoDateTimeString;
  reopenedByUserId?: EntityId;
  reopenReason?: string;
}

export interface ActivityEvent extends BaseEntity {
  actorUserId: EntityId;
  occurredAt: IsoDateTimeString;
  engagementId?: EntityId;
  entityId: EntityId;
  entityType: ActivityEntityType;
  action: ActivityAction;
  summary: string;
  metadata: Record<string, string>;
}

export interface FabricDataset {
  users: User[];
  clients: Client[];
  sites: Site[];
  areas: Area[];
  processes: Process[];
  systems: OperationalSystem[];
  engagements: Engagement[];
  siteWalks: SiteWalk[];
  observations: Observation[];
  evidence: Evidence[];
  frictionItems: FrictionItem[];
  diagnosticDimensions: DiagnosticDimension[];
  diagnostics: Diagnostic[];
  maturityAssessments: MaturityAssessment[];
  findings: Finding[];
  landscapeEntities: LandscapeEntity[];
  landscapeRelationships: LandscapeRelationship[];
  landscapeVersions: LandscapeVersion[];
  opportunities: Opportunity[];
  actionItems: ActionItem[];
  initiatives: Initiative[];
  roadmaps: Roadmap[];
  milestones: Milestone[];
  deliveryActions: DeliveryAction[];
  benefitMeasurements: BenefitMeasurement[];
  outputs: Output[];
  knowledgeEntries: KnowledgeEntry[];
  methodologyTemplates: MethodologyTemplate[];
  methodologyStages: MethodologyStage[];
  methodologyActivities: MethodologyActivity[];
  engagementMethodologyRuns: EngagementMethodologyRun[];
  engagementMethodologyActivities: EngagementMethodologyActivity[];
  activityEvents: ActivityEvent[];
}

export interface RepositorySource {
  kind: 'development-fixtures' | 'database' | 'api';
  label: string;
}
