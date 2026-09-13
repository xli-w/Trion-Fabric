import { describe, expect, it } from 'vitest';

import { cx } from '../packages/ui/src/utils/cx';

describe('UI utilities', () => {
  it('cx helper joins class names cleanly omitting falsy values', () => {
    expect(cx('base', false, 'active', null, undefined, 'primary')).toBe(
      'base active primary',
    );
    expect(cx()).toBe('');
  });

  it('handles conditional class names with object-like evaluation', () => {
    const isPrimary = true;
    const isLarge = false;
    expect(cx('btn', isPrimary && 'btn--primary', isLarge && 'btn--lg')).toBe(
      'btn btn--primary',
    );
  });
});
