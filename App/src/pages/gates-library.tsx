import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Loader2, FileJson, BookOpen, Database, ChevronDown, ChevronRight, Shield, AlertTriangle, CheckCircle } from "lucide-react";

interface GatesOverview {
  groups: Record<string, string[]>;
  schemas: string[];
  registries: string[];
  counts: { docs: number; schemas: number; registries: number; definitions: number };
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

interface GateDefinition {
  gate_id: string;
  title: string;
  severity: string;
  predicates: Array<{ predicate_id: string; expr: string; message_on_fail: string; evidence_tags?: string[] }>;
  evidence_policy: { mode: string; include_pointers?: boolean; include_diff?: boolean; include_verification_proof?: boolean };
  override_hook?: { hook_point: string; requires_reason?: boolean };
  created_at: string;
  updated_at: string;
  owner: string;
}

interface GateRegistryData {
  registry_id: string;
  schema_version: string;
  gates: GateDefinition[];
}

const GATE_GROUP_LABELS: Record<string, string> = {
  "GATE-0": "Purpose & Boundaries",
  "GATE-1": "Gate Definition Model",
  "GATE-2": "Gate DSL Grammar",
  "GATE-3": "Evaluation Runtime",
  "GATE-4": "Gate Report Format",
  "GATE-5": "Determinism & Replay",
  "GATE-6": "Minimum Viable Set",
};

type TabId = "gates" | "documents" | "schemas" | "registries";

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

const SEVERITY_COLORS: Record<string, string> = {
  hard_stop: "bg-red-500/10 text-red-400 border-red-500/30",
  pause: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  warn: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

const SEVERITY_ICONS: Record<string, typeof AlertTriangle> = {
  hard_stop: AlertTriangle,
  pause: Shield,
  warn: CheckCircle,
};

function GatesTab() {
  const { data: registries = [], isLoading } = useQuery<RegistryEntry[]>({
    queryKey: ["/api/gates/registries"],
    queryFn: () => apiRequest("/api/gates/registries"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const gateRegistry = registries.find(r => r.filename.includes("gate_registry"))?.content as GateRegistryData | undefined;
  const gates = gateRegistry?.gates ?? [];

  if (gates.length === 0) {
    return <p className="text-[hsl(var(--muted-foreground))] text-sm py-8 text-center">No gate definitions found.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
        <div>
          <h3 className="font-semibold">Pipeline Gate Definitions</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{gates.length} gates defined for PIPE-AXION-V1</p>
        </div>
      </div>
      {gates.map((gate) => {
        const SevIcon = SEVERITY_ICONS[gate.severity] ?? Shield;
        const sevClass = SEVERITY_COLORS[gate.severity] ?? SEVERITY_COLORS.warn;
        return (
          <ExpandableCard
            key={gate.gate_id}
            title={gate.gate_id}
            subtitle={gate.title}
          >
            <div className="mt-3 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${sevClass}`}>
                  <SevIcon className="h-3 w-3" />
                  {gate.severity.replace("_", " ")}
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  Evidence: <span className="font-medium">{gate.evidence_policy.mode}</span>
                </span>
                {gate.override_hook && (
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    Override: <span className="font-medium">{gate.override_hook.hook_point}</span>
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">
                  Predicates ({gate.predicates.length})
                </h4>
                <div className="space-y-2">
                  {gate.predicates.map((pred) => (
                    <div key={pred.predicate_id} className="bg-[hsl(var(--muted))] rounded-md p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-xs font-mono text-[hsl(var(--primary))]">{pred.predicate_id}</code>
                      </div>
                      <code className="text-xs font-mono block text-[hsl(var(--foreground))] mb-1">{pred.expr}</code>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{pred.message_on_fail}</p>
                      {pred.evidence_tags && pred.evidence_tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {pred.evidence_tags.map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-[hsl(var(--muted-foreground))]">
                Owner: {gate.owner} | Created: {gate.created_at?.split("T")[0]}
              </div>
            </div>
          </ExpandableCard>
        );
      })}
    </div>
  );
}

function DocumentsTab() {
  const { data: overview } = useQuery<GatesOverview>({
    queryKey: ["/api/gates"],
    queryFn: () => apiRequest("/api/gates"),
  });
  const { data: docs = [], isLoading } = useQuery<DocEntry[]>({
    queryKey: ["/api/gates/docs"],
    queryFn: () => apiRequest("/api/gates/docs"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const groups = overview?.groups ?? {};
  const sortedGroupKeys = Object.keys(groups).sort();

  const docsByFilename = useMemo(() => {
    const map = new Map<string, DocEntry>();
    for (const d of docs) {
      map.set(d.filename, d);
    }
    return map;
  }, [docs]);

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map((groupKey) => {
        const label = GATE_GROUP_LABELS[groupKey] ?? groupKey;
        const filenames = groups[groupKey];
        const groupDocs = filenames.map((fn) => docsByFilename.get(fn)).filter(Boolean) as DocEntry[];

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
    queryKey: ["/api/gates/schemas"],
    queryFn: () => apiRequest("/api/gates/schemas"),
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
    queryKey: ["/api/gates/registries"],
    queryFn: () => apiRequest("/api/gates/registries"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-3">
      {registries.map((r) => (
        <ExpandableCard key={r.filename} title={r.filename} subtitle="Registry">
          <pre className="text-xs whitespace-pre-wrap mt-2 overflow-auto max-h-96 text-[hsl(var(--foreground))]">
            {JSON.stringify(r.content, null, 2)}
          </pre>
        </ExpandableCard>
      ))}
    </div>
  );
}

export default function GatesLibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("gates");

  const { data: overview } = useQuery<GatesOverview>({
    queryKey: ["/api/gates"],
    queryFn: () => apiRequest("/api/gates"),
  });

  const tabs: { id: TabId; label: string; icon: typeof FileJson }[] = [
    { id: "gates", label: "Gates", icon: Shield },
    { id: "documents", label: "Documents", icon: BookOpen },
    { id: "schemas", label: "Schemas", icon: FileJson },
    { id: "registries", label: "Registries", icon: Database },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gates Library</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Gate DSL, evaluation contracts, and pipeline gate definitions (GATE-0 through GATE-6)
        </p>
        {overview && (
          <div className="flex gap-4 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            <span>{overview.counts.definitions} gate definitions</span>
            <span>{overview.counts.docs} docs</span>
            <span>{overview.counts.schemas} schemas</span>
            <span>{overview.counts.registries} registries</span>
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

      {activeTab === "gates" && <GatesTab />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "schemas" && <SchemasTab />}
      {activeTab === "registries" && <RegistriesTab />}
    </div>
  );
}
