# RPBS: Test-5bWoOR

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


Source: Project Name "Test-5bWoOR", Description "Test project for delivery workflow" (provided by requester).

This document defines the Product Brief Specification for Test-5bWoOR, a delivery workflow test project. It is focused on core delivery lifecycle functionality: creation, assignment, execution, proof of delivery, and basic tracking/notifications.

## 1. Product Vision
Provide a lightweight, reliable delivery workflow system that enables a Delivery Manager to create and assign deliveries, allows Couriers to execute and update delivery tasks, and lets Recipients receive timely notifications and proof of delivery — all with clear, enforceable rules to ensure delivery integrity and traceability.

## 2. User Personas
1. Delivery Manager
   - Goal: Create and manage delivery tasks, assign to couriers, monitor progress, and resolve failed deliveries.
   - Primary activities: create delivery, assign courier, reassign, view dashboard/list of deliveries, review proofs.

2. Courier (Driver)
   - Goal: Receive assigned deliveries, update status as they progress, collect proof of delivery, and report issues.
   - Primary activities: view assigned deliveries, update status (e.g., In Transit, Delivered, Failed), upload proof (photo or signature), add notes.

3. Recipient (Customer)
   - Goal: Receive shipment and proof, get ETA/notifications, and confirm or report delivery issues.
   - Primary activities: receive notification/ETA, view delivery details, receive proof (photo/signature), optionally confirm receipt.

## 3. User Stories
- As a Delivery Manager, I want to create a delivery task with address, contents, and time window so that a courier can be assigned and the delivery can be tracked.
- As a Delivery Manager, I want to assign a delivery to a courier so that the courier receives the task and can execute it.
- As a Courier, I want to see my assigned deliveries and update their status so that the system and manager know progress.
- As a Courier, I want to upload proof of delivery (photo or signature) so that the delivery can be validated and closed.
- As a Recipient, I want to receive notifications and an ETA so that I can be ready to receive the delivery.
- As a Delivery Manager, I want to view a list and basic dashboard of deliveries filtered by status so that I can prioritize interventions (e.g., failed or delayed deliveries).

## 4. Feature Requirements

### Must Have (P0)
These are non-negotiable for the initial delivery workflow test.

1. Delivery Task Creation
   - Fields required: unique delivery ID, pickup address (if applicable), delivery address, recipient name, recipient phone/email, package description, weight (optional), scheduled delivery window (start/end or ASAP).
   - Validation: address format check (basic), required fields enforced.

2. Assignment
   - Ability for Delivery Manager to assign/unassign a delivery to a Courier.
   - Assignment triggers immediate notification to the courier (push/SMS/email stub — implementation can be a placeholder).

3. Delivery Status Lifecycle
   - Statuses: Pending, Assigned, In Transit, Delivered, Failed.
   - Transitions enforced (e.g., cannot move from Pending -> Delivered without Assigned -> In Transit).
   - Timestamped status changes stored.

4. Proof of Delivery (POD)
   - Courier must attach at least one POD when marking Delivered: photo or signature (image file).
   - System rejects Delivered state change without POD.

5. Basic Notifications
   - Notify Recipient when: delivery scheduled/created, courier assigned (with ETA if available), delivery completed (with POD attached), delivery failed (with reason).
   - Notify Delivery Manager on Failed deliveries.

6. Courier Mobile/List View
   - Couriers see their assigned deliveries (list sorted by scheduled time).
   - Ability to update status and attach POD from the courier interface.

7. Delivery Manager Dashboard / List
   - Filterable list by status, courier, date range.
   - View delivery details and POD.

8. Audit Trail
   - Every action (create, assign, status change, POD upload) recorded with user ID and timestamp.

### Should Have (P1)
1. ETA and Simple Time Estimation
   - Calculate ETA based on scheduled window and a basic travel-time estimation (e.g., static lookup or placeholder algorithm).

2. Reassignment and Escalation
   - Reassign deliveries and automatic escalation if courier does not accept in X minutes (configurable).

3. Retry Attempts & Reason Codes
   - Track retry attempts for failed deliveries and allow specifying a failure reason (from a predefined list).

4. Basic Offline Support for Couriers
   - Courier app can queue status updates/POD uploads when offline and sync when connection restored. At minimum, allow local retries.

5. Multi-stop Batch Assignment
   - Ability to assign multiple deliveries to a courier in one operation.

### Nice to Have (P2)
1. Real-time GPS tracking and route visualization.
2. Route optimization for multi-stop deliveries.
3. OTP (one-time password) verification at delivery for high-value items.
4. Analytics dashboard (delivery times, failure rates, courier performance).
5. Integration hooks (webhooks) for external systems to receive delivery events.
6. Barcode/QR scanning for package confirmation.

## 5. Hard Rules Catalog
These are system-enforced, non-negotiable business rules.

1. Unique Delivery Identifier
   - Each delivery must have a globally unique, immutable delivery_id assigned at creation.

2. Required Fields
   - A delivery cannot be created without recipient name, recipient contact (phone or email), and delivery address.

3. Proof Requirement for Delivered
   - A delivery cannot be transitioned to Delivered without at least one POD artifact (image file or signed acceptance). System must validate file type (e.g., jpg/png/pdf) and non-zero size.

4. Status Transition Rules
   - Allowed transitions:
     - Pending -> Assigned
     - Assigned -> In Transit
     - In Transit -> Delivered
     - In Transit -> Failed
     - Assigned -> Failed (if courier cannot start)
     - Failed -> Assigned (if reattempted)
   - All other transitions must be rejected with explicit error.

