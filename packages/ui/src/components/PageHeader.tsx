import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  metadata?: string[];
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, metadata, actions }: PageHeaderProps) {
  return (
    <header className="ui-page-header">
      <div>
        <p className="ui-page-header__eyebrow">{eyebrow}</p>
        <h1 className="ui-page-header__title">{title}</h1>
        <p className="ui-page-header__description">{description}</p>
        {metadata && metadata.length > 0 ? (
          <div className="ui-page-header__meta">
            {metadata.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        ) : null}
      </div>
      {actions ? <div className="ui-page-header__actions">{actions}</div> : null}
    </header>
  );
}