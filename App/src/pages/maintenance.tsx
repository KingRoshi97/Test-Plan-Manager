import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Loader2, Wrench, Shield, Search, Zap, Calendar, FileText, Play,
  AlertTriangle, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Eye,
  Lock, XCircle, Filter, Package, Stamp, BarChart3, Activity, ListChecks,
  Lightbulb, Bot, Target, Clock, ArrowRightCircle
} from "lucide-react";
import { GlassPanel } from "../components/ui/glass-panel";
import { StatusChip } from "../components/ui/status-chip";
import { MetricCard } from "../components/ui/metric-card";

function severityVariant(sev: string) {
  switch (sev) {
    case "critical": return "failure" as const;
    case "high": return "failure" as const;
    case "medium": return "warning" as const;
    case "low": return "neutral" as const;
    case "info": return "processing" as const;
    default: return "neutral" as const;
  }
}

function runStatusVariant(status: string) {
  switch (status) {
    case "created": return "neutral" as const;
    case "running": return "processing" as const;
    case "completed": return "success" as const;
    case "completed_with_limits": return "warning" as const;
    case "failed": return "failure" as const;
    default: return "neutral" as const;
  }
}

function findingStatusVariant(status: string) {
  switch (status) {
    case "open": return "warning" as const;
    case "acknowledged": return "processing" as const;
    case "suppressed": return "neutral" as const;
    case "resolved": return "success" as const;
    default: return "neutral" as const;
  }
}

