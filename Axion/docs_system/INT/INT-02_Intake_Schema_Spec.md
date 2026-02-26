INT-02 — Intake Schema Spec (Validity Contract)
(Hardened Draft — Full)
1) Purpose
Define the formal validity contract for intake submissions so the system can deterministically decide whether a submission is usable.
INT-02 defines:
canonical field paths and data types
required vs optional fields
allowed values (enums)
constraints (min/max length, min items, formats)
which sections may appear (schema shape)
INT-02 does not define dependency logic (“if X then Y”) or skill thresholds; that is INT-03.

2) Inputs
INT-01 Intake Form Spec (what can be submitted)
Locked routing axes and field inventory

3) Outputs
A stable schema contract that:
the Validator enforces
downstream stages trust
schema_version required in all submissions and validation reports

4) Rules / Invariants (must always be true)
One canonical path per field (no aliases).
Form-aligned: schema must not require fields that INT-01 cannot collect.
Backwards-aware: changes require schema_version bump and compatibility notes (governance).
No dependency logic here: conditional requirements live in INT-03.
No guessing: schema supports explicit UNKNOWN where policy allows (handled by templates/INT-03 thresholds, not by changing schema types).

5) Schema Shape (Top-Level Objects)
A submission payload is an object with these sections:
routing (required)
project (required)
inputs (optional)
existing (optional; used when build_target=existing)
delivery (required)
intent (required)
brand (optional; consumer-facing)
design (optional; consumer-facing)
spec (required)
data (optional)
auth (optional)
integrations (optional)
nfr (optional)
app_ui (optional)
service (optional)
infra (optional)
sdk (optional)
final (required)

