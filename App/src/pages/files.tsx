import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import {
  Folder,
  FileText,
  FileJson,
  FileCode,
  ChevronRight,
  ChevronDown,
  Download,
  Loader2,
  Search,
  Info,
  Copy,
  CheckCircle2,
  Hash,
  Clock,
  Layers,
  Package,
  X,
  FolderOpen,
  PanelRightClose,
  PanelRight,
} from "lucide-react";
import { GlassPanel } from "../components/ui/glass-panel";
import { StatusChip } from "../components/ui/status-chip";
import { CodeViewer } from "../components/ui/code-viewer";
import type { Assembly } from "../../../shared/schema";

interface TreeNode {
  name: string;
  type: "directory" | "file";
  path: string;
  size?: number;
  children?: TreeNode[];
}

interface ArtifactEntry {
  artifact_id: string;
  type: string;
  path: string;
  sha256: string;
  created_at: string;
  producer: { stage_id: string };
}

interface FileContent {
  path: string;
  content: string;
}

const ARTIFACT_TYPE_COLORS: Record<string, string> = {
  stage_report: "processing",
  gate_report: "intelligence",
  run_manifest: "success",
  artifact_index: "neutral",
  template: "warning",
  kit: "success",
  intake: "processing",
  canonical: "intelligence",
  plan: "warning",
  proof: "success",
  verification: "intelligence",
};

const TYPE_FILTERS = [
  "all",
  "stage_report",
  "gate_report",
  "template",
  "kit",
  "intake",
  "canonical",
  "verification",
  "proof",
] as const;

function getFileIcon(name: string) {
  if (name.endsWith(".json")) return FileJson;
  if (name.endsWith(".md")) return FileCode;
  if (name.endsWith(".jsonl")) return FileText;
  return FileText;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatTimestamp(ts?: string): string {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

function getLanguageFromFilename(name: string): "json" | "markdown" | "text" {
  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".md")) return "markdown";
  if (name.endsWith(".jsonl")) return "json";
  return "text";
}

