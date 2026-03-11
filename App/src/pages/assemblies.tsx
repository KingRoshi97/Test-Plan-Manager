import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { apiRequest } from "../lib/queryClient";
import {
  Plus,
  Loader2,
  Trash2,
  ExternalLink,
  Rocket,
  Activity,
  Radio,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Boxes,
  Users,
  Layers,
  ChevronDown,
} from "lucide-react";
import { StatusChip, getStatusVariant } from "../components/ui/status-chip";
import { GlassPanel } from "../components/ui/glass-panel";
import { StageRail, parseStagesFromAssembly } from "../components/ui/stage-rail";
import { usePipelineStatus, getStallLevel, formatStallTime } from "../hooks/use-pipeline-status";
import type { Assembly } from "../../../shared/schema";

type FilterStatus = "all" | "running" | "completed" | "failed" | "queued";

const filterChips: { key: FilterStatus; label: string; icon: typeof Activity }[] = [
  { key: "all", label: "All", icon: Activity },
  { key: "running", label: "Running", icon: Radio },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
  { key: "failed", label: "Failed", icon: XCircle },
  { key: "queued", label: "Queued", icon: Clock },
];

const lifecycleOptions = ["all", "draft", "active", "in_use", "degraded", "deprecated", "archived"] as const;
type LifecycleFilter = (typeof lifecycleOptions)[number];

const lifecycleLabels: Record<string, string> = {
  all: "All Lifecycle",
  draft: "Draft",
  active: "Active",
  in_use: "In Use",
  degraded: "Degraded",
  deprecated: "Deprecated",
  archived: "Archived",
};

const lifecycleVariant: Record<string, string> = {
  draft: "neutral",
  active: "processing",
  in_use: "success",
  degraded: "warning",
  deprecated: "failure",
  archived: "neutral",
};

const usageColors: Record<string, string> = {
  live: "text-[hsl(var(--status-success))] bg-[hsl(var(--status-success)/0.12)]",
  warm: "text-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning)/0.12)]",
  idle: "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)]",
  dormant: "text-[hsl(var(--muted-foreground)/0.6)] bg-[hsl(var(--muted)/0.3)]",
};

function formatDuration(ms: number | null | undefined) {
  if (!ms) return "\u2014";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "\u2014";
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
  return date.toLocaleDateString();
}

function FilterDropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-7 py-1.5 rounded-md text-xs font-medium bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] focus:border-[hsl(var(--primary)/0.5)] focus:outline-none transition-colors cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3 h-3 text-[hsl(var(--muted-foreground))] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

