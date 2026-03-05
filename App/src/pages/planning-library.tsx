import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Loader2, FileJson, BookOpen, Database, ChevronDown, ChevronRight, Shield, Layers, ClipboardList } from "lucide-react";

interface PlanningOverview {
  groups: Record<string, string[]>;
  schemas: string[];
  registries: string[];
  counts: { docs: number; schemas: number; registries: number; gates: number; coverageRules: number };
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

const PLAN_GROUP_LABELS: Record<string, string> = {
  "PLAN-0": "Purpose & Boundaries",
  "PLAN-1": "Work Breakdown Structure",
  "PLAN-2": "Acceptance Map",
  "PLAN-3": "Build Plan & Sequencing",
  "PLAN-4": "Coverage Rules",
  "PLAN-5": "Planning Gates",
  "PLAN-6": "Minimum Viable Set",
};

type TabId = "planning" | "documents" | "schemas" | "registries";

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

function PlanningTab() {
  const { data: overview, isLoading: overviewLoading } = useQuery<PlanningOverview>({
    queryKey: ["/api/planning-library"],
    queryFn: () => apiRequest("/api/planning-library"),
  });

  const { data: registries = [], isLoading: registriesLoading } = useQuery<RegistryEntry[]>({
    queryKey: ["/api/planning-library/registries"],
    queryFn: () => apiRequest("/api/planning-library/registries"),
  });

  if (overviewLoading || registriesLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const coverageRulesRegistry = registries.find(r => r.filename === "plan_coverage_rules.v1.json");
  const coverageRules = (coverageRulesRegistry?.content as any)?.rules ?? [];

  const defaultPhases = [
    { order: 1, title: "Foundation (repo, scaffolding, baseline config)" },
    { order: 2, title: "Core domain + data model" },
    { order: 3, title: "API/backend endpoints" },
    { order: 4, title: "Frontend/UI" },
    { order: 5, title: "Integrations" },
    { order: 6, title: "Testing + verification" },
    { order: 7, title: "Ops + release readiness" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Layers className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Planning Artifacts Overview</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">WBS, Acceptance Map, Build Plan</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Work Breakdown Structure</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Deterministic task list from canonical spec</p>
            <div className="flex gap-1 flex-wrap mt-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">PLAN-1</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">work_breakdown.v1</span>
            </div>
          </div>
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Acceptance Map</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Requirements to acceptance criteria + proofs</p>
            <div className="flex gap-1 flex-wrap mt-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">PLAN-2</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">acceptance_map.v1</span>
            </div>
          </div>
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Build Plan</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Phases, milestones, sequencing</p>
            <div className="flex gap-1 flex-wrap mt-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">PLAN-3</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">build_plan.v1</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Layers className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Default Sequencing Phases (PLAN-3)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{defaultPhases.length} phases in default build flow</p>
          </div>
        </div>
        <div className="space-y-1">
          {defaultPhases.map((phase) => (
            <div key={phase.order} className="flex items-center gap-3 border border-[hsl(var(--border))] rounded-lg p-3">
              <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] w-6 text-right">{phase.order}.</span>
              <span className="text-sm font-mono text-[hsl(var(--foreground))]">{phase.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Coverage Rules (PLAN-4)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{coverageRules.length} rules defining plan completeness</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Rule ID</th>
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Category</th>
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Severity</th>
                <th className="text-left py-2 font-medium text-[hsl(var(--muted-foreground))]">Requirement</th>
              </tr>
            </thead>
            <tbody>
              {coverageRules.map((rule: any) => {
                const categoryColors: Record<string, string> = {
                  entity: "bg-blue-500/10 text-blue-400 border-blue-500/30",
                  template: "bg-purple-500/10 text-purple-400 border-purple-500/30",
                  acceptance: "bg-green-500/10 text-green-400 border-green-500/30",
                };
                const severityColors: Record<string, string> = {
                  must: "bg-red-500/10 text-red-400 border-red-500/30",
                  should: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
                };
                return (
                  <tr key={rule.rule_id} className="border-b border-[hsl(var(--border))]/50">
                    <td className="py-2 pr-4 font-mono font-bold text-[hsl(var(--primary))]">{rule.rule_id}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${categoryColors[rule.category] ?? "bg-gray-500/10 text-gray-400 border-gray-500/30"}`}>{rule.category}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${severityColors[rule.severity] ?? "bg-gray-500/10 text-gray-400 border-gray-500/30"}`}>{rule.severity}</span>
                    </td>
                    <td className="py-2 text-[hsl(var(--foreground))]">{rule.requirement}</td>
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
            <h3 className="font-semibold">Planning Gates (PLAN-5)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">6 gates mapped to G6_PLAN_COVERAGE</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { id: "PLAN-GATE-01", name: "WBS valid", severity: "hard_stop" },
            { id: "PLAN-GATE-02", name: "Acceptance map valid", severity: "hard_stop" },
            { id: "PLAN-GATE-03", name: "Build plan valid", severity: "hard_stop" },
            { id: "PLAN-GATE-04", name: "Dependency ordering valid (no cycles)", severity: "hard_stop" },
            { id: "PLAN-GATE-05", name: "Coverage satisfied (risk-based)", severity: "policy_controlled" },
            { id: "PLAN-GATE-06", name: "Plan artifacts pinned in manifest", severity: "hard_stop" },
          ].map((gate) => (
            <div key={gate.id} className="flex items-center gap-3 border border-[hsl(var(--border))] rounded-lg p-3">
              <code className="text-xs font-mono text-[hsl(var(--primary))] font-bold shrink-0">{gate.id}</code>
              <span className="text-sm text-[hsl(var(--foreground))] flex-1">{gate.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-blue-500/10 text-blue-400 border-blue-500/30">
                G6_PLAN_COVERAGE
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
  const { data: overview } = useQuery<PlanningOverview>({
    queryKey: ["/api/planning-library"],
    queryFn: () => apiRequest("/api/planning-library"),
  });
  const { data: docs = [], isLoading } = useQuery<DocEntry[]>({
    queryKey: ["/api/planning-library/docs"],
    queryFn: () => apiRequest("/api/planning-library/docs"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const groups = overview?.groups ?? {};
  const sortedGroupKeys = Object.keys(groups).sort();

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map((groupKey) => {
        const label = PLAN_GROUP_LABELS[groupKey] ?? groupKey;
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
    queryKey: ["/api/planning-library/schemas"],
    queryFn: () => apiRequest("/api/planning-library/schemas"),
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
    queryKey: ["/api/planning-library/registries"],
    queryFn: () => apiRequest("/api/planning-library/registries"),
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

export default function PlanningLibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("planning");

  const { data: overview } = useQuery<PlanningOverview>({
    queryKey: ["/api/planning-library"],
    queryFn: () => apiRequest("/api/planning-library"),
  });

  const tabs: { id: TabId; label: string; icon: typeof FileJson }[] = [
    { id: "planning", label: "Planning", icon: ClipboardList },
    { id: "documents", label: "Documents", icon: BookOpen },
    { id: "schemas", label: "Schemas", icon: FileJson },
    { id: "registries", label: "Registries", icon: Database },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Planning Library</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          WBS, acceptance map, build plan, sequencing, coverage rules, and gates (PLAN-0 through PLAN-6)
        </p>
        {overview && (
          <div className="flex gap-4 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            <span>{overview.counts.docs} docs</span>
            <span>{overview.counts.schemas} schemas</span>
            <span>{overview.counts.registries} registries</span>
            <span>{overview.counts.coverageRules} coverage rules</span>
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

      {activeTab === "planning" && <PlanningTab />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "schemas" && <SchemasTab />}
      {activeTab === "registries" && <RegistriesTab />}
    </div>
  );
}
