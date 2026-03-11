---
kid: "KID-ITIAM-CONCEPT-0001"
title: "OAuth/OIDC Basics (flows at a high level)"
content_type: "concept"
primary_domain: "platform_ops"
secondary_domains:
  - "identity_access_management"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "i"
  - "a"
  - "m"
  - ","
  - " "
  - "o"
  - "a"
  - "u"
  - "t"
  - "h"
  - ","
  - " "
  - "o"
  - "i"
  - "d"
  - "c"
  - ","
  - " "
  - "a"
  - "u"
  - "t"
  - "h"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/04_platform_ops/identity_access_management/concepts/KID-ITIAM-CONCEPT-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# OAuth/OIDC Basics (flows at a high level)

# OAuth/OIDC Basics (Flows at a High Level)

## Summary

OAuth 2.0 and OpenID Connect (OIDC) are widely-used protocols for secure authorization and authentication in modern applications. OAuth focuses on delegated authorization, allowing applications to access resources on behalf of a user, while OIDC extends OAuth to provide user authentication and identity verification. These protocols are essential for enabling secure, scalable, and user-friendly access to APIs and services.

---

## When to Use

- **Third-party API integration**: When your application needs to access external APIs (e.g., Google, GitHub, or Salesforce) on behalf of a user without handling their credentials directly.
- **Single Sign-On (SSO)**: For enabling seamless user authentication across multiple applications within an organization or ecosystem.
- **Resource access delegation**: When users need to grant limited access to their data or resources to a third-party application without sharing their credentials.
- **Mobile and web app authentication**: To secure user authentication flows in distributed applications, especially when handling sensitive data.

---

## Do / Don't

### Do:
1. **Use HTTPS** for all OAuth/OIDC flows to ensure secure communication.
2. **Implement the least privilege principle** by requesting only the scopes necessary for your application’s functionality.
3. **Validate tokens** (e.g., access tokens, ID tokens) using the issuer's public keys to ensure authenticity and integrity.

### Don't:
1. **Store access tokens in local storage** in client-side applications, as they are vulnerable to cross-site scripting (XSS) attacks. Use secure cookies or other secure storage mechanisms.
2. **Hardcode client secrets** in mobile or frontend applications, as they can be easily extracted.
3. **Ignore token expiration**—always refresh tokens when needed and handle expired tokens gracefully.

---

## Core Content

OAuth 2.0 and OpenID Connect (OIDC) are foundational protocols for modern identity and access management. While OAuth 2.0 focuses on authorization, OIDC builds on it to provide authentication and user identity information in a standardized way. Understanding the high-level flows of these protocols is crucial for designing secure and user-friendly applications.

### Key OAuth 2.0 Flows
1. **Authorization Code Flow**:  
   - **Use case**: Web apps and server-side applications.
   - **How it works**: The user authenticates with the authorization server, which issues an authorization code. The app exchanges this code for an access token and (optionally) a refresh token.  
   - **Benefit**: Keeps tokens secure by handling them server-side.

2. **Implicit Flow**:  
   - **Use case**: Legacy single-page applications (SPAs).  
   - **How it works**: The user authenticates, and the access token is returned directly in the URL fragment.  
   - **Drawback**: Less secure due to token exposure in the browser. Modern SPAs should use the Authorization Code Flow with PKCE.

3. **Client Credentials Flow**:  
   - **Use case**: Server-to-server communication (e.g., microservices).  
   - **How it works**: The client application authenticates itself with the authorization server to obtain an access token.  
   - **Benefit**: No user interaction is required.

4. **Device Code Flow**:  
   - **Use case**: Devices with limited input capabilities (e.g., smart TVs).  
   - **How it works**: The user is prompted to authenticate on a separate device using a code, and the application polls for the access token.  

5. **Resource Owner Password Credentials Flow**:  
   - **Use case**: Legacy systems where user credentials are directly handled by the app.  
   - **Drawback**: Discouraged for modern applications due to security risks.

### OpenID Connect (OIDC) Overview
OIDC is an identity layer built on top of OAuth 2.0. It introduces the concept of an **ID token**, which contains claims about the authenticated user (e.g., `sub`, `email`, `name`). Key OIDC features include:
- **Authentication**: Verifies the user’s identity.
- **UserInfo endpoint**: Provides additional user profile information.
- **Standardized claims**: Enables interoperability across identity providers.

### Example Scenario
Imagine a SaaS platform that integrates with Google APIs. Using the Authorization Code Flow, the platform can request access to a user’s Google Drive files. The user authenticates with Google, and the platform receives an access token to fetch the files. If OIDC is implemented, the platform can also retrieve the user’s identity (e.g., email address) for personalization.

---

## Links

- **OAuth 2.0 Authorization Framework**: The official specification for OAuth 2.0.  
- **OpenID Connect Core Specification**: Detailed documentation on OIDC.  
- **OWASP Authentication Cheat Sheet**: Best practices for secure authentication in applications.  
- **JSON Web Tokens (JWT)**: A standard for securely transmitting information between parties, often used in OAuth/OIDC.

---

## Proof / Confidence

This content is based on industry standards, including the OAuth 2.0 RFC 6749 and OpenID Connect Core Specification. OAuth and OIDC are widely adopted by leading technology providers (e.g., Google, Microsoft, Amazon) and are considered best practices for secure, scalable identity and access management. The recommendations align with OWASP guidelines and real-world implementations.
