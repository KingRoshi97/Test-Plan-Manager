# AXION Test Matrix

This document defines the complete test matrix for validating the AXION documentation generation pipeline.

## Test Infrastructure

### Fixture Workspace

Location: `axion/tests/fixtures/workspace/`

Contents:
- `config/domains.json` - Full 19-module configuration with dependencies and canonical order
- `domains/core/RPBS_Product.md` - Placeholder RPBS document
- `domains/core/REBS_Product.md` - Placeholder REBS document
- `templates/_minimal.template.md` - Minimal module template
- `registry/stage_markers.json` - Empty stage marker registry
- `registry/verify_status.json` - Empty verification status

### Running Tests

```bash
npx ts-node axion/tests/helpers/test-runner.ts
npx ts-node axion/tests/helpers/test-runner.ts --filter "generate"
npx ts-node axion/tests/helpers/test-runner.ts --filter "determinism"
```

---

## 12 Must-Have Tests

These tests form the minimum validation for system correctness.

| # | Test Name | Command | Assertions |
|---|-----------|---------|------------|
| 1 | generate --all order | `axion-generate --all` | Exit 0; markers written in canonical order |
| 2 | generate --module only | `axion-generate --module X` | Exit 0; only X touched; other modules untouched |
| 3 | blocked prereqs JSON | `axion-seed --module frontend` | blocked_by JSON with: status, stage, module, missing[], hint[] |
| 4 | generate from templates | `axion-generate --module X` | Exit 0; doc has contract header, sections, ACCEPTANCE |
| 5 | seed idempotent | `axion-seed --module X` (x2) | Placeholder count unchanged; file hash stable |
| 6 | draft requires seed | `axion-draft --module X` (no seed) | blocked_by or exit non-zero; hint mentions seed |
| 7 | review counts UNKNOWN | `axion-review --module X` | Output contains unknown_count; detects UNKNOWN tokens |
| 8 | review catches cross-refs | `axion-review --module X` | Detects broken links to nonexistent modules |
| 9 | verify fails critical | `axion-verify --module X` | Exit non-zero; verify_status.json written; status=FAIL |
| 10 | lock requires verify | `axion-lock --module X` | Refused without verify PASS; refusal message printed |
| 11 | lock generates ERC | `axion-lock --module X` (after PASS) | Exit 0; ERC.md created; lock marker written |
| 12 | rerun determinism | Full pipeline x2 | Same inputs produce identical output hashes |

---

## Standard Assertion Format

Every test asserts:

1. **Exit Code**
   - `0` for success
   - Non-zero for failures or blocking

2. **Stdout Contains** (one of):
   - `blocked_by` JSON with required shape
   - Success message + marker confirmation

3. **Files** (exist or not):
   - Module docs created at expected paths
   - Stage markers written to registry
   - ERC generated on lock

4. **Stage Marker**:
   - Written on success
   - Not written (or marked blocked) on failure

---

## blocked_by JSON Shape

```json
{
  "status": "blocked_by",
  "stage": "<current_stage>",
  "module": "<target_module>",
  "missing": ["<prereq1>", "<prereq2>"],
  "hint": [
    "npx ts-node axion/scripts/axion-<stage>.ts --module <prereq1>",
    "npx ts-node axion/scripts/axion-<stage>.ts --module <prereq2>"
  ]
}
```

---

## Success Response Shape

```json
{
  "status": "success",
  "stage": "<current_stage>",
  "module": "<target_module>",
  "files_created": ["domains/<module>/README.md"],
  "marker_written": true
}
```

---

## Verify Status Shape

File: `registry/verify_status.json`

```json
{
  "version": "1.0.0",
  "last_verified": "2026-02-03T12:00:00Z",
  "modules": {
    "<module>": {
      "status": "PASS" | "FAIL",
      "verified_at": "2026-02-03T12:00:00Z",
      "reason_codes": ["MISSING_SECTION", "TBD_IN_REQUIRED"],
      "hints": ["Fill required sections before verify"]
    }
  }
}
```

---

## Stage Markers Shape

File: `registry/stage_markers.json`

```json
{
  "version": "1.0.0",
  "markers": {
    "<module>": {
      "generate": {
        "completed_at": "2026-02-03T12:00:00Z",
        "files": ["domains/<module>/README.md"]
      },
      "seed": {
        "completed_at": "2026-02-03T12:01:00Z"
      },
      "draft": {
        "completed_at": "2026-02-03T12:02:00Z"
      },
      "review": {
        "completed_at": "2026-02-03T12:03:00Z",
        "unknown_count": 0,
        "issues": []
      },
      "verify": {
        "completed_at": "2026-02-03T12:04:00Z",
        "status": "PASS"
      },
      "lock": {
        "completed_at": "2026-02-03T12:05:00Z",
        "erc_path": "domains/<module>/ERC.md"
      }
    }
  }
}
```

---

## Reason Codes

| Code | Severity | Description |
|------|----------|-------------|
| MISSING_SECTION | critical | Required section not present |
| EMPTY_SECTION | critical | Section exists but has no content |
| TBD_IN_REQUIRED | critical | [TBD] placeholder in required field |
| UNKNOWN_WITHOUT_QUESTION | warning | UNKNOWN used without OPEN_QUESTION |
| BROKEN_CROSS_REF | warning | Link to nonexistent module doc |
| MISSING_ACCEPTANCE | critical | No ACCEPTANCE criteria section |
| SEAM_OWNER_VIOLATION | critical | Non-owner defines seam content |
| SEAM_MISSING_LINK | warning | References seam without link |
| PREREQ_NOT_SATISFIED | critical | Stage prerequisite not met |

---

## Extended Test Categories

### A. ROSHI Sequential Flow Tests
- Doc existence gates (REBS requires RPBS, etc.)
- Derivation boundary tests (no illegal sources)
- Point of No Return behavior

### B. Pipeline Stage Tests
- init creates workspace
- generate creates module folders
- seed adds neutral scaffolding
- draft fills content
- review validates and counts
- verify gates on critical issues
- lock freezes and generates ERC

### C. Module Dependency Tests
- Dependency blocking for each module
- Canonical --all order enforcement

### D. Template Realism Tests
- Template completeness (required sections)
- Template reuse stability

### E. Determinism Tests
- Same inputs produce same outputs
- Controlled change produces localized diff

### F. Negative Path Tests
- Invalid domains.json handling
- Missing template file handling
- Path traversal guard
- Read-only filesystem handling

---

## File Locations

| File | Purpose |
|------|---------|
| `axion/tests/fixtures/workspace/` | Fresh workspace per test |
| `axion/tests/helpers/test-utils.ts` | Test utilities and assertions |
| `axion/tests/helpers/test-runner.ts` | Test execution framework |
| `axion/tests/suites/must-have.test.ts` | 12 must-have tests |
| `axion/tests/TEST_MATRIX.md` | This documentation |

---

## Adding New Tests

1. Add test to appropriate suite in `axion/tests/suites/`
2. Use `createTestWorkspace()` for fresh fixture copy
3. Use `runAxionCommand()` to execute pipeline commands
4. Assert using provided helpers (`assertExitCode`, `assertContains`, etc.)
5. Always call `ctx.cleanup()` in finally block
6. Update this matrix document

---

## Maintenance

- Run tests after any pipeline script changes
- Update TEST_MATRIX.md when adding new tests or reason codes
- Keep fixture workspace minimal but complete
- Hash templates to detect fixture drift
