import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import {
  Activity,
  BookOpen,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Blocks,
  Shield,
  Layers,
  Database,
  Scale,
  Inbox,
  GitBranch,
  ScrollText,
  Cpu,
  Loader2,
  Package,
  ArrowRight,
  Server,
  Hash,
} from "lucide-react";
import { GlassPanel } from "../components/ui/glass-panel";
import { MetricCard } from "../components/ui/metric-card";
import { StatusChip } from "../components/ui/status-chip";

interface HealthData {
  status: string;
  pipeline: { stages: number; gates: number };
  knowledge: { kids: number };
  templates: number;
  recentRuns: string[];
  engineVersion?: string;
  totalRuns?: number;
  auditEntries?: number;
  system?: { docs: number; schemas: number; registries: number };
  orchestration?: { docs: number; schemas: number; registries: number; stages: number };
  gates?: { docs: number; schemas: number; registries: number; definitions: number };
  policy?: { docs: number; schemas: number; registries: number; riskClasses: number; policySets: number };
  intake?: { docs: number; schemas: number; registries: number; enums: number };
  canonical?: { docs: number; schemas: number; registries: number; entityTypes: number; relationshipTypes: number };
  standards?: { docs: number; schemas: number; registries: number; packs: number; rules: number };
}

interface Feature {
  feature_id: string;
  status: string;
  category: string;
}

interface LibraryInfo {
  name: string;
  icon: typeof Activity;
  accent: "cyan" | "green" | "amber" | "violet" | "red" | "default";
  data: { docs: number; schemas: number; registries: number; [k: string]: number };
  highlight?: { label: string; value: number };
}

function LibraryCard({ lib }: { lib: LibraryInfo }) {
  const Icon = lib.icon;
  const total = lib.data.docs + lib.data.schemas + lib.data.registries;
  return (
    <GlassPanel solid className="p-4 transition-all duration-200 hover:border-[hsl(var(--primary)/0.3)]">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="p-1.5 rounded-md bg-[hsl(var(--primary)/0.08)]">
          <Icon className="w-4 h-4 text-[hsl(var(--primary))]" />
        </div>
        <span className="text-sm font-medium text-[hsl(var(--foreground))]">{lib.name}</span>
        <span className="ml-auto text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">{total} files</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="text-center p-1.5 rounded bg-[hsl(var(--muted)/0.5)]">
          <div className="text-sm font-semibold text-[hsl(var(--foreground))] tabular-nums">{lib.data.docs}</div>
          <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Docs</div>
        </div>
        <div className="text-center p-1.5 rounded bg-[hsl(var(--muted)/0.5)]">
          <div className="text-sm font-semibold text-[hsl(var(--foreground))] tabular-nums">{lib.data.schemas}</div>
          <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Schemas</div>
        </div>
        <div className="text-center p-1.5 rounded bg-[hsl(var(--muted)/0.5)]">
          <div className="text-sm font-semibold text-[hsl(var(--foreground))] tabular-nums">{lib.data.registries}</div>
          <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Registries</div>
        </div>
      </div>
      {lib.highlight && (
        <div className="flex items-center justify-between text-xs pt-2 border-t border-[hsl(var(--border)/0.5)]">
          <span className="text-[hsl(var(--muted-foreground))]">{lib.highlight.label}</span>
          <span className="font-semibold font-mono-tech text-[hsl(var(--foreground))]">{lib.highlight.value}</span>
        </div>
      )}
    </GlassPanel>
  );
}

