import { BarChart3 } from "lucide-react";

export function AnalyticsEmptyState({ message = "No data available" }: { message?: string }) {
  return (
    <div className="glass-panel-solid p-8 flex flex-col items-center justify-center text-center">
      <BarChart3 className="w-10 h-10 text-[hsl(var(--muted-foreground)/0.4)] mb-3" />
      <p className="text-sm text-[hsl(var(--muted-foreground))]">{message}</p>
    </div>
  );
}
