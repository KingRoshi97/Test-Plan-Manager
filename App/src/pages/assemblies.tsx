import { useState, useMemo, useRef, Fragment, useEffect, useCallback } from "react";
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
  ChevronRight,
  FolderTree,
  PanelRightOpen,
  X,
  Play,
  Bookmark,
  Zap,
  Eye,
  MoreVertical,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Link,
  Bot,
  Network,
  Globe,
  Unplug,
  TrendingUp,
  Gauge,
  CircleDot,
  Archive,
  Sunset,
} from "lucide-react";
import { StatusChip, getStatusVariant } from "../components/ui/status-chip";
import { GlassPanel } from "../components/ui/glass-panel";
import { StageRail, parseStagesFromAssembly } from "../components/ui/stage-rail";
import { usePipelineStatus, getStallLevel, formatStallTime } from "../hooks/use-pipeline-status";
import type { Assembly } from "../../../shared/schema";

type FilterStatus = "all" | "running" | "completed" | "failed" | "queued";
type UsageFilter = "all" | "live" | "warm" | "idle" | "dormant" | "no_telemetry";
type RiskFilter = "all" | "low" | "medium" | "high" | "critical" | "flagged";
type OwnershipFilter = "all" | "assigned" | "partial" | "unowned" | "with_agents" | "without_agents" | "no_control_plane";
type EcosystemFilter = "all" | "core" | "supporting" | "adapter" | "integration" | "edge" | "experimental" | "high_risk";

const filterChips: { key: FilterStatus; label: string; icon: typeof Activity }[] = [
  { key: "all", label: "All", icon: Activity },
  { key: "running", label: "Running", icon: Radio },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
  { key: "failed", label: "Failed", icon: XCircle },
  { key: "queued", label: "Queued", icon: Clock },
];

const lifecycleOptions = ["all", "draft", "active", "in_use", "degraded", "deprecated", "archived", "retirement_candidates"] as const;
type LifecycleFilter = (typeof lifecycleOptions)[number];

