import * as path from "path";
import type {
  KitContext, DocFile, BuildSlice, BuildFileTarget,
} from "./types.js";

export const COMPLEX_ROLES = new Set([
  "feature_page", "auth_page", "app_entry", "layout_component",
  "feature_form", "feature_list", "feature_detail", "settings_page",
  "route_handler", "service_module", "middleware_handler",
  "entity_repository", "acceptance_test", "integration_test",
  "event_handler", "feature_card", "e2e_test", "feature_store",
  "entity_validator", "entity_mapper", "auth_policy",
  "contract_test", "test_mock", "api_binding", "audit_hook",
]);

export function normalizeHex(hex: string): string | null {
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) return hex.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`.toLowerCase();
  if (/^#[0-9a-fA-F]{8}$/.test(hex)) return hex.slice(0, 7).toLowerCase();
  return null;
}

export function extractBrandColors(ctx: KitContext): Record<string, string> | null {
  let raw: Record<string, string> | null = null;

  if (ctx.normalizedDesign?.brand_colors && typeof ctx.normalizedDesign.brand_colors === "object") {
    const src = ctx.normalizedDesign.brand_colors as Record<string, string>;
    if (Object.keys(src).length > 0) raw = src;
  }

  if (!raw && ctx.designIdentity) {
    const parsed: Record<string, string> = {};
    const hexPattern = /\|\s*(\w+)\s*\|\s*`(#[0-9a-fA-F]{3,8})`/g;
    let m;
    while ((m = hexPattern.exec(ctx.designIdentity)) !== null) {
      parsed[m[1]] = m[2];
    }
    if (Object.keys(parsed).length > 0) raw = parsed;
  }

  if (!raw) return null;

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    const hex = normalizeHex(String(value));
    if (hex) normalized[key] = hex;
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

