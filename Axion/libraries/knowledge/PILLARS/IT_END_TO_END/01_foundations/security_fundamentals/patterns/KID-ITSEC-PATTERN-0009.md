---
kid: "KID-ITSEC-PATTERN-0009"
title: "Webhook Verification Pattern (signatures, replay protection)"
type: "pattern"
pillar: "IT_END_TO_END"
domains:
  - "security_fundamentals"
subdomains: []
tags:
  - "security_fundamentals"
  - "pattern"
maturity: "reviewed"
use_policy: "pattern_only"
executor_access: "internal_and_external"
license: "internal_owned"
allowed_excerpt:
  max_words: 0
  max_lines: 0
supersedes: ""
deprecated_by: ""
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Webhook Verification Pattern (signatures, replay protection)

# Webhook Verification Pattern (Signatures, Replay Protection)

## Summary

Webhook verification ensures secure communication between systems by validating the authenticity of incoming webhook requests and protecting against replay attacks. This pattern leverages cryptographic signatures and timestamps to verify the integrity and origin of webhook payloads while mitigating risks such as unauthorized access and replayed requests.

---

## When to Use

- When integrating third-party APIs or services that send webhook requests to your application.
- When sensitive or high-value data is exchanged via webhooks (e.g., payment notifications, user authentication events).
- When you need to ensure that webhook requests are not tampered with or replayed by malicious actors.
- When compliance with security standards (e.g., PCI DSS, GDPR) requires robust request validation mechanisms.

---

## Do / Don't

### Do:
1. **Use HMAC signatures**: Generate and validate cryptographic signatures using a shared secret key to ensure request integrity.
2. **Implement replay protection**: Include a timestamp or unique nonce in webhook requests and reject requests outside a defined time window.
3. **Enforce HTTPS**: Always require HTTPS for webhook endpoints to prevent interception of sensitive data during transmission.
4. **Log verification failures**: Maintain detailed logs for failed webhook verifications to aid debugging and incident response.
5. **Rotate shared secrets periodically**: Regularly update shared secrets to minimize risks from compromised keys.

### Don't:
1. **Trust unauthenticated requests**: Never process webhook requests without verifying their authenticity.
2. **Ignore timestamps or nonces**: Avoid accepting requests without replay protection measures, as this exposes your system to replay attacks.
3. **Store shared secrets in plaintext**: Always encrypt secrets and environment variables to prevent unauthorized access.
4. **Skip signature validation for testing**: Ensure signature validation is enforced even in development and staging environments.
5. **Rely solely on IP whitelisting**: IP-based filtering is insufficient for securing webhooks and can lead to false positives or negatives.

---

## Core Content

### Problem
Webhook-based integrations are vulnerable to security risks such as unauthorized requests, data tampering, and replay attacks. Without verification mechanisms, attackers can impersonate legitimate services, modify payloads, or reuse captured requests to exploit your application.

### Solution Approach

The webhook verification pattern addresses these risks by combining cryptographic signatures and replay protection mechanisms. This ensures the authenticity, integrity, and freshness of incoming webhook requests.

### Implementation Steps

#### 1. **Generate and Share a Secret Key**
- Generate a secure random secret key (e.g., using a cryptographic library).
- Share this key securely with the webhook provider. Avoid exposing it in public repositories or logs.

#### 2. **Sign Requests**
- The webhook provider signs each request using the shared secret key and a cryptographic algorithm (e.g., HMAC-SHA256). The signature is typically included in the request headers (e.g., `X-Signature`).

#### 3. **Validate Signatures**
- Extract the signature from the request headers.
- Recompute the signature using the payload and shared secret key.
- Compare the computed signature with the provided signature. Reject the request if they don't match.

#### 4. **Implement Replay Protection**
- Include a timestamp or unique nonce in the webhook payload or headers (e.g., `X-Timestamp`).
- Validate the timestamp against the current time. Reject requests outside a defined time window (e.g., 5 minutes).
- For nonces, maintain a cache of previously seen values and reject duplicate requests.

#### 5. **Secure the Communication Channel**
- Use HTTPS for all webhook endpoints to encrypt data in transit.
- Validate SSL/TLS certificates to prevent man-in-the-middle attacks.

#### 6. **Monitor and Rotate Secrets**
- Log failed verification attempts for debugging and security monitoring.
- Periodically rotate shared secrets to minimize exposure risks.

### Code Example (Python)
```python
import hmac
import hashlib
import time

SECRET_KEY = b'supersecretkey'
TIME_WINDOW = 300  # 5 minutes

def verify_webhook(request):
    # Extract signature and timestamp from headers
    signature = request.headers.get('X-Signature')
    timestamp = int(request.headers.get('X-Timestamp', 0))
    payload = request.data

    # Check timestamp for replay protection
    current_time = int(time.time())
    if abs(current_time - timestamp) > TIME_WINDOW:
        return False, "Replay protection failed"

    # Validate signature
    computed_signature = hmac.new(SECRET_KEY, payload, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(computed_signature, signature):
        return False, "Signature validation failed"

    return True, "Webhook verified"
```

---

## Links

- **OWASP Secure Coding Practices**: Comprehensive guidelines for secure software development, including webhook security.
- **HMAC Authentication Standard**: Explains the use of HMAC for message authentication in web applications.
- **RFC 7231 (HTTP Semantics)**: Defines HTTP headers and methods relevant to webhook implementations.
- **Replay Attack Mitigation Techniques**: Best practices for preventing replay attacks in web applications.

---

## Proof / Confidence

- **Industry Standards**: HMAC is widely used in security protocols (e.g., OAuth, AWS Signature Version 4) for request authentication.
- **Adoption by Major Platforms**: Webhook verification using signatures and timestamps is implemented by Stripe, GitHub, and Slack.
- **OWASP Recommendations**: The OWASP API Security Top 10 emphasizes the importance of request validation and replay protection.
