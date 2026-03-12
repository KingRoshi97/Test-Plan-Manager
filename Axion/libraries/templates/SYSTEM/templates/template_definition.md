---
template_id: "{PREFIX}-{NN}"
title: "{Title}"
version: "1.0.0"
category: "{category}"
subcategory: "{subcategory}"
status: "draft"
owner: "axion/templates"
applies: "{applicability description}"
filled_by: "Internal Agent"
consumes:
  - "Canonical Spec"
  - "Standards Snapshot"
produces: "{output artifact description}"
risk_classes:
  - "PROTOTYPE"
  - "PROD"
  - "COMPLIANCE"
tags: []
domains: []
created_at: "{ISO-8601}"
updated_at: "{ISO-8601}"
---

# {PREFIX}-{NN} — {Title}

## 1. Header Block

| Field | Value |
|---|---|
| Template ID | {PREFIX}-{NN} |
| Template Type | {category} / {subcategory} |
| Template Version | 1.0.0 |
| Applies | {applicability description} |
| Filled By | Internal Agent |
| Consumes | Canonical Spec, Standards Snapshot |
| Produces | {output artifact description} |

## 2. Purpose

{1-3 line description of what this template produces and why.}

## 3. Inputs Required

- Canonical Spec: {{xref:CANONICAL_SPEC}}
- Standards Snapshot: {{xref:STANDARDS_SNAPSHOT}}

## 4. Template Body

{Template content with placeholders.}

## 5. Acceptance Criteria

- [ ] All required placeholders filled
- [ ] Output passes schema validation
- [ ] Content consistent with standards snapshot
