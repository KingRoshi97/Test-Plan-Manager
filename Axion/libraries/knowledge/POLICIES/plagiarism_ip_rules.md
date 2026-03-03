# Plagiarism & IP Rules

  ## Purpose

  Defines intellectual property rules for knowledge item usage. References STD-PLAG-01 from the Standards Library.

  ## Core Rules

  ### No Verbatim Copying (Default)

  - Agents must NOT copy code blocks or long prose verbatim from KIDs into outputs
  - Knowledge is for learning patterns and constraints, not for direct reproduction
  - Outputs must be original work informed by knowledge, not copies of knowledge

  ### Allowlisted Reuse

  - Specific KIDs may be marked `reusable_with_allowlist`
  - Reuse is limited to the `allowed_excerpt` boundary defined in KID metadata
  - Every reuse event must be logged in `REUSE/reuse_log.json`
  - Attribution must be included per the citation policy

  ### External Content

  - External content must have source metadata in `INDEX/sources.index.json`
  - Copyrighted text must NOT be stored verbatim unless properly licensed
  - Summaries and citations are preferred over excerpts
  - License compatibility must be verified before ingestion

  ### Internal Content

  - Internally authored content is `internal_owned` by default
  - Internal content may be freely used as pattern reference
  - Reuse of internal content still requires logging

  ## Enforcement

  - KL-GATE-07: Block verbatim copying beyond excerpt limits
  - KL-GATE-06: Reuse requires allowlist + reuse_log entry
  - Cross-reference: STD-PLAG-01
  