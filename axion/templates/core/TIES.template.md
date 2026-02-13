# Technical Implementation Execution Specification (TIES) — {{PROJECT_NAME}}

<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:CORE_DOC:TIES -->

## Overview
**Project:** {{PROJECT_NAME}}
**Version:** {{VERSION}}
**Last Updated:** {{DATE}}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: TIES defines the 12 engineering disciplines that govern HOW code is written.
These are quality rules and structural principles — not a build sequence.
Each discipline describes patterns, constraints, and non-negotiable practices
that must be followed during execution (TIES Phase 5 in ALRP terms).

The build execution ORDER is determined by the Build Execution Plan (build-plan step),
not by the discipline numbering here. These disciplines apply simultaneously
throughout all build phases.

This is a PROJECT-LEVEL document (one per kit, not per domain).

SOURCES TO DERIVE FROM:
1. RPBS — product requirements inform architectural constraints
2. REBS — technical architecture determines tooling, stack, and patterns
3. DDES — entity specifications inform data flow and state disciplines
4. DIM — interface definitions inform API and contract disciplines
5. ERC — locked contracts define the execution scope
6. UX_Foundations — experience laws inform component and state disciplines
7. UI_Constraints — structural rules inform component architecture

RULES:
- Disciplines are NOT phases to be executed in order — they are principles applied continuously
- All disciplines apply simultaneously during execution
- Each discipline defines both REQUIRED practices and FORBIDDEN patterns
- Violation of any discipline during execution is a TIES violation
- Build execution order is separate (see Build Execution Plan section)

CASCADE POSITION (project-level — post-lock execution guide):
- Upstream (read from): ALL locked domain docs via ERC, RPBS, REBS
- Downstream (feeds into): Agent execution (tells the agent HOW to write code)
- TIES is consumed by build agents after the documentation pipeline completes and ERC is locked
-->

## Purpose
This document defines the 12 engineering disciplines that govern how code is written. These are simultaneous quality rules — not sequential build phases. The agent must apply all disciplines throughout execution.

---

## Discipline Summary

| # | Discipline | Focus | Core Principle |
|---|-----------|-------|----------------|
| 1 | Code Architecture | Structure | Separation of concerns |
| 2 | Functional Core | Logic isolation | Pure logic, impure shell |
| 3 | Data Flow | Data movement | Explicit, traceable data paths |
| 4 | State Architecture | State management | Predictable, minimal state |
| 5 | Component Architecture | UI structure | Composable, isolated components |
| 6 | API & Service Architecture | Backend structure | Contract-first, minimal surface |
| 7 | Contract-Driven Development | Agreements | Types as truth, validate at boundaries |
| 8 | Error, Failure & Recovery | Resilience | Fail explicitly, recover gracefully |
| 9 | Idempotency & Determinism | Predictability | Same input, same output |
| 10 | Performance & Optimization | Efficiency | Measure first, optimize second |
| 11 | Debugging & Diagnosis | Observability | Every failure tells its story |
| 12 | Refactoring Mastery | Evolution | Change structure without changing behavior |

---

## Discipline 1: Code Architecture Principles

<!-- AGENT: Define the structural rules for how code is organized.
Derive from REBS (tech stack, architecture style) and RPBS (product complexity). -->

### Required Practices
- UNKNOWN (e.g., separate concerns by responsibility — UI, logic, data, infrastructure)
- UNKNOWN (e.g., single responsibility per module/file)
- UNKNOWN (e.g., explicit dependency direction — no circular imports)
- UNKNOWN (e.g., co-locate related code — tests near implementations)

### Forbidden Patterns
- UNKNOWN (e.g., god files that combine multiple responsibilities)
- UNKNOWN (e.g., circular dependencies between modules)
- UNKNOWN (e.g., business logic in UI components)

---

## Discipline 2: Functional Core / Imperative Shell

<!-- AGENT: Define how to separate pure logic from side effects.
Business rules should be pure functions. Side effects live at the edges. -->

### Required Practices
- UNKNOWN (e.g., business rules as pure functions — no database calls, no API calls)
- UNKNOWN (e.g., side effects at the edges only — controllers, event handlers, middleware)
- UNKNOWN (e.g., transformations are pure — input in, output out, no mutations)

### Forbidden Patterns
- UNKNOWN (e.g., database calls inside business rule functions)
- UNKNOWN (e.g., API calls inside validation logic)
- UNKNOWN (e.g., mutating shared state inside pure functions)

