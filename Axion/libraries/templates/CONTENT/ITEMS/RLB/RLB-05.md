# RLB-05 — Responsive Media Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLB-05                                             |
| Template Type     | Design / Responsive Layout                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring responsive media rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Responsive Media Rules Document                         |

## 2. Purpose

Define how media (images, video, icons, thumbnails) scales and behaves across breakpoints
and device densities. This ensures consistent quality, performance, and accessibility for
responsive UI.

## 3. Inputs Required

- ● RLB-01: {{xref:RLB-01}} | OPTIONAL
- ● VAP-02: {{xref:VAP-02}} | OPTIONAL
- ● A11YD-01: {{xref:A11YD-01}} | OPTIONAL
- ● DSYS-03: {{xref:DSYS-03}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Media types covered (images, avatars, thumbnails, video, icons, illustrations)
● Scaling rules:
○ aspect ratio handling (crop vs letterbox)
○ container-fit rules (cover/contain equivalents)
○ max/min sizes by breakpoint class
● Device density rules (1x/2x/3x) and selection logic
● Loading rules:
○ placeholders/skeletons
○ progressive loading (if used)
○ error fallbacks
● Performance rules:
○ compression targets guidance
○ lazy-load rules
○ avoid layout shift rules
● Accessibility rules:
○ alt text requirements
○ captions/subtitles for video (if applicable)
● Verification checklist

Optional Fields
● Content moderation/blur rules (if applicable) | OPTIONAL
● Notes | OPTIONAL

Rules
● Media must not cause layout shift; define reserved space behavior.
● Cropping rules must not hide critical information without fallback.
● Video must have accessible controls and captions if content requires.
● Image density selection must be deterministic and match asset export spec (VAP-02).

Output Format
1) Media Scaling Rules (required)
media_
type

aspect_ratio_p
olicy

fit_policy

max_size_by
_bp

min_size_by
_bp

notes

image

{{rules.image.as
pect}}

{{rules.image
.fit}}

{{rules.image.
max}}

{{rules.image.
min}}

{{rules.image.n
otes}}

thumbn
ail

{{rules.thumb.as {{rules.thumb {{rules.thumb.
pect}}
.fit}}
max}}

{{rules.thumb.
min}}

{{rules.thumb.n
otes}}

video

{{rules.video.as
pect}}

{{rules.video.m {{rules.video.
ax}}
min}}

{{rules.video.n
otes}}

{{rules.video.
fit}}

2) Density Selection (required)
● Supported densities: {{density.supported}} (1x/2x/3x)
● Selection logic: {{density.selection_logic}}
● Asset source: {{xref:VAP-02}} | OPTIONAL

3) Loading + Error Rules (required)
● Placeholder policy: {{loading.placeholder}}
● Progressive loading: {{loading.progressive}} | OPTIONAL
● Error fallback behavior: {{loading.error_fallback}}
● Retry behavior: {{loading.retry}} | OPTIONAL

4) Performance Rules (required)
● Compression guidance: {{perf.compression}}
● Lazy-load rule: {{perf.lazy_load}}
● Layout shift prevention: {{perf.no_layout_shift}}

5) Accessibility Rules (required)
● Alt text rule: {{a11y.alt_text}}
● Decorative images: {{a11y.decorative}}
● Video captions/subtitles: {{a11y.captions}} | OPTIONAL
● Media controls a11y: {{a11y.controls}} | OPTIONAL

6) Verification Checklist (required)
● {{verify[0]}}
● {{verify[1]}}
● {{verify[2]}}
● {{verify[3]}} | OPTIONAL

Cross-References

● Upstream: {{xref:RLB-01}} | OPTIONAL, {{xref:VAP-02}} | OPTIONAL, {{xref:A11YD-01}}
| OPTIONAL
● Downstream: {{xref:FE-}} | OPTIONAL, {{xref:FPMP-}} | OPTIONAL, {{xref:QA-02}} |
OPTIONAL
● Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Scaling rules + density selection basics + alt text rule.
● intermediate: Required. Add loading/error and performance rules.
● advanced: Required. Add video accessibility and verification checklist rigor.

