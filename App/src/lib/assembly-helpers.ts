import type { Assembly } from "../../../shared/schema";
import type { StatusVariant } from "../components/ui/status-chip";

export interface AssemblyWithMeta extends Assembly {
  latestStages: Record<string, unknown> | null;
}

export interface AgentInfo {
  id: string;
  name: string;
  role?: string;
  status?: string;
}

export type AssignmentHealth = "assigned" | "partial" | "unassigned";
export type DependencyRiskLevel = "low" | "medium" | "high";

export function getAssignedAgents(a: Assembly): AgentInfo[] {
  if (!a.assignedAgents || !Array.isArray(a.assignedAgents)) return [];
  return a.assignedAgents as AgentInfo[];
}

export function getAssignmentHealth(a: Assembly): AssignmentHealth {
  const hasOwner = !!a.ownerName;
  const hasAgents = getAssignedAgents(a).length > 0;
  const hasControlPlane = !!a.controlPlane;
  if (hasOwner && hasAgents && hasControlPlane) return "assigned";
  if (hasOwner || hasAgents || hasControlPlane) return "partial";
  return "unassigned";
}

export function getDeprecationState(a: Assembly): string {
  return a.deprecationState || "none";
}

export function isRetirementCandidate(a: Assembly): boolean {
  if (a.retirementCandidate === true) return true;
  if (a.lifecycleState === "deprecated" && a.usageState === "dormant") return true;
  if (a.lifecycleState === "archived") return true;
  return false;
}

export function getUpstreamDeps(a: Assembly): string[] {
  const dm = a.dependencyMeta as Record<string, unknown> | null;
  if (!dm || typeof dm !== "object") return [];
  return Array.isArray(dm.upstreamDeps) ? dm.upstreamDeps as string[] : [];
}

export function getDownstreamDeps(a: Assembly): string[] {
  const dm = a.dependencyMeta as Record<string, unknown> | null;
  if (!dm || typeof dm !== "object") return [];
  return Array.isArray(dm.downstreamDeps) ? dm.downstreamDeps as string[] : [];
}

export function getDependencyRisk(a: Assembly): DependencyRiskLevel {
  const downstream = getDownstreamDeps(a).length;
  if (downstream >= 5) return "high";
  if (downstream >= 2) return "medium";
  return "low";
}

export { formatDuration } from "./utils";

export function formatDate(d: string | Date | null | undefined) {
  if (!d) return "\u2014";
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return date.toLocaleDateString();
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
  return date.toLocaleDateString();
}

export interface FamilyGroup {
  groupKey: string;
  name: string;
  type: string | null;
  members: Assembly[];
  running: number;
  completed: number;
  failed: number;
  queued: number;
  dominantLifecycle: string | null;
  owners: string[];
  latestUpdate: string | Date | null;
  owned: number;
  governed: number;
  withAgents: number;
  activeLifecycle: number;
  inUseLifecycle: number;
  deprecatedLifecycle: number;
  retirementCandidates: number;
  liveUsage: number;
  highDepRisk: number;
  totalDependents: number;
  totalConsumers: number;
}

