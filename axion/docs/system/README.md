# AXION

AXION is a documentation-first development system that generates comprehensive "Agent Kits" for AI-guided software development. It enforces a strict sequential pipeline to ensure consistency, traceability, and completeness — from project idea to running application.

## How It Works

1. **Define** your project in RPBS (Project Brief) and REBS (Requirements)
2. **Generate** module documentation across up to 19 domains
3. **Validate** documentation through AI review and automated verification
4. **Lock** docs when they pass quality gates
5. **Scaffold** an application from the locked documentation
6. **Build, test, deploy, activate** the generated application

```
Documentation Pipeline               App Pipeline
generate → seed → draft →            scaffold-app → build → test →
content-fill → review →              deploy → activate → run-app
verify → lock
```

## Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | Get from zero to running app |
| [INDEX.md](INDEX.md) | Full table of contents with glossary |
| [PIPELINE_OVERVIEW.md](PIPELINE_OVERVIEW.md) | Pipeline stages, plans, and outputs |
| [WORKSPACE_LAYOUT.md](WORKSPACE_LAYOUT.md) | Two-root architecture and file tree |
| [CLI_REFERENCE.md](CLI_REFERENCE.md) | All 39 scripts with flags and usage |
| [RELEASE_GATES.md](RELEASE_GATES.md) | Quality gates and override policy |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common failures and resolutions |
| [internals/ORCHESTRATION_ENGINE.md](internals/ORCHESTRATION_ENGINE.md) | How the orchestrator works |
| [ops/SYSTEM_UPGRADE_LOG.md](ops/SYSTEM_UPGRADE_LOG.md) | System change history |

## Key Principles

- **Documentation is the source of truth.** Code is generated from docs, not the other way around.
- **Two-root isolation.** System files (`axion/`) and project workspaces are strictly separated.
- **Gates enforce quality.** Each stage must pass before the next can proceed.
- **Everything is auditable.** Stage markers, verify reports, run history, and lock checksums create a full audit trail.
- **Crash resilience.** Atomic writes, transient failure retry, and run locks prevent data corruption.
