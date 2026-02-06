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
} from "lucide-react";
import type { ReleaseGateReport } from "@shared/schema";

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
            <CardContent className="flex items-center gap-4 flex-wrap py-4">
              {report.passed
                ? <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                : <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />}
              <div>
                <span className="font-semibold text-sm" data-testid="text-gate-status">
                  {report.passed ? "PASSED" : "FAILED"}
                </span>
                <p className="text-xs text-muted-foreground">
                  {report.checks.length} checks in {(report.duration_ms / 1000).toFixed(1)}s
                </p>
              </div>
              <Badge variant={report.passed ? "success" : "error"} className="ml-auto no-default-active-elevate">
                v{report.version}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(report.generated_at).toLocaleString()}
              </span>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Checks ({report.checks.filter(c => c.passed).length}/{report.checks.length} passed)
            </h3>
            {report.checks.map((check) => (
              <Card key={check.id} data-testid={`check-${check.id}`}>
                <CardContent className="flex items-center gap-3 flex-wrap py-3">
                  {check.skipped ? (
                    <SkipForward className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : check.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="text-sm font-medium">{check.name}</span>
                    {check.error_summary && (
                      <p className="text-xs text-red-700 dark:text-red-400 mt-0.5 truncate">
                        {check.error_summary}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-auto shrink-0">
                    {check.required && <Badge variant="outline" className="no-default-active-elevate">required</Badge>}
                    {check.test_count !== undefined && (
                      <span className="text-xs text-muted-foreground">{check.test_count} tests</span>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {(check.duration_ms / 1000).toFixed(1)}s
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {report.failures.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Failures
              </h3>
              {report.failures.map((f) => (
                <Card key={f.check_id}>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                      <span className="text-sm font-medium">{f.check_id}</span>
                      <Badge variant="error" className="no-default-active-elevate">{f.reason_code}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">{f.summary}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {report.next_commands.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Suggested Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-32">
                  <div className="space-y-1">
                    {report.next_commands.map((cmd, i) => (
                      <pre key={i} className="text-xs font-mono p-2 rounded-md bg-muted">{cmd}</pre>
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
