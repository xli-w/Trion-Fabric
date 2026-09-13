import { Card, EmptyState, PageHeader } from '@ui';

interface PlannedPageProps {
  title: string;
  description: string;
  plannedCapabilities: string[];
}

export function PlannedPage({ title, description, plannedCapabilities }: PlannedPageProps) {
  return (
    <>
      <PageHeader
        eyebrow="Planned capability"
        title={title}
        description={description}
        metadata={['Boundary established', 'Implementation deferred', 'Architecture-ready surface']}
      />

      <section className="content-grid content-grid--two">
        <Card title="Why this surface exists now" description="The navigation, route, and domain boundary are already explicit so future work lands in a named capability rather than spreading ad hoc across the application.">
          <div className="record-stack">
            {plannedCapabilities.map((capability) => (
              <article className="record-item record-item--note" key={capability}>
                <p className="body-copy">{capability}</p>
              </article>
            ))}
          </div>
        </Card>

        <EmptyState
          title={`${title} is intentionally deferred`}
          description="The first implementation establishes structure, types, navigation, and repository seams without pretending the full workflow engine already exists."
        />
      </section>
    </>
  );
}