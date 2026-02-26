INT-01 — Intake Form Spec (Field/Page Layout)
(Hardened Draft — Full)
1) Purpose
Define the exact intake surface the user submits through, including:
page order and page intent
every field presented to the user
field UI types (text, dropdown, chips, uploads, etc.)
which sections are conditional based on routing (matrix axes)
how “autofill draft” is offered (optional, user-controlled)
This spec exists so the internal agent can treat intake as a stable contract surface and so the schema/validator can remain aligned to what the user can actually submit.

2) Inputs
Template Matrix axes (routing):
skill_level (beginner/intermediate/expert)
category (application/service/infrastructure/library_sdk)
type_preset (category-scoped)
build_target (new/existing)
audience_context (consumer/internal/developer)
autofill (user choice)
Intake Inventory (all possible intake fields and modules)
File upload capabilities (zip, logo, etc.)

3) Outputs
A user submission payload (raw answers) that conforms to:
INT-02 Intake Schema Spec (field paths + types)
INT-03 Validation Rules (dependencies + thresholds)
A predictable “what the user saw” mapping, by:
form_version
routing snapshot
included modules list

4) Rules / Invariants (must always be true)
Schema alignment: every form field must map to a schema field path (INT-02). No orphan fields.
No unreachable schema: schema must not require fields the form cannot collect under that routing.
Routing first: Page 0 routing choices must occur before any conditional modules appear.
Autofill is opt-in: autofill drafting must never run automatically; the user explicitly toggles it.
Conditional clarity: if a section is omitted due to routing, it must be truly non-applicable (not silently skipping required info).
Version stamping: every submission stamps the exact form_version.

5) Page Structure (Locked Page List)
Page 0 — Routing (Matrix Selector)
Goal: determine what form modules should appear.
Fields:
Skill level (radio)
Category (dropdown)
Type preset (dropdown/cards; filtered by category)
Build target (radio)
Audience context (radio)
Autofill draft answers (toggle; default OFF)

Page 1 — Project Basics + Inputs
Goal: capture project identity + baseline inputs.
Sections:
Project Identity
Project name (text)
Project overview (large textarea)
One-liner (optional text)
Core experience paragraph (optional textarea)
Source Materials
Upload zip (file upload .zip)
Reference links (repeatable URL + label)
Existing Project Context (conditional: build_target=existing)
Existing repo link (URL)
Current state summary (textarea)
Must-not-change list (list builder)
Known issues list (repeatable title + description)
Delivery Preference
Desired scope (radio: mvp/full/unsure)
Priority bias (radio: speed/balanced/quality)

