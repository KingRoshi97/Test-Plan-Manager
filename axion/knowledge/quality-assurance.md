# Quality Assurance Best Practices

## QA Processes

### Test Strategy Definition
- Define test scope: what to test, what not to test, risk-based prioritization
- Test types: functional, regression, exploratory, acceptance, smoke, sanity
- Coverage targets: critical paths 100%, happy paths 90%+, edge cases risk-based
- Environment strategy: which tests run where (local, CI, staging, production)
- Tool selection: framework, reporting, CI integration, test data management

### Test Planning
- Derive test cases from requirements/user stories (traceability matrix)
- Identify: happy paths, error paths, boundary conditions, negative cases
- Priority: P0 (blocks release), P1 (critical functionality), P2 (important), P3 (nice-to-have)
- Estimate: time to create tests, time to execute, time to maintain
- Review test plans with developers and product owners

### Test Case Design
- **Equivalence partitioning**: group inputs into classes, test one from each
- **Boundary value analysis**: test at edges (min, max, min-1, max+1)
- **Decision table testing**: map combinations of conditions to expected outcomes
- **State transition testing**: test valid and invalid state changes
- **Error guessing**: use experience to predict likely failure points

### Exploratory Testing
- Session-based: time-boxed exploration (30-60 minutes) with charter
- Charter: "Explore [feature] to discover [risk] using [technique]"
- Document findings in real-time (bugs, questions, observations)
- Complement scripted testing (finds issues automated tests miss)
- Schedule exploratory sessions after major feature completions

### Acceptance Testing
- Based on acceptance criteria from user stories
- Written in user-facing language (Given/When/Then or plain English)
- Executed by QA with product owner sign-off
- Gates release: feature not shipped until acceptance tests pass
- Automated where possible, manual for subjective/UX criteria

### Bug Reporting
- Title: concise description of the problem
- Steps to reproduce: numbered, exact steps from start state
- Expected result: what should happen
- Actual result: what actually happens
- Environment: browser, OS, device, app version
- Severity/priority: impact and urgency classification
- Attachments: screenshots, video, logs, network traces

### Triage Process
- Regular triage meetings (daily or every other day during active development)
- Classify: severity (how bad) × priority (how urgent)
- Assign: developer owner, target fix version
- Defer: document reason for deferral, set review date
- Reject: not a bug, by design, cannot reproduce (require evidence)

### Cross-Platform Testing
- Define platform matrix: browsers, OS versions, devices, screen sizes
- Tier-1 (must work perfectly): Chrome, Safari, Firefox (latest), iOS Safari, Android Chrome
- Tier-2 (should work): Edge, older browser versions, less common devices
- Automate: run E2E tests across browser matrix in CI
- Manual spot-check: on real devices for touch/gesture and visual verification

### Release Readiness
- Smoke testing: verify critical paths work in release candidate
- Regression testing: verify existing functionality not broken
- Go/no-go decision: test results, bug status, stakeholder approval
- Release checklist: documentation, migration plan, rollback plan, monitoring

## Test Automation Engineering

### Automation Strategy
- Automate: regression tests, critical paths, data-driven tests, cross-browser
- Don't automate: exploratory testing, one-time tests, rapidly changing UI
- ROI calculation: benefit of automation vs. cost of creation and maintenance
- Automation pyramid: many unit, moderate integration, few E2E

### Test Framework Selection
- **Unit**: Vitest, Jest (JavaScript/TypeScript), pytest (Python), JUnit (Java)
- **Integration**: Supertest (API), test containers for dependencies
- **E2E**: Playwright (recommended), Cypress (alternative), Detox (mobile)
- **Visual**: Chromatic, Percy, BackstopJS
- Choose based on: language ecosystem, team familiarity, CI integration

### Unit Test Best Practices
- Test behavior, not implementation (what it does, not how)
- One assertion concept per test (may have multiple assert statements)
- Descriptive test names: `should return 401 when token is expired`
- Fast: < 100ms per test, no I/O, no network
- Isolated: no test depends on another test's output or state
- Deterministic: same input always produces same result

### Integration Test Best Practices
- Test API endpoints end-to-end (request → processing → database → response)
- Use test database (separate from development and production)
- Reset state between tests (transaction rollback or truncation)
- Test authentication and authorization flows
- Test error handling and edge cases
- Mock only external services (use real database, real application code)

### E2E Test Best Practices
- Test critical user journeys (not every feature, just the most important flows)
- Stable selectors: `data-testid` attributes (not CSS classes or XPath)
- Wait patterns: wait for elements, not fixed timeouts
- Retry flaky assertions with built-in retry mechanisms
- Isolate tests: each test creates its own data, cleans up after itself
- Parallel execution for speed (independent tests run concurrently)

### Test Data Management
- **Factories**: generate test data with sensible defaults, override per test
- **Fixtures**: pre-defined data sets for common scenarios
- **Seeding**: populate database with realistic data for integration/E2E tests
- **Cleanup**: reset database state between tests (transactions, truncation, recreation)
- Realistic data: use realistic shapes and values (not `test123`)
- Avoid shared mutable state between tests

### Mocking and Service Virtualization
- Mock external APIs (MSW for frontend, nock for Node.js backend)
- Stub: return fixed data for a call
- Mock: verify that a call was made (with correct parameters)
- Spy: observe calls without changing behavior
- Service virtualization: simulate complex external services for integration testing
- Don't over-mock: use real implementations where practical

