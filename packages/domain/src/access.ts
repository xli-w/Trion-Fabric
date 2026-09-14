import type {
  Engagement,
  EntityId,
  KnowledgeEntry,
  MaturityAssessment,
  Opportunity,
  Output,
  User,
  VisibilityScope,
} from './model';

export const workspacePermissions = [
  'context:write',
  'methodology:write',
  'fieldwork:write',
  'diagnostic:write',
  'diagnostic:approve',
  'opportunity:write',
  'delivery:write',
  'output:write',
  'output:submit-for-review',
  'output:approve',
  'output:publish',
  'output:archive',
  'output:comment',
  'output:export',
  'visibility:prepare-client-facing',
  'visibility:approve-client-facing',
  'visibility:archive',
  'knowledge:write',
  'knowledge:approve',
] as const;

export type WorkspacePermission = (typeof workspacePermissions)[number];

export interface PermissionContext {
  engagement?: Pick<Engagement, 'leadUserId' | 'teamUserIds'>;
}

const engagementScopedPermissions = new Set<WorkspacePermission>([
  'context:write',
  'methodology:write',
  'fieldwork:write',
  'diagnostic:write',
  'diagnostic:approve',
  'opportunity:write',
  'delivery:write',
  'output:write',
  'output:submit-for-review',
  'output:publish',
  'output:archive',
  'output:comment',
  'output:export',
  'visibility:prepare-client-facing',
  'visibility:archive',
]);

const controlledOutputStatusTransitions: Record<
  Output['status'],
  Output['status'][]
> = {
  draft: ['draft', 'internal-review', 'archived'],
  'internal-review': ['draft', 'internal-review', 'approved', 'archived'],
  approved: ['internal-review', 'approved', 'published', 'archived'],
  published: ['published', 'archived'],
  archived: ['archived'],
};

const outputContentFields: Array<keyof Output> = [
  'engagementId',
  'outputType',
  'title',
  'version',
  'sectionOverrides',
  'reportSnapshot',
  'createdByUserId',
  'sourceReferences',
  'contentReference',
  'internalNotes',
];

const outputInvariantFields: Array<keyof Output> = [
  'engagementId',
  'outputType',
  'templateVersion',
  'createdByUserId',
  'createdAt',
  'supersedesOutputId',
];

const opportunityContentFields: Array<keyof Opportunity> = [
  'engagementId',
  'diagnosticId',
  'processId',
  'areaId',
  'systemId',
  'title',
  'description',
  'problemStatement',
  'rootCause',
  'type',
  'expectedImpact',
  'estimatedValueRange',
  'estimatedEffort',
  'confidence',
  'priority',
  'ownerUserId',
  'evidenceIds',
  'clientSummary',
  'currentSituation',
  'identifiedIssue',
  'whyItMatters',
  'recommendedImprovement',
  'potentialBenefits',
  'indicativeValue',
  'valueAssumptions',
  'businessImpact',
  'implementationEffort',
  'investment',
  'strategicValue',
  'priorityCategory',
  'recommendedTiming',
  'dependencies',
  'suggestedNextStep',
  'relatedObservationIds',
  'relatedFindingIds',
  'benefitMeasures',
];

const maturityAssessmentContentFields: Array<keyof MaturityAssessment> = [
  'diagnosticId',
  'dimensionId',
  'score',
  'targetScore',
  'level',
  'rationale',
  'targetRationale',
  'currentState',
  'desiredState',
  'gap',
  'relatedObservationIds',
  'evidenceReferences',
  'relatedOpportunityIds',
  'confidence',
];

const knowledgeContentFields: Array<
  keyof Pick<
    KnowledgeEntry,
    | 'type'
    | 'title'
    | 'summary'
    | 'content'
    | 'source'
    | 'tags'
    | 'methodologyStage'
  >
> = [
  'type',
  'title',
  'summary',
  'content',
  'source',
  'tags',
  'methodologyStage',
];

