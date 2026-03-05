---
kid: "KID-ITIAM-REF-0001"
title: "Auth Terminology Reference (OAuth/OIDC glossary)"
type: reference
pillar: IT_END_TO_END
domains:
  - platform_ops
  - identity_access_management
subdomains: []
tags: [iam, oauth, oidc, glossary]
maturity: "reviewed"
use_policy: reusable_with_allowlist
executor_access: internal_and_external
license: internal_owned
allowed_excerpt:
  max_words: 0
  max_lines: 0
supersedes: ""
deprecated_by: ""
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: axion
---

# Auth Terminology Reference (OAuth/OIDC glossary)

# Auth Terminology Reference (OAuth/OIDC Glossary)

## Summary
This reference document provides definitions, parameters, and configuration options related to OAuth 2.0 and OpenID Connect (OIDC) terminology. It is intended for platform operations and identity access management teams working on IT end-to-end systems. Use this glossary to ensure consistent understanding and implementation of authentication and authorization standards.

---

## When to Use
- When configuring OAuth 2.0 or OIDC flows for secure access to APIs and web applications.
- During integration of third-party identity providers (IdPs) or single sign-on (SSO) systems.
- For troubleshooting authentication or authorization issues in distributed systems.
- When designing or auditing secure token-based access controls.

---

## Do / Don't

### Do:
1. **Use HTTPS** for all OAuth and OIDC endpoints to ensure secure communication.
2. **Validate tokens** using the IdP's public key or introspection endpoint before granting access.
3. **Implement scopes** to limit access to resources based on the principle of least privilege.

### Don't:
1. **Hardcode client secrets** in source code or configuration files; use secure storage solutions.
2. **Expose tokens** in URLs or query parameters, as this increases the risk of leakage.
3. **Skip state parameter validation** in authorization requests, as this opens up vulnerabilities to CSRF attacks.

---

## Core Content

### Key Definitions
| Term                  | Definition                                                                                     |
|-----------------------|-----------------------------------------------------------------------------------------------|
| **Access Token**      | A short-lived token used to access protected resources. Typically issued by the authorization server. |
| **Refresh Token**     | A long-lived token used to obtain new access tokens without requiring user reauthentication.   |
| **Client ID**         | A unique identifier assigned to a client application during registration with the authorization server. |
| **Client Secret**     | A confidential key used by the client application to authenticate itself to the authorization server. |
| **Authorization Code**| A temporary code issued after user authentication, exchanged for an access token.              |
| **Scope**             | A mechanism to define the level of access requested by the client application.                 |
| **State**             | A unique value sent in authorization requests to prevent CSRF attacks.                        |
| **ID Token**          | A token containing user identity claims, issued by the IdP in OIDC flows.                     |

---

### Parameters and Configuration Options

#### OAuth 2.0 Authorization Request Parameters
| Parameter      | Description                                                                                          |
|----------------|------------------------------------------------------------------------------------------------------|
| `response_type`| Specifies the type of response expected. Common values: `code`, `token`.                            |
| `client_id`    | Identifies the client application requesting authorization.                                          |
| `redirect_uri` | Specifies where the authorization server sends the user after authentication.                       |
| `scope`        | Defines the permissions requested by the client. Example: `openid profile email`.                   |
| `state`        | A unique value to maintain request integrity and prevent CSRF attacks.                              |

#### Token Endpoint Parameters
| Parameter      | Description                                                                                          |
|----------------|------------------------------------------------------------------------------------------------------|
| `grant_type`   | Specifies the type of grant used. Common values: `authorization_code`, `client_credentials`.         |
| `code`         | The authorization code received from the authorization server.                                       |
| `client_id`    | Identifies the client application.                                                                  |
| `client_secret`| Authenticates the client application.                                                               |
| `redirect_uri` | Must match the value used in the authorization request.                                             |

#### OIDC Configuration Options
| Option                 | Description                                                                                 |
|------------------------|---------------------------------------------------------------------------------------------|
| `issuer`               | URL of the IdP issuing tokens. Example: `https://accounts.example.com`.                     |
| `jwks_uri`             | URL to retrieve JSON Web Key Sets (JWKS) for token signature validation.                    |
| `userinfo_endpoint`    | URL to retrieve user claims based on the access token.                                      |
| `id_token_signing_alg` | Algorithm used to sign ID tokens. Example: `RS256`.                                         |

---

## Links
- **OAuth 2.0 Specification**: Official documentation describing the OAuth framework.
- **OpenID Connect Core Specification**: Details the OIDC protocol built on top of OAuth 2.0.
- **JSON Web Token (JWT) Standard**: Defines the structure and usage of tokens used in OAuth/OIDC.
- **OWASP Authentication Cheat Sheet**: Best practices for secure authentication implementation.

---

## Proof / Confidence
This content is based on widely adopted industry standards, including the OAuth 2.0 RFC 6749 and OpenID Connect Core Specification. These protocols are foundational to modern authentication and authorization workflows, with implementations validated by major cloud providers (e.g., AWS Cognito, Google Identity, Microsoft Azure AD). Common practices outlined here align with security benchmarks from OWASP and NIST SP 800-63 guidelines.
