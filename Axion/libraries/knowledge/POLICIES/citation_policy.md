# Citation Policy

  ## Purpose

  Defines mandatory citation behavior when agents use knowledge items, per KL-4.4.

  ## Rules

  ### When Citation is Required

  - Any time an agent consults a KID during template creation, specification, or output generation
  - When knowledge from a KID influences the structure, constraints, or content of an output
  - When a checklist or procedure from a KID is followed

  ### Citation Format

  Agents must emit citations in the output envelope or run log:

  ```json
  {
    "knowledge_citations": [
      {
        "kid": "KID-ITSEC-PATTERN-0001",
        "usage": "pattern_reference",
        "sections_used": ["Core content"]
      }
    ]
  }
  ```

  ### Reuse Citation

  If reuse occurs (content from a `reusable_with_allowlist` KID is included), the agent must also update `REUSE/reuse_log.json` with:
  - KID referenced
  - Output artifact where reuse occurred
  - Excerpt boundaries (lines/words)
  - License and attribution

  ## Enforcement

  - KL-GATE-01: Every referenced KID must exist in KNOWLEDGE_INDEX
  - KL-GATE-06: Allowlisted excerpt reuse requires reuse_log entry
  