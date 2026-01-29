import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Download, Loader2, FileArchive, CheckCircle, XCircle, Play, Copy, History, 
  Plus, Trash2, ChevronRight, ChevronLeft, Sparkles, Code, Users, ListTodo, Settings
} from "lucide-react";
import type { Run } from "@shared/schema";
import { Link } from "wouter";

const featureSchema = z.object({
  name: z.string().min(1, "Feature name required"),
  description: z.string().min(1, "Feature description required"),
  priority: z.enum(["P0", "P1", "P2"]),
});

const userTypeSchema = z.object({
  type: z.string().min(1, "User type required"),
  goal: z.string().min(1, "User goal required"),
});

const projectFormSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  features: z.array(featureSchema).optional(),
  users: z.array(userTypeSchema).optional(),
  techStack: z.object({
    frontend: z.string().optional(),
    backend: z.string().optional(),
    database: z.string().optional(),
  }).optional(),
  preset: z.string().optional(),
  domains: z.array(z.string()).optional(),
  idea: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

const PIPELINE_STEPS = ["init", "gen", "package", "complete"];

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

const FORM_STEPS = ["basics", "features", "users", "tech", "preview"] as const;
type FormStep = typeof FORM_STEPS[number];

export default function Home() {
  const { toast } = useToast();
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<FormStep>("basics");
  const [useSimpleMode, setUseSimpleMode] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectName: "",
      description: "",
      features: [],
      users: [],
      techStack: {
        frontend: "",
        backend: "",
        database: "",
      },
      preset: "",
      domains: ["platform", "api", "web"],
    },
  });

  const featuresField = useFieldArray({
    control: form.control,
    name: "features",
  });

  const usersField = useFieldArray({
    control: form.control,
    name: "users",
  });

  interface V1RunResponse {
    run: {
      runId: string;
      state: string;
      step: string | null;
      createdAt: string;
      updatedAt: string;
      projectName: string | null;
      preset: string | null;
      domains: string[] | null;
      input: ProjectFormData | null;
      errors: string[];
      progress: { percent: number };
      bundle: {
        available: boolean;
        generationMode: string | null;
        zipBytes: number;
        zipSha256: string | null;
        manifestSha256: string | null;
        agentPromptSha256: string | null;
        inputSha256: string | null;
        aiContextSha256: string | null;
      };
    };
    logsTail: string;
  }

  const { data: runResponse } = useQuery<V1RunResponse>({
    queryKey: ["/v1/runs", activeRunId],
    enabled: !!activeRunId,
    refetchInterval: activeRunId ? 2000 : false,
  });

  const activeRun = runResponse?.run;

  const createRunMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const response = await apiRequest("POST", "/v1/runs", data);
      return response.json();
    },
    onSuccess: (result) => {
      setActiveRunId(result.runId);
      queryClient.invalidateQueries({ queryKey: ["/v1/runs"] });
    },
    onError: (error) => {
      toast({
        title: "Error creating run",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    await createRunMutation.mutateAsync(data);
    form.reset();
    setCurrentStep("basics");
  };

  const handleDownload = async () => {
    if (activeRun?.runId) {
      try {
        const response = await fetch(`/v1/runs/${activeRun.runId}/bundle`);
        const data = await response.json();
        if (data.bundle?.download?.zipUrl) {
          window.location.href = data.bundle.download.zipUrl;
        } else {
          window.location.href = `/v1/runs/${activeRun.runId}/bundle.zip?fallback=true`;
        }
      } catch {
        window.location.href = `/api/runs/${activeRun.runId}/download`;
      }
    }
  };

  const handleCopyPrompt = async () => {
    const projectName = activeRun?.projectName || activeRun?.input?.projectName || "Project";
    const prompt = `I've generated a Roshi documentation bundle for: "${projectName}"

Please download and extract the attached roshi_bundle.zip file. Inside you'll find:
- docs/roshi_v2/ - Structured domain documentation
- handoff/input.json - Original structured input
- handoff/ai_context.json - Normalized AI context
- manifest.json - Bundle metadata

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
    setCurrentStep("basics");
  };

  const goNext = () => {
    const idx = FORM_STEPS.indexOf(currentStep);
    if (idx < FORM_STEPS.length - 1) {
      setCurrentStep(FORM_STEPS[idx + 1]);
    }
  };

  const goPrev = () => {
    const idx = FORM_STEPS.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(FORM_STEPS[idx - 1]);
    }
  };

  const isRunning = activeRun?.state === "running";
  const isReady = activeRun?.state === "completed";
  const isFailed = activeRun?.state === "failed";

  const watchedValues = form.watch();

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

      <main className="container mx-auto max-w-3xl p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generate Agent Handoff Bundle</CardTitle>
                <CardDescription>
                  Provide structured details for faster, more accurate documentation.
                </CardDescription>
              </div>
              {!activeRunId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUseSimpleMode(!useSimpleMode)}
                  data-testid="button-toggle-mode"
                >
                  {useSimpleMode ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Structured Mode
                    </>
                  ) : (
                    <>
                      <Code className="mr-2 h-4 w-4" />
                      Simple Mode
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!activeRunId ? (
              useSimpleMode ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="projectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input placeholder="My App" data-testid="input-project-name-simple" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Describe Your Project</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your project idea in detail..."
                              className="min-h-32"
                              data-testid="input-idea"
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
                      disabled={createRunMutation.isPending}
                      data-testid="button-generate"
                    >
                      {createRunMutation.isPending ? (
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
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Tabs value={currentStep} onValueChange={(v) => setCurrentStep(v as FormStep)} className="w-full">
                      <TabsList className="grid w-full grid-cols-5 mb-6">
                        <TabsTrigger value="basics" data-testid="tab-basics">
                          <Settings className="h-4 w-4 mr-1 hidden sm:inline" />
                          Basics
                        </TabsTrigger>
                        <TabsTrigger value="features" data-testid="tab-features">
                          <ListTodo className="h-4 w-4 mr-1 hidden sm:inline" />
                          Features
                        </TabsTrigger>
                        <TabsTrigger value="users" data-testid="tab-users">
                          <Users className="h-4 w-4 mr-1 hidden sm:inline" />
                          Users
                        </TabsTrigger>
                        <TabsTrigger value="tech" data-testid="tab-tech">
                          <Code className="h-4 w-4 mr-1 hidden sm:inline" />
                          Tech
                        </TabsTrigger>
                        <TabsTrigger value="preview" data-testid="tab-preview">
                          <Sparkles className="h-4 w-4 mr-1 hidden sm:inline" />
                          Generate
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="basics" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="projectName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Task Manager Pro" data-testid="input-project-name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Description *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="A task management application for small teams with kanban boards, due dates, and team member assignments..."
                                  className="min-h-24"
                                  data-testid="input-description"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Describe the core purpose and goals of your project.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end pt-4">
                          <Button type="button" onClick={goNext} data-testid="button-next-basics">
                            Next: Features <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="features" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium">Features</h3>
                            <p className="text-sm text-muted-foreground">
                              Define the features your project needs. Prioritize with P0 (must-have), P1 (should-have), P2 (nice-to-have).
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => featuresField.append({ name: "", description: "", priority: "P1" })}
                            data-testid="button-add-feature"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Feature
                          </Button>
                        </div>

                        {featuresField.fields.length === 0 ? (
                          <div className="rounded-lg border-2 border-dashed p-8 text-center">
                            <ListTodo className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                              No features defined yet. Add features to get better documentation.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {featuresField.fields.map((field, index) => (
                              <div key={field.id} className="rounded-lg border p-4 space-y-3">
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 space-y-3">
                                    <div className="flex gap-2">
                                      <FormField
                                        control={form.control}
                                        name={`features.${index}.name`}
                                        render={({ field }) => (
                                          <FormItem className="flex-1">
                                            <FormControl>
                                              <Input placeholder="Feature name" data-testid={`input-feature-name-${index}`} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`features.${index}.priority`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl>
                                                <SelectTrigger className="w-24" data-testid={`select-feature-priority-${index}`}>
                                                  <SelectValue />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="P0">P0</SelectItem>
                                                <SelectItem value="P1">P1</SelectItem>
                                                <SelectItem value="P2">P2</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    <FormField
                                      control={form.control}
                                      name={`features.${index}.description`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Textarea 
                                              placeholder="Describe this feature..." 
                                              className="min-h-16"
                                              data-testid={`input-feature-desc-${index}`}
                                              {...field} 
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => featuresField.remove(index)}
                                    data-testid={`button-remove-feature-${index}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between pt-4">
                          <Button type="button" variant="outline" onClick={goPrev} data-testid="button-prev-features">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                          </Button>
                          <Button type="button" onClick={goNext} data-testid="button-next-features">
                            Next: Users <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="users" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium">User Types</h3>
                            <p className="text-sm text-muted-foreground">
                              Define who will use your application and what they want to accomplish.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => usersField.append({ type: "", goal: "" })}
                            data-testid="button-add-user"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add User Type
                          </Button>
                        </div>

                        {usersField.fields.length === 0 ? (
                          <div className="rounded-lg border-2 border-dashed p-8 text-center">
                            <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                              No user types defined yet. Add users to improve documentation quality.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {usersField.fields.map((field, index) => (
                              <div key={field.id} className="rounded-lg border p-4">
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 space-y-3">
                                    <FormField
                                      control={form.control}
                                      name={`users.${index}.type`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>User Type</FormLabel>
                                          <FormControl>
                                            <Input placeholder="e.g., Team Lead, Developer, Admin" data-testid={`input-user-type-${index}`} {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`users.${index}.goal`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Primary Goal</FormLabel>
                                          <FormControl>
                                            <Input placeholder="What do they want to accomplish?" data-testid={`input-user-goal-${index}`} {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => usersField.remove(index)}
                                    data-testid={`button-remove-user-${index}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between pt-4">
                          <Button type="button" variant="outline" onClick={goPrev} data-testid="button-prev-users">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                          </Button>
                          <Button type="button" onClick={goNext} data-testid="button-next-users">
                            Next: Tech Stack <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="tech" className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">Tech Stack Preferences</h3>
                          <p className="text-sm text-muted-foreground">
                            Optional: specify your preferred technologies. Leave blank for AI to suggest.
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <FormField
                            control={form.control}
                            name="techStack.frontend"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frontend</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., React, Vue, Next.js" data-testid="input-tech-frontend" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="techStack.backend"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Backend</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Node/Express, Python/FastAPI" data-testid="input-tech-backend" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="techStack.database"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Database</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., PostgreSQL, MongoDB" data-testid="input-tech-database" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-between pt-4">
                          <Button type="button" variant="outline" onClick={goPrev} data-testid="button-prev-tech">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                          </Button>
                          <Button type="button" onClick={goNext} data-testid="button-next-tech">
                            Review & Generate <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="preview" className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">Review Your Input</h3>
                          <p className="text-sm text-muted-foreground">
                            Verify your project details before generating the bundle.
                          </p>
                        </div>

                        <div className="rounded-lg border p-4 space-y-4">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">PROJECT NAME</p>
                            <p className="font-medium">{watchedValues.projectName || "(not set)"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">DESCRIPTION</p>
                            <p className="text-sm">{watchedValues.description || "(not set)"}</p>
                          </div>
                          {watchedValues.features && watchedValues.features.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">FEATURES ({watchedValues.features.length})</p>
                              <div className="flex flex-wrap gap-2">
                                {watchedValues.features.map((f, i) => (
                                  <Badge key={i} variant={f.priority === "P0" ? "default" : f.priority === "P1" ? "secondary" : "outline"}>
                                    {f.name} ({f.priority})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {watchedValues.users && watchedValues.users.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">USER TYPES ({watchedValues.users.length})</p>
                              <div className="flex flex-wrap gap-2">
                                {watchedValues.users.map((u, i) => (
                                  <Badge key={i} variant="outline">{u.type}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {(watchedValues.techStack?.frontend || watchedValues.techStack?.backend || watchedValues.techStack?.database) && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">TECH STACK</p>
                              <div className="flex flex-wrap gap-2">
                                {watchedValues.techStack?.frontend && <Badge variant="secondary">{watchedValues.techStack.frontend}</Badge>}
                                {watchedValues.techStack?.backend && <Badge variant="secondary">{watchedValues.techStack.backend}</Badge>}
                                {watchedValues.techStack?.database && <Badge variant="secondary">{watchedValues.techStack.database}</Badge>}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between pt-4">
                          <Button type="button" variant="outline" onClick={goPrev} data-testid="button-prev-preview">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                          </Button>
                          <Button
                            type="submit"
                            disabled={createRunMutation.isPending}
                            data-testid="button-generate"
                          >
                            {createRunMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Starting...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Bundle
                              </>
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </form>
                </Form>
              )
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
                      <span className="text-sm">Generating documentation...</span>
                    </div>
                    <Progress value={getStepProgress(activeRun?.step || null)} />
                    <p className="text-xs text-muted-foreground">
                      AI is generating structured documentation based on your input. This takes about 30-60 seconds.
                    </p>
                  </div>
                )}

                {isFailed && (
                  <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">Generation failed</span>
                    </div>
                    {activeRun?.errors && activeRun.errors.length > 0 && (
                      <p className="mt-2 text-sm text-muted-foreground">{activeRun.errors[0]}</p>
                    )}
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

                {(activeRun?.projectName || activeRun?.input?.projectName) && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground">Project</p>
                    <p className="text-sm mt-1 font-medium">{activeRun?.projectName || activeRun?.input?.projectName}</p>
                    {activeRun?.input?.description && (
                      <p className="text-sm mt-1 text-muted-foreground">{activeRun.input.description}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Roshi follows a docs-first approach with structured input for better AI generation.</p>
          <p className="mt-1">No invention. No overwrite. Verify before lock.</p>
        </div>
      </main>
    </div>
  );
}
