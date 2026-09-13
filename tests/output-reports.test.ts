import { describe, expect, it } from 'vitest';

import {
  compareOutputReportSnapshots,
  getOutputSourceCatalog,
  hasOutputReportSourceChanges,
  resolveOutputReport,
  serializeOutputReportAsAiPackage,
  serializeOutputReportAsMarkdown,
} from '@domain';
import { fabricFixtures } from '@app/data/development/fabric-fixtures';
import { fabricDatasetSchema } from '@validation';

function fixtureOutput(id: string) {
  const output = fabricFixtures.outputs.find((item) => item.id === id);
  if (!output) {
    throw new Error(`Expected output fixture ${id}.`);
  }
  return output;
}

describe('controlled output reporting', () => {
  it('projects all five core deliverables from the shared engagement model', () => {
    const coreOutputs = [
      fixtureOutput('output-northbank-executive-summary'),
      fixtureOutput('output-northbank-maturity-scorecard'),
      fixtureOutput('output-northbank-landscape-map'),
      fixtureOutput('output-northbank-opportunity-action-register'),
      fixtureOutput('output-northbank-transformation-roadmap'),
    ];

    const reports = coreOutputs.map((output) =>
      resolveOutputReport(fabricFixtures, output),
    );

    expect(reports.map((report) => report.snapshot.templateId)).toEqual([
      'executive-summary',
      'maturity-scorecard',
      'landscape-map',
      'opportunity-action-register',
      'transformation-roadmap',
    ]);
    expect(
      reports[0]?.snapshot.sections.map((section) => section.id),
    ).toContain('priority-opportunities');
    expect(
      reports[1]?.snapshot.sections.find(
        (section) => section.id === 'maturity-profile',
      )?.blocks[0],
    ).toMatchObject({
      type: 'table',
      columns: ['Dimension', 'Score', 'Maturity level', 'Confidence'],
    });
    expect(
      reports[2]?.snapshot.sections.map((section) => section.id),
    ).toContain('landscape-relationships');
    expect(
      reports[3]?.snapshot.sections.map((section) => section.id),
    ).toContain('opportunity-register');
    expect(
      reports[4]?.snapshot.sections.map((section) => section.id),
    ).toContain('roadmap-phases');
  });

  it('excludes unapproved source material from report content while retaining an internal audit reason', () => {
    const output = fixtureOutput(
      'output-northbank-opportunity-action-register',
    );
    const report = resolveOutputReport(fabricFixtures, output);
    const serializedReport = JSON.stringify(report);

    expect(
      report.snapshot.includedSources.some(
        (source) => source.id === 'opportunity-unify-ncr-routing',
      ),
    ).toBe(false);
    expect(report.snapshot.excludedSources).toContainEqual(
      expect.objectContaining({
        sourceId: 'opportunity-unify-ncr-routing',
      }),
    );
    expect(serializedReport).not.toContain(
      'Needs a quick architecture option set before approval.',
    );
  });

  it('provides an approved report as aligned Markdown and structured AI input without internal notes', () => {
    const output = fixtureOutput('output-northbank-transformation-roadmap');
    const report = resolveOutputReport(fabricFixtures, output);
    const markdown = serializeOutputReportAsMarkdown(report);
    const aiPackage = JSON.parse(serializeOutputReportAsAiPackage(report)) as {
      schemaVersion: string;
      report: typeof report;
    };

    expect(report.clientReady).toBe(true);
    expect(markdown).toContain('# Northbank transformation roadmap');
    expect(markdown).toContain('## Transformation phases');
    expect(markdown).not.toContain(
      'Validate the operator workflow before any ERP configuration changes.',
    );
    expect(aiPackage.schemaVersion).toBe('trion-output-ai-package/v1');
    expect(aiPackage.report.snapshot.sourceFingerprint).toBe(
      report.snapshot.sourceFingerprint,
    );
  });

  it('identifies a source-data change without replacing an existing report snapshot', () => {
    const dataset = fabricDatasetSchema.parse(fabricFixtures);
    const output = dataset.outputs.find(
      (item) => item.id === 'output-northbank-executive-summary',
    );
    const opportunity = dataset.opportunities.find(
      (item) => item.id === 'opportunity-digitise-handover',
    );
    if (!output || !opportunity) {
      throw new Error('Expected report source fixtures.');
    }

    const originalSnapshot = output.reportSnapshot;
    opportunity.updatedAt = '2026-09-13T22:00:00Z';

    expect(hasOutputReportSourceChanges(dataset, output)).toBe(true);
    expect(output.reportSnapshot).toBe(originalSnapshot);
  });

  it('compares retained report versions rather than silently replacing the reviewed version', () => {
    const previous = fixtureOutput('output-northbank-maturity-scorecard-v01');
    const current = fixtureOutput('output-northbank-maturity-scorecard');
    if (!previous.reportSnapshot || !current.reportSnapshot) {
      throw new Error('Expected versioned report snapshots.');
    }

    const comparison = compareOutputReportSnapshots(
      previous.reportSnapshot,
      current.reportSnapshot,
      previous.version,
      current.version,
    );

    expect(comparison.previousVersion).toBe('0.1');
    expect(comparison.currentVersion).toBe('0.2');
    expect(comparison.changedSections).toContainEqual(
      expect.objectContaining({ sectionId: 'scorecard-direction' }),
    );
  });

  it('exposes only approved source records as recommended output sources', () => {
    const sourceCatalog = getOutputSourceCatalog(
      fabricFixtures,
      'engagement-northbank-diagnostic',
    );
    const approvedOpportunity = sourceCatalog.find(
      (source) => source.id === 'opportunity-digitise-handover',
    );
    const internalReviewOpportunity = sourceCatalog.find(
      (source) => source.id === 'opportunity-unify-ncr-routing',
    );

    expect(approvedOpportunity?.isClientSafe).toBe(true);
    expect(internalReviewOpportunity?.isClientSafe).toBe(false);
  });
});
