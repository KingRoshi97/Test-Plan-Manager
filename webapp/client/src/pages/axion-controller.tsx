import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Plus, 
  FolderOpen, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  FileText,
  Folder
} from "lucide-react";

interface Kit {
  id: string;
  name: string;
  createdAt: string;
  path: string;
  status: string;
  stageMarkers?: Record<string, Record<string, { completed_at: string; status: string }>>;
}

interface Plan {
  id: string;
  label: string;
  description: string;
}

interface Run {
  id: string;
  kitId: string;
  plan: string;
  status: "running" | "success" | "failed";
  startedAt: string;
  completedAt?: string;
  output: string[];
}

interface FileEntry {
  name: string;
  isDirectory: boolean;
}

export default function AxionController() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("kits");
  const [newKitName, setNewKitName] = useState("");
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("docs:full");
  const [overrideMode, setOverrideMode] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Fetch kits
  const { data: kitsData, isLoading: kitsLoading } = useQuery<{ kits: Kit[] }>({
    queryKey: ["/api/axion/kits"]
  });

  // Fetch plans
  const { data: plansData } = useQuery<{ plans: Plan[] }>({
    queryKey: ["/api/axion/plans"]
  });

  // Fetch current run
  const { data: runData } = useQuery<Run>({
    queryKey: ["/api/axion/runs", currentRunId],
    enabled: !!currentRunId,
    refetchInterval: currentRunId ? 1000 : false
  });

  // Create kit mutation
  const createKitMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("/api/axion/kits", {
        method: "POST",
        body: JSON.stringify({ name })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/axion/kits"] });
      setNewKitName("");
      toast({ title: "Kit created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create kit", description: error.message, variant: "destructive" });
    }
  });

  // Run pipeline mutation
  const runPipelineMutation = useMutation({
    mutationFn: async ({ kitId, plan, override }: { kitId: string; plan: string; override: boolean }) => {
      return apiRequest(`/api/axion/kits/${kitId}/run`, {
        method: "POST",
        body: JSON.stringify({ plan, override })
      });
    },
    onSuccess: (data: { runId: string }) => {
      setCurrentRunId(data.runId);
      setConsoleOutput([]);
      setActiveTab("console");
      toast({ title: "Pipeline started" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to start pipeline", description: error.message, variant: "destructive" });
    }
  });

  // Update console output when run data changes
  useEffect(() => {
    if (runData?.output) {
      setConsoleOutput(runData.output);
    }
  }, [runData?.output]);

  // Auto-scroll console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleOutput]);

  // Fetch file/directory content
  const fetchPath = async (kitId: string, filePath: string) => {
    const res = await fetch(`/api/axion/kits/${kitId}/files?path=${encodeURIComponent(filePath)}`);
    const data = await res.json();
    if (data.type === "directory") {
      setFileContent(null);
      return data.entries as FileEntry[];
    } else {
      setFileContent(data.content);
      return null;
    }
  };

  const [dirEntries, setDirEntries] = useState<FileEntry[]>([]);

  const navigateTo = async (path: string) => {
    if (!selectedKit) return;
    setCurrentPath(path);
    const entries = await fetchPath(selectedKit.id, path);
    if (entries) {
      setDirEntries(entries);
    }
  };

  const handleCreateKit = () => {
    if (!newKitName.trim()) return;
    createKitMutation.mutate(newKitName.trim());
  };

  const handleRunPipeline = () => {
    if (!selectedKit) return;
    runPipelineMutation.mutate({
      kitId: selectedKit.id,
      plan: selectedPlan,
      override: overrideMode
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "created": return "secondary";
      case "scaffolding": return "default";
      case "drafting": return "default";
      case "reviewing": return "default";
      case "verified": return "default";
      case "locked": return "default";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <Loader2 className="h-4 w-4 animate-spin" />;
      case "success": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">AXION Controller</h1>
          <p className="text-muted-foreground">Manage documentation pipelines and generate apps</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="kits" data-testid="tab-kits">Kits</TabsTrigger>
          <TabsTrigger value="runner" data-testid="tab-runner">Pipeline Runner</TabsTrigger>
          <TabsTrigger value="console" data-testid="tab-console">Console</TabsTrigger>
          <TabsTrigger value="files" data-testid="tab-files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="kits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Kit</CardTitle>
              <CardDescription>Initialize a new AXION documentation kit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="kit-name">Kit Name</Label>
                  <Input
                    id="kit-name"
                    data-testid="input-kit-name"
                    placeholder="my-new-project"
                    value={newKitName}
                    onChange={(e) => setNewKitName(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleCreateKit} 
                    disabled={!newKitName.trim() || createKitMutation.isPending}
                    data-testid="button-create-kit"
                  >
                    {createKitMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Create Kit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Kits</CardTitle>
              <CardDescription>Select a kit to run pipelines or view files</CardDescription>
            </CardHeader>
            <CardContent>
              {kitsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : kitsData?.kits?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No kits yet. Create one above to get started.
                </p>
              ) : (
                <div className="space-y-2">
                  {kitsData?.kits?.map((kit) => (
                    <div
                      key={kit.id}
                      data-testid={`card-kit-${kit.id}`}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedKit?.id === kit.id ? "border-primary bg-accent" : "hover-elevate"
                      }`}
                      onClick={() => setSelectedKit(kit)}
                    >
                      <div className="flex items-center gap-3">
                        <FolderOpen className="h-5 w-5" />
                        <div>
                          <p className="font-medium">{kit.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(kit.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(kit.status)}>{kit.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Runner</CardTitle>
              <CardDescription>
                {selectedKit 
                  ? `Running pipelines on: ${selectedKit.name}`
                  : "Select a kit from the Kits tab first"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedKit ? (
                <p className="text-muted-foreground text-center py-8">
                  Please select a kit from the Kits tab to run pipelines.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Pipeline Plan</Label>
                    <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                      <SelectTrigger data-testid="select-plan">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {plansData?.plans?.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            <div>
                              <span className="font-medium">{plan.label}</span>
                              <span className="text-muted-foreground ml-2">- {plan.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-amber-500/10 border-amber-500/20">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-medium">Override Mode</p>
                        <p className="text-sm text-muted-foreground">
                          Bypass quality gates (use during development only)
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={overrideMode}
                      onCheckedChange={setOverrideMode}
                      data-testid="switch-override"
                    />
                  </div>

                  <Button
                    onClick={handleRunPipeline}
                    disabled={runPipelineMutation.isPending}
                    className="w-full"
                    size="lg"
                    data-testid="button-run-pipeline"
                  >
                    {runPipelineMutation.isPending ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-5 w-5" />
                    )}
                    Run {plansData?.plans?.find(p => p.id === selectedPlan)?.label || selectedPlan}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {selectedKit?.stageMarkers && (
            <Card>
              <CardHeader>
                <CardTitle>Stage Progress</CardTitle>
                <CardDescription>Module completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(selectedKit.stageMarkers).map(([module, stages]) => (
                    <div key={module} className="p-2 rounded border text-sm">
                      <p className="font-medium truncate">{module}</p>
                      <div className="flex gap-1 mt-1">
                        {Object.entries(stages).map(([stage, data]) => (
                          <Badge key={stage} variant="outline" className="text-xs">
                            {stage.charAt(0).toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="console">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Console Output
                {runData && getStatusIcon(runData.status)}
              </CardTitle>
              <CardDescription>
                {currentRunId 
                  ? `Run: ${currentRunId} - ${runData?.status || "loading..."}`
                  : "No active run"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] w-full rounded-md border bg-black p-4">
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                  {consoleOutput.length === 0 
                    ? "Waiting for output..."
                    : consoleOutput.join("")
                  }
                  <div ref={consoleEndRef} />
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>File Browser</CardTitle>
              <CardDescription>
                {selectedKit 
                  ? `Browsing: ${selectedKit.name}/${currentPath}`
                  : "Select a kit to browse files"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedKit ? (
                <p className="text-muted-foreground text-center py-8">
                  Please select a kit from the Kits tab.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateTo("")}
                        data-testid="button-nav-root"
                      >
                        Root
                      </Button>
                      {currentPath && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const parts = currentPath.split("/");
                            parts.pop();
                            navigateTo(parts.join("/"));
                          }}
                          data-testid="button-nav-up"
                        >
                          Up
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="h-[400px] border rounded-md">
                      <div className="p-2 space-y-1">
                        {dirEntries.map((entry) => (
                          <div
                            key={entry.name}
                            className="flex items-center gap-2 p-2 rounded hover-elevate cursor-pointer"
                            onClick={() => {
                              const newPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
                              navigateTo(newPath);
                            }}
                          >
                            {entry.isDirectory ? (
                              <Folder className="h-4 w-4 text-blue-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">{entry.name}</span>
                          </div>
                        ))}
                        {dirEntries.length === 0 && (
                          <p className="text-muted-foreground text-sm text-center py-4">
                            Click Root to load files
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                  <div>
                    <ScrollArea className="h-[400px] border rounded-md bg-muted">
                      <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                        {fileContent || "Select a file to view its contents"}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
