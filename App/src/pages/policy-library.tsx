import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Loader2, FileJson, BookOpen, Database, ChevronDown, ChevronRight, Scale, AlertTriangle, ShieldCheck, Lock } from "lucide-react";

interface PolicyOverview {
  groups: Record<string, string[]>;
  schemas: string[];
  registries: string[];
  counts: { docs: number; schemas: number; registries: number; riskClasses: number; policySets: number };
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

interface RiskClassDefinition {
  risk_class: string;
  description: string;
  thresholds: Record<string, string>;
  gate_strictness: Record<string, string>;
  executor_rules: { external_allowed: boolean; external_restrictions: string[] };
}

interface PolicySetDefinition {
  policy_set_id: string;
  rules: {
    precedence_mode: string;
    override_permissions: Record<string, Record<string, boolean>>;
    max_override_duration_hours: Record<string, number>;
    deny_by_default: boolean;
  };
  created_at: string;
  updated_at: string;
  owner: string;
}

interface RiskClassRegistryData {
  registry_id: string;
  schema_version: string;
  classes: RiskClassDefinition[];
}

interface PolicySetRegistryData {
  registry_id: string;
  schema_version: string;
  policy_sets: PolicySetDefinition[];
}

const POL_GROUP_LABELS: Record<string, string> = {
  "POL-0": "Purpose & Boundaries",
  "POL-1": "Risk Class Model",
  "POL-2": "Override Policy Model",
  "POL-3": "Precedence & Conflict Resolution",
  "POL-4": "Enforcement Points",
  "POL-5": "Minimum Viable Set",
};

const RISK_CLASS_COLORS: Record<string, string> = {
  PROTOTYPE: "bg-green-500/10 text-green-400 border-green-500/30",
  PROD: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  COMPLIANCE: "bg-red-500/10 text-red-400 border-red-500/30",
};

const RISK_CLASS_ICONS: Record<string, typeof AlertTriangle> = {
  PROTOTYPE: ShieldCheck,
  PROD: AlertTriangle,
  COMPLIANCE: Lock,
};

type TabId = "policy" | "documents" | "schemas" | "registries";

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

function PolicyTab() {
  const { data: registries = [], isLoading } = useQuery<RegistryEntry[]>({
    queryKey: ["/api/policy/registries"],
    queryFn: () => apiRequest("/api/policy/registries"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const riskClassRegistry = registries.find(r => r.filename.includes("risk_classes"))?.content as RiskClassRegistryData | undefined;
  const policySetRegistry = registries.find(r => r.filename.includes("policy_sets"))?.content as PolicySetRegistryData | undefined;
  const riskClasses = riskClassRegistry?.classes ?? [];
  const policySets = policySetRegistry?.policy_sets ?? [];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Scale className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Risk Classes</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{riskClasses.length} risk classes define governance tiers</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {riskClasses.map((rc) => {
            const colorClass = RISK_CLASS_COLORS[rc.risk_class] ?? RISK_CLASS_COLORS.PROTOTYPE;
            const RcIcon = RISK_CLASS_ICONS[rc.risk_class] ?? ShieldCheck;
            return (
              <div key={rc.risk_class} className={`border rounded-lg p-4 ${colorClass}`}>
                <div className="flex items-center gap-2 mb-2">
                  <RcIcon className="h-5 w-5" />
                  <h4 className="font-bold text-sm">{rc.risk_class}</h4>
                </div>
                <p className="text-xs mb-3 opacity-80">{rc.description}</p>

                <div className="space-y-2">
                  <div>
                    <h5 className="text-[10px] font-semibold uppercase tracking-wide mb-1 opacity-60">Thresholds</h5>
                    <div className="space-y-0.5">
                      {Object.entries(rc.thresholds).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[11px]">
                          <span className="opacity-70">{k.replace(/_/g, " ")}</span>
                          <span className="font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {Object.keys(rc.gate_strictness).length > 0 && (
                    <div>
                      <h5 className="text-[10px] font-semibold uppercase tracking-wide mb-1 opacity-60">Gate Strictness</h5>
                      <div className="space-y-0.5">
                        {Object.entries(rc.gate_strictness).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-[11px]">
                            <span className="opacity-70 font-mono">{k}</span>
                            <span className="font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h5 className="text-[10px] font-semibold uppercase tracking-wide mb-1 opacity-60">Executor Rules</h5>
                    <div className="text-[11px]">
                      <div className="flex justify-between">
                        <span className="opacity-70">external allowed</span>
                        <span className="font-medium">{rc.executor_rules.external_allowed ? "yes" : "no"}</span>
                      </div>
                      {rc.executor_rules.external_restrictions.map((r) => (
                        <div key={r} className="text-[10px] opacity-60 mt-0.5">{r}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {policySets.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-5 w-5 text-[hsl(var(--primary))]" />
            <div>
              <h3 className="font-semibold">Policy Sets</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{policySets.length} policy set(s) defining override permissions</p>
            </div>
          </div>
          {policySets.map((ps) => (
            <ExpandableCard
              key={ps.policy_set_id}
              title={ps.policy_set_id}
              subtitle={`${ps.rules.precedence_mode} | deny_by_default: ${ps.rules.deny_by_default}`}
              defaultOpen={true}
            >
              <div className="mt-3 space-y-4">
                <div>
                  <h5 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">Override Permissions</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[hsl(var(--border))]">
                          <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Hook Point</th>
                          {riskClasses.map((rc) => (
                            <th key={rc.risk_class} className="text-center py-2 px-3 font-medium text-[hsl(var(--muted-foreground))]">{rc.risk_class}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(ps.rules.override_permissions).map(([hook, perms]) => (
                          <tr key={hook} className="border-b border-[hsl(var(--border))]/50">
                            <td className="py-2 pr-4 font-mono text-[hsl(var(--foreground))]">{hook}</td>
                            {riskClasses.map((rc) => {
                              const allowed = perms[rc.risk_class];
                              return (
                                <td key={rc.risk_class} className="text-center py-2 px-3">
                                  <span className={`inline-block w-5 h-5 rounded-full text-[10px] font-bold leading-5 ${
                                    allowed
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-red-500/20 text-red-400"
                                  }`}>
                                    {allowed ? "\u2713" : "\u2717"}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">Max Override Duration (hours)</h5>
                  <div className="flex gap-4">
                    {Object.entries(ps.rules.max_override_duration_hours).map(([rc, hours]) => (
                      <div key={rc} className="bg-[hsl(var(--muted))] rounded-md px-3 py-2 text-center">
                        <div className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase">{rc}</div>
                        <div className="text-sm font-bold text-[hsl(var(--foreground))]">{hours}h</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  Owner: {ps.owner} | Created: {ps.created_at?.split("T")[0]}
                </div>
              </div>
            </ExpandableCard>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentsTab() {
  const { data: overview } = useQuery<PolicyOverview>({
    queryKey: ["/api/policy"],
    queryFn: () => apiRequest("/api/policy"),
  });
  const { data: docs = [], isLoading } = useQuery<DocEntry[]>({
    queryKey: ["/api/policy/docs"],
    queryFn: () => apiRequest("/api/policy/docs"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const groups = overview?.groups ?? {};
  const sortedGroupKeys = Object.keys(groups).sort();

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map((groupKey) => {
        const label = POL_GROUP_LABELS[groupKey] ?? groupKey;
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
    queryKey: ["/api/policy/schemas"],
    queryFn: () => apiRequest("/api/policy/schemas"),
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
    queryKey: ["/api/policy/registries"],
    queryFn: () => apiRequest("/api/policy/registries"),
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

export default function PolicyLibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("policy");

  const { data: overview } = useQuery<PolicyOverview>({
    queryKey: ["/api/policy"],
    queryFn: () => apiRequest("/api/policy"),
  });

  const tabs: { id: TabId; label: string; icon: typeof FileJson }[] = [
    { id: "policy", label: "Policy", icon: Scale },
    { id: "documents", label: "Documents", icon: BookOpen },
    { id: "schemas", label: "Schemas", icon: FileJson },
    { id: "registries", label: "Registries", icon: Database },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Policy Library</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Risk classes, override policies, precedence rules, and enforcement points (POL-0 through POL-5)
        </p>
        {overview && (
          <div className="flex gap-4 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            <span>{overview.counts.riskClasses} risk classes</span>
            <span>{overview.counts.policySets} policy sets</span>
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

      {activeTab === "policy" && <PolicyTab />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "schemas" && <SchemasTab />}
      {activeTab === "registries" && <RegistriesTab />}
    </div>
  );
}
