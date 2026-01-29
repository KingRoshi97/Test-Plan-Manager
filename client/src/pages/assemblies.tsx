import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, StatusBadge, EmptyState, SkeletonTable } from "@/components/kit";
import { GlassCard, GlassCardContent } from "@/components/kit";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDateTime, formatDomains } from "@/lib/format";
import { Download, Trash2, Plus, Search, Layers, ExternalLink } from "lucide-react";
import type { Assembly } from "@shared/schema";

export default function Assemblies() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");

  const { data: assemblies, isLoading } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    refetchInterval: 5000,
  });

  const deleteAssemblyMutation = useMutation({
    mutationFn: async (assemblyId: string) => {
      await apiRequest("DELETE", `/api/assemblies/${assemblyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
      toast({
        title: "Assembly deleted",
        description: "The assembly has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting assembly",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDownload = (assemblyId: string) => {
    window.location.href = `/api/assemblies/${assemblyId}/kit.zip`;
  };

  const handleDelete = (assemblyId: string) => {
    deleteAssemblyMutation.mutate(assemblyId);
  };

  const filteredAssemblies = (assemblies || []).filter((assembly) => {
    const matchesSearch = 
      !searchQuery || 
      assembly.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assembly.idea?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assembly.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesState = stateFilter === "all" || assembly.state === stateFilter;
    
    return matchesSearch && matchesState;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Assemblies"
        subtitle="Manage your documentation kits"
        actions={
          <Link href="/create">
            <Button data-testid="button-new-assembly">
              <Plus className="h-4 w-4 mr-2" />
              New Assembly
            </Button>
          </Link>
        }
      />

      <GlassCard>
        <GlassCardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, idea, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[160px]" data-testid="select-state-filter">
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <SkeletonTable rows={5} columns={6} />
          ) : filteredAssemblies.length === 0 ? (
            <EmptyState
              icon={Layers}
              title={searchQuery || stateFilter !== "all" ? "No matching assemblies" : "No assemblies yet"}
              description={
                searchQuery || stateFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Create your first documentation kit to get started."
              }
              action={
                !searchQuery && stateFilter === "all"
                  ? { label: "Create Assembly", onClick: () => setLocation("/create") }
                  : undefined
              }
            />
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Project</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead className="hidden md:table-cell">Domains</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssemblies.map((assembly) => (
                    <TableRow
                      key={assembly.id}
                      className="hover-elevate cursor-pointer"
                      onClick={() => setLocation(`/assemblies/${assembly.id}`)}
                      data-testid={`row-assembly-${assembly.id}`}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium truncate max-w-[200px]">
                            {assembly.projectName || assembly.idea?.slice(0, 40) || "Untitled"}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {assembly.id.slice(0, 8)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={assembly.state} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatDateTime(assembly.createdAt)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatDomains(assembly.domains)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLocation(`/assemblies/${assembly.id}`)}
                            data-testid={`button-view-${assembly.id}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          {assembly.state === "completed" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(assembly.id)}
                              data-testid={`button-download-${assembly.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(assembly.id)}
                            disabled={deleteAssemblyMutation.isPending}
                            data-testid={`button-delete-${assembly.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
