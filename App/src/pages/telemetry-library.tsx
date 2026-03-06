import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Loader2, FileJson, BookOpen, Database, ChevronDown, ChevronRight, Shield, Activity, Radio, Lock, BarChart3, Eye } from "lucide-react";

interface TelemetryOverview {
  groups: Record<string, string[]>;
  schemas: string[];
  registries: string[];
  counts: { docs: number; schemas: number; registries: number; gates: number; eventTypes: number; sinks: number };
}

interface SchemaEntry {
  filename: string;
  content: unknown;
}

interface RegistryEntry {
  filename: string;
  content: unknown;
}

interface DocEntry {
  filename: string;
  frontmatter: Record<string, string>;
  content: string;
}

const TEL_GROUP_LABELS: Record<string, string> = {
  "TEL-0": "Purpose & Boundaries",
  "TEL-1": "Event Schemas",
  "TEL-2": "Run Metrics",
  "TEL-3": "Sink Policy",
  "TEL-4": "Privacy & Redaction",
  "TEL-5": "Telemetry Gates",
  "TEL-6": "Minimum Viable Set",
};

type TabId = "telemetry" | "documents" | "schemas" | "registries";

function ExpandableCard({ title, subtitle, children, defaultOpen = false }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[hsl(var(--border))] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-[hsl(var(--accent))] transition-colors"
      >
        {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
        <span className="font-medium text-sm">{title}</span>
        {subtitle && <span className="text-xs text-[hsl(var(--muted-foreground))] ml-auto">{subtitle}</span>}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[hsl(var(--border))]">
          {children}
        </div>
      )}
    </div>
  );
}