function outputContentChanged(existing: Output, candidate: Output) {
  return outputContentFields.some(
    (field) =>
      JSON.stringify(existing[field]) !== JSON.stringify(candidate[field]),
  );
}

function outputContextChanged(existing: Output, candidate: Output) {
  return outputInvariantFields.some(
    (field) =>
      JSON.stringify(existing[field]) !== JSON.stringify(candidate[field]),
  );
}

function opportunityContentChanged(
  existing: Opportunity,
  candidate: Opportunity,
) {
  return opportunityContentFields.some(
    (field) =>
      JSON.stringify(existing[field]) !== JSON.stringify(candidate[field]),
  );
}

function maturityAssessmentContentChanged(
  existing: MaturityAssessment,
  candidate: MaturityAssessment,
) {
  return maturityAssessmentContentFields.some(
    (field) =>
      JSON.stringify(existing[field]) !== JSON.stringify(candidate[field]),
  );
}

function knowledgeContentChanged(
  existing: KnowledgeEntry,
  candidate: KnowledgeEntry,
) {
  return knowledgeContentFields.some(
    (field) =>
      JSON.stringify(existing[field]) !== JSON.stringify(candidate[field]),
  );
}

function hasApprovedOpportunityContent(opportunity: Opportunity) {
  return (
    opportunity.approvalState === 'approved' &&
    opportunity.reviewStatus === 'approved'
  );
}

export function submitOpportunityForReview(
  opportunity: Opportunity,
): Opportunity {
  if (
    opportunity.visibility !== 'internal' ||
    opportunity.approvalState !== 'draft' ||
    opportunity.reviewStatus !== 'draft'
  ) {
    throw new Error(
      'Only an internal draft opportunity can be submitted for review.',
    );
  }

  return {
    ...opportunity,
    status: 'triaged',
    approvalState: 'internal-review',
    reviewStatus: 'reviewed',
  };
}

export function returnOpportunityToDraft(
  opportunity: Opportunity,
): Opportunity {
  if (opportunity.approvalState !== 'internal-review') {
    throw new Error(
      'Only an opportunity in internal review can be returned to draft.',
    );
  }

  return {
    ...opportunity,
    status: 'identified',
    approvalState: 'draft',
    reviewStatus: 'draft',
    visibility: 'internal',
  };
}

export function approveOpportunityForClientUse(
  opportunity: Opportunity,
): Opportunity {
  if (
    opportunity.approvalState !== 'internal-review' ||
    opportunity.reviewStatus !== 'reviewed' ||
    opportunity.visibility !== 'internal'
  ) {
    throw new Error(
      'Only reviewed internal opportunity content can be approved for client use.',
    );
  }

  return {
    ...opportunity,
    status: 'approved',
    approvalState: 'approved',
    reviewStatus: 'approved',
    visibility: 'approved-client-facing',
  };
}

export function isOpportunityReadyForDelivery(opportunity: Opportunity) {
  return (
    (opportunity.status === 'approved' ||
      opportunity.status === 'in-delivery' ||
      opportunity.status === 'closed') &&
    opportunity.approvalState === 'approved' &&
    opportunity.reviewStatus === 'approved' &&
    opportunity.visibility === 'approved-client-facing' &&
    (opportunity.evidenceIds.length > 0 ||
      (opportunity.relatedObservationIds?.length ?? 0) > 0 ||
      (opportunity.relatedFindingIds?.length ?? 0) > 0) &&
    Boolean(opportunity.clientSummary)
  );
}

function isAssignedToEngagement(
  userId: EntityId,
  engagement: Pick<Engagement, 'leadUserId' | 'teamUserIds'>,
) {
  return (
    engagement.leadUserId === userId || engagement.teamUserIds.includes(userId)
  );
}

export function canUserAccessEngagement(
  user: Pick<User, 'id' | 'role'>,
  engagement: Pick<Engagement, 'leadUserId' | 'teamUserIds'>,
) {
  if (
    user.role === 'administrator' ||
    user.role === 'analyst' ||
    user.role === 'reviewer'
  ) {
    return true;
  }

  return isAssignedToEngagement(user.id, engagement);
}

