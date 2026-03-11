import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import {
  ShieldCheck, Activity, AlertTriangle, Target, Zap,
  BarChart3, ChevronDown, ChevronRight, Eye, FileText,
  Clock, CheckCircle, XCircle, Loader2, ArrowLeft,
  Filter, Shield, Gauge, Hammer, RefreshCw, List,
  Monitor, MousePointer, Accessibility, Building2,
  Rocket, Wrench, Play, Package,
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
    case "deployment_readiness": return Rocket;
    case "ui_quality": return Monitor;
    case "ux_workflow": return MousePointer;
    case "accessibility": return Accessibility;
    case "enterprise_readiness": return Building2;
    default: return Activity;
  }
}

function domainLabel(domain: string): string {
  switch (domain) {
    case "build_integrity": return "Build Integrity";
    case "functional": return "Functional";
    case "security": return "Security";
    case "performance": return "Performance";
    case "deployment_readiness": return "Deployment";
    case "ui_quality": return "UI Quality";
    case "ux_workflow": return "UX Workflow";
    case "accessibility": return "Accessibility";
    case "enterprise_readiness": return "Enterprise";
    default: return domain;
  }
}

function domainColor(domain: string): string {
  switch (domain) {
    case "build_integrity": return "amber";
    case "functional": return "cyan";
    case "security": return "red";
    case "performance": return "green";
    case "deployment_readiness": return "violet";
    case "ui_quality": return "cyan";
    case "ux_workflow": return "green";
    case "accessibility": return "amber";
    case "enterprise_readiness": return "violet";
    default: return "cyan";
  }
}

const ALL_DOMAINS = [
  "build_integrity", "functional", "security", "performance",
  "deployment_readiness", "ui_quality", "ux_workflow",
  "accessibility", "enterprise_readiness",
];

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
    case "covered_failed": return "bg-[hsl(var(--status-failure)/0.3)] text-[hsl(var(--status-failure))]";
    case "partial": return "bg-[hsl(var(--status-warning)/0.3)] text-[hsl(var(--status-warning))]";
    case "partially_covered": return "bg-[hsl(var(--status-warning)/0.3)] text-[hsl(var(--status-warning))]";
    case "blocked": return "bg-[hsl(var(--status-failure)/0.15)] text-[hsl(var(--muted-foreground))]";
    case "not_tested": return "bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]";
    case "failed": return "bg-[hsl(var(--status-failure)/0.3)] text-[hsl(var(--status-failure))]";
    default: return "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
  }
}

function coverageLabel(state: string): string {
  switch (state) {
    case "covered": return "Covered";
    case "covered_failed": return "Failed";
    case "partial": return "Partial";
    case "partially_covered": return "Partial";
    case "blocked": return "Blocked";
    case "not_tested": return "Not Tested";
    case "failed": return "Failed";
    default: return state;
  }
}

function evidenceTypeIcon(type: string): LucideIcon {
  switch (type) {
    case "log": return FileText;
    case "metric": return BarChart3;
    case "finding": return AlertTriangle;
    case "summary": return List;
    case "check_result": return CheckCircle;
    case "screenshot": return Monitor;
    case "report": return FileText;
    case "trace": return Activity;
    default: return FileText;
  }
}

function formatDate(d?: string): string {
  if (!d) return "-";
  return new Date(d).toLocaleString();
}

