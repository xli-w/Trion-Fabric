import { describe, expect, it } from 'vitest';

import { fabricFixtures } from '@app/data/development/fabric-fixtures';
import { fabricDatasetSchema } from '@validation';
import {
  buildClientsViewModel,
  buildBreadcrumbs,
  buildCurrentUnderstanding,
  buildEngagementCommandCentre,
  buildGlobalSearchResults,
  buildOpportunitiesViewModel,
  buildOutputReportWorkspace,
  buildOutputsViewModel,
  buildRoadmapViewModel,
  buildWorkspaceSnapshot,
  resolveEngagementIdForPath,
} from '@app/features/fabric-data/selectors';

describe('workspace selectors', () => {
  it('builds workspace metrics from the validated dataset', () => {
    const snapshot = buildWorkspaceSnapshot(fabricFixtures);

    expect(snapshot.metrics[0]?.value).toBe('2');
    expect(snapshot.metrics[3]?.value).toBe('6');
    expect(snapshot.priorityOpportunities[0]?.title).toBe(
      'Digitise shift handover capture',
    );
    expect(snapshot.upcomingSiteWalks).toHaveLength(1);
  });

  it('derives a current-user work queue and useful next action from real records', () => {
    const snapshot = buildWorkspaceSnapshot(
      fabricFixtures,
      'user-amy-wilkinson',
    );

    expect(snapshot.myEngagements).toHaveLength(1);
    expect(snapshot.myEngagements[0]?.name).toBe(
      'Northbank digital diagnostic',
    );
    expect(snapshot.observationsNeedingReview).toHaveLength(1);
    expect(snapshot.outputsAwaitingApproval).toHaveLength(3);
    expect(snapshot.nextAction.title).toContain('Review');
  });

  it('selects a next action that the current role can perform', () => {
    const reviewerSnapshot = buildWorkspaceSnapshot(
      fabricFixtures,
      'user-nadia-khan',
    );
    const readOnlySnapshot = buildWorkspaceSnapshot(
      fabricFixtures,
      'user-daniel-ward',
    );

    expect(reviewerSnapshot.nextAction.title).toContain('Approve');
    expect(readOnlySnapshot.nextAction.title).toBe(
      'No queued action for your current role',
    );
  });

  it('keeps archived opportunities out of active queues while marking them in the register', () => {
    const dataset = fabricDatasetSchema.parse(fabricFixtures);
    const archivedOpportunity = dataset.opportunities.find(
      (item) => item.id === 'opportunity-standardise-receipts',
    );
    if (!archivedOpportunity) {
      throw new Error('Expected an opportunity to archive.');
    }
    archivedOpportunity.visibility = 'archived';

    const snapshot = buildWorkspaceSnapshot(dataset);
    const opportunityRows = buildOpportunitiesViewModel(dataset).rows;

    expect(
      snapshot.incompleteOpportunities.some(
        (item) => item.id === archivedOpportunity.id,
      ),
    ).toBe(false);
    expect(
      snapshot.priorityOpportunities.some(
        (item) => item.id === archivedOpportunity.id,
      ),
    ).toBe(false);
    expect(
      opportunityRows.find((item) => item.id === archivedOpportunity.id)
        ?.visibility,
    ).toBe('Archived');
  });

  it('builds an engagement command centre from connected domain records', () => {
    const commandCentre = buildEngagementCommandCentre(
      fabricFixtures,
      'engagement-northbank-diagnostic',
    );

    expect(commandCentre?.client?.name).toBe('Northbank Precision');
    expect(commandCentre?.sites).toHaveLength(1);
    expect(commandCentre?.evidence.total).toBe(4);
    expect(commandCentre?.findings).toHaveLength(1);
    expect(commandCentre?.initiatives[0]?.title).toBe(
      'Digital handover foundation',
    );
    expect(commandCentre?.recentActivity[0]?.action).toBe('Published');
  });

  it('builds searchable internal record links and contextual breadcrumbs', () => {
    const searchActor = fabricFixtures.users.find(
      (user) => user.id === 'user-amy-wilkinson',
    );
    if (!searchActor) {
      throw new Error('Expected the Northbank engagement lead.');
    }
    const results = buildGlobalSearchResults(
      fabricFixtures,
      'handover',
      searchActor,
    );
    const breadcrumbs = buildBreadcrumbs(
      fabricFixtures,
      '/outputs/output-northbank-transformation-roadmap',
      'Transformation',
    );

    expect(results.some((result) => result.type === 'Opportunity')).toBe(true);
    expect(
      results.some((result) => result.path.startsWith('/site-walks/')),
    ).toBe(true);
    expect(breadcrumbs.map((breadcrumb) => breadcrumb.label)).toEqual([
      'Fabric',
      'Northbank Precision',
      'Sheffield Plant',
      'Northbank digital diagnostic',
      'Output',
    ]);
  });

  it('builds a current understanding that keeps facts, interpretation, and uncertainty separate', () => {
    const understanding = buildCurrentUnderstanding(
      fabricFixtures,
      'engagement-northbank-diagnostic',
    );

    expect(understanding).toBeDefined();
    expect(understanding?.known).toEqual(expect.any(Array));
    expect(understanding?.patterns).toEqual(expect.any(Array));
    expect(understanding?.uncertainties.length).toBeGreaterThan(0);
    expect(understanding?.priorityOpportunities[0]?.path).toMatch(
      /^\/opportunities\//,
    );
  });

  it('restores active engagement context from workspace and contextual record links', () => {
    expect(
      resolveEngagementIdForPath(
        fabricFixtures,
        '/workspace/engagement-northbank-diagnostic',
      ),
    ).toBe('engagement-northbank-diagnostic');
    expect(
      resolveEngagementIdForPath(
        fabricFixtures,
        '/site-walks/walk-northbank-machine-shop-01',
      ),
    ).toBe('engagement-northbank-diagnostic');
    expect(
      resolveEngagementIdForPath(
        fabricFixtures,
        '/outputs/output-northbank-transformation-roadmap',
      ),
    ).toBe('engagement-northbank-diagnostic');
    expect(
      resolveEngagementIdForPath(
        fabricFixtures,
        '/workspace/engagement-does-not-exist',
      ),
    ).toBeUndefined();
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

    expect(outputs.reviewQueueCount).toBe(6);
    expect(outputs.readyToShareCount).toBe(1);
    expect(outputs.coreOutputCount).toBe(5);
    expect(outputs.rows[0]?.title).toBe('Northbank executive summary');
  });

  it('builds a report workspace with source freshness, reviews, exports, and version comparison', () => {
    const scorecardWorkspace = buildOutputReportWorkspace(
      fabricFixtures,
      'output-northbank-maturity-scorecard',
    );
    const landscapeWorkspace = buildOutputReportWorkspace(
      fabricFixtures,
      'output-northbank-landscape-map',
    );
    const roadmapWorkspace = buildOutputReportWorkspace(
      fabricFixtures,
      'output-northbank-transformation-roadmap',
    );
    const changedDataset = fabricDatasetSchema.parse(fabricFixtures);
    const executiveSource = changedDataset.opportunities.find(
      (item) => item.id === 'opportunity-digitise-handover',
    );
    if (
      !scorecardWorkspace ||
      !landscapeWorkspace ||
      !roadmapWorkspace ||
      !executiveSource
    ) {
      throw new Error('Expected controlled report workspaces.');
    }

    executiveSource.updatedAt = '2026-09-14T09:00:00Z';
    const staleExecutiveWorkspace = buildOutputReportWorkspace(
      changedDataset,
      'output-northbank-executive-summary',
    );

    expect(scorecardWorkspace.previousOutput?.version).toBe('0.1');
    expect(scorecardWorkspace.comparison?.currentVersion).toBe('0.2');
    expect(
      scorecardWorkspace.sourceCatalog.every(
        (source) =>
          typeof source.isApplicable === 'boolean' &&
          typeof source.isSelected === 'boolean',
      ),
    ).toBe(true);
    expect(landscapeWorkspace.openReviewCommentCount).toBe(1);
    expect(roadmapWorkspace.exports).toHaveLength(1);
    expect(roadmapWorkspace.exports[0]?.sourceFingerprint).toBe(
      roadmapWorkspace.report.snapshot.sourceFingerprint,
    );
    expect(staleExecutiveWorkspace?.sourceDataChanged).toBe(true);
  });

  it('keeps unsequenced initiatives out of roadmap phase groups', () => {
    const dataset = {
      ...fabricFixtures,
      initiatives: [...fabricFixtures.initiatives],
    };
    const existingInitiative = dataset.initiatives[0];
    if (!existingInitiative) throw new Error('Expected a fixture initiative.');

    dataset.initiatives.push({
      ...existingInitiative,
      id: 'initiative-unsequenced',
      title: 'Unsequenced operational improvement',
      phase: 'Connect',
    });

    const roadmap = buildRoadmapViewModel(dataset).roadmaps[0];
    const connectPhase = roadmap?.phases.find(
      (phase) => phase.phase === 'Connect',
    );

    expect(connectPhase?.initiatives).toHaveLength(0);
    expect(buildRoadmapViewModel(dataset).unsequencedInitiatives).toHaveLength(
      1,
    );
  });
});
