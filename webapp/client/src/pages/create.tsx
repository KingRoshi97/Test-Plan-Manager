import { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
  Upload, File, X, Package, AlertTriangle, FolderArchive,
  Globe, Smartphone, Server, Workflow, Gamepad2, Wand2, Palette, BookOpen,
  type LucideIcon
} from "lucide-react";
import type { UploadedFile, ProjectSummary, ProjectWarning, ScanState, IndexState, AssemblyCategory, AssemblyMode } from "@shared/schema";
import { useLocation } from "wouter";
import { PageHeader, StatusBadge, Stepper, AssemblyTimeline, CodeBlock, CopyButton } from "@/components/kit";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardDescription } from "@/components/kit";
import DynamicWizard from "@/components/wizard/DynamicWizard";
import { 
  getFlow, 
  getTabsForCategory,
  type Category, 
  type Mode, 
  type WizardFlow,
  type TabConfig
} from "@/lib/wizard/flows";
import { 
  makeEmptyDraft, 
  applyPresetDefaults as applyWizardPresetDefaults, 
  mapDraftToCreateAssemblyRequest,
  type WizardDraft,
  type ProjectPackageStatus as WizardPackageStatus
} from "@/lib/wizard/draft";

interface CategoryInfo {
  label: string;
  description: string;
  icon: string;
}

interface ModeInfo {
  label: string;
  description: string;
  requiresZip: boolean;
}

interface Preset {
  id: string;
  label: string;
  category: AssemblyCategory;
  mode: AssemblyMode;
  defaultDomains: string[];
  wizardFieldProfile: string;
  outputDefaults: {
    kitMode: string;
    upgradeOutput: string;
  };
  defaults: {
    techStack?: { frontend?: string; backend?: string; database?: string; runtime?: string; framework?: string };
    goals?: string[];
    constraints?: string[];
  };
}

interface PresetsResponse {
  presets: Preset[];
  categories: Record<AssemblyCategory, CategoryInfo>;
  modes: Record<AssemblyMode, ModeInfo>;
}

const CategoryIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case "Globe": return <Globe className="h-6 w-6" />;
    case "Smartphone": return <Smartphone className="h-6 w-6" />;
    case "Server": return <Server className="h-6 w-6" />;
    case "Package": return <Package className="h-6 w-6" />;
    case "Workflow": return <Workflow className="h-6 w-6" />;
    case "Gamepad2": return <Gamepad2 className="h-6 w-6" />;
    default: return <Code className="h-6 w-6" />;
  }
};

interface ProjectPackageStatus {
  id: string;
  filename: string;
  sizeBytes: number;
  scanState: ScanState;
  indexState: IndexState;
  summaryJson?: ProjectSummary | null;
  warningsJson?: ProjectWarning[] | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}

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
  category: z.string().optional(),
  mode: z.string().optional(),
  presetId: z.string().optional(),
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

const TAB_ICON_MAP: Record<TabConfig["icon"], LucideIcon> = {
  Package,
  Settings,
  Sparkles,
  ListTodo,
  Users,
  Palette,
  Code,
  Play,
  Upload,
  FolderArchive,
  Workflow,
  Gamepad2,
  BookOpen,
};

function TabIcon({ icon }: { icon: TabConfig["icon"] }) {
  const IconComponent = TAB_ICON_MAP[icon];
  return <IconComponent className="h-4 w-4 mr-1 hidden sm:inline" />;
}

