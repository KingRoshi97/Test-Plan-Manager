import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns: _columns,
  data: _data,
  onRowClick: _onRowClick,
}: DataTableProps<T>) {
  return <div>DataTable</div>;
}
