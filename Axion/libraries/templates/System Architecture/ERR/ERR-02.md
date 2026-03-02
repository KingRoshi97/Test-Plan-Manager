ERR-02
ERR-02 — Reason Codes Registry (rc_*
catalog + meanings)
Header Block
   ●​ template_id: ERR-02​

   ●​ title: Reason Codes Registry (rc_* catalog + meanings)​

   ●​ type: error_model_reason_codes​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/errors/ERR-02_Reason_Codes_Registry.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ERRORS​

   ●​ upstream_dependencies: ["ERR-01", "ARC-06"]​

   ●​ inputs_required: ["ERR-01", "ARC-06", "BRP-01", "DMG-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Create the canonical registry of reason codes (rc_*) used across the system. This enables
deterministic error mapping, consistent UX messaging, and consistent observability. Reason
codes are stable identifiers and must never be reused.


Inputs Required
   ●​ ERR-01: {{xref:ERR-01}} | OPTIONAL​

   ●​ ARC-06: {{xref:ARC-06}} | OPTIONAL​

   ●​ BRP-01: {{xref:BRP-01}} | OPTIONAL​
  ●​ DMG-01: {{xref:DMG-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Naming convention rules for reason codes​

  ●​ Registry entries (minimum 40 for non-trivial products; justify if smaller)​

  ●​ For each reason code:​

         ○​ reason_code (rc_<domain>_<slug>)​

         ○​ error_class (from ERR-01)​

         ○​ meaning (one sentence)​

         ○​ user_action_guidance (what to do)​

         ○​ default_http_status (if applicable)​

         ○​ retryable_default (true/false)​

         ○​ data_sensitivity (does message involve PII?) (yes/no)​

         ○​ owner_boundary/service​

         ○​ related_policy_or_rule (BRP/PMAD/etc pointer)​

         ○​ used_by (API endpoints/jobs/webhooks) | OPTIONAL​

         ○​ deprecation_status (active/deprecated)​

         ○​ replacement_reason_code (if deprecated)​



Optional Fields
  ●​ Localization key mapping | OPTIONAL​
     ●​ Notes | OPTIONAL​



Rules
     ●​ Reason codes are immutable IDs; deprecate instead of changing meaning.​

     ●​ Every deny/validation/business-rule error must map to a reason code (or the fallback
        policy).​

     ●​ A reason code must map to exactly one primary error_class.​

     ●​ If retryable_default is true, ERR-05 must define the exact retry behavior.​



Output Format
1) Naming Rules (required)

     ●​ Convention: {{rules.naming}} (rc_<area>_<slug>)​

     ●​ Allowed characters: {{rules.allowed_chars}}​

     ●​ Uniqueness rule: {{rules.uniqueness}}​

     ●​ Deprecation rule: {{rules.deprecation}}​



2) Reason Codes Registry (canonical)
re     erro    mea      user     http    retry    pii_    own    rel     used     statu     replac    note
as     r_cl    ning     _gui     _sta    able     sen      er    ate     _by        s       ement      s
on     ass              danc     tus              siti           d_r
_c                       e                         ve             ef
od
 e

rc     {{co    {{cod    {{cod    {{co    {{cod    {{co    {{co   {{co    {{cod    {{code    {{code    {{co
_0     des[    es[0].   es[0].   des[    es[0].   des     des[   des     es[0].   s[0].st   s[0].re   des[
01     0].cl   mean     guida    0].st   retrya   [0].    0].o   [0].r   used     atus_f    place     0].n
       ass}    ing}}    nce}}    atus    ble}}    pii}}   wner   ef}}    _by}}    lag}}     ment}}    otes
       }                         }}                       }}                                          }}
rc     {{co    {{cod    {{cod    {{co    {{cod    {{co    {{co   {{co    {{cod    {{code    {{code    {{co
_0     des[    es[1].   es[1].   des[    es[1].   des     des[   des     es[1].   s[1].st   s[1].re   des[
02     1].cl   mean     guida    1].st   retrya   [1].    1].o   [1].r   used     atus_f    place     1].n
       ass}    ing}}    nce}}    atus    ble}}    pii}}   wner   ef}}    _by}}    lag}}     ment}}    otes
       }                         }}                       }}                                          }}


3) Coverage Checks (required)

     ●​ Reason codes cover all deny policies (PMAD): {{coverage.pmads_covered}} |
        OPTIONAL​

     ●​ Reason codes cover all API error cases (API-03): {{coverage.api_covered}} | OPTIONAL​

     ●​ No duplicates: {{coverage.no_duplicates}}​



Cross-References
     ●​ Upstream: {{xref:ERR-01}} | OPTIONAL, {{xref:ARC-06}} | OPTIONAL​

     ●​ Downstream: {{xref:ERR-03}}, {{xref:ERR-04}}, {{xref:ERR-05}}, {{xref:CDX-04}} |
        OPTIONAL​

     ●​ Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
        {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
     ●​ beginner: Required. Naming rules + baseline registry entries.​

     ●​ intermediate: Required. Add status/retryability and owner mapping.​

     ●​ advanced: Required. Add deprecation/replacement and coverage checks.​



Unknown Handling
     ●​ UNKNOWN_ALLOWED: used_by, localization_key_mapping, notes,
        replacement_reason_code (if active)​
 ●​ If coverage.no_duplicates is false → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.ERRORS​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ naming_rules_present == true​

        ○​ codes_count >= 40 (or justified)​

        ○​ error_class_present_for_all_codes == true​

        ○​ no_duplicates == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
