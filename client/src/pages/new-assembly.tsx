import { useState, useRef } from "react";
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
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Check, ChevronRight, Paperclip, X, FileArchive } from "lucide-react";

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
      const existing = visionProblem.trim();
      setVisionProblem(existing ? `${existing}\n\n${data.content}` : data.content);
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
      setVisionProblem((prev) => prev.replace(zipContent, '').trim());
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
                  <Textarea
                    id="idea"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="A mobile-first note-taking app with folders, tags, rich text editing, and offline sync..."
                    rows={4}
                    data-testid="input-idea"
                  />
                  <p className="text-xs text-muted-foreground">Describe the app or system you want to build. Be as specific as possible.</p>
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
                  <Label htmlFor="visionProblem">What problem does this solve?</Label>
                  <div className="relative">
                    <Textarea
                      id="visionProblem"
                      value={visionProblem}
                      onChange={(e) => setVisionProblem(e.target.value)}
                      placeholder="Users struggle to organize their notes across devices and need a fast, simple way to capture and retrieve information..."
                      rows={3}
                      data-testid="input-vision-problem"
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
                      The core pain point or opportunity your app addresses. Use the <Paperclip className="w-3 h-3 inline" /> to upload a zip of your project for full context.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visionTargetUsers">Who is this for?</Label>
                  <Textarea
                    id="visionTargetUsers"
                    value={visionTargetUsers}
                    onChange={(e) => setVisionTargetUsers(e.target.value)}
                    placeholder="Students who need quick lecture notes, professionals tracking meeting action items, parents managing household lists..."
                    rows={3}
                    data-testid="input-vision-target-users"
                  />
                  <p className="text-xs text-muted-foreground">Describe the people who will use this app and what makes them distinct.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visionGoals">Primary goals (what should this achieve?)</Label>
                  <Textarea
                    id="visionGoals"
                    value={visionGoals}
                    onChange={(e) => setVisionGoals(e.target.value)}
                    placeholder="1. Let users create and organize notes instantly&#10;2. Sync across all devices in real-time&#10;3. Support rich text formatting and attachments"
                    rows={3}
                    data-testid="input-vision-goals"
                  />
                  <p className="text-xs text-muted-foreground">List the top 3-5 outcomes this project should deliver.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visionSuccess">What does success look like?</Label>
                  <Textarea
                    id="visionSuccess"
                    value={visionSuccess}
                    onChange={(e) => setVisionSuccess(e.target.value)}
                    placeholder="Users can find any note within 3 seconds, daily active usage of 60%+, positive app store ratings..."
                    rows={2}
                    data-testid="input-vision-success"
                  />
                  <p className="text-xs text-muted-foreground">How will you know the project succeeded? Think metrics or outcomes.</p>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="coreFeatures">Core features (must-haves)</Label>
                  <Textarea
                    id="coreFeatures"
                    value={coreFeatures}
                    onChange={(e) => setCoreFeatures(e.target.value)}
                    placeholder="- Create, edit, and delete notes&#10;- Organize notes into folders&#10;- Tag notes with multiple labels&#10;- Full-text search across all notes&#10;- Rich text editor with markdown support"
                    rows={5}
                    data-testid="input-core-features"
                  />
                  <p className="text-xs text-muted-foreground">The features that must ship for this to be useful. List up to 10.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="niceToHaveFeatures">Nice-to-have features</Label>
                  <Textarea
                    id="niceToHaveFeatures"
                    value={niceToHaveFeatures}
                    onChange={(e) => setNiceToHaveFeatures(e.target.value)}
                    placeholder="- Image and file attachments&#10;- Collaborative editing&#10;- Export to PDF&#10;- Dark mode"
                    rows={3}
                    data-testid="input-nice-to-have-features"
                  />
                  <p className="text-xs text-muted-foreground">Features that would be great but aren't required for launch.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coreEntities">Main things in the system (entities)</Label>
                  <Textarea
                    id="coreEntities"
                    value={coreEntities}
                    onChange={(e) => setCoreEntities(e.target.value)}
                    placeholder="- Note: has title, body, tags, created/updated dates&#10;- Folder: contains notes, can be nested&#10;- Tag: label applied to notes for filtering&#10;- User: owns notes and folders"
                    rows={4}
                    data-testid="input-core-entities"
                  />
                  <p className="text-xs text-muted-foreground">The main objects or data types. Think "nouns" — what does the app manage?</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userJourneys">Key user workflows</Label>
                  <Textarea
                    id="userJourneys"
                    value={userJourneys}
                    onChange={(e) => setUserJourneys(e.target.value)}
                    placeholder="1. User signs up, creates their first note, organizes it into a folder&#10;2. User searches for a note by keyword, finds it, edits it&#10;3. User shares a note link with a colleague"
                    rows={4}
                    data-testid="input-user-journeys"
                  />
                  <p className="text-xs text-muted-foreground">Describe 3-5 typical paths a user takes through the app.</p>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform targets</Label>
                  <Input
                    id="platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    placeholder="e.g. Web (responsive), iOS, Android, Desktop (Electron)"
                    data-testid="input-platform"
                  />
                  <p className="text-xs text-muted-foreground">Where will this app run?</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="integrations">External integrations</Label>
                  <Textarea
                    id="integrations"
                    value={integrations}
                    onChange={(e) => setIntegrations(e.target.value)}
                    placeholder="- Google OAuth for sign-in&#10;- Stripe for payments&#10;- AWS S3 for file storage&#10;- SendGrid for emails"
                    rows={3}
                    data-testid="input-integrations"
                  />
                  <p className="text-xs text-muted-foreground">Any third-party services, APIs, or systems this app needs to connect to.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="techConstraints">Technical constraints or preferences</Label>
                  <Textarea
                    id="techConstraints"
                    value={techConstraints}
                    onChange={(e) => setTechConstraints(e.target.value)}
                    placeholder="- Must use React + TypeScript&#10;- PostgreSQL required&#10;- Must support offline mode&#10;- HIPAA compliance needed"
                    rows={3}
                    data-testid="input-tech-constraints"
                  />
                  <p className="text-xs text-muted-foreground">Stack requirements, compliance needs, or hard technical boundaries.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataSensitivity">Data sensitivity</Label>
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
                  <p className="text-xs text-muted-foreground">How sensitive is the data this app handles?</p>
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
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={currentStep === 0 ? !canProceedFromBasics : false}
                      data-testid="button-wizard-next"
                    >
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
    </div>
  );
}