export function canUserPerform(
  user: Pick<User, 'id' | 'role'>,
  permission: WorkspacePermission,
  context: PermissionContext = {},
) {
  if (user.role === 'administrator') {
    return true;
  }

  if (user.role === 'engagement-lead') {
    if (permission === 'knowledge:write') {
      return true;
    }

    if (
      permission === 'output:approve' ||
      permission === 'diagnostic:approve' ||
      permission === 'visibility:approve-client-facing' ||
      permission === 'knowledge:approve'
    ) {
      return false;
    }

    return (
      !context.engagement ||
      !engagementScopedPermissions.has(permission) ||
      isAssignedToEngagement(user.id, context.engagement)
    );
  }

  if (user.role === 'consultant') {
    return (
      permission === 'fieldwork:write' ||
      permission === 'methodology:write' ||
      permission === 'output:comment'
    );
  }

  if (user.role === 'analyst') {
    return (
      permission === 'diagnostic:write' ||
      permission === 'methodology:write' ||
      permission === 'opportunity:write' ||
      permission === 'output:write' ||
      permission === 'output:submit-for-review' ||
      permission === 'output:comment' ||
      permission === 'output:export' ||
      permission === 'visibility:prepare-client-facing' ||
      permission === 'knowledge:write'
    );
  }

  if (user.role === 'reviewer') {
    return (
      permission === 'diagnostic:approve' ||
      permission === 'output:approve' ||
      permission === 'output:comment' ||
      permission === 'output:export' ||
      permission === 'visibility:approve-client-facing' ||
      permission === 'knowledge:approve'
    );
  }

  return false;
}

export function prepareControlledMaturityAssessmentUpdate(
  existing: MaturityAssessment,
  candidate: MaturityAssessment,
): MaturityAssessment {
  if (
    existing.id !== candidate.id ||
    existing.createdAt !== candidate.createdAt ||
    existing.diagnosticId !== candidate.diagnosticId ||
    existing.dimensionId !== candidate.dimensionId
  ) {
    throw new Error(
      'A maturity assessment cannot change its identity, diagnostic, or dimension.',
    );
  }

  const contentChanged = maturityAssessmentContentChanged(existing, candidate);
  const isApproval =
    existing.reviewStatus !== 'approved' &&
    candidate.reviewStatus === 'approved';

  if (isApproval) {
    if (existing.reviewStatus !== 'reviewed') {
      throw new Error('Only a reviewed maturity assessment can be approved.');
    }
    if (contentChanged) {
      throw new Error(
        'Save maturity assessment revisions before approving the reviewed content.',
      );
    }
    return candidate;
  }

  if (existing.reviewStatus === 'approved' && contentChanged) {
    return {
      ...candidate,
      reviewStatus: 'draft',
    };
  }

  if (
    existing.reviewStatus === 'reviewed' &&
    contentChanged &&
    candidate.reviewStatus !== 'draft'
  ) {
    throw new Error(
      'Return the maturity assessment to draft before revising reviewed content.',
    );
  }

  return candidate;
}