export default function Create() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeAssemblyId, setActiveAssemblyId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>("type");
  const [useSimpleMode, setUseSimpleMode] = useState(false);
  
  // Category/Mode/Preset selection state
  const [selectedCategory, setSelectedCategory] = useState<AssemblyCategory | null>(null);
  const [selectedMode, setSelectedMode] = useState<AssemblyMode | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  
  // Dynamic wizard state
  const [wizardDraft, setWizardDraft] = useState<WizardDraft>(makeEmptyDraft());
  const [wizardFlow, setWizardFlow] = useState<WizardFlow | null>(null);
  const [wizardStepIndex, setWizardStepIndex] = useState(0);
  
  // Dynamic tabs based on category and mode
  const currentTabs = getTabsForCategory(
    selectedCategory as Category | null, 
    selectedMode as Mode | null
  );
  
  // Fetch presets from API
  const { data: presetsData } = useQuery<PresetsResponse>({
    queryKey: ["/api/presets"],
  });
  
  const filteredPresets = presetsData?.presets.filter(p => 
    (!selectedCategory || p.category === selectedCategory) &&
    (!selectedMode || p.mode === selectedMode)
  ) || [];
  
  const requiresZip = selectedMode && presetsData?.modes[selectedMode]?.requiresZip;

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
      category: "",
      mode: "",
      presetId: "",
      domains: ["platform", "api", "web"],
      uploadedFiles: [],
      uploadedContext: "",
    },
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Project ZIP upload state
  const [projectPackage, setProjectPackage] = useState<ProjectPackageStatus | null>(null);
  const [isUploadingZip, setIsUploadingZip] = useState(false);
  const [isDraggingZip, setIsDraggingZip] = useState(false);
  const zipInputRef = useRef<HTMLInputElement>(null);
  
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

  // Project ZIP upload handlers
  const uploadProjectZip = async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a ZIP file",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingZip(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/v1/project-packages", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Upload failed");
      }

      const data = await response.json();
      setProjectPackage({
        id: data.packageId,
        filename: file.name,
        sizeBytes: file.size,
        scanState: "queued",
        indexState: "queued",
      });
      
      toast({
        title: "ZIP uploaded",
        description: "Scanning and indexing your project...",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload ZIP",
        variant: "destructive",
      });
    } finally {
      setIsUploadingZip(false);
    }
  };

  const handleZipDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingZip(false);
    if (e.dataTransfer.files.length > 0) {
      uploadProjectZip(e.dataTransfer.files[0]);
    }
  }, []);

  const handleZipDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingZip(true);
  }, []);

  const handleZipDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingZip(false);
  }, []);

  const removeProjectPackage = () => {
    setProjectPackage(null);
  };

  // Poll for project package status
  useEffect(() => {
    if (!projectPackage?.id) return;
    if (projectPackage.indexState === "indexed" || projectPackage.indexState === "failed") return;
    if (projectPackage.scanState === "failed") return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/v1/project-packages/${projectPackage.id}`);
        if (!response.ok) return;
        
        const data = await response.json();
        setProjectPackage(prev => prev ? {
          ...prev,
          scanState: data.scanState,
          indexState: data.indexState,
          summaryJson: data.summaryJson,
          warningsJson: data.warningsJson,
          errorCode: data.errorCode,
          errorMessage: data.errorMessage,
        } : null);

        if (data.indexState === "indexed") {
          toast({
            title: "Project indexed",
            description: `Detected: ${data.summaryJson?.framework || "Unknown framework"}`,
          });
        } else if (data.indexState === "failed" || data.scanState === "failed") {
          toast({
            title: "Indexing failed",
            description: data.errorMessage || "Could not analyze project",
            variant: "destructive",
          });
        }
      } catch {
        // Silent fail on poll errors
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [projectPackage?.id, projectPackage?.indexState, projectPackage?.scanState, toast]);

  const isPackageReady = projectPackage?.scanState === "scanned" && projectPackage?.indexState === "indexed";
  const isPackageProcessing = projectPackage && !isPackageReady && 
    projectPackage.scanState !== "failed" && projectPackage.indexState !== "failed";

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
    mutationFn: async (data: ProjectFormData & { projectPackageId?: string }) => {
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
    const payload: ProjectFormData & { projectPackageId?: string } = { ...data };
    if (projectPackage?.id && isPackageReady) {
      payload.projectPackageId = projectPackage.id;
    }
    await createAssemblyMutation.mutateAsync(payload);
    form.reset();
    setCurrentStep("basics");
    setProjectPackage(null);
  };
  
  const onWizardSubmit = async () => {
    if (!selectedPreset || !selectedCategory || !selectedMode) return;
    
    // Map wizard draft to API request format
    const request = mapDraftToCreateAssemblyRequest({
      draft: wizardDraft,
      category: selectedCategory as Category,
      mode: selectedMode as Mode,
      presetId: selectedPreset.id,
      domains: selectedPreset.defaultDomains,
      projectPackageId: projectPackage?.id && isPackageReady ? projectPackage.id : undefined
    });
    
    await createAssemblyMutation.mutateAsync(request as any);
    setWizardDraft(makeEmptyDraft());
    setWizardFlow(null);
    setWizardStepIndex(0);
    setProjectPackage(null);
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
    setCurrentStep("type");
    setSelectedCategory(null);
    setSelectedMode(null);
    setSelectedPreset(null);
    setProjectPackage(null);
  };
  
  // Apply preset defaults when a preset is selected
  const applyPresetDefaults = (preset: Preset) => {
    setSelectedPreset(preset);
    form.setValue("category", preset.category);
    form.setValue("mode", preset.mode);
    form.setValue("presetId", preset.id);
    form.setValue("domains", preset.defaultDomains);
    
    // Apply tech stack defaults if available
    if (preset.defaults.techStack) {
      const techStack = preset.defaults.techStack;
      if (techStack.frontend && techStack.frontend !== "UNKNOWN" && techStack.frontend !== "DETECT_FROM_ZIP") {
        form.setValue("techStack.frontend", techStack.frontend);
      }
      if (techStack.backend && techStack.backend !== "UNKNOWN" && techStack.backend !== "DETECT_FROM_ZIP") {
        form.setValue("techStack.backend", techStack.backend);
      }
      if (techStack.database && techStack.database !== "UNKNOWN") {
        form.setValue("techStack.database", techStack.database);
      }
    }
    
    // Build the wizard flow and apply defaults to draft
    const category = preset.category as Category;
    const mode = preset.mode as Mode;
    const flow = getFlow(category, mode);
    setWizardFlow(flow);
    
    // Reset wizard draft with preset defaults
    const newDraft = applyWizardPresetDefaults(makeEmptyDraft(), preset.defaults);
    setWizardDraft(newDraft);
    setWizardStepIndex(0);
    
    // Auto-advance to Basics tab after preset selection
    setCurrentStep("basics");
  };

  // Get step ID from tab config - directly mapped now
  const getStepIdForTab = useCallback((tabId: string): string => {
    const tab = currentTabs.find(t => t.id === tabId);
    return tab?.stepId || tabId;
  }, [currentTabs]);

  // Navigation using currentTabs (skips disabled tabs)
  const goNext = useCallback(() => {
    const currentIdx = currentTabs.findIndex(t => t.id === currentStep);
    if (currentIdx < 0) return;

    for (let i = currentIdx + 1; i < currentTabs.length; i++) {
      const nextId = currentTabs[i].id;
      // For goNext, we allow navigating to the next tab even if prior isn't valid
      // because user is moving forward linearly
      setCurrentStep(nextId);
      return;
    }
  }, [currentTabs, currentStep]);

  const goPrev = useCallback(() => {
    const currentIdx = currentTabs.findIndex(t => t.id === currentStep);
    if (currentIdx < 0) return;

    for (let i = currentIdx - 1; i >= 0; i--) {
      const prevId = currentTabs[i].id;
      // Always allow going back
      setCurrentStep(prevId);
      return;
    }
  }, [currentTabs, currentStep]);

  // --- Sync: Tabs (currentStep) <-> Wizard step index (wizardStepIndex) ---

  // Map tab.id -> wizard step index using tab.stepId
  const tabToWizardIndex = useMemo(() => {
    if (!wizardFlow) return new Map<string, number>();

    const map = new Map<string, number>();
    for (const tab of currentTabs) {
      const stepId = tab.stepId || tab.id;
      const idx = wizardFlow.steps.findIndex(s => s.id === stepId);
      if (idx >= 0) map.set(tab.id, idx);
    }
    return map;
  }, [wizardFlow, currentTabs]);

  // 1) When tab changes, update wizardStepIndex to match the tab's step
  useEffect(() => {
    if (!wizardFlow) return;

    const idx = tabToWizardIndex.get(currentStep);

    // If tab has no mapped step (e.g., "type"), leave wizardStepIndex as-is
    if (typeof idx !== "number") return;

    if (idx !== wizardStepIndex) {
      setWizardStepIndex(idx);
    }
  }, [currentStep, wizardFlow, tabToWizardIndex, wizardStepIndex]);

  // 2) When wizardStepIndex changes (if wizard navigates internally),
  // update the tab so the top nav always matches the wizard's current step.
  // Note: We use a ref to track the last synced index and respect manual "type" navigation.
  const lastWizardStepIndex = useRef(wizardStepIndex);
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;
  
  useEffect(() => {
    if (!wizardFlow) return;
    
    // Don't override if user manually navigated to "type" (escape hatch)
    if (currentStepRef.current === "type") return;
    
    // Only sync when wizardStepIndex actually changed
    if (lastWizardStepIndex.current === wizardStepIndex) return;
    lastWizardStepIndex.current = wizardStepIndex;

    const stepId = wizardFlow.steps[wizardStepIndex]?.id;
    if (!stepId) return;

    const owningTab = currentTabs.find(t => (t.stepId || t.id) === stepId);
    if (!owningTab) return;

    setCurrentStep(owningTab.id);
  }, [wizardStepIndex, wizardFlow, currentTabs]);

  // --- Step Validation Helpers ---

  const getByPath = useCallback((obj: any, path: string) => {
    return path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
  }, []);

  const isNonEmptyString = useCallback((v: any) => {
    return typeof v === "string" && v.trim().length > 0;
  }, []);

  const isArrayWithMin1 = useCallback((v: any) => {
    return Array.isArray(v) && v.length > 0;
  }, []);

  const shouldValidateField = useCallback((draft: any, field: { dependsOn?: { key: string; equals: any } }) => {
    if (!field.dependsOn) return true;
    const depVal = getByPath(draft, field.dependsOn.key);
    return depVal === field.dependsOn.equals;
  }, [getByPath]);

  /**
   * Validates required fields for a given WizardStep.
   * Note: file_zip is handled outside via isPackageReady gating.
   */
  const validateStep = useCallback((draft: any, step: any) => {
    for (const group of step.fieldGroups || []) {
      for (const field of group.fields || []) {
        if (!field.required) continue;
        if (!shouldValidateField(draft, field)) continue;

        const v = getByPath(draft, field.key);

        switch (field.ui) {
          case "text":
          case "textarea": {
            if (!isNonEmptyString(v)) return false;
            break;
          }
          case "select": {
            if (!isNonEmptyString(v)) return false;
            if (Array.isArray(field.options) && field.options.length > 0) {
              if (!field.options.includes(v)) return false;
            }
            break;
          }
          case "toggle": {
            if (typeof v !== "boolean") return false;
            break;
          }
          case "chips":
          case "list": {
            if (!isArrayWithMin1(v)) return false;
            break;
          }
          case "file_docs": {
            if (!isArrayWithMin1(v)) return false;
            break;
          }
          case "file_zip": {
            // handled via isPackageReady gate; do not fail here
            break;
          }
          default:
            break;
        }
      }
    }
    return true;
  }, [getByPath, isNonEmptyString, isArrayWithMin1, shouldValidateField]);

  // --- Tab Gating ---

  const canEnterTab = useCallback(
    (tabId: string) => {
      if (tabId === "type") return true;
      if (!wizardFlow) return false;

      const targetPos = currentTabs.findIndex(t => t.id === tabId);
      if (targetPos < 0) return false;

      for (let i = 0; i < targetPos; i++) {
        const priorTab = currentTabs[i];
        if (priorTab.id === "type") continue;

        const priorStepId = priorTab.stepId || priorTab.id;
        const priorStep = wizardFlow.steps.find(s => s.id === priorStepId);
        if (!priorStep) continue;

        const requiresZip = priorStep.fieldGroups
          .flatMap((g: any) => g.fields)
          .some((f: any) => f.ui === "file_zip" && f.required);

        if (requiresZip && !isPackageReady) return false;

        if (!validateStep(wizardDraft, priorStep)) return false;
      }

      return true;
    },
    [wizardFlow, currentTabs, wizardDraft, isPackageReady, validateStep]
  );

  const getTabBlockReason = useCallback(
    (tabId: string): string | null => {
      if (tabId === "type") return null;
      if (!wizardFlow) return "Select a preset first";

      const targetPos = currentTabs.findIndex(t => t.id === tabId);
      if (targetPos < 0) return null;

      for (let i = 0; i < targetPos; i++) {
        const priorTab = currentTabs[i];
        if (priorTab.id === "type") continue;

        const priorStepId = priorTab.stepId || priorTab.id;
        const priorStep = wizardFlow.steps.find(s => s.id === priorStepId);
        if (!priorStep) continue;

        const requiresZip = priorStep.fieldGroups
          .flatMap((g: any) => g.fields)
          .some((f: any) => f.ui === "file_zip" && f.required);

        if (requiresZip && !isPackageReady) return `Complete: ${priorTab.label} (upload required)`;

        if (!validateStep(wizardDraft, priorStep)) return `Complete: ${priorTab.label}`;
      }

      return null;
    },
    [wizardFlow, currentTabs, wizardDraft, isPackageReady, validateStep]
  );

  // --- Tab Progress Indicator ---
  const tabProgress = useMemo(() => {
    if (!wizardFlow) return { completed: 0, total: currentTabs.length };
    
    let completed = 0;
    for (const tab of currentTabs) {
      if (tab.id === "type") {
        // Type is always "complete" once preset is selected
        if (wizardFlow) completed++;
        continue;
      }
      
      const stepId = tab.stepId || tab.id;
      const step = wizardFlow.steps.find(s => s.id === stepId);
      if (!step) continue;
      
      if (validateStep(wizardDraft, step)) {
        completed++;
      }
    }
    
    return { completed, total: currentTabs.length };
  }, [wizardFlow, currentTabs, wizardDraft, validateStep]);

  // Get the next available tab for button labels
  const getNextTabLabel = useCallback((): string | null => {
    const currentIdx = currentTabs.findIndex(t => t.id === currentStep);
    if (currentIdx < currentTabs.length - 1) {
      return currentTabs[currentIdx + 1].label;
    }
    return null;
  }, [currentStep, currentTabs]);

  // Check if current step is the last step (preview/generate)
  const isLastStep = useCallback((): boolean => {
    const currentIdx = currentTabs.findIndex(t => t.id === currentStep);
    return currentIdx === currentTabs.length - 1;
  }, [currentTabs, currentStep]);

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

      {!activeAssemblyId && !useSimpleMode && !wizardFlow && (
        <Stepper
          steps={currentTabs.map(t => ({ id: t.id, label: t.label }))}
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
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
                      className="w-full btn-axiom-cta"
                      disabled={createAssemblyMutation.isPending || (!!projectPackage && !isPackageReady)}
                      data-testid="button-generate"
                    >
                      {createAssemblyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : projectPackage && !isPackageReady ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Waiting for project indexing...
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
                    <Tabs 
                      value={currentStep} 
                      onValueChange={(next) => {
                        // "type" tab is always accessible (escape hatch)
                        if (next === "type" || canEnterTab(next)) {
                          setCurrentStep(next);
                        }
                      }} 
                      className="w-full"
                    >
                      {/* Progress indicator */}
                      {wizardFlow && (
                        <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                          <span>Step {currentTabs.findIndex(t => t.id === currentStep) + 1} of {currentTabs.length}</span>
                          <span>{tabProgress.completed}/{tabProgress.total} complete</span>
                        </div>
                      )}
                      <TabsList 
                        className="grid w-full mb-6" 
                        style={{ gridTemplateColumns: `repeat(${currentTabs.length}, minmax(0, 1fr))` }}
                      >
                        {currentTabs.map((tab) => {
                          const reason = getTabBlockReason(tab.id);
                          const isDisabled = !!reason;
                          return (
                            <TabsTrigger 
                              key={tab.id} 
                              value={tab.id} 
                              data-testid={`tab-${tab.id}`}
                              disabled={isDisabled}
                              title={reason ?? ""}
                              className={isDisabled ? "opacity-50 cursor-not-allowed" : undefined}
                            >
                              <TabIcon icon={tab.icon} />
                              {tab.label}
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>

                      {/* Step 0: Category + Mode + Preset Selection */}
                      <TabsContent value="type" className="space-y-6">
                        {/* Category Selection */}
                        <div className="space-y-3">
                          <FormLabel className="text-base font-semibold">What are you building?</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {presetsData?.categories && Object.entries(presetsData.categories).map(([key, info]) => (
                              <button
                                type="button"
                                key={key}
                                onClick={() => {
                                  setSelectedCategory(key as AssemblyCategory);
                                  setSelectedPreset(null);
                                  form.setValue("category", key);
                                }}
                                className={`p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                                  selectedCategory === key 
                                    ? "border-amber-500 bg-amber-500/10" 
                                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                                }`}
                                data-testid={`category-${key}`}
                              >
                                <div className={`mb-2 ${selectedCategory === key ? "text-amber-500" : "text-muted-foreground"}`}>
                                  <CategoryIcon icon={info.icon} />
                                </div>
                                <div className="font-medium">{info.label}</div>
                                <div className="text-xs text-muted-foreground">{info.description}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Mode Selection */}
                        {selectedCategory && (
                          <div className="space-y-3">
                            <FormLabel className="text-base font-semibold">What kind of work?</FormLabel>
                            <div className="flex flex-wrap gap-2">
                              {presetsData?.modes && Object.entries(presetsData.modes).map(([key, info]) => (
                                <Button
                                  type="button"
                                  key={key}
                                  variant={selectedMode === key ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMode(key as AssemblyMode);
                                    setSelectedPreset(null);
                                    form.setValue("mode", key);
                                  }}
                                  className={selectedMode === key ? "bg-amber-500" : ""}
                                  data-testid={`mode-${key}`}
                                >
                                  {info.label}
                                  {info.requiresZip && (
                                    <Badge variant="secondary" className="ml-2 text-xs">ZIP</Badge>
                                  )}
                                </Button>
                              ))}
                            </div>
                            {requiresZip && (
                              <p className="text-xs text-amber-500">
                                This mode requires uploading your existing project as a ZIP file.
                              </p>
                            )}
                          </div>
                        )}

                        {/* Preset Selection */}
                        {selectedCategory && selectedMode && (
                          <div className="space-y-3">
                            <FormLabel className="text-base font-semibold">Select a starting template</FormLabel>
                            {filteredPresets.length > 0 ? (
                              <div className="space-y-2">
                                {filteredPresets.map(preset => (
                                  <button
                                    type="button"
                                    key={preset.id}
                                    onClick={() => applyPresetDefaults(preset)}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                                      selectedPreset?.id === preset.id 
                                        ? "border-amber-500 bg-amber-500/10" 
                                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                                    }`}
                                    data-testid={`preset-${preset.id}`}
                                  >
                                    <div className="font-medium">{preset.label}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Domains: {preset.defaultDomains.join(", ")}
                                    </div>
                                    {preset.defaults.goals && preset.defaults.goals.length > 0 && (
                                      <div className="text-xs text-muted-foreground mt-2">
                                        <span className="font-medium">Goals:</span> {preset.defaults.goals.slice(0, 2).join("; ")}
                                        {preset.defaults.goals.length > 2 && "..."}
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No presets available for this combination yet.
                              </p>
                            )}
                          </div>
                        )}

                        {/* Navigation - preset already triggers auto-advance to Basics */}
                        {!selectedPreset && (
                          <div className="flex justify-end pt-4">
                            <Button
                              type="button"
                              disabled
                              className="btn-axiom-cta opacity-50"
                              data-testid="button-next-type"
                            >
                              Select a template to continue
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TabsContent>

                      {/* Dynamic TabsContent for all non-type tabs */}
                      {currentTabs.filter(tab => tab.id !== "type").map((tab, idx) => {
                        const isPreviewTab = tab.id === "preview";
                        const tabIdx = currentTabs.findIndex(t => t.id === tab.id);
                        
                        return (
                          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                            {wizardFlow ? (
                              <>
                                <DynamicWizard
                                  flow={wizardFlow}
                                  draft={wizardDraft}
                                  onDraftChange={setWizardDraft}
                                  currentStepIndex={wizardStepIndex}
                                  onStepChange={setWizardStepIndex}
                                  projectPackage={projectPackage ? {
                                    id: projectPackage.id,
                                    filename: projectPackage.filename,
                                    sizeBytes: projectPackage.sizeBytes,
                                    scanState: projectPackage.scanState as "queued" | "scanning" | "scanned" | "failed",
                                    indexState: projectPackage.indexState as "queued" | "indexing" | "indexed" | "failed",
                                    summaryJson: projectPackage.summaryJson ? {
                                      framework: projectPackage.summaryJson.framework,
                                      packageManager: projectPackage.summaryJson.packageManager,
                                      fileCount: projectPackage.summaryJson.fileCount,
                                      hasTypeScript: projectPackage.summaryJson.hasTypeScript,
                                      scripts: projectPackage.summaryJson.scripts
                                    } : null,
                                    warningsJson: projectPackage.warningsJson?.map(w => ({ code: w.code, message: w.message })) || null,
                                    errorCode: projectPackage.errorCode,
                                    errorMessage: projectPackage.errorMessage
                                  } : null}
                                  onProjectPackageUpload={uploadProjectZip}
                                  onProjectPackageRemove={removeProjectPackage}
                                  isPackageProcessing={!!isPackageProcessing}
                                  isPackageReady={isPackageReady}
                                  mode={selectedMode as Mode}
                                  onSubmit={onWizardSubmit}
                                  isSubmitting={createAssemblyMutation.isPending}
                                  activeStepId={getStepIdForTab(tab.id)}
                                  hideInternalNav
                                />
                                <div className="flex justify-between pt-4 border-t">
                                  <Button type="button" variant="outline" onClick={goPrev} data-testid={`button-prev-${tab.id}`}>
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                  </Button>
                                  {isPreviewTab ? (
                                    <Button
                                      type="button"
                                      className="btn-axiom-cta"
                                      disabled={
                                        createAssemblyMutation.isPending || 
                                        (!!projectPackage && !isPackageReady) ||
                                        (!!requiresZip && !projectPackage)
                                      }
                                      onClick={() => onWizardSubmit()}
                                      data-testid="button-generate"
                                    >
                                      {createAssemblyMutation.isPending ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Starting...
                                        </>
                                      ) : projectPackage && !isPackageReady ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Waiting for project indexing...
                                        </>
                                      ) : requiresZip && !projectPackage ? (
                                        <>
                                          <AlertTriangle className="mr-2 h-4 w-4" />
                                          ZIP Required
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="mr-2 h-4 w-4" />
                                          Generate Kit
                                        </>
                                      )}
                                    </Button>
                                  ) : (
                                    <Button type="button" onClick={goNext} data-testid={`button-next-${tab.id}`} className="btn-axiom-cta">
                                      Next: {currentTabs[tabIdx + 1]?.label || "Next"} <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </>
                            ) : (
                              <p className="text-muted-foreground text-center py-8">Select a preset from the Type tab to continue.</p>
                            )}
                          </TabsContent>
                        );
                      })}
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
                  <Button variant="outline" size="sm" onClick={handleNewAssembly} data-testid="button-new-assembly-reset">
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
