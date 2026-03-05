import { Plus, X } from "lucide-react";
import type { PageProps } from "./types";

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
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-1">Data Model</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Define the data entities, sensitivity, and retention policies.
        </p>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <label className="text-sm font-medium flex-1">Does this project manage persistent data?</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => set("manages_data", true)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              d.manages_data
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => set("manages_data", false)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              !d.manages_data
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
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
              <label className="text-sm font-medium">Data Entities</label>
              <button type="button" onClick={addEntity} className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline">
                <Plus className="w-3 h-3" /> Add entity
              </button>
            </div>
            {d.entities.length === 0 && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">No entities defined yet.</p>
            )}
            {d.entities.map((entity, i) => (
              <div key={i} className="p-3 rounded-lg border border-[hsl(var(--border))] space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={entity.name}
                    onChange={(e) => updateEntity(i, "name", e.target.value)}
                    placeholder="Entity name (e.g. User, Order)"
                    className="flex-1 px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  />
                  <button type="button" onClick={() => removeEntity(i)} className="ml-2 p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-50 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={entity.fields}
                  onChange={(e) => updateEntity(i, "fields", e.target.value)}
                  placeholder="Key fields (e.g. name, email, status)"
                  className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                />
                <input
                  type="text"
                  value={entity.relationships}
                  onChange={(e) => updateEntity(i, "relationships", e.target.value)}
                  placeholder="Relationships (e.g. belongs to Organization)"
                  className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                />
              </div>
            ))}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Sensitive Data Flags</legend>
            <div className="flex flex-wrap gap-2">
              {SENSITIVE_FLAGS.map((flag) => (
                <label
                  key={flag}
                  className={`px-3 py-1.5 rounded-md text-sm cursor-pointer border transition ${
                    d.sensitive_flags.includes(flag)
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] text-[hsl(var(--primary))]"
                      : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"
                  }`}
                >
                  <input type="checkbox" checked={d.sensitive_flags.includes(flag)} onChange={() => toggleFlag(flag)} className="sr-only" />
                  {flag}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Retention Policy</label>
            <select
              value={d.retention}
              onChange={(e) => set("retention", e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              {RETENTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Data Ownership Notes</label>
            <textarea
              value={d.ownership}
              onChange={(e) => set("ownership", e.target.value)}
              placeholder="Who owns the data? Any access control requirements?"
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
            />
          </div>
        </>
      )}
    </div>
  );
}
