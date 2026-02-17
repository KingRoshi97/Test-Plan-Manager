import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  Check,
  ChevronRight,
  Paperclip,
  X,
  FileArchive,
  Info,
  Wand2,
  RefreshCw,
  Globe,
  FolderTree,
  AlertTriangle,
  FileCode,
  ChevronDown,
  Monitor,
  Smartphone,
  Gamepad2,
  Terminal,
  Server,
  Network,
  GitBranch,
  Clock,
  Cloud,
  GitMerge,
  Package,
  Library,
  Puzzle,
  Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SourceFile, SkipBreakdown, UploadResult } from "@shared/schema";

const ICON_MAP: Record<string, LucideIcon> = {
  monitor: Monitor,
  globe: Globe,
  smartphone: Smartphone,
  "gamepad-2": Gamepad2,
  terminal: Terminal,
  server: Server,
  network: Network,
  "git-branch": GitBranch,
  clock: Clock,
  cloud: Cloud,
  "git-merge": GitMerge,
  package: Package,
  library: Library,
  puzzle: Puzzle,
  layers: Layers,
};

interface ProjectTypeField {
  key: string;
  label: string;
  placeholder: string;
}

interface ProjectType {
  id: string;
  label: string;
  description: string;
  icon: string;
  presetId: string;
  fields: ProjectTypeField[];
}

interface ProjectTypeCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
  types: ProjectType[];
}

interface FullProductModifier {
  label: string;
  description: string;
  extra_modules: string[];
  fields: ProjectTypeField[];
}

interface ProjectTypesConfig {
  categories: ProjectTypeCategory[];
  full_product_modifier: FullProductModifier;
}

interface PresetConfig {
  label: string;
  description: string;
  modules: string[];
  _legacy?: boolean;
}

interface PresetsResponse {
  presets: Record<string, PresetConfig>;
  project_types: ProjectTypesConfig;
}

interface FieldSuggestions {
  autofill: string;
  suggestions: string[];
}

interface AutofillResponse {
  fields: Record<string, FieldSuggestions>;
}

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Package;
}

const WIZARD_STEPS = [
  { id: "basics", label: "Basics", description: "Name, idea, and project type" },
  { id: "details", label: "Details", description: "Project-specific questions" },
  { id: "product", label: "Full Product", description: "Infrastructure and ops" },
  { id: "technical", label: "Technical", description: "Stack and constraints" },
];

