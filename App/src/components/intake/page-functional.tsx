import { Plus, X } from "lucide-react";
import type { PageProps } from "./types";

const inputCls = "flex-1 px-3 py-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--glass-border))] text-[hsl(var(--foreground))] font-mono-tech text-sm focus:outline-none focus:border-[hsl(var(--glow-cyan)/0.5)] focus:shadow-[0_0_8px_hsl(var(--glow-cyan)/0.15)] transition placeholder:text-[hsl(var(--muted-foreground)/0.5)]";
const textareaCls = "w-full px-3 py-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--glass-border))] text-[hsl(var(--foreground))] font-mono-tech text-sm focus:outline-none focus:border-[hsl(var(--glow-cyan)/0.5)] focus:shadow-[0_0_8px_hsl(var(--glow-cyan)/0.15)] transition placeholder:text-[hsl(var(--muted-foreground)/0.5)] resize-none";

export default function PageFunctional({ data, onChange }: PageProps) {
  const f = data.functional;
  const set = (field: string, value: unknown) => onChange("functional", { [field]: value });

  const addItem = (field: "must_have_features") => {
    set(field, [...f[field], ""]);
  };
  const removeItem = (field: "must_have_features", i: number) => {
    set(field, f[field].filter((_, idx) => idx !== i));
  };
  const updateItem = (field: "must_have_features", i: number, val: string) => {
    const updated = [...f[field]];
    updated[i] = val;
    set(field, updated);
  };

  const addRole = () => set("roles", [...f.roles, { name: "", permissions: "" }]);
  const removeRole = (i: number) => set("roles", f.roles.filter((_, idx) => idx !== i));
  const updateRole = (i: number, field: string, val: string) => {
    const updated = [...f.roles];
    updated[i] = { ...updated[i], [field]: val };
    set("roles", updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))] mb-1">Functional Specification</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Define the features, roles, workflows, and business rules.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-system-label">Must-Have Features</label>
          <button type="button" onClick={() => addItem("must_have_features")} className="flex items-center gap-1 text-xs text-[hsl(var(--glow-cyan))] hover:text-[hsl(var(--glow-cyan)/0.8)] transition">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {f.must_have_features.length === 0 && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">No features added yet.</p>
        )}
        {f.must_have_features.map((feat, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={feat}
              onChange={(e) => updateItem("must_have_features", i, e.target.value)}
              placeholder={`Feature ${i + 1}`}
              className={inputCls}
            />
            <button type="button" onClick={() => removeItem("must_have_features", i)} className="p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-red-400 hover:bg-red-900/20 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-system-label">Roles & Permissions</label>
          <button type="button" onClick={addRole} className="flex items-center gap-1 text-xs text-[hsl(var(--glow-cyan))] hover:text-[hsl(var(--glow-cyan)/0.8)] transition">
            <Plus className="w-3 h-3" /> Add role
          </button>
        </div>
        {f.roles.length === 0 && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">No roles defined yet.</p>
        )}
        {f.roles.map((role, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input
              type="text"
              value={role.name}
              onChange={(e) => updateRole(i, "name", e.target.value)}
              placeholder="Role name"
              className="w-1/3 px-3 py-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--glass-border))] text-[hsl(var(--foreground))] font-mono-tech text-sm focus:outline-none focus:border-[hsl(var(--glow-cyan)/0.5)] focus:shadow-[0_0_8px_hsl(var(--glow-cyan)/0.15)] transition placeholder:text-[hsl(var(--muted-foreground)/0.5)]"
            />
            <input
              type="text"
              value={role.permissions}
              onChange={(e) => updateRole(i, "permissions", e.target.value)}
              placeholder="Permissions / capabilities"
              className={inputCls}
            />
            <button type="button" onClick={() => removeRole(i)} className="p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-red-400 hover:bg-red-900/20 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-system-label">Core Workflows</label>
        <textarea
          value={f.core_workflows}
          onChange={(e) => set("core_workflows", e.target.value)}
          placeholder="Describe the key user journeys and workflows..."
          rows={4}
          className={textareaCls}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-system-label">Business Rules</label>
        <textarea
          value={f.business_rules}
          onChange={(e) => set("business_rules", e.target.value)}
          placeholder="Must-always / Must-never / Validation rules..."
          rows={4}
          className={textareaCls}
        />
      </div>

      <div className="space-y-3 border-t border-[hsl(var(--glass-border))] pt-4 mt-4">
        <p className="text-system-label">Optional Modules</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">Enable these to add dedicated pages for each area.</p>

        <GateToggle
          label="Data Model"
          description="Does this project manage persistent data?"
          enabled={data.data.manages_data}
          onToggle={(v) => onChange("data", { manages_data: v })}
        />
        <GateToggle
          label="Authentication"
          description="Does this project require authentication?"
          enabled={data.auth.requires_auth}
          onToggle={(v) => onChange("auth", { requires_auth: v })}
        />
        <GateToggle
          label="External Integrations"
          description="Does this project connect to external services?"
          enabled={data.integrations.has_integrations}
          onToggle={(v) => onChange("integrations", { has_integrations: v })}
        />
      </div>
    </div>
  );
}

function GateToggle({ label, description, enabled, onToggle }: { label: string; description: string; enabled: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition ${
      enabled
        ? "border-[hsl(var(--glow-cyan)/0.3)] bg-[hsl(var(--glow-cyan)/0.03)] shadow-[0_0_8px_hsl(var(--glow-cyan)/0.06)]"
        : "border-[hsl(var(--glass-border))] bg-[hsl(var(--card))]"
    }`}>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onToggle(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-all ${
          enabled ? "bg-[hsl(var(--glow-cyan))] shadow-[0_0_8px_hsl(var(--glow-cyan)/0.3)]" : "bg-[hsl(var(--glass-border))]"
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
