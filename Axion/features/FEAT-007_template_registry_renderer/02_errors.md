# FEAT-007 — Template Registry & Renderer: Error Codes

  ## 1. Error Code Format

  All error codes follow the `ERR-DOMAIN-NNN` format defined in the ERROR_CODE_REGISTRY.

  ## 2. Domain

  `TMP`

  ## 3. Error Codes

  | Code | Severity | Message | Retryable | Action |
  |------|----------|---------|-----------|--------|
  | `ERR-TMP-001` | error | Template Registry & Renderer initialization failed | false | Check configuration and dependencies. |
| `ERR-TMP-002` | error | Template Registry & Renderer invalid input | false | Validate input against schema before passing. |
| `ERR-TMP-003` | warning | Template Registry & Renderer degraded operation | false | Review logs for root cause. |

  ## 4. Error Handling Rules

  - All errors must include the error code from this registry
  - Error messages must not expose internal implementation details
  - Errors must include actionable remediation guidance
  - Unregistered error codes must not be thrown at runtime

  ## 5. Cross-References

  - ERROR_CODE_REGISTRY.json
  - FEAT-017 (Error Taxonomy & Registry)
  - SYS-07 (Compliance & Gate Model)
  