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

<!-- AXION:SECTION:RPBS_DERIVATIONS -->
## RPBS_DERIVATIONS (Required)
- Tenancy/Org Model: UNKNOWN (source: RPBS §21 Tenancy / Organization Model)
- Actors & Permission Intents: UNKNOWN (source: RPBS §3 Actors & Permission Intents)
- Core Objects impacted here: UNKNOWN (source: RPBS §4 Core Objects Glossary)
- Non-Functional Profile implications: N/A (source: RPBS §7 Non-Functional Profile)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A (source: RPBS §22)
- Privacy Controls (Deletion/Export): UNKNOWN (source: RPBS §29)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:AUTH_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the auth module.
"Owns" = authentication flows, authorization rules, identity/principal management, session/token lifecycle, permission definitions.
"Does NOT own" = user profile data beyond identity (backend/database), UI login forms (frontend), API contract shapes (contracts).
Common mistake: conflating auth with user profile management — auth owns identity verification, not user preferences or display names. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:AUTH_IDENTITY -->
## Identity Model
<!-- AGENT: Derive from RPBS §3 Actors — map each actor type to a principal type.
Principal types = human users, organizations/tenants, service accounts, API keys — list each with how they authenticate.
Identifier strategy = what uniquely identifies each principal (UUID primary key, email as login identifier, org slug), immutability rules.
Common mistake: using email as primary key (emails change) — use stable UUIDs as PKs with email as a mutable attribute. -->
- Principal types (user, org, service): [TBD]
- Identifier strategy (UUID/email/etc.): [TBD]


<!-- AXION:SECTION:AUTH_AUTHN -->
## Authentication
<!-- AGENT: Derive from RPBS §3 "Auth Required" column + architecture module's stack choices.
Supported auth methods = password, OAuth/social login, magic link, API key — list each with when it applies.
Session vs token = cookie-based sessions vs JWT vs opaque tokens — justify based on architecture (SPA vs SSR, mobile support).
MFA = which actors require MFA (from RPBS §3), supported second factors (TOTP, SMS, WebAuthn), enrollment flow.
Common mistake: choosing JWT without considering token revocation — if you need instant revocation, sessions or a token blacklist are required. -->
- Supported auth methods: [TBD]
- Session vs token strategy: [TBD]
- MFA requirements: [TBD]


<!-- AXION:SECTION:AUTH_AUTHZ -->
## Authorization
<!-- AGENT: Derive from RPBS §3 Permission Matrix + BELS authorization rules.
RBAC/ABAC = role-based (admin/member/viewer) vs attribute-based (owner of resource, same org), or hybrid — map from RPBS §3 permission intents.
Permission definitions = each permission (e.g., "can_edit_project") with which roles grant it, resource-level vs global scope.
Enforcement points = where checks happen — frontend (hide/disable UI elements) AND backend (reject unauthorized API calls). Backend is authoritative.
Common mistake: enforcing only on frontend — authorization MUST be enforced server-side; frontend enforcement is a UX convenience only. -->
- RBAC/ABAC model: [TBD]
- Permission definitions + ownership: [TBD]
- Enforcement points (FE/BE): [TBD]


<!-- AXION:SECTION:AUTH_FLOWS -->
## Critical Flows
<!-- AGENT: Derive from RPBS §5 user journeys that involve login, signup, and account recovery.
Login flow = step-by-step (enter credentials → validate → create session → redirect), error states (wrong password, locked account, unverified email).
Signup/verification = registration fields, email verification requirement, what happens before verification completes.
Password reset = request flow (enter email → send link → validate token → set new password), token expiration, rate limiting.
Common mistake: not specifying what happens on failure at each step — every step needs success AND failure paths. -->
- Login flow: [TBD]
- Signup/verification flow: [TBD]
- Password reset / recovery: [TBD]


<!-- AXION:SECTION:AUTH_SECURITY -->
## Security Controls
<!-- AGENT: Rate limiting and token expiration from RPBS §7 security/reliability requirements.
Rate limiting = max login attempts per window (e.g., 5 per 15 min), lockout duration, CAPTCHA triggers, per-IP and per-account limits.
Token rotation/expiration = access token TTL, refresh token TTL, rotation on use, absolute session timeout.
Audit logging = which auth events to log (login success/failure, password change, permission change, token refresh), retention period.
Common mistake: rate limiting only by IP (shared IPs bypass it) — combine IP + account-level rate limiting. -->
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
