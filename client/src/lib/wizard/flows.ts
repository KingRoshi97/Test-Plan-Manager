export type Category = "web" | "mobile" | "api" | "library" | "automation" | "game";
export type Mode =
  | "new_build"
  | "existing_upgrade"
  | "ui_overhaul"
  | "refactor_hardening"
  | "add_feature_module";

export type FieldUI =
  | "text"
  | "textarea"
  | "select"
  | "toggle"
  | "chips"
  | "list"
  | "file_docs"
  | "file_zip";

export type DependsOn = { key: string; equals: any };

export type FieldSpec = {
  key: string;
  label: string;
  ui: FieldUI;
  required?: boolean;
  placeholder?: string;
  help?: string;
  examples?: string[];
  options?: string[];
  dependsOn?: DependsOn;
};

export type FieldGroup = {
  id: string;
  title?: string;
  description?: string;
  fields: FieldSpec[];
};

export type WizardStep = {
  id: string;
  title: string;
  description?: string;
  required?: boolean;
  fieldGroups: FieldGroup[];
};

export type WizardFlow = {
  id: string;
  label: string;
  category: Category;
  steps: WizardStep[];
};

const F = {
  projectName: (): FieldSpec => ({
    key: "project.name",
    label: "Project name",
    ui: "text",
    required: true,
    placeholder: "e.g., Axiom CRM",
    help: "A short name you'd put on a dashboard.",
    examples: ["Stand Tall Boxing App", "Local Events Finder", "Invoice Tracker"]
  }),

  oneLiner: (): FieldSpec => ({
    key: "project.oneLiner",
    label: "One-line description",
    ui: "textarea",
    required: true,
    placeholder: "What is it and who is it for?",
    help: "Explain the project in one sentence: who it helps + what it does.",
    examples: [
      "A web app for freelancers to send invoices and get paid faster.",
      "A mobile app for members to book classes and manage subscriptions."
    ]
  }),

  audience: (): FieldSpec => ({
    key: "project.audience",
    label: "Who is this for?",
    ui: "text",
    required: false,
    placeholder: "e.g., small business owners, students, gamers",
    help: "Optional. Helps us make better UX and copy.",
    examples: ["Commercial contractors", "Fitness members", "Indie music fans"]
  }),

  success: (): FieldSpec => ({
    key: "project.success",
    label: "What does success look like?",
    ui: "textarea",
    required: false,
    placeholder: "How will you know this worked?",
    help: "Optional. This guides priorities and tradeoffs.",
    examples: ["Users can sign up, create 1 invoice, and pay it within 5 minutes."]
  }),

  docsUpload: (): FieldSpec => ({
    key: "uploads.docUploadIds",
    label: "Upload docs (optional)",
    ui: "file_docs",
    required: false,
    help: "Upload PDFs/Docs/notes. We'll use them for context."
  }),

  zipUpload: (): FieldSpec => ({
    key: "projectPackage.id",
    label: "Upload existing project ZIP",
    ui: "file_zip",
    required: false,
    help: "Upload a ZIP of your project. We'll scan it (framework/scripts/deps) and use it to create upgrade plans."
  }),

  intent: (): FieldSpec => ({
    key: "intent.summary",
    label: "In plain English, what do you want done?",
    ui: "textarea",
    required: true,
    placeholder: "Describe what you want the tool/agent to build or change.",
    help: "This is the main instruction. Be direct and specific.",
    examples: [
      "Build a clean onboarding flow, a dashboard, and a billing page. Keep it simple and fast.",
      "Upgrade my existing project UI to match the brand kit and fix the API error handling."
    ]
  }),

  goals: (): FieldSpec => ({
    key: "intent.goals",
    label: "Goals (what must be achieved)",
    ui: "list",
    required: false,
    help: "Add 3-7 bullet goals. Each should be measurable.",
    examples: [
      "Users can register/login",
      "Admin can create items",
      "Add dark mode and consistent spacing"
    ]
  }),

  constraints: (): FieldSpec => ({
    key: "intent.constraints",
    label: "Constraints (what must NOT change or must be respected)",
    ui: "list",
    required: false,
    help: "Add anything you want to preserve (routes, naming, design rules, etc).",
    examples: ["Do not rename API routes", "Keep existing navigation contracts", "No breaking schema changes"]
  }),

  doNotTouch: (): FieldSpec => ({
    key: "intent.doNotTouch",
    label: "Do-not-touch paths (optional)",
    ui: "list",
    required: false,
    help: "File/folder globs the agent should avoid editing.",
    examples: ["src/navigation/**", "docs/**", "server/migrations/**"]
  }),

  roles: (): FieldSpec => ({
    key: "users.roles",
    label: "User roles",
    ui: "list",
    required: false,
    help: "List the main user types (e.g., Visitor, Member, Admin).",
    examples: ["Visitor", "Member", "Admin"]
  }),

  roleGoals: (): FieldSpec => ({
    key: "users.roleGoals",
    label: "What must each role be able to do?",
    ui: "textarea",
    required: false,
    help: "Write a short paragraph describing role abilities.",
    examples: ["Members can browse content, save favorites, and comment. Admins can moderate and manage content."]
  }),

  featuresP0: (): FieldSpec => ({
    key: "features.p0",
    label: "P0 features (must-have for MVP)",
    ui: "list",
    required: true,
    help: "The minimum set needed to ship.",
    examples: ["Auth (login/register)", "Dashboard", "Create + list items", "Basic settings"]
  }),

  featuresP1: (): FieldSpec => ({
    key: "features.p1",
    label: "P1 features (nice-to-have soon)",
    ui: "list",
    required: false,
    examples: ["Search", "Notifications", "Export"]
  }),

  featuresP2: (): FieldSpec => ({
    key: "features.p2",
    label: "P2 features (later)",
    ui: "list",
    required: false,
    examples: ["AI recommendations", "Advanced analytics"]
  }),

  screens: (): FieldSpec => ({
    key: "ux.screens",
    label: "Screens / pages",
    ui: "list",
    required: false,
    help: "List the main screens the user will navigate through.",
    examples: ["Login", "Onboarding", "Home", "Detail", "Settings", "Admin"]
  }),

  navStyle: (): FieldSpec => ({
    key: "ux.navigationStyle",
    label: "Navigation style",
    ui: "select",
    required: false,
    options: ["Sidebar", "Top nav", "Tabs (mobile)", "Drawer", "Single-page"],
    help: "Pick the general navigation pattern."
  }),

  brandLink: (): FieldSpec => ({
    key: "brand.assets",
    label: "Brand assets (optional)",
    ui: "textarea",
    required: false,
    help: "Describe your logo/colors or paste design notes.",
    examples: ["Dark-first, glass panels, teal/orange gradient CTAs, rounded cards, big typography."]
  }),

  techFrontend: (): FieldSpec => ({
    key: "tech.frontend",
    label: "Frontend preference (optional)",
    ui: "select",
    required: false,
    options: ["No preference", "React", "Next.js", "Vue", "Svelte", "React Native", "Unity", "Godot"],
    help: "If you don't know, leave it."
  }),

  techBackend: (): FieldSpec => ({
    key: "tech.backend",
    label: "Backend preference (optional)",
    ui: "select",
    required: false,
    options: ["No preference", "Express", "Fastify", "NestJS", "Django", "Rails", "Serverless"],
    help: "If you don't know, leave it."
  }),

  techDatabase: (): FieldSpec => ({
    key: "tech.database",
    label: "Database preference (optional)",
    ui: "select",
    required: false,
    options: ["No preference", "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Firebase"],
    help: "If you don't know, leave it."
  }),

  regressionMustNotBreak: (): FieldSpec => ({
    key: "upgrade.mustNotBreak",
    label: "What must NOT break?",
    ui: "list",
    required: false,
    help: "List behaviors that must stay working after changes.",
    examples: ["Login flow", "Checkout flow", "Navigation back behavior", "Existing API contract"]
  }),

  validationCommands: (): FieldSpec => ({
    key: "upgrade.validationCommands",
    label: "Validation commands to run (optional)",
    ui: "list",
    required: false,
    help: "If you know them, list commands that should pass.",
    examples: ["npm run build", "npm test", "npm run lint"]
  }),

  hardeningTargets: (): FieldSpec => ({
    key: "hardening.targets",
    label: "Hardening targets",
    ui: "list",
    required: false,
    help: "What should improve?",
    examples: ["Reduce crashes", "Improve API error handling", "Add rate limiting", "Improve performance"]
  }),

  testExpectations: (): FieldSpec => ({
    key: "hardening.tests",
    label: "Testing expectations",
    ui: "select",
    required: false,
    options: ["No tests needed", "Smoke tests only", "Add basic unit tests", "Add unit + integration tests"],
    help: "If you're not sure, choose 'Smoke tests only'."
  }),

  packageName: (): FieldSpec => ({
    key: "library.packageName",
    label: "NPM package name",
    ui: "text",
    required: true,
    placeholder: "@your-scope/package-name",
    help: "Name as it will appear on npm."
  }),

  packagePurpose: (): FieldSpec => ({
    key: "library.purpose",
    label: "What does this package do?",
    ui: "textarea",
    required: true,
    placeholder: "Explain the problem it solves.",
    examples: ["A typed client SDK for my API", "A UI component library", "A CLI for project scaffolding"]
  }),

  exportsList: (): FieldSpec => ({
    key: "library.exports",
    label: "Exports (public API)",
    ui: "list",
    required: true,
    help: "List the main functions/classes/types you want to export.",
    examples: ["createClient()", "AuthSession", "signRequest()"]
  }),

  compatibilityTargets: (): FieldSpec => ({
    key: "library.targets",
    label: "Compatibility targets",
    ui: "chips",
    required: false,
    options: ["Node 18+", "Node 20+", "Browser", "Bundlers", "Deno", "React Native"],
    help: "Choose the environments that must work."
  }),

  moduleFormat: (): FieldSpec => ({
    key: "library.moduleFormat",
    label: "Module format",
    ui: "select",
    required: false,
    options: ["ESM only", "CJS only", "Dual (ESM + CJS)"],
    help: "If unsure, choose ESM only."
  }),

  triggers: (): FieldSpec => ({
    key: "automation.triggers",
    label: "Triggers",
    ui: "list",
    required: true,
    help: "What starts the workflow?",
    examples: ["New signup", "Stripe payment succeeded", "Daily schedule", "Webhook received"]
  }),

  actions: (): FieldSpec => ({
    key: "automation.actions",
    label: "Actions",
    ui: "list",
    required: true,
    help: "What happens after trigger?",
    examples: ["Send email", "Create CRM contact", "Post to Slack", "Update database row"]
  }),

  integrations: (): FieldSpec => ({
    key: "automation.integrations",
    label: "Integrations",
    ui: "chips",
    required: false,
    options: ["Stripe", "Slack", "HubSpot", "Google Sheets", "Airtable", "Discord", "Shopify", "Webhook"],
    help: "Pick what you need to connect to."
  }),

  idempotency: (): FieldSpec => ({
    key: "automation.idempotency",
    label: "How should duplicates be handled?",
    ui: "select",
    required: false,
    options: ["Not sure", "Ignore duplicates", "Upsert by key", "Queue + dedupe window"],
    help: "If unsure, choose 'Upsert by key'."
  }),

  engine: (): FieldSpec => ({
    key: "game.engine",
    label: "Game engine / framework",
    ui: "select",
    required: true,
    options: ["No preference", "Unity", "Unreal", "Godot", "Phaser", "Three.js", "Custom"],
    help: "If you're not sure, choose 'No preference'."
  }),

  platform: (): FieldSpec => ({
    key: "game.platform",
    label: "Target platform",
    ui: "chips",
    required: true,
    options: ["Web", "iOS", "Android", "PC", "Console"],
    help: "Choose one or more."
  }),

  coreLoop: (): FieldSpec => ({
    key: "game.coreLoop",
    label: "Core loop",
    ui: "textarea",
    required: true,
    placeholder: "What does the player do every 30 seconds?",
    help: "The repeating action cycle (engage, challenge, reward).",
    examples: [
      "Explore dungeon, fight enemies, collect loot, upgrade gear",
      "Match tiles, earn points, unlock levels",
      "Build structures, gather resources, defend base"
    ]
  }),

  monetization: (): FieldSpec => ({
    key: "game.monetization",
    label: "Monetization model",
    ui: "select",
    required: false,
    options: ["Free (no monetization)", "Premium (one-time purchase)", "Freemium (IAP)", "Ads", "Subscription"],
    help: "How will the game make money?"
  }),

  moduleName: (): FieldSpec => ({
    key: "module.name",
    label: "Feature module name",
    ui: "text",
    required: true,
    placeholder: "e.g., Analytics Dashboard, Notifications, Export",
    help: "What is this new module called?"
  }),

  moduleDescription: (): FieldSpec => ({
    key: "module.description",
    label: "What does this module do?",
    ui: "textarea",
    required: true,
    placeholder: "Describe the functionality this module adds",
    help: "Be specific about what users can do with this module.",
    examples: [
      "Adds a dashboard page showing usage analytics with charts and filters",
      "Implements push notifications for mobile apps with customizable preferences"
    ]
  }),

  moduleDataModels: (): FieldSpec => ({
    key: "module.dataModels",
    label: "Data models needed",
    ui: "list",
    required: false,
    help: "Any new database tables or entities?",
    examples: ["AnalyticsEvent", "NotificationPreference", "ExportJob"]
  }),

  moduleEndpoints: (): FieldSpec => ({
    key: "module.endpoints",
    label: "API endpoints needed",
    ui: "list",
    required: false,
    help: "Any new API routes?",
    examples: ["GET /api/analytics", "POST /api/notifications/send", "GET /api/exports/:id"]
  }),

  uiGoal: (): FieldSpec => ({
    key: "ui.goal",
    label: "UI overhaul goal",
    ui: "textarea",
    required: true,
    placeholder: "What should the new UI look like?",
    help: "Describe the visual/UX transformation you want.",
    examples: [
      "Modernize with a dark theme, clean spacing, and glassmorphic cards",
      "Simplify navigation to 3 main sections with prominent search"
    ]
  }),

  uiComponents: (): FieldSpec => ({
    key: "ui.components",
    label: "Components to redesign",
    ui: "list",
    required: false,
    help: "Which components need the most attention?",
    examples: ["Navigation bar", "Cards", "Forms", "Modals", "Tables"]
  }),

  uiDesignSystem: (): FieldSpec => ({
    key: "ui.designSystem",
    label: "Design system reference",
    ui: "text",
    required: false,
    placeholder: "e.g., Tailwind, Material Design, shadcn/ui",
    help: "What design system should we follow or extend?"
  })
};