export default function HealthPage() {
  const [, setLocation] = useLocation();

  const { data, isLoading, isError } = useQuery<HealthData>({
    queryKey: ["/api/health"],
    queryFn: () => apiRequest("/api/health"),
    refetchInterval: 10000,
  });

  const { data: features = [] } = useQuery<Feature[]>({
    queryKey: ["/api/features"],
    queryFn: () => apiRequest("/api/features"),
  });

  const activeFeatures = features.filter((f) => f.status === "active").length;
  const categoryBreakdown = features.reduce<Record<string, number>>((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {});

  const isHealthy = data?.status === "ok" && !isError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4 animate-fade-in">
        <GlassPanel glow="red" className="p-5 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-[hsl(var(--status-failure))]" />
          <div>
            <h1 className="text-lg font-bold text-[hsl(var(--foreground))]">System Health Unavailable</h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Failed to load health data. The system may be temporarily unavailable.</p>
          </div>
        </GlassPanel>
      </div>
    );
  }

  const libraries: LibraryInfo[] = [
    { name: "System", icon: Server, accent: "cyan", data: data?.system || { docs: 0, schemas: 0, registries: 0 } },
    { name: "Orchestration", icon: Activity, accent: "cyan", data: { docs: data?.orchestration?.docs || 0, schemas: data?.orchestration?.schemas || 0, registries: data?.orchestration?.registries || 0 }, highlight: { label: "Stages", value: data?.orchestration?.stages || 0 } },
    { name: "Gates", icon: Shield, accent: "amber", data: { docs: data?.gates?.docs || 0, schemas: data?.gates?.schemas || 0, registries: data?.gates?.registries || 0 }, highlight: { label: "Definitions", value: data?.gates?.definitions || 0 } },
    { name: "Policy", icon: Scale, accent: "violet", data: { docs: data?.policy?.docs || 0, schemas: data?.policy?.schemas || 0, registries: data?.policy?.registries || 0 }, highlight: { label: "Policy Sets", value: data?.policy?.policySets || 0 } },
    { name: "Intake", icon: Inbox, accent: "green", data: { docs: data?.intake?.docs || 0, schemas: data?.intake?.schemas || 0, registries: data?.intake?.registries || 0 }, highlight: { label: "Enums", value: data?.intake?.enums || 0 } },
    { name: "Canonical", icon: GitBranch, accent: "cyan", data: { docs: data?.canonical?.docs || 0, schemas: data?.canonical?.schemas || 0, registries: data?.canonical?.registries || 0 }, highlight: { label: "Entity Types", value: data?.canonical?.entityTypes || 0 } },
    { name: "Standards", icon: Layers, accent: "green", data: { docs: data?.standards?.docs || 0, schemas: data?.standards?.schemas || 0, registries: data?.standards?.registries || 0 }, highlight: { label: "Rules", value: data?.standards?.rules || 0 } },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <GlassPanel glow={isHealthy ? "green" : "red"} className="p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--status-success)/0.03)] to-transparent pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[hsl(var(--foreground))] tracking-tight">System Health</h1>
              <StatusChip
                variant={isHealthy ? "success" : "failure"}
                label={isHealthy ? "Operational" : "Degraded"}
                pulse={isHealthy}
                size="md"
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Engine v{data?.engineVersion || "0.1.0"}
              </span>
              <span className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                {data?.totalRuns ?? 0} total runs
              </span>
              <span className="flex items-center gap-1.5">
                <ScrollText className="w-3.5 h-3.5" />
                {data?.auditEntries ?? 0} audit entries
              </span>
            </div>
          </div>
          <StatusChip variant="processing" label="Development" size="md" />
        </div>
      </GlassPanel>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard icon={Activity} label="STAGES" value={`${data?.pipeline.stages ?? 0}/10`} accent={data?.pipeline.stages === 10 ? "green" : "red"} subtitle={data?.pipeline.stages === 10 ? "All registered" : "Missing stages"} />
        <MetricCard icon={Shield} label="GATES" value={data?.pipeline.gates ?? 0} accent="amber" subtitle="Enforcement gates" />
        <MetricCard icon={BookOpen} label="KNOWLEDGE" value={data?.knowledge.kids ?? 0} accent="violet" subtitle="KIDs loaded" />
        <MetricCard icon={FileText} label="TEMPLATES" value={data?.templates ?? 0} accent="cyan" subtitle="Available" />
        <MetricCard icon={Database} label="TOTAL RUNS" value={data?.totalRuns ?? 0} accent="green" subtitle="Pipeline executions" />
        <MetricCard icon={Hash} label="AUDIT LOG" value={data?.auditEntries ?? 0} accent="default" subtitle="Integrity chain" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] text-system-label">LIBRARY HEALTH</h2>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">{libraries.length} libraries</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {libraries.map((lib) => (
            <LibraryCard key={lib.name} lib={lib} />
          ))}
        </div>
      </div>

      {data?.recentRuns && data.recentRuns.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] text-system-label mb-3">RECENT RUNS</h2>
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
            {data.recentRuns.map((run) => (
              <button
                key={run}
                onClick={() => setLocation("/runs")}
                className="shrink-0 px-3 py-1.5 rounded-md text-xs font-mono-tech border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] hover:border-[hsl(var(--primary)/0.3)] transition-all"
              >
                {run}
              </button>
            ))}
          </div>
        </div>
      )}

      {features.length > 0 && (
        <GlassPanel solid className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Blocks className="w-4 h-4 text-[hsl(var(--status-intelligence))]" />
              <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Feature Packs</h2>
            </div>
            <button
              onClick={() => setLocation("/features")}
              className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--primary))] hover:underline"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <div className="text-center p-3 rounded-md bg-[hsl(var(--muted)/0.5)]">
              <div className="text-lg font-bold text-[hsl(var(--foreground))] tabular-nums">{features.length}</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Total</div>
            </div>
            <div className="text-center p-3 rounded-md bg-[hsl(var(--status-success)/0.08)]">
              <div className="text-lg font-bold text-[hsl(var(--status-success))] tabular-nums">{activeFeatures}</div>
              <div className="text-[10px] text-[hsl(var(--status-success))]">Active</div>
            </div>
            {Object.entries(categoryBreakdown).map(([cat, count]) => (
              <div key={cat} className="text-center p-3 rounded-md bg-[hsl(var(--muted)/0.5)]">
                <div className="text-lg font-bold text-[hsl(var(--foreground))] tabular-nums">{count}</div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))] capitalize">{cat.replace("-", " ")}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
