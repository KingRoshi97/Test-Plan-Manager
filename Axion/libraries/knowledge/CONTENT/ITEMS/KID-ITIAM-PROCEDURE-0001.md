---
kid: "KID-ITIAM-PROCEDURE-0001"
title: "Access Review Procedure (IAM-focused)"
content_type: "workflow"
primary_domain: "platform_ops"
secondary_domains:
  - "identity_access_management"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "i"
  - "a"
  - "m"
  - ","
  - " "
  - "a"
  - "c"
  - "c"
  - "e"
  - "s"
  - "s"
  - "-"
  - "r"
  - "e"
  - "v"
  - "i"
  - "e"
  - "w"
  - ","
  - " "
  - "c"
  - "o"
  - "m"
  - "p"
  - "l"
  - "i"
  - "a"
  - "n"
  - "c"
  - "e"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/04_platform_ops/identity_access_management/procedures/KID-ITIAM-PROCEDURE-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Access Review Procedure (IAM-focused)

```markdown
# Access Review Procedure (IAM-focused)

## Summary
This procedure outlines the step-by-step process for conducting an access review in an Identity and Access Management (IAM) system. It ensures that user permissions align with organizational policies and security standards, reducing the risk of unauthorized access. This is a critical component of IT end-to-end governance.

## When to Use
- Quarterly, as part of routine compliance audits.
- Following organizational changes, such as employee onboarding, offboarding, or role changes.
- After a security incident to verify access integrity.
- During preparation for external compliance audits (e.g., SOC 2, ISO 27001).

## Do / Don't
### Do:
1. **Do** ensure you have the latest user and role data before starting the review.
2. **Do** involve relevant stakeholders, such as team leads and compliance officers, for context on user roles.
3. **Do** document all changes made during the review for audit purposes.

### Don't:
1. **Don't** assume that existing permissions are correct without verification.
2. **Don't** make changes without approval from the appropriate authority.
3. **Don't** overlook service accounts or non-human identities during the review.

## Core Content

### Prerequisites
- **Access to IAM System:** Ensure you have administrator or auditor-level access to the IAM platform.
- **Updated User Directory:** Obtain the latest user directory and role definitions from HR or the directory service (e.g., Active Directory, Azure AD).
- **Policy Documents:** Have access to the organization's access control policies and compliance requirements.
- **Stakeholder Availability:** Confirm availability of team leads or role owners for consultation.

---

### Procedure

#### Step 1: Export Current Access Data
- **Action:** Export a list of all users, roles, and permissions from the IAM system.
- **Expected Outcome:** A comprehensive report showing user-role mappings and assigned permissions.
- **Common Failure Modes:**
  - **Issue:** Export fails or times out.
  - **Resolution:** Verify IAM system connectivity and retry. Escalate to platform support if necessary.

#### Step 2: Validate User Roles
- **Action:** Cross-check user roles against the organization's role definitions and policies.
- **Expected Outcome:** Identification of users with roles that do not align with their job functions.
- **Common Failure Modes:**
  - **Issue:** Role definitions are outdated or unclear.
  - **Resolution:** Consult HR or compliance teams to clarify role definitions.

#### Step 3: Review High-Risk Permissions
- **Action:** Identify and review users with high-risk permissions (e.g., admin access, data export privileges).
- **Expected Outcome:** Confirmation that high-risk permissions are assigned only to authorized personnel.
- **Common Failure Modes:**
  - **Issue:** High-risk permissions are assigned to inactive or unauthorized users.
  - **Resolution:** Revoke permissions immediately and document the change.

#### Step 4: Engage Stakeholders
- **Action:** Share findings with team leads or role owners for validation.
- **Expected Outcome:** Stakeholder confirmation of the appropriateness of user permissions.
- **Common Failure Modes:**
  - **Issue:** Stakeholders are unavailable or unresponsive.
  - **Resolution:** Escalate to management or proceed with documented justifications.

#### Step 5: Implement Changes
- **Action:** Update user roles and permissions in the IAM system based on the review findings.
- **Expected Outcome:** Permissions align with organizational policies and security standards.
- **Common Failure Modes:**
  - **Issue:** Errors during updates cause access disruptions.
  - **Resolution:** Test changes in a staging environment before applying them to production.

#### Step 6: Document and Report
- **Action:** Document all changes made, including justifications and stakeholder approvals. Generate an access review report for audit purposes.
- **Expected Outcome:** A complete audit trail of the access review process.
- **Common Failure Modes:**
  - **Issue:** Incomplete documentation.
  - **Resolution:** Use a standardized template to ensure consistency.

---

## Links
- **IAM Best Practices:** Guidance on implementing and maintaining IAM systems effectively.
- **Role-Based Access Control (RBAC):** Overview of RBAC principles and implementation strategies.
- **SOC 2 Compliance Framework:** Details on access control requirements for SOC 2 audits.
- **Incident Response Guidelines:** Steps to follow when unauthorized access is detected.

## Proof / Confidence
This procedure is based on industry standards such as NIST SP 800-53 (Access Control) and ISO 27001 Annex A.9 (Access Control). It aligns with best practices recommended by leading IAM providers, including AWS IAM, Azure AD, and Okta. Regular access reviews are a common requirement for compliance frameworks like SOC 2, HIPAA, and PCI DSS.
```
