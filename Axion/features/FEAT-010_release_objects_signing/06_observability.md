# FEAT-010 — Release Objects & Signing: Observability

## 1. Metrics

- `release.created` — Count of releases created (increments on `createRelease`)
- `release.signed` — Count of releases signed (increments on `signRelease`)
- `release.published` — Count of releases published (increments on `publishRelease`)
- `release.revoked` — Count of releases revoked (increments on `revokeRelease`)
- `release.transition.invalid` — Count of rejected state transitions

## 2. Logging

### 2.1 CLI Output

The CLI commands produce structured console output:
- `[release] Created release {id} (v{version})`
- `[release] Signed release {id} by {signer}`
- `[release] Published release {id}`
- `[release] Revoked release {id}`
- `[release] {count} release(s) found`

### 2.2 Release Detail Output

Each CLI operation prints the release summary:
- ID, Run, Version, Status, Created, Updated, Artifacts count, Signatures count
- Optional: Notes, Revocation reason

## 3. Persistence Tracing

- Every state change writes the updated release JSON to disk
- Release files at `{basePath}/releases/{release_id}.json` serve as the audit trail
- The `updated_at` timestamp on each release tracks the last modification time

## 4. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
