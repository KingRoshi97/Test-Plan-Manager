# Platform Engineering Best Practices

## Internal Developer Platform (IDP)

### Platform Vision
- Build a self-service platform that enables developer teams to ship independently
- Reduce cognitive load: developers focus on product, not infrastructure
- Golden paths: provide opinionated, well-supported default workflows
- Paved roads, not walled gardens: allow deviation when justified, but make the default easy

### Core IDP Capabilities
- Service creation and provisioning (template-based scaffolding)
- Environment management (dev, staging, production on demand)
- CI/CD pipeline as a service (standardized, per-team customizable)
- Observability stack (logging, metrics, tracing — pre-configured)
- Secret management (vault, rotation, injection)
- Database provisioning and lifecycle management

### Developer Portal
- Service catalog: searchable index of all services, owners, SLOs, documentation
- Service scorecard: maturity assessment (has tests? has alerts? has runbook?)
- API documentation aggregation (OpenAPI specs rendered in portal)
- Team ownership and escalation paths
- Self-service provisioning workflows (click to create new service, database, environment)

### Team Support Model
- Office hours for platform questions and onboarding
- SLAs for platform services (CI pipeline uptime, env provisioning time)
- Feedback loops: platform NPS, feature requests, pain point tracking
- Internal training and workshops on platform tools

## Golden Path Templates

### Service Templates
- Template per service type: REST API, event consumer, scheduled job, frontend app
- Includes: project structure, CI/CD config, Dockerfile, monitoring config, tests
- Pre-configured linting, formatting, security scanning
- README with setup instructions, architecture overview, operational guides

### Environment Templates
- Standardized environment configuration (dev/staging/production parity)
- Infrastructure as code (Terraform/Pulumi modules) for each environment type
- Pre-configured monitoring, alerting, and logging
- Secret injection via vault (no hardcoded credentials in templates)

### Pipeline Templates
- Standard pipeline stages: lint, test, build, scan, deploy, smoke test
- Language-specific pipeline variants (Node.js, Go, Python, Java)
- Configurable gates: required test coverage, security scan pass, approval step
- Caching and parallelization built in for performance

## CI/CD Platform

### Pipeline Ownership
- Platform team owns pipeline infrastructure (runners, caching, artifact storage)
- Product teams own pipeline configuration (which tests, which environments)
- Shared pipeline libraries for common steps (deploy, notify, scan)
- Pipeline-as-code: pipeline definition lives in the service repo

### Build System
- Reproducible builds: same source → same artifact (deterministic)
- Build caching: incremental builds, dependency caching, layer caching for containers
- Artifact management: versioned artifacts stored in registry (container registry, npm registry)
- Build signing: sign artifacts for provenance verification

### Runner Infrastructure
- Self-hosted runners for: build performance, network access, security requirements
- Managed runners for: simplicity, cost optimization, burst capacity
- Runner pool sizing: match to team workload, auto-scale during peak
- Isolated environments per build (containers or VMs, no cross-contamination)

### Pipeline Performance
- Target: < 10 minutes for full pipeline, < 5 minutes for unit tests + lint
- Parallelize: lint, type check, and tests run concurrently
- Cache aggressively: node_modules, build artifacts, Docker layers
- Incremental: run only affected tests on PR (based on changed files)
- Fail fast: cheapest checks first (lint before integration tests)

## Observability Platform

### Logging Infrastructure
- Centralized log aggregation (stdout → Fluentd/Vector → storage)
- Structured JSON logging with consistent field schema
- Retention: 30 days hot, 90 days warm, 1 year cold storage (compliance-dependent)
- Log levels: ERROR, WARN, INFO (production), DEBUG (development only)
- Correlation ID propagation across services

### Metrics Infrastructure
- Metrics collection: Prometheus scraping or push-based (StatsD, OTLP)
- Standard metrics per service: request rate, error rate, latency (RED method)
- Dashboard templates per service type (API, worker, frontend)
- Alert routing: PagerDuty/OpsGenie integration with team ownership
- Cardinality management: avoid high-cardinality labels that explode storage

### Distributed Tracing
- Trace propagation: OpenTelemetry (vendor-neutral, standard)
- Sampling strategy: 100% for errors, 1-10% for normal traffic
- Trace ID in logs and error reports for correlation
- Visualize: service dependency graphs, latency breakdown per span
- Alerting on trace-derived metrics (slow spans, error spans)

### Alerting Standards
- Alert on symptoms, not causes (high error rate, not CPU usage)
- Runbook link in every alert
- Severity levels: P1 (page), P2 (Slack), P3 (email/ticket)
- Alert review: monthly tuning to reduce noise, quarterly alert audit
- On-call handoff: clear escalation paths, documented responsibilities

