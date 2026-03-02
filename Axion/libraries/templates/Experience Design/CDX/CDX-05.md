CDX-05
CDX-05 — Notification Copy Templates
(push/email/in-app)
Header Block
   ●​ template_id: CDX-05​

   ●​ title: Notification Copy Templates (push/email/in-app)​

   ●​ type: content_design_ux_writing​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/content/CDX-05_Notification_Copy_Templates.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.CONTENT​

   ●​ upstream_dependencies: ["CDX-01", "CDX-02", "CDX-04", "DMG-04"]​

   ●​ inputs_required: ["CDX-01", "CDX-02", "CDX-04", "DMG-04", "MSG-03", "DGP-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define canonical, reusable copy templates for notifications across channels (push, email,
in-app). This ensures consistent tone, predictable personalization, safe handling of sensitive
data, and deterministic mapping from events to messages.


Inputs Required
   ●​ CDX-01: {{xref:CDX-01}}​

   ●​ CDX-02: {{xref:CDX-02}} | OPTIONAL​

   ●​ CDX-04: {{xref:CDX-04}} | OPTIONAL​
  ●​ DMG-04: {{xref:DMG-04}} | OPTIONAL​

  ●​ MSG-03: {{xref:MSG-03}} | OPTIONAL​

  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Channel rules (push/email/in-app) including length constraints and required parts​

  ●​ Template list (minimum 15; justify if smaller)​

  ●​ For each template:​

         ○​ notif_id​

         ○​ category (transactional/engagement/security/system)​

         ○​ trigger event(s) (event_id/event_name)​

         ○​ audience/eligibility (role/tier/segment) (optional)​

         ○​ channel(s) (push/email/in-app)​

         ○​ title/subject (per channel where applicable)​

         ○​ body content (per channel)​

         ○​ CTA text + CTA intent (where applicable)​

         ○​ personalization placeholders (explicit list)​

         ○​ redaction rules (PII / sensitive constraints)​

         ○​ dedupe key / frequency cap note (copy-side expectations)​

         ○​ localization notes​

         ○​ accessibility notes (readable, SR-friendly)​
Optional Fields
  ●​ Variants (A/B copy options) | OPTIONAL​

  ●​ Quiet hours policy note (pointer) | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Must comply with CDX-01 voice/tone and terminology.​

  ●​ Must comply with privacy classification (DGP-01): no high-PII values in push content
     unless explicitly allowed.​

  ●​ Push notifications must be understandable without opening the app.​

  ●​ Email templates must include a clear subject and a single primary CTA (unless
     system-critical).​

  ●​ Any security-related notification must avoid revealing exploitable details (e.g., “wrong
     password” specifics).​

  ●​ Placeholders must be explicit and safe (no raw PII unless allowed by DGP).​



Output Format
1) Channel Constraints (required)
 cha        must_include          max_length_guida        tone_context             notes
 nnel                                   nce

push    {{channels.push.must_i   {{channels.push.ma      {{channels.push.t   {{channels.push.n
        nclude}}                 x_len}}                 one}}               otes}}

in_a    {{channels.in_app.must   {{channels.in_app.m {{channels.in_ap        {{channels.in_app
pp      _include}}               ax_len}}            p.tone}}                .notes}}

emai    {{channels.email.must_i {{channels.email.ma      {{channels.email.   {{channels.email.
l       nclude}}                x_len}}                  tone}}              notes}}
2) Notification Templates (canonical)
n ca     tri   ch     pu      pu     in_     in_    em     em     ct    cta    pla    re     fre    a    l1    n
o te     gg    an     sh      sh      ap      ap    ail_   ail_   a_    _in    ceh    da     qc    11    0     ot
t go     er    ne     _tit    _b     p_t      p_    sub    bo     te    ten    old    cti    ap     y    n     es
i ry     _e    ls      le     od     itle    bo     ject   dy     xt     t     ers    on     _d     _    _
f        ve                    y              dy                                      _r     ed    n     n
_        nt                                                                           ule    up    ot    ot
i         s                                                                            s     e_     e    e
d                                                                                            no     s    s
                                                                                              te

