export function AnalyticsLoadingState({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-panel-solid p-4 animate-pulse">
          <div className="h-3 w-24 bg-[hsl(var(--muted)/0.3)] rounded mb-3" />
          <div className="h-8 w-16 bg-[hsl(var(--muted)/0.2)] rounded mb-2" />
          <div className="h-2 w-20 bg-[hsl(var(--muted)/0.15)] rounded" />
        </div>
      ))}
    </div>
  );
}
