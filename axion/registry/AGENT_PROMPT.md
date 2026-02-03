# AXION Draft Instructions

You are an AI coding agent helping to draft documentation for a software project using the AXION documentation system.

## Your Task

Read the user's project input and generate appropriate content for each module's documentation. Follow the ROSHI sequential flow and ensure consistency with RPBS (product requirements) and REBS (engineering requirements).

## Source Materials

Read these files to understand the project:

1. **User Input**: `axion/registry/attachments_content.md`
2. **Product Requirements (RPBS)**: `axion/source_docs/product/RPBS_Product.md`
3. **Engineering Requirements (REBS)**: `axion/source_docs/product/REBS_Product.md`

## Modules to Draft

Draft content for each module in this order (respecting dependencies):

1. **Database**: `axion/domains/database/README.md` (depends on: contracts)
2. **Data**: `axion/domains/data/README.md` (depends on: database, contracts)
3. **Auth**: `axion/domains/auth/README.md` (depends on: contracts, database)
4. **Backend**: `axion/domains/backend/README.md` (depends on: contracts, database, auth)
5. **Integrations**: `axion/domains/integrations/README.md` (depends on: backend, contracts)
6. **State**: `axion/domains/state/README.md` (depends on: contracts)
7. **Frontend**: `axion/domains/frontend/README.md` (depends on: state, contracts)
8. **Fullstack**: `axion/domains/fullstack/README.md` (depends on: frontend, backend)
9. **Testing**: `axion/domains/testing/README.md` (depends on: backend, frontend)
10. **Quality**: `axion/domains/quality/README.md`
11. **Security**: `axion/domains/security/README.md` (depends on: auth, backend)
12. **DevOps**: `axion/domains/devops/README.md` (depends on: backend, testing)
13. **Cloud**: `axion/domains/cloud/README.md` (depends on: devops)
14. **DevEx**: `axion/domains/devex/README.md` (depends on: quality)
15. **Mobile**: `axion/domains/mobile/README.md` (depends on: frontend, state)
16. **Desktop**: `axion/domains/desktop/README.md` (depends on: frontend, state)

## For Each Module

1. Open the module's README.md in `axion/domains/<module>/README.md`
2. Replace `[TBD]` placeholders with appropriate content based on:
   - The user's input from attachments
   - RPBS sections relevant to that module
   - REBS sections relevant to that module
3. Fill in `UNKNOWN` only when information is genuinely missing (add to OPEN_QUESTIONS)
4. Ensure the RPBS_DERIVATIONS section references the correct RPBS sections

## Content Guidelines

- **Be specific**: Use actual names, technologies, and decisions from RPBS/REBS
- **Be consistent**: Use the same terminology across all modules
- **Be complete**: Fill in all sections, don't leave placeholders
- **Mark unknowns**: If information is truly missing, use `UNKNOWN` and add to OPEN_QUESTIONS
- **Follow dependencies**: Don't reference modules that haven't been drafted yet

## ROSHI Sequential Flow

The 7 core documents must be consistent:
1. RPBS → REBS → DDES → UX_Foundations → System_Spec → Component_Index → ERC

## After Drafting

When you've drafted all modules, tell the user to run:
```bash
node --import tsx axion/scripts/axion-verify.ts --all
```

This will validate your drafts against AXION's governance rules.

---

**Generated**: 2026-02-03T09:41:48.837Z
**Modules pending draft**: 16
