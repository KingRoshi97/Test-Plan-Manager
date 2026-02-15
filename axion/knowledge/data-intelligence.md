# Data & Intelligence Best Practices

## Data Engineering

### Data Pipeline Design
- Design pipelines as DAGs (directed acyclic graphs): clear dependencies, no cycles
- Idempotent pipelines: re-running produces the same result (safe to retry)
- Incremental processing: process only new/changed data (not full reprocessing)
- Schema-on-read vs schema-on-write: choose based on data maturity and use case

### Ingestion Patterns
- **Batch ingestion**: scheduled ETL/ELT jobs (hourly, daily) for analytics workloads
- **Streaming ingestion**: real-time event processing (Kafka, Kinesis) for low-latency needs
- **Change Data Capture (CDC)**: capture database changes as events (Debezium, AWS DMS)
- **API polling**: periodic fetch from external APIs (with rate limit respect)
- **Webhook ingestion**: receive push events from external services

### ETL vs ELT
- **ETL**: transform before loading (traditional, when target is schema-strict)
- **ELT**: load raw, transform in warehouse (modern, leverages warehouse compute)
- Prefer ELT for data warehouses (BigQuery, Snowflake, Redshift)
- Use ETL when data must be cleaned/redacted before storage (PII compliance)

### Data Modeling Layers
| Layer | Purpose | Example |
|-------|---------|---------|
| Raw/Bronze | Exact copy of source data | raw_orders, raw_users |
| Cleaned/Silver | Deduplicated, typed, validated | cleaned_orders |
| Curated/Gold | Business-logic-applied, aggregated | daily_revenue, user_segments |
- Never modify raw data (immutable source of truth)
- Document transformations between layers
- Version schema changes with migrations

### Data Quality
- Validation checks: not-null, unique, referential integrity, value ranges
- Anomaly detection: unexpected spikes/drops in row counts, values, or distributions
- Data freshness monitoring: alert if data is stale beyond expected SLA
- Schema evolution: handle new fields, changed types, removed fields gracefully
- Data contracts: explicit agreements on schema and quality between producer and consumer

### Orchestration
- Workflow orchestrators: Airflow, Dagster, Prefect, Temporal
- Scheduling: cron-based for batch, event-triggered for streaming
- Retry and failure handling: per-task retry with backoff, alerting on failure
- Dependency management: run tasks in correct order, skip completed tasks on re-run
- Monitoring: task duration, success/failure rates, data lineage

### Data Lineage and Metadata
- Track: where data comes from, how it's transformed, where it's consumed
- Metadata catalog: searchable index of all datasets (column descriptions, owners, freshness)
- Impact analysis: understand downstream effects of schema changes
- Data discovery: enable analysts to find and understand available data

### Data Storage Optimization
- Partitioning: partition by date, region, or high-cardinality column for query performance
- Compression: columnar compression (Parquet, ORC) for analytics, row compression for OLTP
- Indexing: appropriate indexes for query patterns
- Data lifecycle: auto-archive old data to cheaper storage tiers
- Cost optimization: monitor compute and storage costs per pipeline

## Analytics Engineering

### Metrics Layer
- Single source of truth for business metrics (avoid conflicting definitions)
- Define metrics in code (dbt metrics, Cube, custom metric layer)
- Document: metric name, definition, calculation logic, owner, data source
- Version metrics: track changes to definitions over time

### Semantic Models
- Fact tables: immutable events (orders, page views, transactions)
- Dimension tables: descriptive attributes (users, products, locations)
- Slowly changing dimensions: track historical changes (Type 2 SCD)
- Conformed dimensions: shared across fact tables for consistent analysis

### Transformation Tooling (dbt-style)
- SQL-based transformations with dependency management
- Modular models: one SQL file per model, reusable macros
- Testing: schema tests (not-null, unique, relationships), custom data tests
- Documentation: auto-generated from model descriptions and column comments
- Version control: models in git, CI for testing, scheduled runs for production

### Data Marts
- Domain-specific curated datasets (product analytics, finance, operations)
- Pre-aggregated for common query patterns
- Access-controlled per team/role
- Refreshed on schedule matching business needs

### Dashboard Standards
- Consistent layout and styling across dashboards
- Filters: date range, dimension filters, clear filter state
- Drill-down: summary → detail navigation
- Performance: sub-3-second load times for interactive dashboards
- Mobile-friendly: key dashboards accessible on mobile devices

### Experiment Analysis
- A/B test metrics: primary metric, guardrail metrics, sample size calculation
- Statistical rigor: confidence intervals, significance thresholds, multiple comparison correction
- Segment analysis: break results by user segments for insights
- Reporting: automated experiment summary with decision recommendation

