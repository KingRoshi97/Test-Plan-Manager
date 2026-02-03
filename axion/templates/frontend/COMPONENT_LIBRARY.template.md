# Component Library ({{domain.name}})

## 0) Metadata
- Project: {{projectName}}
- Domain: {{domain.name}}
- Version: {{version}}

---

## 1) Purpose
This document prevents UI drift by defining:
- The component inventory
- Variants and allowed usage
- Required behaviors (loading/disabled/focus)

**Rule:** If a component/variant is not listed here, do not invent it. Add an Open Question.

---

## 2) Inventory

| Component | Variants | Sizes | Used On | Notes |
|---|---|---|---|---|
| Button | primary, secondary, ghost, destructive | sm, md, lg | all | primary uses brand accent/gradient |
| GlassCard | default, elevated | n/a | all | glass blur + subtle border |
| StatusBadge | queued, running, completed, failed, canceled | sm, md | lists, detail | never color-only; include label |
| DataTable | default, dense | n/a | lists | sticky header optional |
| CodeBlock | default | sm, md | docs, kit | always has copy button |
| Tabs | default | n/a | detail | 4 tabs fixed |
| Dialog | default | sm, md | create delivery | trap focus |
| Toast | success, error, info | n/a | all | short messages |
| UploadDropzone | default | n/a | create | shows extraction warnings |
| Stepper | default | n/a | create | shows current step |
| Skeleton | row, block, code | n/a | loading | matches layout |
| EmptyState | default | n/a | empty | includes CTA |

---

## 3) Contracts

### 3.1 StatusBadge mapping

| State | Label | Icon | Color intent |
|---|---|---|---|
| queued | Queued | UNKNOWN | neutral |
| running | Running | UNKNOWN | info |
| completed | Completed | UNKNOWN | success |
| failed | Failed | UNKNOWN | error |
| canceled | Canceled | UNKNOWN | neutral |

**Rule:** show label + icon; color is secondary.

---

### 3.2 Button rules
- Primary: only one per view section
- Destructive: confirm required
- Disabled: show tooltip/reason if possible

---

### 3.3 CodeBlock rules
- Copy button always visible
- If content > UNKNOWN lines, collapse with expand
- Never wrap long tokens; allow horizontal scroll

---

### 3.4 Dialog rules
- Focus trap on open
- Escape closes
- Primary action right-aligned

---

## 4) Open Questions
- [ ] UNKNOWN
