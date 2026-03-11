---
kid: "KID-ITAPI-PATTERN-0001"
title: "Consistent Error Shape Pattern"
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
  - "e"
  - "r"
  - "r"
  - "o"
  - "r"
  - "s"
  - ","
  - " "
  - "c"
  - "o"
  - "n"
  - "s"
  - "i"
  - "s"
  - "t"
  - "e"
  - "n"
  - "c"
  - "y"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/02_software_delivery/apis_integrations/patterns/KID-ITAPI-PATTERN-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Consistent Error Shape Pattern

# Consistent Error Shape Pattern

## Summary
The Consistent Error Shape Pattern is a design approach for structuring error responses in APIs and integrations. It standardizes the format of error messages, making them predictable, easy to parse, and developer-friendly. This pattern improves error handling, debugging, and integration reliability by ensuring that all errors follow a uniform structure.

## When to Use
- When building APIs or integrations that need to communicate errors to clients or consumers.
- In systems where multiple teams or third-party developers consume your API.
- When debugging and troubleshooting errors is a frequent challenge due to inconsistent error formats.
- In environments where automated tools or middleware process error responses (e.g., logging systems, monitoring tools).
- When you want to align with industry best practices for API design and developer experience.

## Do / Don't
### Do
- **Do** define a consistent error schema with fields like `code`, `message`, and `details`.
- **Do** include machine-readable error codes that are unique and descriptive.
- **Do** provide human-readable error messages for developers.
- **Do** document all possible error codes and their meanings in your API documentation.
- **Do** include optional fields for additional context (e.g., `traceId`, `timestamp`, or `path`).

### Don’t
- **Don’t** use HTTP status codes alone to convey detailed error information.
- **Don’t** include sensitive information (e.g., stack traces or internal system details) in error responses.
- **Don’t** design error responses that vary significantly between endpoints or services.
- **Don’t** rely solely on human-readable messages without machine-readable codes.
- **Don’t** assume clients will always interpret errors correctly without documentation.

## Core Content
### Problem
Inconsistent error formats create confusion for API consumers and increase the complexity of error handling. Without a predictable structure, developers must write custom parsers for each API or endpoint, leading to brittle integrations. Debugging becomes harder when error responses lack sufficient context or vary across services.

### Solution
Adopt a consistent error shape for all API responses. This pattern ensures that every error response adheres to a standardized schema, regardless of the endpoint or service. A typical error schema includes the following fields:

- **`code` (string):** A unique, machine-readable identifier for the error (e.g., `INVALID_INPUT`, `AUTH_FAILED`).
- **`message` (string):** A human-readable description of the error.
- **`details` (object or array):** Additional context about the error (e.g., validation errors, missing fields).
- **`traceId` (string, optional):** A unique identifier for the request, useful for debugging.
- **`timestamp` (string, optional):** The time the error occurred, in ISO 8601 format.
- **`path` (string, optional):** The API endpoint or resource that triggered the error.

### Implementation Steps
1. **Define the Error Schema:**
   Create a JSON schema or equivalent specification for your error responses. For example:
   ```json
   {
     "type": "object",
     "properties": {
       "code": { "type": "string" },
       "message": { "type": "string" },
       "details": { "type": "object" },
       "traceId": { "type": "string" },
       "timestamp": { "type": "string", "format": "date-time" },
       "path": { "type": "string" }
     },
     "required": ["code", "message"]
   }
   ```

2. **Implement in Code:**
   Standardize error generation in your codebase. For example, in Node.js:
   ```javascript
   function createErrorResponse(code, message, details = {}, traceId = null) {
       return {
           code,
           message,
           details,
           traceId: traceId || generateTraceId(),
           timestamp: new Date().toISOString(),
           path: getRequestPath()
       };
   }
   ```

3. **Document Error Codes:**
   Maintain a centralized list of error codes and their meanings, either in your API documentation or a shared repository.

4. **Test Consistency:**
   Write integration tests to validate that all endpoints return errors in the specified format.

5. **Monitor and Improve:**
   Use logging and monitoring tools to track error responses and refine the schema as needed.

### Tradeoffs
- **Pros:**
  - Simplifies error handling for API consumers.
  - Improves debugging and monitoring capabilities.
  - Aligns with industry best practices, enhancing developer experience.
- **Cons:**
  - Requires initial effort to define and implement the schema.
  - May increase response payload size slightly.
  - Needs ongoing maintenance to ensure consistency across services.

### Alternatives
- If you only need minimal error information, consider using HTTP status codes with a short message (e.g., 404 Not Found).
- For internal-only APIs, you might use less formal error structures if simplicity is a priority.
- In low-resource environments, reduce payload size by omitting optional fields like `traceId` or `timestamp`.

## Links
- **API Design Best Practices:** Guidelines for designing developer-friendly APIs.
- **HTTP Status Code Standards:** Reference for standard HTTP status codes and their meanings.
- **OpenAPI Specification:** Standard for defining API schemas, including error responses.
- **JSON Schema Documentation:** Guide to defining and validating JSON structures.

## Proof / Confidence
This pattern is widely adopted in industry-standard APIs, including those from Google, Microsoft, and Stripe. The OpenAPI Specification recommends using structured error responses with machine-readable codes. Benchmarks show that consistent error formats reduce integration time and improve developer satisfaction.
