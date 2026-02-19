# AXION Prompt Changelog

Tracks changes to the Agent Prompt template and placeholder resolvers.
Bump `KIT_PROMPT_VERSION` in `axion-package.ts` on every change below.

---

## 2.0.0 (2026-02-19)

**Breaking: Full Operating Contract rewrite**

- Added Operating Contract section at top of prompt with 10 subsections:
  - Source of Truth (SSOT hierarchy: ERC > RPBS > REBS > domain specs > knowledge)
  - File Sandboxing with `{{ALLOWED_PATHS}}` and `{{FORBIDDEN_PATHS}}` placeholders
  - Contract Locks (7 locked contract types + 3-step stop-and-ask protocol)
  - Minimal Diffs (no refactors, renames, formatting sweeps)
  - Work Style (thin vertical slices, visible progress first)
  - Phased Execution (phase-by-phase document loading)
  - Verification Is Mandatory (gate enforcement before phase completion)
  - Checkpoint After Every Phase (stop-and-present)
  - Report Unknowns (flag `UNKNOWN` placeholders to user)
- Added Verification Gates section with `{{VERIFICATION_COMMANDS}}` placeholder
  - Auto-generates table from stack profile (package manager + test framework)
  - 6 required gates: Install, Typecheck, Lint, Unit Tests, Build, Smoke Test
- Added Drift Report section (mandatory output after every phase)
  - 6 required subsections: Touched Files, Contracts Changed, New Dependencies,
    Verification Results, Acceptance Checks, Known Risks
- Added Output Discipline section (terse response format)
- Added Anti-Drift Mistakes 5 (Helpful Refactoring) and 8 (Changing Contracts)
- Merged old Critical Operating Rules into Operating Contract (no duplication)
- Added `assertPromptIntegrity()` enforcement gate — hard fails packaging if:
  - Any `{{PLACEHOLDER}}` remains unresolved
  - ALLOWED_PATHS < 3 lines, FORBIDDEN_PATHS < 5 lines
  - Verification table missing any of the 6 required rows
  - Required sections missing or out of order
- Added structural section-order validation (Operating Contract → Sandboxing →
  Contract Locks → Verification Gates → Drift Report → Output Discipline)
- Added `kit_prompt_version` field to manifest.json
- Added 13 golden fixture snapshot tests covering all three modes (docs/scaffold/full)

### New placeholder resolvers
- `generateAllowedPaths(mode, kitRoot)` — mode-aware (docs/scaffold/full)
- `generateForbiddenPaths(kitRoot)` — protects docs, domains, registry, knowledge, config
- `generateVerificationCommands(stackProfile)` — derives from stack profile

---

## 1.0.0 (2026-02-15)

**Initial template-driven prompt generation**

- Replaced hardcoded `generateAgentPrompt()` function with `AGENT_PROMPT.template.md`
- 23 template variables resolved at package time
- Phased Build Plan (4 phases)
- Document Priority Guide (3 tiers)
- Domain Classification table
- Anti-Drift Rules (7 mistakes)
- Quick Reference Card
