export type EntityId = string;
export type IsoDateTimeString = string;

export const transformationStages = ['discover', 'diagnose', 'design', 'deliver', 'measure'] as const;
export type TransformationStage = (typeof transformationStages)[number];

export const userRoles = [
  'administrator',
  'consultant',
  'project-lead',
  'analyst',
  'technical-delivery',
  'management',
  'client-user',
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

export const engagementStatuses = ['planned', 'active', 'at-risk', 'completed'] as const;
export type EngagementStatus = (typeof engagementStatuses)[number];

export const siteWalkStatuses = ['planned', 'in-progress', 'completed', 'needs-follow-up', 'cancelled'] as const;
export type SiteWalkStatus = (typeof siteWalkStatuses)[number];

export const informationOrigins = ['consultant', 'client', 'imported', 'ai'] as const;
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

export const observationStatuses = ['draft', 'needs-review', 'verified', 'disputed'] as const;
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

export const evidenceReviewStatuses = ['draft', 'needs-review', 'verified', 'rejected'] as const;
export type EvidenceReviewStatus = (typeof evidenceReviewStatuses)[number];

export const frictionCategories = ['Time', 'Quality', 'Cost', 'Flow', 'Data', 'People', 'Technology', 'Other'] as const;
export type FrictionCategory = (typeof frictionCategories)[number];

export const observationAssuranceLevels = [
  'observed-fact',
  'client-provided',
  'interpreted',
  'assumption',
] as const;
export type ObservationAssuranceLevel = (typeof observationAssuranceLevels)[number];

export const evidenceKinds = [
  'photo',
  'interview-note',
  'observation-note',
  'system-export',
  'document',
] as const;
export type EvidenceKind = (typeof evidenceKinds)[number];

export const visibilityScopes = ['internal', 'client-shareable'] as const;
export type VisibilityScope = (typeof visibilityScopes)[number];

export const approvalStates = ['draft', 'internal-review', 'approved', 'rejected'] as const;
export type ApprovalState = (typeof approvalStates)[number];

export const aiStatuses = ['not-applicable', 'suggested', 'reviewed', 'approved', 'rejected'] as const;
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

export const opportunityPriorities = ['critical', 'high', 'medium', 'low'] as const;
export type OpportunityPriority = (typeof opportunityPriorities)[number];

export const opportunityStatuses = ['identified', 'triaged', 'approved', 'in-delivery', 'closed'] as const;
export type OpportunityStatus = (typeof opportunityStatuses)[number];

export const effortLevels = ['low', 'medium', 'high'] as const;
export type EffortLevel = (typeof effortLevels)[number];

export const confidenceLevels = ['low', 'medium', 'high'] as const;
export type ConfidenceLevel = (typeof confidenceLevels)[number];

export const initiativeStatuses = ['planned', 'active', 'completed'] as const;
export type InitiativeStatus = (typeof initiativeStatuses)[number];

export const actionStatuses = ['open', 'in-progress', 'blocked', 'completed'] as const;
export type ActionStatus = (typeof actionStatuses)[number];

export const outputStates = ['draft', 'internal-review', 'approved', 'shared'] as const;
export type OutputState = (typeof outputStates)[number];

export const outputKinds = [
  'executive-summary',
  'landscape-map',
  'maturity-scorecard',
  'opportunity-register',
  'roadmap',
  'site-walk-summary',
  'diagnostic-report',
] as const;
export type OutputKind = (typeof outputKinds)[number];

export const relatedEntityTypes = ['site-walk', 'observation', 'opportunity', 'output'] as const;
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
  type: string;
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

export interface Opportunity extends BaseEntity {
  engagementId: EntityId;
  processId?: EntityId;
  areaId?: EntityId;
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
  initiativeIds: EntityId[];
}

export interface ActionItem extends BaseEntity {
  initiativeId?: EntityId;
  opportunityId?: EntityId;
  title: string;
  description: string;
  status: ActionStatus;
  ownerUserId?: EntityId;
  dueDate?: IsoDateTimeString;
}

export interface Initiative extends BaseEntity {
  engagementId: EntityId;
  opportunityIds: EntityId[];
  title: string;
  summary: string;
  status: InitiativeStatus;
  ownerUserId: EntityId;
  targetWindow: string;
  expectedBenefits: string;
  actualBenefits?: string;
  actionIds: EntityId[];
}

export interface Output extends BaseEntity {
  engagementId: EntityId;
  kind: OutputKind;
  title: string;
  state: OutputState;
  visibility: VisibilityScope;
  approvedEntityIds: EntityId[];
  lastPublishedAt?: IsoDateTimeString;
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
  opportunities: Opportunity[];
  actionItems: ActionItem[];
  initiatives: Initiative[];
  outputs: Output[];
}

export interface RepositorySource {
  kind: 'development-fixtures' | 'database' | 'api';
  label: string;
}