const STEP_BASICS: WizardStep = {
  id: "basics",
  title: "Basics",
  description: "Tell us about your project",
  required: true,
  fieldGroups: [
    {
      id: "project-info",
      fields: [F.projectName(), F.oneLiner(), F.audience(), F.success()]
    },
    {
      id: "uploads",
      title: "Reference Documents",
      description: "Optional docs for additional context",
      fields: [F.docsUpload()]
    }
  ]
};

const STEP_INTENT: WizardStep = {
  id: "intent",
  title: "Intent",
  description: "What do you want to build or change?",
  required: true,
  fieldGroups: [
    {
      id: "main-intent",
      fields: [F.intent(), F.goals(), F.constraints()]
    }
  ]
};

const STEP_FEATURES: WizardStep = {
  id: "features",
  title: "Features",
  description: "Define the features your project needs",
  fieldGroups: [
    {
      id: "feature-list",
      fields: [F.featuresP0(), F.featuresP1(), F.featuresP2()]
    }
  ]
};

const STEP_USERS: WizardStep = {
  id: "users",
  title: "Users",
  description: "Who will use this?",
  fieldGroups: [
    {
      id: "user-roles",
      fields: [F.roles(), F.roleGoals()]
    }
  ]
};

const STEP_UX: WizardStep = {
  id: "ux",
  title: "UX & Screens",
  description: "Define navigation and screens",
  fieldGroups: [
    {
      id: "ux-details",
      fields: [F.screens(), F.navStyle(), F.brandLink()]
    }
  ]
};

