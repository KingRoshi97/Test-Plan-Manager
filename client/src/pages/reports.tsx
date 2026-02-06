import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  FlaskConical,
  Bug,
  FileCode,
  Timer,
} from "lucide-react";
import type { WorkspaceInfo } from "@shared/schema";

const REPORT_TYPES = [
  { id: "verify", label: "Verify Report", desc: "Doc verification results" },
  { id: "reconcile", label: "Reconcile Report", desc: "Import vs build drift" },
  { id: "build-exec", label: "Build Exec Report", desc: "Build execution results" },
  { id: "iteration-state", label: "Iteration State", desc: "Iterate loop results" },
  { id: "import-report", label: "Import Report", desc: "Repo analysis" },
  { id: "import-facts", label: "Import Facts", desc: "Normalized import data" },
  { id: "build-plan", label: "Build Plan", desc: "Task list" },
  { id: "stack-profile", label: "Stack Profile", desc: "Stack configuration" },
  { id: "test", label: "Test Report", desc: "Test results" },
  { id: "active-build", label: "Active Build", desc: "Current build pointer" },
  { id: "lock-manifest", label: "Lock Manifest", desc: "Locked module hashes" },
  { id: "stage-markers", label: "Stage Markers", desc: "Stage completion data" },
] as const;

interface ReportResult {
  found: boolean;
  path?: string;
  data: unknown;
}

