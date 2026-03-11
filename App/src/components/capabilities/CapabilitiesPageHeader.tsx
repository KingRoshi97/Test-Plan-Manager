interface CapabilitiesPageHeaderProps {
  subtitle: string;
  lastSynced?: string;
}

export function CapabilitiesPageHeader({
  subtitle,
  lastSynced,
}: CapabilitiesPageHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
        Capability Control Center
      </h1>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">{subtitle}</p>
      {lastSynced && (
        <p className="text-[11px] text-[hsl(var(--muted-foreground)/0.6)] tabular-nums">
          Last synced {lastSynced}
        </p>
      )}
    </div>
  );
}
