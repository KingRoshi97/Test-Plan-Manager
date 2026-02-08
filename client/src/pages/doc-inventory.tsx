import type { ElementType, ReactNode } from "react";
import { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Loader2,
  BookOpen,
  FolderOpen,
  Layers,
  LayoutTemplate,
  Boxes,
  Cog,
  Sparkles,
  CheckCircle,
  XCircle,
  ArrowUpCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import DocHierarchyMap from "@/components/doc-hierarchy-map";

interface DocFile {
  name: string;
  path: string;
  exists: boolean;
}

interface DomainTemplate extends DocFile {
  domain: string;
}

interface GeneratedDomain {
  domain: string;
  files: DocFile[];
}

interface DocInventory {
  systemDocs: DocFile[];
  productSourceDocs: DocFile[];
  registrySourceDocs: DocFile[];
  coreTemplates: DocFile[];
  domainTemplates: DomainTemplate[];
  generatedDomains: GeneratedDomain[];
  totals: {
    systemDocs: number;
    productSourceDocs: number;
    registrySourceDocs: number;
    coreTemplates: number;
    domainTemplates: number;
    generatedDomains: number;
  };
}

interface UpgradeState {
  active: boolean;
  total: number;
  completed: number;
  upgraded: number;
  skipped: number;
  errored: number;
  currentFile: string;
  results: Array<{ file: string; status: string; error?: string }>;
}

const DOC_DESCRIPTIONS: Record<string, string> = {
  "README.md": "AXION System Overview",
  "INDEX.md": "Documentation Index",
  "APP_PIPELINE.md": "Application Build Pipeline",
  "CLI_REFERENCE.md": "CLI Command Reference",
  "GATES_AND_OVERRIDES.md": "Quality Gates & Overrides",
  "RUN_ORCHESTRATOR.md": "Run Orchestrator Guide",
  "STAGE_MARKERS.md": "Stage Marker Conventions",
  "TWO_ROOT_ARCHITECTURE.md": "Two-Root Architecture Model",
  "CHANGE_CONTRACT_TEMPLATE.md": "Change Contract Template",
  "SYSTEM_UPGRADE_LOG.md": "System Upgrade Log",
  "RPBS_Product.md": "Requirements & Product Boundaries Specification",
  "REBS_Product.md": "Requirements & Engineering Boundaries Specification",
  "COMPONENT_SPEC.md": "Component Specification",
  "IMPLEMENTATION_GUIDE.md": "Implementation Guide",
  "SCHEMA_SPEC.md": "Schema Specification",
  "action-vocabulary.md": "Action Vocabulary",
  "domain-build-order.md": "Domain Build Order",
  "domain-map.md": "Domain Map",
  "fullstack-coverage-map.md": "Fullstack Coverage Map",
  "glossary.md": "Glossary",
  "module-index.md": "Module Index",
  "reason-codes.md": "Reason Codes",
  "run-sequences.md": "Run Sequences",
  "ALRP.template.md": "Agent Launch & Reasoning Protocol",
  "BELS.template.md": "Business Entity Logic Specification",
  "COMPONENT_LIBRARY.template.md": "Component Library",
  "COPY_GUIDE.template.md": "Copy Guide",
  "DDES.template.md": "Domain Design & Entity Specification",
  "DIM.template.md": "Domain Interface Map",
  "ERC.template.md": "Execution Readiness Contract",
  "SCREENMAP.template.md": "Screen Map",
  "SROL.template.md": "System Refinement & Optimization Loop",
  "TESTPLAN.template.md": "Test Plan",
  "TIES.template.md": "Technical Implementation Execution Specification",
  "UI_Constraints.template.md": "UI Constraints",
  "UX_Foundations.template.md": "UX Foundations",
};

function getDescription(filename: string): string {
  return DOC_DESCRIPTIONS[filename] || filename.replace(/\.template\.md$/, "").replace(/\.md$/, "").replace(/_/g, " ");
}

function useDocUpgrade() {
  const [state, setState] = useState<UpgradeState>({
    active: false,
    total: 0,
    completed: 0,
    upgraded: 0,
    skipped: 0,
    errored: 0,
    currentFile: "",
    results: [],
  });
  const abortRef = useRef<AbortController | null>(null);

  const startUpgrade = useCallback(
    (files: string[]) => {
      if (state.active) return;

      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        active: true,
        total: files.length,
        completed: 0,
        upgraded: 0,
        skipped: 0,
        errored: 0,
        currentFile: "",
        results: [],
      });

      fetch("/api/doc-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok || !res.body) throw new Error("Upgrade request failed");
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          function pump(): Promise<void> {
            return reader.read().then(({ done, value }) => {
              if (done) {
                setState((s) => ({ ...s, active: false }));
                return;
              }
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              let eventType = "";
              for (const line of lines) {
                if (line.startsWith("event: ")) {
                  eventType = line.slice(7);
                } else if (line.startsWith("data: ")) {
                  try {
                    const d = JSON.parse(line.slice(6));
                    if (eventType === "progress") {
                      setState((s) => ({ ...s, currentFile: d.file || "" }));
                    } else if (eventType === "file-done") {
                      setState((s) => ({
                        ...s,
                        completed: d.completed,
                        upgraded: d.upgraded,
                        skipped: d.skipped,
                        errored: d.errored,
                        results: [...s.results, { file: d.file, status: d.status, error: d.error }],
                      }));
                    } else if (eventType === "done") {
                      toast({
                        title: "Upgrade Complete",
                        description: `${d.upgraded} upgraded, ${d.skipped} skipped, ${d.errored} errors`,
                      });
                      setState((s) => ({ ...s, active: false }));
                    }
                  } catch {}
                  eventType = "";
                } else if (line.trim() === "") {
                  eventType = "";
                }
              }
              return pump();
            });
          }
          return pump();
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            toast({ title: "Upgrade Error", description: err.message, variant: "destructive" });
          }
          setState((s) => ({ ...s, active: false }));
        });
    },
    [state.active]
  );

  const cancelUpgrade = useCallback(() => {
    abortRef.current?.abort();
    setState((s) => ({ ...s, active: false }));
  }, []);

  return { state, startUpgrade, cancelUpgrade };
}

