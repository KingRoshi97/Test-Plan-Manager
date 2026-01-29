# UX Foundations — Platform

## Overview
**Domain Slug:** platform

## Note
The Platform domain serves as the foundation layer and does not directly interact with users. This document describes the developer experience for platform consumers.

## Consumer Types

| Consumer Type | Description | Primary Goals |
|---------------|-------------|---------------|
| API Domain | Backend service | Create and manage runs |
| Web Domain | Frontend application | Display run data |
| Roshi Scripts | Pipeline scripts | Execute pipeline steps |

## Entity Lifecycle

### Run Lifecycle
- **Trigger:** User submits idea via web
- **Steps:**
  1. Run created with status "created"
  2. Execute changes status to "running"
  3. Pipeline completes, status becomes "completed"
  4. Package creates bundle, status becomes "bundled"
- **Outcome:** Bundle ready for download

## Data Architecture
- Entities defined in shared/schema.ts
- Validation via Zod schemas
- In-memory storage for MVP (MemStorage)
- Future: PostgreSQL via Drizzle ORM

## Developer Experience
- TypeScript types for all entities
- Zod schemas for runtime validation
- Clear entity ownership boundaries
- State machine diagrams in BELS

## Open Questions
- None - platform foundations are defined for MVP
