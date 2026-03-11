---
kid: "KID-LANG-TS-SEC-0003"
title: "Input Validation + Serialization Footguns"
content_type: "reference"
primary_domain: "["
secondary_domains:
  - "j"
  - "a"
  - "v"
  - "a"
  - "s"
  - "c"
  - "r"
  - "i"
  - "p"
  - "t"
  - "_"
  - "t"
  - "y"
  - "p"
  - "e"
  - "s"
  - "c"
  - "r"
  - "i"
  - "p"
  - "t"
  - "]"
industry_refs: []
stack_family_refs:
  - "security"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
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
  - "v"
  - "a"
  - "l"
  - "i"
  - "d"
  - "a"
  - "t"
  - "i"
  - "o"
  - "n"
  - ","
  - " "
  - "s"
  - "e"
  - "r"
  - "i"
  - "a"
  - "l"
  - "i"
  - "z"
  - "a"
  - "t"
  - "i"
  - "o"
  - "n"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/javascript_typescript/security/KID-LANG-TS-SEC-0003.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Input Validation + Serialization Footguns

# Input Validation + Serialization Footguns

## Summary

Improper input validation and serialization in JavaScript/TypeScript can lead to severe security vulnerabilities, such as injection attacks, data corruption, and application crashes. Developers often overlook edge cases or trust unvalidated input, resulting in exploitable code. Understanding common pitfalls and implementing robust validation and serialization practices can mitigate these risks.

---

## When to Use

- When accepting user input in web forms, APIs, or query parameters.
- When serializing or deserializing data for storage, transmission, or inter-process communication.
- When working with untrusted data sources, such as third-party APIs or client-side input.
- When handling structured data formats like JSON, XML, or custom serialization schemes.

---

## Do / Don't

### Do:
1. **Validate all input at the boundary**: Ensure all incoming data is validated as soon as it enters your system.
2. **Use libraries for serialization**: Leverage well-maintained libraries like `class-transformer` or `zod` for structured serialization and validation.
3. **Define explicit schemas**: Use tools like TypeScript type definitions or JSON schemas to enforce strict data contracts.

### Don't:
1. **Don't trust client-side validation alone**: Always validate data on the server-side, as client-side validation can be bypassed.
2. **Don't assume input is safe**: Treat all input as untrusted, even from internal sources or authenticated users.
3. **Don't serialize data without sanitization**: Ensure data is sanitized before serialization to prevent injection attacks.

---

## Core Content

### The Mistake
A common pitfall in JavaScript/TypeScript development is failing to validate and sanitize input before processing or serializing it. Developers often assume that input from trusted sources (e.g., authenticated users or internal APIs) is safe. Additionally, when serializing or deserializing data, developers may overlook edge cases, such as unexpected data types or malicious payloads.

For example, consider a scenario where a developer accepts JSON input from a client, deserializes it, and directly uses the resulting object in database queries or rendering logic. Without proper validation, this opens the door to injection attacks, type mismatches, or runtime errors.

### Why People Make It
1. **Overconfidence in trusted sources**: Developers may assume that authenticated users or internal APIs will always provide valid data.
2. **Time pressure**: In fast-paced environments, developers may skip validation to meet deadlines.
3. **Lack of awareness**: Many developers are unaware of the risks associated with improper input validation and serialization.

### Consequences
1. **Security vulnerabilities**: Injection attacks (e.g., SQL injection, NoSQL injection, XSS) can compromise sensitive data and system integrity.
2. **Data corruption**: Invalid or malicious input can corrupt application state or stored data.
3. **Application crashes**: Unexpected input types or structures can cause runtime errors, leading to downtime.

### How to Detect It
1. **Code reviews**: Look for areas where input is processed without validation or sanitization.
2. **Static analysis tools**: Use tools like ESLint with security-focused plugins to identify unsafe patterns.
3. **Penetration testing**: Simulate malicious input to uncover vulnerabilities.

### How to Fix or Avoid It
1. **Validate Input**: Use libraries like `zod`, `yup`, or `class-validator` to enforce strict validation rules. For example:
   ```typescript
   import { z } from "zod";

   const UserSchema = z.object({
     id: z.number(),
     name: z.string().min(1),
     email: z.string().email(),
   });

   const userInput = UserSchema.parse(input); // Throws if validation fails
   ```
2. **Sanitize Data**: Use libraries like `DOMPurify` for sanitizing HTML input or escape special characters to prevent injection attacks.
3. **Use TypeScript**: Leverage TypeScript’s type system to define and enforce data structures at compile time.
4. **Adopt Secure Serialization**: Use libraries like `class-transformer` to safely serialize and deserialize objects:
   ```typescript
   import { plainToInstance } from "class-transformer";
   import { validate } from "class-validator";

   class User {
     @IsInt()
     id: number;

     @IsString()
     name: string;

     @IsEmail()
     email: string;
   }

   const user = plainToInstance(User, input);
   const errors = await validate(user);
   if (errors.length > 0) {
     throw new Error("Validation failed");
   }
   ```

5. **Reject Invalid Input Early**: Use middleware in frameworks like Express.js to validate input at the route level.

---

## Links

- **OWASP Input Validation Cheat Sheet**: Comprehensive guidelines for secure input validation.
- **JSON Schema**: A standard for defining and validating JSON data structures.
- **TypeScript Handbook: Type Guards**: Best practices for enforcing type safety in TypeScript.
- **Node.js Security Best Practices**: Official recommendations for secure Node.js development.

---

## Proof / Confidence

This content is based on industry standards and best practices, including OWASP guidelines and secure coding principles. Tools like `zod`, `yup`, and `class-validator` are widely adopted in the JavaScript/TypeScript ecosystem for input validation and serialization. Real-world incidents, such as injection attacks and data breaches, highlight the critical importance of these practices.
