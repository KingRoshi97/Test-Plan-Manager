<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:cloud -->
<!-- AXION:PREFIX:cloud -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Cloud — AXION Module Template (Blank State)

**Module slug:** `cloud`  
**Prefix:** `cloud`  
**Description:** Cloud infrastructure, scaling, and hosting

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:CLOUD_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the cloud module.
"Owns" = cloud infrastructure provisioning, IAM policies, network topology, compute/storage configuration, cost management, disaster recovery.
"Does NOT own" = CI/CD pipelines (devops module), application deployment logic (devops module), application code (all other modules), security policies (security module).
Common mistake: conflating cloud with devops — cloud owns infrastructure; devops owns the pipeline that deploys to that infrastructure. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:CLOUD_ARCH -->
## Cloud Architecture
<!-- AGENT: Derive from REBS §1 stack selection for cloud provider and architecture module deployment topology.
Account structure = how cloud accounts/projects are organized (per-environment, per-team, shared), billing separation.
Network topology = VPC/VNet layout, subnet design (public/private), security groups, NAT/egress strategy, DNS configuration.
Common mistake: single-account setup for all environments — at minimum separate production from non-production for blast radius isolation. -->
- Account/project structure: [TBD]
- Network topology (VPC/VNet, subnets): [TBD]


<!-- AXION:SECTION:CLOUD_ID -->
## Identity & Access (IAM)
<!-- AGENT: Derive from RPBS §8 Security & Compliance and security module policies for access control.
Roles and policies = IAM roles per service/team (least-privilege), policy naming conventions, permission boundaries.
Workload identity = how services authenticate to cloud resources (service accounts, workload identity federation, instance profiles) — no long-lived credentials.
Common mistake: using shared service accounts across services — each service should have its own identity with minimal permissions. -->
- Roles and policies: [TBD]
- Workload identity: [TBD]


<!-- AXION:SECTION:CLOUD_COMPUTE -->
## Compute & Runtime
<!-- AGENT: Derive from REBS §1 stack selection and RPBS §7 Non-Functional Profile for scaling requirements.
Compute types = what runs the application (containers/Kubernetes, serverless functions, VMs, managed services) with justification.
Autoscaling = scaling metric (CPU, memory, request count, queue depth), min/max instances, scale-up/scale-down thresholds, cool-down periods.
Common mistake: not setting maximum scaling limits — unbounded autoscaling can lead to runaway costs during traffic spikes or attacks. -->
- Compute type(s): [TBD]
- Autoscaling rules: [TBD]


<!-- AXION:SECTION:CLOUD_STORAGE -->
## Storage & Data Services
<!-- AGENT: Derive from database module for database hosting and RPBS §13 for media/upload storage.
Storage systems = databases (managed vs self-hosted), object storage (S3/GCS), file systems, caching (Redis/Memcached) — each with purpose and tier.
Encryption/KMS = encryption at rest (default vs customer-managed keys), key rotation policy, KMS access controls.
Common mistake: using default encryption keys without rotation — customer-managed keys with rotation provide stronger security posture. -->
- Storage systems used: [TBD]
- Encryption/KMS: [TBD]


<!-- AXION:SECTION:CLOUD_DR -->
## Resilience & DR
<!-- AGENT: Derive from RPBS §7 Non-Functional Profile for availability requirements.
RPO/RTO = Recovery Point Objective (max data loss) and Recovery Time Objective (max downtime) per service tier.
Backup/restore = backup frequency, retention period, restore testing cadence, cross-region replication for critical data.
Common mistake: defining RPO/RTO without testing restore procedures — backup plans are worthless without verified restore capability. -->
- RPO/RTO targets: [TBD]
- Backup/restore plan: [TBD]


<!-- AXION:SECTION:CLOUD_COST -->
## Cost Controls
<!-- AGENT: Define cloud cost management strategy aligned with business constraints.
Budgeting = monthly budget per environment, alert thresholds (80%/90%/100% of budget), anomaly detection for unexpected cost spikes.
Cost allocation tags = mandatory tags on all resources (environment, team, service, cost-center) for attribution and chargeback.
Common mistake: not tagging resources from day one — retroactive tagging is painful; enforce tagging policy via IaC and CI checks. -->
- Budgeting/alerts: [TBD]
- Cost allocation tags: [TBD]


<!-- AXION:SECTION:CLOUD_ACCEPTANCE -->
## Acceptance Criteria
- [ ] Topology documented
- [ ] IAM model documented
- [ ] DR targets specified


<!-- AXION:SECTION:CLOUD_OPEN_QUESTIONS -->
## Open Questions
<!-- AGENT: Capture unresolved cloud infrastructure decisions or missing upstream information.
Each question should reference which upstream source is needed (e.g., "Awaiting REBS §1 for cloud provider selection").
Common mistake: leaving questions vague — each should be specific and actionable. -->
- [TBD]
