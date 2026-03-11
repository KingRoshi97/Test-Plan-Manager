import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import {
  ShieldCheck, Activity, AlertTriangle, Target, Zap,
  BarChart3, ChevronDown, ChevronRight, Eye, FileText,
  Clock, CheckCircle, XCircle, Loader2, ArrowLeft,
  Filter, Shield, Gauge, Hammer, RefreshCw, List,
  type LucideIcon,
} from "lucide-react";
import { GlassPanel } from "../components/ui/glass-panel";
import { StatusChip, type StatusVariant } from "../components/ui/status-chip";
import { MetricCard } from "../components/ui/metric-card";

function verdictVariant(verdict?: string): StatusVariant {
  switch (verdict) {
    case "PASS": return "success";
    case "PASS_WITH_WARNINGS": return "warning";
    case "CONDITIONAL_PASS": return "warning";
    case "FAIL": return "failure";
    case "BLOCKED": return "neutral";
    default: return "neutral";
  }
}

function severityVariant(sev: string): StatusVariant {
  switch (sev) {
    case "critical": return "failure";
    case "high": return "failure";
    case "medium": return "warning";
    case "low": return "neutral";
    case "info": return "processing";
    default: return "neutral";
  }
}

function domainIcon(domain: string): LucideIcon {
  switch (domain) {
    case "build_integrity": return Hammer;
    case "functional": return Target;
    case "security": return Shield;
    case "performance": return Gauge;
    default: return Activity;
  }
}

function domainLabel(domain: string): string {
  switch (domain) {
    case "build_integrity": return "Build Integrity";
    case "functional": return "Functional";
    case "security": return "Security";
    case "performance": return "Performance";
    default: return domain;
  }
}

function domainStatusVariant(status: string): StatusVariant {
  switch (status) {
    case "pass": return "success";
    case "fail": return "failure";
    case "warn": return "warning";
    case "skip": return "neutral";
    case "blocked": return "neutral";
    default: return "neutral";
  }
}

function coverageColor(state: string): string {
  switch (state) {
    case "covered": return "bg-[hsl(var(--status-success)/0.3)] text-[hsl(var(--status-success))]";
    case "partially_covered": return "bg-[hsl(var(--status-warning)/0.3)] text-[hsl(var(--status-warning))]";
    case "failed": return "bg-[hsl(var(--status-failure)/0.3)] text-[hsl(var(--status-failure))]";
    case "not_tested": return "bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]";
    case "blocked": return "bg-[hsl(var(--status-failure)/0.15)] text-[hsl(var(--muted-foreground))]";
    default: return "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
  }
}

function formatDate(d?: string): string {
  if (!d) return "-";
  return new Date(d).toLocaleString();
}

