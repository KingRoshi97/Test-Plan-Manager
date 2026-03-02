SBDT-06
SBDT-06 — Deployment Constraints
(rollouts, canary, migration safety)
Header Block
   ●​ template_id: SBDT-06​

   ●​ title: Deployment Constraints (rollouts, canary, migration safety)​

   ●​ type: service_boundaries_deployment_topology​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/topology/SBDT-06_Deployment_Constraints.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.TOPOLOGY​

   ●​ upstream_dependencies: ["ARC-08", "REL-01", "REL-04", "DATA-04"]​

   ●​ inputs_required: ["ARC-08", "REL-01", "REL-04", "DATA-04", "CICD-03",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the hard constraints and required practices for safe deployment: rollout strategy,
canary/phased deploy rules, migration safety, backward compatibility requirements, and rollback
posture. This prevents unsafe releases that break running systems.


Inputs Required
   ●​ ARC-08: {{xref:ARC-08}} | OPTIONAL​

   ●​ REL-01: {{xref:REL-01}} | OPTIONAL​

   ●​ REL-04: {{xref:REL-04}} | OPTIONAL​
  ●​ DATA-04: {{xref:DATA-04}} | OPTIONAL​

  ●​ CICD-03: {{xref:CICD-03}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Rollout strategy policy (default)​

  ●​ Canary/phased deploy rules (when required)​

  ●​ Backward compatibility rules during rollout (old+new running together)​

  ●​ Migration safety rules:​

         ○​ expand/contract approach (if applicable)​

         ○​ ordering constraints (code vs schema)​

         ○​ migration verification requirements​

  ●​ Rollback rules:​

         ○​ what can be rolled back safely​

         ○​ what cannot (irreversible migrations)​

         ○​ rollback triggers​

  ●​ Required pre-deploy checks (gate checklist pointer)​

  ●​ Required post-deploy verification steps​



Optional Fields
  ●​ Feature flag rollout pointers | OPTIONAL​

  ●​ Notes | OPTIONAL​
Rules
   ●​ Any rollout that runs mixed versions must guarantee compatibility.​

   ●​ Schema changes must be compatible with both old and new code during transition.​

   ●​ Rollback posture must be explicit before shipping.​

   ●​ If a migration is irreversible, it must require explicit approval.​



Output Format
1) Default Rollout Strategy (required)

   ●​ Default strategy: {{rollout.default}} (all-at-once/canary/phased/blue-green)​

   ●​ When canary is mandatory: {{rollout.canary_when_required}}​

   ●​ Abort conditions: {{rollout.abort_conditions}} | OPTIONAL​



2) Compatibility Rules (required)

   ●​ Mixed-version compatibility rule: {{compat.mixed_version}}​

   ●​ API compatibility rule: {{compat.api}}​

   ●​ Event/message compatibility rule: {{compat.events}} | OPTIONAL​



3) Migration Safety Rules (required)

   ●​ Approach: {{migrations.approach}} (expand/contract, etc.)​

   ●​ Ordering: {{migrations.ordering}} (schema first vs code first)​

   ●​ Verification: {{migrations.verification}}​

   ●​ Data backfill rule: {{migrations.backfill}} | OPTIONAL​



4) Rollback Rules (required)
  ●​ Rollback triggers: {{rollback.triggers}}​

  ●​ Safe rollback actions: {{rollback.safe_actions}}​

  ●​ Unsafe/blocked rollback cases: {{rollback.unsafe_cases}}​

  ●​ Roll-forward rule (when rollback not possible): {{rollback.roll_forward}} | OPTIONAL​



5) Pre/Post Deploy Checks (required)

  ●​ Pre-deploy gate pointer: {{checks.predeploy_gate_pointer}}​

  ●​ Post-deploy verification steps: {{checks.postdeploy_steps}}​



Cross-References
  ●​ Upstream: {{xref:REL-01}} | OPTIONAL, {{xref:DATA-04}} | OPTIONAL, {{xref:CICD-03}}
     | OPTIONAL​

  ●​ Downstream: {{xref:RELOPS-02}} | OPTIONAL, {{xref:QA-05}} | OPTIONAL,
     {{xref:IRP-01}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Default rollout + rollback triggers + pre/post checks.​

  ●​ intermediate: Required. Add compatibility and migration ordering rules.​

  ●​ advanced: Required. Add abort conditions and irreversible migration approval rules.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: feature_flag_pointers, abort_conditions, notes,
     backfill_rules​
 ●​ If migration safety ordering is UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.TOPOLOGY​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ rollout_strategy_present == true​

        ○​ compatibility_rules_present == true​

        ○​ migration_safety_present == true​

        ○​ rollback_rules_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
Permission Model & Authorization
Design (PMAD)
●​ Permission Model & Authorization Design (PMAD)​
   PMAD-01 Permission Model Overview (roles, resources, actions)​
   PMAD-02 AuthZ Policy Rules (RBAC/ABAC, inheritance, exceptions)​
   PMAD-03 Enforcement Points Map (UI/API/service/DB)​
   PMAD-04 Permission Check Patterns (standard decision flow + reason codes)​
   PMAD-05 Privileged Operations Policy (admin/mod/support actions, approvals)​
   PMAD-06 Audit Requirements for AuthZ (what must be logged)
