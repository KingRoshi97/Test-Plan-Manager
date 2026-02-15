# DevOps & Deployment Best Practices

## CI/CD Pipeline

### Standard Pipeline Stages
1. **Install** — Install dependencies (cache node_modules between runs)
2. **Lint** — ESLint + Prettier check (fail fast on style issues)
3. **Type Check** — `tsc --noEmit` (catch type errors before tests)
4. **Unit Tests** — Fast tests with coverage report
5. **Build** — Production build (verify it compiles)
6. **Integration Tests** — Test against real database
7. **E2E Tests** — Critical user flow tests (on merge to main)
8. **Deploy** — Automated deployment to staging/production

### Pipeline Principles
- Fail fast: Run cheapest checks first (lint before tests, unit before E2E)
- Cache aggressively: node_modules, build artifacts, Docker layers
- Parallelize: Run lint, type check, and tests concurrently where possible
- Keep pipeline under 10 minutes total (5 minutes is ideal)

### Build Automation
- Generate versioned build artifacts with commit hash and timestamp
- Build container images in CI with multi-stage Dockerfiles
- Cache build layers between runs (Docker layer caching, Turborepo cache)
- Sign build artifacts for integrity verification in production

### Deployment Automation
- Use infrastructure-as-code for deployment configuration (reproducible)
- Automate database migrations as part of deploy pipeline
- Run smoke tests after deployment before routing traffic
- Implement automatic rollback on health check failure

### Secrets Management in CI
- Use CI platform's native secrets (GitHub Actions secrets, GitLab CI variables)
- Never echo or print secrets in CI logs
- Rotate CI secrets on the same schedule as production secrets
- Use OIDC-based authentication for cloud services (no long-lived credentials)

### Developer Workflow Automation
- Pre-commit hooks: lint, format, type check (use husky + lint-staged)
- PR gates: require passing CI, code review, and coverage thresholds
- Auto-assign reviewers based on code ownership (CODEOWNERS file)
- Automate changelog generation from conventional commits

## Environment Management

### Environment Hierarchy
| Environment | Purpose | Data | Deployment |
|-------------|---------|------|------------|
| Local | Development | Seeded/mock | Manual |
| Staging | Pre-production testing | Anonymized production copy | Auto on merge to main |
| Production | Live users | Real data | Manual approval or auto with gates |

### Environment Variables
- Use `.env.example` committed to repo (with placeholder values)
- Never commit `.env` files with real values
- Use platform secrets manager (Replit Secrets, AWS SSM, Vercel env vars)
- Prefix frontend-accessible vars: `VITE_` (Vite), `NEXT_PUBLIC_` (Next.js)
- Validate all required env vars on startup (fail immediately if missing)

## Deployment Strategies

### Zero-Downtime Deployment
- **Rolling update**: Replace instances one at a time (default for most platforms)
- **Blue-green**: Switch traffic between two identical environments
- **Canary**: Route small % of traffic to new version, monitor, then roll out

### Health Checks
- Implement `GET /health` endpoint returning 200 when ready to serve
- Check database connectivity, cache availability, and critical dependencies
- Return 503 during startup/shutdown for graceful load balancer handling
- Include version/commit hash in health response for deployment verification

### Rollback Plan
- Keep previous deployment artifact ready for instant rollback
- Database migrations must be backward-compatible (two-phase migrations)
- Feature flags enable instant "rollback" without redeployment
- Monitor error rates for 15-30 minutes after deploy before considering it stable

## Monitoring and Observability

### Logging
- Use structured logging (JSON format) with consistent fields
- Standard fields: `timestamp`, `level`, `message`, `request_id`, `user_id`
- Log levels: ERROR (action needed), WARN (investigate), INFO (audit trail), DEBUG (development)
- Never log sensitive data (passwords, tokens, PII)
- Centralize logs (stdout → log aggregator like Datadog, CloudWatch, or Grafana Loki)

