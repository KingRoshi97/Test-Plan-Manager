# AXION Changelog

All notable changes to the AXION system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Change contract workflow for safe upgrades (`axion/changes/`)
- Feature flags system (`axion/config/system.json`)
- Release gate validation process

### Changed
- (None yet)

### Deprecated
- (None yet)

### Removed
- (None yet)

### Fixed
- (None yet)

### Security
- (None yet)

---

## Version History

### [1.0.0] - YYYY-MM-DD

Initial stable release.

#### Added
- 19 domain modules with dependency management
- Pipeline stages: generate → seed → draft → review → verify → lock
- Presets system (system, foundation, web, api, etc.)
- Kit creation with manifest and snapshot
- JSON stdout contracts for all scripts
- Reason code system for diagnostics

---

## Migration Notes

### Migrating from pre-1.0 to 1.0

1. Ensure all kits have valid manifest.json
2. Run `axion-doctor` to check system health
3. Update any custom scripts to use JSON stdout parsing

---

## Change Contract Reference

All changes follow the contracted change workflow:

1. Write change contract in `axion/changes/`
2. Add fixtures in `tests/fixtures/`
3. Write tests before implementation
4. Implement (behind feature flag if risky)
5. Run release gate
6. Update this changelog
