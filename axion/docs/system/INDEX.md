# Documentation Index

Version: 0.2.0
Last Updated: 2026-02-10

## Table of Contents

### Overview
- [README.md](README.md) — What AXION is and key principles
- [QUICKSTART.md](QUICKSTART.md) — Zero to running application

### Pipeline
- [PIPELINE_OVERVIEW.md](PIPELINE_OVERVIEW.md) — Documentation and app pipeline stages, plans, outputs, full workflow

### Workspace
- [WORKSPACE_LAYOUT.md](WORKSPACE_LAYOUT.md) — Two-root architecture, file tree, path resolution, safety policies

### Commands
- [CLI_REFERENCE.md](CLI_REFERENCE.md) — All 39 scripts organized by category with flags and usage

### Quality
- [RELEASE_GATES.md](RELEASE_GATES.md) — Gate enforcement, override policy, error codes, change contract process

### Support
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Common failures by phase with resolutions

### Internals
- [internals/ORCHESTRATION_ENGINE.md](internals/ORCHESTRATION_ENGINE.md) — How the orchestrator chains stages, presets, stage markers, retry, SSE streaming

### Operations
- [ops/SYSTEM_UPGRADE_LOG.md](ops/SYSTEM_UPGRADE_LOG.md) — Append-only record of system changes

---

## Glossary

| Term | Definition |
|------|------------|
| **Agent Kit** | The complete output of an AXION pipeline run: locked documentation + scaffolded application, packaged for AI-guided development |
| **Assembly** | A project idea in the web dashboard, including name, description, vision, features, and technical specs |
| **Build Root** | The parent directory containing both `axion/` (system root) and project workspaces. Passed via `--build-root` |
| **Cascade** | When filling UNKNOWN content, propagating newly-filled content from higher-priority docs to downstream docs that depend on them |
| **Content-Fill** | The process of scanning documentation for UNKNOWN placeholders and replacing them with AI-generated or user-provided content |
| **Domain / Module** | One of the 19 documentation categories (architecture, backend, frontend, etc.). Each module gets its own folder under `domains/` |
| **Gate** | A checkpoint that blocks pipeline progression until prerequisites are met. Gates can be strict (no override) or soft (allow `--override`) |
| **Gate Guard** | An additional constraint defined per-preset (e.g., `lock_requires_verify_pass`, `disallow_lock`). Guards layer on top of per-stage gates |
| **Kit** | Short for Agent Kit |
| **Lock** | Freezing documentation by recording checksums. Locked docs cannot be modified without re-running verify |
| **Override** | The `--override` flag that bypasses soft gates during development. Only `scaffold-app` and `deploy` support it |
| **Plan** | A named sequence of pipeline stages (e.g., `docs:full`, `app:bootstrap`). Defined in `config/presets.json` |
| **Preset** | A named set of modules to process (e.g., `system` = all 19, `web` = frontend + state + deps). Defined in `config/presets.json` |
| **RPBS** | Requirements and Product Brief Specification — the Level 0 product truth document |
| **REBS** | Requirements and Engineering Brief Specification — the Level 0 requirements document |
| **Reconcile** | Comparing imported facts against build outputs to detect drift between reality and documentation |
| **Run Lock** | A file-based lock (`registry/.run_lock`) preventing concurrent pipeline runs on the same workspace. Stale after 30 minutes |
| **Scaffold** | Generating a directory structure (either docs or app code) from templates and locked content |
| **Seed** | Populating generated module templates with content from RPBS/REBS product documents |
| **Stage Marker** | A JSON record in `registry/stage_markers.json` tracking which stages have completed for which modules |
| **System Root** | The `axion/` directory containing immutable system code, scripts, templates, and configuration |
| **Two-Root Model** | The architectural separation between the system root (`axion/`) and workspace roots (project directories) |
| **Verify** | Automated validation of documentation against contracts and quality rules. Produces a verify report |
| **Workspace** | A project directory created as a sibling to `axion/`. Contains `source_docs/`, `domains/`, `registry/`, and `app/` |

---

## Related Documentation

### Product Docs (`docs/product/`)
- `RPBS_Product.md` — Project brief specification
- `REBS_Product.md` — Requirements specification

### Registry Docs (`docs/registry/`)
- Glossary, reason codes, action vocabulary — guardrails that prevent agent drift

### Templates (`templates/core/`)
- Base document templates used by the generate/seed stages
- `CHANGE_CONTRACT_TEMPLATE.md` — Template for proposing system changes
