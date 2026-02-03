<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:frontend -->
<!-- AXION:PREFIX:fe -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Frontend — Axion Assembler

**Module slug:** `frontend`  
**Prefix:** `fe`  
**Description:** UI components, pages, and user interactions for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:RPBS_DERIVATIONS -->
## RPBS_DERIVATIONS (Required)
- Tenancy/Org Model: Single-tenant (source: RPBS §21)
- Actors & Permission Intents: Single user with full access (source: RPBS §3)
- Core Objects impacted here: Assembly, Run, Module, Artifact (source: RPBS §4)
- Non-Functional Profile implications: <500ms for page loads (source: RPBS §7)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A (source: RPBS §22)
- Privacy Controls (Deletion/Export): Yes — delete assembly from UI (source: RPBS §29)
- Stack Selection Policy alignment: React + TypeScript + Vite (source: REBS §1)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:FE_SCOPE -->
## Scope & Ownership
- Owns: React components, pages, routing, forms, shadcn/ui components
- Does NOT own: API logic (backend), state management patterns (state), database (data)

<!-- AXION:SECTION:FE_INFORMATION_ARCH -->
## Information Architecture
- Route map:
  | Path | Page | Purpose |
  |------|------|---------|
  | / | Dashboard | List assemblies, health indicators, quick actions |
  | /new | New Assembly Wizard | Create assembly, select preset/plan/profile |
  | /assembly/:id | Assembly Control Room | Pipeline stepper, module grid, run logs |
  | /assembly/:id/docs | Docs Workspace Browser | Browse/edit RPBS/REBS/modules |
  | /assembly/:id/verify | Verify Center | Verify report, violations, fix hints |
  | /assembly/:id/lock | Lock & ERC | Lock controls, ERC outputs |
  | /assembly/:id/drift | Drift Console | Template drift status, hash management |
  | /assembly/:id/export | Export Center | Generate/download Agent Kit ZIPs |
  | /settings | Settings | Base path, safe mode toggles |
- Navigation rules: Sidebar nav with assembly selector; top bar for actions

<!-- AXION:SECTION:FE_COMPONENTS -->
## Component System
- Component inventory:
  | Category | Components |
  |----------|------------|
  | Layout | AppShell, SidebarNav, TopBar, PageHeader |
  | Data Display | AssemblyCard, ModuleGrid, RunLogPanel, ArtifactViewer |
  | Forms | NewAssemblyForm, FileEditor, SettingsForm |
  | Feedback | StatusBadge, ProgressStepper, Toast |
- Styling: Tailwind CSS with shadcn/ui; dark/light theme toggle

<!-- AXION:SECTION:FE_UI_FLOWS -->
## Critical User Flows

### Flow 1: Create Assembly and Run Pipeline
1. User clicks "New Assembly" on Dashboard
2. Fills wizard: name, description, preset, plan, stack profile
3. Submits → POST /api/assemblies → init runs automatically
4. Redirects to Control Room with pipeline stepper
5. User clicks stage buttons to run each stage
6. Live logs stream via SSE

### Flow 2: Verify and Lock
1. User runs verify stage
2. Verify Center shows PASS/FAIL with module breakdown
3. If FAIL: violations listed with fix_action hints
4. User fixes issues, re-runs verify
5. When PASS: Lock button enabled
6. User clicks Lock → modules locked

### Flow 3: Export Agent Kit
1. User clicks Export → POST /api/assemblies/:id/export
2. Progress shown while ZIP generated
3. Download link appears
4. User downloads ZIP containing docs, manifest, registry

<!-- AXION:SECTION:FE_FORMS -->
## Forms & Validation
- Form list:
  | Form | Fields | Validation |
  |------|--------|------------|
  | NewAssemblyForm | name, description, preset, plan, profile | name required, preset required |
  | FileEditorForm | content | N/A — any content allowed |
  | SettingsForm | basePath, safeModeToggles | basePath must be valid path |
- Validation: react-hook-form with Zod resolver
- Error UX: Inline field errors, toast for submission errors

<!-- AXION:SECTION:FE_A11Y -->
## Accessibility Requirements
- Keyboard rules: All interactive elements focusable, Tab order logical
- Screen reader rules: ARIA labels on icons, status announcements
- Focus management: Auto-focus first field in modals

<!-- AXION:SECTION:FE_PERF -->
## Performance Requirements
- Loading strategy: Code splitting by route; lazy load Control Room
- Runtime constraints: <100ms for UI interactions; virtualize long lists

<!-- AXION:SECTION:FE_SECURITY -->
## Frontend Security
- XSS mitigation: React escapes by default; no dangerouslySetInnerHTML
- CSRF: Session cookies with SameSite=Strict
- Client storage: No sensitive data in localStorage

<!-- AXION:SECTION:FE_OBSERVABILITY -->
## Client Observability
- Events/analytics: N/A for v1
- RUM/perf metrics: N/A for v1
- Error reporting: Errors logged to console; displayed in toasts

<!-- AXION:SECTION:FE_TESTING -->
## Frontend Testing
- Unit tests: N/A for v1
- E2E critical paths: Create assembly, run pipeline, verify, export
- Visual regression: N/A for v1

<!-- AXION:SECTION:FE_ACCEPTANCE -->
## Acceptance Criteria
- [x] Route map exists
- [x] Critical flows documented with error UX
- [x] A11y and perf requirements stated

<!-- AXION:SECTION:FE_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Use shadcn/ui components; follow existing patterns.
2. Use TanStack Query for data fetching; invalidate after mutations.
3. Add data-testid attributes to interactive elements.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
