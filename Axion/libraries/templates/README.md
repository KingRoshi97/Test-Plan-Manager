# Templates Library

## Purpose

The Templates Library provides Axion's **document template library system**: the 533 TMP templates that define specification structure, placeholders, and required fields for every deliverable produced during a pipeline run. Templates are selected deterministically from the canonical spec and standards snapshot, filled by agents, and validated for completeness before downstream stages consume them.

## Structure

| Directory | Purpose |
|-----------|---------|
| `SYSTEM/doctrine/` | Governance docs: TMP-0 (purpose/boundaries) through TMP-7 (definition of done), determinism rules, validation checklists |
| `SYSTEM/contracts/` | Numbered validation/rule files, JSON schemas (template_definition, render_envelope, selection, registry), feature packs, placeholder catalog |
| `SYSTEM/policies/` | Usage policies: use policy, versioning policy, completeness policy |
| `SYSTEM/taxonomy/` | Controlled vocabularies: categories, subcategories, status, domains, maturity, risk classes |
| `SYSTEM/registries/` | Template registry, category order, completeness policy, changelog, deprecations, aliases, relationships |
| `SYSTEM/templates/` | Authoring templates for creating new template definitions |
| `CONTENT/ITEMS/` | Template content files organized by subcategory prefix (API/, FE/, SEC/, etc.) |
| `CONTENT/META/` | Collections, aliases, and redirects for logical grouping |
| `VIEWS/` | Queryable indices: by_category, by_status, by_feature_pack, by_compliance_gate |
| `BUNDLES/` | Curated template sets by run profile, risk class, and executor type |
| `OUTPUTS/` | Export and selection schemas for template selection artifacts |

## Categories

1. **Application Build** — API, Admin, Forms, Events, Frontend, Mobile, etc. (128 templates)
2. **System Architecture** — API Governance, Authorization, Deployment, Error Model, etc. (52 templates)
3. **Product Definition** — PRD, Domain Model, Risk, Stakeholders, User Research (38 templates)
4. **Experience Design** — Accessibility, Content, Design System, Interaction, Layout (48 templates)
5. **Data & Information** — Architecture, Caching, Governance, Lifecycle, Quality (44 templates)
6. **Integrations & External Services** — CRM/ERP, Payments, SSO, Webhooks (70 templates)
7. **Operations & Reliability** — Alerting, Analytics, Observability, Performance, SLO (78 templates)
8. **Security, Privacy & Compliance** — Audit, Compliance, IAM, Privacy, Secrets (75 templates)

## Template Contract

Every template file must contain:
- Header block with: Template ID, Type, Version, Applies, Filled By, Consumes, Produces
- Sections: Purpose, Inputs Required, Template Body, Acceptance Criteria
- Placeholders using `{{placeholder}}` syntax with provenance tracking

## Usage Rules

- Templates are selected via deterministic selection rules (TMP-3)
- Agents fill placeholders using canonical spec, standards snapshot, and knowledge items
- Render envelopes must pass schema validation (TMP-4)
- Completeness is verified at the template gate stage (TMP-6)

## Governance

- Status workflow: draft → active → deprecated → archived
- Template IDs are stable; updates require version bumps
- All changes tracked in SYSTEM/registries/changelog.md
- Deprecation requires replacement mapping in deprecations registry
