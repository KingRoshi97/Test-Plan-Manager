# Run Sequences

> **Registry Guardrail.** Deterministic stage ordering for all pipeline runs. Defines every stage plan, the gate conditions between stages, and the failure handling policy. Sourced from `config/presets.json`.

---

## Pipeline Stages

The complete set of pipeline stages, in canonical order:

| # | Stage | Script | Purpose | Input | Output |
|---|-------|--------|---------|-------|--------|
| 1 | `generate` | `axion-generate.mjs` | Create domain folder structure and template files | `domains.json`, templates | Per-module folders with template `.md` files |
| 2 | `seed` | `axion-seed.mjs` | Populate templates with data from RPBS/REBS | RPBS, REBS, templates | Seeded `.md` files with project-specific data |
| 3 | `draft` | `axion-draft.mjs` | AI-assisted content generation for each module | Seeded templates | Drafted `.md` files with AI-generated content |
| 4 | `content-fill` | `axion-content-fill.ts` | Scan for UNKNOWNs, fill with AI, cascade across docs | Drafted templates | Filled `.md` files, reduced UNKNOWN count |
| 5 | `review` | `axion-review.mjs` | Cross-reference check and quality review | Drafted/filled templates | Review annotations, quality score |
| 6 | `verify` | `axion-verify.mjs` | Validate against rules, check for UNKNOWNs, run gates | Reviewed templates | Verify report: PASS or FAIL with reason codes |
| 7 | `lock` | `axion-lock.mjs` | Freeze docs, generate ERC | Verified templates (PASS) | Locked `.md` files, ERC document |
| 8 | `scaffold-app` | `axion-scaffold-app.ts` | Generate application skeleton from locked docs | Locked docs, stack profile | Application file structure |
| 9 | `build-plan` | `axion-build-plan.ts` | Generate structured build execution plan | Scaffold, locked docs | Build plan JSON |
| 10 | `build-exec` | `axion-build-exec.ts` | Execute build plan, produce application files | Build plan | Generated application code |
| 11 | `build` | `axion-build.ts` | Compile the scaffolded application | Scaffold output | Compiled application |
| 12 | `test` | `axion-test.ts` | Run test suite | Built application | Test results: PASS or FAIL |
| 13 | `deploy` | `axion-deploy.ts` | Deploy to target environment | Built + tested application | Deployment record |
| 14 | `package` | `axion-package.mjs` / `.ts` | Bundle into distributable zip | All artifacts | Agent Kit zip file |
| 15 | `import` | `axion-import.ts` | Analyze existing codebase | Source repository | Import report, documentation seeds |

---

## Stage Plans

Named sequences of stages. The orchestrator runs the stages in a plan sequentially, enforcing gates between each.

### Documentation Plans

| Plan | Label | Stages | Purpose |
|------|-------|--------|---------|
| `docs:full` | Generate Documentation | generate → seed → draft → content-fill → review → verify | Full documentation generation cycle |
| `docs:release` | Lock Documentation | verify → lock | Verify and lock docs for handoff |

### Application Plans

| Plan | Label | Stages | Purpose |
|------|-------|--------|---------|
| `app:bootstrap` | Scaffold Application | scaffold-app | Generate application skeleton |
| `app:build` | Compile Application | build | Compile the scaffold |
| `app:test` | Run Tests | test | Execute the test suite |
| `app:full` | Build Application | scaffold-app → build → test | Full app build cycle |
| `app:build-exec` | Build with Exec Plan | scaffold-app → build-plan → build-exec → test | AI-driven build with execution plan |
| `app:ship` | Deploy Application | deploy | Deploy to target environment |

### System Plans

| Plan | Label | Stages | Purpose |
|------|-------|--------|---------|
| `system:full` | Full Pipeline (E2E) | generate → seed → draft → content-fill → review → verify → lock → scaffold-app → build → test → deploy → package | Everything from idea to packaged kit |
| `system:import` | Import Existing Project | import | Analyze existing codebase |

### Export Plans

| Plan | Label | Stages | Purpose |
|------|-------|--------|---------|
| `export:package` | Export Agent Kit | package | Bundle into downloadable zip |

