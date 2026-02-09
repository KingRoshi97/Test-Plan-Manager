import { useState, useRef, useEffect, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { stepLabel } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PipelineRun } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Play,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Circle,
  Clock,
  ChevronDown,
  ChevronRight,
  Terminal,
  RotateCcw,
  FileInput,
  GitCompare,
  RefreshCw,
  Rocket,
  Trash2,
  BarChart3,
  Sparkles,
  MessageSquare,
  Send,
  CheckCheck,
  Layers,
  ArrowUpCircle,
  Paperclip,
  X,
  FileArchive,
  FolderOpen,
  Folder,
  FileText,
  File,
  Timer,
  Activity,
  Pencil,
  Save,
  Eye,
  Target,
  Users,
  Lightbulb,
  Settings2,
  Box,
  Search,
  ScrollText,
  Wrench,
  LayoutGrid,
} from "lucide-react";

interface AssemblyProgress {
  currentIndex?: number;
  totalSteps?: number;
  steps?: string[];
  status?: string;
  stagePlanId?: string;
  stagePlanLabel?: string;
}

interface EnrichedAssembly {
  id: string;
  projectName: string | null;
  idea: string | null;
  context: string | null;
  input: Record<string, string> | null;
  preset: string | null;
  presetId: string | null;
  state: string;
  step: string | null;
  progress: AssemblyProgress | null;
  errors: string[] | null;
  createdAt: string;
  updatedAt: string;
  wsExists: boolean;
  hasRegistry: boolean;
  hasDomains: boolean;
  hasApp: boolean;
  verifyStatus: string | null;
  lockEligible: boolean;
  revision: number;
  upgradeNotes: string | null;
  kitType: string;
  lastRunAt: string | null;
  totalRuns: number;
  completedSteps: number;
  totalDuration: number;
}

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  size?: number;
}

interface ModuleStatusData {
  projectName: string;
  modules: Record<string, Record<string, string>>;
  stages: string[];
  registryFiles: Record<string, boolean>;
}

interface StagePlanConfig {
  label: string;
  description: string;
  steps: string[];
}

interface PresetsData {
  stage_plans: Record<string, StagePlanConfig | string[]>;
  presets: Record<string, {
    label: string;
    description: string;
    modules: string[];
    include_dependencies?: boolean;
    recommended_stage_plan?: string;
    guards?: Record<string, boolean>;
  }>;
}


interface StepProgress {
  index: number;
  stepId: string;
  label: string;
  status: "pending" | "running" | "success" | "error" | "skipped";
  durationMs?: number;
  reason?: string;
}

function getStagePlanLabel(key: string, plan: StagePlanConfig | string[]): string {
  if (!Array.isArray(plan) && plan.label) return plan.label;
  return key;
}

function getStagePlanSteps(plan: StagePlanConfig | string[]): string[] {
  if (Array.isArray(plan)) return plan;
  return plan.steps || [];
}

function getStateBadgeVariant(state: string) {
  switch (state) {
    case "queued": return "secondary" as const;
    case "running": return "default" as const;
    case "completed": return "success" as const;
    case "failed": return "error" as const;
    case "exported": return "outline" as const;
    default: return "secondary" as const;
  }
}

function getStateBadgeClassName(state: string) {
  if (state === "running") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-transparent";
  if (state === "exported") return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-transparent";
  return "";
}

