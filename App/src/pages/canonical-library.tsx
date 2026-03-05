import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Loader2, FileJson, BookOpen, Database, ChevronDown, ChevronRight, Network, Box, GitFork, Hash, AlertTriangle } from "lucide-react";

interface CanonicalOverview {
  groups: Record<string, string[]>;
  schemas: string[];
  registries: string[];
  counts: { docs: number; schemas: number; registries: number; entityTypes: number; relationshipTypes: number };
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

interface RelationshipConstraint {
  type: string;
  from_types: string[];
  to_types: string[];
}

interface RelationshipConstraintsRegistry {
  registry_id: string;
  schema_version: string;
  constraints: RelationshipConstraint[];
}

interface IdRulesRegistry {
  registry_id: string;
  schema_version: string;
  id_algo_version: string;
  namespace_mode: string;
  entity_prefix: string;
  relationship_prefix: string;
  canonical_key_templates: Record<string, string>;
}

const CAN_GROUP_LABELS: Record<string, string> = {
  "CAN-0": "Purpose & Boundaries",
  "CAN-1": "Entity Model",
  "CAN-2": "ID Rules & Dedupe",
  "CAN-3": "Reference Integrity",
  "CAN-4": "Unknowns & Assumptions",
  "CAN-5": "Artifacts & Reports",
  "CAN-6": "Canonical Gates",
  "CAN-7": "Minimum Viable Set",
};

type TabId = "canonical" | "documents" | "schemas" | "registries";

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

function CanonicalTab() {
  const { data: registries = [], isLoading } = useQuery<RegistryEntry[]>({
    queryKey: ["/api/canonical/registries"],
    queryFn: () => apiRequest("/api/canonical/registries"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const idRules = registries.find(r => r.filename.includes("id_rules"))?.content as IdRulesRegistry | undefined;
  const relConstraints = registries.find(r => r.filename.includes("relationship_constraints"))?.content as RelationshipConstraintsRegistry | undefined;

  const keyTemplates = idRules?.canonical_key_templates ?? {};
  const constraints = relConstraints?.constraints ?? [];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Box className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Entity Types</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{Object.keys(keyTemplates).length} entity types with deterministic canonical keys</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(keyTemplates).map(([type, template]) => (
            <div key={type} className="border border-[hsl(var(--border))] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{type}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
                  {idRules?.entity_prefix}...
                </span>
              </div>
              <code className="text-xs font-mono text-[hsl(var(--muted-foreground))] break-all">{template}</code>
            </div>
          ))}
        </div>
        {idRules && (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="border border-[hsl(var(--border))] rounded-lg p-3">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">ID Algorithm Version</p>
              <p className="text-sm font-mono font-bold">{idRules.id_algo_version}</p>
            </div>
            <div className="border border-[hsl(var(--border))] rounded-lg p-3">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Namespace Mode</p>
              <p className="text-sm font-mono font-bold">{idRules.namespace_mode}</p>
            </div>
            <div className="border border-[hsl(var(--border))] rounded-lg p-3">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Prefixes</p>
              <p className="text-sm font-mono font-bold">Entity: {idRules.entity_prefix} / Rel: {idRules.relationship_prefix}</p>
            </div>
          </div>
        )}
      </div>

      {constraints.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <GitFork className="h-5 w-5 text-[hsl(var(--primary))]" />
            <div>
              <h3 className="font-semibold">Relationship Type Constraints</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{constraints.length} relationship types with type-compatible from/to rules</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Relationship</th>
                  <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">From Types</th>
                  <th className="text-left py-2 font-medium text-[hsl(var(--muted-foreground))]">To Types</th>
                </tr>
              </thead>
              <tbody>
                {constraints.map((c) => (
                  <tr key={c.type} className="border-b border-[hsl(var(--border))]/50">
                    <td className="py-2 pr-4 font-mono font-bold text-[hsl(var(--primary))]">{c.type}</td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-1 flex-wrap">
                        {c.from_types.map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1 flex-wrap">
                        {c.to_types.map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30">{t}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Unknowns / Assumptions Model</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">CAN-4 defines explicit handling of missing or ambiguous information</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2">Unknown</h4>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Missing or ambiguous fact required to proceed. Created when required information is absent from intake.</p>
          </div>
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2">Assumption</h4>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Provisional chosen value used to proceed. Created when the system picks a default. Must be recorded and reviewable.</p>
          </div>
        </div>
        <div className="mt-3 border border-[hsl(var(--border))] rounded-lg p-4">
          <h4 className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2">Severity Levels</h4>
          <div className="flex gap-2 flex-wrap">
            {["blocking", "high", "medium", "low"].map((sev) => {
              const colors: Record<string, string> = {
                blocking: "bg-red-500/10 text-red-400 border-red-500/30",
                high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
                medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
                low: "bg-blue-500/10 text-blue-400 border-blue-500/30",
              };
              return (
                <span key={sev} className={`text-xs px-2 py-1 rounded border font-medium ${colors[sev]}`}>{sev}</span>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Hash className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Canonical Gates (CAN-6)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">6 gates mapped to G2_CANONICAL_INTEGRITY</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { id: "CAN-GATE-01", name: "Canonical spec schema valid", severity: "hard_stop" },
            { id: "CAN-GATE-02", name: "ID integrity", severity: "hard_stop" },
            { id: "CAN-GATE-03", name: "Relationship integrity", severity: "hard_stop" },
            { id: "CAN-GATE-04", name: "Relationship type compatibility", severity: "hard_stop" },
            { id: "CAN-GATE-05", name: "Uniqueness constraints", severity: "hard_stop" },
            { id: "CAN-GATE-06", name: "Unknowns handling", severity: "policy_controlled" },
          ].map((gate) => (
            <div key={gate.id} className="flex items-center gap-3 border border-[hsl(var(--border))] rounded-lg p-3">
              <code className="text-xs font-mono text-[hsl(var(--primary))] font-bold shrink-0">{gate.id}</code>
              <span className="text-sm text-[hsl(var(--foreground))] flex-1">{gate.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                gate.severity === "hard_stop"
                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                  : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
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
  const { data: overview } = useQuery<CanonicalOverview>({
    queryKey: ["/api/canonical"],
    queryFn: () => apiRequest("/api/canonical"),
  });
  const { data: docs = [], isLoading } = useQuery<DocEntry[]>({
    queryKey: ["/api/canonical/docs"],
    queryFn: () => apiRequest("/api/canonical/docs"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const groups = overview?.groups ?? {};
  const sortedGroupKeys = Object.keys(groups).sort();

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map((groupKey) => {
        const label = CAN_GROUP_LABELS[groupKey] ?? groupKey;
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
    queryKey: ["/api/canonical/schemas"],
    queryFn: () => apiRequest("/api/canonical/schemas"),
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
    queryKey: ["/api/canonical/registries"],
    queryFn: () => apiRequest("/api/canonical/registries"),
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

export default function CanonicalLibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("canonical");

  const { data: overview } = useQuery<CanonicalOverview>({
    queryKey: ["/api/canonical"],
    queryFn: () => apiRequest("/api/canonical"),
  });

  const tabs: { id: TabId; label: string; icon: typeof FileJson }[] = [
    { id: "canonical", label: "Canonical", icon: Network },
    { id: "documents", label: "Documents", icon: BookOpen },
    { id: "schemas", label: "Schemas", icon: FileJson },
    { id: "registries", label: "Registries", icon: Database },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Canonical Library</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Entity model, stable IDs, reference integrity, unknowns/assumptions, and canonical gates (CAN-0 through CAN-7)
        </p>
        {overview && (
          <div className="flex gap-4 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            <span>{overview.counts.entityTypes} entity types</span>
            <span>{overview.counts.relationshipTypes} relationship types</span>
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

      {activeTab === "canonical" && <CanonicalTab />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "schemas" && <SchemasTab />}
      {activeTab === "registries" && <RegistriesTab />}
    </div>
  );
}
