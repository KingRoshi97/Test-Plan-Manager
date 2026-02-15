# Release Engineering Best Practices

## Versioning

### Semantic Versioning (SemVer)
- Format: `MAJOR.MINOR.PATCH` (e.g., 2.4.1)
- MAJOR: incompatible API changes (breaking changes)
- MINOR: new functionality (backward-compatible)
- PATCH: bug fixes (backward-compatible)
- Pre-release: `2.4.1-beta.1`, `2.4.1-rc.1`
- Build metadata: `2.4.1+build.123` (not for version precedence)

### Calendar Versioning (CalVer)
- Format: `YYYY.MM.PATCH` or `YYYY.MM.DD`
- Use for: services, platforms, products with regular release cadence
- Advantage: communicates when the release was made, not what changed

### Version Synchronization
- Monorepo: unified version for all packages, or independent versioning per package
- API versioning: URL path (`/api/v2/`) or header-based (separate from app version)
- Database schema version: tracked in migrations table
- Configuration version: track config schema changes independently

### Version in Code
- Single source of truth for version (package.json, version.go, build config)
- Inject version at build time (environment variable, build argument)
- Expose version in: health endpoint, user-facing UI (footer/about), logs, error reports
- CI sets version automatically (from git tag or release workflow)

## Deployment Strategies

### Rolling Update
- Replace instances one at a time (or a percentage at a time)
- Default for most deployments (simplest, supported by all platforms)
- Zero-downtime if health checks and readiness probes are configured
- Rollback: deploy previous version as a new rolling update
- Risk: both old and new versions serve traffic simultaneously during rollout

### Blue-Green Deployment
- Two identical environments: blue (current) and green (new)
- Deploy to green, validate, then switch traffic from blue to green
- Instant rollback: switch traffic back to blue
- Cost: double the infrastructure during deployment
- Best for: critical services, databases-not-involved changes

### Canary Deployment
- Route small percentage (1-5%) of traffic to new version
- Monitor: error rate, latency, business metrics against baseline
- Gradually increase traffic: 5% → 25% → 50% → 100%
- Automatic rollback if metrics degrade beyond threshold
- Best for: high-traffic services where gradual validation is important

### Feature Flag Rollout
- Deploy code with feature behind flag (dark deploy)
- Enable flag for internal users → beta users → percentage → all users
- Kill switch: disable feature instantly without redeployment
- Decouple deployment (code shipping) from release (feature activation)
- Clean up old flags after full rollout (prevent flag debt)

### Immutable Infrastructure
- Never patch running servers — replace them entirely
- Build new image/container for every change
- Guarantees: what was tested is exactly what runs in production
- Rollback: deploy previous image version

## Rollback Strategy

### When to Roll Back
- Error rate exceeds baseline by 2x or more
- p95 latency exceeds baseline by 3x or more
- Critical business metric drops (conversion rate, checkout success)
- Customer-reported issues spike
- Internal monitoring detects data corruption risk

### Rollback Mechanisms
- **Automated rollback**: monitoring triggers rollback when metrics exceed threshold
- **Manual rollback**: human decision based on dashboard, logs, or escalation
- **Feature flag rollback**: disable feature without code revert
- **Database rollback**: backward-compatible migrations mean code rollback is safe

### Rollback Requirements
- Keep previous deployment artifact for instant rollback (retain N-2 versions minimum)
- Database migrations must be backward-compatible (additive only, never drop in same deploy)
- API changes must be backward-compatible within a version
- Rollback procedure documented and tested regularly

### Post-Rollback Actions
- Investigate root cause before re-deploying the fix
- Communicate to stakeholders: what happened, impact, timeline for fix
- Update monitoring if the issue wasn't caught quickly enough
- Add regression test for the failure scenario

## Feature Flag Management

### Flag Lifecycle
1. **Create**: define flag, default value, rollout strategy
2. **Deploy**: ship code behind flag (disabled by default)
3. **Enable**: gradual rollout (internal → beta → percentage → all)
4. **Monitor**: watch metrics during rollout
5. **Clean up**: remove flag and conditional code after full rollout

### Flag Types
- **Release flag**: gradual rollout of new features (temporary)
- **Experiment flag**: A/B testing (temporary, tied to experiment lifecycle)
- **Ops flag**: runtime control (circuit breaker, feature kill switch) (semi-permanent)
- **Permission flag**: user-segment gating (premium features, beta access) (permanent)

### Flag Best Practices
- Evaluate flags server-side (backend controls access, frontend reads state)
- Default to safe value on flag-fetch failure (fail closed for risky features)
- Track flag age: alert on flags older than 30 days without full rollout
- Document each flag: purpose, owner, expected cleanup date
- Never nest more than 2 feature flags (complexity becomes unmanageable)

## Migration Coordination

