import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  AlertTriangle,
  SkipForward,
  ChevronDown,
  ChevronRight,
  FlaskConical,
  Timer,
  TrendingUp,
} from "lucide-react";
import type { ReleaseGateReport, ReleaseCheckResult } from "@shared/schema";

function StatCard({ label, value, icon: Icon, variant }: {
  label: string;
  value: string | number;
  icon: typeof CheckCircle2;
  variant: "success" | "error" | "muted" | "warning";
}) {
  const colorMap = {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    muted: "text-muted-foreground",
  };

  return (
    <div className="flex items-center gap-3 rounded-md bg-muted p-3">
      <Icon className={`w-5 h-5 shrink-0 ${colorMap[variant]}`} />
      <div>
        <div className="text-xl font-bold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function PassFailBar({ passed, total }: { passed: number; total: number }) {
  if (total === 0) return null;
  const pct = Math.round((passed / total) * 100);

  return (
    <div className="flex items-center gap-2 w-full max-w-xs">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: pct === 100
              ? "hsl(var(--success))"
              : pct >= 50
                ? "hsl(var(--warning))"
                : "hsl(var(--destructive))",
          }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">{pct}%</span>
    </div>
  );
}

function CheckRow({ check }: { check: ReleaseCheckResult }) {
  const [expanded, setExpanded] = useState(false);

  const statusColor = check.skipped
    ? "text-muted-foreground"
    : check.passed
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

  const StatusIcon = check.skipped
    ? SkipForward
    : check.passed
      ? CheckCircle2
      : XCircle;

  const hasDetails = !!check.error_summary || !!check.log_path;

  return (
    <div className="rounded-md border" data-testid={`check-${check.id}`}>
      <div
        role={hasDetails ? "button" : undefined}
        tabIndex={hasDetails ? 0 : undefined}
        onClick={() => hasDetails && setExpanded(!expanded)}
        onKeyDown={(e) => hasDetails && (e.key === "Enter" || e.key === " ") && setExpanded(!expanded)}
        className={`flex items-center gap-3 px-4 py-3 ${hasDetails ? "cursor-pointer hover-elevate" : ""}`}
        data-testid={`button-check-toggle-${check.id}`}
      >
        <StatusIcon className={`w-4 h-4 shrink-0 ${statusColor}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{check.name}</span>
            {check.required && (
              <Badge variant="outline" className="no-default-active-elevate">
                required
              </Badge>
            )}
            {check.skipped && (
              <Badge variant="secondary" className="no-default-active-elevate">
                skipped
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {check.test_count !== undefined && check.test_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FlaskConical className="w-3 h-3" />
              <span className="tabular-nums">{check.test_count}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="tabular-nums">{(check.duration_ms / 1000).toFixed(1)}s</span>
          </div>
          {hasDetails && (
            expanded
              ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {expanded && hasDetails && (
        <div className="px-4 pb-3 pt-0 border-t">
          <div className="pt-3 space-y-2">
            {check.error_summary && (
              <div className="text-xs rounded-md bg-muted p-2.5 font-mono text-red-700 dark:text-red-400">
                {check.error_summary}
              </div>
            )}
            {check.log_path && (
              <div className="text-xs text-muted-foreground">
                Log: <span className="font-mono">{check.log_path}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FailureCard({ failure }: { failure: { check_id: string; reason_code: string; summary: string; log_path: string } }) {
  return (
    <div className="rounded-md border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-3">
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
        <span className="text-sm font-medium">{failure.check_id}</span>
        <Badge variant="error" className="no-default-active-elevate">{failure.reason_code}</Badge>
      </div>
      <p className="text-xs text-muted-foreground ml-6">{failure.summary}</p>
    </div>
  );
}

export default function ReleasePage() {
  const { data: report, isLoading } = useQuery<ReleaseGateReport | null>({
    queryKey: ["/api/release-gate"],
  });

  const runGate = useMutation({
    mutationFn: () => apiRequest("/api/release-gate/run", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/release-gate"] });
      toast({ title: "Release check complete", variant: "success" });
    },
    onError: (err: Error) => {
      toast({ title: "Release check failed", description: err.message, variant: "destructive" });
    },
  });

  const passedCount = report?.checks.filter(c => c.passed).length ?? 0;
  const failedCount = report?.checks.filter(c => !c.passed && !c.skipped).length ?? 0;
  const skippedCount = report?.checks.filter(c => c.skipped).length ?? 0;
  const totalTests = report?.checks.reduce((sum, c) => sum + (c.test_count ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold" data-testid="text-release-header">Release Gate</h2>
          <p className="text-sm text-muted-foreground mt-1">Validate all checks before release.</p>
        </div>
        <Button
          onClick={() => runGate.mutate()}
          disabled={runGate.isPending}
          data-testid="button-run-release"
        >
          {runGate.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Run Release Check
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !report ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No release gate report found. Click "Run Release Check" to generate one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {report.passed
                    ? <div className="flex items-center justify-center w-10 h-10 rounded-md bg-green-100 dark:bg-green-950/40">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                    : <div className="flex items-center justify-center w-10 h-10 rounded-md bg-red-100 dark:bg-red-950/40">
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                  }
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" data-testid="text-gate-status">
                        {report.passed ? "All Checks Passed" : "Checks Failed"}
                      </span>
                      <Badge variant={report.passed ? "success" : "error"} className="no-default-active-elevate">
                        v{report.version}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(report.generated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <PassFailBar passed={passedCount} total={report.checks.length} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <StatCard
                  label="Passed"
                  value={passedCount}
                  icon={CheckCircle2}
                  variant="success"
                />
                <StatCard
                  label="Failed"
                  value={failedCount}
                  icon={XCircle}
                  variant={failedCount > 0 ? "error" : "muted"}
                />
                <StatCard
                  label="Total Tests"
                  value={totalTests}
                  icon={FlaskConical}
                  variant="muted"
                />
                <StatCard
                  label="Duration"
                  value={`${(report.duration_ms / 1000).toFixed(1)}s`}
                  icon={Timer}
                  variant="muted"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 px-1 mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Checks ({passedCount}/{report.checks.length})
              </h3>
              {skippedCount > 0 && (
                <span className="text-xs text-muted-foreground">{skippedCount} skipped</span>
              )}
            </div>
            {report.checks.map((check) => (
              <CheckRow key={check.id} check={check} />
            ))}
          </div>

          {report.failures.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2 px-1">
                <AlertTriangle className="w-4 h-4" /> Failures ({report.failures.length})
              </h3>
              {report.failures.map((f) => (
                <FailureCard key={f.check_id} failure={f} />
              ))}
            </div>
          )}

          {report.next_commands.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Suggested Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-32">
                  <div className="space-y-1">
                    {report.next_commands.map((cmd, i) => (
                      <pre key={i} className="text-xs font-mono p-2 rounded-md bg-muted" data-testid={`next-cmd-${i}`}>{cmd}</pre>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
