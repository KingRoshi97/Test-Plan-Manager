import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Download, Loader2, CheckCircle, XCircle, Play, Copy,
  Plus, Trash2, ChevronRight, ChevronLeft, Sparkles, Code, Users, ListTodo, Settings,
  Upload, File, X
} from "lucide-react";
import type { UploadedFile } from "@shared/schema";
import { useLocation } from "wouter";
import { PageHeader, StatusBadge, Stepper, AssemblyTimeline, CodeBlock, CopyButton } from "@/components/kit";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardDescription } from "@/components/kit";

const featureSchema = z.object({
  name: z.string().min(1, "Feature name required"),
  description: z.string().min(1, "Feature description required"),
  priority: z.enum(["P0", "P1", "P2"]),
});

const userTypeSchema = z.object({
  type: z.string().min(1, "User type required"),
  goal: z.string().min(1, "User goal required"),
});

const uploadedFileSchema = z.object({
  id: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
  extractedText: z.string(),
  uploadedAt: z.string(),
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
  uploadedFiles: z.array(uploadedFileSchema).optional(),
  uploadedContext: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface UploadResponse {
  files: UploadedFile[];
  combinedContext: string;
  totalSize: number;
  totalExtractedLength: number;
}

const PIPELINE_STEPS = ["init", "gen", "package", "complete"];

function getStepProgress(currentStep: string | null): number {
  if (!currentStep) return 0;
  const index = PIPELINE_STEPS.indexOf(currentStep);
  return index >= 0 ? ((index + 1) / PIPELINE_STEPS.length) * 100 : 0;
}

const FORM_STEPS = ["basics", "features", "users", "tech", "preview"] as const;
const STEP_CONFIG = [
  { id: "basics", label: "Basics" },
  { id: "features", label: "Features" },
  { id: "users", label: "Users" },
  { id: "tech", label: "Tech" },
  { id: "preview", label: "Generate" },
];
type FormStep = typeof FORM_STEPS[number];

export default function Create() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeAssemblyId, setActiveAssemblyId] = useState<string | null>(null);
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
      uploadedFiles: [],
      uploadedContext: "",
    },
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadFiles = async (files: FileList | File[]) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append("files", file));
    
    try {
      const response = await fetch("/v1/uploads", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Upload failed");
      }
      
      const data: UploadResponse = await response.json();
      
      const currentFiles = form.getValues("uploadedFiles") || [];
      form.setValue("uploadedFiles", [...currentFiles, ...data.files]);
      
      const currentContext = form.getValues("uploadedContext") || "";
      form.setValue("uploadedContext", currentContext 
        ? `${currentContext}\n\n${data.combinedContext}` 
        : data.combinedContext);
      
      toast({
        title: "Files uploaded",
        description: `${data.files.length} file(s) processed, ${data.totalExtractedLength} characters extracted.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const removeUploadedFile = (fileId: string) => {
    const files = form.getValues("uploadedFiles") || [];
    const updatedFiles = files.filter(f => f.id !== fileId);
    form.setValue("uploadedFiles", updatedFiles);
    
    const newContext = updatedFiles.map(f => `--- ${f.filename} ---\n${f.extractedText}`).join("\n\n");
    form.setValue("uploadedContext", newContext);
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const featuresField = useFieldArray({
    control: form.control,
    name: "features",
  });

  const usersField = useFieldArray({
    control: form.control,
    name: "users",
  });

  interface V1AssemblyResponse {
    assembly: {
      assemblyId: string;
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
      kit: {
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

  const { data: assemblyResponse } = useQuery<V1AssemblyResponse>({
    queryKey: ["/v1/assemblies", activeAssemblyId],
    enabled: !!activeAssemblyId,
    refetchInterval: activeAssemblyId ? 2000 : false,
  });

  const activeAssembly = assemblyResponse?.assembly;

  const createAssemblyMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const response = await apiRequest("POST", "/v1/assemblies", data);
      return response.json();
    },
    onSuccess: (result) => {
      setActiveAssemblyId(result.assemblyId);
      queryClient.invalidateQueries({ queryKey: ["/v1/assemblies"] });
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
    await createAssemblyMutation.mutateAsync(data);
    form.reset();
    setCurrentStep("basics");
  };

  const handleDownload = async () => {
    if (activeAssembly?.assemblyId) {
      try {
        const response = await fetch(`/v1/assemblies/${activeAssembly.assemblyId}/kit`);
        const data = await response.json();
        if (data.kit?.download?.zipUrl) {
          window.location.href = data.kit.download.zipUrl;
        } else {
          window.location.href = `/v1/assemblies/${activeAssembly.assemblyId}/kit.zip?fallback=true`;
        }
      } catch {
        window.location.href = `/api/assemblies/${activeAssembly.assemblyId}/kit.zip`;
      }
    }
  };

  const handleCopyPrompt = async () => {
    const projectName = activeAssembly?.projectName || activeAssembly?.input?.projectName || "Project";
    const prompt = `I've generated an Axiom documentation kit for: "${projectName}"

Please download and extract the attached axiom_kit.zip file. Inside you'll find:
- docs/assembler_v1/ - Structured domain documentation
- delivery/input.json - Original structured input
- delivery/ai_context.json - Normalized AI context
- assembly_manifest.json - Kit metadata

Read these docs to understand the project architecture, then implement the application according to the specifications.`;

    await navigator.clipboard.writeText(prompt);
    toast({
      title: "Copied to clipboard",
      description: "Agent prompt copied successfully",
    });
  };

  const handleNewAssembly = () => {
    setActiveAssemblyId(null);
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

  const isRunning = activeAssembly?.state === "running";
  const isReady = activeAssembly?.state === "completed";
  const isFailed = activeAssembly?.state === "failed";

  const watchedValues = form.watch();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Create Assembly"
        subtitle="Generate an AI-powered documentation kit for your project"
        actions={
          !activeAssemblyId && (
            <Button
              variant="outline"
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
          )
        }
      />

      {!activeAssemblyId && !useSimpleMode && (
        <Stepper
          steps={STEP_CONFIG}
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step as FormStep)}
          className="mb-6"
        />
      )}

      <GlassCard>
        <GlassCardContent className="pt-6 space-y-6">
            {!activeAssemblyId ? (
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
                      disabled={createAssemblyMutation.isPending}
                      data-testid="button-generate"
                    >
                      {createAssemblyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Generate Kit
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
                        
                        <div className="space-y-3">
                          <FormLabel>Reference Documents (Optional)</FormLabel>
                          <div
                            className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                              isDragging 
                                ? "border-primary bg-primary/5" 
                                : "border-muted-foreground/25 hover:border-muted-foreground/50"
                            }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            data-testid="drop-zone-files"
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept=".pdf,.docx,.doc,.txt,.md"
                              multiple
                              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
                              data-testid="input-file-upload"
                            />
                            {isUploading ? (
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Extracting text...</p>
                              </div>
                            ) : (
                              <>
                                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                  Drag and drop PDFs, Word docs, or text files
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => fileInputRef.current?.click()}
                                  data-testid="button-browse-files"
                                >
                                  Browse Files
                                </Button>
                              </>
                            )}
                          </div>
                          <FormDescription>
                            Upload existing documentation, specs, or notes to provide additional context.
                          </FormDescription>
                          
                          {(form.watch("uploadedFiles") || []).length > 0 && (
                            <div className="space-y-2">
                              {(form.watch("uploadedFiles") || []).map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center justify-between rounded-md border p-2"
                                  data-testid={`uploaded-file-${file.id}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <File className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{file.filename}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {formatFileSize(file.size)}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {file.extractedText.length} chars
                                    </Badge>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeUploadedFile(file.id)}
                                    data-testid={`button-remove-file-${file.id}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
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
                            disabled={createAssemblyMutation.isPending}
                            data-testid="button-generate"
                          >
                            {createAssemblyMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Starting...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Kit
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
                    <p className="text-sm text-muted-foreground">Assembly Status</p>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={activeAssembly?.state || "queued"} />
                      {activeAssembly?.step && (
                        <span className="text-sm text-muted-foreground">
                          Step: {activeAssembly.step}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleNewAssembly} data-testid="button-new-assembly">
                    New Assembly
                  </Button>
                </div>

                {isRunning && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Generating documentation...</span>
                    </div>
                    <AssemblyTimeline 
                      currentStep={activeAssembly?.step || null} 
                      state={(activeAssembly?.state as "queued" | "running" | "completed" | "failed" | "canceled") || "running"} 
                      compact 
                    />
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
                    {activeAssembly?.errors && activeAssembly.errors.length > 0 && (
                      <p className="mt-2 text-sm text-muted-foreground">{activeAssembly.errors[0]}</p>
                    )}
                  </div>
                )}

                {isReady && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-green-500 bg-green-50 dark:bg-green-950/20 p-4">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Kit ready for download</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Your documentation kit has been generated and is ready to use with AI coding agents.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleDownload} className="flex-1" data-testid="button-download">
                        <Download className="mr-2 h-4 w-4" />
                        Download Kit
                      </Button>
                      <Button variant="outline" onClick={handleCopyPrompt} data-testid="button-copy-prompt">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Agent Prompt
                      </Button>
                    </div>
                  </div>
                )}

                {(activeAssembly?.projectName || activeAssembly?.input?.projectName) && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground">Project</p>
                    <p className="text-sm mt-1 font-medium">{activeAssembly?.projectName || activeAssembly?.input?.projectName}</p>
                    {activeAssembly?.input?.description && (
                      <p className="text-sm mt-1 text-muted-foreground">{activeAssembly.input.description}</p>
                    )}
                  </div>
                )}
              </div>
            )}
        </GlassCardContent>
      </GlassCard>

      <div className="text-center text-sm text-muted-foreground">
        <p>Axiom follows a docs-first approach with structured input for better AI generation.</p>
        <p className="mt-1">No invention. No overwrite. Verify before lock.</p>
      </div>
    </div>
  );
}