const STEP_TECH: WizardStep = {
  id: "tech",
  title: "Tech Stack",
  description: "Optional technology preferences",
  fieldGroups: [
    {
      id: "tech-prefs",
      fields: [F.techFrontend(), F.techBackend(), F.techDatabase()]
    }
  ]
};

const STEP_ZIP_UPLOAD: WizardStep = {
  id: "upload",
  title: "Upload Project",
  description: "Upload your existing project ZIP",
  required: true,
  fieldGroups: [
    {
      id: "zip-upload",
      fields: [{ ...F.zipUpload(), required: true }]
    }
  ]
};

const STEP_UPGRADE: WizardStep = {
  id: "upgrade",
  title: "Upgrade Plan",
  description: "What to change and what to preserve",
  fieldGroups: [
    {
      id: "upgrade-details",
      fields: [F.goals(), F.constraints(), F.doNotTouch(), F.regressionMustNotBreak(), F.validationCommands()]
    }
  ]
};

const STEP_HARDENING: WizardStep = {
  id: "hardening",
  title: "Hardening",
  description: "Security and reliability improvements",
  required: true,
  fieldGroups: [
    {
      id: "hardening-details",
      fields: [
        { ...F.hardeningTargets(), required: true },
        { ...F.testExpectations(), required: true }
      ]
    }
  ]
};