const lifecycleLabels: Record<string, string> = {
  all: "All Lifecycle",
  draft: "Draft",
  active: "Active",
  in_use: "In Use",
  degraded: "Degraded",
  deprecated: "Deprecated",
  archived: "Archived",
  retirement_candidates: "Retirement Candidates",
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

const usageFilterOptions: { value: UsageFilter; label: string }[] = [
  { value: "all", label: "All Usage" },
  { value: "live", label: "Live" },
  { value: "warm", label: "Warm" },
  { value: "idle", label: "Idle" },
  { value: "dormant", label: "Dormant" },
  { value: "no_telemetry", label: "No Telemetry" },
];

const riskFilterOptions: { value: RiskFilter; label: string }[] = [
  { value: "all", label: "All Risk" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
  { value: "flagged", label: "Flagged" },
];

const ownershipFilterOptions: { value: OwnershipFilter; label: string }[] = [
  { value: "all", label: "All Ownership" },
  { value: "assigned", label: "Fully Assigned" },
  { value: "partial", label: "Partially Assigned" },
  { value: "unowned", label: "Unowned" },
  { value: "with_agents", label: "With Agents" },
  { value: "without_agents", label: "No Agents" },
  { value: "no_control_plane", label: "No Control Plane" },
];

const ecosystemFilterOptions: { value: EcosystemFilter; label: string }[] = [
  { value: "all", label: "All Ecosystem" },
  { value: "core", label: "Core" },
  { value: "supporting", label: "Supporting" },
  { value: "adapter", label: "Adapter" },
  { value: "integration", label: "Integration" },
  { value: "edge", label: "Edge" },
  { value: "experimental", label: "Experimental" },
  { value: "high_risk", label: "High Risk" },
];

const riskColors: Record<string, string> = {
  low: "bg-[hsl(var(--status-success))]",
  medium: "bg-[hsl(var(--status-warning))]",
  high: "bg-orange-500",
  critical: "bg-[hsl(var(--status-failure))]",
};

const riskLabels: Record<string, string> = {
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
  critical: "Critical Risk",
};

const deprecationLabels: Record<string, string> = {
  none: "None",
  planned: "Planned",
  announced: "Announced",
  in_progress: "In Progress",
  completed: "Completed",
};

const deprecationColors: Record<string, string> = {
  none: "",
  planned: "text-[hsl(var(--status-warning))]",
  announced: "text-orange-400",
  in_progress: "text-[hsl(var(--status-failure))]",
  completed: "text-[hsl(var(--muted-foreground))]",
};

const ecosystemRoleLabels: Record<string, string> = {
  core: "Core",
  supporting: "Supporting",
  adapter: "Adapter",
  integration: "Integration",
  edge: "Edge",
  experimental: "Experimental",
};

const ecosystemRoleColors: Record<string, string> = {
  core: "text-[hsl(var(--status-processing))] bg-[hsl(var(--status-processing)/0.12)]",
  supporting: "text-[hsl(var(--status-success))] bg-[hsl(var(--status-success)/0.12)]",
  adapter: "text-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning)/0.12)]",
  integration: "text-purple-400 bg-purple-400/10",
  edge: "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)]",
  experimental: "text-orange-400 bg-orange-400/10",
};

function getAssignedAgents(ext: any): { id: string; name: string; role?: string; status?: string }[] {
  if (!ext.assignedAgents || !Array.isArray(ext.assignedAgents)) return [];
  return ext.assignedAgents;
}

function getAssignmentHealth(ext: any): "assigned" | "partial" | "unassigned" {
  const hasOwner = !!ext.ownerName;
  const hasAgents = getAssignedAgents(ext).length > 0;
  const hasControlPlane = !!ext.controlPlane;
  if (hasOwner && hasAgents && hasControlPlane) return "assigned";
  if (hasOwner || hasAgents || hasControlPlane) return "partial";
  return "unassigned";
}

const assignmentHealthColors: Record<string, string> = {
  assigned: "text-[hsl(var(--status-success))] bg-[hsl(var(--status-success)/0.12)]",
  partial: "text-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning)/0.12)]",
  unassigned: "text-[hsl(var(--muted-foreground)/0.6)] bg-[hsl(var(--muted)/0.3)]",
};

const assignmentHealthLabels: Record<string, string> = {
  assigned: "Assigned",
  partial: "Partial",
  unassigned: "Unassigned",
};

function getDeprecationState(ext: any): string {
  return ext.deprecationState || "none";
}

function isRetirementCandidate(ext: any): boolean {
  if (ext.retirementCandidate === true) return true;
  if (ext.lifecycleState === "deprecated" && ext.usageState === "dormant") return true;
  if (ext.lifecycleState === "archived") return true;
  return false;
}

function getUpstreamDeps(ext: any): string[] {
  const dm = ext.dependencyMeta;
  if (!dm || typeof dm !== "object") return [];
  return Array.isArray(dm.upstreamDeps) ? dm.upstreamDeps : [];
}

function getDownstreamDeps(ext: any): string[] {
  const dm = ext.dependencyMeta;
  if (!dm || typeof dm !== "object") return [];
  return Array.isArray(dm.downstreamDeps) ? dm.downstreamDeps : [];
}

function getDependencyRisk(ext: any): "low" | "medium" | "high" {
  const downstream = getDownstreamDeps(ext).length;
  if (downstream >= 5) return "high";
  if (downstream >= 2) return "medium";
  return "low";
}

const depRiskColors: Record<string, string> = {
  low: "text-[hsl(var(--status-success))]",
  medium: "text-[hsl(var(--status-warning))]",
  high: "text-[hsl(var(--status-failure))]",
};

interface SavedView {
  key: string;
  label: string;
  icon: typeof Activity;
  apply: (setters: ViewSetters) => void;
}

interface ViewSetters {
  setActiveFilter: (v: FilterStatus) => void;
  setLifecycleFilter: (v: LifecycleFilter) => void;
  setFamilyFilter: (v: string) => void;
  setOwnershipFilter: (v: OwnershipFilter) => void;
  setUsageFilter: (v: UsageFilter) => void;
  setRiskFilter: (v: RiskFilter) => void;
  setEcosystemFilter: (v: EcosystemFilter) => void;
  setGroupByFamily: (v: boolean) => void;
}

function resetFilters(s: ViewSetters) {
  s.setActiveFilter("all");
  s.setLifecycleFilter("all");
  s.setFamilyFilter("all");
  s.setOwnershipFilter("all");
  s.setUsageFilter("all");
  s.setRiskFilter("all");
  s.setEcosystemFilter("all");
  s.setGroupByFamily(false);
}

const savedViews: SavedView[] = [
  { key: "all", label: "All Assemblies", icon: Boxes, apply: (s) => resetFilters(s) },
  { key: "running", label: "Running", icon: Radio, apply: (s) => { resetFilters(s); s.setActiveFilter("running"); } },
  { key: "failed", label: "Failed", icon: XCircle, apply: (s) => { resetFilters(s); s.setActiveFilter("failed"); } },
  { key: "in_use", label: "In Use", icon: CheckCircle2, apply: (s) => { resetFilters(s); s.setLifecycleFilter("in_use"); } },
  { key: "unowned", label: "Unowned", icon: Users, apply: (s) => { resetFilters(s); s.setOwnershipFilter("unowned"); } },
  { key: "no_family", label: "No Family", icon: FolderTree, apply: (s) => { resetFilters(s); s.setFamilyFilter("unassigned"); } },
  { key: "deprecated_candidates", label: "Deprecated", icon: AlertTriangle, apply: (s) => { resetFilters(s); s.setLifecycleFilter("deprecated"); } },
  { key: "at_risk_families", label: "At Risk Families", icon: Zap, apply: (s) => { resetFilters(s); s.setActiveFilter("failed"); s.setGroupByFamily(true); } },
  { key: "high_risk", label: "High Risk", icon: Shield, apply: (s) => { resetFilters(s); s.setRiskFilter("high"); } },
  { key: "no_control_plane", label: "No Control Plane", icon: Network, apply: (s) => { resetFilters(s); s.setOwnershipFilter("no_control_plane"); } },
  { key: "agentless", label: "Agentless", icon: Bot, apply: (s) => { resetFilters(s); s.setOwnershipFilter("without_agents"); } },
  { key: "partial_assignment", label: "Partial Assignment", icon: Users, apply: (s) => { resetFilters(s); s.setOwnershipFilter("partial"); } },
  { key: "deprecated_view", label: "Deprecated", icon: Sunset, apply: (s) => { resetFilters(s); s.setLifecycleFilter("deprecated"); } },
  { key: "retirement_candidates", label: "Retirement Candidates", icon: Archive, apply: (s) => { resetFilters(s); s.setLifecycleFilter("retirement_candidates"); } },
  { key: "archived_view", label: "Archived", icon: Archive, apply: (s) => { resetFilters(s); s.setLifecycleFilter("archived"); } },
  { key: "degraded_view", label: "Degraded", icon: AlertTriangle, apply: (s) => { resetFilters(s); s.setLifecycleFilter("degraded"); } },
  { key: "live", label: "Live", icon: Radio, apply: (s) => { resetFilters(s); s.setUsageFilter("live"); } },
  { key: "idle_view", label: "Idle", icon: Clock, apply: (s) => { resetFilters(s); s.setUsageFilter("idle"); } },
  { key: "high_dependency_risk", label: "High Dep Risk", icon: Zap, apply: (s) => { resetFilters(s); s.setEcosystemFilter("high_risk"); } },
  { key: "core_services", label: "Core Services", icon: Globe, apply: (s) => { resetFilters(s); s.setEcosystemFilter("core"); } },
];

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
  if (diffMs < 0) return date.toLocaleDateString();
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

interface FamilyGroup {
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

function buildFamilyGroups(assemblies: Assembly[]): FamilyGroup[] {
  const groupMap = new Map<string, Assembly[]>();

  assemblies.forEach((a) => {
    const key = (a as any).familyName || "__unassigned__";
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
      const ext = a as any;
      const lc = ext.lifecycleState;
      if (lc) lifecycleCounts[lc] = (lifecycleCounts[lc] || 0) + 1;
      if (ext.ownerName) { ownerSet.add(ext.ownerName); owned++; }
      if (ext.controlPlane) governed++;
      if (getAssignedAgents(ext).length > 0) withAgents++;
      if (lc === "active") activeLC++;
      if (lc === "in_use") inUseLC++;
      if (lc === "deprecated") deprecatedLC++;
      if (isRetirementCandidate(ext)) retCandidates++;
      if (ext.usageState === "live") liveUsage++;
      if (getDependencyRisk(ext) === "high") highDepRisk++;
      totalDependents += getDownstreamDeps(ext).length;
      totalConsumers += (ext.activeConsumers || 0);
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
      type: key === "__unassigned__" ? null : (sorted[0] as any).familyType || null,
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

function FamilyTooltip({ group, visible, position }: { group: FamilyGroup; visible: boolean; position: { x: number; y: number } }) {
  if (!visible) return null;

  const lifecycleDist: Record<string, number> = {};
  group.members.forEach((a) => {
    const lc = (a as any).lifecycleState || "unknown";
    lifecycleDist[lc] = (lifecycleDist[lc] || 0) + 1;
  });

  const flipBelow = position.y < 200;
  const clampedX = Math.max(16, Math.min(position.x, (typeof window !== "undefined" ? window.innerWidth : 1200) - 340));

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: clampedX,
        top: flipBelow ? position.y + 40 : position.y - 8,
        transform: flipBelow ? "none" : "translateY(-100%)",
      }}
    >
      <div className="glass-panel-solid rounded-lg border border-[hsl(var(--border))] shadow-xl p-3 min-w-[240px] max-w-[320px]">
        <div className="flex items-center gap-2 mb-2">
          <FolderTree className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
          <span className="text-xs font-semibold text-[hsl(var(--foreground))]">{group.name}</span>
          {group.type && (
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] capitalize bg-[hsl(var(--muted)/0.5)] px-1.5 py-0.5 rounded">
              {group.type.replace(/_/g, " ")}
            </span>
          )}
        </div>

        <div className="text-[11px] text-[hsl(var(--muted-foreground))] mb-2">
          {group.members.length} assembl{group.members.length === 1 ? "y" : "ies"}
        </div>

        <div className="space-y-1.5">
          <div>
            <span className="text-[10px] text-system-label uppercase tracking-wider">Status</span>
            <div className="flex gap-2 mt-0.5 flex-wrap">
              {group.running > 0 && <span className="text-[10px] text-[hsl(var(--status-processing))]">{group.running} running</span>}
              {group.completed > 0 && <span className="text-[10px] text-[hsl(var(--status-success))]">{group.completed} completed</span>}
              {group.failed > 0 && <span className="text-[10px] text-[hsl(var(--status-failure))]">{group.failed} failed</span>}
              {group.queued > 0 && <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{group.queued} queued</span>}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-system-label uppercase tracking-wider">Lifecycle</span>
            <div className="flex gap-2 mt-0.5 flex-wrap">
              {Object.entries(lifecycleDist).map(([lc, count]) => (
                <span key={lc} className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  {count} {lifecycleLabels[lc] || lc}
                </span>
              ))}
            </div>
          </div>

          {group.owners.length > 0 && (
            <div>
              <span className="text-[10px] text-system-label uppercase tracking-wider">Owners</span>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">
                {group.owners.join(", ")}
              </div>
            </div>
          )}

          <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
            Last activity: {formatDate(group.latestUpdate)}
          </div>
        </div>
      </div>
    </div>
  );
}

function FamilyGroupHeader({
  group,
  isExpanded,
  onToggle,
  colSpan,
}: {
  group: FamilyGroup;
  isExpanded: boolean;
  onToggle: () => void;
  colSpan: number;
}) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const rowRef = useRef<HTMLTableRowElement>(null);

  function handleMouseEnter(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPos({ x: rect.left + 60, y: rect.top });
    setTooltipVisible(true);
  }

  const total = group.members.length;

  return (
    <>
      <FamilyTooltip group={group} visible={tooltipVisible} position={tooltipPos} />
      <tr
        ref={rowRef}
        onClick={onToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setTooltipVisible(false)}
        className="bg-[hsl(var(--muted)/0.3)] hover:bg-[hsl(var(--muted)/0.5)] cursor-pointer transition-colors border-t border-[hsl(var(--border)/0.5)]"
      >
        <td colSpan={colSpan} className="px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
              )}
              <FolderTree className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
              <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
                {group.name}
              </span>
              {group.type && (
                <span className="text-[10px] text-[hsl(var(--muted-foreground))] capitalize bg-[hsl(var(--muted)/0.5)] px-1.5 py-0.5 rounded">
                  {group.type.replace(/_/g, " ")}
                </span>
              )}
            </div>

            <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
              {total} assembl{total === 1 ? "y" : "ies"}
            </span>

            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {group.running > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--status-processing))]">
                  <Radio className="w-2.5 h-2.5" /> {group.running}
                </span>
              )}
              {group.completed > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--status-success))]">
                  <CheckCircle2 className="w-2.5 h-2.5" /> {group.completed}
                </span>
              )}
              {group.failed > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--status-failure))]">
                  <XCircle className="w-2.5 h-2.5" /> {group.failed}
                </span>
              )}
              {group.dominantLifecycle && (
                <StatusChip
                  variant={(lifecycleVariant[group.dominantLifecycle] || "neutral") as any}
                  label={lifecycleLabels[group.dominantLifecycle] || group.dominantLifecycle}
                />
              )}

              <span className="text-[10px] text-[hsl(var(--muted-foreground))] hidden md:inline-flex items-center gap-0.5">
                <Users className="w-2.5 h-2.5" /> {group.owned}/{total}
              </span>
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] hidden md:inline-flex items-center gap-0.5">
                <Network className="w-2.5 h-2.5" /> {group.governed}/{total}
              </span>
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] hidden md:inline-flex items-center gap-0.5">
                <Bot className="w-2.5 h-2.5" /> {group.withAgents}/{total}
              </span>

              <span className="text-[10px] text-[hsl(var(--muted-foreground))] hidden lg:inline-flex items-center gap-0.5">
                <Activity className="w-2.5 h-2.5" /> {group.activeLifecycle + group.inUseLifecycle} active
              </span>
              {group.deprecatedLifecycle > 0 && (
                <span className="text-[10px] text-[hsl(var(--status-failure))] hidden lg:inline-flex items-center gap-0.5">
                  <Sunset className="w-2.5 h-2.5" /> {group.deprecatedLifecycle} deprecated
                </span>
              )}
              {group.retirementCandidates > 0 && (
                <span className="text-[10px] text-[hsl(var(--status-warning))] hidden lg:inline-flex items-center gap-0.5">
                  <Archive className="w-2.5 h-2.5" /> {group.retirementCandidates} retire
                </span>
              )}

              {group.liveUsage > 0 && (
                <span className="text-[10px] text-[hsl(var(--status-success))] hidden xl:inline-flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" /> {group.liveUsage} live
                </span>
              )}
              {group.highDepRisk > 0 && (
                <span className="text-[10px] text-[hsl(var(--status-failure))] hidden xl:inline-flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" /> {group.highDepRisk} high-risk
                </span>
              )}
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}

