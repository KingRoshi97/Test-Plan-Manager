SIC-05
SIC-05 — Integration Failure Modes &
Recovery (timeouts, retries, DLQ,
fallbacks)
Header Block
   ●​ template_id: SIC-05​

   ●​ title: Integration Failure Modes & Recovery (timeouts, retries, DLQ, fallbacks)​

   ●​ type: system_interfaces_integration_contracts​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/integrations/SIC-05_Integration_Failure_Recovery.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.INTEGRATION​

   ●​ upstream_dependencies: ["SIC-01", "SIC-02", "SIC-03", "ERR-05", "RELIA-01"]​

   ●​ inputs_required: ["SIC-01", "SIC-02", "SIC-03", "ERR-05", "RELIA-01", "OBS-04",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the deterministic failure handling model for integrations: what can fail, how we detect it,
how we retry, when we stop, what goes to DLQ/quarantine, and what user/system fallbacks
apply. This ensures integrations fail safely and recover predictably.


Inputs Required
   ●​ SIC-01: {{xref:SIC-01}} | OPTIONAL​
  ●​ SIC-02: {{xref:SIC-02}} | OPTIONAL​

  ●​ SIC-03: {{xref:SIC-03}} | OPTIONAL​

  ●​ ERR-05: {{xref:ERR-05}} | OPTIONAL​

  ●​ RELIA-01: {{xref:RELIA-01}} | OPTIONAL​

  ●​ OBS-04: {{xref:OBS-04}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Failure mode catalog (minimum 10)​

  ●​ For each failure mode:​

         ○​ fail_id​

         ○​ interface_id​

         ○​ operation (endpoint/event/webhook/job)​

         ○​ failure_type (timeout/5xx/4xx/schema/signature/rate_limit/network/partial)​

         ○​ detection method (status/timeout/validation)​

         ○​ classification (transient/permanent/unknown)​

         ○​ retry policy (none/immediate/backoff/scheduled)​

         ○​ max attempts​

         ○​ idempotency requirement (yes/no + key)​

         ○​ DLQ/quarantine rule​

         ○​ fallback behavior (system + user-facing)​

         ○​ alerting rule + severity​
            ○​ observability fields required​

            ○​ reason_code mapping (if exposed to client)​



Optional Fields
  ●​ Vendor escalation runbook pointer | OPTIONAL​

  ●​ Manual backfill/reconciliation steps | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Transient failures must use bounded backoff; never infinite retry.​

  ●​ Permanent failures must not retry; must quarantine or reject deterministically.​

  ●​ Any retryable operation must be idempotent (define key).​

  ●​ DLQ entries must be re-drivable with safety checks.​

  ●​ User-facing fallbacks must align with DES-07/CDX-04 when applicable.​



Output Format
1) Failure Modes Catalog (canonical)
f interf oper fail          dete     cla   retry   ma    idem       dl   fall   aler   ob    reas      not
a ace_i atio ure            ctio     ss    _poli   x_    pote      q_    bac    ting   s_    on_c      es
i   d     n   _ty            n              cy     att    ncy      rul    k            fie   ode
l             pe                                   em               e                  ld
_                                                  pts                                  s
i
d

f {{fails   {{fail   {{fa   {{fail   {{fa {{fails {{fa   {{fails   {{f {{fail   {{fail {{f   {{fails   {{fa
_ [0].int   s[0].    ils[   s[0].    ils[ [0].ret ils[   [0].id    ail s[0].    s[0]. ail    [0].re    ils[
  erfac     oper     0].t   dete     0].c         0].    empo      s[0 fallb    alert s[0    ason      0].n
0 e_id}     ation yp           ction    las    ry_po      ma     tency     ].dl ack}       ing}      ].o _cod        ote
1 }         }}    e}}          }}       s}}    licy}}     x}}    }}        q}} }           }         bs} e}}         s}}
                                                                                                     }

f {{fails   {{fail     {{fa    {{fail   {{fa   {{fails    {{fa   {{fails   {{f    {{fail   {{fail    {{f   {{fails   {{fa
_ [1].int   s[1].      ils[    s[1].    ils[   [1].ret    ils[   [1].id    ail    s[1].    s[1].     ail   [1].re    ils[
0 erfac     oper       1].t    dete     1].c   ry_po      1].    empo      s[1    fallb    alert     s[1   ason      1].n
2 e_id}     ation      yp      ction    las    licy}}     ma     tency     ].dl   ack}     ing}      ].o   _cod      ote
  }         }}         e}}     }}       s}}               x}}    }}        q}}    }        }         bs}   e}}       s}}
                                                                                                     }


2) Retry Policy Defaults (required)

   ●​ Backoff strategy: {{retry.defaults.backoff}}​

   ●​ Jitter rule: {{retry.defaults.jitter}} | OPTIONAL​

   ●​ Max attempts default: {{retry.defaults.max_attempts}}​

   ●​ When to switch to DLQ: {{retry.defaults.dlq_threshold}}​



3) DLQ / Quarantine Rules (required)

   ●​ DLQ entry must include: {{dlq.required_fields}}​

   ●​ Re-drive conditions: {{dlq.redrive_conditions}}​

   ●​ Re-drive safety checks: {{dlq.safety_checks}}​

   ●​ Data retention window: {{dlq.retention}} | OPTIONAL​



4) Alerts & SLO Impact (required)
  alert_type                  trigger                   severity           response_sla                    owner

integration_d        {{alerts.down.trigg       {{alerts.down.sever         {{alerts.down.sl {{alerts.down.own
own                  er}}                      ity}}                       a}}              er}}

dlq_growth           {{alerts.dlq.trigger} {{alerts.dlq.severity           {{alerts.dlq.sla}        {{alerts.dlq.owner
                     }                     }}                              }                        }}


5) User-facing Fallback Guidance (required if user-visible)
  ●​ Copy pointer: {{xref:CDX-04}} | OPTIONAL​

  ●​ UX surface pointer: {{xref:DES-07}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:SIC-02}} | OPTIONAL, {{xref:SIC-03}} | OPTIONAL, {{xref:ERR-05}} |
     OPTIONAL​

  ●​ Downstream: {{xref:OPS-06}} | OPTIONAL, {{xref:IRP-*}} | OPTIONAL, {{xref:QA-04}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Failure catalog + retry defaults + DLQ basics.​

  ●​ intermediate: Required. Add idempotency keys and alerting rules.​

  ●​ advanced: Required. Add re-drive safety checks and SLO impact mapping.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: vendor_escalation_runbook,
     manual_reconciliation, notes, retention_window​

  ●​ If any retryable operation lacks idempotency definition → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.INTEGRATION​

  ●​ Pass conditions:​
○​ required_fields_present == true​

○​ failure_modes_count >= 10​

○​ retry_defaults_present == true​

○​ dlq_rules_present == true​

○​ alerting_present == true​

○​ retryables_have_idempotency == true​

○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true​
