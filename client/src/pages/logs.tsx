import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ScrollText,
  Loader2,
  ChevronDown,
  ChevronRight,
  Terminal,
  Search,
  CheckCircle2,
  XCircle,
  FolderOpen,
  Clock,
  Filter,
} from "lucide-react";
import type { PipelineRun } from "@shared/schema";

function formatDuration(ms: number): string {
  if (ms < 1000) return ms + "ms";
  if (ms < 60000) return (ms / 1000).toFixed(1) + "s";
  const min = Math.floor(ms / 60000);
  const sec = ((ms % 60000) / 1000).toFixed(0);
  return `${min}m ${sec}s`;
}

function formatTimestamp(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleString();
}

function formatRelativeTime(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

interface AssemblyGroup {
  projectName: string;
  runs: PipelineRun[];
  totalRuns: number;
  successCount: number;
  failCount: number;
  totalDuration: number;
  lastRunAt: string;
}

type StatusFilter = "all" | "success" | "failed";

export default function LogsPage() {
  const [expandedRuns, setExpandedRuns] = useState<Set<number>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: runs = [], isLoading } = useQuery<PipelineRun[]>({
    queryKey: ["/api/pipeline-runs?limit=200"],
  });

  const toggleRun = (id: number) => {
    setExpandedRuns(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (name: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const groups = useMemo(() => {
    const filtered = runs.filter(run => {
      if (statusFilter === "success" && run.status !== "success") return false;
      if (statusFilter === "failed" && run.status === "success") return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          run.projectName.toLowerCase().includes(q) ||
          run.stepLabel.toLowerCase().includes(q) ||
          run.stepId.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const map = new Map<string, PipelineRun[]>();
    for (const run of filtered) {
      const key = run.projectName;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(run);
    }

    const result: AssemblyGroup[] = [];
    for (const [projectName, projectRuns] of map) {
      const successCount = projectRuns.filter(r => r.status === "success").length;
      const failCount = projectRuns.filter(r => r.status !== "success").length;
      const totalDuration = projectRuns.reduce((sum, r) => sum + r.durationMs, 0);
      const lastRunAt = projectRuns.length > 0 ? String(projectRuns[0].createdAt) : "";
      result.push({
        projectName,
        runs: projectRuns,
        totalRuns: projectRuns.length,
        successCount,
        failCount,
        totalDuration,
        lastRunAt,
      });
    }

    result.sort((a, b) => new Date(b.lastRunAt).getTime() - new Date(a.lastRunAt).getTime());
    return result;
  }, [runs, searchQuery, statusFilter]);

  const totalRuns = runs.length;
  const totalSuccess = runs.filter(r => r.status === "success").length;
  const totalFailed = runs.filter(r => r.status !== "success").length;

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto" data-testid="logs-page">
      <div className="flex items-center gap-2">
        <ScrollText className="w-5 h-5" />
        <h2 className="text-lg font-semibold" data-testid="text-logs-header">Pipeline Logs</h2>
        {!isLoading && (
          <span className="text-sm text-muted-foreground ml-2" data-testid="text-run-count">
            {totalRuns} run{totalRuns !== 1 ? "s" : ""} across {groups.length} assembl{groups.length !== 1 ? "ies" : "y"}
          </span>
        )}
      </div>

      {!isLoading && runs.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3" data-testid="logs-summary-stats">
            <Card data-testid="stat-total-runs">
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <ScrollText className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-lg font-semibold leading-none">{totalRuns}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Total Runs</div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="stat-success-runs">
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-lg font-semibold leading-none">{totalSuccess}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Succeeded</div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="stat-failed-runs">
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <XCircle className="w-4 h-4 text-red-500" />
                <div>
                  <div className="text-lg font-semibold leading-none">{totalFailed}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Failed</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-3 flex-wrap" data-testid="logs-filters">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by assembly name or step..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-logs"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-36" data-testid="select-status-filter">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Succeeded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || statusFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                className="text-xs text-muted-foreground"
                data-testid="button-clear-filters"
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16" data-testid="loading-logs">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : runs.length === 0 ? (
        <Card data-testid="empty-logs">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Terminal className="w-12 h-12 text-primary/20 mb-4" />
            <h3 className="text-base font-medium mb-1">No pipeline runs yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Pipeline runs will appear here once you execute steps on an assembly.
            </p>
          </CardContent>
        </Card>
      ) : groups.length === 0 ? (
        <Card data-testid="empty-filtered-logs">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-10 h-10 text-primary/20 mb-3" />
            <h3 className="text-sm font-medium mb-1">No matching runs</h3>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3" data-testid="logs-grouped-list">
          {groups.map((group) => {
            const isCollapsed = collapsedGroups.has(group.projectName);
            return (
              <Card key={group.projectName} data-testid={`log-group-${group.projectName}`}>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover-elevate rounded-md"
                  onClick={() => toggleGroup(group.projectName)}
                  data-testid={`button-toggle-group-${group.projectName}`}
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                  )}
                  <FolderOpen className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium truncate" data-testid={`text-group-name-${group.projectName}`}>
                    {group.projectName}
                  </span>
                  <div className="flex items-center gap-2 ml-auto shrink-0 flex-wrap">
                    <Badge variant="secondary" className="text-xs" data-testid={`badge-group-total-${group.projectName}`}>
                      {group.totalRuns} run{group.totalRuns !== 1 ? "s" : ""}
                    </Badge>
                    {group.successCount > 0 && (
                      <Badge variant="success" className="text-xs" data-testid={`badge-group-success-${group.projectName}`}>
                        {group.successCount} passed
                      </Badge>
                    )}
                    {group.failCount > 0 && (
                      <Badge variant="error" className="text-xs" data-testid={`badge-group-fail-${group.projectName}`}>
                        {group.failCount} failed
                      </Badge>
                    )}
                    <span className="text-[11px] text-muted-foreground" data-testid={`text-group-duration-${group.projectName}`}>
                      {formatDuration(group.totalDuration)}
                    </span>
                    <span className="text-[11px] text-muted-foreground" data-testid={`text-group-last-run-${group.projectName}`}>
                      {formatRelativeTime(group.lastRunAt)}
                    </span>
                  </div>
                </button>

                {!isCollapsed && (
                  <CardContent className="p-0 border-t">
                    <div className="divide-y" data-testid={`log-runs-${group.projectName}`}>
                      {group.runs.map((run) => {
                        const isExpanded = expandedRuns.has(run.id);
                        return (
                          <div key={run.id} data-testid={`log-row-${run.id}`}>
                            <button
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover-elevate"
                              onClick={() => toggleRun(run.id)}
                              data-testid={`button-expand-${run.id}`}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                              )}
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${run.status === "success" ? "bg-green-500" : "bg-red-500"}`} />
                              <span className="text-sm font-medium w-32 shrink-0 truncate" data-testid={`text-step-${run.id}`}>
                                {run.stepLabel}
                              </span>
                              <Badge
                                variant={run.status === "success" ? "success" : "error"}
                                className="text-xs"
                                data-testid={`badge-status-${run.id}`}
                              >
                                {run.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground" data-testid={`text-exit-${run.id}`}>
                                exit: {run.exitCode}
                              </span>
                              <span className="text-xs text-muted-foreground" data-testid={`text-duration-${run.id}`}>
                                {formatDuration(run.durationMs)}
                              </span>
                              <span className="text-xs text-muted-foreground ml-auto" data-testid={`text-time-${run.id}`}>
                                {formatTimestamp(run.createdAt)}
                              </span>
                            </button>
                            {isExpanded && (
                              <div className="px-4 pb-4 space-y-2" data-testid={`output-${run.id}`}>
                                {run.stdout && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">stdout</p>
                                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap" data-testid={`pre-stdout-${run.id}`}>
                                      {run.stdout}
                                    </pre>
                                  </div>
                                )}
                                {run.stderr && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">stderr</p>
                                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap text-red-600 dark:text-red-400" data-testid={`pre-stderr-${run.id}`}>
                                      {run.stderr}
                                    </pre>
                                  </div>
                                )}
                                {!run.stdout && !run.stderr && (
                                  <p className="text-xs text-muted-foreground py-2" data-testid={`text-no-output-${run.id}`}>
                                    No output captured.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
