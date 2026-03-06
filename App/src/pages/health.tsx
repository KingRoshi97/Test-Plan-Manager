import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import { Activity, BookOpen, FileText, Clock, CheckCircle, XCircle, Blocks } from "lucide-react";

interface HealthData {
  status: string;
  pipeline: { stages: number; gates: number };
  knowledge: { kids: number };
  templates: number;
  recentRuns: string[];
}

interface Feature {
  feature_id: string;
  status: string;
  category: string;
}

export default function HealthPage() {
  const [, setLocation] = useLocation();
  const { data, isLoading, isError } = useQuery<HealthData>({
    queryKey: ["/api/health"],
    queryFn: () => apiRequest("/api/health"),
    refetchInterval: 10000,
  });

  const { data: features = [] } = useQuery<Feature[]>({
    queryKey: ["/api/features"],
    queryFn: () => apiRequest("/api/features"),
  });

  const activeFeatures = features.filter((f) => f.status === "active").length;
  const categoryBreakdown = features.reduce<Record<string, number>>((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {});

  const isHealthy = data?.status === "ok";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>System Health</h1>
        {!isLoading && (
          <span className="flex items-center gap-1.5 text-sm font-medium">
            {isHealthy && !isError ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400">Healthy</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-red-400">Unhealthy</span>
              </>
            )}
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Loading health data...</p>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border p-5" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-md" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                <Activity className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
              </div>
              <h3 className="font-semibold" style={{ color: "hsl(var(--card-foreground))" }}>Pipeline</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Stages</span>
                <span className="font-medium" style={{ color: "hsl(var(--foreground))" }}>{data?.pipeline.stages ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Gates</span>
                <span className="font-medium" style={{ color: "hsl(var(--foreground))" }}>{data?.pipeline.gates ?? 0}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {data?.pipeline.stages === 10 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {data?.pipeline.stages === 10 ? "All stages registered" : "Missing stages"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-5" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-md" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                <BookOpen className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
              </div>
              <h3 className="font-semibold" style={{ color: "hsl(var(--card-foreground))" }}>Knowledge Library</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>KIDs</span>
                <span className="font-medium" style={{ color: "hsl(var(--foreground))" }}>{data?.knowledge.kids ?? 0}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {(data?.knowledge.kids ?? 0) > 0 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {(data?.knowledge.kids ?? 0) > 0 ? "Library loaded" : "No KIDs found"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-5" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-md" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                <FileText className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
              </div>
              <h3 className="font-semibold" style={{ color: "hsl(var(--card-foreground))" }}>Templates</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Total</span>
                <span className="font-medium" style={{ color: "hsl(var(--foreground))" }}>{data?.templates ?? 0}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {(data?.templates ?? 0) > 0 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {(data?.templates ?? 0) > 0 ? "Templates available" : "No templates"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-5" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-md" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                <Clock className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
              </div>
              <h3 className="font-semibold" style={{ color: "hsl(var(--card-foreground))" }}>Recent Runs</h3>
            </div>
            {data?.recentRuns && data.recentRuns.length > 0 ? (
              <div className="space-y-1.5">
                {data.recentRuns.map((run) => (
                  <div
                    key={run}
                    className="text-xs px-2 py-1 rounded"
                    style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
                  >
                    {run}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>No recent runs</p>
            )}
          </div>
        </div>

        {features.length > 0 && (
          <div className="rounded-lg border p-5 mt-4" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                  <Blocks className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
                </div>
                <h3 className="font-semibold" style={{ color: "hsl(var(--card-foreground))" }}>Feature Packs</h3>
              </div>
              <button
                onClick={() => setLocation("/features")}
                className="text-xs font-medium px-3 py-1.5 rounded-md hover:opacity-90 transition"
                style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-md" style={{ background: "hsl(var(--muted))" }}>
                <div className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>{features.length}</div>
                <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Total</div>
              </div>
              <div className="text-center p-3 rounded-md" style={{ background: "hsl(145 65% 48% / 0.1)" }}>
                <div className="text-lg font-bold text-green-400">{activeFeatures}</div>
                <div className="text-xs text-green-500">Active</div>
              </div>
              {Object.entries(categoryBreakdown).slice(0, 2).map(([cat, count]) => (
                <div key={cat} className="text-center p-3 rounded-md" style={{ background: "hsl(var(--muted))" }}>
                  <div className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>{count}</div>
                  <div className="text-xs capitalize" style={{ color: "hsl(var(--muted-foreground))" }}>{cat.replace("-", " ")}</div>
                </div>
              ))}
            </div>
            {Object.entries(categoryBreakdown).length > 2 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {Object.entries(categoryBreakdown).slice(2).map(([cat, count]) => (
                  <div key={cat} className="text-center p-3 rounded-md" style={{ background: "hsl(var(--muted))" }}>
                    <div className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>{count}</div>
                    <div className="text-xs capitalize" style={{ color: "hsl(var(--muted-foreground))" }}>{cat.replace("-", " ")}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </>
      )}
    </div>
  );
}