## Secret and Configuration Management

### Secrets Platform
- Centralized secrets management (HashiCorp Vault, AWS Secrets Manager, Doppler)
- Application-level secret injection (environment variables, mounted files)
- Secret rotation: automated for database passwords, API keys, certificates
- Audit trail: who accessed which secret, when
- Emergency rotation: procedure for compromised secrets

### Configuration Management
- Environment-specific configuration (dev/staging/production)
- Feature flags: centralized flag management (LaunchDarkly, Unleash, Flipt)
- Runtime configuration: change behavior without redeployment
- Configuration validation: schema validation on startup, fail fast on invalid config
- Audit trail for configuration changes

## Service Mesh and Networking

### Service Discovery
- Automatic service registration and discovery (DNS-based, registry-based)
- Health-based routing: only route to healthy instances
- Load balancing: round-robin for stateless, consistent hashing for stateful
- Service-to-service authentication (mTLS or service tokens)

### API Gateway
- Single entry point for external traffic
- Rate limiting per client/API key
- Authentication and authorization at the edge
- Request/response transformation (header injection, path rewriting)
- TLS termination and certificate management

### Traffic Management
- Canary deployments: route percentage of traffic to new version
- A/B testing: route based on user segment or header
- Blue-green deployments: switch traffic between environments
- Circuit breaking at the mesh level (prevent cascading failures)

## Platform Standards and Governance

### Policy Enforcement
- Policy-as-code: OPA/Rego, Kyverno, or Sentinel for automated enforcement
- Deployment policies: required health checks, resource limits, security scanning
- Access policies: least privilege, approval workflows for production access
- Compliance: automated evidence collection for SOC2, ISO 27001

### Cost Visibility and FinOps
- Per-team cost attribution (tag resources by team/service)
- Budget alerts: notify teams when approaching limits
- Right-sizing recommendations: identify over-provisioned resources
- Reserved capacity: purchase commitments for predictable workloads
- Idle resource cleanup: identify and remove unused resources

### Platform Reliability
- SLAs for platform services: CI pipeline uptime, environment provisioning time, secret access
- Incident response for platform failures (treat platform as a product)
- Capacity planning for platform infrastructure
- Change management for platform updates (announce, stage, rollout, support)
- Platform health dashboard visible to all developers

### Security Baselines
- Secure defaults in templates (non-root containers, security headers, encryption)
- Automated security scanning in CI (SAST, SCA, container scanning)
- Network policies: default deny, explicit allow
- Hardened base images maintained by platform team
- Regular vulnerability scanning and patching schedule

## Multi-Tenant Platform

### Tenant Isolation
- Namespace-based isolation (Kubernetes namespaces, AWS accounts)
- Resource quotas per team (CPU, memory, storage, build minutes)
- Network segmentation: teams cannot access other teams' services by default
- Data isolation: separate databases or strict row-level security

### Self-Service Boundaries
- Teams can: create services, environments, pipelines, databases
- Teams need approval for: production access, elevated permissions, cross-team access
- Platform controls: resource limits, security policies, compliance requirements
- Guardrails, not gates: automate policy enforcement, minimize manual approval

### Inner-Loop Productivity
- Fast local development: hot reload, local dependencies, service mocking
- Fast builds: incremental compilation, build caching, dependency pre-fetching
- Fast tests: parallel test execution, test caching, selective test runs
- Fast feedback: lint and type check on save, pre-commit hooks
- One-command setup: devcontainers, Nix, or scripted environment setup

## Developer Workflow Automation

### Pre-Commit and PR Automation
- Pre-commit hooks: lint, format, type check (keep fast, < 5 seconds)
- PR template with checklist (tests, docs, migration, security review)
- Automated PR checks: CI pipeline, coverage report, dependency review
- Bot-powered PR comments: test results, coverage diff, bundle size diff

### Ephemeral Preview Environments
- Automatic preview environment per PR (isolated, temporary)
- Share preview URL in PR comments for review
- Auto-destroy on PR close/merge (cost control)
- Include: application, database seed, feature flag overrides

### Documentation Automation
- Generate API docs from code (OpenAPI from decorators/schemas)
- Generate architecture docs from dependency graphs
- Publish docs on merge to main (automated pipeline)
- Link docs in service catalog for discoverability

### Release Orchestration
- Automated release notes from commit history (conventional commits)
- Changelog generation (categorized: features, fixes, breaking changes)
- Release approval workflows (configurable per team/service criticality)
- Post-release smoke tests and monitoring windows
