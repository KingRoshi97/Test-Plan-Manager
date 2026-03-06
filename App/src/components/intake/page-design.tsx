import { useState, useRef } from "react";
import { X, Plus, Palette } from "lucide-react";
import type { PageProps } from "./types";

const inputCls = "w-full px-3 py-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--glass-border))] text-[hsl(var(--foreground))] font-mono-tech text-sm focus:outline-none focus:border-[hsl(var(--glow-cyan)/0.5)] focus:shadow-[0_0_8px_hsl(var(--glow-cyan)/0.15)] transition placeholder:text-[hsl(var(--muted-foreground)/0.5)]";

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

const COLOR_PRESETS = [
  { name: "Ocean", colors: ["#0EA5E9", "#0284C7", "#38BDF8", "#7DD3FC", "#082F49"] },
  { name: "Sunset", colors: ["#F97316", "#EF4444", "#F59E0B", "#EC4899", "#7C2D12"] },
  { name: "Forest", colors: ["#22C55E", "#16A34A", "#84CC16", "#365314", "#14532D"] },
  { name: "Corporate", colors: ["#3B82F6", "#1E3A5F", "#64748B", "#F8FAFC", "#0F172A"] },
  { name: "Neon", colors: ["#A855F7", "#EC4899", "#06B6D4", "#22D3EE", "#F43F5E"] },
  { name: "Pastel", colors: ["#FDA4AF", "#A5B4FC", "#86EFAC", "#FDE68A", "#C4B5FD"] },
  { name: "Monochrome", colors: ["#18181B", "#3F3F46", "#71717A", "#A1A1AA", "#F4F4F5"] },
  { name: "Earth", colors: ["#92400E", "#78716C", "#A16207", "#854D0E", "#D6D3D1"] },
];

function parseColors(str: string): string[] {
  if (!str.trim()) return [];
  return str.split(",").map((c) => c.trim()).filter(Boolean);
}

function isValidHex(c: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(c);
}

function colorsToString(colors: string[]): string {
  return colors.join(", ");
}

