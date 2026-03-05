import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Loader2, FileJson, BookOpen, Database, ChevronDown, ChevronRight, Shield, Layers, FolderOpen } from "lucide-react";

interface TemplatesOverview {
  groups: Record<string, string[]>;
  schemas: string[];
  registries: string[];
  counts: { docs: number; schemas: number; registries: number; categories: number; gates: number };
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

interface CategoryEntry {
  name: string;
  fileCount: number;
}

const TMP_GROUP_LABELS: Record<string, string> = {
  "TMP-0": "Purpose & Boundaries",
  "TMP-1": "Template Model",
  "TMP-2": "Template Registry / Index",
  "TMP-3": "Template Selection Rules",
  "TMP-4": "Render Envelope",
  "TMP-5": "Completeness Model",
  "TMP-6": "Template Gates",
  "TMP-7": "Minimum Viable Set",
};

type TabId = "templates" | "documents" | "schemas" | "registries";

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

function TemplatesTab() {
  const { data: overview, isLoading: overviewLoading } = useQuery<TemplatesOverview>({
    queryKey: ["/api/templates-library"],
    queryFn: () => apiRequest("/api/templates-library"),
  });

  const { data: registries = [], isLoading: registriesLoading } = useQuery<RegistryEntry[]>({
    queryKey: ["/api/templates-library/registries"],
    queryFn: () => apiRequest("/api/templates-library/registries"),
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<CategoryEntry[]>({
    queryKey: ["/api/templates-library/categories"],
    queryFn: () => apiRequest("/api/templates-library/categories"),
  });

  if (overviewLoading || registriesLoading || categoriesLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const templateRegistry = registries.find(r => r.filename === "template_registry.v1.json");
  const categoryOrder = registries.find(r => r.filename === "template_category_order.v1.json");
  const completenessPolicy = registries.find(r => r.filename === "template_completeness_policy.v1.json");

  const registryTemplates = (templateRegistry?.content as any)?.templates ?? [];
  const categoryOrderList = (categoryOrder?.content as any)?.order ?? [];
  const rawThresholds = (completenessPolicy?.content as any)?.thresholds ?? (completenessPolicy?.content as any)?.policies ?? {};
  const policyThresholds = Array.isArray(rawThresholds)
    ? rawThresholds
    : Object.entries(rawThresholds).map(([key, val]: [string, any]) => ({ risk_class: key, ...val }));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Template Registry</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{registryTemplates.length} registered template(s)</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {registryTemplates.map((tmpl: any) => (
            <div key={tmpl.template_id} className="border border-[hsl(var(--border))] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{tmpl.template_id}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
                  v{tmpl.version}
                </span>
              </div>
              <div className="flex gap-1 flex-wrap mb-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">{tmpl.category}</span>
                {tmpl.maturity && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                    tmpl.maturity === "golden" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" :
                    tmpl.maturity === "verified" ? "bg-green-500/10 text-green-400 border-green-500/30" :
                    tmpl.maturity === "reviewed" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                    "bg-gray-500/10 text-gray-400 border-gray-500/30"
                  }`}>{tmpl.maturity}</span>
                )}
              </div>
              <div className="flex gap-1 flex-wrap mb-2">
                {tmpl.profiles?.map((p: string) => (
                  <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30">{p}</span>
                ))}
              </div>
              <div className="flex gap-1 flex-wrap">
                {tmpl.risk_classes?.map((r: string) => (
                  <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30">{r}</span>
                ))}
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 font-mono truncate">{tmpl.path}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Layers className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Category Ordering (Selection Tie-Breaking)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{categoryOrderList.length} categories in fixed order</p>
          </div>
        </div>
        <div className="space-y-1">
          {categoryOrderList.map((cat: string, idx: number) => (
            <div key={cat} className="flex items-center gap-3 border border-[hsl(var(--border))] rounded-lg p-3">
              <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] w-6 text-right">{idx + 1}.</span>
              <span className="text-sm font-mono text-[hsl(var(--foreground))]">{cat}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <FolderOpen className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Template Categories</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{categories.length} directories with template files</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <div key={cat.name} className="border border-[hsl(var(--border))] rounded-lg p-3">
              <p className="text-sm font-mono font-bold text-[hsl(var(--foreground))]">{cat.name}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{cat.fileCount} template file(s)</p>
            </div>
          ))}
        </div>
      </div>

      {policyThresholds.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
            <div>
              <h3 className="font-semibold">Completeness Policy Thresholds</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">By risk class</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Risk Class</th>
                  <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Min Placeholder %</th>
                  <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Allow TBD</th>
                  <th className="text-left py-2 font-medium text-[hsl(var(--muted-foreground))]">Required Sections</th>
                </tr>
              </thead>
              <tbody>
                {policyThresholds.map((t: any) => (
                  <tr key={t.risk_class} className="border-b border-[hsl(var(--border))]/50">
                    <td className="py-2 pr-4 font-mono font-bold text-[hsl(var(--primary))]">{t.risk_class}</td>
                    <td className="py-2 pr-4">{t.required_placeholders_min_pct ?? t.min_pct ?? "-"}%</td>
                    <td className="py-2 pr-4">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                        t.allow_tbd ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}>{t.allow_tbd ? "yes" : "no"}</span>
                    </td>
                    <td className="py-2">{t.require_all_sections ? "all required" : "flexible"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Template Gates (TMP-6)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">6 gates mapped to G4/G5</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { id: "TMP-GATE-01", name: "Template registry pinned + valid", severity: "hard_stop", pipeline: "G4" },
            { id: "TMP-GATE-02", name: "Template selection artifact valid", severity: "hard_stop", pipeline: "G4" },
            { id: "TMP-GATE-03", name: "Required inputs satisfiable", severity: "hard_stop", pipeline: "G4" },
            { id: "TMP-GATE-04", name: "Render envelopes produced", severity: "hard_stop", pipeline: "G5" },
            { id: "TMP-GATE-05", name: "Completeness threshold met", severity: "policy_controlled", pipeline: "G5" },
            { id: "TMP-GATE-06", name: "Knowledge citations + reuse logs", severity: "hard_stop", pipeline: "G5" },
          ].map((gate) => (
            <div key={gate.id} className="flex items-center gap-3 border border-[hsl(var(--border))] rounded-lg p-3">
              <code className="text-xs font-mono text-[hsl(var(--primary))] font-bold shrink-0">{gate.id}</code>
              <span className="text-sm text-[hsl(var(--foreground))] flex-1">{gate.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-blue-500/10 text-blue-400 border-blue-500/30">
                {gate.pipeline}
              </span>
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
  const { data: overview } = useQuery<TemplatesOverview>({
    queryKey: ["/api/templates-library"],
    queryFn: () => apiRequest("/api/templates-library"),
  });
  const { data: docs = [], isLoading } = useQuery<DocEntry[]>({
    queryKey: ["/api/templates-library/docs"],
    queryFn: () => apiRequest("/api/templates-library/docs"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const groups = overview?.groups ?? {};
  const sortedGroupKeys = Object.keys(groups).sort();

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map((groupKey) => {
        const label = TMP_GROUP_LABELS[groupKey] ?? groupKey;
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
    queryKey: ["/api/templates-library/schemas"],
    queryFn: () => apiRequest("/api/templates-library/schemas"),
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
    queryKey: ["/api/templates-library/registries"],
    queryFn: () => apiRequest("/api/templates-library/registries"),
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

export default function TemplatesLibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("templates");

  const { data: overview } = useQuery<TemplatesOverview>({
    queryKey: ["/api/templates-library"],
    queryFn: () => apiRequest("/api/templates-library"),
  });

  const tabs: { id: TabId; label: string; icon: typeof FileJson }[] = [
    { id: "templates", label: "Templates", icon: Layers },
    { id: "documents", label: "Documents", icon: BookOpen },
    { id: "schemas", label: "Schemas", icon: FileJson },
    { id: "registries", label: "Registries", icon: Database },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Templates Library</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Template registry, selection rules, render envelopes, completeness, and gates (TMP-0 through TMP-7)
        </p>
        {overview && (
          <div className="flex gap-4 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            <span>{overview.counts.docs} docs</span>
            <span>{overview.counts.schemas} schemas</span>
            <span>{overview.counts.registries} registries</span>
            <span>{overview.counts.categories} categories</span>
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

      {activeTab === "templates" && <TemplatesTab />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "schemas" && <SchemasTab />}
      {activeTab === "registries" && <RegistriesTab />}
    </div>
  );
}
