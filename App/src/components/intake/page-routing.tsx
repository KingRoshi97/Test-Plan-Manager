import type { PageProps } from "./types";
import { GlassPanel } from "../ui/glass-panel";

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "New to development", icon: "🌱" },
  { value: "intermediate", label: "Intermediate", desc: "Some experience", icon: "⚡" },
  { value: "advanced", label: "Advanced", desc: "Expert level", icon: "🔥" },
];

const CATEGORIES = [
  { value: "software", label: "Software / Application", icon: "💻" },
  { value: "data", label: "Data / Service", icon: "🗄️" },
  { value: "docs", label: "Documentation / Infrastructure", icon: "📄" },
  { value: "other", label: "Other / Library / SDK", icon: "📦" },
];

const TYPE_PRESETS: Record<string, { value: string; label: string; icon: string }[]> = {
  software: [
    { value: "web_app", label: "Web Application", icon: "🌐" },
    { value: "internal_tool", label: "Internal Tool", icon: "🔧" },
    { value: "mobile_app", label: "Mobile App", icon: "📱" },
  ],
  data: [
    { value: "api_only", label: "API Service", icon: "🔌" },
    { value: "internal_tool", label: "Data Pipeline", icon: "🔀" },
  ],
  docs: [
    { value: "internal_tool", label: "Documentation Site", icon: "📚" },
    { value: "web_app", label: "Infra Dashboard", icon: "📊" },
  ],
  other: [
    { value: "library", label: "Library / SDK", icon: "📦" },
    { value: "api_only", label: "API Package", icon: "🔌" },
  ],
};

const BUILD_TARGETS = [
  { value: "mvp", label: "MVP", desc: "Minimum viable product", icon: "🚀" },
  { value: "production", label: "Production", desc: "Production-ready release", icon: "🏭" },
  { value: "prototype", label: "Prototype", desc: "Quick proof of concept", icon: "🧪" },
];

const AUDIENCES = [
  { value: "consumer", label: "Consumer", desc: "End users / public", icon: "👥" },
  { value: "internal", label: "Internal", desc: "Team / organization", icon: "🏢" },
  { value: "developer", label: "Developer", desc: "Other developers", icon: "👨‍💻" },
];

