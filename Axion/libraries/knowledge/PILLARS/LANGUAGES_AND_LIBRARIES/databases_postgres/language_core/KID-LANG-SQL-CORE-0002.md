---
kid: "KID-LANG-SQL-CORE-0002"
title: "Query Shape + Indexing Basics"
type: concept
pillar: LANGUAGES_AND_LIBRARIES
domains: [databases_postgres]
subdomains: []
tags: [sql, queries, indexing]
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

# Query Shape + Indexing Basics

# Query Shape + Indexing Basics

## Summary
Query shape refers to the structure and pattern of a database query, including its operations (e.g., filters, joins, aggregations) and how data is accessed. Indexing is the process of creating data structures that optimize query performance by reducing the amount of data scanned. Understanding query shape and indexing is critical in PostgreSQL to ensure efficient query execution, minimize resource usage, and improve application performance.

## When to Use
- **Performance Optimization**: When queries are slow or resource-intensive, analyzing query shape and indexing can identify bottlenecks.
- **High-Volume Applications**: For systems with frequent queries or large datasets, indexing is essential to maintain performance.
- **Complex Queries**: When queries involve multiple joins, subqueries, or filtering on non-primary key columns, query shape and proper indexing can prevent performance degradation.
- **Query Plan Analysis**: When using tools like `EXPLAIN` or `EXPLAIN ANALYZE` in PostgreSQL, understanding query shape helps interpret execution plans and optimize them.

## Do / Don't
### Do:
1. **Do use indexes for frequently queried columns**: Create indexes on columns used in `WHERE`, `JOIN`, `GROUP BY`, or `ORDER BY` clauses.
2. **Do analyze query execution plans**: Use `EXPLAIN` or `EXPLAIN ANALYZE` to understand how PostgreSQL executes a query and identify inefficiencies.
3. **Do consider composite indexes**: For queries filtering on multiple columns, composite (multi-column) indexes can significantly improve performance.

### Don’t:
1. **Don’t over-index**: Creating too many indexes increases write overhead and storage requirements, impacting insert, update, and delete performance.
2. **Don’t ignore query shape**: Even with indexing, poorly structured queries (e.g., unnecessary joins or subqueries) can negate performance benefits.
3. **Don’t assume default indexes are sufficient**: PostgreSQL automatically creates indexes for primary keys, but additional indexes may be necessary for other query patterns.

## Core Content
Query shape and indexing are foundational concepts for optimizing database performance in PostgreSQL. Query shape refers to the structure of a query, including the tables, joins, filters, and aggregations involved. The shape of a query directly impacts how PostgreSQL processes it and determines whether indexes can be leveraged effectively. Indexing, on the other hand, is the process of creating auxiliary data structures that allow PostgreSQL to locate rows faster without scanning entire tables.

### Query Shape
A well-optimized query shape minimizes the amount of data PostgreSQL needs to process. For example:
- **Simple Filters**: A query like `SELECT * FROM orders WHERE customer_id = 123` benefits from an index on the `customer_id` column.
- **Joins**: Queries involving joins, such as `SELECT * FROM orders INNER JOIN customers ON orders.customer_id = customers.id`, require indexes on the join keys (`orders.customer_id` and `customers.id`) to avoid full table scans.
- **Aggregations**: Queries with `GROUP BY` or `ORDER BY` clauses can benefit from indexes on the grouped or ordered columns.

### Indexing Basics
Indexes in PostgreSQL come in various types, each suited for specific use cases:
1. **B-Tree Indexes**: The default index type, ideal for equality and range queries (e.g., `=`, `<`, `>`, `BETWEEN`).
2. **GIN and GiST Indexes**: Used for full-text search, JSONB data, and geometric data types.
3. **Hash Indexes**: Optimized for equality comparisons but less commonly used due to limitations in older PostgreSQL versions.
4. **BRIN Indexes**: Efficient for large, sequentially stored datasets, such as time-series data.

### Practical Example
Suppose you have a table `orders` with the following schema:
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount NUMERIC
);
```

If you frequently query for orders by `customer_id` and `order_date`, you can create indexes to optimize these queries:
```sql
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_order_date ON orders (order_date);
```

For a query filtering by both columns:
```sql
SELECT * FROM orders WHERE customer_id = 123 AND order_date >= '2023-01-01';
```
A composite index can be more efficient:
```sql
CREATE INDEX idx_orders_customer_date ON orders (customer_id, order_date);
```

### Analyzing Query Plans
Using `EXPLAIN ANALYZE`, you can inspect how PostgreSQL executes a query:
```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 123;
```
This command shows whether the query uses an index scan or a sequential scan, helping you identify if additional indexing or query restructuring is needed.

## Links
- **PostgreSQL Documentation on Indexes**: Learn about different index types and their use cases.
- **PostgreSQL EXPLAIN Guide**: Understand how to interpret query execution plans.
- **Query Optimization Techniques**: Explore strategies for improving query performance.
- **Composite Indexes in PostgreSQL**: Best practices for creating multi-column indexes.

## Proof / Confidence
This content is based on PostgreSQL's official documentation, industry best practices in database optimization, and widely accepted principles in relational database design. Benchmarks and real-world use cases consistently demonstrate the performance impact of proper indexing and query shape optimization.