const STEP_UI_OVERHAUL: WizardStep = {
  id: "ui-overhaul",
  title: "UI Goals",
  description: "Define your visual transformation",
  required: true,
  fieldGroups: [
    {
      id: "ui-details",
      fields: [
        { ...F.uiGoal(), required: true },
        F.uiComponents(),
        F.uiDesignSystem(),
        F.brandLink()
      ]
    }
  ]
};

const STEP_MODULE: WizardStep = {
  id: "module",
  title: "Feature Module",
  description: "Define the new module to add",
  required: true,
  fieldGroups: [
    {
      id: "module-details",
      fields: [
        { ...F.moduleName(), required: true },
        { ...F.moduleDescription(), required: true },
        F.moduleDataModels(),
        F.moduleEndpoints()
      ]
    }
  ]
};

const STEP_LIBRARY: WizardStep = {
  id: "library",
  title: "Package Details",
  description: "Define your library/package",
  required: true,
  fieldGroups: [
    {
      id: "package-info",
      fields: [
        F.packageName(),
        F.packagePurpose(),
        F.exportsList(),
        F.compatibilityTargets(),
        F.moduleFormat()
      ]
    }
  ]
};

const STEP_AUTOMATION: WizardStep = {
  id: "automation",
  title: "Workflow Details",
  description: "Define triggers, actions, and integrations",
  required: true,
  fieldGroups: [
    {
      id: "automation-info",
      fields: [
        F.triggers(),
        F.actions(),
        F.integrations(),
        F.idempotency()
      ]
    }
  ]
};

