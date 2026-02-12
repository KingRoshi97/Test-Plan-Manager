# Action Vocabulary

> **Registry Guardrail.** Standardized action verbs and domain prefixes used across AXION pipeline scripts, API routes, and generated documentation. All pipeline commands and API endpoints must use verbs from this vocabulary.

---

## Domain Prefixes

Every action is scoped to a domain using the prefix from `domains.json`. The prefix determines which module owns the action.

| Domain | Slug | Prefix | Type | Example Action |
|--------|------|--------|------|----------------|
| Architecture | architecture | `arch:` | foundation | `arch:definePattern` |
| Systems | systems | `sys:` | foundation | `sys:mapComponent` |
| Contracts | contracts | `contract:` | foundation | `contract:defineEndpoint` |
| Database | database | `db:` | data | `db:createTable` |
| Data | data | `data:` | data | `data:transformFlow` |
| Auth | auth | `auth:` | security | `auth:configureProvider` |
| Backend | backend | `be:` | core | `be:implementRoute` |
| Integrations | integrations | `integ:` | core | `integ:connectService` |
| State | state | `state:` | frontend | `state:defineStore` |
| Frontend | frontend | `fe:` | frontend | `fe:buildPage` |
| Fullstack | fullstack | `fs:` | integration | `fs:wireFlow` |
| Testing | testing | `test:` | quality | `test:writeSuite` |
| Quality | quality | `qa:` | quality | `qa:runLint` |
| Security | security | `sec:` | crosscutting | `sec:auditPolicy` |
| DevOps | devops | `devops:` | operations | `devops:configurePipeline` |
| Cloud | cloud | `cloud:` | operations | `cloud:provisionInfra` |
| DevEx | devex | `dx:` | operations | `dx:setupTooling` |
| Mobile | mobile | `mobile:` | platform | `mobile:buildScreen` |
| Desktop | desktop | `desktop:` | platform | `desktop:buildWindow` |

---

## Standard Verbs

### CRUD Operations

| Verb | Meaning | When to Use | Example |
|------|---------|-------------|---------|
| `create` | Produce a new resource | New entity, file, or record | `db:createTable`, `be:createEndpoint` |
| `get` | Retrieve a single resource | Read by ID or unique key | `be:getUser`, `state:getSession` |
| `list` | Retrieve a collection | Read multiple resources | `be:listProjects`, `fe:listPages` |
| `update` | Modify an existing resource | Change fields on an existing record | `db:updateSchema`, `auth:updateRole` |
| `delete` | Remove a resource | Permanent or soft removal | `be:deleteProject`, `db:deleteTable` |

### Pipeline Operations

| Verb | Meaning | When to Use | Example |
|------|---------|-------------|---------|
| `generate` | Produce output from templates | Template-based file creation | `contract:generateSchema` |
| `seed` | Populate with initial data | Fill templates from RPBS/REBS | `db:seedFixtures` |
| `draft` | Create a working draft | AI-assisted content generation | `be:draftRoutes` |
| `review` | Evaluate for quality | Cross-reference check | `qa:reviewCoverage` |
| `verify` | Validate against rules | Gate condition evaluation | `contract:verifySchemas` |
| `lock` | Freeze for implementation | Produce immutable ERC | `sec:lockPolicy` |
| `scaffold` | Generate skeleton structure | Create initial file layout | `fe:scaffoldPages` |
| `build` | Compile/assemble output | Transform source to output | `be:buildServer` |
| `test` | Execute test suite | Run automated tests | `test:testIntegration` |
| `deploy` | Push to target environment | Production release | `devops:deployStaging` |
| `package` | Bundle into distributable | Create zip/archive | `fs:packageKit` |

### Analysis & Diagnostics

| Verb | Meaning | When to Use | Example |
|------|---------|-------------|---------|
| `scan` | Search for patterns | UNKNOWN detection, file analysis | `qa:scanUnknowns` |
| `check` | Evaluate a condition | Health check, prerequisite check | `devops:checkHealth` |
| `diagnose` | Identify root cause | System diagnostic | `sys:diagnoseFailure` |
| `reconcile` | Compare and align | Drift detection | `contract:reconcileImport` |
| `import` | Ingest external data | Analyze existing codebase | `sys:importRepo` |
| `validate` | Confirm correctness | Schema validation, input validation | `contract:validatePayload` |

### Lifecycle & State

| Verb | Meaning | When to Use | Example |
|------|---------|-------------|---------|
| `activate` | Make current/active | Set active build | `devops:activateBuild` |
| `initialize` | Set up for first use | Workspace creation | `sys:initializeWorkspace` |
| `configure` | Set parameters | Settings, env vars | `auth:configureOAuth` |
| `connect` | Establish integration | Third-party service link | `integ:connectStripe` |
| `wire` | Link components together | Frontend-backend connection | `fs:wireAuthFlow` |
| `clean` | Remove generated artifacts | Reset workspace | `devops:cleanBuilds` |
| `iterate` | Run improvement cycle | Orchestrated refinement | `qa:iterateReview` |
| `fill` | Populate content | Content-fill for UNKNOWNs | `data:fillTemplate` |
| `cascade` | Propagate changes downstream | Doc cascade after fill | `qa:cascadeFill` |
| `upgrade` | Apply improvement layer | Revision-based update | `sys:upgradeKit` |

### Definition & Mapping

| Verb | Meaning | When to Use | Example |
|------|---------|-------------|---------|
| `define` | Establish specification | New contract, schema, pattern | `arch:definePattern` |
| `map` | Create relationship | Component mapping, coverage | `sys:mapComponent` |
| `specify` | Detail requirements | Detailed specification | `contract:specifyEndpoint` |
| `document` | Record information | Documentation creation | `dx:documentApi` |

---

## Composition Rules

1. **Format:** `{prefix}:{verb}{Noun}` — camelCase after the colon.
2. **Prefix is mandatory.** Every action must be scoped to a domain.
3. **Use standard verbs.** Prefer verbs from the tables above. If a new verb is needed, add it to this vocabulary first.
4. **Noun is the target.** The noun describes what the action operates on (e.g., `Table`, `Route`, `Page`, `Policy`).
5. **No abbreviations in nouns.** Use `createEndpoint`, not `createEp`.

---

## Cross-References

- **Domain definitions:** See `domain-map.md`
- **Reason codes (failure results):** See `reason-codes.md`
- **Module inventory:** See `module-index.md`