export default function AssembliesPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [lifecycleFilter, setLifecycleFilter] = useState<LifecycleFilter>("all");
  const [familyFilter, setFamilyFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");

  const { data: assemblies = [], isLoading } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    queryFn: () => apiRequest("/api/assemblies"),
    refetchInterval: 5000,
  });

  const hasActiveRuns = assemblies.some((a) => a.status === "running");
  const { data: pipelineStatus } = usePipelineStatus(hasActiveRuns);

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/assemblies/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Assembly deleted");
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete assembly");
    },
  });

  const familyNames = useMemo(() => {
    const names = new Set<string>();
    assemblies.forEach((a) => {
      if ((a as any).familyName) names.add((a as any).familyName);
    });
    return Array.from(names).sort();
  }, [assemblies]);

  const ownerNames = useMemo(() => {
    const names = new Set<string>();
    assemblies.forEach((a) => {
      if ((a as any).ownerName) names.add((a as any).ownerName);
    });
    return Array.from(names).sort();
  }, [assemblies]);

  const filtered = useMemo(() => {
    let result = assemblies;
    if (activeFilter !== "all") {
      result = result.filter((a) => a.status === activeFilter);
    }
    if (lifecycleFilter !== "all") {
      result = result.filter((a) => (a as any).lifecycleState === lifecycleFilter);
    }
    if (familyFilter === "unassigned") {
      result = result.filter((a) => !(a as any).familyName);
    } else if (familyFilter !== "all") {
      result = result.filter((a) => (a as any).familyName === familyFilter);
    }
    if (ownerFilter === "unowned") {
      result = result.filter((a) => !(a as any).ownerName);
    } else if (ownerFilter !== "all") {
      result = result.filter((a) => (a as any).ownerName === ownerFilter);
    }
    return result;
  }, [assemblies, activeFilter, lifecycleFilter, familyFilter, ownerFilter]);

  const counts: Record<FilterStatus, number> = {
    all: assemblies.length,
    running: assemblies.filter((a) => a.status === "running").length,
    completed: assemblies.filter((a) => a.status === "completed").length,
    failed: assemblies.filter((a) => a.status === "failed").length,
    queued: assemblies.filter((a) => a.status === "queued").length,
  };

  const overviewCards = useMemo(() => {
    const inUse = assemblies.filter((a) => (a as any).lifecycleState === "in_use").length;
    const unowned = assemblies.filter((a) => !(a as any).ownerName).length;
    const familySet = new Set(assemblies.map((a) => (a as any).familyName).filter(Boolean));
    return { inUse, unowned, families: familySet.size };
  }, [assemblies]);

  function handleCardClick(filter: FilterStatus | string) {
    if (filter === "in_use") {
      setActiveFilter("all");
      setLifecycleFilter("in_use");
      setFamilyFilter("all");
      setOwnerFilter("all");
    } else if (filter === "unowned") {
      setActiveFilter("all");
      setLifecycleFilter("all");
      setFamilyFilter("all");
      setOwnerFilter("unowned");
    } else if (filter === "families") {
      return;
    } else {
      setActiveFilter(filter as FilterStatus);
      setLifecycleFilter("all");
      setFamilyFilter("all");
      setOwnerFilter("all");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">Assemblies</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            Track, organize, and operate all assemblies across the system
          </p>
        </div>
        <button
          onClick={() => setLocation("/new")}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          New Assembly
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {filterChips.map((chip) => {
          const isActive = activeFilter === chip.key;
          return (
            <button
              key={chip.key}
              onClick={() => setActiveFilter(chip.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
                  : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.2)] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              <chip.icon className="w-3 h-3" />
              {chip.label}
              <span
                className={`ml-0.5 tabular-nums ${
                  isActive
                    ? "text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--muted-foreground)/0.7)]"
                }`}
              >
                {counts[chip.key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <FilterDropdown
          value={lifecycleFilter}
          onChange={(v) => setLifecycleFilter(v as LifecycleFilter)}
          options={lifecycleOptions.map((o) => ({ value: o, label: lifecycleLabels[o] }))}
        />
        <FilterDropdown
          value={familyFilter}
          onChange={setFamilyFilter}
          options={[
            { value: "all", label: "All Families" },
            { value: "unassigned", label: "Unassigned" },
            ...familyNames.map((n) => ({ value: n, label: n })),
          ]}
        />
        <FilterDropdown
          value={ownerFilter}
          onChange={setOwnerFilter}
          options={[
            { value: "all", label: "All Owners" },
            { value: "unowned", label: "Unowned" },
            ...ownerNames.map((n) => ({ value: n, label: n })),
          ]}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { label: "Total", value: counts.all, icon: Boxes, filter: "all" as const, accent: "" },
          { label: "Running", value: counts.running, icon: Radio, filter: "running" as const, accent: counts.running > 0 ? "text-[hsl(var(--status-processing))]" : "" },
          { label: "Failed", value: counts.failed, icon: XCircle, filter: "failed" as const, accent: counts.failed > 0 ? "text-[hsl(var(--status-failure))]" : "" },
          { label: "In Use", value: overviewCards.inUse, icon: CheckCircle2, filter: "in_use", accent: overviewCards.inUse > 0 ? "text-[hsl(var(--status-success))]" : "" },
          { label: "Unowned", value: overviewCards.unowned, icon: Users, filter: "unowned", accent: overviewCards.unowned > 0 ? "text-[hsl(var(--status-warning))]" : "" },
          { label: "Families", value: overviewCards.families, icon: Layers, filter: "families", accent: "" },
        ].map((card) => (
          <GlassPanel
            key={card.label}
            solid
            hover
            onClick={() => handleCardClick(card.filter)}
            className="p-3 cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <card.icon className={`w-3.5 h-3.5 ${card.accent || "text-[hsl(var(--muted-foreground))]"} group-hover:text-[hsl(var(--primary))] transition-colors`} />
              <span className="text-[11px] text-[hsl(var(--muted-foreground))] font-medium">{card.label}</span>
            </div>
            <div className={`text-lg font-bold tabular-nums ${card.accent || "text-[hsl(var(--foreground))]"}`}>
              {card.value}
            </div>
          </GlassPanel>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : filtered.length === 0 ? (
        <GlassPanel solid className="p-16 text-center">
          <div className="w-14 h-14 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-7 h-7 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">
            {activeFilter === "all" && lifecycleFilter === "all" && familyFilter === "all" && ownerFilter === "all"
              ? "No assemblies yet"
              : "No matching assemblies"}
          </p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
            {activeFilter === "all" && lifecycleFilter === "all" && familyFilter === "all" && ownerFilter === "all"
              ? "Create your first assembly to get started."
              : "Try changing the filters or create a new assembly."}
          </p>
          {activeFilter === "all" && lifecycleFilter === "all" && familyFilter === "all" && ownerFilter === "all" && (
            <button
              onClick={() => setLocation("/new")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              New Assembly
            </button>
          )}
        </GlassPanel>
      ) : (
        <div className="glass-panel-solid overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left px-4 py-2.5 text-system-label">Assembly</th>
                <th className="text-left px-4 py-2.5 text-system-label">Status</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden md:table-cell">Family</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden md:table-cell">Lifecycle</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden lg:table-cell">Usage</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden lg:table-cell">Owner</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden md:table-cell">Pipeline</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden xl:table-cell">Elapsed</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden xl:table-cell">Duration</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden xl:table-cell">Updated</th>
                <th className="text-right px-4 py-2.5 text-system-label">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const ext = a as any;
                const statusEntry = a.status === "running"
                  ? pipelineStatus?.activeRuns?.find((s) => s.assemblyId === a.id)
                  : undefined;
                const stallLevel = statusEntry ? getStallLevel(statusEntry.stalledMs) : "none";

                return (
                  <tr
                    key={a.id}
                    className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--accent)/0.5)] cursor-pointer transition-colors"
                    onClick={() => setLocation(`/assembly/${a.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[hsl(var(--foreground))] text-[13px]">
                        {a.projectName}
                      </div>
                      {a.idea && (
                        <div className="text-[11px] text-[hsl(var(--muted-foreground))] truncate max-w-[200px] mt-0.5">
                          {a.idea}
                        </div>
                      )}
                      {a.preset && (
                        <span className="inline-block text-[10px] font-mono-tech text-[hsl(var(--muted-foreground)/0.7)] bg-[hsl(var(--muted)/0.5)] px-1.5 py-0.5 rounded mt-0.5">
                          {a.preset}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusChip
                          variant={stallLevel === "critical" ? "failure" : stallLevel === "warning" ? "warning" : getStatusVariant(a.status)}
                          label={stallLevel === "critical" ? "Stalled" : stallLevel === "warning" ? "Slow" : a.status}
                          pulse={a.status === "running"}
                        />
                        {stallLevel !== "none" && statusEntry && (
                          <span className={`text-[10px] flex items-center gap-1 ${
                            stallLevel === "critical" ? "text-[hsl(var(--status-failure))]" : "text-[hsl(var(--status-warning))]"
                          }`}>
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {stallLevel === "critical" ? "Stalled" : "Possibly stalled"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {ext.familyName ? (
                        <div>
                          <span className="text-xs text-[hsl(var(--foreground))]">{ext.familyName}</span>
                          {ext.familyType && (
                            <span className="block text-[10px] text-[hsl(var(--muted-foreground))] capitalize">{ext.familyType.replace(/_/g, " ")}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)]">{"\u2014"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {ext.lifecycleState ? (
                        <StatusChip
                          variant={(lifecycleVariant[ext.lifecycleState] || "neutral") as any}
                          label={lifecycleLabels[ext.lifecycleState] || ext.lifecycleState}
                        />
                      ) : (
                        <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)]">{"\u2014"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {ext.usageState ? (
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium capitalize ${usageColors[ext.usageState] || "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)]"}`}>
                          {ext.usageState}
                        </span>
                      ) : (
                        <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)]">{"\u2014"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {ext.ownerName ? (
                        <div>
                          <span className="text-xs text-[hsl(var(--foreground))]">{ext.ownerName}</span>
                          {ext.teamName && (
                            <span className="block text-[10px] text-[hsl(var(--muted-foreground))]">{ext.teamName}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[hsl(var(--muted-foreground)/0.5)] italic">Unowned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <StageRail stages={parseStagesFromAssembly((a as any).latestStages)} />
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {statusEntry ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-mono-tech text-[hsl(var(--status-processing))]">
                            {formatStallTime(statusEntry.elapsedMs)}
                          </span>
                          {statusEntry.stalledMs > 0 && (
                            <span className={`text-[10px] font-mono-tech ${
                              stallLevel === "critical" ? "text-[hsl(var(--status-failure))]" : stallLevel === "warning" ? "text-[hsl(var(--status-warning))]" : "text-[hsl(var(--muted-foreground))]"
                            }`}>
                              {formatStallTime(statusEntry.stalledMs)} idle
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono-tech">
                          {"\u2014"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono-tech">
                        {formatDuration(a.totalDurationMs)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {formatDate(a.updatedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setLocation(`/assembly/${a.id}`)}
                          className="p-1.5 rounded hover:bg-[hsl(var(--accent))] transition-colors"
                          title="Open Assembly"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this assembly?")) deleteMutation.mutate(a.id);
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded hover:bg-[hsl(var(--status-failure)/0.15)] transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[hsl(var(--status-failure))]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
