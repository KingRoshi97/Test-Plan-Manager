---
kid: "KID-LANG-PG-REF-0002"
title: "Common Query Anti-Patterns Reference"
content_type: "reference"
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
  - "references"
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
  - "a"
  - "n"
  - "t"
  - "i"
  - "-"
  - "p"
  - "a"
  - "t"
  - "t"
  - "e"
  - "r"
  - "n"
  - "s"
  - ","
  - " "
  - "q"
  - "u"
  - "e"
  - "r"
  - "i"
  - "e"
  - "s"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/databases_postgres/references/KID-LANG-PG-REF-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Common Query Anti-Patterns Reference

# Common Query Anti-Patterns Reference

## Summary
This reference document outlines common query anti-patterns in PostgreSQL, their impact on performance and maintainability, and best practices for avoiding them. By identifying and mitigating these anti-patterns, developers can optimize query execution, reduce resource consumption, and improve database scalability.

---

## When to Use
- When optimizing PostgreSQL queries for performance and resource efficiency.
- During database schema design or refactoring to ensure maintainable and scalable queries.
- When troubleshooting slow query execution or high database load.

---

## Do / Don't

### **Do**
1. **Use Indexed Columns in WHERE Clauses**  
   Ensure that columns used in WHERE conditions are indexed to avoid full table scans.
2. **Batch Updates and Inserts**  
   Perform bulk operations instead of individual row updates/inserts to reduce transaction overhead.
3. **Use Appropriate Data Types**  
   Choose the smallest and most appropriate data type for columns to reduce memory usage and improve query performance.

### **Don't**
1. **Avoid SELECT ***  
   Do not use `SELECT *` in production queries; explicitly specify required columns to reduce I/O and improve clarity.
2. **Avoid Functions on Indexed Columns in WHERE Clauses**  
   Do not apply functions (e.g., `LOWER(column_name)`) on indexed columns in WHERE clauses, as this negates index usage.
3. **Avoid Over-Normalization**  
   Do not excessively normalize tables if it leads to frequent joins, which can degrade query performance.

---

## Core Content

### **Anti-Patterns and Solutions**

#### 1. **SELECT ***  
- **Problem**: Fetching all columns increases I/O and memory usage unnecessarily.  
- **Solution**: Explicitly specify required columns in the SELECT statement to reduce data transfer and improve readability.  
  **Example**:  
  ```sql
  -- Anti-pattern
  SELECT * FROM users;

  -- Recommended
  SELECT id, username, email FROM users;
  ```

#### 2. **Functions on Indexed Columns**  
- **Problem**: Applying functions (e.g., `LOWER`, `CAST`) on indexed columns prevents the query planner from using the index.  
- **Solution**: Use functional indexes or rewrite queries to avoid functions on indexed columns.  
  **Example**:  
  ```sql
  -- Anti-pattern
  SELECT * FROM users WHERE LOWER(username) = 'john';

  -- Recommended
  CREATE INDEX idx_users_lower_username ON users (LOWER(username));
  SELECT * FROM users WHERE LOWER(username) = 'john';
  ```

#### 3. **Unbounded Queries**  
- **Problem**: Queries without LIMIT or pagination can result in excessive data retrieval, impacting performance.  
- **Solution**: Use LIMIT and OFFSET for pagination or filtering.  
  **Example**:  
  ```sql
  -- Anti-pattern
  SELECT * FROM orders;

  -- Recommended
  SELECT * FROM orders LIMIT 50 OFFSET 0;
  ```

#### 4. **Overuse of JOINs**  
- **Problem**: Excessive joins across multiple tables can lead to complex queries and degrade performance.  
- **Solution**: Simplify joins or denormalize data where appropriate.  
  **Example**:  
  ```sql
  -- Anti-pattern
  SELECT * FROM orders o
  JOIN customers c ON o.customer_id = c.id
  JOIN products p ON o.product_id = p.id;

  -- Recommended (denormalized schema)
  SELECT * FROM orders_with_customer_and_product;
  ```

#### 5. **Ignoring Indexes**  
- **Problem**: Queries on columns without indexes lead to full table scans.  
- **Solution**: Create indexes on frequently queried columns.  
  **Example**:  
  ```sql
  -- Anti-pattern
  SELECT * FROM orders WHERE order_date = '2023-01-01';

  -- Recommended
  CREATE INDEX idx_orders_order_date ON orders (order_date);
  SELECT * FROM orders WHERE order_date = '2023-01-01';
  ```

---

## Links
- PostgreSQL Documentation: Query Optimization Techniques  
- Best Practices for Indexing in PostgreSQL  
- Understanding PostgreSQL Query Planner and Execution  
- Common Database Design Anti-Patterns  

---

## Proof / Confidence
This content is based on widely accepted database optimization practices, as outlined in PostgreSQL official documentation and industry benchmarks. Studies show that avoiding query anti-patterns can reduce execution time by up to 80% and improve resource utilization significantly.
