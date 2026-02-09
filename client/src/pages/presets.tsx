import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Loader2,
  Search,
  Layers,
  Workflow,
  ChevronRight,
  Boxes,
  ShieldCheck,
  Lock,
  ArrowRight,
  Settings,
} from "lucide-react";
import { stepLabel } from "@/lib/labels";

interface PresetConfig {
  label: string;
  description: string;
  modules: string[];
  include_dependencies?: boolean;
  recommended_stage_plan?: string;
  guards?: Record<string, boolean>;
}

interface StagePlanConfig {
  label: string;
  description: string;
  steps: string[];
}

interface GateConfig {
  requires_stage?: string;
  requires_verify_pass?: boolean;
  requires_docs_locked?: boolean;
  requires_tests_pass?: boolean;
  allow_override?: boolean | string;
  error: string;
  message: string;
}

interface PresetsResponse {
  presets: Record<string, PresetConfig>;
  stage_plans: Record<string, StagePlanConfig | string[]>;
  gates?: Record<string, GateConfig>;
}

function getStagePlan(plan: StagePlanConfig | string[]): { label: string; description: string; steps: string[] } {
  if (Array.isArray(plan)) return { label: "", description: "", steps: plan };
  return { label: plan.label || "", description: plan.description || "", steps: plan.steps || [] };
}