function RowActionMenu({
  assembly,
  onQuickDetail,
  onNavigate,
  onDelete,
  onPatch,
  isDeleting,
}: {
  assembly: Assembly;
  onQuickDetail: () => void;
  onNavigate: () => void;
  onDelete: () => void;
  onPatch: (data: Record<string, any>) => void;
  isDeleting?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [subMenu, setSubMenu] = useState<"lifecycle" | "risk" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSubMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const ext = assembly as any;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => { setOpen(!open); setSubMenu(null); }}
        className="p-1.5 rounded hover:bg-[hsl(var(--accent))] transition-colors"
        title="Actions"
      >
        <MoreVertical className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 glass-panel-solid border border-[hsl(var(--border))] rounded-lg shadow-xl py-1 text-xs">
          <button
            onClick={() => { onQuickDetail(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[hsl(var(--accent)/0.5)] transition-colors text-left"
          >
            <Eye className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
            Quick Detail
          </button>
          <button
            onClick={() => { onNavigate(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[hsl(var(--accent)/0.5)] transition-colors text-left"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
            Open Workbench
          </button>
          <div className="border-t border-[hsl(var(--border)/0.5)] my-1" />
          <button
            onClick={() => setSubMenu(subMenu === "lifecycle" ? null : "lifecycle")}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[hsl(var(--accent)/0.5)] transition-colors text-left"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
              Set Lifecycle
            </span>
            <ChevronRight className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
          </button>
          {subMenu === "lifecycle" && (
            <div className="ml-2 mr-1 mb-1 border-l border-[hsl(var(--border)/0.3)] pl-2">
              {(["draft", "active", "in_use", "degraded", "deprecated", "archived"] as const).map((lc) => (
                <button
                  key={lc}
                  onClick={() => { onPatch({ lifecycleState: lc }); setOpen(false); setSubMenu(null); }}
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-[hsl(var(--accent)/0.5)] transition-colors text-left ${ext.lifecycleState === lc ? "text-[hsl(var(--primary))]" : ""}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${lifecycleVariant[lc] === "success" ? "bg-[hsl(var(--status-success))]" : lifecycleVariant[lc] === "processing" ? "bg-[hsl(var(--status-processing))]" : lifecycleVariant[lc] === "warning" ? "bg-[hsl(var(--status-warning))]" : lifecycleVariant[lc] === "failure" ? "bg-[hsl(var(--status-failure))]" : "bg-[hsl(var(--muted-foreground))]"}`} />
                  {lifecycleLabels[lc]}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setSubMenu(subMenu === "risk" ? null : "risk")}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[hsl(var(--accent)/0.5)] transition-colors text-left"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
              Set Risk
            </span>
            <ChevronRight className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
          </button>
          {subMenu === "risk" && (
            <div className="ml-2 mr-1 mb-1 border-l border-[hsl(var(--border)/0.3)] pl-2">
              {(["low", "medium", "high", "critical"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => { onPatch({ riskLevel: r }); setOpen(false); setSubMenu(null); }}
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-[hsl(var(--accent)/0.5)] transition-colors text-left capitalize ${ext.riskLevel === r ? "text-[hsl(var(--primary))]" : ""}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${riskColors[r]}`} />
                  {r}
                </button>
              ))}
              <button
                onClick={() => { onPatch({ riskLevel: null }); setOpen(false); setSubMenu(null); }}
                className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-[hsl(var(--accent)/0.5)] transition-colors text-left text-[hsl(var(--muted-foreground))]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--muted-foreground)/0.3)]" />
                Clear
              </button>
            </div>
          )}
          <div className="border-t border-[hsl(var(--border)/0.5)] my-1" />
          <button
            onClick={() => {
              if (confirm("Delete this assembly?")) { onDelete(); setOpen(false); }
            }}
            disabled={isDeleting}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[hsl(var(--status-failure)/0.1)] transition-colors text-left text-[hsl(var(--status-failure))] disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Assembly
          </button>
        </div>
      )}
    </div>
  );
}