export function buildFamilyGroups(assemblies: Assembly[]): FamilyGroup[] {
  const groupMap = new Map<string, Assembly[]>();

  assemblies.forEach((a) => {
    const key = a.familyName || "__unassigned__";
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(a);
  });

  const groups: FamilyGroup[] = [];

  groupMap.forEach((members, key) => {
    const sorted = [...members].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const lifecycleCounts: Record<string, number> = {};
    const ownerSet = new Set<string>();

    let owned = 0, governed = 0, withAgents = 0;
    let activeLC = 0, inUseLC = 0, deprecatedLC = 0, retCandidates = 0;
    let liveUsage = 0, highDepRisk = 0, totalDependents = 0, totalConsumers = 0;

    sorted.forEach((a) => {
      const lc = a.lifecycleState;
      if (lc) lifecycleCounts[lc] = (lifecycleCounts[lc] || 0) + 1;
      if (a.ownerName) { ownerSet.add(a.ownerName); owned++; }
      if (a.controlPlane) governed++;
      if (getAssignedAgents(a).length > 0) withAgents++;
      if (lc === "active") activeLC++;
      if (lc === "in_use") inUseLC++;
      if (lc === "deprecated") deprecatedLC++;
      if (isRetirementCandidate(a)) retCandidates++;
      if (a.usageState === "live") liveUsage++;
      if (getDependencyRisk(a) === "high") highDepRisk++;
      totalDependents += getDownstreamDeps(a).length;
      totalConsumers += (a.activeConsumers || 0);
    });

    let dominantLifecycle: string | null = null;
    let maxCount = 0;
    for (const [lc, count] of Object.entries(lifecycleCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantLifecycle = lc;
      }
    }

    groups.push({
      groupKey: key,
      name: key === "__unassigned__" ? "Unassigned" : key,
      type: key === "__unassigned__" ? null : sorted[0]?.familyType || null,
      members: sorted,
      running: sorted.filter((a) => a.status === "running").length,
      completed: sorted.filter((a) => a.status === "completed").length,
      failed: sorted.filter((a) => a.status === "failed").length,
      queued: sorted.filter((a) => a.status === "queued").length,
      dominantLifecycle,
      owners: Array.from(ownerSet),
      latestUpdate: sorted[0]?.updatedAt || null,
      owned,
      governed,
      withAgents,
      activeLifecycle: activeLC,
      inUseLifecycle: inUseLC,
      deprecatedLifecycle: deprecatedLC,
      retirementCandidates: retCandidates,
      liveUsage,
      highDepRisk,
      totalDependents,
      totalConsumers,
    });
  });

  groups.sort((a, b) => {
    if (a.groupKey === "__unassigned__") return 1;
    if (b.groupKey === "__unassigned__") return -1;
    return a.name.localeCompare(b.name);
  });

  return groups;
}

export const lifecycleLabels: Record<string, string> = {
  all: "All Lifecycle",
  draft: "Draft",
  active: "Active",
  in_use: "In Use",
  degraded: "Degraded",
  deprecated: "Deprecated",
  archived: "Archived",
  retirement_candidates: "Retirement Candidates",
};

export const lifecycleVariant: Record<string, StatusVariant> = {
  draft: "neutral",
  active: "processing",
  in_use: "success",
  degraded: "warning",
  deprecated: "failure",
  archived: "neutral",
};

export const usageColors: Record<string, string> = {
  live: "text-[hsl(var(--status-success))] bg-[hsl(var(--status-success)/0.12)]",
  warm: "text-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning)/0.12)]",
  idle: "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)]",
  dormant: "text-[hsl(var(--muted-foreground)/0.6)] bg-[hsl(var(--muted)/0.3)]",
};

export const riskColors: Record<string, string> = {
  low: "bg-[hsl(var(--status-success))]",
  medium: "bg-[hsl(var(--status-warning))]",
  high: "bg-orange-500",
  critical: "bg-[hsl(var(--status-failure))]",
};

export const riskLabels: Record<string, string> = {
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
  critical: "Critical Risk",
};

export const deprecationLabels: Record<string, string> = {
  none: "None",
  planned: "Planned",
  announced: "Announced",
  in_progress: "In Progress",
  completed: "Completed",
};

export const deprecationColors: Record<string, string> = {
  none: "",
  planned: "text-[hsl(var(--status-warning))]",
  announced: "text-orange-400",
  in_progress: "text-[hsl(var(--status-failure))]",
  completed: "text-[hsl(var(--muted-foreground))]",
};

export const ecosystemRoleLabels: Record<string, string> = {
  core: "Core",
  supporting: "Supporting",
  adapter: "Adapter",
  integration: "Integration",
  edge: "Edge",
  experimental: "Experimental",
};

export const ecosystemRoleColors: Record<string, string> = {
  core: "text-[hsl(var(--status-processing))] bg-[hsl(var(--status-processing)/0.12)]",
  supporting: "text-[hsl(var(--status-success))] bg-[hsl(var(--status-success)/0.12)]",
  adapter: "text-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning)/0.12)]",
  integration: "text-purple-400 bg-purple-400/10",
  edge: "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)]",
  experimental: "text-orange-400 bg-orange-400/10",
};

