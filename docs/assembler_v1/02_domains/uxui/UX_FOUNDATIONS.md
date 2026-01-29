# UX Foundations

## 0) Metadata
- Project: {{projectName}}
- Description: {{description}}
- Date: {{date}}
- Owner: {{owner}}
- Version: {{version}}

---

## 1) Product Promise
**One sentence:** {{oneSentencePromise}}

**Who it's for:** {{primaryAudience}}

**What it replaces / improves:** {{replacementOrUpgrade}}

---

## 2) Core Jobs To Be Done (JTBD)
List the top jobs users hire this product for.

| JTBD | User Type | Trigger | Success Outcome | Failure Cost |
|---|---|---|---|---|
| {{jtbd1}} | {{userType1}} | {{trigger1}} | {{success1}} | {{cost1}} |
| {{jtbd2}} | {{userType2}} | {{trigger2}} | {{success2}} | {{cost2}} |

---

## 3) Primary User Types
Use simple language. 3–6 types max.

| User Type | Description | Primary Goal | Key Permissions |
|---|---|---|---|
| {{userTypeName}} | {{desc}} | {{goal}} | {{perms}} |

---

## 4) Information Architecture
### 4.1 Top-level navigation
List tabs/sections.

| Nav Item | Route | Purpose | Notes |
|---|---|---|---|
| Create | /create | Build an Assembly | Wizard |
| Assemblies | /assemblies | View history and status | Search + filters |
| Settings | /settings | Keys + integrations | Admin |
| Docs | /docs | Assembler API docs | Public or gated |

### 4.2 Page inventory

| Screen | Route | Who uses it | Core Action |
|---|---|---|---|
| Create Wizard | /create | {{userTypes}} | Create Assembly |

---

## 5) Critical User Flows
Write as step-by-step sequences.

### 5.1 Create an Assembly (Happy Path)
1. {{step1}}
2. {{step2}}
3. {{step3}}

**Success criteria:** {{successCriteria}}

### 5.2 Delivery Setup (Happy Path)
1. {{step1}}
2. {{step2}}

**Success criteria:** {{successCriteria}}

### 5.3 Failure Paths (must document)
- Upload extraction fails → user sees {{expectedUI}} and can {{recoveryAction}}
- Delivery webhook returns 500 → system {{retryPolicy}} and user sees {{uiMessage}}

---

## 6) Content + Tone
**Tone:** {{tone}} (example: clear, confident, short)

### 6.1 Terminology (Axiom)
- Run = Assembly
- Bundle = Kit
- Handoff = Delivery
- Manifest = Assembly Manifest

### 6.2 Error message rules
- Show: what happened + what to do next.
- Always include reason code in a copyable format.

---

## 7) Accessibility Baselines
- Keyboard navigable wizard
- Visible focus ring
- Color contrast meets WCAG AA for text
- Status not color-only (use icon/label)

---

## 8) Open Questions
- [ ] {{question}}
