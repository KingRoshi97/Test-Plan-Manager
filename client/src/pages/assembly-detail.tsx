import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageHeader, StatusBadge, AssemblyTimeline, CodeBlock, CopyButton, EmptyState, SkeletonCard } from "@/components/kit";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime, truncateHash } from "@/lib/format";
import { Download, RefreshCw, FileText, Package, Truck, Paperclip, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Assembly, Delivery, AssemblyState } from "@shared/schema";

export default function AssemblyDetail() {
  const [, params] = useRoute("/assemblies/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const assemblyId = params?.id;

  const { data: assembly, isLoading } = useQuery<Assembly>({
    queryKey: ["/api/assemblies", assemblyId],
    enabled: !!assemblyId,
  });

  const { data: deliveries = [] } = useQuery<Delivery[]>({
    queryKey: ["/v1/assemblies", assemblyId, "deliveries"],
    enabled: !!assemblyId,
  });

  const retryDelivery = useMutation({
    mutationFn: async (deliveryId: string) => {
      return apiRequest("POST", `/v1/deliveries/${deliveryId}/retry`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/v1/assemblies", assemblyId, "deliveries"] });
      toast({ title: "Delivery retry initiated" });
    },
    onError: () => {
      toast({ title: "Retry failed", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!assembly) {
    return (
      <EmptyState
        icon={Package}
        title="Assembly not found"
        description="The assembly you're looking for doesn't exist or was deleted."
        action={{ label: "Back to Assemblies", onClick: () => setLocation("/assemblies") }}
      />
    );
  }

  const projectName = assembly.projectName || assembly.idea?.slice(0, 50) || "Untitled";
  const generationMode = assembly.kit?.generationMode || "legacy";
  const checksums = assembly.kit;
  const uploadedFiles = assembly.input?.uploadedFiles || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/assemblies")} data-testid="button-back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={projectName}
          subtitle={`Assembly ${assembly.id}`}
          actions={
            <StatusBadge status={assembly.state} />
          }
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList data-testid="assembly-tabs">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <FileText className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="kit" data-testid="tab-kit">
            <Package className="h-4 w-4 mr-2" />
            Kit
          </TabsTrigger>
          <TabsTrigger value="deliveries" data-testid="tab-deliveries">
            <Truck className="h-4 w-4 mr-2" />
            Deliveries
          </TabsTrigger>
          <TabsTrigger value="attachments" data-testid="tab-attachments">
            <Paperclip className="h-4 w-4 mr-2" />
            Attachments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Pipeline Progress</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <AssemblyTimeline
                currentStep={assembly.step}
                state={assembly.state as AssemblyState}
              />
            </GlassCardContent>
          </GlassCard>

          <div className="grid gap-4 md:grid-cols-2">
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Details</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Preset</dt>
                    <dd className="font-medium">{assembly.preset || "custom"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Generation Mode</dt>
                    <dd className="font-medium">{generationMode}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Domains</dt>
                    <dd className="font-medium">{assembly.domains?.join(", ") || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium">{formatDateTime(assembly.createdAt)}</dd>
                  </div>
                </dl>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Checksums</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <dl className="space-y-3 text-sm">
                  {checksums?.manifestSha256 && (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Manifest</dt>
                      <dd className="flex items-center gap-2 font-mono text-xs">
                        {truncateHash(checksums.manifestSha256)}
                        <CopyButton value={checksums.manifestSha256} size="icon" />
                      </dd>
                    </div>
                  )}
                  {checksums?.zipSha256 && (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Kit Zip</dt>
                      <dd className="flex items-center gap-2 font-mono text-xs">
                        {truncateHash(checksums.zipSha256)}
                        <CopyButton value={checksums.zipSha256} size="icon" />
                      </dd>
                    </div>
                  )}
                  {!checksums?.manifestSha256 && !checksums?.zipSha256 && (
                    <p className="text-muted-foreground">Checksums available after assembly completes.</p>
                  )}
                </dl>
              </GlassCardContent>
            </GlassCard>
          </div>

          {assembly.errors && assembly.errors.length > 0 && (
            <GlassCard className="border-red-500/20">
              <GlassCardHeader>
                <GlassCardTitle className="text-red-500">Errors</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <ul className="space-y-2 text-sm">
                  {assembly.errors.map((error, i) => (
                    <li key={i} className="p-2 bg-red-500/10 rounded text-red-400">
                      {error}
                    </li>
                  ))}
                </ul>
              </GlassCardContent>
            </GlassCard>
          )}
        </TabsContent>

        <TabsContent value="kit" className="space-y-4">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Download Kit</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              {assembly.state === "completed" && assembly.kitPath ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild data-testid="button-download-kit">
                      <a href={`/api/assemblies/${assembly.id}/kit.zip`} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download axiom_kit.zip
                      </a>
                    </Button>
                    <CopyButton
                      value={`${window.location.origin}/v1/assemblies/${assembly.id}/kit.zip`}
                      label="Copy URL"
                      variant="outline"
                      size="default"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Kit path: {assembly.kitPath}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Kit will be available once assembly completes.
                </p>
              )}
            </GlassCardContent>
          </GlassCard>

          {assembly.state === "completed" && (
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Manifest Preview</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <CodeBlock
                  code={JSON.stringify({
                    version: "0.2.0",
                    assemblyId: assembly.id,
                    projectName: projectName,
                    generationMode: generationMode,
                    domains: assembly.domains,
                    kit: assembly.kit,
                  }, null, 2)}
                  language="json"
                />
              </GlassCardContent>
            </GlassCard>
          )}
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-4">
          <GlassCard>
            <GlassCardHeader className="flex flex-row items-center justify-between">
              <GlassCardTitle>Deliveries</GlassCardTitle>
              <Button size="sm" variant="outline" disabled data-testid="button-create-delivery">
                Create Delivery
              </Button>
            </GlassCardHeader>
            <GlassCardContent>
              {deliveries.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No deliveries yet. Create one to distribute your kit.
                </p>
              ) : (
                <div className="space-y-2">
                  {deliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{delivery.type}</span>
                          <StatusBadge status={delivery.state} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Attempts: {delivery.attempts}
                          {delivery.lastAttemptAt && ` • Last: ${formatDateTime(delivery.lastAttemptAt)}`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => retryDelivery.mutate(delivery.id)}
                        disabled={delivery.state !== "failed"}
                        data-testid={`button-retry-${delivery.id}`}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        </TabsContent>

        <TabsContent value="attachments" className="space-y-4">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Uploaded Files</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              {uploadedFiles.length > 0 ? (
                <ul className="space-y-2">
                  {uploadedFiles.map((file, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="space-y-1">
                        <span className="text-sm font-medium">{file.filename}</span>
                        <p className="text-xs text-muted-foreground">
                          {file.mimeType} • {file.extractedText ? `${file.extractedText.length} chars extracted` : "No text"}
                        </p>
                      </div>
                      <CopyButton value={file.id} size="icon" />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No files were attached to this assembly.
                </p>
              )}
            </GlassCardContent>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
