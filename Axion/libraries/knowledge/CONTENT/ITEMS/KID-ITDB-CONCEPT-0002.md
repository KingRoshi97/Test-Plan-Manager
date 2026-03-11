---
kid: "KID-ITDB-CONCEPT-0002"
title: "Indexing Basics (why queries are slow)"
content_type: "concept"
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
legacy_path: "PILLARS/IT_END_TO_END/03_data_systems/databases/concepts/KID-ITDB-CONCEPT-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Indexing Basics (why queries are slow)

# Indexing Basics (Why Queries Are Slow)

## Summary

Indexes are critical structures in databases that improve query performance by enabling faster data retrieval. Without proper indexing, queries can become slow and inefficient, especially as data volume grows. Understanding indexing basics helps software engineers optimize database performance and ensure scalability in data systems.

---

## When to Use

- **Large datasets**: When working with tables containing millions of rows, indexing is essential to avoid full table scans.
- **Frequent queries**: For columns frequently used in `WHERE`, `JOIN`, `ORDER BY`, or `GROUP BY` clauses, indexes can drastically improve performance.
- **Slow query execution**: When queries consistently take longer than expected, lack of indexing or poorly designed indexes may be the issue.
- **High read-to-write ratio**: In systems where reads dominate over writes, indexing can improve read efficiency without significantly impacting write performance.

---

## Do / Don't

### Do:
1. **Index columns used in filtering**: Create indexes on columns frequently used in `WHERE` clauses to reduce query execution time.
2. **Use composite indexes wisely**: For queries filtering by multiple columns, create composite indexes that match the query's filter order.
3. **Monitor index performance**: Regularly analyze query execution plans to ensure indexes are being utilized effectively.

### Don't:
1. **Over-index**: Avoid creating indexes on every column, as this can increase storage overhead and slow down write operations.
2. **Ignore maintenance**: Failing to update or rebuild indexes can lead to fragmentation and degraded performance over time.
3. **Index rarely queried columns**: Indexing columns that are seldom used in queries wastes resources and provides no real benefit.

---

## Core Content

### What Is Indexing?

An index is a specialized data structure that allows a database to locate specific rows in a table more efficiently. Think of an index as a "lookup table" that maps key values (e.g., column data) to the corresponding rows in a table. Common types of indexes include **B-tree indexes**, **hash indexes**, and **bitmap indexes**.

Without indexes, databases must perform a **full table scan**—examining every row in the table—to find matching data. This process becomes increasingly time-consuming as the dataset grows.

### Why Queries Are Slow Without Indexes

When a query lacks an appropriate index, the database engine resorts to scanning the entire table to find matching rows. For example, consider the query:

```sql
SELECT * FROM employees WHERE department = 'Engineering';
```

If the `department` column is not indexed, the database must check every row in the `employees` table to find matches. For a table with 10 million rows, this process can take seconds or even minutes, depending on the system's hardware and workload.

Indexes reduce this overhead by creating a shortcut. For a B-tree index on the `department` column, the database can quickly navigate the tree structure to find rows matching 'Engineering,' bypassing irrelevant rows entirely.

### Practical Example: Composite Indexes

Consider a query that filters by multiple columns:

```sql
SELECT * FROM orders WHERE customer_id = 123 AND order_date = '2023-01-01';
```

A composite index on `(customer_id, order_date)` allows the database to efficiently locate rows matching both conditions. Without this index, the database might use separate indexes for `customer_id` and `order_date`, resulting in less efficient execution.

### Trade-offs of Indexing

While indexes improve read performance, they come with trade-offs:
- **Storage overhead**: Indexes consume additional disk space.
- **Write performance impact**: Insert, update, and delete operations take longer because indexes must be updated.
- **Maintenance**: Fragmentation can occur over time, requiring periodic index rebuilding.

### Broader Context in Data Systems

Indexing is a foundational concept in database optimization and plays a critical role in ensuring scalability. In distributed systems, indexing strategies may differ—for example, NoSQL databases like MongoDB use different indexing mechanisms than relational databases like PostgreSQL. Understanding indexing is essential for designing performant data systems across various architectures.

---

## Links

- **Query Execution Plans**: Learn how to analyze query plans to determine if indexes are being utilized effectively.
- **Index Types**: Explore the differences between B-tree, hash, and bitmap indexes, and their use cases.
- **Database Normalization**: Understand how schema design impacts indexing and query performance.
- **Partitioning vs Indexing**: Compare partitioning and indexing as strategies for optimizing large datasets.

---

## Proof / Confidence

- **Industry standards**: Indexing is a core feature of all major relational database systems (e.g., MySQL, PostgreSQL, SQL Server, Oracle).
- **Benchmarks**: Studies show that properly indexed queries can be orders of magnitude faster than unindexed queries, especially for large datasets.
- **Common practice**: Software engineers routinely use indexing as a first step in query optimization, as evidenced by best practices in database documentation and performance tuning guides.
