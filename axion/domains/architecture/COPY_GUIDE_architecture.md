# Copy Guide — architecture

## Overview
**Domain Slug:** architecture
**Prefix:** arch
**Project:** Application

---

## Tone & Voice

- **Voice characteristics:** Friendly and encouraging, professional but approachable
- **Formality level:** Casual — use contractions, avoid jargon
- **Target reading level:** General audience (8th grade level)
- **Brand personality:** Helpful expert who speaks plainly

### Forbidden Patterns
- Technical error codes shown to users
- Passive voice in CTAs (use "Create" not "can be created")
- ALL CAPS for emphasis (use bold instead)

### Writing Rules
- Sentence case for all headings (not Title Case)
- Use "you/your" for user-facing copy
- Keep error messages under 20 words

---

## Page Titles & Headings

| Screen Ref | Page Title (browser tab) | Main Heading | Subheading |
|-----------|------------------------|-------------|-----------|
| arch_SCR_application | Applications — Application | Applications | Browse and manage your applications |
| arch_SCR_user | Users — Application | Users | Browse and manage your users |
| arch_SCR_platform targets | Platform targetss — Application | Platform targetss | Browse and manage your platform targetss |

---

## Labels & Headings

| Element ID | Context | Copy Text | Notes |
|-----------|---------|-----------|-------|
| arch_LBL_001 | Nav item | Applications | Primary navigation |
| arch_LBL_002 | Nav item | Users | Primary navigation |
| arch_LBL_003 | Nav item | Platform targetss | Primary navigation |

---

## Error Messages

| Error Code | User-Facing Message | Recovery Action Text | Severity |
|-----------|-------------------|---------------------|----------|
| APPLICATION_NOT_FOUND | We couldn't find that application. It may have been removed. | Browse other applications | error |
| APPLICATION_VALIDATION_FAILED | Please check your application details and try again. | Review highlighted fields | validation |
| USER_NOT_FOUND | We couldn't find that user. It may have been removed. | Browse other users | error |
| USER_VALIDATION_FAILED | Please check your user details and try again. | Review highlighted fields | validation |
| PLATFORM TARGETS_NOT_FOUND | We couldn't find that platform targets. It may have been removed. | Browse other platform targetss | error |
| PLATFORM TARGETS_VALIDATION_FAILED | Please check your platform targets details and try again. | Review highlighted fields | validation |

---

## Success Messages

| Action | Message | Display Method | Duration |
|--------|---------|---------------|----------|
| Application created | Application created successfully! | Toast | 3s auto-dismiss |
| User created | User created successfully! | Toast | 3s auto-dismiss |
| Platform targets created | Platform targets created successfully! | Toast | 3s auto-dismiss |

---

## Empty States

| Screen/Component | Empty State Message | Call to Action | CTA Target |
|-----------------|-------------------|---------------|-----------|
| Application List | No applications yet | Create your first application | /applications/new |
| User List | No users yet | Create your first user | /users/new |
| Platform targets List | No platform targetss yet | Create your first platform targets | /platform targetss/new |

---

## Confirmation Dialogs

| Action | Dialog Title | Dialog Message | Confirm Button | Cancel Button |
|--------|-------------|---------------|---------------|--------------|
| Delete application | Delete this application? | This action cannot be undone. | Delete application | Keep application |
| Delete user | Delete this user? | This action cannot be undone. | Delete user | Keep user |

---

## Placeholder Text

| Input | Placeholder Text |
|-------|-----------------|
| Application search | Search applications... |
| User search | Search users... |
| Platform targets search | Search platform targetss... |

---

## Loading & Progress Messages

| Action | Loading Message | Long Wait Message (>5s) |
|--------|----------------|----------------------|
| Application list load | — (show skeleton) | Still loading — hang tight! |
| User list load | — (show skeleton) | Still loading — hang tight! |

---

## Open Questions
- Brand voice specifics pending RPBS §10 definition
- Error message copy needs review against BELS reason codes
