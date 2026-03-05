---
kid: "KID-LANG-REACT-SEC-0001"
title: "XSS + Injection Prevention (UI)"
type: checklist
pillar: LANGUAGES_AND_LIBRARIES
domains: [javascript_typescript, react]
subdomains: []
tags: [react, security, xss, injection]
maturity: "reviewed"
use_policy: pattern_only
executor_access: internal_and_external
license: internal_owned
allowed_excerpt:
  max_words: 0
  max_lines: 0
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: axion
---

# XSS + Injection Prevention (UI)

```markdown
# XSS + Injection Prevention (UI)

## Summary
Cross-Site Scripting (XSS) and injection attacks are critical vulnerabilities that can compromise user data and application integrity. This checklist provides actionable steps to prevent such attacks in JavaScript/TypeScript and React-based applications by enforcing secure coding practices, sanitizing inputs, and leveraging trusted libraries.

## When to Use
- When developing or maintaining web applications using JavaScript/TypeScript and React.
- When handling user input in forms, query parameters, or any untrusted data sources.
- When rendering dynamic content in the DOM.
- When integrating third-party libraries or APIs that process input or output data.

## Do / Don't

### Do
1. **Escape all user-generated content before rendering in the DOM.**
   - Use libraries like `DOMPurify` for sanitization.
2. **Validate and sanitize user input on both client and server sides.**
   - Use a whitelist approach to allow only expected input formats.
3. **Use React's built-in protections against XSS.**
   - Prefer JSX expressions over `dangerouslySetInnerHTML`.

### Don't
1. **Don't use `dangerouslySetInnerHTML` unless absolutely necessary.**
   - This bypasses React's XSS protections and directly inserts untrusted HTML.
2. **Don't trust client-side validation alone.**
   - Attackers can bypass client-side checks by sending requests directly to the server.
3. **Don't concatenate untrusted input directly into query strings or HTML.**
   - This introduces injection vulnerabilities.

## Core Content

### Input Validation and Sanitization
- **Client-side Validation:** Use libraries like `yup` or `zod` to enforce input constraints in forms.
- **Server-side Validation:** Implement strict validation for all incoming data using frameworks like `express-validator` or `Joi`.
- **Sanitization:** For HTML input, sanitize user-generated content using libraries like `DOMPurify` or `sanitize-html`.

### Use React's Built-in Protections
- React escapes all content rendered within JSX expressions by default. For example:
  ```jsx
  const userInput = "<script>alert('XSS')</script>";
  return <div>{userInput}</div>; // React escapes this safely.
  ```
- Avoid using `dangerouslySetInnerHTML`. If absolutely necessary, sanitize the input first:
  ```jsx
  import DOMPurify from 'dompurify';

  const sanitizedHTML = DOMPurify.sanitize(untrustedHTML);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
  ```

### Avoid Direct DOM Manipulation
- Use React's virtual DOM instead of directly manipulating the DOM via `document.querySelector` or `innerHTML`.
- If direct DOM manipulation is unavoidable, sanitize the input before insertion:
  ```javascript
  const sanitizedContent = DOMPurify.sanitize(untrustedContent);
  document.querySelector('#target').innerHTML = sanitizedContent;
  ```

### Prevent Injection in APIs and URLs
- Use parameterized queries when interacting with databases to prevent SQL injection.
- Encode query parameters properly when constructing URLs:
  ```javascript
  const query = encodeURIComponent(userInput);
  fetch(`/api/resource?query=${query}`);
  ```

### CSP (Content Security Policy)
- Implement a strict Content Security Policy to mitigate XSS risks:
  ```http
  Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-<random>';
  ```

### Use Trusted Libraries
- Use well-maintained libraries for input validation and sanitization.
- Regularly update dependencies to patch known vulnerabilities.

## Links
- **OWASP XSS Prevention Cheat Sheet:** Comprehensive guidelines for preventing XSS.
- **React Documentation on Security:** Official React documentation on handling XSS.
- **DOMPurify Documentation:** Usage and examples for DOMPurify.
- **OWASP Content Security Policy Guide:** Best practices for implementing CSP.

## Proof / Confidence
- **OWASP Top 10 (2021):** XSS and injection attacks are consistently listed as top vulnerabilities.
- **React's Escaping Mechanism:** React automatically escapes content rendered in JSX, reducing XSS risks.
- **Industry Best Practices:** Using libraries like DOMPurify and implementing CSP are widely recommended by security experts.
```
