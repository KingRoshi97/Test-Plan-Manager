# Citation Policy

## Purpose

Defines mandatory citation behavior when agents use knowledge items. Aligned with KL-4.4 citation contract and KL-4.4b reuse log schema.

## Governing Contracts

| Contract | Title | Enforcement |
|----------|-------|-------------|
| KL-4.4 | Mandatory Citation Behavior | hard |
| KL-4.4b | Reuse Log Entry Schema | hard |

## Rules

### When Citation is Required (KL-4.4)

Any time a KID influences an output in any way, the agent MUST emit knowledge_citations. This includes:

- When an agent consults a KID during template creation, specification, or output generation
- When knowledge from a KID influences the structure, constraints, or content of an output
- When a checklist or procedure from a KID is followed
- When defaults or parameter values are copied from a reference KID
- When content is paraphrased from a KID (even if no verbatim excerpt is used)

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

### Reuse Log (KL-4.4b — required only for allowlisted verbatim reuse)

A reuse_log entry MUST exist if any excerpt (prose/code/table row) is copied verbatim AND is allowed by use_policy + allowed_excerpt.

Each reuse_log entry must conform to KL-4.4b schema and include:

| Field | Type | Description |
|-------|------|-------------|
| kid | string | KID referenced (min 8 chars) |
| reuse_type | enum | prose_excerpt, code_excerpt, or table_excerpt |
| excerpt_size | object | { words: int, lines: int } |
| target | object | { artifact_id, path, section } |
| justification | string | Why reuse was necessary vs paraphrase |
| recorded_at | string | ISO 8601 date-time |

### Prohibitions (KL-4.4)

- reuse_log MUST NOT be emitted for pattern_only usage unless excerpting occurred
- If excerpting occurred while use_policy != reusable_with_allowlist, the run MUST be blocked
- The system MUST verify excerpt limits before allowing export/close

## Enforcement

| Gate | Rule | Contract |
|------|------|----------|
| KL-GATE-01 | Every referenced KID must exist in KNOWLEDGE_INDEX | KL-5.1 |
| KL-GATE-06 | Allowlisted excerpt reuse requires reuse_log entry | KL-5.3 |
| KL-GATE-07 | Block verbatim copying beyond excerpt limits | KL-5.3 |
