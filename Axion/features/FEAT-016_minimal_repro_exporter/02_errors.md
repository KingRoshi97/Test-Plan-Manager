# FEAT-016 — Minimal Repro Exporter: Error Codes

  ## 1. Error Code Format

  All error codes follow the `ERR-DOMAIN-NNN` format defined in the ERROR_CODE_REGISTRY.

  ## 2. Domain

  `REPRO`

  ## 3. Error Codes

  | Code | Severity | Message | Retryable | Action |
  |------|----------|---------|-----------|--------|
  | `ERR-REPRO-001` | error | Minimal Repro Exporter initialization failed | false | Check configuration and dependencies. |
| `ERR-REPRO-002` | error | Minimal Repro Exporter invalid input | false | Validate input against schema before passing. |
| `ERR-REPRO-003` | warning | Minimal Repro Exporter degraded operation | false | Review logs for root cause. |

  ## 4. Error Handling Rules

  - All errors must include the error code from this registry
  - Error messages must not expose internal implementation details
  - Errors must include actionable remediation guidance
  - Unregistered error codes must not be thrown at runtime

  ## 5. Cross-References

  - ERROR_CODE_REGISTRY.json
  - FEAT-017 (Error Taxonomy & Registry)
  - SYS-07 (Compliance & Gate Model)
  