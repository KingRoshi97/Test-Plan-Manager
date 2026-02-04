# Fixture: Manifest Schema Migration v1 to v2

## Scenario
A kit created with manifest v1.0.0 needs to be processed by tooling expecting v2.0.0 schema.

## Expected Behavior
- Tool detects version mismatch
- Either: Automatic migration applied, or
- Clear error with migration instructions

## Input Files
- `input/manifest_v1.json` - Old format manifest

## Expected Output
- `expected/manifest_v2.json` - Migrated manifest, or
- `expected/error.json` - Migration required error

## Migration Notes
Document what fields changed between versions and how to migrate.

## Test Reference
- Schema regression tests (when implemented)