function UpgradeProgressBar({ state }: { state: UpgradeState }) {
  if (!state.active && state.completed === 0) return null;

  const pct = state.total > 0 ? Math.round((state.completed / state.total) * 100) : 0;

  return (
    <Card data-testid="upgrade-progress">
      <CardContent className="py-4">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {state.active ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          <span className="text-sm font-medium" data-testid="text-upgrade-status">
            {state.active ? `Upgrading... ${state.completed}/${state.total}` : `Upgrade complete`}
          </span>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <Badge variant="secondary" data-testid="badge-upgrade-upgraded">{state.upgraded} upgraded</Badge>
            <Badge variant="outline" data-testid="badge-upgrade-skipped">{state.skipped} skipped</Badge>
            {state.errored > 0 && <Badge variant="destructive" data-testid="badge-upgrade-errored">{state.errored} errors</Badge>}
          </div>
        </div>
        <div className="w-full rounded-full h-2" style={{ background: "hsl(var(--muted))" }}>
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: "hsl(var(--primary))" }}
            data-testid="progress-bar-fill"
          />
        </div>
        {state.active && state.currentFile && (
          <p className="text-xs text-muted-foreground mt-2 font-mono truncate" data-testid="text-current-file">
            {state.currentFile}
          </p>
        )}
        {!state.active && state.results.length > 0 && (
          <div className="mt-3 max-h-40 overflow-y-auto space-y-1" data-testid="upgrade-results-list">
            {state.results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {r.status === "upgraded" ? (
                  <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                ) : r.status === "error" ? (
                  <XCircle className="w-3 h-3 text-red-500 shrink-0" />
                ) : (
                  <ArrowUpCircle className="w-3 h-3 text-muted-foreground shrink-0" />
                )}
                <span className="font-mono truncate text-muted-foreground">{r.file}</span>
                <Badge variant={r.status === "upgraded" ? "secondary" : r.status === "error" ? "destructive" : "outline"} className="ml-auto shrink-0">
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CollapsibleSection({
  title,
  subtitle,
  icon: Icon,
  count,
  defaultOpen = false,
  children,
  testId,
  onUpgrade,
  upgradeActive,
}: {
  title: string;
  subtitle: string;
  icon: ElementType;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
  testId: string;
  onUpgrade?: () => void;
  upgradeActive?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card data-testid={testId}>
      <CardHeader className="pb-3">
        <div className="flex w-full items-center gap-3">
          <div
            className="flex items-center gap-3 cursor-pointer rounded-md hover-elevate flex-1 min-w-0"
            onClick={() => setOpen(!open)}
            data-testid={`button-toggle-${testId}`}
          >
            {open ? <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />}
            <Icon className="w-5 h-5 shrink-0 text-muted-foreground" />
            <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base">{title}</CardTitle>
                <Badge variant="secondary" data-testid={`badge-count-${testId}`}>{count} files</Badge>
              </div>
              <p className="text-xs text-muted-foreground font-normal">{subtitle}</p>
            </div>
          </div>
          {onUpgrade && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); onUpgrade(); }}
              disabled={upgradeActive}
              data-testid={`button-upgrade-${testId}`}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Upgrade All
            </Button>
          )}
        </div>
      </CardHeader>
      {open && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

function FileRowWithHover({
  file,
  showPath = true,
  onUpgrade,
  upgradeActive,
}: {
  file: DocFile;
  showPath?: boolean;
  onUpgrade?: (filePath: string) => void;
  upgradeActive?: boolean;
}) {
  const desc = getDescription(file.name);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded-md hover-elevate"
      data-testid={`file-row-${file.name}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-medium truncate">{desc}</span>
        {showPath && (
          <span className="text-xs text-muted-foreground font-mono truncate">{file.path}</span>
        )}
      </div>
      {onUpgrade && (
        <Button
          size="icon"
          variant="ghost"
          className="shrink-0"
          style={{ visibility: hovered ? "visible" : "hidden" }}
          onClick={() => onUpgrade(file.path)}
          disabled={upgradeActive}
          data-testid={`button-upgrade-file-${file.name}`}
        >
          <Sparkles className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

function DomainGroup({
  domain,
  files,
  testId,
  onUpgradeFile,
  upgradeActive,
}: {
  domain: string;
  files: DocFile[];
  testId: string;
  onUpgradeFile?: (filePath: string) => void;
  upgradeActive?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div data-testid={testId}>
      <div
        className="flex w-full items-center gap-2 px-3 py-1.5 cursor-pointer rounded-md hover-elevate"
        onClick={() => setOpen(!open)}
        data-testid={`button-toggle-${testId}`}
      >
        {open ? <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground" />}
        <FolderOpen className="w-4 h-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-medium">{domain}</span>
        <Badge variant="outline" className="ml-auto" data-testid={`badge-count-${testId}`}>{files.length}</Badge>
      </div>
      {open && (
        <div className="ml-6 border-l pl-3 mt-1">
          {files.map((f) => (
            <FileRowWithHover
              key={f.path}
              file={f}
              onUpgrade={onUpgradeFile}
              upgradeActive={upgradeActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocInventoryPage() {
  const { data, isLoading } = useQuery<DocInventory>({
    queryKey: ["/api/doc-inventory"],
  });
  const { state: upgradeState, startUpgrade, cancelUpgrade } = useDocUpgrade();

  const handleNodeClick = useCallback((sectionId: string) => {
    const el = document.querySelector(`[data-testid="${sectionId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      const toggle = el.querySelector(`[data-testid="button-toggle-${sectionId}"]`);
      if (toggle) (toggle as HTMLElement).click();
    }
  }, []);

  const handleUpgradeFile = useCallback(
    (filePath: string) => {
      startUpgrade([filePath]);
    },
    [startUpgrade]
  );

  const handleUpgradeSection = useCallback(
    (files: DocFile[]) => {
      startUpgrade(files.map((f) => f.path));
    },
    [startUpgrade]
  );

  const handleUpgradeAll = useCallback(() => {
    if (!data) return;
    const allFiles = [
      ...data.systemDocs,
      ...data.productSourceDocs,
      ...data.registrySourceDocs,
      ...data.coreTemplates,
      ...data.domainTemplates,
      ...data.generatedDomains.flatMap((d) => d.files),
    ];
    startUpgrade(allFiles.map((f) => f.path));
  }, [data, startUpgrade]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="loading-doc-inventory">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="error-doc-inventory">
        <p className="text-muted-foreground" data-testid="text-error-message">Failed to load document inventory</p>
      </div>
    );
  }

  const grandTotal =
    data.totals.systemDocs +
    data.totals.productSourceDocs +
    data.totals.registrySourceDocs +
    data.totals.coreTemplates +
    data.totals.domainTemplates +
    data.totals.generatedDomains;

  const sourceTotal = data.totals.systemDocs + data.totals.productSourceDocs + data.totals.registrySourceDocs + data.totals.coreTemplates + data.totals.domainTemplates;

  const domainsByName = data.domainTemplates.reduce<Record<string, DomainTemplate[]>>((acc, t) => {
    if (!acc[t.domain]) acc[t.domain] = [];
    acc[t.domain].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto" data-testid="page-doc-inventory">
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <BookOpen className="w-6 h-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Document Inventory</h1>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            {upgradeState.active ? (
              <Button variant="destructive" size="sm" onClick={cancelUpgrade} data-testid="button-cancel-upgrade">
                Cancel Upgrade
              </Button>
            ) : (
              <Button size="sm" onClick={handleUpgradeAll} data-testid="button-upgrade-all">
                <Sparkles className="w-3 h-3 mr-1" />
                Upgrade All Docs
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete catalog of all AXION documents across the system. Click a node in the map to jump to its section.
          Use the upgrade buttons to improve document quality with AI.
        </p>
        <div className="flex items-center gap-3 flex-wrap pt-1">
          <Badge variant="secondary" data-testid="badge-grand-total">{grandTotal} total documents</Badge>
          <Badge variant="outline" data-testid="badge-source-total">{sourceTotal} source files</Badge>
          <Badge variant="outline" data-testid="badge-generated-total">{data.totals.generatedDomains} generated</Badge>
        </div>
      </div>

      <DocHierarchyMap onNodeClick={handleNodeClick} />

      <UpgradeProgressBar state={upgradeState} />

      <div className="space-y-4">
        <CollapsibleSection
          title="1. System Docs"
          subtitle="How AXION works — pipeline instructions, tooling, and architecture references"
          icon={Cog}
          count={data.totals.systemDocs}
          defaultOpen
          testId="section-system-docs"
          onUpgrade={() => handleUpgradeSection(data.systemDocs)}
          upgradeActive={upgradeState.active}
        >
          <div className="space-y-0.5">
            {data.systemDocs.map((f) => (
              <FileRowWithHover key={f.path} file={f} onUpgrade={handleUpgradeFile} upgradeActive={upgradeState.active} />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="2. Source Docs — Product"
          subtitle="High-level product specifications that drive the pipeline"
          icon={Layers}
          count={data.totals.productSourceDocs}
          defaultOpen
          testId="section-product-docs"
          onUpgrade={() => handleUpgradeSection(data.productSourceDocs)}
          upgradeActive={upgradeState.active}
        >
          <div className="space-y-0.5">
            {data.productSourceDocs.map((f) => (
              <FileRowWithHover key={f.path} file={f} onUpgrade={handleUpgradeFile} upgradeActive={upgradeState.active} />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="2b. Source Docs — Registry"
          subtitle="System reference tables, indexes, and vocabularies used for validation and ordering"
          icon={Layers}
          count={data.totals.registrySourceDocs}
          defaultOpen
          testId="section-registry-docs"
          onUpgrade={() => handleUpgradeSection(data.registrySourceDocs)}
          upgradeActive={upgradeState.active}
        >
          <div className="space-y-0.5">
            {data.registrySourceDocs.map((f) => (
              <FileRowWithHover key={f.path} file={f} onUpgrade={handleUpgradeFile} upgradeActive={upgradeState.active} />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="3. Core Templates"
          subtitle="Blank spec blueprints cloned into every project workspace — define WHAT the project needs"
          icon={LayoutTemplate}
          count={data.totals.coreTemplates}
          defaultOpen
          testId="section-core-templates"
          onUpgrade={() => handleUpgradeSection(data.coreTemplates)}
          upgradeActive={upgradeState.active}
        >
          <div className="space-y-0.5">
            {data.coreTemplates.map((f) => (
              <FileRowWithHover key={f.path} file={f} onUpgrade={handleUpgradeFile} upgradeActive={upgradeState.active} />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="4. Domain Module Templates"
          subtitle="Domain scope definitions — define HOW each technical area should be built"
          icon={Boxes}
          count={data.totals.domainTemplates}
          testId="section-domain-templates"
          onUpgrade={() => handleUpgradeSection(data.domainTemplates)}
          upgradeActive={upgradeState.active}
        >
          <div className="space-y-1">
            {Object.entries(domainsByName)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([domain, files]) => (
                <DomainGroup
                  key={domain}
                  domain={domain}
                  files={files}
                  testId={`domain-template-${domain}`}
                  onUpgradeFile={handleUpgradeFile}
                  upgradeActive={upgradeState.active}
                />
              ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="5. Generated Output"
          subtitle="Pipeline output — core templates stamped and filled per domain. Regenerated when templates change."
          icon={FolderOpen}
          count={data.totals.generatedDomains}
          testId="section-generated-output"
          onUpgrade={() => handleUpgradeSection(data.generatedDomains.flatMap((d) => d.files))}
          upgradeActive={upgradeState.active}
        >
          <div className="space-y-1">
            {data.generatedDomains
              .sort((a, b) => a.domain.localeCompare(b.domain))
              .map((d) => (
                <DomainGroup
                  key={d.domain}
                  domain={d.domain}
                  files={d.files}
                  testId={`generated-domain-${d.domain}`}
                  onUpgradeFile={handleUpgradeFile}
                  upgradeActive={upgradeState.active}
                />
              ))}
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
