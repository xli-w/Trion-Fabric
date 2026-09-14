import {
  getEvidenceEngagementId,
  type EntityId,
  type FabricDataset,
} from '@domain';

export type OpportunitySourceKind = 'evidence' | 'observation' | 'finding';

export interface OpportunitySourceOption {
  id: EntityId;
  kind: OpportunitySourceKind;
  title: string;
  detail: string;
}

export function buildOpportunitySourceOptions(
  dataset: FabricDataset,
  engagementId: EntityId,
): OpportunitySourceOption[] {
  const siteWalkIds = new Set(
    dataset.siteWalks
      .filter((siteWalk) => siteWalk.engagementId === engagementId)
      .map((siteWalk) => siteWalk.id),
  );
  const diagnosticIds = new Set(
    dataset.diagnostics
      .filter((diagnostic) => diagnostic.engagementId === engagementId)
      .map((diagnostic) => diagnostic.id),
  );

  return [
    ...dataset.evidence
      .filter(
        (evidence) =>
          getEvidenceEngagementId(dataset, evidence) === engagementId,
      )
      .map((evidence) => ({
        id: evidence.id,
        kind: 'evidence' as const,
        title: evidence.title,
        detail: `${evidence.evidenceType ?? evidence.kind} · ${
          evidence.reviewStatus ?? evidence.approvalState
        }`,
      })),
    ...dataset.observations
      .filter((observation) => siteWalkIds.has(observation.siteWalkId))
      .map((observation) => ({
        id: observation.id,
        kind: 'observation' as const,
        title: observation.title ?? observation.summary,
        detail: `${observation.observationType ?? 'Observation'} · ${
          observation.status ?? observation.assurance
        }`,
      })),
    ...dataset.findings
      .filter((finding) => diagnosticIds.has(finding.diagnosticId))
      .map((finding) => ({
        id: finding.id,
        kind: 'finding' as const,
        title: finding.title,
        detail: `${finding.significance} significance · ${finding.reviewStatus}`,
      })),
  ].sort(
    (left, right) =>
      left.kind.localeCompare(right.kind) ||
      left.title.localeCompare(right.title),
  );
}
