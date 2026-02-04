# Fixture: Unsafe Path Access

## Scenario
An operation attempts to write outside the designated kit root.

## Expected Behavior
- Status: `failed`
- Reason Code: `UNSAFE_PATH_ACCESS` or similar security code
- No files written to disallowed location

## Security Policy Reference
From `axion/config/system.json`:
```json
{
  "security_policy": {
    "allowed_write_roots": ["kit_root"],
    "blocked_paths": ["/axion/", "/node_modules/", "/.git/"]
  }
}
```

## Test Reference
- `tests/core/core-contract.test.ts` - "Two-Root Safety"
