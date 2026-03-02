WFO-01
WFO-01 — Workflow Catalog
(sagas/jobs/background tasks by ID)
Header Block
   ●​ template_id: WFO-01​

   ●​ title: Workflow Catalog (sagas/jobs/background tasks by ID)​

   ●​ type: workflow_orchestration_design​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/workflows/WFO-01_Workflow_Catalog.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.WORKFLOWS​

   ●​ upstream_dependencies: ["PRD-04", "ARC-03", "ARC-05", "API-06"]​

   ●​ inputs_required: ["PRD-04", "ARC-03", "ARC-05", "API-06", "ERR-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical registry of workflows (sagas, background jobs, scheduled tasks) by stable
IDs so orchestration is deterministic and traceable. This is the authoritative list of “things that
happen over time” in the system.


Inputs Required
   ●​ PRD-04: {{xref:PRD-04}} | OPTIONAL​

   ●​ ARC-03: {{xref:ARC-03}} | OPTIONAL​

   ●​ ARC-05: {{xref:ARC-05}} | OPTIONAL​
  ●​ API-06: {{xref:API-06}} | OPTIONAL​

  ●​ ERR-01: {{xref:ERR-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Workflow list (minimum 10 for non-trivial systems; justify if smaller)​

  ●​ For each workflow:​

         ○​ wf_id​

         ○​ name​

         ○​ type (saga/job/scheduled)​

         ○​ trigger (event/cron/user_action/api)​

         ○​ purpose​

         ○​ linked_feature_ids​

         ○​ owner_service_id​

         ○​ inputs (events/commands/data)​

         ○​ outputs (events/side effects/data writes)​

         ○​ statefulness (stateless/stateful)​

         ○​ criticality (P0/P1/P2)​

         ○​ expected runtime class (ms/sec/min/hr)​

         ○​ concurrency posture (single/parallel/partitioned)​

         ○​ failure handling posture (retry/DLQ/manual)​

         ○​ observability requirements (trace/log fields)​
          ○​ auth context (system/user) (if relevant)​



Optional Fields
  ●​ State machine pointer (WFO-02) | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ wf_id must be stable and never reused for a different workflow.​

  ●​ Every workflow must declare triggers and failure posture.​

  ●​ Any user-impacting workflow must map to an error posture (ERR taxonomy) and UX
     fallback pointer (DES/CDX).​

  ●​ Concurrency posture must align with idempotency/concurrency rules (WFO-03).​



Output Format
1) Workflow Registry (canonical)
w na     typ    trig     featu     ow     inp     out     stat    criti     runt    conc     fail    ob    not
f me      e     ger      re_id    ner     uts     put     eful    calit     ime     urre     ure      s    es
_                          s      _se              s               y        _cla     ncy     _po
i                                 rvic                                       ss              stur
d                                   e                                                         e

w {{w    {{w    {{wo     {{wor    {{w     {{w     {{wo    {{wo    {{wo      {{wo    {{wor    {{wo    {{w   {{w
f orkf   orkf   rkflo    kflow    orkfl   orkfl   rkflo   rkflo   rkflo     rkflo   kflow    rkflo   ork   orkf
_ low    low    ws[      s[0].f   ows     ows     ws[     ws[     ws[0      ws[0    s[0].c   ws[     flo   low
0 s[0]   s[0]   0].tri   eatur    [0].    [0].i   0].o    0].st   ].criti   ].run   oncur    0].fa   ws[   s[0]
0 .na    .typ   gge      e_ids    own     npu     utpu    atef    calit     time    rency    ilure   0].   .not
1 me}    e}}    r}}      }}       er}}    ts}}    ts}}    ul}}    y}}       }}      }}       }}      obs   es}}
  }                                                                                                  }}

w {{w    {{w {{wo {{wor           {{w {{w {{wo            {{wo    {{wo      {{wo    {{wor    {{wo {{w      {{w
f orkf   orkf rkflo kflow         orkfl orkfl rkflo       rkflo   rkflo     rkflo   kflow    rkflo ork     orkf
_ low    low    ws[      s[1].f   ows    ows     ws[    ws[     ws[1      ws[1    s[1].c   ws[     flo   low
0 s[1]   s[1]   1].tri   eatur    [1].   [1].i   1].o   1].st   ].criti   ].run   oncur    1].fa   ws[   s[1]
0 .na    .typ   gge      e_ids    own    npu     utpu   atef    calit     time    rency    ilure   1].   .not
2 me}    e}}    r}}      }}       er}}   ts}}    ts}}   ul}}    y}}       }}      }}       }}      obs   es}}
  }                                                                                                }}


2) Coverage Checks (required)

  ●​ Every workflow has trigger: {{coverage.triggers_complete}}​

  ●​ Every workflow has failure posture: {{coverage.failure_complete}}​

  ●​ wf_ids unique: {{coverage.unique_ids}}​



Cross-References
  ●​ Upstream: {{xref:ARC-03}} | OPTIONAL, {{xref:API-06}} | OPTIONAL, {{xref:ERR-01}} |
     OPTIONAL​

  ●​ Downstream: {{xref:WFO-02}}, {{xref:WFO-03}}, {{xref:WFO-05}} | OPTIONAL,
     {{xref:OBS-*}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Registry with trigger + owner + failure posture.​

  ●​ intermediate: Required. Add concurrency posture and runtime class.​

  ●​ advanced: Required. Add observability and auth context.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: state_machine_pointer, notes, runtime_class (if to
     be measured)​
 ●​ If any workflow lacks trigger or owner_service_id → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.WORKFLOWS​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ workflows_count >= 10 (or justified)​

        ○​ triggers_complete == true​

        ○​ failure_complete == true​

        ○​ unique_ids == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