export function prepareKnowledgeEntryUpdate(
  existing: KnowledgeEntry,
  candidate: KnowledgeEntry,
  actorUserId: EntityId,
  occurredAt: string,
): KnowledgeEntry {
  if (
    existing.id !== candidate.id ||
    existing.createdAt !== candidate.createdAt
  ) {
    throw new Error(
      'A knowledge entry cannot change its identity or creation timestamp.',
    );
  }
  if (existing.createdByUserId !== candidate.createdByUserId) {
    throw new Error('A knowledge entry cannot change its recorded author.');
  }

  if (candidate.visibility !== 'internal') {
    throw new Error('Reusable knowledge must remain internal to Trion.');
  }

  const contentChanged = knowledgeContentChanged(existing, candidate);

  if (existing.status === 'retired' && candidate.status !== 'draft') {
    throw new Error(
      'Retired knowledge must be restored to a draft before it can be revised.',
    );
  }

  if (
    existing.status === 'internal-review' &&
    contentChanged &&
    candidate.status !== 'draft'
  ) {
    throw new Error(
      'Return knowledge to draft before revising material under internal review.',
    );
  }

  if (candidate.status === 'approved' && existing.status !== 'approved') {
    if (existing.status !== 'internal-review') {
      throw new Error(
        'Only knowledge in internal review can be approved for reuse.',
      );
    }
    if (contentChanged) {
      throw new Error(
        'Approval can only confirm the version of knowledge that was reviewed.',
      );
    }

    return {
      ...existing,
      status: 'approved',
      visibility: 'internal',
      reviewedByUserId: actorUserId,
      reviewedAt: occurredAt,
    };
  }

  if (existing.status === 'approved' && contentChanged) {
    return {
      ...candidate,
      status: 'draft',
      visibility: 'internal',
      reviewedByUserId: undefined,
      reviewedAt: undefined,
    };
  }

  if (candidate.status === 'draft' || candidate.status === 'internal-review') {
    return {
      ...candidate,
      visibility: 'internal',
      reviewedByUserId: undefined,
      reviewedAt: undefined,
    };
  }

  if (candidate.status === 'retired') {
    return {
      ...candidate,
      visibility: 'internal',
      reviewedByUserId: existing.reviewedByUserId,
      reviewedAt: existing.reviewedAt,
    };
  }

  return {
    ...candidate,
    visibility: 'internal',
    reviewedByUserId: existing.reviewedByUserId,
    reviewedAt: existing.reviewedAt,
  };
}

export function assertUserCanPerform(
  user: Pick<User, 'id' | 'role'>,
  permission: WorkspacePermission,
  context: PermissionContext = {},
) {
  if (!canUserPerform(user, permission, context)) {
    throw new Error(
      `The ${user.role.replace(/-/g, ' ')} role cannot perform ${permission.replace(/:/g, ' ')}.`,
    );
  }
}

export function assertUserCanPerformAcrossEngagements(
  user: Pick<User, 'id' | 'role'>,
  permission: WorkspacePermission,
  engagements: Array<
    Pick<Engagement, 'id' | 'leadUserId' | 'teamUserIds'> | undefined
  >,
) {
  const visitedEngagementIds = new Set<EntityId>();
  let hasEngagementContext = false;

  engagements.forEach((engagement) => {
    if (!engagement || visitedEngagementIds.has(engagement.id)) {
      return;
    }

    hasEngagementContext = true;
    visitedEngagementIds.add(engagement.id);
    assertUserCanPerform(user, permission, { engagement });
  });

  if (!hasEngagementContext) {
    assertUserCanPerform(user, permission);
  }
}

export function permissionForVisibilityTransition(
  previous: VisibilityScope | undefined,
  next: VisibilityScope | undefined,
): WorkspacePermission | undefined {
  if (!next || previous === next || (!previous && next === 'internal')) {
    return undefined;
  }

  if (next === 'approved-client-facing') {
    return 'visibility:approve-client-facing';
  }

  if (next === 'archived') {
    return 'visibility:archive';
  }

  return 'visibility:prepare-client-facing';
}

