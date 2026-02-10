<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:data -->
<!-- AXION:PREFIX:data -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Data — AXION Module Template (Blank State)

**Module slug:** `data`  
**Prefix:** `data`  
**Description:** Data flows, transformations, and validation

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:DATA_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the data module.
"Owns" = data flows, transformations, validation pipelines, data quality rules, lineage tracking, data governance policies.
"Does NOT own" = database schema/migrations (database module), API data shapes (contracts module), storage infrastructure (cloud module).
Common mistake: conflating data module with database module — data owns the flow and quality; database owns the schema and storage engine. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:DATA_SOURCES -->
## Sources & Ingestion
<!-- AGENT: Derive from RPBS §9 Integrations and DDES for entity sources.
Source systems = every system that produces data consumed by this product (internal databases, third-party APIs, user uploads, event streams).
Ingestion method = for each source: batch (scheduled ETL), stream (real-time events/webhooks), CDC (change data capture from database logs).
Common mistake: not specifying data freshness requirements — each source should state how fresh the data must be (real-time, near-real-time, daily). -->
- Source systems list: [TBD]
- Ingestion method (batch/stream/CDC): [TBD]


<!-- AXION:SECTION:DATA_TRANSFORMS -->
## Transforms & Modeling
<!-- AGENT: Derive from DDES entity definitions and BELS business rules for computed fields.
Transformation stages = raw → cleaned → enriched → modeled — describe what happens at each stage.
Canonical metrics/dimensions = the agreed-upon business metrics (e.g., "active user", "revenue") with exact definitions to prevent ambiguity.
Common mistake: defining metrics differently across modules — canonical definitions here are authoritative and must be referenced by all consumers. -->
- Transformation stages: [TBD]
- Canonical metrics/dimensions: [TBD]


<!-- AXION:SECTION:DATA_QUALITY -->
## Data Quality Controls
<!-- AGENT: Derive from BELS validation rules and DDES entity constraints.
Validations = schema validation (type checks), range checks (min/max/enum), referential integrity (foreign key consistency), uniqueness constraints.
Anomaly detection = rules for detecting data drift (sudden volume changes, distribution shifts, null rate spikes).
Common mistake: only validating at ingestion — quality checks should exist at every transformation stage, not just entry. -->
- Validations (schema, ranges, referential): [TBD]
- Anomaly detection rules: [TBD]


<!-- AXION:SECTION:DATA_LINEAGE -->
## Lineage & Metadata
<!-- AGENT: Define how data provenance is tracked through the system.
Lineage tracking = how to trace any output back to its source inputs (column-level lineage, job-level lineage, manual documentation).
Dataset documentation = what metadata each dataset must have (owner, schema version, freshness SLA, description, sample queries).
Common mistake: treating lineage as optional — without lineage, debugging data issues becomes impossible at scale. -->
- Lineage tracking approach: [TBD]
- Dataset documentation expectations: [TBD]


<!-- AXION:SECTION:DATA_ACCESS -->
## Access & Governance
<!-- AGENT: Derive from RPBS §8 Security & Compliance and RPBS §29 Privacy Controls.
Access control = who can read/write which datasets (role-based, attribute-based), approval workflows for sensitive data access.
Sensitive data classification = PII, PHI, financial data — classification tiers with corresponding handling rules (encryption, masking, retention limits).
Common mistake: not classifying data upfront — every dataset should be tagged with its sensitivity level before any access is granted. -->
- Access control model: [TBD]
- Sensitive data classification: [TBD]


<!-- AXION:SECTION:DATA_OBSERVABILITY -->
## Data Observability
<!-- AGENT: Define monitoring for data pipeline health and data quality.
Freshness = how stale can each dataset be before alerting (e.g., "orders table must update within 5 minutes").
Volume = expected row counts or event rates, with alerts on significant deviations.
Quality = pass/fail rates for validation checks, null rates, duplicate rates.
Alerting = who gets paged for each type of data issue, escalation path.
Common mistake: only monitoring pipeline uptime without monitoring data quality — a running pipeline can produce bad data silently. -->
- Freshness/volume/quality metrics: [TBD]
- Alerting and ownership: [TBD]


<!-- AXION:SECTION:DATA_ACCEPTANCE -->
## Acceptance Criteria
- [ ] Sources + outputs enumerated
- [ ] Quality checks defined
- [ ] Governance model stated


<!-- AXION:SECTION:DATA_OPEN_QUESTIONS -->
## Open Questions
<!-- AGENT: Capture unresolved data-related decisions or missing upstream information.
Each question should reference which upstream source is needed (e.g., "Awaiting RPBS §29 for data retention policy").
Common mistake: leaving questions vague — each should be specific and actionable. -->
- [TBD]