const STEP_GAME: WizardStep = {
  id: "game",
  title: "Game Details",
  description: "Define engine, platform, and core loop",
  required: true,
  fieldGroups: [
    {
      id: "game-info",
      fields: [
        F.engine(),
        F.platform(),
        F.coreLoop(),
        F.monetization()
      ]
    }
  ]
};

const STEP_REVIEW: WizardStep = {
  id: "review",
  title: "Review",
  description: "Verify your input before generating",
  fieldGroups: []
};

const BASE_FLOWS: Record<Category, WizardFlow> = {
  web: {
    id: "flow.web",
    label: "Web Application",
    category: "web",
    steps: [STEP_BASICS, STEP_INTENT, STEP_FEATURES, STEP_USERS, STEP_UX, STEP_TECH, STEP_REVIEW]
  },
  mobile: {
    id: "flow.mobile",
    label: "Mobile Application",
    category: "mobile",
    steps: [STEP_BASICS, STEP_INTENT, STEP_FEATURES, STEP_USERS, STEP_UX, STEP_TECH, STEP_REVIEW]
  },
  api: {
    id: "flow.api",
    label: "API / Backend",
    category: "api",
    steps: [STEP_BASICS, STEP_INTENT, STEP_FEATURES, STEP_TECH, STEP_REVIEW]
  },
  library: {
    id: "flow.library",
    label: "Library / Package",
    category: "library",
    steps: [STEP_BASICS, STEP_LIBRARY, STEP_TECH, STEP_REVIEW]
  },
  automation: {
    id: "flow.automation",
    label: "Automation / Workflow",
    category: "automation",
    steps: [STEP_BASICS, STEP_AUTOMATION, STEP_TECH, STEP_REVIEW]
  },
  game: {
    id: "flow.game",
    label: "Game / Interactive",
    category: "game",
    steps: [STEP_BASICS, STEP_GAME, STEP_FEATURES, STEP_REVIEW]
  }
};

