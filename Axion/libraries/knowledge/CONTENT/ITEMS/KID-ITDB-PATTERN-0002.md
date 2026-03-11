---
kid: "KID-ITDB-PATTERN-0002"
title: "Soft Delete Pattern (with retention)"
content_type: "pattern"
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
legacy_path: "PILLARS/IT_END_TO_END/03_data_systems/databases/patterns/KID-ITDB-PATTERN-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Soft Delete Pattern (with retention)

# Soft Delete Pattern (with Retention)

## Summary
The Soft Delete Pattern is a design approach used in databases to mark records as deleted without physically removing them. This pattern supports data recovery, auditing, and compliance with data retention policies by retaining "deleted" records for a specified period. It is commonly implemented using a `deleted_at` timestamp or a `is_deleted` flag in database tables.

---

## When to Use
- **Data Recovery:** When users or systems may need to restore deleted records.
- **Auditing and Compliance:** When regulations require historical records to be retained, even after deletion.
- **Logical Deletion:** When downstream systems or processes rely on historical data that should not be physically removed.
- **Soft Deletes with Retention:** When records must be purged after a specific retention period to comply with data privacy laws (e.g., GDPR, CCPA).

Avoid using this pattern if:
- The database size is a critical performance bottleneck, and retaining deleted records significantly impacts query performance.
- The system has strict requirements for immediate physical deletion (e.g., sensitive data that must be erased upon request).

---

## Do / Don't

### Do:
1. **Use a Timestamp for Deletion:** Implement a `deleted_at` column to track when a record was soft-deleted. This allows for time-based retention policies.
2. **Index the Soft Delete Column:** Add an index on `deleted_at` or `is_deleted` to optimize queries that filter out soft-deleted records.
3. **Automate Retention Enforcement:** Use scheduled jobs or database triggers to permanently delete records after the retention period expires.

### Don't:
1. **Don't Overload the Primary Table:** Avoid keeping soft-deleted records in tables with high write or query volumes if it significantly impacts performance.
2. **Don't Skip Data Validation:** Ensure soft-deleted records are excluded from business logic unless explicitly required.
3. **Don't Assume Soft Deletes are Secure:** Soft-deleted records are still accessible in the database and may require additional security controls.

---

## Core Content

### Problem
In many systems, deleting a record permanently can lead to data loss, compliance violations, or the inability to audit historical changes. However, retaining all deleted records indefinitely can lead to bloated tables and performance degradation. The Soft Delete Pattern with retention solves this by marking records as deleted and purging them after a defined retention period.

### Solution Approach
The Soft Delete Pattern involves marking records as deleted using a dedicated column (e.g., `deleted_at` or `is_deleted`) and excluding these records from normal queries. A retention mechanism ensures that soft-deleted records are purged after a specified time.

#### Implementation Steps

1. **Schema Design:**
   - Add a `deleted_at` column (nullable timestamp) to the table:
     ```sql
     ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL;
     ```
   - Alternatively, use a boolean flag (`is_deleted`):
     ```sql
     ALTER TABLE users ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
     ```

2. **Modify Queries:**
   - Update all queries to exclude soft-deleted records by default:
     ```sql
     SELECT * FROM users WHERE deleted_at IS NULL;
     ```
   - For boolean flags:
     ```sql
     SELECT * FROM users WHERE is_deleted = FALSE;
     ```

3. **Soft Delete Records:**
   - Mark records as deleted instead of physically removing them:
     ```sql
     UPDATE users SET deleted_at = NOW() WHERE id = 123;
     ```
   - Or, for boolean flags:
     ```sql
     UPDATE users SET is_deleted = TRUE WHERE id = 123;
     ```

4. **Retention Policy:**
   - Use a scheduled job to purge records after the retention period:
     ```sql
     DELETE FROM users WHERE deleted_at < NOW() - INTERVAL '30 days';
     ```

5. **Auditing and Recovery:**
   - Allow authorized users to view or restore soft-deleted records:
     ```sql
     UPDATE users SET deleted_at = NULL WHERE id = 123;
     ```

6. **Indexing:**
   - Add an index to optimize queries filtering on `deleted_at` or `is_deleted`:
     ```sql
     CREATE INDEX idx_users_deleted_at ON users (deleted_at);
     ```

### Tradeoffs
- **Pros:**
  - Enables data recovery and auditing.
  - Supports compliance with retention policies.
  - Reduces risk of accidental data loss.

- **Cons:**
  - Increases table size and index maintenance overhead.
  - Requires careful query design to avoid including soft-deleted records.
  - May lead to performance degradation for large tables if not managed properly.

---

## Links
- **Database Design Best Practices:** Guidance on schema design and indexing strategies.
- **Data Retention Policies:** Overview of GDPR and CCPA requirements for data retention and deletion.
- **Scheduled Jobs in Databases:** Techniques for automating tasks like purging old records.
- **Auditing in Relational Databases:** Approaches for tracking changes to data.

---

## Proof / Confidence
The Soft Delete Pattern is a well-established practice in database design, supported by industry standards such as ACID compliance in relational databases. It is widely used in production systems, including CRM platforms, e-commerce applications, and financial systems, to balance data retention needs with performance and compliance requirements.
