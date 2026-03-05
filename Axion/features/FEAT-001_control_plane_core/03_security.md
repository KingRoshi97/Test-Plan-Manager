# FEAT-001 — Control Plane Core: Security Requirements

## 1. Scope

Security characteristics of the Control Plane Core as currently implemented. The system operates as a local CLI tool — there are no network endpoints or multi-user authentication.

## 2. Audit Trail Integrity

- Audit log is append-only JSONL written via `appendJsonl()`
- Each entry is hash-chained: `prev_hash` references the prior entry's SHA-256 hash
- The chain starts from a known zero hash (`0000...0000`, 64 hex chars)
- Tampering with any entry breaks the hash chain, detectable by replaying and comparing hashes
- Audit entries record: `timestamp`, `action`, `run_id`, `details`, `prev_hash`, `hash`

## 3. Artifact Pin Integrity

- Pins store the SHA-256 hash of artifact content at pin time
- `verifyPin()` re-hashes the file and compares — returns `false` if content has changed or file is missing
- `verifyAllPins()` checks every pin in a run's pinset
- Duplicate pinning of the same artifact path is rejected (throws)

## 4. Release Signing

- Signing produces a SHA-256 hash of a payload containing `release_id`, `signer`, `signed_at`, and `artifacts`
- Signatures are stored as `{ signer, signature, signed_at }` on the release object
- Publishing requires at least one signature — unsigned releases cannot be published
- Note: signatures use SHA-256 hashing, not asymmetric cryptography. Suitable for integrity verification, not non-repudiation.

## 5. Data Classification

| Data | Classification | Notes |
|------|---------------|-------|
| Run manifests | Internal | Stored as JSON in `.axion/runs/{RUN-ID}/` |
| Audit log | Restricted | Append-only JSONL, hash-chained |
| Pinsets | Internal | Per-run JSON at `.axion/runs/{RUN-ID}/pinset.json` |
| Releases | Internal | JSON at `.axion/releases/{REL-ID}.json` |
| Policy registry | Internal | Read from `policy_registry.v1.json` |
| Run counter | Internal | Stored at `.axion/run_counter.json` |

## 6. Access Control

- No authentication/authorization layer — all operations are available to any caller with filesystem access
- Policy evaluation checks are advisory/enforcement-based but do not restrict API access

## 7. Threat Mitigations

| Threat | Mitigation |
|--------|-----------|
| Audit log tampering | Hash chain — any modification is detectable |
| Artifact mutation after pin | SHA-256 verification on demand |
| Release integrity | Content hash of artifact set stored in release |
| State machine bypass | `transitionRun()` enforces allowed transitions |
| Stage order bypass | `advanceStage()` checks prior stage completion |

## 8. Cross-References

- SYS-07 (Compliance & Gate Model)
- GOV-04 (Audit & Traceability Rules)
- FEAT-012 (Secrets & PII Scanner / Quarantine)
