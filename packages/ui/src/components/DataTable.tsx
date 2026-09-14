import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { cx } from '../utils/cx';

export interface DataTableColumn<T> {
  key?: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  render: (row: T) => ReactNode;
}

export type TableDensity = 'compact' | 'normal' | 'spacious';

export interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  getRowKey: (row: T) => string;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
  selectedRowKey?: string;
  density?: TableDensity;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  getRowClassName?: (row: T) => string | undefined;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyState,
  onRowClick,
  selectedRowKey,
  density = 'normal',
  sortColumn,
  sortDirection,
  onSort,
  getRowClassName,
  className,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="ui-table-empty">
        {emptyState ?? 'No records available yet.'}
      </div>
    );
  }

  return (
    <div
      className={cx('ui-table-wrap', `ui-table-wrap--${density}`, className)}
    >
      <table className={cx('ui-table', `ui-table--${density}`)}>
        <thead>
          <tr>
            {columns.map((column, index) => {
              const colKey = column.key ?? column.header;
              const isSorted = sortColumn === colKey;
              const isSortable = Boolean(column.sortable && onSort);
              const headerContent = (
                <div
                  className={cx(
                    'ui-table__th-content',
                    column.align === 'right' && 'ui-table__th-content--right',
                    column.align === 'center' && 'ui-table__th-content--center',
                  )}
                >
                  <span>{column.header}</span>
                  {column.sortable && (
                    <span className="ui-table__sort-icon" aria-hidden="true">
                      {isSorted ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp size={14} />
                        ) : (
                          <ArrowDown size={14} />
                        )
                      ) : (
                        <ArrowUpDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              );

              return (
                <th
                  key={column.key ?? `${column.header}-${index}`}
                  style={{ width: column.width }}
                  className={cx(
                    column.align === 'right' && 'ui-table__align-right',
                    column.align === 'center' && 'ui-table__align-center',
                    isSortable && 'ui-table__th--sortable',
                    isSorted && 'ui-table__th--sorted',
                  )}
                  scope="col"
                  aria-sort={
                    isSortable
                      ? isSorted
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                      : undefined
                  }
                >
                  {isSortable ? (
                    <button
                      aria-label={`Sort by ${column.header}`}
                      className="ui-table__sort-button"
                      onClick={onSort ? () => onSort(colKey) : undefined}
                      type="button"
                    >
                      {headerContent}
                    </button>
                  ) : (
                    headerContent
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = getRowKey(row);
            const isSelected = selectedRowKey === key;
            const customClass = getRowClassName?.(row);

            return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cx(
                  onRowClick && 'ui-table__row--clickable',
                  isSelected && 'ui-table__row--selected',
                  customClass,
                )}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((column, index) => (
                  <td
                    key={column.key ?? `${column.header}-${index}`}
                    className={cx(
                      column.align === 'right' && 'ui-table__align-right',
                      column.align === 'center' && 'ui-table__align-center',
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
