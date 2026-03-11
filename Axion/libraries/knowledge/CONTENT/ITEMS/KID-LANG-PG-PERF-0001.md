---
kid: "KID-LANG-PG-PERF-0001"
title: "Slow Query Triage (EXPLAIN basics)"
content_type: "workflow"
primary_domain: "["
secondary_domains:
  - "d"
  - "a"
  - "t"
  - "a"
  - "b"
  - "a"
  - "s"
  - "e"
  - "s"
  - "_"
  - "p"
  - "o"
  - "s"
  - "t"
  - "g"
  - "r"
  - "e"
  - "s"
  - "]"
industry_refs: []
stack_family_refs:
  - "performance"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "p"
  - "o"
  - "s"
  - "t"
  - "g"
  - "r"
  - "e"
  - "s"
  - ","
  - " "
  - "p"
  - "e"
  - "r"
  - "f"
  - "o"
  - "r"
  - "m"
  - "a"
  - "n"
  - "c"
  - "e"
  - ","
  - " "
  - "e"
  - "x"
  - "p"
  - "l"
  - "a"
  - "i"
  - "n"
  - ","
  - " "
  - "s"
  - "l"
  - "o"
  - "w"
  - "-"
  - "q"
  - "u"
  - "e"
  - "r"
  - "i"
  - "e"
  - "s"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/databases_postgres/performance/KID-LANG-PG-PERF-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Slow Query Triage (EXPLAIN basics)

# Slow Query Triage (EXPLAIN Basics)

## Summary
This procedure outlines how to use PostgreSQL's `EXPLAIN` command to diagnose slow queries. By analyzing query execution plans, you can identify bottlenecks, optimize query performance, and improve database efficiency. This guide provides step-by-step instructions for triaging slow queries using `EXPLAIN`, including common pitfalls and troubleshooting tips.

## When to Use
- When a query takes significantly longer than expected to execute.
- When database performance degrades due to high query execution times.
- During routine query optimization or performance tuning tasks.
- When investigating resource-intensive queries causing high CPU or memory usage.

## Do / Don't

### Do:
1. Use `EXPLAIN ANALYZE` for detailed runtime statistics when testing in a non-production environment.
2. Ensure statistics are up-to-date by running `ANALYZE` or `VACUUM ANALYZE` on relevant tables.
3. Focus on key indicators in the execution plan, such as sequential scans, nested loops, and high-cost operations.

### Don't:
1. Run `EXPLAIN ANALYZE` on production systems without understanding its impact—it executes the query and may affect performance.
2. Ignore table indexes—missing or inefficient indexes are common causes of slow queries.
3. Assume that query optimization is complete after a single iteration—retest changes and validate improvements iteratively.

## Core Content

### Prerequisites
- PostgreSQL installed and accessible via a terminal or GUI (e.g., pgAdmin).
- Access to the database where the slow query is occurring.
- Basic familiarity with SQL and PostgreSQL query syntax.

### Procedure

#### Step 1: Identify the Slow Query
- **Action**: Locate the query causing performance issues. This may be from application logs, monitoring tools, or direct user feedback.
- **Expected Outcome**: You have the exact SQL query to analyze.
- **Common Failure Modes**: Misidentifying the query or focusing on a symptom rather than the root cause.

#### Step 2: Run `EXPLAIN`
- **Action**: Execute `EXPLAIN` followed by the query. Example:  
  ```sql
  EXPLAIN SELECT * FROM users WHERE age > 30;
  ```
- **Expected Outcome**: PostgreSQL returns the estimated execution plan, showing operations like sequential scans, index scans, and join methods.
- **Common Failure Modes**: Syntax errors in the query or lack of permissions to execute `EXPLAIN`.

#### Step 3: Analyze Key Metrics
- **Action**: Review the execution plan output. Focus on:  
  - **Cost**: Estimated time to execute the operation (e.g., `cost=0.00..123.45`).
  - **Rows**: Estimated number of rows processed.
  - **Node Type**: Operations like `Seq Scan`, `Index Scan`, `Hash Join`, etc.
- **Expected Outcome**: You identify potential bottlenecks, such as sequential scans on large tables or expensive join operations.
- **Common Failure Modes**: Misinterpreting the plan or overlooking critical nodes.

#### Step 4: Use `EXPLAIN ANALYZE` (Optional)
- **Action**: For runtime statistics, execute:  
  ```sql
  EXPLAIN ANALYZE SELECT * FROM users WHERE age > 30;
  ```
  This runs the query and provides actual execution times and row counts.
- **Expected Outcome**: You gain insights into runtime performance and discrepancies between estimated and actual costs.
- **Common Failure Modes**: Running this on production systems may impact performance.

#### Step 5: Optimize the Query
- **Action**: Based on the execution plan, apply optimizations such as:  
  - Adding or modifying indexes.
  - Rewriting the query to reduce complexity.
  - Breaking large queries into smaller ones.
- **Expected Outcome**: Improved execution plan with reduced costs and faster query performance.
- **Common Failure Modes**: Applying incorrect optimizations or failing to test changes thoroughly.

#### Step 6: Validate Improvements
- **Action**: Re-run `EXPLAIN` or `EXPLAIN ANALYZE` after making changes. Compare the new execution plan with the original.
- **Expected Outcome**: The optimized query shows lower costs, faster execution times, and fewer bottlenecks.
- **Common Failure Modes**: Over-optimizing queries, leading to unintended side effects such as increased complexity or reduced readability.

## Links
- PostgreSQL Documentation: Detailed explanation of `EXPLAIN` and `EXPLAIN ANALYZE`.
- Query Optimization Best Practices: Guidelines for improving SQL query performance.
- Indexing Strategies in PostgreSQL: How to create and manage efficient indexes.
- VACUUM and ANALYZE: Maintaining database health and accurate statistics.

## Proof / Confidence
The use of `EXPLAIN` and `EXPLAIN ANALYZE` is a widely accepted industry standard for query optimization in PostgreSQL. Benchmarks and case studies consistently demonstrate their effectiveness in identifying performance bottlenecks. PostgreSQL's official documentation and community forums provide extensive support for these practices.