export default function PageRouting({ data, onChange }: PageProps) {
  const r = data.routing;
  const presets = TYPE_PRESETS[r.category] || [];

  const set = (field: string, value: string) => onChange("routing", { [field]: value });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-system-label mb-1">Project Routing</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          These choices determine which modules and pages appear in the rest of the form.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-system-label">Skill Level *</legend>
        <div className="grid grid-cols-3 gap-3">
          {SKILL_LEVELS.map((s) => (
            <label key={s.value} className="cursor-pointer">
              <input
                type="radio"
                name="skill_level"
                value={s.value}
                checked={r.skill_level === s.value}
                onChange={() => set("skill_level", s.value)}
                className="sr-only"
              />
              <GlassPanel
                glow={r.skill_level === s.value ? "cyan" : "none"}
                hover
                className={`p-4 flex flex-col items-center text-center transition-all duration-200 ${
                  r.skill_level === s.value
                    ? "ring-1 ring-[hsl(var(--glow-cyan)/0.4)]"
                    : "hover:border-[hsl(var(--primary)/0.3)]"
                }`}
              >
                <span className="text-2xl mb-2">{s.icon}</span>
                <span className="font-medium text-sm text-[hsl(var(--foreground))]">{s.label}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.desc}</span>
              </GlassPanel>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-system-label">Project Category *</legend>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((c) => (
            <label key={c.value} className="cursor-pointer">
              <input
                type="radio"
                name="category"
                value={c.value}
                checked={r.category === c.value}
                onChange={() => {
                  set("category", c.value);
                  onChange("routing", { type_preset: "" });
                }}
                className="sr-only"
              />
              <GlassPanel
                glow={r.category === c.value ? "cyan" : "none"}
                hover
                className={`p-4 flex items-center gap-3 transition-all duration-200 ${
                  r.category === c.value
                    ? "ring-1 ring-[hsl(var(--glow-cyan)/0.4)]"
                    : "hover:border-[hsl(var(--primary)/0.3)]"
                }`}
              >
                <span className="text-xl">{c.icon}</span>
                <span className="font-medium text-sm text-[hsl(var(--foreground))]">{c.label}</span>
              </GlassPanel>
            </label>
          ))}
        </div>
      </fieldset>

      {r.category && (
        <fieldset className="space-y-3">
          <legend className="text-system-label">Type Preset *</legend>
          <div className="grid grid-cols-2 gap-3">
            {presets.map((p) => (
              <label key={p.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="type_preset"
                  value={p.value}
                  checked={r.type_preset === p.value}
                  onChange={() => set("type_preset", p.value)}
                  className="sr-only"
                />
                <GlassPanel
                  glow={r.type_preset === p.value ? "cyan" : "none"}
                  hover
                  className={`p-4 flex items-center gap-3 transition-all duration-200 ${
                    r.type_preset === p.value
                      ? "ring-1 ring-[hsl(var(--glow-cyan)/0.4)]"
                      : "hover:border-[hsl(var(--primary)/0.3)]"
                  }`}
                >
                  <span className="text-xl">{p.icon}</span>
                  <span className="font-medium text-sm text-[hsl(var(--foreground))]">{p.label}</span>
                </GlassPanel>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-3">
        <legend className="text-system-label">Build Target *</legend>
        <div className="grid grid-cols-3 gap-3">
          {BUILD_TARGETS.map((t) => (
            <label key={t.value} className="cursor-pointer">
              <input
                type="radio"
                name="build_target"
                value={t.value}
                checked={r.build_target === t.value}
                onChange={() => set("build_target", t.value)}
                className="sr-only"
              />
              <GlassPanel
                glow={r.build_target === t.value ? "cyan" : "none"}
                hover
                className={`p-4 flex flex-col items-center text-center transition-all duration-200 ${
                  r.build_target === t.value
                    ? "ring-1 ring-[hsl(var(--glow-cyan)/0.4)]"
                    : "hover:border-[hsl(var(--primary)/0.3)]"
                }`}
              >
                <span className="text-2xl mb-2">{t.icon}</span>
                <span className="font-medium text-sm text-[hsl(var(--foreground))]">{t.label}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{t.desc}</span>
              </GlassPanel>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-system-label">Target Audience *</legend>
        <div className="grid grid-cols-3 gap-3">
          {AUDIENCES.map((a) => (
            <label key={a.value} className="cursor-pointer">
              <input
                type="radio"
                name="audience_context"
                value={a.value}
                checked={r.audience_context === a.value}
                onChange={() => set("audience_context", a.value)}
                className="sr-only"
              />
              <GlassPanel
                glow={r.audience_context === a.value ? "cyan" : "none"}
                hover
                className={`p-4 flex flex-col items-center text-center transition-all duration-200 ${
                  r.audience_context === a.value
                    ? "ring-1 ring-[hsl(var(--glow-cyan)/0.4)]"
                    : "hover:border-[hsl(var(--primary)/0.3)]"
                }`}
              >
                <span className="text-2xl mb-2">{a.icon}</span>
                <span className="font-medium text-sm text-[hsl(var(--foreground))]">{a.label}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{a.desc}</span>
              </GlassPanel>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-system-label">Assembly Metadata</legend>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Optional organizational fields for tracking and grouping assemblies.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Family Name</label>
            <input
              type="text"
              value={r.family_name}
              onChange={(e) => set("family_name", e.target.value)}
              placeholder="e.g. Payments Platform"
              className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--glow-cyan)/0.4)] transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Family Type</label>
            <select
              value={r.family_type}
              onChange={(e) => set("family_type", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--glow-cyan)/0.4)] transition"
            >
              <option value="">Select type...</option>
              <option value="product">Product</option>
              <option value="client">Client</option>
              <option value="internal_system">Internal System</option>
              <option value="service_cluster">Service Cluster</option>
              <option value="environment">Environment</option>
              <option value="workspace_group">Workspace Group</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Owner Name</label>
            <input
              type="text"
              value={r.owner_name}
              onChange={(e) => set("owner_name", e.target.value)}
              placeholder="e.g. Jane Smith"
              className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--glow-cyan)/0.4)] transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Team Name</label>
            <input
              type="text"
              value={r.team_name}
              onChange={(e) => set("team_name", e.target.value)}
              placeholder="e.g. Platform Engineering"
              className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--glow-cyan)/0.4)] transition"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <GlassPanel
          glow={r.autofill ? "violet" : "none"}
          className={`p-4 transition-all duration-200 ${
            r.autofill ? "ring-1 ring-[hsl(var(--glow-violet)/0.4)]" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="checkbox"
                id="autofill-toggle"
                checked={r.autofill}
                onChange={(e) => onChange("routing", { autofill: e.target.checked })}
                className="sr-only peer"
              />
              <label
                htmlFor="autofill-toggle"
                className={`block w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                  r.autofill
                    ? "bg-[hsl(var(--glow-violet))]"
                    : "bg-[hsl(var(--muted))]"
                }`}
              >
                <span
                  className={`block w-5 h-5 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${
                    r.autofill ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </label>
            </div>
            <label htmlFor="autofill-toggle" className="flex-1 cursor-pointer">
              <span className="font-medium text-sm text-[hsl(var(--foreground))] flex items-center gap-2">
                <span className="text-lg">🤖</span>
                Use AI to draft answers (opt-in)
              </span>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                When enabled, AI will suggest answers for remaining sections based on your project details. All values are editable.
              </p>
            </label>
          </div>
        </GlassPanel>
      </fieldset>
    </div>
  );
}
