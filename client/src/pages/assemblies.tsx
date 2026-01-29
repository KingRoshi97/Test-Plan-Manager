import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Download, Trash2, FileArchive, ArrowLeft, Loader2 } from "lucide-react";
import type { Assembly } from "@shared/schema";

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

export default function Assemblies() {
  const { toast } = useToast();

  const { data: assemblies, isLoading } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    refetchInterval: 5000,
  });

  const deleteAssemblyMutation = useMutation({
    mutationFn: async (assemblyId: string) => {
      await apiRequest("DELETE", `/api/assemblies/${assemblyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
      toast({
        title: "Assembly deleted",
        description: "The assembly has been removed from history.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting assembly",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDownload = (assemblyId: string) => {
    window.location.href = `/api/assemblies/${assemblyId}/kit.zip`;
  };

  const handleDelete = (assemblyId: string) => {
    deleteAssemblyMutation.mutate(assemblyId);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center gap-4 p-4">
          <Link href="/create">
            <Button variant="ghost" size="sm" data-testid="link-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <FileArchive className="h-6 w-6" />
            <h1 className="text-xl font-bold">Assembly History</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Previous Assemblies</CardTitle>
            <CardDescription>
              View and download kits from previous assemblies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !assemblies || assemblies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No assemblies yet.</p>
                <Link href="/create">
                  <Button variant="ghost" className="mt-2" data-testid="link-create-first">
                    Create your first kit
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {assemblies.map((assembly) => (
                  <div
                    key={assembly.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                    data-testid={`row-assembly-${assembly.id}`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(assembly.state)}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(assembly.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm truncate">{assembly.idea}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {assembly.state === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(assembly.id)}
                          data-testid={`button-download-${assembly.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(assembly.id)}
                        disabled={deleteAssemblyMutation.isPending}
                        data-testid={`button-delete-${assembly.id}`}
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
