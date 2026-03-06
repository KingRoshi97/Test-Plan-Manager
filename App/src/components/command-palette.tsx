import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Command } from "cmdk";
import { apiRequest } from "../lib/queryClient";
import {
  Crosshair,
  Plus,
  List,
  FolderOpen,
  Heart,
  ScrollText,
  Settings,
  Blocks,
  FileSearch,
  Download,
  Play,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import type { Assembly } from "../../../shared/schema";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, string> = {
  completed: "text-[hsl(var(--status-success))]",
  running: "text-[hsl(var(--status-processing))]",
  failed: "text-[hsl(var(--status-failure))]",
  pending: "text-[hsl(var(--status-warning))]",
  draft: "text-[hsl(var(--muted-foreground))]",
};

const statusIcons: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2,
  running: Loader2,
  failed: XCircle,
  pending: Clock,
  draft: Clock,
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const { data: assemblies = [] } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    queryFn: () => apiRequest("/api/assemblies"),
    enabled: open,
  });

  const recentAssemblies = [...assemblies]
    .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())
    .slice(0, 5);

  const latestAssembly = assemblies.length > 0
    ? [...assemblies].sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())[0]
    : null;

  const failedAssemblies = assemblies.filter((a) => a.status === "failed");

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  function navigate(path: string) {
    setLocation(path);
    onOpenChange(false);
  }

  return (
    <div>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
          onClick={() => onOpenChange(false)}
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div
            className="relative w-full max-w-[560px] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              className="glass-panel-solid border border-[hsl(var(--glass-border))] overflow-hidden rounded-lg shadow-2xl"
              shouldFilter={true}
              loop
            >
              <div className="flex items-center border-b border-[hsl(var(--border))] px-4">
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search commands, pages, assemblies..."
                  className="w-full py-3 text-sm bg-transparent text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none"
                  autoFocus
                />
                <kbd className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono-tech text-[hsl(var(--muted-foreground))] bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] shrink-0">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[320px] overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
                  No results found.
                </Command.Empty>

                <Command.Group
                  heading="Navigation"
                  className="[&_[cmdk-group-heading]]:text-system-label [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
                >
                  <CommandItem icon={Crosshair} onSelect={() => navigate("/")}>
                    Command Center
                  </CommandItem>
                  <CommandItem icon={Plus} onSelect={() => navigate("/new")}>
                    New Run
                  </CommandItem>
                  <CommandItem icon={List} onSelect={() => navigate("/runs")}>
                    Runs
                  </CommandItem>
                  <CommandItem icon={FolderOpen} onSelect={() => navigate("/files")}>
                    Artifacts
                  </CommandItem>
                  <CommandItem icon={Heart} onSelect={() => navigate("/health")}>
                    Health
                  </CommandItem>
                  <CommandItem icon={ScrollText} onSelect={() => navigate("/logs")}>
                    Logs
                  </CommandItem>
                  <CommandItem icon={Settings} onSelect={() => navigate("/maintenance")}>
                    Maintenance
                  </CommandItem>
                  <CommandItem icon={Blocks} onSelect={() => navigate("/features")}>
                    Features
                  </CommandItem>
                  <CommandItem icon={FileSearch} onSelect={() => navigate("/docs")}>
                    Doc Inventory
                  </CommandItem>
                  <CommandItem icon={Download} onSelect={() => navigate("/export")}>
                    Export
                  </CommandItem>
                </Command.Group>

                <Command.Separator className="h-px bg-[hsl(var(--border))] mx-2 my-1" />

                <Command.Group
                  heading="Actions"
                  className="[&_[cmdk-group-heading]]:text-system-label [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
                >
                  <CommandItem icon={Plus} onSelect={() => navigate("/new")}>
                    Start New Run
                  </CommandItem>
                  {latestAssembly && (
                    <CommandItem icon={Wrench} onSelect={() => navigate(`/assembly/${latestAssembly.id}`)}>
                      Latest Workbench
                    </CommandItem>
                  )}
                  {failedAssemblies.length > 0 && (
                    <CommandItem icon={AlertTriangle} onSelect={() => navigate("/runs")}>
                      Review Failures ({failedAssemblies.length})
                    </CommandItem>
                  )}
                </Command.Group>

                {recentAssemblies.length > 0 && (
                  <>
                    <Command.Separator className="h-px bg-[hsl(var(--border))] mx-2 my-1" />
                    <Command.Group
                      heading="Recent Assemblies"
                      className="[&_[cmdk-group-heading]]:text-system-label [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
                    >
                      {recentAssemblies.map((assembly) => {
                        const StatusIcon = statusIcons[assembly.status ?? "draft"] ?? Clock;
                        const colorClass = statusColors[assembly.status ?? "draft"] ?? statusColors.draft;
                        return (
                          <CommandItem
                            key={assembly.id}
                            icon={StatusIcon}
                            iconClass={colorClass}
                            onSelect={() => navigate(`/assembly/${assembly.id}`)}
                          >
                            <span className="flex-1 truncate">{assembly.projectName}</span>
                            <span className={`text-[10px] font-medium uppercase ${colorClass}`}>
                              {assembly.status ?? "draft"}
                            </span>
                          </CommandItem>
                        );
                      })}
                    </Command.Group>
                  </>
                )}
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </div>
  );
}

function CommandItem({
  children,
  icon: Icon,
  iconClass,
  onSelect,
}: {
  children: React.ReactNode;
  icon: typeof CheckCircle2;
  iconClass?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[hsl(var(--foreground))] cursor-pointer transition-colors data-[selected=true]:bg-[hsl(var(--primary)/0.12)] data-[selected=true]:text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]"
    >
      <Icon className={`w-4 h-4 shrink-0 ${iconClass ?? "text-[hsl(var(--muted-foreground))]"}`} />
      {children}
    </Command.Item>
  );
}
