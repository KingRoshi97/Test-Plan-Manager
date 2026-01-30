# RPBS: WebhookDelivery-8GU2Nc

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


Source: project description "Testing automatic webhook delivery"

## 1. Product Vision
Provide a lightweight, testable, and observable service for automatically delivering webhooks to customer-specified HTTP endpoints so integrators and engineers can validate event delivery, observe failures, and iterate quickly.

## 2. User Personas
- Developer / Integrator  
  - Goal: Verify that their application receives events from the system reliably and inspect delivered payloads and delivery metadata.  
  - Success metric: Can register an endpoint, receive test events, and confirm correct payload/signature within minutes.

- QA Engineer / Tester  
  - Goal: Validate retry and failure behavior of webhook delivery under various endpoint conditions (timeouts, non-2xx responses).  
  - Success metric: Can simulate endpoint failures and see expected retry attempts and final result (delivered or dead-lettered).

- System Administrator / Operator  
  - Goal: Monitor delivery health, view error rates, and manage global delivery limits.  
  - Success metric: Can view delivery metrics and intervene (pause/resume, disable endpoint) when problems occur.

## 3. User Stories
- As a Developer, I want to register an HTTP endpoint for webhook delivery so that I can receive automatic events from the system.
- As a Developer, I want to trigger a test delivery to my registered endpoint so that I can verify my receiver handles the payload and signature correctly.
- As a QA Engineer, I want the system to automatically retry failed deliveries so that transient receiver errors are handled without manual intervention.
- As a QA Engineer, I want to see a history of delivery attempts (status codes, timestamps, response body snippets) so that I can debug failures.
- As a System Administrator, I want to temporarily disable a webhook endpoint so that I can stop deliveries to a misbehaving consumer.
- As a Developer, I want the delivered webhook to include a verification signature so that I can confirm the payload integrity.

## 4. Feature Requirements

### Must Have (P0)
- Endpoint registration API
  - Accept: endpoint URL, optional description, optional headers to include on delivery (e.g., Authorization).  
  - Example request: POST /endpoints { "url": "https://example.com/webhook", "description": "Order events" }
- Automatic delivery engine
  - On configured events (testing context: manual trigger available), send HTTP POST with JSON payload to registered endpoint.
- Test delivery trigger
  - API to initiate a single test delivery (immediately).
  - Example: POST /endpoints/{id}/deliveries/test
- Delivery retry policy
  - At-least-once semantics with retries on network failures and non-2xx responses.
  - Recommended default: 5 attempts with exponential backoff (see Acceptance Criteria). (Default values selectable by admin.)
- Delivery observability
  - Record delivery attempts with timestamp, HTTP status code, latency, response body snippet (first 1 KB), and attempt number.
  - Provide API to list recent deliveries for an endpoint.
- Security: payload signature
  - Include an HMAC signature header (e.g., X-Signature) computed with a per-endpoint secret.
- Minimal rate limiting / protection
  - Per-endpoint rate limit (configurable defaults) to avoid rapid-fire retries causing receiver overload.
- Error handling / dead-lettering
  - After max retry attempts, mark delivery as failed and surface in UI/API as dead-letter with full metadata.

### Should Have (P1)
- Configurable retry/backoff policy per endpoint (max attempts, base delay, jitter).
- Support for additional authentication methods on delivery (Bearer token in Authorization header, Basic).
- Delivery filtering/test payload selection: ability to select which sample event payload to send for testing (e.g., order.created vs. order.updated).
- Pause/resume endpoint deliveries via API.
- Webhook signing algorithm selection (HMAC-SHA256 default + option for HMAC-SHA1).
- TTL / retention policy for delivery logs (configurable, e.g., 30 days default).

### Nice to Have (P2)
- Web UI for endpoint management, test deliveries, and delivery history visualization.
- Replay capability: re-queue a dead-lettered delivery for another attempt.
- Delivery metrics (success rate, avg latency) with simple dashboards or Prometheus metrics export.
- Support for binary payloads or custom content-types beyond application/json.
- Delivery sandbox mode that sends to a proxy which captures deliveries for local debugging.

