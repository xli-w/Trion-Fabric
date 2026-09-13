import type { ReactNode } from 'react';

import { cx } from '../utils/cx';

interface CardProps {
  title?: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, eyebrow, description, actions, children, className }: CardProps) {
  return (
    <section className={cx('ui-card', className)}>
      {(title || eyebrow || description || actions) && (
        <header className="ui-card__header">
          <div>
            {eyebrow ? <p className="ui-card__eyebrow">{eyebrow}</p> : null}
            {title ? <h3 className="ui-card__title">{title}</h3> : null}
            {description ? <p className="ui-card__description">{description}</p> : null}
          </div>
          {actions ? <div className="ui-card__actions">{actions}</div> : null}
        </header>
      )}
      <div className="ui-card__body">{children}</div>
    </section>
  );
}