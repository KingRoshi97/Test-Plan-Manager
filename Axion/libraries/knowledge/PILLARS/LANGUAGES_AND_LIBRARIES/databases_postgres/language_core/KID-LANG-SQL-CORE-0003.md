---
kid: "KID-LANG-SQL-CORE-0003"
title: "Transaction Isolation (practical)"
type: concept
pillar: LANGUAGES_AND_LIBRARIES
domains: [databases_postgres]
subdomains: []
tags: [sql, transactions, isolation]
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

# Transaction Isolation (practical)

# Transaction Isolation (Practical)

## Summary

Transaction isolation is a critical concept in database management systems (DBMS) that defines how transactions interact with each other, ensuring data consistency and integrity. It is one of the four ACID properties (Atomicity, Consistency, Isolation, Durability) and determines how changes made by one transaction are visible to others. PostgreSQL, a popular relational database, provides multiple isolation levels to balance performance and correctness based on application needs.

---

## When to Use

- When designing applications that require concurrent database access without risking data corruption or inconsistency.
- In systems where multiple users or services execute transactions simultaneously, such as e-commerce platforms or financial systems.
- When tuning database performance to minimize contention while maintaining acceptable levels of correctness for the application.
- In scenarios where specific anomalies (e.g., dirty reads, non-repeatable reads) must be prevented.

---

## Do / Don't

### Do:
1. **Use the default isolation level (`Read Committed`)** for most applications where occasional anomalies are acceptable and performance is critical.
2. **Choose `Serializable` isolation** for applications requiring the highest level of correctness, such as financial ledgers or inventory systems.
3. **Explicitly set the isolation level** at the transaction or session level when the default is not suitable for your use case.

### Don’t:
1. **Don’t use `Serializable` isolation unnecessarily**, as it can significantly degrade performance due to increased locking and contention.
2. **Don’t ignore transaction isolation levels** when debugging data anomalies in concurrent systems.
3. **Don’t assume the default isolation level prevents all anomalies**; understand the trade-offs of each level.

---

## Core Content

### What is Transaction Isolation?

Transaction isolation is the mechanism that controls the visibility of changes made by one transaction to other concurrent transactions. It prevents undesirable interactions between transactions, such as dirty reads (reading uncommitted data), non-repeatable reads (reading different values for the same data in the same transaction), and phantom reads (new rows appearing during a transaction).

PostgreSQL implements four standard isolation levels defined by the SQL standard:

1. **Read Uncommitted**: Transactions can see uncommitted changes made by others. PostgreSQL treats this as `Read Committed`, as it does not allow dirty reads.
2. **Read Committed**: A transaction only sees data committed before the query began. This prevents dirty reads but allows non-repeatable reads and phantom reads.
3. **Repeatable Read**: A transaction sees a consistent snapshot of the database throughout its execution. This prevents dirty reads and non-repeatable reads but allows phantom reads.
4. **Serializable**: Transactions are executed with the highest level of isolation, ensuring they appear as if executed sequentially. This prevents all anomalies but may lead to higher contention and transaction retries.

### Why Does It Matter?

Without proper isolation, concurrent transactions can lead to data anomalies that compromise the integrity of the database. For example:

- **Dirty Reads**: A transaction reads data modified by another uncommitted transaction, leading to potential inconsistencies if the changes are rolled back.
- **Non-Repeatable Reads**: A transaction reads the same data twice and gets different results because another transaction modified it in the meantime.
- **Phantom Reads**: A transaction re-executes a query and finds new rows that were inserted by another transaction.

By choosing the appropriate isolation level, developers can strike a balance between performance and data correctness based on the application's requirements.

### Practical Example in PostgreSQL

Suppose you are building an e-commerce application where users place orders. Consider the following transactions:

1. **Transaction A**: Checks the stock of an item.
2. **Transaction B**: Updates the stock after a purchase.

#### Scenario 1: `Read Committed`
- Transaction A reads the stock as 10.
- Transaction B updates the stock to 9 and commits.
- Transaction A reads the stock again and sees 9. This is a **non-repeatable read**.

#### Scenario 2: `Repeatable Read`
- Transaction A starts and reads the stock as 10.
- Transaction B updates the stock to 9 and commits.
- Transaction A reads the stock again and still sees 10, ensuring consistency within the transaction.

#### Scenario 3: `Serializable`
- Transaction A and Transaction B both attempt to update the stock.
- PostgreSQL ensures that one transaction completes successfully while the other is rolled back, preventing conflicts.

---

## Links

- **ACID Properties in Databases**: Learn about the foundational principles of database transactions.
- **PostgreSQL Documentation on Isolation Levels**: Official reference for configuring and understanding isolation in PostgreSQL.
- **Concurrency Control in Databases**: Explore techniques for managing concurrent transactions beyond isolation levels.
- **PostgreSQL Locking Mechanisms**: Understand how PostgreSQL uses locks to enforce isolation.

---

## Proof / Confidence

This content is based on the SQL standard for transaction isolation and PostgreSQL’s implementation, as documented in its official documentation. PostgreSQL’s behavior aligns with industry best practices for relational databases. The examples provided are derived from common patterns observed in real-world applications, such as financial systems and e-commerce platforms.
