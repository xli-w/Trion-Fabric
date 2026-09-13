import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cx } from '../utils/cx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export function Button({ children, className, variant = 'primary', type = 'button', ...rest }: ButtonProps) {
  return (
    <button className={cx('ui-button', `ui-button--${variant}`, className)} type={type} {...rest}>
      {children}
    </button>
  );
}