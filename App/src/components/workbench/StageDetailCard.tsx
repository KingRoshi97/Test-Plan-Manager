import { GlassPanel } from "../ui/glass-panel";
import { StatusChip, getStatusVariant } from "../ui/status-chip";
import {
  Clock,
  Timer,
  FileInput,
  FileOutput,
  Shield,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

interface StageNote {
  severity?: "info" | "warn" | "error";
  level?: "info" | "warn" | "error";
  message: string;
}

interface GateCheck {
  check_id: string;
  status: string;
}

interface GateIssue {
  severity: string;
  error_code?: string;
  message: string;
  remediation?: string;
}

interface GateReport {
  gate_id: string;
  status: string;
  checks?: GateCheck[];
  issues?: GateIssue[];
}

export interface StageDetailData {
  stage_id: string;
  run_id?: string;
  status: string;
  started_at?: string;
  finished_at?: string;
  consumed?: string[];
  produced?: string[];
  notes?: StageNote[];
  gate_reports?: GateReport[];
}

interface StageDetailCardProps {
  data?: StageDetailData | null;
  stageName?: string;
  gateId?: string;
  isLoading?: boolean;
}

function statusToGlow(status: string): "cyan" | "green" | "amber" | "red" | "none" {
  switch (status?.toLowerCase()) {
    case "running":
    case "processing":
      return "cyan";
    case "completed":
    case "pass":
    case "passed":
      return "green";
    case "failed":
    case "fail":
    case "error":
      return "red";
    case "queued":
    case "pending":
      return "amber";
    default:
      return "none";
  }
}

function gateVerdictVariant(status: string): "processing" | "success" | "warning" | "failure" | "intelligence" | "neutral" {
  switch (status?.toUpperCase()) {
    case "PASS":
    case "PASSED":
      return "success";
    case "FAIL":
    case "FAILED":
      return "failure";
    default:
      return "neutral";
  }
}

function formatTimestamp(ts?: string): string {
  if (!ts) return "\u2014";
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

function computeDuration(start?: string, end?: string): string {
  if (!start || !end) return "\u2014";
  try {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (ms < 0) return "\u2014";
    if (ms < 1000) return `${ms}ms`;
    const secs = Math.floor(ms / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    return `${mins}m ${remainSecs}s`;
  } catch {
    return "\u2014";
  }
}

function NoteSeverityIcon({ severity }: { severity: string }) {
  switch (severity) {
    case "error":
      return <AlertCircle className="w-3.5 h-3.5 text-[hsl(var(--status-failure))] shrink-0 mt-0.5" />;
    case "warn":
      return <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--status-warning))] shrink-0 mt-0.5" />;
    default:
      return <Info className="w-3.5 h-3.5 text-[hsl(var(--status-processing))] shrink-0 mt-0.5" />;
  }
}

function noteSeverityTextColor(severity: string): string {
  switch (severity) {
    case "error":
      return "text-[hsl(var(--status-failure))]";
    case "warn":
      return "text-[hsl(var(--status-warning))]";
    default:
      return "text-[hsl(var(--muted-foreground))]";
  }
}

function issueSeverityVariant(severity: string): "processing" | "success" | "warning" | "failure" | "intelligence" | "neutral" {
  switch (severity?.toLowerCase()) {
    case "error":
    case "critical":
      return "failure";
    case "warning":
    case "warn":
      return "warning";
    case "info":
      return "processing";
    default:
      return "neutral";
  }
}

