# CDX-05 — Notification Copy Templates

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CDX-05                                             |
| Template Type     | Design / Content                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring notification copy templates    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Notification Copy Templates Document                         |

## 2. Purpose

Define canonical, reusable copy templates for notifications across channels (push, email,
in-app). This ensures consistent tone, predictable personalization, safe handling of sensitive
data, and deterministic mapping from events to messages.

## 3. Inputs Required

- ● CDX-01: {{xref:CDX-01}}
- ● CDX-02: {{xref:CDX-02}} | OPTIONAL
- ● CDX-04: {{xref:CDX-04}} | OPTIONAL
- ● DMG-04: {{xref:DMG-04}} | OPTIONAL
- ● MSG-03: {{xref:MSG-03}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Channel rules (push/email/in-app) including length constraints and required parts
● Template list (minimum 15; justify if smaller)
● For each template:
○ notif_id
○ category (transactional/engagement/security/system)
○ trigger event(s) (event_id/event_name)
○ audience/eligibility (role/tier/segment) (optional)
○ channel(s) (push/email/in-app)
○ title/subject (per channel where applicable)
○ body content (per channel)
○ CTA text + CTA intent (where applicable)
○ personalization placeholders (explicit list)
○ redaction rules (PII / sensitive constraints)
○ dedupe key / frequency cap note (copy-side expectations)
○ localization notes
○ accessibility notes (readable, SR-friendly)

Optional Fields
● Variants (A/B copy options) | OPTIONAL
● Quiet hours policy note (pointer) | OPTIONAL
● Notes | OPTIONAL

Rules
● Must comply with CDX-01 voice/tone and terminology.
● Must comply with privacy classification (DGP-01): no high-PII values in push content
unless explicitly allowed.
● Push notifications must be understandable without opening the app.
● Email templates must include a clear subject and a single primary CTA (unless
system-critical).
● Any security-related notification must avoid revealing exploitable details (e.g., “wrong
password” specifics).
● Placeholders must be explicit and safe (no raw PII unless allowed by DGP).

Output Format
1) Channel Constraints (required)
cha
nnel

must_include

max_length_guida
nce

tone_context

notes

push

{{channels.push.must_i
nclude}}

{{channels.push.ma
x_len}}

{{channels.push.t
one}}

{{channels.push.n
otes}}

in_a
pp

{{channels.in_app.must
_include}}

{{channels.in_app.m {{channels.in_ap
ax_len}}
p.tone}}

{{channels.in_app
.notes}}

emai
l

{{channels.email.must_i {{channels.email.ma
nclude}}
x_len}}

{{channels.email.
tone}}

{{channels.email.
notes}}

2) Notification Templates (canonical)
n ca
o te
t go
i ry
f
_
i
d

tri
gg
er
_e
ve
nt
s

ch
an
ne
ls

pu
sh
_tit
le

pu
sh
_b
od
y

in_
ap
p_t
itle

in_
ap
p_
bo
dy

em
ail_
sub
ject

em
ail_
bo
dy

ct
a_
te
xt

cta
_in
ten
t

pla
ceh
old
ers

re
da
cti
on
_r
ule
s

fre
qc
ap
_d
ed
up
e_
no
te

a
11
y
_
n
ot
e
s

l1
0
n
_
n
ot
e
s

n
ot
es

n {{t
o em
t pla
i tes
f [0].
_ cat
0 eg
0 ory
1 }}

{{t
e
m
pl
at
es
[0]
.e
ve
nt
s}}

{{t
em
pla
tes
[0].
ch
an
nel
s}}

{{te
mp
lat
es[
0].
pu
sh
_titl
e}}

{{te
mpl
ate
s[0]
.pu
sh_
bo
dy}
}

{{te
mpl
ate
s[0]
.in_
app
_titl
e}}

{{te
mpl
ate
s[0]
.in_
app
_bo
dy}}

{{te
mpl
ates
[0].
em
ail_
subj
ect}
}

{{te
mpl
ate
s[0]
.em
ail_
bod
y}}

{{t
e
m
pla
tes
[0]
.ct
a_
tex
t}}

{{te
mp
lat
es[
0].
cta
_in
ten
t}}

{{te
mpl
ate
s[0]
.pla
ceh
old
ers}
}

{{t
em
pla
tes
[0].
red
act
ion
}}

{{t
e
m
pla
tes
[0]
.fr
eq
ca
p}}

{{t
e
m
pl
at
es
[0
].
a
11
y}
}

{{t
e
m
pl
at
es
[0
].l
1
0
n}
}

{{t
e
m
pl
at
es
[0]
.n
ot
es
}}

3) Placeholder Policy (required)
● Allowed placeholders: {{placeholders.allowed}}
● Disallowed placeholders (PII/sensitive): {{placeholders.disallowed}}
● Formatting rules (dates, counts): {{placeholders.formatting}}