function TelemetryTab() {
  const { data: overview, isLoading: overviewLoading } = useQuery<TelemetryOverview>({
    queryKey: ["/api/telemetry-library"],
    queryFn: () => apiRequest("/api/telemetry-library"),
  });

  const { data: registries = [], isLoading: registriesLoading } = useQuery<RegistryEntry[]>({
    queryKey: ["/api/telemetry-library/registries"],
    queryFn: () => apiRequest("/api/telemetry-library/registries"),
  });

  if (overviewLoading || registriesLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const eventTypesRegistry = registries.find(r => r.filename === "telemetry_event_types.v1.json");
  const eventTypes = (eventTypesRegistry?.content as any)?.types ?? [];

  const sinkPolicyRegistry = registries.find(r => r.filename === "telemetry_sink_policy.v1.json");
  const sinks = (sinkPolicyRegistry?.content as any)?.sinks ?? [];
  const redaction = (sinkPolicyRegistry?.content as any)?.redaction ?? {};

  const privacyPolicyRegistry = registries.find(r => r.filename === "telemetry_privacy_policy.v1.json");
  const dataClasses = (privacyPolicyRegistry?.content as any)?.data_classes ?? {};
  const freeText = (privacyPolicyRegistry?.content as any)?.free_text ?? {};
  const externalSinkRules = (privacyPolicyRegistry?.content as any)?.external_sink_rules ?? {};

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Radio className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Event Types (TEL-1)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{eventTypes.length} registered event types</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Event Type</th>
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Schema Ref</th>
                <th className="text-left py-2 font-medium text-[hsl(var(--muted-foreground))]">Description</th>
              </tr>
            </thead>
            <tbody>
              {eventTypes.map((et: any) => (
                <tr key={et.event_type} className="border-b border-[hsl(var(--border))]/50">
                  <td className="py-2 pr-4 font-mono font-bold text-[hsl(var(--primary))]">{et.event_type}</td>
                  <td className="py-2 pr-4">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">{et.schema_ref}</span>
                  </td>
                  <td className="py-2 text-[hsl(var(--foreground))]">{et.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Run Metrics Overview (TEL-2)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Aggregate metrics per run/stage/gate</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Run Metrics</p>
            <div className="space-y-2">
              {["status", "duration_ms", "tokens_in", "tokens_out", "cost_usd"].map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                    field === "status" ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                  }`}>{field === "status" ? "required" : "optional"}</span>
                  <span className="text-xs font-mono text-[hsl(var(--foreground))]">{field}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Stage Metrics</p>
            <div className="space-y-2">
              {["stage_id", "status", "duration_ms", "artifacts_produced"].map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                    (field === "stage_id" || field === "status") ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                  }`}>{(field === "stage_id" || field === "status") ? "required" : "optional"}</span>
                  <span className="text-xs font-mono text-[hsl(var(--foreground))]">{field}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Gate Metrics</p>
            <div className="space-y-2">
              {["gate_id", "status"].map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-medium">required</span>
                  <span className="text-xs font-mono text-[hsl(var(--foreground))]">{field}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Sink Policy (TEL-3)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{sinks.length} configured sinks</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {sinks.map((sink: any) => (
            <div key={sink.sink_id} className="border border-[hsl(var(--border))] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{sink.sink_id}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                  sink.enabled ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}>{sink.enabled ? "enabled" : "disabled"}</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[hsl(var(--muted-foreground))]">type:</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">{sink.type}</span>
                </div>
                {sink.endpoint && (
                  <div className="flex items-center gap-2">
                    <span className="text-[hsl(var(--muted-foreground))]">endpoint:</span>
                    <span className="font-mono text-[hsl(var(--foreground))]">{sink.endpoint || "—"}</span>
                  </div>
                )}
                {sink.notes && (
                  <p className="text-[hsl(var(--muted-foreground))] mt-1">{sink.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Eye className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Redaction Overview (TEL-3)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Deny keys + deny patterns</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Deny Keys ({(redaction.deny_keys ?? []).length})</p>
            <div className="flex gap-1 flex-wrap">
              {(redaction.deny_keys ?? []).map((k: string) => (
                <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-mono">{k}</span>
              ))}
            </div>
          </div>
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Deny Patterns ({(redaction.deny_patterns ?? []).length})</p>
            <div className="space-y-1">
              {(redaction.deny_patterns ?? []).map((p: string, i: number) => (
                <div key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-mono break-all">{p}</div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-[hsl(var(--muted-foreground))]">external_strict_mode:</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                redaction.external_strict_mode ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
              }`}>{redaction.external_strict_mode ? "true" : "false"}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Lock className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Privacy Policy (TEL-4)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Data classes, free-text rules, external sink rules</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Data Classes</p>
            <div className="space-y-2">
              {Object.entries(dataClasses).map(([key, values]) => (
                <div key={key}>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                    key === "forbidden_always" ? "bg-red-500/10 text-red-400 border-red-500/30" :
                    key === "forbidden_by_default" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" :
                    "bg-green-500/10 text-green-400 border-green-500/30"
                  }`}>{key}</span>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {(values as string[]).map((v: string) => (
                      <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-400 border border-gray-500/30 font-mono">{v}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Free-Text Rules</p>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">Internal allowlist keys:</span>
                <div className="flex gap-1 flex-wrap mt-1">
                  {(freeText.internal_allowlist_keys ?? []).map((k: string) => (
                    <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">{k}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[hsl(var(--muted-foreground))]">max_chars_internal:</span>
                <span className="font-mono text-[hsl(var(--foreground))]">{freeText.max_chars_internal ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[hsl(var(--muted-foreground))]">external_allowed:</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                  freeText.external_allowed ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}>{freeText.external_allowed ? "true" : "false"}</span>
              </div>
            </div>
          </div>
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">External Sink Rules</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[hsl(var(--muted-foreground))]">block_on_unknown_keys:</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                  externalSinkRules.block_on_unknown_keys ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}>{externalSinkRules.block_on_unknown_keys ? "true" : "false"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[hsl(var(--muted-foreground))]">block_on_free_text:</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                  externalSinkRules.block_on_free_text ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}>{externalSinkRules.block_on_free_text ? "true" : "false"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Telemetry Gates (TEL-5)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">5 gates for telemetry compliance</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { id: "TEL-GATE-01", name: "Event types registry pinned + valid", severity: "hard_stop" },
            { id: "TEL-GATE-02", name: "Emitted events validate", severity: "warn" },
            { id: "TEL-GATE-03", name: "Sink policy pinned + valid", severity: "hard_stop" },
            { id: "TEL-GATE-04", name: "Redaction compliance", severity: "hard_stop" },
            { id: "TEL-GATE-05", name: "Non-interference", severity: "policy_controlled" },
          ].map((gate) => (
            <div key={gate.id} className="flex items-center gap-3 border border-[hsl(var(--border))] rounded-lg p-3">
              <code className="text-xs font-mono text-[hsl(var(--primary))] font-bold shrink-0">{gate.id}</code>
              <span className="text-sm text-[hsl(var(--foreground))] flex-1">{gate.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-blue-500/10 text-blue-400 border-blue-500/30">
                G_TELEMETRY
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                gate.severity === "hard_stop"
                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                  : gate.severity === "warn"
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                  : "bg-orange-500/10 text-orange-400 border-orange-500/30"
              }`}>
                {gate.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocumentsTab() {
  const { data: overview } = useQuery<TelemetryOverview>({
    queryKey: ["/api/telemetry-library"],
    queryFn: () => apiRequest("/api/telemetry-library"),
  });
  const { data: docs = [], isLoading } = useQuery<DocEntry[]>({
    queryKey: ["/api/telemetry-library/docs"],
    queryFn: () => apiRequest("/api/telemetry-library/docs"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const groups = overview?.groups ?? {};
  const sortedGroupKeys = Object.keys(groups).sort();

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map((groupKey) => {
        const label = TEL_GROUP_LABELS[groupKey] ?? groupKey;
        const filenames = groups[groupKey];
        const groupDocs = filenames.map((fn) => docs.find((d) => d.filename === fn)).filter(Boolean) as DocEntry[];

        return (
          <div key={groupKey}>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {groupKey}: {label}
              <span className="text-xs text-[hsl(var(--muted-foreground))] font-normal">({groupDocs.length} files)</span>
            </h3>
            <div className="space-y-2">
              {groupDocs.map((doc) => (
                <ExpandableCard
                  key={doc.filename}
                  title={doc.filename}
                  subtitle={doc.frontmatter.id || doc.frontmatter.section || ""}
                >
                  <pre className="text-xs whitespace-pre-wrap mt-2 text-[hsl(var(--foreground))]">{doc.content}</pre>
                </ExpandableCard>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SchemasTab() {
  const { data: schemas = [], isLoading } = useQuery<SchemaEntry[]>({
    queryKey: ["/api/telemetry-library/schemas"],
    queryFn: () => apiRequest("/api/telemetry-library/schemas"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-3">
      {schemas.map((s) => (
        <ExpandableCard key={s.filename} title={s.filename} subtitle="JSON Schema">
          <pre className="text-xs whitespace-pre-wrap mt-2 overflow-auto max-h-96 text-[hsl(var(--foreground))]">
            {JSON.stringify(s.content, null, 2)}
          </pre>
        </ExpandableCard>
      ))}
    </div>
  );
}

function RegistriesTab() {
  const { data: registries = [], isLoading } = useQuery<RegistryEntry[]>({
    queryKey: ["/api/telemetry-library/registries"],
    queryFn: () => apiRequest("/api/telemetry-library/registries"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-3">
      {registries.map((r) => (
        <ExpandableCard key={r.filename} title={r.filename} subtitle="Registry" defaultOpen={registries.length <= 3}>
          <pre className="text-xs whitespace-pre-wrap mt-2 overflow-auto max-h-96 text-[hsl(var(--foreground))]">
            {JSON.stringify(r.content, null, 2)}
          </pre>
        </ExpandableCard>
      ))}
    </div>
  );
}

export default function TelemetryLibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("telemetry");

  const { data: overview } = useQuery<TelemetryOverview>({
    queryKey: ["/api/telemetry-library"],
    queryFn: () => apiRequest("/api/telemetry-library"),
  });

  const tabs: { id: TabId; label: string; icon: typeof FileJson }[] = [
    { id: "telemetry", label: "Telemetry", icon: Activity },
    { id: "documents", label: "Documents", icon: BookOpen },
    { id: "schemas", label: "Schemas", icon: FileJson },
    { id: "registries", label: "Registries", icon: Database },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Telemetry Library</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Event schemas, run metrics, sink policies, privacy rules, and gates (TEL-0 through TEL-6)
        </p>
        {overview && (
          <div className="flex gap-4 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            <span>{overview.counts.docs} docs</span>
            <span>{overview.counts.schemas} schemas</span>
            <span>{overview.counts.registries} registries</span>
            <span>{overview.counts.eventTypes} event types</span>
            <span>{overview.counts.sinks} sinks</span>
            <span>{overview.counts.gates} gates</span>
          </div>
        )}
      </div>

      <div className="flex gap-1 mb-6 border-b border-[hsl(var(--border))]">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === id
                ? "border-[hsl(var(--primary))] text-[hsl(var(--foreground))]"
                : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "telemetry" && <TelemetryTab />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "schemas" && <SchemasTab />}
      {activeTab === "registries" && <RegistriesTab />}
    </div>
  );
}
