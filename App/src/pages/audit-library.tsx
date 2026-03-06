import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Loader2, FileJson, BookOpen, Database, ChevronDown, ChevronRight, Shield, ClipboardCheck, Users, Clock, Hash, Eye, Target } from "lucide-react";

interface AuditOverview {
  groups: Record<string, string[]>;
  schemas: string[];
  registries: string[];
  counts: { docs: number; schemas: number; registries: number; gates: number; actionTypes: number };
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

const AUD_GROUP_LABELS: Record<string, string> = {
  "AUD-0": "Purpose & Boundaries",
  "AUD-1": "Audit Action Schema",
  "AUD-2": "Audit Log / Ledger",
  "AUD-3": "Audit Index & Query Keys",
  "AUD-4": "Integrity Rules",
  "AUD-5": "Audit Gates",
  "AUD-6": "Ops Workflow",
  "AUD-7": "Minimum Viable Set",
};

type TabId = "audit" | "documents" | "schemas" | "registries";

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

const ACTION_TYPES = [
  { type: "run_started", category: "Run Lifecycle" },
  { type: "run_paused", category: "Run Lifecycle" },
  { type: "run_resumed", category: "Run Lifecycle" },
  { type: "run_cancelled", category: "Run Lifecycle" },
  { type: "stage_rerun_requested", category: "Reruns" },
  { type: "override_requested", category: "Overrides" },
  { type: "override_approved", category: "Overrides" },
  { type: "override_denied", category: "Overrides" },
  { type: "export_requested", category: "Exports" },
  { type: "export_approved", category: "Exports" },
  { type: "export_denied", category: "Exports" },
  { type: "policy_decision_applied", category: "Policy" },
  { type: "manual_attestation_recorded", category: "Attestation" },
];

const ACTOR_ROLES = ["owner", "maintainer", "operator", "system"];

const TARGET_TYPES = ["run", "stage", "gate", "override", "export", "policy_decision", "proof"];

const INTEGRITY_LEVELS = [
  { level: "Level 0", name: "Append-only only", description: "Events are append-only, no hash chain required" },
  { level: "Level 1", name: "File hash", description: "Serialized audit log has a recorded hash; detects file changes" },
  { level: "Level 2", name: "Hash chain", description: "Each event contributes to a rolling chain hash; detects edits, deletions, reordering" },
];

function AuditTab() {
  const { data: overview, isLoading: overviewLoading } = useQuery<AuditOverview>({
    queryKey: ["/api/audit-library"],
    queryFn: () => apiRequest("/api/audit-library"),
  });

  const { data: registries = [], isLoading: registriesLoading } = useQuery<RegistryEntry[]>({
    queryKey: ["/api/audit-library/registries"],
    queryFn: () => apiRequest("/api/audit-library/registries"),
  });

  if (overviewLoading || registriesLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const opsPolicy = registries.find(r => r.filename === "audit_ops_policy.v1.json");
  const retention = (opsPolicy?.content as any)?.retention ?? {};
  const redaction = (opsPolicy?.content as any)?.redaction ?? {};
  const exportPolicy = (opsPolicy?.content as any)?.export ?? {};

  const integrityReg = registries.find(r => r.filename === "audit_integrity.v1.json");
  const integrityContent = integrityReg?.content as any;
  const riskRequirements = integrityContent?.required_for_risk_classes ?? {};

  const categories = [...new Set(ACTION_TYPES.map(a => a.category))];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <ClipboardCheck className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Action Types (AUD-1)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{ACTION_TYPES.length} registered action types across {categories.length} categories</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Action Type</th>
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Category</th>
                <th className="text-left py-2 font-medium text-[hsl(var(--muted-foreground))]">Reason Required</th>
              </tr>
            </thead>
            <tbody>
              {ACTION_TYPES.map((at) => {
                const needsReason = ["override_requested", "override_approved", "override_denied", "stage_rerun_requested", "export_requested", "export_approved", "export_denied", "manual_attestation_recorded"].includes(at.type);
                return (
                  <tr key={at.type} className="border-b border-[hsl(var(--border))]/50">
                    <td className="py-2 pr-4 font-mono font-bold text-[hsl(var(--primary))]">{at.type}</td>
                    <td className="py-2 pr-4">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">{at.category}</span>
                    </td>
                    <td className="py-2">
                      {needsReason ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-medium">required</span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-400 border border-gray-500/30 font-medium">optional</span>
                      )}
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
          <Users className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Actor Roles & Target Types (AUD-1)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{ACTOR_ROLES.length} roles, {TARGET_TYPES.length} target types</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Actor Roles</p>
            <div className="flex gap-2 flex-wrap">
              {ACTOR_ROLES.map((role) => (
                <span key={role} className="text-[10px] px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono font-medium">{role}</span>
              ))}
            </div>
          </div>
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Target Types</p>
            <div className="flex gap-2 flex-wrap">
              {TARGET_TYPES.map((t) => (
                <span key={t} className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono font-medium">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Audit Log Overview (AUD-2)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Append-only ledger with optional tamper-evidence</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Scope Types</p>
            <div className="space-y-2">
              {["run", "project", "workspace"].map((scope) => (
                <div key={scope} className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30 font-mono">{scope}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Tamper-Evident Modes</p>
            <div className="space-y-2">
              {["append_only", "file_hash", "hash_chain"].map((mode) => (
                <div key={mode} className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                    mode === "hash_chain" ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                  }`}>{mode}</span>
                  {mode === "hash_chain" && <span className="text-[10px] text-[hsl(var(--muted-foreground))]">recommended</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Integrity Config</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[hsl(var(--muted-foreground))]">algorithm:</span>
                <span className="font-mono text-[hsl(var(--foreground))]">{integrityContent?.hash_algorithm ?? "sha256"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[hsl(var(--muted-foreground))]">canonical_json:</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                  integrityContent?.canonical_json ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}>{integrityContent?.canonical_json ? "true" : "false"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Hash className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Integrity Levels (AUD-4)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">3 integrity levels with risk class requirements</p>
          </div>
        </div>
        <div className="space-y-3">
          {INTEGRITY_LEVELS.map((il) => (
            <div key={il.level} className="border border-[hsl(var(--border))] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{il.level} — {il.name}</span>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{il.description}</p>
            </div>
          ))}
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Required by Risk Class</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Risk Class</th>
                    <th className="text-left py-2 font-medium text-[hsl(var(--muted-foreground))]">Minimum Integrity</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(riskRequirements).map(([rc, mode]) => (
                    <tr key={rc} className="border-b border-[hsl(var(--border))]/50">
                      <td className="py-2 pr-4 font-mono font-bold text-[hsl(var(--primary))]">{rc}</td>
                      <td className="py-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                          mode === "hash_chain" ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                        }`}>{mode as string}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Retention Policy (AUD-6)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Active + archive retention by risk class</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Risk Class</th>
                <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Active Days</th>
                <th className="text-left py-2 font-medium text-[hsl(var(--muted-foreground))]">Archive Days</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(retention).map(([rc, val]: [string, any]) => (
                <tr key={rc} className="border-b border-[hsl(var(--border))]/50">
                  <td className="py-2 pr-4 font-mono font-bold text-[hsl(var(--primary))]">{rc}</td>
                  <td className="py-2 pr-4 text-[hsl(var(--foreground))]">{val.active_days}</td>
                  <td className="py-2 text-[hsl(var(--foreground))]">{val.archive_days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Eye className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Redaction & Export (AUD-6)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Deny keys + export rules</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Deny Keys ({(redaction.deny_keys ?? []).length})</p>
            <div className="flex gap-1 flex-wrap">
              {(redaction.deny_keys ?? []).map((k: string) => (
                <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-mono">{k}</span>
              ))}
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[hsl(var(--muted-foreground))]">mask_actor_ids_on_export:</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                  redaction.mask_actor_ids_on_external_export ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}>{redaction.mask_actor_ids_on_external_export ? "true" : "false"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[hsl(var(--muted-foreground))]">strip_internal_refs:</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                  redaction.strip_internal_refs_on_external_export ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}>{redaction.strip_internal_refs_on_external_export ? "true" : "false"}</span>
              </div>
            </div>
          </div>
          <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Export Rules</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[hsl(var(--muted-foreground))]">allowed_formats:</span>
                <div className="flex gap-1">
                  {(exportPolicy.allowed_formats ?? []).map((f: string) => (
                    <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">{f}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[hsl(var(--muted-foreground))]">requires_approval:</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                  exportPolicy.external_export_requires_approval ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}>{exportPolicy.external_export_requires_approval ? "true" : "false"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[hsl(var(--muted-foreground))]">include_hashes:</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                  exportPolicy.include_hashes ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}>{exportPolicy.include_hashes ? "true" : "false"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Audit Gates (AUD-5)</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">6 gates for audit compliance</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { id: "AUD-GATE-01", name: "Audit log schema valid", severity: "hard_stop" },
            { id: "AUD-GATE-02", name: "Actor present", severity: "hard_stop" },
            { id: "AUD-GATE-03", name: "Monotonic timestamps", severity: "hard_stop" },
            { id: "AUD-GATE-04", name: "Target/reference coherence", severity: "hard_stop" },
            { id: "AUD-GATE-05", name: "Sensitive actions include reason", severity: "hard_stop" },
            { id: "AUD-GATE-06", name: "Integrity mode satisfied", severity: "policy_controlled" },
          ].map((gate) => (
            <div key={gate.id} className="flex items-center gap-3 border border-[hsl(var(--border))] rounded-lg p-3">
              <code className="text-xs font-mono text-[hsl(var(--primary))] font-bold shrink-0">{gate.id}</code>
              <span className="text-sm text-[hsl(var(--foreground))] flex-1">{gate.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-blue-500/10 text-blue-400 border-blue-500/30">
                G_AUDIT
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                gate.severity === "hard_stop"
                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                  : "bg-orange-500/10 text-orange-400 border-orange-500/30"
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
  const { data: overview } = useQuery<AuditOverview>({
    queryKey: ["/api/audit-library"],
    queryFn: () => apiRequest("/api/audit-library"),
  });
  const { data: docs = [], isLoading } = useQuery<DocEntry[]>({
    queryKey: ["/api/audit-library/docs"],
    queryFn: () => apiRequest("/api/audit-library/docs"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const groups = overview?.groups ?? {};
  const sortedGroupKeys = Object.keys(groups).sort();

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map((groupKey) => {
        const label = AUD_GROUP_LABELS[groupKey] ?? groupKey;
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
    queryKey: ["/api/audit-library/schemas"],
    queryFn: () => apiRequest("/api/audit-library/schemas"),
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
    queryKey: ["/api/audit-library/registries"],
    queryFn: () => apiRequest("/api/audit-library/registries"),
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

export default function AuditLibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("audit");

  const { data: overview } = useQuery<AuditOverview>({
    queryKey: ["/api/audit-library"],
    queryFn: () => apiRequest("/api/audit-library"),
  });

  const tabs: { id: TabId; label: string; icon: typeof FileJson }[] = [
    { id: "audit", label: "Audit", icon: ClipboardCheck },
    { id: "documents", label: "Documents", icon: BookOpen },
    { id: "schemas", label: "Schemas", icon: FileJson },
    { id: "registries", label: "Registries", icon: Database },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Audit Library</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Operator action tracking, append-only ledgers, integrity verification, and ops workflow (AUD-0 through AUD-7)
        </p>
        {overview && (
          <div className="flex gap-4 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            <span>{overview.counts.docs} docs</span>
            <span>{overview.counts.schemas} schemas</span>
            <span>{overview.counts.registries} registries</span>
            <span>{overview.counts.actionTypes} action types</span>
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

      {activeTab === "audit" && <AuditTab />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "schemas" && <SchemasTab />}
      {activeTab === "registries" && <RegistriesTab />}
    </div>
  );
}
