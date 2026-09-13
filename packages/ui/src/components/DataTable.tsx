import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  header: string;
  width?: string;
  align?: 'left' | 'right';
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  getRowKey: (row: T) => string;
  emptyState?: ReactNode;
}

export function DataTable<T>({ columns, rows, getRowKey, emptyState }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <div className="ui-table-empty">{emptyState ?? 'No records available yet.'}</div>;
  }

  return (
    <div className="ui-table-wrap">
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                style={{ width: column.width }}
                className={column.align === 'right' ? 'ui-table__align-right' : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={column.align === 'right' ? 'ui-table__align-right' : undefined}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}