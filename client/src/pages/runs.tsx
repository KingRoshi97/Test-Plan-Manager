import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Download, Trash2, FileArchive, ArrowLeft, Loader2 } from "lucide-react";
import type { Run } from "@shared/schema";

function getStatusBadge(status: string) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    queued: { variant: "secondary", label: "Queued" },
    running: { variant: "default", label: "Running" },
    completed: { variant: "outline", label: "Ready" },
    failed: { variant: "destructive", label: "Failed" },
    canceled: { variant: "secondary", label: "Canceled" },
  };
  const config = variants[status] || { variant: "secondary", label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Runs() {
  const { toast } = useToast();

  const { data: runs, isLoading } = useQuery<Run[]>({
    queryKey: ["/api/runs"],
    refetchInterval: 5000,
  });

  const deleteRunMutation = useMutation({
    mutationFn: async (runId: string) => {
      await apiRequest("DELETE", `/api/runs/${runId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/runs"] });
      toast({
        title: "Run deleted",
        description: "The run has been removed from history.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting run",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDownload = (runId: string) => {
    window.location.href = `/api/runs/${runId}/download`;
  };

  const handleDelete = (runId: string) => {
    deleteRunMutation.mutate(runId);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center gap-4 p-4">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="link-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <FileArchive className="h-6 w-6" />
            <h1 className="text-xl font-bold">Run History</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Previous Runs</CardTitle>
            <CardDescription>
              View and download bundles from previous pipeline runs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !runs || runs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No runs yet.</p>
                <Link href="/">
                  <Button variant="ghost" className="mt-2" data-testid="link-create-first">
                    Create your first bundle
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {runs.map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                    data-testid={`row-run-${run.id}`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(run.state)}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(run.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm truncate">{run.idea}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {run.state === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(run.id)}
                          data-testid={`button-download-${run.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(run.id)}
                        disabled={deleteRunMutation.isPending}
                        data-testid={`button-delete-${run.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
