---
  contract_id: KL-4.2
  schema_version: 1.0.0
  applies_to: "Agent behavior when consuming KIDs"
  enforcement_level: "hard"
  ---

  # KL-4.2 — Allowed Behaviors

  Agents MAY do the following when a KID is selected:

  ## 1) Derive requirements and constraints
  - Convert KID guidance into:
    - acceptance criteria
    - non-functional requirements
    - interface constraints
    - validation rules
  - Output must be expressed in the agent's own words (no long copying).

  ## 2) Follow procedures and checklists
  - Use procedure steps to guide execution.
  - Use checklists as gate criteria (pass/fail items).
  - Agents may reformat lists for their target artifact format, but must preserve meaning.

  ## 3) Re-express concepts in original language
  - Concepts may be paraphrased into:
    - summaries
    - explanations
    - rationale sections
  - The output should be shorter than the source and not mirror phrasing.

  ## 4) Use examples for structure learning (not copying)
  - Examples may be used to learn:
    - formatting
    - section ordering
    - naming conventions
    - minimal scaffolds
  - Example content must not be copied verbatim unless allowlisted.

  ## 5) Use references for defaults and enumerations (with policy)
  - Reference KIDs may supply:
    - default values
    - parameter lists
    - safe ranges
  - If values are transferred into outputs, the KID must be cited.

  ## 6) Emit citations
  - Every use of a KID MUST emit knowledge_citations (KL-4.4).
  