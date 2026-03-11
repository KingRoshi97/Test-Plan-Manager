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
} from "lucide-react";
import { StatusChip, getStatusVariant } from "../components/ui/status-chip";
import { GlassPanel } from "../components/ui/glass-panel";
import { StageRail, parseStagesFromAssembly } from "../components/ui/stage-rail";
import { usePipelineStatus, getStallLevel, formatStallTime } from "../hooks/use-pipeline-status";
import type { Assembly } from "../../../shared/schema";

type FilterStatus = "all" | "running" | "completed" | "failed" | "queued";
type UsageFilter = "all" | "live" | "warm" | "idle" | "dormant" | "no_telemetry";
type RiskFilter = "all" | "low" | "medium" | "high" | "critical" | "flagged";

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
  setOwnerFilter: (v: string) => void;
  setUsageFilter: (v: UsageFilter) => void;
  setRiskFilter: (v: RiskFilter) => void;
  setGroupByFamily: (v: boolean) => void;
}

const savedViews: SavedView[] = [
  {
    key: "all",
    label: "All Assemblies",
    icon: Boxes,
    apply: (s) => { s.setActiveFilter("all"); s.setLifecycleFilter("all"); s.setFamilyFilter("all"); s.setOwnerFilter("all"); s.setUsageFilter("all"); s.setRiskFilter("all"); s.setGroupByFamily(false); },
  },
  {
    key: "running",
    label: "Running",
    icon: Radio,
    apply: (s) => { s.setActiveFilter("running"); s.setLifecycleFilter("all"); s.setFamilyFilter("all"); s.setOwnerFilter("all"); s.setUsageFilter("all"); s.setRiskFilter("all"); s.setGroupByFamily(false); },
  },
  {
    key: "failed",
    label: "Failed",
    icon: XCircle,
    apply: (s) => { s.setActiveFilter("failed"); s.setLifecycleFilter("all"); s.setFamilyFilter("all"); s.setOwnerFilter("all"); s.setUsageFilter("all"); s.setRiskFilter("all"); s.setGroupByFamily(false); },
  },
  {
    key: "in_use",
    label: "In Use",
    icon: CheckCircle2,
    apply: (s) => { s.setActiveFilter("all"); s.setLifecycleFilter("in_use"); s.setFamilyFilter("all"); s.setOwnerFilter("all"); s.setUsageFilter("all"); s.setRiskFilter("all"); s.setGroupByFamily(false); },
  },
  {
    key: "unowned",
    label: "Unowned",
    icon: Users,
    apply: (s) => { s.setActiveFilter("all"); s.setLifecycleFilter("all"); s.setFamilyFilter("all"); s.setOwnerFilter("unowned"); s.setUsageFilter("all"); s.setRiskFilter("all"); s.setGroupByFamily(false); },
  },
  {
    key: "no_family",
    label: "No Family",
    icon: FolderTree,
    apply: (s) => { s.setActiveFilter("all"); s.setLifecycleFilter("all"); s.setFamilyFilter("unassigned"); s.setOwnerFilter("all"); s.setUsageFilter("all"); s.setRiskFilter("all"); s.setGroupByFamily(false); },
  },
  {
    key: "deprecated_candidates",
    label: "Deprecated Candidates",
    icon: AlertTriangle,
    apply: (s) => { s.setActiveFilter("all"); s.setLifecycleFilter("deprecated"); s.setFamilyFilter("all"); s.setOwnerFilter("all"); s.setUsageFilter("all"); s.setRiskFilter("all"); s.setGroupByFamily(false); },
  },
  {
    key: "at_risk_families",
    label: "At Risk Families",
    icon: Zap,
    apply: (s) => { s.setActiveFilter("failed"); s.setLifecycleFilter("all"); s.setFamilyFilter("all"); s.setOwnerFilter("all"); s.setUsageFilter("all"); s.setRiskFilter("all"); s.setGroupByFamily(true); },
  },
  {
    key: "high_risk",
    label: "High Risk",
    icon: Shield,
    apply: (s) => { s.setActiveFilter("all"); s.setLifecycleFilter("all"); s.setFamilyFilter("all"); s.setOwnerFilter("all"); s.setUsageFilter("all"); s.setRiskFilter("high"); s.setGroupByFamily(false); },
  },
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

    sorted.forEach((a) => {
      const lc = (a as any).lifecycleState;
      if (lc) lifecycleCounts[lc] = (lifecycleCounts[lc] || 0) + 1;
      const owner = (a as any).ownerName;
      if (owner) ownerSet.add(owner);
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
              {group.members.length} assembl{group.members.length === 1 ? "y" : "ies"}
            </span>

            <div className="flex items-center gap-2 ml-auto">
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

          <DrawerSection label="Lifecycle">
            {ext.lifecycleState ? (
              <StatusChip
                variant={(lifecycleVariant[ext.lifecycleState] || "neutral") as any}
                label={lifecycleLabels[ext.lifecycleState] || ext.lifecycleState}
              />
            ) : (
              <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)]">{"\u2014"}</span>
            )}
          </DrawerSection>

          <DrawerSection label="Usage">
            <div className="flex items-center gap-3">
              {ext.usageState ? (
                <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium capitalize ${usageColors[ext.usageState] || "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)]"}`}>
                  {ext.usageState}
                </span>
              ) : (
                <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)]">No telemetry</span>
              )}
              {ext.lastActivityAt && (
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  Last active {formatDate(ext.lastActivityAt)}
                </span>
              )}
            </div>
          </DrawerSection>

          <DrawerSection label="Owner">
            {ext.ownerName ? (
              <div>
                <span className="text-xs text-[hsl(var(--foreground))]">{ext.ownerName}</span>
                {ext.teamName && (
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] ml-2">{ext.teamName}</span>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-[hsl(var(--muted-foreground)/0.5)] italic">Unowned</span>
            )}
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
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [usageFilter, setUsageFilter] = useState<UsageFilter>("all");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
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
    return result;
  }, [assemblies, activeFilter, lifecycleFilter, familyFilter, ownerFilter, usageFilter, riskFilter]);

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
    const unowned = assemblies.filter((a) => !(a as any).ownerName).length;
    const familySet = new Set(assemblies.map((a) => (a as any).familyName).filter(Boolean));
    const familiesAtRisk = Array.from(familySet).filter((name) => {
      return assemblies.some((a) => (a as any).familyName === name && a.status === "failed");
    }).length;
    return { inUse, unowned, families: familySet.size, familiesAtRisk };
  }, [assemblies]);

  const drawerAssembly = useMemo(() => {
    if (drawerAssemblyId === null) return null;
    return assemblies.find((a) => a.id === drawerAssemblyId) || null;
  }, [assemblies, drawerAssemblyId]);

  const viewSetters: ViewSetters = useMemo(() => ({
    setActiveFilter,
    setLifecycleFilter,
    setFamilyFilter,
    setOwnerFilter,
    setUsageFilter,
    setRiskFilter,
    setGroupByFamily,
  }), []);

  const applyView = useCallback((view: SavedView) => {
    setActiveView(view.key);
    view.apply(viewSetters);
  }, [viewSetters]);

  function handleCardClick(filter: FilterStatus | string) {
    if (filter === "in_use") {
      setActiveFilter("all");
      setLifecycleFilter("in_use");
      setFamilyFilter("all");
      setOwnerFilter("all");
      setUsageFilter("all");
      setRiskFilter("all");
      setActiveView("");
    } else if (filter === "unowned") {
      setActiveFilter("all");
      setLifecycleFilter("all");
      setFamilyFilter("all");
      setOwnerFilter("unowned");
      setUsageFilter("all");
      setRiskFilter("all");
      setActiveView("");
    } else if (filter === "families") {
      setGroupByFamily(true);
      setActiveFilter("all");
      setLifecycleFilter("all");
      setFamilyFilter("all");
      setOwnerFilter("all");
      setUsageFilter("all");
      setRiskFilter("all");
      setActiveView("");
    } else {
      setActiveFilter(filter as FilterStatus);
      setLifecycleFilter("all");
      setFamilyFilter("all");
      setOwnerFilter("all");
      setUsageFilter("all");
      setRiskFilter("all");
      setActiveView("");
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

  const TABLE_COL_COUNT = 11;
  const allFiltersDefault = activeFilter === "all" && lifecycleFilter === "all" && familyFilter === "all" && ownerFilter === "all" && usageFilter === "all" && riskFilter === "all";

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
          value={ownerFilter}
          onChange={(v) => { setOwnerFilter(v); setActiveView(""); }}
          options={[
            { value: "all", label: "All Owners" },
            { value: "unowned", label: "Unowned" },
            ...ownerNames.map((n) => ({ value: n, label: n })),
          ]}
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { label: "Total", value: counts.all, icon: Boxes, filter: "all" as const, accent: "", subtitle: "" },
          { label: "Running", value: counts.running, icon: Radio, filter: "running" as const, accent: counts.running > 0 ? "text-[hsl(var(--status-processing))]" : "", subtitle: "" },
          { label: "Failed", value: counts.failed, icon: XCircle, filter: "failed" as const, accent: counts.failed > 0 ? "text-[hsl(var(--status-failure))]" : "", subtitle: "" },
          { label: "In Use", value: overviewCards.inUse, icon: CheckCircle2, filter: "in_use", accent: overviewCards.inUse > 0 ? "text-[hsl(var(--status-success))]" : "", subtitle: "" },
          { label: "Unowned", value: overviewCards.unowned, icon: Users, filter: "unowned", accent: overviewCards.unowned > 0 ? "text-[hsl(var(--status-warning))]" : "", subtitle: "" },
          {
            label: "Families",
            value: overviewCards.families,
            icon: Layers,
            filter: "families",
            accent: overviewCards.familiesAtRisk > 0 ? "text-[hsl(var(--status-failure))]" : "",
            subtitle: overviewCards.familiesAtRisk > 0 ? `${overviewCards.familiesAtRisk} at risk` : "",
          },
        ].map((card) => (
          <GlassPanel
            key={card.label}
            solid
            hover
            onClick={() => handleCardClick(card.filter)}
            className={`p-3 cursor-pointer group ${card.filter === "families" && groupByFamily ? "ring-1 ring-[hsl(var(--primary)/0.4)]" : ""}`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <card.icon className={`w-3.5 h-3.5 ${card.accent || "text-[hsl(var(--muted-foreground))]"} group-hover:text-[hsl(var(--primary))] transition-colors`} />
              <span className="text-[11px] text-[hsl(var(--muted-foreground))] font-medium">{card.label}</span>
            </div>
            <div className={`text-lg font-bold tabular-nums ${card.accent || "text-[hsl(var(--foreground))]"}`}>
              {card.value}
            </div>
            {card.subtitle && (
              <div className="text-[10px] text-[hsl(var(--status-failure))] mt-0.5">{card.subtitle}</div>
            )}
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
