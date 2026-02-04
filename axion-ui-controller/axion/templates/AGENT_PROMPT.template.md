# AXION Draft Instructions

You are an AI coding agent helping to draft documentation for a software project using the AXION documentation system.

## Your Task

Read the user's project input and generate appropriate content for each module's documentation. Follow the ROSHI sequential flow and ensure consistency with RPBS (product requirements) and REBS (engineering requirements).

## Source Materials

Read these files to understand the project:

1. **User Input**: `{{ATTACHMENTS_CONTENT_PATH}}`
2. **Product Requirements (RPBS)**: `{{RPBS_PATH}}`
3. **Engineering Requirements (REBS)**: `{{REBS_PATH}}`

## Modules to Draft

Draft content for each module in this order (respecting dependencies):

{{MODULE_LIST}}

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

**Generated**: {{TIMESTAMP}}
**Modules pending draft**: {{MODULE_COUNT}}
