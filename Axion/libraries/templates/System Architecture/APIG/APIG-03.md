APIG-03
APIG-03 — Deprecation & Sunset Policy
(timelines, comms, redirects)
Header Block
   ●​ template_id: APIG-03​

   ●​ title: Deprecation & Sunset Policy (timelines, comms, redirects)​

   ●​ type: api_governance_versioning​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/api_governance/APIG-03_Deprecation_Sunset_Policy.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.APIG​

   ●​ upstream_dependencies: ["APIG-02", "REL-02", "RELOPS-01"]​

   ●​ inputs_required: ["APIG-02", "REL-02", "RELOPS-01", "SUP-03", "STK-04",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define how APIs are deprecated and sunset: timelines, communication requirements,
redirect/compatibility strategies, deprecation headers, and enforcement rules. This prevents
surprise breakage and makes migration predictable.


Inputs Required
   ●​ APIG-02: {{xref:APIG-02}} | OPTIONAL​

   ●​ REL-02: {{xref:REL-02}} | OPTIONAL​

   ●​ RELOPS-01: {{xref:RELOPS-01}} | OPTIONAL​
  ●​ SUP-03: {{xref:SUP-03}} | OPTIONAL​

  ●​ STK-04: {{xref:STK-04}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Deprecation stages (announce → warn → restrict → sunset)​

  ●​ Timeline policy (minimum lead time per stage)​

  ●​ Communication channels (docs/release notes/in-app emails if relevant)​

  ●​ Technical mechanisms:​

         ○​ deprecation headers​

         ○​ warning logs/metrics​

         ○​ compatibility shims (if allowed)​

         ○​ redirects (if applicable)​

  ●​ Client detection and reporting:​

         ○​ how to identify usage of deprecated endpoints/versions​

         ○​ reporting cadence​

  ●​ Approval requirements for sunset (who signs off)​

  ●​ Exceptions policy​



Optional Fields
  ●​ Customer-specific contracts (enterprise SLAs) | OPTIONAL​

  ●​ Notes | OPTIONAL​
Rules
   ●​ Sunsetting requires prior announcement and measurable usage monitoring.​

   ●​ Breaking clients must have a migration path documented.​

   ●​ Deprecation must be tracked in changelog/version notes (REL).​

   ●​ Exceptions must be time-bound.​



Output Format
1) Deprecation Stages (required)
 stag         meaning           minimum_duratio              signals              enforcement
   e                                  n

anno     {{stages.announce.     {{stages.announce. {{stages.announc           {{stages.announce.en
unce     meaning}}              duration}}         e.signals}}                forcement}}

warn     {{stages.warn.mea      {{stages.warn.dura     {{stages.warn.sign {{stages.warn.enforce
         ning}}                 tion}}                 als}}              ment}}

restri   {{stages.restrict.me   {{stages.restrict.du   {{stages.restrict.si   {{stages.restrict.enfor
ct       aning}}                ration}}               gnals}}                cement}}

suns     {{stages.sunset.me     {{stages.sunset.dur {{stages.sunset.si        {{stages.sunset.enfor
et       aning}}                ation}}             gnals}}                   cement}}


2) Timeline Policy (required)

   ●​ Minimum lead time for announce: {{timeline.announce_lead}}​

   ●​ Warn duration: {{timeline.warn_duration}}​

   ●​ Sunset minimum total window: {{timeline.total_min_window}}​



3) Communication Requirements (required)

   ●​ Required channels: {{comms.channels}}​
  ●​ Required artifacts (release notes, docs): {{comms.artifacts}}​

  ●​ Support macros pointer: {{xref:SUP-03}} | OPTIONAL​



4) Technical Mechanisms (required)

  ●​ Deprecation headers: {{tech.headers}}​

  ●​ Warning metrics/logs: {{tech.metrics_logs}}​

  ●​ Compatibility shims: {{tech.shims}} | OPTIONAL​

  ●​ Redirect rules: {{tech.redirects}} | OPTIONAL​



5) Usage Monitoring & Reporting (required)

  ●​ Usage detection method: {{usage.detection}}​

  ●​ Reporting cadence: {{usage.cadence}}​

  ●​ Thresholds to proceed to sunset: {{usage.thresholds}} | OPTIONAL​



6) Approval & Exceptions (required)

  ●​ Sunset approval required by: {{approval.required_by}}​

  ●​ Decision log pointer: {{xref:STK-04}} | OPTIONAL​

  ●​ Exceptions allowed when: {{exceptions.when}}​

  ●​ Time-bound exception rule: {{exceptions.time_bound}}​



Cross-References
  ●​ Upstream: {{xref:APIG-02}} | OPTIONAL, {{xref:REL-02}} | OPTIONAL​

  ●​ Downstream: {{xref:APIG-04}}, {{xref:APIG-05}} | OPTIONAL, {{xref:RELOPS-04}} |
     OPTIONAL​
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Stages + timeline + communication requirements.​

  ●​ intermediate: Required. Add technical mechanisms and usage reporting.​

  ●​ advanced: Required. Add thresholds, approvals, and exception governance.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: enterprise_contracts, notes, redirect_rules,
     shims​

  ●​ If timeline policy is UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.APIG​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ stages_present == true​

         ○​ timeline_present == true​

         ○​ comms_present == true​

         ○​ monitoring_present == true​

         ○​ approvals_present == true​

         ○​ placeholder_resolution == true​

         ○​ no_unapproved_unknowns == true
