---
kid: "KID-ITSEC-PROCEDURE-0005"
title: "Access Review Procedure (who has what, why)"
type: "procedure"
pillar: "IT_END_TO_END"
domains:
  - "security_fundamentals"
subdomains: []
tags:
  - "security_fundamentals"
  - "procedure"
maturity: "reviewed"
use_policy: "pattern_only"
executor_access: "internal_and_external"
license: "internal_owned"
allowed_excerpt:
  max_words: 0
  max_lines: 0
supersedes: ""
deprecated_by: ""
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Access Review Procedure (who has what, why)

```markdown
# Access Review Procedure (who has what, why)

## Summary
This procedure outlines the steps to conduct an access review to ensure that users have appropriate access to systems, applications, and data based on their role and responsibilities. Access reviews are critical for maintaining security, compliance, and operational integrity by identifying and addressing unnecessary or unauthorized access.

## When to Use
- During periodic compliance audits (e.g., quarterly or annually).
- When onboarding or offboarding employees or contractors.
- After organizational changes, such as team restructuring or mergers.
- Following a security incident involving unauthorized access.
- To meet regulatory requirements, such as GDPR, HIPAA, or SOX.

## Do / Don't

### Do:
1. **Do** involve system owners, managers, and security teams in the review process.
2. **Do** document the justification for each user’s access to ensure traceability.
3. **Do** revoke or adjust access immediately if it is no longer required.

### Don't:
1. **Don't** delay acting on identified access issues; this increases security risks.
2. **Don't** assume that access rights are correct without verification.
3. **Don't** rely solely on automated tools; manual validation is often necessary.

## Core Content

### Prerequisites:
- Access to an up-to-date access control list (ACL) or identity management system.
- A defined list of roles, responsibilities, and associated access permissions.
- Approval from management or system owners to conduct the review.
- Knowledge of compliance requirements and organizational security policies.

### Procedure:
1. **Initiate the Review**  
   - Notify stakeholders (e.g., system owners, managers) of the upcoming access review.  
   - Define the scope: specify the systems, applications, and data to be reviewed.  
   - Expected Outcome: Stakeholders are informed, and the scope is clearly defined.  
   - Failure Mode: Stakeholders are not engaged, leading to incomplete reviews.

2. **Extract Access Data**  
   - Use identity and access management (IAM) tools to generate a report of current access permissions.  
   - Ensure the report includes user IDs, roles, access levels, and last access timestamps.  
   - Expected Outcome: A comprehensive access report is generated.  
   - Failure Mode: Outdated or incomplete access data due to misconfigured IAM tools.

3. **Validate Access**  
   - Compare each user’s access against their role and responsibilities.  
   - Identify discrepancies, such as excessive permissions or orphaned accounts.  
   - Collaborate with managers to confirm the necessity of each access.  
   - Expected Outcome: A list of valid and invalid access permissions is created.  
   - Failure Mode: Lack of manager input results in inaccurate validation.

4. **Remediate Issues**  
   - Revoke or modify access for users with excessive or unauthorized permissions.  
   - Document changes and communicate them to affected users.  
   - Expected Outcome: Access permissions are corrected and documented.  
   - Failure Mode: Delayed remediation leaves the system vulnerable.

5. **Document and Report**  
   - Summarize findings, actions taken, and any outstanding issues.  
   - Share the report with relevant stakeholders and archive it for compliance purposes.  
   - Expected Outcome: A complete and accessible record of the access review is created.  
   - Failure Mode: Incomplete documentation undermines audit readiness.

6. **Schedule the Next Review**  
   - Set a date for the next periodic access review based on organizational policies.  
   - Expected Outcome: A recurring review process is established.  
   - Failure Mode: No follow-up plan results in inconsistent access reviews.

## Links
- **Identity and Access Management Best Practices**: Guidance on managing user access securely and efficiently.  
- **Principle of Least Privilege**: A foundational security concept for access control.  
- **NIST SP 800-53**: Security and privacy controls for federal information systems.  
- **ISO/IEC 27001**: International standard for information security management.

## Proof / Confidence
This procedure aligns with industry standards, including the NIST Cybersecurity Framework and ISO 27001, which emphasize periodic access reviews as a critical control. Studies show that 74% of data breaches involve privileged access misuse, highlighting the importance of regular reviews. Additionally, this process is widely adopted in compliance frameworks such as SOX, HIPAA, and GDPR.
```
