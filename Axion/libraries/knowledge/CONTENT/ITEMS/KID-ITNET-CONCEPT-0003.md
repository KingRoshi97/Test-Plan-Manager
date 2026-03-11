---
kid: "KID-ITNET-CONCEPT-0003"
title: "HTTP/HTTPS Basics (requests, TLS, certs)"
content_type: "concept"
primary_domain: "networking"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "networking"
  - "concept"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/networking/concepts/KID-ITNET-CONCEPT-0003.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# HTTP/HTTPS Basics (requests, TLS, certs)

# HTTP/HTTPS Basics (requests, TLS, certs)

## Summary

HTTP (HyperText Transfer Protocol) and HTTPS (HTTP Secure) are foundational protocols for communication on the web. HTTP facilitates the exchange of data between clients (e.g., browsers) and servers, while HTTPS secures this communication using encryption, typically via TLS (Transport Layer Security). HTTPS ensures confidentiality, integrity, and authentication through digital certificates issued by trusted Certificate Authorities (CAs).

## When to Use

- **Web Applications**: Use HTTP/HTTPS for client-server communication in web applications, APIs, and microservices.
- **Data Security**: Use HTTPS whenever sensitive data (e.g., login credentials, payment information) is transmitted to protect against eavesdropping and tampering.
- **Compliance**: Use HTTPS to meet security standards like GDPR, PCI-DSS, and HIPAA, which mandate encrypted communication for certain types of data.
- **SEO and Trust**: Use HTTPS to improve website SEO rankings and build user trust, as browsers flag HTTP sites as "Not Secure."

## Do / Don't

### Do:
1. **Use HTTPS by Default**: Always implement HTTPS for websites and APIs, even if the data exchanged seems non-sensitive.
2. **Obtain Certificates from Trusted CAs**: Use certificates issued by well-known Certificate Authorities to ensure browser compatibility and user trust.
3. **Regularly Renew Certificates**: Monitor and renew TLS certificates before expiration to avoid service disruptions.

### Don't:
1. **Don't Use Self-Signed Certificates in Production**: Self-signed certificates lack trust verification and should only be used in internal or testing environments.
2. **Don't Use Outdated Protocols**: Avoid deprecated protocols like SSL or older TLS versions (e.g., TLS 1.0, 1.1). Use TLS 1.2 or higher.
3. **Don't Ignore Mixed Content Warnings**: Ensure all resources (e.g., images, scripts) on an HTTPS page are also served over HTTPS to avoid browser security warnings.

## Core Content

### HTTP Basics
HTTP is a stateless protocol that defines how clients (e.g., browsers) request resources from servers. It uses methods like:
- **GET**: Retrieve data (e.g., a webpage or API response).
- **POST**: Submit data (e.g., form submissions).
- **PUT**: Update resources.
- **DELETE**: Remove resources.

HTTP operates over port 80 by default and transmits data in plaintext, making it vulnerable to interception.

### HTTPS and TLS
HTTPS is HTTP layered over TLS, which provides:
1. **Encryption**: Ensures that data exchanged between client and server is unreadable to third parties.
2. **Integrity**: Detects and prevents data tampering during transmission.
3. **Authentication**: Verifies the server's identity via a digital certificate.

HTTPS operates over port 443 by default. The TLS handshake process involves:
1. The client requesting a secure connection.
2. The server presenting its TLS certificate.
3. The client verifying the certificate's validity.
4. Both parties negotiating encryption keys for secure communication.

### Certificates
Digital certificates are issued by Certificate Authorities (CAs) and include:
- The server's public key.
- The server's domain name.
- The CA's digital signature.

Certificates are validated by the client using the CA's root certificate, which is pre-installed in the operating system or browser. Common types of certificates include:
- **Domain Validation (DV)**: Verifies domain ownership.
- **Organization Validation (OV)**: Verifies domain ownership and organization identity.
- **Extended Validation (EV)**: Provides the highest level of trust with rigorous validation.

### Real-World Example
Consider an e-commerce website:
- Without HTTPS, attackers could intercept login credentials or payment details during transmission.
- With HTTPS, data is encrypted, ensuring that sensitive information remains secure. Browsers display a padlock icon, signaling trust to users.

### Broader Context
HTTP/HTTPS is part of the broader networking domain, interacting with DNS (to resolve domain names), TCP/IP (for data transport), and firewalls (to enforce security policies). HTTPS adoption has become a critical component of modern web security, with initiatives like Let's Encrypt providing free certificates to encourage widespread use.

## Links

- **TLS 1.3 Specification**: Learn about the latest version of TLS and its improvements.
- **Certificate Authority Best Practices**: Understand how CAs issue and manage certificates.
- **Mixed Content Explained**: Learn how to resolve mixed content issues in HTTPS deployments.
- **OWASP HTTPS Guidelines**: Best practices for implementing HTTPS securely.

## Proof / Confidence

This content is based on widely accepted industry standards, including:
- **RFC 7230-7235**: HTTP/1.1 specifications.
- **RFC 8446**: TLS 1.3 specification.
- **OWASP**: HTTPS implementation guidelines.
- **CA/Browser Forum**: Guidelines for certificate issuance and management.

HTTPS adoption is supported by benchmarks like Google's Transparency Report, which shows over 95% of web traffic is encrypted in Chrome as of 2023.
