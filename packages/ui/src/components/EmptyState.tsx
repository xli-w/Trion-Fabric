interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="ui-empty-state">
      <p className="ui-empty-state__eyebrow">Awaiting data</p>
      <h3>{title}</h3>
      <p>{description}</p>
    </section>
  );
}