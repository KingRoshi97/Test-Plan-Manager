import { Plus, X } from "lucide-react";
import type { PageProps } from "./types";

export default function PageFunctional({ data, onChange }: PageProps) {
  const f = data.functional;
  const set = (field: string, value: unknown) => onChange("functional", { [field]: value });

  const addItem = (field: "must_have_features" | "nice_to_have_features") => {
    set(field, [...f[field], ""]);
  };
  const removeItem = (field: "must_have_features" | "nice_to_have_features", i: number) => {
    set(field, f[field].filter((_, idx) => idx !== i));
  };
  const updateItem = (field: "must_have_features" | "nice_to_have_features", i: number, val: string) => {
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
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-1">Functional Specification</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Define the features, roles, workflows, and business rules.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Must-Have Features</label>
          <button type="button" onClick={() => addItem("must_have_features")} className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline">
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
              className="flex-1 px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
            <button type="button" onClick={() => removeItem("must_have_features", i)} className="p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-50 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Nice-to-Have Features</label>
          <button type="button" onClick={() => addItem("nice_to_have_features")} className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {f.nice_to_have_features.map((feat, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={feat}
              onChange={(e) => updateItem("nice_to_have_features", i, e.target.value)}
              placeholder={`Nice-to-have ${i + 1}`}
              className="flex-1 px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
            <button type="button" onClick={() => removeItem("nice_to_have_features", i)} className="p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-50 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Roles & Permissions</label>
          <button type="button" onClick={addRole} className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline">
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
              className="w-1/3 px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
            <input
              type="text"
              value={role.permissions}
              onChange={(e) => updateRole(i, "permissions", e.target.value)}
              placeholder="Permissions / capabilities"
              className="flex-1 px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
            <button type="button" onClick={() => removeRole(i)} className="p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-50 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Core Workflows</label>
        <textarea
          value={f.core_workflows}
          onChange={(e) => set("core_workflows", e.target.value)}
          placeholder="Describe the key user journeys and workflows..."
          rows={4}
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Business Rules</label>
        <textarea
          value={f.business_rules}
          onChange={(e) => set("business_rules", e.target.value)}
          placeholder="Must-always / Must-never / Validation rules..."
          rows={4}
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
        />
      </div>

      <div className="space-y-3 border-t border-[hsl(var(--border))] pt-4 mt-4">
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">Optional Modules</p>
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
    <div className="flex items-center gap-3 p-3 rounded-lg border border-[hsl(var(--border))]">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onToggle(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          enabled ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--border))]"
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
