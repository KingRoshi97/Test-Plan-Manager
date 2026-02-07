# AXION Documentation Index
Version: 0.1.0  
Last Updated: 2026-02-05

## Purpose
Declares what each living document is for, preventing content drift and duplication.

---

## Living Documents

### System Development

| Document | Location | Purpose | Update When |
|----------|----------|---------|-------------|
| **System Upgrade Log** | `axion/docs/SYSTEM_UPGRADE_LOG.md` | Track system upgrades: tests, contracts, flags, schemas, hardening | New tests, doctor checks, feature flags, contract changes |
| **Change Contract Template** | `axion/docs/CHANGE_CONTRACT_TEMPLATE.md` | Template for documenting planned/in-progress system changes with test plans | Before implementing any contracted change |
| **Changelog** | `axion/CHANGELOG.md` | Release notes for versioned releases | Each version release |

### Product & Web App

| Document | Location | Purpose | Update When |
|----------|----------|---------|-------------|
| **Web App Feature Mapping** | `docs/product/WEBAPP_FEATURE_MAPPING.md` | Map system capabilities to web app surfaces | New scripts, artifacts, or UI-relevant changes |

### Configuration

| Document | Location | Purpose | Update When |
|----------|----------|---------|-------------|
| **System Config** | `axion/config/system.json` | Feature flags, thresholds, system settings | Enabling/disabling features |
| **Domains Config** | `axion/config/domains.json` | Module definitions and dependencies | Adding/modifying modules |
| **Presets Config** | `axion/config/presets.json` | Preset configurations for pipelines | Adding/modifying presets |

---

## Quick Reference: Where Does This Go?

| Content Type | Document |
|--------------|----------|
| Test milestones (e.g., "45 tests pass") | System Upgrade Log |
| New doctor check added | System Upgrade Log |
| Feature flag added/changed | System Upgrade Log |
| Schema/contract change | System Upgrade Log + Change Contract |
| New script created | Web App Feature Mapping (if user-facing) |
| Web app needs to invoke X | Web App Feature Mapping |
| Web app needs to render Y artifact | Web App Feature Mapping |
| Planned breaking change | Change Contract first |

---

## Rules

1. **System Upgrade Log** = implementation progress, tests, internal hardening
2. **Web App Feature Mapping** = what the web app must invoke/render (capabilities only, no dev milestones)
3. **Change Contracts** = planned changes with scope, tests, rollout strategy (before implementation)
4. Keep documents focused on their purpose — don't mix concerns