### Data Documentation
- Metric definitions: unambiguous, with example calculations
- Dataset catalog: searchable, with column descriptions, freshness, owner
- Pipeline documentation: architecture diagram, SLA, escalation contact
- Onboarding guides: how to access and query data

## Machine Learning Engineering

### Model Serving Infrastructure
- **Online inference**: REST/gRPC API serving model predictions (low latency, < 100ms)
- **Batch inference**: scheduled prediction pipelines (process all items, store results)
- **Edge inference**: model running on device/edge (mobile, IoT)
- Model versioning: track model version in predictions, support A/B model testing

### Feature Engineering
- Feature store: centralized feature computation and storage (Feast, Tecton)
- Feature computation: batch (scheduled) and real-time (streaming)
- Feature documentation: description, data type, freshness, owner
- Feature reuse: shared features across models (reduce duplication)

### Model Lifecycle (MLOps)
- Training pipeline: data prep → feature engineering → training → evaluation → registration
- Model registry: versioned models with metadata (metrics, training data, author)
- Deployment pipeline: model approval → canary deployment → full rollout
- Monitoring: prediction quality, data drift, model drift, latency
- Retraining: scheduled or trigger-based (drift detection)

### Model Monitoring
- Prediction quality: track accuracy/precision/recall against ground truth (delayed feedback)
- Data drift: compare input feature distributions against training data
- Model drift: compare prediction distributions over time
- Latency and throughput: track inference performance
- Bias detection: monitor predictions across demographic segments (where applicable)

### Inference Optimization
- Model compression: quantization, pruning, distillation for smaller/faster models
- Batching: batch multiple inference requests for GPU efficiency
- Caching: cache predictions for repeated inputs
- Hardware: GPU for training, CPU for simple inference, specialized hardware (TPU) for large models

### Security and Privacy for ML
- Training data: no PII unless explicitly required and consented
- Model outputs: don't expose training data through model (membership inference attacks)
- Feature access control: restrict access to sensitive features
- Audit trail: who trained which model, on what data, with what parameters
- Federated learning: train on decentralized data without centralizing (privacy-preserving)

## Data Science and Research

### Exploratory Analysis
- Use notebooks (Jupyter, Observable) for exploration and prototyping
- Document findings and methodology alongside code
- Version notebooks in git (clear outputs before committing to reduce diff noise)
- Transition production-worthy code from notebooks to proper modules

### Experimentation Framework
- Hypothesis → experiment design → data collection → analysis → decision
- A/B testing infrastructure: random assignment, exposure tracking, metric calculation
- Power analysis: calculate required sample size before starting experiment
- Guardrail metrics: metrics that must not degrade (even if primary metric improves)
- Decision criteria: define before experiment what constitutes success

### Statistical Best Practices
- Use appropriate tests for data type: t-test, chi-squared, Mann-Whitney, etc.
- Report confidence intervals, not just p-values
- Correct for multiple comparisons (Bonferroni, Benjamini-Hochberg)
- Watch for: Simpson's paradox, survivorship bias, selection bias
- Pre-register experiments to prevent p-hacking

## Data Governance and Privacy

### Data Classification
- **Public**: no restrictions on access or sharing
- **Internal**: accessible to all employees, not shared externally
- **Confidential**: restricted access, need-to-know basis (customer data, financials)
- **Restricted**: highest sensitivity (PII, PHI, payment data, credentials)
- Classification drives: encryption requirements, access controls, retention policies

### Retention and Deletion
- Define retention period per data category and regulation (GDPR, HIPAA, SOC2)
- Automated deletion: scheduled jobs to purge expired data
- Right to deletion: process for user data deletion requests (GDPR Article 17)
- Backup retention: ensure backups also respect deletion policies
- Document retention policies and ensure enforcement

### Access Controls
- Role-based access to data (analyst, engineer, admin)
- Column-level security for sensitive fields (mask SSN, encrypt PII)
- Row-level security for multi-tenant data (users see only their data)
- Audit logging: track who accessed what data, when
- Access review: quarterly review of data access permissions

### Consent and Privacy Compliance
- Consent management: track user consent for data processing purposes
- Data processing agreements: legal contracts with third-party data processors
- Privacy impact assessment: evaluate new features/data collections for privacy risk
- Cross-border data transfers: comply with data residency requirements (GDPR, CCPA)
- Cookie consent: comply with ePrivacy Directive where applicable

### Data Quality Governance
- Data stewardship: designated owner for each critical dataset
- Quality SLAs: defined freshness, completeness, accuracy targets per dataset
- Issue tracking: process for reporting and resolving data quality issues
- Continuous improvement: regular review of data quality metrics and trends
