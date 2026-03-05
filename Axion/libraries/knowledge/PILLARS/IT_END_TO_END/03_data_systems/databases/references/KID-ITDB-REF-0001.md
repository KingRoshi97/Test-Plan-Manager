---
kid: "KID-ITDB-REF-0001"
title: "SQL Anti-Patterns Reference (practical)"
type: reference
pillar: IT_END_TO_END
domains:
  - data_systems
  - databases
subdomains: []
tags:
  - databases
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

# SQL Anti-Patterns Reference (practical)

```markdown
# SQL Anti-Patterns Reference (Practical)

## Summary
SQL anti-patterns are common design and query practices that can lead to inefficient, error-prone, or unscalable database systems. This document highlights key anti-patterns, their associated risks, and best practices to avoid them in practical scenarios.

## When to Use
- When designing, querying, or maintaining relational databases.
- During code reviews or database performance audits.
- When debugging SQL performance issues or data integrity problems.
- To educate teams on best practices for scalable and maintainable database systems.

## Do / Don't

### Do:
1. Normalize your database schema to reduce redundancy and improve data integrity.
2. Use parameterized queries to prevent SQL injection attacks.
3. Use proper indexing to optimize query performance.

### Don't:
1. Don’t use SELECT * in production queries; explicitly specify columns to reduce overhead.
2. Don’t store multiple values in a single column (e.g., comma-separated values); use proper relational structures.
3. Don’t use database functions on indexed columns in WHERE clauses, as this can prevent index usage.

## Core Content

### 1. **Key SQL Anti-Patterns**
#### a. **SELECT * Usage**
   - **Problem**: Fetching all columns increases I/O and memory usage, especially in large tables.
   - **Solution**: Specify only required columns in SELECT statements.
   - **Example**:  
     ```sql
     -- Anti-pattern:
     SELECT * FROM users WHERE user_id = 1;
     -- Correct:
     SELECT first_name, last_name FROM users WHERE user_id = 1;
     ```

#### b. **Implicit Data Type Conversion**
   - **Problem**: Queries with mismatched data types force the database to perform implicit conversions, which can degrade performance and cause unexpected results.
   - **Solution**: Ensure data types match between columns and query parameters.
   - **Example**:  
     ```sql
     -- Anti-pattern:
     SELECT * FROM orders WHERE order_id = '123'; -- order_id is INT
     -- Correct:
     SELECT * FROM orders WHERE order_id = 123;
     ```

#### c. **EAV (Entity-Attribute-Value) Schema**
   - **Problem**: Storing data in a key-value format within a relational database leads to complex queries, poor performance, and difficulty enforcing constraints.
   - **Solution**: Use a properly normalized schema with explicit columns for attributes.
   - **Example**: Avoid tables like:
     | entity_id | attribute_name | attribute_value |
     |-----------|----------------|-----------------|
     | 1         | color          | red             |
     | 1         | size           | large           |

#### d. **Overusing OR in WHERE Clauses**
   - **Problem**: OR conditions can prevent index usage and result in full table scans.
   - **Solution**: Use UNION or IN where appropriate.
   - **Example**:  
     ```sql
     -- Anti-pattern:
     SELECT * FROM products WHERE category = 'A' OR category = 'B';
     -- Correct:
     SELECT * FROM products WHERE category IN ('A', 'B');
     ```

#### e. **Non-Parameterized Queries**
   - **Problem**: Using string concatenation for dynamic SQL queries exposes your application to SQL injection attacks.
   - **Solution**: Use parameterized queries or prepared statements.
   - **Example**:  
     ```sql
     -- Anti-pattern:
     query = "SELECT * FROM users WHERE username = '" + username + "'";
     -- Correct:
     query = "SELECT * FROM users WHERE username = ?";
     ```

### 2. **Best Practices for Avoiding Anti-Patterns**
- **Indexing**: Regularly monitor and optimize indexes to align with query patterns.
- **Schema Design**: Normalize to at least 3NF (Third Normal Form) unless denormalization is justified for performance.
- **Query Optimization**: Use EXPLAIN or EXPLAIN ANALYZE to understand query execution plans and identify bottlenecks.
- **Error Handling**: Implement proper error handling for failed queries to avoid cascading failures.

### 3. **Common Consequences of Anti-Patterns**
- **Performance Degradation**: Poorly designed queries and schemas can lead to slow response times.
- **Data Integrity Issues**: Anti-patterns like EAV schemas make it harder to enforce constraints.
- **Scalability Problems**: Inefficient queries and schema designs do not scale well with increased data volume.

## Links
- **Database Normalization**: Overview of normalization principles and benefits.
- **SQL Injection Prevention**: Guide to secure query practices.
- **Indexing Best Practices**: Strategies for creating and maintaining indexes.
- **Query Optimization Techniques**: Tools and methods for optimizing SQL queries.

## Proof / Confidence
This content is based on widely accepted database design principles, including those outlined in *SQL Antipatterns: Avoiding the Pitfalls of Database Programming* by Bill Karwin. Industry benchmarks and tools like EXPLAIN and query profilers consistently demonstrate the performance impact of avoiding these anti-patterns.
```
