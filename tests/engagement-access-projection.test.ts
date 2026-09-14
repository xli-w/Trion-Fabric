import { describe, expect, it } from 'vitest';

import {
  createEngagementAccessProjection,
  createEngagementWorkspaceProjection,
} from '@domain';
import { fabricFixtures } from '@app/data/development/fabric-fixtures';

function fixtureUser(id: string) {
  const user = fabricFixtures.users.find((item) => item.id === id);
  if (!user) {
    throw new Error(`Expected workspace user ${id}.`);
  }
  return user;
}

describe('engagement access projection', () => {
  it('removes inaccessible client records from the standard workspace view', () => {
    const projection = createEngagementAccessProjection(
      fabricFixtures,
      fixtureUser('user-amy-wilkinson'),
    );

    expect(projection.engagements.map((item) => item.id)).toEqual([
      'engagement-northbank-diagnostic',
    ]);
    expect(projection.clients.map((item) => item.id)).toEqual([
      'client-northbank-precision',
    ]);
    expect(
      projection.outputs.some(
        (item) => item.id === 'output-airedale-discovery-brief',
      ),
    ).toBe(false);
    expect(
      projection.siteWalks.some(
        (item) => item.id === 'walk-airedale-intake-01',
      ),
    ).toBe(false);
    expect(
      projection.evidence.some(
        (item) => item.id === 'evidence-receipts-interview',
      ),
    ).toBe(false);
    expect(
      fabricFixtures.outputs.some(
        (item) => item.id === 'output-airedale-discovery-brief',
      ),
    ).toBe(true);
  });

  it('retains every engagement for a workspace-wide analyst role', () => {
    const projection = createEngagementAccessProjection(
      fabricFixtures,
      fixtureUser('user-james-carter'),
    );

    expect(projection.engagements).toHaveLength(
      fabricFixtures.engagements.length,
    );
    expect(projection.outputs).toHaveLength(fabricFixtures.outputs.length);
  });

  it('creates a single-engagement workbench projection without losing connected records', () => {
    const projection = createEngagementWorkspaceProjection(
      fabricFixtures,
      'engagement-northbank-diagnostic',
    );

    if (!projection) {
      throw new Error('Expected an active engagement projection.');
    }

    expect(projection.engagements.map((item) => item.id)).toEqual([
      'engagement-northbank-diagnostic',
    ]);
    expect(projection.clients.map((item) => item.id)).toEqual([
      'client-northbank-precision',
    ]);
    expect(
      projection.siteWalks.every(
        (siteWalk) =>
          siteWalk.engagementId === 'engagement-northbank-diagnostic',
      ),
    ).toBe(true);
    expect(
      projection.opportunities.every(
        (opportunity) =>
          opportunity.engagementId === 'engagement-northbank-diagnostic',
      ),
    ).toBe(true);
    expect(
      projection.outputs.some(
        (output) => output.id === 'output-airedale-discovery-brief',
      ),
    ).toBe(false);
  });

  it('returns no projection for an unknown engagement', () => {
    expect(
      createEngagementWorkspaceProjection(
        fabricFixtures,
        'engagement-does-not-exist',
      ),
    ).toBeUndefined();
  });
});
