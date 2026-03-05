import type { PageProps } from "./types";

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "New to development" },
  { value: "intermediate", label: "Intermediate", desc: "Some experience" },
  { value: "advanced", label: "Advanced", desc: "Expert level" },
];

const CATEGORIES = [
  { value: "software", label: "Software / Application" },
  { value: "data", label: "Data / Service" },
  { value: "docs", label: "Documentation / Infrastructure" },
  { value: "other", label: "Other / Library / SDK" },
];

const TYPE_PRESETS: Record<string, { value: string; label: string }[]> = {
  software: [
    { value: "web_app", label: "Web Application" },
    { value: "internal_tool", label: "Internal Tool" },
    { value: "mobile_app", label: "Mobile App" },
  ],
  data: [
    { value: "api_only", label: "API Service" },
    { value: "internal_tool", label: "Data Pipeline" },
  ],
  docs: [
    { value: "internal_tool", label: "Documentation Site" },
    { value: "web_app", label: "Infra Dashboard" },
  ],
  other: [
    { value: "library", label: "Library / SDK" },
    { value: "api_only", label: "API Package" },
  ],
};

const BUILD_TARGETS = [
  { value: "mvp", label: "MVP", desc: "Minimum viable product" },
  { value: "production", label: "Production", desc: "Production-ready release" },
  { value: "prototype", label: "Prototype", desc: "Quick proof of concept" },
];

const AUDIENCES = [
  { value: "consumer", label: "Consumer", desc: "End users / public" },
  { value: "internal", label: "Internal", desc: "Team / organization" },
  { value: "developer", label: "Developer", desc: "Other developers" },
];

export default function PageRouting({ data, onChange }: PageProps) {
  const r = data.routing;
  const presets = TYPE_PRESETS[r.category] || [];

  const set = (field: string, value: string) => onChange("routing", { [field]: value });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-1">Project Routing</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          These choices determine which modules and pages appear in the rest of the form.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-[hsl(var(--foreground))]">Skill Level *</legend>
        <div className="grid grid-cols-3 gap-3">
          {SKILL_LEVELS.map((s) => (
            <label
              key={s.value}
              className={`flex flex-col p-3 rounded-lg border cursor-pointer transition ${
                r.skill_level === s.value
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                  : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"
              }`}
            >
              <input
                type="radio"
                name="skill_level"
                value={s.value}
                checked={r.skill_level === s.value}
                onChange={() => set("skill_level", s.value)}
                className="sr-only"
              />
              <span className="font-medium text-sm">{s.label}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{s.desc}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-[hsl(var(--foreground))]">Project Category *</legend>
        <select
          value={r.category}
          onChange={(e) => {
            set("category", e.target.value);
            onChange("routing", { type_preset: "" });
          }}
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        >
          <option value="">Select a category...</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </fieldset>

      {r.category && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-[hsl(var(--foreground))]">Type Preset *</legend>
          <div className="grid grid-cols-2 gap-3">
            {presets.map((p) => (
              <label
                key={p.value}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                  r.type_preset === p.value
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                    : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"
                }`}
              >
                <input
                  type="radio"
                  name="type_preset"
                  value={p.value}
                  checked={r.type_preset === p.value}
                  onChange={() => set("type_preset", p.value)}
                  className="sr-only"
                />
                <span className="font-medium text-sm">{p.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-[hsl(var(--foreground))]">Build Target *</legend>
        <div className="grid grid-cols-3 gap-3">
          {BUILD_TARGETS.map((t) => (
            <label
              key={t.value}
              className={`flex flex-col p-3 rounded-lg border cursor-pointer transition ${
                r.build_target === t.value
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                  : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"
              }`}
            >
              <input
                type="radio"
                name="build_target"
                value={t.value}
                checked={r.build_target === t.value}
                onChange={() => set("build_target", t.value)}
                className="sr-only"
              />
              <span className="font-medium text-sm">{t.label}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{t.desc}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-[hsl(var(--foreground))]">Target Audience *</legend>
        <div className="grid grid-cols-3 gap-3">
          {AUDIENCES.map((a) => (
            <label
              key={a.value}
              className={`flex flex-col p-3 rounded-lg border cursor-pointer transition ${
                r.audience_context === a.value
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                  : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"
              }`}
            >
              <input
                type="radio"
                name="audience_context"
                value={a.value}
                checked={r.audience_context === a.value}
                onChange={() => set("audience_context", a.value)}
                className="sr-only"
              />
              <span className="font-medium text-sm">{a.label}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{a.desc}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
