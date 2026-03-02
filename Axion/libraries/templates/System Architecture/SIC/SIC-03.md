SIC-03
SIC-03 — Webhook Contract Spec
(producer/consumer, retries, signatures)
Header Block
   ●​ template_id: SIC-03​

   ●​ title: Webhook Contract Spec (producer/consumer, retries, signatures)​

   ●​ type: system_interfaces_integration_contracts​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/integrations/SIC-03_Webhook_Contract_Spec.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.INTEGRATION​

   ●​ upstream_dependencies: ["SIC-01", "ARC-07", "ERR-05"]​

   ●​ inputs_required: ["SIC-01", "ARC-07", "ERR-05", "DGP-01", "SEC-02",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the enforceable contract for webhooks (inbound and outbound): payload shape,
signature verification, replay protection, retry semantics, idempotency, and operational behavior.
This standardizes webhook behavior across vendors and internal producers.


Inputs Required
   ●​ SIC-01: {{xref:SIC-01}} | OPTIONAL​

   ●​ ARC-07: {{xref:ARC-07}} | OPTIONAL​

   ●​ ERR-05: {{xref:ERR-05}} | OPTIONAL​
  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ SEC-02: {{xref:SEC-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Webhook list (minimum 3 if webhooks are used; otherwise mark N/A)​

  ●​ For each webhook:​

        ○​ webhook_id​

        ○​ direction (inbound/outbound)​

        ○​ producer system​

        ○​ consumer system​

        ○​ endpoint URL pattern (for inbound) | OPTIONAL​

        ○​ event types supported​

        ○​ payload schema (typed)​

        ○​ signature scheme:​

               ■​ algorithm​

               ■​ secret/key reference (no raw secret)​

               ■​ header names​

               ■​ canonical signing string rules​

        ○​ replay protection:​

               ■​ timestamp header rules​

               ■​ tolerance window​
                 ■​ nonce/idempotency key rule​

         ○​ delivery rules:​

                 ■​ expected response codes​

                 ■​ retry schedule/backoff​

                 ■​ max attempts​

                 ■​ dedupe rules​

         ○​ failure handling:​

                 ■​ DLQ / quarantine rule​

                 ■​ alerting rule​

         ○​ PII classification and redaction rules​

         ○​ observability fields (event_id, delivery_id, correlation_id)​



Optional Fields
  ●​ Example payloads | OPTIONAL​

  ●​ Vendor-specific quirks | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Inbound webhooks must verify signature and replay protection before processing.​

  ●​ Processing must be idempotent; define the idempotency key.​

  ●​ Retry behavior must not cause duplicate side effects.​

  ●​ Never log raw secrets or full sensitive payload fields; apply redaction.​
      ●​ Outbound webhooks must include a stable event_id and delivery_id.​



Output Format
1) Applicability

      ●​ applies: {{webhooks.applies}} (true/false)​

      ●​ 00_NA (if not applies): {{webhooks.na_block}} | OPTIONAL​



2) Webhook Contracts (canonical)
 w      dire   pro     con     even     sign repl idem succe retr                 max_     pii    ob     not
 e      ctio   duc     sum     t_typ    atur ay_ poten ss_co y_                   attem    _cl    s_f    es
 b       n      er      er       es     e_sc pro cy_k   des  pol                   pts     as     iel
 h                                      hem tect    ey       icy                            s     ds
 o                                        e  ion
 o
 k
 _i
 d

w      {{ite   {{ite   {{ite   {{item   {{ite   {{ite   {{item    {{item   {{it   {{item   {{it   {{it   {{ite
h      ms[0    ms[0    ms[0    s[0].e   ms[0    ms[     s[0].id   s[0].s   em     s[0].m   em     em     ms[
_      ].dir   ].pro   ].con   vent_    ].sig   0].r    empo      ucces    s[0]   ax_att   s[0    s[0    0].n
0      ectio   duce    sum     types    natu    epl     tency}    s_cod    .ret   empts    ].pi   ].o    ote
1      n}}     r}}     er}}    }}       re}}    ay}}    }         es}}     ry}}   }}       i}}    bs}    s}}
                                                                                                  }


3) Signature Verification Rules (required if applies)

      ●​ Algorithm: {{signature.algorithm}}​

      ●​ Headers: {{signature.headers}}​

      ●​ Canonical string: {{signature.canonical_string_rule}}​

      ●​ Secret reference: {{signature.secret_ref}}​

      ●​ Failure behavior: {{signature.failure_behavior}}​
4) Replay Protection Rules (required if applies)

   ●​ Timestamp header: {{replay.timestamp_header}}​

   ●​ Tolerance window: {{replay.window}}​

   ●​ Nonce rule: {{replay.nonce_rule}} | OPTIONAL​

   ●​ Rejection behavior: {{replay.rejection_behavior}}​



5) Retry & Idempotency Rules (required if applies)

   ●​ Retry schedule/backoff: {{retry.schedule}}​

   ●​ Max attempts: {{retry.max_attempts}}​

   ●​ Dedupe rule: {{retry.dedupe}}​

   ●​ Idempotency key derivation: {{retry.idempotency_key_derivation}}​



6) Failure Handling (required if applies)

   ●​ DLQ/quarantine: {{failure.dlq}}​

   ●​ Alerting rule: {{failure.alerting}}​

   ●​ Manual re-drive policy: {{failure.redrive}} | OPTIONAL​



7) Observability & Redaction (required if applies)

   ●​ Required fields to log: {{obs.required_fields}}​

   ●​ Redaction policy: {{obs.redaction}}​



Cross-References
   ●​ Upstream: {{xref:SIC-01}} | OPTIONAL, {{xref:ARC-07}} | OPTIONAL​
  ●​ Downstream: {{xref:SIC-05}} | OPTIONAL, {{xref:ERR-05}} | OPTIONAL, {{xref:OBS-01}}
     | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required if applies. Define list + signature + retry basics.​

  ●​ intermediate: Required if applies. Add replay protection + idempotency derivation.​

  ●​ advanced: Required if applies. Add DLQ/redrive and observability/redaction rules.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: example_payloads, vendor_quirks, notes,
     nonce_rule, manual_redrive_policy​

  ●​ If applies == true and signature verification is UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.INTEGRATION​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ if_applies_then_webhooks_present == true​

         ○​ signature_rules_present == true​

         ○​ replay_protection_present == true​

         ○​ retry_idempotency_present == true​
○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true
