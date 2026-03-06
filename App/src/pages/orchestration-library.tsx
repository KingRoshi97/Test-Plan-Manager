import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Loader2, FileJson, BookOpen, Database, ChevronDown, ChevronRight, GitBranch, ArrowRight } from "lucide-react";

interface OrcOverview {
  groups: Record<string, string[]>;
  schemas: string[];
  registries: string[];
  counts: { docs: number; schemas: number; registries: number; stages: number };
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

const ORC_GROUP_LABELS: Record<string, string> = {
  "ORC-0": "Purpose & Boundaries",
  "ORC-1": "Pipeline Definition Model",
  "ORC-2": "Stage IO Contracts",
  "ORC-3": "Run Manifest Format",
  "ORC-4": "Stage Report Schema",
  "ORC-5": "Rerun / Resume Rules",
  "ORC-6": "Orchestration Gates",
  "ORC-7": "Minimum Viable Set",
};

type TabId = "documents" | "schemas" | "registries" | "pipeline";

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

function DocumentsTab() {
  const { data: overview } = useQuery<OrcOverview>({
    queryKey: ["/api/orchestration"],
    queryFn: () => apiRequest("/api/orchestration"),
  });
  const { data: docs = [], isLoading } = useQuery<DocEntry[]>({
    queryKey: ["/api/orchestration/docs"],
    queryFn: () => apiRequest("/api/orchestration/docs"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const groups = overview?.groups ?? {};
  const groupOrder = Object.keys(groups).sort();

  return (
    <div className="space-y-4">
      {groupOrder.map((groupKey) => {
        const filenames = groups[groupKey];
        const label = ORC_GROUP_LABELS[groupKey] ?? groupKey;
        return (
          <ExpandableCard key={groupKey} title={`${groupKey}: ${label}`} subtitle={`${filenames.length} files`}>
            <div className="space-y-3 pt-3">
              {filenames.map((filename) => {
                const doc = docs.find((d) => d.filename === filename);
                return (
                  <div key={filename} className="border border-[hsl(var(--border))] rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                      <span className="text-sm font-mono font-medium">{filename}</span>
                      {doc?.frontmatter?.status && (
                        <span className="ml-auto text-xs px-2 py-0.5 rounded bg-green-900/30 text-green-300">
                          {doc.frontmatter.status}
                        </span>
                      )}
                    </div>
                    {doc && (
                      <pre className="text-xs text-[hsl(var(--muted-foreground))] whitespace-pre-wrap max-h-60 overflow-auto bg-[hsl(var(--muted))] p-2 rounded">
                        {doc.content.slice(0, 2000)}{doc.content.length > 2000 ? "\n..." : ""}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </ExpandableCard>
        );
      })}
    </div>
  );
}

function SchemasTab() {
  const { data: schemas = [], isLoading } = useQuery<SchemaEntry[]>({
    queryKey: ["/api/orchestration/schemas"],
    queryFn: () => apiRequest("/api/orchestration/schemas"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-3">
      {schemas.map((schema) => {
        const schemaContent = schema.content as Record<string, unknown>;
        const title = (schemaContent?.id as string) ?? schema.filename;
        return (
          <ExpandableCard
            key={schema.filename}
            title={title}
            subtitle={schema.filename}
          >
            <pre className="text-xs whitespace-pre-wrap max-h-80 overflow-auto bg-[hsl(var(--muted))] p-3 rounded mt-2 font-mono">
              {JSON.stringify(schema.content, null, 2)}
            </pre>
          </ExpandableCard>
        );
      })}
    </div>
  );
}

function RegistriesTab() {
  const { data: registries = [], isLoading } = useQuery<RegistryEntry[]>({
    queryKey: ["/api/orchestration/registries"],
    queryFn: () => apiRequest("/api/orchestration/registries"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-3">
      {registries.map((reg) => {
        const content = reg.content as Record<string, unknown>;
        const registryId = (content?.registry_id ?? content?.pipeline_id ?? reg.filename) as string;
        const items = Object.entries(content).filter(([k]) => !["schema_version", "registry_id", "pipeline_id", "version", "created_at", "updated_at", "owner"].includes(k));
        const itemCount = items.reduce((acc, [, v]) => acc + (Array.isArray(v) ? v.length : (typeof v === "object" && v !== null ? Object.keys(v).length : 0)), 0);
        return (
          <ExpandableCard
            key={reg.filename}
            title={registryId}
            subtitle={`${itemCount} items`}
          >
            <pre className="text-xs whitespace-pre-wrap max-h-80 overflow-auto bg-[hsl(var(--muted))] p-3 rounded mt-2 font-mono">
              {JSON.stringify(reg.content, null, 2)}
            </pre>
          </ExpandableCard>
        );
      })}
    </div>
  );
}

const FAILURE_COLORS: Record<string, string> = {
  hard_stop: "bg-red-900/30 text-red-300",
  gate_pause: "bg-amber-900/30 text-amber-300",
  retryable: "bg-blue-900/30 text-blue-300",
};

function PipelineTab() {
  const { data: registries = [], isLoading } = useQuery<RegistryEntry[]>({
    queryKey: ["/api/orchestration/registries"],
    queryFn: () => apiRequest("/api/orchestration/registries"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const pipelineReg = registries.find((r) => r.filename.includes("pipeline_definition"));
  const ioReg = registries.find((r) => r.filename.includes("stage_io_registry"));

  if (!pipelineReg) {
    return <p className="text-sm text-[hsl(var(--muted-foreground))]">Pipeline definition not found.</p>;
  }

  const pipeline = pipelineReg.content as {
    pipeline_id: string;
    version: string;
    stage_order: string[];
    stages: Record<string, { stage_id: string; name: string; consumes: string[]; produces: string[]; failure_policy: string; can_rerun: boolean }>;
    gate_points: { after_stage: string; gate_id: string; severity: string }[];
  };

  const ioContracts = ioReg
    ? (ioReg.content as { contracts: { contract_id: string; kind: string; description: string }[] }).contracts
    : [];
  const contractMap = new Map(ioContracts.map((c) => [c.contract_id, c]));

  const gateMap = new Map(pipeline.gate_points.map((g) => [g.after_stage, g]));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium">{pipeline.pipeline_id}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">v{pipeline.version}</span>
        <span className="text-xs text-[hsl(var(--muted-foreground))]">{pipeline.stage_order.length} stages</span>
        <span className="text-xs text-[hsl(var(--muted-foreground))]">{pipeline.gate_points.length} gates</span>
      </div>

      {pipeline.stage_order.map((stageId, idx) => {
        const stage = pipeline.stages[stageId];
        if (!stage) return null;
        const gate = gateMap.get(stageId);
        return (
          <div key={stageId}>
            <div className="border border-[hsl(var(--border))] rounded-lg p-4 bg-[hsl(var(--card))]">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-900/30 text-blue-300">{stageId}</span>
                <span className="text-sm font-medium">{stage.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ml-auto ${FAILURE_COLORS[stage.failure_policy] ?? "bg-gray-800 text-gray-300"}`}>
                  {stage.failure_policy}
                </span>
                {stage.can_rerun && (
                  <span className="text-xs px-2 py-0.5 rounded bg-green-900/30 text-green-300">rerunnable</span>
                )}
              </div>

              {stage.consumes.length > 0 && (
                <div className="flex items-start gap-2 mt-2">
                  <span className="text-xs text-[hsl(var(--muted-foreground))] w-16 shrink-0 pt-0.5">Consumes</span>
                  <div className="flex flex-wrap gap-1">
                    {stage.consumes.map((c) => {
                      const contract = contractMap.get(c);
                      return (
                        <span
                          key={c}
                          className="text-xs px-2 py-0.5 rounded bg-[hsl(var(--muted))] font-mono"
                          title={contract?.description ?? c}
                        >
                          {c}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {stage.produces.length > 0 && (
                <div className="flex items-start gap-2 mt-1">
                  <span className="text-xs text-[hsl(var(--muted-foreground))] w-16 shrink-0 pt-0.5">Produces</span>
                  <div className="flex flex-wrap gap-1">
                    {stage.produces.map((p) => {
                      const contract = contractMap.get(p);
                      return (
                        <span
                          key={p}
                          className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono"
                          title={contract?.description ?? p}
                        >
                          {p}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {gate && (
              <div className="flex items-center gap-2 py-1 px-4">
                <div className="h-4 w-px bg-amber-400 ml-4" />
                <span className="text-xs font-mono text-amber-600">{gate.gate_id}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  gate.severity === "hard_stop" ? "bg-red-900/30 text-red-300" :
                  gate.severity === "pause" ? "bg-amber-900/30 text-amber-300" :
                  "bg-blue-900/30 text-blue-300"
                }`}>{gate.severity}</span>
              </div>
            )}

            {idx < pipeline.stage_order.length - 1 && !gate && (
              <div className="flex items-center justify-center py-1">
                <ArrowRight className="h-3 w-3 text-[hsl(var(--muted-foreground))] rotate-90" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrchestrationLibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("pipeline");

  const { data: overview, isLoading } = useQuery<OrcOverview>({
    queryKey: ["/api/orchestration"],
    queryFn: () => apiRequest("/api/orchestration"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  const counts = overview?.counts ?? { docs: 0, schemas: 0, registries: 0, stages: 0 };
  const groupCount = Object.keys(overview?.groups ?? {}).length;

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "pipeline", label: "Pipeline", count: counts.stages },
    { id: "documents", label: "Documents", count: counts.docs },
    { id: "schemas", label: "Schemas", count: counts.schemas },
    { id: "registries", label: "Registries", count: counts.registries },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Orchestration Library</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Pipeline execution contracts and run lifecycle (ORC-0 through ORC-7)
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="border border-[hsl(var(--border))] rounded-lg p-4 bg-[hsl(var(--card))]">
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Pipeline Stages</span>
          </div>
          <p className="text-2xl font-bold">{counts.stages}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">S0 through S10</p>
        </div>
        <div className="border border-[hsl(var(--border))] rounded-lg p-4 bg-[hsl(var(--card))]">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Concept Groups</span>
          </div>
          <p className="text-2xl font-bold">{groupCount}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{counts.docs} documents total</p>
        </div>
        <div className="border border-[hsl(var(--border))] rounded-lg p-4 bg-[hsl(var(--card))]">
          <div className="flex items-center gap-2 mb-1">
            <FileJson className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">JSON Schemas</span>
          </div>
          <p className="text-2xl font-bold">{counts.schemas}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Validation contracts</p>
        </div>
        <div className="border border-[hsl(var(--border))] rounded-lg p-4 bg-[hsl(var(--card))]">
          <div className="flex items-center gap-2 mb-1">
            <Database className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Registries</span>
          </div>
          <p className="text-2xl font-bold">{counts.registries}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Runtime data stores</p>
        </div>
      </div>

      <div className="border-b border-[hsl(var(--border))]">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--foreground))]"
                  : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-[hsl(var(--muted))]">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === "pipeline" && <PipelineTab />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "schemas" && <SchemasTab />}
      {activeTab === "registries" && <RegistriesTab />}
    </div>
  );
}