---

## Gate Conditions

Gates enforce preconditions before a stage can execute. If a gate fails, the pipeline halts with a reason code.

| Gate | Stage Blocked | Condition | Reason Code | Override |
|------|---------------|-----------|-------------|----------|
| Seed → Draft | `draft` | `seed` must be complete for target modules | `DRAFT_BLOCKED_SEED_INCOMPLETE` | No |
| Review → Verify | `verify` | `review` must be complete | `VERIFY_BLOCKED_REVIEW_INCOMPLETE` | No |
| Verify → Lock | `lock` | Latest `verify` result must be PASS | `LOCK_REFUSED_VERIFY_NOT_PASS` | No |
| Lock → Scaffold | `scaffold-app` | Docs must be locked | `SCAFFOLD_BLOCKED_DOCS_NOT_LOCKED` | `dev_build` |
| Scaffold → Build | `build` | `scaffold-app` must be complete | `BUILD_BLOCKED_SCAFFOLD_INCOMPLETE` | No |
| Test → Deploy | `deploy` | Tests must PASS | `DEPLOY_BLOCKED_TESTS_NOT_PASS` | Yes |

### Gate Flow Diagram

```
generate → seed ──[gate]──→ draft → content-fill → review ──[gate]──→ verify ──[gate]──→ lock
                                                                                          │
                                                                                    [gate]│
                                                                                          ▼
                                                                              scaffold-app ──[gate]──→ build → test ──[gate]──→ deploy → package
```

---

## Per-Module Iteration

Within each stage, modules are processed in canonical order (see `domain-build-order.md`). The orchestrator ensures:

1. **Dependency ordering:** A module's stage runs only after all its dependencies have completed the same stage.
2. **ensurePrereqs:** The `review`, `draft`, `verify`, and `lock` stages call `ensurePrereqs()` per module to confirm dependency gates.
3. **Non-blocking verify:** The verify step sets `verifyPassed=false` but does **not** halt the pipeline. The lock gate is what actually blocks.

---

## Failure Handling

### Transient Failure Retry

Transient failures are automatically retried with exponential backoff (managed by `lib/retry.ts`):

| Error Type | Detection | Max Retries | Backoff |
|-----------|-----------|-------------|---------|
| ENOENT | File not found (race condition) | 3 | Exponential |
| ETIMEDOUT | Network timeout | 3 | Exponential |
| ECONNRESET | Connection reset | 3 | Exponential |
| OOM-kill | Exit code 137 | 2 | Exponential |

### Non-Transient Failures

Non-transient failures halt the pipeline immediately. The failed step and reason code are recorded in the run history.

| Failure Type | Behavior | Resume Strategy |
|-------------|----------|-----------------|
| Gate failure | Pipeline halts, reason code emitted via SSE | Fix the prerequisite, then retry from failed step |
| Verification failure | `verifyPassed=false` set, pipeline continues to next module | Fix UNKNOWNs/issues, re-run verify |
| Script crash | Pipeline halts, error captured in run record | Fix the issue, retry from failed step |
| AI API error | Retried as transient if ETIMEDOUT/ECONNRESET, else halt | Wait and retry, or fix prompt/config |

### Retry from Failed Step

The orchestrator supports resuming from the exact step that failed:

1. Previous successful steps are skipped
2. The failed step is re-executed
3. Remaining steps continue normally

---

## Preset Guards

Some presets define additional guards that modify gate behavior:

| Preset | Guard | Effect |
|--------|-------|--------|
| `system` | `lock_requires_verify_pass: true` | Lock gate enforced (default behavior) |
| `prelock` | `disallow_lock: true` | Lock stage is skipped even if included in the plan |
| `release` | `lock_requires_verify_pass: true` | Lock gate strictly enforced |

---

## Cross-References

- **Module execution order:** See `domain-build-order.md`
- **Preset module selections:** See `domain-build-order.md` (Preset-Based Subsets)
- **Reason code definitions:** See `reason-codes.md`
- **Stage plan definitions:** Sourced from `config/presets.json`
