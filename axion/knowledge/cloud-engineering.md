# Cloud Engineering Best Practices

## Infrastructure Design

### Cloud Architecture
- Design for failure: every component can fail, plan for it
- Use managed services over self-hosted where possible (reduce operational burden)
- Multi-AZ deployment for high availability (minimum 2 availability zones)
- Region selection: proximity to users, data residency requirements, cost
- Infrastructure as code: all infrastructure defined in code (Terraform, Pulumi, CloudFormation)

### VPC and Network Design
- VPC per environment (dev, staging, production) for isolation
- Subnet strategy: public subnets (load balancers), private subnets (compute), isolated subnets (databases)
- NAT gateway for outbound internet from private subnets
- VPC peering or transit gateway for cross-VPC communication
- CIDR planning: avoid overlapping ranges, allow for growth

### Network Security
- Security groups: stateful firewall rules per resource (default deny, explicit allow)
- NACLs: stateless network-level rules for subnet boundaries
- WAF: web application firewall for edge protection (OWASP rules, bot mitigation)
- DDoS protection: cloud-native shielding (AWS Shield, CloudFlare)
- Private endpoints: access cloud services without traversing public internet

## Compute Strategy

### Compute Options
- **Containers (ECS/GKE/AKS)**: default for most workloads, portable, scalable
- **Serverless (Lambda/Cloud Functions)**: event-driven, variable traffic, cost per invocation
- **VMs (EC2/Compute Engine)**: legacy apps, specific OS needs, licensing constraints
- **Edge compute (Workers/Lambda@Edge)**: low-latency, geo-distributed processing

