# Product Folder

This folder contains the **authoritative product specifications** that define what you're building. These documents are the primary source of truth for the AXION pipeline.

The pipeline **reads from** these files but **never writes to** them. You are responsible for keeping them updated.

## Files

| File | Purpose |
|------|---------|
| `RPBS_Product.md` | **Requirements & Policy Baseline Specification** — Defines hard rules (immutable business constraints) and configurable policies. Example: "Users must verify email before checkout" (hard rule) vs "Session timeout = 30 minutes" (policy). |
| `REBS_Product.md` | **Requirements & Entity Baseline Specification** — Defines core entities, their fields, relationships, and which domain owns them. This is your data model blueprint. |
| `COMPONENT_SPEC.md` | UI component definitions including props, variants, and usage patterns. Feeds into frontend module generation. |
| `IMPLEMENTATION_GUIDE.md` | Step-by-step build instructions and technical decisions. Reference for the implementation order and approach. |
| `SCHEMA_SPEC.md` | Database schema definitions, table structures, and field types. Used by the database module. |

## How It Works

1. You fill these documents with your project's details
2. The pipeline extracts information from them during `draft` stage
3. Missing information gets marked as `UNKNOWN` in generated output (never invented)
4. Update these files when requirements change, then re-run affected pipeline stages
