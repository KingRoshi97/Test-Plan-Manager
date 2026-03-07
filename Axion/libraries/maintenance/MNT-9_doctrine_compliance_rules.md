---
doc_id: MNT-9
title: "Doctrine Compliance Rules"
library: maintenance
version: "0.1.0"
status: active
---

# MNT-9: Doctrine Compliance Rules

## Purpose

Establishes the compliance rules that all Axion doctrine documents must satisfy. These rules are evaluated during health checks (MM-01), full verification runs (MM-02), and coverage audits (MM-03).

## Frontmatter Rules

| Rule ID | Rule | Severity |
|---------|------|----------|
| DCR-01 | Every doctrine doc must have YAML frontmatter delimited by `---` | error |
| DCR-02 | Frontmatter must include `doc_id` field | error |
| DCR-03 | Frontmatter must include `title` field | error |
| DCR-04 | Frontmatter must include `library` field matching its parent library | error |
| DCR-05 | Frontmatter must include `version` in semver format | error |
| DCR-06 | Frontmatter must include `status` with value `active`, `draft`, or `deprecated` | error |

## Naming Rules

| Rule ID | Rule | Severity |
|---------|------|----------|
| DCR-10 | Filename must match pattern `<PREFIX>-<NUM>_<slug>.md` | error |
| DCR-11 | `doc_id` must match the filename prefix and number | error |
| DCR-12 | Slug must use lowercase snake_case | warning |

## Content Rules

| Rule ID | Rule | Severity |
|---------|------|----------|
| DCR-20 | Document must contain a level-1 heading matching `doc_id` and `title` | warning |
| DCR-21 | Document must contain a Purpose section | warning |
| DCR-22 | Cross-references to other docs must use valid `doc_id` values | error |

## Schema Rules

| Rule ID | Rule | Severity |
|---------|------|----------|
| DCR-30 | JSON Schema files must include `$schema` field | error |
| DCR-31 | JSON Schema files must include `$id` with `axion://` prefix | error |
| DCR-32 | JSON Schema files must include `title` field | error |
| DCR-33 | JSON Schema files must declare `type` at root level | error |

## Compliance Finding

Non-compliant documents produce a finding conforming to `doctrine_compliance_finding.schema.json`. Findings with severity `error` block publish gates (G-MUS-06).
