import { Plus, X } from "lucide-react";
import type { PageProps } from "./types";

const inputCls = "w-full px-3 py-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--glass-border))] text-[hsl(var(--foreground))] font-mono-tech text-sm focus:outline-none focus:border-[hsl(var(--glow-cyan)/0.5)] focus:shadow-[0_0_8px_hsl(var(--glow-cyan)/0.15)] transition placeholder:text-[hsl(var(--muted-foreground)/0.5)]";
const textareaCls = `${inputCls} resize-none`;

const RETENTION_OPTIONS = [
  { value: "", label: "Select..." },
  { value: "ephemeral", label: "Ephemeral (session only)" },
  { value: "short", label: "Short-term (days-weeks)" },
  { value: "medium", label: "Medium-term (months)" },
  { value: "long", label: "Long-term (years)" },
  { value: "permanent", label: "Permanent" },
];

const SENSITIVE_FLAGS = ["PII", "PHI", "Financial", "Credentials", "None"];

export default function PageData({ data, onChange }: PageProps) {
  const d = data.data;
  const set = (field: string, value: unknown) => onChange("data", { [field]: value });

  const addEntity = () => set("entities", [...d.entities, { name: "", fields: "", relationships: "" }]);
  const removeEntity = (i: number) => set("entities", d.entities.filter((_, idx) => idx !== i));
  const updateEntity = (i: number, field: string, val: string) => {
    const updated = [...d.entities];
    updated[i] = { ...updated[i], [field]: val };
    set("entities", updated);
  };

  const toggleFlag = (flag: string) => {
    if (flag === "None") {
      set("sensitive_flags", d.sensitive_flags.includes("None") ? [] : ["None"]);
      return;
    }
    const without = d.sensitive_flags.filter((f) => f !== "None");
    set("sensitive_flags", without.includes(flag) ? without.filter((f) => f !== flag) : [...without, flag]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))] mb-1">Data Model</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Define the data entities, sensitivity, and retention policies.
        </p>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-lg border border-[hsl(var(--glass-border))] bg-[hsl(var(--card))]">
        <label className="text-sm font-medium flex-1">Does this project manage persistent data?</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => set("manages_data", true)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              d.manages_data
                ? "bg-[hsl(var(--glow-cyan))] text-[hsl(var(--background))] shadow-[0_0_8px_hsl(var(--glow-cyan)/0.3)]"
                : "border border-[hsl(var(--glass-border))] hover:border-[hsl(var(--glow-cyan)/0.3)]"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => set("manages_data", false)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              !d.manages_data
                ? "bg-[hsl(var(--glow-cyan))] text-[hsl(var(--background))] shadow-[0_0_8px_hsl(var(--glow-cyan)/0.3)]"
                : "border border-[hsl(var(--glass-border))] hover:border-[hsl(var(--glow-cyan)/0.3)]"
            }`}
          >
            No
          </button>
        </div>
      </div>

      {!d.manages_data ? (
        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
          <p className="text-sm">No data model needed. You can proceed to the next step.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-system-label">Data Entities</label>
              <button type="button" onClick={addEntity} className="flex items-center gap-1 text-xs text-[hsl(var(--glow-cyan))] hover:text-[hsl(var(--glow-cyan)/0.8)] transition">
                <Plus className="w-3 h-3" /> Add entity
              </button>
            </div>
            {d.entities.length === 0 && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">No entities defined yet.</p>
            )}
            {d.entities.map((entity, i) => (
              <div key={i} className="p-3 rounded-lg border border-[hsl(var(--glass-border))] bg-[hsl(var(--card))] space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={entity.name}
                    onChange={(e) => updateEntity(i, "name", e.target.value)}
                    placeholder="Entity name (e.g. User, Order)"
                    className={`flex-1 ${inputCls}`}
                  />
                  <button type="button" onClick={() => removeEntity(i)} className="ml-2 p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-red-400 hover:bg-red-900/20 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={entity.fields}
                  onChange={(e) => updateEntity(i, "fields", e.target.value)}
                  placeholder="Key fields (e.g. name, email, status)"
                  className={inputCls}
                />
                <input
                  type="text"
                  value={entity.relationships}
                  onChange={(e) => updateEntity(i, "relationships", e.target.value)}
                  placeholder="Relationships (e.g. belongs to Organization)"
                  className={inputCls}
                />
              </div>
            ))}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-system-label">Sensitive Data Flags</legend>
            <div className="flex flex-wrap gap-2">
              {SENSITIVE_FLAGS.map((flag) => (
                <label
                  key={flag}
                  className={`px-3 py-1.5 rounded-md text-sm cursor-pointer border transition ${
                    d.sensitive_flags.includes(flag)
                      ? "border-[hsl(var(--glow-cyan)/0.5)] bg-[hsl(var(--glow-cyan)/0.08)] text-[hsl(var(--glow-cyan))] shadow-[0_0_6px_hsl(var(--glow-cyan)/0.1)]"
                      : "border-[hsl(var(--glass-border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--glow-cyan)/0.3)]"
                  }`}
                >
                  <input type="checkbox" checked={d.sensitive_flags.includes(flag)} onChange={() => toggleFlag(flag)} className="sr-only" />
                  {flag}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-1.5">
            <label className="text-system-label">Retention Policy</label>
            <select
              value={d.retention}
              onChange={(e) => set("retention", e.target.value)}
              className={inputCls}
            >
              {RETENTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-system-label">Data Ownership Notes</label>
            <textarea
              value={d.ownership}
              onChange={(e) => set("ownership", e.target.value)}
              placeholder="Who owns the data? Any access control requirements?"
              rows={2}
              className={textareaCls}
            />
          </div>
        </>
      )}
    </div>
  );
}
