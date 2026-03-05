import { Plus, X } from "lucide-react";
import type { PageProps } from "./types";

export default function PageProject({ data, onChange }: PageProps) {
  const p = data.project;
  const isExisting = data.routing.build_target === "production";

  const set = (field: string, value: unknown) => onChange("project", { [field]: value });

  const addLink = () => set("links", [...p.links, ""]);
  const removeLink = (i: number) => set("links", p.links.filter((_, idx) => idx !== i));
  const updateLink = (i: number, val: string) => {
    const updated = [...p.links];
    updated[i] = val;
    set("links", updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-1">Project Basics</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Define your project identity and core problem.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Project Name *</label>
        <input
          type="text"
          value={p.project_name}
          onChange={(e) => set("project_name", e.target.value)}
          placeholder="my-awesome-project"
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Problem Statement *</label>
        <textarea
          value={p.problem_statement}
          onChange={(e) => set("problem_statement", e.target.value)}
          placeholder="What problem does this project solve?"
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Overview / One-Liner</label>
        <textarea
          value={p.overview}
          onChange={(e) => set("overview", e.target.value)}
          placeholder="A brief description of the project..."
          rows={2}
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Reference Links</label>
          <button
            type="button"
            onClick={addLink}
            className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline"
          >
            <Plus className="w-3 h-3" /> Add link
          </button>
        </div>
        {p.links.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="url"
              value={link}
              onChange={(e) => updateLink(i, e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
            <button
              type="button"
              onClick={() => removeLink(i)}
              className="p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-50 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {isExisting && (
        <div className="space-y-4 border-t border-[hsl(var(--border))] pt-4 mt-4">
          <p className="text-sm font-medium text-[hsl(var(--primary))]">
            Existing Project Details
          </p>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Repository Link</label>
            <input
              type="url"
              value={p.existing_repo}
              onChange={(e) => set("existing_repo", e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Current State Summary</label>
            <textarea
              value={p.existing_state}
              onChange={(e) => set("existing_state", e.target.value)}
              placeholder="Describe the current state of the project..."
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Must Not Change</label>
            <textarea
              value={p.must_not_change}
              onChange={(e) => set("must_not_change", e.target.value)}
              placeholder="List things that should not be modified..."
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Known Issues</label>
            <textarea
              value={p.known_issues}
              onChange={(e) => set("known_issues", e.target.value)}
              placeholder="Any known bugs or technical debt..."
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
