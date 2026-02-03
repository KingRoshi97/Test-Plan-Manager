# AXION Documentation

This folder centralizes all README documentation for the AXION system.

## Quick Links

| File | Describes |
|------|-----------|
| `README_system.md` | The AXION system — pipeline, ROSHI flow, modules, template contracts |
| `README_product.md` | The `source_docs/product/` folder — RPBS, REBS (the "spark") |
| `README_registry.md` | The `source_docs/registry/` folder — glossary, reason codes (guardrails) |

## Three-Folder Architecture

```
source_docs/product/    → INPUT: What we're building (RPBS, REBS)
source_docs/registry/   → GUARDRAILS: Standards that prevent drift
templates/              → BLUEPRINTS: Document structures to populate
domains/                → OUTPUT: Filled-in docs ready for agent coding
```

## Template Structure (29 Templates)

### Core ROSHI Templates (7)
Located in `templates/core/`:
- DDES, UX_Foundations, UI_Constraints, ALRP, ERC, TIES, SROL

### Module Templates (22)
Each module folder has one `README.template.md` with contract headers.

**19 Primary Modules (from domains.json):**
- Foundation: architecture, systems, contracts
- Data: database, data
- Security: auth
- Core: backend, integrations
- Frontend: state, frontend
- Integration: fullstack
- Quality: testing, quality
- Crosscutting: security
- Operations: devops, cloud, devex
- Platform: mobile, desktop

**3 Extended Templates (template-only, no domain folder):**
- governance (process/governance standards)
- specialized (game, embedded, blockchain, AR/VR)
- platform (internal developer platform)

## Template Contract System

All templates use standard headers:
```markdown
<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:frontend -->
<!-- AXION:REQUIRED_SECTIONS:enforced -->
<!-- AXION:VERIFY_NONEMPTY_RULE:v1 -->
```

Section keys for verification:
```markdown
<!-- AXION:SECTION:FE_ACCESSIBILITY -->
## Accessibility
...
```

## Legacy Folder

The `legacy/` subfolder maintains version history:

```
legacy/
├── README_system/     # Previous versions of README_system.md
├── README_product/    # Previous versions of README_product.md
└── README_registry/   # Previous versions of README_registry.md
```

Files use the format: `{README_name}_{YYYYMMDD}_{HHMMSS}.md`
