import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Loader2, FileJson, BookOpen, Database, ChevronDown, ChevronRight, Shield, Layers, ShieldCheck } from "lucide-react";

interface VerificationOverview {
  groups: Record<string, string[]>;
  schemas: string[];
  registries: string[];
  counts: { docs: number; schemas: number; registries: number; gates: number; proofTypes: number };
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

const VER_GROUP_LABELS: Record<string, string> = {
  "VER-0": "Purpose & Boundaries",
  "VER-1": "Proof Types Registry",
  "VER-2": "Proof Ledger",
  "VER-3": "Command Run Tracking",
  "VER-4": "Completion Criteria",
  "VER-5": "Command Policy",
  "VER-6": "Verification Gates",
  "VER-7": "Minimum Viable Set",
};

type TabId = "verification" | "documents" | "schemas" | "registries";

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

function VerificationTab() {
  const { data: overview, isLoading: overviewLoading } = useQuery<VerificationOverview>({
    queryKey: ["/api/verification-library"],
    queryFn: () => apiRequest("/api/verification-library"),
  });

  const { data: registries = [], isLoading: registriesLoading } = useQuery<RegistryEntry[]>({
    queryKey: ["/api/verification-library/registries"],
    queryFn: () => apiRequest("/api/verification-library/registries"),
  });

  if (overviewLoading || registriesLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const proofTypesRegistry = registries.find(r => r.filename === "proof_types.v1.json");
  const proofTypes = (proofTypesRegistry?.content as any)?.types ?? [];

  const completionRegistry = registries.find(r => r.filename === "completion_criteria.v1.json");
  const unitDone = (completionRegistry?.content as any)?.unit_done?.requires ?? [];
  const runDone = (completionRegistry?.content as any)?.run_done?.requires ?? [];

  const commandPolicyRegistry = registries.find(r => r.filename === "verification_command_policy.v1.json");
  const policyRules = (commandPolicyRegistry?.content as any)?.rules ?? [];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Layers className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Proof Types (VER-1)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{proofTypes.length} registered proof types</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Proof Type</th>
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Description</th>
                <th className="text-left py-2 font-medium text-[hsl(var(--muted-foreground))]">Required Fields</th>
              </tr>
            </thead>
            <tbody>
              {proofTypes.map((pt: any) => (
                <tr key={pt.proof_type} className="border-b border-[hsl(var(--border))]/50">
                  <td className="py-2 pr-4 font-mono font-bold text-[hsl(var(--primary))]">{pt.proof_type}</td>
                  <td className="py-2 pr-4 text-[hsl(var(--foreground))]">{pt.description}</td>
                  <td className="py-2">
                    <div className="flex gap-1 flex-wrap">
                      {pt.required_fields?.map((f: string) => (
                        <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">{f}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Completion Criteria (VER-4)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Unit done + run done requirements</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Unit Done</p>
            <div className="space-y-2">
              {unitDone.map((req: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                    req.kind === "proof" ? "bg-green-500/10 text-green-400 border-green-500/30" :
                    req.kind === "artifact" ? "bg-purple-500/10 text-purple-400 border-purple-500/30" :
                    req.kind === "gate_pass" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                    "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                  }`}>{req.kind}</span>
                  <span className="text-xs font-mono text-[hsl(var(--foreground))]">{req.ref}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Run Done</p>
            <div className="space-y-2">
              {runDone.map((req: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                    req.kind === "proof" ? "bg-green-500/10 text-green-400 border-green-500/30" :
                    req.kind === "artifact" ? "bg-purple-500/10 text-purple-400 border-purple-500/30" :
                    req.kind === "gate_pass" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                    "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                  }`}>{req.kind}</span>
                  <span className="text-xs font-mono text-[hsl(var(--foreground))]">{req.ref}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Command Policy Rules (VER-5)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{policyRules.length} policy rules</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Rule ID</th>
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Pattern</th>
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Decision</th>
                <th className="text-left py-2 font-medium text-[hsl(var(--muted-foreground))]">Reason</th>
              </tr>
            </thead>
            <tbody>
              {policyRules.map((rule: any) => {
                const outcomeColors: Record<string, string> = {
                  allow: "bg-green-500/10 text-green-400 border-green-500/30",
                  deny: "bg-red-500/10 text-red-400 border-red-500/30",
                  require_approval: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
                };
                return (
                  <tr key={rule.rule_id} className="border-b border-[hsl(var(--border))]/50">
                    <td className="py-2 pr-4 font-mono font-bold text-[hsl(var(--primary))]">{rule.rule_id}</td>
                    <td className="py-2 pr-4 font-mono text-[hsl(var(--foreground))]">{rule.match?.pattern}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${outcomeColors[rule.decision?.outcome] ?? "bg-gray-500/10 text-gray-400 border-gray-500/30"}`}>
                        {rule.decision?.outcome}
                      </span>
                    </td>
                    <td className="py-2 text-[hsl(var(--foreground))]">{rule.decision?.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Verification Gates (VER-6)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">7 gates mapped to G7_VERIFICATION</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { id: "VER-GATE-01", name: "Proof types registry pinned + valid", severity: "hard_stop" },
            { id: "VER-GATE-02", name: "Proof ledger schema valid", severity: "hard_stop" },
            { id: "VER-GATE-03", name: "All required proofs present", severity: "hard_stop" },
            { id: "VER-GATE-04", name: "Command runs logged + valid", severity: "hard_stop" },
            { id: "VER-GATE-05", name: "Completion criteria met (unit_done)", severity: "hard_stop" },
            { id: "VER-GATE-06", name: "Completion criteria met (run_done)", severity: "hard_stop" },
            { id: "VER-GATE-07", name: "Command policy compliance verified", severity: "policy_controlled" },
          ].map((gate) => (
            <div key={gate.id} className="flex items-center gap-3 border border-[hsl(var(--border))] rounded-lg p-3">
              <code className="text-xs font-mono text-[hsl(var(--primary))] font-bold shrink-0">{gate.id}</code>
              <span className="text-sm text-[hsl(var(--foreground))] flex-1">{gate.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-blue-500/10 text-blue-400 border-blue-500/30">
                G7_VERIFICATION
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
  const { data: overview } = useQuery<VerificationOverview>({
    queryKey: ["/api/verification-library"],
    queryFn: () => apiRequest("/api/verification-library"),
  });
  const { data: docs = [], isLoading } = useQuery<DocEntry[]>({
    queryKey: ["/api/verification-library/docs"],
    queryFn: () => apiRequest("/api/verification-library/docs"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const groups = overview?.groups ?? {};
  const sortedGroupKeys = Object.keys(groups).sort();

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map((groupKey) => {
        const label = VER_GROUP_LABELS[groupKey] ?? groupKey;
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
    queryKey: ["/api/verification-library/schemas"],
    queryFn: () => apiRequest("/api/verification-library/schemas"),
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
    queryKey: ["/api/verification-library/registries"],
    queryFn: () => apiRequest("/api/verification-library/registries"),
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

export default function VerificationLibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("verification");

  const { data: overview } = useQuery<VerificationOverview>({
    queryKey: ["/api/verification-library"],
    queryFn: () => apiRequest("/api/verification-library"),
  });

  const tabs: { id: TabId; label: string; icon: typeof FileJson }[] = [
    { id: "verification", label: "Verification", icon: ShieldCheck },
    { id: "documents", label: "Documents", icon: BookOpen },
    { id: "schemas", label: "Schemas", icon: FileJson },
    { id: "registries", label: "Registries", icon: Database },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Verification Library</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Proof types, proof ledger, command runs, completion criteria, command policy, and gates (VER-0 through VER-7)
        </p>
        {overview && (
          <div className="flex gap-4 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            <span>{overview.counts.docs} docs</span>
            <span>{overview.counts.schemas} schemas</span>
            <span>{overview.counts.registries} registries</span>
            <span>{overview.counts.proofTypes} proof types</span>
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

      {activeTab === "verification" && <VerificationTab />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "schemas" && <SchemasTab />}
      {activeTab === "registries" && <RegistriesTab />}
    </div>
  );
}
