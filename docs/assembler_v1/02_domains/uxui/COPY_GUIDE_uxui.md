# Copy Guide ({{domain.name}})

## 0) Metadata
- Project: {{projectName}}
- Domain: {{domain.name}}
- Version: {{version}}

---

## 1) Voice
- Clear, confident, short.
- Prefer plain language.
- Avoid jargon unless the UI is developer-facing.

---

## 2) UI Terminology (locked)
- Assembly (not Run)
- Kit (not Bundle)
- Delivery (not Handoff)
- Assembly Manifest (not manifest.json in UI)

---

## 3) Global Labels

| UI Element | Label |
|---|---|
| Primary CTA (Create) | Assemble |
| New item | New Assembly |
| Download | Download Kit |
| Retry | Retry Delivery |
| Copy URL | Copy URL |
| Copy JSON | Copy JSON |
| Copy reason code | Copy code |

---

## 4) Empty States (defaults)

### 4.1 Assemblies list
- Title: No assemblies yet
- Body: Create your first assembly to generate a kit and deliver it to an agent.
- CTA: New Assembly

### 4.2 Deliveries tab
- Title: No deliveries yet
- Body: Create a delivery to send this kit to your tool or agent.
- CTA: Create Delivery

### 4.3 Attachments
- Title: No attachments
- Body: Upload a doc to give the assembler more context.
- CTA: Upload

---

## 5) Toast Messages

| Event | Message |
|---|---|
| Copy success | Copied |
| Upload started | Uploading… |
| Upload extracted | Ready |
| Delivery created | Delivery created |
| Delivery retry | Retrying… |

---

## 6) Error Message Pattern
Always:
1) What happened
2) What you can do
3) Reason code (copyable)

Template:
- Title: {{shortProblem}}
- Body: {{nextStep}}
- Code: {{reasonCode}}

Example:
- Title: Upload failed
- Body: Try again or upload a smaller file.
- Code: ASSEMBLER_UPLOAD_FAILED

---

## 7) Open Questions
- [ ] UNKNOWN
