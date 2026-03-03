import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderBottom: '2px solid #e5e7eb',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                borderBottom: '1px solid #f3f4f6',
              }}
              onMouseEnter={(e) => {
                if (onRowClick) e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
              }}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '10px 12px', color: '#374151' }}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
