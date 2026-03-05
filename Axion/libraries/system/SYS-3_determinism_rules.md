---
library: system
id: SYS-3a
schema_version: 1.0.0
status: draft
---

# SYS-3a — Determinism Rules (Adapters)

- Runs must pin an adapter_profile_id (SYS-2 pin target: adapter_profile).
- Adapter profiles must reference capabilities by ID from capabilities registry.
- If capabilities differ between environments, the adapter profile must reflect that explicitly.
- Command policy deny rules override allow rules.
- Capability resolution must be recorded in the run manifest (adapter_profile snapshot).
