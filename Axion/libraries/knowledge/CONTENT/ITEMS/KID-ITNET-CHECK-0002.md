---
kid: "KID-ITNET-CHECK-0002"
title: "DNS Change Checklist (TTL, propagation, rollback)"
content_type: "checklist"
primary_domain: "networking"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "networking"
  - "checklist"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/networking/checklists/KID-ITNET-CHECK-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# DNS Change Checklist (TTL, propagation, rollback)

```markdown
# DNS Change Checklist (TTL, Propagation, Rollback)

## Summary
This checklist provides a step-by-step guide for making DNS changes, ensuring minimal disruption and smooth propagation. It covers critical aspects such as setting appropriate TTL values, monitoring propagation, and preparing rollback plans. Proper execution of these steps is essential to avoid downtime or misconfigurations.

## When to Use
- When updating DNS records (e.g., A, CNAME, MX, TXT, or NS records).
- During domain migrations or server infrastructure changes.
- When troubleshooting DNS-related issues requiring record modifications.
- Before implementing planned DNS failover or disaster recovery procedures.

## Do / Don't

### Do:
- **Do lower the TTL before making changes.** This reduces propagation time for updates.
- **Do verify DNS record changes in a staging environment.** Test thoroughly before applying to production.
- **Do monitor DNS propagation using multiple DNS resolvers.** Ensure changes are reflected globally.
- **Do document all changes.** Maintain a clear record of updates for troubleshooting and rollback.
- **Do prepare a rollback plan.** Ensure you can quickly revert changes if issues arise.

### Don't:
- **Don't make DNS changes during peak traffic hours.** This minimizes potential impact on users.
- **Don't set TTL values too low unless necessary.** Extremely low TTLs can increase DNS query load on your servers.
- **Don't rely on a single DNS resolver to confirm propagation.** Different resolvers may cache records for varying durations.
- **Don't forget to notify stakeholders of planned DNS changes.** Ensure all teams are aware of potential impacts.
- **Don't assume propagation is instant.** DNS updates can take time depending on TTL and resolver cache.

## Core Content

### Pre-Change Preparation
1. **Lower the TTL (Time to Live):**
   - Identify the DNS record(s) you plan to modify.
   - Reduce the TTL to a low value (e.g., 300 seconds) at least 24–48 hours before making changes. This ensures resolvers cache the record for a shorter duration, speeding up propagation.
   - Verify the updated TTL has propagated by querying multiple DNS resolvers (e.g., `dig` or `nslookup`).

2. **Backup Current DNS Records:**
   - Export the current DNS zone file or take screenshots of the DNS settings.
   - Store backups securely for rollback purposes.

3. **Plan for Rollback:**
   - Document the exact steps to revert changes.
   - Ensure you have access to the DNS management interface and permissions to make updates.

### Making the Change
4. **Update DNS Records:**
   - Modify the required DNS records (e.g., A, CNAME, MX).
   - Double-check all entries for typos or incorrect values.
   - Save changes and note the timestamp for tracking propagation.

5. **Verify Changes Locally:**
   - Use tools like `dig`, `nslookup`, or `host` to query the updated record.
   - Test resolution from your local machine and your DNS provider’s resolver.

### Post-Change Validation
6. **Monitor DNS Propagation:**
   - Use online tools (e.g., DNS propagation checkers) or query public resolvers (e.g., Google Public DNS, Cloudflare, OpenDNS) to confirm updates.
   - Allow up to 24–48 hours for full propagation, depending on the original TTL.

7. **Test Application/Service Functionality:**
   - Verify that applications or services relying on the updated DNS records function as expected.
   - Test from different geographic locations, if applicable.

8. **Notify Stakeholders:**
   - Communicate the successful completion of changes to relevant teams.
   - Provide a summary of the changes and any observed impacts.

### Rollback (if necessary)
9. **Revert to Backup:**
   - Restore the previous DNS record values from your backup.
   - Verify the rollback using local tools and resolvers.

10. **Increase TTL Post-Validation:**
    - Once changes are confirmed stable, increase the TTL to an appropriate value (e.g., 3600 seconds or higher) to reduce DNS query load.

## Links
- **Understanding TTL and DNS Propagation:** Overview of TTL and how it impacts DNS updates.
- **Using `dig` for DNS Troubleshooting:** Guide to querying DNS records with `dig`.
- **DNS Record Types Explained:** Detailed explanation of common DNS record types.
- **Best Practices for DNS Management:** Industry recommendations for reliable DNS operations.

## Proof / Confidence
This checklist aligns with industry best practices outlined by organizations such as ICANN and DNS providers like Cloudflare, AWS Route 53, and Google Cloud DNS. The steps reflect common operational procedures used by IT teams to ensure reliable DNS changes. Studies on DNS propagation and TTL behavior confirm the importance of lowering TTL before changes and monitoring propagation across resolvers.
```
