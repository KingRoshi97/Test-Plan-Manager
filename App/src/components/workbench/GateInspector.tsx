import { GlassPanel } from "../ui/glass-panel";
import { StatusChip, type StatusVariant } from "../ui/status-chip";
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  FileText,
  Clock,
  Cpu,
  Loader2,
} from "lucide-react";

interface GateCheck {
  check_id: string;
  status: string;
  failure_code?: string | null;
  evidence?: Array<{
    path: string;
    pointer?: string;
    details?: Record<string, unknown>;
  }>;
}

interface GateIssue {
  severity?: string;
  error_code?: string;
  message?: string;
  remediation?: string;
}

interface EvidenceCompleteness {
  complete: boolean;
  gate_id: string;
  required_proof_types: string[];
  satisfied: string[];
  missing: string[];
}

interface GateEngine {
  name: string;
  version: string;
}

export interface GateReport {
  gate_id: string;
  stage_id: string;
  run_id: string;
  status: string;
  evaluated_at?: string;
  checks?: GateCheck[];
  issues?: GateIssue[];
  evidence?: unknown[];
  evidence_completeness?: EvidenceCompleteness;
  failure_codes?: string[];
  engine?: GateEngine;
  target?: string;
}

interface GateInspectorProps {
  data?: GateReport | null;
  loading?: boolean;
}

function getGateStatusVariant(status: string): StatusVariant {
  switch (status?.toLowerCase()) {
    case "pass":
    case "passed":
      return "success";
    case "fail":
    case "failed":
      return "failure";
    case "warn":
    case "warning":
      return "warning";
    case "running":
      return "processing";
    default:
      return "neutral";
  }
}

function getGateGlow(status: string): "green" | "red" | "amber" | "cyan" | "none" {
  switch (status?.toLowerCase()) {
    case "pass":
    case "passed":
      return "green";
    case "fail":
    case "failed":
      return "red";
    case "warn":
    case "warning":
      return "amber";
    case "running":
      return "cyan";
    default:
      return "none";
  }
}

function getSeverityVariant(severity: string): StatusVariant {
  switch (severity?.toLowerCase()) {
    case "error":
    case "critical":
      return "failure";
    case "warning":
    case "warn":
      return "warning";
    case "info":
      return "intelligence";
    default:
      return "neutral";
  }
}

function formatTimestamp(ts?: string): string {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return ts;
  }
}

