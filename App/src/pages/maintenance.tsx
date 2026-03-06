import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Loader2, Wrench, Shield, Search, Zap, Calendar, FileText, Settings, Play, Plus, RotateCcw, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { GlassPanel } from "../components/ui/glass-panel";
import { StatusChip } from "../components/ui/status-chip";
import { MetricCard } from "../components/ui/metric-card";

const UNIT_TYPES = ["dep_upgrade", "migration", "refactor", "test_hardening", "ci_fix", "security_patch"];

function getRunStatusVariant(status: string) {
  switch (status) {
    case "planned": return "processing" as const;
    case "applying": return "warning" as const;
    case "verifying": return "intelligence" as const;
    case "complete": return "success" as const;
    case "failed": return "failure" as const;
    case "rolling_back": return "warning" as const;
    case "cancelled": return "neutral" as const;
    case "blocked": return "warning" as const;
    case "paused": return "neutral" as const;
    default: return "neutral" as const;
  }
}

function getUnitStatusVariant(status: string) {
  switch (status) {
    case "done": return "success" as const;
    case "failed": return "failure" as const;
    default: return "neutral" as const;
  }
}

function OverviewTab({ data }: { data: any }) {
  const s = data.summary;
  const cards: { label: string; value: number; icon: any; accent: any }[] = [
    { label: "Modes", value: s.modes, icon: Settings, accent: "cyan" },
    { label: "Gates", value: s.gates, icon: Shield, accent: "red" },
    { label: "Detector Packs", value: s.detectorPacks, icon: Search, accent: "violet" },
    { label: "Patch Types", value: s.patchTypes, icon: Zap, accent: "amber" },
    { label: "Schedules", value: s.schedules, icon: Calendar, accent: "green" },
    { label: "Policies", value: s.policies, icon: FileText, accent: "cyan" },
    { label: "Schemas", value: s.schemas, icon: FileText, accent: "violet" },
    { label: "Registries", value: s.registries, icon: FileText, accent: "amber" },
  ];
  const enabledSchedules = data.schedules.filter((s: any) => s.status !== "disabled").length;
  const disabledSchedules = data.schedules.length - enabledSchedules;
  const musPolicy = data.policies.find((p: any) => p.policy_id === "MUS-POLICY");
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <MetricCard
            key={c.label}
            icon={c.icon}
            label={c.label}
            value={c.value}
            accent={c.accent}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassPanel solid glow="green" className="p-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">Schedule Status</h3>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-[hsl(var(--status-success))]">{enabledSchedules}</div>
              <div className="text-system-label">Enabled</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[hsl(var(--muted-foreground))]">{disabledSchedules}</div>
              <div className="text-system-label">Disabled</div>
            </div>
          </div>
        </GlassPanel>
        {musPolicy && (
          <GlassPanel solid glow="cyan" className="p-4">
            <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">MUS Policy</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Apply consent required</span>
                <StatusChip variant={musPolicy.consent?.apply_required ? "success" : "failure"} label={musPolicy.consent?.apply_required ? "Yes" : "No"} />
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Publish consent required</span>
                <StatusChip variant={musPolicy.consent?.publish_required ? "success" : "failure"} label={musPolicy.consent?.publish_required ? "Yes" : "No"} />
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Token cap (default)</span>
                <span className="font-mono-tech text-[hsl(var(--card-foreground))]">{musPolicy.budgets_default?.token_cap?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Max proposals per run</span>
                <span className="font-mono-tech text-[hsl(var(--card-foreground))]">{musPolicy.proposal_rules?.max_proposal_packs_per_run}</span>
              </div>
            </div>
          </GlassPanel>
        )}
      </div>
    </div>
  );
}

