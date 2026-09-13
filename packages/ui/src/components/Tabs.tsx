import type { CSSProperties, ReactNode } from 'react';
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
  style?: CSSProperties;
  children?: ReactNode;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  items,
  variant = 'underline',
  className,
  style,
  children,
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      className={cx('ui-tabs', `ui-tabs--${variant}`, className)}
      style={style}
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

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  badge?: ReactNode;
  icon?: ReactNode;
}

export function TabsTrigger({
  badge,
  icon,
  children,
  className,
  ...props
}: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cx('ui-tabs-trigger', className)}
      {...props}
    >
      {icon && <span className="ui-tabs-trigger__icon">{icon}</span>}
      <span>{children}</span>
      {badge !== undefined && (
        <span className="ui-tabs-trigger__badge">{badge}</span>
      )}
    </TabsPrimitive.Trigger>
  );
}

export const TabsContent = TabsPrimitive.Content;
