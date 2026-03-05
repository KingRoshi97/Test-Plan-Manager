# FEAT-010 — Release Objects & Signing: Test Plan

## 1. Unit Tests — releases.ts

### 1.1 createRelease()
- Creates a release with status `draft`, correct run_id, version, timestamps
- Generates unique release IDs with `REL-` prefix
- Persists release JSON to `{basePath}/releases/{release_id}.json`
- Handles empty artifacts array
- Stores optional notes field

### 1.2 signRelease()
- Transitions release from `draft` to `staged`
- Appends a signature entry with signer, SHA-256 hash, and signed_at timestamp
- Throws if release ID not found
- Throws if release is not in `draft` status (invalid transition)

### 1.3 publishRelease()
- Transitions release from `staged` to `published`
- Throws if release has zero signatures
- Throws if release is in `draft` status (must sign first)
- Throws if release ID not found

### 1.4 revokeRelease()
- Transitions release to `revoked` from any non-revoked state (draft, staged, published)
- Stores revocation_reason
- Throws if release is already revoked
- Throws if release ID not found

### 1.5 getRelease()
- Returns the release object for a valid ID
- Returns null for a non-existent ID

### 1.6 listReleases()
- Returns all releases from the releases directory
- Returns empty array if no releases directory exists
- Returns empty array if directory exists but is empty

### 1.7 State Machine Transitions
- Valid: draft → staged, draft → revoked, staged → published, staged → revoked, published → revoked
- Invalid: revoked → any, draft → published, published → staged, published → draft

## 2. Unit Tests — release.ts (CLI)

### 2.1 cmdRelease()
- Creates a release from the latest run if no runId specified
- Creates a release from a specific runId
- Collects artifacts from artifact_index.json
- Throws if run directory not found

### 2.2 cmdReleaseSign(), cmdReleasePublish(), cmdReleaseRevoke()
- Delegate correctly to core functions
- Print formatted release output

### 2.3 cmdReleaseList()
- Lists all releases with formatted output

## 3. Integration Tests

- Full lifecycle: create → sign → publish
- Full lifecycle: create → revoke
- Create release from actual pipeline run output

## 4. Test Infrastructure

- Test framework: Vitest
- Fixtures: `test/fixtures/` (temp directories for release storage)
- Helpers: `test/helpers/`

## 5. Cross-References

- VER-01 (Proof Types & Evidence Rules)
- VER-03 (Completion Criteria)
- 01_contract.md (invariants to verify)
