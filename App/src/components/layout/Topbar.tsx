import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { Search, Command, Radio, Server } from "lucide-react";
import type { Assembly } from "../../../../shared/schema";

interface TopbarProps {
  onSearchClick?: () => void;
}

export function Topbar({ onSearchClick }: TopbarProps) {
  const { data: assemblies = [] } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    queryFn: () => apiRequest("/api/assemblies"),
    refetchInterval: 10000,
  });

  const activeRun = assemblies.find((a) => a.status === "running");

  return (
    <header
      className="fixed top-0 right-0 z-40 flex items-center justify-between px-5 border-b border-[hsl(var(--border))]"
      style={{
        left: "var(--sidebar-width)",
        height: "var(--topbar-height)",
        background: "hsl(var(--card) / 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-colors"
          title="Command Palette (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search or command...</span>
          <kbd className="ml-4 px-1.5 py-0.5 rounded text-[10px] font-mono-tech bg-[hsl(var(--background))] border border-[hsl(var(--border))]">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {activeRun && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs glow-border-cyan bg-[hsl(var(--status-processing)/0.08)]">
            <Radio className="w-3 h-3 text-[hsl(var(--status-processing))] animate-pulse-glow" />
            <span className="text-[hsl(var(--status-processing))] font-medium truncate max-w-[140px]">
              {activeRun.projectName}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--secondary))]">
          <Server className="w-3 h-3" />
          <span>Development</span>
        </div>
      </div>
    </header>
  );
}
