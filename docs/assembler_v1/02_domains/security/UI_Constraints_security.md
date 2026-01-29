# UI Constraints — Security

## Overview
**Domain Slug:** security

## Note
Security domain has no UI for MVP - authentication is not required. Constraints listed are for future implementation.

## Login UI Constraints (Future)
- Simple email/password form
- Error messages do not reveal account existence
- Password field masked by default
- Remember me checkbox optional

## Session UI Constraints (Future)
- Session indicator in header (future)
- Logout button accessible from any page
- Session timeout warning before expiry

## Component Constraints (Future)

| Component | Allowed | Notes |
|-----------|---------|-------|
| LoginForm | Yes | Future implementation |
| LogoutButton | Yes | Future implementation |
| SessionIndicator | Yes | Future implementation |

## Security-Specific Constraints (Future)
- No password hints in error messages
- CSRF protection on forms
- Secure cookie flags set
- Rate limiting on login attempts

## MVP State
- No security UI components needed
- No authentication forms
- All access is public

## Open Questions
- Authentication mechanism deferred to post-MVP
