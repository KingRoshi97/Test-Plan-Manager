<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:devex -->
<!-- AXION:PREFIX:dx -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# DevEx — Axion Assembler

**Module slug:** `devex`  
**Prefix:** `dx`  
**Description:** Developer experience, tooling, and workflows for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:DX_SCOPE -->
## Scope & Ownership
- Owns: Development setup, CLI tooling, documentation, workflow conventions
- Does NOT own: CI/CD (devops), code quality rules (quality)

<!-- AXION:SECTION:DX_LOCAL -->
## Local Development
- One-command setup: `npm install` then `npm run dev`
- Env requirements:
  - Node.js 20+
  - PostgreSQL (or use Replit database)
  - Environment variables: DATABASE_URL, SESSION_SECRET

<!-- AXION:SECTION:DX_TOOLING -->
## Tooling & Automation
- CLIs/scripts provided:
  - `npm run dev`: Start development server
  - `npm run db:push`: Push schema to database
  - `npm run build`: Production build
- Generators/scaffolds: N/A — use existing patterns

<!-- AXION:SECTION:DX_DOCS -->
## Documentation Standards
- What must be documented:
  - API endpoints in backend module
  - UI flows in frontend module
  - Database schema in database module
- Docs location: axion/domains/<module>/README.md

<!-- AXION:SECTION:DX_WORKFLOW -->
## Workflow Conventions
- Branching: Feature branches off main; merge via PR
- PR templates: N/A for v1

<!-- AXION:SECTION:DX_SUPPORT -->
## Developer Support
- Support channels: N/A — single developer
- SLAs: N/A

<!-- AXION:SECTION:DX_ACCEPTANCE -->
## Acceptance Criteria
- [x] Setup is documented
- [x] Tooling inventory exists
- [x] Workflow standards stated

<!-- AXION:SECTION:DX_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Document all npm scripts in package.json.
2. Keep README.md updated with setup instructions.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