function OverviewTab({ status, runs, findings }: { status: any; runs: any[]; findings: any[] }) {
  const { data: taskRuns = [] } = useQuery<any[]>({
    queryKey: ["/api/mus/task-runs"],
    queryFn: () => fetch("/api/mus/task-runs").then(r => r.json()),
  });

  const { data: insights = [] } = useQuery<any[]>({
    queryKey: ["/api/mus/insights"],
    queryFn: () => fetch("/api/mus/insights").then(r => r.json()),
  });

  const { data: bottlenecks = [] } = useQuery<any[]>({
    queryKey: ["/api/mus/bottlenecks"],
    queryFn: () => fetch("/api/mus/bottlenecks").then(r => r.json()),
  });

  const openFindings = findings.filter((f: any) => f.status === "open").length;
  const cards = [
    { label: "Total Runs", value: status?.total_runs ?? 0, icon: Activity, accent: "cyan" as const },
    { label: "Open Findings", value: openFindings, icon: AlertTriangle, accent: "red" as const },
    { label: "Task Runs", value: taskRuns.length, icon: ListChecks, accent: "violet" as const },
    { label: "Insights", value: insights.length, icon: Lightbulb, accent: "green" as const },
    { label: "Registries", value: Object.keys(status?.registry_versions ?? {}).length, icon: FileText, accent: "default" as const },
    { label: "Policy Loaded", value: status?.policy_loaded ? 1 : 0, icon: Shield, accent: "default" as const },
  ];
  const lastRun = status?.last_run;
  const lastValidation = status?.last_validation;

  const topBottleneck = bottlenecks.length > 0 ? bottlenecks[0] : null;
  const latestInsights = insights.slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <MetricCard key={c.label} icon={c.icon} label={c.label} value={c.value} accent={c.accent} />
        ))}
      </div>

      {status?.locks && (
        <GlassPanel solid glow="amber" className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-[hsl(var(--status-warning))]" />
            <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))]">Consent & Safety Gates</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[hsl(var(--muted-foreground))]">Apply Consent</span>
              <StatusChip variant={status.consent?.apply_required ? "success" : "failure"} label={status.consent?.apply_required ? "Required" : "Off"} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[hsl(var(--muted-foreground))]">Publish Consent</span>
              <StatusChip variant={status.consent?.publish_required ? "success" : "failure"} label={status.consent?.publish_required ? "Required" : "Off"} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[hsl(var(--muted-foreground))]">Scheduled Publish</span>
              <StatusChip variant="failure" label="Blocked" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[hsl(var(--muted-foreground))]">Automation Apply</span>
              <StatusChip variant="failure" label="Blocked" />
            </div>
          </div>
        </GlassPanel>
      )}

      {topBottleneck && (
        <GlassPanel solid glow="red" className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[hsl(var(--status-failure))]" />
            <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))]">Top Bottleneck</h3>
            <span className="font-mono-tech text-xs text-[hsl(var(--muted-foreground))]">{topBottleneck.task_id}</span>
          </div>
          <div className="text-xs mb-2">
            <span className="text-[hsl(var(--muted-foreground))]">Total: </span>
            <span className="font-mono-tech text-[hsl(var(--foreground))]">{Math.round(topBottleneck.total_time_ms / 1000)}s / {topBottleneck.total_tokens} tokens</span>
          </div>
          {topBottleneck.hotspots?.slice(0, 3).map((h: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-[hsl(var(--glass-border))] last:border-0">
              <div className="w-24 font-mono-tech text-[hsl(var(--foreground))]">{h.location}</div>
              <div className="flex-1 h-2 rounded-full bg-[hsl(var(--muted)/0.3)] overflow-hidden">
                <div className="h-full rounded-full bg-[hsl(var(--status-failure))]" style={{ width: `${Math.min(h.percentage_of_total, 100)}%` }} />
              </div>
              <div className="w-12 text-right font-mono-tech text-[hsl(var(--muted-foreground))]">{h.percentage_of_total}%</div>
            </div>
          ))}
          {topBottleneck.hypotheses?.length > 0 && (
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] italic mt-2">{topBottleneck.hypotheses[0]}</p>
          )}
        </GlassPanel>
      )}

      {latestInsights.length > 0 && (
        <GlassPanel solid glow="green" className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-[hsl(var(--status-success))]" />
            <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))]">Latest Insights</h3>
            {insights.length > 3 && (
              <span className="text-xs text-[hsl(var(--muted-foreground))]">({insights.length} total)</span>
            )}
          </div>
          <div className="space-y-3">
            {latestInsights.map((ins: any) => (
              <div key={ins.insight_id} className="glass-panel rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <StatusChip variant={
                    ins.category === "bottleneck" ? "failure" as const :
                    ins.category === "quality" ? "intelligence" as const :
                    ins.category === "cost" ? "warning" as const :
                    ins.category === "reliability" ? "success" as const :
                    "neutral" as const
                  } label={ins.category} />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">confidence: {ins.confidence}%</span>
                  <span className="font-mono-tech text-[10px] text-[hsl(var(--muted-foreground))] ml-auto">{ins.task_id}</span>
                </div>
                <p className="text-xs text-[hsl(var(--foreground))] line-clamp-2">{ins.narrative}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {latestInsights.length === 0 && taskRuns.length === 0 && (
        <GlassPanel solid className="p-4 text-center">
          <Bot className="w-6 h-6 mx-auto mb-2 text-[hsl(var(--muted-foreground))] opacity-50" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No task runs or insights yet</p>
          <p className="text-xs mt-1 text-[hsl(var(--muted-foreground))]">Run tasks from the Tasks tab to generate insights and bottleneck analysis</p>
        </GlassPanel>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassPanel solid glow="cyan" className="p-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">Last Validation</h3>
          {lastValidation ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <StatusChip variant={lastValidation.pass ? "success" : "failure"} label={lastValidation.pass ? "PASS" : "FAIL"} />
                <span className="text-[hsl(var(--muted-foreground))]">{new Date(lastValidation.checked_at).toLocaleString()}</span>
              </div>
              <div className="text-[hsl(var(--muted-foreground))]">
                {lastValidation.registries_checked} registries, {lastValidation.items_checked} items, {lastValidation.errors?.length ?? 0} errors
              </div>
            </div>
          ) : (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">No validation run yet. Use the Run tab to validate.</p>
          )}
        </GlassPanel>

        <GlassPanel solid glow="cyan" className="p-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">Last Run</h3>
          {lastRun ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono-tech text-[hsl(var(--foreground))]">{lastRun.run_id}</span>
                <StatusChip variant={runStatusVariant(lastRun.status)} label={lastRun.status} />
              </div>
              {lastRun.completed_at && (
                <div className="text-[hsl(var(--muted-foreground))]">{new Date(lastRun.completed_at).toLocaleString()}</div>
              )}
            </div>
          ) : (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">No runs executed yet.</p>
          )}
        </GlassPanel>
      </div>

      {runs.length > 0 && (
        <GlassPanel solid className="p-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">Recent Runs</h3>
          <div className="space-y-2">
            {runs.slice(0, 5).map((r: any) => (
              <div key={r.run_id} className="flex items-center justify-between text-xs py-1 border-b border-[hsl(var(--glass-border))] last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono-tech text-[hsl(var(--foreground))]">{r.run_id}</span>
                  <span className="text-[hsl(var(--muted-foreground))]">{r.mode_id}</span>
                  <StatusChip variant={runStatusVariant(r.status)} label={r.status} />
                </div>
                <span className="font-mono-tech text-[hsl(var(--muted-foreground))]">
                  {r.findings_count ?? 0}F / {r.proposals_count ?? 0}P
                </span>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}

function FindingsTab() {
  const queryClient = useQueryClient();
  const [selectedRun, setSelectedRun] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { data: runs = [] } = useQuery<any[]>({
    queryKey: ["/api/mus/runs"],
    queryFn: () => fetch("/api/mus/runs").then(r => r.json()),
  });

  const { data: findings = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/mus/findings", selectedRun, filterSeverity, filterStatus],
    queryFn: () => {
      if (!selectedRun) return Promise.resolve([]);
      const params = new URLSearchParams();
      if (filterSeverity) params.set("severity", filterSeverity);
      if (filterStatus) params.set("status", filterStatus);
      return fetch(`/api/mus/runs/${selectedRun}/findings?${params}`).then(r => r.json());
    },
    enabled: !!selectedRun,
  });

  const updateFinding = useMutation({
    mutationFn: async ({ findingId, status }: { findingId: string; status: string }) => {
      const res = await fetch(`/api/mus/findings/${findingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update finding");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/mus/findings"] }),
  });

  const createSuppression = useMutation({
    mutationFn: async ({ finding }: { finding: any }) => {
      const res = await fetch("/api/mus/suppressions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finding_type: finding.check_id,
          scope_selectors: { file_path: finding.file_path, detector_pack_id: finding.detector_pack_id },
          reason: `Suppressed from UI for ${finding.check_id}`,
        }),
      });
      if (!res.ok) throw new Error("Failed to create suppression");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/mus/findings"] }),
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
        <select value={selectedRun} onChange={(e) => setSelectedRun(e.target.value)} className="rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]">
          <option value="">Select a run...</option>
          {runs.filter((r: any) => r.status === "completed" || r.status === "completed_with_limits").map((r: any) => (
            <option key={r.run_id} value={r.run_id}>{r.run_id} ({r.mode_id}, {r.findings_count ?? 0} findings)</option>
          ))}
        </select>
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-2 py-1.5 text-sm text-[hsl(var(--foreground))]">
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-2 py-1.5 text-sm text-[hsl(var(--foreground))]">
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="suppressed">Suppressed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {!selectedRun ? (
        <GlassPanel solid className="text-center py-12">
          <Search className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--muted-foreground))] opacity-50" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Select a completed run to view findings</p>
        </GlassPanel>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" /></div>
      ) : findings.length === 0 ? (
        <GlassPanel solid className="text-center py-12">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--status-success))] opacity-50" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No findings match the current filters</p>
        </GlassPanel>
      ) : (
        <GlassPanel solid className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="glass-panel-solid glow-border-red">
                <th className="text-left px-3 py-2 text-system-label">Severity</th>
                <th className="text-left px-3 py-2 text-system-label">Status</th>
                <th className="text-left px-3 py-2 text-system-label">Check</th>
                <th className="text-left px-3 py-2 text-system-label">Title</th>
                <th className="text-left px-3 py-2 text-system-label">File</th>
                <th className="text-left px-3 py-2 text-system-label">Actions</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f: any) => (
                <tr key={f.finding_id} className="border-t border-[hsl(var(--glass-border))] hover:bg-[hsl(var(--accent)/0.5)] transition-colors">
                  <td className="px-3 py-2"><StatusChip variant={severityVariant(f.severity)} label={f.severity} /></td>
                  <td className="px-3 py-2"><StatusChip variant={findingStatusVariant(f.status)} label={f.status} /></td>
                  <td className="px-3 py-2 font-mono-tech text-xs text-[hsl(var(--muted-foreground))]">{f.check_id}</td>
                  <td className="px-3 py-2 text-[hsl(var(--foreground))]">
                    <div className="text-xs font-medium">{f.title}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{f.description?.slice(0, 80)}</div>
                  </td>
                  <td className="px-3 py-2 font-mono-tech text-xs text-[hsl(var(--muted-foreground))]">
                    {f.file_path}
                    {f.json_pointer && <span className="ml-1 text-[hsl(var(--status-processing))]">{f.json_pointer}</span>}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {f.status === "open" && (
                        <>
                          <button onClick={() => updateFinding.mutate({ findingId: f.finding_id, status: "acknowledged" })} className="px-2 py-0.5 rounded text-xs bg-[hsl(var(--status-processing)/0.15)] text-[hsl(var(--status-processing))] hover:bg-[hsl(var(--status-processing)/0.25)] transition-colors">
                            Ack
                          </button>
                          <button onClick={() => createSuppression.mutate({ finding: f })} className="px-2 py-0.5 rounded text-xs bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors">
                            Suppress
                          </button>
                        </>
                      )}
                      {f.status === "acknowledged" && (
                        <button onClick={() => updateFinding.mutate({ findingId: f.finding_id, status: "resolved" })} className="px-2 py-0.5 rounded text-xs bg-[hsl(var(--status-success)/0.15)] text-[hsl(var(--status-success))] hover:bg-[hsl(var(--status-success)/0.25)] transition-colors">
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      )}
    </div>
  );
}

function ProposalsTab() {
  const queryClient = useQueryClient();
  const [expandedPP, setExpandedPP] = useState<string | null>(null);
  const [selectedPatches, setSelectedPatches] = useState<Record<string, Set<string>>>({});

  const { data: proposals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/mus/proposals"],
    queryFn: () => fetch("/api/mus/proposals").then(r => r.json()),
  });

  const { data: recommendations = [], isLoading: recsLoading } = useQuery<any[]>({
    queryKey: ["/api/mus/recommendations"],
    queryFn: () => fetch("/api/mus/recommendations").then(r => r.json()),
  });

  const createChangeSet = useMutation({
    mutationFn: async ({ proposalPackId, patchIds }: { proposalPackId: string; patchIds: string[] }) => {
      const res = await fetch("/api/mus/changesets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal_pack_id: proposalPackId, selected_patch_ids: patchIds }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/mus"] }),
  });

  function togglePatch(ppId: string, patchId: string) {
    setSelectedPatches(prev => {
      const copy = { ...prev };
      if (!copy[ppId]) copy[ppId] = new Set();
      else copy[ppId] = new Set(copy[ppId]);
      if (copy[ppId].has(patchId)) copy[ppId].delete(patchId);
      else copy[ppId].add(patchId);
      return copy;
    });
  }

  if (isLoading || recsLoading) return <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" /></div>;

  if (proposals.length === 0 && recommendations.length === 0) {
    return (
      <GlassPanel solid className="text-center py-12 animate-fade-in">
        <Package className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--muted-foreground))] opacity-50" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">No proposal packs or recommendations yet</p>
        <p className="text-xs mt-1 text-[hsl(var(--muted-foreground))]">Run a drift detection (MM-04) or task to generate proposals</p>
      </GlassPanel>
    );
  }

  const convertibleRecs = recommendations.filter((r: any) => r.convertible_to_changeset);

  return (
    <div className="space-y-3 animate-fade-in">
      {convertibleRecs.length > 0 && (
        <GlassPanel solid glow="violet" className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-[hsl(var(--status-intelligence))]" />
            <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))]">Recommendations</h3>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">({convertibleRecs.length} convertible)</span>
          </div>
          <div className="space-y-2">
            {convertibleRecs.map((rec: any) => (
              <div key={rec.recommendation_id} className="glass-panel rounded p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <StatusChip variant={severityVariant(rec.priority)} label={rec.priority} />
                    <span className="text-xs font-medium text-[hsl(var(--foreground))]">{rec.title}</span>
                    <span className="font-mono-tech text-[10px] text-[hsl(var(--muted-foreground))]">{rec.task_id}</span>
                  </div>
                  <ConvertToChangeSetButton recommendationId={rec.recommendation_id} />
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{rec.description}</p>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">Impact: {rec.estimated_impact}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {proposals.map((pp: any) => {
        const selected = selectedPatches[pp.proposal_pack_id] ?? new Set();
        return (
          <GlassPanel key={pp.proposal_pack_id} solid hover className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[hsl(var(--accent)/0.3)] transition-colors" onClick={() => setExpandedPP(expandedPP === pp.proposal_pack_id ? null : pp.proposal_pack_id)}>
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-[hsl(var(--status-intelligence))]" />
                <span className="font-mono-tech text-sm font-medium text-[hsl(var(--card-foreground))]">{pp.proposal_pack_id}</span>
                <StatusChip variant={pp.risk_class === "safe" ? "success" : pp.risk_class === "low" ? "processing" : "warning"} label={`risk: ${pp.risk_class}`} />
                <span className="text-xs text-[hsl(var(--muted-foreground))]">confidence: {pp.confidence_score}%</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">impact: {pp.impact_score}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">{pp.patches?.length ?? 0} patches</span>
                {expandedPP === pp.proposal_pack_id ? <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> : <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
              </div>
            </div>

            {expandedPP === pp.proposal_pack_id && (
              <div className="border-t border-[hsl(var(--glass-border))] px-4 py-3 space-y-3 animate-fade-in">
                <div className="text-xs text-[hsl(var(--foreground))]">
                  <strong className="text-[hsl(var(--card-foreground))]">Why:</strong> {pp.explain_why}
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  Detector: {pp.detector_pack_id} | Run: {pp.run_id}
                </div>

                <div>
                  <h5 className="text-system-label mb-2">Patches</h5>
                  <div className="space-y-2">
                    {(pp.patches ?? []).map((patch: any) => (
                      <div key={patch.patch_id} className="flex items-start gap-2 p-2 rounded glass-panel">
                        <input
                          type="checkbox"
                          checked={selected.has(patch.patch_id)}
                          onChange={() => togglePatch(pp.proposal_pack_id, patch.patch_id)}
                          className="mt-1 rounded border-[hsl(var(--glass-border))]"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono-tech text-[hsl(var(--foreground))]">{patch.patch_type_id}</span>
                            <span className="text-[hsl(var(--muted-foreground))]">{patch.description}</span>
                          </div>
                          <div className="font-mono-tech text-[hsl(var(--muted-foreground))]">
                            {patch.target_file} {patch.target_field}
                          </div>
                          {patch.current_value !== undefined && (
                            <div className="mt-1 flex gap-3">
                              <span className="text-[hsl(var(--status-failure))]">- {JSON.stringify(patch.current_value)}</span>
                              <span className="text-[hsl(var(--status-success))]">+ {JSON.stringify(patch.proposed_value)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[hsl(var(--glass-border))]">
                  <button
                    onClick={() => createChangeSet.mutate({
                      proposalPackId: pp.proposal_pack_id,
                      patchIds: selected.size > 0 ? Array.from(selected) : pp.patches.map((p: any) => p.patch_id),
                    })}
                    disabled={createAndStartLoading(createChangeSet)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    <Package className="w-3.5 h-3.5" />
                    Create ChangeSet {selected.size > 0 ? `(${selected.size} selected)` : "(all)"}
                  </button>
                </div>
                {createChangeSet.error && (
                  <div className="text-xs text-[hsl(var(--status-failure))]">{(createChangeSet.error as Error).message}</div>
                )}
                {createChangeSet.data && (
                  <div className="text-xs text-[hsl(var(--status-success))]">ChangeSet created: {createChangeSet.data.changeset_id}</div>
                )}
              </div>
            )}
          </GlassPanel>
        );
      })}
    </div>
  );
}

function createAndStartLoading(mutation: any) {
  return mutation.isPending;
}

function ApprovalsTab() {
  const queryClient = useQueryClient();
  const [targetId, setTargetId] = useState("");
  const [approvalType, setApprovalType] = useState<"apply" | "publish">("apply");
  const [reason, setReason] = useState("");

  const { data: approvals = [] } = useQuery<any[]>({
    queryKey: ["/api/mus/approvals"],
    queryFn: () => fetch("/api/mus/approvals").then(r => r.json()),
  });

  const { data: changesets = [] } = useQuery<any[]>({
    queryKey: ["/api/mus/changesets"],
    queryFn: () => fetch("/api/mus/changesets").then(r => r.json()),
  });

  const createApproval = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/mus/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approval_type: approvalType,
          target_type: approvalType === "apply" ? "changeset" : "release",
          target_id: targetId,
          reason,
          actor: "operator",
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mus"] });
      setTargetId("");
      setReason("");
    },
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <GlassPanel solid glow="amber" className="p-3">
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--status-warning))]">
          <Lock className="w-4 h-4" />
          Apply and Publish require explicit approval events. Automation actors cannot create apply/publish approvals. Scheduled triggers cannot publish.
        </div>
      </GlassPanel>

      <GlassPanel solid glow="cyan" className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))]">Request Approval</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-system-label mb-1">Type</label>
            <select value={approvalType} onChange={(e) => setApprovalType(e.target.value as any)} className="w-full rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]">
              <option value="apply">Apply Approval</option>
              <option value="publish">Publish Approval</option>
            </select>
          </div>
          <div>
            <label className="block text-system-label mb-1">Target {approvalType === "apply" ? "ChangeSet" : "Release"} ID</label>
            {approvalType === "apply" && changesets.length > 0 ? (
              <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className="w-full rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]">
                <option value="">Select changeset...</option>
                {changesets.map((cs: any) => (
                  <option key={cs.changeset_id} value={cs.changeset_id}>{cs.changeset_id} ({cs.status})</option>
                ))}
              </select>
            ) : (
              <input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Target ID" className="w-full rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]" />
            )}
          </div>
          <div>
            <label className="block text-system-label mb-1">Reason</label>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Approval justification" className="w-full rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => createApproval.mutate()} disabled={createApproval.isPending || !targetId || !reason} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50 transition-opacity">
            {createApproval.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stamp className="w-4 h-4" />}
            Grant Approval
          </button>
        </div>
        {createApproval.error && (
          <div className="text-sm text-[hsl(var(--status-failure))] bg-[hsl(var(--status-failure)/0.1)] rounded p-2">{(createApproval.error as Error).message}</div>
        )}
      </GlassPanel>

      <GlassPanel solid className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="glass-panel-solid glow-border-green">
              <th className="text-left px-3 py-2 text-system-label">ID</th>
              <th className="text-left px-3 py-2 text-system-label">Type</th>
              <th className="text-left px-3 py-2 text-system-label">Target</th>
              <th className="text-left px-3 py-2 text-system-label">Actor</th>
              <th className="text-left px-3 py-2 text-system-label">Reason</th>
              <th className="text-left px-3 py-2 text-system-label">Time</th>
            </tr>
          </thead>
          <tbody>
            {approvals.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">No approval events yet</td></tr>
            ) : (
              approvals.map((a: any) => (
                <tr key={a.approval_id} className="border-t border-[hsl(var(--glass-border))] hover:bg-[hsl(var(--accent)/0.5)] transition-colors">
                  <td className="px-3 py-2 font-mono-tech text-xs">{a.approval_id}</td>
                  <td className="px-3 py-2">
                    <StatusChip variant={a.approval_type === "apply" ? "warning" : a.approval_type === "publish" ? "success" : "processing"} label={a.approval_type} />
                  </td>
                  <td className="px-3 py-2 font-mono-tech text-xs text-[hsl(var(--foreground))]">{a.target_id}</td>
                  <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">{a.actor}</td>
                  <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">{a.reason}</td>
                  <td className="px-3 py-2 font-mono-tech text-xs text-[hsl(var(--muted-foreground))]">{new Date(a.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </GlassPanel>
    </div>
  );
}

function SchedulesTab() {
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/mus/schedules"],
    queryFn: () => fetch("/api/mus/schedules").then(r => r.json()),
  });

  const { data: taskSchedules = [], isLoading: taskLoading } = useQuery<any[]>({
    queryKey: ["/api/mus/task-schedules"],
    queryFn: () => fetch("/api/mus/task-schedules").then(r => r.json()),
  });

  const toggleSchedule = useMutation({
    mutationFn: async ({ scheduleId, enabled }: { scheduleId: string; enabled: boolean }) => {
      const res = await fetch(`/api/mus/schedules/${scheduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle schedule");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/mus/schedules"] }),
  });

  const toggleTaskSchedule = useMutation({
    mutationFn: async ({ taskId, enabled }: { taskId: string; enabled: boolean }) => {
      const res = await fetch(`/api/mus/task-schedules/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle task schedule");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/mus/task-schedules"] }),
  });

  if (isLoading || taskLoading) return <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <GlassPanel solid glow="amber" className="p-3">
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--status-warning))]">
          <AlertTriangle className="w-4 h-4" />
          Scheduled runs are always proposal-only. Publish is disabled for all scheduled triggers.
        </div>
      </GlassPanel>

      <div>
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[hsl(var(--status-warning))]" />
          Mode Schedules
        </h3>
        <div className="space-y-3">
          {schedules.map((s: any) => (
            <GlassPanel key={s.schedule_id} solid className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[hsl(var(--status-warning))]" />
                  <span className="font-mono-tech text-sm font-medium text-[hsl(var(--card-foreground))]">{s.schedule_id}</span>
                  {s.proposal_only && <StatusChip variant="neutral" label="proposal-only" />}
                </div>
                <button
                  onClick={() => toggleSchedule.mutate({ scheduleId: s.schedule_id, enabled: !s.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${s.enabled ? "bg-[hsl(var(--status-success))]" : "bg-[hsl(var(--muted))]"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${s.enabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="space-y-1 text-xs text-[hsl(var(--muted-foreground))]">
                {s.rrule && <div>RRULE: <span className="font-mono-tech">{s.rrule}</span></div>}
                {s.allowed_modes && <div>Modes: {s.allowed_modes.join(", ")}</div>}
                {s.allowed_detector_packs && <div>Detectors: {s.allowed_detector_packs.join(", ")}</div>}
                {s.allowed_scopes?.asset_classes && <div>Scopes: {s.allowed_scopes.asset_classes.join(", ")}</div>}
              </div>
            </GlassPanel>
          ))}
          {schedules.length === 0 && (
            <GlassPanel solid className="text-center py-8">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">No mode schedules configured</p>
            </GlassPanel>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-[hsl(var(--status-intelligence))]" />
          Task Schedules
        </h3>
        <div className="space-y-3">
          {taskSchedules.map((ts: any) => (
            <GlassPanel key={ts.task_id} solid className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[hsl(var(--status-intelligence))]" />
                  <span className="text-sm font-medium text-[hsl(var(--card-foreground))]">{ts.name}</span>
                  <span className="font-mono-tech text-xs text-[hsl(var(--muted-foreground))]">{ts.task_id}</span>
                  <StatusChip variant={intentVariant(ts.intent)} label={ts.intent} />
                  <StatusChip variant="neutral" label="proposal-only" />
                </div>
                <button
                  onClick={() => toggleTaskSchedule.mutate({ taskId: ts.task_id, enabled: !ts.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ts.enabled ? "bg-[hsl(var(--status-success))]" : "bg-[hsl(var(--muted))]"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ts.enabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">
                RRULE: <span className="font-mono-tech">{ts.rrule}</span>
              </div>
            </GlassPanel>
          ))}
          {taskSchedules.length === 0 && (
            <GlassPanel solid className="text-center py-8">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">No schedulable tasks found</p>
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
}

function RegistriesTab() {
  const { data: registries = [] } = useQuery<any[]>({
    queryKey: ["/api/maintenance/registries"],
    queryFn: () => fetch("/api/maintenance/registries").then(r => r.json()),
  });

  const { data: policies = [] } = useQuery<any[]>({
    queryKey: ["/api/maintenance/policies"],
    queryFn: () => fetch("/api/maintenance/policies").then(r => r.json()),
  });

  const [expandedReg, setExpandedReg] = useState<string | null>(null);
  const [regDetail, setRegDetail] = useState<any>(null);

  const loadRegistry = async (name: string) => {
    if (expandedReg === name) { setExpandedReg(null); return; }
    setExpandedReg(name);
    const res = await fetch(`/api/maintenance/registries/${name}`);
    if (res.ok) setRegDetail(await res.json());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Registries ({registries.length})</h3>
        <div className="space-y-2">
          {registries.map((r: any) => (
            <GlassPanel key={r.filename} solid hover className="overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[hsl(var(--accent)/0.3)] transition-colors" onClick={() => loadRegistry(r.filename)}>
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[hsl(var(--status-intelligence))]" />
                  <span className="font-mono-tech text-sm text-[hsl(var(--foreground))]">{r.registry_id ?? r.filename}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">v{r.version}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{r.items} items</span>
                </div>
                {expandedReg === r.filename ? <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> : <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
              </div>
              {expandedReg === r.filename && regDetail && (
                <div className="border-t border-[hsl(var(--glass-border))] px-4 py-3">
                  <pre className="text-xs glass-panel rounded p-3 overflow-auto max-h-64 text-[hsl(var(--foreground))] scrollbar-thin font-mono-tech">
                    {JSON.stringify(regDetail, null, 2)}
                  </pre>
                </div>
              )}
            </GlassPanel>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Policies ({policies.length})</h3>
        <div className="space-y-3">
          {policies.map((p: any, i: number) => (
            <GlassPanel key={p.policy_id ?? i} solid className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-mono-tech text-sm font-semibold text-[hsl(var(--card-foreground))]">{p.policy_id ?? "Policy"}</h4>
                <span className="text-system-label">v{p.version ?? "?"}</span>
              </div>
              <pre className="text-xs glass-panel rounded p-3 overflow-auto max-h-48 text-[hsl(var(--foreground))] scrollbar-thin font-mono-tech">
                {JSON.stringify(p, null, 2)}
              </pre>
            </GlassPanel>
          ))}
        </div>
      </div>
    </div>
  );
}

function intentVariant(intent: string) {
  switch (intent) {
    case "monitor": return "processing" as const;
    case "troubleshoot": return "warning" as const;
    case "optimize": return "success" as const;
    case "audit": return "neutral" as const;
    default: return "neutral" as const;
  }
}

function RunbookSteps({ steps }: { steps: string[] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--card-foreground))] transition-colors"
      >
        <ListChecks className="w-3 h-3" />
        <span>Runbook ({steps.length} steps)</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {expanded && (
        <ol className="mt-1.5 ml-4 space-y-0.5 list-decimal list-outside">
          {steps.map((step, i) => (
            <li key={i} className="text-[10px] text-[hsl(var(--muted-foreground))] leading-tight pl-1">{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

function TasksTab() {
  const queryClient = useQueryClient();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [tokenCap, setTokenCap] = useState(50000);
  const [timeCap, setTimeCap] = useState(120000);
  const [maxFindings, setMaxFindings] = useState(50);
  const [taskRunResult, setTaskRunResult] = useState<any>(null);

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/mus/tasks"],
    queryFn: () => fetch("/api/mus/tasks").then(r => r.json()),
  });

  const { data: agents = [] } = useQuery<any[]>({
    queryKey: ["/api/mus/agents"],
    queryFn: () => fetch("/api/mus/agents").then(r => r.json()),
  });

  const createAndStart = useMutation({
    mutationFn: async () => {
      const createRes = await fetch("/api/mus/task-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_ids: selectedTasks,
          agent_ids: selectedAgent ? [selectedAgent] : undefined,
          budgets: { token_cap: tokenCap, time_cap_ms: timeCap, max_findings: maxFindings },
        }),
      });
      if (!createRes.ok) { const err = await createRes.json(); throw new Error(err.error); }
      const run = await createRes.json();

      const startRes = await fetch(`/api/mus/task-runs/${run.run_id}/start`, { method: "POST" });
      if (!startRes.ok) { const err = await startRes.json(); throw new Error(err.error); }
      return startRes.json();
    },
    onSuccess: (data) => {
      setTaskRunResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/mus"] });
    },
  });

  function toggleTask(taskId: string) {
    setSelectedTasks(prev =>
      prev.includes(taskId) ? prev.filter(t => t !== taskId) : [...prev, taskId]
    );
  }

  const selectedTaskDefs = tasks.filter((t: any) => selectedTasks.includes(t.task_id));
  const autoAgent = selectedTaskDefs.length > 0 ? selectedTaskDefs[0].default_agent_id : null;

  return (
    <div className="space-y-4 animate-fade-in">
      <GlassPanel solid glow="cyan" className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))]">Task Catalog</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tasks.map((task: any) => {
            const isSelected = selectedTasks.includes(task.task_id);
            const agent = agents.find((a: any) => a.agent_id === task.default_agent_id);
            return (
              <div
                key={task.task_id}
                onClick={() => toggleTask(task.task_id)}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  isSelected
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]"
                    : "border-[hsl(var(--glass-border))] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--accent)/0.3)]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[hsl(var(--status-intelligence))]" />
                    <span className="text-sm font-medium text-[hsl(var(--card-foreground))]">{task.name}</span>
                  </div>
                  <StatusChip variant={intentVariant(task.intent)} label={task.intent} />
                </div>
                <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="font-mono-tech">{task.task_id}</span>
                  {agent && (
                    <span className="flex items-center gap-1">
                      <Bot className="w-3 h-3" /> {agent.name}
                    </span>
                  )}
                  {task.schedule_allowed && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Schedulable
                    </span>
                  )}
                </div>
                <div className="flex gap-1 mt-2">
                  {(task.outputs_enabled ?? []).map((o: string) => (
                    <span key={o} className="px-1.5 py-0.5 rounded text-[10px] bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]">{o}</span>
                  ))}
                </div>
                {task.runbook && task.runbook.length > 0 && (
                  <RunbookSteps steps={task.runbook} />
                )}
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {selectedTasks.length > 0 && (
        <GlassPanel solid glow="violet" className="p-4 space-y-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))]">Run Configuration</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-system-label mb-1">Selected Tasks</label>
              <div className="flex flex-wrap gap-1">
                {selectedTasks.map(id => {
                  const t = tasks.find((t: any) => t.task_id === id);
                  return (
                    <span key={id} className="px-2 py-0.5 rounded text-xs bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] font-mono-tech">
                      {t?.name ?? id}
                    </span>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-system-label mb-1">Agent</label>
              <select
                value={selectedAgent || autoAgent || ""}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]"
              >
                <option value="">Auto-assign by capability</option>
                {agents.filter((a: any) => a.status === "enabled").map((a: any) => (
                  <option key={a.agent_id} value={a.agent_id}>{a.name} ({a.agent_id})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-system-label mb-2">Budgets</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1">Token Cap</label>
                <input type="number" value={tokenCap} onChange={(e) => setTokenCap(Number(e.target.value))} className="w-full rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-2 py-1 text-sm text-[hsl(var(--foreground))] font-mono-tech" />
              </div>
              <div>
                <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1">Time Cap (ms)</label>
                <input type="number" value={timeCap} onChange={(e) => setTimeCap(Number(e.target.value))} className="w-full rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-2 py-1 text-sm text-[hsl(var(--foreground))] font-mono-tech" />
              </div>
              <div>
                <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1">Max Findings</label>
                <input type="number" value={maxFindings} onChange={(e) => setMaxFindings(Number(e.target.value))} className="w-full rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-2 py-1 text-sm text-[hsl(var(--foreground))] font-mono-tech" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => createAndStart.mutate()} disabled={createAndStart.isPending || selectedTasks.length === 0} className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50 transition-opacity">
              {createAndStart.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Now
            </button>
          </div>

          {createAndStart.error && (
            <div className="text-sm text-[hsl(var(--status-failure))] bg-[hsl(var(--status-failure)/0.1)] rounded p-2">{(createAndStart.error as Error).message}</div>
          )}
        </GlassPanel>
      )}

      {taskRunResult && (
        <GlassPanel solid glow="green" className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[hsl(var(--status-success))]" />
            <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))]">Task Run Results</h3>
          </div>
          <div className="grid grid-cols-5 gap-3 text-xs">
            <div><span className="text-[hsl(var(--muted-foreground))]">Run ID:</span> <span className="font-mono-tech text-[hsl(var(--foreground))]">{taskRunResult.taskRun?.run_id}</span></div>
            <div><span className="text-[hsl(var(--muted-foreground))]">Status:</span> <StatusChip variant={runStatusVariant(taskRunResult.taskRun?.status)} label={taskRunResult.taskRun?.status} /></div>
            <div><span className="text-[hsl(var(--muted-foreground))]">Findings:</span> <span className="font-mono-tech text-[hsl(var(--foreground))]">{taskRunResult.findings_count}</span></div>
            <div><span className="text-[hsl(var(--muted-foreground))]">Insights:</span> <span className="font-mono-tech text-[hsl(var(--foreground))]">{taskRunResult.insights_count}</span></div>
            <div><span className="text-[hsl(var(--muted-foreground))]">Bottlenecks:</span> <span className="font-mono-tech text-[hsl(var(--foreground))]">{taskRunResult.bottlenecks_count}</span></div>
          </div>
          {taskRunResult.recommendations_count > 0 && (
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{taskRunResult.recommendations_count} recommendation(s) — view in Insights tab</div>
          )}
        </GlassPanel>
      )}
    </div>
  );
}

function TaskRunsTab() {
  const { data: taskRuns = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/mus/task-runs"],
    queryFn: () => fetch("/api/mus/task-runs").then(r => r.json()),
  });

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/mus/tasks"],
    queryFn: () => fetch("/api/mus/tasks").then(r => r.json()),
  });

  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<any>(null);

  const loadOutputs = async (runId: string) => {
    if (expandedRun === runId) { setExpandedRun(null); return; }
    setExpandedRun(runId);
    const res = await fetch(`/api/mus/task-runs/${runId}/outputs`);
    if (res.ok) setOutputs(await res.json());
  };

  if (isLoading) return <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" /></div>;

  if (taskRuns.length === 0) {
    return (
      <GlassPanel solid className="text-center py-12 animate-fade-in">
        <ListChecks className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--muted-foreground))] opacity-50" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">No task runs yet</p>
        <p className="text-xs mt-1 text-[hsl(var(--muted-foreground))]">Go to Tasks tab to run your first task</p>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {taskRuns.map((run: any) => {
        const taskNames = (run.task_ids ?? []).map((id: string) => {
          const t = tasks.find((t: any) => t.task_id === id);
          return t?.name ?? id;
        });
        return (
          <GlassPanel key={run.run_id} solid hover className="overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[hsl(var(--accent)/0.3)] transition-colors"
              onClick={() => loadOutputs(run.run_id)}
            >
              <div className="flex items-center gap-3">
                <ListChecks className="w-4 h-4 text-[hsl(var(--status-intelligence))]" />
                <span className="font-mono-tech text-sm text-[hsl(var(--foreground))]">{run.run_id}</span>
                <StatusChip variant={runStatusVariant(run.status)} label={run.status} />
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{taskNames.join(", ")}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">
                <span>{run.outputs_refs?.findings_count ?? 0}F</span>
                <span>{run.outputs_refs?.insights_count ?? 0}I</span>
                <span>{run.outputs_refs?.bottlenecks_count ?? 0}B</span>
                <span>{run.outputs_refs?.recommendations_count ?? 0}R</span>
                {run.telemetry_summary && <span>{run.telemetry_summary.total_time_ms}ms</span>}
                {expandedRun === run.run_id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {expandedRun === run.run_id && outputs && (
              <div className="border-t border-[hsl(var(--glass-border))] px-4 py-3 space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-[hsl(var(--muted-foreground))]">Agents:</span> <span className="font-mono-tech">{(run.assigned_agents ?? []).join(", ")}</span></div>
                  <div><span className="text-[hsl(var(--muted-foreground))]">Trigger:</span> <span className="font-mono-tech">{run.trigger}</span></div>
                  {run.completed_at && <div><span className="text-[hsl(var(--muted-foreground))]">Completed:</span> <span className="font-mono-tech">{new Date(run.completed_at).toLocaleString()}</span></div>}
                </div>

                {outputs.insights?.length > 0 && (
                  <div>
                    <h5 className="text-system-label mb-2">Insights</h5>
                    {outputs.insights.map((ins: any) => (
                      <div key={ins.insight_id} className="glass-panel rounded p-3 mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Lightbulb className="w-3.5 h-3.5 text-[hsl(var(--status-warning))]" />
                          <StatusChip variant={intentVariant(ins.category)} label={ins.category} />
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">confidence: {ins.confidence}%</span>
                        </div>
                        <p className="text-xs text-[hsl(var(--foreground))]">{ins.narrative}</p>
                        {ins.suggested_next_actions?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {ins.suggested_next_actions.map((a: string, i: number) => (
                              <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {outputs.bottlenecks?.length > 0 && (
                  <div>
                    <h5 className="text-system-label mb-2">Bottlenecks</h5>
                    {outputs.bottlenecks.map((bn: any) => (
                      <div key={bn.report_id} className="glass-panel rounded p-3 mb-2">
                        <div className="text-xs mb-2">
                          <span className="text-[hsl(var(--muted-foreground))]">Total: </span>
                          <span className="font-mono-tech text-[hsl(var(--foreground))]">{Math.round(bn.total_time_ms / 1000)}s / {bn.total_tokens} tokens</span>
                        </div>
                        {bn.hotspots?.map((h: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-[hsl(var(--glass-border))] last:border-0">
                            <div className="w-24 font-mono-tech text-[hsl(var(--foreground))]">{h.location}</div>
                            <div className="flex-1 h-2 rounded-full bg-[hsl(var(--muted)/0.3)] overflow-hidden">
                              <div className="h-full rounded-full bg-[hsl(var(--status-failure))]" style={{ width: `${Math.min(h.percentage_of_total, 100)}%` }} />
                            </div>
                            <div className="w-12 text-right font-mono-tech text-[hsl(var(--muted-foreground))]">{h.percentage_of_total}%</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {outputs.recommendations?.length > 0 && (
                  <div>
                    <h5 className="text-system-label mb-2">Recommendations</h5>
                    {outputs.recommendations.map((rec: any) => (
                      <div key={rec.recommendation_id} className="glass-panel rounded p-3 mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <StatusChip variant={severityVariant(rec.priority)} label={rec.priority} />
                            <span className="text-xs font-medium text-[hsl(var(--foreground))]">{rec.title}</span>
                          </div>
                          {rec.convertible_to_changeset && (
                            <ConvertToChangeSetButton recommendationId={rec.recommendation_id} />
                          )}
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{rec.description}</p>
                        <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">Impact: {rec.estimated_impact}</div>
                      </div>
                    ))}
                  </div>
                )}

                {outputs.findings?.length > 0 && (
                  <div>
                    <h5 className="text-system-label mb-2">Findings ({outputs.findings.length})</h5>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {outputs.findings.slice(0, 20).map((f: any) => (
                        <div key={f.finding_id} className="flex items-center gap-2 text-xs py-1">
                          <StatusChip variant={severityVariant(f.severity)} label={f.severity} />
                          <span className="text-[hsl(var(--foreground))] truncate">{f.title}</span>
                          <span className="font-mono-tech text-[hsl(var(--muted-foreground))] ml-auto">{f.file_path}</span>
                        </div>
                      ))}
                      {outputs.findings.length > 20 && (
                        <div className="text-xs text-[hsl(var(--muted-foreground))] text-center py-1">...and {outputs.findings.length - 20} more</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassPanel>
        );
      })}
    </div>
  );
}

function ConvertToChangeSetButton({ recommendationId, onSuccess }: { recommendationId: string; onSuccess?: (cs: any) => void }) {
  const queryClient = useQueryClient();
  const convertMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/mus/recommendations/${recommendationId}/convert`, { method: "POST" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/mus"] });
      onSuccess?.(data);
    },
  });

  return (
    <div className="inline-flex flex-col items-start">
      <button
        onClick={(e) => { e.stopPropagation(); convertMutation.mutate(); }}
        disabled={convertMutation.isPending || convertMutation.isSuccess}
        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.25)] disabled:opacity-50 transition-colors"
      >
        {convertMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRightCircle className="w-3 h-3" />}
        {convertMutation.isSuccess ? "Converted" : "Convert to ChangeSet"}
      </button>
      {convertMutation.isSuccess && convertMutation.data && (
        <span className="text-[10px] text-[hsl(var(--status-success))] mt-0.5">{convertMutation.data.changeset_id}</span>
      )}
      {convertMutation.error && (
        <span className="text-[10px] text-[hsl(var(--status-failure))] mt-0.5">{(convertMutation.error as Error).message}</span>
      )}
    </div>
  );
}

function InsightsTab() {
  const { data: insights = [], isLoading: insightsLoading } = useQuery<any[]>({
    queryKey: ["/api/mus/insights"],
    queryFn: () => fetch("/api/mus/insights").then(r => r.json()),
  });

  const { data: bottlenecks = [], isLoading: bnLoading } = useQuery<any[]>({
    queryKey: ["/api/mus/bottlenecks"],
    queryFn: () => fetch("/api/mus/bottlenecks").then(r => r.json()),
  });

  const { data: recommendations = [], isLoading: recsLoading } = useQuery<any[]>({
    queryKey: ["/api/mus/recommendations"],
    queryFn: () => fetch("/api/mus/recommendations").then(r => r.json()),
  });

  const isLoading = insightsLoading || bnLoading || recsLoading;

  if (isLoading) return <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" /></div>;

  if (insights.length === 0 && bottlenecks.length === 0 && recommendations.length === 0) {
    return (
      <GlassPanel solid className="text-center py-12 animate-fade-in">
        <Lightbulb className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--muted-foreground))] opacity-50" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">No insights yet</p>
        <p className="text-xs mt-1 text-[hsl(var(--muted-foreground))]">Run tasks from the Tasks tab to generate insights and bottleneck reports</p>
      </GlassPanel>
    );
  }

  const bottleneckInsights = insights.filter((i: any) => i.category === "bottleneck");
  const qualityInsights = insights.filter((i: any) => i.category === "quality");
  const reliabilityInsights = insights.filter((i: any) => i.category === "reliability");
  const costInsights = insights.filter((i: any) => i.category === "cost");
  const generalInsights = insights.filter((i: any) => i.category === "general");

  function InsightSection({ title, items, icon: Icon, accentClass }: { title: string; items: any[]; icon: any; accentClass: string }) {
    if (items.length === 0) return null;
    return (
      <GlassPanel solid className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className={`w-4 h-4 ${accentClass}`} />
          <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))]">{title}</h3>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">({items.length})</span>
        </div>
        <div className="space-y-3">
          {items.map((ins: any) => (
            <div key={ins.insight_id} className="glass-panel rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-[hsl(var(--muted-foreground))]">confidence: {ins.confidence}%</span>
                <span className="font-mono-tech text-[10px] text-[hsl(var(--muted-foreground))]">{ins.task_id}</span>
              </div>
              <p className="text-xs text-[hsl(var(--foreground))]">{ins.narrative}</p>
              {ins.suggested_next_actions?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {ins.suggested_next_actions.map((a: string, i: number) => (
                    <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">{a}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {recommendations.length > 0 && (
        <GlassPanel solid glow="violet" className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-[hsl(var(--status-intelligence))]" />
            <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))]">Recommendations</h3>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">({recommendations.length})</span>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec: any) => (
              <div key={rec.recommendation_id} className="glass-panel rounded p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <StatusChip variant={severityVariant(rec.priority)} label={rec.priority} />
                    <span className="text-xs font-medium text-[hsl(var(--foreground))]">{rec.title}</span>
                  </div>
                  {rec.convertible_to_changeset && (
                    <ConvertToChangeSetButton recommendationId={rec.recommendation_id} />
                  )}
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{rec.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Impact: {rec.estimated_impact}</span>
                  <span className="font-mono-tech text-[10px] text-[hsl(var(--muted-foreground))]">{rec.task_id}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {bottlenecks.length > 0 && (
        <GlassPanel solid glow="red" className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[hsl(var(--status-failure))]" />
            <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))]">Top Bottlenecks</h3>
          </div>
          {bottlenecks.map((bn: any) => (
            <div key={bn.report_id} className="glass-panel rounded p-3 mb-3 last:mb-0">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-mono-tech text-[hsl(var(--muted-foreground))]">{bn.task_id}</span>
                <span className="text-[hsl(var(--foreground))]">Total: {Math.round(bn.total_time_ms / 1000)}s / {bn.total_tokens} tokens</span>
              </div>
              {bn.hotspots?.map((h: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-[hsl(var(--glass-border))] last:border-0">
                  <div className="w-28 font-mono-tech text-[hsl(var(--foreground))]">{h.location}</div>
                  <div className="flex-1 h-2.5 rounded-full bg-[hsl(var(--muted)/0.3)] overflow-hidden">
                    <div className="h-full rounded-full bg-[hsl(var(--status-failure))]" style={{ width: `${Math.min(h.percentage_of_total, 100)}%` }} />
                  </div>
                  <div className="w-14 text-right font-mono-tech text-[hsl(var(--muted-foreground))]">{h.percentage_of_total}%</div>
                  <div className="w-20 text-right font-mono-tech text-[hsl(var(--muted-foreground))]">{h.time_ms}ms</div>
                </div>
              ))}
              {bn.hypotheses?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {bn.hypotheses.map((h: string, i: number) => (
                    <p key={i} className="text-[10px] text-[hsl(var(--muted-foreground))] italic">{h}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </GlassPanel>
      )}

      <InsightSection title="Performance Insights" items={bottleneckInsights} icon={Zap} accentClass="text-[hsl(var(--status-failure))]" />
      <InsightSection title="Quality Opportunities" items={qualityInsights} icon={Eye} accentClass="text-[hsl(var(--status-intelligence))]" />
      <InsightSection title="Reliability" items={reliabilityInsights} icon={Shield} accentClass="text-[hsl(var(--status-success))]" />
      <InsightSection title="Cost Analysis" items={costInsights} icon={BarChart3} accentClass="text-[hsl(var(--status-warning))]" />
      <InsightSection title="General" items={generalInsights} icon={Lightbulb} accentClass="text-[hsl(var(--muted-foreground))]" />
    </div>
  );
}

export default function MaintenancePage() {
  const [tab, setTab] = useState("overview");

  const { data: status, isLoading: statusLoading } = useQuery<any>({
    queryKey: ["/api/mus/status"],
    queryFn: () => fetch("/api/mus/status").then(r => r.json()),
  });

  const { data: runs = [] } = useQuery<any[]>({
    queryKey: ["/api/mus/runs"],
    queryFn: () => fetch("/api/mus/runs").then(r => r.json()),
  });

  const { data: allFindings = [] } = useQuery<any[]>({
    queryKey: ["/api/mus/all-findings"],
    queryFn: async () => {
      if (!runs.length) return [];
      const completedRuns = runs.filter((r: any) => r.status === "completed" || r.status === "completed_with_limits");
      if (completedRuns.length === 0) return [];
      const lastRun = completedRuns[0];
      const res = await fetch(`/api/mus/runs/${lastRun.run_id}/findings`);
      return res.ok ? res.json() : [];
    },
    enabled: runs.length > 0,
  });

  if (statusLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" /></div>;
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "tasks", label: "Tasks", icon: Target },
    { id: "task-runs", label: "Task Runs", icon: ListChecks },
    { id: "findings", label: "Findings", icon: AlertTriangle },
    { id: "insights", label: "Insights", icon: Lightbulb },
    { id: "proposals", label: "Proposals", icon: Package },
    { id: "approvals", label: "Approvals", icon: Stamp },
    { id: "schedules", label: "Schedules", icon: Calendar },
    { id: "registries", label: "Registries", icon: FileText },
  ];

  return (
    <div className="animate-fade-in">
      <GlassPanel glow="amber" className="p-5 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--glow-amber)/0.03)] to-transparent pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-[hsl(var(--status-warning))]" />
              <h1 className="text-xl font-bold text-[hsl(var(--foreground))] tracking-tight">Ops Console</h1>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Agent Tasking & Internal Ops — Task-first, consent-gated governance</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusChip variant="processing" label={`${status?.total_runs ?? 0} Runs`} size="md" />
            <StatusChip variant={status?.last_validation?.pass ? "success" : "neutral"} label={status?.last_validation?.pass ? "Validated" : "Not Validated"} size="md" />
          </div>
        </div>
      </GlassPanel>

      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-thin pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
              tab === t.id
                ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] border border-transparent"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab status={status} runs={runs} findings={allFindings} />}
      {tab === "tasks" && <TasksTab />}
      {tab === "task-runs" && <TaskRunsTab />}
      {tab === "findings" && <FindingsTab />}
      {tab === "insights" && <InsightsTab />}
      {tab === "proposals" && <ProposalsTab />}
      {tab === "approvals" && <ApprovalsTab />}
      {tab === "schedules" && <SchedulesTab />}
      {tab === "registries" && <RegistriesTab />}
    </div>
  );
}
