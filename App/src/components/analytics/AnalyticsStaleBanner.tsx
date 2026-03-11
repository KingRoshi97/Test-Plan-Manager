import { Clock } from "lucide-react";

export function AnalyticsStaleBanner({ updatedAt }: { updatedAt?: string }) {
  const timeAgo = updatedAt
    ? formatTimeAgo(new Date(updatedAt))
    : "unknown";

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[hsl(var(--status-warning)/0.1)] border border-[hsl(var(--status-warning)/0.2)]">
      <Clock className="w-3.5 h-3.5 text-[hsl(var(--status-warning))]" />
      <span className="text-xs text-[hsl(var(--status-warning))]">
        Data may be stale — last updated {timeAgo}
      </span>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