---

## Discipline 3: Data Flow Engineering

<!-- AGENT: Define how data moves through the system.
Data flow must be explicit and traceable — no hidden transformations. -->

### Required Practices
- UNKNOWN (e.g., data flows in one direction — request → validate → process → respond)
- UNKNOWN (e.g., transformations are explicit functions, not inline mutations)
- UNKNOWN (e.g., data shape is documented at each boundary)

### Forbidden Patterns
- UNKNOWN (e.g., implicit data transformations in transit)
- UNKNOWN (e.g., modifying request objects in place)
- UNKNOWN (e.g., relying on side effects for data propagation)

---

## Discipline 4: State Architecture

<!-- AGENT: Define how state is managed throughout the system.
State should be predictable, minimal, and derived where possible. -->

### Required Practices
- UNKNOWN (e.g., single source of truth for each piece of state)
- UNKNOWN (e.g., derived state computed, not stored)
- UNKNOWN (e.g., state transitions are explicit and traceable)
- UNKNOWN (e.g., UI state separate from server/domain state)

### Forbidden Patterns
- UNKNOWN (e.g., duplicated state across components)
- UNKNOWN (e.g., storing derived values that can be computed)
- UNKNOWN (e.g., implicit state transitions)

---

## Discipline 5: Component Architecture

<!-- AGENT: Define how UI components are structured.
Components should be composable, isolated, and predictable.
Derive from UI_Constraints and COMPONENT_LIBRARY. -->

### Required Practices
- UNKNOWN (e.g., components receive data via props, not by reaching into global state)
- UNKNOWN (e.g., presentational and container patterns separated)
- UNKNOWN (e.g., components are self-contained with clear public APIs)

### Forbidden Patterns
- UNKNOWN (e.g., components that directly call APIs)
- UNKNOWN (e.g., deeply nested prop drilling without composition)
- UNKNOWN (e.g., components that know about siblings)

---

## Discipline 6: API & Service Architecture

<!-- AGENT: Define how backend services and APIs are structured.
APIs are contracts — predictable, minimal, versioned where needed.
Derive from DIM and BELS. -->

### Required Practices
- UNKNOWN (e.g., contract-first — define the shape before implementing)
- UNKNOWN (e.g., consistent response envelope — success/error structure)
- UNKNOWN (e.g., validate all input at the boundary)
- UNKNOWN (e.g., thin controllers — delegate to service layer)

### Forbidden Patterns
- UNKNOWN (e.g., business logic in route handlers)
- UNKNOWN (e.g., inconsistent error response formats)
- UNKNOWN (e.g., exposing internal data structures in API responses)

---

## Discipline 7: Contract-Driven Development

<!-- AGENT: Define how contracts (types, schemas, interfaces) govern development.
Types are truth. Validate at boundaries. Trust types internally. -->

### Required Practices
- UNKNOWN (e.g., shared type definitions between frontend and backend)
- UNKNOWN (e.g., runtime validation at system boundaries — API input, user input, external data)
- UNKNOWN (e.g., internal code trusts type system — no defensive checks inside trusted boundaries)

### Forbidden Patterns
- UNKNOWN (e.g., using `any` type)
- UNKNOWN (e.g., validating data at every layer instead of at boundaries)
- UNKNOWN (e.g., type definitions that diverge between client and server)

---

## Discipline 8: Error, Failure & Recovery Patterns

<!-- AGENT: Define how errors and failures are handled.
Fail explicitly. Recover gracefully. Never swallow errors.
Derive from BELS reason codes and COPY_GUIDE error messaging. -->

### Required Practices
- UNKNOWN (e.g., every error has a reason code from BELS)
- UNKNOWN (e.g., errors bubble up with context — never lose the stack)
- UNKNOWN (e.g., user-facing errors use COPY_GUIDE messages)
- UNKNOWN (e.g., partial failure does not corrupt state)

### Forbidden Patterns
- UNKNOWN (e.g., empty catch blocks)
- UNKNOWN (e.g., generic "Something went wrong" without reason codes)
- UNKNOWN (e.g., swallowing errors silently)
- UNKNOWN (e.g., error handling that loses context)

---

## Discipline 9: Idempotency, Determinism & Side Effects

<!-- AGENT: Define rules for predictable behavior.
Same input, same output. Side effects are declared, not hidden. -->

