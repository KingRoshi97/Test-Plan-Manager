# FEAT-017 — Error Taxonomy & Registry: Error Codes

  ## 1. Error Code Format

  All error codes follow the `ERR-DOMAIN-NNN` format defined in the ERROR_CODE_REGISTRY.

  ## 2. Domain

  `ERR`

  ## 3. Error Codes

  | Code | Severity | Message | Retryable | Action |
  |------|----------|---------|-----------|--------|
  | `ERR-ERR-001` | error | Error Taxonomy & Registry initialization failed | false | Check configuration and dependencies. |
| `ERR-ERR-002` | error | Error Taxonomy & Registry invalid input | false | Validate input against schema before passing. |
| `ERR-ERR-003` | warning | Error Taxonomy & Registry degraded operation | false | Review logs for root cause. |

  ## 4. Error Handling Rules

  - All errors must include the error code from this registry
  - Error messages must not expose internal implementation details
  - Errors must include actionable remediation guidance
  - Unregistered error codes must not be thrown at runtime

  ## 5. Cross-References

  - ERROR_CODE_REGISTRY.json
  - FEAT-017 (Error Taxonomy & Registry)
  - SYS-07 (Compliance & Gate Model)
  