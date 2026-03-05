import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Loader2, FileJson, BookOpen, Database, ChevronDown, ChevronRight, Shield, Package, BookMarked } from "lucide-react";

interface StandardsOverview {
  groups: Record<string, string[]>;
  schemas: string[];
  registries: string[];
  packs: string[];
  counts: { docs: number; schemas: number; registries: number; packs: number; rules: number; gates: number };
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

interface PackRule {
  rule_id: string;
  type: string;
  severity: string;
  statement: string;
  applies_to?: unknown;
  evidence?: unknown;
}

interface PackEntry {
  filename: string;
  content: {
    pack_id: string;
    title: string;
    version: string;
    scope: {
      profiles: string[];
      risk_classes: string[];
      stacks?: string[];
      domains?: string[];
    };
    rules: PackRule[];
    created_at: string;
    updated_at: string;
    owner: string;
  };
}

const STD_GROUP_LABELS: Record<string, string> = {
  "STD-0": "Purpose & Boundaries",
  "STD-1": "Standards Pack Model",
  "STD-2": "Standards Index & Applicability",
  "STD-3": "Resolution Rules",
  "STD-4": "Snapshot Model",
  "STD-5": "Standards Gates",
  "STD-6": "Minimum Viable Set",
};

type TabId = "standards" | "documents" | "schemas" | "packs";

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

function StandardsTab() {
  const { data: overview, isLoading: overviewLoading } = useQuery<StandardsOverview>({
    queryKey: ["/api/standards"],
    queryFn: () => apiRequest("/api/standards"),
  });

  const { data: packs = [], isLoading: packsLoading } = useQuery<PackEntry[]>({
    queryKey: ["/api/standards/packs"],
    queryFn: () => apiRequest("/api/standards/packs"),
  });

  if (overviewLoading || packsLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const allRules: PackRule[] = packs.flatMap(p => p.content?.rules ?? []);
  const rulesByType: Record<string, PackRule[]> = {};
  const rulesBySeverity: Record<string, PackRule[]> = {};
  for (const rule of allRules) {
    (rulesByType[rule.type] ??= []).push(rule);
    (rulesBySeverity[rule.severity] ??= []).push(rule);
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Package className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Standards Packs</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{packs.length} pack(s) in the standards index</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => (
            <div key={pack.filename} className="border border-[hsl(var(--border))] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{pack.content?.pack_id}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
                  v{pack.content?.version}
                </span>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">{pack.content?.title}</p>
              <div className="flex gap-1 flex-wrap mb-2">
                {pack.content?.scope?.profiles?.map((p: string) => (
                  <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30">{p}</span>
                ))}
                {pack.content?.scope?.domains?.map((d: string) => (
                  <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">{d}</span>
                ))}
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{pack.content?.rules?.length ?? 0} rules</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <BookMarked className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Rules by Type</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{allRules.length} total rules across all packs</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {Object.entries(rulesByType).map(([type, rules]) => (
            <div key={type} className="border border-[hsl(var(--border))] rounded-lg p-3">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Type</p>
              <p className="text-sm font-mono font-bold">{type}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{rules.length} rule(s)</p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-3 mt-3">
          {Object.entries(rulesBySeverity).map(([severity, rules]) => {
            const colors: Record<string, string> = {
              must: "bg-red-500/10 text-red-400 border-red-500/30",
              must_not: "bg-orange-500/10 text-orange-400 border-orange-500/30",
              should: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
            };
            return (
              <div key={severity} className="border border-[hsl(var(--border))] rounded-lg p-3">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Severity</p>
                <span className={`text-xs px-2 py-1 rounded border font-medium ${colors[severity] ?? "bg-blue-500/10 text-blue-400 border-blue-500/30"}`}>{severity}</span>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{rules.length} rule(s)</p>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Standards Gates (STD-5)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">6 gates mapped to G3_STANDARDS_RESOLVED</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { id: "STD-GATE-01", name: "Standards index pinned + valid", severity: "hard_stop" },
            { id: "STD-GATE-02", name: "Referenced packs exist + validate", severity: "hard_stop" },
            { id: "STD-GATE-03", name: "Resolver produced snapshot", severity: "hard_stop" },
            { id: "STD-GATE-04", name: "Snapshot ordering deterministic", severity: "hard_stop" },
            { id: "STD-GATE-05", name: "Conflicts handled deterministically", severity: "policy_controlled" },
            { id: "STD-GATE-06", name: "Snapshot pinned in run manifest", severity: "hard_stop" },
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
  const { data: overview } = useQuery<StandardsOverview>({
    queryKey: ["/api/standards"],
    queryFn: () => apiRequest("/api/standards"),
  });
  const { data: docs = [], isLoading } = useQuery<DocEntry[]>({
    queryKey: ["/api/standards/docs"],
    queryFn: () => apiRequest("/api/standards/docs"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const groups = overview?.groups ?? {};
  const sortedGroupKeys = Object.keys(groups).sort();

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map((groupKey) => {
        const label = STD_GROUP_LABELS[groupKey] ?? groupKey;
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
    queryKey: ["/api/standards/schemas"],
    queryFn: () => apiRequest("/api/standards/schemas"),
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

function PacksTab() {
  const { data: packs = [], isLoading } = useQuery<PackEntry[]>({
    queryKey: ["/api/standards/packs"],
    queryFn: () => apiRequest("/api/standards/packs"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      {packs.map((pack) => (
        <ExpandableCard
          key={pack.filename}
          title={pack.content?.pack_id ?? pack.filename}
          subtitle={`${pack.content?.title ?? ""} — v${pack.content?.version ?? "?"}`}
          defaultOpen={packs.length === 1}
        >
          <div className="mt-3">
            <div className="flex gap-1 flex-wrap mb-3">
              {pack.content?.scope?.profiles?.map((p: string) => (
                <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30">{p}</span>
              ))}
              {pack.content?.scope?.risk_classes?.map((r: string) => (
                <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">{r}</span>
              ))}
              {pack.content?.scope?.domains?.map((d: string) => (
                <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">{d}</span>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Rule ID</th>
                    <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Type</th>
                    <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Severity</th>
                    <th className="text-left py-2 font-medium text-[hsl(var(--muted-foreground))]">Statement</th>
                  </tr>
                </thead>
                <tbody>
                  {pack.content?.rules?.map((rule) => {
                    const severityColors: Record<string, string> = {
                      must: "bg-red-500/10 text-red-400 border-red-500/30",
                      must_not: "bg-orange-500/10 text-orange-400 border-orange-500/30",
                      should: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
                    };
                    return (
                      <tr key={rule.rule_id} className="border-b border-[hsl(var(--border))]/50">
                        <td className="py-2 pr-4 font-mono font-bold text-[hsl(var(--primary))]">{rule.rule_id}</td>
                        <td className="py-2 pr-4">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">{rule.type}</span>
                        </td>
                        <td className="py-2 pr-4">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${severityColors[rule.severity] ?? "bg-blue-500/10 text-blue-400 border-blue-500/30"}`}>{rule.severity}</span>
                        </td>
                        <td className="py-2 text-[hsl(var(--foreground))]">{rule.statement}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </ExpandableCard>
      ))}
    </div>
  );
}

export default function StandardsLibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("standards");

  const { data: overview } = useQuery<StandardsOverview>({
    queryKey: ["/api/standards"],
    queryFn: () => apiRequest("/api/standards"),
  });

  const tabs: { id: TabId; label: string; icon: typeof FileJson }[] = [
    { id: "standards", label: "Standards", icon: BookMarked },
    { id: "documents", label: "Documents", icon: BookOpen },
    { id: "schemas", label: "Schemas", icon: FileJson },
    { id: "packs", label: "Packs", icon: Package },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Standards Library</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Standards pack system, index, applicability, resolution, snapshots, and gates (STD-0 through STD-6)
        </p>
        {overview && (
          <div className="flex gap-4 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            <span>{overview.counts.docs} docs</span>
            <span>{overview.counts.schemas} schemas</span>
            <span>{overview.counts.registries} registries</span>
            <span>{overview.counts.packs} packs</span>
            <span>{overview.counts.rules} rules</span>
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

      {activeTab === "standards" && <StandardsTab />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "schemas" && <SchemasTab />}
      {activeTab === "packs" && <PacksTab />}
    </div>
  );
}
