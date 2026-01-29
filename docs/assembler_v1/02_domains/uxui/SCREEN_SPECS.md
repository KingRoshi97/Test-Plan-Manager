# Screen Specs

## 0) Metadata
- Project: {{projectName}}
- Version: {{version}}

---

## 1) Screen Spec Format
For each screen document:
- Purpose
- Primary actions
- Data needed
- Components used
- States: loading / empty / error / success
- Validation
- Analytics events (optional)

---

## 2) Screens

### 2.1 Create Wizard — /create
**Purpose:** Collect structured input and create an Assembly.

**Primary actions:**
- Next / Back
- Upload attachment
- Assemble (submit)

**Data needed:**
- projectName, description, features[], users[], techStack, uploadIds[]

**Components:**
- Stepper
- GlassCard
- Inputs, Textarea, Select
- UploadDropzone
- CodeBlock (Review payload)
- Toast

**States**
- Loading: (none)
- Empty: start state (fields blank)
- Error: validation + API error banner
- Success: route to /assemblies/:assemblyId

**Validation rules**
- projectName required
- description required
- features optional, but if present: name/description required, priority required
- users optional, but if present: type/goal required

**Edge cases**
- Attachment extracted text is empty (LOW_TEXT_YIELD) → show warning pill

---

### 2.2 Assemblies List — /assemblies
**Purpose:** Search and open assemblies.

**Primary actions:**
- Search
- Filter
- Open assembly
- New assembly

**Components:**
- PageHeader
- DataTable
- StatusBadge
- SkeletonRows
- EmptyState

**States**
- Loading: skeleton table
- Empty: no assemblies → CTA to /create
- Error: retry button

---

### 2.3 Assembly Detail — /assemblies/:assemblyId
**Purpose:** View status, Kit, Deliveries, Attachments.

**Tabs**
- Overview: AssemblyTimeline + logs tail + metadata
- Kit: download + manifest + agent prompt + delivery/input.json + delivery/ai_context.json
- Deliveries: list + create + retry
- Attachments: list + extracted preview

**Components:**
- Tabs
- AssemblyTimeline
- CodeBlock + CopyButton
- DataTable

**States**
- Loading: skeleton blocks
- Empty: (deliveries none) show empty with CTA
- Error: reason code + retry

---

### 2.4 Settings — /settings
**Purpose:** Manage keys and integrations.

**Panels**
- API Keys
- Webhook Test
- Git Presets

---

### 2.5 Docs — /docs
**Purpose:** Show Assembler API docs + examples.

**Components:**
- PageHeader
- CodeBlock
- CopyButton

---

## 3) Open Questions
- [ ] {{question}}
