# Module Index

> **Registry Guardrail.** Complete inventory of all 19 domain modules and the documentation templates generated for each. Sourced from `config/domains.json`. The pipeline creates one folder per module under `domains/` in each workspace.

---

## Module Inventory

| # | Module | Slug | Prefix | Type | Dependencies |
|---|--------|------|--------|------|-------------|
| 1 | Architecture | `architecture` | `arch` | foundation | *(none)* |
| 2 | Systems | `systems` | `sys` | foundation | architecture |
| 3 | Contracts | `contracts` | `contract` | foundation | architecture, systems |
| 4 | Database | `database` | `db` | data | contracts |
| 5 | Data | `data` | `data` | data | database, contracts |
| 6 | Auth | `auth` | `auth` | security | contracts, database |
| 7 | Backend | `backend` | `be` | core | contracts, database, auth |
| 8 | Integrations | `integrations` | `integ` | core | backend, contracts |
| 9 | State | `state` | `state` | frontend | contracts |
| 10 | Frontend | `frontend` | `fe` | frontend | state, contracts |
| 11 | Fullstack | `fullstack` | `fs` | integration | frontend, backend |
| 12 | Testing | `testing` | `test` | quality | backend, frontend |
| 13 | Quality | `quality` | `qa` | quality | *(none)* |
| 14 | Security | `security` | `sec` | crosscutting | auth, backend |
| 15 | DevOps | `devops` | `devops` | operations | backend, testing |
| 16 | Cloud | `cloud` | `cloud` | operations | devops |
| 17 | DevEx | `devex` | `dx` | operations | quality |
| 18 | Mobile | `mobile` | `mobile` | platform | frontend, state |
| 19 | Desktop | `desktop` | `desktop` | platform | frontend, state |

---

## Templates Per Module

Each module folder under `domains/{slug}/` receives the following documentation files during the `generate` stage. Files are suffixed with the domain slug (e.g., `BELS_architecture.md`).

| Template | Filename Pattern | Purpose | Source Template |
|----------|-----------------|---------|----------------|
| BELS | `BELS_{slug}.md` | Business rules, state machines, entity lifecycle | `templates/core/BELS.template.md` |
| DDES | `DDES_{slug}.md` | Domain entities, attributes, structural decisions | `templates/core/DDES.template.md` |
| DIM | `DIM_{slug}.md` | Interfaces, contracts, cross-domain communication | `templates/core/DIM.template.md` |
| UX_Foundations | `UX_Foundations_{slug}.md` | UX patterns and interaction models | `templates/core/UX_Foundations.template.md` |
| UI_Constraints | `UI_Constraints_{slug}.md` | Design system rules and visual standards | `templates/core/UI_Constraints.template.md` |
| SCREENMAP | `SCREENMAP_{slug}.md` | Page layouts, navigation flows, wireframes | `templates/core/SCREENMAP.template.md` |
| TESTPLAN | `TESTPLAN_{slug}.md` | Test strategy, coverage targets, test cases | `templates/core/TESTPLAN.template.md` |
| COMPONENT_LIBRARY | `COMPONENT_LIBRARY_{slug}.md` | Reusable UI components, props, variants | `templates/core/COMPONENT_LIBRARY.template.md` |
| COPY_GUIDE | `COPY_GUIDE_{slug}.md` | Voice, tone, terminology, content standards | `templates/core/COPY_GUIDE.template.md` |
| README | `README_{slug}.md` | Module overview and quick-start | *(generated, no base template)* |
| OPEN_QUESTIONS | `OPEN_QUESTIONS_{slug}.md` | Unresolved questions blocking the lock gate | *(generated, no base template)* |

**Total:** 11 documentation files per module × 19 modules = **209 files** in a fully generated workspace.

---

## Module Types

Modules are classified by type, which determines their role in the project and affects which template sections are most relevant.

| Type | Modules | Role |
|------|---------|------|
| `foundation` | Architecture, Systems, Contracts | Structural decisions, patterns, API contracts. Processed first. |
| `data` | Database, Data | Schema, migrations, data flows, transformations. |
| `security` | Auth | Authentication, authorization, identity management. |
| `core` | Backend, Integrations | Server-side logic, third-party services. |
| `frontend` | State, Frontend | Client-side state, UI components, pages. |
| `integration` | Fullstack | End-to-end flows connecting frontend and backend. |
| `quality` | Testing, Quality | Test strategies, code quality, linting standards. |
| `crosscutting` | Security | Security policies, audits, vulnerability management. |
| `operations` | DevOps, Cloud, DevEx | CI/CD, infrastructure, developer tooling. |
| `platform` | Mobile, Desktop | Platform-specific client builds. |

---

## Roshi Docs (Cross-Module)

In addition to per-module templates, the system generates cross-module "roshi docs" defined in `domains.json`. These are shared specification documents.

| Doc | Path | Prerequisites | Purpose |
|-----|------|---------------|---------|
| RPBS | `core/RPBS_Product.md` | *(none)* | Product boundaries specification |
| REBS | `core/REBS_Product.md` | RPBS | Engineering boundaries specification |
| DDES | `core/DDES.md` | RPBS, REBS | Cross-module design specification |
| UX_Foundations | `core/UX_Foundations.md` | DDES | Cross-module UX guidelines |
| UI_Constraints | `core/UI_Constraints.md` | UX_Foundations | Cross-module UI constraints |
| ALRP | `core/ALRP.md` | UI_Constraints | Agent response protocol |
| ERC | `core/ERC.md` | ALRP | Execution readiness contract |

---

## Cross-References

- **Canonical build order:** See `domain-build-order.md`
- **Domain responsibilities and boundaries:** See `domain-map.md`
- **Template coverage across the stack:** See `fullstack-coverage-map.md`