export const assignmentHealthColors: Record<string, string> = {
  assigned: "text-[hsl(var(--status-success))] bg-[hsl(var(--status-success)/0.12)]",
  partial: "text-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning)/0.12)]",
  unassigned: "text-[hsl(var(--muted-foreground)/0.6)] bg-[hsl(var(--muted)/0.3)]",
};

export const assignmentHealthLabels: Record<string, string> = {
  assigned: "Assigned",
  partial: "Partial",
  unassigned: "Unassigned",
};

export function getAttentionFlags(a: Assembly): string[] {
  if (!a.attentionFlags || !Array.isArray(a.attentionFlags)) return [];
  return a.attentionFlags as string[];
}

export const depRiskColors: Record<string, string> = {
  low: "text-[hsl(var(--status-success))]",
  medium: "text-[hsl(var(--status-warning))]",
  high: "text-[hsl(var(--status-failure))]",
};

export type FilterStatus = "all" | "running" | "completed" | "failed" | "queued";
export type UsageFilter = "all" | "live" | "warm" | "idle" | "dormant" | "no_telemetry";
export type RiskFilter = "all" | "low" | "medium" | "high" | "critical" | "flagged";
export type OwnershipFilter = "all" | "assigned" | "partial" | "unowned" | "with_agents" | "without_agents" | "no_control_plane";
export type EcosystemFilter = "all" | "core" | "supporting" | "adapter" | "integration" | "edge" | "experimental" | "high_risk";

export const lifecycleOptions = ["all", "draft", "active", "in_use", "degraded", "deprecated", "archived", "retirement_candidates"] as const;
export type LifecycleFilter = (typeof lifecycleOptions)[number];

export const usageFilterOptions: { value: UsageFilter; label: string }[] = [
  { value: "all", label: "All Usage" },
  { value: "live", label: "Live" },
  { value: "warm", label: "Warm" },
  { value: "idle", label: "Idle" },
  { value: "dormant", label: "Dormant" },
  { value: "no_telemetry", label: "No Telemetry" },
];

export const riskFilterOptions: { value: RiskFilter; label: string }[] = [
  { value: "all", label: "All Risk" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
  { value: "flagged", label: "Flagged" },
];

export const ownershipFilterOptions: { value: OwnershipFilter; label: string }[] = [
  { value: "all", label: "All Ownership" },
  { value: "assigned", label: "Fully Assigned" },
  { value: "partial", label: "Partially Assigned" },
  { value: "unowned", label: "Unowned" },
  { value: "with_agents", label: "With Agents" },
  { value: "without_agents", label: "No Agents" },
  { value: "no_control_plane", label: "No Control Plane" },
];

export const ecosystemFilterOptions: { value: EcosystemFilter; label: string }[] = [
  { value: "all", label: "All Ecosystem" },
  { value: "core", label: "Core" },
  { value: "supporting", label: "Supporting" },
  { value: "adapter", label: "Adapter" },
  { value: "integration", label: "Integration" },
  { value: "edge", label: "Edge" },
  { value: "experimental", label: "Experimental" },
  { value: "high_risk", label: "High Risk" },
];

export const filterChips: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "running", label: "Running" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
  { key: "queued", label: "Queued" },
];

export interface ViewSetters {
  setActiveFilter: (v: FilterStatus) => void;
  setLifecycleFilter: (v: LifecycleFilter) => void;
  setFamilyFilter: (v: string) => void;
  setOwnershipFilter: (v: OwnershipFilter) => void;
  setUsageFilter: (v: UsageFilter) => void;
  setRiskFilter: (v: RiskFilter) => void;
  setEcosystemFilter: (v: EcosystemFilter) => void;
  setGroupByFamily: (v: boolean) => void;
}

