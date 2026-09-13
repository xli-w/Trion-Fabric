import { describe, expect, it } from 'vitest';

import { cx } from '../packages/ui/src/utils/cx';

describe('UI utilities', () => {
  it('cx helper joins class names cleanly omitting falsy values', () => {
    expect(cx('base', false, 'active', null, undefined, 'primary')).toBe(
      'base active primary'
    );
    expect(cx()).toBe('');
  });
});
