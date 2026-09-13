import type { ReactNode } from 'react';
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';

import { cx } from '../utils/cx';

export interface DropdownMenuItemConfig {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: () => void;
}

export interface DropdownMenuProps {
  trigger: ReactNode;
  items?: Array<DropdownMenuItemConfig | 'separator'>;
  children?: ReactNode;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  children,
  align = 'end',
  sideOffset = 4,
  className,
}: DropdownMenuProps) {
  return (
    <DropdownPrimitive.Root>
      <DropdownPrimitive.Trigger asChild>{trigger}</DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          align={align}
          sideOffset={sideOffset}
          className={cx('ui-dropdown-content', className)}
        >
          {items
            ? items.map((item, index) => {
                if (item === 'separator') {
                  return (
                    <DropdownPrimitive.Separator
                      key={`sep-${index}`}
                      className="ui-dropdown-separator"
                    />
                  );
                }
                return (
                  <DropdownPrimitive.Item
                    key={item.id}
                    disabled={item.disabled}
                    onSelect={item.onSelect}
                    className={cx(
                      'ui-dropdown-item',
                      item.destructive && 'ui-dropdown-item--destructive'
                    )}
                  >
                    {item.icon && (
                      <span className="ui-dropdown-item__icon">{item.icon}</span>
                    )}
                    <span className="ui-dropdown-item__label">{item.label}</span>
                    {item.shortcut && (
                      <span className="ui-dropdown-item__shortcut">{item.shortcut}</span>
                    )}
                  </DropdownPrimitive.Item>
                );
              })
            : children}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}

export const DropdownMenuRoot = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuContent = DropdownPrimitive.Content;
export const DropdownMenuItem = DropdownPrimitive.Item;
export const DropdownMenuSeparator = DropdownPrimitive.Separator;
export const DropdownMenuLabel = DropdownPrimitive.Label;
