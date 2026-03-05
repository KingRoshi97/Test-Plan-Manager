import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Loader2, FileJson, BookOpen, Database, ChevronDown, ChevronRight, Server } from "lucide-react";

interface SystemOverview {
  groups: Record<string, string[]>;
  schemas: string[];
  registries: string[];
  counts: { docs: number; schemas: number; registries: number };
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

const SYS_GROUP_LABELS: Record<string, string> = {
  "SYS-0": "Purpose & Boundaries",
  "SYS-1": "Workspace / Project Model",
  "SYS-2": "Pin / Lock Policies",
  "SYS-3": "Adapter Manager",
  "SYS-4": "Quotas & Rate Limits",
  "SYS-5": "Notification Routing",
  "SYS-6": "Policy Engine Hooks",
  "SYS-7": "Minimum Viable Set",
};

type TabId = "documents" | "schemas" | "registries";

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
  const { data: overview } = useQuery<SystemOverview>({
    queryKey: ["/api/system"],
    queryFn: () => apiRequest("/api/system"),
  });
  const { data: docs = [], isLoading } = useQuery<DocEntry[]>({
    queryKey: ["/api/system/docs"],
    queryFn: () => apiRequest("/api/system/docs"),
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
        const label = SYS_GROUP_LABELS[groupKey] ?? groupKey;
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
                        <span className="ml-auto text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">
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
    queryKey: ["/api/system/schemas"],
    queryFn: () => apiRequest("/api/system/schemas"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-3">
      {schemas.map((schema) => {
        const schemaContent = schema.content as Record<string, unknown>;
        const title = (schemaContent?.title as string) ?? schema.filename;
        const description = schemaContent?.description as string | undefined;
        return (
          <ExpandableCard
            key={schema.filename}
            title={title}
            subtitle={schema.filename}
          >
            {description && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 mb-3">{description}</p>
            )}
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
    queryKey: ["/api/system/registries"],
    queryFn: () => apiRequest("/api/system/registries"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-3">
      {registries.map((reg) => {
        const content = reg.content as Record<string, unknown>;
        const registryId = (content?.registry_id ?? content?.routes_id ?? reg.filename) as string;
        const items = Object.entries(content).filter(([k]) => !["schema_version", "registry_id", "routes_id"].includes(k));
        const itemCount = items.reduce((acc, [, v]) => acc + (Array.isArray(v) ? v.length : 0), 0);
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

export default function SystemLibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("documents");

  const { data: overview, isLoading } = useQuery<SystemOverview>({
    queryKey: ["/api/system"],
    queryFn: () => apiRequest("/api/system"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  const counts = overview?.counts ?? { docs: 0, schemas: 0, registries: 0 };
  const groupCount = Object.keys(overview?.groups ?? {}).length;

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "documents", label: "Documents", count: counts.docs },
    { id: "schemas", label: "Schemas", count: counts.schemas },
    { id: "registries", label: "Registries", count: counts.registries },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">System Library</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Control-plane configuration and runtime contracts (SYS-0 through SYS-7)
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
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

      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "schemas" && <SchemasTab />}
      {activeTab === "registries" && <RegistriesTab />}
    </div>
  );
}
