import { describe, expect, it } from 'vitest';

import {
  assertUserCanPerform,
  assertUserCanPerformAcrossEngagements,
  canUserPerform,
  isOpportunityReadyForDelivery,
  permissionForVisibilityTransition,
  prepareControlledOutputUpdate,
  prepareControlledOpportunityUpdate,
} from '@domain';
import { fabricFixtures } from '@app/data/development/fabric-fixtures';

function fixtureUser(id: string) {
  const user = fabricFixtures.users.find((item) => item.id === id);
  if (!user) {
    throw new Error(`Expected fixture user ${id}.`);
  }
  return user;
}

function fixtureEngagement(id: string) {
  const engagement = fabricFixtures.engagements.find((item) => item.id === id);
  if (!engagement) {
    throw new Error(`Expected fixture engagement ${id}.`);
  }
  return engagement;
}

describe('internal workspace access policy', () => {
  it('limits engagement leads to their assigned engagement context', () => {
    const lead = fixtureUser('user-amy-wilkinson');
    const northbank = fixtureEngagement('engagement-northbank-diagnostic');
    const airedale = fixtureEngagement('engagement-airedale-discovery');

    expect(canUserPerform(lead, 'fieldwork:write', { engagement: northbank })).toBe(
      true,
    );
    expect(canUserPerform(lead, 'fieldwork:write', { engagement: airedale })).toBe(
      false,
    );
  });

  it('authorizes a change against both source and destination engagement contexts', () => {
    const lead = fixtureUser('user-amy-wilkinson');
    const northbank = fixtureEngagement('engagement-northbank-diagnostic');
    const airedale = fixtureEngagement('engagement-airedale-discovery');
    const candidateAiredale = {
      ...airedale,
      teamUserIds: [...airedale.teamUserIds, lead.id],
    };

    expect(
      canUserPerform(lead, 'context:write', {
        engagement: candidateAiredale,
      }),
    ).toBe(true);
    expect(() =>
      assertUserCanPerformAcrossEngagements(lead, 'context:write', [
        airedale,
        candidateAiredale,
      ]),
    ).toThrow('engagement lead role');
    expect(() =>
      assertUserCanPerformAcrossEngagements(lead, 'fieldwork:write', [
        northbank,
        airedale,
      ]),
    ).toThrow('engagement lead role');
  });

  it('keeps approval separate from working-content permissions', () => {
    const reviewer = fixtureUser('user-nadia-khan');
    const analyst = fixtureUser('user-james-carter');

    expect(canUserPerform(reviewer, 'output:approve')).toBe(true);
    expect(canUserPerform(reviewer, 'output:write')).toBe(false);
    expect(canUserPerform(analyst, 'output:write')).toBe(true);
    expect(canUserPerform(analyst, 'output:approve')).toBe(false);
  });

  it('denies write access to read-only internal users', () => {
    const readOnlyUser = fixtureUser('user-daniel-ward');

    expect(canUserPerform(readOnlyUser, 'diagnostic:write')).toBe(false);
    expect(() =>
      assertUserCanPerform(readOnlyUser, 'diagnostic:write'),
    ).toThrow('read only role');
  });

  it('requires elevated permissions for client-facing and archived visibility', () => {
    expect(permissionForVisibilityTransition(undefined, 'internal')).toBe(
      undefined,
    );
    expect(
      permissionForVisibilityTransition(
        'internal',
        'draft-client-facing',
      ),
    ).toBe('visibility:prepare-client-facing');
    expect(
      permissionForVisibilityTransition(
        'draft-client-facing',
        'approved-client-facing',
      ),
    ).toBe('visibility:approve-client-facing');
    expect(
      permissionForVisibilityTransition(
        'approved-client-facing',
        'archived',
      ),
    ).toBe('visibility:archive');
  });

  it('canonicalises approval attribution and rejects published-output revisions', () => {
    const reviewOutput = fabricFixtures.outputs.find(
      (item) => item.id === 'output-northbank-maturity-scorecard',
    );
    const publishedOutput = fabricFixtures.outputs.find(
      (item) => item.id === 'output-northbank-transformation-roadmap',
    );
    if (!reviewOutput || !publishedOutput) {
      throw new Error('Expected controlled output fixtures.');
    }

    const approved = prepareControlledOutputUpdate(
      reviewOutput,
      {
        ...reviewOutput,
        status: 'approved',
        visibility: 'approved-client-facing',
        approvedByUserId: 'user-james-carter',
        approvedAt: '2026-01-01T09:00:00Z',
      },
      'user-nadia-khan',
      '2026-09-13T10:00:00Z',
    );

    expect(approved.approvedByUserId).toBe('user-nadia-khan');
    expect(approved.approvedAt).toBe('2026-09-13T10:00:00Z');
    expect(approved.visibility).toBe('approved-client-facing');
    expect(() =>
      prepareControlledOutputUpdate(
        publishedOutput,
        { ...publishedOutput, title: 'Rewritten published roadmap' },
        'user-nadia-khan',
        '2026-09-13T10:00:00Z',
      ),
    ).toThrow('Published outputs are immutable');
  });

  it('requires review outputs to return to draft before their content changes', () => {
    const reviewOutput = fabricFixtures.outputs.find(
      (item) => item.id === 'output-northbank-maturity-scorecard',
    );
    if (!reviewOutput) {
      throw new Error('Expected an internal-review output.');
    }

    expect(() =>
      prepareControlledOutputUpdate(
        reviewOutput,
        { ...reviewOutput, title: 'Revised maturity scorecard' },
        'user-james-carter',
        '2026-09-13T10:00:00Z',
      ),
    ).toThrow('Return an output to draft');
  });

  it('resets approved opportunity content revisions to an internal draft', () => {
    const opportunity = fabricFixtures.opportunities.find(
      (item) => item.id === 'opportunity-digitise-handover',
    );
    if (!opportunity) {
      throw new Error('Expected an approved client-facing opportunity.');
    }

    const revision = prepareControlledOpportunityUpdate(opportunity, {
      ...opportunity,
      title: 'Digitise controlled handover',
    });

    expect(revision.status).toBe('triaged');
    expect(revision.approvalState).toBe('draft');
    expect(revision.reviewStatus).toBe('draft');
    expect(revision.visibility).toBe('internal');
  });

  it('does not let declassification preserve stale approved opportunity content', () => {
    const opportunity = fabricFixtures.opportunities.find(
      (item) => item.id === 'opportunity-digitise-handover',
    );
    if (!opportunity) {
      throw new Error('Expected an approved client-facing opportunity.');
    }

    const declassified = prepareControlledOpportunityUpdate(opportunity, {
      ...opportunity,
      visibility: 'internal',
    });
    const revision = prepareControlledOpportunityUpdate(declassified, {
      ...declassified,
      title: 'Digitise internal handover',
    });

    expect(revision.approvalState).toBe('draft');
    expect(revision.reviewStatus).toBe('draft');
    expect(revision.visibility).toBe('internal');
  });

  it('requires opportunity content to be saved before it is approved', () => {
    const opportunity = fabricFixtures.opportunities.find(
      (item) => item.id === 'opportunity-standardise-receipts',
    );
    if (!opportunity) {
      throw new Error('Expected a draft opportunity.');
    }

    expect(() =>
      prepareControlledOpportunityUpdate(opportunity, {
        ...opportunity,
        title: 'Standardise controlled receipt checks',
        status: 'approved',
        approvalState: 'approved',
        reviewStatus: 'approved',
        visibility: 'approved-client-facing',
      }),
    ).toThrow('Approval can only confirm the reviewed opportunity content');
  });

  it('only approves an existing reviewed opportunity without changing its content', () => {
    const opportunity = fabricFixtures.opportunities.find(
      (item) => item.id === 'opportunity-unify-ncr-routing',
    );
    if (!opportunity) {
      throw new Error('Expected an opportunity in internal review.');
    }

    const approved = prepareControlledOpportunityUpdate(opportunity, {
      ...opportunity,
      status: 'closed',
      approvalState: 'approved',
      reviewStatus: 'approved',
      visibility: 'approved-client-facing',
    });

    expect(approved.status).toBe('approved');
    expect(approved.approvalState).toBe('approved');
    expect(approved.reviewStatus).toBe('approved');
    expect(approved.visibility).toBe('approved-client-facing');
    expect(() =>
      prepareControlledOpportunityUpdate(opportunity, {
        ...opportunity,
        title: 'Changed under review',
      }),
    ).toThrow('Return an opportunity to an internal draft');
  });

  it('does not offer archived opportunities for delivery', () => {
    const opportunity = fabricFixtures.opportunities.find(
      (item) => item.id === 'opportunity-digitise-handover',
    );
    if (!opportunity) {
      throw new Error('Expected an approved client-facing opportunity.');
    }

    expect(
      isOpportunityReadyForDelivery({
        ...opportunity,
        visibility: 'archived',
      }),
    ).toBe(false);
  });
});