function RelationshipsSection({ assemblyId, onSwap }: { assemblyId: number; onSwap: (id: number) => void }) {
  const { data, isLoading } = useQuery<{
    parent: { id: number; projectName: string; status: string } | null;
    children: { id: number; projectName: string; status: string }[];
    upstreamDeps: string[];
    downstreamDeps: string[];
    sharedRegistries: string[];
    sharedApis: string[];
  }>({
    queryKey: [`/api/assemblies/${assemblyId}/relationships`],
    queryFn: () => apiRequest(`/api/assemblies/${assemblyId}/relationships`),
    enabled: !!assemblyId,
  });

  if (isLoading) return (
    <DrawerSection label="Relationships">
      <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <Loader2 className="w-3 h-3 animate-spin" /> Loading...
      </div>
    </DrawerSection>
  );

  if (!data) return null;

  const hasRelationships = data.parent || data.children.length > 0 || data.upstreamDeps.length > 0 || data.downstreamDeps.length > 0 || data.sharedRegistries.length > 0 || data.sharedApis.length > 0;

  if (!hasRelationships) return (
    <DrawerSection label="Relationships">
      <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)] italic">No relationships</span>
    </DrawerSection>
  );

  return (
    <DrawerSection label="Relationships">
      <div className="space-y-2">
        {data.parent && (
          <div>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-0.5">Parent</span>
            <button
              onClick={() => onSwap(data.parent!.id)}
              className="flex items-center gap-1.5 text-xs text-[hsl(var(--primary))] hover:underline"
            >
              <ArrowUpRight className="w-3 h-3" />
              {data.parent.projectName}
              <StatusChip variant={getStatusVariant(data.parent.status)} label={data.parent.status} />
            </button>
          </div>
        )}
        {data.children.length > 0 && (
          <div>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-0.5">Children ({data.children.length})</span>
            <div className="space-y-1">
              {data.children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSwap(c.id)}
                  className="flex items-center gap-1.5 text-xs text-[hsl(var(--primary))] hover:underline"
                >
                  <ArrowDownRight className="w-3 h-3" />
                  {c.projectName}
                  <StatusChip variant={getStatusVariant(c.status)} label={c.status} />
                </button>
              ))}
            </div>
          </div>
        )}
        {data.upstreamDeps.length > 0 && (
          <div>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-0.5">Upstream Dependencies</span>
            <div className="flex flex-wrap gap-1">
              {data.upstreamDeps.map((d) => (
                <span key={d} className="text-[10px] font-mono-tech text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)] px-1.5 py-0.5 rounded">{d}</span>
              ))}
            </div>
          </div>
        )}
        {data.downstreamDeps.length > 0 && (
          <div>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-0.5">Downstream Dependents</span>
            <div className="flex flex-wrap gap-1">
              {data.downstreamDeps.map((d) => (
                <span key={d} className="text-[10px] font-mono-tech text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)] px-1.5 py-0.5 rounded">{d}</span>
              ))}
            </div>
          </div>
        )}
        {(data.sharedApis.length > 0 || data.sharedRegistries.length > 0) && (
          <div>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-0.5">Shared Resources</span>
            <div className="flex flex-wrap gap-1">
              {data.sharedApis.map((a) => (
                <span key={a} className="text-[10px] font-mono-tech text-[hsl(var(--status-processing))] bg-[hsl(var(--status-processing)/0.1)] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Link className="w-2.5 h-2.5" />{a}
                </span>
              ))}
              {data.sharedRegistries.map((r) => (
                <span key={r} className="text-[10px] font-mono-tech text-[hsl(var(--status-success))] bg-[hsl(var(--status-success)/0.1)] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Boxes className="w-2.5 h-2.5" />{r}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </DrawerSection>
  );
}

function QuickDetailDrawer({
  assembly,
  onClose,
  onNavigate,
  onDelete,
  onRunPipeline,
  onSwapAssembly,
  isDeleting,
  isRunning,
}: {
  assembly: Assembly | null;
  onClose: () => void;
  onNavigate: (id: number) => void;
  onDelete: (id: number) => void;
  onRunPipeline: (id: number) => void;
  onSwapAssembly: (id: number) => void;
  isDeleting?: boolean;
  isRunning?: boolean;
}) {
  useEffect(() => {
    if (!assembly) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [assembly, onClose]);

  if (!assembly) return null;

  const ext = assembly as any;
  const agents = getAssignedAgents(ext);
  const health = getAssignmentHealth(ext);
  const depState = getDeprecationState(ext);
  const isRetCandidate = isRetirementCandidate(ext);
  const upstream = getUpstreamDeps(ext);
  const downstream = getDownstreamDeps(ext);
  const depRisk = getDependencyRisk(ext);

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="absolute right-0 top-0 bottom-0 w-[380px] max-w-[90vw] glass-panel-solid border-l border-[hsl(var(--border))] shadow-2xl overflow-y-auto animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <PanelRightOpen className="w-4 h-4 text-[hsl(var(--primary))] shrink-0" />
            <span className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">{assembly.projectName}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[hsl(var(--accent))] transition-colors shrink-0">
            <X className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusChip variant={getStatusVariant(assembly.status)} label={assembly.status} pulse={assembly.status === "running"} />
              {assembly.runId && (
                <span className="text-[10px] font-mono-tech text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)] px-1.5 py-0.5 rounded">
                  {assembly.runId}
                </span>
              )}
            </div>
            {assembly.idea && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{assembly.idea}</p>
            )}
          </div>

          <DrawerSection label="Family">
            {ext.familyName ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[hsl(var(--foreground))]">{ext.familyName}</span>
                {ext.familyType && (
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] capitalize bg-[hsl(var(--muted)/0.5)] px-1.5 py-0.5 rounded">
                    {ext.familyType.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)] italic">No family assigned</span>
            )}
          </DrawerSection>

          <DrawerSection label="Responsibility">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium capitalize ${assignmentHealthColors[health]}`}>
                  {assignmentHealthLabels[health]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">Owner</span>
                  {ext.ownerName ? (
                    <span className="text-[hsl(var(--foreground))]">{ext.ownerName}</span>
                  ) : (
                    <span className="text-[hsl(var(--status-warning))] text-[11px]">Needs owner</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">Team</span>
                  <span className="text-[hsl(var(--muted-foreground))]">{ext.teamName || "\u2014"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">Control Plane</span>
                  {ext.controlPlane ? (
                    <span className="text-[hsl(var(--foreground))] font-mono-tech text-[11px]">{ext.controlPlane}</span>
                  ) : (
                    <span className="text-[hsl(var(--muted-foreground)/0.5)]">{"\u2014"}</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">Agents</span>
                  <span className="text-[hsl(var(--muted-foreground))]">{agents.length} assigned</span>
                </div>
              </div>
              {agents.length > 0 && (
                <div>
                  <span className="text-[10px] text-system-label block mb-1">Assigned Agents</span>
                  <div className="space-y-1">
                    {agents.map((agent) => (
                      <div key={agent.id} className="flex items-center gap-2 text-[11px]">
                        <Bot className="w-3 h-3 text-[hsl(var(--primary))]" />
                        <span className="text-[hsl(var(--foreground))]">{agent.name}</span>
                        {agent.role && (
                          <span className="text-[10px] text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)] px-1 py-0.5 rounded">{agent.role}</span>
                        )}
                        {agent.status && (
                          <span className={`text-[10px] ${agent.status === "active" ? "text-[hsl(var(--status-success))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                            {agent.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DrawerSection>

          <DrawerSection label="Lifecycle">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {ext.lifecycleState ? (
                  <StatusChip
                    variant={(lifecycleVariant[ext.lifecycleState] || "neutral") as any}
                    label={lifecycleLabels[ext.lifecycleState] || ext.lifecycleState}
                  />
                ) : (
                  <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)]">{"\u2014"}</span>
                )}
                {isRetCandidate && (
                  <span className="text-[10px] text-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning)/0.12)] px-1.5 py-0.5 rounded font-medium">
                    Retirement Candidate
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">Deprecation</span>
                  <span className={`${deprecationColors[depState] || "text-[hsl(var(--muted-foreground))]"}`}>
                    {deprecationLabels[depState] || depState}
                  </span>
                </div>
                {ext.deprecationTargetDate && (
                  <div>
                    <span className="text-[10px] text-system-label block mb-0.5">Target Date</span>
                    <span className="text-[hsl(var(--muted-foreground))]">{formatDate(ext.deprecationTargetDate)}</span>
                  </div>
                )}
                {ext.lifecycleUpdatedAt && (
                  <div>
                    <span className="text-[10px] text-system-label block mb-0.5">Lifecycle Updated</span>
                    <span className="text-[hsl(var(--muted-foreground))]">{formatDate(ext.lifecycleUpdatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </DrawerSection>

          <DrawerSection label="Usage & Ecosystem">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {ext.usageState ? (
                  <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium capitalize ${usageColors[ext.usageState] || "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)]"}`}>
                    {ext.usageState}
                  </span>
                ) : (
                  <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)]">No telemetry</span>
                )}
                {ext.ecosystemRole && (
                  <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium capitalize ${ecosystemRoleColors[ext.ecosystemRole] || "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)]"}`}>
                    {ecosystemRoleLabels[ext.ecosystemRole] || ext.ecosystemRole}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">Requests / 24h</span>
                  <span className="text-[hsl(var(--foreground))] font-mono-tech">
                    {ext.requestsLast24h ? ext.requestsLast24h.toLocaleString() : "0"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">Active Consumers</span>
                  <span className="text-[hsl(var(--foreground))] font-mono-tech">{ext.activeConsumers || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">Error Rate</span>
                  <span className={`font-mono-tech ${(ext.errorRatePct || 0) > 5 ? "text-[hsl(var(--status-failure))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                    {(ext.errorRatePct || 0).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">P95 Latency</span>
                  <span className="text-[hsl(var(--muted-foreground))] font-mono-tech">
                    {ext.p95LatencyMs ? `${ext.p95LatencyMs}ms` : "\u2014"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">Dependency Risk</span>
                  <span className={`font-medium ${depRiskColors[depRisk]}`}>{depRisk}</span>
                </div>
                {ext.lastActivityAt && (
                  <div>
                    <span className="text-[10px] text-system-label block mb-0.5">Last Active</span>
                    <span className="text-[hsl(var(--muted-foreground))]">{formatDate(ext.lastActivityAt)}</span>
                  </div>
                )}
              </div>
              {(upstream.length > 0 || downstream.length > 0) && (
                <div className="space-y-1.5 pt-1">
                  {upstream.length > 0 && (
                    <div>
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-0.5">Upstream ({upstream.length})</span>
                      <div className="flex flex-wrap gap-1">
                        {upstream.map((d) => (
                          <span key={d} className="text-[10px] font-mono-tech text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)] px-1.5 py-0.5 rounded">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {downstream.length > 0 && (
                    <div>
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-0.5">Downstream ({downstream.length})</span>
                      <div className="flex flex-wrap gap-1">
                        {downstream.map((d) => (
                          <span key={d} className="text-[10px] font-mono-tech text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)] px-1.5 py-0.5 rounded">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DrawerSection>

          <DrawerSection label="Pipeline">
            <div className="py-1">
              <StageRail stages={parseStagesFromAssembly(ext.latestStages)} />
            </div>
            {assembly.currentStep && (
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 block">
                Current: {assembly.currentStep}
              </span>
            )}
          </DrawerSection>

          <DrawerSection label="Activity">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-system-label block mb-0.5">Created</span>
                <span className="text-[hsl(var(--muted-foreground))]">{formatDate(assembly.createdAt)}</span>
              </div>
              <div>
                <span className="text-[10px] text-system-label block mb-0.5">Updated</span>
                <span className="text-[hsl(var(--muted-foreground))]">{formatDate(assembly.updatedAt)}</span>
              </div>
              <div>
                <span className="text-[10px] text-system-label block mb-0.5">Total Runs</span>
                <span className="text-[hsl(var(--muted-foreground))] font-mono-tech">{assembly.totalRuns ?? 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-system-label block mb-0.5">Total Duration</span>
                <span className="text-[hsl(var(--muted-foreground))] font-mono-tech">{formatDuration(assembly.totalDurationMs)}</span>
              </div>
            </div>
          </DrawerSection>

          {(ext.riskLevel || (ext.attentionFlags && Array.isArray(ext.attentionFlags) && ext.attentionFlags.length > 0)) && (
            <DrawerSection label="Risk Level">
              {ext.riskLevel && (
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${riskColors[ext.riskLevel] || "bg-[hsl(var(--muted-foreground))]"}`} />
                  <span className="text-xs text-[hsl(var(--foreground))] capitalize">{riskLabels[ext.riskLevel] || ext.riskLevel}</span>
                </div>
              )}
              {ext.attentionFlags && Array.isArray(ext.attentionFlags) && ext.attentionFlags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {ext.attentionFlags.map((flag: string) => (
                    <span key={flag} className="text-[10px] font-mono-tech text-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning)/0.1)] px-1.5 py-0.5 rounded">
                      {flag}
                    </span>
                  ))}
                </div>
              )}
            </DrawerSection>
          )}

          <RelationshipsSection assemblyId={assembly.id} onSwap={onSwapAssembly} />

          {assembly.preset && (
            <DrawerSection label="Preset">
              <span className="text-[11px] font-mono-tech text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)] px-2 py-1 rounded inline-block">
                {assembly.preset}
              </span>
            </DrawerSection>
          )}

          <div className="pt-2 border-t border-[hsl(var(--border))] space-y-2">
            <button
              onClick={() => onNavigate(assembly.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition font-medium text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Workbench
            </button>
            {assembly.status !== "running" && (
              <button
                onClick={() => onRunPipeline(assembly.id)}
                disabled={isRunning}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition font-medium text-xs disabled:opacity-50"
              >
                {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {isRunning ? "Starting..." : "Run Pipeline"}
              </button>
            )}
            <button
              onClick={() => {
                if (confirm("Delete this assembly?")) onDelete(assembly.id);
              }}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-[hsl(var(--status-failure))] hover:bg-[hsl(var(--status-failure)/0.1)] transition font-medium text-xs disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {isDeleting ? "Deleting..." : "Delete Assembly"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawerSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-[10px] text-system-label uppercase tracking-wider block mb-1.5">{label}</span>
      {children}
    </div>
  );
}

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
      if ((a as any).familyName) names.add((a as any).familyName);
    });
    return Array.from(names).sort();
  }, [assemblies]);

  const filtered = useMemo(() => {
    let result = assemblies;
    if (activeFilter !== "all") {
      result = result.filter((a) => a.status === activeFilter);
    }
    if (lifecycleFilter === "retirement_candidates") {
      result = result.filter((a) => isRetirementCandidate(a as any));
    } else if (lifecycleFilter !== "all") {
      result = result.filter((a) => (a as any).lifecycleState === lifecycleFilter);
    }
    if (familyFilter === "unassigned") {
      result = result.filter((a) => !(a as any).familyName);
    } else if (familyFilter !== "all") {
      result = result.filter((a) => (a as any).familyName === familyFilter);
    }
    if (ownershipFilter !== "all") {
      result = result.filter((a) => {
        const ext = a as any;
        const health = getAssignmentHealth(ext);
        switch (ownershipFilter) {
          case "assigned": return health === "assigned";
          case "partial": return health === "partial";
          case "unowned": return !ext.ownerName;
          case "with_agents": return getAssignedAgents(ext).length > 0;
          case "without_agents": return getAssignedAgents(ext).length === 0;
          case "no_control_plane": return !ext.controlPlane;
          default: return true;
        }
      });
    }
    if (usageFilter === "no_telemetry") {
      result = result.filter((a) => !(a as any).usageState);
    } else if (usageFilter !== "all") {
      result = result.filter((a) => (a as any).usageState === usageFilter);
    }
    if (riskFilter === "flagged") {
      result = result.filter((a) => {
        const flags = (a as any).attentionFlags;
        return flags && Array.isArray(flags) && flags.length > 0;
      });
    } else if (riskFilter !== "all") {
      result = result.filter((a) => (a as any).riskLevel === riskFilter);
    }
    if (ecosystemFilter === "high_risk") {
      result = result.filter((a) => getDependencyRisk(a as any) === "high");
    } else if (ecosystemFilter !== "all") {
      result = result.filter((a) => (a as any).ecosystemRole === ecosystemFilter);
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

  const overviewCards = useMemo(() => {
    const inUse = assemblies.filter((a) => (a as any).lifecycleState === "in_use").length;
    const owned = assemblies.filter((a) => !!(a as any).ownerName).length;
    const unowned = assemblies.filter((a) => !(a as any).ownerName).length;
    const withAgents = assemblies.filter((a) => getAssignedAgents(a as any).length > 0).length;
    const missingControlPlane = assemblies.filter((a) => !(a as any).controlPlane).length;
    const familySet = new Set(assemblies.map((a) => (a as any).familyName).filter(Boolean));
    const familiesAtRisk = Array.from(familySet).filter((name) => {
      return assemblies.some((a) => (a as any).familyName === name && a.status === "failed");
    }).length;

    const activeLC = assemblies.filter((a) => (a as any).lifecycleState === "active").length;
    const deprecated = assemblies.filter((a) => (a as any).lifecycleState === "deprecated").length;
    const retCandidates = assemblies.filter((a) => isRetirementCandidate(a as any)).length;
    const archived = assemblies.filter((a) => (a as any).lifecycleState === "archived").length;
    const degraded = assemblies.filter((a) => (a as any).lifecycleState === "degraded").length;

    const liveUsage = assemblies.filter((a) => (a as any).usageState === "live").length;
    const idleUsage = assemblies.filter((a) => (a as any).usageState === "idle" || (a as any).usageState === "dormant").length;
    const highDepRisk = assemblies.filter((a) => getDependencyRisk(a as any) === "high").length;
    const orphaned = assemblies.filter((a) => {
      const ext = a as any;
      return getUpstreamDeps(ext).length === 0 && getDownstreamDeps(ext).length === 0 && !ext.parentAssemblyId;
    }).length;
    const coreServices = assemblies.filter((a) => (a as any).ecosystemRole === "core").length;
    const totalConsumers = assemblies.reduce((sum, a) => sum + ((a as any).activeConsumers || 0), 0);

    return {
      inUse, owned, unowned, withAgents, missingControlPlane,
      families: familySet.size, familiesAtRisk,
      activeLC, deprecated, retCandidates, archived, degraded,
      liveUsage, idleUsage, highDepRisk, orphaned, coreServices, totalConsumers,
    };
  }, [assemblies]);

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
      case "idle_usage": setUsageFilter("dormant"); break;
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

  function renderAssemblyRow(a: Assembly) {
    const ext = a as any;
    const statusEntry = a.status === "running"
      ? pipelineStatus?.activeRuns?.find((s) => s.assemblyId === a.id)
      : undefined;
    const stallLevel = statusEntry ? getStallLevel(statusEntry.stalledMs) : "none";
    const agents = getAssignedAgents(ext);
    const health = getAssignmentHealth(ext);
    const depState = getDeprecationState(ext);
    const isRetCandidate = isRetirementCandidate(ext);
    const depRisk = getDependencyRisk(ext);
    const upstream = getUpstreamDeps(ext);
    const downstream = getDownstreamDeps(ext);

    return (
      <tr
        key={a.id}
        className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--accent)/0.5)] cursor-pointer transition-colors"
        onClick={() => setLocation(`/assembly/${a.id}`)}
      >
        <td className="px-4 py-3">
          <div className="font-medium text-[hsl(var(--foreground))] text-[13px] flex items-center gap-1.5">
            {ext.riskLevel && (
              <span className={`w-2 h-2 rounded-full shrink-0 ${riskColors[ext.riskLevel] || ""}`} title={riskLabels[ext.riskLevel] || ext.riskLevel} />
            )}
            {a.projectName}
          </div>
          {a.idea && (
            <div className="text-[11px] text-[hsl(var(--muted-foreground))] truncate max-w-[200px] mt-0.5">
              {a.idea}
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {a.preset && (
              <span className="inline-block text-[10px] font-mono-tech text-[hsl(var(--muted-foreground)/0.7)] bg-[hsl(var(--muted)/0.5)] px-1.5 py-0.5 rounded">
                {a.preset}
              </span>
            )}
            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${assignmentHealthColors[health]}`}>
              {assignmentHealthLabels[health]}
            </span>
            {isRetCandidate && (
              <span className="text-[10px] text-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning)/0.12)] px-1.5 py-0.5 rounded font-medium">
                Retire
              </span>
            )}
            {depState !== "none" && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${deprecationColors[depState]} bg-[hsl(var(--muted)/0.3)]`}>
                Dep: {deprecationLabels[depState]}
              </span>
            )}
          </div>
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
          <div className="flex flex-col gap-0.5">
            {ext.lifecycleState ? (
              <StatusChip
                variant={(lifecycleVariant[ext.lifecycleState] || "neutral") as any}
                label={lifecycleLabels[ext.lifecycleState] || ext.lifecycleState}
              />
            ) : (
              <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)]">{"\u2014"}</span>
            )}
            {depState !== "none" && (
              <span className={`text-[10px] ${deprecationColors[depState]}`}>
                {deprecationLabels[depState]}
              </span>
            )}
            {isRetCandidate && (
              <span className="text-[10px] text-[hsl(var(--status-warning))]">Retirement</span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <div className="flex flex-col gap-0.5">
            {ext.usageState ? (
              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium capitalize w-fit ${usageColors[ext.usageState] || "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)]"}`}>
                {ext.usageState}
              </span>
            ) : (
              <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)]">No telemetry</span>
            )}
            {ext.requestsLast24h > 0 && (
              <span className="text-[10px] font-mono-tech text-[hsl(var(--muted-foreground))]">
                {ext.requestsLast24h.toLocaleString()} req/24h
              </span>
            )}
            {ext.lastActivityAt && (
              <span className="text-[10px] text-[hsl(var(--muted-foreground)/0.6)]">
                {formatDate(ext.lastActivityAt)}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <div className="flex flex-col gap-0.5">
            {ext.ownerName ? (
              <>
                <span className="text-xs text-[hsl(var(--foreground))]">{ext.ownerName}</span>
                {ext.teamName && (
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    {ext.teamName}
                    {ext.controlPlane && <> &middot; <span className="font-mono-tech">{ext.controlPlane}</span></>}
                  </span>
                )}
                {!ext.teamName && ext.controlPlane && (
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono-tech">{ext.controlPlane}</span>
                )}
              </>
            ) : (
              <span className="text-[11px] text-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning)/0.12)] px-1.5 py-0.5 rounded w-fit">Needs owner</span>
            )}
            {agents.length > 0 && (
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] flex items-center gap-0.5">
                <Bot className="w-2.5 h-2.5" /> {agents.length} agent{agents.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
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
          {ext.ecosystemRole ? (
            <div className="flex flex-col gap-0.5">
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium capitalize w-fit ${ecosystemRoleColors[ext.ecosystemRole] || "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)]"}`}>
                {ecosystemRoleLabels[ext.ecosystemRole] || ext.ecosystemRole}
              </span>
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                {upstream.length > 0 && <span>{upstream.length} up</span>}
                {upstream.length > 0 && downstream.length > 0 && <span>&middot;</span>}
                {downstream.length > 0 && <span>{downstream.length} down</span>}
              </span>
              <span className={`text-[10px] font-medium ${depRiskColors[depRisk]}`}>
                {depRisk} dep risk
              </span>
            </div>
          ) : (
            <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)]">{"\u2014"}</span>
          )}
        </td>
        <td className="px-4 py-3 hidden xl:table-cell">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {formatDate(a.updatedAt)}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
            <RowActionMenu
              assembly={a}
              onQuickDetail={() => setDrawerAssemblyId(a.id)}
              onNavigate={() => setLocation(`/assembly/${a.id}`)}
              onDelete={() => deleteMutation.mutate(a.id)}
              onPatch={(data) => patchMutation.mutate({ id: a.id, data })}
              isDeleting={deleteMutation.isPending}
            />
          </div>
        </td>
      </tr>
    );
  }

  const TABLE_COL_COUNT = 12;
  const allFiltersDefault = activeFilter === "all" && lifecycleFilter === "all" && familyFilter === "all" && ownershipFilter === "all" && usageFilter === "all" && riskFilter === "all" && ecosystemFilter === "all";

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

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1">
        <Bookmark className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] shrink-0 mr-0.5" />
        {savedViews.map((view) => (
          <button
            key={view.key}
            onClick={() => applyView(view)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-150 shrink-0 ${
              activeView === view.key
                ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)] border border-transparent"
            }`}
          >
            <view.icon className="w-3 h-3" />
            {view.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {filterChips.map((chip) => {
          const isActive = activeFilter === chip.key;
          return (
            <button
              key={chip.key}
              onClick={() => { setActiveFilter(chip.key); setActiveView(""); }}
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
          onChange={(v) => { setLifecycleFilter(v as LifecycleFilter); setActiveView(""); }}
          options={lifecycleOptions.map((o) => ({ value: o, label: lifecycleLabels[o] }))}
        />
        <FilterDropdown
          value={familyFilter}
          onChange={(v) => { setFamilyFilter(v); setActiveView(""); }}
          options={[
            { value: "all", label: "All Families" },
            { value: "unassigned", label: "Unassigned" },
            ...familyNames.map((n) => ({ value: n, label: n })),
          ]}
        />
        <FilterDropdown
          value={ownershipFilter}
          onChange={(v) => { setOwnershipFilter(v as OwnershipFilter); setActiveView(""); }}
          options={ownershipFilterOptions}
        />
        <FilterDropdown
          value={usageFilter}
          onChange={(v) => { setUsageFilter(v as UsageFilter); setActiveView(""); }}
          options={usageFilterOptions}
        />
        <FilterDropdown
          value={riskFilter}
          onChange={(v) => { setRiskFilter(v as RiskFilter); setActiveView(""); }}
          options={riskFilterOptions}
        />
        <FilterDropdown
          value={ecosystemFilter}
          onChange={(v) => { setEcosystemFilter(v as EcosystemFilter); setActiveView(""); }}
          options={ecosystemFilterOptions}
        />
        <div className="ml-auto">
          <button
            onClick={() => { setGroupByFamily(!groupByFamily); setActiveView(""); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              groupByFamily
                ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.2)] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <FolderTree className="w-3 h-3" />
            Group by Family
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {[
          { label: "Total", value: counts.all, icon: Boxes, filter: "all", accent: "" },
          { label: "Running", value: counts.running, icon: Radio, filter: "running", accent: counts.running > 0 ? "text-[hsl(var(--status-processing))]" : "" },
          { label: "Failed", value: counts.failed, icon: XCircle, filter: "failed", accent: counts.failed > 0 ? "text-[hsl(var(--status-failure))]" : "" },
          { label: "In Use", value: overviewCards.inUse, icon: CheckCircle2, filter: "in_use", accent: overviewCards.inUse > 0 ? "text-[hsl(var(--status-success))]" : "" },
          { label: "Fully Assigned", value: assemblies.filter((a) => getAssignmentHealth(a as any) === "assigned").length, icon: Users, filter: "owned", accent: "" },
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
            {allFiltersDefault
              ? "No assemblies yet"
              : "No matching assemblies"}
          </p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
            {allFiltersDefault
              ? "Create your first assembly to get started."
              : "Try changing the filters or create a new assembly."}
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
                <th className="text-left px-4 py-2.5 text-system-label hidden xl:table-cell">Ecosystem</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden xl:table-cell">Updated</th>
                <th className="text-right px-4 py-2.5 text-system-label">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupByFamily ? (
                familyGroups.map((group) => {
                  const isExpanded = !collapsedGroups.has(group.groupKey);
                  return (
                    <Fragment key={`group-${group.groupKey}`}>
                      <FamilyGroupHeader
                        group={group}
                        isExpanded={isExpanded}
                        onToggle={() => toggleGroup(group.groupKey)}
                        colSpan={TABLE_COL_COUNT}
                      />
                      {isExpanded && group.members.map((a) => renderAssemblyRow(a))}
                    </Fragment>
                  );
                })
              ) : (
                filtered.map((a) => renderAssemblyRow(a))
              )}
            </tbody>
          </table>
        </div>
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
