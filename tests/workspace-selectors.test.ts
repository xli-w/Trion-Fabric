import { describe, expect, it } from 'vitest';

import { fabricFixtures } from '@app/data/development/fabric-fixtures';
import {
  buildClientsViewModel,
  buildOutputsViewModel,
  buildWorkspaceSnapshot,
} from '@app/features/fabric-data/selectors';

describe('workspace selectors', () => {
  it('builds workspace metrics from the validated dataset', () => {
    const snapshot = buildWorkspaceSnapshot(fabricFixtures);

    expect(snapshot.metrics[0]?.value).toBe('2');
    expect(snapshot.metrics[3]?.value).toBe('2');
    expect(snapshot.priorityOpportunities[0]?.title).toBe('Digitise shift handover capture');
    expect(snapshot.upcomingSiteWalks).toHaveLength(1);
  });

  it('builds client rows with site and engagement counts', () => {
    const rows = buildClientsViewModel(fabricFixtures);
    const northbank = rows.find((row) => row.name === 'Northbank Precision');

    expect(northbank?.siteCount).toBe(1);
    expect(northbank?.engagementCount).toBe(1);
    expect(northbank?.status).toBe('Active');
  });

  it('keeps outputs in the correct governance queue', () => {
    const outputs = buildOutputsViewModel(fabricFixtures);

    expect(outputs.reviewQueueCount).toBe(2);
    expect(outputs.readyToShareCount).toBe(1);
    expect(outputs.rows[0]?.title).toBe('Northbank opportunity register v0.2');
  });
});