export default function ReportsPage() {
  const [projectName, setProjectName] = useState("my-project");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const { data: workspaces = [] } = useQuery<WorkspaceInfo[]>({
    queryKey: ["/api/workspaces"],
  });

  const { data: reportData, isLoading: reportLoading } = useQuery<ReportResult>({
    queryKey: ["/api/reports", selectedProject, selectedReport],
    queryFn: async () => {
      if (!selectedProject || !selectedReport) return { found: false, data: null };
      const res = await fetch(`/api/reports/${selectedProject}/${selectedReport}`);
      return res.json();
    },
    enabled: !!selectedProject && !!selectedReport,
  });

  const selectProject = (name: string) => {
    setProjectName(name);
    setSelectedProject(name);
    setSelectedReport(null);
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold" data-testid="text-reports-header">Reports</h2>
        <p className="text-sm text-muted-foreground mt-1">View detailed reports and artifacts from pipeline runs.</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="max-w-xs"
              placeholder="Project name"
              data-testid="input-reports-project"
            />
            <Button
              onClick={() => selectProject(projectName)}
              disabled={!projectName}
              data-testid="button-load-reports"
            >
              <FileText className="w-4 h-4" />
              <span className="ml-2">Load Reports</span>
            </Button>
          </div>
          {workspaces.length > 0 && (
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {workspaces.map((ws) => (
                <Button
                  key={ws.projectName}
                  variant={selectedProject === ws.projectName ? "default" : "secondary"}
                  size="sm"
                  onClick={() => selectProject(ws.projectName)}
                  data-testid={`button-rws-${ws.projectName}`}
                >
                  {ws.projectName}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProject && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-1 mb-2">Available Reports</p>
            {REPORT_TYPES.map((rt) => (
              <Button
                key={rt.id}
                variant={selectedReport === rt.id ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setSelectedReport(rt.id)}
                data-testid={`button-report-${rt.id}`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <div className="text-left">
                  <div className="text-xs">{rt.label}</div>
                </div>
              </Button>
            ))}
          </div>

          <div className="lg:col-span-3">
            {!selectedReport && (
              <Card>
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  Select a report type from the list to view its contents.
                </CardContent>
              </Card>
            )}

            {selectedReport && reportLoading && (
              <Card>
                <CardContent className="py-12 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            )}

            {selectedReport && !reportLoading && reportData && (
              <ReportViewer
                reportType={selectedReport}
                data={reportData}
                projectName={selectedProject}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportViewer({ reportType, data, projectName }: {
  reportType: string;
  data: ReportResult;
  projectName: string;
}) {
  if (!data.found) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground" data-testid="text-report-not-found">
            Report not found for workspace "{projectName}". This report hasn't been generated yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const reportLabel = REPORT_TYPES.find(r => r.id === reportType)?.label || reportType;

  if (reportType === "verify" || reportType === "reconcile" || reportType === "iteration-state" || reportType === "build-exec") {
    return <StructuredReportViewer label={reportLabel} data={data.data} reportType={reportType} />;
  }

  if (reportType === "test") {
    return <TestReportViewer label={reportLabel} data={data.data} path={data.path} />;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm">{reportLabel}</CardTitle>
          {data.path && (
            <span className="text-xs text-muted-foreground truncate max-w-sm">{data.path}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[600px]">
          <pre
            className="text-xs font-mono whitespace-pre-wrap p-3 rounded-md bg-muted"
            data-testid="text-report-json"
          >
            {JSON.stringify(data.data, null, 2)}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function StructuredReportViewer({ label, data, reportType }: {
  label: string;
  data: unknown;
  reportType: string;
}) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const report = data as Record<string, unknown>;
  const status = String(report.status || "unknown");
  const isPass = status === "PASS" || status === "completed" || status === "success";
  const generatedAt = report.generated_at ? String(report.generated_at) : null;
  const summary = report.summary as Record<string, unknown> | undefined;
  const mismatches = report.mismatches as Array<Record<string, unknown>> | undefined;
  const stepsExecuted = report.steps_executed as Array<Record<string, unknown>> | undefined;
  const nextCommands = Array.isArray(report.next_commands) ? (report.next_commands as string[]) : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm">{label}</CardTitle>
          <Badge
            variant={isPass ? "success" : "error"}
            className="no-default-active-elevate"
            data-testid="text-report-status"
          >
            {status.toUpperCase()}
          </Badge>
        </div>
        {generatedAt && (
          <p className="text-xs text-muted-foreground">
            Generated: {new Date(generatedAt).toLocaleString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {summary ? (
          <SummaryBlock summary={summary} />
        ) : null}

        {reportType === "reconcile" && mismatches ? (
          <MismatchList
            mismatches={mismatches}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
        ) : null}

        {reportType === "iteration-state" && stepsExecuted ? (
          <StepsList
            steps={stepsExecuted}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
        ) : null}

        {reportType === "build-exec" && summary ? (
          <BuildExecDetails report={report} />
        ) : null}

        {nextCommands && nextCommands.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Suggested Next Commands</p>
            <div className="space-y-1">
              {nextCommands.map((cmd, i) => (
                <div key={i} className="text-xs font-mono px-3 py-2 rounded-md bg-muted" data-testid={`next-cmd-${i}`}>
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <button
            onClick={() => toggleSection("raw-json")}
            className="flex items-center gap-1 text-xs text-muted-foreground mb-1"
          >
            {expandedSections.has("raw-json") ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Raw JSON
          </button>
          {expandedSections.has("raw-json") && (
            <ScrollArea className="max-h-[400px]">
              <pre className="text-xs font-mono whitespace-pre-wrap p-3 rounded-md bg-muted" data-testid="text-report-raw">
                {JSON.stringify(data, null, 2)}
              </pre>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryBlock({ summary }: { summary: Record<string, unknown> }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {Object.entries(summary).map(([key, value]) => (
        <div key={key} className="rounded-md p-3 bg-muted text-center">
          <div className="text-lg font-semibold">{String(value)}</div>
          <div className="text-xs text-muted-foreground">{key.replace(/_/g, " ")}</div>
        </div>
      ))}
    </div>
  );
}

function MismatchList({ mismatches, expandedSections, toggleSection }: {
  mismatches: Array<Record<string, unknown>>;
  expandedSections: Set<string>;
  toggleSection: (id: string) => void;
}) {
  const severityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />;
      case "warning": return <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400 shrink-0" />;
      default: return <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
    }
  };

  if (mismatches.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-sm">
        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
        No mismatches found
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">Mismatches ({mismatches.length})</p>
      {mismatches.map((mm, i) => {
        const id = `mismatch-${i}`;
        const expanded = expandedSections.has(id);
        const severity = String(mm.severity || "info");
        const mmLabel = String(mm.id || mm.category || "unknown");
        const reasonCode = mm.reason_code ? String(mm.reason_code) : null;
        const importedValue = mm.imported_value !== undefined ? String(mm.imported_value) : null;
        const expectedValue = mm.expected_value !== undefined ? String(mm.expected_value) : null;
        const suggestedAction = mm.suggested_action ? String(mm.suggested_action) : null;
        return (
          <div key={i} className="rounded-md border">
            <button
              onClick={() => toggleSection(id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs"
            >
              {expanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
              {severityIcon(severity)}
              <span className="font-medium">{mmLabel}</span>
              <Badge
                variant={severity === "critical" ? "error" : "secondary"}
                className="no-default-active-elevate ml-auto shrink-0"
              >
                {severity}
              </Badge>
            </button>
            {expanded && (
              <div className="px-3 pb-3 space-y-1 text-xs">
                {reasonCode && <div><span className="text-muted-foreground">Reason:</span> {reasonCode}</div>}
                {importedValue && <div><span className="text-muted-foreground">Imported:</span> {importedValue}</div>}
                {expectedValue && <div><span className="text-muted-foreground">Expected:</span> {expectedValue}</div>}
                {suggestedAction && <div><span className="text-muted-foreground">Action:</span> {suggestedAction}</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepsList({ steps, expandedSections, toggleSection }: {
  steps: Array<Record<string, unknown>>;
  expandedSections: Set<string>;
  toggleSection: (id: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">Steps ({steps.length})</p>
      {steps.map((step, i) => {
        const id = `step-${i}`;
        const expanded = expandedSections.has(id);
        const stepStatus = String(step.status || "unknown");
        const isPassed = stepStatus === "PASSED" || stepStatus === "SKIPPED";
        const stepName = String(step.name || "");
        const stepSummary = step.summary ? String(step.summary) : null;
        const durationMs = typeof step.duration_ms === "number" ? step.duration_ms : null;
        const reasonCodes = Array.isArray(step.reason_codes) ? (step.reason_codes as string[]) : null;
        const stepNextCmds = Array.isArray(step.next_commands) ? (step.next_commands as string[]) : null;
        return (
          <div key={i} className="rounded-md border">
            <button
              onClick={() => toggleSection(id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs"
            >
              {expanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
              {isPassed
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
                : <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
              }
              <span className="font-medium">{stepName}</span>
              {durationMs !== null && (
                <span className="text-muted-foreground ml-auto shrink-0">{(durationMs / 1000).toFixed(1)}s</span>
              )}
              <Badge
                variant={isPassed ? "success" : "error"}
                className="no-default-active-elevate shrink-0"
              >
                {stepStatus}
              </Badge>
            </button>
            {expanded && (
              <div className="px-3 pb-3 space-y-1 text-xs">
                {stepSummary && <div><span className="text-muted-foreground">Summary:</span> {stepSummary}</div>}
                {reasonCodes && reasonCodes.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {reasonCodes.map((rc, j) => (
                      <Badge key={j} variant="secondary" className="no-default-active-elevate">{rc}</Badge>
                    ))}
                  </div>
                )}
                {stepNextCmds && stepNextCmds.length > 0 && (
                  <div className="space-y-1 mt-1">
                    {stepNextCmds.map((cmd, j) => (
                      <div key={j} className="font-mono px-2 py-1 rounded bg-muted">{cmd}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BuildExecDetails({ report }: { report: Record<string, unknown> }) {
  const summary = report.summary as Record<string, unknown>;
  if (!summary) return null;

  return (
    <div className="space-y-2">
      {summary.succeeded !== undefined && summary.failed !== undefined && (
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            {String(summary.succeeded)} succeeded
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            {String(summary.failed)} failed
          </div>
        </div>
      )}
    </div>
  );
}

function TestGauge({ value, max, label, icon: Icon, colorClass }: {
  value: number;
  max: number;
  label: string;
  icon: typeof CheckCircle2;
  colorClass: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2 p-3">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${colorClass} transition-all duration-700`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold tabular-nums">{value}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Icon className={`w-3 h-3 ${colorClass}`} />
        {label}
      </div>
    </div>
  );
}

function TestReportViewer({ label, data, path }: {
  label: string;
  data: unknown;
  path?: string;
}) {
  const [showRaw, setShowRaw] = useState(false);
  const report = data as Record<string, unknown>;

  const status = String(report.status || "unknown");
  const isPass = status === "PASS" || status === "success";
  const testsPassed = typeof report.tests_passed === "number" ? report.tests_passed : 0;
  const testsFailed = typeof report.tests_failed === "number" ? report.tests_failed : 0;
  const lintErrors = typeof report.lint_errors === "number" ? report.lint_errors : 0;
  const typecheckErrors = typeof report.typecheck_errors === "number" ? report.typecheck_errors : 0;
  const durationMs = typeof report.duration_ms === "number" ? report.duration_ms : 0;
  const generatedAt = report.generated_at ? String(report.generated_at) : null;

  const totalTests = testsPassed + testsFailed;
  const totalIssues = testsFailed + lintErrors + typecheckErrors;

  const checks = [
    {
      label: "Unit Tests",
      icon: FlaskConical,
      passed: testsFailed === 0 && totalTests > 0,
      skipped: totalTests === 0,
      detail: totalTests > 0 ? `${testsPassed}/${totalTests} passed` : "No tests run",
    },
    {
      label: "Lint",
      icon: FileCode,
      passed: lintErrors === 0,
      skipped: false,
      detail: lintErrors > 0 ? `${lintErrors} error${lintErrors !== 1 ? "s" : ""}` : "Clean",
    },
    {
      label: "TypeScript",
      icon: FileCode,
      passed: typecheckErrors === 0,
      skipped: false,
      detail: typecheckErrors > 0 ? `${typecheckErrors} error${typecheckErrors !== 1 ? "s" : ""}` : "Clean",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            {isPass
              ? <div className="flex items-center justify-center w-9 h-9 rounded-md bg-green-100 dark:bg-green-950/40">
                  <CheckCircle2 className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
                </div>
              : <div className="flex items-center justify-center w-9 h-9 rounded-md bg-red-100 dark:bg-red-950/40">
                  <XCircle className="w-4.5 h-4.5 text-red-600 dark:text-red-400" />
                </div>
            }
            <div>
              <CardTitle className="text-sm">{label}</CardTitle>
              {generatedAt && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(generatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <Badge
            variant={isPass ? "success" : "error"}
            className="no-default-active-elevate"
            data-testid="text-test-report-status"
          >
            {status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-2 sm:gap-4 rounded-md bg-muted p-2">
          <TestGauge
            value={testsPassed}
            max={Math.max(totalTests, 1)}
            label="Passed"
            icon={CheckCircle2}
            colorClass="text-green-600 dark:text-green-400"
          />
          <TestGauge
            value={testsFailed}
            max={Math.max(totalTests, 1)}
            label="Failed"
            icon={XCircle}
            colorClass={testsFailed > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}
          />
          <TestGauge
            value={lintErrors}
            max={Math.max(lintErrors, 1)}
            label="Lint"
            icon={Bug}
            colorClass={lintErrors > 0 ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"}
          />
          <TestGauge
            value={typecheckErrors}
            max={Math.max(typecheckErrors, 1)}
            label="Types"
            icon={FileCode}
            colorClass={typecheckErrors > 0 ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md bg-muted p-3 text-center">
            <div className="text-lg font-bold tabular-nums">{totalTests}</div>
            <div className="text-xs text-muted-foreground">Total Tests</div>
          </div>
          <div className="rounded-md bg-muted p-3 text-center">
            <div className="text-lg font-bold tabular-nums">{totalIssues}</div>
            <div className="text-xs text-muted-foreground">Issues</div>
          </div>
          <div className="rounded-md bg-muted p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Timer className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-lg font-bold tabular-nums">{(durationMs / 1000).toFixed(1)}</span>
            </div>
            <div className="text-xs text-muted-foreground">Seconds</div>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground px-1">Quality Checks</p>
          {checks.map((check, i) => {
            const CheckIcon = check.icon;
            return (
              <div key={i} className="flex items-center gap-3 rounded-md border px-3 py-2.5">
                {check.skipped ? (
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">--</span>
                  </div>
                ) : check.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                )}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <CheckIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium">{check.label}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{check.detail}</span>
              </div>
            );
          })}
        </div>

        {path && (
          <p className="text-xs text-muted-foreground truncate px-1">
            Source: <span className="font-mono">{path}</span>
          </p>
        )}

        <div>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="flex items-center gap-1 text-xs text-muted-foreground mb-1 px-1"
            data-testid="button-test-raw-toggle"
          >
            {showRaw ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Raw JSON
          </button>
          {showRaw && (
            <ScrollArea className="max-h-[300px]">
              <pre className="text-xs font-mono whitespace-pre-wrap p-3 rounded-md bg-muted" data-testid="text-test-report-raw">
                {JSON.stringify(data, null, 2)}
              </pre>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
