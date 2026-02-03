# Product Folder

This folder contains the **authoritative product specifications** — the "spark" that drives all documentation generation in AXION.

## The Spark Concept

RPBS and REBS are not just input documents — they are the **source of truth** that flows through the entire ROSHI pipeline:

```
RPBS (Why, Who, What)
  ↓
REBS (Engineering Philosophy)
  ↓
All downstream templates populated from this foundation
```

The pipeline **reads from** these files but **never writes to** them. You are responsible for maintaining them.

## Core Files

| File | Purpose |
|------|---------|
| `RPBS_Product.md` | **Requirements & Product Baseline Specification** — Defines why the product exists, who it serves, what outcomes must occur, and what is explicitly out of scope. This is LEVEL 0 product truth. |
| `REBS_Product.md` | **Requirements & Engineering Baseline Specification** — Defines how engineers are allowed to think: separation of concerns, engineering discipline, and technical philosophy. This is LEVEL 0 engineering truth. |

## RPBS — Product Truth

RPBS answers the fundamental product questions:

- **Why** does this product exist?
- **Who** does it serve?
- **What** outcomes must occur?
- **What** is explicitly out of scope?

Everything in RPBS is a **hard constraint** that downstream documents cannot override.

## REBS — Engineering Philosophy

REBS establishes engineering principles:

- Separation of concerns
- Engineering discipline rules
- Technical philosophy
- What patterns are allowed/forbidden

Everything in REBS is a **hard constraint** on technical decisions.

## How The Spark Works

1. User fills out the web form (Overview section)
2. Form data populates `RPBS_Product.md`
3. Engineering decisions go into `REBS_Product.md`
4. Pipeline scripts read both files during `draft` stage
5. All downstream templates (DDES, UX, UI, etc.) are populated from this foundation
6. Missing information gets marked as `UNKNOWN` (never invented)

## The "No Invention" Rule

If RPBS/REBS doesn't contain information needed for a downstream template, the pipeline marks it as `UNKNOWN`. This ensures:

- Traceability back to source
- Explicit decision points
- No hidden assumptions

## Update Protocol

When product requirements change:

1. Update RPBS_Product.md and/or REBS_Product.md
2. Re-run affected pipeline stages (`draft`, `review`, `verify`)
3. New information flows into downstream docs
4. ERC must be re-locked after changes

## Supporting Files (Optional)

| File | Purpose |
|------|---------|
| `COMPONENT_SPEC.md` | UI component definitions including props, variants, and usage patterns |
| `IMPLEMENTATION_GUIDE.md` | Step-by-step build instructions and technical decisions |
| `SCHEMA_SPEC.md` | Database schema definitions and field types |

These are supplementary to RPBS/REBS and provide additional detail for specific modules.
