# Knowledge Library

  ## Purpose

  The Knowledge Library provides approved reference material that improves quality and consistency without becoming a code-donor. It is a curated set of reference units ("knowledge items") that agents can consult during template creation and specification work.

  ## Structure

  | Directory | Purpose |
  |-----------|---------|
  | `INDEX/` | Registries: master KID index, taxonomy, tags, bundles index, sources, changelog, deprecations, quality tiers |
  | `POLICIES/` | Usage rules: use policy, external agent policy, citation policy, plagiarism/IP rules, secrets/PII handling |
  | `BUNDLES/` | Curated KID sets by run profile, risk class, and executor type |
  | `PILLARS/` | Content organized by pillar: IT_END_TO_END, INDUSTRY_PLAYBOOKS, LANGUAGES_AND_LIBRARIES |
  | `REUSE/` | Allowlist, reuse log, and license texts for reusable content |
  | `TEMPLATES/` | Authoring templates for KID files, industry playbooks, and stack playbooks |
  | `OUTPUTS/` | Schemas for knowledge selection and bundle export artifacts |

  ## Pillars

  1. **IT_END_TO_END** — Foundational IT knowledge across networking, security, databases, architecture, CI/CD, observability, cloud, IAM, compliance, release management, and cost optimization.
  2. **INDUSTRY_PLAYBOOKS** — Domain-specific guidance for healthcare, finance, retail/ecommerce, logistics/supply chain, and government/public sector.
  3. **LANGUAGES_AND_LIBRARIES** — Language-specific knowledge for JavaScript/TypeScript, Python, Go, Rust, Solidity/EVM, and databases (Postgres).

  ## Knowledge Item (KID) Contract

  Every KID file must contain:
  - YAML frontmatter with: kid, title, type, pillar, domains, tags, maturity, use_policy, executor_access, license
  - Sections: Summary, When to use, Do / Don't, Core content, Links, Proof / confidence

  ## Usage Rules

  - Knowledge items are **pattern-only** by default
  - Agents must emit `knowledge_citations` when using a KID
  - External agents cannot access `restricted_internal_only` items
  - Reuse requires allowlist entry + reuse_log record

  ## Governance

  - Maturity workflow: draft → reviewed → verified → golden
  - Deprecation: mark deprecated, add replacement KID, block new selection
  - All changes tracked in INDEX/changelog.md
  