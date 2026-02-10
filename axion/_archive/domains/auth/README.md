<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:auth -->
<!-- AXION:PREFIX:auth -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Auth — Axion Assembler

**Module slug:** `auth`  
**Prefix:** `auth`  
**Description:** Authentication, authorization, and identity management for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:RPBS_DERIVATIONS -->
## RPBS_DERIVATIONS (Required)
- Tenancy/Org Model: Single-tenant; one user per installation (source: RPBS §21)
- Actors & Permission Intents: Single user role for v1; optional local login (source: RPBS §3)
- Core Objects impacted here: User session (if auth enabled) (source: RPBS §4)
- Non-Functional Profile implications: N/A — auth is optional for v1 (source: RPBS §7)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A (source: RPBS §22)
- Privacy Controls (Deletion/Export): N/A — no user accounts stored (source: RPBS §29)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:AUTH_SCOPE -->
## Scope & Ownership
- Owns: Session management (if enabled), login flow, access control middleware
- Does NOT own: Database schema, API routes, file permissions

<!-- AXION:SECTION:AUTH_IDENTITY -->
## Identity Model
- Principal types: Single local user (no org/team hierarchy for v1)
- Identifier strategy: Username/password if auth enabled; otherwise open access

<!-- AXION:SECTION:AUTH_AUTHN -->
## Authentication
- Supported auth methods: Optional local login with username/password
- Session vs token strategy: Session-based with express-session and connect-pg-simple
- MFA requirements: N/A — not required for v1

<!-- AXION:SECTION:AUTH_AUTHZ -->
## Authorization
- RBAC/ABAC model: N/A for v1 — single user has full access
- Permission definitions: All actions permitted when authenticated (or auth disabled)
- Enforcement points: Backend middleware checks session; frontend hides UI if not authenticated

<!-- AXION:SECTION:AUTH_FLOWS -->
## Critical Flows
- Login flow: POST /api/login with username/password → session created → redirect to dashboard
- Signup/verification: N/A — no signup for v1; configured via settings
- Password reset: N/A for v1

<!-- AXION:SECTION:AUTH_SECURITY -->
## Security Controls
- Rate limiting: 5 login attempts per minute per IP
- Token rotation/expiration: Session expires after 24 hours of inactivity
- Audit logging: Login attempts logged to console

<!-- AXION:SECTION:AUTH_ACCEPTANCE -->
## Acceptance Criteria
- [x] AuthN methods documented
- [x] AuthZ model defined with permissions
- [x] Critical flows fully specified

<!-- AXION:SECTION:AUTH_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Auth is optional for v1; if enabled, use session-based authentication.
2. Never store plaintext passwords; use bcrypt for hashing.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
