import { useState } from "react";
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
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";

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

export default function NewAssemblyPage() {
  const [, navigate] = useLocation();
  const [projectName, setProjectName] = useState("");
  const [idea, setIdea] = useState("");
  const [context, setContext] = useState("");
  const [presetId, setPresetId] = useState("system");
  const [stagePlan, setStagePlan] = useState("docs:full");
  const [category, setCategory] = useState("");

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectName.trim() || !idea.trim()) return;

    createMutation.mutate({
      projectName: projectName.trim(),
      idea: idea.trim(),
      context: context.trim() || undefined,
      presetId,
      preset: selectedPreset?.label || presetId,
      category: category.trim() || undefined,
      domains: selectedPreset?.modules || [],
      stagePlan,
    });
  }

  const presetEntries = presetsData?.presets ? Object.entries(presetsData.presets) : [];
  const stagePlanEntries = presetsData?.stage_plans ? Object.entries(presetsData.stage_plans) : [];

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
          <h2 className="text-lg font-semibold flex items-center gap-2" data-testid="text-page-title"><Sparkles className="w-4 h-4" />New Assembly</h2>
          <p className="text-sm text-muted-foreground">Configure and create a new AXION assembly project.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assembly Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-new-assembly">
            <div className="space-y-2">
              <Label htmlFor="projectName">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="my-awesome-project"
                required
                data-testid="input-project-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idea">
                Idea <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe the project or app idea..."
                rows={4}
                required
                data-testid="input-idea"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Context</Label>
              <Textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Additional technical context or requirements (optional)"
                rows={3}
                data-testid="input-context"
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

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. web-app, cli-tool, library (optional)"
                data-testid="input-category"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={!projectName.trim() || !idea.trim() || createMutation.isPending}
                data-testid="button-create-assembly"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Assembly
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
