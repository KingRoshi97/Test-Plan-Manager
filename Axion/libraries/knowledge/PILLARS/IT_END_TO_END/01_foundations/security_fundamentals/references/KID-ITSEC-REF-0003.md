---
kid: "KID-ITSEC-REF-0003"
title: "Password Storage Reference (hashing requirements, anti-patterns)"
type: "reference"
pillar: "IT_END_TO_END"
domains:
  - "security_fundamentals"
subdomains: []
tags:
  - "security_fundamentals"
  - "reference"
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

# Password Storage Reference (hashing requirements, anti-patterns)

# Password Storage Reference (Hashing Requirements, Anti-Patterns)

## Summary

Proper password storage is critical for securing user accounts and preventing unauthorized access. This document outlines best practices for securely storing passwords, including hashing requirements, common anti-patterns, and configuration recommendations. It serves as a reference for software engineers implementing secure authentication systems.

---

## When to Use

- When designing or implementing user authentication systems.
- When reviewing or auditing password storage mechanisms in existing applications.
- When migrating from insecure password storage methods to secure ones.
- When ensuring compliance with security standards like OWASP, NIST, or GDPR.

---

## Do / Don't

### Do:
1. **Use a strong, cryptographic hashing algorithm** (e.g., Argon2, bcrypt, PBKDF2).
2. **Implement per-password unique salts** to mitigate rainbow table attacks.
3. **Set appropriate work factors** (e.g., cost or iteration count) to balance security and performance.
4. **Regularly update hashing algorithms** to align with industry standards.
5. **Enforce strong password policies** (e.g., minimum length, complexity).

### Don't:
1. **Don’t store passwords in plaintext** under any circumstances.
2. **Don’t use outdated hashing algorithms** (e.g., MD5, SHA-1, unsalted SHA-256).
3. **Don’t hard-code salts or use global/static salts** shared across all passwords.
4. **Don’t rely solely on encryption** without hashing; encryption keys can be compromised.
5. **Don’t skip rehashing passwords** when upgrading to stronger algorithms.

---

## Core Content

### Key Definitions
- **Hashing**: A one-way cryptographic function that converts input data (e.g., a password) into a fixed-length output (hash). It cannot be reversed to obtain the original input.
- **Salt**: A random, unique value added to each password before hashing to prevent precomputed attacks (e.g., rainbow tables).
- **Work Factor**: A configurable parameter (e.g., iterations, memory usage) that increases the computational cost of hashing, making brute-force attacks more difficult.

### Recommended Hashing Algorithms
| Algorithm | Strengths | Configuration Notes |
|-----------|-----------|----------------------|
| **Argon2** (preferred) | Memory-hard, resistant to GPU attacks | Configure memory, iterations, and parallelism. Use Argon2id for balanced resistance to side-channel attacks. |
| **bcrypt** | Widely supported, adaptive cost factor | Set cost factor (default: 10). Avoid truncating passwords longer than 72 bytes. |
| **PBKDF2** | NIST-approved, widely compatible | Use HMAC-SHA-256 or HMAC-SHA-512. Set iteration count (e.g., 100,000+). |

### Anti-Patterns
- **Plaintext Storage**: Storing raw passwords in databases or logs.
- **Static Salts**: Using a single, hardcoded salt for all passwords.
- **Fast Hashes**: Using algorithms like MD5 or SHA-1, which are optimized for speed and vulnerable to brute-force attacks.
- **Improper Key Derivation**: Using general-purpose hash functions (e.g., SHA-256) without a key derivation function like PBKDF2.

### Configuration Options
1. **Salting**: Generate a unique, random salt (e.g., 16 bytes) for each password. Store the salt alongside the hash in the database.
2. **Work Factor**: Adjust cost parameters based on your system's performance capabilities. Test to find the highest acceptable cost that maintains usability.
3. **Rehashing**: Periodically rehash passwords with updated algorithms or parameters when users log in.

### Example Workflow for Password Storage
1. **User Registration**:
   - Generate a unique salt.
   - Hash the password using the chosen algorithm and parameters.
   - Store the hash and salt in the database.
2. **User Login**:
   - Retrieve the stored hash and salt.
   - Hash the provided password with the same salt and parameters.
   - Compare the resulting hash with the stored hash using a constant-time comparison function.
3. **Algorithm Upgrade**:
   - On user login, check if the stored hash uses an outdated algorithm or parameters.
   - Rehash the password with the updated configuration and store the new hash.

---

## Links

- **OWASP Password Storage Cheat Sheet**: Comprehensive guidelines for secure password storage.
- **NIST SP 800-63B**: Digital identity guidelines, including password storage recommendations.
- **Argon2 Specification**: Details on the Argon2 hashing algorithm and its configuration.
- **Common Weakness Enumeration (CWE-916)**: Security risks of improper password storage.

---

## Proof / Confidence

This guidance aligns with industry standards, including OWASP, NIST SP 800-63B, and ISO/IEC 27001. Algorithms like Argon2, bcrypt, and PBKDF2 are widely endorsed by security experts for their resistance to brute-force and side-channel attacks. The recommendations here are derived from proven cryptographic principles and real-world implementations in secure systems.
