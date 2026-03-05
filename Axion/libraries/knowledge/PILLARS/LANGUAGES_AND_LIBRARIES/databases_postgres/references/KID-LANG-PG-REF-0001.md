---
kid: "KID-LANG-PG-REF-0001"
title: "Postgres Defaults Reference (practical)"
type: reference
pillar: LANGUAGES_AND_LIBRARIES
domains: [databases_postgres]
subdomains: []
tags: [postgres, defaults, config]
maturity: "reviewed"
use_policy: pattern_only
executor_access: internal_and_external
license: internal_owned
allowed_excerpt:
  max_words: 0
  max_lines: 0
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: axion
---

# Postgres Defaults Reference (practical)

# Postgres Defaults Reference (Practical)

## Summary
PostgreSQL comes with a set of default configurations optimized for general-purpose workloads. These defaults may not suit all use cases, especially high-performance or resource-constrained environments. This reference provides an overview of key Postgres defaults, their implications, and practical considerations for tuning.

## When to Use
- When setting up a new PostgreSQL instance and evaluating whether default configurations meet your workload requirements.
- When troubleshooting performance issues that may be tied to suboptimal default settings.
- When migrating to a new version of PostgreSQL, as defaults may change between versions.

## Do / Don't
### Do:
1. **Do evaluate `shared_buffers`**: Adjust this default (128MB) based on your system's memory; typically set to 25-40% of available RAM.
2. **Do monitor `work_mem`**: The default (4MB) may be too low for complex queries; increase it for workloads with large sorts or joins.
3. **Do configure `max_connections`**: The default (100) might be too high or low depending on your application's concurrency needs.

### Don’t:
1. **Don’t leave `fsync` off**: The default is `on` for data durability; disabling it risks data corruption during crashes.
2. **Don’t ignore `effective_cache_size`**: The default (4GB) may not reflect your system's available memory, impacting query planner decisions.
3. **Don’t overcommit `maintenance_work_mem`**: Default is 64MB; increasing it too much can lead to excessive memory usage during maintenance tasks.

## Core Content
### Key Defaults and Practical Considerations
Below are common PostgreSQL defaults and their implications:

| **Parameter**             | **Default Value**    | **Practical Notes**                                                                 |
|---------------------------|---------------------|-----------------------------------------------------------------------------------|
| `shared_buffers`          | 128MB               | Memory allocated for caching data blocks. Increase to 25-40% of system RAM for better performance. |
| `work_mem`                | 4MB                 | Memory per query operation (e.g., sort, hash join). Increase for complex queries but monitor memory usage. |
| `maintenance_work_mem`    | 64MB                | Memory for maintenance tasks (e.g., vacuum, index creation). Scale up for faster maintenance tasks. |
| `max_connections`         | 100                 | Maximum concurrent connections. Scale based on application needs and available resources. |
| `effective_cache_size`    | 4GB                 | Hint to the query planner about available OS-level cache. Set to ~50-75% of system RAM. |
| `autovacuum`              | `on`                | Ensures automatic vacuuming and analyze. Keep enabled to prevent table bloat. |
| `fsync`                   | `on`                | Ensures data durability. Disabling improves performance but risks data loss. |
| `wal_buffers`             | 16MB                | Memory for write-ahead log (WAL) buffers. Increase for high write workloads. |
| `checkpoint_timeout`      | 5min                | Frequency of checkpoints. Increase for write-heavy workloads to reduce I/O overhead. |
| `log_min_duration_statement` | -1 (disabled)    | Logs queries exceeding this duration. Enable and set a threshold for query performance debugging. |

### Practical Tuning Workflow
1. **Analyze Workload**: Use `pg_stat_activity`, `EXPLAIN`, and `pg_stat_statements` to understand query patterns and resource usage.
2. **Adjust Gradually**: Change one parameter at a time, benchmarking performance after each adjustment.
3. **Monitor Resource Utilization**: Use tools like `pg_top`, `htop`, or AWS/RDS monitoring dashboards to assess memory, CPU, and disk I/O.

### Common Pitfalls
- **Underestimating Memory Needs**: Low `work_mem` or `shared_buffers` can cause excessive disk I/O.
- **Overcommitting Connections**: High `max_connections` without sufficient resources leads to contention.
- **Ignoring Autovacuum**: Disabling autovacuum can cause severe table bloat and performance degradation.

## Links
- PostgreSQL Documentation: Configuration Parameters — Comprehensive list of all configuration options.
- PostgreSQL Performance Tuning Guide — Best practices for optimizing Postgres for various workloads.
- Query Performance Debugging in PostgreSQL — Techniques for identifying and resolving slow queries.
- Understanding Autovacuum — Explanation of autovacuum and its importance in PostgreSQL.

## Proof / Confidence
This reference is based on PostgreSQL's official documentation, industry best practices, and common tuning strategies observed in production environments. Defaults are designed for general-purpose use but require tuning for specific workloads, as evidenced by benchmarks and community recommendations.
