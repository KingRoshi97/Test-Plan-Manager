STD-02 — Standards Resolution Rules (Defaults → Overrides → Snapshot)
(Hardened Draft — Full)
1) Purpose
Define the deterministic algorithm that resolves:
which standards packs apply to a project


which rules win when multiple packs provide rules


how overrides are applied or blocked


how the final ruleset becomes a Resolved Standards Snapshot (STD-03)


STD-02 is the “resolver law.” No discretionary behavior is allowed.

2) Inputs
Normalized Input Record (routing + flags + constraints)


Standards Library Index (packs, applies_when, priorities)


Standards Packs (rule entries)


User/project overrides (only for configurable rules)


System fixed contracts (cannot be overridden)



3) Outputs
A deterministic Resolved Ruleset:


final merged rule set


list of packs selected


explicit merge decisions (when conflicts exist)


overrides applied/blocked


version stamps


This becomes the content of STD-03 snapshot.



4) Resolver Invariants (must always be true)
Deterministic: same inputs + same library version ⇒ same resolved snapshot.


No silent conflict resolution: conflicts must be resolved by explicit precedence rules.


Fixed rules cannot be overridden.


Every resolved rule records its origin pack + version.


Blocked overrides are recorded, not discarded.



5) Resolution Pipeline (Locked Steps)
Step 1 — Compute Project Context
Build a resolver context from normalized input:
routing: category/type_preset/audience/build_target/skill_level


gates: data.enabled/auth.required/integrations.enabled


compliance flags (if any)


delivery preferences (scope, bias)


any user-stated constraints that are allowed to influence standards


Output: resolver_context

Step 2 — Select Applicable Packs
From the Standards Index, select packs where applies_when matches resolver_context.
Rules:
Matching is strict (boolean logic).


If a pack’s applies_when is ambiguous or incomplete, it is invalid.


Output: selected_packs[]

Step 3 — Order Packs Deterministically
Sort selected packs by:
specificity score (more specific applies_when wins)


priority (declared in pack metadata)


pack_id (lexical tie-breaker)


pack_version (highest version wins only if identical pack_id and both selected by policy)


Output: ordered_packs[]

Step 4 — Merge Rules
Initialize empty resolved_rules.
For each pack in ordered_packs:
For each rule in pack:


If rule_id not present → add it


If rule_id already present:


if the value is identical → keep existing, record both sources


if the value differs → resolve conflict using precedence below


Conflict Precedence (Locked)
System fixed contract rules (always highest; cannot be overwritten)


More specific pack wins (higher specificity score)


Higher priority wins


If still tied → conflict must be flagged as unresolved and resolver fails


Output: merged resolved_rules + conflict_log

Step 5 — Apply Overrides (Configurable Only)
For each override request:
locate target rule_id or field_path in resolved_rules


check fixed == false


if fixed: block override; record blocked override


if configurable: apply override; record applied override


Override record must include:
field_path/rule_id


before/after


source (user/admin/system)


reason (if provided)


status (applied/blocked)


timestamp


Output: overrides_applied[], overrides_blocked[]

Step 6 — Validate Resolved Ruleset
Run resolver-level checks:
no unresolved conflicts remain


all required baseline rules exist for the project context


e.g., if auth.required then security baseline rules must exist


every rule has origin metadata


If any fail → resolver fails (hard stop).

Step 7 — Emit Snapshot Inputs
Prepare the data that STD-03 will store:
selected packs + versions


resolved rules


overrides applied/blocked


fixed vs configurable map


resolver context



6) Specificity Scoring (to make precedence enforceable)
Specificity score increases with each explicit selector in applies_when, for example:
category specified


type_preset specified


audience_context specified


build_target specified


gate flags specified (auth/data/integrations)


compliance flags specified


Rule: specificity scoring must be numeric and consistent across runs.

7) Failure Modes
two packs conflict with no deterministic winner → resolver must fail


override attempts fixed rule → must be blocked and recorded


missing baseline rules for context → fail (no partial standards)


ambiguous applies_when → invalid pack



8) Definition of Done (STD-02)
STD-02 is complete when:
resolver steps are explicit and deterministic


precedence rules are locked and cover ties/conflicts


override application rules are strict and auditable


failure conditions are explicit (fail vs proceed is unambiguous)


output data required by STD-03 is fully specified

