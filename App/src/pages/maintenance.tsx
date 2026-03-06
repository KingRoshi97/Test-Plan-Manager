import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Wrench, Shield, Search, Zap, Calendar, FileText, Settings } from "lucide-react";

function OverviewTab({ data }: { data: any }) {
  const s = data.summary;
  const cards = [
    { label: "Modes", value: s.modes, color: "blue", icon: Settings },
    { label: "Gates", value: s.gates, color: "red", icon: Shield },
    { label: "Detector Packs", value: s.detectorPacks, color: "purple", icon: Search },
    { label: "Patch Types", value: s.patchTypes, color: "green", icon: Zap },
    { label: "Schedules", value: s.schedules, color: "amber", icon: Calendar },
    { label: "Policies", value: s.policies, color: "indigo", icon: FileText },
    { label: "Schemas", value: s.schemas, color: "gray", icon: FileText },
    { label: "Registries", value: s.registries, color: "gray", icon: FileText },
  ];

  const enabledSchedules = data.schedules.filter((s: any) => s.status !== "disabled").length;
  const disabledSchedules = data.schedules.length - enabledSchedules;

  const musPolicy = data.policies.find((p: any) => p.policy_id === "MUS-POLICY");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-lg border p-4 border-[hsl(var(--border))] bg-[hsl(var(--card))]`}>
            <div className="flex items-center gap-2 mb-2">
              <c.icon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{c.label}</span>
            </div>
            <div className="text-2xl font-bold text-[hsl(var(--card-foreground))]">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">Schedule Status</h3>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{enabledSchedules}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Enabled</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-500">{disabledSchedules}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Disabled</div>
            </div>
          </div>
        </div>

        {musPolicy && (
          <div className="border rounded-lg p-4 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">MUS Policy</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Apply consent required</span>
                <span className={musPolicy.consent?.apply_required ? "text-green-600 font-medium" : "text-red-600"}>{musPolicy.consent?.apply_required ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Publish consent required</span>
                <span className={musPolicy.consent?.publish_required ? "text-green-600 font-medium" : "text-red-600"}>{musPolicy.consent?.publish_required ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Token cap (default)</span>
                <span className="text-[hsl(var(--card-foreground))]">{musPolicy.budgets_default?.token_cap?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Max proposals per run</span>
                <span className="text-[hsl(var(--card-foreground))]">{musPolicy.proposal_rules?.max_proposal_packs_per_run}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModesTab({ modes }: { modes: any[] }) {
  return (
    <div className="border rounded-lg overflow-hidden border-[hsl(var(--border))]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[hsl(var(--muted))]">
            <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">ID</th>
            <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Name</th>
            <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Execution</th>
            <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Triggers</th>
            <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Apply</th>
            <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Publish</th>
            <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Gates</th>
            <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Token Cap</th>
          </tr>
        </thead>
        <tbody>
          {modes.map((m: any) => (
            <tr key={m.mode_id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.5)]">
              <td className="px-3 py-2 font-mono text-xs">{m.mode_id}</td>
              <td className="px-3 py-2 font-medium text-[hsl(var(--foreground))]">{m.name}</td>
              <td className="px-3 py-2">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${m.execution_class === "manual_only" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"}`}>
                  {m.execution_class === "manual_only" ? "Manual" : "Scheduled OK"}
                </span>
              </td>
              <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">{m.allowed_triggers?.join(", ")}</td>
              <td className="px-3 py-2">
                {m.hard_constraints?.no_apply ? (
                  <span className="text-xs text-red-600">Blocked</span>
                ) : (
                  <span className="text-xs text-green-600 font-medium">Allowed</span>
                )}
              </td>
              <td className="px-3 py-2">
                {m.hard_constraints?.no_publish ? (
                  <span className="text-xs text-red-600">Blocked</span>
                ) : (
                  <span className="text-xs text-green-600 font-medium">Allowed</span>
                )}
              </td>
              <td className="px-3 py-2 text-xs font-mono text-[hsl(var(--muted-foreground))]">{m.required_gates?.join(", ")}</td>
              <td className="px-3 py-2 text-xs font-mono">{m.default_budgets?.token_cap?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GatesDetectorsTab({ gates, detectors }: { gates: any[]; detectors: any[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Gate Rules ({gates.length})</h3>
        <div className="space-y-3">
          {gates.map((g: any) => (
            <div key={g.gate_rule_id} className="border rounded-lg p-4 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  <span className="font-mono text-sm font-medium text-[hsl(var(--card-foreground))]">{g.gate_rule_id}</span>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">{g.name}</span>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${g.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-800"}`}>
                  {g.status}
                </span>
              </div>
              {g.predicate?.clauses && (
                <div className="mt-2">
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Predicate ({g.predicate.type}):</div>
                  <div className="flex flex-wrap gap-1">
                    {g.predicate.clauses.map((c: any, i: number) => (
                      <span key={i} className="inline-flex px-2 py-0.5 rounded bg-[hsl(var(--muted))] text-xs font-mono text-[hsl(var(--muted-foreground))]">
                        {c.type}{c.approval_type ? `(${c.approval_type})` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {g.evidence_requirements && g.evidence_requirements.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Evidence required:</div>
                  <div className="flex flex-wrap gap-1">
                    {g.evidence_requirements.map((e: string, i: number) => (
                      <span key={i} className="inline-flex px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300">{e}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Detector Packs ({detectors.length})</h3>
        <div className="space-y-3">
          {detectors.map((d: any) => (
            <div key={d.detector_pack_id} className="border rounded-lg p-4 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-purple-500" />
                <span className="font-mono text-sm font-medium text-[hsl(var(--card-foreground))]">{d.detector_pack_id}</span>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">{d.name}</span>
              </div>
              <div className="flex gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                <span>Scopes: {d.allowed_scopes?.asset_classes?.join(", ") || "all"}</span>
                <span>Checks: {d.checks?.length ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PatchScheduleTab({ patches, schedules }: { patches: any[]; schedules: any[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Patch Types ({patches.length})</h3>
        <div className="border rounded-lg overflow-hidden border-[hsl(var(--border))]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[hsl(var(--muted))]">
                <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">ID</th>
                <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Name</th>
                <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Targets</th>
                <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Validators</th>
                <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Risk</th>
              </tr>
            </thead>
            <tbody>
              {patches.map((p: any) => (
                <tr key={p.patch_type_id} className="border-t border-[hsl(var(--border))]">
                  <td className="px-3 py-2 font-mono text-xs">{p.patch_type_id}</td>
                  <td className="px-3 py-2 text-[hsl(var(--foreground))]">{p.name}</td>
                  <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">{p.allowed_targets?.join(", ")}</td>
                  <td className="px-3 py-2 text-xs font-mono text-[hsl(var(--muted-foreground))]">{p.validators?.join(", ")}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.risk_class_default === "safe" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"}`}>
                      {p.risk_class_default || "unknown"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Schedules ({schedules.length})</h3>
        <div className="space-y-3">
          {schedules.map((s: any) => (
            <div key={s.schedule_id} className="border rounded-lg p-4 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span className="font-mono text-sm font-medium text-[hsl(var(--card-foreground))]">{s.schedule_id}</span>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.status === "disabled" ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"}`}>
                  {s.status}
                </span>
              </div>
              <div className="space-y-1 text-xs text-[hsl(var(--muted-foreground))]">
                <div>RRULE: <span className="font-mono">{s.rrule}</span></div>
                <div>Modes: {s.allowed_modes?.join(", ")}</div>
                <div>Detectors: {s.allowed_detector_packs?.join(", ")}</div>
                <div>Scopes: {s.allowed_scopes?.asset_classes?.join(", ")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PoliciesTab({ policies }: { policies: any[] }) {
  return (
    <div className="space-y-4">
      {policies.map((p: any) => (
        <div key={p.policy_id} className="border rounded-lg p-4 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono text-sm font-semibold text-[hsl(var(--card-foreground))]">{p.policy_id}</h3>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">v{p.version}</span>
          </div>
          <pre className="text-xs bg-[hsl(var(--muted))] rounded p-3 overflow-auto max-h-64 text-[hsl(var(--foreground))]">
            {JSON.stringify(Object.fromEntries(Object.entries(p).filter(([k]) => !["policy_id", "version", "updated_at"].includes(k))), null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}

function SchemasTab({ schemas }: { schemas: any[] }) {
  return (
    <div className="border rounded-lg overflow-hidden border-[hsl(var(--border))]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[hsl(var(--muted))]">
            <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Schema</th>
            <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Properties</th>
            <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Required</th>
          </tr>
        </thead>
        <tbody>
          {schemas.map((s: any) => (
            <tr key={s.filename} className="border-t border-[hsl(var(--border))]">
              <td className="px-3 py-2 font-mono text-xs text-[hsl(var(--foreground))]">{s.filename}</td>
              <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">{s.properties?.join(", ")}</td>
              <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">{s.required?.length ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MaintenancePage() {
  const [tab, setTab] = useState("overview");
  const { data, error, isLoading } = useQuery<any>({
    queryKey: ["/api/maintenance"],
    queryFn: () => fetch("/api/maintenance").then((r) => r.json()),
  });
  const { data: schemas } = useQuery<any[]>({
    queryKey: ["/api/maintenance/schemas"],
    queryFn: () => fetch("/api/maintenance/schemas").then((r) => r.json()),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-red-600 p-4">Failed to load maintenance data</div>;
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Wrench },
    { id: "modes", label: `Modes (${data.modes?.length ?? 0})`, icon: Settings },
    { id: "gates", label: "Gates & Detectors", icon: Shield },
    { id: "patches", label: "Patches & Schedules", icon: Zap },
    { id: "policies", label: `Policies (${data.policies?.length ?? 0})`, icon: FileText },
    { id: "schemas", label: `Schemas (${schemas?.length ?? data.schemaCount ?? 0})`, icon: FileText },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Maintenance & Update System</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">MUS governance, modes, gates, and policies</p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-[hsl(var(--border))]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? "border-[hsl(var(--primary))] text-[hsl(var(--foreground))]" : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab data={data} />}
      {tab === "modes" && <ModesTab modes={data.modes ?? []} />}
      {tab === "gates" && <GatesDetectorsTab gates={data.gates ?? []} detectors={data.detectorPacks ?? []} />}
      {tab === "patches" && <PatchScheduleTab patches={data.patchTypes ?? []} schedules={data.schedules ?? []} />}
      {tab === "policies" && <PoliciesTab policies={data.policies ?? []} />}
      {tab === "schemas" && <SchemasTab schemas={schemas ?? []} />}
    </div>
  );
}
