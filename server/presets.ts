import type { AssemblyCategory, AssemblyMode } from "@shared/schema";

export interface PresetDefaults {
  techStack?: { frontend?: string; backend?: string; database?: string; runtime?: string; framework?: string };
  package?: { name?: string; exports?: string; targets?: string[] };
  automation?: { triggers?: string[]; integrations?: string[]; auth?: string };
  game?: { engine?: string; platform?: string; coreLoop?: string; monetization?: string };
  goals?: string[];
  constraints?: string[];
}

export interface OutputDefaults {
  kitMode: "full_kit" | "upgrade_kit";
  upgradeOutput: "patch_only" | "patched_zip" | "git_pr_later";
}

export interface Preset {
  id: string;
  label: string;
  category: AssemblyCategory;
  mode: AssemblyMode;
  defaultDomains: string[];
  wizardFieldProfile: string;
  outputDefaults: OutputDefaults;
  defaults: PresetDefaults;
}

export interface PresetsConfig {
  version: string;
  presets: Preset[];
}

export const presetsConfig: PresetsConfig = {
  version: "1.0.0",
  presets: [
    {
      id: "web.new_build.standard",
      label: "Web App → New Build",
      category: "web",
      mode: "new_build",
      defaultDomains: ["web", "api", "uxui", "security", "infra"],
      wizardFieldProfile: "web",
      outputDefaults: {
        kitMode: "full_kit",
        upgradeOutput: "patch_only"
      },
      defaults: {
        techStack: { frontend: "UNKNOWN", backend: "UNKNOWN", database: "UNKNOWN" },
        goals: ["Ship an MVP with a clean UI", "Define core routes and data model", "Set up auth and basic security"],
        constraints: ["Keep scope MVP-first", "Prefer simple everyday language in UI copy", "Document decisions in OPEN_QUESTIONS"]
      }
    },
    {
      id: "web.existing_upgrade.standard",
      label: "Web App → Existing Upgrade (ZIP)",
      category: "web",
      mode: "existing_upgrade",
      defaultDomains: ["web", "api", "uxui", "security", "infra"],
      wizardFieldProfile: "web",
      outputDefaults: {
        kitMode: "upgrade_kit",
        upgradeOutput: "patch_only"
      },
      defaults: {
        techStack: { frontend: "DETECT_FROM_ZIP", backend: "DETECT_FROM_ZIP", database: "UNKNOWN" },
        goals: ["Upgrade UI and UX consistency", "Fix architecture hotspots", "Improve reliability and error handling"],
        constraints: ["Do not break existing routes unless requested", "Prefer patch plan + diff first", "Run lint/build checks if available"]
      }
    },
    {
      id: "mobile.new_build.expo_rn",
      label: "Mobile App → New Build (Expo / RN)",
      category: "mobile",
      mode: "new_build",
      defaultDomains: ["uxui", "api", "security", "infra"],
      wizardFieldProfile: "mobile",
      outputDefaults: {
        kitMode: "full_kit",
        upgradeOutput: "patch_only"
      },
      defaults: {
        techStack: { frontend: "React Native (Expo)", backend: "UNKNOWN", database: "UNKNOWN" },
        goals: ["Define navigation and onboarding", "Set up auth + session handling", "Make the UI consistent with the design system"],
        constraints: ["Offline/latency awareness", "Use accessible components", "Avoid heavy animations by default"]
      }
    },
    {
      id: "mobile.existing_upgrade.expo_rn",
      label: "Mobile App → Existing Upgrade (ZIP)",
      category: "mobile",
      mode: "existing_upgrade",
      defaultDomains: ["uxui", "api", "security", "infra"],
      wizardFieldProfile: "mobile",
      outputDefaults: {
        kitMode: "upgrade_kit",
        upgradeOutput: "patch_only"
      },
      defaults: {
        techStack: { frontend: "DETECT_FROM_ZIP", backend: "DETECT_FROM_ZIP", database: "UNKNOWN" },
        goals: ["Fix navigation performance/bugs", "Standardize screens/components", "Harden auth + API usage"],
        constraints: ["Do not rename routes/params unless requested", "Keep UI regression-safe", "Prefer patch plan + diff first"]
      }
    },
    {
      id: "api.new_build.express",
      label: "API / Backend → New Build (Express)",
      category: "api",
      mode: "new_build",
      defaultDomains: ["api", "security", "infra"],
      wizardFieldProfile: "api",
      outputDefaults: {
        kitMode: "full_kit",
        upgradeOutput: "patch_only"
      },
      defaults: {
        techStack: { runtime: "Node.js", framework: "Express", database: "UNKNOWN" },
        goals: ["Design stable v1 routes", "Add consistent error envelopes + reason codes", "Add auth and rate limits as needed"],
        constraints: ["Version routes under /v1", "Use correlationId everywhere", "Document schema with Zod + OpenAPI"]
      }
    },
    {
      id: "api.existing_upgrade.standard",
      label: "API / Backend → Existing Upgrade (ZIP)",
      category: "api",
      mode: "existing_upgrade",
      defaultDomains: ["api", "security", "infra"],
      wizardFieldProfile: "api",
      outputDefaults: {
        kitMode: "upgrade_kit",
        upgradeOutput: "patch_only"
      },
      defaults: {
        techStack: { runtime: "DETECT_FROM_ZIP", framework: "DETECT_FROM_ZIP", database: "UNKNOWN" },
        goals: ["Stabilize API contract", "Fix auth/rate limit/logging gaps", "Improve durability (storage, queues)"],
        constraints: ["Avoid breaking changes (additive defaults)", "Prefer patch plan + diff first", "Add tests for critical routes"]
      }
    },
    {
      id: "library.new_build.ts_esm",
      label: "Library / Package → New Build (TS + ESM)",
      category: "library",
      mode: "new_build",
      defaultDomains: ["api", "security", "infra"],
      wizardFieldProfile: "library",
      outputDefaults: {
        kitMode: "full_kit",
        upgradeOutput: "patch_only"
      },
      defaults: {
        package: { name: "UNKNOWN", exports: "UNKNOWN", targets: ["node18+", "bundlers"] },
        goals: ["Define public API surface", "Set up build/test/publish pipeline", "Write clear docs + examples"],
        constraints: ["Keep semver discipline", "Avoid breaking API changes", "Add supply-chain safeguards (lockfile, provenance if possible)"]
      }
    },
    {
      id: "library.existing_upgrade.ts_esm",
      label: "Library / Package → Existing Upgrade (ZIP)",
      category: "library",
      mode: "existing_upgrade",
      defaultDomains: ["api", "security", "infra"],
      wizardFieldProfile: "library",
      outputDefaults: {
        kitMode: "upgrade_kit",
        upgradeOutput: "patch_only"
      },
      defaults: {
        package: { name: "DETECT_FROM_ZIP", exports: "DETECT_FROM_ZIP", targets: ["node18+", "bundlers"] },
        goals: ["Modernize build output (ESM/CJS if needed)", "Improve docs + typing", "Harden publish pipeline"],
        constraints: ["No breaking changes unless requested", "Prefer patch plan + diff first", "Add tests for key exports"]
      }
    },
    {
      id: "automation.new_build.webhooks",
      label: "Automation / Workflow → New Build (Webhooks + Integrations)",
      category: "automation",
      mode: "new_build",
      defaultDomains: ["api", "security", "infra", "uxui"],
      wizardFieldProfile: "automation",
      outputDefaults: {
        kitMode: "full_kit",
        upgradeOutput: "patch_only"
      },
      defaults: {
        automation: { triggers: ["UNKNOWN"], integrations: ["UNKNOWN"], auth: "UNKNOWN" },
        goals: ["Define triggers/actions clearly", "Design retries + idempotency", "Add observability (logs/events)"],
        constraints: ["Assume failures happen", "Prefer webhooks + polling fallback", "Keep workflows auditable"]
      }
    },
    {
      id: "automation.existing_upgrade.webhooks",
      label: "Automation / Workflow → Existing Upgrade (ZIP)",
      category: "automation",
      mode: "existing_upgrade",
      defaultDomains: ["api", "security", "infra", "uxui"],
      wizardFieldProfile: "automation",
      outputDefaults: {
        kitMode: "upgrade_kit",
        upgradeOutput: "patch_only"
      },
      defaults: {
        automation: { triggers: ["DETECT_FROM_ZIP"], integrations: ["DETECT_FROM_ZIP"], auth: "UNKNOWN" },
        goals: ["Stabilize workflows and edge cases", "Improve retry/idempotency guarantees", "Add better UI/ops visibility if present"],
        constraints: ["Prefer patch plan + diff first", "Don't break existing external contracts", "Add integration tests for core flows"]
      }
    },
    {
      id: "game.new_build.prototype",
      label: "Game / Interactive → Prototype (Core Loop)",
      category: "game",
      mode: "new_build",
      defaultDomains: ["platform", "uxui", "api"],
      wizardFieldProfile: "game",
      outputDefaults: {
        kitMode: "full_kit",
        upgradeOutput: "patch_only"
      },
      defaults: {
        game: { engine: "UNKNOWN", platform: "UNKNOWN", coreLoop: "UNKNOWN", monetization: "UNKNOWN" },
        goals: ["Define core loop + progression", "Build a playable vertical slice", "Add basic telemetry hooks"],
        constraints: ["Prioritize responsiveness and performance", "Keep UI minimal and readable", "Avoid feature creep until core loop is fun"]
      }
    },
    {
      id: "game.existing_upgrade.prototype",
      label: "Game / Interactive → Existing Upgrade (ZIP)",
      category: "game",
      mode: "existing_upgrade",
      defaultDomains: ["platform", "uxui", "api"],
      wizardFieldProfile: "game",
      outputDefaults: {
        kitMode: "upgrade_kit",
        upgradeOutput: "patch_only"
      },
      defaults: {
        game: { engine: "DETECT_FROM_ZIP", platform: "DETECT_FROM_ZIP", coreLoop: "UNKNOWN", monetization: "UNKNOWN" },
        goals: ["Improve performance and stability", "Clean up architecture/systems", "Standardize UI and input handling"],
        constraints: ["Prefer patch plan + diff first", "Avoid breaking gameplay feel", "Add profiling notes and regression checklist"]
      }
    }
  ]
};

