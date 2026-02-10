# Gates and Overrides

AXION enforces quality gates to ensure documentation and code meet standards before progressing through the pipeline.

## Gate System

Gates are checkpoints that block stage execution until prerequisites are met.

### Documentation Pipeline Gates

| Stage | Requires | Gate Name | Can Override? |
|-------|----------|-----------|---------------|
| `draft` | seed complete | `DRAFT_BLOCKED_SEED_INCOMPLETE` | No |
| `review` | draft complete | (implicit) | No |
| `verify` | review complete | `VERIFY_BLOCKED_REVIEW_INCOMPLETE` | No |
| `lock` | verify PASS | `LOCK_REFUSED_VERIFY_NOT_PASS` | No |

### Application Pipeline Gates

| Stage | Requires | Gate Name | Can Override? |
|-------|----------|-----------|---------------|
| `scaffold-app` | docs locked | `SCAFFOLD_BLOCKED_DOCS_NOT_LOCKED` | Yes (`--override`) |
| `build` | scaffold-app complete | `BUILD_BLOCKED_SCAFFOLD_INCOMPLETE` | No |
| `deploy` | tests PASS | `DEPLOY_BLOCKED_TESTS_NOT_PASS` | Yes (`--override`) |

### Activation Gates

| Gate | Requires | Can Override? |
|------|----------|---------------|
| `docs_locked` | All modules locked | No |
| `verify_pass` | Latest verify PASS | No |
| `tests_pass` | Test report shows PASS | Yes (`--allow-no-tests`) |

---

## Using --override

The `--override` flag bypasses certain gates during development:

```bash
# Scaffold app without locked docs
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:bootstrap \
  --allow-nonempty --override

# Deploy without passing tests
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:ship \
  --allow-nonempty --override
```

### When to Use Override

| Scenario | Use Override? |
|----------|---------------|
| Active development, iterating quickly | Yes |
| Testing scaffold-app output | Yes |
| Production release | No |
| CI/CD pipeline | No |
| Demo/prototype | Yes |

---

## Gate Configuration

Gates are defined in `config/presets.json`:

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

**Note:** The `allow_override` field can be `true` (boolean) or a string token like `"dev_build"`. When using `--override`, the orchestrator checks if `allow_override` is truthy (either `true` or a non-empty string).

---

## Preset Guards

Presets can enforce additional guards:

```json
{
  "presets": {
    "system": {
      "guards": {
        "lock_requires_verify_pass": true
      }
    },
    "experimental": {
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
| `disallow_lock` | Lock stage is completely disabled |

---

## Gate Check Flow

When a stage runs, the orchestrator:

1. **Load gate config** from presets.json
2. **Check prerequisites**:
   - Required stage complete?
   - Verify pass (if needed)?
   - Docs locked (if needed)?
3. **If blocked**:
   - Check if `allow_override` is set
   - Check if `--override` flag provided
   - If both true, warn and continue
   - Otherwise, fail with error code
4. **If passed**, execute stage

---

## Error Codes

| Code | Meaning | Resolution |
|------|---------|------------|
| `DRAFT_BLOCKED_SEED_INCOMPLETE` | Seed stage not done | Run seed first |
| `VERIFY_BLOCKED_REVIEW_INCOMPLETE` | Review stage not done | Run review first |
| `LOCK_REFUSED_VERIFY_NOT_PASS` | Verify failed/incomplete | Fix verify issues |
| `SCAFFOLD_BLOCKED_DOCS_NOT_LOCKED` | Docs not locked | Lock docs or use `--override` |
| `BUILD_BLOCKED_SCAFFOLD_INCOMPLETE` | No app scaffold | Run scaffold-app first |
| `DEPLOY_BLOCKED_TESTS_NOT_PASS` | Tests failed/missing | Fix tests or use `--override` |

---

## Best Practices

### For Development
```bash
# Quick iteration with overrides
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset web --plan app:bootstrap \
  --allow-nonempty --override
```

### For Production
```bash
# No overrides, full gate enforcement
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan system:full
```

### For CI/CD
```bash
# JSON output, strict gates
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset release --plan docs:release \
  --json
```

---

## Viewing Gate Status

Check current gate status with:

```bash
npx tsx axion/scripts/axion-status.ts --root ./MyApp
```

Shows which stages are complete, blocked, or ready.
