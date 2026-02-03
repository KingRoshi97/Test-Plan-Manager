import { useState } from "react";
import { PageHeader, EmptyState } from "@/components/kit";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Search, Plus, Trash2, Copy, Globe, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface Template {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  presetId: string;
  projectName: string | null;
  idea: string | null;
  domains: string[] | null;
  isPublic: string;
  usageCount: string;
  createdAt: string;
}

export default function Templates() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: myTemplates = [], isLoading: myLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
    enabled: isAuthenticated,
  });

  const { data: publicTemplates = [], isLoading: publicLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates/public"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({ title: "Template deleted", description: "The template has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete template", variant: "destructive" });
    },
  });

  const useTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/templates/${id}/use`);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Template applied", description: "Redirecting to create page..." });
      setLocation(`/create?template=${data.id}`);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to use template", variant: "destructive" });
    },
  });

  const filterTemplates = (templates: Template[]) => {
    if (!searchQuery) return templates;
    const query = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.presetId.toLowerCase().includes(query)
    );
  };

  const TemplateCard = ({ template, showDelete = false }: { template: Template; showDelete?: boolean }) => (
    <GlassCard key={template.id}>
      <GlassCardHeader>
        <div className="flex items-center justify-between">
          <GlassCardTitle className="text-base">{template.name}</GlassCardTitle>
          <div className="flex items-center gap-2">
            {template.isPublic === "true" ? (
              <Badge variant="outline" className="gap-1">
                <Globe className="h-3 w-3" />
                Public
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            )}
          </div>
        </div>
        {template.description && (
          <GlassCardDescription className="line-clamp-2">{template.description}</GlassCardDescription>
        )}
      </GlassCardHeader>
      <GlassCardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline">{template.presetId}</Badge>
          {template.domains?.slice(0, 3).map((d) => (
            <Badge key={d} variant="secondary" className="text-xs">
              {d}
            </Badge>
          ))}
          {(template.domains?.length || 0) > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{(template.domains?.length || 0) - 3} more
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Used {template.usageCount} times
          </span>
          <div className="flex gap-2">
            {showDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate(template.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-template-${template.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => useTemplateMutation.mutate(template.id)}
              disabled={useTemplateMutation.isPending}
              data-testid={`button-use-template-${template.id}`}
            >
              <Copy className="h-4 w-4 mr-1" />
              Use
            </Button>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Templates"
        description="Save and reuse assembly configurations"
        icon={Bookmark}
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-templates"
          />
        </div>
        {isAuthenticated && (
          <Button asChild data-testid="button-create-template">
            <a href="/create">
              <Plus className="h-4 w-4 mr-2" />
              New Assembly
            </a>
          </Button>
        )}
      </div>

      <Tabs defaultValue="my" className="w-full">
        <TabsList>
          <TabsTrigger value="my" disabled={!isAuthenticated}>
            My Templates
          </TabsTrigger>
          <TabsTrigger value="public">Community Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="mt-6">
          {!isAuthenticated ? (
            <GlassCard>
              <GlassCardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Sign in to view and create your own templates.
                </p>
                <Button asChild>
                  <a href="/api/login" data-testid="button-templates-login">Sign in</a>
                </Button>
              </GlassCardContent>
            </GlassCard>
          ) : myLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filterTemplates(myTemplates).length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No templates yet"
              description="Save an assembly configuration as a template to reuse it later."
              className="py-12"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filterTemplates(myTemplates).map((template) => (
                <TemplateCard key={template.id} template={template} showDelete />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public" className="mt-6">
          {publicLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filterTemplates(publicTemplates).length === 0 ? (
            <EmptyState
              icon={Globe}
              title="No community templates"
              description="Be the first to share a template with the community!"
              className="py-12"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filterTemplates(publicTemplates).map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
