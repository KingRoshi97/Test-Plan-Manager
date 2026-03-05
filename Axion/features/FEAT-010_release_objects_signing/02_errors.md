# FEAT-010 — Release Objects & Signing: Error Codes

## 1. Error Code Format

Errors are thrown as standard `Error` objects with descriptive messages. No domain-prefixed error code registry is used; errors are identified by message pattern.

## 2. Error Catalog

| Error Message Pattern | Thrown By | Cause | Remediation |
|----------------------|-----------|-------|-------------|
| `Invalid release transition: {current} → {target}. Allowed: {list}` | `assertTransition()` | Attempted a state change not permitted by the state machine | Check the current status and only attempt valid transitions (draft→staged, staged→published, any→revoked) |
| `Release {id} not found` | `signRelease()`, `publishRelease()`, `revokeRelease()`, `getRelease()` | No release JSON file exists for the given ID | Verify the release ID is correct and the basePath points to the right .axion directory |
| `Release {id} must be signed before publishing` | `publishRelease()` | Attempted to publish a release with zero signatures | Call `signRelease()` first to add at least one signature |
| `Run directory not found: {path}` | `cmdRelease()` | The specified run directory does not exist | Ensure the run has completed and the run ID is correct |
| `No runs directory found at {path}` | `resolveRunDir()`, `resolveRunId()` | The `.axion/runs` directory does not exist | Run a pipeline first to create the runs directory |
| `No runs found` | `resolveRunDir()`, `resolveRunId()` | The runs directory exists but contains no run entries | Complete at least one pipeline run before creating a release |

## 3. Error Handling Rules

- All errors are thrown synchronously as `Error` instances
- State transition errors include the current status, target status, and allowed transitions
- Release-not-found errors include the release ID for traceability
- No errors are silently swallowed; all propagate to the caller

## 4. Cross-References

- FEAT-017 (Error Taxonomy & Registry)
- SYS-07 (Compliance & Gate Model)
