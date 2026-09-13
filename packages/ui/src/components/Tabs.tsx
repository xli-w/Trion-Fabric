import type { ReactNode } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cx } from '../utils/cx';

export type TabsVariant = 'underline' | 'pills';

export interface TabItem {
  id: string;
  label: ReactNode;
  badge?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  items?: TabItem[];
  variant?: TabsVariant;
  className?: string;
  children?: ReactNode;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  items,
  variant = 'underline',
  className,
  children,
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      className={cx('ui-tabs', `ui-tabs--${variant}`, className)}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
    >
      {items && (
        <TabsPrimitive.List className="ui-tabs-list">
          {items.map((item) => (
            <TabsPrimitive.Trigger
              key={item.id}
              value={item.id}
              disabled={item.disabled}
              className="ui-tabs-trigger"
            >
              {item.icon && <span className="ui-tabs-trigger__icon">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="ui-tabs-trigger__badge">{item.badge}</span>
              )}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
      )}
      {children}
    </TabsPrimitive.Root>
  );
}

export const TabsList = TabsPrimitive.List;
export const TabsTrigger = TabsPrimitive.Trigger;
export const TabsContent = TabsPrimitive.Content;