function timeSince(d?: string): string {
  if (!d) return "N/A";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function ToolBadge({ toolId }: { toolId: string }) {
  const toolColors: Record<string, string> = {
    internal: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
    semgrep: "bg-green-500/20 text-green-400",
    lighthouse: "bg-orange-500/20 text-orange-400",
    playwright: "bg-emerald-500/20 text-emerald-400",
    trivy: "bg-blue-500/20 text-blue-400",
    zap: "bg-purple-500/20 text-purple-400",
    k6: "bg-violet-500/20 text-violet-400",
    backstop: "bg-pink-500/20 text-pink-400",
    axe: "bg-cyan-500/20 text-cyan-400",
    pa11y: "bg-teal-500/20 text-teal-400",
    "dependency-check": "bg-amber-500/20 text-amber-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${toolColors[toolId] || toolColors.internal}`}>
      <Wrench className="w-2.5 h-2.5" />
      {toolId}
    </span>
  );
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

  const { data: toolStatus } = useQuery<any>({
    queryKey: ["/api/avcs/tools/status"],
    queryFn: () => apiRequest("/api/avcs/tools/status"),
  });

  const completedRuns = runs.filter((r: any) => r.status === "completed");
  const latestCompleted = completedRuns[0];

  const blockerCount = completedRuns.reduce((acc: number, r: any) => {
    if (r.verdict === "FAIL" || r.verdict === "BLOCKED") return acc + 1;
    return acc;
  }, 0);

  const warningCount = completedRuns.reduce((acc: number, r: any) => {
    if (r.verdict === "PASS_WITH_WARNINGS" || r.verdict === "CONDITIONAL_PASS") return acc + 1;
    return acc;
  }, 0);

  const avgScore = completedRuns.length > 0
    ? Math.round(completedRuns.filter((r: any) => r.score != null).reduce((a: number, r: any) => a + (r.score || 0), 0) / Math.max(completedRuns.filter((r: any) => r.score != null).length, 1))
    : 0;

  const activeDomains = latestCompleted?.domains_evaluated?.length ?? 0;
  const totalDomains = ALL_DOMAINS.length;

  const cards = [
    { label: "Total Runs", value: status?.total_runs ?? 0, icon: Activity, accent: "cyan" as const },
    { label: "Latest Verdict", value: status?.latest_verdict ?? "N/A", icon: ShieldCheck, accent: status?.latest_verdict === "PASS" ? "green" as const : status?.latest_verdict === "FAIL" ? "red" as const : "amber" as const },
    { label: "Domains", value: `${activeDomains}/${totalDomains}`, icon: Target, accent: "violet" as const },
    { label: "Blockers", value: blockerCount, icon: XCircle, accent: blockerCount > 0 ? "red" as const : "green" as const },
    { label: "Warnings", value: warningCount, icon: AlertTriangle, accent: warningCount > 0 ? "amber" as const : "green" as const },
    { label: "Avg Score", value: avgScore ? `${avgScore}%` : "N/A", icon: BarChart3, accent: "green" as const },
    { label: "Latest Score", value: status?.latest_score != null ? `${status.latest_score}%` : "N/A", icon: Gauge, accent: "cyan" as const },
    { label: "Tools Ready", value: toolStatus ? `${toolStatus.summary.available}/${toolStatus.summary.total}` : "...", icon: Wrench, accent: "violet" as const },
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
          <div className="flex items-center gap-3">
            {latestCompleted && (
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                Last certified: {timeSince(latestCompleted.completed_at || latestCompleted.created_at)}
              </span>
            )}
            <StatusChip
              variant={status?.total_runs > 0 ? "success" : "neutral"}
              label={status?.total_runs > 0 ? "Operational" : "No Runs"}
              size="md"
            />
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {cards.map((c) => (
          <MetricCard key={c.label} icon={c.icon} label={c.label} value={c.value} accent={c.accent} />
        ))}
      </div>

      {latestCompleted && (
        <GlassPanel solid className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))]">Latest Run Summary</h3>
            <div className="flex items-center gap-2">
              <StatusChip variant="processing" label={latestCompleted.run_type} />
              <StatusChip variant={verdictVariant(latestCompleted.verdict)} label={latestCompleted.verdict || latestCompleted.status} />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-system-label">Run ID</span>
              <p className="font-mono-tech text-[hsl(var(--foreground))] mt-0.5">{latestCompleted.id}</p>
            </div>
            <div>
              <span className="text-system-label">Assembly</span>
              <p className="text-[hsl(var(--foreground))] mt-0.5">{latestCompleted.assembly_id}</p>
            </div>
            <div>
              <span className="text-system-label">Score</span>
              <p className="font-mono-tech text-[hsl(var(--foreground))] mt-0.5">{latestCompleted.score != null ? `${latestCompleted.score}%` : "N/A"}</p>
            </div>
            <div>
              <span className="text-system-label">Completed</span>
              <p className="text-[hsl(var(--foreground))] mt-0.5">{formatDate(latestCompleted.completed_at || latestCompleted.created_at)}</p>
            </div>
          </div>
        </GlassPanel>
      )}

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
                <div className="flex items-center gap-2">
                  <span className="text-[hsl(var(--foreground))]">{check.description}</span>
                  {check.test_id && (
                    <span className="font-mono-tech text-[10px] px-1 py-0.5 rounded bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]">{check.test_id}</span>
                  )}
                </div>
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
  const Icon = domainIcon(finding.domain);

  return (
    <div className="border-b border-[hsl(var(--glass-border))] last:border-0">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3 hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] shrink-0" />}
          <StatusChip variant={severityVariant(finding.severity)} label={finding.severity} />
          <StatusChip variant={finding.impact === "release_blocker" ? "failure" : finding.impact === "conditional_blocker" ? "warning" : "neutral"} label={finding.impact} />
          <span className="text-sm text-[hsl(var(--foreground))] flex-1 truncate">{finding.title}</span>
          <div className="flex items-center gap-1.5">
            <Icon className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
            <span className="text-xs text-[hsl(var(--muted-foreground))]">{domainLabel(finding.domain)}</span>
          </div>
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
              <span className="text-system-label text-xs">Evidence ({finding.evidence_refs.length})</span>
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