export function prepareControlledOutputUpdate(
  existing: Output,
  candidate: Output,
  actorUserId: EntityId,
  occurredAt: string,
): Output {
  if (
    !controlledOutputStatusTransitions[existing.status].includes(
      candidate.status,
    )
  ) {
    throw new Error(
      `Cannot move an output from ${existing.status} to ${candidate.status}.`,
    );
  }

  if (outputContextChanged(existing, candidate)) {
    throw new Error(
      'A controlled output cannot be moved to a different engagement, type, creator, or creation timestamp.',
    );
  }

  const contentChanged = outputContentChanged(existing, candidate);

  if (
    existing.status === 'internal-review' &&
    contentChanged &&
    candidate.status !== 'draft'
  ) {
    throw new Error(
      'Return an output to draft before revising its controlled content.',
    );
  }

  if (existing.status === 'published') {
    if (candidate.status !== 'archived') {
      throw new Error(
        'Published outputs are immutable. Create a new internal draft for a revised version.',
      );
    }
    if (contentChanged) {
      throw new Error(
        'Archive a published output without changing its controlled content.',
      );
    }
    return {
      ...existing,
      status: 'archived',
      visibility: 'archived',
    };
  }

  if (candidate.status === 'approved' && existing.status !== 'approved') {
    if (contentChanged) {
      throw new Error(
        'Approval can only confirm the reviewed output. Submit content revisions for review before approval.',
      );
    }
    return {
      ...existing,
      status: 'approved',
      visibility: 'approved-client-facing',
      approvedByUserId: actorUserId,
      approvedAt: occurredAt,
      publishedAt: undefined,
    };
  }

  if (candidate.status === 'published') {
    if (contentChanged) {
      throw new Error(
        'Publish the approved output as reviewed. Create a new draft for content changes.',
      );
    }
    return {
      ...existing,
      status: 'published',
      visibility: 'approved-client-facing',
      publishedAt: occurredAt,
    };
  }

  if (candidate.status === 'archived' && existing.status !== 'archived') {
    if (contentChanged) {
      throw new Error(
        'Archive an output without changing its controlled content.',
      );
    }
    return {
      ...existing,
      status: 'archived',
      visibility: 'archived',
    };
  }

  if (existing.status === 'approved') {
    if (candidate.status !== 'internal-review') {
      throw new Error(
        'Approved outputs must be resubmitted for review before changing controlled content.',
      );
    }
    return {
      ...candidate,
      visibility: 'draft-client-facing',
      approvedByUserId: undefined,
      approvedAt: undefined,
      publishedAt: undefined,
    };
  }

  if (existing.status === 'archived') {
    throw new Error(
      'Archived outputs are immutable. Create a new internal draft when a new version is needed.',
    );
  }

  return candidate;
}

export function prepareControlledOpportunityUpdate(
  existing: Opportunity,
  candidate: Opportunity,
): Opportunity {
  if (
    existing.id !== candidate.id ||
    existing.createdAt !== candidate.createdAt
  ) {
    throw new Error(
      'An opportunity cannot change its identity or creation timestamp.',
    );
  }

  const contentChanged = opportunityContentChanged(existing, candidate);
  const isApprovingContent =
    !hasApprovedOpportunityContent(existing) &&
    hasApprovedOpportunityContent(candidate);
  const isInternalDraft =
    candidate.approvalState === 'draft' &&
    candidate.reviewStatus === 'draft' &&
    candidate.visibility === 'internal';

  if (existing.visibility === 'archived' && contentChanged) {
    throw new Error(
      'Restore an archived opportunity to an internal draft before revising its content.',
    );
  }

  if (
    existing.approvalState === 'internal-review' &&
    existing.reviewStatus === 'reviewed' &&
    contentChanged &&
    !isInternalDraft
  ) {
    throw new Error(
      'Return an opportunity to an internal draft before revising reviewed content.',
    );
  }

  if (isApprovingContent && contentChanged) {
    throw new Error(
      'Approval can only confirm the reviewed opportunity content. Save revisions before approval.',
    );
  }

  if (isApprovingContent) {
    if (
      existing.approvalState !== 'internal-review' ||
      existing.reviewStatus !== 'reviewed'
    ) {
      throw new Error(
        'Only opportunity content in internal review can be approved.',
      );
    }

    return {
      ...existing,
      status: 'approved',
      approvalState: 'approved',
      reviewStatus: 'approved',
      visibility: 'approved-client-facing',
    };
  }

  if (hasApprovedOpportunityContent(existing) && contentChanged) {
    return {
      ...candidate,
      status: 'triaged',
      approvalState: 'draft',
      reviewStatus: 'draft',
      visibility: 'internal',
    };
  }

  return candidate;
}
