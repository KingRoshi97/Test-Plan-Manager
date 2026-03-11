import type { ReactNode } from "react";

interface AnalyticsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

const gridCols: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function AnalyticsGrid({ children, columns = 4 }: AnalyticsGridProps) {
  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {children}
    </div>
  );
}
