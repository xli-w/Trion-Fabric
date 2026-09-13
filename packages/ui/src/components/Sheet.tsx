import type { ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { cx } from '../utils/cx';

export type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: SheetSize;
  side?: 'right' | 'left';
}

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  eyebrow,
  children,
  footer,
  size = 'md',
  side = 'right',
}: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="ui-sheet-overlay" />
        <DialogPrimitive.Content
          className={cx(
            'ui-sheet-content',
            `ui-sheet-content--${side}`,
            `ui-sheet-content--${size}`
          )}
        >
          <div className="ui-sheet-header">
            <div className="ui-sheet-header__content">
              {eyebrow && <div className="ui-sheet-eyebrow">{eyebrow}</div>}
              {title && (
                <DialogPrimitive.Title className="ui-sheet-title">
                  {title}
                </DialogPrimitive.Title>
              )}
              {description && (
                <DialogPrimitive.Description className="ui-sheet-description">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close className="ui-sheet-close" aria-label="Close panel">
              <X size={18} />
            </DialogPrimitive.Close>
          </div>

          <div className="ui-sheet-body">{children}</div>

          {footer && <div className="ui-sheet-footer">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
