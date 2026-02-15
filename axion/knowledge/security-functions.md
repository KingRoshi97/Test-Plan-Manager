# Security Functions Best Practices

## Application Security (AppSec)

### Secure Coding Standards
- Input validation: allowlist approach (specify what's valid, reject everything else)
- Output encoding: context-aware encoding for HTML, JavaScript, URL, CSS, SQL
- Parameterized queries: never concatenate user input into queries
- Principle of least privilege: code runs with minimum necessary permissions
- Fail secure: deny access by default, explicitly grant permissions

### OWASP Top 10 Mitigation
- **Injection**: parameterized queries, ORM, input validation
- **Broken Authentication**: strong password hashing, session management, MFA
- **Sensitive Data Exposure**: encryption at rest/transit, minimize data collection
- **XXE**: disable external entities in XML parsers
- **Broken Access Control**: server-side enforcement, deny by default
- **Security Misconfiguration**: security headers, hardened configs, no defaults
- **XSS**: output encoding, CSP, React auto-escaping, DOMPurify for rich text
- **Insecure Deserialization**: validate input types, avoid native serialization
- **Known Vulnerabilities**: dependency scanning, automated updates
- **Insufficient Logging**: security event logging, monitoring, alerting

### Input Validation Standards
- Validate type, length, range, format for every input
- Server-side validation is mandatory (client-side is for UX only)
- Reject unexpected fields (strict mode)
- Normalize input: trim whitespace, normalize unicode, canonicalize URLs/paths
- Content type validation: verify Content-Type matches body format

### Dependency Security (SCA)
- Automated dependency scanning in CI (npm audit, Snyk, Dependabot)
- Fix critical/high vulnerabilities within 48 hours
- Review new dependencies: check downloads, maintenance, security history
- Pin versions in production (lockfile committed)
- Quarterly audit for abandoned or unmaintained packages

### Static Analysis (SAST)
- Integrate SAST in CI pipeline (Semgrep, CodeQL, SonarQube)
- Focus on: injection, hardcoded secrets, insecure patterns
- Triage findings: fix critical, track medium, accept low with justification
- Custom rules for application-specific security patterns

### Dynamic Testing (DAST)
- Run against staging environment (not production)
- Test: injection points, authentication bypass, authorization flaws
- Schedule: on PR for critical paths, weekly for full scan
- Tools: OWASP ZAP, Burp Suite (automated), custom scripts

### Secure API Design
- Authentication required for all non-public endpoints
- Authorization checked at route AND resource level
- Rate limiting: stricter on auth endpoints, per-user and per-IP
- Idempotency keys for write operations
- Request size limits (prevent resource exhaustion)
- CORS: explicit allowlist of origins (never wildcard in production)

### Secrets in Code
- No hardcoded secrets (API keys, passwords, tokens) in source code
- Use secrets scanning in CI (git-secrets, TruffleHog, GitGuardian)
- Pre-commit hooks to prevent secret commits
- Rotate any secrets that were ever committed (even if quickly removed)

### Secure File Upload
- Validate by magic bytes (not just extension or MIME type)
- Size limits enforced server-side
- Random filenames (never use user-provided names)
- Store outside web root (object storage)
- Serve from separate domain/subdomain
- Malware scanning for public upload endpoints

### Secure Session Management
- httpOnly, Secure, SameSite=Strict cookies
- Session ID regeneration after login
- Idle timeout and absolute timeout
- CSRF protection: SameSite cookies or CSRF tokens
- Session revocation on password change and logout

### Logging Without Leaking
- Never log: passwords, tokens, PII, credit card numbers
- Mask sensitive data in logs: show last 4 of card, hash identifiers
- Structured logging with consistent security event types
- Audit trail: who, what, when, from where (separate from debug logs)

## Infrastructure Security

### Cloud IAM
- Least privilege: grant minimum permissions needed
- Use roles/groups, not individual policies
- Service accounts: scoped to specific service, rotated credentials
- MFA required for human access to production
- Regular access review (quarterly): remove unused permissions

### Network Security
- Default deny: only allow explicitly required traffic
- Segment: public tier (load balancers) → private tier (compute) → data tier (databases)
- WAF: OWASP core rules, bot mitigation, rate limiting at edge
- DDoS protection: cloud-native shielding enabled
- Private connectivity for service-to-service (VPC peering, private link)

### Secrets Management
- Centralized vault (HashiCorp Vault, AWS Secrets Manager, Doppler)
- Automated rotation for database passwords, API keys, certificates
- Secret injection at runtime (env vars, mounted files), never baked into images
- Audit trail: who accessed which secret, when
- Emergency rotation procedure for compromised secrets

### Least Privilege and Role Design
- Separate admin, developer, operator, auditor roles
- Production access: read-only by default, break-glass for write access
- Workload identity: pods/containers authenticate as specific service accounts
- Cross-service access: explicit authorization, not network-level trust

### Network Segmentation
- Firewall rules between tiers (web → app → data)
- Service mesh for fine-grained traffic policies
- Egress controls: restrict outbound traffic to known destinations
- Microsegmentation for zero-trust networking (if appropriate for security posture)

### Key Management
- Cloud KMS for encryption key management
- Separate keys per service/environment
- Key rotation: annual for encryption keys, immediate for compromised keys
- Hardware security modules (HSM) for highest security requirements
- Envelope encryption: encrypt data keys with master keys

### Encryption Standards
- At rest: AES-256 for all stored data (database, object storage, volumes)
- In transit: TLS 1.2+ (prefer 1.3) for all communication
- mTLS for service-to-service communication (where justified)
- Certificate management: automated renewal (Let's Encrypt, cert-manager)

### Hardening Baselines
- Minimal base images (distroless, Alpine)
- Non-root containers (drop all unnecessary capabilities)
- Immutable infrastructure: replace, don't patch
- Security benchmarks: CIS benchmarks for OS, containers, cloud services

### Vulnerability Scanning
- Container image scanning in CI (Trivy, Snyk Container, Anchore)
- Host/VM scanning on schedule (Nessus, Qualys)
- Infrastructure scanning (cloud misconfigurations): Prowler, ScoutSuite
- Remediation SLAs: critical 48h, high 7d, medium 30d, low 90d

### Security Monitoring and SIEM
- Centralized security event collection
- Alert on: unauthorized access attempts, privilege escalation, anomalous behavior
- Correlation: link related events across services and time
- Retention: 1 year minimum for compliance
- Regular review of detection rules and alert tuning

## Product Security

### Threat Modeling
- Identify assets (data, services, infrastructure)
- Identify threats (STRIDE: Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation)
- Identify trust boundaries (user ↔ frontend ↔ backend ↔ database ↔ external service)
- Prioritize: likelihood × impact = risk score
- Mitigate: apply controls for highest-risk threats first

### Secure Design Reviews
- Review architecture before implementation (cheaper to fix early)
- Focus on: auth/authz model, data flow, trust boundaries, crypto usage
- Output: threat model document, security requirements, risk acceptance

### Abuse Case Modeling
- Account takeover: credential stuffing, session hijacking, social engineering
- Spam and fraud: automated content creation, payment fraud, fake accounts
- Scraping and data harvesting: rate limiting, CAPTCHA, bot detection
- Privilege escalation: IDOR, parameter tampering, role manipulation
- Denial of service: API abuse, resource exhaustion, algorithmic complexity

### Privacy and Data Protection
- Data minimization: collect only what's needed
- Purpose limitation: use data only for stated purposes
- Retention limits: delete data when no longer needed
- User rights: export, deletion, correction (GDPR, CCPA)
- PII handling: encryption, access controls, audit logging
- Anonymization: remove identifying information for analytics

### Penetration Testing
- Annual external penetration test (third-party)
- Quarterly internal security assessment
- Scope: web app, API, infrastructure, social engineering
- Remediate findings with priority: critical → high → medium → low
- Re-test critical findings to verify fix

### Third-Party Risk
- Security assessment for all vendors handling sensitive data
- Review: SOC2 report, security policies, incident response capability
- Contractual requirements: data handling, breach notification, audit rights
- Ongoing monitoring: vendor security posture changes
- Exit strategy: data portability and deletion on contract termination

## Governance, Risk, and Compliance (GRC)

### Security Policies
- Acceptable use policy
- Data classification policy
- Incident response policy
- Access control policy
- Change management policy
- Review and update policies annually

### Compliance Frameworks
- **SOC 2**: trust service criteria (security, availability, confidentiality)
- **ISO 27001**: information security management system (ISMS)
- **PCI DSS**: payment card data protection
- **HIPAA**: healthcare data protection
- **GDPR**: EU data privacy
- Map controls to framework requirements (control matrix)

### Security Audits
- Internal audits: quarterly self-assessment against controls
- External audits: annual third-party audit for compliance certification
- Evidence collection: automate where possible (logs, configs, screenshots)
- Finding remediation: track to completion with deadlines and owners

### Risk Management
- Risk register: identified risks with likelihood, impact, mitigation status
- Risk appetite: define acceptable risk levels per category
- Risk review: quarterly assessment and reprioritization
- Residual risk acceptance: documented decision by appropriate authority

## Security Operations (SecOps)

### Security Event Monitoring
- Monitor: failed logins, privilege changes, data access anomalies, policy violations
- Baseline normal behavior to detect anomalies
- Alert triage: automated enrichment, severity classification, routing
- Response playbooks for common alert types

### Incident Response
- **Preparation**: tools, training, communication channels, runbooks
- **Detection**: monitoring, alerting, user reports
- **Containment**: isolate affected systems, preserve evidence
- **Eradication**: remove threat, patch vulnerability
- **Recovery**: restore services, validate integrity
- **Lessons learned**: blameless postmortem, action items, process improvements

### Vulnerability Management
- Continuous scanning: code, containers, infrastructure, dependencies
- Triage: assess exploitability, impact, and exposure
- Prioritize by risk (not just severity): is it internet-facing? does it handle sensitive data?
- SLA-driven remediation: critical 48h, high 7d, medium 30d
- Exception process: document accepted risk with expiry date and owner

### Security Training
- New hire security onboarding
- Annual security awareness training for all engineers
- Secure coding training for developers (language/framework specific)
- Incident response drills (tabletop exercises)
- Champions program: security advocates embedded in product teams
