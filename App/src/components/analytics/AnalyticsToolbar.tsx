import { RefreshCw } from "lucide-react";

interface AnalyticsToolbarProps {
  window: string;
  onWindowChange: (w: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

const WINDOWS = [
  { value: "live", label: "Live" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

export function AnalyticsToolbar({ window: selectedWindow, onWindowChange, onRefresh, loading }: AnalyticsToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-[hsl(var(--muted)/0.3)] rounded-lg p-0.5">
        {WINDOWS.map((w) => (
          <button
            key={w.value}
            onClick={() => onWindowChange(w.value)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              selectedWindow === w.value
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.3)] transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
