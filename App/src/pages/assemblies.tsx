import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { apiRequest } from "../lib/queryClient";
import { Plus, Loader2, Rocket } from "lucide-react";
import { GlassPanel } from "../components/ui/glass-panel";
import { usePipelineStatus } from "../hooks/use-pipeline-status";
import type { Assembly } from "../../../shared/schema";
import {
  type FilterStatus,
  type LifecycleFilter,
  type UsageFilter,
  type RiskFilter,
  type OwnershipFilter,
  type EcosystemFilter,
  type ViewSetters,
  type SavedView,
  getAssignedAgents,
  getAssignmentHealth,
  getAttentionFlags,
  isRetirementCandidate,
  getDependencyRisk,
  buildFamilyGroups,
  getContextAwareEmptyMessage,
} from "../lib/assembly-helpers";
import { AssembliesFilterBar, savedViews } from "../components/assemblies/AssembliesFilterBar";
import { AssembliesOverviewCards } from "../components/assemblies/AssembliesOverviewCards";
import { AssembliesTable } from "../components/assemblies/AssembliesTable";
import { QuickDetailDrawer } from "../components/assemblies/QuickDetailDrawer";

export default function AssembliesPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [lifecycleFilter, setLifecycleFilter] = useState<LifecycleFilter>("all");
  const [familyFilter, setFamilyFilter] = useState("all");
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>("all");
  const [usageFilter, setUsageFilter] = useState<UsageFilter>("all");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [ecosystemFilter, setEcosystemFilter] = useState<EcosystemFilter>("all");
  const [groupByFamily, setGroupByFamily] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState("all");
  const [drawerAssemblyId, setDrawerAssemblyId] = useState<number | null>(null);

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
      setDrawerAssemblyId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete assembly");
    },
  });

  const runPipelineMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/assemblies/${id}/run`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Pipeline started");
      setDrawerAssemblyId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to start pipeline");
    },
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      apiRequest(`/api/assemblies/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success("Assembly updated");
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update assembly");
    },
  });

  const familyNames = useMemo(() => {
    const names = new Set<string>();
    assemblies.forEach((a) => {
      if (a.familyName) names.add(a.familyName);
    });
    return Array.from(names).sort();
  }, [assemblies]);

  const filtered = useMemo(() => {
    let result = assemblies;
    if (activeFilter !== "all") {
      result = result.filter((a) => a.status === activeFilter);
    }
    if (lifecycleFilter === "retirement_candidates") {
      result = result.filter((a) => isRetirementCandidate(a));
    } else if (lifecycleFilter !== "all") {
      result = result.filter((a) => a.lifecycleState === lifecycleFilter);
    }
    if (familyFilter === "unassigned") {
      result = result.filter((a) => !a.familyName);
    } else if (familyFilter !== "all") {
      result = result.filter((a) => a.familyName === familyFilter);
    }
    if (ownershipFilter !== "all") {
      result = result.filter((a) => {
        const health = getAssignmentHealth(a);
        switch (ownershipFilter) {
          case "assigned": return health === "assigned";
          case "partial": return health === "partial";
          case "unowned": return !a.ownerName;
          case "with_agents": return getAssignedAgents(a).length > 0;
          case "without_agents": return getAssignedAgents(a).length === 0;
          case "no_control_plane": return !a.controlPlane;
          default: return true;
        }
      });
    }
    if (usageFilter === "no_telemetry") {
      result = result.filter((a) => !a.usageState);
    } else if (usageFilter !== "all") {
      result = result.filter((a) => a.usageState === usageFilter);
    }
    if (riskFilter === "flagged") {
      result = result.filter((a) => getAttentionFlags(a).length > 0);
    } else if (riskFilter !== "all") {
      result = result.filter((a) => a.riskLevel === riskFilter);
    }
    if (ecosystemFilter === "high_risk") {
      result = result.filter((a) => getDependencyRisk(a) === "high");
    } else if (ecosystemFilter !== "all") {
      result = result.filter((a) => a.ecosystemRole === ecosystemFilter);
    }
    return result;
  }, [assemblies, activeFilter, lifecycleFilter, familyFilter, ownershipFilter, usageFilter, riskFilter, ecosystemFilter]);

  const familyGroups = useMemo(() => buildFamilyGroups(filtered), [filtered]);

  const counts: Record<FilterStatus, number> = {
    all: assemblies.length,
    running: assemblies.filter((a) => a.status === "running").length,
    completed: assemblies.filter((a) => a.status === "completed").length,
    failed: assemblies.filter((a) => a.status === "failed").length,
    queued: assemblies.filter((a) => a.status === "queued").length,
  };

  const drawerAssembly = useMemo(() => {
    if (drawerAssemblyId === null) return null;
    return assemblies.find((a) => a.id === drawerAssemblyId) || null;
  }, [assemblies, drawerAssemblyId]);

  const viewSetters: ViewSetters = useMemo(() => ({
    setActiveFilter,
    setLifecycleFilter,
    setFamilyFilter,
    setOwnershipFilter,
    setUsageFilter,
    setRiskFilter,
    setEcosystemFilter,
    setGroupByFamily,
  }), []);

  const applyView = useCallback((view: SavedView) => {
    setActiveView(view.key);
    view.apply(viewSetters);
  }, [viewSetters]);

  function handleCardClick(filter: string) {
    setActiveView("");
    setActiveFilter("all");
    setLifecycleFilter("all");
    setFamilyFilter("all");
    setOwnershipFilter("all");
    setUsageFilter("all");
    setRiskFilter("all");
    setEcosystemFilter("all");
    setGroupByFamily(false);

    switch (filter) {
      case "in_use": setLifecycleFilter("in_use"); break;
      case "owned": setOwnershipFilter("assigned"); break;
      case "unowned": setOwnershipFilter("unowned"); break;
      case "with_agents": setOwnershipFilter("with_agents"); break;
      case "missing_control_plane": setOwnershipFilter("no_control_plane"); break;
      case "families": setGroupByFamily(true); break;
      case "active_lifecycle": setLifecycleFilter("in_use"); break;
      case "deprecated": setLifecycleFilter("deprecated"); break;
      case "retirement_candidates": setLifecycleFilter("retirement_candidates"); break;
      case "archived": setLifecycleFilter("archived"); break;
      case "degraded": setLifecycleFilter("degraded"); break;
      case "live_usage": setUsageFilter("live"); break;
      case "idle_usage": setUsageFilter("idle"); break;
      case "high_dep_risk": setEcosystemFilter("high_risk"); break;
      case "orphaned": setEcosystemFilter("all"); break;
      case "core_services": setEcosystemFilter("core"); break;
      default:
        if (["running", "completed", "failed", "queued"].includes(filter)) {
          setActiveFilter(filter as FilterStatus);
        }
        break;
    }
  }

  function toggleGroup(name: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const allFiltersDefault = activeFilter === "all" && lifecycleFilter === "all" && familyFilter === "all" && ownershipFilter === "all" && usageFilter === "all" && riskFilter === "all" && ecosystemFilter === "all";

  const emptyMessage = useMemo(() =>
    getContextAwareEmptyMessage(activeView, activeFilter, lifecycleFilter, ownershipFilter, usageFilter, riskFilter, ecosystemFilter, familyFilter),
    [activeView, activeFilter, lifecycleFilter, ownershipFilter, usageFilter, riskFilter, ecosystemFilter, familyFilter]
  );

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

      <AssembliesFilterBar
        activeFilter={activeFilter}
        lifecycleFilter={lifecycleFilter}
        familyFilter={familyFilter}
        ownershipFilter={ownershipFilter}
        usageFilter={usageFilter}
        riskFilter={riskFilter}
        ecosystemFilter={ecosystemFilter}
        groupByFamily={groupByFamily}
        activeView={activeView}
        counts={counts}
        familyNames={familyNames}
        onActiveFilterChange={setActiveFilter}
        onLifecycleFilterChange={setLifecycleFilter}
        onFamilyFilterChange={setFamilyFilter}
        onOwnershipFilterChange={setOwnershipFilter}
        onUsageFilterChange={setUsageFilter}
        onRiskFilterChange={setRiskFilter}
        onEcosystemFilterChange={setEcosystemFilter}
        onGroupByFamilyChange={setGroupByFamily}
        onViewChange={applyView}
        onClearActiveView={() => setActiveView("")}
      />

      <AssembliesOverviewCards
        assemblies={assemblies}
        counts={counts}
        onCardClick={handleCardClick}
      />

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
            {allFiltersDefault ? "No assemblies yet" : emptyMessage.title}
          </p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
            {allFiltersDefault
              ? "Create your first assembly to get started."
              : emptyMessage.subtitle}
          </p>
          {allFiltersDefault && (
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
        <AssembliesTable
          filtered={filtered}
          familyGroups={familyGroups}
          groupByFamily={groupByFamily}
          collapsedGroups={collapsedGroups}
          pipelineStatus={pipelineStatus}
          onToggleGroup={toggleGroup}
          onRowClick={(id) => setLocation(`/assembly/${id}`)}
          onQuickDetail={(id) => setDrawerAssemblyId(id)}
          onDelete={(id) => deleteMutation.mutate(id)}
          onPatch={(id, data) => patchMutation.mutate({ id, data })}
          isDeleting={deleteMutation.isPending}
        />
      )}

      <QuickDetailDrawer
        assembly={drawerAssembly}
        onClose={() => setDrawerAssemblyId(null)}
        onNavigate={(id) => setLocation(`/assembly/${id}`)}
        onDelete={(id) => deleteMutation.mutate(id)}
        onRunPipeline={(id) => runPipelineMutation.mutate(id)}
        onSwapAssembly={(id) => setDrawerAssemblyId(id)}
        isDeleting={deleteMutation.isPending}
        isRunning={runPipelineMutation.isPending}
      />
    </div>
  );
}
