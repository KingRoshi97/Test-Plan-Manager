<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:quality -->
<!-- AXION:PREFIX:qa -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Quality — Axion Assembler

**Module slug:** `quality`  
**Prefix:** `qa`  
**Description:** Code quality, linting, and standards for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:QA_SCOPE -->
## Scope & Ownership
- Owns: Linting rules, code formatting, TypeScript configuration, code review standards
- Does NOT own: Test execution (testing), security scanning (security)

<!-- AXION:SECTION:QA_STANDARDS -->
## Code Standards
- Style/lint rules: ESLint with @typescript-eslint/recommended + Prettier
- Naming conventions:
  - Variables/functions: camelCase
  - Components/types: PascalCase
  - Constants: UPPER_SNAKE_CASE
  - Files: camelCase or kebab-case
- Complexity limits: N/A for v1

<!-- AXION:SECTION:QA_REVIEWS -->
## Review Process
- PR checklist: N/A — single developer project
- Required reviewers/approvals: N/A

<!-- AXION:SECTION:QA_STATIC -->
## Static Analysis
- Typechecking requirements: TypeScript strict mode enabled
- Security/static scanners: npm audit for dependency vulnerabilities

<!-- AXION:SECTION:QA_DEP_POLICY -->
## Dependency Policy
- Allowed licenses: MIT, ISC, BSD, Apache-2.0
- Update cadence: Review and update monthly; patch security issues immediately

<!-- AXION:SECTION:QA_ACCEPTANCE -->
## Acceptance Criteria
- [x] Standards documented
- [x] Review gate defined
- [x] Static checks specified

<!-- AXION:SECTION:QA_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Use TypeScript strict mode; avoid `any` types.
2. Run ESLint before committing.
3. Format with Prettier.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
