import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Download, Loader2, FileArchive, CheckCircle, XCircle, Play, Copy, History } from "lucide-react";
import type { Run } from "@shared/schema";
import { Link } from "wouter";

const ideaFormSchema = z.object({
  idea: z.string().min(10, "Idea must be at least 10 characters"),
  context: z.string().optional(),
});

type IdeaFormData = z.infer<typeof ideaFormSchema>;

const PIPELINE_STEPS = ["init", "gen", "seed", "draft", "package", "complete"];

function getStepProgress(currentStep: string | null): number {
  if (!currentStep) return 0;
  const index = PIPELINE_STEPS.indexOf(currentStep);
  return index >= 0 ? ((index + 1) / PIPELINE_STEPS.length) * 100 : 0;
}

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

export default function Home() {
  const { toast } = useToast();
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  const form = useForm<IdeaFormData>({
    resolver: zodResolver(ideaFormSchema),
    defaultValues: {
      idea: "",
      context: "",
    },
  });

  const { data: activeRun, isLoading: runLoading } = useQuery<Run>({
    queryKey: ["/api/runs", activeRunId],
    enabled: !!activeRunId,
    refetchInterval: activeRunId ? 2000 : false,
  });

  const createRunMutation = useMutation({
    mutationFn: async (data: IdeaFormData) => {
      const response = await apiRequest("POST", "/api/runs", data);
      return response.json() as Promise<Run>;
    },
    onSuccess: (run) => {
      setActiveRunId(run.id);
      queryClient.invalidateQueries({ queryKey: ["/api/runs"] });
    },
    onError: (error) => {
      toast({
        title: "Error creating run",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const executeRunMutation = useMutation({
    mutationFn: async (runId: string) => {
      const response = await apiRequest("POST", `/api/runs/${runId}/execute`);
      return response.json() as Promise<Run>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/runs", activeRunId] });
    },
    onError: (error) => {
      toast({
        title: "Error executing pipeline",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: IdeaFormData) => {
    const run = await createRunMutation.mutateAsync(data);
    executeRunMutation.mutate(run.id);
    form.reset();
  };

  const handleDownload = () => {
    if (activeRun?.id) {
      window.location.href = `/api/runs/${activeRun.id}/download`;
    }
  };

  const handleCopyPrompt = async () => {
    const prompt = `I've generated a Roshi documentation bundle for: "${activeRun?.idea}"

Please download and extract the attached roshi_bundle.zip file. Inside you'll find:
- docs/roshi_v2/ - Structured domain documentation
- manifest.json - Bundle metadata and file listing

Read these docs to understand the project architecture, then implement the application according to the specifications.`;

    await navigator.clipboard.writeText(prompt);
    toast({
      title: "Copied to clipboard",
      description: "Agent prompt copied successfully",
    });
  };

  const handleNewRun = () => {
    setActiveRunId(null);
    form.reset();
  };

  const isRunning = activeRun?.state === "running";
  const isReady = activeRun?.state === "completed";
  const isFailed = activeRun?.state === "failed";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <FileArchive className="h-6 w-6" />
            <h1 className="text-xl font-bold">Roshi Studio</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/docs">
              <Button variant="ghost" size="sm" data-testid="link-docs">
                API Docs
              </Button>
            </Link>
            <Link href="/runs">
              <Button variant="ghost" size="sm" data-testid="link-history">
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate Agent Handoff Bundle</CardTitle>
            <CardDescription>
              Submit your idea and we'll generate structured documentation for AI coding agents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!activeRunId ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="idea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Idea</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project idea in detail. The more context you provide, the better the documentation will be..."
                            className="min-h-32"
                            data-testid="input-idea"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="context"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Context (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional context, constraints, or requirements..."
                            className="min-h-20"
                            data-testid="input-context"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createRunMutation.isPending || executeRunMutation.isPending}
                    data-testid="button-generate"
                  >
                    {createRunMutation.isPending || executeRunMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Generate Bundle
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Run Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(activeRun?.state || "queued")}
                      {activeRun?.step && (
                        <span className="text-sm text-muted-foreground">
                          Step: {activeRun.step}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleNewRun} data-testid="button-new-run">
                    New Run
                  </Button>
                </div>

                {isRunning && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Processing pipeline...</span>
                    </div>
                    <Progress value={getStepProgress(activeRun?.step || null)} />
                    <p className="text-xs text-muted-foreground">
                      This may take a moment. The pipeline generates comprehensive documentation.
                    </p>
                  </div>
                )}

                {isFailed && (
                  <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">Pipeline failed</span>
                    </div>
                    {activeRun?.errors && activeRun.errors.length > 0 && (
                      <p className="mt-2 text-sm text-muted-foreground">{activeRun.errors[0]}</p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => executeRunMutation.mutate(activeRun!.id)}
                      data-testid="button-retry"
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {isReady && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-green-500 bg-green-50 dark:bg-green-950/20 p-4">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Bundle ready for download</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Your documentation bundle has been generated and is ready to use with AI coding agents.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleDownload} className="flex-1" data-testid="button-download">
                        <Download className="mr-2 h-4 w-4" />
                        Download Bundle
                      </Button>
                      <Button variant="outline" onClick={handleCopyPrompt} data-testid="button-copy-prompt">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Agent Prompt
                      </Button>
                    </div>
                  </div>
                )}

                {activeRun?.idea && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground">Idea</p>
                    <p className="text-sm mt-1">{activeRun.idea}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Roshi follows a docs-first approach: init → gen → seed → draft → review → verify → lock</p>
          <p className="mt-1">No invention. No overwrite. Verify before lock.</p>
        </div>
      </main>
    </div>
  );
}