Unknown Handling
● UNKNOWN_ALLOWED: progressive_loading, captions, controls_a11y,
moderation_rules, notes
● If density selection logic is UNKNOWN → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.RESPONSIVE
● Pass conditions:
○ required_fields_present == true
○ scaling_rules_present == true
○ density_rules_present == true
○ loading_error_rules_present == true

○ placeholder_resolution == true
○ no_unapproved_unknowns == true

Visual Asset Production (VAP)

Visual Asset Production (VAP)
VAP-01 Asset Inventory (logos, icons, illustrations)
VAP-02 Export Spec (formats, sizes, naming, density)
VAP-03 Brand Usage Rules (do/don’t, clearspace)
VAP-04 Asset Delivery Checklist (handoff requirements)
VAP-05 Accessibility for Visual Assets (alt text, meaning)

VAP-01

VAP-01 — Asset Inventory (logos, icons,
illustrations)
Header Block
● template_id: VAP-01
● title: Asset Inventory (logos, icons, illustra

## 5. Optional Fields

● Content moderation/blur rules (if applicable) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- **(images/video scaling)**
- **Header Block**
- template_id: RLB-05
- title: Responsive Media Rules (images/video scaling)
- type: responsive_layout_breakpoints
- template_version: 1.0.0
- output_path: 10_app/responsive/RLB-05_Responsive_Media_Rules.md
- compliance_gate_id: TMP-05.PRIMARY.RESPONSIVE
- upstream_dependencies: ["RLB-01", "VAP-02", "A11YD-01"]
- inputs_required: ["RLB-01", "VAP-02", "A11YD-01", "DSYS-03", "STANDARDS_INDEX"]
- required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- **Purpose**
- **Define how media (images, video, icons, thumbnails) scales and behaves across breakpoints**
- **and device densities. This ensures consistent quality, performance, and accessibility for**
- **responsive UI.**
- **Inputs Required**
- RLB-01: {{xref:RLB-01}} | OPTIONAL
- VAP-02: {{xref:VAP-02}} | OPTIONAL
- A11YD-01: {{xref:A11YD-01}} | OPTIONAL
- DSYS-03: {{xref:DSYS-03}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- **Required Fields**
- Media types covered (images, avatars, thumbnails, video, icons, illustrations)
- Scaling rules:
- **○ aspect ratio handling (crop vs letterbox)**
- **○ container-fit rules (cover/contain equivalents)**
- **○ max/min sizes by breakpoint class**
- Device density rules (1x/2x/3x) and selection logic
- Loading rules:
- **○ placeholders/skeletons**
- **○ progressive loading (if used)**
- **○ error fallbacks**
- Performance rules:
- **○ compression targets guidance**
- **○ lazy-load rules**
- **○ avoid layout shift rules**
- Accessibility rules:
- **○ alt text requirements**
- **○ captions/subtitles for video (if applicable)**
- Verification checklist
- **Optional Fields**
- Content moderation/blur rules (if applicable) | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- Media must not cause layout shift; define reserved space behavior.
- Cropping rules must not hide critical information without fallback.
- Video must have accessible controls and captions if content requires.
- Image density selection must be deterministic and match asset export spec (VAP-02).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Media Scaling Rules (required)`
2. `## media_`
3. `## type`
4. `## aspect_ratio_p`
5. `## olicy`
6. `## fit_policy`
7. `## max_size_by`
8. `## _bp`
9. `## min_size_by`
10. `## _bp`

## 8. Cross-References

- Upstream: {{xref:RLB-01}} | OPTIONAL, {{xref:VAP-02}} | OPTIONAL, {{xref:A11YD-01}}
- | OPTIONAL
- Downstream: {{xref:FE-}} | OPTIONAL, {{xref:FPMP-}} | OPTIONAL, {{xref:QA-02}} |
- OPTIONAL
- Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
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
