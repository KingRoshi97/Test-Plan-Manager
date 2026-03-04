import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import { ArrowLeft, Loader2 } from "lucide-react";

const PRESETS = ["API_SERVICE_BASIC", "WEB_APP_BASIC", "FULLSTACK_SAAS", "REALTIME_CHAT"] as const;

export default function NewAssemblyPage() {
  const [, setLocation] = useLocation();
  const [projectName, setProjectName] = useState("");
  const [idea, setIdea] = useState("");
  const [preset, setPreset] = useState<string>(PRESETS[0]);
  const [startRun, setStartRun] = useState(false);

  const createMutation = useMutation({
    mutationFn: async () => {
      const assembly = await apiRequest("/api/assemblies", {
        method: "POST",
        body: JSON.stringify({ projectName, idea: idea || undefined, preset }),
      });
      if (startRun) {
        await apiRequest(`/api/assemblies/${assembly.id}/run`, {
          method: "POST",
        });
      }
      return assembly;
    },
    onSuccess: (assembly) => {
      setLocation(`/assembly/${assembly.id}`);
    },
  });

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLocation("/")}
          className="p-2 rounded-md hover:bg-[hsl(var(--accent))] transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">New Assembly</h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
        className="space-y-5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-6"
      >
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Project Name *</label>
          <input
            type="text"
            required
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="my-awesome-project"
            className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Idea</label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe what you want to build..."
            rows={4}
            className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Preset</label>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            {PRESETS.map((p) => (
              <option key={p} value={p}>
                {p.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={startRun}
            onChange={(e) => setStartRun(e.target.checked)}
            className="rounded border-[hsl(var(--border))]"
          />
          <span className="text-sm">Start run immediately</span>
        </label>

        {createMutation.isError && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
            {createMutation.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={createMutation.isPending || !projectName.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition disabled:opacity-50"
        >
          {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {createMutation.isPending ? "Creating..." : "Create Assembly"}
        </button>
      </form>
    </div>
  );
}
