import { useState, useEffect } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2, AlertTriangle } from "lucide-react";

interface DimensionBreakdownTableProps {
  metricKey: string;
  title: string;
  dimensionName: string;
  dimensionValues: string[];
  window: string;
  unit?: string;
}

type BreakdownRow = {
  dimensionValue: string;
  value: number | null;
  status: string;
  updatedAt: string | null;
};

type SortKey = "dimensionValue" | "value";
type SortDir = "asc" | "desc";

function formatValue(value: number | null, unit?: string): string {
  if (value === null || value === undefined) return "—";
  if (unit === "percent") return `${value.toFixed(1)}%`;
  if (unit === "ms") {
    if (value < 1000) return `${Math.round(value)}ms`;
    if (value < 60000) return `${(value / 1000).toFixed(1)}s`;
    return `${(value / 60000).toFixed(1)}m`;
  }
  if (unit === "tokens") return value.toLocaleString();
  if (unit === "seconds") return `${value.toFixed(1)}s`;
  return value.toLocaleString();
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function DimensionBreakdownTable({
  metricKey,
  title,
  dimensionName,
  dimensionValues,
  window: timeWindow,
  unit,
}: DimensionBreakdownTableProps) {
  const [rows, setRows] = useState<BreakdownRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    let cancelled = false;

    async function fetchBreakdown() {
      if (dimensionValues.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const promises = dimensionValues.map(async (dimVal) => {
          const url = `/api/analytics/metrics/${encodeURIComponent(metricKey)}?window=${encodeURIComponent(timeWindow)}&dim_${encodeURIComponent(dimensionName)}=${encodeURIComponent(dimVal)}`;
          const res = await fetch(url);
          const data = await res.json();
          return {
            dimensionValue: dimVal,
            value: data.ok && data.data?.value !== undefined ? Number(data.data.value) : null,
            status: data.ok && data.data?.status ? data.data.status : "unknown",
            updatedAt: data.ok && data.data?.computed_at ? data.data.computed_at : null,
          } as BreakdownRow;
        });

        const results = await Promise.all(promises);
        if (!cancelled) setRows(results);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load breakdown");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBreakdown();
    return () => { cancelled = true; };
  }, [metricKey, dimensionName, dimensionValues, timeWindow]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedRows = [...rows].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "dimensionValue") {
      cmp = a.dimensionValue.localeCompare(b.dimensionValue);
    } else {
      cmp = (a.value ?? -Infinity) - (b.value ?? -Infinity);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="glass-panel-solid p-4">
        <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">{title} by {dimensionName}</div>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel-solid p-4">
        <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">{title} by {dimensionName}</div>
        <div className="flex items-center gap-2 py-4 justify-center">
          <AlertTriangle className="w-4 h-4 text-[hsl(var(--status-failure))]" />
          <span className="text-xs text-[hsl(var(--status-failure))]">{error}</span>
        </div>
      </div>
    );
  }

  if (rows.length === 0) return null;

  return (
    <div className="glass-panel-solid p-4">
      <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">{title} by {dimensionName}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[hsl(var(--border)/0.5)]">
              <th className="text-left pb-2 font-medium text-[hsl(var(--muted-foreground))]">
                <button onClick={() => toggleSort("dimensionValue")} className="flex items-center gap-1 hover:text-[hsl(var(--foreground))] transition-colors">
                  {dimensionName} <SortIcon col="dimensionValue" />
                </button>
              </th>
              <th className="text-right pb-2 font-medium text-[hsl(var(--muted-foreground))]">
                <button onClick={() => toggleSort("value")} className="flex items-center gap-1 ml-auto hover:text-[hsl(var(--foreground))] transition-colors">
                  Value <SortIcon col="value" />
                </button>
              </th>
              <th className="text-center pb-2 font-medium text-[hsl(var(--muted-foreground))]">Status</th>
              <th className="text-right pb-2 font-medium text-[hsl(var(--muted-foreground))]">Updated</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.dimensionValue} className="border-b border-[hsl(var(--border)/0.2)] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                <td className="py-2 text-[hsl(var(--foreground))] font-medium">{row.dimensionValue}</td>
                <td className="py-2 text-right tabular-nums text-[hsl(var(--foreground))]">{formatValue(row.value, unit)}</td>
                <td className="py-2 text-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    row.status === "ok" ? "bg-[hsl(var(--status-success))]" :
                    row.status === "warn" ? "bg-[hsl(var(--status-warning))]" :
                    row.status === "fail" ? "bg-[hsl(var(--status-failure))]" :
                    "bg-[hsl(var(--muted-foreground)/0.3)]"
                  }`} />
                </td>
                <td className="py-2 text-right text-[hsl(var(--muted-foreground))]">{formatTimeAgo(row.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
