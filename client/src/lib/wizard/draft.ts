import type { Category, Mode, WizardFlow, FieldSpec } from './flows';
import { getFlow, getStepFields } from './flows';

export interface ProjectPackageStatus {
  id: string;
  filename: string;
  sizeBytes: number;
  scanState: "queued" | "scanning" | "scanned" | "failed";
  indexState: "queued" | "indexing" | "indexed" | "failed";
  summaryJson?: {
    framework?: string;
    packageManager?: string;
    fileCount?: number;
    hasTypeScript?: boolean;
    scripts?: Record<string, string>;
  } | null;
  warningsJson?: Array<{ code: string; message: string }> | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface WizardDraft {
  project: {
    name: string;
    oneLiner: string;
    audience?: string;
    success?: string;
  };
  intent: {
    summary: string;
    goals: string[];
    constraints: string[];
    doNotTouch: string[];
  };
  uploads: {
    docUploadIds: string[];
  };
  projectPackage: {
    id?: string;
    notes?: string;
  };
  users: {
    roles: string[];
    roleGoals?: string;
  };
  features: {
    p0: string[];
    p1: string[];
    p2: string[];
  };
  ux: {
    screens: string[];
    navigationStyle?: string;
    goal?: string;
    components?: string[];
    designSystem?: string;
  };
  tech: {
    frontend?: string;
    backend?: string;
    database?: string;
    runtime?: string;
  };
  brand: {
    assets?: string;
  };
  upgrade: {
    mustNotBreak: string[];
    validationCommands: string[];
  };
  hardening: {
    targets: string[];
    tests?: string;
    rollout?: string;
  };
  library: {
    packageName?: string;
    purpose?: string;
    exports: string[];
    targets: string[];
    moduleFormat?: string;
  };
  automation: {
    triggers: string[];
    actions: string[];
    integrations: string[];
    idempotency?: string;
  };
  game: {
    engine?: string;
    platform: string[];
    coreLoop?: string;
    monetization?: string;
  };
  module: {
    name?: string;
    description?: string;
    dataModels: string[];
    endpoints: string[];
  };
  ui: {
    goal?: string;
    components: string[];
    designSystem?: string;
  };
}

export function makeEmptyDraft(): WizardDraft {
  return {
    project: {
      name: "",
      oneLiner: "",
      audience: "",
      success: ""
    },
    intent: {
      summary: "",
      goals: [],
      constraints: [],
      doNotTouch: []
    },
    uploads: {
      docUploadIds: []
    },
    projectPackage: {},
    users: {
      roles: [],
      roleGoals: ""
    },
    features: {
      p0: [],
      p1: [],
      p2: []
    },
    ux: {
      screens: [],
      navigationStyle: "",
      goal: "",
      components: [],
      designSystem: ""
    },
    tech: {
      frontend: "",
      backend: "",
      database: "",
      runtime: ""
    },
    brand: {
      assets: ""
    },
    upgrade: {
      mustNotBreak: [],
      validationCommands: []
    },
    hardening: {
      targets: [],
      tests: "",
      rollout: ""
    },
    library: {
      packageName: "",
      purpose: "",
      exports: [],
      targets: [],
      moduleFormat: ""
    },
    automation: {
      triggers: [],
      actions: [],
      integrations: [],
      idempotency: ""
    },
    game: {
      engine: "",
      platform: [],
      coreLoop: "",
      monetization: ""
    },
    module: {
      name: "",
      description: "",
      dataModels: [],
      endpoints: []
    },
    ui: {
      goal: "",
      components: [],
      designSystem: ""
    }
  };
}

export interface PresetDefaults {
  techStack?: {
    frontend?: string;
    backend?: string;
    database?: string;
    runtime?: string;
    framework?: string;
  };
  goals?: string[];
  constraints?: string[];
  package?: {
    name?: string;
    exports?: string;
    targets?: string[];
  };
  automation?: {
    triggers?: string[];
    integrations?: string[];
    auth?: string;
  };
  game?: {
    engine?: string;
    platform?: string;
    coreLoop?: string;
    monetization?: string;
  };
}

export function applyPresetDefaults(draft: WizardDraft, defaults: PresetDefaults): WizardDraft {
  const newDraft = { ...draft };

  if (defaults.techStack) {
    const ts = defaults.techStack;
    if (ts.frontend && ts.frontend !== "UNKNOWN" && ts.frontend !== "DETECT_FROM_ZIP") {
      newDraft.tech.frontend = ts.frontend;
    }
    if (ts.backend && ts.backend !== "UNKNOWN" && ts.backend !== "DETECT_FROM_ZIP") {
      newDraft.tech.backend = ts.backend;
    }
    if (ts.database && ts.database !== "UNKNOWN") {
      newDraft.tech.database = ts.database;
    }
    if (ts.runtime && ts.runtime !== "UNKNOWN" && ts.runtime !== "DETECT_FROM_ZIP") {
      newDraft.tech.runtime = ts.runtime;
    }
  }

  if (defaults.goals && defaults.goals.length > 0) {
    newDraft.intent.goals = [...defaults.goals];
  }

  if (defaults.constraints && defaults.constraints.length > 0) {
    newDraft.intent.constraints = [...defaults.constraints];
  }

  if (defaults.package) {
    if (defaults.package.name && defaults.package.name !== "UNKNOWN" && defaults.package.name !== "DETECT_FROM_ZIP") {
      newDraft.library.packageName = defaults.package.name;
    }
    if (defaults.package.targets) {
      newDraft.library.targets = [...defaults.package.targets];
    }
  }

  if (defaults.automation) {
    if (defaults.automation.triggers && defaults.automation.triggers[0] !== "UNKNOWN" && defaults.automation.triggers[0] !== "DETECT_FROM_ZIP") {
      newDraft.automation.triggers = [...defaults.automation.triggers];
    }
    if (defaults.automation.integrations && defaults.automation.integrations[0] !== "UNKNOWN" && defaults.automation.integrations[0] !== "DETECT_FROM_ZIP") {
      newDraft.automation.integrations = [...defaults.automation.integrations];
    }
  }

  if (defaults.game) {
    if (defaults.game.engine && defaults.game.engine !== "UNKNOWN" && defaults.game.engine !== "DETECT_FROM_ZIP") {
      newDraft.game.engine = defaults.game.engine;
    }
    if (defaults.game.platform && defaults.game.platform !== "UNKNOWN" && defaults.game.platform !== "DETECT_FROM_ZIP") {
      newDraft.game.platform = [defaults.game.platform];
    }
    if (defaults.game.coreLoop && defaults.game.coreLoop !== "UNKNOWN") {
      newDraft.game.coreLoop = defaults.game.coreLoop;
    }
    if (defaults.game.monetization && defaults.game.monetization !== "UNKNOWN") {
      newDraft.game.monetization = defaults.game.monetization;
    }
  }

  return newDraft;
}

export interface CreateAssemblyRequest {
  projectName: string;
  description: string;
  category: Category;
  mode: Mode;
  presetId: string;
  domains: string[];
  projectPackageId?: string;
  features?: Array<{ name: string; description: string; priority: string }>;
  users?: Array<{ type: string; goal: string }>;
  techStack?: {
    frontend?: string;
    backend?: string;
    database?: string;
  };
  intent?: {
    summary: string;
    goals: string[];
    constraints: string[];
    doNotTouch: string[];
  };
  upgrade?: {
    mustNotBreak: string[];
    validationCommands: string[];
  };
  hardening?: {
    targets: string[];
    tests?: string;
  };
  library?: {
    packageName?: string;
    purpose?: string;
    exports: string[];
    targets: string[];
    moduleFormat?: string;
  };
  automation?: {
    triggers: string[];
    actions: string[];
    integrations: string[];
    idempotency?: string;
  };
  game?: {
    engine?: string;
    platform: string[];
    coreLoop?: string;
    monetization?: string;
  };
  module?: {
    name?: string;
    description?: string;
    dataModels: string[];
    endpoints: string[];
  };
  ui?: {
    goal?: string;
    components: string[];
    designSystem?: string;
  };
  ux?: {
    screens: string[];
    navigationStyle?: string;
  };
  brand?: {
    assets?: string;
  };
}

export interface MapDraftOptions {
  draft: WizardDraft;
  category: Category;
  mode: Mode;
  presetId: string;
  domains: string[];
  projectPackageId?: string;
}

export function mapDraftToCreateAssemblyRequest(options: MapDraftOptions): CreateAssemblyRequest {
  const { draft, category, mode, presetId, domains, projectPackageId } = options;

  const features: CreateAssemblyRequest['features'] = [];
  for (const name of draft.features.p0) {
    features.push({ name, description: name, priority: "P0" });
  }
  for (const name of draft.features.p1) {
    features.push({ name, description: name, priority: "P1" });
  }
  for (const name of draft.features.p2) {
    features.push({ name, description: name, priority: "P2" });
  }

  const users: CreateAssemblyRequest['users'] = draft.users.roles.map(role => ({
    type: role,
    goal: draft.users.roleGoals || ""
  }));

  const request: CreateAssemblyRequest = {
    projectName: draft.project.name,
    description: draft.project.oneLiner || draft.intent.summary,
    category,
    mode,
    presetId,
    domains,
    projectPackageId,
    features: features.length > 0 ? features : undefined,
    users: users.length > 0 ? users : undefined,
    techStack: {
      frontend: draft.tech.frontend || undefined,
      backend: draft.tech.backend || undefined,
      database: draft.tech.database || undefined
    },
    intent: {
      summary: draft.intent.summary,
      goals: draft.intent.goals,
      constraints: draft.intent.constraints,
      doNotTouch: draft.intent.doNotTouch
    },
    ux: {
      screens: draft.ux.screens,
      navigationStyle: draft.ux.navigationStyle || undefined
    },
    brand: draft.brand.assets ? { assets: draft.brand.assets } : undefined
  };

  if (mode === "existing_upgrade" || mode === "ui_overhaul" || mode === "refactor_hardening" || mode === "add_feature_module") {
    request.upgrade = {
      mustNotBreak: draft.upgrade.mustNotBreak,
      validationCommands: draft.upgrade.validationCommands
    };
  }

  if (mode === "refactor_hardening") {
    request.hardening = {
      targets: draft.hardening.targets,
      tests: draft.hardening.tests || undefined
    };
  }

  if (mode === "ui_overhaul") {
    request.ui = {
      goal: draft.ui.goal || draft.ux.goal || undefined,
      components: draft.ui.components.length > 0 ? draft.ui.components : (draft.ux.components || []),
      designSystem: draft.ui.designSystem || draft.ux.designSystem || undefined
    };
  }

  if (mode === "add_feature_module") {
    request.module = {
      name: draft.module.name || undefined,
      description: draft.module.description || undefined,
      dataModels: draft.module.dataModels,
      endpoints: draft.module.endpoints
    };
  }

  if (category === "library") {
    request.library = {
      packageName: draft.library.packageName || undefined,
      purpose: draft.library.purpose || undefined,
      exports: draft.library.exports,
      targets: draft.library.targets,
      moduleFormat: draft.library.moduleFormat || undefined
    };
  }

  if (category === "automation") {
    request.automation = {
      triggers: draft.automation.triggers,
      actions: draft.automation.actions,
      integrations: draft.automation.integrations,
      idempotency: draft.automation.idempotency || undefined
    };
  }

  if (category === "game") {
    request.game = {
      engine: draft.game.engine || undefined,
      platform: draft.game.platform,
      coreLoop: draft.game.coreLoop || undefined,
      monetization: draft.game.monetization || undefined
    };
  }

  return request;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateDraftForMode(draft: WizardDraft, mode: Mode): ValidationResult {
  const errors: string[] = [];

  if (!draft.project.name.trim()) {
    errors.push("Project name is required");
  }

  if (!draft.project.oneLiner.trim() && !draft.intent.summary.trim()) {
    errors.push("Project description is required");
  }

  if (mode === "existing_upgrade" || mode === "ui_overhaul" || mode === "refactor_hardening" || mode === "add_feature_module") {
    if (!draft.projectPackage.id) {
      errors.push("Project ZIP upload is required for this mode");
    }
  }

  if (mode === "refactor_hardening") {
    if (draft.hardening.targets.length === 0) {
      errors.push("At least one hardening target is required");
    }
  }

  if (mode === "ui_overhaul") {
    if (!draft.ui.goal && !draft.ux.goal) {
      errors.push("UI overhaul goal is required");
    }
  }

  if (mode === "add_feature_module") {
    if (!draft.module.name?.trim()) {
      errors.push("Feature module name is required");
    }
    if (!draft.module.description?.trim()) {
      errors.push("Feature module description is required");
    }
  }

  return { valid: errors.length === 0, errors };
}

export function setNestedValue(obj: Record<string, any>, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

export function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}