function ModesTab({ modes }: { modes: any[] }) {
  return (
    <GlassPanel solid className="overflow-hidden animate-fade-in">
      <table className="w-full text-sm">
        <thead>
          <tr className="glass-panel-solid glow-border-cyan">
            <th className="text-left px-3 py-2 text-system-label">ID</th>
            <th className="text-left px-3 py-2 text-system-label">Name</th>
            <th className="text-left px-3 py-2 text-system-label">Execution</th>
            <th className="text-left px-3 py-2 text-system-label">Triggers</th>
            <th className="text-left px-3 py-2 text-system-label">Apply</th>
            <th className="text-left px-3 py-2 text-system-label">Publish</th>
            <th className="text-left px-3 py-2 text-system-label">Gates</th>
            <th className="text-left px-3 py-2 text-system-label">Token Cap</th>
          </tr>
        </thead>
        <tbody>
          {modes.map((m: any) => (
            <tr key={m.mode_id} className="border-t border-[hsl(var(--glass-border))] hover:bg-[hsl(var(--accent)/0.5)] transition-colors">
              <td className="px-3 py-2 font-mono-tech text-xs">{m.mode_id}</td>
              <td className="px-3 py-2 font-medium text-[hsl(var(--foreground))]">{m.name}</td>
              <td className="px-3 py-2">
                <StatusChip
                  variant={m.execution_class === "manual_only" ? "warning" : "processing"}
                  label={m.execution_class === "manual_only" ? "Manual" : "Scheduled OK"}
                />
              </td>
              <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">{m.allowed_triggers?.join(", ")}</td>
              <td className="px-3 py-2">
                <StatusChip variant={m.hard_constraints?.no_apply ? "failure" : "success"} label={m.hard_constraints?.no_apply ? "Blocked" : "Allowed"} />
              </td>
              <td className="px-3 py-2">
                <StatusChip variant={m.hard_constraints?.no_publish ? "failure" : "success"} label={m.hard_constraints?.no_publish ? "Blocked" : "Allowed"} />
              </td>
              <td className="px-3 py-2 text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">{m.required_gates?.join(", ")}</td>
              <td className="px-3 py-2 text-xs font-mono-tech">{m.default_budgets?.token_cap?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassPanel>
  );
}

function GatesDetectorsTab({ gates, detectors }: { gates: any[]; detectors: any[] }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Gate Rules ({gates.length})</h3>
        <div className="space-y-3">
          {gates.map((g: any) => (
            <GlassPanel key={g.gate_rule_id} solid className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[hsl(var(--status-failure))]" />
                  <span className="font-mono-tech text-sm font-medium text-[hsl(var(--card-foreground))]">{g.gate_rule_id}</span>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">{g.name}</span>
                </div>
                <StatusChip variant={g.status === "active" ? "success" : "neutral"} label={g.status} />
              </div>
              {g.predicate?.clauses && (
                <div className="mt-2">
                  <div className="text-system-label mb-1">Predicate ({g.predicate.type}):</div>
                  <div className="flex flex-wrap gap-1">
                    {g.predicate.clauses.map((c: any, i: number) => (
                      <span key={i} className="inline-flex px-2 py-0.5 rounded glass-panel-solid text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">{c.type}{c.approval_type ? `(${c.approval_type})` : ""}</span>
                    ))}
                  </div>
                </div>
              )}
              {g.evidence_requirements && g.evidence_requirements.length > 0 && (
                <div className="mt-2">
                  <div className="text-system-label mb-1">Evidence required:</div>
                  <div className="flex flex-wrap gap-1">
                    {g.evidence_requirements.map((e: string, i: number) => (
                      <span key={i} className="inline-flex px-1.5 py-0.5 rounded bg-[hsl(var(--status-processing)/0.12)] text-xs text-[hsl(var(--status-processing))]">{e}</span>
                    ))}
                  </div>
                </div>
              )}
            </GlassPanel>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Detector Packs ({detectors.length})</h3>
        <div className="space-y-3">
          {detectors.map((d: any) => (
            <GlassPanel key={d.detector_pack_id} solid className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-[hsl(var(--status-intelligence))]" />
                <span className="font-mono-tech text-sm font-medium text-[hsl(var(--card-foreground))]">{d.detector_pack_id}</span>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">{d.name}</span>
              </div>
              <div className="flex gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                <span>Scopes: {d.allowed_scopes?.asset_classes?.join(", ") || "all"}</span>
                <span>Checks: {d.checks?.length ?? 0}</span>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </div>
  );
}

function PatchScheduleTab({ patches, schedules, onToggleSchedule }: { patches: any[]; schedules: any[]; onToggleSchedule: (id: string, status: string) => void }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Patch Types ({patches.length})</h3>
        <GlassPanel solid className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="glass-panel-solid glow-border-amber">
                <th className="text-left px-3 py-2 text-system-label">ID</th>
                <th className="text-left px-3 py-2 text-system-label">Name</th>
                <th className="text-left px-3 py-2 text-system-label">Targets</th>
                <th className="text-left px-3 py-2 text-system-label">Validators</th>
                <th className="text-left px-3 py-2 text-system-label">Risk</th>
              </tr>
            </thead>
            <tbody>
              {patches.map((p: any) => (
                <tr key={p.patch_type_id} className="border-t border-[hsl(var(--glass-border))] hover:bg-[hsl(var(--accent)/0.5)] transition-colors">
                  <td className="px-3 py-2 font-mono-tech text-xs">{p.patch_type_id}</td>
                  <td className="px-3 py-2 text-[hsl(var(--foreground))]">{p.name}</td>
                  <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">{p.allowed_targets?.join(", ")}</td>
                  <td className="px-3 py-2 text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">{p.validators?.join(", ")}</td>
                  <td className="px-3 py-2">
                    <StatusChip variant={p.risk_class_default === "safe" ? "success" : "warning"} label={p.risk_class_default || "unknown"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Schedules ({schedules.length})</h3>
        <div className="space-y-3">
          {schedules.map((s: any) => (
            <GlassPanel key={s.schedule_id} solid className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[hsl(var(--status-warning))]" />
                  <span className="font-mono-tech text-sm font-medium text-[hsl(var(--card-foreground))]">{s.schedule_id}</span>
                </div>
                <button
                  onClick={() => onToggleSchedule(s.schedule_id, s.status === "disabled" ? "enabled" : "disabled")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${s.status !== "disabled" ? "bg-[hsl(var(--status-success))]" : "bg-[hsl(var(--muted))]"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${s.status !== "disabled" ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="space-y-1 text-xs text-[hsl(var(--muted-foreground))]">
                <div>RRULE: <span className="font-mono-tech">{s.rrule}</span></div>
                <div>Modes: {s.allowed_modes?.join(", ")}</div>
                <div>Detectors: {s.allowed_detector_packs?.join(", ")}</div>
                <div>Scopes: {s.allowed_scopes?.asset_classes?.join(", ")}</div>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </div>
  );
}

function PoliciesTab({ policies }: { policies: any[] }) {
  return (
    <div className="space-y-4 animate-fade-in">
      {policies.map((p: any) => (
        <GlassPanel key={p.policy_id} solid className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono-tech text-sm font-semibold text-[hsl(var(--card-foreground))]">{p.policy_id}</h3>
            <span className="text-system-label">v{p.version}</span>
          </div>
          <pre className="text-xs glass-panel rounded p-3 overflow-auto max-h-64 text-[hsl(var(--foreground))] scrollbar-thin font-mono-tech">
            {JSON.stringify(Object.fromEntries(Object.entries(p).filter(([k]) => !["policy_id", "version", "updated_at"].includes(k))), null, 2)}
          </pre>
        </GlassPanel>
      ))}
    </div>
  );
}

function SchemasTab({ schemas }: { schemas: any[] }) {
  return (
    <GlassPanel solid className="overflow-hidden animate-fade-in">
      <table className="w-full text-sm">
        <thead>
          <tr className="glass-panel-solid glow-border-violet">
            <th className="text-left px-3 py-2 text-system-label">Schema</th>
            <th className="text-left px-3 py-2 text-system-label">Properties</th>
            <th className="text-left px-3 py-2 text-system-label">Required</th>
          </tr>
        </thead>
        <tbody>
          {schemas.map((s: any) => (
            <tr key={s.filename} className="border-t border-[hsl(var(--glass-border))] hover:bg-[hsl(var(--accent)/0.5)] transition-colors">
              <td className="px-3 py-2 font-mono-tech text-xs text-[hsl(var(--foreground))]">{s.filename}</td>
              <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">{s.properties?.join(", ")}</td>
              <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">{s.required?.length ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassPanel>
  );
}

function RunsTab({ modes }: { modes: any[] }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [formMode, setFormMode] = useState("");
  const [formIntent, setFormIntent] = useState("dep_upgrade");
  const [formRisk, setFormRisk] = useState("low");
  const [formBaseline, setFormBaseline] = useState("HEAD");
  const [formUnitId, setFormUnitId] = useState("MU-001");
  const [formUnitType, setFormUnitType] = useState("dep_upgrade");
  const [formUnitPaths, setFormUnitPaths] = useState("Axion/");
  const [formError, setFormError] = useState("");

  const { data: runs = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/maintenance/runs"],
    queryFn: () => fetch("/api/maintenance/runs").then((r) => r.json()),
    refetchInterval: 3000,
  });

  const createRun = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/maintenance/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/maintenance/runs"] }); setShowCreate(false); setFormError(""); },
    onError: (err: Error) => setFormError(err.message),
  });

  const runAction = useMutation({
    mutationFn: async ({ runId, action }: { runId: string; action: string }) => {
      const res = await fetch(`/api/maintenance/runs/${runId}/${action}`, { method: "POST", headers: { "Content-Type": "application/json" } });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/maintenance/runs"] }),
  });

  const activeModes = modes.filter((m: any) => m.status === "active");

  function handleCreate() {
    if (!formMode) { setFormError("Select a maintenance mode"); return; }
    createRun.mutate({
      mode_id: formMode,
      intent_type: formIntent,
      risk_class: formRisk,
      baseline_revision: formBaseline,
      units: [{ unit_id: formUnitId, type: formUnitType, target_paths: formUnitPaths.split(",").map((p: string) => p.trim()).filter(Boolean) }],
    });
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Maintenance Runs ({runs.length})</h3>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Run
        </button>
      </div>

      {showCreate && (
        <GlassPanel solid glow="cyan" className="p-4 space-y-3">
          <h4 className="text-sm font-semibold text-[hsl(var(--card-foreground))]">Create Maintenance Run</h4>
          {formError && <div className="text-sm text-[hsl(var(--status-failure))] bg-[hsl(var(--status-failure)/0.1)] rounded p-2">{formError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-system-label mb-1">Mode</label>
              <select value={formMode} onChange={(e) => setFormMode(e.target.value)} className="w-full rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]">
                <option value="">Select mode...</option>
                {activeModes.map((m: any) => <option key={m.mode_id} value={m.mode_id}>{m.mode_id} - {m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-system-label mb-1">Intent Type</label>
              <select value={formIntent} onChange={(e) => setFormIntent(e.target.value)} className="w-full rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]">
                {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-system-label mb-1">Risk Class</label>
              <select value={formRisk} onChange={(e) => setFormRisk(e.target.value)} className="w-full rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-system-label mb-1">Baseline Revision</label>
              <input value={formBaseline} onChange={(e) => setFormBaseline(e.target.value)} className="w-full rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]" />
            </div>
          </div>
          <div className="border-t border-[hsl(var(--glass-border))] pt-3">
            <h5 className="text-system-label mb-2">Work Unit</h5>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-system-label mb-1">Unit ID</label>
                <input value={formUnitId} onChange={(e) => setFormUnitId(e.target.value)} className="w-full rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]" />
              </div>
              <div>
                <label className="block text-system-label mb-1">Type</label>
                <select value={formUnitType} onChange={(e) => setFormUnitType(e.target.value)} className="w-full rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]">
                  {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-system-label mb-1">Target Paths (comma-separated)</label>
                <input value={formUnitPaths} onChange={(e) => setFormUnitPaths(e.target.value)} className="w-full rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowCreate(false); setFormError(""); }} className="px-3 py-1.5 rounded-md text-sm border border-[hsl(var(--glass-border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={createRun.isPending} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50 transition-opacity">
              {createRun.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Plan Run
            </button>
          </div>
        </GlassPanel>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" /></div>
      ) : runs.length === 0 ? (
        <GlassPanel solid className="text-center py-12">
          <Wrench className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--muted-foreground))] opacity-50" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No maintenance runs yet</p>
          <p className="text-xs mt-1 text-[hsl(var(--muted-foreground))]">Create a new run to get started</p>
        </GlassPanel>
      ) : (
        <div className="space-y-2">
          {runs.map((run: any) => (
            <GlassPanel key={run.run_id} solid hover className="overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[hsl(var(--accent)/0.3)] transition-colors" onClick={() => setExpandedRun(expandedRun === run.run_id ? null : run.run_id)}>
                <div className="flex items-center gap-3">
                  <span className="font-mono-tech text-sm font-medium text-[hsl(var(--card-foreground))]">{run.run_id}</span>
                  <StatusChip variant={getRunStatusVariant(run.status)} label={run.status} />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{run.mode_id}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{run.intent_type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{run.units?.length ?? 0} unit(s)</span>
                  <span className="text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">{new Date(run.created_at).toLocaleString()}</span>
                  {expandedRun === run.run_id ? <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> : <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
                </div>
              </div>

              {expandedRun === run.run_id && (
                <div className="border-t border-[hsl(var(--glass-border))] px-4 py-3 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div><span className="text-[hsl(var(--muted-foreground))]">Risk Class:</span> <span className="font-medium text-[hsl(var(--foreground))]">{run.risk_class}</span></div>
                    <div><span className="text-[hsl(var(--muted-foreground))]">Baseline:</span> <span className="font-mono-tech text-[hsl(var(--foreground))]">{run.baseline_revision}</span></div>
                    <div><span className="text-[hsl(var(--muted-foreground))]">Created:</span> <span className="font-mono-tech text-[hsl(var(--foreground))]">{new Date(run.created_at).toLocaleString()}</span></div>
                    <div><span className="text-[hsl(var(--muted-foreground))]">Updated:</span> <span className="font-mono-tech text-[hsl(var(--foreground))]">{new Date(run.updated_at).toLocaleString()}</span></div>
                  </div>

                  {run.units?.length > 0 && (
                    <div>
                      <h5 className="text-system-label mb-2">Units</h5>
                      <GlassPanel className="overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="glass-panel-solid">
                              <th className="text-left px-2 py-1 text-system-label">Unit ID</th>
                              <th className="text-left px-2 py-1 text-system-label">Type</th>
                              <th className="text-left px-2 py-1 text-system-label">Status</th>
                              <th className="text-left px-2 py-1 text-system-label">Targets</th>
                              <th className="text-left px-2 py-1 text-system-label">Verification</th>
                            </tr>
                          </thead>
                          <tbody>
                            {run.units.map((u: any) => (
                              <tr key={u.unit_id} className="border-t border-[hsl(var(--glass-border))]">
                                <td className="px-2 py-1 font-mono-tech">{u.unit_id}</td>
                                <td className="px-2 py-1">{u.type}</td>
                                <td className="px-2 py-1"><StatusChip variant={getUnitStatusVariant(u.status)} label={u.status} /></td>
                                <td className="px-2 py-1 font-mono-tech">{u.target_paths?.join(", ")}</td>
                                <td className="px-2 py-1">
                                  {u.verification_results?.length > 0 ? u.verification_results.map((v: any, i: number) => (
                                    <span key={i} className={`inline-flex items-center gap-0.5 ${v.passed ? "text-[hsl(var(--status-success))]" : "text-[hsl(var(--status-failure))]"}`}>
                                      {v.passed ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />} {v.details}
                                    </span>
                                  )) : <span className="text-[hsl(var(--muted-foreground))]">-</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </GlassPanel>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-[hsl(var(--glass-border))]">
                    {run.status === "planned" && (
                      <button onClick={() => runAction.mutate({ runId: run.run_id, action: "apply" })} disabled={runAction.isPending} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-[hsl(var(--status-warning))] text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
                        <Play className="w-3.5 h-3.5" /> Apply
                      </button>
                    )}
                    {run.status === "applying" && (
                      <button onClick={() => runAction.mutate({ runId: run.run_id, action: "verify" })} disabled={runAction.isPending} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-[hsl(var(--status-intelligence))] text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
                        <CheckCircle className="w-3.5 h-3.5" /> Verify
                      </button>
                    )}
                    {run.status === "verifying" && (
                      <button onClick={() => runAction.mutate({ runId: run.run_id, action: "complete" })} disabled={runAction.isPending} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-[hsl(var(--status-success))] text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
                        <CheckCircle className="w-3.5 h-3.5" /> Complete
                      </button>
                    )}
                    {["applying", "verifying", "failed", "blocked"].includes(run.status) && (
                      <button onClick={() => runAction.mutate({ runId: run.run_id, action: "rollback" })} disabled={runAction.isPending} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-[hsl(var(--status-failure))] text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
                        <RotateCcw className="w-3.5 h-3.5" /> Rollback
                      </button>
                    )}
                    {runAction.isPending && <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--muted-foreground))]" />}
                    {runAction.error && <span className="text-xs text-[hsl(var(--status-failure))]">{(runAction.error as Error).message}</span>}
                  </div>
                </div>
              )}
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("overview");
  const { data, error, isLoading } = useQuery<any>({
    queryKey: ["/api/maintenance"],
    queryFn: () => fetch("/api/maintenance").then((r) => r.json()),
  });
  const { data: schemas } = useQuery<any[]>({
    queryKey: ["/api/maintenance/schemas"],
    queryFn: () => fetch("/api/maintenance/schemas").then((r) => r.json()),
  });

  const toggleSchedule = useMutation({
    mutationFn: async ({ scheduleId, status }: { scheduleId: string; status: string }) => {
      const res = await fetch(`/api/maintenance/schedules/${scheduleId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] }),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" /></div>;
  }

  if (error || !data) {
    return <div className="text-[hsl(var(--status-failure))] p-4">Failed to load maintenance data</div>;
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Wrench },
    { id: "runs", label: "Runs", icon: Play },
    { id: "modes", label: `Modes (${data.modes?.length ?? 0})`, icon: Settings },
    { id: "gates", label: "Gates & Detectors", icon: Shield },
    { id: "patches", label: "Patches & Schedules", icon: Zap },
    { id: "policies", label: `Policies (${data.policies?.length ?? 0})`, icon: FileText },
    { id: "schemas", label: `Schemas (${schemas?.length ?? data.schemaCount ?? 0})`, icon: FileText },
  ];

  const modesCount = data.modes?.length ?? 0;
  const enabledSchedules = data.schedules?.filter((s: any) => s.status !== "disabled").length ?? 0;

  return (
    <div className="animate-fade-in">
      <GlassPanel glow="amber" className="p-5 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--glow-amber)/0.03)] to-transparent pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-[hsl(var(--status-warning))]" />
              <h1 className="text-xl font-bold text-[hsl(var(--foreground))] tracking-tight">Maintenance & Update System</h1>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">MUS Governance</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusChip variant="processing" label={`${modesCount} Modes`} size="md" />
            <StatusChip variant="success" label={`${enabledSchedules} Active Schedules`} size="md" />
          </div>
        </div>
      </GlassPanel>

      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-thin pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
              tab === t.id
                ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] border border-transparent"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab data={data} />}
      {tab === "runs" && <RunsTab modes={data.modes ?? []} />}
      {tab === "modes" && <ModesTab modes={data.modes ?? []} />}
      {tab === "gates" && <GatesDetectorsTab gates={data.gates ?? []} detectors={data.detectorPacks ?? []} />}
      {tab === "patches" && <PatchScheduleTab patches={data.patchTypes ?? []} schedules={data.schedules ?? []} onToggleSchedule={(id, status) => toggleSchedule.mutate({ scheduleId: id, status })} />}
      {tab === "policies" && <PoliciesTab policies={data.policies ?? []} />}
      {tab === "schemas" && <SchemasTab schemas={schemas ?? []} />}
    </div>
  );
}
