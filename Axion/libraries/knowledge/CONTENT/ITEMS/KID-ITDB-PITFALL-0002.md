---
kid: "KID-ITDB-PITFALL-0002"
title: "Migration locks that take prod down"
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
legacy_path: "PILLARS/IT_END_TO_END/03_data_systems/databases/pitfalls/KID-ITDB-PITFALL-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Migration locks that take prod down

# Migration Locks That Take Prod Down

## Summary

Database schema migrations can inadvertently lock critical tables, causing production outages. This pitfall often occurs when migrations are executed without considering their impact on live systems. Understanding the risks, planning migrations carefully, and adhering to best practices can prevent downtime and ensure system reliability.

---

## When to Use

This guidance applies when:

- Executing schema migrations on production databases.
- Modifying large tables or high-traffic tables.
- Running migrations on databases with strict uptime requirements.
- Using database systems that enforce locks during schema changes (e.g., MySQL, PostgreSQL).

---

## Do / Don't

### Do:
1. **Test migrations in a staging environment** that mirrors production traffic and data volume.
2. **Use online schema change tools** (e.g., pt-online-schema-change for MySQL or pg_repack for PostgreSQL) for non-blocking migrations.
3. **Break large migrations into smaller steps** to reduce lock duration and risk.

### Don't:
1. **Run migrations during peak traffic hours** without scheduling and coordination.
2. **Ignore database-specific locking behaviors** when designing schema changes.
3. **Assume small or simple changes are safe** without testing their impact on production.

---

## Core Content

### The Mistake

Database schema migrations often require altering tables, adding indexes, or modifying constraints. In many relational database systems, these operations can place locks on the affected tables. These locks prevent reads and writes until the migration completes. If the migration takes too long, it can block application queries, leading to cascading failures and downtime.

This issue is particularly dangerous when working with large tables or high-traffic databases. For example, adding a column with a default value to a table with millions of rows can result in a full table scan and lock, bringing the application to a halt.

### Why People Make It

1. **Lack of Awareness**: Engineers may not fully understand the locking behavior of their database system.
2. **Time Pressure**: Teams may rush migrations without proper testing or scheduling.
3. **Overconfidence**: Small or seemingly simple changes are assumed to be safe without considering their impact on production workloads.

### Consequences

- **Production Downtime**: Locked tables prevent application queries from executing, leading to outages.
- **Lost Revenue**: Downtime can result in financial losses, especially for customer-facing applications.
- **Customer Impact**: Users may experience failed requests, slow performance, or complete unavailability.
- **Operational Overhead**: Emergency rollback or troubleshooting during an outage increases stress and workload.

### How to Detect It

1. **Monitor Database Metrics**: Sudden spikes in query latency or lock wait times can indicate an ongoing migration issue.
2. **Application Logs**: Look for errors related to timeouts or database unavailability.
3. **Database Lock Queries**: Use database-specific commands to inspect active locks (e.g., `SHOW ENGINE INNODB STATUS` in MySQL or `pg_locks` in PostgreSQL).

### How to Fix or Avoid It

#### Fixing an Ongoing Issue:
1. **Kill the Migration Query**: Identify and terminate the problematic migration query to release the lock.
2. **Restart Affected Services**: If cascading failures occur, restart impacted application services to restore functionality.
3. **Analyze the Root Cause**: Review the migration script and database logs to understand what went wrong.

#### Avoiding the Issue:
1. **Use Online Schema Change Tools**: Tools like pt-online-schema-change (MySQL) or pg_repack (PostgreSQL) perform schema changes in a non-blocking manner by creating a shadow table and swapping it in.
2. **Plan Migrations During Maintenance Windows**: Schedule changes during low-traffic periods to minimize impact.
3. **Test on Staging**: Run migrations on a staging environment with production-like data and traffic patterns to identify potential issues.
4. **Break Down Changes**: Instead of a single large migration, split it into smaller steps that can be executed incrementally.
5. **Leverage Database Features**: Some databases offer non-blocking schema change options (e.g., `ALTER TABLE ... ADD COLUMN` with `LOCK=NONE` in MySQL 8.0+).

### Real-World Scenario

A retail company running an e-commerce platform decided to add a new column with a default value to their `orders` table during peak shopping hours. The table contained millions of rows, and the database (MySQL 5.7) locked the entire table while applying the change. Within seconds, the application started timing out, leading to a complete outage. Customers were unable to place orders, resulting in significant revenue loss.

To recover, the engineering team had to kill the migration query and restart application services. They later implemented a safer migration strategy using pt-online-schema-change, which allowed them to add the column without locking the table.

---

## Links

- **Online Schema Change Tools**: Learn about tools like pt-online-schema-change and pg_repack for non-blocking migrations.
- **Database Locking Behavior**: Understand how different databases handle schema changes and table locks.
- **Testing Migrations in Staging**: Best practices for testing database migrations in a staging environment.
- **Breaking Down Schema Changes**: Strategies for incremental and safe database schema changes.

---

## Proof / Confidence

This guidance is based on well-documented database behavior and industry best practices. Tools like pt-online-schema-change and pg_repack are widely used and recommended by database administrators to avoid downtime during schema changes. Real-world incidents, such as the GitHub outage caused by a migration lock in 2012, highlight the importance of careful migration planning. Additionally, database vendors like MySQL and PostgreSQL provide documentation on locking behaviors and non-blocking schema change options.