const FIELD_DETAILS: Record<string, { title: string; body: string }> = {
  visionProblem: {
    title: "What problem does this solve?",
    body: "Describe the core pain point or gap in the market that your project addresses. Think about what frustrates users today, what's missing from existing solutions, or what opportunity you've identified. A clear problem statement helps AXION generate focused documentation and ensures every feature ties back to a real need.\n\nGood example: \"Small business owners waste 5+ hours per week manually reconciling invoices across different platforms, leading to errors and delayed payments.\"\n\nWeak example: \"People need a better app.\"",
  },
  visionTargetUsers: {
    title: "Who is this for?",
    body: "Define the specific people who will use this product. Include demographics, roles, technical comfort level, and what makes them distinct from other potential users. The more specific you are, the better AXION can tailor the UX decisions, copy, and feature priorities.\n\nGood example: \"Freelance graphic designers (ages 25-40) who manage 5-15 clients simultaneously and need to track project timelines, send invoices, and share design proofs — they're comfortable with design tools but not project management software.\"\n\nWeak example: \"Everyone who uses the internet.\"",
  },
  visionGoals: {
    title: "Primary goals",
    body: "List the top 3-5 measurable outcomes this project should deliver. These become the north star for AXION's documentation pipeline — every feature, entity, and workflow should map back to at least one goal. Frame them as outcomes, not features.\n\nGood example:\n1. Reduce invoice processing time by 80%\n2. Eliminate manual data entry errors\n3. Provide real-time cash flow visibility\n4. Support multi-currency transactions\n\nWeak example: \"Make a good app that people like.\"",
  },
  visionSuccess: {
    title: "What does success look like?",
    body: "Define the concrete metrics or outcomes that would tell you this project succeeded. Think about user adoption, engagement, business impact, or qualitative feedback. These success criteria help AXION generate appropriate test plans and validation strategies.\n\nGood example: \"80% of users complete onboarding within 5 minutes. Monthly active users grow 20% month-over-month. Average invoice processing drops from 45 minutes to 5 minutes.\"\n\nWeak example: \"Lots of downloads.\"",
  },
  coreFeatures: {
    title: "Core features (must-haves)",
    body: "List the essential features that must be present for this product to be useful. These are the non-negotiable capabilities without which the product fails to solve the stated problem. Keep each feature to one line and be specific about what it does.\n\nAXION uses this list to generate the BELS (Business Entity Logic Specification), module structure, and build plan. More specific features lead to more accurate code generation.\n\nGood example:\n- Create and send professional invoices with custom branding\n- Track payment status with automatic reminders\n- Dashboard showing outstanding, paid, and overdue invoices\n- Export financial reports as PDF or CSV",
  },
  niceToHaveFeatures: {
    title: "Nice-to-have features",
    body: "Features that would enhance the product but aren't required for launch. These help AXION understand the product's growth direction and may influence architecture decisions (e.g., building for extensibility). They won't block the initial pipeline run but will be documented for future iterations.\n\nGood example:\n- Dark mode\n- Multi-language support\n- Integration with QuickBooks\n- Mobile app companion",
  },
  coreEntities: {
    title: "Main entities",
    body: "The core data objects or \"nouns\" in your system. Each entity should have a name and a brief description of its key attributes. AXION uses these to generate the data model, database schema, and API structure in the DDES (Data & Domain Entity Specification).\n\nGood example:\n- Invoice: has number, client, line items, status (draft/sent/paid/overdue), due date, total\n- Client: has name, email, billing address, payment terms, invoice history\n- Payment: has amount, method, date, associated invoice, receipt URL\n- User: has name, email, role (admin/member), company association",
  },
  userJourneys: {
    title: "Key user workflows",
    body: "Describe 3-5 typical paths a user takes through the app, from start to finish. These become the basis for AXION's SCREENMAP (screen flow documentation) and TESTPLAN. Write them as numbered steps showing what the user does and what the system responds with.\n\nGood example:\n1. New user signs up, enters company details, uploads logo\n2. User creates an invoice: selects client, adds line items, previews, sends via email\n3. Client receives invoice link, views it, pays online with credit card\n4. User checks dashboard, sees payment confirmed, downloads receipt",
  },
  platform: {
    title: "Platform targets",
    body: "Where will this application run? This influences AXION's stack profile selection and the UI_Constraints documentation. Be specific about whether you need a responsive web app, native mobile apps, desktop apps, or a combination.\n\nCommon options: Web (responsive), Web (desktop-only), iOS (native), Android (native), React Native (cross-platform mobile), Electron (desktop), CLI tool, API-only (no UI)",
  },
  integrations: {
    title: "External integrations",
    body: "List any third-party services, APIs, or systems this app needs to connect to. AXION uses this to generate integration documentation, identify authentication requirements, and plan the technical architecture.\n\nGood example:\n- Stripe for payment processing\n- SendGrid for transactional emails\n- Google OAuth for user authentication\n- AWS S3 for file storage\n- Plaid for bank account linking",
  },
  techConstraints: {
    title: "Technical constraints",
    body: "Any hard technical requirements, framework preferences, compliance needs, or infrastructure constraints. These directly influence AXION's stack profile and architecture decisions.\n\nGood example:\n- Must use React + TypeScript for frontend\n- PostgreSQL required for data storage\n- Must support offline mode with local-first sync\n- WCAG 2.1 AA accessibility compliance required\n- API response times must be under 200ms",
  },
  dataSensitivity: {
    title: "Data sensitivity level",
    body: "How sensitive is the data this application handles? This affects security requirements, encryption decisions, and compliance documentation.\n\n- Low: Public content, no personally identifiable information (PII). Example: a blog platform, a calculator tool.\n- Medium: User accounts, personal data, preferences. Example: a social media app, a project management tool.\n- High: Financial data, health records, regulated data. Example: a banking app, a healthcare portal, anything requiring SOC2/HIPAA/GDPR compliance.",
  },
};

function SuggestionChips({
  suggestions,
  onSelect,
  fieldKey,
}: {
  suggestions: string[];
  onSelect: (value: string) => void;
  fieldKey: string;
}) {
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">AI suggestions — click to use</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {suggestions.map((s, i) => (
          <Button
            key={i}
            type="button"
            variant="ghost"
            size="sm"
            className="justify-start text-left text-muted-foreground whitespace-normal h-auto min-h-8"
            onClick={() => onSelect(s)}
            data-testid={`suggestion-${fieldKey}-${i}`}
          >
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}

function MoreDetailButton({
  fieldKey,
  onOpen,
}: {
  fieldKey: string;
  onOpen: (key: string) => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => onOpen(fieldKey)}
      data-testid={`button-detail-${fieldKey}`}
      title="More details about this field"
    >
      <Info className="w-3.5 h-3.5" />
    </Button>
  );
}