### Database Migration Strategy
- Migrations must be backward-compatible (code before and after works with the schema)
- Two-phase migrations: (1) add new column/table (2) backfill data (3) migrate code (4) remove old column
- Never drop columns or tables in the same deploy as code changes
- Run migrations before code deployment (ensure schema is ready)
- Test migrations against production-size data copy

### API Migration
- Introduce new version alongside old version
- Migrate consumers to new version with timeline and support
- Deprecation headers on old version: `Deprecation: true`, `Sunset: <date>`
- Monitor old version usage: don't remove until traffic drops to zero
- Provide migration guide and breaking change documentation

### Data Migration
- Plan for large data sets: batch processing, progress tracking, resumability
- Validate data post-migration (checksums, row counts, business rule checks)
- Rollback plan: keep source data untouched until migration is verified
- Communication: notify affected users, plan maintenance windows if needed

## Build Reproducibility

### Deterministic Builds
- Same source code + same build environment → same artifact (byte-for-byte or semantically equivalent)
- Pin all dependency versions (lockfiles committed to repo)
- Pin build tool versions (Node.js, Go, compiler versions)
- Hermetic builds: don't depend on host environment (use containers for build)

### Build Signing and Provenance
- Sign build artifacts: verify origin and integrity
- Generate SBOM (Software Bill of Materials): list all dependencies with versions
- Provenance attestation: link artifact to source commit and build environment
- Store signatures and SBOMs alongside artifacts in registry

### Artifact Management
- Immutable artifacts: once published, never modify (publish new version)
- Retention policy: keep N most recent versions, archive older ones
- Promotion: same artifact moves through environments (don't rebuild for production)
- Tag artifacts with: version, commit hash, build timestamp

## Release Process

### Release Planning
- Define release cadence: weekly, bi-weekly, monthly, or continuous
- Release calendar: scheduled dates, freeze periods, maintenance windows
- Release scope: features, fixes, and improvements included
- Release criteria: tests pass, security scan clean, performance budgets met

### Release Checklist
1. All CI checks pass (tests, lint, type check, security scan)
2. Changelog and release notes written
3. Database migrations tested against staging data
4. Feature flags configured for gradual rollout
5. Monitoring dashboards and alerts ready
6. Rollback procedure confirmed
7. Stakeholder communication sent
8. Deploy to staging and verify
9. Deploy to production (gradual rollout)
10. Post-deployment monitoring window (15-30 minutes minimum)

### Release Notes and Changelogs
- Generate from conventional commit messages (feat:, fix:, breaking:)
- Categorize: Features, Bug Fixes, Breaking Changes, Deprecations, Performance
- Write user-facing release notes (non-technical language for product changes)
- Developer-facing changelog (technical details, migration instructions)
- Include: version number, date, notable changes, upgrade instructions

### Hotfix Workflow
1. Branch from latest release tag (not from main)
2. Apply minimal fix (no feature work in hotfix)
3. Test fix in staging environment
4. Deploy to production with expedited review
5. Monitor closely for 30 minutes post-deploy
6. Cherry-pick fix back to main branch
7. Document incident and resolution in postmortem

## Post-Release Validation

### Smoke Testing
- Automated smoke tests run immediately after production deploy
- Test critical user journeys (login, core feature, payment if applicable)
- Verify external integrations (payment processor, email service, CDN)
- Check health endpoints and service dependencies

### Monitoring Window
- Active monitoring for 15-30 minutes after deploy
- Watch: error rate, latency, business metrics, log anomalies
- Compare metrics against pre-deploy baseline
- On-call engineer available for immediate rollback

### Post-Release Communication
- Notify stakeholders of successful deployment
- Update status page if relevant
- Close release tracking ticket/issue
- Schedule retrospective if release had issues

## Backward Compatibility

### API Compatibility
- New fields are optional (old clients don't break)
- Never remove or rename existing fields in a minor/patch release
- New endpoints are additive (don't change existing endpoint behavior)
- Versioning boundary for breaking changes (v1 → v2)

### Database Compatibility
- Add columns as nullable or with defaults (don't require application changes)
- Never drop columns in the same release as code changes
- Add new tables/indexes before code that uses them
- Remove old structures only after all code references are removed

### Client Compatibility
- Frontend may be cached (users running old JavaScript bundles)
- API must handle requests from old clients for at least one release cycle
- WebSocket protocols must handle version negotiation
- Mobile apps: old versions may remain in the wild for months/years

## Release Governance

### Approval Workflows
- Automated gates: tests, security scan, performance budget (no human needed)
- Human approval: for production deploys of critical services
- Escalation: who can override gates in emergencies
- Audit trail: who approved, when, with what justification

### Change Management
- Change advisory board (CAB) for high-risk changes
- Change freeze periods (holidays, end of fiscal quarter)
- Emergency change process: expedited approval for critical fixes
- Document all changes in change management system

### Compliance Requirements
- SOC2: audit trail, access controls, change management
- PCI DSS: secure deployment, vulnerability management
- HIPAA: access logging, encryption, data handling
- Automate compliance evidence collection where possible
