import { PageHeader } from "@/components/kit";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from "@/components/kit";
import { StatusBadge } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Link } from "wouter";
import type { Assembly, ApiKey, AuditLog } from "@shared/schema";
import { 
  BarChart3, 
  Key, 
  Shield, 
  Search, 
  RefreshCw, 
  Plus,
  Trash2,
  Eye,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StatsData {
  total: number;
  queued: number;
  running: number;
  completed: number;
  failed: number;
}

function StatCard({ title, value, icon: Icon, variant }: { title: string; value: number; icon: any; variant?: string }) {
  const colors: Record<string, string> = {
    queued: "text-blue-500",
    running: "text-amber-500",
    completed: "text-green-500",
    failed: "text-red-500",
    default: "text-primary",
  };
  
  return (
    <GlassCard className="flex-1 min-w-[140px]">
      <GlassCardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${colors[variant || "default"]} opacity-60`} />
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}

export default function Ops() {
  const { toast } = useToast();
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newKeyName, setNewKeyName] = useState("");

  const { data: assemblies, isLoading: assembliesLoading, refetch: refetchAssemblies } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
  });

  const { data: apiKeysData, isLoading: apiKeysLoading, refetch: refetchApiKeys } = useQuery<{ apiKeys: any[] }>({
    queryKey: ["/v1/api-keys"],
  });

  const { data: auditLogsData, isLoading: auditLogsLoading } = useQuery<{ auditLogs: any[] }>({
    queryKey: ["/v1/audit-logs"],
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/v1/api-keys", { name, scopes: ["*"] });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/v1/api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["/v1/audit-logs"] });
      toast({
        title: "API Key Created",
        description: (
          <div className="space-y-2">
            <p>Your new API key has been created. Copy it now - it won't be shown again.</p>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md font-mono text-xs break-all">
              {data.key}
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 h-6 w-6"
                onClick={() => {
                  navigator.clipboard.writeText(data.key);
                  toast({ title: "Copied", description: "API key copied to clipboard" });
                }}
                data-testid="button-copy-key"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ),
      });
      setNewKeyName("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const res = await apiRequest("DELETE", `/v1/api-keys/${keyId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/v1/api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["/v1/audit-logs"] });
      toast({ title: "API Key Revoked", description: "The API key has been revoked." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const stats: StatsData = {
    total: assemblies?.length || 0,
    queued: assemblies?.filter(a => a.state === "queued").length || 0,
    running: assemblies?.filter(a => a.state === "running").length || 0,
    completed: assemblies?.filter(a => a.state === "completed").length || 0,
    failed: assemblies?.filter(a => a.state === "failed").length || 0,
  };

  const filteredAssemblies = assemblies?.filter(a => {
    const matchesState = stateFilter === "all" || a.state === stateFilter;
    const matchesSearch = !searchQuery || 
      a.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesSearch;
  }) || [];

  const apiKeys = apiKeysData?.apiKeys || [];
  const auditLogs = auditLogsData?.auditLogs || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Operations Dashboard"
        subtitle="Monitor assemblies, manage API keys, and view audit logs"
        actions={
          <Button onClick={() => refetchAssemblies()} variant="outline" size="sm" data-testid="button-refresh-assemblies">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      <div className="flex flex-wrap gap-4">
        <StatCard title="Total" value={stats.total} icon={BarChart3} />
        <StatCard title="Queued" value={stats.queued} icon={Clock} variant="queued" />
        <StatCard title="Running" value={stats.running} icon={Loader2} variant="running" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} variant="completed" />
        <StatCard title="Failed" value={stats.failed} icon={XCircle} variant="failed" />
      </div>

      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <GlassCardTitle>Assemblies</GlassCardTitle>
          </div>
          <GlassCardDescription>
            View and manage all assembly runs
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by project name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-assemblies"
              />
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-state-filter">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {assembliesLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading assemblies...
            </div>
          ) : filteredAssemblies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No assemblies found
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssemblies.slice(0, 20).map((assembly) => (
                    <TableRow key={assembly.id} data-testid={`row-assembly-${assembly.id}`}>
                      <TableCell className="font-mono text-xs">{assembly.id}</TableCell>
                      <TableCell>{assembly.projectName || "Unnamed"}</TableCell>
                      <TableCell>
                        <StatusBadge status={assembly.state} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(assembly.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/assemblies/${assembly.id}`}>
                            <Button size="icon" variant="ghost" data-testid={`button-view-${assembly.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {assembly.state === "completed" && assembly.kitPath && (
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => window.open(`/v1/assemblies/${assembly.id}/kit.zip`, "_blank")}
                              data-testid={`button-download-${assembly.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {filteredAssemblies.length > 20 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing 20 of {filteredAssemblies.length} assemblies
            </p>
          )}
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <GlassCardTitle>API Keys</GlassCardTitle>
          </div>
          <GlassCardDescription>
            Generate and manage API keys for programmatic access
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <Input
              placeholder="New key name..."
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 min-w-[200px]"
              data-testid="input-new-key-name"
            />
            <Button
              onClick={() => createKeyMutation.mutate(newKeyName)}
              disabled={!newKeyName.trim() || createKeyMutation.isPending}
              data-testid="button-create-api-key"
            >
              {createKeyMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Key
            </Button>
          </div>

          {apiKeysLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading API keys...
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No API keys created yet
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Prefix</TableHead>
                    <TableHead>Scopes</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key: any) => (
                    <TableRow key={key.id} data-testid={`row-apikey-${key.id}`}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell className="font-mono text-xs">{key.keyPrefix}...</TableCell>
                      <TableCell className="text-xs">
                        {key.scopes?.join(", ") || "*"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : "Never"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(key.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => revokeKeyMutation.mutate(key.id)}
                          disabled={revokeKeyMutation.isPending}
                          data-testid={`button-revoke-${key.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <GlassCardTitle>Audit Logs</GlassCardTitle>
          </div>
          <GlassCardDescription>
            Recent API activity and security events
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          {auditLogsLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading audit logs...
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs available
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Correlation ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.slice(0, 20).map((log: any) => (
                    <TableRow key={log.id} data-testid={`row-auditlog-${log.id}`}>
                      <TableCell className="font-mono text-xs">{log.action}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.resourceType}/{log.resourceId || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {log.ipAddress || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-[150px]">
                        {log.correlationId || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {auditLogs.length > 20 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing 20 of {auditLogs.length} audit logs
            </p>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
