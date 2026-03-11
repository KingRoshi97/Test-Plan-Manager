---
kid: "KID-ITDB-PROCEDURE-0002"
title: "Slow Query Triage Procedure"
content_type: "workflow"
primary_domain: "data_systems"
secondary_domains:
  - "databases"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "databases"
legacy_path: "PILLARS/IT_END_TO_END/03_data_systems/databases/procedures/KID-ITDB-PROCEDURE-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Slow Query Triage Procedure

# Slow Query Triage Procedure

## Summary
This procedure outlines the step-by-step process for identifying, diagnosing, and resolving slow-running queries in database systems. It is designed to help database administrators (DBAs) and software engineers systematically address performance issues in a structured and efficient manner. By following this process, teams can minimize downtime, improve query performance, and maintain system reliability.

---

## When to Use
- When a database query is taking significantly longer than expected to execute.
- When slow queries are causing performance degradation in a production or staging environment.
- When monitoring tools or logs indicate high query execution times or resource consumption (e.g., CPU, memory, or I/O).
- During root cause analysis of database-related incidents or outages.

---

## Do / Don't

### Do:
1. **Do** use database monitoring tools (e.g., query profilers, APM tools) to gather metrics before making changes.
2. **Do** create a backup of the database or affected tables before running any potentially destructive commands.
3. **Do** analyze the query execution plan to identify bottlenecks such as full table scans or missing indexes.

### Don’t:
1. **Don’t** make changes to a production database without testing in a staging environment.
2. **Don’t** assume the issue is with the query alone; consider other factors like server resource contention or network latency.
3. **Don’t** skip documenting changes or findings during the triage process.

---

## Core Content

### Prerequisites
- Access to database monitoring tools (e.g., pgAdmin, MySQL Workbench, or cloud provider dashboards).
- Permissions to view query logs and execution plans.
- A basic understanding of SQL and database indexing.
- A staging environment for testing changes before applying them to production.

---

### Procedure

#### Step 1: Identify the Slow Query
- **Action:** Use database monitoring tools or logs to identify queries with high execution times. Look for patterns in query execution frequency and resource usage.
- **Expected Outcome:** A clear identification of the problematic query or queries.
- **Common Failure Modes:**
  - Logs are incomplete or inaccessible.
  - Monitoring tools are not configured to capture query performance metrics.

#### Step 2: Analyze the Query Execution Plan
- **Action:** Run the slow query with an `EXPLAIN` or `EXPLAIN ANALYZE` command to generate the execution plan.
- **Expected Outcome:** Identification of bottlenecks, such as full table scans, inefficient joins, or missing indexes.
- **Common Failure Modes:**
  - Execution plan is difficult to interpret without prior experience.
  - Query optimizations are limited by database configuration or schema design.

#### Step 3: Check for Indexing Issues
- **Action:** Verify that appropriate indexes exist for the columns used in `WHERE`, `JOIN`, and `ORDER BY` clauses. Create or update indexes as necessary.
- **Expected Outcome:** Improved query performance due to optimized index usage.
- **Common Failure Modes:**
  - Over-indexing can lead to slower write operations.
  - Index creation fails due to insufficient permissions or disk space.

#### Step 4: Optimize the Query
- **Action:** Rewrite the query to reduce complexity, such as limiting the number of joins, using subqueries, or applying filters earlier in the query.
- **Expected Outcome:** Reduced query execution time and resource consumption.
- **Common Failure Modes:**
  - Query rewrites introduce syntax errors or logical bugs.
  - Optimizations are ineffective due to underlying schema limitations.

#### Step 5: Monitor and Validate Changes
- **Action:** Test the optimized query in a staging environment and validate performance improvements. Deploy changes to production only after thorough testing.
- **Expected Outcome:** Verified performance improvements with no negative impact on database functionality.
- **Common Failure Modes:**
  - Performance improvements in staging do not translate to production due to differences in data volume or workload.
  - Changes inadvertently impact other queries or application behavior.

#### Step 6: Document Findings and Actions
- **Action:** Record the original query, identified bottlenecks, optimization steps, and results in a shared knowledge base or incident management system.
- **Expected Outcome:** A documented record of the triage process for future reference.
- **Common Failure Modes:**
  - Documentation is incomplete or not shared with relevant stakeholders.
  - Findings are not actionable for long-term improvements.

---

## Links
- **Query Optimization Best Practices**: A guide to writing efficient SQL queries and avoiding common pitfalls.
- **Database Indexing Fundamentals**: An overview of indexing strategies and their impact on query performance.
- **Monitoring Tools for Databases**: A comparison of popular database monitoring solutions.
- **Incident Management for Database Outages**: Best practices for handling database-related incidents.

---

## Proof / Confidence
This procedure is based on industry best practices for database performance tuning, including guidance from database vendors (e.g., PostgreSQL, MySQL, and Microsoft SQL Server). The steps align with recommendations from authoritative sources such as the "SQL Performance Explained" book and the AWS and Azure database optimization documentation. These practices have been validated in production environments across multiple industries.
