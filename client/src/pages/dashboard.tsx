import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ExternalLink,
  Trash2,
  Loader2,
  Lock,
  ShieldCheck,
  ShieldX,
  ShieldQuestion,
  Layers,
  Clock,
  AlertCircle,
  ArrowUpCircle,
  Play,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  Activity,
  Timer,
} from "lucide-react";

interface EnrichedAssembly {
  id: string;
  projectName: string | null;
  idea: string | null;
  preset: string | null;
  presetId: string | null;
  state: string;
  step: string | null;
  progress: unknown;
  errors: string[] | null;
  createdAt: string;
  updatedAt: string;
  wsExists: boolean;
  hasRegistry: boolean;
  hasDomains: boolean;
  hasApp: boolean;
  verifyStatus: string | null;
  lockEligible: boolean;
  revision: number;
  upgradeNotes: string | null;
  kitType: string;
  lastRunAt: string | null;
  totalRuns: number;
  completedSteps: number;
  totalDuration: number;
}

function getStateBadgeVariant(state: string) {
  switch (state) {
    case "queued": return "secondary" as const;
    case "running": return "default" as const;
    case "completed": return "success" as const;
    case "failed": return "error" as const;
    case "exported": return "outline" as const;
    default: return "secondary" as const;
  }
}

function getStateBadgeClassName(state: string) {
  if (state === "running") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-transparent";
  if (state === "exported") return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-transparent";
  return "";
}

function getCardTintStyle(state: string): React.CSSProperties | undefined {
  switch (state) {
    case "running": return { backgroundColor: 'hsl(var(--info-tint))' };
    case "completed": return { backgroundColor: 'hsl(var(--success-tint))' };
    case "failed": return { backgroundColor: 'hsl(var(--error-tint))' };
    case "exported": return { backgroundColor: 'hsl(var(--purple-tint))' };
    default: return undefined;
  }
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const min = Math.floor(ms / 60000);
  const sec = Math.round((ms % 60000) / 1000);
  return `${min}m ${sec}s`;
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "...";
}

function StatsBar({ assemblies }: { assemblies: EnrichedAssembly[] }) {
  const total = assemblies.length;
  const completed = assemblies.filter(a => a.state === "completed" || a.state === "exported").length;
  const running = assemblies.filter(a => a.state === "running").length;
  const failed = assemblies.filter(a => a.state === "failed").length;
  const queued = assemblies.filter(a => a.state === "queued").length;
  const totalDuration = assemblies.reduce((sum, a) => sum + (a.totalDuration || 0), 0);

  const stats = [
    { label: "Total", value: total, icon: Layers, color: "text-foreground" },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "text-green-600 dark:text-green-400" },
    { label: "Running", value: running, icon: Activity, color: "text-blue-600 dark:text-blue-400" },
    { label: "Failed", value: failed, icon: XCircle, color: "text-red-600 dark:text-red-400" },
    { label: "Queued", value: queued, icon: Clock, color: "text-muted-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" data-testid="stats-bar">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} data-testid={`stat-${label.toLowerCase()}`}>
          <CardContent className="flex items-center gap-3 py-3 px-4">
            <Icon className={`w-4 h-4 shrink-0 ${color}`} />
            <div className="min-w-0">
              <div className="text-lg font-semibold leading-none" data-testid={`stat-value-${label.toLowerCase()}`}>{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: assemblies = [], isLoading } = useQuery<EnrichedAssembly[]>({
    queryKey: ["/api/assemblies"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/assemblies/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
      toast({ title: "Assembly deleted" });
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete assembly", variant: "destructive" });
      setDeleteConfirmId(null);
    },
  });

  const exportMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/assemblies/${id}/export`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
      toast({ title: "Export completed" });
    },
    onError: () => {
      toast({ title: "Export failed", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto" data-testid="dashboard-page">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold" data-testid="text-dashboard-header">Assemblies</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage your AXION assembly builds.</p>
          </div>
        </div>
        <Button onClick={() => navigate("/new")} data-testid="button-new-assembly">
          <Plus className="w-4 h-4" />
          New Assembly
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16" data-testid="loading-assemblies">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : assemblies.length === 0 ? (
        <Card data-testid="empty-state">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Layers className="w-12 h-12 text-primary/20 mb-4" />
            <h3 className="text-base font-medium mb-1">No assemblies yet</h3>
            <p className="text-sm text-muted-foreground mb-2 max-w-sm">
              Create your first assembly to start building a project with AXION.
            </p>
            <p className="text-xs text-muted-foreground/70 mb-6">
              From idea to deployable workspace in minutes.
            </p>
            <Button onClick={() => navigate("/new")} data-testid="button-empty-new-assembly">
              <Plus className="w-4 h-4" />
              Create your first assembly
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <StatsBar assemblies={assemblies} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="assemblies-grid">
            {assemblies.map((assembly) => (
              <AssemblyCard
                key={assembly.id}
                assembly={assembly}
                onOpen={() => navigate(`/assembly/${assembly.id}`)}
                onDelete={() => {
                  if (deleteConfirmId === assembly.id) {
                    deleteMutation.mutate(assembly.id);
                  } else {
                    setDeleteConfirmId(assembly.id);
                  }
                }}
                onExport={() => exportMutation.mutate(assembly.id)}
                isExporting={exportMutation.isPending}
                isDeleting={deleteMutation.isPending && deleteConfirmId === assembly.id}
                isConfirmingDelete={deleteConfirmId === assembly.id}
                onCancelDelete={() => setDeleteConfirmId(null)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatusDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground" title={label}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-muted-foreground/30"}`}
      />
      <span className="sr-only">{label}: {active ? "yes" : "no"}</span>
    </span>
  );
}