### Required Practices
- UNKNOWN (e.g., API mutations are idempotent where possible)
- UNKNOWN (e.g., retrying an operation does not cause duplicate effects)
- UNKNOWN (e.g., side effects are explicit and documented)

### Forbidden Patterns
- UNKNOWN (e.g., operations that produce different results on retry)
- UNKNOWN (e.g., hidden side effects inside pure-looking functions)
- UNKNOWN (e.g., relying on execution order for correctness)

---

## Discipline 10: Performance & Optimization Patterns

<!-- AGENT: Define performance rules.
Measure first, optimize second. Never optimize without a measurement.
Derive from RPBS §7 Non-Functional Profile. -->

### Required Practices
- UNKNOWN (e.g., define performance budgets before building)
- UNKNOWN (e.g., measure before optimizing — no premature optimization)
- UNKNOWN (e.g., lazy load non-critical resources)

### Forbidden Patterns
- UNKNOWN (e.g., premature optimization without measurements)
- UNKNOWN (e.g., loading all data upfront when pagination is available)
- UNKNOWN (e.g., blocking the main thread with synchronous operations)

---

## Discipline 11: Debugging & Diagnosis Engineering

<!-- AGENT: Define how the system supports debugging and diagnosis.
Every failure must tell its story. Observability is not optional. -->

### Required Practices
- UNKNOWN (e.g., structured logging with context — request ID, user, action)
- UNKNOWN (e.g., error responses include enough info to diagnose without access to logs)
- UNKNOWN (e.g., health check endpoints for system status)

### Forbidden Patterns
- UNKNOWN (e.g., logging without context)
- UNKNOWN (e.g., production errors that require code reading to understand)
- UNKNOWN (e.g., suppressing warnings or errors)

---

## Discipline 12: Refactoring Mastery

<!-- AGENT: Define rules for safe structural changes.
Change structure without changing behavior. Tests prove equivalence. -->

### Required Practices
- UNKNOWN (e.g., refactor only when tests exist to verify behavior preservation)
- UNKNOWN (e.g., one structural change at a time — never combine refactor with feature)
- UNKNOWN (e.g., run full test suite before and after every refactor)

### Forbidden Patterns
- UNKNOWN (e.g., refactoring and adding features in the same commit)
- UNKNOWN (e.g., refactoring without test coverage)
- UNKNOWN (e.g., renaming/moving without updating all references)

---

## Build Execution Plan

<!-- AGENT: The build execution plan defines the ORDER in which code is built.
This is separate from the disciplines above, which apply simultaneously.
The plan is generated by the build-plan step from ERC, DDES, and DIM.
Each build step must follow ALL 12 disciplines above. -->

### Build Sequence

| # | Step | Inputs | Outputs | Gate |
|---|------|--------|---------|------|
| 1 | Foundation | RPBS, REBS | Project scaffold | Structure verified |
| 2 | Schema | DDES, domain-map | Database schema | Schema validated |
| 3 | Contracts | DIM, BELS | API contracts | Contracts typed |
| 4 | Auth | Security DDES | Auth system | Auth flows tested |
| 5 | Backend Core | Route specs, contracts | API endpoints | Endpoints responding |
| 6 | State | State machines | State management | State transitions verified |
| 7 | Frontend Shell | Screenmap, UI constraints | App shell + routing | Navigation working |
| 8 | Components | Component library | UI components | Components render |
| 9 | Integration | Workflow docs | Connected features | E2E flows pass |
| 10 | Testing | Test plan | Test suite | Coverage met |
| 11 | Security | Security review | Hardened app | Security audit pass |
| 12 | Deploy | DevOps docs | Production build | Deployment verified |

### Build Rules
- Build steps execute in order (1 → 12); each gate must pass before proceeding
- ALL 12 engineering disciplines apply to EVERY build step
- Each gate defines concrete, verifiable completion criteria
- If a step fails, log the failure reason and revert to the previous step state
- Partial completion is allowed with explicit WIP status

### Rollback Protocol
If a build step fails:
1. Document failure reason
2. Revert to previous step state
3. Fix blockers
4. Re-run failed step

### Completion Criteria
Project is complete when:
- [ ] All 12 build steps pass verification
- [ ] All 12 engineering disciplines honored throughout
- [ ] ERC signed off
- [ ] Production deployment verified

---

## Open Questions
<!-- AGENT: Implementation questions that need clarification before or during execution. -->
- UNKNOWN
