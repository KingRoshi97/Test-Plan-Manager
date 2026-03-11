# Knowledge Use Policy

## Purpose

Defines how knowledge items (KIDs) may be used by agents during template creation, specification work, and kit generation. Aligned with KL-4.1, KL-4.2, and KL-4.3 contracts.

## Governing Contracts

| Contract | Title | Enforcement |
|----------|-------|-------------|
| KL-4.1 | Default Usage Rule | hard |
| KL-4.2 | Allowed Behaviors | hard |
| KL-4.2a | Paraphrase Safe-Mode | soft |
| KL-4.3 | Restricted Behaviors | hard |

## Use Policy Tiers

### pattern_only (default per KL-4.1)

- Agent may study the knowledge item to understand patterns, constraints, and approaches
- Agent must re-express content in original language (KL-4.2a paraphrase safe-mode)
- Agent must NOT copy code blocks or long prose verbatim
- No allowlist entry required
- knowledge_citations MUST still be emitted (KL-4.4)
- Type defaults per KL-1.1b: concept, pattern, procedure, checklist, reference, pitfall, and glossary_term all default to pattern_only

### reusable_with_allowlist

- Agent may reuse specific excerpts within defined limits (see `allowed_excerpt` in KID metadata)
- Requires entry in `REUSE/allowlist.json`
- Agent must log reuse in `REUSE/reuse_log.json` per KL-4.4b schema
- Reuse log entry must include: kid, reuse_type (prose_excerpt/code_excerpt/table_excerpt), excerpt_size (words/lines), target (artifact_id/path/section), justification, recorded_at
- Attribution must be included in output envelope
- Excerpt size must remain within allowed_excerpt limits (KL-5.3 / KL-GATE-07)

### restricted_internal_only

- Content is available only to internal agents
- External agents must NOT access these items (KL-4.3 §2, KL-5.2 / KL-GATE-04)
- Kit exports for external execution must exclude this content (KL-4.3 §3, KL-5.2 / KL-GATE-05)
- Type default per KL-1.1b: example type defaults to restricted_internal_only
- Items with this policy are blocked from knowledge selection when executor_type == external

## Allowed Behaviors (KL-4.2)

Agents MAY:
1. Derive requirements, constraints, acceptance criteria, and interface rules from KIDs
2. Follow procedures and checklists as gate criteria (may reformat but must preserve meaning)
3. Re-express concepts in original language (shorter than source, different phrasing per KL-4.2a)
4. Use examples for structure learning only (not copying content)
5. Use references for defaults and enumerations (must cite if values are transferred)
6. Emit knowledge_citations for every KID used (KL-4.4)

## Restricted Behaviors (KL-4.3)

Agents MUST NOT:
1. Copy code blocks or long prose unless use_policy == reusable_with_allowlist AND within allowed_excerpt limits AND reuse_log entry is emitted
2. Leak internal_only items to external executors
3. Include restricted content inside kits for external execution
4. Use examples as content donors (structure learning only unless allowlisted)
5. Bypass selection — only KIDs present in KNOWLEDGE_SELECTION may influence outputs
6. Smuggle via paraphrase — near-verbatim paraphrases that preserve distinctive phrasing and ordering are treated as copying and blocked (KL-5.3)

## Paraphrase Safe-Mode (KL-4.2a)

When drawing from KIDs under pattern_only, agents SHOULD:
- Compress: produce a shorter version than the KID section
- Transform: change structure (bullets to sentences or vice versa)
- Reframe: use different ordering of ideas
- Localize: tie to the current spec/run context

Agents SHOULD NOT:
- Reuse distinctive phrasing
- Keep identical bullet ordering across 5+ bullets
- Copy code blocks or paragraph chunks

## Enforcement

| Gate | Rule | Contract |
|------|------|----------|
| KL-GATE-01 | Every referenced KID must exist in KNOWLEDGE_INDEX | KL-5.1 |
| KL-GATE-02 | All KID metadata must be valid (type, tags, policies) | KL-5.1 |
| KL-GATE-03 | No deprecated KIDs used unless explicitly allowed | KL-5.1 |
| KL-GATE-04 | External executor cannot access restricted KIDs | KL-5.2 |
| KL-GATE-05 | Kit export for external use excludes restricted content | KL-5.2 |
| KL-GATE-06 | Allowlisted excerpt reuse requires reuse_log entry | KL-5.3 |
| KL-GATE-07 | Block verbatim copying beyond excerpt limits | KL-5.3 |
| KL-GATE-08 | Production runs require maturity >= reviewed for selected KIDs | KL-5.4 |
