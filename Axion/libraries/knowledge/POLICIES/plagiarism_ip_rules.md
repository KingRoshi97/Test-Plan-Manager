# Plagiarism & IP Rules

## Purpose

Defines intellectual property rules for knowledge item usage. Aligned with KL-5.3 reuse gates, KL-5.3b verbatim detection, and STD-PLAG-01 from the Standards Library.

## Governing Contracts

| Contract | Title | Enforcement |
|----------|-------|-------------|
| KL-4.1 | Default Usage Rule | hard |
| KL-4.3 | Restricted Behaviors | hard |
| KL-5.3 | Plagiarism / Reuse Gates | hard |
| KL-5.3b | Verbatim Detection | hard |

## Core Rules

### No Verbatim Copying (Default per KL-4.1)

- Agents must NOT copy code blocks or long prose verbatim from KIDs into outputs
- Knowledge is for learning patterns and constraints, not for direct reproduction
- Outputs must be original work informed by knowledge, not copies of knowledge

### Verbatim Detection (KL-5.3b)

An output contains a verbatim excerpt if ANY of the following are true:
- A contiguous sequence of >= 12 words matches a KID exactly
- >= 3 consecutive lines match a KID exactly
- A code block matches a KID code block with only whitespace changes

Transformations that still count as verbatim:
- Whitespace changes
- Formatting-only changes (markdown bullets vs numbered)
- Variable renaming without structural change (for code)

Exclusions:
- KID IDs themselves (KID-...) do not count as excerpts
- Short common phrases under 12 words do not count

### Excerpt Aggregation (KL-5.3b)

Excerpts are measured per KID. If multiple excerpts exist for the same KID:
- total_words = sum(excerpt words)
- total_lines = sum(excerpt lines)
- Totals must remain within allowed_excerpt

### Allowlisted Reuse (KL-5.3 / KL-GATE-06)

- Specific KIDs may be marked `reusable_with_allowlist`
- Reuse is limited to the `allowed_excerpt` boundary defined in KID metadata
- Every reuse event must be logged in `REUSE/reuse_log.json` per KL-4.4b schema
- Attribution must be included per the citation policy (KL-4.4)

### Smuggling via Paraphrase (KL-4.3 §6)

- MUST NOT produce near-verbatim paraphrases that preserve distinctive phrasing and ordering
- If output similarity is high, treat as copying and block (KL-5.3)

### External Content

- External content must have source metadata in `INDEX/sources.index.json` (KL-2.4)
- Copyrighted text must NOT be stored verbatim unless properly licensed
- Summaries and citations are preferred over excerpts
- License compatibility must be verified before ingestion (KL-6.4)

### Internal Content

- Internally authored content is `internal_owned` by default
- Internal content may be freely used as pattern reference
- Reuse of internal content still requires logging per KL-4.4

## Enforcement

| Gate | Rule | Contract |
|------|------|----------|
| KL-GATE-06 | Allowlisted excerpt reuse requires reuse_log entry | KL-5.3 |
| KL-GATE-07 | Block verbatim copying beyond excerpt limits | KL-5.3 |
| KL-GATE-08 | Production runs require maturity >= reviewed | KL-5.4 |

## Cross-References

- KL-4.4: Mandatory Citation Behavior
- KL-4.4b: Reuse Log Entry Schema
- KL-5.3b: Verbatim Detection
- STD-PLAG-01: Plagiarism & IP-Safe Use Standard
