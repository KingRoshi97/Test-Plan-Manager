import { AlertTriangle } from "lucide-react";

export function AnalyticsErrorState({ message = "Failed to load analytics data" }: { message?: string }) {
  return (
    <div className="glass-panel-solid p-6 flex items-center gap-3 border border-[hsl(var(--status-failure)/0.3)]">
      <AlertTriangle className="w-5 h-5 text-[hsl(var(--status-failure))] flex-shrink-0" />
      <p className="text-sm text-[hsl(var(--status-failure))]">{message}</p>
    </div>
  );
}