function cloneStep(step: WizardStep): WizardStep {
  return {
    ...step,
    fieldGroups: step.fieldGroups.map(g => ({
      ...g,
      fields: g.fields.map(f => ({ ...f }))
    }))
  };
}

function cloneFlow(flow: WizardFlow): WizardFlow {
  return {
    ...flow,
    steps: flow.steps.map(cloneStep)
  };
}

export function applyModeToFlow(baseFlow: WizardFlow, mode: Mode): WizardFlow {
  const flow = cloneFlow(baseFlow);

  switch (mode) {
    case "existing_upgrade":
      flow.steps = [STEP_BASICS, STEP_ZIP_UPLOAD, STEP_UPGRADE, STEP_TECH, STEP_REVIEW];
      break;

    case "ui_overhaul":
      flow.steps = [STEP_BASICS, STEP_ZIP_UPLOAD, STEP_UI_OVERHAUL, STEP_REVIEW];
      break;

    case "refactor_hardening":
      flow.steps = [STEP_BASICS, STEP_ZIP_UPLOAD, STEP_HARDENING, STEP_REVIEW];
      break;

    case "add_feature_module":
      flow.steps = [STEP_BASICS, STEP_ZIP_UPLOAD, STEP_MODULE, STEP_TECH, STEP_REVIEW];
      break;

    case "new_build":
    default:
      break;
  }

  return flow;
}

export function getFlow(category: Category, mode: Mode): WizardFlow {
  const baseFlow = BASE_FLOWS[category];
  return applyModeToFlow(baseFlow, mode);
}

export function getStepFields(step: WizardStep): FieldSpec[] {
  return step.fieldGroups.flatMap(g => g.fields);
}

export function getRequiredFields(flow: WizardFlow): FieldSpec[] {
  return flow.steps.flatMap(getStepFields).filter(f => f.required);
}

export function validateStep(draft: Record<string, any>, step: WizardStep): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const fields = getStepFields(step);

  for (const field of fields) {
    if (!field.required) continue;

    if (field.dependsOn) {
      const depValue = getNestedValue(draft, field.dependsOn.key);
      if (depValue !== field.dependsOn.equals) continue;
    }

    const value = getNestedValue(draft, field.key);
    if (isEmpty(value)) {
      errors.push(`${field.label} is required`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export { F, BASE_FLOWS };