function TestExecutionView({ certRunId }: { certRunId: string }) {
  const { data: plan } = useQuery<any>({
    queryKey: ["/api/avcs/runs", certRunId, "report"],
    queryFn: () => apiRequest(`/api/avcs/runs/${certRunId}/report`),
  });

  const testPlan = plan?.test_plan;
  const adapterStatus = plan?.adapter_status;
  const domains = plan?.domains || [];

  const allChecks = domains.flatMap((d: any) =>
    (d.checks || []).map((c: any) => ({ ...c, domain: d.domain }))
  );

  if (allChecks.length === 0 && !testPlan) {
    return (
      <GlassPanel solid className="p-6 text-center">
        <Play className="w-6 h-6 mx-auto mb-2 text-[hsl(var(--muted-foreground))] opacity-30" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">No test execution data available</p>
      </GlassPanel>
    );
  }

  const groupedByDomain = allChecks.reduce((acc: Record<string, any[]>, check: any) => {
    const d = check.domain || "unknown";
    if (!acc[d]) acc[d] = [];
    acc[d].push(check);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {adapterStatus && adapterStatus.length > 0 && (
        <GlassPanel solid className="p-4">
          <h4 className="text-xs font-semibold text-[hsl(var(--card-foreground))] mb-2">Tool Status</h4>
          <div className="flex flex-wrap gap-2">
            {adapterStatus.map((t: any) => (
              <div key={t.toolId} className="flex items-center gap-1.5">
                <ToolBadge toolId={t.toolId} />
                <StatusChip
                  variant={t.status === "available" ? "success" : t.status === "error" ? "failure" : "neutral"}
                  label={t.status}
                />
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {Object.entries(groupedByDomain).map(([domain, checks]) => {
        const Icon = domainIcon(domain);
        return (
          <GlassPanel key={domain} solid className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4 text-[hsl(var(--foreground))]" />
              <h4 className="text-xs font-semibold text-[hsl(var(--card-foreground))]">{domainLabel(domain)}</h4>
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{checks.length} checks</span>
            </div>
            <div className="space-y-1">
              {checks.map((check: any, i: number) => (
                <div key={check.check_id || i} className="flex items-center gap-2 text-xs py-1 px-2 rounded hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                  {check.result === "pass" ? (
                    <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--status-success))] shrink-0" />
                  ) : check.result === "fail" ? (
                    <XCircle className="w-3.5 h-3.5 text-[hsl(var(--status-failure))] shrink-0" />
                  ) : check.result === "skip" ? (
                    <ChevronRight className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--status-warning))] shrink-0" />
                  )}
                  {check.test_id && (
                    <span className="font-mono-tech text-[10px] px-1 py-0.5 rounded bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] shrink-0 w-14 text-center">
                      {check.test_id}
                    </span>
                  )}
                  <span className="text-[hsl(var(--foreground))] flex-1 truncate">{check.description}</span>
                  <StatusChip variant={domainStatusVariant(check.result)} label={check.result} />
                </div>
              ))}
            </div>
          </GlassPanel>
        );
      })}
    </div>
  );
}