5. Assignment Capacity
   - A courier cannot be assigned more active deliveries than their capacity (default capacity = 10). Capacity is configurable per courier.

6. Retry Limits
   - Max retries for a delivery = 3 by default. Further attempts require manual override by Delivery Manager.

7. Data Retention & Privacy
   - POD images and delivery audit data must be retained for at least 90 days (configurable). Access to PODs restricted to Delivery Manager, assigned courier, and recipient.

8. Immutable Audit Records
   - Historical status records and timestamps must be immutable; updates create new audit entries.

9. Notification Requirement
   - Recipient must receive at least one notification (create or assignment) prior to expected delivery time.

10. Failure Reason Standardization
    - Failure reasons must be chosen from a predefined list (e.g., Recipient Absent, Address Not Found, Vehicle Breakdown, Weather). Free text is allowed but must be accompanied by a selected standardized code.

## 6. Acceptance Criteria
Concrete tests to determine feature completion.

P0: Delivery Task Creation
- Given a Delivery Manager with valid credentials, when they create a delivery with required fields, then system returns 201 Created with delivery_id, status = Pending, and the delivery appears in Manager’s list.
- Given missing required fields, when create is attempted, then API returns 400 with field-specific validation errors.

P0: Assignment
- Given a Pending delivery and an available Courier, when Manager assigns courier, then delivery.status becomes Assigned, courier receives notification, and assignment is recorded in the audit trail with timestamp and actor ID.
- Given courier at capacity, assignment attempt fails with 409 CapacityExceeded.

P0: Status Lifecycle
- Given an Assigned delivery, when courier updates to In Transit, then status changes with timestamp.
- Given an In Transit delivery, when courier attempts to mark Delivered without POD, then system rejects with 400 ProofRequired.
- Given POD is attached, when marking Delivered, then status = Delivered, POD is stored, recipient notified, and audit entry created.

P0: Proof of Delivery
- Uploading a POD with invalid file type or zero-byte file results in rejection (400 BadRequest).
- POD retrieval by Manager returns correct file and metadata (uploader, timestamp).

P0: Notifications
- When assignment occurs, courier receives notification (testable via delivery of a mock event).
- When delivery is delivered, recipient receives notification with link/reference to POD.

P0: Audit Trail
- Every create/assign/status-change/POD upload event has an immutable audit entry (actor id, action type, timestamp, optional notes).

P1: ETA and Reassignment
- If ETA component is enabled, assignment sets an ETA field; ETA is non-empty and reasonable (UNKNOWN: algorithm details needed).
- Reassignment updates assigned courier and creates an audit entry and notifications for both couriers.

P1: Offline Sync (basic)
- Courier app can queue three actions offline (status updates + POD uploads) and successfully sync them when online; server reconciles and preserves timestamps.

P2: Real-time GPS (if implemented)
- A Courier device sends a GPS heartbeat every X minutes (configurable); Manager view renders coordinates (basic validation of lat/long range).

## 7. Out of Scope
Explicitly not included in this version:
- Payment processing and billing reconciliation.
- Full-featured route optimization (only a P2 item; not required in P0/P1).
- Third-party carrier integrations (e.g., UPS/FedEx) beyond simple webhooks (P2).
- Warehouse management, inventory control, or packing workflows.
- Internationalization/localization beyond basic UTF-8 support.
- Automated mapping provider integration for turn-by-turn navigation (GPS display may be a placeholder).
- Advanced SLA enforcement dashboards and SLA penalties — only basic status and timestamps are provided.

## 8. Open Questions (UNKNOWN)
1. Delivery Types: Do deliveries include pickups and returns as first-class operations or only deliveries to recipients? UNKNOWN — please confirm if pickups and returns must be modeled.
2. Proof Types: Are electronic signatures required in addition to photos, and is a typed OTP acceptance required for any deliveries? UNKNOWN — specify accepted POD types and verification rules.
3. Mapping Provider: Which mapping/routing provider should be used for ETA and future route optimization (e.g., Google Maps, Mapbox)? UNKNOWN — needed to implement ETA and GPS features realistically.
4. Notification Channels: Which channels are required in MVP (push, SMS, email)? Are third-party providers preselected? UNKNOWN.
5. Data Retention/Compliance: Are there regulatory requirements (GDPR, CCPA) affecting storage location, consent, or deletion timelines beyond the default 90 days? UNKNOWN.
6. Courier Capacity Rules: Should courier capacity be based on number of packages, total weight, or a hybrid? Current default uses count-based capacity = 10; confirm if different metric required. UNKNOWN.
7. Retry Policy: Is the default max retries = 3 acceptable or does business require a different number/behavior? UNKNOWN.
8. Authentication & Identity: Will there be an existing SSO/identity provider or does the system need a built-in user management/auth service? UNKNOWN.
9. Offline Sync Guarantees: What level of conflict resolution rules are required if courier timestamps differ from server authoritative time? UNKNOWN.
10. Acceptance Criteria Thresholds: Are there availability/uptime SLAs expected for this project (e.g., 99.9%)? UNKNOWN.

---

Notes and next steps:
- Clarify the OPEN QUESTIONS to convert UNKNOWN items into explicit requirements before engineering design.
- After sign-off of this RPBS, REBS (Engineering Brief Specification) will define APIs, data models, authentication, and concrete telemetry/observability requirements.