Page 2 — Product Intent + Brand Ideology
Goal: capture the “why/for who/success” and consumer ideology.
Always-present sections:
Problem statement (textarea)
Why now (optional textarea)
Alternatives/workarounds (repeatable name + optional link + what's missing)
Audience description (textarea)
Primary user label (text)
Secondary users (repeatable text)
Primary goals (repeatable text)
Success definition (textarea)
Success metrics (repeatable metric + optional target/timeframe)
Out of scope (repeatable text)
Consumer-only blocks (conditional: audience_context=consumer):
What it stands for (textarea)
Change created (optional textarea)
Core values (chips + custom)
Beliefs shaping decisions (chips + custom)
Refusal guardrails (textarea)
Psychographics (textarea)
User cares about / fears avoids (textarea)
Aligned communities (repeatable)
Status signal (dropdown)
Brand promise (text)
Positioning statement (optional textarea)
Unique advantage (optional textarea)
Voice adjectives (chips + custom)
Tone boundaries (optional textarea)
Example phrases (repeatable)
Content maturity (radio)
Emotional journey questions (optional textareas)

Page 3 — Design Direction (New Page)
Goal: ensure agents don’t guess UI direction.
Sections:
Style adjectives (chips + custom) (required for consumer)
Visual preset (dropdown)
Avoid list (list builder)
Logo upload (optional)
Brand colors (repeatable name + hex input)
Fonts (repeatable name + use-case)
Brand references (repeatable URL + notes)
UI density (radio)
Navigation preference (dropdown)
Component vibe (chips)
Motion preference (radio)
Accessibility expectations (checklist + notes)
Content presentation preference (radio)
Showcase screens (repeatable: name + priority + notes + optional ref URL/file)

Page 4 — Functional Spec
Goal: convert intent into buildable structure.
Sections:
Features
Must-have features (repeatable name + description)
Nice-to-have features (repeatable)
Future backlog (repeatable)
Priority ranking (drag/drop list of must-have)
Roles
Roles list (repeatable role subform)
Permissions
Role permissions builder (allowed/restricted/approval-required)
Workflows
Core workflows (repeatable workflow builder; steps list)
Edge workflows (optional)
Business rules
Business rules exist toggle
Must-always rules (repeatable; required if enabled)
Must-never rules (repeatable)
Validation rules (repeatable)
Lifecycle rules (repeatable)

Page 5 — Data Model (Conditional gate)
Goal: capture data truth when applicable.
Gate field:
Does the product store/manage data? (yes/no)
If yes:
Data objects/entities (repeatable subform)
fields (required/optional)
relationships
lifecycle states
Sensitive data flags (multi-select)
Import/export needs (multi-select)
Retention expectations (textarea)
Ownership/tenancy notes (textarea)

Page 6 — Auth & Authorization (Conditional gate)
Goal: capture auth requirements when applicable.
Gate field:
Authentication required? (yes/no)
If yes:
Auth methods (multi-select)
Account lifecycle (multi-select)
2FA required? (yes/no)
Session rules (multi-select)
Authorization model (dropdown)
Approval flows needed? (yes/no)
Approval flow description (textarea)

Page 7 — Integrations (Conditional gate)
Goal: capture external dependencies.
Gate field:
Any external integrations? (yes/no)
If yes:
Integrations list (repeatable subform):
service name, purpose, data in/out, triggers, secrets handling

Page 8 — Non-Functional Requirements (NFR)
Goal: capture performance/reliability/compliance expectations.
Performance targets (repeatable metric + target)
Scale assumptions (expected users, concurrent users, notes, unsure)
Reliability expectation (dropdown)
Offline required? (yes/no)
Compliance flags (multi-select + notes)

Page 9 — Category/Type Specific Page (conditional)
Only one of these is shown based on routing.category:
9A) Application UI Structure
Screens list (repeatable: name/purpose/roles/data/actions/states)
Navigation summary (sections + role diffs)
UX requirements checklist
9B) Service Structure
Responsibilities (textarea)
Operations (repeatable)
API consumers (repeatable)
Endpoints/actions (repeatable)
Webhooks (repeatable)
9C) Infrastructure Structure
Infra goal (textarea)
Environments (multi-select)
Runtime expectations (multi-select)
Observability needs (multi-select)
Backup/recovery notes (textarea)
9D) Library/SDK Structure
Target languages (multi-select + custom)
Developer persona (textarea)
API surface (repeatable)
Init/config pattern (textarea)
Packaging/distribution (text)
Docs/examples expectations (multi-select)

Page 10 — Final Verification + Confirmations
Goal: prevent “agree later” drift.
Definition of done (textarea)
Must-pass checks (multi-select + custom)
Acceptance criteria statements (repeatable)
Rejection conditions (textarea)
Confirm priorities are correct (checkbox must be true)
Confirm out-of-scope is real (checkbox must be true)
Confirm constraints are accurate (checkbox must be true)

6) Failure Modes
Form collects fields not in schema (orphan fields)
Schema requires fields that are never shown (unreachable requirements)
Autofill runs without user opt-in
Routing choices conflict with shown modules (wrong module set)
Conditional pages omitted when required by routing (missing foundations)

7) Definition of Done (INT-01)
INT-01 is complete when:
every page and field is enumerated
every field maps to a schema path (INT-02)
conditional inclusion rules are explicit (by routing/gates)
autofill behavior is explicitly opt-in
form_versioning rules are defined and enforceable