function RunDetailView({ certRunId, onBack }: { certRunId: string; onBack: () => void }) {
  const queryClient = useQueryClient();
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [findingSeverityFilter, setFindingSeverityFilter] = useState("");
  const [findingDomainFilter, setFindingDomainFilter] = useState("");
  const [detailSection, setDetailSection] = useState<"domains" | "tests" | "findings" | "evidence" | "coverage">("domains");

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

  const blockerFindings = findings.filter((f: any) => f.impact === "release_blocker");
  const warningFindings = findings.filter((f: any) => f.impact === "warning" || f.impact === "conditional_blocker");
  const observationFindings = findings.filter((f: any) => f.impact === "observation" || (!f.impact));

  const evidenceByDomain = evidence.reduce((acc: Record<string, any[]>, e: any) => {
    const d = e.domain || "unknown";
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {});

  const detailSections = [
    { id: "domains" as const, label: "Domains", count: domains.length },
    { id: "tests" as const, label: "Tests", count: domains.reduce((a: number, d: any) => a + (d.checks?.length || 0), 0) },
    { id: "findings" as const, label: "Findings", count: findings.length },
    { id: "evidence" as const, label: "Evidence", count: evidence.length },
    { id: "coverage" as const, label: "Coverage", count: coverage.length },
  ];

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

      {run.status === "completed" && (
        <div className="flex gap-1 border-b border-[hsl(var(--glass-border))]">
          {detailSections.map((s) => (
            <button
              key={s.id}
              onClick={() => setDetailSection(s.id)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                detailSection === s.id
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                  : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              {s.label} {s.count > 0 && <span className="ml-1 text-[10px] opacity-70">({s.count})</span>}
            </button>
          ))}
        </div>
      )}

      {detailSection === "domains" && domains.length > 0 && (
        <div>
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

      {detailSection === "tests" && run.status === "completed" && (
        <TestExecutionView certRunId={certRunId} />
      )}

      {detailSection === "findings" && run.status === "completed" && (
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
                {ALL_DOMAINS.map((d) => (
                  <option key={d} value={d}>{domainLabel(d)}</option>
                ))}
              </select>
            </div>
          </div>

          {blockerFindings.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-3.5 h-3.5 text-[hsl(var(--status-failure))]" />
                <span className="text-xs font-semibold text-[hsl(var(--status-failure))]">Release Blockers ({blockerFindings.length})</span>
              </div>
              <GlassPanel solid glow="red" className="overflow-hidden">
                {blockerFindings.map((f: any) => (
                  <FindingRow
                    key={f.id}
                    finding={f}
                    onAcknowledge={() => updateFinding.mutate({ findingId: f.id, status: "acknowledged" })}
                    onSuppress={() => updateFinding.mutate({ findingId: f.id, status: "suppressed" })}
                  />
                ))}
              </GlassPanel>
            </div>
          )}

          {warningFindings.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--status-warning))]" />
                <span className="text-xs font-semibold text-[hsl(var(--status-warning))]">Warnings ({warningFindings.length})</span>
              </div>
              <GlassPanel solid className="overflow-hidden">
                {warningFindings.map((f: any) => (
                  <FindingRow
                    key={f.id}
                    finding={f}
                    onAcknowledge={() => updateFinding.mutate({ findingId: f.id, status: "acknowledged" })}
                    onSuppress={() => updateFinding.mutate({ findingId: f.id, status: "suppressed" })}
                  />
                ))}
              </GlassPanel>
            </div>
          )}

          {observationFindings.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Observations ({observationFindings.length})</span>
              </div>
              <GlassPanel solid className="overflow-hidden">
                {observationFindings.map((f: any) => (
                  <FindingRow
                    key={f.id}
                    finding={f}
                    onAcknowledge={() => updateFinding.mutate({ findingId: f.id, status: "acknowledged" })}
                    onSuppress={() => updateFinding.mutate({ findingId: f.id, status: "suppressed" })}
                  />
                ))}
              </GlassPanel>
            </div>
          )}

          {findings.length === 0 && (
            <GlassPanel solid className="text-center py-8">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-[hsl(var(--status-success))] opacity-50" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No findings match filters</p>
            </GlassPanel>
          )}
        </div>
      )}

      {detailSection === "evidence" && evidence.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Evidence ({evidence.length})</h3>
          {Object.entries(evidenceByDomain).map(([domain, items]) => {
            const Icon = domainIcon(domain);
            return (
              <div key={domain} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5 text-[hsl(var(--foreground))]" />
                  <span className="text-xs font-semibold text-[hsl(var(--card-foreground))]">{domainLabel(domain)}</span>
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{items.length} items</span>
                </div>
                <GlassPanel solid className="p-3 space-y-2">
                  {items.map((e: any) => {
                    const TypeIcon = evidenceTypeIcon(e.type);
                    return (
                      <details key={e.id} className="border-b border-[hsl(var(--glass-border))] last:border-0 pb-2">
                        <summary className="cursor-pointer text-xs text-[hsl(var(--foreground))] py-1 hover:text-[hsl(var(--primary))] transition-colors flex items-center gap-2">
                          <TypeIcon className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                          <span>{e.title}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]">{e.type}</span>
                        </summary>
                        <pre className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.3)] p-2 rounded overflow-x-auto whitespace-pre-wrap">{e.content}</pre>
                      </details>
                    );
                  })}
                </GlassPanel>
              </div>
            );
          })}
        </div>
      )}

      {detailSection === "coverage" && coverage.length > 0 && (
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
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        {(() => { const I = domainIcon(c.domain); return <I className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />; })()}
                        <span className="text-[hsl(var(--muted-foreground))]">{domainLabel(c.domain)}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${coverageColor(c.state)}`}>
                        {coverageLabel(c.state)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

  const { data: findings = [] } = useQuery<any[]>({
    queryKey: ["/api/avcs/latest-findings"],
    queryFn: async () => {
      const latestCompleted = runs.find((r: any) => r.status === "completed");
      if (!latestCompleted) return [];
      return apiRequest(`/api/avcs/runs/${latestCompleted.id}/findings`);
    },
    enabled: runs.length > 0,
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

  const blockerCount = findings.filter((f: any) => f.impact === "release_blocker").length;
  const warningCount = findings.filter((f: any) => f.impact === "warning" || f.impact === "conditional_blocker").length;

  const domainsEvaluated = report.domains?.length ?? 0;
  const domainsPassed = (report.domains || []).filter((d: any) => d.status === "pass").length;
  const evidenceCount = report.evidence_manifest?.length ?? 0;

  const coverageEntries = report.coverage_summary || [];
  const coveredCount = coverageEntries.filter((c: any) => c.state === "covered").length;
  const totalSurfaces = coverageEntries.length;

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={XCircle} label="Blockers" value={blockerCount} accent={blockerCount > 0 ? "red" : "green"} />
        <MetricCard icon={AlertTriangle} label="Warnings" value={warningCount} accent={warningCount > 0 ? "amber" : "green"} />
        <MetricCard icon={Target} label="Domains" value={`${domainsPassed}/${domainsEvaluated}`} accent={domainsPassed === domainsEvaluated ? "green" : "amber"} />
        <MetricCard icon={FileText} label="Evidence" value={evidenceCount} accent="cyan" />
      </div>

      <GlassPanel solid className="p-4">
        <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">Gate Checks</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            {blockerCount === 0 ? <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--status-success))]" /> : <XCircle className="w-3.5 h-3.5 text-[hsl(var(--status-failure))]" />}
            <span className="text-[hsl(var(--foreground))]">No release blockers</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {report.overall_score >= 80 ? <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--status-success))]" /> : <XCircle className="w-3.5 h-3.5 text-[hsl(var(--status-failure))]" />}
            <span className="text-[hsl(var(--foreground))]">Overall score {">"}= 80% (actual: {report.overall_score}%)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {domainsPassed === domainsEvaluated ? <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--status-success))]" /> : <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--status-warning))]" />}
            <span className="text-[hsl(var(--foreground))]">All required domains passed ({domainsPassed}/{domainsEvaluated})</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {totalSurfaces > 0 && coveredCount / totalSurfaces >= 0.8 ? <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--status-success))]" /> : <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--status-warning))]" />}
            <span className="text-[hsl(var(--foreground))]">Coverage sufficiency ({coveredCount}/{totalSurfaces} surfaces covered)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {evidenceCount > 0 ? <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--status-success))]" /> : <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--status-warning))]" />}
            <span className="text-[hsl(var(--foreground))]">Evidence completeness ({evidenceCount} artifacts)</span>
          </div>
        </div>
      </GlassPanel>

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
            {report.score_breakdown.map((sb: any) => {
              const Icon = domainIcon(sb.domain);
              return (
                <div key={sb.domain} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3 h-3 text-[hsl(var(--foreground))]" />
                      <span className="text-[hsl(var(--foreground))]">{domainLabel(sb.domain)}</span>
                    </div>
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
              );
            })}
          </div>
        </GlassPanel>
      )}

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

          {manifest.affected_findings?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-[hsl(var(--card-foreground))] mb-2">Priority Fixes</h4>
              <div className="space-y-1">
                {manifest.affected_findings.slice(0, 5).map((f: any) => (
                  <div key={f.finding_id} className="flex items-center gap-2 text-xs">
                    <StatusChip variant={severityVariant(f.severity)} label={f.severity} />
                    <span className="text-[hsl(var(--foreground))] truncate">{f.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
