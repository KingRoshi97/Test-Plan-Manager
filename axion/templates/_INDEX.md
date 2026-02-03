# AXION Template Pack

This pack contains one blank-state `README.template.md` per module.

## 19 Primary Modules

| Module | Template Path | Prefix |
|--------|---------------|--------|
| architecture | `architecture/README.template.md` | `arch` |
| systems | `systems/README.template.md` | `sys` |
| contracts | `contracts/README.template.md` | `contract` |
| database | `database/README.template.md` | `db` |
| data | `data/README.template.md` | `data` |
| auth | `auth/README.template.md` | `auth` |
| backend | `backend/README.template.md` | `be` |
| integrations | `integrations/README.template.md` | `integ` |
| state | `state/README.template.md` | `state` |
| frontend | `frontend/README.template.md` | `fe` |
| fullstack | `fullstack/README.template.md` | `fs` |
| testing | `testing/README.template.md` | `test` |
| quality | `quality/README.template.md` | `qa` |
| security | `security/README.template.md` | `sec` |
| devops | `devops/README.template.md` | `devops` |
| cloud | `cloud/README.template.md` | `cloud` |
| devex | `devex/README.template.md` | `dx` |
| mobile | `mobile/README.template.md` | `mobile` |
| desktop | `desktop/README.template.md` | `desktop` |

## 7 Core ROSHI Templates

| Template | Path | Purpose |
|----------|------|---------|
| DDES | `core/DDES.template.md` | Domain Design & Entity Structure |
| UX_Foundations | `core/UX_Foundations.template.md` | User Mental Model |
| UI_Constraints | `core/UI_Constraints.template.md` | Structural UI Rules |
| ALRP | `core/ALRP.template.md` | Agent Logic & Reasoning Protocol |
| ERC | `core/ERC.template.md` | Execution Ready Contract |
| TIES | `core/TIES.template.md` | Technical Implementation Standards |
| SROL | `core/SROL.template.md` | System Refinement & Optimization Log |

## 3 Extended Templates (optional)

| Template | Path | Purpose |
|----------|------|---------|
| governance | `governance/README.template.md` | Process & governance standards |
| specialized | `specialized/README.template.md` | Game, embedded, blockchain, AR/VR |
| platform | `platform/README.template.md` | Internal developer platform |

## Template Contract Format

All templates use the following contract header:

```markdown
<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:<module> -->
<!-- AXION:PREFIX:<prefix> -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->
```

## Placeholder Policy

| Token | When to Use |
|-------|-------------|
| `[TBD]` | Must be populated during draft stage |
| `N/A — <reason>` | Not applicable (never leave blank) |
| `UNKNOWN` | Upstream truth missing; add to Open Questions |

## Template Total: 29

- 7 core ROSHI templates
- 19 module README.template.md files
- 3 extended templates (template-only, no domain folder)
