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
