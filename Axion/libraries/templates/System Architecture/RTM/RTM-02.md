RTM-02
RTM-02 — Protocol & Transport Map
(WS/WebRTC/pubsub, fallback rules)
Header Block
   ●​ template_id: RTM-02​

   ●​ title: Protocol & Transport Map (WS/WebRTC/pubsub, fallback rules)​

   ●​ type: realtime_messaging_architecture​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/realtime/RTM-02_Protocol_Transport_Map.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.REALTIME​

   ●​ upstream_dependencies: ["RTM-01", "ARC-05", "SBDT-02"]​

   ●​ inputs_required: ["RTM-01", "ARC-05", "SBDT-02", "PMAD-01", "ERR-05",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define which transports/protocols are used for each realtime use case
(WS/WebRTC/pubsub/queue), how connections are established, what the fallback rules are,
and what constraints apply (auth, ordering, retries, congestion control).


Inputs Required
   ●​ RTM-01: {{xref:RTM-01}} | OPTIONAL​

   ●​ ARC-05: {{xref:ARC-05}} | OPTIONAL​

   ●​ SBDT-02: {{xref:SBDT-02}} | OPTIONAL​
  ●​ PMAD-01: {{xref:PMAD-01}} | OPTIONAL​

  ●​ ERR-05: {{xref:ERR-05}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Transport list (WS/WebRTC/pubsub/HTTP fallback/queue)​

  ●​ For each transport:​

         ○​ transport_id​

         ○​ protocol​

         ○​ intended use cases​

         ○​ connection model (client→gateway→service)​

         ○​ auth model (when and how validated)​

         ○​ reliability guarantees (ack, retries, ordering)​

         ○​ congestion/backpressure rules​

         ○​ fallback behavior if unavailable​

         ○​ limits (message size/rate)​

  ●​ Mapping table: use_case → primary transport → fallback transport​

  ●​ Reconnect strategy rules (bounded backoff, jitter)​

  ●​ Failure modes and expected handling (ties to ERR taxonomy)​



Optional Fields
  ●​ Mobile network constraints notes | OPTIONAL​
  ●​ Notes | OPTIONAL​



Rules
  ●​ Every realtime use case must have a defined fallback.​

  ●​ Auth must be validated server-side on connect/join and on send.​

  ●​ Backpressure rules must prevent memory blowups.​

  ●​ Any retry must respect idempotency/dedupe rules (ERR-05, RTM-04).​



Output Format
1) Transports (required)
tra protoco      intende     auth_mod       guarantees     backpre        limits      fallback    no
ns     l          d_use          el                         ssure                                 tes
por
t_i
 d

ws {{transp      {{transp    {{transport    {{transports   {{transpo    {{transpor    {{transpo   OP
_pr orts.ws.     orts.ws.    s.ws.guara     .ws.backpre    rts.ws.li    ts.ws.fallb   rts.ws.no   TI
ima use}}        auth}}      ntees}}        ssure}}        mits}}       ack}}         tes}}       ON
ry                                                                                                AL

we    {{transp   {{transp    {{transport    {{transports   {{transpo    {{transpor {{transpo      OP
brt   orts.we    orts.web    s.webrtc.g     .webrtc.bac    rts.webrt    ts.webrtc.f rts.webrt     TI
c     brtc.use   rtc.auth}   uarantees}     kpressure}}    c.limits}}   allback}}   c.notes}}     ON
      }}         }           }                                                                    AL


2) Use Case → Transport Mapping (required)
  rt_usecase_id        primary_transport        fallback_transport             rationale

{{map[0].usecase}}     {{map[0].primary}}       {{map[0].fallback}}      {{map[0].rationale}}

{{map[1].usecase}}     {{map[1].primary}}       {{map[1].fallback}}      {{map[1].rationale}}


3) Connection & Reconnect Rules (required)
  ●​ Connect handshake steps: {{conn.handshake}}​

  ●​ Reconnect strategy: {{conn.reconnect}}​

  ●​ Backoff/jitter policy: {{conn.backoff_jitter}}​

  ●​ Max reconnect window: {{conn.max_window}} | OPTIONAL​



4) Failure Modes (required)
failure_ty         detection            expected_behavior        error_cl           notes
    pe                                                             ass

disconnec    {{fail.disconnect.dete   {{fail.disconnect.behavi   depende    {{fail.disconnect.not
t            ct}}                     or}}                       ncy        es}}

auth_fail    {{fail.auth.detect}}     {{fail.auth.behavior}}     authz      {{fail.auth.notes}}

overload     {{fail.overload.detect} {{fail.overload.behavior    depende    {{fail.overload.notes}
             }                       }}                          ncy        }


Cross-References
  ●​ Upstream: {{xref:RTM-01}} | OPTIONAL, {{xref:ARC-05}} | OPTIONAL​

  ●​ Downstream: {{xref:RTM-03}}, {{xref:RTM-04}}, {{xref:RTM-06}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Transport mapping + fallback + reconnect basics.​

  ●​ intermediate: Required. Add auth model and reliability guarantees.​

  ●​ advanced: Required. Add backpressure rules, limits, and failure-mode handling.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: mobile_constraints_notes, notes,
    max_reconnect_window​

 ●​ If any use case lacks fallback transport → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.REALTIME​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ transports_present == true​

        ○​ mapping_present == true​

        ○​ reconnect_rules_present == true​

        ○​ failure_modes_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
