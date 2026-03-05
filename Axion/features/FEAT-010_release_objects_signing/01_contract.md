# FEAT-010 — Release Objects & Signing: Contract

## 1. Purpose

Manages the full release lifecycle for pipeline run outputs. Creates release objects that bundle artifacts from a completed run, tracks them through a state machine (draft → staged → published → revoked), and provides SHA-256 integrity signing before publication.

## 2. Inputs

- `runId` — ID of the completed pipeline run
- `version` — Semantic version string for the release
- `basePath` — Root path to `.axion` storage (default: `.axion`)
- `artifacts` — Array of `{ artifact_id, path, hash }` collected from the run's artifact index
- `signer` — Identity string of the signing actor (for sign operations)
- `reason` — Revocation reason string (for revoke operations)
- `notes` — Optional release notes

## 3. Outputs

- `Release` object persisted as JSON at `{basePath}/releases/{release_id}.json`
- Release ID format: `REL-{base36_timestamp}-{sequence_padded_4}`
- Each release contains: release_id, run_id, version, created_at, updated_at, status, artifacts[], signatures[], notes?, revocation_reason?

## 4. Invariants

- Release status follows the state machine: draft → staged, draft → revoked, staged → published, staged → revoked, published → revoked. No other transitions are permitted.
- A release cannot be published unless it has at least one signature.
- Signing transitions the release from `draft` to `staged`.
- Each signature includes a SHA-256 hash of the payload `{ release_id, signer, signed_at, artifacts }`.
- Revoked releases cannot transition to any other state.
- Release objects are persisted to disk on every state change.

## 5. Dependencies

- FEAT-001 (Control Plane Core) — Run lifecycle that produces artifacts
- FEAT-004 (Artifact Store) — Artifact storage and hashing
- FEAT-009 (Export Bundles / Kit) — Kit packaging that produces the artifact index

## 6. Source Modules

- `src/core/controlPlane/releases.ts` — Core release logic (create, sign, publish, revoke, get, list)
- `src/cli/commands/release.ts` — CLI commands (cmdRelease, cmdReleaseSign, cmdReleasePublish, cmdReleaseRevoke, cmdReleaseGet, cmdReleaseList)

## 7. Failure Modes

- Invalid state transition (e.g., publishing a draft without signing first)
- Release not found by ID
- Publishing without signatures
- Run directory or artifact index not found when creating a release

## 8. Cross-References

- SYS-03 (End-to-End Architecture)
- SYS-07 (Compliance & Gate Model)
- GOV-01 (Versioning Policy)
