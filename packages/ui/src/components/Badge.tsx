import type { ReactNode } from 'react';

import { cx } from '../utils/cx';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={cx('ui-badge', `ui-badge--${tone}`)}>{children}</span>;
}