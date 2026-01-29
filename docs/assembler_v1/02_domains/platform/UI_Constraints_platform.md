# UI Constraints — Platform

## Overview
**Domain Slug:** platform

## Note
The Platform domain does not have a UI - it defines core entities and business rules. This document describes data model constraints.

## Data Model Constraints
- All entities use UUID for primary key
- Timestamps use ISO 8601 format
- Status fields use enum values (not arbitrary strings)
- Required fields must not be null or empty

## Entity Constraints

| Entity | Constraint | Notes |
|--------|------------|-------|
| Run.id | UUID v4 format | Generated on creation |
| Run.idea | Min 10 chars | User-provided input |
| Run.status | Enum: created, running, completed, failed, bundled | State machine controlled |
| Bundle.path | Valid file path | Points to zip file |

## Validation Constraints
- Idea field: required, min 10 characters
- Status field: must be valid enum value
- Timestamps: must be valid ISO 8601

## Open Questions
- None - platform constraints are defined for MVP
