---
kid: "KID-ITCOST-CHECK-0001"
title: "Cost Baseline Checklist (monitoring + tagging)"
content_type: "checklist"
primary_domain: "platform_ops"
secondary_domains:
  - "finops_cost"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "f"
  - "i"
  - "n"
  - "o"
  - "p"
  - "s"
  - ","
  - " "
  - "b"
  - "a"
  - "s"
  - "e"
  - "l"
  - "i"
  - "n"
  - "e"
  - ","
  - " "
  - "m"
  - "o"
  - "n"
  - "i"
  - "t"
  - "o"
  - "r"
  - "i"
  - "n"
  - "g"
  - ","
  - " "
  - "t"
  - "a"
  - "g"
  - "g"
  - "i"
  - "n"
  - "g"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/04_platform_ops/finops_cost/checklists/KID-ITCOST-CHECK-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Cost Baseline Checklist (monitoring + tagging)

```markdown
# Cost Baseline Checklist (Monitoring + Tagging)

## Summary
This checklist provides actionable steps to establish and maintain a cost baseline for cloud resources by leveraging monitoring and tagging strategies. A cost baseline ensures clear visibility into resource usage and spending trends, enabling effective cost management and optimization. Following this checklist helps align with platform operations (platform_ops) and financial operations (finops_cost) best practices.

## When to Use
- When setting up a new cloud environment or onboarding a new project.
- During quarterly or monthly cost reviews to validate tagging compliance and spending alignment with budgets.
- Before implementing cost optimization strategies to ensure accurate cost tracking.
- After significant infrastructure changes (e.g., scaling, migrations, or new service rollouts).

## Do / Don't
### Do:
1. **Do implement mandatory tagging policies** for all cloud resources to ensure traceability and accountability.
2. **Do configure cost monitoring dashboards** to provide real-time visibility into spending trends and anomalies.
3. **Do establish automated alerts** for budget thresholds to prevent overspending.
4. **Do review and update tags regularly** to reflect organizational or project changes.
5. **Do enforce tagging compliance** via governance tools or policies to ensure consistent application.

### Don’t:
1. **Don’t allow untagged resources** to persist in your environment; they create blind spots in cost tracking.
2. **Don’t rely solely on manual tagging**; human error can lead to inconsistencies and gaps.
3. **Don’t ignore cost anomalies**; investigate and resolve them promptly to avoid budget overruns.
4. **Don’t skip periodic reviews** of your cost baseline, as resource usage and budgets evolve over time.
5. **Don’t use overly generic tags** (e.g., “miscellaneous”); they reduce the effectiveness of cost attribution.

## Core Content
### Tagging Checklist
1. **Define a Tagging Policy:**
   - Create a standardized tagging schema that includes key attributes such as `Environment` (e.g., Dev, Test, Prod), `Owner`, `Cost Center`, `Project`, and `Application`.
   - Document the policy and communicate it to all relevant teams.

2. **Enforce Tagging Compliance:**
   - Use cloud-native governance tools (e.g., AWS Config, Azure Policy, or Google Cloud Organization Policy) to enforce tagging rules.
   - Set up automated workflows to flag or prevent the deployment of untagged resources.

3. **Audit Tags Regularly:**
   - Schedule monthly or quarterly audits to identify untagged or incorrectly tagged resources.
   - Use cloud cost management tools (e.g., AWS Cost Explorer, Azure Cost Management, or GCP Billing Reports) to generate tagging compliance reports.

4. **Tagging Automation:**
   - Leverage Infrastructure as Code (IaC) tools (e.g., Terraform, CloudFormation) to apply consistent tags during resource provisioning.
   - Implement tagging scripts or APIs to retroactively apply tags to existing resources.

### Monitoring Checklist
1. **Enable Cost Monitoring:**
   - Activate cost management tools in your cloud provider’s console (e.g., AWS Budgets, Azure Cost Management, or GCP Billing).
   - Set up granular cost categories to track spending by tag, resource type, or account.

2. **Create Cost Dashboards:**
   - Build dashboards that provide a breakdown of costs by service, region, and tag.
   - Include visualizations for trends, anomalies, and projections.

3. **Set Budget Alerts:**
   - Define budget thresholds at the project, team, or organizational level.
   - Configure alerts to notify stakeholders when spending approaches or exceeds these thresholds.

4. **Monitor Resource Utilization:**
   - Track underutilized or idle resources (e.g., unused instances, overprovisioned storage) and take corrective actions.
   - Use cloud-native tools like AWS Trusted Advisor, Azure Advisor, or GCP Recommender for optimization recommendations.

### Validation and Reporting Checklist
1. **Validate Cost Baseline:**
   - Compare current spending against the established baseline to identify deviations.
   - Investigate significant cost increases or decreases to determine root causes.

2. **Generate Periodic Reports:**
   - Share cost reports with stakeholders to ensure transparency and accountability.
   - Include insights on cost-saving opportunities and upcoming budget risks.

3. **Review and Update Baseline:**
   - Adjust the baseline to reflect changes in business priorities, scaling, or new service adoption.
   - Document all updates to maintain an accurate historical record.

## Links
- **Cloud Tagging Best Practices**: Guidance on implementing effective tagging strategies for cloud resources.
- **Cost Management Tools Overview**: A comparison of cost tracking and optimization tools across major cloud providers.
- **Infrastructure as Code (IaC) for Tagging**: Best practices for automating tagging with Terraform, CloudFormation, or similar tools.
- **Cloud Governance Frameworks**: Standards and policies for managing cloud environments effectively.

## Proof / Confidence
This checklist is based on industry standards and best practices from leading cloud providers (AWS, Azure, GCP). Gartner research highlights tagging and cost monitoring as critical components of cloud cost management. Additionally, case studies from enterprises adopting FinOps principles demonstrate significant cost savings and improved accountability through effective tagging and monitoring strategies.
```
