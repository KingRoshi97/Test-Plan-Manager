import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Loader2, FileJson, BookOpen, Database, ChevronDown, ChevronRight, Shield, Layers, Package, FolderTree } from "lucide-react";

interface KitOverview {
  groups: Record<string, string[]>;
  schemas: string[];
  registries: string[];
  counts: { docs: number; schemas: number; registries: number; gates: number; exportRules: number };
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

const KIT_GROUP_LABELS: Record<string, string> = {
  "KIT-0": "Purpose & Boundaries",
  "KIT-1": "Kit Tree Contract",
  "KIT-2": "Kit Manifest Schema",
  "KIT-3": "Versioning & Compatibility",
  "KIT-4": "Export Rules",
  "KIT-5": "Kit Gates",
  "KIT-6": "Minimum Viable Set",
};

type TabId = "kit" | "documents" | "schemas" | "registries";

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

function KitTab() {
  const { data: overview, isLoading: overviewLoading } = useQuery<KitOverview>({
    queryKey: ["/api/kit-library"],
    queryFn: () => apiRequest("/api/kit-library"),
  });

  const { data: registries = [], isLoading: registriesLoading } = useQuery<RegistryEntry[]>({
    queryKey: ["/api/kit-library/registries"],
    queryFn: () => apiRequest("/api/kit-library/registries"),
  });

  if (overviewLoading || registriesLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const treeRegistry = registries.find(r => r.filename === "kit_tree.v1.json");
  const treeFolders = (treeRegistry?.content as any)?.folders ?? [];
  const treeFiles = (treeRegistry?.content as any)?.files ?? [];

  const compatRegistry = registries.find(r => r.filename === "kit_compatibility.v1.json");
  const kitVersion = (compatRegistry?.content as any)?.kit_format?.kit_version ?? "—";
  const requiredFolders = (compatRegistry?.content as any)?.kit_format?.requires?.folders ?? [];
  const requiredFiles = (compatRegistry?.content as any)?.kit_format?.requires?.files ?? [];
  const schemaSupport = (compatRegistry?.content as any)?.schema_support ?? {};

  const exportRegistry = registries.find(r => r.filename === "kit_export_filter.v1.json");
  const exportRules = (exportRegistry?.content as any)?.rules ?? [];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <FolderTree className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Kit Tree Structure (KIT-1)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{treeFolders.length} folders + {treeFiles.length} files</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Type</th>
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Path</th>
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Required</th>
                <th className="text-left py-2 font-medium text-[hsl(var(--muted-foreground))]">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {treeFolders.map((f: any) => (
                <tr key={f.path} className="border-b border-[hsl(var(--border))]/50">
                  <td className="py-2 pr-4">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-medium">folder</span>
                  </td>
                  <td className="py-2 pr-4 font-mono font-bold text-[hsl(var(--primary))]">{f.path}/</td>
                  <td className="py-2 pr-4">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                      f.required ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                    }`}>{f.required ? "required" : "optional"}</span>
                  </td>
                  <td className="py-2 text-[hsl(var(--foreground))]">{f.purpose}</td>
                </tr>
              ))}
              {treeFiles.map((f: any) => (
                <tr key={f.path} className="border-b border-[hsl(var(--border))]/50">
                  <td className="py-2 pr-4">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-medium">file</span>
                  </td>
                  <td className="py-2 pr-4 font-mono font-bold text-[hsl(var(--primary))]">{f.path}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                      f.required ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                    }`}>{f.required ? "required" : "optional"}</span>
                  </td>
                  <td className="py-2 text-[hsl(var(--foreground))]">{f.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Layers className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Kit Manifest Schema (KIT-2)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Required fields + content item kinds</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Required Manifest Fields</p>
            <div className="space-y-2">
              {["kit_id", "run_id", "kit_version", "created_at", "contents", "entrypoints"].map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30 font-medium">required</span>
                  <span className="text-xs font-mono text-[hsl(var(--foreground))]">{field}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Content Item Kinds</p>
            <div className="space-y-2">
              {[
                { kind: "doc", desc: "Rendered templates (human-facing)" },
                { kind: "artifact", desc: "Core run artifacts (canonical, plans, proofs)" },
                { kind: "metadata", desc: "Run manifest snapshot, pins, environment" },
                { kind: "script", desc: "Verification/build/run scripts" },
              ].map((item) => (
                <div key={item.kind} className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono font-medium">{item.kind}</span>
                  <span className="text-xs text-[hsl(var(--foreground))]">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Export Rules (KIT-4)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{exportRules.length} export filter rules</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Rule ID</th>
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Export Class</th>
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Action</th>
                <th className="text-left py-2 font-medium text-[hsl(var(--muted-foreground))]">Classifications</th>
              </tr>
            </thead>
            <tbody>
              {exportRules.map((rule: any) => {
                const isDeny = !!rule.deny_classifications;
                const classifications = rule.deny_classifications ?? rule.allow_classifications ?? [];
                return (
                  <tr key={rule.rule_id} className="border-b border-[hsl(var(--border))]/50">
                    <td className="py-2 pr-4 font-mono font-bold text-[hsl(var(--primary))]">{rule.rule_id}</td>
                    <td className="py-2 pr-4">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-medium">{rule.export_class}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                        isDeny ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-green-500/10 text-green-400 border-green-500/30"
                      }`}>{isDeny ? "deny" : "allow"}</span>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1 flex-wrap">
                        {classifications.map((c: string) => (
                          <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-mono">{c}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Kit Gates (KIT-5)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">6 gates mapped to G8_KIT_PACKAGE</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { id: "KIT-GATE-01", name: "Kit tree conforms", severity: "hard_stop" },
            { id: "KIT-GATE-02", name: "Kit manifest valid", severity: "hard_stop" },
            { id: "KIT-GATE-03", name: "Manifest matches filesystem", severity: "warn" },
            { id: "KIT-GATE-04", name: "Required artifacts included", severity: "hard_stop" },
            { id: "KIT-GATE-05", name: "Export classification correct", severity: "hard_stop" },
            { id: "KIT-GATE-06", name: "Policy compliance for export", severity: "policy_controlled" },
          ].map((gate) => (
            <div key={gate.id} className="flex items-center gap-3 border border-[hsl(var(--border))] rounded-lg p-3">
              <code className="text-xs font-mono text-[hsl(var(--primary))] font-bold shrink-0">{gate.id}</code>
              <span className="text-sm text-[hsl(var(--foreground))] flex-1">{gate.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-blue-500/10 text-blue-400 border-blue-500/30">
                G8_KIT_PACKAGE
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

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Package className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Compatibility Info (KIT-3)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Kit format version + schema support</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Kit Format</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[hsl(var(--muted-foreground))]">kit_version:</span>
                <span className="text-xs font-mono font-bold text-[hsl(var(--primary))]">{kitVersion}</span>
              </div>
              <div>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">Required folders:</span>
                <div className="flex gap-1 flex-wrap mt-1">
                  {requiredFolders.map((f: string) => (
                    <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">{f}/</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">Required files:</span>
                <div className="flex gap-1 flex-wrap mt-1">
                  {requiredFiles.map((f: string) => (
                    <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Schema Support</p>
            <div className="space-y-2">
              {Object.entries(schemaSupport).map(([schema, versions]) => (
                <div key={schema} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[hsl(var(--foreground))]">{schema}:</span>
                  <div className="flex gap-1">
                    {(versions as string[]).map((v: string) => (
                      <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30 font-mono">{v}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentsTab() {
  const { data: overview } = useQuery<KitOverview>({
    queryKey: ["/api/kit-library"],
    queryFn: () => apiRequest("/api/kit-library"),
  });
  const { data: docs = [], isLoading } = useQuery<DocEntry[]>({
    queryKey: ["/api/kit-library/docs"],
    queryFn: () => apiRequest("/api/kit-library/docs"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const groups = overview?.groups ?? {};
  const sortedGroupKeys = Object.keys(groups).sort();

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map((groupKey) => {
        const label = KIT_GROUP_LABELS[groupKey] ?? groupKey;
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
    queryKey: ["/api/kit-library/schemas"],
    queryFn: () => apiRequest("/api/kit-library/schemas"),
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
    queryKey: ["/api/kit-library/registries"],
    queryFn: () => apiRequest("/api/kit-library/registries"),
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

export default function KitLibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("kit");

  const { data: overview } = useQuery<KitOverview>({
    queryKey: ["/api/kit-library"],
    queryFn: () => apiRequest("/api/kit-library"),
  });

  const tabs: { id: TabId; label: string; icon: typeof FileJson }[] = [
    { id: "kit", label: "Kit", icon: Package },
    { id: "documents", label: "Documents", icon: BookOpen },
    { id: "schemas", label: "Schemas", icon: FileJson },
    { id: "registries", label: "Registries", icon: Database },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kit Library</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Kit tree, manifest schema, versioning, export rules, and gates (KIT-0 through KIT-6)
        </p>
        {overview && (
          <div className="flex gap-4 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            <span>{overview.counts.docs} docs</span>
            <span>{overview.counts.schemas} schemas</span>
            <span>{overview.counts.registries} registries</span>
            <span>{overview.counts.exportRules} export rules</span>
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

      {activeTab === "kit" && <KitTab />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "schemas" && <SchemasTab />}
      {activeTab === "registries" && <RegistriesTab />}
    </div>
  );
}