## 5. Hard Rules Catalog
- H1: Every outbound webhook request MUST include a signature header computed as HMAC(secret, body) using the configured algorithm. Missing signature constitutes a delivery configuration error.
- H2: Retries MUST be attempted for network timeouts and any HTTP response not in the 200–299 range, up to the configured max attempts.
- H3: After max retry attempts are exhausted, the delivery MUST be marked as dead-letter and not retried further automatically.
- H4: The system MUST not send more than the configured per-endpoint rate limit (requests/second) to a single endpoint.
- H5: Delivery logs MUST persist: at minimum attempt timestamp, status code, latency, attempt number, and the used signature metadata. Response bodies stored only up to the configured snippet size.
- H6: Endpoint secrets MUST be stored encrypted at rest.
- H7: Manual test deliveries MUST respect the same signing, headers, and retry behavior as automatic deliveries.
- H8: The service MUST respond to API callers with deterministic, documented error codes (see Reason Codes in REBS) for all endpoint management and delivery actions.

## 6. Acceptance Criteria
- Endpoint registration
  - Given a valid URL, when I call POST /endpoints, then the API responds 201 with endpoint id and stored configuration; the endpoint appears in GET /endpoints.
- Test delivery trigger
  - Given a registered endpoint, when I call POST /endpoints/{id}/deliveries/test, then the system queues and attempts delivery and returns 202 with delivery id.
  - The receiving endpoint must observe one immediate POST with the configured payload and X-Signature header.
- Delivery retry behavior
  - Given a test endpoint that returns 500 for the first two attempts and 200 on the third, the system must make attempts until a 200 is received and then mark the delivery as succeeded with attempt count = 3.
  - Given an endpoint that times out consistently, after configured max attempts (default 5) the delivery must be marked dead-lettered and no further retries occur.
- Observability
  - Given a completed delivery, when I call GET /deliveries/{deliveryId}, I receive attempt history entries with timestamps, status codes, latencies, and response snippets.
- Security / signature
  - The X-Signature header must validate against the registered endpoint secret using the configured algorithm. Example validation: HMAC-SHA256(secret, <raw body>) produces header value "sha256=..." which matches receiver's computed value.
- Rate limiting
  - The system must throttle delivery attempts so that a single endpoint does not receive more requests per second than its configured limit; exceeding callers receive a documented error and retries are scheduled/stalled.
- Data protection
  - Endpoint secret cannot be retrieved in plain text via any API; APIs only return metadata and masked secrets.

## 7. Out of Scope
- Persistent guaranteed-ordered delivery across multiple events (ordering guarantees).
- Complex delivery routing, transformation pipelines, or message schema validation beyond basic JSON payloads.
- Built-in UI/dashboard (P2 note: nice-to-have only).
- Multi-protocol delivery (e.g., AMQP, gRPC) — HTTP(S) only in this version.
- Long-term analytics and retention beyond configurable logs TTL (no advanced BI).
- Automatic backfilling or replay of historical events outside explicit replay API (P2).

## 8. Open Questions (UNKNOWN)
- Supported authentication methods for endpoint registration beyond HMAC signature (e.g., should the system support storing bearer tokens to inject as Authorization headers?) — UNKNOWN
- Exact default retry/backoff parameters (max attempts, base delay, jitter strategy). Recommended defaults provided above but need confirmation of values and SLA — UNKNOWN
- What event types or sample payload shapes should be shipped for testing (e.g., order.created JSON schema)? — UNKNOWN
- Retention policy default for delivery logs and whether full response bodies may be stored by default — UNKNOWN
- Operational SLAs for delivery latency and delivery attempt windows (acceptable time to consider as failure) — UNKNOWN
- Rate limit default per-endpoint and system-wide quotas for tenants — UNKNOWN

Notes for follow-up:
- Confirm defaults and security policy with stakeholders (answers to the Open Questions).
- Decide whether to expose secrets to UI or only provide rotate endpoints.
- If multi-tenant isolation required, include tenant scoping and rate limiting in REBS.