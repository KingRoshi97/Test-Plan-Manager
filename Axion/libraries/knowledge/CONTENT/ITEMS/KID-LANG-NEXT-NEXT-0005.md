---
kid: "KID-LANG-NEXT-NEXT-0005"
title: "Security Checklist (Next)"
content_type: "checklist"
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
  - ","
  - " "
  - "n"
  - "e"
  - "x"
  - "t"
  - "j"
  - "s"
  - "]"
industry_refs: []
stack_family_refs:
  - "nextjs"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "n"
  - "e"
  - "x"
  - "t"
  - "j"
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
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/javascript_typescript/nextjs/frameworks/nextjs/KID-LANG-NEXT-NEXT-0005.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Security Checklist (Next)

# Security Checklist (Next)

## Summary
This checklist outlines actionable security practices for developing Next.js applications using JavaScript and TypeScript. It focuses on securing code, configurations, and runtime environments to mitigate vulnerabilities and protect sensitive data. Following these steps ensures your application aligns with industry standards for modern web development.

## When to Use
Use this checklist when:
- Developing a new Next.js application.
- Conducting a security audit for an existing Next.js project.
- Preparing for deployment or migrating to production.
- Integrating third-party libraries or APIs into your Next.js application.

## Do / Don't

### Do
1. **Do use environment variables for sensitive data**: Store API keys, database credentials, and other secrets in `.env` files and access them using `process.env`.
2. **Do enable HTTPS in production**: Configure your server or hosting provider to enforce HTTPS for secure communication.
3. **Do validate and sanitize user input**: Use libraries like `validator.js` or `DOMPurify` to prevent injection attacks.
4. **Do implement Content Security Policy (CSP)**: Use the `next-helmet` package or server-side headers to prevent malicious scripts from executing.
5. **Do keep dependencies updated**: Regularly check for updates and patches using tools like `npm audit` or `yarn audit`.

### Don't
1. **Don't expose sensitive data in the client-side code**: Avoid hardcoding secrets or credentials in JavaScript/TypeScript files.
2. **Don't disable strict mode in TypeScript**: Always enable strict mode to catch potential type-related vulnerabilities.
3. **Don't trust third-party libraries blindly**: Audit and review libraries for known vulnerabilities before integrating them.
4. **Don't use default configurations for Next.js**: Customize security-related settings like headers, cookies, and API routes.
5. **Don't ignore error handling**: Ensure proper error handling to avoid leaking sensitive stack traces or application details.

## Core Content

### Secure Configuration
1. **Set up environment variables**: Create a `.env` file for sensitive data and configure `next.config.js` to use `process.env` securely. Example:
   ```javascript
   const nextConfig = {
     env: {
       DATABASE_URL: process.env.DATABASE_URL,
     },
   };
   module.exports = nextConfig;
   ```
   **Rationale**: Hardcoding secrets increases the risk of accidental exposure in version control systems.

2. **Use HTTPS**: Configure your hosting provider (e.g., Vercel, AWS) to enforce HTTPS. Redirect HTTP traffic to HTTPS using server-side code or hosting settings.
   **Rationale**: HTTPS encrypts data in transit, protecting against man-in-the-middle attacks.

3. **Enable security headers**: Use middleware or packages like `next-helmet` to add headers such as `Strict-Transport-Security`, `X-Content-Type-Options`, and `X-Frame-Options`. Example:
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```
   **Rationale**: Security headers prevent common attacks like clickjacking and MIME type sniffing.

### Code Practices
4. **Validate and sanitize user input**: Use libraries like `validator.js` to validate email addresses, URLs, etc., and `DOMPurify` to sanitize HTML inputs. Example:
   ```javascript
   const validator = require('validator');
   if (validator.isEmail(userInput)) {
     // Process input
   }
   ```
   **Rationale**: Prevents injection attacks and ensures data integrity.

5. **Avoid exposing server-side code**: Use Next.js API routes (`pages/api`) to handle sensitive server-side logic instead of exposing it in client-side code.
   **Rationale**: Protects sensitive operations like database queries and authentication.

### Dependency Management
6. **Audit dependencies**: Use `npm audit` or `yarn audit` regularly to identify and fix vulnerabilities in third-party packages.
   **Rationale**: Outdated or vulnerable dependencies are a common attack vector.

7. **Use TypeScript for type safety**: Enable strict mode (`strict: true`) in `tsconfig.json` to catch type-related vulnerabilities during development. Example:
   ```json
   {
     "compilerOptions": {
       "strict": true
     }
   }
   ```
   **Rationale**: TypeScript reduces runtime errors and improves code reliability.

### Runtime Security
8. **Implement rate limiting**: Use middleware like `express-rate-limit` or Next.js API route logic to limit requests and prevent brute force attacks. Example:
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // Limit each IP to 100 requests per windowMs
   });
   app.use(limiter);
   ```
   **Rationale**: Prevents abuse of APIs and protects server resources.

9. **Log and monitor security events**: Implement logging for suspicious activity and integrate monitoring tools like Sentry or Datadog.
   **Rationale**: Helps detect and respond to potential security breaches.

## Links
1. **OWASP Top 10**: A comprehensive list of the most critical security risks for web applications.
2. **Next.js Documentation (API Routes)**: Official guide on secure server-side logic using API routes.
3. **Node.js Security Best Practices**: Guidelines for securing Node.js applications, applicable to Next.js projects.
4. **Content Security Policy (CSP)**: Information on configuring CSP to prevent cross-site scripting (XSS) attacks.

## Proof / Confidence
This checklist is based on industry standards such as the OWASP Top 10, Next.js documentation, and best practices for Node.js development. Tools like `npm audit` and `yarn audit` are widely used to identify vulnerabilities, and strict TypeScript configurations are recommended by TypeScript maintainers to ensure type safety.
