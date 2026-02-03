# Contracts

<!-- AXION:SEAM_OWNER:error_model -->
## Error Model

<!-- AXION:SEAM_DEFINITION_START -->
### Error Response Shape
- Envelope:
  - code: string (stable, programmatic)
  - message: string (user-facing safe summary)
  - details: object | null (optional, non-PII)
  - request_id: string (correlation id)

### Error Taxonomy
- VALIDATION_ERROR
- AUTH_ERROR
- NOT_FOUND
- CONFLICT
- RATE_LIMITED
- INTERNAL_ERROR

### Error Codes
- ERR_VALIDATION_*
- ERR_AUTH_*
- ERR_NOT_FOUND_*
- ERR_CONFLICT_*
<!-- AXION:SEAM_DEFINITION_END -->