function TreeItem({
  node,
  depth,
  selectedPath,
  onSelect,
  searchTerm,
  expandedDirs,
  onToggleDir,
}: {
  node: TreeNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  searchTerm: string;
  expandedDirs: Set<string>;
  onToggleDir: (path: string) => void;
}) {
  const isDir = node.type === "directory";
  const isExpanded = expandedDirs.has(node.path);
  const isSelected = selectedPath === node.path;

  if (searchTerm && !matchesSearch(node, searchTerm)) return null;

  const Icon = isDir
    ? isExpanded ? FolderOpen : Folder
    : getFileIcon(node.name);

  return (
    <>
      <button
        onClick={() => {
          if (isDir) {
            onToggleDir(node.path);
          } else {
            onSelect(node.path);
          }
        }}
        className={`w-full flex items-center gap-1.5 py-1 px-2 rounded text-xs text-left transition-colors ${
          isSelected
            ? "bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]"
            : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent)/0.5)]"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isDir && (
          <span className="shrink-0 w-3">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
            ) : (
              <ChevronRight className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
            )}
          </span>
        )}
        {!isDir && <span className="w-3" />}
        <Icon className={`w-3.5 h-3.5 shrink-0 ${
          isDir
            ? "text-[hsl(var(--status-processing))]"
            : isSelected
            ? "text-[hsl(var(--primary))]"
            : "text-[hsl(var(--muted-foreground))]"
        }`} />
        <span className="truncate">{node.name}</span>
        {!isDir && node.size !== undefined && (
          <span className="ml-auto text-[10px] text-[hsl(var(--muted-foreground))] shrink-0">
            {formatFileSize(node.size)}
          </span>
        )}
      </button>
      {isDir && isExpanded && node.children && (
        <>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              searchTerm={searchTerm}
              expandedDirs={expandedDirs}
              onToggleDir={onToggleDir}
            />
          ))}
        </>
      )}
    </>
  );
}

function matchesSearch(node: TreeNode, term: string): boolean {
  const lower = term.toLowerCase();
  if (node.name.toLowerCase().includes(lower)) return true;
  if (node.type === "directory" && node.children) {
    return node.children.some((c) => matchesSearch(c, lower));
  }
  return false;
}

function filterTreeByType(tree: TreeNode[], artifactIndex: ArtifactEntry[], filterType: string): TreeNode[] {
  if (filterType === "all") return tree;
  const matchingPaths = new Set(
    artifactIndex.filter((a) => a.type === filterType).map((a) => a.path)
  );

  function filterNode(node: TreeNode): TreeNode | null {
    if (node.type === "file") {
      const relativePath = node.path.replace(/^[^/]+\//, "");
      return matchingPaths.has(relativePath) ? node : null;
    }
    if (node.children) {
      const filtered = node.children.map(filterNode).filter(Boolean) as TreeNode[];
      if (filtered.length > 0) {
        return { ...node, children: filtered };
      }
    }
    return null;
  }

  return tree.map(filterNode).filter(Boolean) as TreeNode[];
}

export default function FilesPage() {
  const [selectedRun, setSelectedRun] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showMetadata, setShowMetadata] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);

  const { data: assemblies = [] } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    queryFn: () => apiRequest("/api/assemblies"),
  });

  const runsWithIds = useMemo(() => {
    return assemblies
      .filter((a) => a.runId && a.status === "completed")
      .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime());
  }, [assemblies]);

  const activeRunId = selectedRun || runsWithIds[0]?.runId || "";

  const { data: tree = [], isLoading: treeLoading } = useQuery<TreeNode[]>({
    queryKey: ["/api/artifacts", activeRunId, "tree"],
    queryFn: () => apiRequest(`/api/artifacts/${activeRunId}/tree`),
    enabled: !!activeRunId,
  });

  const { data: artifactIndex = [] } = useQuery<ArtifactEntry[]>({
    queryKey: ["/api/artifacts", activeRunId],
    queryFn: () => apiRequest(`/api/artifacts/${activeRunId}`),
    enabled: !!activeRunId,
  });

  const { data: fileContent, isLoading: fileLoading } = useQuery<FileContent>({
    queryKey: ["/api/files/content", selectedFile],
    queryFn: () => apiRequest(`/api/files/${encodeURIComponent(selectedFile!)}`),
    enabled: !!selectedFile,
  });

  const filteredTree = useMemo(
    () => filterTreeByType(tree, artifactIndex, activeFilter),
    [tree, artifactIndex, activeFilter]
  );

  const selectedArtifact = useMemo(() => {
    if (!selectedFile) return null;
    const relativePath = selectedFile.replace(/^[^/]+\//, "");
    return artifactIndex.find((a) => a.path === relativePath) || null;
  }, [selectedFile, artifactIndex]);

  const selectedFileName = selectedFile?.split("/").pop() || "";

  const activeAssembly = runsWithIds.find((a) => a.runId === activeRunId);

  function toggleDir(path: string) {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  function handleSelectFile(path: string) {
    setSelectedFile(path);
  }

  function copyHash(hash: string) {
    navigator.clipboard.writeText(hash).then(() => {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    });
  }

  const artifactTypeVariant = (type: string) =>
    (ARTIFACT_TYPE_COLORS[type] as any) || "neutral";

  return (
    <div className="animate-fade-in flex flex-col" style={{ height: "calc(100vh - var(--topbar-height) - 3rem)" }}>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-[hsl(var(--foreground))]">Artifact Explorer</h1>
          {artifactIndex.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] font-mono-tech">
              {artifactIndex.length} artifacts
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={activeRunId}
            onChange={(e) => {
              setSelectedRun(e.target.value);
              setSelectedFile(null);
              setExpandedDirs(new Set());
            }}
            className="text-xs px-2 py-1.5 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] font-mono-tech"
          >
            {runsWithIds.map((a) => (
              <option key={a.runId} value={a.runId!}>
                {a.runId} — {a.projectName}
              </option>
            ))}
            {runsWithIds.length === 0 && <option value="">No completed assemblies</option>}
          </select>
          {activeRunId && activeAssembly && (
            <a
              href={`/api/assemblies/${activeAssembly.id}/kit`}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--foreground))]"
            >
              <Download className="w-3.5 h-3.5" />
              Download Kit
            </a>
          )}
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="p-1.5 rounded-md hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--muted-foreground))]"
            title={showMetadata ? "Hide metadata panel" : "Show metadata panel"}
          >
            {showMetadata ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-3 overflow-x-auto scrollbar-thin pb-1">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
              activeFilter === f
                ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
                : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] border border-transparent"
            }`}
          >
            {f === "all" ? "All" : f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="flex-1 flex gap-3 min-h-0">

        <GlassPanel solid className="w-[250px] shrink-0 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[hsl(var(--secondary)/0.5)]">
              <Search className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 text-xs bg-transparent border-none outline-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")}>
                  <X className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-1">
            {treeLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--muted-foreground))]" />
              </div>
            ) : filteredTree.length === 0 ? (
              <div className="text-center py-8 text-xs text-[hsl(var(--muted-foreground))]">
                {activeFilter !== "all" ? "No matching artifacts" : "No files found"}
              </div>
            ) : (
              filteredTree.map((node) => (
                <TreeItem
                  key={node.path}
                  node={node}
                  depth={0}
                  selectedPath={selectedFile}
                  onSelect={handleSelectFile}
                  searchTerm={searchTerm}
                  expandedDirs={expandedDirs}
                  onToggleDir={toggleDir}
                />
              ))
            )}
          </div>
        </GlassPanel>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {selectedFile && fileContent ? (
            <>
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))] font-mono-tech truncate">
                  {selectedFile.split("/").map((part, i, arr) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
                      <span className={i === arr.length - 1 ? "text-[hsl(var(--foreground))]" : ""}>
                        {part}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeViewer
                  content={
                    typeof fileContent.content === "object"
                      ? JSON.stringify(fileContent.content, null, 2)
                      : fileContent.content
                  }
                  language={getLanguageFromFilename(selectedFileName)}
                  title={selectedFileName}
                  maxHeight="calc(100vh - var(--topbar-height) - 12rem)"
                />
              </div>
            </>
          ) : fileLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          ) : (
            <GlassPanel solid className="flex-1 flex flex-col items-center justify-center">
              <Package className="w-10 h-10 text-[hsl(var(--muted-foreground))] opacity-30 mb-3" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Select a file to preview</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 opacity-60">
                Browse the tree on the left or use the search
              </p>
            </GlassPanel>
          )}
        </div>

        {showMetadata && (
          <GlassPanel solid className="w-[260px] shrink-0 p-4 overflow-y-auto scrollbar-thin animate-fade-in">
            {selectedFile && selectedArtifact ? (
              <div className="space-y-4">
                <div>
                  <span className="text-system-label">Artifact</span>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] mt-1 break-all">
                    {selectedArtifact.artifact_id}
                  </p>
                </div>

                <div>
                  <span className="text-system-label">Type</span>
                  <div className="mt-1">
                    <StatusChip
                      variant={artifactTypeVariant(selectedArtifact.type)}
                      label={selectedArtifact.type.replace(/_/g, " ")}
                      size="sm"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-system-label">Path</span>
                  <p className="text-xs font-mono-tech text-[hsl(var(--muted-foreground))] mt-1 break-all">
                    {selectedArtifact.path}
                  </p>
                </div>

                <div>
                  <span className="text-system-label">SHA-256</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <p className="text-[11px] font-mono-tech text-[hsl(var(--muted-foreground))] truncate">
                      {selectedArtifact.sha256.substring(0, 16)}…
                    </p>
                    <button
                      onClick={() => copyHash(selectedArtifact.sha256)}
                      className="p-0.5 rounded hover:bg-[hsl(var(--accent))] transition-colors"
                      title="Copy full hash"
                    >
                      {copiedHash ? (
                        <CheckCircle2 className="w-3 h-3 text-[hsl(var(--status-success))]" />
                      ) : (
                        <Copy className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-system-label">Created</span>
                  <p className="text-xs text-[hsl(var(--foreground))] mt-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                    {formatTimestamp(selectedArtifact.created_at)}
                  </p>
                </div>

                <div>
                  <span className="text-system-label">Producer</span>
                  <p className="text-xs font-mono-tech text-[hsl(var(--foreground))] mt-1 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-[hsl(var(--status-processing))]" />
                    {selectedArtifact.producer.stage_id}
                  </p>
                </div>
              </div>
            ) : selectedFile ? (
              <div className="space-y-4">
                <div>
                  <span className="text-system-label">File</span>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] mt-1 break-all">
                    {selectedFileName}
                  </p>
                </div>
                <div>
                  <span className="text-system-label">Path</span>
                  <p className="text-xs font-mono-tech text-[hsl(var(--muted-foreground))] mt-1 break-all">
                    {selectedFile}
                  </p>
                </div>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] italic">
                  Not tracked in artifact index
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <Info className="w-6 h-6 text-[hsl(var(--muted-foreground))] opacity-30 mb-2" />
                <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
                  Select a file to view its metadata
                </p>
              </div>
            )}
          </GlassPanel>
        )}
      </div>
    </div>
  );
}
