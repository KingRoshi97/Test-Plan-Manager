import { Plus, X } from "lucide-react";
import type { PageProps } from "./types";

export default function PageIntent({ data, onChange }: PageProps) {
  const intent = data.intent;
  const showBrand = data.routing.audience_context === "consumer";

  const set = (field: string, value: unknown) => onChange("intent", { [field]: value });

  const addGoal = () => set("primary_goals", [...intent.primary_goals, ""]);
  const removeGoal = (i: number) => set("primary_goals", intent.primary_goals.filter((_, idx) => idx !== i));
  const updateGoal = (i: number, val: string) => {
    const updated = [...intent.primary_goals];
    updated[i] = val;
    set("primary_goals", updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-1">Product Intent</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Define what this project aims to achieve and how success will be measured.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Alternatives Considered</label>
        <textarea
          value={intent.alternatives}
          onChange={(e) => set("alternatives", e.target.value)}
          placeholder="What other solutions or approaches have been considered?"
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Primary Goals</label>
          <button
            type="button"
            onClick={addGoal}
            className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline"
          >
            <Plus className="w-3 h-3" /> Add goal
          </button>
        </div>
        {intent.primary_goals.length === 0 && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">No goals added yet. Click "Add goal" to start.</p>
        )}
        {intent.primary_goals.map((goal, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={goal}
              onChange={(e) => updateGoal(i, e.target.value)}
              placeholder={`Goal ${i + 1}`}
              className="flex-1 px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
            <button
              type="button"
              onClick={() => removeGoal(i)}
              className="p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-900/20 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Success Metrics</label>
        <textarea
          value={intent.success_metrics}
          onChange={(e) => set("success_metrics", e.target.value)}
          placeholder="How will you measure if this project is successful?"
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Out of Scope</label>
        <textarea
          value={intent.out_of_scope}
          onChange={(e) => set("out_of_scope", e.target.value)}
          placeholder="What is explicitly NOT part of this project?"
          rows={2}
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
        />
      </div>

      {showBrand && (
        <div className="space-y-4 border-t border-[hsl(var(--border))] pt-4 mt-4">
          <p className="text-sm font-medium text-[hsl(var(--primary))]">Brand Identity</p>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Core Values</label>
            <textarea
              value={intent.brand_values}
              onChange={(e) => set("brand_values", e.target.value)}
              placeholder="What values define your brand?"
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Brand Promise</label>
            <input
              type="text"
              value={intent.brand_promise}
              onChange={(e) => set("brand_promise", e.target.value)}
              placeholder="What do you promise your users?"
              className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Voice & Tone</label>
            <input
              type="text"
              value={intent.voice_tone}
              onChange={(e) => set("voice_tone", e.target.value)}
              placeholder="e.g. Professional but friendly, Technical and concise"
              className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