function ColorSwatch({ color, onRemove, onChange }: { color: string; onRemove: () => void; onChange: (newColor: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-10 h-10 rounded-lg border-2 border-[hsl(var(--glass-border))] cursor-pointer transition hover:scale-110 hover:shadow-[0_0_12px_hsl(var(--glow-cyan)/0.2)]"
        style={{ backgroundColor: color }}
        title={color}
      />
      <input
        ref={inputRef}
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-2.5 h-2.5" />
      </button>
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono-tech text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {color.toUpperCase()}
      </span>
    </div>
  );
}

function BrandColorPicker({ value, onChangeValue }: { value: string; onChangeValue: (v: string) => void }) {
  const [manualHex, setManualHex] = useState("");
  const colors = parseColors(value);

  const updateColors = (newColors: string[]) => {
    onChangeValue(colorsToString(newColors));
  };

  const addColor = (color: string) => {
    const normalized = color.startsWith("#") ? color : `#${color}`;
    if (isValidHex(normalized)) {
      updateColors([...colors, normalized]);
      setManualHex("");
    }
  };

  const removeColor = (index: number) => {
    updateColors(colors.filter((_, i) => i !== index));
  };

  const changeColor = (index: number, newColor: string) => {
    const updated = [...colors];
    updated[index] = newColor;
    updateColors(updated);
  };

  const applyPreset = (presetColors: string[]) => {
    updateColors([...presetColors]);
  };

  const addNewRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-system-label">Brand Colors</label>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Click a swatch to change it, or add new colors below</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap min-h-[48px] p-3 rounded-lg border border-[hsl(var(--glass-border))] bg-[hsl(var(--card))]">
        {colors.map((color, i) =>
          isValidHex(color) ? (
            <ColorSwatch
              key={`${i}-${color}`}
              color={color}
              onRemove={() => removeColor(i)}
              onChange={(c) => changeColor(i, c)}
            />
          ) : (
            <div key={`${i}-${color}`} className="relative group">
              <div className="px-2 py-1 rounded-md border border-dashed border-[hsl(var(--glass-border))] bg-[hsl(var(--accent))] text-xs font-mono-tech text-[hsl(var(--foreground))]">
                {color}
              </div>
              <button
                type="button"
                onClick={() => removeColor(i)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          )
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => addNewRef.current?.click()}
            className="w-10 h-10 rounded-lg border-2 border-dashed border-[hsl(var(--glass-border))] flex items-center justify-center cursor-pointer transition hover:border-[hsl(var(--glow-cyan)/0.5)] hover:bg-[hsl(var(--glow-cyan)/0.05)]"
            title="Add color"
          >
            <Plus className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          </button>
          <input
            ref={addNewRef}
            type="color"
            value="#3B82F6"
            onChange={(e) => addColor(e.target.value)}
            className="sr-only"
          />
        </div>
        {colors.length === 0 && (
          <span className="text-xs text-[hsl(var(--muted-foreground))]">No colors selected</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={manualHex}
          onChange={(e) => setManualHex(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(manualHex); } }}
          placeholder="#3B82F6"
          className="w-32 px-3 py-1.5 text-sm rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--glass-border))] text-[hsl(var(--foreground))] font-mono-tech focus:outline-none focus:border-[hsl(var(--glow-cyan)/0.5)] focus:shadow-[0_0_8px_hsl(var(--glow-cyan)/0.15)] transition"
        />
        <button
          type="button"
          onClick={() => addColor(manualHex)}
          disabled={!manualHex.trim()}
          className="px-3 py-1.5 text-sm rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--glow-cyan)/0.3)] transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <span className="text-system-label">Preset Palettes</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isActive = colors.length === preset.colors.length && colors.every((c, i) => c.toUpperCase() === preset.colors[i].toUpperCase());
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset.colors)}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition text-left ${
                  isActive
                    ? "border-[hsl(var(--glow-cyan)/0.5)] bg-[hsl(var(--glow-cyan)/0.05)] shadow-[0_0_8px_hsl(var(--glow-cyan)/0.1)]"
                    : "border-[hsl(var(--glass-border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--glow-cyan)/0.3)]"
                }`}
              >
                <div className="flex -space-x-1 shrink-0">
                  {preset.colors.map((c, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border border-white/20"
                      style={{ backgroundColor: c, zIndex: preset.colors.length - i }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-[hsl(var(--foreground))]">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PageDesign({ data, onChange }: PageProps) {
  const d = data.design;
  const set = (field: string, value: string) => onChange("design", { [field]: value });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))] mb-1">Design Direction</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Set the visual tone and UI preferences for your project.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-system-label">Style Adjectives</label>
        <input
          type="text"
          value={d.style_adjectives}
          onChange={(e) => set("style_adjectives", e.target.value)}
          placeholder="e.g. clean, modern, vibrant, professional"
          className={inputCls}
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-system-label">Visual Preset</legend>
        <div className="grid grid-cols-4 gap-3">
          {VISUAL_PRESETS.map((v) => (
            <label
              key={v.value}
              className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition text-center ${
                d.visual_preset === v.value
                  ? "border-[hsl(var(--glow-cyan)/0.5)] bg-[hsl(var(--glow-cyan)/0.05)] shadow-[0_0_8px_hsl(var(--glow-cyan)/0.1)]"
                  : "border-[hsl(var(--glass-border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--glow-cyan)/0.3)]"
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
        <label className="text-system-label">Avoid List</label>
        <input
          type="text"
          value={d.avoid_list}
          onChange={(e) => set("avoid_list", e.target.value)}
          placeholder="Styles or elements to avoid, e.g. gradients, dark mode"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BrandColorPicker value={d.brand_colors} onChangeValue={(v) => set("brand_colors", v)} />
        <div className="space-y-1.5">
          <label className="text-system-label">Brand Fonts</label>
          <input
            type="text"
            value={d.brand_fonts}
            onChange={(e) => set("brand_fonts", e.target.value)}
            placeholder="Inter, Roboto Mono"
            className={inputCls}
          />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-system-label">UI Density</legend>
        <div className="grid grid-cols-3 gap-3">
          {DENSITY_OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex flex-col p-3 rounded-lg border cursor-pointer transition ${
                d.ui_density === o.value
                  ? "border-[hsl(var(--glow-cyan)/0.5)] bg-[hsl(var(--glow-cyan)/0.05)] shadow-[0_0_8px_hsl(var(--glow-cyan)/0.1)]"
                  : "border-[hsl(var(--glass-border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--glow-cyan)/0.3)]"
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
        <legend className="text-system-label">Navigation Preference</legend>
        <div className="grid grid-cols-3 gap-3">
          {NAV_OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex flex-col p-3 rounded-lg border cursor-pointer transition ${
                d.navigation_pref === o.value
                  ? "border-[hsl(var(--glow-cyan)/0.5)] bg-[hsl(var(--glow-cyan)/0.05)] shadow-[0_0_8px_hsl(var(--glow-cyan)/0.1)]"
                  : "border-[hsl(var(--glass-border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--glow-cyan)/0.3)]"
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
