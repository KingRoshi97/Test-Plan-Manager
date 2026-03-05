---
library: system
id: SYS-5
schema_version: 1.0.0
status: draft
---

# SYS-5 — Notification Routing

## Purpose
Define how Axion emits notifications deterministically for:
- gate failures
- approvals required (policy overrides, quota exceed, risky actions)
- changes in pinned dependencies (standards/templates/knowledge)
- run lifecycle events (start, complete, failed, released)

## Definitions
- **Event**: a structured notification trigger produced by the pipeline/control plane.
- **Route**: mapping from event type + severity + context → destination(s).
- **Destination**: where the notification goes (console, email, Slack, webhook, etc.).
- **Throttle**: rules to prevent spam (dedupe/windowing).

## What it governs
- Event type registry
- Routing rules registry
- Destination registry
- Dedupe/throttle policy
- Deterministic rendering of a notification payload (title/body fields)

## What it does NOT govern
- How gates are evaluated (gates/)
- What policies mean (policy/)
- Telemetry sink policies (telemetry/)