6) Field Definitions (Types + Base Constraints)
6.1 routing (required)
routing.skill_level: enum SkillLevel (required)
routing.category: enum ProjectCategory (required)
routing.type_preset: enum TypePreset (required)
routing.build_target: enum BuildTarget (required)
routing.audience_context: enum AudienceContext (required)
routing.autofill: boolean (required)
6.2 project (required)
project.project_name: string (required; min/max length)
project.project_overview: string (required; min/max length)
project.project_oneliner: string (optional; max length)
project.core_experience_paragraph: string (optional; max length)
6.3 inputs (optional)
inputs.zip_upload: fileRef (optional; allowed filetypes rule)
inputs.reference_links[]: array (optional)
item: { url: string, label?: string }
6.4 existing (optional section)
existing.existing_repo_link: url (optional)
existing.current_state_summary: string (optional; min/max length)
existing.must_not_change[]: array (optional)
existing.known_issues[]: array (optional)
item: { title: string, description?: string }
6.5 delivery (required)
delivery.desired_scope: enum DesiredScope (required)
delivery.priority_bias: enum PriorityBias (required)
6.6 intent (required)
intent.problem_statement: string (required; min/max length)
intent.why_now: string (optional)
intent.alternatives[]: array (optional)
item: { name: string, link?: url, whats_missing?: string }
intent.audience_description: string (required)
intent.primary_user_label: string (required)
intent.secondary_users[]: array (optional)
intent.primary_goals[]: array (required; min 1)
intent.success_definition: string (required)
intent.success_metrics[]: array (optional)
item: { metric: string, target?: string, timeframe?: string }
intent.out_of_scope[]: array (required; min 1)
6.7 brand (optional section)
brand.stands_for: string (optional)
brand.change_created: string (optional)
brand.core_values[]: array (optional)
brand.decision_beliefs[]: array (optional)
brand.refusal_guardrails: string (optional)
brand.psychographics: string (optional)
brand.user_cares_about: string (optional)
brand.user_fears_avoids: string (optional)
brand.aligned_communities[]: array (optional)
brand.status_signal: enum StatusSignal (optional)
brand.brand_promise: string (optional)
brand.positioning_statement: string (optional)
brand.unique_advantage: string (optional)
brand.voice_adjectives[]: array (optional)
brand.tone_boundaries: string (optional)
brand.example_phrases[]: array (optional)
brand.content_maturity: enum ContentMaturity (optional)
brand.first_open_emotion: string (optional)
brand.post_success_emotion: string (optional)
brand.avoid_emotions: string (optional)
6.8 design (optional section)
design.style_adjectives[]: array (optional)
design.visual_preset: enum VisualPreset (optional)
design.avoid_list[]: array (optional)
design.logo_file: fileRef (optional)
design.brand_colors[]: array (optional)
item: { name?: string, hex: string }
design.fonts[]: array (optional)
item: { name: string, use_case?: enum FontUseCase }
design.brand_references[]: array (optional)
item: { url: string, notes?: string }
design.ui_density: enum UIDensity (optional)
design.nav_preference: enum NavPreference (optional)
design.component_vibe[]: array (optional)
design.motion_preference: enum MotionPreference (optional)
design.a11y_expectations[]: array (optional)
design.a11y_notes: string (optional)
design.content_presentation: enum ContentPresentation (optional)
design.showcase_screens[]: array (optional)
item: { name: string, visual_priority?: enum ShowcasePriority, notes?: string, ref_url?: url, ref_file?: fileRef }
6.9 spec (required)
spec.must_have_features[]: array (required; min 1)
item: { name: string, description?: string }
spec.nice_to_have_features[]: array (optional)
spec.future_features[]: array (optional)
spec.feature_priority_rank[]: array (required; references must-haves)
spec.roles[]: array (required; min 1)
item: { name: string, description?: string, primary_goal?: string }
spec.role_permissions[]: array (required)
item: { role_name: string, allowed_capabilities: array<string>, restricted_actions?: array<string>, approval_required_actions?: array<string> }
spec.workflows[]: array (required; min 3)
item: { name: string, actor_role: string, steps: array<string>, success_outcome: string, failure_states?: string, priority?: enum WorkflowPriority }
spec.edge_workflows[]: array (optional)
spec.business_rules_enabled: boolean (optional)
spec.must_always_rules[]: array (optional)
spec.must_never_rules[]: array (optional)
spec.validation_rules[]: array (optional)
item: { fields?: string, rule: string }
spec.lifecycle_rules[]: array (optional)
6.10 data (optional)
data.enabled: boolean (optional)
data.objects[]: array (optional)
item: { name: string, description?: string, required_fields?: array<object>, optional_fields?: array<object>, relationships?: array<object>, lifecycle_states?: array<string> }
6.11 auth (optional)
auth.required: boolean (optional)
auth.methods[]: array (optional)
auth.account_lifecycle[]: array (optional)
auth.two_fa_required: boolean (optional)
auth.session_rules[]: array (optional)
auth.authorization_model: enum AuthorizationModel (optional)
auth.approval_flows_needed: boolean (optional)
auth.approval_flows_description: string (optional)
6.12 integrations (optional)
integrations.enabled: boolean (optional)
integrations.items[]: array (optional)
item: { service_name: string, purpose: string, data_in?: string, data_out?: string, triggers?: array<enum IntegrationTrigger>, secrets_handling?: string }
6.13 nfr (optional)
nfr.performance_targets[]: array (optional)
nfr.scale_assumptions: object (optional)
nfr.reliability_expectation: enum ReliabilityLevel (optional)
nfr.offline_required: boolean (optional)
nfr.compliance_flags[]: array (optional)
6.14 category-specific optional sections
app_ui.* (optional)
service.* (optional)
infra.* (optional)
sdk.* (optional)
6.15 final (required)
final.definition_of_done: string (required)
final.must_pass_checks[]: array (optional)
final.acceptance_criteria[]: array (optional)
final.rejection_conditions: string (optional)
final.confirm_priorities: boolean (required; must be true)
final.confirm_out_of_scope: boolean (required; must be true)
final.confirm_constraints: boolean (required; must be true)

7) Enum Registry (Referenced)
INT-02 references enums defined in the schema’s enum registry:
SkillLevel, ProjectCategory, TypePreset, BuildTarget, AudienceContext
DesiredScope, PriorityBias
StatusSignal, ContentMaturity
VisualPreset, FontUseCase, UIDensity, NavPreference, MotionPreference, ContentPresentation, ShowcasePriority
WorkflowPriority
AuthMethod, AccountLifecycle, SessionRule, AuthorizationModel
IntegrationTrigger
ReliabilityLevel, ComplianceFlag
(Exact value lists are maintained in the Enum Registry for this schema version.)

8) Failure Modes
schema drift from form (field paths mismatch)
enums not aligned to UI choices
constraints too strict or too loose for real submissions
allowing undefined sections without control (fixed by INT-03)

9) Definition of Done (INT-02)
INT-02 is complete when:
every INT-01 field has a matching schema field path
all field types are explicit and stable
base constraints (min/max, formats) are defined where needed
enum references are complete for this schema version
changes require schema_version bump and compatibility notes

