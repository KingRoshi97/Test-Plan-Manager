# FEAT-010 — Release Objects & Signing: API Surface

## 1. Module Exports

Source modules:

- `src/core/controlPlane/releases.ts` — Core release lifecycle logic
- `src/cli/commands/release.ts` — CLI command wrappers

## 2. Types

### ReleaseStatus
```typescript
type ReleaseStatus = "draft" | "staged" | "published" | "revoked";
```

### Release
```typescript
interface Release {
  release_id: string;
  run_id: string;
  version: string;
  created_at: string;
  updated_at: string;
  status: ReleaseStatus;
  artifacts: Array<{ artifact_id: string; path: string; hash: string }>;
  signatures: Array<{ signer: string; signature: string; signed_at: string }>;
  notes?: string;
  revocation_reason?: string;
}
```

### State Machine
```typescript
const VALID_TRANSITIONS: Record<ReleaseStatus, ReleaseStatus[]> = {
  draft: ["staged", "revoked"],
  staged: ["published", "revoked"],
  published: ["revoked"],
  revoked: [],
};
```

## 3. Public Functions — releases.ts

### `createRelease(runId: string, version: string, basePath?: string, artifacts?: Array<{artifact_id, path, hash}>, notes?: string): Release`
Creates a new release in `draft` status. Generates a unique release ID, persists to disk.

### `signRelease(releaseId: string, signer: string, basePath?: string): Release`
Signs a draft release. Computes SHA-256 signature of `{ release_id, signer, signed_at, artifacts }`. Transitions status to `staged`.

### `publishRelease(releaseId: string, basePath?: string): Release`
Publishes a staged release. Requires at least one signature. Transitions status to `published`.

### `revokeRelease(releaseId: string, reason: string, basePath?: string): Release`
Revokes a release from any non-revoked state. Records the revocation reason.

### `getRelease(releaseId: string, basePath?: string): Release | null`
Retrieves a release by ID. Returns null if not found.

### `listReleases(basePath?: string): Release[]`
Lists all releases from the releases directory.

## 4. Public Functions — release.ts (CLI)

### `cmdRelease(baseDir: string, version: string, runId?: string, notes?: string): Release`
Creates a release from a pipeline run. Collects artifacts from the run's `artifact_index.json`. If no runId specified, uses the latest run.

### `cmdReleaseSign(baseDir: string, releaseId: string, signer: string): Release`
Signs a release via CLI.

### `cmdReleasePublish(baseDir: string, releaseId: string): Release`
Publishes a release via CLI.

### `cmdReleaseRevoke(baseDir: string, releaseId: string, reason: string): Release`
Revokes a release via CLI.

### `cmdReleaseGet(baseDir: string, releaseId: string): Release | null`
Retrieves and displays a release via CLI.

### `cmdReleaseList(baseDir: string): Release[]`
Lists and displays all releases via CLI.

## 5. Internal Functions — releases.ts

- `generateReleaseId(): string` — Generates `REL-{base36_timestamp}-{sequence}` IDs
- `releasesDir(basePath): string` — Returns releases directory path
- `releasePath(basePath, releaseId): string` — Returns release file path
- `loadRelease(basePath, releaseId): Release | null` — Loads release from disk
- `saveRelease(basePath, release): void` — Persists release to disk
- `assertTransition(current, target): void` — Validates state transitions

## 6. Internal Functions — release.ts (CLI)

- `collectArtifacts(runDir): Array<{artifact_id, path, hash}>` — Reads artifact_index.json and computes hashes
- `resolveRunDir(baseDir, runId?): string` — Resolves run directory path
- `resolveRunId(baseDir, runId?): string` — Resolves run ID (latest if unspecified)
- `printRelease(release): void` — Formats release for console output

## 7. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (error codes)
- SYS-03 (End-to-End Architecture)