n {{t    {{t   {{t    {{te    {{te   {{te    {{te   {{te   {{te   {{t   {{te   {{te   {{t    {{t   {{t   {{t   {{t
o em     e     em     mp      mpl    mpl     mpl    mpl    mpl    e     mp     mpl    em     e     e     e     e
t pla    m     pla    lat     ate    ate     ate    ates   ate    m     lat    ate    pla    m     m     m     m
i tes    pl    tes    es[     s[0]   s[0]    s[0]   [0].   s[0]   pla   es[    s[0]   tes    pla   pl    pl    pl
f [0].   at    [0].   0].     .pu    .in_    .in_   em     .em    tes   0].    .pla   [0].   tes   at    at    at
_ cat    es    ch     pu      sh_    app     app    ail_   ail_   [0]   cta    ceh    red    [0]   es    es    es
0 eg     [0]   an     sh      bo     _titl   _bo    subj   bod    .ct   _in    old    act    .fr   [0    [0    [0]
0 ory    .e    nel    _titl   dy}    e}}     dy}}   ect}   y}}    a_    ten    ers}   ion    eq    ].    ].l   .n
1 }}     ve    s}}    e}}     }                     }             tex   t}}    }      }}     ca    a     1     ot
         nt                                                       t}}                        p}}   11    0     es
         s}}                                                                                       y}    n}    }}
                                                                                                   }     }


3) Placeholder Policy (required)

  ●​ Allowed placeholders: {{placeholders.allowed}}​

  ●​ Disallowed placeholders (PII/sensitive): {{placeholders.disallowed}}​

  ●​ Formatting rules (dates, counts): {{placeholders.formatting}}​



4) Privacy/Redaction Rules (required)

  ●​ Never include in push: {{privacy.never_in_push}}​

  ●​ Allowed in email (if consented): {{privacy.allowed_in_email}} | OPTIONAL​

  ●​ Security notification restrictions: {{privacy.security_notification_rules}}​



5) Coverage Checks (required)
  ●​ Triggers map to known events (DMG-04): {{coverage.events_valid}}​

  ●​ Each template has channel-appropriate fields: {{coverage.channel_fields_complete}}​

  ●​ No forbidden placeholders used: {{coverage.no_forbidden_placeholders}}​



Cross-References
  ●​ Upstream: {{xref:CDX-01}}, {{xref:DMG-04}} | OPTIONAL, {{xref:MSG-03}} | OPTIONAL,
     {{xref:DGP-01}} | OPTIONAL​

  ●​ Downstream: {{xref:NOTIF-*}} | OPTIONAL, {{xref:INT-03}} | OPTIONAL, {{xref:QA-02}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. 15 templates with push+in-app basics and clear CTAs.​

  ●​ intermediate: Required. Add placeholder lists, redaction rules, and event mapping.​

  ●​ advanced: Required. Add channel constraints, freqcap/dedupe notes, and localization
     guidance.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: variants, quiet_hours_policy_note,
     freqcap_dedupe_note, l10n_notes, notes​

  ●​ If a template has a CTA, cta_intent cannot be UNKNOWN.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.CONTENT​
●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ templates_count >= 15 (or justified)​

       ○​ events_valid == true​

       ○​ channel_fields_complete == true​

       ○​ no_forbidden_placeholders == true​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true​
Design System & UI Tokens (DSYS)
Design System & UI Tokens (DSYS)​
DSYS-01 Token Spec (color, type, spacing, radius, elevation)​
DSYS-02 Component Variants Spec (props, variants, states)​
DSYS-03 Layout Grid & Spacing Rules​
DSYS-04 Iconography & Illustration Rules​
DSYS-05 Theming Rules (light/dark, brand constraints)
