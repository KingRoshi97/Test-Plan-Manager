---
kid: "KID-ITAPI-PATTERN-0003"
title: "Webhook Signature + Replay Protection Pattern"
content_type: "pattern"
primary_domain: "software_delivery"
secondary_domains:
  - "apis_integrations"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "a"
  - "p"
  - "i"
  - ","
  - " "
  - "w"
  - "e"
  - "b"
  - "h"
  - "o"
  - "o"
  - "k"
  - "s"
  - ","
  - " "
  - "s"
  - "e"
  - "c"
  - "u"
  - "r"
  - "i"
  - "t"
  - "y"
  - ","
  - " "
  - "s"
  - "i"
  - "g"
  - "n"
  - "a"
  - "t"
  - "u"
  - "r"
  - "e"
  - "s"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/02_software_delivery/apis_integrations/patterns/KID-ITAPI-PATTERN-0003.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Webhook Signature + Replay Protection Pattern

# Webhook Signature + Replay Protection Pattern

## Summary

The Webhook Signature + Replay Protection Pattern ensures secure and reliable communication between systems by verifying the authenticity of webhook requests and preventing replay attacks. This pattern combines cryptographic signatures with nonce or timestamp-based validation to protect against tampering and unauthorized replays.

## When to Use

- When your application integrates with external systems via webhooks and needs to verify the authenticity of incoming requests.
- When protecting sensitive data or operations triggered by webhooks is critical.
- When you need to prevent replay attacks, where malicious actors reuse intercepted webhook requests.
- When regulatory or compliance requirements mandate secure communication for external integrations.

## Do / Don't

### Do:
1. **Do use HMAC-based signatures**: Use a secure hashing algorithm (e.g., SHA-256) with a shared secret to generate and validate request signatures.
2. **Do include a timestamp or nonce**: Ensure each webhook request has a unique identifier or timestamp to prevent replay attacks.
3. **Do validate the signature server-side**: Always validate the webhook signature on your server before processing the request.
4. **Do enforce a time window**: Reject requests with timestamps that fall outside a predefined time window (e.g., 5 minutes).
5. **Do log verification failures**: Log invalid signatures or replay attempts for security monitoring and debugging.

### Don't:
1. **Don't rely on IP whitelisting alone**: IP-based filtering can be bypassed and does not guarantee authenticity.
2. **Don't expose the shared secret**: Keep your webhook signing secret secure and never expose it in client-side code or logs.
3. **Don't skip replay protection**: Even with valid signatures, replay attacks can cause unintended behavior if not mitigated.
4. **Don't hardcode secrets**: Use environment variables or secure secret management tools to store webhook secrets.
5. **Don't ignore failed verifications**: Treat invalid signatures or replay attempts as potential security incidents.

## Core Content

### Problem
Webhooks are a common mechanism for integrating systems, but they introduce security risks. Without proper verification, attackers can forge requests, tamper with payloads, or replay intercepted requests, leading to unauthorized actions or data exposure.

### Solution
The Webhook Signature + Replay Protection Pattern addresses these risks by combining two key mechanisms:
1. **Signature Verification**: Ensures the request originates from a trusted source and has not been tampered with.
2. **Replay Protection**: Prevents malicious actors from reusing intercepted requests.

### Implementation Steps

#### 1. Generate and Share a Secret Key
- Generate a strong, random secret key for signing webhook requests.
- Share the secret securely with the webhook sender (e.g., via a secure admin portal or encrypted communication).
- Store the secret securely on your server (e.g., in an environment variable or secret management tool).

#### 2. Sign Webhook Requests
- The webhook sender should generate a signature for each request using an HMAC (Hash-based Message Authentication Code) with the shared secret.
- Include the signature in a request header (e.g., `X-Signature`) and optionally include a timestamp (e.g., `X-Timestamp`).

Example (Python):
```python
import hmac
import hashlib
import base64

def generate_signature(secret, payload, timestamp):
    message = f"{timestamp}.{payload}".encode('utf-8')
    signature = hmac.new(secret.encode('utf-8'), message, hashlib.sha256).hexdigest()
    return signature
```

#### 3. Validate the Signature
- Extract the signature and timestamp from the request headers.
- Recompute the expected signature using the shared secret, request payload, and timestamp.
- Compare the computed signature with the received signature in a time-safe manner to prevent timing attacks.

Example (Python):
```python
def validate_signature(secret, payload, timestamp, received_signature):
    expected_signature = generate_signature(secret, payload, timestamp)
    return hmac.compare_digest(expected_signature, received_signature)
```

#### 4. Enforce Replay Protection
- Check the timestamp against the current time to ensure it falls within a predefined window (e.g., ±5 minutes).
- Optionally, maintain a cache of processed nonces or timestamps to reject duplicates.

Example (Python):
```python
import time

def is_replay(timestamp, allowed_window=300):
    current_time = int(time.time())
    return abs(current_time - int(timestamp)) > allowed_window
```

#### 5. Respond to Invalid Requests
- Reject requests with invalid signatures, timestamps outside the allowed window, or duplicate nonces.
- Return a 403 Forbidden response for failed validations.

### Tradeoffs
- **Complexity**: Implementing signature verification and replay protection adds complexity to your system.
- **Performance**: Verifying signatures and checking timestamps may introduce slight latency, especially under high traffic.
- **Secret Management**: Securely managing and rotating secrets requires additional infrastructure or processes.

### Alternatives
- **OAuth 2.0**: Use OAuth tokens for authentication if both systems support it.
- **Mutual TLS (mTLS)**: Use client certificates to establish trust between systems.
- **IP Whitelisting**: Use IP filtering as an additional layer of security, but not as a standalone solution.

## Links
- HMAC (Hash-based Message Authentication Code) Overview: Learn about HMAC and its use in secure communications.
- OWASP Web Security Testing Guide: Best practices for securing webhooks and APIs.
- Secure Secret Management: Techniques for managing secrets in software systems.
- Replay Attack Mitigation: Strategies for preventing replay attacks in distributed systems.

## Proof / Confidence
This pattern aligns with industry best practices for securing webhooks, as recommended by OWASP and major API providers like Stripe, GitHub, and Twilio. HMAC-based signatures and replay protection are widely adopted mechanisms for mitigating risks associated with webhook integrations.