export function GateInspector({ data, loading }: GateInspectorProps) {
  if (loading) {
    return (
      <GlassPanel className="p-6">
        <div className="flex items-center justify-center gap-2 py-12 text-[hsl(var(--muted-foreground))]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading gate report…</span>
        </div>
      </GlassPanel>
    );
  }

  if (!data) {
    return (
      <GlassPanel className="p-6">
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-[hsl(var(--muted-foreground))]">
          <Shield className="w-8 h-8 opacity-40" />
          <span className="text-sm">No gate data available</span>
        </div>
      </GlassPanel>
    );
  }

  const checksTotal = data.checks?.length ?? 0;
  const checksPassed = data.checks?.filter((c) => c.status === "pass").length ?? 0;
  const checksFailed = checksTotal - checksPassed;

  return (
    <div className="space-y-4 animate-fade-in">
      <GlassPanel glow={getGateGlow(data.status)} className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[hsl(var(--primary))]" />
            <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">Gate Report</h3>
          </div>
          <StatusChip
            variant={getGateStatusVariant(data.status)}
            label={data.status?.toUpperCase() ?? "UNKNOWN"}
            size="md"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-system-label">Gate ID</span>
            <p className="font-mono-tech text-xs text-[hsl(var(--foreground))] mt-0.5">{data.gate_id}</p>
          </div>
          <div>
            <span className="text-system-label">Stage</span>
            <p className="font-mono-tech text-xs text-[hsl(var(--foreground))] mt-0.5">{data.stage_id}</p>
          </div>
          <div>
            <span className="text-system-label">Evaluated</span>
            <p className="text-xs text-[hsl(var(--foreground))] mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
              {formatTimestamp(data.evaluated_at)}
            </p>
          </div>
          <div>
            <span className="text-system-label">Checks</span>
            <p className="text-xs text-[hsl(var(--foreground))] mt-0.5">
              <span className="text-[hsl(var(--status-success))]">{checksPassed} passed</span>
              {checksFailed > 0 && (
                <span className="text-[hsl(var(--status-failure))]"> · {checksFailed} failed</span>
              )}
            </p>
          </div>
        </div>
      </GlassPanel>

      {data.checks && data.checks.length > 0 && (
        <GlassPanel className="p-4">
          <h4 className="text-system-label mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Checks ({checksTotal})
          </h4>
          <div className="space-y-2">
            {data.checks.map((check, i) => (
              <div
                key={`${check.check_id}-${i}`}
                className="flex items-start justify-between gap-2 p-2.5 rounded-md bg-[hsl(var(--secondary)/0.5)]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {check.status === "pass" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--status-success))] shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-[hsl(var(--status-failure))] shrink-0" />
                    )}
                    <span className="font-mono-tech text-xs text-[hsl(var(--foreground))]">
                      {check.check_id}
                    </span>
                  </div>
                  {check.evidence && check.evidence.length > 0 && (
                    <div className="mt-1.5 ml-5 space-y-0.5">
                      {check.evidence.map((ev, j) => (
                        <a
                          key={j}
                          href={`#${ev.path}`}
                          className="flex items-center gap-1 text-[10px] font-mono-tech text-[hsl(var(--primary))] hover:underline truncate"
                          title={ev.path}
                          onClick={(e) => e.preventDefault()}
                        >
                          <FileText className="w-3 h-3 shrink-0" />
                          <span className="truncate">{ev.path}</span>
                        </a>
                      ))}
                    </div>
                  )}
                  {check.failure_code && (
                    <span className="ml-5 mt-1 inline-block text-[10px] font-mono-tech text-[hsl(var(--status-failure))]">
                      {check.failure_code}
                    </span>
                  )}
                </div>
                <StatusChip
                  variant={check.status === "pass" ? "success" : "failure"}
                  label={check.status.toUpperCase()}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {data.issues && data.issues.length > 0 && (
        <GlassPanel glow="red" className="p-4">
          <h4 className="text-system-label mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Issues ({data.issues.length})
          </h4>
          <div className="space-y-2">
            {data.issues.map((issue, i) => (
              <div
                key={i}
                className="p-3 rounded-md bg-[hsl(var(--secondary)/0.5)] border border-[hsl(var(--border))]"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {issue.severity && (
                    <StatusChip
                      variant={getSeverityVariant(issue.severity)}
                      label={issue.severity.toUpperCase()}
                      size="sm"
                    />
                  )}
                  {issue.error_code && (
                    <span className="font-mono-tech text-[10px] text-[hsl(var(--muted-foreground))]">
                      {issue.error_code}
                    </span>
                  )}
                </div>
                {issue.message && (
                  <p className="text-xs text-[hsl(var(--foreground))] mb-1">{issue.message}</p>
                )}
                {issue.remediation && (
                  <div className="flex items-start gap-1.5 mt-2 p-2 rounded bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.1)]">
                    <Info className="w-3 h-3 text-[hsl(var(--primary))] mt-0.5 shrink-0" />
                    <p className="text-[11px] text-[hsl(var(--primary)/0.8)]">{issue.remediation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {data.evidence_completeness && (
        <GlassPanel className="p-4">
          <h4 className="text-system-label mb-3 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Evidence Completeness
          </h4>
          <div className="space-y-1.5">
            {data.evidence_completeness.required_proof_types.map((pt) => {
              const isSatisfied = data.evidence_completeness!.satisfied.includes(pt);
              return (
                <div key={pt} className="flex items-center gap-2 text-xs">
                  {isSatisfied ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--status-success))]" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-[hsl(var(--status-failure))]" />
                  )}
                  <span
                    className={`font-mono-tech ${
                      isSatisfied
                        ? "text-[hsl(var(--foreground))]"
                        : "text-[hsl(var(--status-failure))]"
                    }`}
                  >
                    {pt}
                  </span>
                </div>
              );
            })}
            {data.evidence_completeness.missing.length > 0 && (
              <div className="mt-2 text-[10px] text-[hsl(var(--status-failure))]">
                {data.evidence_completeness.missing.length} missing proof type(s)
              </div>
            )}
          </div>
        </GlassPanel>
      )}

      {data.engine && (
        <GlassPanel className="p-4">
          <h4 className="text-system-label mb-2 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            Engine
          </h4>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[hsl(var(--foreground))]">{data.engine.name}</span>
            <span className="font-mono-tech text-[hsl(var(--muted-foreground))]">v{data.engine.version}</span>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
