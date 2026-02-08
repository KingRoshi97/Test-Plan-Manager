import type { ElementType, ReactNode } from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Eye,
  Plus,
  Lightbulb,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import ReactMarkdown from "react-markdown";
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
    (files: string[], userInstructions?: string) => {
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

      const body: Record<string, unknown> = { files };
      if (userInstructions && userInstructions.trim()) {
        body.userInstructions = userInstructions.trim();
      }

      fetch("/api/doc-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

function UpgradeDialog({
  open,
  onOpenChange,
  files,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: string[];
  onConfirm: (files: string[], instructions: string) => void;
}) {
  const [instructions, setInstructions] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (open && files.length === 1) {
      setLoadingSuggestions(true);
      setSuggestions([]);
      fetch("/api/doc-upgrade/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: files[0] }),
      })
        .then((r) => r.json())
        .then((data) => {
          setSuggestions(data.suggestions || []);
        })
        .catch(() => {
          setSuggestions(["Could not load suggestions."]);
        })
        .finally(() => setLoadingSuggestions(false));
    } else if (open && files.length > 1) {
      setSuggestions([
        "Review all documents for consistency across sections",
        "Fill any remaining UNKNOWN placeholders with specific content",
        "Strengthen thin sections with additional detail",
        "Ensure technical precision and terminology consistency",
      ]);
      setLoadingSuggestions(false);
    }
    if (!open) {
      setInstructions("");
      setSuggestions([]);
    }
  }, [open, files]);

  const isSingle = files.length === 1;
  const fileName = isSingle ? files[0].split("/").pop() || files[0] : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="dialog-upgrade">
        <DialogHeader>
          <DialogTitle data-testid="text-upgrade-dialog-title">
            {isSingle ? `Upgrade: ${getDescription(fileName)}` : `Upgrade ${files.length} Documents`}
          </DialogTitle>
          <DialogDescription>
            {isSingle
              ? "AI will analyze and improve this document. You can add custom instructions below."
              : "AI will upgrade all selected documents. Add custom instructions to guide the upgrade."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-muted-foreground" />
              AI Suggestions
            </Label>
            <div className="rounded-md border p-3 space-y-2 max-h-40 overflow-y-auto" style={{ background: "hsl(var(--muted) / 0.3)" }}>
              {loadingSuggestions ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-loading-suggestions">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Analyzing document...
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm cursor-pointer rounded-md px-2 py-1 hover-elevate"
                    onClick={() => setInstructions((prev) => prev ? `${prev}\n${s}` : s)}
                    data-testid={`suggestion-item-${i}`}
                  >
                    <Sparkles className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground" />
                    <span>{s}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No suggestions available.</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Click a suggestion to add it to your instructions.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="upgrade-instructions">Your Instructions (optional)</Label>
            <Textarea
              id="upgrade-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Make the API section more detailed, add error handling examples, expand the security considerations..."
              rows={4}
              data-testid="input-upgrade-instructions"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for a general quality upgrade, or write specific directions for the AI.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-upgrade-cancel">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(files, instructions);
              onOpenChange(false);
            }}
            data-testid="button-upgrade-confirm"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {isSingle ? "Upgrade Document" : `Upgrade ${files.length} Documents`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FileViewerDialog({
  open,
  onOpenChange,
  filePath,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filePath: string | null;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && filePath) {
      setLoading(true);
      setContent(null);
      setError(null);
      fetch(`/api/files/read?path=${encodeURIComponent(filePath)}`)
        .then((r) => {
          if (!r.ok) throw new Error("Failed to load file");
          return r.json();
        })
        .then((data) => {
          setContent(data.content || "");
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => setLoading(false));
    }
    if (!open) {
      setContent(null);
      setError(null);
    }
  }, [open, filePath]);

  const fileName = filePath ? filePath.split("/").pop() || filePath : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col" data-testid="dialog-file-viewer">
        <DialogHeader>
          <DialogTitle data-testid="text-viewer-title">{getDescription(fileName)}</DialogTitle>
          <DialogDescription className="font-mono text-xs">{filePath}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12" data-testid="viewer-loading">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-destructive" data-testid="viewer-error">{error}</div>
          ) : content !== null ? (
            <div className="prose prose-sm dark:prose-invert max-w-none p-4" data-testid="viewer-content">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : null}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-viewer-close">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddDocDialog({
  open,
  onOpenChange,
  sectionId,
  sectionLabel,
  domain,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  sectionLabel: string;
  domain?: string;
}) {
  const [filename, setFilename] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) setFilename("");
  }, [open]);

  const handleCreate = async () => {
    if (!filename.trim()) return;
    setCreating(true);
    try {
      const body: Record<string, string> = { section: sectionId, filename: filename.trim() };
      if (domain) body.domain = domain;

      const res = await fetch("/api/docs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to create document", variant: "destructive" });
        return;
      }
      toast({ title: "Document Created", description: `${data.name} has been created.` });
      queryClient.invalidateQueries({ queryKey: ["/api/doc-inventory"] });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-add-doc">
        <DialogHeader>
          <DialogTitle data-testid="text-add-doc-title">Add Document</DialogTitle>
          <DialogDescription>
            Create a new markdown file in <span className="font-medium">{sectionLabel}</span>
            {domain && <> under <span className="font-medium">{domain}</span></>}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc-filename">Filename</Label>
            <Input
              id="doc-filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g., MY_NEW_DOC.md"
              data-testid="input-doc-filename"
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            />
            <p className="text-xs text-muted-foreground">
              The .md extension will be added automatically if not included.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-add-doc-cancel">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!filename.trim() || creating} data-testid="button-add-doc-confirm">
            {creating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  onAddDoc,
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
  onAddDoc?: () => void;
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
          <div className="flex items-center gap-1 shrink-0">
            {onAddDoc && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onAddDoc(); }}
                data-testid={`button-add-doc-${testId}`}
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
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
  onView,
  upgradeActive,
}: {
  file: DocFile;
  showPath?: boolean;
  onUpgrade?: (filePath: string) => void;
  onView?: (filePath: string) => void;
  upgradeActive?: boolean;
}) {
  const desc = getDescription(file.name);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded-md hover-elevate cursor-pointer"
      data-testid={`file-row-${file.name}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onView?.(file.path)}
    >
      <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-medium truncate">{desc}</span>
        {showPath && (
          <span className="text-xs text-muted-foreground font-mono truncate">{file.path}</span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          style={{ visibility: hovered ? "visible" : "hidden" }}
          onClick={(e) => { e.stopPropagation(); onView?.(file.path); }}
          data-testid={`button-view-file-${file.name}`}
        >
          <Eye className="w-3 h-3" />
        </Button>
        {onUpgrade && (
          <Button
            size="icon"
            variant="ghost"
            style={{ visibility: hovered ? "visible" : "hidden" }}
            onClick={(e) => { e.stopPropagation(); onUpgrade(file.path); }}
            disabled={upgradeActive}
            data-testid={`button-upgrade-file-${file.name}`}
          >
            <Sparkles className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

function DomainGroup({
  domain,
  files,
  testId,
  onUpgradeFile,
  onViewFile,
  onAddDoc,
  upgradeActive,
}: {
  domain: string;
  files: DocFile[];
  testId: string;
  onUpgradeFile?: (filePath: string) => void;
  onViewFile?: (filePath: string) => void;
  onAddDoc?: (domain: string) => void;
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
        <div className="flex items-center gap-1 ml-auto shrink-0">
          {onAddDoc && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onAddDoc(domain); }}
              data-testid={`button-add-doc-domain-${domain}`}
            >
              <Plus className="w-3 h-3" />
            </Button>
          )}
          <Badge variant="outline" data-testid={`badge-count-${testId}`}>{files.length}</Badge>
        </div>
      </div>
      {open && (
        <div className="ml-6 border-l pl-3 mt-1">
          {files.map((f) => (
            <FileRowWithHover
              key={f.path}
              file={f}
              onUpgrade={onUpgradeFile}
              onView={onViewFile}
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

  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeFiles, setUpgradeFiles] = useState<string[]>([]);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFilePath, setViewerFilePath] = useState<string | null>(null);

  const [addDocOpen, setAddDocOpen] = useState(false);
  const [addDocSection, setAddDocSection] = useState("");
  const [addDocSectionLabel, setAddDocSectionLabel] = useState("");
  const [addDocDomain, setAddDocDomain] = useState<string | undefined>(undefined);

  const handleNodeClick = useCallback((sectionId: string) => {
    const el = document.querySelector(`[data-testid="${sectionId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      const toggle = el.querySelector(`[data-testid="button-toggle-${sectionId}"]`);
      if (toggle) (toggle as HTMLElement).click();
    }
  }, []);

  const openUpgradeDialog = useCallback((files: string[]) => {
    setUpgradeFiles(files);
    setUpgradeDialogOpen(true);
  }, []);

  const handleUpgradeFile = useCallback(
    (filePath: string) => {
      openUpgradeDialog([filePath]);
    },
    [openUpgradeDialog]
  );

  const handleUpgradeSection = useCallback(
    (files: DocFile[]) => {
      openUpgradeDialog(files.map((f) => f.path));
    },
    [openUpgradeDialog]
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
    openUpgradeDialog(allFiles.map((f) => f.path));
  }, [data, openUpgradeDialog]);

  const handleUpgradeConfirm = useCallback(
    (files: string[], instructions: string) => {
      startUpgrade(files, instructions || undefined);
    },
    [startUpgrade]
  );

  const handleViewFile = useCallback((filePath: string) => {
    setViewerFilePath(filePath);
    setViewerOpen(true);
  }, []);

  const openAddDoc = useCallback((sectionId: string, label: string, domain?: string) => {
    setAddDocSection(sectionId);
    setAddDocSectionLabel(label);
    setAddDocDomain(domain);
    setAddDocOpen(true);
  }, []);

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
          Complete catalog of all AXION documents across the system. Click a file to view its contents.
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
          onAddDoc={() => openAddDoc("section-system-docs", "System Docs")}
          upgradeActive={upgradeState.active}
        >
          <div className="space-y-0.5">
            {data.systemDocs.map((f) => (
              <FileRowWithHover key={f.path} file={f} onUpgrade={handleUpgradeFile} onView={handleViewFile} upgradeActive={upgradeState.active} />
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
          onAddDoc={() => openAddDoc("section-product-docs", "Source Docs — Product")}
          upgradeActive={upgradeState.active}
        >
          <div className="space-y-0.5">
            {data.productSourceDocs.map((f) => (
              <FileRowWithHover key={f.path} file={f} onUpgrade={handleUpgradeFile} onView={handleViewFile} upgradeActive={upgradeState.active} />
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
          onAddDoc={() => openAddDoc("section-registry-docs", "Source Docs — Registry")}
          upgradeActive={upgradeState.active}
        >
          <div className="space-y-0.5">
            {data.registrySourceDocs.map((f) => (
              <FileRowWithHover key={f.path} file={f} onUpgrade={handleUpgradeFile} onView={handleViewFile} upgradeActive={upgradeState.active} />
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
          onAddDoc={() => openAddDoc("section-core-templates", "Core Templates")}
          upgradeActive={upgradeState.active}
        >
          <div className="space-y-0.5">
            {data.coreTemplates.map((f) => (
              <FileRowWithHover key={f.path} file={f} onUpgrade={handleUpgradeFile} onView={handleViewFile} upgradeActive={upgradeState.active} />
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
                  onViewFile={handleViewFile}
                  onAddDoc={(d) => openAddDoc("section-domain-templates", "Domain Module Templates", d)}
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
                  onViewFile={handleViewFile}
                  onAddDoc={(dom) => openAddDoc("section-generated-output", "Generated Output", dom)}
                  upgradeActive={upgradeState.active}
                />
              ))}
          </div>
        </CollapsibleSection>
      </div>

      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        files={upgradeFiles}
        onConfirm={handleUpgradeConfirm}
      />

      <FileViewerDialog
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        filePath={viewerFilePath}
      />

      <AddDocDialog
        open={addDocOpen}
        onOpenChange={setAddDocOpen}
        sectionId={addDocSection}
        sectionLabel={addDocSectionLabel}
        domain={addDocDomain}
      />
    </div>
  );
}
