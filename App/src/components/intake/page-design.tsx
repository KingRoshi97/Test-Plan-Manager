import type { PageProps } from "./types";

const VISUAL_PRESETS = [
  { value: "minimal", label: "Minimal" },
  { value: "corporate", label: "Corporate" },
  { value: "playful", label: "Playful" },
  { value: "bold", label: "Bold" },
];

const DENSITY_OPTIONS = [
  { value: "compact", label: "Compact", desc: "Dense, information-heavy" },
  { value: "comfortable", label: "Comfortable", desc: "Balanced spacing" },
  { value: "spacious", label: "Spacious", desc: "Lots of whitespace" },
];

const NAV_OPTIONS = [
  { value: "sidebar", label: "Sidebar", desc: "Left-side navigation" },
  { value: "topbar", label: "Top Bar", desc: "Horizontal navigation" },
  { value: "bottom-tabs", label: "Bottom Tabs", desc: "Mobile-style tabs" },
];

export default function PageDesign({ data, onChange }: PageProps) {
  const d = data.design;
  const set = (field: string, value: string) => onChange("design", { [field]: value });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-1">Design Direction</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Set the visual tone and UI preferences for your project.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Style Adjectives</label>
        <input
          type="text"
          value={d.style_adjectives}
          onChange={(e) => set("style_adjectives", e.target.value)}
          placeholder="e.g. clean, modern, vibrant, professional"
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-[hsl(var(--foreground))]">Visual Preset</legend>
        <div className="grid grid-cols-4 gap-3">
          {VISUAL_PRESETS.map((v) => (
            <label
              key={v.value}
              className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition text-center ${
                d.visual_preset === v.value
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                  : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"
              }`}
            >
              <input
                type="radio"
                name="visual_preset"
                value={v.value}
                checked={d.visual_preset === v.value}
                onChange={() => set("visual_preset", v.value)}
                className="sr-only"
              />
              <span className="font-medium text-sm">{v.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Avoid List</label>
        <input
          type="text"
          value={d.avoid_list}
          onChange={(e) => set("avoid_list", e.target.value)}
          placeholder="Styles or elements to avoid, e.g. gradients, dark mode"
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Brand Colors</label>
          <input
            type="text"
            value={d.brand_colors}
            onChange={(e) => set("brand_colors", e.target.value)}
            placeholder="#3B82F6, #10B981"
            className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Brand Fonts</label>
          <input
            type="text"
            value={d.brand_fonts}
            onChange={(e) => set("brand_fonts", e.target.value)}
            placeholder="Inter, Roboto Mono"
            className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-[hsl(var(--foreground))]">UI Density</legend>
        <div className="grid grid-cols-3 gap-3">
          {DENSITY_OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex flex-col p-3 rounded-lg border cursor-pointer transition ${
                d.ui_density === o.value
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                  : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"
              }`}
            >
              <input
                type="radio"
                name="ui_density"
                value={o.value}
                checked={d.ui_density === o.value}
                onChange={() => set("ui_density", o.value)}
                className="sr-only"
              />
              <span className="font-medium text-sm">{o.label}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{o.desc}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-[hsl(var(--foreground))]">Navigation Preference</legend>
        <div className="grid grid-cols-3 gap-3">
          {NAV_OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex flex-col p-3 rounded-lg border cursor-pointer transition ${
                d.navigation_pref === o.value
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                  : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"
              }`}
            >
              <input
                type="radio"
                name="navigation_pref"
                value={o.value}
                checked={d.navigation_pref === o.value}
                onChange={() => set("navigation_pref", o.value)}
                className="sr-only"
              />
              <span className="font-medium text-sm">{o.label}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{o.desc}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
