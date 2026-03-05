import { Plus, X } from "lucide-react";
import type { PageProps } from "./types";

function SoftwareVariant({ data, onChange }: PageProps) {
  const cs = data.category_specific;
  const set = (field: string, value: unknown) => onChange("category_specific", { [field]: value });

  const addScreen = () => set("screens", [...cs.screens, ""]);
  const removeScreen = (i: number) => set("screens", cs.screens.filter((_, idx) => idx !== i));
  const updateScreen = (i: number, val: string) => {
    const updated = [...cs.screens];
    updated[i] = val;
    set("screens", updated);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Screens / Pages</label>
          <button type="button" onClick={addScreen} className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline">
            <Plus className="w-3 h-3" /> Add screen
          </button>
        </div>
        {cs.screens.length === 0 && <p className="text-xs text-[hsl(var(--muted-foreground))]">No screens listed yet.</p>}
        {cs.screens.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input type="text" value={s} onChange={(e) => updateScreen(i, e.target.value)} placeholder={`Screen ${i + 1} (e.g. Dashboard, Settings)`}
              className="flex-1 px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
            <button type="button" onClick={() => removeScreen(i)} className="p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-50 transition"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Navigation Summary</label>
        <textarea value={cs.navigation_summary} onChange={(e) => set("navigation_summary", e.target.value)} placeholder="Describe the overall navigation flow..."
          rows={3} className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
        />
      </div>
    </div>
  );
}

function DataVariant({ data, onChange }: PageProps) {
  const cs = data.category_specific;
  const set = (field: string, value: unknown) => onChange("category_specific", { [field]: value });

  const addEndpoint = () => set("endpoints", [...cs.endpoints, ""]);
  const removeEndpoint = (i: number) => set("endpoints", cs.endpoints.filter((_, idx) => idx !== i));
  const updateEndpoint = (i: number, val: string) => {
    const updated = [...cs.endpoints];
    updated[i] = val;
    set("endpoints", updated);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Operations / Endpoints</label>
          <button type="button" onClick={addEndpoint} className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline">
            <Plus className="w-3 h-3" /> Add endpoint
          </button>
        </div>
        {cs.endpoints.length === 0 && <p className="text-xs text-[hsl(var(--muted-foreground))]">No endpoints listed yet.</p>}
        {cs.endpoints.map((ep, i) => (
          <div key={i} className="flex gap-2">
            <input type="text" value={ep} onChange={(e) => updateEndpoint(i, e.target.value)} placeholder={`GET /api/resource`}
              className="flex-1 px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
            <button type="button" onClick={() => removeEndpoint(i)} className="p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-50 transition"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Webhooks</label>
        <textarea value={cs.webhooks} onChange={(e) => set("webhooks", e.target.value)} placeholder="Describe webhook events and consumers..."
          rows={3} className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
        />
      </div>
    </div>
  );
}

function DocsVariant({ data, onChange }: PageProps) {
  const cs = data.category_specific;
  const set = (field: string, value: string) => onChange("category_specific", { [field]: value });

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Environments</label>
        <input type="text" value={cs.environments} onChange={(e) => set("environments", e.target.value)} placeholder="e.g. dev, staging, production"
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Runtime</label>
        <input type="text" value={cs.runtime} onChange={(e) => set("runtime", e.target.value)} placeholder="e.g. Node.js 20, Python 3.12"
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Observability</label>
        <textarea value={cs.observability} onChange={(e) => set("observability", e.target.value)} placeholder="Logging, metrics, tracing preferences..."
          rows={3} className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
        />
      </div>
    </div>
  );
}

function OtherVariant({ data, onChange }: PageProps) {
  const cs = data.category_specific;
  const set = (field: string, value: string) => onChange("category_specific", { [field]: value });

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Target Languages / Platforms</label>
        <input type="text" value={cs.target_languages} onChange={(e) => set("target_languages", e.target.value)} placeholder="e.g. TypeScript, Python, Go"
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">API Surface</label>
        <textarea value={cs.api_surface} onChange={(e) => set("api_surface", e.target.value)} placeholder="Describe the public API your library/SDK exposes..."
          rows={4} className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
        />
      </div>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  software: "Application Details",
  data: "Service / API Details",
  docs: "Infrastructure Details",
  other: "Library / SDK Details",
};

export default function PageCategory({ data, onChange }: PageProps) {
  const category = data.routing.category;
  const label = CATEGORY_LABELS[category] || "Category-Specific Details";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-1">{label}</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Additional details specific to your project type.
        </p>
      </div>

      {category === "software" && <SoftwareVariant data={data} onChange={onChange} />}
      {category === "data" && <DataVariant data={data} onChange={onChange} />}
      {category === "docs" && <DocsVariant data={data} onChange={onChange} />}
      {category === "other" && <OtherVariant data={data} onChange={onChange} />}
      {!category && (
        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
          <p className="text-sm">Please select a project category on the Routing page first.</p>
        </div>
      )}
    </div>
  );
}