function OverviewTab({ onSelectRun }: { onSelectRun: (id: string) => void }) {
  const { data: status } = useQuery<any>({
    queryKey: ["/api/avcs/status"],
    queryFn: () => apiRequest("/api/avcs/status"),
    refetchInterval: 5000,
  });

  const { data: runs = [] } = useQuery<any[]>({
    queryKey: ["/api/avcs/runs"],
    queryFn: () => apiRequest("/api/avcs/runs"),
    refetchInterval: 5000,
  });

  const openFindings = runs.reduce((acc: number, r: any) => {
    if (r.verdict === "FAIL" || r.verdict === "CONDITIONAL_PASS") return acc + 1;
    return acc;
  }, 0);

  const avgScore = runs.length > 0
    ? Math.round(runs.filter((r: any) => r.score != null).reduce((a: number, r: any) => a + (r.score || 0), 0) / Math.max(runs.filter((r: any) => r.score != null).length, 1))
    : 0;

  const cards = [
    { label: "Total Runs", value: status?.total_runs ?? 0, icon: Activity, accent: "cyan" as const },
    { label: "Latest Verdict", value: status?.latest_verdict ?? "N/A", icon: ShieldCheck, accent: status?.latest_verdict === "PASS" ? "green" as const : status?.latest_verdict === "FAIL" ? "red" as const : "amber" as const },
    { label: "Domains Covered", value: 4, icon: Target, accent: "violet" as const },
    { label: "Runs with Issues", value: openFindings, icon: AlertTriangle, accent: "red" as const },
    { label: "Average Score", value: avgScore ? `${avgScore}%` : "N/A", icon: BarChart3, accent: "green" as const },
    { label: "Latest Score", value: status?.latest_score != null ? `${status.latest_score}%` : "N/A", icon: Gauge, accent: "cyan" as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <GlassPanel solid glow="cyan" className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--status-intelligence))] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">AVCS Certification Center</h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Post-build verification, certification & remediation</p>
            </div>
          </div>
          <StatusChip
            variant={status?.total_runs > 0 ? "success" : "neutral"}
            label={status?.total_runs > 0 ? "Operational" : "No Runs"}
            size="md"
          />
        </div>
      </GlassPanel>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <MetricCard key={c.label} icon={c.icon} label={c.label} value={c.value} accent={c.accent} />
        ))}
      </div>

      <GlassPanel solid className="p-4">
        <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">Recent Runs</h3>
        {runs.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-6">No certification runs yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--glass-border))]">
                  <th className="text-left px-3 py-2 text-system-label">Run ID</th>
                  <th className="text-left px-3 py-2 text-system-label">Assembly</th>
                  <th className="text-left px-3 py-2 text-system-label">Type</th>
                  <th className="text-left px-3 py-2 text-system-label">Verdict</th>
                  <th className="text-left px-3 py-2 text-system-label">Score</th>
                  <th className="text-left px-3 py-2 text-system-label">Date</th>
                  <th className="text-left px-3 py-2 text-system-label">Action</th>
                </tr>
              </thead>
              <tbody>
                {runs.slice(0, 10).map((r: any) => (
                  <tr key={r.id} className="border-t border-[hsl(var(--glass-border))] hover:bg-[hsl(var(--accent)/0.5)] transition-colors">
                    <td className="px-3 py-2 font-mono-tech text-xs text-[hsl(var(--foreground))]">{r.id}</td>
                    <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">{r.assembly_id}</td>
                    <td className="px-3 py-2"><StatusChip variant="processing" label={r.run_type} /></td>
                    <td className="px-3 py-2">
                      {r.verdict ? <StatusChip variant={verdictVariant(r.verdict)} label={r.verdict} /> : <StatusChip variant="neutral" label={r.status} />}
                    </td>
                    <td className="px-3 py-2 font-mono-tech text-xs">{r.score != null ? `${r.score}%` : "-"}</td>
                    <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">{formatDate(r.created_at)}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => onSelectRun(r.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)] transition-colors"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}

function DomainCard({ domain, expanded, onToggle }: { domain: any; expanded: boolean; onToggle: () => void }) {
  const Icon = domainIcon(domain.domain);
  return (
    <GlassPanel solid glow={domain.status === "pass" ? "green" : domain.status === "fail" ? "red" : "amber"} className="p-4">
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-[hsl(var(--foreground))]" />
            <span className="text-sm font-semibold text-[hsl(var(--card-foreground))]">{domainLabel(domain.domain)}</span>
          </div>
          <StatusChip variant={domainStatusVariant(domain.status)} label={domain.status.toUpperCase()} />
        </div>
        <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
          <span>{domain.checks?.length ?? 0} checks</span>
          <span>{domain.findings_count ?? 0} findings</span>
          <span className="font-mono-tech">{domain.score ?? 0}%</span>
        </div>
        <div className="mt-2 h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${domain.score >= 80 ? "bg-[hsl(var(--status-success))]" : domain.score >= 60 ? "bg-[hsl(var(--status-warning))]" : "bg-[hsl(var(--status-failure))]"}`}
            style={{ width: `${Math.min(domain.score ?? 0, 100)}%` }}
          />
        </div>
      </button>
      {expanded && domain.checks && (
        <div className="mt-3 pt-3 border-t border-[hsl(var(--glass-border))] space-y-1.5">
          {domain.checks.map((check: any) => (
            <div key={check.check_id} className="flex items-start gap-2 text-xs">
              {check.result === "pass" ? (
                <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--status-success))] mt-0.5 shrink-0" />
              ) : check.result === "fail" ? (
                <XCircle className="w-3.5 h-3.5 text-[hsl(var(--status-failure))] mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--status-warning))] mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[hsl(var(--foreground))]">{check.description}</span>
                {check.detail && <p className="text-[hsl(var(--muted-foreground))] mt-0.5">{check.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}

function FindingRow({ finding, onAcknowledge, onSuppress }: { finding: any; onAcknowledge: () => void; onSuppress: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-[hsl(var(--glass-border))] last:border-0">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3 hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] shrink-0" />}
          <StatusChip variant={severityVariant(finding.severity)} label={finding.severity} />
          <StatusChip variant={finding.impact === "release_blocker" ? "failure" : finding.impact === "conditional_blocker" ? "warning" : "neutral"} label={finding.impact} />
          <span className="text-sm text-[hsl(var(--foreground))] flex-1 truncate">{finding.title}</span>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">{domainLabel(finding.domain)}</span>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pl-11 space-y-3">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{finding.description}</p>

          {finding.affected_files?.length > 0 && (
            <div>
              <span className="text-system-label text-xs">Affected Files</span>
              <div className="mt-1 space-y-0.5">
                {finding.affected_files.map((f: string) => (
                  <div key={f} className="font-mono-tech text-xs text-[hsl(var(--status-processing))]">{f}</div>
                ))}
              </div>
            </div>
          )}

          {finding.probable_cause && (
            <div>
              <span className="text-system-label text-xs">Probable Cause</span>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{finding.probable_cause}</p>
            </div>
          )}

          {finding.evidence_refs?.length > 0 && (
            <div>
              <span className="text-system-label text-xs">Evidence</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {finding.evidence_refs.map((ref: string) => (
                  <span key={ref} className="font-mono-tech text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">{ref}</span>
                ))}
              </div>
            </div>
          )}

          {finding.remediation && (
            <div>
              <span className="text-system-label text-xs">Remediation Guidance</span>
              <p className="text-xs text-[hsl(var(--foreground))] mt-0.5">{finding.remediation}</p>
            </div>
          )}

          {finding.status === "open" && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={(e) => { e.stopPropagation(); onAcknowledge(); }}
                className="px-3 py-1 rounded text-xs bg-[hsl(var(--status-processing)/0.15)] text-[hsl(var(--status-processing))] hover:bg-[hsl(var(--status-processing)/0.25)] transition-colors"
              >
                Acknowledge
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onSuppress(); }}
                className="px-3 py-1 rounded text-xs bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
              >
                Suppress
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RunDetailView({ certRunId, onBack }: { certRunId: string; onBack: () => void }) {
  const queryClient = useQueryClient();
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [findingSeverityFilter, setFindingSeverityFilter] = useState("");
  const [findingDomainFilter, setFindingDomainFilter] = useState("");

  const { data: run, isLoading: runLoading } = useQuery<any>({
    queryKey: ["/api/avcs/runs", certRunId],
    queryFn: () => apiRequest(`/api/avcs/runs/${certRunId}`),
    refetchInterval: (query) => {
      const d = query.state.data;
      return d?.status === "running" ? 2000 : false;
    },
  });

  const { data: report } = useQuery<any>({
    queryKey: ["/api/avcs/runs", certRunId, "report"],
    queryFn: () => apiRequest(`/api/avcs/runs/${certRunId}/report`),
    enabled: run?.status === "completed",
  });

  const findingsParams = new URLSearchParams();
  if (findingSeverityFilter) findingsParams.set("severity", findingSeverityFilter);
  if (findingDomainFilter) findingsParams.set("domain", findingDomainFilter);

  const { data: findings = [] } = useQuery<any[]>({
    queryKey: ["/api/avcs/runs", certRunId, "findings", findingSeverityFilter, findingDomainFilter],
    queryFn: () => apiRequest(`/api/avcs/runs/${certRunId}/findings?${findingsParams}`),
    enabled: run?.status === "completed",
  });

  const { data: evidence = [] } = useQuery<any[]>({
    queryKey: ["/api/avcs/runs", certRunId, "evidence"],
    queryFn: () => apiRequest(`/api/avcs/runs/${certRunId}/evidence`),
    enabled: run?.status === "completed",
  });

  const { data: coverage = [] } = useQuery<any[]>({
    queryKey: ["/api/avcs/runs", certRunId, "coverage"],
    queryFn: () => apiRequest(`/api/avcs/runs/${certRunId}/coverage`),
    enabled: run?.status === "completed",
  });

  const updateFinding = useMutation({
    mutationFn: async ({ findingId, status }: { findingId: string; status: string }) => {
      return apiRequest(`/api/avcs/findings/${findingId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/avcs/runs", certRunId, "findings"] }),
  });

  if (runLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  if (!run) {
    return (
      <GlassPanel solid className="p-8 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Run not found</p>
        <button onClick={onBack} className="mt-3 text-sm text-[hsl(var(--primary))] hover:underline">Back to overview</button>
      </GlassPanel>
    );
  }

  const domains = report?.domains || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to runs
      </button>

      <GlassPanel solid glow={run.verdict ? (run.verdict === "PASS" ? "green" : run.verdict === "FAIL" ? "red" : "amber") : "cyan"} className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono-tech text-sm text-[hsl(var(--foreground))]">{run.id}</span>
              <StatusChip variant="processing" label={run.run_type} size="md" />
            </div>
            <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
              <span>Assembly: {run.assembly_id}</span>
              <span>Build: {run.run_id}</span>
              {run.started_at && (
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(run.started_at)}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {run.score != null && (
              <div className="text-right">
                <div className="text-2xl font-bold text-[hsl(var(--foreground))]">{run.score}%</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Score</div>
              </div>
            )}
            {run.verdict ? (
              <StatusChip variant={verdictVariant(run.verdict)} label={run.verdict} size="md" pulse={run.verdict === "PASS"} />
            ) : (
              <StatusChip variant={run.status === "running" ? "processing" : "neutral"} label={run.status} size="md" pulse={run.status === "running"} />
            )}
          </div>
        </div>
      </GlassPanel>

      {run.status === "running" && (
        <GlassPanel solid glow="cyan" className="p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--status-processing))] mx-auto mb-3" />
          <p className="text-sm text-[hsl(var(--foreground))]">Certification run in progress...</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Evaluating domains: {run.domains_evaluated?.join(", ")}</p>
        </GlassPanel>
      )}

      {domains.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Domain Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {domains.map((d: any) => (
              <DomainCard
                key={d.domain}
                domain={d}
                expanded={expandedDomain === d.domain}
                onToggle={() => setExpandedDomain(expandedDomain === d.domain ? null : d.domain)}
              />
            ))}
          </div>
        </div>
      )}

      {run.status === "completed" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Findings ({findings.length})</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
              <select
                value={findingSeverityFilter}
                onChange={(e) => setFindingSeverityFilter(e.target.value)}
                className="rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-2 py-1 text-xs text-[hsl(var(--foreground))]"
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
              <select
                value={findingDomainFilter}
                onChange={(e) => setFindingDomainFilter(e.target.value)}
                className="rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-2 py-1 text-xs text-[hsl(var(--foreground))]"
              >
                <option value="">All Domains</option>
                <option value="build_integrity">Build Integrity</option>
                <option value="functional">Functional</option>
                <option value="security">Security</option>
                <option value="performance">Performance</option>
              </select>
            </div>
          </div>
          <GlassPanel solid className="overflow-hidden">
            {findings.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-[hsl(var(--status-success))] opacity-50" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">No findings match filters</p>
              </div>
            ) : (
              findings.map((f: any) => (
                <FindingRow
                  key={f.id}
                  finding={f}
                  onAcknowledge={() => updateFinding.mutate({ findingId: f.id, status: "acknowledged" })}
                  onSuppress={() => updateFinding.mutate({ findingId: f.id, status: "suppressed" })}
                />
              ))
            )}
          </GlassPanel>
        </div>
      )}

      {coverage.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Coverage Matrix</h3>
          <GlassPanel solid className="p-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--glass-border))]">
                  <th className="text-left px-2 py-1.5 text-system-label">Surface</th>
                  <th className="text-left px-2 py-1.5 text-system-label">Type</th>
                  <th className="text-left px-2 py-1.5 text-system-label">Domain</th>
                  <th className="text-left px-2 py-1.5 text-system-label">State</th>
                </tr>
              </thead>
              <tbody>
                {coverage.map((c: any, i: number) => (
                  <tr key={i} className="border-t border-[hsl(var(--glass-border))]">
                    <td className="px-2 py-1.5 text-[hsl(var(--foreground))]">{c.surface_name}</td>
                    <td className="px-2 py-1.5 text-[hsl(var(--muted-foreground))]">{c.surface_type}</td>
                    <td className="px-2 py-1.5 text-[hsl(var(--muted-foreground))]">{domainLabel(c.domain)}</td>
                    <td className="px-2 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${coverageColor(c.state)}`}>{c.state}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassPanel>
        </div>
      )}

      {evidence.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Evidence ({evidence.length})</h3>
          <GlassPanel solid className="p-4 space-y-2">
            {evidence.map((e: any) => (
              <details key={e.id} className="border-b border-[hsl(var(--glass-border))] last:border-0 pb-2">
                <summary className="cursor-pointer text-xs text-[hsl(var(--foreground))] py-1 hover:text-[hsl(var(--primary))] transition-colors">
                  <span className="ml-1">[{e.domain}] {e.title}</span>
                  <span className="text-[hsl(var(--muted-foreground))] ml-2">({e.type})</span>
                </summary>
                <pre className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.3)] p-2 rounded overflow-x-auto whitespace-pre-wrap">{e.content}</pre>
              </details>
            ))}
          </GlassPanel>
        </div>
      )}
    </div>
  );
}

function ReleaseGateTab({ onSelectRun }: { onSelectRun: (id: string) => void }) {
  const [, setLocation] = useLocation();

  const { data: runs = [] } = useQuery<any[]>({
    queryKey: ["/api/avcs/runs"],
    queryFn: () => apiRequest("/api/avcs/runs"),
  });

  const latestCompleted = runs.find((r: any) => r.status === "completed");

  const { data: report } = useQuery<any>({
    queryKey: ["/api/avcs/runs", latestCompleted?.id, "report"],
    queryFn: () => apiRequest(`/api/avcs/runs/${latestCompleted?.id}/report`),
    enabled: !!latestCompleted,
  });

  const remediate = useMutation({
    mutationFn: async (certRunId: string) => {
      return apiRequest(`/api/avcs/runs/${certRunId}/remediate`, { method: "POST" });
    },
  });

  if (!latestCompleted || !report) {
    return (
      <div className="animate-fade-in">
        <GlassPanel solid className="p-12 text-center">
          <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-[hsl(var(--muted-foreground))] opacity-30" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No completed certification run to display</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Run a certification from the Overview tab or Build workspace</p>
        </GlassPanel>
      </div>
    );
  }

  const needsRemediation = report.verdict === "FAIL" || report.verdict === "CONDITIONAL_PASS" || report.verdict === "PASS_WITH_WARNINGS";
  const manifest = report.remediation_manifest;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-center">
        <GlassPanel
          solid
          glow={report.verdict === "PASS" ? "green" : report.verdict === "FAIL" ? "red" : "amber"}
          className="px-12 py-8 text-center"
        >
          <div className="text-xs text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wider">Final Verdict</div>
          <StatusChip variant={verdictVariant(report.verdict)} label={report.verdict} size="md" pulse={report.verdict === "PASS"} />
          <div className="text-3xl font-bold text-[hsl(var(--foreground))] mt-3">{report.overall_score}%</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Overall Score</div>
        </GlassPanel>
      </div>

      {report.hard_stop_failures?.length > 0 && (
        <GlassPanel solid glow="red" className="p-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--status-failure))] mb-2 flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Hard-Stop Failures
          </h3>
          <ul className="space-y-1">
            {report.hard_stop_failures.map((f: string, i: number) => (
              <li key={i} className="text-xs text-[hsl(var(--status-failure))]">{f}</li>
            ))}
          </ul>
        </GlassPanel>
      )}

      {report.findings_summary && (
        <GlassPanel solid className="p-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">Findings Summary</h3>
          <div className="flex gap-3">
            {["critical", "high", "medium", "low", "info"].map((sev) => (
              <div key={sev} className="text-center">
                <div className="text-lg font-bold text-[hsl(var(--foreground))]">{report.findings_summary[sev] ?? 0}</div>
                <StatusChip variant={severityVariant(sev)} label={sev} />
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {report.score_breakdown?.length > 0 && (
        <GlassPanel solid className="p-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">Score Breakdown by Domain</h3>
          <div className="space-y-3">
            {report.score_breakdown.map((sb: any) => (
              <div key={sb.domain} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[hsl(var(--foreground))]">{domainLabel(sb.domain)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[hsl(var(--muted-foreground))]">weight: {Math.round(sb.weight * 100)}%</span>
                    <span className="font-mono-tech text-[hsl(var(--foreground))]">{sb.raw_score}%</span>
                  </div>
                </div>
                <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${sb.raw_score >= 80 ? "bg-[hsl(var(--status-success))]" : sb.raw_score >= 60 ? "bg-[hsl(var(--status-warning))]" : "bg-[hsl(var(--status-failure))]"}`}
                    style={{ width: `${Math.min(sb.raw_score, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      <GlassPanel solid className="p-4">
        <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-2">Evidence Completeness</h3>
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <FileText className="w-3.5 h-3.5" />
          <span>{report.evidence_manifest?.length ?? 0} evidence artifacts collected</span>
        </div>
      </GlassPanel>

      {needsRemediation && manifest && (
        <GlassPanel solid glow="amber" className="p-5">
          <h3 className="text-sm font-semibold text-[hsl(var(--status-warning))] mb-3 flex items-center gap-2">
            <Hammer className="w-4 h-4" /> Remediation Required
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-xl font-bold text-[hsl(var(--foreground))]">{manifest.total_files ?? 0}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Files to regenerate</div>
            </div>
            <div>
              <div className="text-xl font-bold text-[hsl(var(--foreground))]">{manifest.affected_unit_ids?.length ?? 0}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Build units affected</div>
            </div>
            <div>
              <div className="text-xl font-bold text-[hsl(var(--foreground))]">{manifest.affected_findings?.length ?? 0}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Findings to address</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => remediate.mutate(latestCompleted.id)}
              disabled={remediate.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[hsl(var(--status-warning))] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {remediate.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Remediate
            </button>
            <button
              onClick={() => onSelectRun(latestCompleted.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-[hsl(var(--glass-border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
            >
              <Eye className="w-4 h-4" /> View Full Report
            </button>
          </div>
          {remediate.isSuccess && (
            <div className="mt-3 text-xs text-[hsl(var(--status-success))]">Remediation started. Check build progress for updates.</div>
          )}
          {remediate.isError && (
            <div className="mt-3 text-xs text-[hsl(var(--status-failure))]">{(remediate.error as Error).message}</div>
          )}
        </GlassPanel>
      )}
    </div>
  );
}

function HistoryTab({ onSelectRun }: { onSelectRun: (id: string) => void }) {
  const { data: runs = [] } = useQuery<any[]>({
    queryKey: ["/api/avcs/runs"],
    queryFn: () => apiRequest("/api/avcs/runs"),
  });

  const findingCounts: Record<string, number> = {};
  runs.forEach((r: any) => {
    if (r.verdict) {
      const key = `${r.assembly_id}-${r.verdict}`;
      findingCounts[key] = (findingCounts[key] || 0) + 1;
    }
  });

  const recurring = Object.entries(findingCounts)
    .filter(([, count]) => count > 1)
    .map(([key, count]) => ({ key, count }));

  return (
    <div className="space-y-6 animate-fade-in">
      {recurring.length > 0 && (
        <GlassPanel solid glow="amber" className="p-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--status-warning))] mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Recurring Patterns
          </h3>
          <div className="space-y-1">
            {recurring.map(({ key, count }) => (
              <div key={key} className="text-xs text-[hsl(var(--muted-foreground))]">
                Assembly/Verdict pattern <span className="font-mono-tech text-[hsl(var(--foreground))]">{key}</span> appeared in {count} runs
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      <GlassPanel solid className="p-4">
        <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">All Past Runs</h3>
        {runs.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-6">No certification runs yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--glass-border))]">
                  <th className="text-left px-3 py-2 text-system-label">Run ID</th>
                  <th className="text-left px-3 py-2 text-system-label">Assembly</th>
                  <th className="text-left px-3 py-2 text-system-label">Build Run</th>
                  <th className="text-left px-3 py-2 text-system-label">Type</th>
                  <th className="text-left px-3 py-2 text-system-label">Verdict</th>
                  <th className="text-left px-3 py-2 text-system-label">Score</th>
                  <th className="text-left px-3 py-2 text-system-label">Status</th>
                  <th className="text-left px-3 py-2 text-system-label">Created</th>
                  <th className="text-left px-3 py-2 text-system-label">Action</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r: any) => (
                  <tr key={r.id} className="border-t border-[hsl(var(--glass-border))] hover:bg-[hsl(var(--accent)/0.5)] transition-colors">
                    <td className="px-3 py-2 font-mono-tech text-xs text-[hsl(var(--foreground))]">{r.id}</td>
                    <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">{r.assembly_id}</td>
                    <td className="px-3 py-2 font-mono-tech text-xs text-[hsl(var(--muted-foreground))]">{r.run_id}</td>
                    <td className="px-3 py-2"><StatusChip variant="processing" label={r.run_type} /></td>
                    <td className="px-3 py-2">
                      {r.verdict ? <StatusChip variant={verdictVariant(r.verdict)} label={r.verdict} /> : <span className="text-xs text-[hsl(var(--muted-foreground))]">-</span>}
                    </td>
                    <td className="px-3 py-2 font-mono-tech text-xs">{r.score != null ? `${r.score}%` : "-"}</td>
                    <td className="px-3 py-2"><StatusChip variant={r.status === "completed" ? "success" : r.status === "running" ? "processing" : r.status === "failed" ? "failure" : "neutral"} label={r.status} /></td>
                    <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">{formatDate(r.created_at)}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => onSelectRun(r.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)] transition-colors"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}

export default function CertificationPage() {
  const [, params] = useRoute("/certification/:certRunId");
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "detail" | "release" | "history">("overview");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(params?.certRunId || null);

  useEffect(() => {
    if (params?.certRunId) {
      setSelectedRunId(params.certRunId);
      setActiveTab("detail");
    }
  }, [params?.certRunId]);

  const handleSelectRun = (id: string) => {
    setSelectedRunId(id);
    setActiveTab("detail");
    setLocation(`/certification/${id}`);
  };

  const handleBack = () => {
    setSelectedRunId(null);
    setActiveTab("overview");
    setLocation("/certification");
  };

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Activity },
    { id: "detail" as const, label: "Run Detail", icon: Eye, hidden: !selectedRunId },
    { id: "release" as const, label: "Release Gate", icon: ShieldCheck },
    { id: "history" as const, label: "History", icon: List },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-[hsl(var(--primary))]" />
        <div>
          <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">Certification</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">AVCS Verification & Certification Suite</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-[hsl(var(--glass-border))]">
        {tabs.filter(t => !t.hidden).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                  : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && <OverviewTab onSelectRun={handleSelectRun} />}
      {activeTab === "detail" && selectedRunId && <RunDetailView certRunId={selectedRunId} onBack={handleBack} />}
      {activeTab === "release" && <ReleaseGateTab onSelectRun={handleSelectRun} />}
      {activeTab === "history" && <HistoryTab onSelectRun={handleSelectRun} />}
    </div>
  );
}
