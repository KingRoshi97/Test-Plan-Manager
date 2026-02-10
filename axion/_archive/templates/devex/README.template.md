<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:devex -->
<!-- AXION:PREFIX:dx -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# DevEx — AXION Module Template (Blank State)

**Module slug:** `devex`  
**Prefix:** `dx`  
**Description:** Developer experience, tooling, and workflows

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:DX_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the devex module.
"Owns" = local development setup, developer tooling, documentation standards, workflow conventions, developer support channels.
"Does NOT own" = CI/CD pipelines (devops module), code standards enforcement (quality module), test infrastructure (testing module).
Common mistake: conflating devex with devops — devex owns the local developer experience; devops owns the CI/CD and deployment pipeline. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:DX_LOCAL -->
## Local Development
<!-- AGENT: Derive from REBS §1 stack selection for required tools and architecture module for runtime requirements.
One-command setup = the single command a new developer runs to get a working local environment (e.g., "make setup", "npm run dev").
Env requirements = required tool versions (Node.js, Python, Docker), version management (nvm, pyenv), OS compatibility (macOS, Linux, Windows/WSL).
Common mistake: setup instructions that assume pre-existing tools — document every prerequisite and provide installation commands. -->
- One-command setup: [TBD]
- Env requirements (versions/tools): [TBD]


<!-- AXION:SECTION:DX_TOOLING -->
## Tooling & Automation
<!-- AGENT: Derive from architecture module conventions and existing project scripts.
CLIs/scripts = list of developer-facing scripts (name, purpose, usage), e.g., "npm run dev — starts local server", "npm run test — runs test suite".
Generators/scaffolds = code generators for common patterns (new component, new API route, new test), templates for consistency.
Common mistake: not documenting available scripts — developers shouldn't need to read Makefiles/package.json to discover available tooling. -->
- CLIs/scripts provided: [TBD]
- Generators/scaffolds: [TBD]


<!-- AXION:SECTION:DX_DOCS -->
## Documentation Standards
<!-- AGENT: Define what documentation is required and where it lives.
What must be documented = API endpoints (auto-generated from contracts), architecture decisions (ADRs), runbooks, onboarding guides, module READMEs.
Docs location = where docs live (repo /docs, wiki, Notion), naming conventions, review/update cadence.
Common mistake: documentation that's never maintained — define review cadence and ownership for each doc type. -->
- What must be documented: [TBD]
- Docs location + structure: [TBD]


<!-- AXION:SECTION:DX_WORKFLOW -->
## Workflow Conventions
<!-- AGENT: Derive from architecture module conventions and quality module review process.
Branching = branch naming (feature/, bugfix/, hotfix/), trunk-based vs gitflow, branch protection rules, merge strategy (squash, rebase, merge commit).
PR templates = required sections (description, testing, screenshots), checklist items, auto-labeling, linked issue requirements.
Common mistake: workflow conventions that are documented but not enforced — use branch protection rules and PR templates to automate enforcement. -->
- Branching/release workflow: [TBD]
- PR templates/checklists: [TBD]


<!-- AXION:SECTION:DX_SUPPORT -->
## Developer Support
<!-- AGENT: Define how developers get help when they're stuck.
Support channels = where to ask questions (Slack channel, office hours, documentation), escalation path for blocking issues.
SLAs = expected response time for developer support requests by severity (blocking: same day, non-blocking: 2 business days).
Common mistake: not having a dedicated support channel — developers resorting to random DMs creates knowledge silos. -->
- Support channels/SLAs: [TBD]


<!-- AXION:SECTION:DX_ACCEPTANCE -->
## Acceptance Criteria
- [ ] Setup is documented
- [ ] Tooling inventory exists
- [ ] Workflow standards stated


<!-- AXION:SECTION:DX_OPEN_QUESTIONS -->
## Open Questions
<!-- AGENT: Capture unresolved developer experience decisions or missing upstream information.
Each question should reference which upstream source is needed (e.g., "Awaiting REBS §1 for local development tooling selection").
Common mistake: leaving questions vague — each should be specific and actionable. -->
- [TBD]
