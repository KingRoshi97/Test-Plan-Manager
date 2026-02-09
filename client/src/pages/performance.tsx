import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Gauge,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Cpu,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface StepStats {
  stepId: string;
  label: string;
  totalRuns: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  avgDurationMs: number;
  maxDurationMs: number;
  totalDurationMs: number;
  isAiStep: boolean;
}

interface AiMetrics {
  totalAiRuns: number;
  avgAiDurationMs: number;
  aiSteps: StepStats[];
}

interface DailyRuns {
  date: string;
  total: number;
  success: number;
  error: number;
}

interface ProjectStats {
  projectName: string;
  totalRuns: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  avgDurationMs: number;
  totalDurationMs: number;
}

interface PerformanceData {
  totalRuns: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  avgDurationMs: number;
  totalDurationMs: number;
  stepBreakdown: StepStats[];
  failureHotspots: StepStats[];
  aiStepMetrics: AiMetrics;
  runsOverTime: DailyRuns[];
  projectBreakdown: ProjectStats[];
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.round((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

function formatDurationShort(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function BarSegment({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 1) : 0;
  return (
    <div className="h-2 rounded-full bg-muted overflow-hidden" data-testid="bar-segment">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  testId,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: typeof Gauge;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-md bg-muted shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-lg font-semibold tabular-nums" data-testid={`${testId}-value`}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PerformancePage() {
  const { data, isLoading, error } = useQuery<PerformanceData>({
    queryKey: ["/api/performance-stats"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="performance-loading">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm" data-testid="performance-error">
        Failed to load performance data.
      </div>
    );
  }

  const maxAvgDuration = Math.max(...(data.stepBreakdown.map(s => s.avgDurationMs) || [1]));
  const maxStepRuns = Math.max(...(data.stepBreakdown.map(s => s.totalRuns) || [1]));
  const maxDailyRuns = Math.max(...(data.runsOverTime.map(d => d.total) || [1]));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8" data-testid="performance-page">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2" data-testid="text-page-title">
          <Gauge className="w-5 h-5" />
          System Performance
        </h2>
        <p className="text-sm text-muted-foreground">
          Pipeline execution metrics across {data.projectBreakdown.length} project{data.projectBreakdown.length !== 1 ? "s" : ""} and {data.totalRuns} runs.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pipeline Runs"
          value={data.totalRuns.toLocaleString()}
          icon={BarChart3}
          testId="stat-total-runs"
        />
        <StatCard
          title="Success Rate"
          value={`${data.successRate}%`}
          subtitle={`${data.successCount} passed, ${data.errorCount} failed`}
          icon={CheckCircle2}
          testId="stat-success-rate"
        />
        <StatCard
          title="Avg Step Duration"
          value={formatDuration(data.avgDurationMs)}
          icon={Clock}
          testId="stat-avg-duration"
        />
        <StatCard
          title="AI Step Calls"
          value={data.aiStepMetrics.totalAiRuns.toLocaleString()}
          subtitle={`Avg ${formatDuration(data.aiStepMetrics.avgAiDurationMs)} per call`}
          icon={Sparkles}
          testId="stat-ai-calls"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-step-timing">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Step Timing Breakdown
            </CardTitle>
            <p className="text-xs text-muted-foreground">Average duration per step — sorted slowest first</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.stepBreakdown.map((step) => (
              <div key={step.stepId} className="space-y-1" data-testid={`step-timing-${step.stepId}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm truncate">{step.label}</span>
                    {step.isAiStep && (
                      <Badge variant="secondary" className="no-default-active-elevate shrink-0 gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground tabular-nums">
                    <span>{step.totalRuns} runs</span>
                    <span className="font-medium text-foreground">{formatDurationShort(step.avgDurationMs)}</span>
                  </div>
                </div>
                <BarSegment
                  value={step.avgDurationMs}
                  max={maxAvgDuration}
                  color={step.isAiStep ? "bg-primary/60" : "bg-muted-foreground/30"}
                />
              </div>
            ))}
            {data.stepBreakdown.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No step data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-failure-hotspots">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Failure Hotspots
            </CardTitle>
            <p className="text-xs text-muted-foreground">Steps with the highest failure counts</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.failureHotspots.map((step) => (
              <div key={step.stepId} className="space-y-1" data-testid={`failure-hotspot-${step.stepId}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm truncate">{step.label}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs tabular-nums">
                    <span className="text-muted-foreground">{step.successRate}% pass</span>
                    <span className="text-destructive font-medium">{step.errorCount} failures</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                  <div
                    className="h-full bg-primary/50 rounded-l-full"
                    style={{ width: `${step.successRate}%` }}
                  />
                  <div
                    className="h-full bg-destructive/60 rounded-r-full"
                    style={{ width: `${100 - step.successRate}%` }}
                  />
                </div>
              </div>
            ))}
            {data.failureHotspots.length === 0 && (
              <div className="flex flex-col items-center py-6 text-muted-foreground text-sm gap-1">
                <CheckCircle2 className="w-5 h-5" />
                <span>No failures recorded</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-ai-metrics">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            AI Step Performance
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Steps that invoke AI models (draft, content-fill, generate, seed, review, build-plan, build-exec, build)
          </p>
        </CardHeader>
        <CardContent>
          {data.aiStepMetrics.aiSteps.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.aiStepMetrics.aiSteps.map((step) => (
                <div key={step.stepId} className="space-y-2 p-3 rounded-md bg-muted/40" data-testid={`ai-step-${step.stepId}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{step.label}</span>
                    <Badge variant="secondary" className="no-default-active-elevate shrink-0 gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Calls</p>
                      <p className="font-medium tabular-nums">{step.totalRuns}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success</p>
                      <p className="font-medium tabular-nums">{step.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg time</p>
                      <p className="font-medium tabular-nums">{formatDuration(step.avgDurationMs)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Peak</p>
                      <p className="font-medium tabular-nums">{formatDuration(step.maxDurationMs)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total time spent</p>
                    <p className="text-sm font-medium tabular-nums">{formatDuration(step.totalDurationMs)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No AI step data yet.</p>
          )}
        </CardContent>
      </Card>

      {data.runsOverTime.length > 0 && (
        <Card data-testid="card-runs-over-time">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Runs Over Time
            </CardTitle>
            <p className="text-xs text-muted-foreground">Daily pipeline run counts</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {data.runsOverTime.slice(-30).map((day) => (
                <div key={day.date} className="flex items-center gap-3" data-testid={`daily-row-${day.date}`}>
                  <span className="text-xs text-muted-foreground tabular-nums w-20 shrink-0">
                    {new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden flex">
                    {day.success > 0 && (
                      <div
                        className="h-full bg-primary/50"
                        style={{ width: `${(day.success / maxDailyRuns) * 100}%` }}
                        title={`${day.success} success`}
                      />
                    )}
                    {day.error > 0 && (
                      <div
                        className="h-full bg-destructive/50"
                        style={{ width: `${(day.error / maxDailyRuns) * 100}%` }}
                        title={`${day.error} errors`}
                      />
                    )}
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground w-14 shrink-0 text-right">
                    {day.total} runs
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.projectBreakdown.length > 0 && (
        <Card data-testid="card-project-breakdown">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Per-Project Breakdown
            </CardTitle>
            <p className="text-xs text-muted-foreground">Performance metrics by project</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.projectBreakdown.map((proj) => (
                <div key={proj.projectName} className="flex items-center gap-3 flex-wrap" data-testid={`project-row-${proj.projectName}`}>
                  <span className="text-sm font-medium min-w-0 truncate flex-1" data-testid={`text-project-name-${proj.projectName}`}>
                    {proj.projectName}
                  </span>
                  <div className="flex items-center gap-3 shrink-0 text-xs tabular-nums text-muted-foreground">
                    <span>{proj.totalRuns} runs</span>
                    <div className="flex items-center gap-1">
                      {proj.successRate >= 80 ? (
                        <ArrowUpRight className="w-3 h-3 text-primary" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-destructive" />
                      )}
                      <span className={proj.successRate >= 80 ? "" : "text-destructive"}>{proj.successRate}%</span>
                    </div>
                    <span>avg {formatDurationShort(proj.avgDurationMs)}</span>
                    <span>total {formatDuration(proj.totalDurationMs)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