export function getPresets(): Preset[] {
  return presetsConfig.presets;
}

export function getPresetsByCategory(category: AssemblyCategory): Preset[] {
  return presetsConfig.presets.filter(p => p.category === category);
}

export function getPresetsByCategoryAndMode(category: AssemblyCategory, mode: AssemblyMode): Preset[] {
  return presetsConfig.presets.filter(p => p.category === category && p.mode === mode);
}

export function getPresetById(id: string): Preset | undefined {
  return presetsConfig.presets.find(p => p.id === id);
}

export const categoryLabels: Record<AssemblyCategory, { label: string; description: string; icon: string }> = {
  web: { label: "Web App", description: "Browser-based applications", icon: "Globe" },
  mobile: { label: "Mobile App", description: "iOS and Android apps", icon: "Smartphone" },
  api: { label: "API / Backend", description: "RESTful APIs and services", icon: "Server" },
  library: { label: "Library / Package", description: "Reusable NPM packages", icon: "Package" },
  automation: { label: "Automation / Workflow", description: "Scripts and integrations", icon: "Workflow" },
  game: { label: "Game / Interactive", description: "Games and interactive experiences", icon: "Gamepad2" },
};

export const modeLabels: Record<AssemblyMode, { label: string; description: string; requiresZip: boolean }> = {
  new_build: { label: "New Build", description: "Start from scratch", requiresZip: false },
  existing_upgrade: { label: "Existing Upgrade", description: "Improve an existing project", requiresZip: true },
  ui_overhaul: { label: "UI Overhaul", description: "Redesign the user interface", requiresZip: true },
  refactor_hardening: { label: "Refactor / Hardening", description: "Improve code quality and security", requiresZip: true },
  add_feature_module: { label: "Add Feature Module", description: "Add new functionality", requiresZip: true },
};
