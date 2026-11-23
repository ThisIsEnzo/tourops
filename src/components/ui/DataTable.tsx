import type { ReactNode } from 'react';

export interface Column<T> {
  readonly key: string;
  readonly header: string;
  readonly render: (row: T) => ReactNode;
  readonly align?: 'left' | 'right';
}

export interface DataTableProps<T> {
  readonly columns: readonly Column<T>[];
  readonly rows: readonly T[];
  readonly onSelect?: (row: T) => void;
  readonly caption: string;
}

/** Dense operations table. Collapses to labelled cards below 860px via CSS. */
export function DataTable<T extends { id: string }>({ columns, rows, onSelect, caption }: DataTableProps<T>): ReactNode {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.align === 'right' ? 'is-right' : undefined}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={onSelect ? 'is-clickable' : undefined}
              tabIndex={onSelect ? 0 : undefined}
              onClick={onSelect ? () => onSelect(row) : undefined}
              onKeyDown={onSelect ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(row); }
              } : undefined}
            >
              {columns.map((column) => (
                <td key={column.key} data-label={column.header} className={column.align === 'right' ? 'is-right' : undefined}>
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