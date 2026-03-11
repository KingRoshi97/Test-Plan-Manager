import { SearchX } from "lucide-react";

interface CapabilitiesEmptyStateProps {
  message?: string;
  onReset?: () => void;
}

export function CapabilitiesEmptyState({
  message = "No capabilities found for current filter set.",
  onReset,
}: CapabilitiesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="rounded-full bg-[hsl(var(--muted)/0.3)] p-4 mb-4">
        <SearchX className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
      </div>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 max-w-md">
        {message}
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}
