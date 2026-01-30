# RPBS: DeliveryTest-R7AUB-

## Mode Context: New Build

This documentation is generated for a **new project build**.

### Focus Areas
- Design decisions should prioritize simplicity and MVP scope
- Establish clear naming conventions and patterns early
- Document UNKNOWN values explicitly for agent clarification
- Prefer convention over configuration where possible

### UX/UI Considerations
- Define core screens and navigation flow
- Establish design tokens (colors, spacing, typography)
- Prioritize responsive layouts from the start


Source: Project name and description provided by requester — "DeliveryTest-R7AUB-: Testing automatic webhook delivery configuration".

## 1. Product Vision
Provide a small, focused service for configuring and validating automatic webhook delivery so developers and QA teams can reliably test, observe, and iterate webhook integrations without deploying production systems. The product makes it fast to configure endpoints, send test events, verify delivery behaviour (retries, signatures, latency), and inspect delivery logs.

## 2. User Personas
- Integration Developer  
  - Goal: Rapidly configure webhook endpoints and validate payloads and headers so integrations can be implemented and debugged locally or in staging.
- QA / Test Engineer  
  - Goal: Exercise failure and retry scenarios and verify system behaviour under error conditions (timeouts, 5xx responses, invalid signatures).
- Platform / DevOps Engineer (secondary)  
  - Goal: Ensure webhook delivery configuration respects security and operational constraints (rate limits, TLS), and to inspect delivery metrics and audit trails.

## 3. User Stories
- As an Integration Developer, I want to add or edit a webhook endpoint so that my application can receive automatic delivery of events for testing.
- As an Integration Developer, I want to trigger a test delivery (single or batch) so that I can verify payload, signature headers, and endpoint response handling.
- As a QA/Test Engineer, I want to simulate endpoint failures (timeouts, 5xx) so that I can confirm automatic retry/backoff behaviour is correct.
- As a QA/Test Engineer, I want to view delivery logs (request/response, timestamps, headers) so that I can debug delivery failures.
- As a Platform/DevOps Engineer, I want delivery attempts to include an idempotency/delivery id and HMAC signature so that consumers can verify integrity and avoid duplicates.

## 4. Feature Requirements

### Must Have (P0)
- Webhook Endpoint Management
  - Create, update, delete webhook endpoint records (URL, secret, enabled flag).
  - Validation: URL must be HTTPS. Reject non-HTTP/HTTPS schemes.
- Automatic Delivery Toggle
  - Global and per-endpoint enable/disable for automatic deliveries.
- Test Delivery Execution
  - Trigger immediate test delivery of a configurable payload to a selected endpoint.
  - Provide option to run N repeat deliveries for stress/testing.
- Delivery Attempt Engine
  - Send HTTP requests with configurable headers including:
    - X-Delivery-Id (UUID)
    - X-Signature (HMAC-SHA256 of payload using endpoint secret)
    - Content-Type (application/json)
  - Enforce TLS 1.2+ for outbound connections.
- Retry Policy (default)
  - Exponential backoff with jitter: retries at 1s, 2s, 4s, 8s, 16s (max 5 retries) — concrete default that can be tuned later.
  - Stop retrying after a configurable max attempts (default 5).
- Delivery Logging & Status
  - Persist each attempt: timestamp, request headers, request body (or truncated), response status, response body (or truncated), latency.
  - Provide per-delivery status: queued, in-progress, succeeded, failed.
- Minimal UI/API for Test Flows
  - API endpoints to create endpoint, trigger test, fetch delivery attempts and statuses.
  - Simple UI or API response that shows last 10 attempts for an endpoint.
- Security
  - Secrets stored encrypted at rest (KMS or equivalent). (Implementation detail deferred)
  - Access control placeholder: only authenticated users can manage endpoints (AUTH mechanism is UNKNOWN — see Open Questions).
- Input constraints
  - Payload size limit: reject > 256 KB (default concrete limit).

### Should Have (P1)
- Retry customization per endpoint (max attempts, base delay).
- Failure simulation tools:
  - Configure the system to simulate endpoint failures (force 500, delay responses) for QA without changing remote endpoint.
- Delivery dashboards/metrics
  - Aggregate counts: success rate, average latency, failure reasons for the last 24h.
- Dead Letter Queue (DLQ)
  - Mark deliveries that exceeded retry limit for manual re-delivery or inspection.
- Webhook signature algorithm option (HMAC-SHA1, HMAC-SHA256).
- Configurable idempotency header name and format.
- Role-based access control (RBAC) for endpoint operations (roles: owner, viewer).

### Nice to Have (P2)
- Event templating/transformation: allow templated payloads with variables.
- Batch delivery mode (send array of events in one request).
- Replay historical events to an endpoint.
- Webhook sandbox endpoint (hosted echo endpoint that can simulate failures and inspect incoming requests).
- Integration with external monitoring/alerting (e.g., push failure alerts to Slack) — integration adapters.
- Web-based cURL/HTTP samples for accepted payloads and headers.