function FieldDetailDialog({
  fieldKey,
  open,
  onOpenChange,
}: {
  fieldKey: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!fieldKey) return null;
  const detail = FIELD_DETAILS[fieldKey];
  if (!detail) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-field-detail">
        <DialogHeader>
          <DialogTitle className="text-base" data-testid="text-detail-title">{detail.title}</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed" data-testid="text-detail-body">
            {detail.body}
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

function FieldLabel({
  htmlFor,
  children,
  fieldKey,
  onDetailOpen,
  required,
}: {
  htmlFor: string;
  children: string;
  fieldKey: string;
  onDetailOpen: (key: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>
        {children} {required && <span className="text-destructive">*</span>}
      </Label>
      <MoreDetailButton fieldKey={fieldKey} onOpen={onDetailOpen} />
    </div>
  );
}

export default function NewAssemblyPage() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);

  const [projectName, setProjectName] = useState("");
  const [idea, setIdea] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [fullProduct, setFullProduct] = useState(false);

  const [typeFields, setTypeFields] = useState<Record<string, string>>({});
  const [fullProductFields, setFullProductFields] = useState<Record<string, string>>({});

  const [platform, setPlatform] = useState("");
  const [integrations, setIntegrations] = useState("");
  const [techConstraints, setTechConstraints] = useState("");
  const [dataSensitivity, setDataSensitivity] = useState("");

  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [confirmedFiles, setConfirmedFiles] = useState<SourceFile[]>([]);
  const [confirmedArchiveName, setConfirmedArchiveName] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const archiveInputRef = useRef<HTMLInputElement>(null);

  const [autofillData, setAutofillData] = useState<AutofillResponse | null>(null);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const [autofillApplied, setAutofillApplied] = useState(false);
  const [detailField, setDetailField] = useState<string | null>(null);

  async function handleArchiveUpload(file: File) {
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('archive', file);
      const resp = await fetch('/api/upload-context', { method: 'POST', body: formData });
      const data = await resp.json();
      if (!resp.ok) {
        toast({ title: "Upload failed", description: data.error || "Could not process archive", variant: "destructive" });
        return;
      }
      const result = data as UploadResult;
      setUploadResult(result);
      setSelectedFiles(new Set(result.files.map(f => f.path)));
      setExpandedDirs(new Set());
      setPreviewOpen(true);
    } catch (err: any) {
      toast({ title: "Upload error", description: err.message, variant: "destructive" });
    } finally {
      setUploadLoading(false);
      if (archiveInputRef.current) archiveInputRef.current.value = '';
    }
  }

  async function handleGithubFetch() {
    if (!githubUrl.trim()) return;
    setGithubLoading(true);
    try {
      const resp = await fetch('/api/upload-context-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: githubUrl.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast({ title: "Fetch failed", description: data.error || "Could not fetch repository", variant: "destructive" });
        return;
      }
      const result = data as UploadResult;
      setUploadResult(result);
      setSelectedFiles(new Set(result.files.map(f => f.path)));
      setExpandedDirs(new Set());
      setPreviewOpen(true);
    } catch (err: any) {
      toast({ title: "Fetch error", description: err.message, variant: "destructive" });
    } finally {
      setGithubLoading(false);
    }
  }

  function confirmFileSelection() {
    if (!uploadResult) return;
    const selected = uploadResult.files.filter(f => selectedFiles.has(f.path));
    setConfirmedFiles(selected);
    setConfirmedArchiveName(uploadResult.originalName);
    const contextBlock = selected.map(f => `--- FILE: ${f.path} ---\n${f.content}`).join('\n\n');
    const existing = idea.trim();
    setIdea(existing ? `${existing}\n\n${contextBlock}` : contextBlock);
    setPreviewOpen(false);
    toast({ title: "Context loaded", description: `${selected.length} files included from ${uploadResult.originalName}` });
  }

  function clearUploadContext() {
    if (confirmedFiles.length > 0) {
      const contextBlock = confirmedFiles.map(f => `--- FILE: ${f.path} ---\n${f.content}`).join('\n\n');
      setIdea((prev) => prev.replace(contextBlock, '').trim());
    }
    setConfirmedFiles([]);
    setConfirmedArchiveName(null);
    setUploadResult(null);
    setSelectedFiles(new Set());
    setGithubUrl("");
  }

  function toggleAllFiles(checked: boolean) {
    if (!uploadResult) return;
    setSelectedFiles(checked ? new Set(uploadResult.files.map(f => f.path)) : new Set());
  }

  function toggleDir(dir: string, checked: boolean) {
    if (!uploadResult) return;
    const next = new Set(selectedFiles);
    for (const f of uploadResult.files) {
      if (f.path.startsWith(dir + '/') || f.path === dir) {
        if (checked) next.add(f.path); else next.delete(f.path);
      }
    }
    setSelectedFiles(next);
  }

  function buildFileTree(files: SourceFile[]): Map<string, SourceFile[]> {
    const tree = new Map<string, SourceFile[]>();
    for (const f of files) {
      const dir = f.path.includes('/') ? f.path.substring(0, f.path.lastIndexOf('/')) : '.';
      if (!tree.has(dir)) tree.set(dir, []);
      tree.get(dir)!.push(f);
    }
    return tree;
  }

  function formatSkipBreakdown(s: SkipBreakdown): string[] {
    const parts: string[] = [];
    if (s.binary > 0) parts.push(`${s.binary} binary`);
    if (s.tooLarge > 0) parts.push(`${s.tooLarge} too large (>10MB)`);
    if (s.excludedDir > 0) parts.push(`${s.excludedDir} in excluded dirs`);
    if (s.traversal > 0) parts.push(`${s.traversal} unsafe paths`);
    if (s.readError > 0) parts.push(`${s.readError} read errors`);
    if (s.empty > 0) parts.push(`${s.empty} empty`);
    return parts;
  }

  const { data: presetsData, isLoading: presetsLoading } = useQuery<PresetsResponse>({
    queryKey: ["/api/presets"],
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiRequest("/api/assemblies", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (data: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
      toast({ title: "Assembly created" });
      navigate(`/assembly/${data.id}`);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create assembly", description: err.message, variant: "destructive" });
    },
  });

  const categories = presetsData?.project_types?.categories || [];
  const fullProductModifier = presetsData?.project_types?.full_product_modifier;

  const selectedCategoryObj = categories.find(c => c.id === selectedCategory);
  const selectedTypeObj = selectedCategoryObj?.types.find(t => t.id === selectedType);
  const derivedPresetId = selectedTypeObj?.presetId || "system";
  const selectedPreset = presetsData?.presets?.[derivedPresetId];

  function buildAutofillBody() {
    const body: Record<string, unknown> = {
      projectName: projectName.trim(),
      idea: idea.trim(),
      category: selectedCategory || undefined,
    };
    if (selectedTypeObj?.fields?.length) {
      body.detailFields = selectedTypeObj.fields.map(f => ({ key: f.key, label: f.label }));
    }
    if (fullProduct && fullProductModifier?.fields?.length) {
      body.fullProductFields = fullProductModifier.fields.map(f => ({ key: f.key, label: f.label }));
    }
    return body;
  }

  function applyAutofillData(data: AutofillResponse, overwrite: boolean) {
    if (!data.fields) return;
    const f = data.fields;

    if (selectedTypeObj?.fields) {
      setTypeFields(prev => {
        const next = { ...prev };
        for (const field of selectedTypeObj!.fields) {
          if (f[field.key]?.autofill && (overwrite || !next[field.key]?.trim())) {
            next[field.key] = f[field.key].autofill;
          }
        }
        return next;
      });
    }

    if (fullProduct && fullProductModifier?.fields) {
      setFullProductFields(prev => {
        const next = { ...prev };
        for (const field of fullProductModifier!.fields) {
          if (f[field.key]?.autofill && (overwrite || !next[field.key]?.trim())) {
            next[field.key] = f[field.key].autofill;
          }
        }
        return next;
      });
    }

    if (f.platform?.autofill && (overwrite || !platform.trim())) setPlatform(f.platform.autofill);
    if (f.integrations?.autofill && (overwrite || !integrations.trim())) setIntegrations(f.integrations.autofill);
    if (f.techConstraints?.autofill && (overwrite || !techConstraints.trim())) setTechConstraints(f.techConstraints.autofill);
    if (f.dataSensitivity?.autofill) {
      const val = f.dataSensitivity.autofill.toLowerCase();
      if (["low", "medium", "high"].includes(val) && (overwrite || !dataSensitivity)) setDataSensitivity(val);
    }
    setAutofillApplied(true);
  }

  const triggerAutofill = useCallback(async () => {
    if (!projectName.trim() || !idea.trim()) return;
    if (autofillData) return;

    setAutofillLoading(true);
    try {
      const resp = await fetch("/api/assembly-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildAutofillBody()),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        toast({ title: "Auto-fill unavailable", description: (err as any).error || "Could not generate suggestions", variant: "destructive" });
        return;
      }
      const data: AutofillResponse = await resp.json();
      setAutofillData(data);
      applyAutofillData(data, false);
      toast({ title: "AI suggestions applied", description: "All sections have been pre-filled. Review and edit as needed." });
    } catch (err: any) {
      toast({ title: "Auto-fill error", description: err.message, variant: "destructive" });
    } finally {
      setAutofillLoading(false);
    }
  }, [projectName, idea, selectedCategory, autofillData, platform, integrations, techConstraints, dataSensitivity, selectedTypeObj, fullProduct, fullProductModifier]);

  const regenerateAutofill = useCallback(async () => {
    setAutofillData(null);
    setAutofillApplied(false);
    setAutofillLoading(true);
    try {
      const resp = await fetch("/api/assembly-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildAutofillBody()),
      });
      if (!resp.ok) {
        toast({ title: "Regeneration failed", variant: "destructive" });
        return;
      }
      const data: AutofillResponse = await resp.json();
      setAutofillData(data);
      applyAutofillData(data, true);
      toast({ title: "Regenerated", description: "New AI suggestions have been applied." });
    } catch (err: any) {
      toast({ title: "Regeneration error", description: err.message, variant: "destructive" });
    } finally {
      setAutofillLoading(false);
    }
  }, [projectName, idea, selectedCategory, selectedTypeObj, fullProduct, fullProductModifier]);

  function handleNextStep() {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    if (currentStep === 0 && !autofillData && !autofillLoading) {
      triggerAutofill();
    }
  }

  function buildStructuredInput() {
    const input: Record<string, string> = {};
    for (const [k, v] of Object.entries(typeFields)) {
      if (v.trim()) input[k] = v.trim();
    }
    for (const [k, v] of Object.entries(fullProductFields)) {
      if (v.trim()) input[k] = v.trim();
    }
    if (platform.trim()) input.platform = platform.trim();
    if (integrations.trim()) input.integrations = integrations.trim();
    if (techConstraints.trim()) input.techConstraints = techConstraints.trim();
    if (dataSensitivity.trim()) input.dataSensitivity = dataSensitivity.trim();
    return Object.keys(input).length > 0 ? input : null;
  }

  function handleSubmit() {
    if (!projectName.trim() || !idea.trim()) return;

    const structuredInput = buildStructuredInput();

    const contextParts: string[] = [];
    for (const [k, v] of Object.entries(typeFields)) {
      if (v.trim()) contextParts.push(`${k}: ${v.trim()}`);
    }
    if (fullProduct) {
      for (const [k, v] of Object.entries(fullProductFields)) {
        if (v.trim()) contextParts.push(`${k}: ${v.trim()}`);
      }
    }
    if (platform.trim()) contextParts.push(`Platform: ${platform.trim()}`);
    if (integrations.trim()) contextParts.push(`Integrations: ${integrations.trim()}`);
    if (techConstraints.trim()) contextParts.push(`Tech Constraints: ${techConstraints.trim()}`);
    if (dataSensitivity.trim()) contextParts.push(`Data Sensitivity: ${dataSensitivity.trim()}`);
    const context = contextParts.length > 0 ? contextParts.join('\n') : undefined;

    const sourceFilesForStorage = confirmedFiles.length > 0
      ? confirmedFiles.map(f => ({ path: f.path, language: f.language, content: f.content, size: f.size }))
      : undefined;

    let domains = selectedPreset?.modules || [];
    if (fullProduct && fullProductModifier) {
      const combined = new Set([...domains, ...fullProductModifier.extra_modules]);
      domains = Array.from(combined);
    }

    createMutation.mutate({
      projectName: projectName.trim(),
      idea: idea.trim(),
      context,
      presetId: derivedPresetId,
      preset: selectedPreset?.label || derivedPresetId,
      category: selectedCategory || undefined,
      domains,
      stagePlan: "docs:full",
      input: structuredInput,
      typeFields,
      fullProductFields: fullProduct ? fullProductFields : undefined,
      fullProduct,
      sourceFiles: sourceFilesForStorage,
    });
  }

  const canProceedFromBasics = projectName.trim().length > 0 && idea.trim().length > 0;

  const stepHasContent = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: return canProceedFromBasics;
      case 1: return Object.values(typeFields).some(v => v.trim());
      case 2: return fullProduct && Object.values(fullProductFields).some(v => v.trim());
      case 3: return !!(platform.trim() || integrations.trim() || techConstraints.trim() || dataSensitivity.trim());
      default: return false;
    }
  };

  const getSuggestions = (field: string): string[] => {
    return autofillData?.fields?.[field]?.suggestions || [];
  };

  const FIELD_SETTERS: Record<string, (val: string) => void> = {
    platform: setPlatform,
    integrations: setIntegrations,
    techConstraints: setTechConstraints,
  };

  const FIELD_GETTERS: Record<string, () => string> = {
    platform: () => platform,
    integrations: () => integrations,
    techConstraints: () => techConstraints,
  };

  function handleSuggestionSelect(field: string, value: string) {
    const setter = FIELD_SETTERS[field];
    const getter = FIELD_GETTERS[field];
    if (setter) {
      const current = getter ? getter().trim() : "";
      setter(current ? current + "\n" + value : value);
      return;
    }

    if (selectedTypeObj?.fields.some(f => f.key === field)) {
      setTypeFields(prev => {
        const current = (prev[field] || "").trim();
        return { ...prev, [field]: current ? current + "\n" + value : value };
      });
      return;
    }

    if (fullProductModifier?.fields?.some(f => f.key === field)) {
      setFullProductFields(prev => {
        const current = (prev[field] || "").trim();
        return { ...prev, [field]: current ? current + "\n" + value : value };
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6" data-testid="new-assembly-page">
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2" data-testid="text-page-title">
            <Sparkles className="w-4 h-4" />New Assembly
          </h2>
          <p className="text-sm text-muted-foreground">
            The more detail you provide, the better the first pipeline run will be.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1" data-testid="wizard-steps-nav">
        {WIZARD_STEPS.map((ws, i) => (
          <div key={ws.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => { if (i === 0 || canProceedFromBasics) setCurrentStep(i); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                i === currentStep
                  ? "bg-primary text-primary-foreground"
                  : stepHasContent(i)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground"
              } ${i > 0 && !canProceedFromBasics ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              disabled={i > 0 && !canProceedFromBasics}
              data-testid={`wizard-step-${ws.id}`}
            >
              {stepHasContent(i) && i !== currentStep ? (
                <Check className="w-3 h-3" />
              ) : (
                <span className="text-xs font-medium">{i + 1}</span>
              )}
              <span>{ws.label}</span>
            </button>
            {i < WIZARD_STEPS.length - 1 && (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {autofillLoading && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 text-sm text-muted-foreground" data-testid="autofill-loading">
          <Loader2 className="w-4 h-4 animate-spin" />
          <Wand2 className="w-3.5 h-3.5" />
          <span>Generating AI suggestions for all sections...</span>
        </div>
      )}

      {autofillApplied && !autofillLoading && currentStep > 0 && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-muted/50 text-sm flex-wrap" data-testid="autofill-applied-banner">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-3.5 h-3.5" />
            <span>AI pre-filled all sections. Review and edit as needed.</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={regenerateAutofill}
            disabled={autofillLoading}
            data-testid="button-regenerate-autofill"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{WIZARD_STEPS[currentStep].label}</CardTitle>
          <p className="text-sm text-muted-foreground">{WIZARD_STEPS[currentStep].description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {currentStep === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="projectName">
                    Project Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="my-awesome-project"
                    data-testid="input-project-name"
                  />
                  <p className="text-xs text-muted-foreground">A short, slug-friendly name for the workspace directory.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idea">
                    Project Idea <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="idea"
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="A mobile-first note-taking app with folders, tags, rich text editing, and offline sync..."
                      rows={4}
                      data-testid="input-idea"
                    />
                    <input
                      ref={archiveInputRef}
                      type="file"
                      accept=".zip,.tar.gz,.tgz"
                      className="hidden"
                      data-testid="input-archive-file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleArchiveUpload(file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => archiveInputRef.current?.click()}
                      disabled={uploadLoading || githubLoading}
                      className="absolute bottom-2 right-2 flex items-center justify-center w-7 h-7 rounded-md bg-muted/80 text-muted-foreground transition-colors hover-elevate"
                      title="Upload .zip or .tar.gz to add project context"
                      data-testid="button-archive-upload"
                    >
                      {uploadLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Paperclip className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {confirmedFiles.length > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="gap-1" data-testid="badge-archive-attached">
                        <FileArchive className="w-3 h-3" />
                        {confirmedArchiveName} ({confirmedFiles.length} files)
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (uploadResult) {
                            setSelectedFiles(new Set(uploadResult.files.map(f => f.path)));
                            setPreviewOpen(true);
                          }
                        }}
                        data-testid="button-archive-preview"
                        title="Review selected files"
                      >
                        <FolderTree className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={clearUploadContext}
                        data-testid="button-archive-clear"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Describe the app or system you want to build. Use <Paperclip className="w-3 h-3 inline" /> to upload an archive (.zip, .tar.gz), or paste a GitHub URL below.
                      </p>
                      <div className="flex items-center gap-2">
                        <Input
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/owner/repo"
                          className="flex-1 text-xs"
                          data-testid="input-github-url"
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGithubFetch(); } }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleGithubFetch}
                          disabled={!githubUrl.trim() || githubLoading || uploadLoading}
                          data-testid="button-github-fetch"
                        >
                          {githubLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Project Category</Label>
                  {presetsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading project types...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2" data-testid="category-selection">
                      {categories.map((cat) => {
                        const IconComp = getIcon(cat.icon);
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat.id);
                              setSelectedType("");
                              setTypeFields({});
                            }}
                            className={`flex items-start gap-3 p-3 rounded-md border text-left transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover-elevate"
                            }`}
                            data-testid={`category-card-${cat.id}`}
                          >
                            <IconComp className="w-5 h-5 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-sm font-medium">{cat.label}</div>
                              <div className="text-xs text-muted-foreground">{cat.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedCategoryObj && (
                  <div className="space-y-3">
                    <Label>Project Type</Label>
                    <div className="grid grid-cols-2 gap-2" data-testid="type-selection">
                      {selectedCategoryObj.types.map((t) => {
                        const IconComp = getIcon(t.icon);
                        const isSelected = selectedType === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setSelectedType(t.id);
                              setTypeFields({});
                            }}
                            className={`flex items-start gap-3 p-3 rounded-md border text-left transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover-elevate"
                            }`}
                            data-testid={`type-card-${t.id}`}
                          >
                            <IconComp className="w-4 h-4 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-sm font-medium">{t.label}</div>
                              <div className="text-xs text-muted-foreground">{t.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedTypeObj && fullProductModifier && (
                  <div className="flex items-start gap-3 p-3 rounded-md border border-border" data-testid="full-product-toggle">
                    <Checkbox
                      id="fullProduct"
                      checked={fullProduct}
                      onCheckedChange={(checked) => setFullProduct(!!checked)}
                      data-testid="checkbox-full-product"
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor="fullProduct" className="text-sm font-medium cursor-pointer">
                        {fullProductModifier.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{fullProductModifier.description}</p>
                    </div>
                  </div>
                )}

              </>
            )}

            {currentStep === 1 && (
              <>
                {selectedTypeObj ? (
                  selectedTypeObj.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor={`type-field-${field.key}`}>{field.label}</Label>
                        {FIELD_DETAILS[field.key] && (
                          <MoreDetailButton fieldKey={field.key} onOpen={setDetailField} />
                        )}
                      </div>
                      <Textarea
                        id={`type-field-${field.key}`}
                        value={typeFields[field.key] || ""}
                        onChange={(e) => setTypeFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        rows={2}
                        data-testid={`input-type-field-${field.key}`}
                      />
                      <SuggestionChips suggestions={getSuggestions(field.key)} onSelect={(v) => handleSuggestionSelect(field.key, v)} fieldKey={field.key} />
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground py-4 text-center" data-testid="text-no-type-selected">
                    Select a project category and type in the Basics step to see project-specific questions.
                  </div>
                )}
              </>
            )}

            {currentStep === 2 && (
              <>
                {fullProduct && fullProductModifier ? (
                  fullProductModifier.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor={`fp-field-${field.key}`}>{field.label}</Label>
                        {FIELD_DETAILS[field.key] && (
                          <MoreDetailButton fieldKey={field.key} onOpen={setDetailField} />
                        )}
                      </div>
                      <Textarea
                        id={`fp-field-${field.key}`}
                        value={fullProductFields[field.key] || ""}
                        onChange={(e) => setFullProductFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        rows={2}
                        data-testid={`input-fp-field-${field.key}`}
                      />
                      <SuggestionChips suggestions={getSuggestions(field.key)} onSelect={(v) => handleSuggestionSelect(field.key, v)} fieldKey={field.key} />
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground py-4 text-center" data-testid="text-full-product-disabled">
                    Full Product is not enabled. Toggle it on in the Basics step to configure database, auth, security, integrations, DevOps, and monitoring.
                  </div>
                )}
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <FieldLabel htmlFor="platform" fieldKey="platform" onDetailOpen={setDetailField}>
                    Platform targets
                  </FieldLabel>
                  <Input
                    id="platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    placeholder="e.g. Web (responsive), iOS, Android, Desktop (Electron)"
                    data-testid="input-platform"
                  />
                  <SuggestionChips suggestions={getSuggestions("platform")} onSelect={(v) => handleSuggestionSelect("platform", v)} fieldKey="platform" />
                </div>

                <div className="space-y-2">
                  <FieldLabel htmlFor="integrations" fieldKey="integrations" onDetailOpen={setDetailField}>
                    External integrations
                  </FieldLabel>
                  <Textarea
                    id="integrations"
                    value={integrations}
                    onChange={(e) => setIntegrations(e.target.value)}
                    placeholder="- Google OAuth for sign-in&#10;- Stripe for payments&#10;- AWS S3 for file storage&#10;- SendGrid for emails"
                    rows={3}
                    data-testid="input-integrations"
                  />
                  <SuggestionChips suggestions={getSuggestions("integrations")} onSelect={(v) => handleSuggestionSelect("integrations", v)} fieldKey="integrations" />
                </div>

                <div className="space-y-2">
                  <FieldLabel htmlFor="techConstraints" fieldKey="techConstraints" onDetailOpen={setDetailField}>
                    Technical constraints or preferences
                  </FieldLabel>
                  <Textarea
                    id="techConstraints"
                    value={techConstraints}
                    onChange={(e) => setTechConstraints(e.target.value)}
                    placeholder="- Must use React + TypeScript&#10;- PostgreSQL required&#10;- Must support offline mode&#10;- HIPAA compliance needed"
                    rows={3}
                    data-testid="input-tech-constraints"
                  />
                  <SuggestionChips suggestions={getSuggestions("techConstraints")} onSelect={(v) => handleSuggestionSelect("techConstraints", v)} fieldKey="techConstraints" />
                </div>

                <div className="space-y-2">
                  <FieldLabel htmlFor="dataSensitivity" fieldKey="dataSensitivity" onDetailOpen={setDetailField}>
                    Data sensitivity
                  </FieldLabel>
                  <Select value={dataSensitivity} onValueChange={setDataSensitivity} data-testid="select-data-sensitivity">
                    <SelectTrigger data-testid="select-data-sensitivity-trigger">
                      <SelectValue placeholder="Select data sensitivity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low" data-testid="select-data-sensitivity-low">Low (public content, no PII)</SelectItem>
                      <SelectItem value="medium" data-testid="select-data-sensitivity-medium">Medium (user accounts, personal data)</SelectItem>
                      <SelectItem value="high" data-testid="select-data-sensitivity-high">High (financial, health, regulated data)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex items-center justify-between gap-2 pt-4 border-t flex-wrap">
              <div>
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    data-testid="button-wizard-back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {currentStep < WIZARD_STEPS.length - 1 && (
                  <>
                    {currentStep > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={!canProceedFromBasics}
                        data-testid="button-wizard-skip"
                      >
                        Skip
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      disabled={currentStep === 0 ? !canProceedFromBasics : false}
                      data-testid="button-wizard-next"
                    >
                      {currentStep === 0 && <Wand2 className="w-4 h-4" />}
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {currentStep > 0 && (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canProceedFromBasics || createMutation.isPending}
                    data-testid="button-create-assembly"
                  >
                    {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Assembly
                  </Button>
                )}

                {currentStep === 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSubmit}
                    disabled={!canProceedFromBasics || createMutation.isPending}
                    data-testid="button-create-quick"
                  >
                    {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Quick Create
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderTree className="w-4 h-4" />
              File Preview
            </DialogTitle>
            <DialogDescription>
              {uploadResult && (
                <span>
                  {uploadResult.originalName} — {uploadResult.files.length} extractable files
                  {uploadResult.totalSkipped > 0 && `, ${uploadResult.totalSkipped} skipped`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {uploadResult && uploadResult.totalSkipped > 0 && (
            <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground" data-testid="text-skip-breakdown">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Skipped {uploadResult.totalSkipped} files:</span>{' '}
                {formatSkipBreakdown(uploadResult.skipped).join(', ')}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 border-b pb-2">
            <Checkbox
              checked={uploadResult ? selectedFiles.size === uploadResult.files.length : false}
              onCheckedChange={(checked) => toggleAllFiles(!!checked)}
              data-testid="checkbox-select-all"
            />
            <span className="text-sm font-medium">
              {selectedFiles.size} of {uploadResult?.files.length ?? 0} selected
            </span>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-0.5 pr-3">
              {uploadResult && (() => {
                const tree = buildFileTree(uploadResult.files);
                const sortedDirs = Array.from(tree.keys()).sort();
                return sortedDirs.map(dir => {
                  const files = tree.get(dir)!;
                  const isExpanded = expandedDirs.has(dir);
                  const allSelected = files.every(f => selectedFiles.has(f.path));
                  const someSelected = files.some(f => selectedFiles.has(f.path));
                  return (
                    <div key={dir}>
                      <div
                        className="flex items-center gap-2 py-1 px-1 rounded-md hover-elevate cursor-pointer"
                        onClick={() => {
                          const next = new Set(expandedDirs);
                          if (isExpanded) next.delete(dir); else next.add(dir);
                          setExpandedDirs(next);
                        }}
                        data-testid={`dir-toggle-${dir}`}
                      >
                        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                        <Checkbox
                          checked={allSelected}
                          className={someSelected && !allSelected ? 'opacity-50' : ''}
                          onCheckedChange={(checked) => { toggleDir(dir, !!checked); }}
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`checkbox-dir-${dir}`}
                        />
                        <span className="text-sm font-medium truncate">{dir === '.' ? '(root)' : dir}/</span>
                        <span className="text-xs text-muted-foreground ml-auto">{files.length}</span>
                      </div>
                      {isExpanded && (
                        <div className="ml-6 space-y-0.5">
                          {files.map(f => {
                            const fileName = f.path.includes('/') ? f.path.split('/').pop()! : f.path;
                            return (
                              <div
                                key={f.path}
                                className="flex items-center gap-2 py-0.5 px-1 rounded-md text-sm"
                                data-testid={`file-row-${f.path}`}
                              >
                                <Checkbox
                                  checked={selectedFiles.has(f.path)}
                                  onCheckedChange={(checked) => {
                                    const next = new Set(selectedFiles);
                                    if (checked) next.add(f.path); else next.delete(f.path);
                                    setSelectedFiles(next);
                                  }}
                                  data-testid={`checkbox-file-${f.path}`}
                                />
                                <FileCode className="w-3 h-3 text-muted-foreground shrink-0" />
                                <span className="truncate">{fileName}</span>
                                <Badge variant="outline" className="ml-auto text-[10px] no-default-active-elevate">
                                  {f.language}
                                </Badge>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {f.size < 1024 ? `${f.size}B` : `${(f.size / 1024).toFixed(1)}KB`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)} data-testid="button-preview-cancel">
              Cancel
            </Button>
            <Button onClick={confirmFileSelection} disabled={selectedFiles.size === 0} data-testid="button-preview-confirm">
              <Check className="w-4 h-4" />
              Include {selectedFiles.size} files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FieldDetailDialog
        fieldKey={detailField}
        open={!!detailField}
        onOpenChange={(open) => { if (!open) setDetailField(null); }}
      />
    </div>
  );
}
