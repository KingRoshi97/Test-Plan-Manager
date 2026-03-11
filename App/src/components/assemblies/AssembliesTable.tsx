import { useState, useRef, useEffect, Fragment } from "react";
import {
  AlertTriangle,
  Bot,
  ExternalLink,
  Eye,
  Layers,
  MoreVertical,
  Shield,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { StatusChip, getStatusVariant } from "../ui/status-chip";
import { StageRail, parseStagesFromAssembly } from "../ui/stage-rail";
import type { Assembly } from "../../../../shared/schema";
import type { AssemblyWithMeta, FamilyGroup, FilterStatus } from "../../lib/assembly-helpers";
import {
  getAssignedAgents,
  getAssignmentHealth,
  getDeprecationState,
  isRetirementCandidate,
  getDependencyRisk,
  getUpstreamDeps,
  getDownstreamDeps,
  formatDuration,
  formatDate,
  lifecycleLabels,
  lifecycleVariant,
  usageColors,
  riskColors,
  riskLabels,
  deprecationLabels,
  deprecationColors,
  ecosystemRoleLabels,
  ecosystemRoleColors,
  assignmentHealthColors,
  assignmentHealthLabels,
  depRiskColors,
} from "../../lib/assembly-helpers";
import { getStallLevel, formatStallTime } from "../../hooks/use-pipeline-status";
import { FamilyGroupHeader } from "./FamilyGroupHeader";

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
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-[hsl(var(--accent)/0.5)] transition-colors text-left ${assembly.lifecycleState === lc ? "text-[hsl(var(--primary))]" : ""}`}
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
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-[hsl(var(--accent)/0.5)] transition-colors text-left capitalize ${assembly.riskLevel === r ? "text-[hsl(var(--primary))]" : ""}`}
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

interface AssembliesTableProps {
  filtered: Assembly[];
  familyGroups: FamilyGroup[];
  groupByFamily: boolean;
  collapsedGroups: Set<string>;
  pipelineStatus: { activeRuns?: { assemblyId: number; stalledMs: number; elapsedMs: number }[] } | undefined;
  onToggleGroup: (name: string) => void;
  onRowClick: (id: number) => void;
  onQuickDetail: (id: number) => void;
  onDelete: (id: number) => void;
  onPatch: (id: number, data: Record<string, any>) => void;
  isDeleting: boolean;
}

const TABLE_COL_COUNT = 12;

