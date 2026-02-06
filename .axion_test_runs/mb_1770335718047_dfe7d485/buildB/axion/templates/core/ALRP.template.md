# Agent Launch & Reasoning Protocol (ALRP) — {{PROJECT_NAME}}

## Overview
**Project:** {{PROJECT_NAME}}
**Version:** {{VERSION}}
**Last Updated:** {{DATE}}

## Purpose
This document defines how AI agents should reason, operate, and make decisions when building or modifying this project. It establishes the behavioral contract between human intent and agent execution.

---

## 1) Agent Identity & Role

### Primary Directive
{{PRIMARY_DIRECTIVE}}

### Operating Mode
- [ ] Autonomous (minimal human intervention)
- [ ] Collaborative (checkpoint approvals)
- [ ] Supervised (step-by-step confirmation)

### Domain Scope
{{DOMAIN_SCOPE}}

---

## 2) Reasoning Protocol

### Before Any Action
1. **Read** — Gather full context from existing docs and code
2. **Reason** — Explain intent before execution
3. **Reference** — Cite source docs for every decision
4. **Restrict** — Stay within defined scope; flag out-of-scope requests

### Decision Framework
| Situation | Required Action |
|-----------|-----------------|
| Missing information | Mark as `UNKNOWN`, log to Open Questions |
| Conflicting requirements | Escalate to human, do not invent resolution |
| Ambiguous instruction | Request clarification before proceeding |
| Out of scope | Acknowledge and redirect to appropriate domain |

---

## 3) Execution Rules

### MUST Do
- [ ] Follow the pipeline order (init → generate → seed → draft → review → verify → lock)
- [ ] Preserve existing files unless explicitly told to overwrite
- [ ] Log all actions to ASSEMBLER_REPORT
- [ ] Validate against ERC before marking complete

### MUST NOT Do
- [ ] Invent information not in source docs
- [ ] Skip verification steps
- [ ] Modify locked artifacts
- [ ] Execute outside defined modules

---

## 4) Communication Protocol

### Output Format
- All responses must be structured and parseable
- Use JSON for machine-readable outputs
- Use Markdown for human-readable reports

### Status Reporting
```json
{
  "status": "{{STATUS}}",
  "stage": "{{STAGE}}",
  "module": "{{MODULE}}",
  "action": "{{ACTION}}",
  "result": "{{RESULT}}",
  "next": "{{NEXT_STEP}}"
}
```

### Error Reporting
```json
{
  "status": "blocked_by",
  "stage": "{{STAGE}}",
  "module": "{{MODULE}}",
  "missing": ["{{DEPENDENCY_1}}", "{{DEPENDENCY_2}}"],
  "hint": ["{{RESOLUTION_HINT}}"]
}
```

---

## 5) Source Document References

### Required Reading (before any action)
| Document | Purpose |
|----------|---------|
| RPBS_Product.md | Product requirements and policies |
| REBS_Product.md | Technical architecture baseline |
| domain-map.md | Domain boundaries and ownership |
| ERC docs | Execution readiness gates |

### Per-Module References
{{MODULE_REFERENCES}}

---

## 6) Guardrails & Constraints

### Hard Limits
- Max file size: {{MAX_FILE_SIZE}}
- Max files per operation: {{MAX_FILES}}
- Timeout per stage: {{STAGE_TIMEOUT}}

### Quality Gates
- [ ] All UNKNOWN items logged
- [ ] No placeholder content in final output
- [ ] All cross-references valid
- [ ] Verify pass required before lock

---

## 7) Recovery Protocol

### On Failure
1. Log error with full context
2. Revert to last known good state
3. Report failure with `blocked_by` status
4. Wait for human intervention or retry signal

### On Timeout
1. Save partial progress
2. Log checkpoint
3. Report timeout with resume instructions

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| Agent Operator | | | |
