---
library: knowledge
id: KNO-4
section: retrieval_resolution_rules
schema_version: 1.0.0
status: draft
---

# KNO-4 — Retrieval & Resolution Rules

## Overview
Knowledge retrieval is the process of selecting the most relevant and trustworthy KIDs for a given pipeline run. Retrieval must be deterministic — the same query against the same registry state must always produce the same result set in the same order. This document defines the filtering, scoring, and resolution rules that govern knowledge selection.

## Retrieval Pipeline

### Stage 1: Applicability Filtering
Filter the full KID registry to the subset that is applicable to the current run context:

| Filter Dimension | Source | Rule |
|-----------------|--------|------|
| **Pillar** | Run profile | Include only KIDs whose `pillar` matches the run's target pillar(s). |
| **Domain** | Run profile | Include only KIDs whose `domains` overlap with the run's target domain(s). |
| **Risk class** | Run profile | Exclude KIDs whose authority tier is below the minimum for the run's risk class. |
| **Executor access** | Executor type | Exclude `restricted_internal_only` KIDs for external executors. |
| **Use policy** | Run profile | Apply use-policy restrictions (pattern_only, reusable_with_allowlist). |
| **Freshness** | Registry state | Exclude KIDs flagged as `needs_review` (3x staleness). |
| **Supersession** | Registry state | Exclude superseded KIDs; resolve to their superseding KID. |
| **Deprecation** | Registry state | Exclude deprecated KIDs. |

### Stage 2: Scoring
Score each remaining KID based on relevance and trust:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Authority tier** | 0.30 | Golden=1.0, Verified=0.8, Reviewed=0.5, Draft=0.2 |
| **Domain match** | 0.25 | Exact domain match=1.0, parent domain=0.6, sibling domain=0.3 |
| **Tag overlap** | 0.15 | Jaccard similarity between KID tags and query tags |
| **Freshness** | 0.15 | Fresh=1.0, Stale(1x)=0.5, Stale(2x)=0.2 |
| **Unit class preference** | 0.10 | Authoritative=1.0, Guidance=0.8, Anti-pattern=0.7, Reference=0.5, Example=0.4 |
| **Quality tier** | 0.05 | T1=1.0, T2=0.7, T3=0.3 |

Final score = weighted sum of all factors, normalized to [0, 1].

### Stage 3: Ranking and Selection
1. Sort scored KIDs by descending score.
2. Apply the run's `max_knowledge_items` limit (default: 50).
3. Apply diversity constraints: no more than 40% of selected KIDs from a single subdomain.
4. If two KIDs have identical scores, break ties by: (a) higher authority tier, (b) more recent `updated_at`, (c) lexicographic KID ID.

### Stage 4: Decision Report
Produce a knowledge retrieval decision report containing:
- Query parameters (pillar, domains, risk class, tags, executor type)
- Total KIDs evaluated
- KIDs filtered out at each stage with reason
- Final selection with scores
- Confidence level (high/medium/low based on score distribution)

## Profile-Based Filtering
Run profiles define the knowledge selection scope:
- **Full profile**: All applicable KIDs across all pillars and domains.
- **Domain profile**: KIDs matching the run's primary domain only.
- **Minimal profile**: Only golden/verified authoritative KIDs.
- **Custom profile**: Operator-defined filter set.

## Risk-Class Filtering

| Risk Class | Minimum Authority Tier | Minimum Quality Tier |
|-----------|----------------------|---------------------|
| **Critical** | Verified | T1 |
| **High** | Reviewed | T2 |
| **Standard** | Draft | T3 |
| **Low** | Draft | T3 |

## Determinism Rules
- Given the same registry state, run profile, and risk class, retrieval always produces the same result set in the same order.
- Scoring weights are fixed constants — they do not vary between runs.
- Tie-breaking rules are fully specified and leave no ambiguity.
- Supersession resolution always follows the chain to the terminal KID.
- Diversity constraints use deterministic round-robin pruning when limits are exceeded.

## Validation Checklist
- [ ] Retrieval produces identical results for identical inputs
- [ ] All filter dimensions are applied in the defined order
- [ ] Scoring weights sum to 1.0
- [ ] Tie-breaking rules resolve all ties deterministically
- [ ] Decision report is produced for every retrieval
- [ ] Risk-class minimums are enforced