export function extractDesignPreset(ctx: KitContext): string | null {
  if (ctx.normalizedDesign?.visual_preset) return String(ctx.normalizedDesign.visual_preset);
  if (ctx.designIdentity) {
    const m = ctx.designIdentity.match(/## Visual Preset\s*\n+\*\*Preset\*\*:\s*`?(\w+)`?/);
    if (m) return m[1];
  }
  return null;
}

export function extractNavPattern(ctx: KitContext): string | null {
  if (ctx.normalizedDesign?.navigation_pref) return String(ctx.normalizedDesign.navigation_pref);
  if (ctx.designIdentity) {
    const m = ctx.designIdentity.match(/## Navigation Pattern\s*\n+\*\*Pattern\*\*:\s*`?(\w+)`?/);
    if (m) return m[1];
  }
  return null;
}

export function extractProjectOverview(ctx: KitContext): string | null {
  if (ctx.buildBrief) {
    const m = ctx.buildBrief.match(/## What This App Does\s*\n+([\s\S]*?)(?=\n##|\n---|\n$)/);
    if (m) return m[1].trim().split("\n").slice(0, 3).join(" ").slice(0, 300);
  }
  if (ctx.normalizedIntent?.primary_goals) {
    const goals = ctx.normalizedIntent.primary_goals;
    if (Array.isArray(goals)) return goals.slice(0, 3).join(". ");
    if (typeof goals === "string") return goals.slice(0, 300);
  }
  return null;
}

export function buildDesignDirective(ctx: KitContext): string {
  const parts: string[] = [];
  const colors = extractBrandColors(ctx);
  const preset = extractDesignPreset(ctx);
  const navPattern = extractNavPattern(ctx);

  if (!colors && !preset && !navPattern) return "";

  parts.push("\nDESIGN DIRECTION (apply to all generated UI):");

  if (colors) {
    const colorLines = Object.entries(colors).map(([role, hex]) => `  ${role}: ${hex}`).join("\n");
    parts.push(`Brand Colors:\n${colorLines}`);
    if (colors.primary) {
      parts.push("Use these brand colors via Tailwind classes: bg-primary-600, text-primary-700, ring-primary-500, etc.");
      parts.push("Do NOT default to generic blue (#3b82f6) or Tailwind blue-* classes. Use the primary-* palette defined in tailwind.config.ts.");
    }
    if (colors.secondary) parts.push("Secondary palette available: bg-secondary-600, text-secondary-700, etc.");
    if (colors.accent) parts.push("Accent palette available: bg-accent-500, text-accent-600, etc.");
  }

  if (preset) {
    const presetMap: Record<string, string> = {
      professional: "Clean lines, 4px inputs/8px cards radius, subtle shadows, 150-200ms transitions, system/Inter font",
      playful: "Rounded 12px buttons/16px cards, bouncy 300ms transitions, generous whitespace, Nunito/Poppins font",
      minimalist: "Sharp edges (0-2px radius), minimal decoration, tight spacing, 100ms fade only, monospace accents",
      bold: "High contrast, 8px standard/24px hero radius, confident 250ms transitions, heavy headings (700-900)",
      elegant: "Subtle 6px curves, generous margins, refined serif/sans-serif, 200ms ease transitions, muted palette",
      modern: "8px radius, clean shadows, 200ms transitions, 14px Inter/system font, balanced whitespace",
      corporate: "4px radius, structured grid, minimal animation, 14px system font, neutral grays",
    };
    const style = presetMap[preset.toLowerCase()] ?? `Apply "${preset}" visual style consistently`;
    parts.push(`Visual Preset: ${preset} — ${style}`);
  }

  if (navPattern) {
    const navMap: Record<string, string> = {
      sidebar: "Fixed left sidebar (240px expanded, 64px collapsed), logo top, nav items with icons, user at bottom",
      topnav: "Horizontal top bar (56-64px), logo left, nav centered/left, user right, hamburger on mobile",
      tabs: "Tab-based content switching, top-aligned, max 5-7 tabs, icons+labels",
      bottom_nav: "Bottom bar (56px) on mobile with 3-5 destinations, convert to sidebar on desktop",
      hybrid: "Sidebar (240px) for sections + top bar (56px) for global actions/search/user",
    };
    const navKey = navPattern.toLowerCase().replace(/[\s-]/g, "_");
    const navStyle = navMap[navKey] ?? `Use "${navPattern}" navigation pattern`;
    parts.push(`Navigation: ${navStyle}`);
  }

  return parts.join("\n");
}

export function buildFrozenSystemPrompt(ctx: KitContext): string {
  const lang = ctx.stackProfile.language === "typescript" ? "TypeScript" : "JavaScript";
  const framework = ctx.stackProfile.framework;

  const availablePackages = [
    "react", "react-dom", "react-router-dom",
    "zod", "@tanstack/react-query", "clsx",
    "axios", "lucide-react", "date-fns", "react-hook-form",
  ];
  if (ctx.stackProfile.cssFramework?.includes("tailwind")) availablePackages.push("tailwindcss");

  const overview = extractProjectOverview(ctx);
  let projectIdentity = `Project: ${ctx.projectName}`;
  if (overview) projectIdentity += `\nOverview: ${overview}`;

  return `You are a code generator for the Axion Build System. You generate production-quality ${lang} code for a ${framework} application.

${projectIdentity}

CRITICAL RULES:
- Generate ONLY raw file content. No markdown fences. No explanations.
- Stack: ${framework}, ${lang}, ${ctx.stackProfile.runtime}
- Use provided API contracts, data models, and specs as source of truth
- Do NOT invent features, routes, or entities not in the spec
- ONLY import from AVAILABLE PACKAGES below
- All page/component files use default exports
- Use clean, idiomatic code with proper error handling
- BrowserRouter is in src/main.tsx. Do NOT import or use BrowserRouter in any component.
- Missing info placeholder: "// TODO: [AXION] Requires spec clarification"

AVAILABLE PACKAGES: ${availablePackages.join(", ")}

AUTH: AuthProvider & useAuthContext from src/lib/auth, ProtectedRoute from src/lib/auth/ProtectedRoute
VALIDATION: zod for schemas (import { z } from "zod")`;
}

export function buildFileManifest(ctx: KitContext, slice: BuildSlice): string {
  const lines: string[] = [];
  for (const page of ctx.allPages) {
    lines.push(`- ${page.path} (${page.role}) → default export: ${page.name}`);
  }
  for (const f of slice.files) {
    if (!lines.some(l => l.includes(f.relativePath))) {
      lines.push(`- ${f.relativePath} (${f.role})`);
    }
  }
  const infraFiles = [
    "src/main.tsx (entry_point — wraps App in BrowserRouter)",
    "src/App.tsx (app_entry — Routes only, NO Router)",
    "src/styles/globals.css (styles)",
    "src/lib/api/client.ts (api_client)",
    "src/lib/api/endpoints.ts (api_endpoints)",
    "src/lib/api/interceptors.ts (api_interceptor)",
    "src/lib/auth/context.tsx (auth_context)",
    "src/lib/auth/ProtectedRoute.tsx (route_guard)",
    "src/lib/auth/useAuth.ts (auth_hook)",
    "src/lib/validators/index.ts (validation)",
    "src/lib/store/index.ts (state_store)",
    "src/lib/utils/index.ts (utilities)",
    "src/components/ui/LoadingSpinner.tsx (ui_component)",
    "src/components/ui/ErrorBoundary.tsx (error_boundary)",
    "src/components/ui/EmptyState.tsx (ui_component)",
    "src/components/ui/Pagination.tsx (ui_component)",
  ];
  for (const inf of infraFiles) {
    const p = inf.split(" (")[0];
    if (!lines.some(l => l.includes(p))) {
      lines.push(`- ${inf}`);
    }
  }
  return lines.join("\n");
}

export function buildSystemPrompt(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget): string {
  const lang = ctx.stackProfile.language === "typescript" ? "TypeScript" : "JavaScript";
  const framework = ctx.stackProfile.framework;

  const uiComponents = [
    "LoadingSpinner (src/components/ui/LoadingSpinner)",
    "ErrorBoundary (src/components/ui/ErrorBoundary)",
    "EmptyState (src/components/ui/EmptyState)",
    "Pagination (src/components/ui/Pagination)",
  ];
  const availablePackages = [
    "react", "react-dom", "react-router-dom",
    "zod", "@tanstack/react-query", "clsx",
    "axios", "lucide-react", "date-fns", "react-hook-form",
  ];
  if (ctx.stackProfile.cssFramework?.includes("tailwind")) availablePackages.push("tailwindcss");

  const fileManifest = buildFileManifest(ctx, slice);
  const overview = extractProjectOverview(ctx);
  const designDirective = buildDesignDirective(ctx);

  let projectIdentity = `Project: ${ctx.projectName}`;
  if (overview) projectIdentity += `\nOverview: ${overview}`;

  return `You are a code generator for the Axion Build System. You generate production-quality ${lang} code for a ${framework} application.

${projectIdentity}
${designDirective}

CRITICAL RULES:
- Generate ONLY the raw file content. NEVER wrap output in markdown code fences (\`\`\`). No explanations.
- Follow the project's stack: ${framework}, ${lang}, ${ctx.stackProfile.runtime}
- Use the provided API contracts, data models, and specs as the source of truth
- Do NOT invent features, routes, or entities not in the spec
- ONLY import packages from the AVAILABLE PACKAGES list below. Do NOT use any package not in this list.
- When importing project files, use ONLY paths from the FILE MANIFEST below. Do not guess or invent import paths.
- All page and component files use default exports. Import them as: import ComponentName from "./path"
- Use clean, idiomatic code with proper error handling
- Include necessary imports
- IMPORTANT: BrowserRouter is already configured in src/main.tsx. Do NOT import or use BrowserRouter, HashRouter, or MemoryRouter in any component. App.tsx should only use <Routes> and <Route>.
- If information is missing, use a clear placeholder: "// TODO: [AXION] Requires spec clarification"

AVAILABLE PACKAGES (ONLY use these — do not import anything else):
${availablePackages.join(", ")}

AVAILABLE UI COMPONENTS (import from these paths):
${uiComponents.map(c => `- ${c}`).join("\n")}

AUTH INFRASTRUCTURE (when applicable):
- AuthProvider & useAuthContext from src/lib/auth
- ProtectedRoute from src/lib/auth/ProtectedRoute
- useAuth hook from src/lib/auth/useAuth

VALIDATION:
- Use zod for schema validation (import { z } from "zod")
- Per-feature validators in src/lib/validators/

FILE MANIFEST (all files in this project — use these exact paths for imports):
${fileManifest}

File: ${file.relativePath}
Role: ${file.role}`;
}

export function joinDocs(docs: DocFile[], maxChars: number): string {
  let result = "";
  for (const doc of docs) {
    const entry = `### ${doc.name}\n${doc.content}\n\n---\n\n`;
    if (result.length + entry.length > maxChars) {
      const remaining = maxChars - result.length;
      if (remaining > 200) result += entry.slice(0, remaining) + "\n[truncated]";
      break;
    }
    result += entry;
  }
  return result;
}

export function findRelevantDocs(docs: DocFile[], searchTerms: string[], maxChars: number): string {
  const scored = docs.map(doc => {
    const lower = (doc.name + " " + doc.content.slice(0, 500)).toLowerCase();
    let score = 0;
    for (const term of searchTerms) {
      if (lower.includes(term.toLowerCase())) score += 1;
    }
    return { doc, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const relevant = scored.filter(s => s.score > 0).map(s => s.doc);
  if (relevant.length === 0) return joinDocs(docs.slice(0, 5), maxChars);
  return joinDocs(relevant, maxChars);
}

export function buildUserPrompt(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget): string {
  const parts: string[] = [];
  const role = file.role;

  parts.push(`Generate the file: ${file.relativePath}`);
  parts.push(`Role: ${role}`);
  parts.push(`Slice: ${slice.name}`);

  if (file.sourceRef) {
    parts.push(`Source reference: ${file.sourceRef}`);
  }

  if (file.traceRef) {
    parts.push(`Requirement trace: ${file.traceRef}`);
    const traceFeature = ctx.features.find(f => f.feature_id === file.traceRef);
    if (traceFeature) {
      parts.push(`Traced requirement: ${traceFeature.name} — ${traceFeature.description}`);
    }
  }

  parts.push("\n--- PROJECT CONTEXT ---");
  parts.push(`Project: ${ctx.projectName}`);
  const briefOverview = extractProjectOverview(ctx);
  if (briefOverview) parts.push(`Overview: ${briefOverview}`);
  parts.push(`Features: ${ctx.features.map(f => `${f.feature_id}: ${f.name} — ${f.description}`).join("\n  ")}`);
  parts.push(`Roles: ${ctx.roles.map(r => `${r.role_id}: ${r.name}${r.description ? " — " + r.description : ""}`).join("; ")}`);
  if (ctx.workflows.length > 0) {
    parts.push(`Workflows: ${ctx.workflows.map(w => `${w.workflow_id}: ${w.name} (${w.steps.length} steps: ${w.steps.join(" → ")})`).join("\n  ")}`);
  }
  if (ctx.buildBrief) {
    const oosMatch = ctx.buildBrief.match(/## Out of Scope\s*\n+([\s\S]*?)(?=\n##|\n---|\n$)/);
    if (oosMatch) parts.push(`\nOUT OF SCOPE (do NOT implement these):\n${oosMatch[1].trim()}`);
    const techMatch = ctx.buildBrief.match(/## Technical Profile\s*\n+([\s\S]*?)(?=\n##|\n---|\n$)/);
    if (techMatch) parts.push(`\nTechnical Profile:\n${techMatch[1].trim().slice(0, 400)}`);
  } else if (ctx.normalizedIntent) {
    if (ctx.normalizedIntent.out_of_scope) {
      const oos = Array.isArray(ctx.normalizedIntent.out_of_scope) ? ctx.normalizedIntent.out_of_scope.join(", ") : String(ctx.normalizedIntent.out_of_scope);
      parts.push(`\nOUT OF SCOPE (do NOT implement these): ${oos}`);
    }
    if (ctx.normalizedIntent.primary_goals) {
      const goals = Array.isArray(ctx.normalizedIntent.primary_goals) ? ctx.normalizedIntent.primary_goals.join("; ") : String(ctx.normalizedIntent.primary_goals);
      parts.push(`Primary Goals: ${goals}`);
    }
  }

  const feat = file.sourceRef ? ctx.features.find(f => f.feature_id === file.sourceRef) : null;
  const featureTerms = feat ? [feat.name, feat.feature_id, ...feat.description.split(/\s+/).filter(w => w.length > 4)] : [];

  if (role === "app_entry") {
    parts.push("\n--- ROUTING MANIFEST ---");
    parts.push("Generate React Router routes for ALL of the following pages:");
    for (const page of ctx.allPages) {
      parts.push(`  <Route path="${page.routePath}" element={<${page.name} />} />`);
    }
    parts.push("\nImport all page components using default imports from the paths shown above.");
    parts.push("Use <Routes> and <Route> from react-router-dom. Do NOT import or use BrowserRouter — it is already in main.tsx.");
    parts.push("Wrap authenticated routes in a layout component (AppLayout) with Header and Sidebar.");
    parts.push("Login, Register, and ForgotPassword pages should NOT be wrapped in the layout.");
    const navPat = extractNavPattern(ctx);
    if (navPat) parts.push(`\nNavigation pattern: ${navPat}. Structure the layout wrapper accordingly.`);
    parts.push("\n--- FEATURES ---");
    parts.push(ctx.features.map(f => `- ${f.name}: ${f.description}`).join("\n"));
    parts.push("\n--- DESIGN SYSTEM ---");
    parts.push(findRelevantDocs(ctx.designDocs, ["design system", "navigation", "layout", "DSYS", "IXD"], 3000));
  } else if (role === "feature_page" || role === "feature_component") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
      const relatedWU = ctx.workBreakdown.filter(wu => wu.scope_refs?.some(ref => ref.includes(feat.feature_id)));
      if (relatedWU.length > 0) {
        parts.push(`Work Units: ${relatedWU.map(wu => `${wu.unit_id}: ${wu.title} — deliverables: ${wu.deliverables.join(", ")}`).join("\n  ")}`);
      }
    }
    parts.push("\n--- DESIGN SPECS ---");
    parts.push(findRelevantDocs(ctx.designDocs, featureTerms.length > 0 ? featureTerms : ["design", "UI", "component"], 4000));
    parts.push("\n--- IMPLEMENTATION GUIDANCE ---");
    parts.push(findRelevantDocs(ctx.implDocs, featureTerms.length > 0 ? featureTerms : ["frontend", "component", "page"], 3000));
    parts.push("\n--- REQUIREMENTS ---");
    parts.push(findRelevantDocs(ctx.requirementsDocs, featureTerms.length > 0 ? featureTerms : ["requirement", "user"], 2000));
    if (role === "feature_page") {
      parts.push("\nGenerate a full React page component with proper state management, data fetching hooks, and UI rendering.");
      parts.push("Use the UI components from src/components/ui/ (Button, Card, Input, Modal, Table).");
      parts.push("Import the feature component from src/components/features/ if needed.");
    }
  } else if (role === "auth_page") {
    parts.push("\n--- SECURITY & AUTH ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["auth", "login", "IAM", "session", "token", "permission"], 5000));
    parts.push("\n--- ROLES & PERMISSIONS ---");
    parts.push(`Roles: ${ctx.roles.map(r => `${r.role_id}: ${r.name}${r.description ? " — " + r.description : ""}`).join("\n  ")}`);
    parts.push("\n--- DESIGN ---");
    parts.push(findRelevantDocs(ctx.designDocs, ["login", "auth", "form", "sign"], 2000));
    if (file.relativePath.includes("Login")) {
      parts.push("\nGenerate a login page with email/password form, validation, error handling, and a link to the register page.");
    } else {
      parts.push("\nGenerate a registration page with name/email/password fields, validation, terms acceptance, and a link to the login page.");
    }
  } else if (role === "settings_page") {
    parts.push("\n--- SECURITY & GOVERNANCE ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["settings", "admin", "config", "permission"], 3000));
    parts.push(findRelevantDocs(ctx.governanceDocs, ["governance", "compliance", "policy"], 2000));
    parts.push("\n--- DESIGN ---");
    parts.push(findRelevantDocs(ctx.designDocs, ["settings", "admin", "config", "preferences"], 2000));
    parts.push("\nGenerate a settings page with tabbed sections for profile, security, notifications, and app preferences.");
    parts.push("Include form fields with save buttons, confirmation dialogs for destructive actions, and loading states.");
  } else if (role === "layout_component") {
    parts.push("\n--- DESIGN ---");
    parts.push(findRelevantDocs(ctx.designDocs, ["layout", "navigation", "sidebar", "header", "DSYS", "IXD", "responsive"], 5000));
    parts.push(`\nApplication pages:\n${ctx.allPages.map(p => `  - ${p.name} (${p.routePath})`).join("\n")}`);
    const navPat = extractNavPattern(ctx);
    if (navPat) parts.push(`\nNavigation pattern: ${navPat}`);
    parts.push("\nGenerate a layout component with navigation, header, and content area. Include responsive behavior, active link highlighting, and user menu.");
  } else if (role === "ui_component" || role === "design_system_component") {
    parts.push("\n--- DESIGN SYSTEM ---");
    parts.push(findRelevantDocs(ctx.designDocs, ["design system", "component", "DSYS", "button", "card", "input", "modal", "table", "accessibility", "A11Y"], 5000));
    parts.push("\nGenerate a reusable, well-typed React component with proper props interface, Tailwind CSS styling, and accessibility attributes.");
  } else if (role === "api_route" || role === "route_index" || role === "workflow_middleware" || role === "middleware") {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint", "route", "REST"], 5000));
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "schema", "model"], 2000));
    if (role === "workflow_middleware") {
      const wf = ctx.workflows.find(w => w.workflow_id === file.sourceRef);
      if (wf) {
        parts.push(`\n--- WORKFLOW ---`);
        parts.push(`Workflow: ${wf.name} (${wf.workflow_id})`);
        parts.push(`Steps: ${wf.steps.join(" → ")}`);
      }
    }
    parts.push("\n--- SECURITY ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["auth", "middleware", "permission", "rate limit"], 2000));
  } else if (role === "db_schema" || role === "entity_model" || role === "model_index") {
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "schema", "model", "entity"], 5000));
    parts.push("\n--- REQUIREMENTS ---");
    parts.push(findRelevantDocs(ctx.requirementsDocs, featureTerms.length > 0 ? featureTerms : ["data", "requirement"], 2000));
  } else if (role === "test" || role === "test_setup") {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint"], 3000));
    parts.push("\n--- QUALITY ---");
    parts.push(findRelevantDocs(ctx.qualityDocs, ["test", "quality", "coverage", "assertion"], 2000));
    if (feat) {
      parts.push(`\nWrite comprehensive tests for the ${feat.name} feature including happy path, error cases, and edge cases.`);
    }
  } else if (role === "feature_form") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- DESIGN SPECS ---");
    parts.push(findRelevantDocs(ctx.designDocs, featureTerms.length > 0 ? featureTerms : ["form", "input", "validation", "design"], 4000));
    parts.push("\n--- IMPLEMENTATION ---");
    parts.push(findRelevantDocs(ctx.implDocs, featureTerms.length > 0 ? featureTerms : ["form", "validation", "submit"], 3000));
    parts.push("\nGenerate a React form component with proper field validation, error messages, loading states, and submit handling.");
    parts.push("Use standard HTML form elements with Tailwind CSS classes. Import LoadingSpinner from src/components/ui/LoadingSpinner.");
    parts.push("Import validation from src/lib/validators/ if applicable.");
  } else if (role === "feature_list") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- DESIGN SPECS ---");
    parts.push(findRelevantDocs(ctx.designDocs, featureTerms.length > 0 ? featureTerms : ["list", "table", "grid", "browse"], 3000));
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "entity", "schema"], 3000));
    parts.push("\nGenerate a list/browse component with pagination, sorting, filtering, empty state handling, and loading skeleton.");
    parts.push("Use Pagination from src/components/ui/Pagination, EmptyState from src/components/ui/EmptyState, and LoadingSpinner from src/components/ui/LoadingSpinner.");
    parts.push("Build the table/list layout with standard HTML elements and Tailwind CSS classes.");
  } else if (role === "feature_detail") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- DESIGN SPECS ---");
    parts.push(findRelevantDocs(ctx.designDocs, featureTerms.length > 0 ? featureTerms : ["detail", "view", "page"], 3000));
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "entity"], 2000));
    parts.push("\nGenerate a detail view component showing a single item with all its fields, actions (edit, delete), and related data.");
    parts.push("Use LoadingSpinner from src/components/ui/LoadingSpinner and standard HTML/Tailwind for layout.");
  } else if (role === "feature_validation") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "schema", "validation"], 4000));
    parts.push("\n--- REQUIREMENTS ---");
    parts.push(findRelevantDocs(ctx.requirementsDocs, featureTerms.length > 0 ? featureTerms : ["validation", "rule", "constraint"], 2000));
    parts.push("\nGenerate Zod validation schemas for this feature's data input/output. Export named schemas and inferred types.");
    parts.push("import { z } from 'zod';");
  } else if (role === "validation") {
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, ["data", "schema", "validation", "entity"], 3000));
    parts.push("\nGenerate a shared validation utilities file. Export common validators (email, password, required, minLength, etc.) and a validateForm helper.");
    parts.push("import { z } from 'zod';");
  } else if (role === "auth_hook") {
    parts.push("\n--- SECURITY ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["auth", "session", "token", "login", "IAM"], 5000));
    parts.push("\n--- ROLES ---");
    parts.push(`Roles: ${ctx.roles.map(r => `${r.role_id}: ${r.name}`).join(", ")}`);
    parts.push("\nGenerate a useAuth React hook that wraps AuthContext. Provides: user, login, logout, register, isAuthenticated, isLoading, hasRole(role).");
    parts.push("Import from src/lib/auth and src/lib/api/client.");
  } else if (role === "auth_layout") {
    parts.push("\n--- DESIGN ---");
    parts.push(findRelevantDocs(ctx.designDocs, ["auth", "login", "form", "layout"], 3000));
    const authColors = extractBrandColors(ctx);
    if (authColors?.primary) parts.push(`Brand primary color: ${authColors.primary} — use for submit buttons, links, focus rings`);
    if (authColors?.background) parts.push(`Background: ${authColors.background}`);
    parts.push(`\nGenerate a centered auth layout for login/register/forgot-password pages for "${ctx.projectName}". Includes logo/brand mark, app name, and a centered card container for the form.`);
  } else if (role === "api_interceptor") {
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, ["API", "client", "interceptor", "middleware"], 3000));
    parts.push("\n--- SECURITY ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["auth", "token", "session"], 2000));
    parts.push("\nGenerate request/response interceptors for the API client. Handle: auth token injection from localStorage, 401 redirect to login, request/response logging, error normalization.");
  } else if (role === "state_store") {
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, ["state", "store", "architecture"], 3000));
    parts.push("\nGenerate a lightweight state management store. Use React Context + useReducer pattern or zustand. Export typed store hooks for global app state (user, theme, notifications).");
    parts.push(`Features to manage state for: ${ctx.features.map(f => f.name).join(", ")}`);
  } else if (role === "hook" || role === "api_client" || role === "utilities") {
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, featureTerms.length > 0 ? featureTerms : ["architecture", "service", "hook", "client"], 3000));
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint", "contract"], 3000));
  } else if (role === "route_handler") {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint", "route", "handler", "REST"], 5000));
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "schema", "model", "entity"], 3000));
    parts.push("\n--- SECURITY ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["auth", "permission", "middleware", "rate limit"], 2000));
    parts.push("\nGenerate an Express route handler with proper request validation, error handling, and response formatting.");
    parts.push("Use async/await, validate request body/params, return typed JSON responses, and wrap in try/catch with proper HTTP status codes.");
  } else if (role === "service_module") {
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, featureTerms.length > 0 ? featureTerms : ["service", "business logic", "architecture"], 4000));
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "entity", "model"], 3000));
    parts.push("\n--- IMPLEMENTATION ---");
    parts.push(findRelevantDocs(ctx.implDocs, featureTerms.length > 0 ? featureTerms : ["service", "implementation", "business"], 3000));
    parts.push("\nGenerate a service module that encapsulates business logic. Export typed functions that interact with repositories/data layer.");
    parts.push("Use dependency injection where possible. Include proper error handling and input validation.");
  } else if (role === "middleware_handler") {
    parts.push("\n--- SECURITY ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["auth", "middleware", "permission", "rate limit", "CORS", "session"], 5000));
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, ["middleware", "interceptor", "pipeline"], 2000));
    parts.push("\nGenerate Express middleware with proper typing (Request, Response, NextFunction).");
    parts.push("Handle errors gracefully and call next() appropriately. Export as default or named function.");
  } else if (role === "entity_repository") {
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "entity", "model", "schema", "database"], 5000));
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, ["repository", "data access", "ORM", "database"], 3000));
    parts.push("\nGenerate a repository module with CRUD operations for the entity.");
    parts.push("Use typed queries, return typed results, and handle database errors. Export named functions: findById, findAll, create, update, delete.");
  } else if (role === "acceptance_test" || role === "integration_test") {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint"], 3000));
    parts.push("\n--- QUALITY ---");
    parts.push(findRelevantDocs(ctx.qualityDocs, ["test", "quality", "coverage", "assertion", "acceptance", "integration"], 3000));
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "entity", "model"], 2000));
    if (feat) {
      parts.push(`\nWrite comprehensive ${role === "acceptance_test" ? "acceptance" : "integration"} tests for the ${feat.name} feature.`);
    }
    parts.push(`\nGenerate ${role === "acceptance_test" ? "acceptance" : "integration"} tests using vitest. Include setup/teardown, test data factories, happy path and error cases.`);
    parts.push("Use describe/it blocks with clear test names. Mock external dependencies where appropriate.");
  } else if (role === "event_handler") {
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, featureTerms.length > 0 ? featureTerms : ["event", "handler", "pub/sub", "message"], 4000));
    parts.push("\n--- IMPLEMENTATION ---");
    parts.push(findRelevantDocs(ctx.implDocs, featureTerms.length > 0 ? featureTerms : ["event", "handler", "async"], 3000));
    parts.push("\nGenerate an event handler module. Export typed handler functions that process domain events.");
  } else if (role === "e2e_test") {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint", "route"], 4000));
    parts.push("\n--- QUALITY ---");
    parts.push(findRelevantDocs(ctx.qualityDocs, ["test", "e2e", "end-to-end", "integration", "acceptance"], 3000));
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "entity", "model"], 2000));
    if (feat) {
      parts.push(`\nWrite comprehensive end-to-end tests for the ${feat.name} feature.`);
    }
    parts.push("\nGenerate E2E tests using vitest + supertest. Test full request/response cycles through the API.");
    parts.push("Include setup/teardown, seed data, happy path, error cases, auth checks, and edge cases.");
    parts.push("Use describe/it blocks with clear test names. Test actual HTTP endpoints with real request/response validation.");
  } else if (role === "feature_store") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, featureTerms.length > 0 ? featureTerms : ["state", "context", "provider"], 3000));
    parts.push("\nGenerate a React Context provider for this feature. Export a typed context, provider component, and useContext hook.");
    parts.push("Include state type, action types, reducer, and the Provider wrapper. Use useReducer for state management.");
  } else if (role === "feature_card") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- DESIGN SPECS ---");
    parts.push(findRelevantDocs(ctx.designDocs, featureTerms.length > 0 ? featureTerms : ["card", "component", "design"], 3000));
    parts.push("\nGenerate a React card component for displaying a summary of this entity. Include key fields, status indicator, and action buttons.");
    parts.push("Use Tailwind CSS for styling. Export as default component with typed props interface.");
  } else if (role === "entity_validator") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "schema", "model", "entity", "validation"], 5000));
    parts.push("\n--- REQUIREMENTS ---");
    parts.push(findRelevantDocs(ctx.requirementsDocs, featureTerms.length > 0 ? featureTerms : ["validation", "rule", "constraint", "business"], 3000));
    parts.push("\nGenerate an entity validator module with comprehensive validation rules.");
    parts.push("Export validate functions that check business rules, field constraints, cross-field validations, and state transitions.");
    parts.push("Return typed validation results with field-level error messages. Use Zod schemas where applicable.");
    parts.push("import { z } from 'zod';");
  } else if (role === "entity_mapper") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "entity", "model", "schema", "DTO"], 4000));
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, featureTerms.length > 0 ? featureTerms : ["mapper", "transform", "DTO", "layer"], 3000));
    parts.push("\nGenerate a mapper module that converts between domain entities and DTOs/API responses.");
    parts.push("Export typed mapping functions: toResponse, fromRequest, toListResponse.");
    parts.push("Handle null/undefined fields, date formatting, and nested object mapping.");
  } else if (role === "auth_policy") {
    parts.push("\n--- SECURITY & AUTH ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["auth", "authorization", "permission", "role", "policy", "RBAC", "access control"], 5000));
    parts.push("\n--- ROLES & PERMISSIONS ---");
    parts.push(`Roles: ${ctx.roles.map(r => `${r.role_id}: ${r.name}${r.description ? " — " + r.description : ""}`).join("\n  ")}`);
    parts.push("\n--- REQUIREMENTS ---");
    parts.push(findRelevantDocs(ctx.requirementsDocs, featureTerms.length > 0 ? featureTerms : ["permission", "access", "authorization"], 2000));
    if (feat) {
      parts.push(`\nGenerate authorization policy for the ${feat.name} feature.`);
    }
    parts.push("\nGenerate an authorization policy module that enforces role-based access control.");
    parts.push("Export middleware functions and policy check helpers: canAccess, requireRole, requirePermission.");
    parts.push("Include resource-level authorization (owner checks) and role hierarchy support.");
    parts.push("Use Express middleware signature (req, res, next) with proper typing.");
  } else if (role === "contract_test") {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint", "contract", "schema"], 5000));
    parts.push("\n--- QUALITY ---");
    parts.push(findRelevantDocs(ctx.qualityDocs, ["test", "contract", "API", "schema", "validation"], 3000));
    if (feat) {
      parts.push(`\nWrite API contract tests for the ${feat.name} feature.`);
    }
    parts.push("\nGenerate contract tests using vitest that verify API request/response shapes match their defined schemas.");
    parts.push("Test that all endpoints return correct status codes, content types, and response body structures.");
    parts.push("Validate error responses, pagination format, and auth error shapes. Use describe/it blocks with clear names.");
  } else if (role === "test_mock") {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint", "client"], 4000));
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, featureTerms.length > 0 ? featureTerms : ["service", "repository", "dependency"], 3000));
    if (feat) {
      parts.push(`\nGenerate mock implementations for the ${feat.name} feature's dependencies.`);
    }
    parts.push("\nGenerate typed mock implementations for testing. Export mock factories and spy-enabled mocks.");
    parts.push("Create mock API client, mock repository, and mock service stubs with configurable return values.");
    parts.push("Use vitest's vi.fn() for spy capabilities. Export createMock* factory functions.");
  } else if (role === "api_binding") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint", "route", "REST"], 5000));
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, featureTerms.length > 0 ? featureTerms : ["API", "client", "binding", "fetch"], 3000));
    parts.push("\nGenerate a typed API binding/client module for this feature.");
    parts.push("Export async functions for each API operation: getAll, getById, create, update, delete.");
    parts.push("Use the shared API client from src/lib/api/client. Include proper TypeScript types for requests and responses.");
    parts.push("Handle errors consistently, return typed results, and support pagination parameters.");
  } else if (role === "audit_hook") {
    parts.push("\n--- SECURITY ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["audit", "logging", "compliance", "tracking", "IAM"], 4000));
    parts.push("\n--- GOVERNANCE ---");
    parts.push(findRelevantDocs(ctx.governanceDocs, ["audit", "compliance", "governance", "trail"], 3000));
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, ["middleware", "hook", "event", "logging"], 2000));
    if (feat) {
      parts.push(`\nGenerate audit logging hook/middleware for the ${feat.name} feature.`);
    }
    parts.push("\nGenerate an audit logging module that captures and records security-relevant actions.");
    parts.push("Export Express middleware and utility functions: auditMiddleware, logAuditEvent, createAuditTrail.");
    parts.push("Record: action type, actor (user id/role), resource, timestamp, IP address, changes (before/after).");
    parts.push("Support structured JSON logging format suitable for compliance review.");
  } else if (role === "page") {
    parts.push("\n--- DESIGN ---");
    parts.push(findRelevantDocs(ctx.designDocs, ["home", "landing", "overview", "navigation"], 3000));
    parts.push("\n--- REQUIREMENTS ---");
    parts.push(findRelevantDocs(ctx.requirementsDocs, ["overview", "home", "landing"], 2000));
    parts.push("\nThis is the landing/home page. It should provide an overview of the application and quick navigation to key features.");
    const featureLinks = ctx.allPages.filter(p => p.role !== "error_page" && p.name !== "Home" && p.name !== "Login" && p.name !== "Register");
    if (featureLinks.length > 0) {
      parts.push(`Feature pages to link to: ${featureLinks.map(p => `${p.name} (${p.routePath})`).join(", ")}`);
    }
  } else {
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, ["architecture"], 2000));
    parts.push("\n--- IMPLEMENTATION ---");
    parts.push(findRelevantDocs(ctx.implDocs, ["implementation"], 2000));
  }

  return parts.join("\n");
}