### CI Integration
- Run unit tests on every commit (fast feedback)
- Run integration tests on every PR (catch integration issues before merge)
- Run E2E tests on merge to main (validate before deployment)
- Parallelize test suites for speed (split across CI workers)
- Cache dependencies and build artifacts between runs

### Flaky Test Management
- Track flaky tests: monitor test reliability over time (pass rate per test)
- Quarantine: move flaky tests to non-blocking suite (run but don't fail build)
- Fix within one sprint: assign owner, root cause analysis, permanent fix
- Prevention: avoid timing dependencies, use stable selectors, proper waits
- Never skip or delete tests without a tracking issue

### Coverage Strategy
- Target: 80%+ line coverage for business logic
- Don't chase 100%: diminishing returns after 85%
- Focus: complex logic, error handling, edge cases
- Exclude: generated code, configuration, trivial getters/setters
- Use coverage reports to find untested code paths, not as a vanity metric

## Performance Engineering

### Load Testing
- Simulate realistic traffic patterns (ramp up, sustained load, spike)
- Test at: expected peak, 2x peak, 3x peak (find breaking point)
- Measure: throughput, latency (p50, p95, p99), error rate, resource usage
- Tools: k6, Locust, Artillery, Gatling, JMeter

### Stress Testing
- Push system beyond expected limits to find failure modes
- Identify: which component fails first, how it fails, recovery behavior
- Test: memory exhaustion, CPU saturation, connection pool exhaustion, disk full
- Verify: graceful degradation, error messages, recovery after stress removed

### Soak Testing
- Run at moderate load for extended duration (8-24 hours)
- Detect: memory leaks, connection leaks, disk space growth, GC pauses
- Monitor: memory usage trend, open file descriptors, connection counts
- Establish baseline and alert on drift

### Benchmarking
- Establish baseline performance metrics for key operations
- Compare: before vs. after code changes (regression detection)
- Statistical methods: multiple runs, report median and percentiles
- Automate: run benchmarks in CI, fail on regression beyond threshold
- Control variables: same hardware, same data, warm caches

### Capacity Planning
- Model: traffic growth trends, seasonal patterns, feature launch impact
- Headroom: maintain 30-50% capacity buffer above peak
- Scale testing: verify horizontal scaling works (add instances, rebalance)
- Cost modeling: project infrastructure costs based on growth projections

### Performance Profiling
- CPU: identify hot functions, optimize critical path
- Memory: track allocations, identify leaks, reduce unnecessary retention
- Database: slow query log, EXPLAIN ANALYZE, index recommendations
- Network: request waterfall, connection reuse, payload sizes
- Frontend: Lighthouse audit, Core Web Vitals, bundle analysis

### Performance Budgets
- Define budgets: JavaScript bundle (< 200KB gzipped), page weight (< 1MB), TTI (< 3.5s)
- Enforce in CI: fail build if budgets exceeded
- API budgets: p95 latency per endpoint, error rate threshold
- Review and adjust budgets quarterly based on actual usage

### Bottleneck Identification
- Systematic approach: measure → identify constraint → optimize → remeasure
- Common bottlenecks: database queries, external API calls, CPU-heavy computations
- Amdahl's law: optimizing non-bottleneck components has diminishing returns
- Monitor and alert on performance metrics to catch regressions early

## Reliability Testing

### Failure Mode Testing
- Test dependency outages: database down, cache unavailable, external API timeout
- Test partial failures: one instance down, one AZ unavailable
- Test data corruption scenarios: invalid data, schema mismatch
- Verify: error handling, fallback behavior, user-facing error messages

### Chaos Testing
- Inject failures in production-like environment
- Types: process kill, network partition, latency injection, disk full
- Start small: single instance, single dependency (expand scope gradually)
- Game days: planned chaos exercises with team observing and responding
- Only appropriate for mature systems with good monitoring and incident response

### Disaster Recovery Testing
- Test backup restore: verify backups are usable, measure restore time
- Test failover: simulate primary failure, verify secondary takes over
- Test data recovery: simulate data loss, verify recovery procedures
- Frequency: at least annually, more often for critical systems
- Document: recovery procedures, observed recovery times, issues found

## Quality Governance

### Definition of Done
- Code: reviewed, tested, linted, documented
- Tests: unit, integration, and relevant E2E tests passing
- Documentation: API docs, user-facing docs updated if applicable
- Accessibility: meets WCAG AA requirements
- Performance: within budget, no regressions
- Security: no new vulnerabilities, secrets scanned
- Deployment: can be deployed and rolled back safely

### Quality Metrics
- **Defect escape rate**: bugs found in production vs. found in testing
- **MTTR**: mean time to resolve production defects
- **Test coverage**: line/branch coverage trends over time
- **Flaky test rate**: percentage of non-deterministic tests
- **Build success rate**: CI pipeline reliability
- **Deployment frequency**: how often changes reach production
- **Change failure rate**: percentage of deployments causing issues

### Continuous Improvement
- Sprint retrospectives: identify quality improvement opportunities
- Post-release retrospectives: review defects, near-misses, process gaps
- Quality trends: track metrics over time, identify systemic issues
- Action items: concrete, assigned, time-bound improvements
- Celebrate improvements: recognize quality wins

### Release Criteria
- All P0/P1 bugs fixed (no critical defects)
- Test coverage meets threshold (80%+ for business logic)
- Performance within budget (no regressions)
- Security scan clean (no critical/high vulnerabilities)
- Accessibility audit passed (WCAG AA compliance)
- Stakeholder sign-off (product owner, QA lead)
- Rollback plan documented and tested
