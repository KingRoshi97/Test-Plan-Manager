# FEAT-010 — Release Objects & Signing: Security Requirements

## 1. Scope

Security properties of the release lifecycle, signing mechanism, and artifact integrity verification.

## 2. Signing Mechanism

- Signatures use SHA-256 hashing (via `src/utils/hash.ts`) of a JSON payload containing `{ release_id, signer, signed_at, artifacts }`
- The signature is a deterministic hash — given the same inputs, the same signature is produced
- Signatures are appended to the release's `signatures[]` array; existing signatures are never removed
- This is integrity signing (tamper detection), not cryptographic identity signing (no asymmetric keys)

## 3. Data Classification

- Release objects: Internal (contain artifact paths and hashes)
- Signatures: Internal (contain signer identity and SHA-256 hashes)
- Revocation reasons: Internal (may contain operational context)

## 4. Access Control

- `createRelease` — requires access to the run's artifact index
- `signRelease` — requires the signer identity string
- `publishRelease` — requires at least one prior signature
- `revokeRelease` — available from any non-revoked state

## 5. Integrity Guarantees

- Each artifact in a release includes its SHA-256 hash at time of collection
- The signing payload includes the full artifacts array, binding the signature to the exact artifact set
- State transitions are enforced by `VALID_TRANSITIONS` — no code path bypasses the state machine

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- FEAT-012 (Secrets & PII Scanner / Quarantine)