export function AssembliesTable({
  filtered,
  familyGroups,
  groupByFamily,
  collapsedGroups,
  pipelineStatus,
  onToggleGroup,
  onRowClick,
  onQuickDetail,
  onDelete,
  onPatch,
  isDeleting,
}: AssembliesTableProps) {
  function renderAssemblyRow(a: Assembly) {
    const meta = a as AssemblyWithMeta;
    const statusEntry = a.status === "running"
      ? pipelineStatus?.activeRuns?.find((s) => s.assemblyId === a.id)
      : undefined;
    const stallLevel = statusEntry ? getStallLevel(statusEntry.stalledMs) : "none";
    const agents = getAssignedAgents(a);
    const health = getAssignmentHealth(a);
    const depState = getDeprecationState(a);
    const isRetCandidate = isRetirementCandidate(a);
    const depRisk = getDependencyRisk(a);
    const upstream = getUpstreamDeps(a);
    const downstream = getDownstreamDeps(a);

    return (
      <tr
        key={a.id}
        className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--accent)/0.5)] cursor-pointer transition-colors"
        onClick={() => onRowClick(a.id)}
      >
        <td className="px-4 py-3">
          <div className="font-medium text-[hsl(var(--foreground))] text-[13px] flex items-center gap-1.5">
            {a.riskLevel && (
              <span className={`w-2 h-2 rounded-full shrink-0 ${riskColors[a.riskLevel] || ""}`} title={riskLabels[a.riskLevel] || a.riskLevel} />
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
          {a.familyName ? (
            <div>
              <span className="text-xs text-[hsl(var(--foreground))]">{a.familyName}</span>
              {a.familyType && (
                <span className="block text-[10px] text-[hsl(var(--muted-foreground))] capitalize">{a.familyType.replace(/_/g, " ")}</span>
              )}
            </div>
          ) : (
            <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)]">{"\u2014"}</span>
          )}
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <div className="flex flex-col gap-0.5">
            {a.lifecycleState ? (
              <StatusChip
                variant={lifecycleVariant[a.lifecycleState] || "neutral"}
                label={lifecycleLabels[a.lifecycleState] || a.lifecycleState}
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
            {a.usageState ? (
              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium capitalize w-fit ${usageColors[a.usageState] || "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)]"}`}>
                {a.usageState}
              </span>
            ) : (
              <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)]">No telemetry</span>
            )}
            {(a.requestsLast24h ?? 0) > 0 && (
              <span className="text-[10px] font-mono-tech text-[hsl(var(--muted-foreground))]">
                {a.requestsLast24h!.toLocaleString()} req/24h
              </span>
            )}
            {a.lastActivityAt && (
              <span className="text-[10px] text-[hsl(var(--muted-foreground)/0.6)]">
                {formatDate(a.lastActivityAt)}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 hidden xl:table-cell">
          <div className="flex flex-col gap-0.5">
            {a.ownerName ? (
              <>
                <span className="text-xs text-[hsl(var(--foreground))]">{a.ownerName}</span>
                {a.teamName && (
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    {a.teamName}
                    {a.controlPlane && <> &middot; <span className="font-mono-tech">{a.controlPlane}</span></>}
                  </span>
                )}
                {!a.teamName && a.controlPlane && (
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono-tech">{a.controlPlane}</span>
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
          <StageRail stages={parseStagesFromAssembly(meta.latestStages)} />
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
          {a.ecosystemRole ? (
            <div className="flex flex-col gap-0.5">
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium capitalize w-fit ${ecosystemRoleColors[a.ecosystemRole] || "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)]"}`}>
                {ecosystemRoleLabels[a.ecosystemRole] || a.ecosystemRole}
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
        <td className="px-4 py-3 hidden lg:table-cell">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {formatDate(a.updatedAt)}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
            <RowActionMenu
              assembly={a}
              onQuickDetail={() => onQuickDetail(a.id)}
              onNavigate={() => onRowClick(a.id)}
              onDelete={() => onDelete(a.id)}
              onPatch={(data) => onPatch(a.id, data)}
              isDeleting={isDeleting}
            />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="glass-panel-solid overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[hsl(var(--border))]">
            <th className="text-left px-4 py-2.5 text-system-label">Assembly</th>
            <th className="text-left px-4 py-2.5 text-system-label">Status</th>
            <th className="text-left px-4 py-2.5 text-system-label hidden md:table-cell">Family</th>
            <th className="text-left px-4 py-2.5 text-system-label hidden lg:table-cell">Lifecycle</th>
            <th className="text-left px-4 py-2.5 text-system-label hidden lg:table-cell">Usage</th>
            <th className="text-left px-4 py-2.5 text-system-label hidden xl:table-cell">Owner</th>
            <th className="text-left px-4 py-2.5 text-system-label hidden md:table-cell">Pipeline</th>
            <th className="text-left px-4 py-2.5 text-system-label hidden xl:table-cell">Elapsed</th>
            <th className="text-left px-4 py-2.5 text-system-label hidden xl:table-cell">Duration</th>
            <th className="text-left px-4 py-2.5 text-system-label hidden xl:table-cell">Ecosystem</th>
            <th className="text-left px-4 py-2.5 text-system-label hidden lg:table-cell">Updated</th>
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
                    onToggle={() => onToggleGroup(group.groupKey)}
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
  );
}