export default function PresetsPage() {
  const [search, setSearch] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<{ key: string; preset: PresetConfig } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{ key: string; plan: ReturnType<typeof getStagePlan> } | null>(null);
  const [selectedGate, setSelectedGate] = useState<{ key: string; gate: GateConfig } | null>(null);

  const { data, isLoading } = useQuery<PresetsResponse>({
    queryKey: ["/api/presets"],
  });

  const presetEntries = data?.presets ? Object.entries(data.presets) : [];
  const planEntries = data?.stage_plans ? Object.entries(data.stage_plans) : [];
  const gateEntries = data?.gates ? Object.entries(data.gates) : [];

  const q = search.toLowerCase().trim();
  const filteredPresets = q
    ? presetEntries.filter(([k, p]) =>
        k.toLowerCase().includes(q) ||
        p.label.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.modules.some((m) => m.toLowerCase().includes(q))
      )
    : presetEntries;

  const filteredPlans = q
    ? planEntries.filter(([k, p]) => {
        const plan = getStagePlan(p);
        return (
          k.toLowerCase().includes(q) ||
          plan.label.toLowerCase().includes(q) ||
          plan.description.toLowerCase().includes(q) ||
          plan.steps.some((s) => s.toLowerCase().includes(q) || stepLabel(s).toLowerCase().includes(q))
        );
      })
    : planEntries;

  const filteredGates = q
    ? gateEntries.filter(([k, g]) =>
        k.toLowerCase().includes(q) ||
        g.error.toLowerCase().includes(q) ||
        g.message.toLowerCase().includes(q)
      )
    : gateEntries;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8" data-testid="presets-page">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2" data-testid="text-page-title">
          <Settings className="w-5 h-5" />
          Presets & Stage Plans
        </h2>
        <p className="text-sm text-muted-foreground">
          Pipeline configuration: {presetEntries.length} module presets, {planEntries.length} stage plans, and {gateEntries.length} pipeline gates.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search presets, plans, or modules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="input-search-presets"
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Boxes className="w-4 h-4" />
            Module Presets ({filteredPresets.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredPresets.map(([key, preset]) => (
              <Card
                key={key}
                className="cursor-pointer hover-elevate"
                onClick={() => setSelectedPreset({ key, preset })}
                data-testid={`card-preset-${key}`}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate" data-testid={`text-preset-label-${key}`}>
                        {preset.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{key}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{preset.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {preset.modules.slice(0, 5).map((mod) => (
                      <Badge key={mod} variant="secondary" className="no-default-active-elevate" data-testid={`badge-module-${key}-${mod}`}>
                        {mod}
                      </Badge>
                    ))}
                    {preset.modules.length > 5 && (
                      <Badge variant="outline" className="no-default-active-elevate">
                        +{preset.modules.length - 5} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            Stage Plans ({filteredPlans.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredPlans.map(([key, rawPlan]) => {
              const plan = getStagePlan(rawPlan);
              return (
                <Card
                  key={key}
                  className="cursor-pointer hover-elevate"
                  onClick={() => setSelectedPlan({ key, plan })}
                  data-testid={`card-plan-${key}`}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate" data-testid={`text-plan-label-${key}`}>
                          {plan.label || key}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{key}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
                    </div>
                    {plan.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {plan.steps.map((step, i) => (
                        <Badge key={i} variant="secondary" className="no-default-active-elevate gap-1">
                          <span className="text-muted-foreground">{i + 1}.</span> {stepLabel(step)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {filteredGates.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Pipeline Gates ({filteredGates.length})
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGates.map(([key, gate]) => (
                <Card
                  key={key}
                  className="cursor-pointer hover-elevate"
                  onClick={() => setSelectedGate({ key, gate })}
                  data-testid={`card-gate-${key}`}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                        {stepLabel(key)}
                      </p>
                      <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{gate.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedPreset} onOpenChange={(open) => { if (!open) setSelectedPreset(null); }}>
        {selectedPreset && (
          <DialogContent className="max-w-lg" data-testid="dialog-preset-detail">
            <DialogHeader>
              <DialogTitle className="text-base" data-testid="text-dialog-preset-title">
                {selectedPreset.preset.label}
              </DialogTitle>
              <DialogDescription>
                <Badge variant="outline" className="no-default-active-elevate">{selectedPreset.key}</Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">{selectedPreset.preset.description}</p>

              <div className="space-y-1.5">
                <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Modules ({selectedPreset.preset.modules.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPreset.preset.modules.map((mod) => (
                    <Badge key={mod} variant="secondary" className="no-default-active-elevate">
                      {mod}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Dependencies: {selectedPreset.preset.include_dependencies ? "Included" : "Not included"}
                </div>
                {selectedPreset.preset.recommended_stage_plan && (
                  <div className="flex items-center gap-1.5">
                    <Workflow className="w-3.5 h-3.5" />
                    Recommended plan: {selectedPreset.preset.recommended_stage_plan}
                  </div>
                )}
              </div>

              {selectedPreset.preset.guards && Object.keys(selectedPreset.preset.guards).length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Guards</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(selectedPreset.preset.guards).map(([gk, gv]) => (
                      <Badge key={gk} variant={gv ? "default" : "outline"} className="no-default-active-elevate gap-1">
                        {gk.replace(/_/g, " ")}
                        <span className="text-xs">{gv ? "ON" : "OFF"}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!selectedPlan} onOpenChange={(open) => { if (!open) setSelectedPlan(null); }}>
        {selectedPlan && (
          <DialogContent className="max-w-lg" data-testid="dialog-plan-detail">
            <DialogHeader>
              <DialogTitle className="text-base" data-testid="text-dialog-plan-title">
                {selectedPlan.plan.label || selectedPlan.key}
              </DialogTitle>
              <DialogDescription>
                <Badge variant="outline" className="no-default-active-elevate">{selectedPlan.key}</Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              {selectedPlan.plan.description && (
                <p className="text-muted-foreground">{selectedPlan.plan.description}</p>
              )}
              <div className="space-y-1.5">
                <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Steps ({selectedPlan.plan.steps.length})</p>
                <div className="space-y-1">
                  {selectedPlan.plan.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="no-default-active-elevate tabular-nums shrink-0">
                        {i + 1}
                      </Badge>
                      <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span>{stepLabel(step)}</span>
                      <span className="text-xs text-muted-foreground">({step})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!selectedGate} onOpenChange={(open) => { if (!open) setSelectedGate(null); }}>
        {selectedGate && (
          <DialogContent className="max-w-md" data-testid="dialog-gate-detail">
            <DialogHeader>
              <DialogTitle className="text-base" data-testid="text-dialog-gate-title">
                {stepLabel(selectedGate.key)} Gate
              </DialogTitle>
              <DialogDescription>
                <Badge variant="outline" className="no-default-active-elevate">{selectedGate.gate.error}</Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">{selectedGate.gate.message}</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                {selectedGate.gate.requires_stage && (
                  <div className="flex items-center gap-1.5">
                    <Workflow className="w-3.5 h-3.5" />
                    Requires stage: <Badge variant="secondary" className="no-default-active-elevate">{stepLabel(selectedGate.gate.requires_stage)}</Badge>
                  </div>
                )}
                {selectedGate.gate.requires_verify_pass && (
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Requires verify to pass
                  </div>
                )}
                {selectedGate.gate.requires_docs_locked && (
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Requires docs to be locked
                  </div>
                )}
                {selectedGate.gate.requires_tests_pass && (
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Requires tests to pass
                  </div>
                )}
                {selectedGate.gate.allow_override !== undefined && (
                  <div className="flex items-center gap-1.5">
                    Override: {typeof selectedGate.gate.allow_override === "string" ? selectedGate.gate.allow_override : selectedGate.gate.allow_override ? "Allowed" : "Not allowed"}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
