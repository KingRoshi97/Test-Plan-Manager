import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { stepLabel } from "@/lib/labels";
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
} from "lucide-react";

interface PresetConfig {
  label: string;
  description: string;
  modules: string[];
}

interface StagePlanConfig {
  label: string;
  description: string;
  steps: string[];
}

interface PresetsResponse {
  presets: Record<string, PresetConfig>;
  stage_plans: Record<string, StagePlanConfig | string[]>;
}

interface FieldSuggestions {
  autofill: string;
  suggestions: string[];
}

interface AutofillResponse {
  fields: Record<string, FieldSuggestions>;
}

function getStagePlanLabel(key: string, plan: StagePlanConfig | string[]): string {
  if (!Array.isArray(plan) && plan.label) return plan.label;
  return key;
}

function getStagePlanDescription(plan: StagePlanConfig | string[]): string | null {
  if (!Array.isArray(plan) && plan.description) return plan.description;
  return null;
}

function getStagePlanSteps(plan: StagePlanConfig | string[]): string[] {
  if (Array.isArray(plan)) return plan;
  return plan.steps || [];
}

const WIZARD_STEPS = [
  { id: "basics", label: "Basics", description: "Name and pipeline settings" },
  { id: "vision", label: "Vision & Users", description: "Problem, audience, and goals" },
  { id: "features", label: "Features", description: "What the app does" },
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
  const [presetId, setPresetId] = useState("system");
  const [stagePlan, setStagePlan] = useState("docs:full");
  const [category, setCategory] = useState("");

  const [visionProblem, setVisionProblem] = useState("");
  const [visionTargetUsers, setVisionTargetUsers] = useState("");
  const [visionSuccess, setVisionSuccess] = useState("");
  const [visionGoals, setVisionGoals] = useState("");

  const [coreFeatures, setCoreFeatures] = useState("");
  const [niceToHaveFeatures, setNiceToHaveFeatures] = useState("");
  const [coreEntities, setCoreEntities] = useState("");
  const [userJourneys, setUserJourneys] = useState("");

  const [platform, setPlatform] = useState("");
  const [integrations, setIntegrations] = useState("");
  const [techConstraints, setTechConstraints] = useState("");
  const [dataSensitivity, setDataSensitivity] = useState("");

  const [zipUploading, setZipUploading] = useState(false);
  const [zipFileName, setZipFileName] = useState<string | null>(null);
  const [zipFileCount, setZipFileCount] = useState(0);
  const [zipContent, setZipContent] = useState("");
  const zipInputRef = useRef<HTMLInputElement>(null);

  const [autofillData, setAutofillData] = useState<AutofillResponse | null>(null);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const [autofillApplied, setAutofillApplied] = useState(false);
  const [detailField, setDetailField] = useState<string | null>(null);

  async function handleZipUpload(file: File) {
    setZipUploading(true);
    try {
      const formData = new FormData();
      formData.append('zipfile', file);
      const resp = await fetch('/api/upload-context-zip', { method: 'POST', body: formData });
      const data = await resp.json();
      if (!resp.ok) {
        toast({ title: "Upload failed", description: data.error || "Could not process zip file", variant: "destructive" });
        return;
      }
      setZipContent(data.content);
      const existing = idea.trim();
      setIdea(existing ? `${existing}\n\n${data.content}` : data.content);
      setZipFileName(file.name);
      setZipFileCount(data.fileCount);
      toast({ title: "Context loaded", description: `${data.fileCount} files extracted from ${file.name}` });
    } catch (err: any) {
      toast({ title: "Upload error", description: err.message, variant: "destructive" });
    } finally {
      setZipUploading(false);
      if (zipInputRef.current) zipInputRef.current.value = '';
    }
  }

  function clearZipContext() {
    if (zipContent) {
      setIdea((prev) => prev.replace(zipContent, '').trim());
    }
    setZipFileName(null);
    setZipFileCount(0);
    setZipContent("");
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

  const selectedPreset = presetsData?.presets?.[presetId];
  const selectedPlan = presetsData?.stage_plans?.[stagePlan];

  const triggerAutofill = useCallback(async () => {
    if (!projectName.trim() || !idea.trim()) return;
    if (autofillData) return;

    setAutofillLoading(true);
    try {
      const resp = await fetch("/api/assembly-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: projectName.trim(),
          idea: idea.trim(),
          category: category.trim() || undefined,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        toast({ title: "Auto-fill unavailable", description: (err as any).error || "Could not generate suggestions", variant: "destructive" });
        return;
      }
      const data: AutofillResponse = await resp.json();
      setAutofillData(data);

      if (data.fields) {
        const f = data.fields;
        if (f.visionProblem?.autofill && !visionProblem.trim()) setVisionProblem(f.visionProblem.autofill);
        if (f.visionTargetUsers?.autofill && !visionTargetUsers.trim()) setVisionTargetUsers(f.visionTargetUsers.autofill);
        if (f.visionGoals?.autofill && !visionGoals.trim()) setVisionGoals(f.visionGoals.autofill);
        if (f.visionSuccess?.autofill && !visionSuccess.trim()) setVisionSuccess(f.visionSuccess.autofill);
        if (f.coreFeatures?.autofill && !coreFeatures.trim()) setCoreFeatures(f.coreFeatures.autofill);
        if (f.niceToHaveFeatures?.autofill && !niceToHaveFeatures.trim()) setNiceToHaveFeatures(f.niceToHaveFeatures.autofill);
        if (f.coreEntities?.autofill && !coreEntities.trim()) setCoreEntities(f.coreEntities.autofill);
        if (f.userJourneys?.autofill && !userJourneys.trim()) setUserJourneys(f.userJourneys.autofill);
        if (f.platform?.autofill && !platform.trim()) setPlatform(f.platform.autofill);
        if (f.integrations?.autofill && !integrations.trim()) setIntegrations(f.integrations.autofill);
        if (f.techConstraints?.autofill && !techConstraints.trim()) setTechConstraints(f.techConstraints.autofill);
        if (f.dataSensitivity?.autofill && !dataSensitivity) {
          const val = f.dataSensitivity.autofill.toLowerCase();
          if (["low", "medium", "high"].includes(val)) setDataSensitivity(val);
        }
        setAutofillApplied(true);
        toast({ title: "AI suggestions applied", description: "All sections have been pre-filled. Review and edit as needed." });
      }
    } catch (err: any) {
      toast({ title: "Auto-fill error", description: err.message, variant: "destructive" });
    } finally {
      setAutofillLoading(false);
    }
  }, [projectName, idea, category, autofillData, visionProblem, visionTargetUsers, visionGoals, visionSuccess, coreFeatures, niceToHaveFeatures, coreEntities, userJourneys, platform, integrations, techConstraints, dataSensitivity]);

  const regenerateAutofill = useCallback(async () => {
    setAutofillData(null);
    setAutofillApplied(false);
    setAutofillLoading(true);
    try {
      const resp = await fetch("/api/assembly-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: projectName.trim(),
          idea: idea.trim(),
          category: category.trim() || undefined,
        }),
      });
      if (!resp.ok) {
        toast({ title: "Regeneration failed", variant: "destructive" });
        return;
      }
      const data: AutofillResponse = await resp.json();
      setAutofillData(data);

      if (data.fields) {
        const f = data.fields;
        if (f.visionProblem?.autofill) setVisionProblem(f.visionProblem.autofill);
        if (f.visionTargetUsers?.autofill) setVisionTargetUsers(f.visionTargetUsers.autofill);
        if (f.visionGoals?.autofill) setVisionGoals(f.visionGoals.autofill);
        if (f.visionSuccess?.autofill) setVisionSuccess(f.visionSuccess.autofill);
        if (f.coreFeatures?.autofill) setCoreFeatures(f.coreFeatures.autofill);
        if (f.niceToHaveFeatures?.autofill) setNiceToHaveFeatures(f.niceToHaveFeatures.autofill);
        if (f.coreEntities?.autofill) setCoreEntities(f.coreEntities.autofill);
        if (f.userJourneys?.autofill) setUserJourneys(f.userJourneys.autofill);
        if (f.platform?.autofill) setPlatform(f.platform.autofill);
        if (f.integrations?.autofill) setIntegrations(f.integrations.autofill);
        if (f.techConstraints?.autofill) setTechConstraints(f.techConstraints.autofill);
        if (f.dataSensitivity?.autofill) {
          const val = f.dataSensitivity.autofill.toLowerCase();
          if (["low", "medium", "high"].includes(val)) setDataSensitivity(val);
        }
        setAutofillApplied(true);
        toast({ title: "Regenerated", description: "New AI suggestions have been applied." });
      }
    } catch (err: any) {
      toast({ title: "Regeneration error", description: err.message, variant: "destructive" });
    } finally {
      setAutofillLoading(false);
    }
  }, [projectName, idea, category]);

  function handleNextStep() {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    if (currentStep === 0 && !autofillData && !autofillLoading) {
      triggerAutofill();
    }
  }

  function buildStructuredInput() {
    const input: Record<string, string> = {};
    if (visionProblem.trim()) input.visionProblem = visionProblem.trim();
    if (visionTargetUsers.trim()) input.visionTargetUsers = visionTargetUsers.trim();
    if (visionSuccess.trim()) input.visionSuccess = visionSuccess.trim();
    if (visionGoals.trim()) input.visionGoals = visionGoals.trim();
    if (coreFeatures.trim()) input.coreFeatures = coreFeatures.trim();
    if (niceToHaveFeatures.trim()) input.niceToHaveFeatures = niceToHaveFeatures.trim();
    if (coreEntities.trim()) input.coreEntities = coreEntities.trim();
    if (userJourneys.trim()) input.userJourneys = userJourneys.trim();
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
    if (visionProblem.trim()) contextParts.push(`Problem: ${visionProblem.trim()}`);
    if (visionTargetUsers.trim()) contextParts.push(`Target Users: ${visionTargetUsers.trim()}`);
    if (visionSuccess.trim()) contextParts.push(`Success Criteria: ${visionSuccess.trim()}`);
    if (visionGoals.trim()) contextParts.push(`Goals: ${visionGoals.trim()}`);
    if (coreFeatures.trim()) contextParts.push(`Core Features: ${coreFeatures.trim()}`);
    if (niceToHaveFeatures.trim()) contextParts.push(`Nice-to-Have Features: ${niceToHaveFeatures.trim()}`);
    if (coreEntities.trim()) contextParts.push(`Core Entities: ${coreEntities.trim()}`);
    if (userJourneys.trim()) contextParts.push(`User Journeys: ${userJourneys.trim()}`);
    if (platform.trim()) contextParts.push(`Platform: ${platform.trim()}`);
    if (integrations.trim()) contextParts.push(`Integrations: ${integrations.trim()}`);
    if (techConstraints.trim()) contextParts.push(`Tech Constraints: ${techConstraints.trim()}`);
    if (dataSensitivity.trim()) contextParts.push(`Data Sensitivity: ${dataSensitivity.trim()}`);
    const context = contextParts.length > 0 ? contextParts.join('\n') : undefined;

    createMutation.mutate({
      projectName: projectName.trim(),
      idea: idea.trim(),
      context,
      presetId,
      preset: selectedPreset?.label || presetId,
      category: category.trim() || undefined,
      domains: selectedPreset?.modules || [],
      stagePlan,
      input: structuredInput,
    });
  }

  const canProceedFromBasics = projectName.trim().length > 0 && idea.trim().length > 0;
  const presetEntries = presetsData?.presets ? Object.entries(presetsData.presets) : [];
  const stagePlanEntries = presetsData?.stage_plans ? Object.entries(presetsData.stage_plans) : [];

  const stepHasContent = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: return canProceedFromBasics;
      case 1: return !!(visionProblem.trim() || visionTargetUsers.trim() || visionSuccess.trim() || visionGoals.trim());
      case 2: return !!(coreFeatures.trim() || niceToHaveFeatures.trim() || coreEntities.trim() || userJourneys.trim());
      case 3: return !!(platform.trim() || integrations.trim() || techConstraints.trim() || dataSensitivity.trim());
      default: return false;
    }
  };

  const getSuggestions = (field: string): string[] => {
    return autofillData?.fields?.[field]?.suggestions || [];
  };

  const FIELD_SETTERS: Record<string, (val: string) => void> = {
    visionProblem: setVisionProblem,
    visionTargetUsers: setVisionTargetUsers,
    visionGoals: setVisionGoals,
    visionSuccess: setVisionSuccess,
    coreFeatures: setCoreFeatures,
    niceToHaveFeatures: setNiceToHaveFeatures,
    coreEntities: setCoreEntities,
    userJourneys: setUserJourneys,
    platform: setPlatform,
    integrations: setIntegrations,
    techConstraints: setTechConstraints,
  };

  const FIELD_GETTERS: Record<string, () => string> = {
    visionProblem: () => visionProblem,
    visionTargetUsers: () => visionTargetUsers,
    visionGoals: () => visionGoals,
    visionSuccess: () => visionSuccess,
    coreFeatures: () => coreFeatures,
    niceToHaveFeatures: () => niceToHaveFeatures,
    coreEntities: () => coreEntities,
    userJourneys: () => userJourneys,
    platform: () => platform,
    integrations: () => integrations,
    techConstraints: () => techConstraints,
  };

  function handleSuggestionSelect(field: string, value: string) {
    const setter = FIELD_SETTERS[field];
    const getter = FIELD_GETTERS[field];
    if (!setter) return;
    const current = getter ? getter().trim() : "";
    if (current) {
      setter(current + "\n" + value);
    } else {
      setter(value);
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
                      ref={zipInputRef}
                      type="file"
                      accept=".zip"
                      className="hidden"
                      data-testid="input-zip-file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleZipUpload(file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => zipInputRef.current?.click()}
                      disabled={zipUploading}
                      className="absolute bottom-2 right-2 flex items-center justify-center w-7 h-7 rounded-md bg-muted/80 text-muted-foreground transition-colors hover-elevate"
                      title="Upload a zip file to add full project context"
                      data-testid="button-zip-upload"
                    >
                      {zipUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Paperclip className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {zipFileName ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="gap-1" data-testid="badge-zip-attached">
                        <FileArchive className="w-3 h-3" />
                        {zipFileName} ({zipFileCount} files)
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={clearZipContext}
                        data-testid="button-zip-clear"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Describe the app or system you want to build. Use the <Paperclip className="w-3 h-3 inline" /> to upload a zip of your project for full context.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. web-app, cli-tool, library, mobile-app"
                    data-testid="input-category"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preset">Preset</Label>
                  {presetsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading presets...
                    </div>
                  ) : (
                    <Select value={presetId} onValueChange={setPresetId} data-testid="select-preset">
                      <SelectTrigger data-testid="select-preset-trigger">
                        <SelectValue placeholder="Select a preset" />
                      </SelectTrigger>
                      <SelectContent>
                        {presetEntries.map(([key, preset]) => (
                          <SelectItem key={key} value={key} data-testid={`select-preset-option-${key}`}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedPreset?.description && (
                    <p className="text-xs text-muted-foreground" data-testid="text-preset-description">
                      {selectedPreset.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stagePlan">What do you want to do?</Label>
                  {presetsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <Select value={stagePlan} onValueChange={setStagePlan} data-testid="select-stage-plan">
                      <SelectTrigger data-testid="select-stage-plan-trigger">
                        <SelectValue placeholder="Select what to run" />
                      </SelectTrigger>
                      <SelectContent>
                        {stagePlanEntries.map(([key, plan]) => (
                          <SelectItem key={key} value={key} data-testid={`select-stage-plan-option-${key}`}>
                            {getStagePlanLabel(key, plan)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedPlan && getStagePlanDescription(selectedPlan) && (
                    <p className="text-xs text-muted-foreground" data-testid="text-stage-plan-description">
                      {getStagePlanDescription(selectedPlan)}
                    </p>
                  )}
                  {selectedPlan && getStagePlanSteps(selectedPlan).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1" data-testid="stage-plan-steps">
                      {getStagePlanSteps(selectedPlan).map((step, i) => (
                        <Badge key={i} variant="secondary" className="no-default-active-elevate" data-testid={`badge-stage-step-${i}`}>
                          <span>{i + 1}. {stepLabel(step)}</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <FieldLabel htmlFor="visionProblem" fieldKey="visionProblem" onDetailOpen={setDetailField}>
                    What problem does this solve?
                  </FieldLabel>
                  <Textarea
                    id="visionProblem"
                    value={visionProblem}
                    onChange={(e) => setVisionProblem(e.target.value)}
                    placeholder="Users struggle to organize their notes across devices and need a fast, simple way to capture and retrieve information..."
                    rows={3}
                    data-testid="input-vision-problem"
                  />
                  <SuggestionChips suggestions={getSuggestions("visionProblem")} onSelect={(v) => handleSuggestionSelect("visionProblem", v)} fieldKey="visionProblem" />
                </div>

                <div className="space-y-2">
                  <FieldLabel htmlFor="visionTargetUsers" fieldKey="visionTargetUsers" onDetailOpen={setDetailField}>
                    Who is this for?
                  </FieldLabel>
                  <Textarea
                    id="visionTargetUsers"
                    value={visionTargetUsers}
                    onChange={(e) => setVisionTargetUsers(e.target.value)}
                    placeholder="Students who need quick lecture notes, professionals tracking meeting action items, parents managing household lists..."
                    rows={3}
                    data-testid="input-vision-target-users"
                  />
                  <SuggestionChips suggestions={getSuggestions("visionTargetUsers")} onSelect={(v) => handleSuggestionSelect("visionTargetUsers", v)} fieldKey="visionTargetUsers" />
                </div>

                <div className="space-y-2">
                  <FieldLabel htmlFor="visionGoals" fieldKey="visionGoals" onDetailOpen={setDetailField}>
                    Primary goals (what should this achieve?)
                  </FieldLabel>
                  <Textarea
                    id="visionGoals"
                    value={visionGoals}
                    onChange={(e) => setVisionGoals(e.target.value)}
                    placeholder="1. Let users create and organize notes instantly&#10;2. Sync across all devices in real-time&#10;3. Support rich text formatting and attachments"
                    rows={3}
                    data-testid="input-vision-goals"
                  />
                  <SuggestionChips suggestions={getSuggestions("visionGoals")} onSelect={(v) => handleSuggestionSelect("visionGoals", v)} fieldKey="visionGoals" />
                </div>

                <div className="space-y-2">
                  <FieldLabel htmlFor="visionSuccess" fieldKey="visionSuccess" onDetailOpen={setDetailField}>
                    What does success look like?
                  </FieldLabel>
                  <Textarea
                    id="visionSuccess"
                    value={visionSuccess}
                    onChange={(e) => setVisionSuccess(e.target.value)}
                    placeholder="Users can find any note within 3 seconds, daily active usage of 60%+, positive app store ratings..."
                    rows={2}
                    data-testid="input-vision-success"
                  />
                  <SuggestionChips suggestions={getSuggestions("visionSuccess")} onSelect={(v) => handleSuggestionSelect("visionSuccess", v)} fieldKey="visionSuccess" />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <FieldLabel htmlFor="coreFeatures" fieldKey="coreFeatures" onDetailOpen={setDetailField}>
                    Core features (must-haves)
                  </FieldLabel>
                  <Textarea
                    id="coreFeatures"
                    value={coreFeatures}
                    onChange={(e) => setCoreFeatures(e.target.value)}
                    placeholder="- Create, edit, and delete notes&#10;- Organize notes into folders&#10;- Tag notes with multiple labels&#10;- Full-text search across all notes&#10;- Rich text editor with markdown support"
                    rows={5}
                    data-testid="input-core-features"
                  />
                  <SuggestionChips suggestions={getSuggestions("coreFeatures")} onSelect={(v) => handleSuggestionSelect("coreFeatures", v)} fieldKey="coreFeatures" />
                </div>

                <div className="space-y-2">
                  <FieldLabel htmlFor="niceToHaveFeatures" fieldKey="niceToHaveFeatures" onDetailOpen={setDetailField}>
                    Nice-to-have features
                  </FieldLabel>
                  <Textarea
                    id="niceToHaveFeatures"
                    value={niceToHaveFeatures}
                    onChange={(e) => setNiceToHaveFeatures(e.target.value)}
                    placeholder="- Image and file attachments&#10;- Collaborative editing&#10;- Export to PDF&#10;- Dark mode"
                    rows={3}
                    data-testid="input-nice-to-have-features"
                  />
                  <SuggestionChips suggestions={getSuggestions("niceToHaveFeatures")} onSelect={(v) => handleSuggestionSelect("niceToHaveFeatures", v)} fieldKey="niceToHaveFeatures" />
                </div>

                <div className="space-y-2">
                  <FieldLabel htmlFor="coreEntities" fieldKey="coreEntities" onDetailOpen={setDetailField}>
                    Main things in the system (entities)
                  </FieldLabel>
                  <Textarea
                    id="coreEntities"
                    value={coreEntities}
                    onChange={(e) => setCoreEntities(e.target.value)}
                    placeholder="- Note: has title, body, tags, created/updated dates&#10;- Folder: contains notes, can be nested&#10;- Tag: label applied to notes for filtering&#10;- User: owns notes and folders"
                    rows={4}
                    data-testid="input-core-entities"
                  />
                  <SuggestionChips suggestions={getSuggestions("coreEntities")} onSelect={(v) => handleSuggestionSelect("coreEntities", v)} fieldKey="coreEntities" />
                </div>

                <div className="space-y-2">
                  <FieldLabel htmlFor="userJourneys" fieldKey="userJourneys" onDetailOpen={setDetailField}>
                    Key user workflows
                  </FieldLabel>
                  <Textarea
                    id="userJourneys"
                    value={userJourneys}
                    onChange={(e) => setUserJourneys(e.target.value)}
                    placeholder="1. User signs up, creates their first note, organizes it into a folder&#10;2. User searches for a note by keyword, finds it, edits it&#10;3. User shares a note link with a colleague"
                    rows={4}
                    data-testid="input-user-journeys"
                  />
                  <SuggestionChips suggestions={getSuggestions("userJourneys")} onSelect={(v) => handleSuggestionSelect("userJourneys", v)} fieldKey="userJourneys" />
                </div>
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

      <FieldDetailDialog
        fieldKey={detailField}
        open={!!detailField}
        onOpenChange={(open) => { if (!open) setDetailField(null); }}
      />
    </div>
  );
}
