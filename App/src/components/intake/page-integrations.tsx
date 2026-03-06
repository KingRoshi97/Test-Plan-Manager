import { Plus, X } from "lucide-react";
import type { PageProps } from "./types";

const DIRECTIONS = [
  { value: "in", label: "Inbound" },
  { value: "out", label: "Outbound" },
  { value: "both", label: "Bidirectional" },
];

export default function PageIntegrations({ data, onChange }: PageProps) {
  const ig = data.integrations;
  const set = (field: string, value: unknown) => onChange("integrations", { [field]: value });

  const addService = () =>
    set("services", [...ig.services, { name: "", purpose: "", direction: "both", triggers: "", secrets: "" }]);
  const removeService = (i: number) => set("services", ig.services.filter((_, idx) => idx !== i));
  const updateService = (i: number, field: string, val: string) => {
    const updated = [...ig.services];
    updated[i] = { ...updated[i], [field]: val };
    set("services", updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-1">External Integrations</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Define connections to external services and APIs.
        </p>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <label className="text-sm font-medium flex-1">Does this project connect to external services?</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => set("has_integrations", true)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              ig.has_integrations
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => set("has_integrations", false)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              !ig.has_integrations
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
            }`}
          >
            No
          </button>
        </div>
      </div>

      {!ig.has_integrations ? (
        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
          <p className="text-sm">No external integrations. You can proceed to the next step.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Services</label>
            <button type="button" onClick={addService} className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline">
              <Plus className="w-3 h-3" /> Add service
            </button>
          </div>
          {ig.services.length === 0 && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">No services defined yet.</p>
          )}
          {ig.services.map((svc, i) => (
            <div key={i} className="p-3 rounded-lg border border-[hsl(var(--border))] space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={svc.name}
                  onChange={(e) => updateService(i, "name", e.target.value)}
                  placeholder="Service name (e.g. Stripe, Twilio)"
                  className="flex-1 px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                />
                <button type="button" onClick={() => removeService(i)} className="p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-900/20 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={svc.purpose}
                onChange={(e) => updateService(i, "purpose", e.target.value)}
                placeholder="Purpose (e.g. payment processing)"
                className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              <div className="grid grid-cols-3 gap-2">
                {DIRECTIONS.map((d) => (
                  <label
                    key={d.value}
                    className={`flex items-center justify-center p-2 rounded-md text-xs border cursor-pointer transition ${
                      svc.direction === d.value
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"
                    }`}
                  >
                    <input type="radio" name={`direction-${i}`} value={d.value} checked={svc.direction === d.value} onChange={() => updateService(i, "direction", d.value)} className="sr-only" />
                    {d.label}
                  </label>
                ))}
              </div>
              <input
                type="text"
                value={svc.triggers}
                onChange={(e) => updateService(i, "triggers", e.target.value)}
                placeholder="Triggers (e.g. on payment, on signup)"
                className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              <input
                type="text"
                value={svc.secrets}
                onChange={(e) => updateService(i, "secrets", e.target.value)}
                placeholder="Secrets handling notes"
                className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
