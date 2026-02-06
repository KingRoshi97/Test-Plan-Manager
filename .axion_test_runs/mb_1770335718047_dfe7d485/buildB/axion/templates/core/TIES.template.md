# Technical Implementation Execution Specification (TIES) — {{PROJECT_NAME}}

## Overview
**Project:** {{PROJECT_NAME}}
**Version:** {{VERSION}}
**Last Updated:** {{DATE}}

## Purpose
This document defines the 12-phase implementation discipline for building the project. Each phase has specific inputs, outputs, and verification gates. Agents and developers must follow these phases in order.

---

## Phase Summary

| # | Phase | Input | Output | Gate |
|---|-------|-------|--------|------|
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

---

## Phase 1: Foundation

### Inputs Required
- [ ] RPBS_Product.md (product requirements)
- [ ] REBS_Product.md (technical architecture)
- [ ] domain-map.md (domain boundaries)

### Actions
1. Initialize project structure
2. Set up build tooling
3. Configure environment
4. Create folder hierarchy per domain-map

### Outputs
- [ ] Project scaffold created
- [ ] Package manager configured
- [ ] Dev environment working
- [ ] README with setup instructions

### Verification Gate
- [ ] `npm install` succeeds
- [ ] Dev server starts
- [ ] Folder structure matches domain-map

---

## Phase 2: Schema

### Inputs Required
- [ ] DDES for database module
- [ ] SCHEMA docs per entity
- [ ] domain-map.md

### Actions
1. Define database tables from SCHEMA docs
2. Set up ORM/migrations
3. Create seed data scripts
4. Document relationships

### Outputs
- [ ] Schema files created
- [ ] Migrations generated
- [ ] Seed scripts ready
- [ ] ERD documented

### Verification Gate
- [ ] Migrations run cleanly
- [ ] Seed data loads
- [ ] All entities have CRUD

---

## Phase 3: Contracts

### Inputs Required
- [ ] DIM (Domain Interface Map)
- [ ] BELS (Business Entity Logic Spec)
- [ ] Route specs

### Actions
1. Define TypeScript interfaces
2. Create Zod schemas for validation
3. Document API contract shapes
4. Set up shared types

### Outputs
- [ ] Type definitions
- [ ] Validation schemas
- [ ] Shared contract package
- [ ] API documentation stubs

### Verification Gate
- [ ] Types compile
- [ ] Schemas validate test data
- [ ] No `any` types in contracts

---

## Phase 4: Auth

### Inputs Required
- [ ] Security DDES
- [ ] Auth workflow docs
- [ ] User schema

### Actions
1. Implement auth provider
2. Set up session/token management
3. Create auth middleware
4. Build login/logout flows

### Outputs
- [ ] Auth system integrated
- [ ] Protected route middleware
- [ ] User session management
- [ ] Auth error handling

### Verification Gate
- [ ] Login flow works
- [ ] Protected routes block unauthorized
- [ ] Session persists correctly

---

## Phase 5: Backend Core

### Inputs Required
- [ ] Route specs
- [ ] Contracts from Phase 3
- [ ] BELS for business logic

### Actions
1. Implement API routes
2. Wire up controllers
3. Connect to database
4. Add validation middleware

### Outputs
- [ ] All routes implemented
- [ ] Request validation working
- [ ] Database queries functional
- [ ] Error handling consistent

### Verification Gate
- [ ] All endpoints return expected shapes
- [ ] Validation rejects bad input
- [ ] No unhandled errors

---

## Phase 6: State

### Inputs Required
- [ ] State machine docs
- [ ] Frontend state requirements
- [ ] Contracts for state shapes

### Actions
1. Set up state management
2. Implement state machines
3. Connect to API layer
4. Add persistence where needed

### Outputs
- [ ] State store configured
- [ ] State machines implemented
- [ ] API integration layer
- [ ] State persistence working

### Verification Gate
- [ ] State transitions correct
- [ ] API data flows to state
- [ ] No state race conditions

---

## Phase 7: Frontend Shell

### Inputs Required
- [ ] Screenmap
- [ ] UI Constraints
- [ ] UX Foundations

### Actions
1. Create app shell/layout
2. Set up routing
3. Implement navigation
4. Apply base styling/theme

### Outputs
- [ ] App shell renders
- [ ] All routes accessible
- [ ] Navigation working
- [ ] Theme applied

### Verification Gate
- [ ] All pages reachable
- [ ] Layout consistent
- [ ] Responsive basics working

---

## Phase 8: Components

### Inputs Required
- [ ] Component library spec
- [ ] Page specs
- [ ] UI Constraints

### Actions
1. Build component library
2. Implement page-specific components
3. Wire up to state
4. Add interactions

### Outputs
- [ ] All components built
- [ ] Components connected to state
- [ ] Interactions working
- [ ] Accessibility basics

### Verification Gate
- [ ] Components render correctly
- [ ] State bindings work
- [ ] No console errors

---

## Phase 9: Integration

### Inputs Required
- [ ] Workflow docs
- [ ] All previous phase outputs

### Actions
1. Connect all features end-to-end
2. Implement multi-step flows
3. Add loading/error states
4. Polish UX

### Outputs
- [ ] All workflows functional
- [ ] Error handling complete
- [ ] Loading states present
- [ ] UX polish applied

### Verification Gate
- [ ] Core user journeys complete
- [ ] No broken flows
- [ ] Error recovery works

---

## Phase 10: Testing

### Inputs Required
- [ ] Test plan
- [ ] Test strategy
- [ ] All feature outputs

### Actions
1. Write unit tests
2. Write integration tests
3. Write E2E tests
4. Set up CI pipeline

### Outputs
- [ ] Test suite complete
- [ ] CI pipeline configured
- [ ] Coverage report
- [ ] Test documentation

### Verification Gate
- [ ] Coverage targets met
- [ ] All tests pass
- [ ] CI runs green

---

## Phase 11: Security

### Inputs Required
- [ ] Security review doc
- [ ] Auth implementation
- [ ] API implementation

### Actions
1. Run security audit
2. Fix vulnerabilities
3. Add security headers
4. Review auth flows

### Outputs
- [ ] Audit report
- [ ] Vulnerabilities fixed
- [ ] Security hardening applied
- [ ] Penetration test results

### Verification Gate
- [ ] No critical vulnerabilities
- [ ] Security checklist complete
- [ ] Auth audit passed

---

## Phase 12: Deploy

### Inputs Required
- [ ] DevOps docs
- [ ] Perf budget
- [ ] All previous outputs

### Actions
1. Configure production build
2. Set up hosting
3. Configure monitoring
4. Create deployment pipeline

### Outputs
- [ ] Production build working
- [ ] Deployment automated
- [ ] Monitoring configured
- [ ] Runbook documented

### Verification Gate
- [ ] Deployment succeeds
- [ ] Health checks pass
- [ ] Monitoring alerts working
- [ ] Rollback tested

---

## Execution Notes

### Phase Dependencies
- Phases must execute in order (1 → 12)
- Each phase gate must pass before proceeding
- Partial phases allowed with explicit `WIP` status

### Rollback Protocol
If a phase fails:
1. Document failure reason
2. Revert to previous phase state
3. Fix blockers
4. Re-run failed phase

### Completion Criteria
Project is complete when:
- [ ] All 12 phases pass verification
- [ ] ERC signed off
- [ ] Production deployment verified