## 5. Hard Rules Catalog
- All outbound webhook requests must use TLS 1.2 or later. (Non-negotiable)
- Webhook endpoint URLs must be HTTPS. Non-HTTPS endpoints are rejected at configuration time.
- Each delivery attempt must include a unique X-Delivery-Id (UUID v4) header.
- Payload signatures: every outgoing webhook must include X-Signature computed as HMAC-SHA256(payload, secret) by default. If secret is absent, delivery must fail and be logged.
- Maximum payload size for automatic delivery is 256 KB. Attempts exceeding this limit must be rejected before network send.
- Retry policy defaults are enforced: max 5 attempts per delivery unless explicitly overridden.
- Delivery logs retained for a configurable retention period (DEFAULT: 30 days). Note: retention period is UNKNOWN/conf tunable — see Open Questions.
- System must not store plaintext secrets. Secrets must be encrypted at rest using project-approved KMS. (If KMS not available, store encrypted with a project key — UNKNOWN)
- Outbound request timeout must be bounded (DEFAULT: 10 seconds). Response after timeout counts as a failure and triggers retry attempt.
- Rate limiting: per-endpoint outbound rate limit must not exceed 10 requests/sec by default. Excess requests should be queued with backpressure.
- Idempotency guarantee: repeated deliveries with the same X-Delivery-Id must be treated as duplicates by recipients; system should generate unique IDs to avoid accidental duplication.

## 6. Acceptance Criteria
- Endpoint Management
  - Given valid HTTPS URL and secret, the API returns 201 and the endpoint appears in list; invalid URL returns 400 with clear error.
- Automatic Delivery Toggle
  - When automatic delivery is disabled for an endpoint, no scheduled or triggered deliveries are sent until re-enabled.
- Test Delivery Execution
  - Triggering a test delivery returns a delivery record with status queued/in-progress and then succeeded/failed. For a controlled echo endpoint (e.g., https://requestbin.example/echo) the delivery log must show the payload, X-Delivery-Id, and correct X-Signature header.
- Retry Behavior
  - When endpoint returns 500 for first three attempts and 200 for the fourth, system retries according to default backoff and final status is succeeded; logs show attempts with timestamps and response codes.
  - When the endpoint times out (no response within 10s), attempt is marked failure and retried.
- Security / Signing
  - Delivered request verifies with the secret: HMAC-SHA256(payload, secret) == X-Signature from system. Example test vector provided in developer docs.
- Logging & Visibility
  - For every delivery attempt stored, the UI/API returns request headers, truncated body, response status, response body (truncated), and latency. A sample query for "last 10 attempts" returns correct records in <1s for test dataset (scale UNKNOWN).
- Input Validation
  - Payloads larger than 256 KB are rejected with 413 and logged at the API layer.
- Encryption at Rest
  - Secrets are persisted encrypted using configured KMS such that a direct DB dump does not reveal plaintext secrets. (Verification via secret retrieval workflow returns masked secret).
- Failure Simulation (P1)
  - QA can configure a simulated failure mode and system returns the configured failure code/latency when the sandbox endpoint is used.

Each acceptance criterion must be verifiable via automated tests or manual test steps.

## 7. Out of Scope
- Full production-grade event bus integration (e.g., Kafka, SNS) and guaranteed-at-least-once delivery semantics beyond the local retry policy.
- Support for non-HTTP transports (e.g., gRPC, AMQP) in this initial scope.
- Advanced analytics and long-term storage of delivery logs beyond the default retention period (analytics pipelines are P2).
- Multi-tenant isolation beyond simple per-project endpoint scoping (tenant model UNKNOWN).
- Built-in SLA enforcement or paid-tier features (billing, quotas beyond simple rate limiting).
- OAuth-based webhook authentication; only HMAC signing and HTTPS enforced in scope.

## 8. Open Questions (UNKNOWN items flagged for follow-up)
- Authentication & Authorization: What authentication method should be used for the management API/UI? (API keys, OAuth2, SSO, LDAP?) — UNKNOWN
- Retention policy: Is 30 days acceptable for delivery logs and secrets audit trail, or is a longer/shorter retention required? — UNKNOWN
- Key Management: Is there an existing KMS (AWS KMS, GCP KMS, Azure Key Vault) to use for secret encryption, or should a new solution be provisioned? — UNKNOWN
- Scale & Throughput: Expected delivery volume (requests/sec, concurrent endpoints) to size the delivery engine and queues? — UNKNOWN
- Compliance/PII: Are there any regulatory constraints (e.g., GDPR, PCI) that affect payload storage, masking, or redaction? — UNKNOWN
- Role model: Which user roles and permissions are required beyond the minimal "authenticated user"? (owner, admin, viewer?) — UNKNOWN
- Allowed signing algorithms: Are alternate signature algorithms (RSA, Ed25519) required now or later? Default is HMAC-SHA256; please confirm. — UNKNOWN
- Custom retry/backoff policy acceptance: Will per-endpoint customization be allowed in this release, or deferred? (Design currently provides defaults with P1 customization) — UNKNOWN
- Sandbox endpoint hosting: Should the product host an echo/sandbox endpoint or rely on user-provided endpoints for testing? (P1/P2 includes hosted sandbox as optional) — UNKNOWN
- Data residency: Must webhook logs and secrets be stored in a particular region or jurisdiction? — UNKNOWN

Notes for next steps
- Clarify the Open Questions with stakeholders to finalize security, scale, and retention constraints.
- Prepare a minimal API surface early: endpoints for CRUD on webhooks, trigger test delivery, and fetch last N attempts.
- Produce REBS (Engineering Brief) after confirming scale and auth choices.

End of RPBS for DeliveryTest-R7AUB-.