export function resetFilters(s: ViewSetters) {
  s.setActiveFilter("all");
  s.setLifecycleFilter("all");
  s.setFamilyFilter("all");
  s.setOwnershipFilter("all");
  s.setUsageFilter("all");
  s.setRiskFilter("all");
  s.setEcosystemFilter("all");
  s.setGroupByFamily(false);
}

export interface SavedView {
  key: string;
  label: string;
  apply: (setters: ViewSetters) => void;
}

export function getContextAwareEmptyMessage(
  activeView: string,
  activeFilter: FilterStatus,
  lifecycleFilter: LifecycleFilter,
  ownershipFilter: OwnershipFilter,
  usageFilter: UsageFilter,
  riskFilter: RiskFilter,
  ecosystemFilter: EcosystemFilter,
  familyFilter: string,
): { title: string; subtitle: string } {
  if (activeView === "deprecated_view" || activeView === "deprecated_candidates" || lifecycleFilter === "deprecated") {
    return { title: "No deprecated assemblies", subtitle: "No assemblies are currently marked as deprecated." };
  }
  if (activeView === "retirement_candidates" || lifecycleFilter === "retirement_candidates") {
    return { title: "No retirement candidates", subtitle: "No assemblies currently qualify for retirement." };
  }
  if (activeView === "degraded_view" || lifecycleFilter === "degraded") {
    return { title: "No degraded assemblies", subtitle: "All assemblies are operating normally." };
  }
  if (activeView === "archived_view" || lifecycleFilter === "archived") {
    return { title: "No archived assemblies", subtitle: "No assemblies have been archived yet." };
  }
  if (activeView === "high_risk" || riskFilter === "high" || riskFilter === "critical") {
    return { title: "No high-risk assemblies", subtitle: "No assemblies are flagged as high or critical risk." };
  }
  if (activeView === "high_dependency_risk" || ecosystemFilter === "high_risk") {
    return { title: "No assemblies with high dependency risk", subtitle: "No assemblies have critical downstream dependency exposure." };
  }
  if (activeView === "unowned" || ownershipFilter === "unowned") {
    return { title: "No unowned assemblies", subtitle: "All assemblies have an assigned owner." };
  }
  if (activeView === "agentless" || ownershipFilter === "without_agents") {
    return { title: "No agentless assemblies", subtitle: "All assemblies have at least one agent assigned." };
  }
  if (activeView === "no_control_plane" || ownershipFilter === "no_control_plane") {
    return { title: "No assemblies missing a control plane", subtitle: "All assemblies have a control plane configured." };
  }
  if (activeView === "partial_assignment" || ownershipFilter === "partial") {
    return { title: "No partially assigned assemblies", subtitle: "All assemblies are either fully assigned or unowned." };
  }
  if (activeView === "failed" || activeFilter === "failed") {
    return { title: "No failed assemblies", subtitle: "All pipelines are running successfully." };
  }
  if (activeView === "running" || activeFilter === "running") {
    return { title: "No running assemblies", subtitle: "No pipelines are currently in progress." };
  }
  if (activeView === "live" || usageFilter === "live") {
    return { title: "No live assemblies", subtitle: "No assemblies have active live traffic." };
  }
  if (activeView === "idle_view" || usageFilter === "idle" || usageFilter === "dormant") {
    return { title: "No idle or dormant assemblies", subtitle: "All assemblies show recent activity." };
  }
  if (activeView === "core_services" || ecosystemFilter === "core") {
    return { title: "No core service assemblies", subtitle: "No assemblies are tagged with the core ecosystem role." };
  }
  if (activeView === "no_family" || familyFilter === "unassigned") {
    return { title: "No unassigned assemblies", subtitle: "All assemblies belong to a family group." };
  }
  if (activeView === "in_use" || lifecycleFilter === "in_use") {
    return { title: "No assemblies in use", subtitle: "No assemblies are currently in the 'in use' lifecycle state." };
  }
  if (riskFilter === "flagged") {
    return { title: "No flagged assemblies", subtitle: "No assemblies have active attention flags." };
  }
  return { title: "No matching assemblies", subtitle: "Try changing the filters or create a new assembly." };
}