### Container Orchestration
- Use managed Kubernetes (EKS, GKE, AKS) or managed containers (ECS, Cloud Run)
- Pod sizing: set resource requests AND limits (prevent noisy neighbor)
- Horizontal Pod Autoscaler: scale based on CPU, memory, or custom metrics
- Health checks: liveness (restart if dead), readiness (don't route until ready)
- Rolling updates: maxSurge + maxUnavailable for zero-downtime deploys

### Serverless Patterns
- Function size: small, focused, single responsibility
- Cold start mitigation: provisioned concurrency, keep-warm, smaller bundles
- Timeout: set appropriate per function (15s for API, 5min for background processing)
- Concurrency limits: prevent runaway invocations (cost protection)
- Stateless: no in-function state, use external storage for persistence

## Storage Strategy

### Object Storage (S3/GCS/R2)
- Use for: static assets, user uploads, backups, data lake storage
- Lifecycle policies: transition to cheaper tiers (Infrequent Access → Glacier)
- Versioning: enable for critical buckets (recovery from accidental deletion)
- Encryption: server-side encryption by default (SSE-S3, SSE-KMS)
- Access control: bucket policies + IAM, never public unless explicitly needed

### Block Storage (EBS/Persistent Disk)
- Use for: database volumes, application data requiring file system access
- Snapshot strategy: daily snapshots, retain for 30 days
- Volume type selection: SSD for performance (gp3), HDD for throughput (st1)
- Encryption at rest: enabled by default

### Managed Databases
- **PostgreSQL (RDS/Cloud SQL/Neon)**: default relational database
- **DynamoDB/Firestore**: serverless NoSQL for simple key-value patterns
- **ElastiCache/Memorystore**: Redis for caching, sessions, rate limiting
- Multi-AZ: enabled for production databases (automatic failover)
- Automated backups: daily snapshots + continuous WAL archiving for point-in-time recovery

## Networking and Traffic

### Load Balancing
- Application Load Balancer (ALB/L7): HTTP routing, path-based routing, WebSocket support
- Network Load Balancer (NLB/L4): TCP/UDP, lowest latency, static IPs
- Health checks: configure interval, threshold, path appropriately
- SSL termination: at load balancer (offload from application)
- Connection draining: allow in-flight requests to complete during deployments

### CDN Strategy
- Place CDN in front of static assets and cacheable API responses
- TTL rules: long for hashed assets (1 year), short for HTML (5 min), none for dynamic
- Cache keys: include relevant headers/query params, exclude irrelevant ones
- Invalidation: path-based invalidation on deploy, or use content-hashed URLs
- Edge locations: coverage where your users are

### DNS Management
- Use managed DNS (Route 53, Cloud DNS, Cloudflare)
- Low TTL (300s) for records that may change during deployments
- Health-check-based DNS failover for disaster recovery
- Alias/CNAME records for cloud resources (avoid hardcoded IPs)

## Identity and Access Management (IAM)

### Principles
- Principle of least privilege: minimal permissions for each role/service
- Use roles/groups, not individual user policies
- Separate human access (SSO + MFA) from service access (IAM roles, service accounts)
- Review permissions quarterly: remove unused, tighten overly broad

### Service Identity
- Use IAM roles for service-to-service authentication (not API keys in env vars)
- Workload identity for Kubernetes pods (IRSA on AWS, Workload Identity on GCP)
- Rotate service credentials automatically
- No shared credentials between services

### Access Patterns
- Admin access: MFA required, time-limited sessions, audit logged
- Developer access: read-only production, write access to dev/staging
- CI/CD access: scoped to deployment operations only
- Emergency access: break-glass procedure with audit trail

## High Availability and Disaster Recovery

### HA Design
- Multi-AZ for all stateful services (databases, caches, queues)
- Stateless compute: auto-scaling group across AZs
- No single points of failure: every component has redundancy
- Automated failover: database failover, load balancer health checks

### Disaster Recovery Strategies
| Strategy | RPO | RTO | Cost |
|----------|-----|-----|------|
| Backup and restore | Hours | Hours | Lowest |
| Pilot light | Minutes | Minutes-Hours | Low |
| Warm standby | Seconds-Minutes | Minutes | Medium |
| Active-active | Near-zero | Near-zero | Highest |
- Choose based on business requirements (RPO/RTO targets)
- Test DR procedures at least annually (don't just plan, drill)

### Backup Strategy
- Automated backups: daily for databases, continuous for critical data
- Point-in-time recovery: enable WAL archiving for databases
- Cross-region backup replication for DR
- Retention: 30 days standard, longer for compliance requirements
- Regular restore testing: verify backups are actually usable

## Infrastructure as Code (IaC)

### IaC Tools
- **Terraform**: multi-cloud, largest community, HCL language
- **Pulumi**: multi-cloud, general-purpose languages (TypeScript, Python, Go)
- **CloudFormation/CDK**: AWS-only, tight integration, CDK uses TypeScript/Python
- Choose based on: cloud provider, team language skills, ecosystem needs

### IaC Practices
- Version control all infrastructure code (same repo or dedicated infra repo)
- State management: remote state (S3, GCS) with locking (DynamoDB, GCS)
- Module structure: reusable modules for common patterns (VPC, database, service)
- Environment separation: use workspaces or directory structure per environment
- Plan before apply: always review changes before applying
- Drift detection: periodic check that infrastructure matches code

### IaC Security
- Secret management: never store secrets in IaC code (use vault references)
- Policy enforcement: validate IaC changes against security policies (Sentinel, OPA)
- Access control: restrict who can apply changes (CI/CD pipeline, not individuals)
- Audit trail: all changes tracked in version control and state history

## Autoscaling Strategy

### Horizontal Autoscaling
- Scale based on: CPU utilization, request count, queue depth, custom metrics
- Scale-out fast, scale-in slow (buffer to prevent flapping)
- Minimum instances: at least 2 for availability
- Maximum instances: set ceiling to prevent runaway costs
- Warm-up period: exclude newly launched instances from metrics until ready

### Queue-Based Scaling
- Scale workers based on queue depth (more messages → more workers)
- Target: process queue within SLA timeframe
- Scale to zero during idle periods (cost optimization)
- Alert on sustained queue growth (scaling may not be keeping up)

### Scheduled Scaling
- Pre-scale for known traffic patterns (morning ramp, marketing campaigns)
- Scale down during off-peak hours (nights, weekends if applicable)
- Combine with reactive scaling (scheduled baseline + auto-scale for spikes)

## Cost Optimization

### Cost Visibility
- Tag all resources: team, service, environment, cost center
- Per-service cost dashboards: track spend over time
- Anomaly detection: alert on unexpected cost increases
- Monthly cost review with team leads

### Cost Reduction Strategies
- Right-sizing: match instance types to actual usage (CPU, memory)
- Reserved capacity: commit to 1-3 year terms for predictable workloads (40-70% savings)
- Spot/preemptible instances: for fault-tolerant batch workloads (60-90% savings)
- Auto-scaling: scale down during low traffic periods
- Cleanup: terminate unused resources, delete old snapshots, expire old artifacts
- Storage tiering: move cold data to cheaper tiers automatically

### FinOps Practices
- Budget alerts per team/service (80% and 100% thresholds)
- Showback/chargeback: attribute costs to consuming teams
- Architecture review for cost efficiency (is serverless cheaper? is caching reducing compute?)
- Regular savings plan evaluation and right-sizing reviews

## Monitoring and Observability

### SLOs/SLIs and Reliability Targets
- Define SLIs: metrics that indicate service health (latency, error rate, throughput)
- Define SLOs: targets for SLIs (99.9% availability, p99 latency < 500ms)
- Error budget: allowed failure before action is required (0.1% = ~43 min/month)
- Burn rate alerts: alert when error budget is being consumed too quickly

### Observability Implementation
- Logging: structured JSON, centralized aggregation, correlation IDs
- Metrics: RED method (rate, errors, duration) for every service
- Tracing: distributed tracing across service boundaries (OpenTelemetry)
- Dashboards: per-service, per-team, executive summary
- Runbooks: document response procedures for every alert

### Incident Management
- On-call rotation: fair distribution, clear escalation paths
- Incident response process: detect → triage → mitigate → resolve → postmortem
- Communication: status page for external users, incident channel for internal teams
- Postmortem: blameless, focus on systemic improvements, action items tracked to completion

## Compliance and Governance

### Audit Logging
- Enable cloud trail/audit log for all API calls
- Centralize audit logs in tamper-proof storage
- Retention: minimum 1 year for compliance (SOC2, ISO 27001)
- Alert on suspicious activity (root account login, security group changes)

### Data Protection
- Encryption at rest: enabled by default for all storage (databases, object storage, volumes)
- Encryption in transit: TLS 1.2+ for all communication
- Key management: cloud KMS with rotation, separate keys per service/environment
- Data classification: identify PII, PHI, financial data — apply appropriate controls

### Network Compliance
- Ingress/egress controls: explicit allow rules, default deny
- Private connectivity: VPN or private link for sensitive traffic
- Data residency: ensure data stays in required regions (GDPR, HIPAA)
- Regular security assessments: penetration testing, vulnerability scanning
