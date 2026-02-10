# Release Gates

AXION enforces quality gates to ensure documentation and code meet standards before progressing through the pipeline. Gates are checkpoints that block stage execution until prerequisites are met.

## Gate Summary

### Documentation Pipeline Gates

| Stage | Requires | Gate Code | Can Override? |
|-------|----------|-----------|---------------|
| `draft` | `seed` complete | `DRAFT_BLOCKED_SEED_INCOMPLETE` | No |
| `review` | `draft` complete | (implicit) | No |
| `verify` | `review` complete | `VERIFY_BLOCKED_REVIEW_INCOMPLETE` | No |
| `lock` | `verify` status = PASS | `LOCK_REFUSED_VERIFY_NOT_PASS` | No |

### App Pipeline Gates

| Stage | Requires | Gate Code | Can Override? |
|-------|----------|-----------|---------------|
| `scaffold-app` | Docs locked | `SCAFFOLD_BLOCKED_DOCS_NOT_LOCKED` | Yes (`--override`) |
| `build` | `scaffold-app` complete | `BUILD_BLOCKED_SCAFFOLD_INCOMPLETE` | No |
| `deploy` | Tests PASS | `DEPLOY_BLOCKED_TESTS_NOT_PASS` | Yes (`--override`) |

### Activation Gates

| Gate | Requires | Can Override? |
|------|----------|---------------|
| `docs_locked` | All modules locked | No |
| `verify_pass` | Latest verify PASS | No |
| `tests_pass` | Test report shows PASS | Yes (`--allow-no-tests`) |

---

## Gate Check Flow

When a stage runs, the orchestrator:

1. **Load gate config** from `config/presets.json`
2. **Check prerequisites:**
   - Required predecessor stage complete?
   - Verify pass (if needed)?
   - Docs locked (if needed)?
3. **If blocked:**
   - Check if `allow_override` is set in the gate config
   - Check if `--override` flag was provided by the caller
   - If both true → warn and continue
   - Otherwise → fail with SCREAMING_SNAKE_CASE error code
4. **If passed** → execute stage

---

## Using --override

The `--override` flag bypasses gates that allow it. Only `scaffold-app` and `deploy` permit overrides.

```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:bootstrap \
  --allow-nonempty --override
```

### When to Use Override

| Scenario | Override? |
|----------|-----------|
| Active development, iterating quickly | Yes |
| Testing scaffold-app output | Yes |
| Demo or prototype | Yes |
| Production release | No |
| CI/CD pipeline | No |

---

## Gate Configuration

Gates are defined in `config/presets.json` under the `"gates"` key:

```json
{
  "gates": {
    "draft": {
      "requires_stage": "seed",
      "error": "DRAFT_BLOCKED_SEED_INCOMPLETE",
      "message": "draft blocked unless seed complete for target module(s)"
    },
    "scaffold-app": {
      "requires_docs_locked": true,
      "allow_override": "dev_build",
      "error": "SCAFFOLD_BLOCKED_DOCS_NOT_LOCKED",
      "message": "scaffold-app blocked unless docs are locked (or explicit override)"
    },
    "deploy": {
      "requires_tests_pass": true,
      "allow_override": true,
      "error": "DEPLOY_BLOCKED_TESTS_NOT_PASS",
      "message": "deploy blocked unless tests PASS (or explicit override)"
    }
  }
}
```

The `allow_override` field can be `true` (boolean) or a string token like `"dev_build"`. The orchestrator checks if `allow_override` is truthy.

---

## Preset Guards

Presets can enforce additional guards beyond the per-stage gates:

```json
{
  "presets": {
    "system": {
      "guards": {
        "lock_requires_verify_pass": true
      }
    },
    "prelock": {
      "guards": {
        "disallow_lock": true
      }
    }
  }
}
```

| Guard | Effect |
|-------|--------|
| `lock_requires_verify_pass` | Lock stage requires latest verify to PASS |
| `disallow_lock` | Lock stage is completely disabled for this preset |

---

## Error Codes

All gate failures use SCREAMING_SNAKE_CASE reason codes. The `blocked_by` field in error responses tells the caller exactly what prerequisite is missing.

| Code | Meaning | Resolution |
|------|---------|------------|
| `DRAFT_BLOCKED_SEED_INCOMPLETE` | Seed stage not done | Run seed first |
| `VERIFY_BLOCKED_REVIEW_INCOMPLETE` | Review stage not done | Run review first |
| `LOCK_REFUSED_VERIFY_NOT_PASS` | Verify failed or incomplete | Fix verify issues, re-run verify |
| `SCAFFOLD_BLOCKED_DOCS_NOT_LOCKED` | Docs not locked | Lock docs or use `--override` |
| `BUILD_BLOCKED_SCAFFOLD_INCOMPLETE` | No app scaffold | Run scaffold-app first |
| `DEPLOY_BLOCKED_TESTS_NOT_PASS` | Tests failed or missing | Fix tests or use `--override` |

---

## Change Contract

When making changes to the AXION system itself, use the change contract template at `templates/core/CHANGE_CONTRACT_TEMPLATE.md`. A change contract documents:

- **Problem:** What breaks today or what you're improving
- **Scope:** Which scripts, artifacts, contracts, and schemas are affected
- **Backward Compatibility:** Whether old kits still work
- **Test Plan:** Fixtures and tests added
- **Rollout Plan:** Feature flags, phased rollout, or immediate

The contract ensures that every system change is traceable, testable, and reviewable before implementation.

---

## Viewing Gate Status

Check current gate status with:

```bash
npx tsx axion/scripts/axion-status.ts --root ./MyApp
```

Shows which stages are complete, blocked, or ready per module.
