import { Plus, X } from "lucide-react";
import type { PageProps } from "./types";

const inputCls = "w-full px-3 py-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--glass-border))] text-[hsl(var(--foreground))] font-mono-tech text-sm focus:outline-none focus:border-[hsl(var(--glow-cyan)/0.5)] focus:shadow-[0_0_8px_hsl(var(--glow-cyan)/0.15)] transition placeholder:text-[hsl(var(--muted-foreground)/0.5)]";
const textareaCls = `${inputCls} resize-none`;

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
        <h2 className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))] mb-1">Product Intent</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Define what this project aims to achieve and how success will be measured.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-system-label">Alternatives Considered</label>
        <textarea
          value={intent.alternatives}
          onChange={(e) => set("alternatives", e.target.value)}
          placeholder="What other solutions or approaches have been considered?"
          rows={3}
          className={textareaCls}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-system-label">Primary Goals</label>
          <button
            type="button"
            onClick={addGoal}
            className="flex items-center gap-1 text-xs text-[hsl(var(--glow-cyan))] hover:text-[hsl(var(--glow-cyan)/0.8)] transition"
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
              className={`flex-1 px-3 py-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--glass-border))] text-[hsl(var(--foreground))] font-mono-tech text-sm focus:outline-none focus:border-[hsl(var(--glow-cyan)/0.5)] focus:shadow-[0_0_8px_hsl(var(--glow-cyan)/0.15)] transition placeholder:text-[hsl(var(--muted-foreground)/0.5)]`}
            />
            <button
              type="button"
              onClick={() => removeGoal(i)}
              className="p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-red-400 hover:bg-red-900/20 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-system-label">Success Metrics</label>
        <textarea
          value={intent.success_metrics}
          onChange={(e) => set("success_metrics", e.target.value)}
          placeholder="How will you measure if this project is successful?"
          rows={3}
          className={textareaCls}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-system-label">Out of Scope</label>
        <textarea
          value={intent.out_of_scope}
          onChange={(e) => set("out_of_scope", e.target.value)}
          placeholder="What is explicitly NOT part of this project?"
          rows={2}
          className={textareaCls}
        />
      </div>

      {showBrand && (
        <div className="space-y-4 border-t border-[hsl(var(--glass-border))] pt-4 mt-4">
          <p className="text-system-label text-[hsl(var(--glow-violet))]">Brand Identity</p>

          <div className="space-y-1.5">
            <label className="text-system-label">Core Values</label>
            <textarea
              value={intent.brand_values}
              onChange={(e) => set("brand_values", e.target.value)}
              placeholder="What values define your brand?"
              rows={2}
              className={textareaCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-system-label">Brand Promise</label>
            <input
              type="text"
              value={intent.brand_promise}
              onChange={(e) => set("brand_promise", e.target.value)}
              placeholder="What do you promise your users?"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-system-label">Voice & Tone</label>
            <input
              type="text"
              value={intent.voice_tone}
              onChange={(e) => set("voice_tone", e.target.value)}
              placeholder="e.g. Professional but friendly, Technical and concise"
              className={inputCls}
            />
          </div>
        </div>
      )}
    </div>
  );
}
