# Design System v1 (Axiom)

## 0) Metadata
- Version: {{version}}
- Theme: Dark-first with light mode preserved

---

## 1) Principles
- Clarity over decoration
- Density is controlled (spacious but efficient)
- One primary accent at a time
- Copy-first UX (copy buttons everywhere it matters)

---

## 2) Brand Color Tokens
### 2.1 Primary
- Accent Gradient (brand): {{brandGradient}} (example: amber → red)
- Accent Solid: {{accentSolid}} (fallback for accessibility)

### 2.2 Neutral Surfaces (Dark)
- bg: {{bgDark}}
- surface: {{surfaceDark}}
- surfaceElevated: {{surfaceElevatedDark}}
- border: {{borderDark}}
- text: {{textDark}}
- mutedText: {{mutedTextDark}}

### 2.3 Neutral Surfaces (Light)
- bg: {{bgLight}}
- surface: {{surfaceLight}}
- border: {{borderLight}}
- text: {{textLight}}

### 2.4 Status Colors
- success: {{success}}
- warning: {{warning}}
- error: {{error}}
- info: {{info}}

---

## 3) Typography
- Display: {{displayFont}} / sizes: {{displayScale}}
- Body: {{bodyFont}} / sizes: {{bodyScale}}
- Mono: {{monoFont}} for code blocks

Rules:
- H1 only once per page
- Code blocks always mono

---

## 4) Spacing + Layout
- Base grid: 8px
- Page padding: 24px (desktop)
- Card padding: 16–20px
- Gaps: 12–16px

---

## 5) Radius, Borders, Elevation
- Radius:
  - buttons: 14–16px
  - cards: 18–24px (rounded-2xl)
- Borders: 1px subtle
- Shadows: soft, never harsh

---

## 6) Glass / Blur Rules
GlassCard rules:
- Background uses opacity over surface
- Blur is subtle
- Always keep text legible

---

## 7) Core Components (Contracts)

### 7.1 Button
Variants: primary, secondary, ghost, destructive
Sizes: sm, md, lg
Rules:
- primary uses Accent
- destructive uses error

### 7.2 Card (GlassCard)
Use for all major sections.

### 7.3 Badge (StatusBadge)
Maps: queued/running/completed/failed/canceled

### 7.4 Table (DataTable)
- Sticky header
- Row hover
- Dense mode optional

### 7.5 CodeBlock
- Copy button
- Optional language

### 7.6 Tabs
- Used on Assembly detail

### 7.7 Toast
- Used for copy success and API success/failure

---

## 8) Motion
- Small transitions only
- No distracting animation
- Use motion to show state changes

---

## 9) Accessibility
- AA contrast
- Focus rings visible
- Status not color-only

---

## 10) Open Questions
- [ ] {{question}}