export function StageDetailCard({ data, stageName, gateId, isLoading }: StageDetailCardProps) {
  if (isLoading) {
    return (
      <GlassPanel glow="cyan" className="p-5">
        <div className="flex items-center gap-3 text-[hsl(var(--muted-foreground))]">
          <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--status-processing))]" />
          <span className="text-sm">Loading stage details...</span>
        </div>
      </GlassPanel>
    );
  }

  if (!data) {
    return (
      <GlassPanel className="p-5">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">No stage data available.</p>
      </GlassPanel>
    );
  }

  const glow = statusToGlow(data.status);
  const duration = computeDuration(data.started_at, data.finished_at);
  const gate = data.gate_reports?.[0];

  const checksPassed = gate?.checks?.filter((c) => c.status === "pass" || c.status === "PASS").length ?? 0;
  const checksFailed = gate?.checks?.filter((c) => c.status !== "pass" && c.status !== "PASS").length ?? 0;

  return (
    <GlassPanel glow={glow} className="p-5 space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {stageName && (
            <h3 className="text-base font-semibold text-[hsl(var(--foreground))] truncate">{stageName}</h3>
          )}
          <span className="font-mono-tech text-xs text-[hsl(var(--muted-foreground))]">{data.stage_id}</span>
        </div>
        <StatusChip variant={getStatusVariant(data.status)} label={data.status} pulse={data.status === "running"} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
            <span className="text-system-label">Started</span>
          </div>
          <p className="text-xs text-[hsl(var(--foreground))]">{formatTimestamp(data.started_at)}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
            <span className="text-system-label">Finished</span>
          </div>
          <p className="text-xs text-[hsl(var(--foreground))]">{formatTimestamp(data.finished_at)}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
            <span className="text-system-label">Duration</span>
          </div>
          <p className="text-xs font-mono-tech text-[hsl(var(--foreground))]">{duration}</p>
        </div>
      </div>

      {data.consumed && data.consumed.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <FileInput className="w-3.5 h-3.5 text-[hsl(var(--status-processing))]" />
            <span className="text-system-label">Consumed Artifacts</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.consumed.map((item, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[11px] font-mono-tech rounded bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.produced && data.produced.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <FileOutput className="w-3.5 h-3.5 text-[hsl(var(--status-success))]" />
            <span className="text-system-label">Produced Artifacts</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.produced.map((item, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[11px] font-mono-tech rounded bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.notes && data.notes.length > 0 && (
        <div className="space-y-2">
          <span className="text-system-label">Notes</span>
          <div className="space-y-1.5">
            {data.notes.map((note, i) => {
              const sev = note.severity || note.level || "info";
              return (
                <div key={i} className="flex items-start gap-2">
                  <NoteSeverityIcon severity={sev} />
                  <span className={`text-xs leading-relaxed ${noteSeverityTextColor(sev)}`}>
                    {note.message}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(gate || gateId) && (
        <div className="border-t border-[hsl(var(--border))] pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[hsl(var(--status-intelligence))]" />
            <span className="text-system-label">Gate</span>
          </div>

          {gate ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono-tech text-xs text-[hsl(var(--muted-foreground))]">{gate.gate_id}</span>
                <StatusChip variant={gateVerdictVariant(gate.status)} label={gate.status} />
              </div>

              {gate.checks && gate.checks.length > 0 && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-[hsl(var(--status-success))]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {checksPassed} passed
                  </span>
                  {checksFailed > 0 && (
                    <span className="flex items-center gap-1 text-[hsl(var(--status-failure))]">
                      <XCircle className="w-3.5 h-3.5" />
                      {checksFailed} failed
                    </span>
                  )}
                </div>
              )}

              {gate.issues && gate.issues.length > 0 && (
                <div className="space-y-2">
                  <span className="text-system-label">Issues</span>
                  <div className="space-y-2">
                    {gate.issues.map((issue, i) => (
                      <div key={i} className="glass-panel-solid p-2.5 space-y-1">
                        <div className="flex items-center gap-2">
                          <StatusChip
                            variant={issueSeverityVariant(issue.severity)}
                            label={issue.severity}
                            size="sm"
                          />
                          {issue.error_code && (
                            <span className="font-mono-tech text-[10px] text-[hsl(var(--muted-foreground))]">
                              {issue.error_code}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[hsl(var(--foreground))]">{issue.message}</p>
                        {issue.remediation && (
                          <p className="text-[11px] text-[hsl(var(--muted-foreground))] italic">
                            {issue.remediation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Gate <span className="font-mono-tech">{gateId}</span> &mdash; no report data available
            </p>
          )}
        </div>
      )}
    </GlassPanel>
  );
}
