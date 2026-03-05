import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Loader2, FileJson, BookOpen, Database, ChevronDown, ChevronRight, ClipboardList, Tag, ArrowRightLeft, Wand2 } from "lucide-react";

interface IntakeOverview {
  groups: Record<string, string[]>;
  schemas: string[];
  registries: string[];
  counts: { docs: number; schemas: number; registries: number; enums: number; crossFieldRules: number; normalizationRules: number };
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

interface EnumOption {
  value: string;
  label: string;
  aliases?: string[];
}

interface EnumDef {
  enum_id: string;
  title: string;
  options: EnumOption[];
}

interface EnumRegistryData {
  registry_id: string;
  schema_version: string;
  enums: EnumDef[];
}

interface CrossFieldRule {
  rule_id: string;
  if: Array<{ field_id: string; op: string; value: unknown }>;
  then: { require_fields?: string[]; forbid_fields?: string[] };
  message: string;
}

interface CrossFieldRulesData {
  ruleset_id: string;
  schema_version: string;
  rules: CrossFieldRule[];
}

interface NormalizationRule {
  rule_id: string;
  applies_to: { field_ids: string[] };
  transform: { kind: string };
}

interface NormalizationRulesData {
  rules_id: string;
  schema_version: string;
  rules: NormalizationRule[];
}

const INT_GROUP_LABELS: Record<string, string> = {
  "INT-0": "Purpose & Boundaries",
  "INT-1": "Form Spec Model",
  "INT-2": "Field Enums & Allowed Values",
  "INT-3": "Validation Rules",
  "INT-4": "Submission Record",
  "INT-5": "Normalization & Determinism",
  "INT-6": "Intake Gates",
  "INT-7": "Minimum Viable Set",
};

type TabId = "intake" | "documents" | "schemas" | "registries";

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

function IntakeTab() {
  const { data: registries = [], isLoading } = useQuery<RegistryEntry[]>({
    queryKey: ["/api/intake-library/registries"],
    queryFn: () => apiRequest("/api/intake-library/registries"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const enumRegistry = registries.find(r => r.filename.includes("intake_enums"))?.content as EnumRegistryData | undefined;
  const crossFieldRules = registries.find(r => r.filename.includes("cross_field_rules"))?.content as CrossFieldRulesData | undefined;
  const normRules = registries.find(r => r.filename.includes("normalization_rules"))?.content as NormalizationRulesData | undefined;

  const enums = enumRegistry?.enums ?? [];
  const cfRules = crossFieldRules?.rules ?? [];
  const nRules = normRules?.rules ?? [];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Tag className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h3 className="font-semibold">Field Enums</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{enums.length} enum registries define allowed intake values</p>
          </div>
        </div>
        <div className="space-y-3">
          {enums.map((en) => (
            <ExpandableCard
              key={en.enum_id}
              title={en.enum_id}
              subtitle={`${en.title} (${en.options.length} options)`}
              defaultOpen={true}
            >
              <div className="mt-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))]">
                      <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Value</th>
                      <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--muted-foreground))]">Label</th>
                      <th className="text-left py-2 font-medium text-[hsl(var(--muted-foreground))]">Aliases</th>
                    </tr>
                  </thead>
                  <tbody>
                    {en.options.map((opt) => (
                      <tr key={opt.value} className="border-b border-[hsl(var(--border))]/50">
                        <td className="py-2 pr-4 font-mono text-[hsl(var(--primary))]">{opt.value}</td>
                        <td className="py-2 pr-4 text-[hsl(var(--foreground))]">{opt.label}</td>
                        <td className="py-2">
                          {opt.aliases && opt.aliases.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                              {opt.aliases.map((a) => (
                                <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">{a}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[hsl(var(--muted-foreground))]">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ExpandableCard>
          ))}
        </div>
      </div>

      {cfRules.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <ArrowRightLeft className="h-5 w-5 text-[hsl(var(--primary))]" />
            <div>
              <h3 className="font-semibold">Cross-Field Rules</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{cfRules.length} conditional field requirement rules</p>
            </div>
          </div>
          <div className="space-y-3">
            {cfRules.map((rule) => (
              <div key={rule.rule_id} className="border border-[hsl(var(--border))] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-xs font-mono text-[hsl(var(--primary))] font-bold">{rule.rule_id}</code>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="bg-[hsl(var(--muted))] rounded-md p-3">
                    <span className="font-semibold text-yellow-400">IF </span>
                    {rule.if.map((cond, i) => (
                      <span key={i}>
                        {i > 0 && <span className="text-[hsl(var(--muted-foreground))]"> AND </span>}
                        <code className="font-mono">{cond.field_id} {cond.op} {JSON.stringify(cond.value)}</code>
                      </span>
                    ))}
                  </div>
                  <div className="bg-[hsl(var(--muted))] rounded-md p-3">
                    <span className="font-semibold text-green-400">THEN </span>
                    {rule.then.require_fields && (
                      <span>require: <code className="font-mono">{rule.then.require_fields.join(", ")}</code></span>
                    )}
                    {rule.then.forbid_fields && (
                      <span> forbid: <code className="font-mono">{rule.then.forbid_fields.join(", ")}</code></span>
                    )}
                  </div>
                  <p className="text-[hsl(var(--muted-foreground))] italic">{rule.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {nRules.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Wand2 className="h-5 w-5 text-[hsl(var(--primary))]" />
            <div>
              <h3 className="font-semibold">Normalization Rules</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{nRules.length} deterministic normalization transforms</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {nRules.map((rule) => (
              <div key={rule.rule_id} className="border border-[hsl(var(--border))] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-xs font-mono text-[hsl(var(--primary))] font-bold">{rule.rule_id}</code>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 font-medium">
                    {rule.transform.kind}
                  </span>
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  Applies to: <code className="font-mono text-[hsl(var(--foreground))]">{rule.applies_to.field_ids.join(", ")}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentsTab() {
  const { data: overview } = useQuery<IntakeOverview>({
    queryKey: ["/api/intake-library"],
    queryFn: () => apiRequest("/api/intake-library"),
  });
  const { data: docs = [], isLoading } = useQuery<DocEntry[]>({
    queryKey: ["/api/intake-library/docs"],
    queryFn: () => apiRequest("/api/intake-library/docs"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const groups = overview?.groups ?? {};
  const sortedGroupKeys = Object.keys(groups).sort();

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map((groupKey) => {
        const label = INT_GROUP_LABELS[groupKey] ?? groupKey;
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
    queryKey: ["/api/intake-library/schemas"],
    queryFn: () => apiRequest("/api/intake-library/schemas"),
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
    queryKey: ["/api/intake-library/registries"],
    queryFn: () => apiRequest("/api/intake-library/registries"),
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

export default function IntakeLibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("intake");

  const { data: overview } = useQuery<IntakeOverview>({
    queryKey: ["/api/intake-library"],
    queryFn: () => apiRequest("/api/intake-library"),
  });

  const tabs: { id: TabId; label: string; icon: typeof FileJson }[] = [
    { id: "intake", label: "Intake", icon: ClipboardList },
    { id: "documents", label: "Documents", icon: BookOpen },
    { id: "schemas", label: "Schemas", icon: FileJson },
    { id: "registries", label: "Registries", icon: Database },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Intake Library</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Form spec, field enums, validation rules, submission records, and normalization contracts (INT-0 through INT-7)
        </p>
        {overview && (
          <div className="flex gap-4 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            <span>{overview.counts.enums} enums</span>
            <span>{overview.counts.crossFieldRules} cross-field rules</span>
            <span>{overview.counts.normalizationRules} normalization rules</span>
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

      {activeTab === "intake" && <IntakeTab />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "schemas" && <SchemasTab />}
      {activeTab === "registries" && <RegistriesTab />}
    </div>
  );
}
