import { describe, expect, it } from 'vitest';

import { fabricFixtures } from '@app/data/development/fabric-fixtures';
import {
  activeWorkspacePath,
  buildOpportunityCreationPath,
  parseOpportunitySourceReference,
  withEngagementContext,
} from '@app/features/fabric-data/engagement-paths';
import { buildOpportunitySourceOptions } from '@app/features/opportunities/opportunity-sources';
import { resolveEngagementIdForPath } from '@app/features/fabric-data/selectors';

const northbankEngagementId = 'engagement-northbank-diagnostic';

describe('engagement-safe workbench paths', () => {
  it('keeps engagement context when linking between workbenches', () => {
    expect(activeWorkspacePath(northbankEngagementId)).toBe(
      `/workspace/${northbankEngagementId}`,
    );
    expect(withEngagementContext('/analyse', northbankEngagementId)).toBe(
      `/analyse?engagement=${northbankEngagementId}`,
    );
    expect(
      withEngagementContext(
        '/evidence?evidence=evidence-handover-photo#record',
        northbankEngagementId,
      ),
    ).toBe(
      `/evidence?evidence=evidence-handover-photo&engagement=${northbankEngagementId}#record`,
    );
  });

  it('restores explicit workbench context while record-specific routes remain authoritative', () => {
    expect(
      resolveEngagementIdForPath(
        fabricFixtures,
        '/analyse',
        `?engagement=${northbankEngagementId}`,
      ),
    ).toBe(northbankEngagementId);
    expect(
      resolveEngagementIdForPath(
        fabricFixtures,
        '/diagnosis',
        `?engagement=${northbankEngagementId}`,
      ),
    ).toBe(northbankEngagementId);
    expect(
      resolveEngagementIdForPath(
        fabricFixtures,
        '/evidence',
        `?engagement=${northbankEngagementId}`,
      ),
    ).toBe(northbankEngagementId);
    expect(
      resolveEngagementIdForPath(
        fabricFixtures,
        '/site-walks/walk-northbank-machine-shop-01',
        '?engagement=engagement-airedale-discovery',
      ),
    ).toBe(northbankEngagementId);
  });

  it('creates and validates a contextual opportunity handoff', () => {
    const path = buildOpportunityCreationPath(northbankEngagementId, {
      type: 'finding',
      id: 'finding-northbank-information-latency',
    });
    const search = path.slice(path.indexOf('?'));

    expect(path).toBe(
      `/opportunities?engagement=${northbankEngagementId}&create=opportunity&source=finding%3Afinding-northbank-information-latency`,
    );
    expect(
      parseOpportunitySourceReference(
        new URLSearchParams(search).get('source'),
      ),
    ).toEqual({
      type: 'finding',
      id: 'finding-northbank-information-latency',
    });
    expect(
      parseOpportunitySourceReference('unsupported:record'),
    ).toBeUndefined();
  });

  it('offers only evidence, observations, and findings from the selected engagement', () => {
    const options = buildOpportunitySourceOptions(
      fabricFixtures,
      northbankEngagementId,
    );

    expect(options).toContainEqual(
      expect.objectContaining({
        id: 'evidence-handover-photo',
        kind: 'evidence',
      }),
    );
    expect(options).toContainEqual(
      expect.objectContaining({
        id: 'observation-paper-handover',
        kind: 'observation',
      }),
    );
    expect(options).toContainEqual(
      expect.objectContaining({
        id: 'finding-northbank-information-latency',
        kind: 'finding',
      }),
    );
    expect(
      options.some((option) => option.id === 'evidence-receipts-interview'),
    ).toBe(false);
  });
});
