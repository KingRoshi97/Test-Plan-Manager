---
kid: "KID-ITCICD-PITFALL-0002"
title: "\"Green build\" but broken deploy"
content_type: "reference"
primary_domain: "software_delivery"
secondary_domains:
  - "ci_cd_devops"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "c"
  - "i"
  - "c"
  - "d"
  - ","
  - " "
  - "b"
  - "u"
  - "i"
  - "l"
  - "d"
  - ","
  - " "
  - "d"
  - "e"
  - "p"
  - "l"
  - "o"
  - "y"
  - ","
  - " "
  - "f"
  - "a"
  - "i"
  - "l"
  - "u"
  - "r"
  - "e"
  - "s"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/02_software_delivery/ci_cd_devops/pitfalls/KID-ITCICD-PITFALL-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# "Green build" but broken deploy

# "Green Build" but Broken Deploy

## Summary
A "green build" but broken deploy occurs when a Continuous Integration (CI) pipeline reports success (green status) for build and test stages, but the deployment process fails due to undetected issues. This pitfall often arises from insufficient integration between CI and Continuous Deployment (CD) stages, or inadequate testing of deployment-specific configurations. It can lead to delayed releases, customer-facing outages, and eroded trust in the delivery pipeline.

---

## When to Use
This pitfall is relevant in the following scenarios:
- Teams practicing CI/CD workflows with automated pipelines.
- Projects with separate CI (build/test) and CD (deploy) pipelines.
- Complex environments where deployment configurations differ from local or staging setups.
- Teams experiencing frequent deployment failures despite passing builds.

---

## Do / Don't

### Do:
1. **Do test deployment configurations during the CI phase** to ensure environment compatibility and avoid surprises during deployment.
2. **Do integrate deployment verification steps** (e.g., smoke tests) into your pipeline to validate successful deployments.
3. **Do maintain parity between environments** (e.g., dev, staging, production) to minimize environment-specific issues.

### Don't:
1. **Don't treat a green build as a guarantee of deployability.** A successful build doesn't validate the deployment process.
2. **Don't skip deployment-specific tests,** such as infrastructure validation or configuration checks.
3. **Don't rely solely on manual deployment verification.** This introduces human error and delays.

---

## Core Content
### The Mistake
A "green build" but broken deploy occurs when the CI pipeline passes all build and test stages, but the deployment process fails. This failure can stem from various issues, including:
- Missing or incorrect environment-specific configurations (e.g., database credentials, API keys).
- Incompatible infrastructure (e.g., mismatched runtime versions between staging and production).
- Deployment scripts or tools that are not tested as part of the CI pipeline.

This pitfall is common in teams that treat CI and CD as separate processes without ensuring end-to-end pipeline integration.

### Why People Make This Mistake
1. **Over-reliance on CI success:** Teams often equate a green build with a successful release, overlooking the deployment phase.
2. **Insufficient environment parity:** Differences between development, staging, and production environments can lead to undetected issues until deployment.
3. **Lack of deployment testing:** Deployment scripts, configurations, and infrastructure are often excluded from automated testing due to perceived complexity or time constraints.

### Consequences
- **Delayed releases:** Deployment failures require time-consuming troubleshooting and rework.
- **Customer impact:** Broken deployments can cause outages, degraded performance, or incorrect application behavior.
- **Pipeline distrust:** Frequent deployment failures erode confidence in the CI/CD pipeline, leading to more manual interventions and slower delivery.

### How to Detect It
1. **Monitor deployment success rates:** A high failure rate indicates gaps in your CI/CD pipeline.
2. **Analyze deployment logs:** Look for recurring issues related to environment configurations, infrastructure, or deployment scripts.
3. **Track lead time for changes:** If deployment failures significantly increase lead time, this pitfall may be a contributing factor.

### How to Fix or Avoid It
1. **Shift-left deployment testing:** Include deployment-specific tests, such as infrastructure validation and configuration checks, in the CI phase.
2. **Automate deployment verification:** Add smoke tests or health checks to the CD pipeline to validate deployments in real-time.
3. **Ensure environment parity:** Use tools like Docker or Infrastructure-as-Code (IaC) to standardize environments across development, staging, and production.
4. **Adopt canary or blue-green deployments:** These strategies allow for safe, incremental rollouts, reducing the risk of catastrophic failures.
5. **Implement CI/CD pipeline observability:** Use monitoring and alerting tools to detect and resolve deployment issues quickly.

### Real-World Scenario
A fintech company implemented CI/CD pipelines to accelerate feature delivery. While their CI pipeline consistently produced green builds, their production deployments frequently failed. Upon investigation, they discovered that their staging environment used a different database version than production, causing schema mismatches during deployment. By introducing environment parity through Docker containers and adding deployment-specific tests to their CI pipeline, they reduced deployment failures by 80% within three months.

---

## Links
- **Continuous Delivery Best Practices:** Guidance on integrating CI and CD for seamless delivery.
- **Infrastructure-as-Code (IaC):** Learn how IaC tools like Terraform or AWS CloudFormation can ensure environment consistency.
- **Blue-Green Deployment Strategy:** A deployment approach to minimize downtime and risk.
- **Pipeline Observability:** Techniques for monitoring and debugging CI/CD pipelines.

---

## Proof / Confidence
1. **Industry Standards:** Practices from the Accelerate State of DevOps Report emphasize the importance of end-to-end pipeline integration.
2. **Benchmarks:** High-performing teams with integrated CI/CD pipelines report 46x more frequent deployments and 7x lower failure rates (DORA metrics).
3. **Common Practice:** Deployment-specific testing and environment parity are widely adopted best practices in DevOps to ensure reliable software delivery.
