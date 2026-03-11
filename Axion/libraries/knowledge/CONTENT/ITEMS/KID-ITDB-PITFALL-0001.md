---
kid: "KID-ITDB-PITFALL-0001"
title: "Missing indexes on high-traffic queries"
content_type: "reference"
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
legacy_path: "PILLARS/IT_END_TO_END/03_data_systems/databases/pitfalls/KID-ITDB-PITFALL-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Missing indexes on high-traffic queries

# Missing Indexes on High-Traffic Queries

## Summary
Failing to create appropriate indexes for high-traffic database queries is a common pitfall that can severely degrade application performance. This issue arises when queries frequently scan large datasets without leveraging indexes, leading to excessive CPU and I/O usage. Proper indexing is critical for scaling database performance and ensuring efficient query execution.

---

## When to Use
This topic applies in the following scenarios:
- Applications experiencing slow query performance or high database response times.
- Systems with high traffic to specific tables or queries, especially read-heavy workloads.
- Databases where query execution plans show frequent full table scans.
- Teams optimizing database performance for OLTP (Online Transaction Processing) systems or analytical workloads.

---

## Do / Don't

### Do:
- **Analyze query execution plans** to identify full table scans or missing index recommendations.
- **Use indexing best practices**, such as creating composite indexes for multi-column filters or joins.
- **Monitor query performance metrics**, such as execution time, CPU usage, and disk I/O.

### Don't:
- **Blindly create indexes** without analyzing their impact on write performance or storage costs.
- **Ignore database monitoring tools** that flag slow queries or suggest index improvements.
- **Over-index tables**, which can increase storage requirements and degrade write performance.

---

## Core Content

### The Mistake
Missing indexes occur when database queries rely on full table scans instead of leveraging indexes to efficiently locate data. This typically happens when developers or database administrators (DBAs) neglect to analyze query patterns or fail to anticipate how the database will scale under load. For example, a query filtering on a `WHERE` clause for a non-indexed column will cause the database to scan every row in the table, even when only a small subset of rows is relevant.

### Why People Make It
1. **Lack of awareness**: Developers may not fully understand how databases use indexes to optimize query performance.
2. **Premature optimization avoidance**: Teams may avoid adding indexes early in development, assuming they can address performance issues later.
3. **Evolving requirements**: As applications grow, query patterns may change, and previously adequate indexes may no longer suffice.
4. **Focus on writes**: In write-heavy systems, teams may avoid indexes to minimize write latency, inadvertently harming read performance.

### Consequences
- **Performance degradation**: Queries take significantly longer to execute, increasing application response times.
- **Increased resource consumption**: Full table scans consume excessive CPU and disk I/O, potentially impacting other database operations.
- **Scalability issues**: As data volume grows, the performance gap widens, leading to bottlenecks that limit system scalability.
- **Operational costs**: High resource usage can increase cloud database costs or require more powerful hardware.

### How to Detect It
1. **Query execution plans**: Use tools like `EXPLAIN` (MySQL/PostgreSQL) or `Query Store` (SQL Server) to identify full table scans and missing index recommendations.
2. **Database monitoring tools**: Tools like AWS RDS Performance Insights, Azure SQL Database Advisor, or third-party solutions (e.g., New Relic, Datadog) can flag slow queries and suggest indexes.
3. **High resource usage**: Monitor database metrics such as CPU utilization, disk I/O, and query execution time. Spikes in these metrics during high traffic often indicate missing indexes.

### How to Fix or Avoid It
1. **Add appropriate indexes**: For frequently used queries, create indexes on columns used in `WHERE`, `JOIN`, `GROUP BY`, or `ORDER BY` clauses. Use composite indexes for multi-column filters.
2. **Regularly review query performance**: Periodically analyze query execution plans and database performance metrics to identify new indexing opportunities.
3. **Automate index management**: Use database features like MySQL’s `Performance Schema`, PostgreSQL’s `pg_stat_statements`, or SQL Server’s `Database Engine Tuning Advisor` to identify and implement missing indexes.
4. **Balance indexing with write performance**: Avoid over-indexing by focusing only on high-impact queries. Use database partitioning or sharding if write performance is a concern.
5. **Test before deploying**: Validate new indexes in a staging environment to ensure they improve performance without negative side effects.

### Real-World Scenario
A retail e-commerce platform experienced severe slowdowns during peak shopping periods. The root cause was a query that filtered orders by `customer_id` and `order_date` on a 10-million-row `orders` table. Without an index on these columns, the query performed a full table scan, consuming 90% of the database’s CPU and delaying other critical operations. Adding a composite index on `(customer_id, order_date)` reduced query execution time from 15 seconds to under 200 milliseconds, restoring system performance.

---

## Links
- **Database Indexing Best Practices**: A guide to designing efficient indexes for relational databases.
- **Query Optimization Techniques**: Tips and strategies for improving SQL query performance.
- **Understanding Query Execution Plans**: How to interpret and act on execution plans in popular databases.
- **Database Monitoring Tools**: Overview of tools for monitoring and optimizing database performance.

---

## Proof / Confidence
This content is supported by industry best practices and widely accepted database optimization techniques. Tools like `EXPLAIN` and `Query Store` are standard for identifying missing indexes, and database vendors like Microsoft, Oracle, and PostgreSQL provide extensive documentation on index usage. Benchmarks consistently show that adding appropriate indexes can improve query performance by orders of magnitude, as evidenced by case studies from companies like Amazon, Netflix, and Uber.
