# Troubleshooting

Common failures organized by pipeline phase, with resolutions.

---

## Setup Phase

### "axion/ not found in build root"

**Cause:** The `--build-root` argument points to a directory that doesn't contain `axion/`.

**Fix:** Make sure `--build-root` points to the parent directory that contains `axion/` as a child.

```bash
# Wrong — pointing inside axion/
npx tsx axion/scripts/axion-run.ts --build-root ./axion ...

# Right — pointing to the parent
npx tsx axion/scripts/axion-run.ts --build-root . ...
```

### "Workspace not empty"

**Cause:** The workspace directory already exists and has files. The default safety policy refuses to overwrite.

**Fix:** Use `--allow-nonempty` to continue with the existing workspace, or `--archive-existing` to move it aside first.

```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan docs:content \
  --allow-nonempty
```

### "Run lock already held"

**Cause:** A previous run crashed or is still running, leaving a stale lock file.

**Fix:** Run `axion-doctor` to check. If the lock is stale (>30 minutes old), delete `<workspace>/registry/.run_lock` manually, or run `axion-clean`.

```bash
npx tsx axion/scripts/axion-doctor.ts --root ./MyApp
npx tsx axion/scripts/axion-clean.ts --root ./MyApp
```

---

## Documentation Pipeline

### DRAFT_BLOCKED_SEED_INCOMPLETE

**Cause:** Trying to run `draft` before `seed` has completed for the target module.

**Fix:** Run the seed stage first, or use a plan that includes both (like `docs:full`).

```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan docs:full
```

### VERIFY_BLOCKED_REVIEW_INCOMPLETE

**Cause:** Trying to run `verify` before `review` has completed.

**Fix:** Run `docs:content` (which includes draft, review, verify) or run review first.

### LOCK_REFUSED_VERIFY_NOT_PASS

**Cause:** Verify reported failures (UNKNOWN placeholders, missing content, contract violations). Lock refuses to proceed.

**Fix:** Check the verify report, fix the issues, and re-run verify.

```bash
# Check what failed
cat MyApp/registry/verify_report.json | jq '.modules | to_entries[] | select(.value.status == "fail")'

# Fix issues, then re-run
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan docs:release \
  --allow-nonempty
```

### UNKNOWN Placeholders Remaining

**Cause:** Template content still contains `UNKNOWN` tokens that the AI content-fill didn't resolve.

**Fix:** Use the interactive revision flow from the dashboard ("Revise UNKNOWNs" button), or run content-fill from CLI:

```bash
npx tsx axion/scripts/axion-content-fill.ts --scan    # See what's UNKNOWN
npx tsx axion/scripts/axion-content-fill.ts --fill     # AI-fill UNKNOWNs
```

### Draft Overwrites Rich Templates with Stubs

**Cause:** The `draft` step may overwrite `seed`-generated templates if dependency ordering is incorrect or if the draft AI prompt doesn't receive the seeded content as context.

**Fix:** Ensure `seed` completes before `draft`. Check that the draft script reads existing template content before generating.

---

## App Pipeline

### SCAFFOLD_BLOCKED_DOCS_NOT_LOCKED

**Cause:** Trying to scaffold the app before documentation is locked.

**Fix:** Lock docs first, or use `--override` for development:

```bash
# Lock first (production)
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan docs:release \
  --allow-nonempty

# Or override (development only)
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:bootstrap \
  --allow-nonempty --override
```

### BUILD_BLOCKED_SCAFFOLD_INCOMPLETE

**Cause:** No `app/` directory exists. Scaffold-app hasn't run.

**Fix:** Run `app:bootstrap` first.

### DEPLOY_BLOCKED_TESTS_NOT_PASS

**Cause:** Test suite failed or hasn't been run.

**Fix:** Fix failing tests and re-run, or use `--override` for development.

```bash
# Check test report
cat MyApp/registry/test_report.json | jq '.passed, .failed_count'
```

---

## Activation Failures

### "docs_locked gate failed"

**Cause:** Not all modules are locked. Activation requires a complete lock across every module.

**Fix:** Check which modules are unlocked:

```bash
npx tsx axion/scripts/axion-status.ts --root ./MyApp
```

Lock the remaining modules before activating.

### "verify_pass gate failed"

**Cause:** The latest verify report doesn't show PASS.

**Fix:** Re-run verify and fix any failures.

### "tests_pass gate failed"

**Cause:** Tests haven't passed. Use `--allow-no-tests` if tests aren't ready yet:

```bash
npx tsx axion/scripts/axion-activate.ts \
  --build-root . --project-name MyApp \
  --allow-no-tests
```

---

## Transient Failures

The orchestrator automatically retries these errors with exponential backoff:

| Error | Description | Typical Cause |
|-------|-------------|---------------|
| `ENOENT` | File not found | Race condition during parallel writes |
| `ETIMEDOUT` | Network timeout | Slow AI API response |
| `ECONNRESET` | Connection reset | Network instability |
| Exit code `137` | OOM kill | Process exceeded memory limit |

If retries are exhausted, the pipeline stops at the failed step. You can resume from that step using the dashboard's "Retry from Failed Step" feature.

---

## Dashboard Issues

### Pipeline SSE Stream Disconnects

**Cause:** Long-running stages may exceed connection timeouts.

**Fix:** The dashboard automatically reconnects. If it doesn't, refresh the Assembly Control Room page. The pipeline continues running server-side regardless of the SSE connection.

### Workspace Not Appearing in Dashboard

**Cause:** The workspace doesn't have any detection markers (`registry/`, `domains/`, `app/`, or `manifest.json`).

**Fix:** Run at least `kit-create` or `prepare-root` to create the standard workspace structure.

---

## General Diagnostics

Run the full diagnostic suite:

```bash
npx tsx axion/scripts/axion-doctor.ts --root ./MyApp
```

Doctor checks 18 categories including:
- Active build presence and validity
- System root pollution
- Stale run locks
- Stage marker consistency
- Missing prerequisites

For a quick status overview:

```bash
npx tsx axion/scripts/axion-status.ts --root ./MyApp
npx tsx axion/scripts/axion-next.ts --root ./MyApp
```