4) Privacy/Redaction Rules (required)
● Never include in push: {{privacy.never_in_push}}
● Allowed in email (if consented): {{privacy.allowed_in_email}} | OPTIONAL
● Security notification restrictions: {{privacy.security_notification_rules}}

5) Coverage Checks (required)

● Triggers map to known events (DMG-04): {{coverage.events_valid}}
● Each template has channel-appropriate fields: {{coverage.channel_fields_complete}}
● No forbidden placeholders used: {{coverage.no_forbidden_placeholders}}

Cross-References
● Upstream: {{xref:CDX-01}}, {{xref:DMG-04}} | OPTIONAL, {{xref:MSG-03}} | OPTIONAL,
{{xref:DGP-01}} | OPTIONAL
● Downstream: {{xref:NOTIF-*}} | OPTIONAL, {{xref:INT-03}} | OPTIONAL, {{xref:QA-02}} |
OPTIONAL
● Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. 15 templates with push+in-app basics and clear CTAs.
● intermediate: Required. Add placeholder lists, redaction rules, and event mapping.
● advanced: Required. Add channel constraints, freqcap/dedupe notes, and localization
guidance.

Unknown Handling
● UNKNOWN_ALLOWED: variants, quiet_hours_policy_note,
freqcap_dedupe_note, l10n_notes, notes
● If a template has a CTA, cta_intent cannot be UNKNOWN.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.CONTENT

● Pass conditions:
○ required_fields_present == true
○ templates_count >= 15 (or justified)
○ events_valid == true
○ channel_fields_complete == true
○ no_forbidden_placeholders == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

Design System & UI Tokens (DSYS)

Design System & UI Tokens (DSYS)
DSYS-01 Token Spec (color, type, spacing, radius, elevation)
DSYS-02 Component Variants Spec (props, variants, states)
DSYS-03 Layout Grid & Spacing Rules
DSYS-04 Iconography & Illustration Rules
DSYS-05 Theming Rules (light/dark, brand constraints)

DSYS-01

DSYS-01 — Token Spec (color, type,
spacing, radius, elevation)
Header Block
● template_id: DSYS-01
● title: Token Spec (color, type, spacing, radius, elevation)
● type: design_system_tokens
● template_version: 1.0.0
● output_path: 10_app/design_system/DSYS-01_Token_Spec.md
● compliance_gate_id: TMP-05.PRIMARY.DSYS
● upstream_dependencies: ["CDX-01", "A11YD-04"]
● inputs_required: ["CDX-01", "A11YD-04", "RLB-01", "STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}

Purpose
Define the canonical design tokens used across UI implementation so styling is consistent,
themeable, and accessible. Tokens are the source of truth for UI values (not component rules),
enabling FE/MOB to implement without inventing new visual constants.

Inputs Required
● CDX-01: {{xref:CDX-01}} | OPTIONAL
● A11YD-04: {{xref:A11YD-04}} | OPTIONAL
● RLB-01: {{xref:RLB-01}} | OPTIONAL

● STANDARDS_INDEX: {{standards.index}} | OPTIONAL
● Existing brand palette: {{inputs.brand_palette}} | OPTIONAL

Required Fields
● Token namespaces (color/type/space/radius/elevation/border/shadow/zindex)
● Color tokens:
○ semantic roles (bg/surface/text/border/primary/success/warn/error)
○ states (hover/active/disabled/focus)
○ theme variants (light/dark if applicable)
● Typography tokens (font families, sizes, weights, line heights)
● Spacing scale tokens (consistent step scale)
● Radius tokens (corner radii scale)
● Elevation tokens (shadows/surfaces) OR depth scale definition
● Focus tokens (focus ring width/offset/semantic color)
● Token naming rules and stability rules

## 5. Optional Fields

● Variants (A/B copy options) | OPTIONAL
● Quiet hours policy note (pointer) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Must comply with CDX-01 voice/tone and terminology.
- Must comply with privacy classification (DGP-01): no high-PII values in push content
- **unless explicitly allowed.**
- Push notifications must be understandable without opening the app.
- Email templates must include a clear subject and a single primary CTA (unless
- **system-critical).**
- Any security-related notification must avoid revealing exploitable details (e.g., “wrong
- **password” specifics).**
- Placeholders must be explicit and safe (no raw PII unless allowed by DGP).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Channel Constraints (required)`
2. `## cha`
3. `## nnel`
4. `## must_include`
5. `## max_length_guida`
6. `## nce`
7. `## tone_context`
8. `## notes`
9. `## push`
10. `## nclude}}`

## 8. Cross-References

- Upstream: {{xref:CDX-01}}, {{xref:DMG-04}} | OPTIONAL, {{xref:MSG-03}} | OPTIONAL,
- **{{xref:DGP-01}} | OPTIONAL**
- Downstream: {{xref:NOTIF-*}} | OPTIONAL, {{xref:INT-03}} | OPTIONAL, {{xref:QA-02}} |
- OPTIONAL
- Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
