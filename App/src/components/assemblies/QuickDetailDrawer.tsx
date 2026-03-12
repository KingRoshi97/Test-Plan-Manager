import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PanelRightOpen,
  X,
  ExternalLink,
  Play,
  Trash2,
  Loader2,
  Bot,
  Link,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { StatusChip, getStatusVariant } from "../ui/status-chip";
import { StageRail, parseStagesFromAssembly } from "../ui/stage-rail";
import { apiRequest } from "../../lib/queryClient";
import type { Assembly } from "../../../../shared/schema";
import type { AssemblyWithMeta } from "../../lib/assembly-helpers";
import {
  getAssignedAgents,
  getAssignmentHealth,
  getDeprecationState,
  isRetirementCandidate,
  getUpstreamDeps,
  getDownstreamDeps,
  getDependencyRisk,
  getAttentionFlags,
  formatDate,
  formatDuration,
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

function DrawerSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-[10px] text-system-label uppercase tracking-wider block mb-1.5">{label}</span>
      {children}
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

interface QuickDetailDrawerProps {
  assembly: Assembly | null;
  onClose: () => void;
  onNavigate: (id: number) => void;
  onDelete: (id: number) => void;
  onRunPipeline: (id: number) => void;
  onSwapAssembly: (id: number) => void;
  isDeleting?: boolean;
  isRunning?: boolean;
}

export function QuickDetailDrawer({
  assembly,
  onClose,
  onNavigate,
  onDelete,
  onRunPipeline,
  onSwapAssembly,
  isDeleting,
  isRunning,
}: QuickDetailDrawerProps) {
  useEffect(() => {
    if (!assembly) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [assembly, onClose]);

  if (!assembly) return null;

  const meta = assembly as AssemblyWithMeta;
  const agents = getAssignedAgents(assembly);
  const health = getAssignmentHealth(assembly);
  const depState = getDeprecationState(assembly);
  const isRetCandidate = isRetirementCandidate(assembly);
  const upstream = getUpstreamDeps(assembly);
  const downstream = getDownstreamDeps(assembly);
  const depRisk = getDependencyRisk(assembly);
  const attentionFlags = getAttentionFlags(assembly);

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="absolute right-0 top-0 bottom-0 w-[380px] max-w-[90vw] glass-panel-solid border-l border-[hsl(var(--border))] shadow-2xl overflow-y-auto animate-slide-in-panel"
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
            {assembly.familyName ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[hsl(var(--foreground))]">{assembly.familyName}</span>
                {assembly.familyType && (
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] capitalize bg-[hsl(var(--muted)/0.5)] px-1.5 py-0.5 rounded">
                    {assembly.familyType.replace(/_/g, " ")}
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
                  {assembly.ownerName ? (
                    <span className="text-[hsl(var(--foreground))]">{assembly.ownerName}</span>
                  ) : (
                    <span className="text-[hsl(var(--status-warning))] text-[11px]">Needs owner</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">Team</span>
                  <span className="text-[hsl(var(--muted-foreground))]">{assembly.teamName || "\u2014"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">Control Plane</span>
                  {assembly.controlPlane ? (
                    <span className="text-[hsl(var(--foreground))] font-mono-tech text-[11px]">{assembly.controlPlane}</span>
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
                {assembly.lifecycleState ? (
                  <StatusChip
                    variant={lifecycleVariant[assembly.lifecycleState] || "neutral"}
                    label={lifecycleLabels[assembly.lifecycleState] || assembly.lifecycleState}
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
                {assembly.deprecationTargetDate && (
                  <div>
                    <span className="text-[10px] text-system-label block mb-0.5">Target Date</span>
                    <span className="text-[hsl(var(--muted-foreground))]">{formatDate(assembly.deprecationTargetDate)}</span>
                  </div>
                )}
                {assembly.lifecycleUpdatedAt && (
                  <div>
                    <span className="text-[10px] text-system-label block mb-0.5">Lifecycle Updated</span>
                    <span className="text-[hsl(var(--muted-foreground))]">{formatDate(assembly.lifecycleUpdatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </DrawerSection>

          <DrawerSection label="Usage & Ecosystem">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {assembly.usageState ? (
                  <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium capitalize ${usageColors[assembly.usageState] || "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)]"}`}>
                    {assembly.usageState}
                  </span>
                ) : (
                  <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)]">No telemetry</span>
                )}
                {assembly.ecosystemRole && (
                  <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium capitalize ${ecosystemRoleColors[assembly.ecosystemRole] || "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)]"}`}>
                    {ecosystemRoleLabels[assembly.ecosystemRole] || assembly.ecosystemRole}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">Requests / 24h</span>
                  <span className="text-[hsl(var(--foreground))] font-mono-tech">
                    {assembly.requestsLast24h ? assembly.requestsLast24h.toLocaleString() : "0"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">Active Consumers</span>
                  <span className="text-[hsl(var(--foreground))] font-mono-tech">{assembly.activeConsumers || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">Error Rate</span>
                  <span className={`font-mono-tech ${(assembly.errorRatePct || 0) > 5 ? "text-[hsl(var(--status-failure))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                    {(assembly.errorRatePct || 0).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">P95 Latency</span>
                  <span className="text-[hsl(var(--muted-foreground))] font-mono-tech">
                    {assembly.p95LatencyMs ? `${assembly.p95LatencyMs}ms` : "\u2014"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-system-label block mb-0.5">Dependency Risk</span>
                  <span className={`font-medium ${depRiskColors[depRisk]}`}>{depRisk}</span>
                </div>
                {assembly.lastActivityAt && (
                  <div>
                    <span className="text-[10px] text-system-label block mb-0.5">Last Active</span>
                    <span className="text-[hsl(var(--muted-foreground))]">{formatDate(assembly.lastActivityAt)}</span>
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
              <StageRail stages={parseStagesFromAssembly(meta.latestStages)} />
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
                <span className="text-[10px] text-system-label block mb-0.5">Pipeline Executions</span>
                <span className="text-[hsl(var(--muted-foreground))] font-mono-tech">{assembly.totalRuns ?? 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-system-label block mb-0.5">Total Duration</span>
                <span className="text-[hsl(var(--muted-foreground))] font-mono-tech">{formatDuration(assembly.totalDurationMs)}</span>
              </div>
            </div>
          </DrawerSection>

          {(assembly.riskLevel || attentionFlags.length > 0) && (
            <DrawerSection label="Risk Level">
              {assembly.riskLevel && (
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${riskColors[assembly.riskLevel] || "bg-[hsl(var(--muted-foreground))]"}`} />
                  <span className="text-xs text-[hsl(var(--foreground))] capitalize">{riskLabels[assembly.riskLevel] || assembly.riskLevel}</span>
                </div>
              )}
              {attentionFlags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {attentionFlags.map((flag) => (
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
                onDelete(assembly.id);
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
