import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import { Loader2, CheckCircle, Circle, ChevronRight, Layers } from "lucide-react";

interface Feature {
  feature_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  dependencies: string[];
  src_modules: string[];
  gates: string[];
}

const categoryColors: Record<string, string> = {
  infrastructure: "bg-purple-900/30 text-purple-300",
  interface: "bg-blue-900/30 text-blue-300",
  "core-logic": "bg-amber-900/30 text-amber-300",
  security: "bg-red-900/30 text-red-300",
};

const statusColors: Record<string, string> = {
  active: "bg-green-900/30 text-green-300",
  draft: "bg-yellow-900/30 text-yellow-300",
  error: "bg-red-900/30 text-red-300",
};

function groupByCategory(features: Feature[]): Record<string, Feature[]> {
  const groups: Record<string, Feature[]> = {};
  for (const f of features) {
    const cat = f.category || "other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(f);
  }
  return groups;
}

export default function FeaturesPage() {
  const [, setLocation] = useLocation();
  const { data: features = [], isLoading } = useQuery<Feature[]>({
    queryKey: ["/api/features"],
    queryFn: () => apiRequest("/api/features"),
  });

  const activeCount = features.filter((f) => f.status === "active").length;
  const grouped = groupByCategory(features);
  const categoryOrder = ["infrastructure", "core-logic", "interface", "security"];
  const sortedCategories = categoryOrder.filter((c) => grouped[c]);
  for (const c of Object.keys(grouped)) {
    if (!sortedCategories.includes(c)) sortedCategories.push(c);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Feature Registry</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            17 subsystem contracts powering the Axion pipeline
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-center">
            <div className="text-xl font-bold text-[hsl(var(--foreground))]">{features.length}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Total</div>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-center" style={{ background: "hsl(145 65% 48% / 0.1)" }}>
            <div className="text-xl font-bold text-green-400">{activeCount}</div>
            <div className="text-xs text-green-500">Active</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : (
        <div className="space-y-8">
          {sortedCategories.map((category) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  {category.replace("-", " ")}
                </h2>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  ({grouped[category].length})
                </span>
              </div>
              <div className="space-y-2">
                {grouped[category].map((f) => (
                  <button
                    key={f.feature_id}
                    onClick={() => setLocation(`/features/${f.feature_id}`)}
                    className="w-full text-left rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 hover:border-[hsl(var(--primary))] transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center gap-2 shrink-0">
                          {f.status === "active" ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
                            {f.feature_id}
                          </span>
                        </div>
                        <h3 className="font-medium text-[hsl(var(--card-foreground))] truncate">
                          {f.title}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColors[f.status] || "bg-gray-800 text-gray-300"}`}>
                          {f.status}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${categoryColors[f.category] || "bg-gray-800 text-gray-300"}`}>
                          {f.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-4">
                        <div className="text-xs text-[hsl(var(--muted-foreground))] text-right">
                          <span>{f.src_modules?.length ?? 0} modules</span>
                          {f.gates?.length > 0 && (
                            <span className="ml-3">{f.gates.length} gates</span>
                          )}
                          {f.dependencies?.length > 0 && (
                            <span className="ml-3">{f.dependencies.length} deps</span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors" />
                      </div>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1.5 line-clamp-1">
                      {f.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