### Error Tracking
- Use Sentry or similar for exception tracking
- Include context: user ID, request parameters, stack trace
- Set up alerts for new error types and error rate spikes
- Resolve or silence errors within 48 hours (prevent alert fatigue)

### Metrics
- Track: request rate, error rate, response time (p50, p95, p99)
- Track: database query time, external API latency, queue depth
- Set up dashboards for key metrics
- Alert on anomalies (error rate > 1%, p95 latency > 1s)

### Alerting Configuration and Routing
- Route alerts by severity: P1 → pager, P2 → Slack channel, P3 → email/ticket
- Include runbook link in every alert
- Set appropriate thresholds to avoid alert fatigue (tune monthly)
- Deduplicate alerts to prevent notification storms
- Implement escalation policies for unacknowledged alerts

### Operational Runbooks
- Document step-by-step procedures for common operational tasks
- Include runbooks for: database failover, high CPU/memory, disk full, deploy rollback
- Keep runbooks in version control alongside infrastructure code
- Review and update runbooks after every incident
- Link runbooks from alert definitions for quick access during incidents

## Infrastructure

### Container Best Practices (Docker)
- Use multi-stage builds (build stage + production stage)
- Use specific base image tags (not `latest`)
- Run as non-root user
- Copy only necessary files (use `.dockerignore`)
- Set memory and CPU limits

### Scaling
- **Horizontal scaling**: Add more instances behind a load balancer
- **Vertical scaling**: Increase CPU/memory of existing instances
- Start with vertical (simpler), switch to horizontal when hitting limits
- Ensure application is stateless (sessions in database/Redis, not in memory)

### Database Operations
- Automated backups with point-in-time recovery
- Read replicas for read-heavy workloads
- Connection pooling (PgBouncer or application-level)
- Monitor slow queries and connection counts

## Security in DevOps

### Secret Management
- Rotate secrets on a schedule (90 days for API keys, 365 days for signing keys)
- Use platform-native secrets (Replit Secrets, AWS Secrets Manager)
- Audit secret access regularly
- Different secrets per environment (never share between staging and production)

### Dependency Updates
- Enable Dependabot or Renovate for automated PRs
- Review and merge security updates within 48 hours for critical/high severity
- Pin versions in production (lockfiles committed to repo)
- Audit dependencies quarterly for abandoned packages

### Access Control
- Principle of least privilege for all service accounts
- MFA required for deployment approvals
- Audit log for all production access
- Rotate deployment credentials periodically

## Site Reliability Engineering (SRE)

### SLIs, SLOs, and SLAs
- **SLI (Service Level Indicator)**: Measurable metric (availability, latency, error rate)
- **SLO (Service Level Objective)**: Target for SLI (99.9% availability, p95 latency < 200ms)
- **SLA (Service Level Agreement)**: Contractual commitment with consequences for missing targets
- Define SLOs for every user-facing service
- Measure SLIs continuously and alert when approaching SLO thresholds

### Error Budgets
- Error budget = 1 - SLO (e.g., 99.9% SLO = 0.1% error budget = ~43 min/month of downtime)
- Track error budget consumption over rolling 30-day window
- When budget is exhausted: freeze feature releases, focus on reliability
- When budget is healthy: proceed with feature development and experimentation
- Review error budget status in weekly team meetings

### On-Call Rotations
- Rotate on-call responsibility across the team (weekly or bi-weekly)
- Define clear escalation paths and handoff procedures
- Compensate on-call engineers fairly (time off, pay differential)
- Limit on-call alerts to actionable items — eliminate noise
- Provide backup on-call for primary responder

### Incident Management
- **Triage**: Assess severity (P1-P4) based on user impact and scope
- **Communication**: Establish incident channel, post regular status updates
- **Resolution**: Follow runbooks, involve subject matter experts as needed
- **Postmortem**: Conduct blameless postmortem within 48 hours of resolution
- **Action items**: Track and complete postmortem action items with owners and deadlines
- Use an incident commander role for P1/P2 incidents

