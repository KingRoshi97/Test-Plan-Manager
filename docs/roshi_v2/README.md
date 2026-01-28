# Roshi v2 Documentation Workspace

This directory contains the Roshi documentation system for the project.

## Directory Structure

```
docs/roshi_v2/
├── 00_product/          # Product-level specifications
│   ├── RPBS_Product.md  # Requirements & Policy Baseline Spec
│   ├── REBS_Product.md  # Requirements & Entity Baseline Spec
│   └── PROJECT_OVERVIEW.md
├── 00_registry/         # Cross-cutting registries
│   ├── domain-map.md
│   ├── action-vocabulary.md
│   ├── reason-codes.md
│   └── glossary.md
├── 01_templates/        # Document templates
├── 02_domains/          # Per-domain documentation
│   └── <domain-slug>/
│       ├── DDES_<slug>.md
│       ├── UX_Foundations_<slug>.md
│       ├── UI_Constraints_<slug>.md
│       ├── BELS_<slug>.md
│       ├── DIM_<slug>.md
│       ├── SCREENMAP_<slug>.md
│       └── TESTPLAN_<slug>.md
└── 03_workflows/        # Workflow documentation
```

## Pipeline Commands

```bash
npm run roshi:init    # Initialize workspace
npm run roshi:gen     # Generate domain doc packs
npm run roshi:seed    # Seed starter scaffolding
npm run roshi:draft   # Draft truth candidates
npm run roshi:review  # Review packet
npm run roshi:verify  # Verify system
npm run roshi:lock    # Lock a domain
```

## Rules

1. **No invention**: Missing info must become UNKNOWN + logged to Open Questions
2. **No overwrite**: Scripts skip if file exists unless explicitly allowed
3. **Verify before lock**: All verifications must pass before locking
4. **Always print ROSHI_REPORT**: Every script run outputs a report
