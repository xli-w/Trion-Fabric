import { describe, expect, it } from 'vitest';

import {
  createOutputReportSnapshot,
  isOpportunityReadyForDelivery,
  isOutputReportClientReady,
  preparePreliminarySiteWalkPromotion,
  resolveOutputReport,
} from '@domain';
import { fabricFixtures } from '@app/data/development/fabric-fixtures';
import { fabricDatasetSchema } from '@validation';

const occurredAt = '2026-09-14T09:00:00Z';

function copyDataset() {
  return fabricDatasetSchema.parse(fabricFixtures);
}

function requireRecord<T>(record: T | undefined, description: string): T {
  if (!record) {
    throw new Error(`Expected ${description}.`);
  }
  return record;
}

describe('critical client-to-output workflow', () => {
  it('carries a client site-walk recommendation into a valid diagnostic, delivery plan, and approved report', () => {
    const dataset = copyDataset();
    const client = requireRecord(
      dataset.clients.find((item) => item.id === 'client-airedale-foods'),
      'the Airedale client',
    );
    const site = requireRecord(
      dataset.sites.find((item) => item.id === 'site-airedale-leeds'),
      'the Airedale site',
    );
    const preliminaryEngagement = requireRecord(
      dataset.engagements.find(
        (item) => item.id === 'engagement-airedale-discovery',
      ),
      'the Airedale preliminary engagement',
    );
    const siteWalk = requireRecord(
      dataset.siteWalks.find((item) => item.id === 'walk-airedale-intake-01'),
      'the Airedale preliminary site walk',
    );
    const preliminaryRun = requireRecord(
      dataset.engagementMethodologyRuns.find(
        (item) => item.id === 'methodology-run-airedale-preliminary-2026-1',
      ),
      'the Airedale preliminary methodology run',
    );
    const diagnosticTemplate = requireRecord(
      dataset.methodologyTemplates.find(
        (item) =>
          item.engagementType === 'Digital Diagnostic' &&
          item.status === 'active',
      ),
      'the Digital Diagnostic methodology template',
    );
    const sourceOpportunity = requireRecord(
      dataset.opportunities.find(
        (item) => item.id === 'opportunity-digitise-handover',
      ),
      'an approved opportunity fixture',
    );
    const sourceInitiative = requireRecord(
      dataset.initiatives.find(
        (item) => item.id === 'initiative-handover-foundation',
      ),
      'an approved initiative fixture',
    );
    const sourceRoadmap = requireRecord(
      dataset.roadmaps.find((item) => item.id === 'roadmap-northbank-2026'),
      'an approved roadmap fixture',
    );
    const sourceOutput = requireRecord(
      dataset.outputs.find(
        (item) => item.id === 'output-northbank-transformation-roadmap',
      ),
      'an approved output fixture',
    );
    const evidence = requireRecord(
      dataset.evidence.find(
        (item) => item.id === 'evidence-receipts-interview',
      ),
      'the Airedale fieldwork evidence',
    );

    const promotion = preparePreliminarySiteWalkPromotion({
      engagement: preliminaryEngagement,
      siteWalk,
      preliminaryRun,
      digitalDiagnosticTemplate: diagnosticTemplate,
      digitalDiagnosticStages: dataset.methodologyStages,
      digitalDiagnosticActivities: dataset.methodologyActivities,
      actorUserId: 'user-james-carter',
      occurredAt,
      digitalDiagnosticRunId: 'methodology-run-airedale-diagnostic-2026-1',
      diagnosticId: 'diagnostic-airedale-2026-1',
    });
    const opportunity = {
      ...sourceOpportunity,
      id: 'opportunity-airedale-receipts',
      createdAt: occurredAt,
      updatedAt: occurredAt,
      engagementId: promotion.engagement.id,
      diagnosticId: promotion.diagnostic.id,
      processId: 'process-ingredient-receipts',
      areaId: 'area-intake-yard',
      title: 'Standardise digital intake receipt capture',
      description:
        'Create a reliable intake receipt sequence before stock is released downstream.',
      evidenceIds: [evidence.id],
      relatedObservationIds: undefined,
      relatedFindingIds: undefined,
      ownerUserId: 'user-james-carter',
      owner: 'James Carter',
    };
    const initiative = {
      ...sourceInitiative,
      id: 'initiative-airedale-receipt-foundation',
      createdAt: occurredAt,
      updatedAt: occurredAt,
      engagementId: promotion.engagement.id,
      opportunityId: opportunity.id,
      ownerUserId: 'user-james-carter',
      title: 'Digital receipt foundation',
      description:
        'Pilot a controlled receipt capture sequence with warehouse and planning ownership.',
      objective:
        'Make receipt status and outstanding checks visible before material is released downstream.',
      clientSummary:
        'Pilot a practical digital receipt process that gives warehouse and planning teams a shared view of completion and exceptions.',
    };
    const roadmap = {
      ...sourceRoadmap,
      id: 'roadmap-airedale-receipts-2026',
      createdAt: occurredAt,
      updatedAt: occurredAt,
      engagementId: promotion.engagement.id,
      diagnosticId: promotion.diagnostic.id,
      title: 'Airedale intake transformation roadmap',
      description:
        'A sequenced path from consistent intake checks to dependable stock visibility.',
      initiativeIds: [initiative.id],
    };
    const datasetBeforeOutput = {
      ...dataset,
      engagements: dataset.engagements.map((item) =>
        item.id === preliminaryEngagement.id ? promotion.engagement : item,
      ),
      diagnostics: [...dataset.diagnostics, promotion.diagnostic],
      opportunities: [...dataset.opportunities, opportunity],
      initiatives: [...dataset.initiatives, initiative],
      roadmaps: [...dataset.roadmaps, roadmap],
      engagementMethodologyRuns: [
        ...dataset.engagementMethodologyRuns.map((item) =>
          item.id === preliminaryRun.id ? promotion.preliminaryRun : item,
        ),
        promotion.digitalDiagnosticRun,
      ],
      engagementMethodologyActivities: [
        ...dataset.engagementMethodologyActivities,
        ...promotion.digitalDiagnosticActivities,
      ],
    };
    const outputBase = {
      ...sourceOutput,
      id: 'output-airedale-transformation-roadmap',
      createdAt: occurredAt,
      updatedAt: occurredAt,
      engagementId: promotion.engagement.id,
      title: 'Airedale intake transformation roadmap',
      version: '0.1',
      createdByUserId: 'user-james-carter',
      approvedByUserId: 'user-nadia-khan',
      approvedAt: occurredAt,
      publishedAt: undefined,
      status: 'approved' as const,
      visibility: 'approved-client-facing' as const,
      sourceReferences: [roadmap.id, initiative.id, opportunity.id],
      sectionOverrides: [],
      reportSnapshot: undefined,
      supersedesOutputId: undefined,
    };
    const output = {
      ...outputBase,
      reportSnapshot: createOutputReportSnapshot(
        datasetBeforeOutput,
        outputBase,
        occurredAt,
      ),
    };
    const workflowDataset = {
      ...datasetBeforeOutput,
      outputs: [...datasetBeforeOutput.outputs, output],
    };
    const report = resolveOutputReport(workflowDataset, output);

    expect(site.clientId).toBe(client.id);
    expect(preliminaryEngagement.clientId).toBe(client.id);
    expect(preliminaryEngagement.siteIds).toContain(site.id);
    expect(siteWalk.engagementId).toBe(preliminaryEngagement.id);
    expect(promotion.engagement.type).toBe('Digital Diagnostic');
    expect(promotion.diagnostic.engagementId).toBe(promotion.engagement.id);
    expect(opportunity.diagnosticId).toBe(promotion.diagnostic.id);
    expect(initiative.opportunityId).toBe(opportunity.id);
    expect(roadmap.initiativeIds).toEqual([initiative.id]);
    expect(output.sourceReferences).toEqual([
      roadmap.id,
      initiative.id,
      opportunity.id,
    ]);
    expect(isOpportunityReadyForDelivery(opportunity)).toBe(true);
    expect(isOutputReportClientReady(workflowDataset, output)).toBe(true);
    expect(report.snapshot.includedSources.map((source) => source.id)).toEqual(
      expect.arrayContaining(output.sourceReferences),
    );
    expect(fabricDatasetSchema.safeParse(workflowDataset).success).toBe(true);
  });
});
