# Screen Map — Security

## Overview
**Domain Slug:** security

## Note
The Security domain does not have screens for MVP - authentication is optional. Future versions may add login/logout screens.

## Future Screens (Post-MVP)

### Screen: Login (Future)
- **Route:** /login
- **Purpose:** User authentication
- **Components:** LoginForm, PasswordField, SubmitButton
- **User Actions:** Enter credentials, submit login

### Screen: Logout (Future)
- **Route:** /logout
- **Purpose:** End user session
- **Components:** LogoutConfirmation

## Current State (MVP)
- No authentication required
- All API endpoints are publicly accessible
- Sessions not tracked

## Open Questions
- Authentication mechanism deferred to post-MVP per PROJECT_OVERVIEW
