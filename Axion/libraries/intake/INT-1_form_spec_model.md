---
library: intake
id: INT-1
schema_version: 1.0.0
status: draft
---

# INT-1 — Form Spec Model

## Purpose
Define a versioned intake wizard spec that is:
- deterministic (stable page/field ordering)
- machine-readable (UI can render it)
- validatable (submission can be checked against it)

## Core entities
- **Form spec**: top-level container (versioned)
- **Page**: ordered page of the wizard
- **Field**: question/input on a page
- **Visibility rule**: when a page/field is shown
- **Dependency**: field requirements conditioned on other answers

## Field types (minimum)
- text
- textarea
- number
- boolean
- enum (single select)
- multi_enum (multi select)
- date
- file_ref (uploaded file pointer)
- json (advanced)

## Required properties
Form spec:
- form_id
- version
- pages[] (ordered)
- created_at, updated_at, owner

Page:
- page_id
- title
- order
- fields[] (ordered)
- visibility (optional)

Field:
- field_id
- label
- type
- required (boolean)
- enum_ref (if enum types)
- validations (optional)
- visibility (optional)
