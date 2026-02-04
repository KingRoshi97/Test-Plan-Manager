# Stage Markers

Stage markers track pipeline progress in `registry/stage_markers.json`.

## File Structure

```json
{
  "architecture": {
    "generate": {
      "completed_at": "2026-02-04T10:00:00Z",
      "status": "success"
    },
    "seed": {
      "completed_at": "2026-02-04T10:01:00Z",
      "status": "success"
    },
    "draft": {
      "completed_at": "2026-02-04T10:05:00Z",
      "status": "success"
    },
    "review": {
      "completed_at": "2026-02-04T10:10:00Z",
      "status": "success"
    },
    "verify": {
      "completed_at": "2026-02-04T10:15:00Z",
      "status": "pass",
      "report": { ... }
    },
    "lock": {
      "completed_at": "2026-02-04T10:20:00Z",
      "status": "success",
      "checksum": "abc123..."
    }
  },
  "backend": {
    "generate": { ... },
    "seed": { ... }
  }
}
```

## Flat Structure

The markers use a **flat structure**: `{ moduleName: { stageName: data } }`

This avoids nested patterns like `markers.markers` and provides consistent access.

---

## Stage Status Values

| Stage | Status Values |
|-------|---------------|
| `generate` | `success`, `failed` |
| `seed` | `success`, `failed` |
| `draft` | `success`, `failed` |
| `review` | `success`, `failed` |
| `verify` | `pass`, `fail`, `partial` |
| `lock` | `success`, `failed` |

---

## Reading Markers

```typescript
import * as fs from 'fs';

const markersPath = `${workspaceRoot}/registry/stage_markers.json`;
const markers = JSON.parse(fs.readFileSync(markersPath, 'utf-8'));

// Check if module has completed a stage
const isSeeded = markers['architecture']?.['seed']?.status === 'success';

// Get all seeded modules
const seededModules = Object.keys(markers).filter(
  m => markers[m]?.['seed']?.status === 'success'
);
```

---

## Writing Markers

```typescript
// Update a single module's stage
markers['architecture'] = markers['architecture'] || {};
markers['architecture']['draft'] = {
  completed_at: new Date().toISOString(),
  status: 'success'
};

fs.writeFileSync(markersPath, JSON.stringify(markers, null, 2));
```

---

## Gate Checks Using Markers

The orchestrator checks markers before allowing stage execution:

```typescript
function canDraft(module: string, markers: object): boolean {
  // draft requires seed complete
  return markers[module]?.['seed']?.status === 'success';
}

function canVerify(module: string, markers: object): boolean {
  // verify requires review complete
  return markers[module]?.['review']?.status === 'success';
}

function canLock(module: string, markers: object): boolean {
  // lock requires verify pass
  return markers[module]?.['verify']?.status === 'pass';
}
```

---

## Verify Report

The verify stage also writes `registry/verify_report.json`:

```json
{
  "generated_at": "2026-02-04T10:15:00Z",
  "current_revision": 1,
  "modules": {
    "architecture": {
      "status": "pass",
      "issues": [],
      "warnings": []
    },
    "backend": {
      "status": "fail",
      "issues": [
        {
          "rule": "unknown_placeholder",
          "message": "UNKNOWN placeholder found in section X",
          "severity": "error"
        }
      ],
      "warnings": []
    }
  },
  "summary": {
    "total": 19,
    "passed": 18,
    "failed": 1
  }
}
```

---

## Lock Records

The lock stage writes checksums to `registry/locks/`:

```
registry/locks/
├── architecture.json
├── backend.json
└── frontend.json
```

Each lock file:
```json
{
  "module": "architecture",
  "locked_at": "2026-02-04T10:20:00Z",
  "files": [
    {
      "path": "domains/architecture/README.md",
      "checksum": "sha256:abc123..."
    }
  ]
}
```

---

## Run History

Each run creates a history file in `registry/run_history/`:

```
registry/run_history/
├── run_2026-02-04T10-00-00_abc123.json
├── run_2026-02-04T11-00-00_def456.json
└── run_2026-02-04T12-00-00_ghi789.json
```

Run history includes:
- Run ID and timestamps
- Preset and plan used
- Modules processed
- Stage results
- Overall status

---

## Inspecting Markers

Use `axion-status.ts` to view current state:

```bash
npx tsx axion/scripts/axion-status.ts --root ./MyApp
```

Output shows per-module stage completion:
```
Module: architecture
  generate: success (2026-02-04T10:00:00Z)
  seed: success (2026-02-04T10:01:00Z)
  draft: success (2026-02-04T10:05:00Z)
  review: pending
  verify: pending
  lock: pending

Module: backend
  generate: success (2026-02-04T10:00:00Z)
  seed: pending
  ...
```

---

## Resetting Markers

To re-run a stage, delete its marker:

```typescript
// Reset a single stage
delete markers['architecture']['draft'];

// Reset all stages for a module
delete markers['architecture'];

// Reset everything
markers = {};
```

Or use `axion-clean.ts`:
```bash
npx tsx axion/scripts/axion-clean.ts --root ./MyApp
```
