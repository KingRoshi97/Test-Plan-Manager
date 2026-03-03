# Knowledge Use Policy

  ## Purpose

  Defines how knowledge items (KIDs) may be used by agents during template creation, specification work, and kit generation.

  ## Use Policy Tiers

  ### pattern_only (default)

  - Agent may study the knowledge item to understand patterns, constraints, and approaches
  - Agent must translate knowledge into original outputs
  - Agent must NOT copy code blocks or long prose verbatim
  - No allowlist entry required

  ### reusable_with_allowlist

  - Agent may reuse specific excerpts within defined limits (see `allowed_excerpt` in KID metadata)
  - Requires entry in `REUSE/allowlist.json`
  - Agent must log reuse in `REUSE/reuse_log.json`
  - Attribution must be included in output envelope

  ### restricted_internal_only

  - Content is available only to internal agents
  - External agents must NOT access these items
  - Kit exports for external execution must exclude this content
  - Typically applies to proprietary patterns, internal architecture decisions, or sensitive operational knowledge

  ## Enforcement

  - KL-GATE-01: Every referenced KID must exist in KNOWLEDGE_INDEX
  - KL-GATE-06: Allowlisted excerpt reuse requires reuse_log entry
  - KL-GATE-07: Verbatim copying beyond excerpt limits is blocked
  