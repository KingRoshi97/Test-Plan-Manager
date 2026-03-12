import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Loader2, AlertTriangle, BarChart3 } from "lucide-react";

interface MetricTrendChartProps {
  metricKey: string;
  title: string;
  unit?: string;
  window: string;
  granularity: string;
  compareEnabled?: boolean;
  height?: number;
  refreshToken?: number;
}

type TrendDataPoint = {
  timestamp: string;
  value: number | null;
  compareValue?: number | null;
  label: string;
  compareLabel?: string;
};

function getTimeRange(window: string): { start: string; end: string; compareStart: string; compareEnd: string } {
  const now = new Date();
  const end = now.toISOString();
  const start = new Date(now);
  const compareEnd = new Date(now);

  switch (window) {
    case "live":
    case "1h":
      start.setHours(start.getHours() - 1);
      compareEnd.setHours(compareEnd.getHours() - 1);
      break;
    case "24h":
      start.setHours(start.getHours() - 24);
      compareEnd.setHours(compareEnd.getHours() - 24);
      break;
    case "7d":
      start.setDate(start.getDate() - 7);
      compareEnd.setDate(compareEnd.getDate() - 7);
      break;
    case "30d":
      start.setDate(start.getDate() - 30);
      compareEnd.setDate(compareEnd.getDate() - 30);
      break;
    default:
      start.setHours(start.getHours() - 24);
      compareEnd.setHours(compareEnd.getHours() - 24);
  }

  const compareStart = new Date(compareEnd);
  const duration = now.getTime() - start.getTime();
  compareStart.setTime(compareEnd.getTime() - duration);

  return {
    start: start.toISOString(),
    end,
    compareStart: compareStart.toISOString(),
    compareEnd: compareEnd.toISOString(),
  };
}

function formatTimestamp(ts: string, granularity: string): string {
  const d = new Date(ts);
  if (granularity === "1m" || granularity === "5m" || granularity === "15m") {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (granularity === "1h") {
    return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatTooltipValue(value: number | null | undefined, unit?: string): string {
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

export function MetricTrendChart({
  metricKey,
  title,
  unit,
  window: timeWindow,
  granularity,
  compareEnabled = false,
  height = 220,
  refreshToken = 0,
}: MetricTrendChartProps) {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTrend() {
      setLoading(true);
      setError(null);

      try {
        const { start, end, compareStart, compareEnd } = getTimeRange(timeWindow);

        const mainUrl = `/api/analytics/metrics/${encodeURIComponent(metricKey)}/trend?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&granularity=${encodeURIComponent(granularity)}`;
        const requests: Promise<Response>[] = [fetch(mainUrl)];

        if (compareEnabled) {
          const compareUrl = `/api/analytics/metrics/${encodeURIComponent(metricKey)}/trend?start=${encodeURIComponent(compareStart)}&end=${encodeURIComponent(compareEnd)}&granularity=${encodeURIComponent(granularity)}`;
          requests.push(fetch(compareUrl));
        }

        const responses = await Promise.all(requests);
        const mainData = await responses[0].json();

        if (cancelled) return;

        if (!mainData.ok) {
          setError(mainData.error?.message || "Failed to fetch trend data");
          return;
        }

        const mainPoints = mainData.data || [];
        let comparePointsMap = new Map<number, number | null>();

        if (compareEnabled && responses[1]) {
          const compareData = await responses[1].json();
          if (compareData.ok && Array.isArray(compareData.data)) {
            const cPoints = compareData.data;
            const periodDuration = new Date(end).getTime() - new Date(start).getTime();

            for (const cp of cPoints) {
              const cpTime = new Date(cp.bucket_start).getTime();
              const alignedTime = cpTime + periodDuration;
              comparePointsMap.set(alignedTime, typeof cp.value === "number" ? cp.value : null);
            }
          }
        }

        const chartData: TrendDataPoint[] = mainPoints.map((p: any) => {
          const pTime = new Date(p.bucket_start).getTime();
          let nearestCompare: number | null = null;

          if (comparePointsMap.size > 0) {
            let bestDist = Infinity;
            for (const [alignedTime, val] of comparePointsMap) {
              const dist = Math.abs(alignedTime - pTime);
              if (dist < bestDist) {
                bestDist = dist;
                nearestCompare = val;
              }
            }
          }

          return {
            timestamp: p.bucket_start,
            value: typeof p.value === "number" ? p.value : null,
            compareValue: nearestCompare,
            label: formatTimestamp(p.bucket_start, granularity),
          };
        });

        setData(chartData);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load trend");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTrend();
    return () => { cancelled = true; };
  }, [metricKey, timeWindow, granularity, compareEnabled, refreshToken]);

  if (loading) {
    return (
      <div className="glass-panel-solid p-4" style={{ height }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{title} Trend</span>
        </div>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel-solid p-4" style={{ height }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{title} Trend</span>
        </div>
        <div className="flex items-center justify-center h-full gap-2">
          <AlertTriangle className="w-4 h-4 text-[hsl(var(--status-failure))]" />
          <span className="text-xs text-[hsl(var(--status-failure))]">{error}</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="glass-panel-solid p-4" style={{ height }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{title} Trend</span>
        </div>
        <div className="flex items-center justify-center h-full gap-2">
          <BarChart3 className="w-4 h-4 text-[hsl(var(--muted-foreground)/0.4)]" />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">No trend data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel-solid p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{title} Trend</span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradient-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`gradient-compare-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            width={45}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: any) => [formatTooltipValue(value, unit), ""]}
            labelFormatter={(label) => String(label)}
          />
          {compareEnabled && (
            <Area
              type="monotone"
              dataKey="compareValue"
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              fill={`url(#gradient-compare-${metricKey})`}
              name="Previous Period"
              dot={false}
              connectNulls
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill={`url(#gradient-${metricKey})`}
            name="Current"
            dot={false}
            connectNulls
          />
          {compareEnabled && (
            <Legend
              verticalAlign="top"
              height={24}
              wrapperStyle={{ fontSize: "10px" }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
