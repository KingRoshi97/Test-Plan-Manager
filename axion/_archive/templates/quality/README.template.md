<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:quality -->
<!-- AXION:PREFIX:qa -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Quality — AXION Module Template (Blank State)

**Module slug:** `quality`  
**Prefix:** `qa`  
**Description:** Code quality, linting, and standards

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:QA_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the quality module.
"Owns" = code standards, linting rules, static analysis policy, review process, dependency policy, complexity limits.
"Does NOT own" = test strategy (testing module), security scanning (security module), deployment gates (devops module).
Common mistake: conflating quality with testing — quality owns code standards and review process; testing owns test strategy and coverage. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:QA_STANDARDS -->
## Code Standards
<!-- AGENT: Derive from REBS §1 stack selection for tooling choices and architecture module conventions.
Style/lint rules = linter tool (ESLint/Prettier/Biome), specific rule overrides with justification, auto-fix on save policy.
Naming conventions = file naming (kebab-case, PascalCase), variable naming, component naming, API naming patterns.
Complexity limits = max cyclomatic complexity per function, max file length, max function parameter count — with tooling enforcement.
Common mistake: defining standards without automated enforcement — every standard should be checkable by a linter or CI step. -->
- Style/lint rules: [TBD]
- Naming conventions: [TBD]
- Complexity limits: [TBD]


<!-- AXION:SECTION:QA_REVIEWS -->
## Review Process
<!-- AGENT: Define code review standards aligned with team size and architecture module conventions.
PR checklist = what reviewers must verify (tests pass, no lint errors, no new TODOs without tickets, security considerations, documentation updated).
Required reviewers = minimum approvals, CODEOWNERS rules, domain expert requirements for specific areas.
Common mistake: review process that's too heavy for team size — calibrate review requirements to team velocity and risk tolerance. -->
- PR checklist: [TBD]
- Required reviewers/approvals: [TBD]


<!-- AXION:SECTION:QA_STATIC -->
## Static Analysis
<!-- AGENT: Derive from architecture module tech stack for type system and RPBS §8 for security scanning requirements.
Typechecking = TypeScript strict mode settings, which directories are type-checked, type coverage targets.
Security/static scanners = tools used (Snyk, SonarQube, CodeQL), scan frequency (every PR, nightly, release), severity thresholds that block merging.
Common mistake: running static analysis only in CI without local developer tooling — developers should catch issues before pushing. -->
- Typechecking requirements: [TBD]
- Security/static scanners: [TBD]


<!-- AXION:SECTION:QA_DEP_POLICY -->
## Dependency Policy
<!-- AGENT: Derive from RPBS §8 Security & Compliance for license requirements and security module policies.
Allowed licenses = whitelist of acceptable OSS licenses (MIT, Apache-2.0, BSD), process for evaluating new licenses.
Update cadence = how often dependencies are updated (weekly automated PRs, monthly manual review), policy for security patches (immediate vs batched).
Common mistake: not tracking transitive dependencies — license and vulnerability checks must cover the full dependency tree, not just direct dependencies. -->
- Allowed licenses: [TBD]
- Update cadence expectations: [TBD]


<!-- AXION:SECTION:QA_ACCEPTANCE -->
## Acceptance Criteria
- [ ] Standards documented
- [ ] Review gate defined
- [ ] Static checks specified


<!-- AXION:SECTION:QA_OPEN_QUESTIONS -->
## Open Questions
<!-- AGENT: Capture unresolved quality decisions or missing upstream information.
Each question should reference which upstream source is needed (e.g., "Awaiting REBS §1 for linter tooling selection").
Common mistake: leaving questions vague — each should be specific and actionable. -->
- [TBD]
