import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Loader2, ChevronDown, ChevronRight, Terminal } from "lucide-react";
import type { PipelineRun } from "@shared/schema";

function formatDuration(ms: number): string {
  if (ms < 1000) return ms + "ms";
  return (ms / 1000).toFixed(1) + "s";
}

function formatTimestamp(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleString();
}

export default function LogsPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: runs = [], isLoading } = useQuery<PipelineRun[]>({
    queryKey: ["/api/pipeline-runs?limit=100"],
  });

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto" data-testid="logs-page">
      <div className="flex items-center gap-2">
        <ScrollText className="w-5 h-5" />
        <h2 className="text-lg font-semibold" data-testid="text-logs-header">Pipeline Logs</h2>
        {!isLoading && (
          <span className="text-sm text-muted-foreground ml-2" data-testid="text-run-count">
            {runs.length} run{runs.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

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
      ) : (
        <Card data-testid="logs-card">
          <CardContent className="p-0">
            <div className="divide-y" data-testid="logs-list">
              {runs.map((run) => {
                const isExpanded = expandedId === run.id;
                return (
                  <div key={run.id} data-testid={`log-row-${run.id}`}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover-elevate"
                      onClick={() => setExpandedId(isExpanded ? null : run.id)}
                      data-testid={`button-expand-${run.id}`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium w-28 shrink-0 truncate" data-testid={`text-step-${run.id}`}>
                        {run.stepLabel}
                      </span>
                      <span className="text-xs text-muted-foreground w-28 shrink-0 truncate" data-testid={`text-project-${run.id}`}>
                        {run.projectName}
                      </span>
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${run.status === "success" ? "bg-green-500" : "bg-red-500"}`} />
                      <Badge
                        variant={run.status === "success" ? "success" : "error"}
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
        </Card>
      )}
    </div>
  );
}
