import { useState, useRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  FolderTree,
  Radio,
  CheckCircle2,
  XCircle,
  Users,
  Network,
  Bot,
  Activity,
  Sunset,
  Archive,
  TrendingUp,
  Zap,
} from "lucide-react";
import { StatusChip } from "../ui/status-chip";
import {
  type FamilyGroup,
  lifecycleLabels,
  lifecycleVariant,
  formatDate,
} from "../../lib/assembly-helpers";

function FamilyTooltip({ group, visible, position }: { group: FamilyGroup; visible: boolean; position: { x: number; y: number } }) {
  if (!visible) return null;

  const lifecycleDist: Record<string, number> = {};
  group.members.forEach((a) => {
    const lc = a.lifecycleState || "unknown";
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

interface FamilyGroupHeaderProps {
  group: FamilyGroup;
  isExpanded: boolean;
  onToggle: () => void;
  colSpan: number;
}

export function FamilyGroupHeader({ group, isExpanded, onToggle, colSpan }: FamilyGroupHeaderProps) {
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
                  variant={lifecycleVariant[group.dominantLifecycle] || "neutral"}
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
