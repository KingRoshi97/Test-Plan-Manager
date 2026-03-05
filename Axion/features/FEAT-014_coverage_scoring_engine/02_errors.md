# FEAT-014 — Coverage Scoring Engine: Error Codes

## 1. Error Code Format

All error codes follow the `ERR-COV-NNN` format.

## 2. Domain

`COV`

## 3. Error Codes

| Code | Severity | Message | Retryable | Action |
|------|----------|---------|-----------|--------|
| `ERR-COV-001` | error | Initialization/configuration failure (rules file not found, unparseable JSON, acceptance map file missing) | false | Verify the rules file path exists and contains valid JSON array. Verify acceptance map file path. |
| `ERR-COV-002` | error | Invalid input (malformed acceptance map, invalid rule structure, missing required fields like `item_id`, `category`, `acceptance_ref`, `rule_id`, `minimum_coverage`, `applies_to`) | false | Validate input structure: acceptance map must have `items[]` array, each item needs `item_id`, `category`, `acceptance_ref`. Rules need `rule_id`, `category`, `description`, `required_proof_types[]`, `minimum_coverage` (0-100), `applies_to[]`. |

## 4. Error Handling Rules

- All errors are thrown as standard `Error` objects with the error code as the message prefix
- `ERR-COV-001` is thrown during file loading operations (`loadRules`, `loadAcceptanceMapFromFile`)
- `ERR-COV-002` is thrown during input validation (`parseAcceptanceMap`, `validateRule`)
- If a rules file does not exist, `loadRules` falls back to `DEFAULT_RULES` instead of throwing
- If a rules file exists but is invalid, `ERR-COV-001` is thrown

## 5. Cross-References

- FEAT-017 (Error Taxonomy & Registry)
- SYS-07 (Compliance & Gate Model)
