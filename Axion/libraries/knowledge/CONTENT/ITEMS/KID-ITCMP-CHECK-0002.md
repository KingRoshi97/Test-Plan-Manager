---
kid: "KID-ITCMP-CHECK-0002"
title: "Deploy Readiness Checklist (health checks, rollbacks)"
content_type: "checklist"
primary_domain: "compute_virtualization"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "compute_virtualization"
  - "checklist"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/compute_virtualization/checklists/KID-ITCMP-CHECK-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Deploy Readiness Checklist (health checks, rollbacks)

```markdown
# Deploy Readiness Checklist (Health Checks, Rollbacks)

## Summary
This checklist ensures your application deployments are robust, reliable, and recoverable by verifying health checks and rollback mechanisms. It is designed to minimize downtime, reduce risks, and enable quick recovery in case of deployment issues. Follow this checklist to validate readiness before deploying to production.

## When to Use
- Before deploying any application or service to production.
- When implementing blue-green, canary, or rolling deployment strategies.
- For major updates, configuration changes, or infrastructure modifications.
- During incident recovery, to validate a rollback path.

## Do / Don't
### Do:
- **Do** implement automated health checks for all critical services.
- **Do** test rollback procedures in a staging environment before deploying.
- **Do** establish monitoring and alerting for deployment health.
- **Do** document and version your deployment and rollback plans.
- **Do** validate dependencies (e.g., databases, APIs) are healthy before deployment.

### Don't:
- **Don't** deploy without verifying health checks are functioning.
- **Don't** assume rollback will work without testing it.
- **Don't** ignore dependency status during deployment readiness checks.
- **Don't** disable monitoring or alerts during deployment.
- **Don't** rely solely on manual intervention for rollbacks.

## Core Content
### Pre-Deployment Health Checks
1. **Verify Service Health Checks**  
   - Ensure all critical services have automated health checks configured.  
   - Verify health checks include key metrics such as response time, error rates, and resource utilization.  
   - Rationale: Health checks detect issues early, reducing the risk of degraded performance or downtime.

2. **Test Health Check Endpoints**  
   - Confirm health check endpoints return accurate status (e.g., HTTP 200 for healthy services).  
   - Simulate failure scenarios to ensure health checks respond correctly.  
   - Rationale: Misconfigured health checks can lead to false positives or negatives, undermining deployment safety.

3. **Validate Dependency Readiness**  
   - Check that all dependencies (e.g., databases, third-party APIs) are operational.  
   - Verify version compatibility between services and dependencies.  
   - Rationale: Dependency failures are a common cause of deployment issues.

### Rollback Preparation
4. **Create Rollback Artifacts**  
   - Package and version the previous stable release for rollback.  
   - Store rollback artifacts in a secure, accessible location.  
   - Rationale: Quick access to rollback artifacts minimizes downtime.

5. **Test Rollback Procedures**  
   - Simulate a rollback in a staging environment, ensuring it restores the system to a stable state.  
   - Validate that rollback scripts or automation function as expected.  
   - Rationale: Untested rollback procedures may fail under pressure, prolonging outages.

6. **Document Rollback Triggers**  
   - Define clear criteria for initiating a rollback (e.g., error thresholds, performance degradation).  
   - Ensure the team understands when and how to trigger a rollback.  
   - Rationale: Ambiguity in rollback triggers can delay decision-making during critical incidents.

### Deployment Monitoring
7. **Set Up Real-Time Monitoring**  
   - Enable real-time monitoring for key performance indicators (KPIs) during deployment.  
   - Configure alerts for critical thresholds (e.g., CPU usage, error rates).  
   - Rationale: Monitoring provides immediate feedback on deployment health.

8. **Implement Deployment Logging**  
   - Ensure deployment logs capture all relevant events, including health check results and error messages.  
   - Centralize logs for easy access and analysis.  
   - Rationale: Detailed logs are essential for diagnosing and resolving deployment issues.

### Post-Deployment Validation
9. **Verify Post-Deployment Health**  
   - Confirm that all services pass health checks after deployment.  
   - Validate that KPIs remain within acceptable thresholds.  
   - Rationale: Post-deployment validation ensures the application is functioning as expected.

10. **Conduct a Post-Mortem for Rollbacks**  
    - If a rollback occurs, perform a post-mortem to identify root causes and improve processes.  
    - Update documentation and automation based on findings.  
    - Rationale: Continuous improvement reduces the likelihood of future issues.

## Links
- **Blue-Green Deployment Best Practices**: Guidance on minimizing downtime during deployments.  
- **Monitoring and Observability Standards**: Industry standards for application monitoring.  
- **Incident Management Playbook**: Steps to handle deployment-related incidents.  
- **CI/CD Pipeline Design**: Best practices for automating deployments and rollbacks.

## Proof / Confidence
- **Industry Standards**: Follows practices outlined in the DevOps Research and Assessment (DORA) reports.  
- **Benchmarks**: Aligns with metrics for deployment frequency and mean time to recovery (MTTR).  
- **Common Practice**: Used by leading organizations to ensure deployment reliability and minimize risks.  
```