### Capacity Planning
- Forecast resource needs based on growth trends (users, traffic, data)
- Load test at 2x expected peak to identify bottlenecks before they occur
- Plan for seasonal peaks (Black Friday, launches, end of month)
- Monitor resource utilization trends (CPU, memory, disk, connections)
- Set alerts at 70% capacity to trigger scaling discussions

### Reliability Engineering Patterns
- Circuit breakers for external dependencies (prevent cascade failures)
- Retry with exponential backoff and jitter for transient errors
- Bulkhead pattern: isolate components so one failure doesn't take down everything
- Graceful degradation: serve partial results when dependencies are slow/down
- Rate limiting to protect services from traffic spikes

### Change Management
- All production changes require a change record (who, what, when, rollback plan)
- Categorize changes: standard (pre-approved), normal (needs review), emergency (fast-track)
- Schedule high-risk changes during low-traffic periods
- Limit blast radius: deploy to a small percentage of traffic first

### Chaos Testing
- Regularly test system resilience by injecting failures (Chaos Monkey, Litmus)
- Start small: kill a single instance, then escalate to broader failures
- Test: network partition, dependency outage, disk full, CPU saturation
- Run chaos experiments in staging first, then controlled production experiments
- Document findings and fix identified weaknesses

### Disaster Recovery
- Define and document disaster recovery (DR) procedures
- Conduct DR drills at least quarterly
- Measure Recovery Time Objective (RTO) and Recovery Point Objective (RPO) during drills
- Maintain runbooks for: database restore, failover to secondary region, data recovery
- Verify backups are restorable (not just that they exist)

## Release Engineering

### Release Planning
- Define release cadence (continuous, weekly, biweekly) based on team and product needs
- Use release branches or trunk-based development with feature flags
- Coordinate releases across dependent services (API changes, database migrations)
- Plan release windows to minimize user impact

### Build Reproducibility and Signing
- Ensure builds are reproducible: same source → same artifact
- Use lockfiles for dependency pinning (package-lock.json, yarn.lock)
- Sign release artifacts with GPG or Sigstore for integrity verification
- Store build metadata: commit hash, timestamp, builder version

### Release Artifacts and Provenance
- Generate Software Bill of Materials (SBOM) for each release
- Track artifact provenance: what was built, from what source, by whom
- Store artifacts in a versioned registry (container registry, npm, artifact storage)
- Retain release artifacts for rollback capability (keep at least 5 previous releases)

### Feature Flag Rollout
- Use feature flags for progressive rollout (1% → 10% → 50% → 100%)
- Monitor metrics at each stage before expanding rollout
- Provide kill switch for instant feature disable
- Clean up feature flags after full rollout (remove dead code)
- Use typed feature flag systems with default values

### Backward Compatibility Management
- API changes must be backward compatible (additive only, no breaking changes)
- Use deprecation headers and sunset timelines for endpoint removal
- Database migrations must not break the currently deployed version
- Coordinate breaking changes across frontend and backend deployments

### Migration Coordination
- Document data migration plans for schema changes
- Run migrations during low-traffic periods
- Provide progress monitoring for long-running migrations
- Test migrations against production-like data volumes before execution

### Release Approvals and Governance
- Require approval from designated reviewers for production releases
- Enforce CI gate passing before release is permitted
- Maintain a release checklist: tests pass, docs updated, rollback plan documented
- Audit trail for all release approvals

### Hotfix Workflows
- Define a fast-track process for critical production fixes
- Hotfix from main/release branch, not from feature branches
- Hotfixes still require CI checks (abbreviated if necessary)
- Cherry-pick hotfixes back to development branch after release

### Release Notes and Changelogs
- Auto-generate changelogs from conventional commits
- Include: new features, bug fixes, breaking changes, deprecations
- Publish release notes for user-facing changes
- Internal release notes for operational/infrastructure changes

### Post-Release Validation
- Monitor error rates, latency, and key business metrics for 30 minutes post-deploy
- Compare metrics against pre-deploy baseline
- Automated canary analysis: statistical comparison of new vs old version metrics
- Establish clear criteria for when to rollback vs investigate
