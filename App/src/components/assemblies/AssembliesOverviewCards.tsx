import { useState } from "react";
import {
  Boxes,
  Radio,
  XCircle,
  CheckCircle2,
  Users,
  Bot,
  Network,
  Activity,
  Sunset,
  Archive,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  Unplug,
  Globe,
  Gauge,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";
import type { Assembly } from "../../../../shared/schema";
import type { FilterStatus } from "../../lib/assembly-helpers";
import {
  getAssignmentHealth,
  getAssignedAgents,
  isRetirementCandidate,
  getDependencyRisk,
  getUpstreamDeps,
  getDownstreamDeps,
} from "../../lib/assembly-helpers";
import { useMemo } from "react";

interface AssembliesOverviewCardsProps {
  assemblies: Assembly[];
  counts: Record<FilterStatus, number>;
  onCardClick: (filter: string) => void;
}

export function AssembliesOverviewCards({ assemblies, counts, onCardClick }: AssembliesOverviewCardsProps) {
  const [expanded, setExpanded] = useState(false);

  const overviewCards = useMemo(() => {
    const inUse = assemblies.filter((a) => a.lifecycleState === "in_use").length;
    const unowned = assemblies.filter((a) => !a.ownerName).length;
    const withAgents = assemblies.filter((a) => getAssignedAgents(a).length > 0).length;
    const missingControlPlane = assemblies.filter((a) => !a.controlPlane).length;

    const deprecated = assemblies.filter((a) => a.lifecycleState === "deprecated").length;
    const retCandidates = assemblies.filter((a) => isRetirementCandidate(a)).length;
    const degraded = assemblies.filter((a) => a.lifecycleState === "degraded").length;

    const liveUsage = assemblies.filter((a) => a.usageState === "live").length;
    const idleUsage = assemblies.filter((a) => a.usageState === "idle" || a.usageState === "dormant").length;
    const highDepRisk = assemblies.filter((a) => getDependencyRisk(a) === "high").length;
    const orphaned = assemblies.filter((a) => {
      return getUpstreamDeps(a).length === 0 && getDownstreamDeps(a).length === 0 && !a.parentAssemblyId;
    }).length;
    const coreServices = assemblies.filter((a) => a.ecosystemRole === "core").length;
    const totalConsumers = assemblies.reduce((sum, a) => sum + (a.activeConsumers || 0), 0);

    return {
      inUse, unowned, withAgents, missingControlPlane,
      deprecated, retCandidates, degraded,
      liveUsage, idleUsage, highDepRisk, orphaned, coreServices, totalConsumers,
    };
  }, [assemblies]);

  const primaryStats = [
    { label: "Total", value: counts.all, filter: "all", accent: "" },
    { label: "Running", value: counts.running, filter: "running", accent: counts.running > 0 ? "text-[hsl(var(--status-processing))]" : "" },
    { label: "Failed", value: counts.failed, filter: "failed", accent: counts.failed > 0 ? "text-[hsl(var(--status-failure))]" : "" },
    { label: "Completed", value: counts.completed, filter: "completed", accent: counts.completed > 0 ? "text-[hsl(var(--status-success))]" : "" },
  ];

  const detailCards = [
    { label: "In Use", value: overviewCards.inUse, icon: CheckCircle2, filter: "in_use", accent: overviewCards.inUse > 0 ? "text-[hsl(var(--status-success))]" : "" },
    { label: "Fully Assigned", value: assemblies.filter((a) => getAssignmentHealth(a) === "assigned").length, icon: Users, filter: "owned", accent: "" },
    { label: "Unowned", value: overviewCards.unowned, icon: Users, filter: "unowned", accent: overviewCards.unowned > 0 ? "text-[hsl(var(--status-warning))]" : "" },
    { label: "With Agents", value: overviewCards.withAgents, icon: Bot, filter: "with_agents", accent: "" },
    { label: "No Ctrl Plane", value: overviewCards.missingControlPlane, icon: Network, filter: "missing_control_plane", accent: overviewCards.missingControlPlane > 0 ? "text-[hsl(var(--status-warning))]" : "" },
    { label: "Active LC", value: overviewCards.inUse, icon: Activity, filter: "active_lifecycle", accent: "" },
    { label: "Deprecated", value: overviewCards.deprecated, icon: Sunset, filter: "deprecated", accent: overviewCards.deprecated > 0 ? "text-[hsl(var(--status-failure))]" : "" },
    { label: "Retire Cand.", value: overviewCards.retCandidates, icon: Archive, filter: "retirement_candidates", accent: overviewCards.retCandidates > 0 ? "text-[hsl(var(--status-warning))]" : "" },
    { label: "Degraded", value: overviewCards.degraded, icon: AlertTriangle, filter: "degraded", accent: overviewCards.degraded > 0 ? "text-[hsl(var(--status-warning))]" : "" },
    { label: "Live Usage", value: overviewCards.liveUsage, icon: TrendingUp, filter: "live_usage", accent: overviewCards.liveUsage > 0 ? "text-[hsl(var(--status-success))]" : "" },
    { label: "Idle/Dormant", value: overviewCards.idleUsage, icon: Clock, filter: "idle_usage", accent: "" },
    { label: "High Dep Risk", value: overviewCards.highDepRisk, icon: Zap, filter: "high_dep_risk", accent: overviewCards.highDepRisk > 0 ? "text-[hsl(var(--status-failure))]" : "" },
    { label: "Orphaned", value: overviewCards.orphaned, icon: Unplug, filter: "orphaned", accent: overviewCards.orphaned > 0 ? "text-[hsl(var(--muted-foreground))]" : "" },
    { label: "Core Services", value: overviewCards.coreServices, icon: Globe, filter: "core_services", accent: overviewCards.coreServices > 0 ? "text-[hsl(var(--status-processing))]" : "" },
    { label: "Consumers", value: overviewCards.totalConsumers, icon: Gauge, filter: "all", accent: "" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {primaryStats.map((stat) => (
            <button
              key={stat.label}
              onClick={() => onCardClick(stat.filter)}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <span className={`text-base font-bold tabular-nums ${stat.accent || "text-[hsl(var(--foreground))]"}`}>
                {stat.value}
              </span>
              <span className="text-[11px] text-[hsl(var(--muted-foreground))] font-medium">
                {stat.label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors ml-auto"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Hide stats" : "More stats"}
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-1.5 animate-fade-in">
          {detailCards.map((card) => (
            <GlassPanel
              key={card.label}
              solid
              hover
              onClick={() => onCardClick(card.filter)}
              className="px-2.5 py-2 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5">
                <card.icon className={`w-3 h-3 shrink-0 ${card.accent || "text-[hsl(var(--muted-foreground))]"} group-hover:text-[hsl(var(--primary))] transition-colors`} />
                <span className="text-[11px] text-[hsl(var(--muted-foreground))] font-medium truncate">{card.label}</span>
                <span className={`text-sm font-bold tabular-nums ml-auto ${card.accent || "text-[hsl(var(--foreground))]"}`}>
                  {card.value}
                </span>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}
