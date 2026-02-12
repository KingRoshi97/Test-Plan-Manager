# Domain Build Order

> **Registry Guardrail.** The deterministic dependency graph and execution order for all 19 domain modules. The orchestrator uses this order for per-module stage iteration. Sourced from `config/domains.json` `canonical_order` and per-module `dependencies`.

---

## Canonical Order

The orchestrator processes modules in this exact order. This sequence satisfies all dependency constraints — every module's dependencies appear before it in the list.

| Position | Module | Slug | Type | Dependencies |
|----------|--------|------|------|-------------|
| 1 | Architecture | `architecture` | foundation | *(none)* |
| 2 | Systems | `systems` | foundation | architecture |
| 3 | Contracts | `contracts` | foundation | architecture, systems |
| 4 | Database | `database` | data | contracts |
| 5 | Data | `data` | data | database, contracts |
| 6 | Auth | `auth` | security | contracts, database |
| 7 | Backend | `backend` | core | contracts, database, auth |
| 8 | Integrations | `integrations` | core | backend, contracts |
| 9 | State | `state` | frontend | contracts |
| 10 | Frontend | `frontend` | frontend | state, contracts |
| 11 | Fullstack | `fullstack` | integration | frontend, backend |
| 12 | Testing | `testing` | quality | backend, frontend |
| 13 | Quality | `quality` | quality | *(none)* |
| 14 | Security | `security` | crosscutting | auth, backend |
| 15 | DevOps | `devops` | operations | backend, testing |
| 16 | Cloud | `cloud` | operations | devops |
| 17 | DevEx | `devex` | operations | quality |
| 18 | Mobile | `mobile` | platform | frontend, state |
| 19 | Desktop | `desktop` | platform | frontend, state |

---

## Dependency Graph

```
architecture ──┬──→ systems ──→ contracts ──┬──→ database ──┬──→ data
               │                            │               │
               │                            │               ├──→ auth ──┬──→ backend ──┬──→ integrations
               │                            │               │          │              │
               │                            │               │          │              ├──→ fullstack ←── frontend
               │                            │               │          │              │
               │                            │               │          │              ├──→ security
               │                            │               │          │              │
               │                            │               │          │              └──→ devops ──→ cloud
               │                            │               │          │
               │                            │               │          └──→ testing ←── frontend
               │                            │               │
               │                            ├──→ state ──→ frontend ──┬──→ mobile
               │                            │                         └──→ desktop
               │                            │
               └────────────────────────────┘

quality ──→ devex                           (independent root)
```

---

## Parallelization Opportunities

Modules at the same depth level with no mutual dependencies can be processed in parallel.

### Depth Levels

| Depth | Modules | Can Parallelize? |
|-------|---------|-----------------|
| 0 | Architecture, Quality | Yes — no shared dependencies |
| 1 | Systems, DevEx | Yes — independent roots |
| 2 | Contracts | Sequential (depends on depth 0–1) |
| 3 | Database, State | Yes — both depend only on Contracts |
| 4 | Data, Auth, Frontend | Partial — Data and Auth share Database; Frontend depends on State |
| 5 | Backend | Sequential (depends on Contracts, Database, Auth) |
| 6 | Integrations, Fullstack, Testing, Security | Partial — Fullstack needs Frontend+Backend; others vary |
| 7 | DevOps | Sequential (depends on Backend, Testing) |
| 8 | Cloud, Mobile, Desktop | Yes — independent of each other |

### Maximum Parallelism

At most, these independent groups can be processed simultaneously within a single stage:

1. **Group A:** Architecture + Quality (depth 0, independent roots)
2. **Group B:** Database + State (depth 3, both depend only on Contracts)
3. **Group C:** Cloud + Mobile + Desktop (depth 8, no mutual deps)

---

## Preset-Based Subsets

When running a preset (from `presets.json`), only a subset of modules is active. If `include_dependencies: true`, the orchestrator automatically includes all transitive dependencies.

### Common Presets and Their Resolved Module Lists

| Preset | Specified Modules | Resolved (with deps) | Resolved Count |
|--------|-------------------|---------------------|----------------|
| `foundation` | architecture, systems, contracts | architecture, systems, contracts | 3 |
| `core-spec` | contracts, database, auth | architecture, systems, contracts, database, auth | 5 |
| `web` | frontend, state | architecture, systems, contracts, state, frontend | 5 |
| `backend-api` | backend | architecture, systems, contracts, database, auth, backend | 6 |
| `fullstack-web` | fullstack, frontend, state, backend | architecture, systems, contracts, database, auth, state, frontend, backend, fullstack | 9 |
| `security-layer` | security, auth | architecture, systems, contracts, database, auth, backend, security | 7 |
| `ops` | devops, cloud, devex | architecture, systems, contracts, database, auth, backend, testing, frontend, state, quality, devops, cloud, devex | 13 |
| `system` | *(all 19)* | *(all 19)* | 19 |

---

## Gate Enforcement During Build Order

Gates are checked per-module at each stage boundary. A module cannot advance to the next stage until:

1. All its dependencies have completed the current stage (dependency gate)
2. The stage-level gate condition is satisfied (see `run-sequences.md`)

### Example: `lock` Stage for Backend

Before Backend can `lock`:
1. Contracts must be locked (dependency)
2. Database must be locked (dependency)
3. Auth must be locked (dependency)
4. Backend's own `verify` must have passed (stage gate: `lock_requires_verify_pass`)

---

## Cross-References

- **Module details:** See `module-index.md`
- **Domain responsibilities:** See `domain-map.md`
- **Stage ordering and gates:** See `run-sequences.md`
- **Coverage mapping:** See `fullstack-coverage-map.md`