function getModuleStatusColor(status: string) {
  switch (status) {
    case "done": return "bg-green-500";
    case "partial": return "bg-yellow-500";
    case "error": return "bg-red-500";
    default: return "bg-gray-300 dark:bg-gray-600";
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const sec = (ms / 1000).toFixed(1);
  return `${sec}s`;
}

function formatRelativeTime(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function formatInputLabel(key: string): string {
  const labels: Record<string, string> = {
    visionProblem: "Problem Statement",
    visionTargetUsers: "Target Users",
    visionSuccess: "Success Criteria",
    visionGoals: "Goals",
    coreFeatures: "Core Features",
    niceToHaveFeatures: "Nice-to-Have Features",
    coreEntities: "Core Entities",
    userJourneys: "User Journeys",
    platform: "Platform",
    integrations: "Integrations",
    techConstraints: "Technical Constraints",
    dataSensitivity: "Data Sensitivity",
  };
  return labels[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
}

function getInputFieldInfo(key: string): { icon: typeof Lightbulb; label: string } {
  const map: Record<string, { icon: typeof Lightbulb; label: string }> = {
    visionProblem: { icon: Target, label: "Problem" },
    visionTargetUsers: { icon: Users, label: "Target Users" },
    visionSuccess: { icon: CheckCircle2, label: "Success Criteria" },
    visionGoals: { icon: Lightbulb, label: "Goals" },
    coreFeatures: { icon: Box, label: "Core Features" },
    niceToHaveFeatures: { icon: Sparkles, label: "Nice-to-Have" },
    coreEntities: { icon: Layers, label: "Core Entities" },
    userJourneys: { icon: Activity, label: "User Journeys" },
    platform: { icon: Settings2, label: "Platform" },
    integrations: { icon: GitCompare, label: "Integrations" },
    techConstraints: { icon: Settings2, label: "Constraints" },
    dataSensitivity: { icon: Eye, label: "Data Sensitivity" },
  };
  return map[key] || { icon: FileText, label: formatInputLabel(key) };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
}

function FileTreeItem({
  node,
  depth,
  expandedDirs,
  onToggle,
}: {
  node: FileTreeNode;
  depth: number;
  expandedDirs: Set<string>;
  onToggle: (path: string) => void;
}) {
  const isDir = node.type === "directory";
  const isExpanded = expandedDirs.has(node.path);

  return (
    <div>
      <button
        className="flex items-center gap-1.5 w-full text-left py-0.5 hover-elevate rounded-md px-1"
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => isDir && onToggle(node.path)}
        data-testid={`tree-node-${node.path}`}
      >
        {isDir ? (
          isExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
        ) : (
          <span className="w-3" />
        )}
        {isDir ? (
          isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        ) : (
          <File className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
        <span className="truncate text-xs">{node.name}</span>
        {!isDir && node.size != null && (
          <span className="text-[10px] text-muted-foreground/60 ml-auto shrink-0">{formatFileSize(node.size)}</span>
        )}
      </button>
      {isDir && isExpanded && node.children?.map(child => (
        <FileTreeItem key={child.path} node={child} depth={depth + 1} expandedDirs={expandedDirs} onToggle={onToggle} />
      ))}
    </div>
  );
}

const STAGES = ["generate", "seed", "draft", "review", "verify", "lock"];
const STAGE_SHORT_LABELS: Record<string, string> = {
  generate: "Gen",
  seed: "Seed",
  draft: "Draft",
  review: "Rev",
  verify: "Ver",
  lock: "Lock",
};

export default function AssemblyPage() {
  const [, params] = useRoute("/assembly/:id");
  const assemblyId = params?.id;
  const [, navigate] = useLocation();

  const [selectedStagePlan, setSelectedStagePlan] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [stepProgress, setStepProgress] = useState<StepProgress[]>([]);
  const [streamOutput, setStreamOutput] = useState("");
  const [activePlanLabel, setActivePlanLabel] = useState<string>("");
  const [forceShowSelector, setForceShowSelector] = useState(false);
  const [importSourcePath, setImportSourcePath] = useState("");
  const [reviseMode, setReviseMode] = useState(false);
  const [reviseTarget, setReviseTarget] = useState<{
    file: string; relativePath: string; module: string; docType: string;
    docTypeLabel: string; priority: number; unknownCount: number;
    sections: { name: string; unknownCount: number; snippet: string }[];
  } | null>(null);
  const [reviseQuestions, setReviseQuestions] = useState<{ sectionName: string; questions: string[] }[]>([]);
  const [reviseAnswers, setReviseAnswers] = useState<Record<string, string>>({});
  const [reviseLoading, setReviseLoading] = useState(false);
  const [reviseFilling, setReviseFilling] = useState(false);
  const [reviseStats, setReviseStats] = useState<{ remaining: number; files: number } | null>(null);
  const [reviseLog, setReviseLog] = useState<string[]>([]);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [upgradeNotesInput, setUpgradeNotesInput] = useState("");
  const [upgradeZipUploading, setUpgradeZipUploading] = useState(false);
  const [upgradeZipFileName, setUpgradeZipFileName] = useState<string | null>(null);
  const [upgradeZipFileCount, setUpgradeZipFileCount] = useState(0);
  const [upgradeZipContent, setUpgradeZipContent] = useState("");
  const upgradeZipInputRef = useRef<HTMLInputElement>(null);
  const [showOverview, setShowOverview] = useState(true);
  const [editingDetails, setEditingDetails] = useState(false);
  const [editIdea, setEditIdea] = useState("");
  const [editInput, setEditInput] = useState<Record<string, string>>({});
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "workspace" | "actions">("overview");
  const [expandedLogRuns, setExpandedLogRuns] = useState<Set<number>>(new Set());
  const [logSearchQuery, setLogSearchQuery] = useState("");

  async function handleUpgradeZipUpload(file: File) {
    setUpgradeZipUploading(true);
    try {
      const formData = new FormData();
      formData.append('zipfile', file);
      const resp = await fetch('/api/upload-context-zip', { method: 'POST', body: formData });
      const data = await resp.json();
      if (!resp.ok) {
        toast({ title: "Upload failed", description: data.error || "Could not process zip file", variant: "destructive" });
        return;
      }
      setUpgradeZipContent(data.content);
      const existing = upgradeNotesInput.trim();
      setUpgradeNotesInput(existing ? `${existing}\n\n${data.content}` : data.content);
      setUpgradeZipFileName(file.name);
      setUpgradeZipFileCount(data.fileCount);
      toast({ title: "Context loaded", description: `${data.fileCount} files extracted from ${file.name}` });
    } catch (err: any) {
      toast({ title: "Upload error", description: err.message, variant: "destructive" });
    } finally {
      setUpgradeZipUploading(false);
      if (upgradeZipInputRef.current) upgradeZipInputRef.current.value = '';
    }
  }

  function clearUpgradeZipContext() {
    if (upgradeZipContent) {
      setUpgradeNotesInput((prev) => prev.replace(upgradeZipContent, '').trim());
    }
    setUpgradeZipFileName(null);
    setUpgradeZipFileCount(0);
    setUpgradeZipContent("");
  }
  const terminalRef = useRef<HTMLPreElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { data: assembly, isLoading: assemblyLoading } = useQuery<EnrichedAssembly>({
    queryKey: ["/api/assemblies", assemblyId],
    queryFn: async () => {
      const res = await fetch(`/api/assemblies/${assemblyId}`);
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
    enabled: !!assemblyId,
    refetchInterval: isRunning ? 5000 : false,
  });

  useEffect(() => {
    if ((activeTab === "workspace" || activeTab === "actions") && assembly && !assembly.wsExists) {
      setActiveTab("overview");
    }
  }, [activeTab, assembly]);

  const { data: moduleStatus } = useQuery<ModuleStatusData>({
    queryKey: ["/api/status", assembly?.projectName],
    queryFn: async () => {
      const res = await fetch(`/api/status/${encodeURIComponent(assembly!.projectName!)}`);
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
    enabled: !!assembly?.projectName,
  });

  const { data: presetsData } = useQuery<PresetsData>({
    queryKey: ["/api/presets"],
    queryFn: async () => {
      const res = await fetch("/api/presets");
      if (!res.ok) return null;
      return res.json();
    },
  });


  const { data: activityRuns = [] } = useQuery<PipelineRun[]>({
    queryKey: ["/api/pipeline-runs", assembly?.projectName, "activity"],
    queryFn: async () => {
      const res = await fetch(`/api/pipeline-runs?projectName=${encodeURIComponent(assembly!.projectName!)}&limit=50`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!assembly?.projectName,
  });

  const { data: fileTree } = useQuery<FileTreeNode[]>({
    queryKey: ["/api/workspace-tree", assembly?.projectName],
    queryFn: async () => {
      const res = await fetch(`/api/workspace-tree/${encodeURIComponent(assembly!.projectName!)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.tree || [];
    },
    enabled: !!assembly?.projectName && assembly?.wsExists && activeTab === "workspace",
  });

  const updateDetailsMutation = useMutation({
    mutationFn: async (data: { idea?: string; input?: Record<string, string> }) => {
      return apiRequest(`/api/assemblies/${assemblyId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({ title: "Assembly details updated" });
      setEditingDetails(false);
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies", assemblyId] });
    },
    onError: () => {
      toast({ title: "Failed to update details", variant: "destructive" });
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => apiRequest(`/api/assemblies/${assemblyId}/export`, { method: "POST" }),
    onSuccess: () => {
      toast({ title: "Export completed", description: "Kit has been exported successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies", assemblyId] });
    },
    onError: () => {
      toast({ title: "Export failed", variant: "destructive" });
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: async (notes: string) => {
      const res = await apiRequest(`/api/assemblies/${assemblyId}/upgrade`, {
        method: "POST",
        body: JSON.stringify({ upgradeNotes: notes }),
        headers: { "Content-Type": "application/json" },
      });
      return res;
    },
    onSuccess: () => {
      toast({ title: "Upgrade layer created", description: "Assembly is ready for a new pipeline run." });
      setShowUpgradeForm(false);
      setUpgradeNotesInput("");
      setStepProgress([]);
      setStreamOutput("");
      setForceShowSelector(true);
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies", assemblyId] });
    },
    onError: () => {
      toast({ title: "Failed to create upgrade layer", variant: "destructive" });
    },
  });

  const runSingleStep = useMutation({
    mutationFn: async (params: { stepId: string; body?: Record<string, unknown> }) => {
      const res = await apiRequest(`/api/pipeline/${params.stepId}`, {
        method: "POST",
        body: JSON.stringify({ projectName: assembly?.projectName, ...params.body }),
        headers: { "Content-Type": "application/json" },
      });
      return res;
    },
    onSuccess: (_data, variables) => {
      toast({ title: `${stepLabel(variables.stepId)} completed` });
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies", assemblyId] });
      queryClient.invalidateQueries({ queryKey: ["/api/status", assembly?.projectName] });
      queryClient.invalidateQueries({ queryKey: ["/api/pipeline-runs", assembly?.projectName] });
    },
    onError: (_err, variables) => {
      toast({ title: `${stepLabel(variables.stepId)} failed`, variant: "destructive" });
    },
  });

  const startRevise = async () => {
    if (!assembly?.projectName) return;
    setReviseMode(true);
    setReviseLoading(true);
    setReviseLog([]);
    setReviseAnswers({});
    try {
      const res = await fetch('/api/revise-unknowns/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: assembly.projectName }),
      });
      const data = await res.json();
      if (data.done) {
        setReviseTarget(null);
        setReviseQuestions([]);
        setReviseStats({ remaining: 0, files: 0 });
        setReviseLog(prev => [...prev, 'All UNKNOWNs have been resolved.']);
      } else {
        setReviseTarget(data.target);
        setReviseQuestions(data.questions);
        setReviseStats({ remaining: data.remainingUnknowns, files: data.totalFilesWithUnknowns });
        const initAnswers: Record<string, string> = {};
        data.questions.forEach((q: { sectionName: string; questions: string[] }, gi: number) => {
          q.questions.forEach((_: string, qi: number) => { initAnswers[`${gi}-${qi}`] = ''; });
        });
        setReviseAnswers(initAnswers);
      }
    } catch (err) {
      toast({ title: 'Failed to start revision', variant: 'destructive' });
      setReviseMode(false);
    } finally {
      setReviseLoading(false);
    }
  };

  const buildSectionAnswers = (): Record<string, string> => {
    const sectionAnswers: Record<string, string> = {};
    reviseQuestions.forEach((qGroup, gi) => {
      const parts: string[] = [];
      qGroup.questions.forEach((q: string, qi: number) => {
        const answer = (reviseAnswers[`${gi}-${qi}`] || '').trim();
        if (answer) {
          parts.push(`Q: ${q}\nA: ${answer}`);
        }
      });
      if (parts.length > 0) {
        sectionAnswers[qGroup.sectionName] = parts.join('\n\n');
      }
    });
    return sectionAnswers;
  };

  const submitReviseAnswers = async () => {
    if (!assembly?.projectName || !reviseTarget) return;
    setReviseFilling(true);
    setReviseLog(prev => [...prev, `Filling ${reviseTarget.docTypeLabel} (${reviseTarget.module})...`]);
    try {
      const res = await fetch('/api/revise-unknowns/fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: assembly.projectName,
          targetFile: reviseTarget.file,
          targetModule: reviseTarget.module,
          answers: buildSectionAnswers(),
        }),
      });
      const data = await res.json();
      const filled = data.targetFilled;
      setReviseLog(prev => [
        ...prev,
        `Filled ${filled.file.split('/').pop()}: ${filled.unknownsBefore} → ${filled.unknownsAfter} UNKNOWNs`,
        `Cascade pass: ${data.cascadeResults.filter((r: { status: string }) => r.status === 'filled').length} additional files updated`,
        `Remaining: ${data.remainingScan.totalUnknowns} UNKNOWNs in ${data.remainingScan.filesWithUnknowns.length} files`,
      ]);

      if (data.done || !data.nextTarget) {
        setReviseTarget(null);
        setReviseQuestions([]);
        setReviseStats({ remaining: 0, files: 0 });
        setReviseLog(prev => [...prev, 'All UNKNOWNs resolved.']);
      } else {
        setReviseStats({
          remaining: data.remainingScan.totalUnknowns,
          files: data.remainingScan.filesWithUnknowns.length,
        });
        setReviseLoading(true);
        const nextRes = await fetch('/api/revise-unknowns/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectName: assembly.projectName }),
        });
        const nextData = await nextRes.json();
        if (nextData.done) {
          setReviseTarget(null);
          setReviseQuestions([]);
          setReviseStats({ remaining: 0, files: 0 });
          setReviseLog(prev => [...prev, 'All UNKNOWNs resolved.']);
        } else {
          setReviseTarget(nextData.target);
          setReviseQuestions(nextData.questions);
          const initAnswers: Record<string, string> = {};
          nextData.questions.forEach((q: { sectionName: string; questions: string[] }, gi: number) => {
            q.questions.forEach((_: string, qi: number) => { initAnswers[`${gi}-${qi}`] = ''; });
          });
          setReviseAnswers(initAnswers);
          setReviseStats({ remaining: nextData.remainingUnknowns, files: nextData.totalFilesWithUnknowns });
          setReviseLog(prev => [...prev, `Next: ${nextData.target.docTypeLabel} (${nextData.target.module})`]);
        }
        setReviseLoading(false);
      }
    } catch (err) {
      toast({ title: 'Fill failed', variant: 'destructive' });
    } finally {
      setReviseFilling(false);
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [streamOutput]);

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (assembly && !isRunning && stepProgress.length === 0 && !forceShowSelector) {
      const progress = assembly.progress as AssemblyProgress | null;
      if (progress?.stagePlanId && !selectedStagePlan) {
        setSelectedStagePlan(progress.stagePlanId);
      }
      if (progress?.stagePlanLabel && !activePlanLabel) {
        setActivePlanLabel(progress.stagePlanLabel);
      }
      if (progress?.steps && assembly.state !== "queued") {
        const totalSteps = progress.steps.length;
        const currentIdx = progress.currentIndex ?? totalSteps;
        const isCompleted = assembly.state === "completed" || assembly.state === "exported";
        const isFailed = assembly.state === "failed";

        const failedIdx = isFailed
          ? (currentIdx >= totalSteps ? totalSteps - 1 : currentIdx)
          : -1;

        setStepProgress(progress.steps.map((sid: string, idx: number) => {
          if (isCompleted) return { index: idx, stepId: sid, label: stepLabel(sid), status: "success" as const };
          if (isFailed) {
            if (idx < failedIdx) return { index: idx, stepId: sid, label: stepLabel(sid), status: "success" as const };
            if (idx === failedIdx) return { index: idx, stepId: sid, label: stepLabel(sid), status: "error" as const };
            return { index: idx, stepId: sid, label: stepLabel(sid), status: "pending" as const };
          }
          if (idx < currentIdx) return { index: idx, stepId: sid, label: stepLabel(sid), status: "success" as const };
          return { index: idx, stepId: sid, label: stepLabel(sid), status: "pending" as const };
        }));
      }
    }
  }, [assembly]);

  const stagePlans = presetsData?.stage_plans
    ? Object.entries(presetsData.stage_plans)
    : [];

  const runPipeline = (startFromStep?: string) => {
    if (!assemblyId || !selectedStagePlan || isRunning) return;

    setIsRunning(true);
    setStreamOutput("");
    setStepProgress([]);
    setForceShowSelector(false);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    let url = `/api/assemblies/${assemblyId}/run/stream?stagePlan=${encodeURIComponent(selectedStagePlan)}`;
    if (startFromStep) {
      url += `&startFromStep=${encodeURIComponent(startFromStep)}`;
    }
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("plan", (e) => {
      try {
        const data = JSON.parse(e.data);
        const steps = (data.steps as string[]).map((stepId: string, i: number) => ({
          index: i,
          stepId,
          label: stepLabel(stepId),
          status: "pending" as const,
        }));
        setStepProgress(steps);
        if (data.stagePlanLabel) {
          setActivePlanLabel(data.stagePlanLabel);
        }
      } catch {}
    });

    es.addEventListener("step-start", (e) => {
      try {
        const data = JSON.parse(e.data);
        setStepProgress((prev) =>
          prev.map((s) =>
            s.index === data.index
              ? { ...s, label: data.label || stepLabel(s.stepId), status: "running" }
              : s
          )
        );
      } catch {}
    });

    es.addEventListener("stdout", (e) => {
      try {
        const data = JSON.parse(e.data);
        setStreamOutput((prev) => prev + (data.text || e.data) + "\n");
      } catch {
        setStreamOutput((prev) => prev + e.data + "\n");
      }
    });

    es.addEventListener("stderr", (e) => {
      try {
        const data = JSON.parse(e.data);
        setStreamOutput((prev) => prev + "[stderr] " + (data.text || e.data) + "\n");
      } catch {
        setStreamOutput((prev) => prev + "[stderr] " + e.data + "\n");
      }
    });

    es.addEventListener("step-done", (e) => {
      try {
        const data = JSON.parse(e.data);
        setStepProgress((prev) =>
          prev.map((s) =>
            s.index === data.index
              ? { ...s, label: data.label || stepLabel(s.stepId), status: data.status, durationMs: data.durationMs, reason: data.reason }
              : s
          )
        );
      } catch {}
    });

    es.addEventListener("done", (e) => {
      es.close();
      eventSourceRef.current = null;
      setIsRunning(false);
      try {
        const data = JSON.parse(e.data);
        if (data.failed === 0) {
          toast({ title: "Pipeline completed", description: `${data.succeeded} steps succeeded` });
        } else {
          toast({ title: "Pipeline had failures", description: `${data.succeeded} succeeded, ${data.failed} failed`, variant: "destructive" });
        }
      } catch {
        toast({ title: "Pipeline finished" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies", assemblyId] });
      queryClient.invalidateQueries({ queryKey: ["/api/status", assembly?.projectName] });
      queryClient.invalidateQueries({ queryKey: ["/api/pipeline-runs", assembly?.projectName] });
    });

    es.addEventListener("error", () => {
      es.close();
      eventSourceRef.current = null;
      setIsRunning(false);
      toast({ title: "Pipeline connection lost", variant: "destructive" });
    });
  };

  if (assemblyLoading) {
    return (
      <div className="flex items-center justify-center py-24" data-testid="loading-assembly">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!assembly) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4" data-testid="assembly-not-found">
        <p className="text-muted-foreground">Assembly not found</p>
        <Button variant="outline" onClick={() => navigate("/")} data-testid="button-back-not-found">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const showExport = assembly.lockEligible || assembly.state === "completed";
  const modules = moduleStatus?.modules ? Object.entries(moduleStatus.modules) : [];

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto" data-testid="assembly-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-2 -ml-2"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
          <h2 className="text-lg font-semibold truncate" data-testid="text-assembly-name">
            {assembly.projectName || "Untitled Assembly"}
          </h2>
          {assembly.idea && (
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-assembly-idea">
              {assembly.idea}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={getStateBadgeVariant(assembly.state)}
            className={`no-default-active-elevate ${getStateBadgeClassName(assembly.state)}`}
            data-testid="badge-assembly-state"
          >
            {assembly.state}
          </Badge>
          {assembly.revision > 1 && (
            <Badge
              variant="outline"
              className="no-default-active-elevate bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-transparent"
              data-testid="badge-revision"
            >
              <Layers className="w-3 h-3 mr-1" />
              Rev {assembly.revision}
            </Badge>
          )}
          {assembly.kitType === "upgrade" && (
            <Badge
              variant="outline"
              className="no-default-active-elevate bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 border-transparent"
              data-testid="badge-kit-type"
            >
              <ArrowUpCircle className="w-3 h-3 mr-1" />
              Upgrade Kit
            </Badge>
          )}
          {showExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              data-testid="button-export-kit"
            >
              {exportMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export Kit
            </Button>
          )}
          {(assembly.state === "completed" || assembly.state === "exported" || assembly.state === "failed") && !isRunning && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpgradeForm(!showUpgradeForm)}
              data-testid="button-upgrade-assembly"
            >
              <ArrowUpCircle className="w-4 h-4" />
              Upgrade Assembly
            </Button>
          )}
        </div>
      </div>

      {showUpgradeForm && (
        <Card data-testid="card-upgrade-form">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4" />
              Upgrade Assembly {assembly.revision > 1 ? `(Currently Rev ${assembly.revision})` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Describe what you want to change, add, or improve. The system will re-run the pipeline on the existing workspace non-destructively, incorporating your feedback to produce an upgraded Agent Kit.
            </p>
            {assembly.upgradeNotes && (
              <div className="rounded-md bg-muted p-3" data-testid="text-previous-upgrade-notes">
                <p className="text-xs font-medium text-muted-foreground mb-1">Previous upgrade notes (Rev {assembly.revision}):</p>
                <p className="text-xs text-muted-foreground">{assembly.upgradeNotes}</p>
              </div>
            )}
            <div className="relative">
              <Textarea
                placeholder="e.g., Add a caching layer to the API routes, improve error handling in the auth module, expand the test coverage for edge cases..."
                value={upgradeNotesInput}
                onChange={(e) => setUpgradeNotesInput(e.target.value)}
                className="text-sm min-h-[100px]"
                data-testid="input-upgrade-notes"
              />
              <input
                ref={upgradeZipInputRef}
                type="file"
                accept=".zip"
                className="hidden"
                data-testid="input-upgrade-zip-file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpgradeZipUpload(file);
                }}
              />
              <button
                type="button"
                onClick={() => upgradeZipInputRef.current?.click()}
                disabled={upgradeZipUploading}
                className="absolute bottom-2 right-2 flex items-center justify-center w-7 h-7 rounded-md bg-muted/80 text-muted-foreground transition-colors hover-elevate"
                title="Upload a zip file to add full project context"
                data-testid="button-upgrade-zip-upload"
              >
                {upgradeZipUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Paperclip className="w-4 h-4" />
                )}
              </button>
            </div>
            {upgradeZipFileName && (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1" data-testid="badge-upgrade-zip-attached">
                  <FileArchive className="w-3 h-3" />
                  {upgradeZipFileName} ({upgradeZipFileCount} files)
                </Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={clearUpgradeZipContext}
                  data-testid="button-upgrade-zip-clear"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={() => upgradeMutation.mutate(upgradeNotesInput)}
                disabled={upgradeMutation.isPending || upgradeNotesInput.trim().length === 0}
                data-testid="button-submit-upgrade"
              >
                {upgradeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUpCircle className="w-4 h-4" />
                )}
                Create Upgrade Layer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowUpgradeForm(false); setUpgradeNotesInput(""); }}
                data-testid="button-cancel-upgrade"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card data-testid="card-pipeline-stepper">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(() => {
            const hasRun = stepProgress.length > 0 || (!forceShowSelector && assembly.state !== "queued" && assembly.progress?.steps);
            const resolvedPlanLabel = activePlanLabel || (assembly.progress as AssemblyProgress)?.stagePlanLabel || selectedStagePlan;
            const failedStep = stepProgress.find(s => s.status === "error");
            const pipelineFinished = !isRunning && stepProgress.length > 0 && stepProgress.every(s => s.status !== "pending" && s.status !== "running");
            const pipelineSucceeded = pipelineFinished && !failedStep;
            const pipelineFailed = pipelineFinished && !!failedStep;
            const showSelector = !hasRun && !isRunning;

            return (
              <div className="flex items-center gap-3 flex-wrap">
                {showSelector ? (
                  <>
                    <Select
                      value={selectedStagePlan}
                      onValueChange={setSelectedStagePlan}
                    >
                      <SelectTrigger className="w-72" data-testid="select-stage-plan">
                        <SelectValue placeholder="What do you want to run?" />
                      </SelectTrigger>
                      <SelectContent>
                        {stagePlans.map(([id, plan]) => (
                          <SelectItem key={id} value={id} data-testid={`select-item-plan-${id}`}>
                            {getStagePlanLabel(id, plan)} ({getStagePlanSteps(plan).length} steps)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => runPipeline()}
                      disabled={!selectedStagePlan}
                      data-testid="button-run-pipeline"
                    >
                      <Play className="w-4 h-4" />
                      Run Pipeline
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary" className="no-default-active-elevate text-xs" data-testid="badge-pipeline-plan">
                      {resolvedPlanLabel || "Pipeline"}
                    </Badge>
                    {isRunning && (
                      <Badge variant="default" className="no-default-active-elevate bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-transparent text-xs" data-testid="badge-pipeline-running">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Running
                      </Badge>
                    )}
                    {pipelineFailed && failedStep && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsRunning(false);
                            setStepProgress([]);
                            setStreamOutput("");
                            setTimeout(() => runPipeline(failedStep.stepId), 0);
                          }}
                          disabled={!selectedStagePlan}
                          data-testid="button-retry-from-failed"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Retry from {failedStep.label}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsRunning(false);
                            setStepProgress([]);
                            setStreamOutput("");
                            setTimeout(() => runPipeline(), 0);
                          }}
                          disabled={!selectedStagePlan}
                          data-testid="button-retry-pipeline"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Restart All
                        </Button>
                      </>
                    )}
                    {pipelineSucceeded && (
                      <Badge variant="success" className="no-default-active-elevate text-xs" data-testid="badge-pipeline-success">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStepProgress([]);
                        setStreamOutput("");
                        setActivePlanLabel("");
                        setSelectedStagePlan("");
                        setForceShowSelector(true);
                      }}
                      className="text-xs text-muted-foreground"
                      disabled={isRunning}
                      data-testid="button-change-pipeline"
                    >
                      Change Pipeline
                    </Button>
                  </>
                )}
              </div>
            );
          })()}

          {stepProgress.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto py-2" data-testid="pipeline-stepper">
              {stepProgress.map((step, i) => (
                <div key={step.index} className="flex items-center gap-1 shrink-0">
                  <div className="flex flex-col items-center gap-1" title={step.reason || undefined}>
                    {step.status === "pending" && (
                      <Circle className="w-5 h-5 text-gray-400" data-testid={`step-icon-pending-${i}`} />
                    )}
                    {step.status === "running" && (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" data-testid={`step-icon-running-${i}`} />
                    )}
                    {step.status === "success" && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" data-testid={`step-icon-done-${i}`} />
                    )}
                    {step.status === "error" && (
                      <XCircle className="w-5 h-5 text-red-500" data-testid={`step-icon-failed-${i}`} />
                    )}
                    {step.status === "skipped" && (
                      <Circle className="w-5 h-5 text-yellow-400" data-testid={`step-icon-skipped-${i}`} />
                    )}
                    <span className="text-[10px] text-muted-foreground max-w-20 truncate text-center">
                      {step.label}
                    </span>
                    {step.durationMs != null && step.durationMs > 0 && step.status !== "pending" && step.status !== "running" && (
                      <span className="text-[9px] text-muted-foreground" data-testid={`step-duration-${i}`}>
                        {formatDuration(step.durationMs)}
                      </span>
                    )}
                    {step.reason && (step.status === "error" || step.status === "skipped") && (
                      <span className="text-[9px] text-red-500 dark:text-red-400 max-w-24 text-center leading-tight" data-testid={`step-reason-${i}`}>
                        {step.reason}
                      </span>
                    )}
                  </div>
                  {i < stepProgress.length - 1 && (
                    <div className={`w-4 h-0.5 shrink-0 mt-[-12px] ${
                      step.status === "success" ? "bg-green-500" :
                      step.status === "error" ? "bg-red-500" :
                      step.status === "running" ? "bg-blue-500 animate-pulse" :
                      "bg-border"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {(streamOutput || isRunning) && (
            <div className="relative" data-testid="terminal-container">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Terminal className="w-3.5 h-3.5" />
                Live Output
              </div>
              <div className="rounded-md overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-900">
                  <div className="rounded-full bg-red-500" style={{ width: 6, height: 6 }} />
                  <div className="rounded-full bg-yellow-500" style={{ width: 6, height: 6 }} />
                  <div className="rounded-full bg-green-500" style={{ width: 6, height: 6 }} />
                </div>
                <pre
                  ref={terminalRef}
                  className="p-3 text-xs font-mono bg-gray-950 text-gray-200 dark:bg-gray-950 dark:text-gray-200 overflow-auto max-h-80 whitespace-pre-wrap"
                  data-testid="terminal-output"
                >
                  {streamOutput || "Waiting for output..."}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="sticky top-0 z-30 bg-background border-b -mx-6 px-6" data-testid="section-tabs">
        <div className="flex items-center gap-1 overflow-x-auto">
          {([
            { id: "overview" as const, label: "Overview", icon: LayoutGrid, count: undefined as number | undefined, hidden: false },
            { id: "logs" as const, label: "Logs", icon: ScrollText, count: activityRuns.length as number | undefined, hidden: false },
            { id: "workspace" as const, label: "Workspace", icon: FolderOpen, count: undefined as number | undefined, hidden: !assembly.wsExists },
            { id: "actions" as const, label: "Actions", icon: Wrench, count: undefined as number | undefined, hidden: !assembly.wsExists },
          ]).filter(t => !t.hidden).map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm border-b-2 transition-colors shrink-0 ${
                activeTab === tab.id
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-0.5">{tab.count}</Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="section-quick-stats">
            <Card data-testid="stat-runs">
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <Play className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-lg font-semibold leading-none">{assembly.totalRuns || 0}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Pipeline Runs</div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="stat-steps">
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-lg font-semibold leading-none">{assembly.completedSteps || 0}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Steps Completed</div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="stat-duration">
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <Timer className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="text-lg font-semibold leading-none">{assembly.totalDuration ? formatDuration(assembly.totalDuration) : "0s"}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Total Duration</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {(() => {
            const successRuns = activityRuns.filter(r => r.status === "success").length;
            const totalR = activityRuns.length;
            const rate = totalR > 0 ? Math.round((successRuns / totalR) * 100) : 0;
            const circumference = 2 * Math.PI * 18;
            const offset = circumference - (rate / 100) * circumference;
            if (totalR === 0) return null;
            return (
              <Card data-testid="stat-success-rate">
                <CardContent className="flex items-center gap-4 py-3 px-4">
                  <svg width="48" height="48" viewBox="0 0 48 48" className="shrink-0">
                    <circle cx="24" cy="24" r="18" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <circle
                      cx="24" cy="24" r="18" fill="none"
                      stroke={rate >= 80 ? "hsl(142 71% 45%)" : rate >= 50 ? "hsl(48 96% 53%)" : "hsl(0 84% 60%)"}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      transform="rotate(-90 24 24)"
                      className="transition-all duration-500"
                    />
                    <text x="24" y="24" textAnchor="middle" dominantBaseline="central" className="fill-foreground text-[11px] font-semibold">
                      {rate}%
                    </text>
                  </svg>
                  <div>
                    <div className="text-sm font-medium">Success Rate</div>
                    <div className="text-xs text-muted-foreground">{successRuns} of {totalR} runs passed</div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          <Card data-testid="section-overview">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Project Overview
              </CardTitle>
              <div className="flex items-center gap-1">
                {!editingDetails && (assembly.state === "queued" || assembly.state === "completed" || assembly.state === "exported" || assembly.state === "failed") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditIdea(assembly.idea || "");
                      setEditInput(assembly.input || {});
                      setEditingDetails(true);
                    }}
                    data-testid="button-edit-details"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
                <button
                  onClick={() => setShowOverview(!showOverview)}
                  className="text-muted-foreground"
                  data-testid="button-toggle-overview"
                >
                  {showOverview ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </CardHeader>
            {showOverview && (
              <CardContent className="space-y-4">
                {editingDetails ? (
                  <div className="space-y-4" data-testid="edit-details-form">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Project Idea</label>
                      <Textarea
                        value={editIdea}
                        onChange={(e) => setEditIdea(e.target.value)}
                        className="text-sm min-h-[80px]"
                        data-testid="input-edit-idea"
                      />
                    </div>
                    {Object.keys(editInput).length > 0 && (
                      <div className="space-y-3">
                        {Object.entries(editInput).map(([key, value]) => (
                          <div key={key}>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">
                              {formatInputLabel(key)}
                            </label>
                            <Textarea
                              value={value}
                              onChange={(e) => setEditInput(prev => ({ ...prev, [key]: e.target.value }))}
                              className="text-sm min-h-[60px]"
                              data-testid={`input-edit-${key}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateDetailsMutation.mutate({ idea: editIdea, input: editInput })}
                        disabled={updateDetailsMutation.isPending}
                        data-testid="button-save-details"
                      >
                        {updateDetailsMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Changes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingDetails(false)} data-testid="button-cancel-edit">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {assembly.idea && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                          <Lightbulb className="w-3 h-3" /> Idea
                        </h4>
                        <p className="text-sm" data-testid="text-overview-idea">{assembly.idea}</p>
                      </div>
                    )}
                    {assembly.context && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                          <FileText className="w-3 h-3" /> Context
                        </h4>
                        <p className="text-sm whitespace-pre-wrap max-h-40 overflow-y-auto" data-testid="text-overview-context">{assembly.context}</p>
                      </div>
                    )}
                    {assembly.input && Object.keys(assembly.input).length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="overview-input-fields">
                        {Object.entries(assembly.input).map(([key, value]) => {
                          if (!value) return null;
                          const { icon: Icon, label } = getInputFieldInfo(key);
                          return (
                            <div key={key} className="space-y-0.5">
                              <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <Icon className="w-3 h-3" /> {label}
                              </h4>
                              <p className="text-sm whitespace-pre-wrap" data-testid={`text-input-${key}`}>{value}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span data-testid="text-overview-created">Created: {new Date(assembly.createdAt).toLocaleString()}</span>
                      <span data-testid="text-overview-updated">Updated: {new Date(assembly.updatedAt).toLocaleString()}</span>
                      {assembly.lastRunAt && <span data-testid="text-overview-last-run">Last run: {formatRelativeTime(assembly.lastRunAt)}</span>}
                    </div>
                  </>
                )}
              </CardContent>
            )}
          </Card>

          {modules.length > 0 && (
            <Card data-testid="card-module-grid">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Modules ({modules.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {modules.map(([name, stageStatuses]) => {
                    const stageValues = STAGES.map(s => stageStatuses[s] || "pending");
                    const allDone = stageValues.every(v => v === "done");
                    const hasError = stageValues.some(v => v === "error");
                    const tintStyle = allDone
                      ? { backgroundColor: 'hsl(var(--success-tint))' }
                      : hasError
                      ? { backgroundColor: 'hsl(var(--error-tint))' }
                      : undefined;
                    return (
                      <div
                        key={name}
                        className="rounded-md border p-3 space-y-2"
                        style={tintStyle}
                        data-testid={`module-card-${name}`}
                      >
                        <span className="text-xs font-medium truncate block" data-testid={`module-name-${name}`}>
                          {name}
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {STAGES.map((stage) => {
                            const status = stageStatuses[stage] || "pending";
                            return (
                              <div
                                key={stage}
                                className="flex items-center gap-0.5"
                                title={`${STAGE_SHORT_LABELS[stage] || stage}: ${status}`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${getModuleStatusColor(status)}`}
                                  data-testid={`module-status-${name}-${stage}`}
                                />
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {STAGES.map((stage) => (
                            <span key={stage} className="text-[8px] text-muted-foreground" title={stepLabel(stage)}>
                              {STAGE_SHORT_LABELS[stage] || stage[0].toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "logs" && (
        <div className="space-y-4" data-testid="section-logs-tab">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by step name..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-assembly-logs"
              />
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {activityRuns.length} run{activityRuns.length !== 1 ? "s" : ""}
            </span>
          </div>

          {activityRuns.length === 0 ? (
            <Card data-testid="empty-assembly-logs">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Terminal className="w-10 h-10 text-primary/20 mb-3" />
                <h3 className="text-sm font-medium mb-1">No runs yet</h3>
                <p className="text-xs text-muted-foreground">Pipeline runs for this assembly will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <Card data-testid="assembly-logs-card">
              <CardContent className="p-0">
                <div className="divide-y" data-testid="assembly-logs-list">
                  {activityRuns
                    .filter(run => {
                      if (!logSearchQuery) return true;
                      const q = logSearchQuery.toLowerCase();
                      return run.stepLabel.toLowerCase().includes(q) || run.stepId.toLowerCase().includes(q);
                    })
                    .map((run) => {
                      const isExpanded = expandedLogRuns.has(run.id);
                      return (
                        <div key={run.id} data-testid={`assembly-log-row-${run.id}`}>
                          <button
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover-elevate"
                            onClick={() => {
                              setExpandedLogRuns(prev => {
                                const next = new Set(prev);
                                if (next.has(run.id)) next.delete(run.id);
                                else next.add(run.id);
                                return next;
                              });
                            }}
                            data-testid={`button-expand-log-${run.id}`}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                            )}
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${run.status === "success" ? "bg-green-500" : "bg-red-500"}`} />
                            <span className="text-sm font-medium w-36 shrink-0 truncate" data-testid={`text-log-step-${run.id}`}>
                              {run.stepLabel}
                            </span>
                            <Badge
                              variant={run.status === "success" ? "success" : "error"}
                              className="text-xs"
                              data-testid={`badge-log-status-${run.id}`}
                            >
                              {run.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground" data-testid={`text-log-exit-${run.id}`}>
                              exit: {run.exitCode}
                            </span>
                            <span className="text-xs text-muted-foreground" data-testid={`text-log-duration-${run.id}`}>
                              {formatDuration(run.durationMs)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-auto shrink-0" data-testid={`text-log-time-${run.id}`}>
                              {formatRelativeTime(run.createdAt)}
                            </span>
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-2" data-testid={`log-output-${run.id}`}>
                              {run.stdout && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">stdout</p>
                                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap" data-testid={`pre-log-stdout-${run.id}`}>
                                    {run.stdout}
                                  </pre>
                                </div>
                              )}
                              {run.stderr && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">stderr</p>
                                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap text-red-600 dark:text-red-400" data-testid={`pre-log-stderr-${run.id}`}>
                                    {run.stderr}
                                  </pre>
                                </div>
                              )}
                              {!run.stdout && !run.stderr && (
                                <p className="text-xs text-muted-foreground py-2" data-testid={`text-log-no-output-${run.id}`}>
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
      )}

      {activeTab === "workspace" && (
        <div className="space-y-4" data-testid="section-workspace-tab">
          <Card>
            <CardContent className="pt-4">
              {fileTree && fileTree.length > 0 ? (
                <div className="text-sm font-mono space-y-0.5" data-testid="file-tree">
                  {fileTree.map(node => (
                    <FileTreeItem
                      key={node.path}
                      node={node}
                      depth={0}
                      expandedDirs={expandedDirs}
                      onToggle={(path) => {
                        setExpandedDirs(prev => {
                          const next = new Set(prev);
                          if (next.has(path)) next.delete(path);
                          else next.add(path);
                          return next;
                        });
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "actions" && (
        <div className="space-y-4" data-testid="section-actions-tab">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><FileInput className="w-3.5 h-3.5" />Import & Analysis</div>
                <div className="flex items-end gap-2 flex-wrap">
                  <div className="flex-1 min-w-48">
                    <label className="text-xs text-muted-foreground mb-1 block">Source Repository Path</label>
                    <Input
                      placeholder="/path/to/existing/repo"
                      value={importSourcePath}
                      onChange={(e) => setImportSourcePath(e.target.value)}
                      data-testid="input-import-source-path"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => runSingleStep.mutate({ stepId: "import", body: { sourcePath: importSourcePath } })}
                    disabled={runSingleStep.isPending || !importSourcePath}
                    data-testid="button-action-import"
                  >
                    {runSingleStep.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileInput className="w-4 h-4" />}
                    Import
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSingleStep.mutate({ stepId: "reconcile" })}
                    disabled={runSingleStep.isPending}
                    data-testid="button-action-reconcile"
                  >
                    {runSingleStep.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
                    Reconcile
                  </Button>
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Sparkles className="w-3.5 h-3.5" />AI Content Revision</div>
                  {reviseStats && reviseStats.remaining > 0 && (
                    <Badge variant="secondary" data-testid="badge-unknowns-remaining">
                      {reviseStats.remaining} UNKNOWNs in {reviseStats.files} files
                    </Badge>
                  )}
                  {reviseStats && reviseStats.remaining === 0 && reviseMode && (
                    <Badge variant="outline" className="text-green-600 dark:text-green-400" data-testid="badge-unknowns-done">
                      <CheckCheck className="w-3 h-3 mr-1" /> All resolved
                    </Badge>
                  )}
                </div>

                {!reviseMode ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startRevise}
                    disabled={reviseLoading}
                    data-testid="button-action-revise-unknowns"
                  >
                    {reviseLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                    Revise UNKNOWNs
                  </Button>
                ) : (
                  <div className="space-y-3" data-testid="revise-unknowns-panel">
                    {reviseLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-md bg-muted/50">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Scanning documents and generating questions...
                      </div>
                    )}

                    {reviseTarget && !reviseLoading && (
                      <div className="space-y-3">
                        <div className="p-3 rounded-md bg-muted/50 space-y-1">
                          <div className="text-sm font-medium" data-testid="text-revise-target-label">{reviseTarget.docTypeLabel}</div>
                          <div className="text-xs text-muted-foreground" data-testid="text-revise-target-path">
                            {reviseTarget.relativePath} ({reviseTarget.unknownCount} UNKNOWNs in {reviseTarget.sections.length} sections)
                          </div>
                        </div>

                        {reviseQuestions.map((qGroup, gi) => (
                          <div key={gi} className="space-y-2" data-testid={`revise-question-group-${gi}`}>
                            <div className="text-xs font-medium text-muted-foreground">{qGroup.sectionName}</div>
                            {qGroup.questions.map((q, qi) => (
                              <div key={qi} className="space-y-1">
                                <label className="text-sm">{q}</label>
                                <Textarea
                                  placeholder="Your answer..."
                                  value={reviseAnswers[`${gi}-${qi}`] || ''}
                                  onChange={(e) => setReviseAnswers(prev => ({ ...prev, [`${gi}-${qi}`]: e.target.value }))}
                                  className="text-sm min-h-16 resize-none"
                                  data-testid={`input-revise-answer-${gi}-${qi}`}
                                />
                              </div>
                            ))}
                          </div>
                        ))}

                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            onClick={submitReviseAnswers}
                            disabled={reviseFilling}
                            data-testid="button-submit-revise"
                          >
                            {reviseFilling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Fill & Cascade
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setReviseMode(false); setReviseTarget(null); setReviseQuestions([]); setReviseAnswers({}); setReviseStats(null); setReviseLog([]); }}
                            disabled={reviseFilling}
                            data-testid="button-cancel-revise"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {!reviseTarget && !reviseLoading && reviseMode && (
                      <div className="p-3 rounded-md bg-muted/50 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                        <CheckCheck className="w-4 h-4" /> All UNKNOWNs have been resolved across all documents.
                        <Button variant="outline" size="sm" onClick={() => { setReviseMode(false); setReviseStats(null); setReviseLog([]); }} data-testid="button-close-revise">
                          Close
                        </Button>
                      </div>
                    )}

                    {reviseLog.length > 0 && (
                      <ScrollArea className="max-h-32 rounded-md bg-muted/30 p-2">
                        <div className="space-y-0.5 text-xs font-mono text-muted-foreground" data-testid="revise-log">
                          {reviseLog.map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t pt-3 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Rocket className="w-3.5 h-3.5" />Build & Deploy</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSingleStep.mutate({ stepId: "iterate", body: { allowApply: true } })}
                    disabled={runSingleStep.isPending}
                    data-testid="button-action-iterate"
                  >
                    {runSingleStep.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Iterate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSingleStep.mutate({ stepId: "build-plan" })}
                    disabled={runSingleStep.isPending}
                    data-testid="button-action-build-plan"
                  >
                    Build Plan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSingleStep.mutate({ stepId: "build-exec" })}
                    disabled={runSingleStep.isPending}
                    data-testid="button-action-build-exec"
                  >
                    Build Exec
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSingleStep.mutate({ stepId: "deploy" })}
                    disabled={runSingleStep.isPending}
                    data-testid="button-action-deploy"
                  >
                    <Rocket className="w-4 h-4" />
                    Deploy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSingleStep.mutate({ stepId: "clean" })}
                    disabled={runSingleStep.isPending}
                    data-testid="button-action-clean"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clean
                  </Button>
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><BarChart3 className="w-3.5 h-3.5" />Analysis</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSingleStep.mutate({ stepId: "status" })}
                    disabled={runSingleStep.isPending}
                    data-testid="button-action-status"
                  >
                    Status
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSingleStep.mutate({ stepId: "next" })}
                    disabled={runSingleStep.isPending}
                    data-testid="button-action-next"
                  >
                    Next Steps
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSingleStep.mutate({ stepId: "activate" })}
                    disabled={runSingleStep.isPending}
                    data-testid="button-action-activate"
                  >
                    Activate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