function AssemblyCard({
  assembly,
  onOpen,
  onDelete,
  onExport,
  isExporting,
  isDeleting,
  isConfirmingDelete,
  onCancelDelete,
}: {
  assembly: EnrichedAssembly;
  onOpen: () => void;
  onDelete: () => void;
  onExport: () => void;
  isExporting: boolean;
  isDeleting: boolean;
  isConfirmingDelete: boolean;
  onCancelDelete: () => void;
}) {
  const [, navigate] = useLocation();
  const stateVariant = getStateBadgeVariant(assembly.state);
  const stateClassName = getStateBadgeClassName(assembly.state);
  const tintStyle = getCardTintStyle(assembly.state);
  const showExport = assembly.lockEligible || assembly.state === "completed";

  return (
    <Card
      className="hover-elevate flex flex-col"
      style={tintStyle}
      data-testid={`card-assembly-${assembly.id}`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-sm truncate" data-testid={`text-project-name-${assembly.id}`}>
            {assembly.projectName || "Untitled"}
          </CardTitle>
          {assembly.idea && (
            <p
              className="text-xs text-muted-foreground mt-1 line-clamp-2"
              data-testid={`text-idea-${assembly.id}`}
            >
              {truncateText(assembly.idea, 120)}
            </p>
          )}
        </div>
        <Badge
          variant={stateVariant}
          className={`no-default-active-elevate shrink-0 ${stateClassName}`}
          data-testid={`badge-state-${assembly.id}`}
        >
          {assembly.state === "running" && (
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot mr-1.5" />
          )}
          {assembly.state}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 space-y-2">
        {assembly.state === "running" && assembly.step && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground" data-testid={`text-step-${assembly.id}`}>
            <Loader2 className="w-3 h-3 animate-spin" />
            {assembly.step}
          </div>
        )}

        {assembly.errors && assembly.errors.length > 0 && (
          <div className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400" data-testid={`text-errors-${assembly.id}`}>
            <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{assembly.errors[0]}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 flex-wrap">
          {assembly.verifyStatus === "PASS" && (
            <Badge variant="success" className="no-default-active-elevate" data-testid={`badge-verify-${assembly.id}`}>
              <ShieldCheck className="w-3 h-3 mr-1" />
              PASS
            </Badge>
          )}
          {assembly.verifyStatus === "FAIL" && (
            <Badge variant="error" className="no-default-active-elevate" data-testid={`badge-verify-${assembly.id}`}>
              <ShieldX className="w-3 h-3 mr-1" />
              FAIL
            </Badge>
          )}
          {assembly.verifyStatus && assembly.verifyStatus !== "PASS" && assembly.verifyStatus !== "FAIL" && (
            <Badge variant="secondary" className="no-default-active-elevate" data-testid={`badge-verify-${assembly.id}`}>
              <ShieldQuestion className="w-3 h-3 mr-1" />
              {assembly.verifyStatus}
            </Badge>
          )}

          {assembly.lockEligible && (
            <Badge variant="outline" className="no-default-active-elevate" data-testid={`badge-lock-${assembly.id}`}>
              <Lock className="w-3 h-3 mr-1" />
              Lock ready
            </Badge>
          )}

          {assembly.revision > 1 && (
            <Badge
              variant="outline"
              className="no-default-active-elevate bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-transparent"
              data-testid={`badge-revision-${assembly.id}`}
            >
              <Layers className="w-3 h-3 mr-1" />
              Rev {assembly.revision}
            </Badge>
          )}
          {assembly.kitType === "upgrade" && (
            <Badge
              variant="outline"
              className="no-default-active-elevate bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 border-transparent"
              data-testid={`badge-kit-type-${assembly.id}`}
            >
              <ArrowUpCircle className="w-3 h-3 mr-1" />
              Upgrade
            </Badge>
          )}
          {assembly.preset && (
            <Badge variant="secondary" className="no-default-active-elevate" data-testid={`badge-preset-${assembly.id}`}>
              {assembly.preset}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1" data-testid={`text-created-${assembly.id}`}>
              <Clock className="w-3 h-3" />
              {formatRelativeTime(assembly.createdAt)}
            </span>
            {assembly.totalRuns > 0 && (
              <span className="flex items-center gap-1" data-testid={`text-runs-${assembly.id}`}>
                <Play className="w-3 h-3" />
                {assembly.totalRuns} run{assembly.totalRuns !== 1 ? "s" : ""}
              </span>
            )}
            {assembly.totalDuration > 0 && (
              <span className="flex items-center gap-1" data-testid={`text-duration-${assembly.id}`}>
                <Timer className="w-3 h-3" />
                {formatDuration(assembly.totalDuration)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2" data-testid={`status-indicators-${assembly.id}`}>
            <StatusDot active={assembly.wsExists} label="Workspace" />
            <StatusDot active={assembly.hasRegistry} label="Registry" />
            <StatusDot active={assembly.hasDomains} label="Domains" />
            <StatusDot active={assembly.hasApp} label="App" />
          </div>
        </div>

        {assembly.lastRunAt && (
          <div className="text-[10px] text-muted-foreground/70" data-testid={`text-last-run-${assembly.id}`}>
            Last run: {formatRelativeTime(assembly.lastRunAt)}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            variant="default"
            size="sm"
            onClick={onOpen}
            data-testid={`button-open-${assembly.id}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open
          </Button>
          {assembly.wsExists && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/docs?project=${assembly.projectName}`)}
              data-testid={`button-docs-${assembly.id}`}
            >
              <FileText className="w-3.5 h-3.5" />
              Docs
            </Button>
          )}
          {showExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={isExporting}
              data-testid={`button-export-${assembly.id}`}
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Export
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isConfirmingDelete ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={isDeleting}
                data-testid={`button-confirm-delete-${assembly.id}`}
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelDelete}
                data-testid={`button-cancel-delete-${assembly.id}`}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              data-testid={`button-delete-${assembly.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
