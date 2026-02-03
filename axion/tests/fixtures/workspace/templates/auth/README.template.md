<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:auth -->
<!-- AXION:PREFIX:auth -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Auth — AXION Module Template (Blank State)

**Module slug:** `auth`  
**Prefix:** `auth`  
**Description:** Authentication, authorization, and identity management

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:AUTH_SCOPE -->
## Scope & Ownership
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:AUTH_IDENTITY -->
## Identity Model
- Principal types (user, org, service): [TBD]
- Identifier strategy (UUID/email/etc.): [TBD]


<!-- AXION:SECTION:AUTH_AUTHN -->
## Authentication
- Supported auth methods: [TBD]
- Session vs token strategy: [TBD]
- MFA requirements: [TBD]


<!-- AXION:SECTION:AUTH_AUTHZ -->
## Authorization
- RBAC/ABAC model: [TBD]
- Permission definitions + ownership: [TBD]
- Enforcement points (FE/BE): [TBD]


<!-- AXION:SECTION:AUTH_FLOWS -->
## Critical Flows
- Login flow: [TBD]
- Signup/verification flow: [TBD]
- Password reset / recovery: [TBD]


<!-- AXION:SECTION:AUTH_SECURITY -->
## Security Controls
- Rate limiting / lockouts: [TBD]
- Token rotation/expiration: [TBD]
- Audit logging requirements: [TBD]


<!-- AXION:SECTION:AUTH_ACCEPTANCE -->
## Acceptance Criteria
- [ ] AuthN methods documented
- [ ] AuthZ model defined with permissions
- [ ] Critical flows fully specified


<!-- AXION:SECTION:AUTH_OPEN_QUESTIONS -->
## Open Questions
- [TBD]
