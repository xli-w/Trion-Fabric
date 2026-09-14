import { Link } from 'react-router-dom';

import type { Output, OutputType } from '@domain';
import { Badge, Card, PageHeader, StatCard } from '@ui';

import { ActiveEngagementDataView } from '@app/features/fabric-data/ActiveEngagementDataView';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';

const coreOutputTypes = [
  'landscape-map',
  'maturity-scorecard',
  'opportunity-action-register',
  'transformation-roadmap',
  'executive-summary',
] as const satisfies readonly OutputType[];
type CoreOutputType = (typeof coreOutputTypes)[number];

const coreOutputLabels: Record<CoreOutputType, string> = {
  'landscape-map': 'Digital Landscape Map',
  'maturity-scorecard': 'Maturity Scorecard',
  'opportunity-action-register': 'Opportunity & Action Register',
  'transformation-roadmap': 'Transformation Roadmap',
  'executive-summary': 'Executive Summary',
};

function isCoreOutput(
  output: Output,
): output is Output & { outputType: CoreOutputType } {
  return (coreOutputTypes as readonly OutputType[]).includes(output.outputType);
}

export function PlanOutputPage() {
  const { activeClient, activeEngagement } = useFabricData();

  return (
    <ActiveEngagementDataView
      emptyTitle="Planning workspace is unavailable"
      loadingDescription="Loading roadmap, benefit, and controlled-output context."
      loadingTitle="Loading Plan & Output"
    >
      {(dataset) => {
        const engagement = activeEngagement ?? dataset.engagements[0];
        if (!engagement) {
          return null;
        }

        const coreOutputs = dataset.outputs.filter(isCoreOutput);
        const currentCoreOutputByType = new Map<CoreOutputType, Output>(
          [...coreOutputs]
            .sort((left, right) =>
              right.updatedAt.localeCompare(left.updatedAt),
            )
            .map((output) => [output.outputType, output] as const),
        );
        const pendingOutputs = coreOutputs.filter(
          (output) =>
            output.status === 'draft' || output.status === 'internal-review',
        );
        const approvedOutputs = coreOutputs.filter(
          (output) =>
            output.status === 'approved' || output.status === 'published',
        );

        return (
          <>
            <PageHeader
              eyebrow="Plan & Output workbench"
              title="Sequence the transformation"
              description={`Turn approved recommendations for ${activeClient?.name ?? 'the active client'} into a phased roadmap and a small set of controlled client outputs.`}
              metadata={[
                engagement.name,
                'Simplify to Scale',
                'Review, approve, export',
              ]}
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Sequenced initiatives linked to approved opportunities."
                label="Roadmap initiatives"
                tone="accent"
                value={String(dataset.initiatives.length)}
              />
              <StatCard
                detail="Expected and realised benefits remain explicitly separate."
                label="Benefit measures"
                tone="success"
                value={String(dataset.benefitMeasurements.length)}
              />
              <StatCard
                detail="Core outputs that need review or approval before export."
                label="Outputs in progress"
                tone="warning"
                value={String(pendingOutputs.length)}
              />
              <StatCard
                detail="Approved or shared core outputs."
                label="Ready to export"
                tone="neutral"
                value={String(approvedOutputs.length)}
              />
            </section>

            <section className="content-grid content-grid--three">
              <Card
                eyebrow="Sequence"
                title="Roadmap"
                description="Place approved opportunities in Simplify, Connect, Optimise, or Scale with clear timing, priority, dependencies, and expected outcomes."
                actions={
                  <Link className="table-link" to="/roadmap">
                    Open Roadmap
                  </Link>
                }
              >
                <p className="body-copy">
                  Detailed delivery actions and milestones remain available in
                  the relevant initiative rather than becoming a task system.
                </p>
              </Card>
              <Card
                eyebrow="Measure"
                title="Benefits"
                description="Track baseline, target, expected value, actual value, confidence, and validation without conflating plans with realised impact."
                actions={
                  <Link className="table-link" to="/benefits">
                    Open Benefits
                  </Link>
                }
              >
                <p className="body-copy">
                  Benefit measures remain connected to the initiative and
                  originating opportunity they are intended to validate.
                </p>
              </Card>
              <Card
                eyebrow="Communicate"
                title="Controlled Outputs"
                description="Prepare the Landscape Map, Maturity Scorecard, Opportunity & Action Register, Roadmap, and Executive Summary."
                actions={
                  <Link className="table-link" to="/outputs">
                    Open Outputs
                  </Link>
                }
              >
                <p className="body-copy">
                  Each output stays a versioned, approval-gated projection of
                  the structured engagement evidence.
                </p>
              </Card>
            </section>

            <Card
              title="Five core outputs"
              description="The communication path from understanding through measurement, prioritisation, direction, and executive narrative."
            >
              <div className="core-output-list">
                {coreOutputTypes.map((type) => {
                  const output = currentCoreOutputByType.get(type);
                  return (
                    <Link
                      className="core-output-list__item"
                      key={type}
                      to={output ? `/outputs/${output.id}` : '/outputs'}
                    >
                      <span>{coreOutputLabels[type]}</span>
                      <Badge
                        tone={
                          output?.status === 'approved' ||
                          output?.status === 'published'
                            ? 'success'
                            : output
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {output?.status ?? 'Not started'}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </Card>
          </>
        );
      }}
    </ActiveEngagementDataView>
  );
}
