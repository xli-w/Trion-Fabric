import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';

import { cx } from '../utils/cx';

export interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export function Toolbar({ children, className }: ToolbarProps) {
  return <div className={cx('ui-toolbar', className)}>{children}</div>;
}

export function ToolbarGroup({
  children,
  className,
  align = 'left',
}: {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'right';
}) {
  return (
    <div
      className={cx(
        'ui-toolbar__group',
        align === 'right' && 'ui-toolbar__group--right',
        className
      )}
    >
      {children}
    </div>
  );
}

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search records...',
  className,
  ...rest
}: SearchInputProps) {
  return (
    <div className={cx('ui-search-input-wrap', className)}>
      <Search size={16} className="ui-search-input__icon" />
      <input
        type="text"
        className="ui-search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        {...rest}
      />
      {value && (
        <button
          type="button"
          className="ui-search-input__clear"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  allLabel?: string;
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
  className,
  ...rest
}: FilterSelectProps) {
  return (
    <div className={cx('ui-filter-select-wrap', className)}>
      {label && <span className="ui-filter-select__label">{label}:</span>}
      <select
        className="ui-filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      >
        {allLabel !== undefined && <option value="">{allLabel}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export interface ViewToggleOption {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface ViewToggleProps {
  value: string;
  onChange: (value: string) => void;
  options: ViewToggleOption[];
  className?: string;
}

export function ViewToggle({
  value,
  onChange,
  options,
  className,
}: ViewToggleProps) {
  return (
    <div className={cx('ui-view-toggle', className)} role="radiogroup">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={cx(
              'ui-view-toggle__item',
              active && 'ui-view-toggle__item--active'
            )}
            onClick={() => onChange(opt.id)}
          >
            {opt.icon && (
              <span className="ui-view-toggle__icon">{opt.icon}</span>
            )}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
