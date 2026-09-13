import type { ReactNode } from 'react';

import { cx } from '../utils/cx';

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  tone?: 'neutral' | 'accent' | 'success' | 'warning';
  footer?: ReactNode;
}

export function StatCard({ label, value, detail, tone = 'neutral', footer }: StatCardProps) {
  return (
    <section className={cx('ui-stat-card', `ui-stat-card--${tone}`)}>
      <p className="ui-stat-card__label">{label}</p>
      <div className="ui-stat-card__value">{value}</div>
      <p className="ui-stat-card__detail">{detail}</p>
      {footer ? <div className="ui-stat-card__footer">{footer}</div> : null}
    </section>
  );
}