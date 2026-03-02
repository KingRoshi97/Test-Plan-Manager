CDX-04
CDX-04 — Error/Warning/Success
Message Catalog
Header Block
   ●​ template_id: CDX-04​

   ●​ title: Error/Warning/Success Message Catalog​

   ●​ type: content_design_ux_writing​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/content/CDX-04_Message_Catalog.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.CONTENT​

   ●​ upstream_dependencies: ["DES-07", "DES-06", "ARC-06", "API-03", "CDX-01"]​

   ●​ inputs_required: ["DES-07", "DES-06", "CDX-01", "ARC-06", "API-03", "A11YD-05",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical catalog of user-facing messages for success, warning, and error states.
This ensures consistent wording, supports reason-code mapping, and prevents sensitive detail
leakage.


Inputs Required
   ●​ DES-07: {{xref:DES-07}} | OPTIONAL​

   ●​ DES-06: {{xref:DES-06}} | OPTIONAL​

   ●​ CDX-01: {{xref:CDX-01}}​
  ●​ ARC-06: {{xref:ARC-06}} | OPTIONAL​

  ●​ API-03: {{xref:API-03}} | OPTIONAL​

  ●​ A11YD-05: {{xref:A11YD-05}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Message entries (minimum 30 for non-trivial products; justify if smaller)​

  ●​ For each message:​

         ○​ msg_id​

         ○​ category (success/warning/error/info)​

         ○​ trigger condition (what causes it)​

         ○​ surface (inline/toast/banner/modal)​

         ○​ title (optional)​

         ○​ body text (required)​

         ○​ user action guidance (what user can do next)​

         ○​ severity (P0/P1/P2)​

         ○​ reason_code mapping (optional: rc_*)​

         ○​ retry_allowed (true/false)​

         ○​ accessibility notes (announcement behavior)​

         ○​ localization notes​

         ○​ redaction rule (what must not be shown)​



Optional Fields
    ●​ Variants by platform | OPTIONAL​

    ●​ Debug correlation ID policy (display or not) | OPTIONAL​

    ●​ Notes | OPTIONAL​



Rules
    ●​ Must comply with CDX-01 voice/tone rules.​

    ●​ Error messages must not leak internal system details; use redaction rules.​

    ●​ If mapped to reason codes (ARC-06), the mapping must be explicit.​

    ●​ Every P0 error must include user action guidance.​

    ●​ If retry_allowed is true, the message must align to DES-07 retry rules.​



Output Format
1) Message Catalog (canonical)
m cate      surf    trig     titl    bod    user seve        reaso     retry_     a11    l10     reda     not
s gory      ace     ger       e       y     _gui rity        n_co      allowe     y_n    n_      ction    es
g                                           danc               de         d       ote    not     _rule
_                                            e                                     s     es
i
d

m   {{ms    {{ms    {{ms     {{m     {{m    {{ms    {{ms     {{msg     {{msgs     {{m    {{m     {{ms     {{m
s   gs[0]   gs[0    gs[0     sgs     sgs[   gs[0]   gs[0]    s[0].re   [0].retr   sgs[   sgs     gs[0].   sgs[
g   .cate   ].sur   ].trig   [0].t   0].b   .guid   .sev     ason_     y_allo     0].a   [0].l   reda     0].n
_   gory}   face    ger}     itle}   ody    ance    erity}   code}}    wed}}      11y    10n     ction}   otes
0   }       }}      }        }       }}     }}      }                             }}     }}      }        }}
0
1

m {{ms      {{ms    {{ms     {{m {{m {{ms           {{ms     {{msg     {{msgs {{m {{m            {{ms {{m
s gs[1]     gs[1    gs[1     sgs sgs[ gs[1]         gs[1]    s[1].re   [1].retr sgs[ sgs         gs[1]. sgs[
g .cate     ].sur   ].trig   [1].t 1].b .guid       .sev     ason_     y_allo 1].a [1].l         reda 1].n
_                                                            code}}    wed}}
0   gory} face     ger}   itle}   ody   ance   erity}                  11y      10n   ction} otes
0   }     }}       }      }       }}    }}     }                       }}       }}    }      }}
2


2) Coverage Checks (required)

    ●​ P0 errors have guidance: {{coverage.p0_errors_have_guidance}}​

    ●​ Retry-allowed messages align with DES-07: {{coverage.retry_alignment}}​

    ●​ Reason-code mappings (if used) are valid: {{coverage.reason_codes_valid}}​



3) Redaction Rules (required)

    ●​ Never show: {{redaction.never_show}}​

    ●​ Allowed to show: {{redaction.allowed}} | OPTIONAL​

    ●​ Correlation ID policy: {{redaction.correlation_id_policy}} | OPTIONAL​



Cross-References
    ●​ Upstream: {{xref:CDX-01}}, {{xref:DES-07}} | OPTIONAL, {{xref:ARC-06}} | OPTIONAL,
       {{xref:API-03}} | OPTIONAL​

    ●​ Downstream: {{xref:DES-05}} | OPTIONAL, {{xref:FE-07}} | OPTIONAL, {{xref:MOB-*}} |
       OPTIONAL, {{xref:QA-02}} | OPTIONAL​

    ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
       {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
       {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
    ●​ beginner: Required. 30 messages with body + surface + guidance for P0.​

    ●​ intermediate: Required. Add retry flags and redaction rules.​
 ●​ advanced: Required. Add reason-code mapping and a11y announcement notes.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: title, reason_code, variants_by_platform,
    correlation_id_policy, notes, l10n_notes​

 ●​ If severity == P0 and user_guidance is UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.CONTENT​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ messages_count >= 30 (or justified)​

        ○​ p0_errors_have_guidance == true​

        ○​ redaction_rules_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
