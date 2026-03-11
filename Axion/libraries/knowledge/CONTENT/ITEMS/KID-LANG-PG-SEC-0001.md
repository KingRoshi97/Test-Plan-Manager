---
kid: "KID-LANG-PG-SEC-0001"
title: "SQL Injection Prevention (parameterization)"
content_type: "checklist"
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
  - "security"
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
  - "s"
  - "e"
  - "c"
  - "u"
  - "r"
  - "i"
  - "t"
  - "y"
  - ","
  - " "
  - "s"
  - "q"
  - "l"
  - "-"
  - "i"
  - "n"
  - "j"
  - "e"
  - "c"
  - "t"
  - "i"
  - "o"
  - "n"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/databases_postgres/security/KID-LANG-PG-SEC-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# SQL Injection Prevention (parameterization)

# SQL Injection Prevention (Parameterization)

## Summary
SQL injection is a critical security vulnerability that occurs when untrusted user input is executed as part of a SQL query. Parameterization is a proven technique to prevent SQL injection by separating SQL code from data. This checklist provides actionable steps to implement parameterized queries effectively in PostgreSQL, ensuring robust protection against injection attacks.

---

## When to Use
- When writing SQL queries that include user input, such as form submissions, API requests, or URL parameters.
- When using PostgreSQL with libraries or frameworks that support parameterized queries (e.g., Python’s psycopg2, Java’s JDBC, Node.js’s pg library).
- During code reviews or security audits to identify and fix potential SQL injection vulnerabilities.

---

## Do / Don't

### Do:
1. **Use prepared statements with placeholders**: Always use parameterized queries with placeholders (`$1`, `$2`, etc.) in PostgreSQL.
2. **Validate input types**: Ensure that input types match the expected data type for the parameterized query.
3. **Leverage ORM parameterization**: Use the built-in parameterization features of Object-Relational Mapping (ORM) tools like SQLAlchemy or Sequelize.
4. **Enable query logging for auditing**: Use PostgreSQL’s `log_statement` setting to monitor queries and detect unsafe patterns during development.
5. **Sanitize database credentials**: Store database credentials securely and avoid exposing them in code repositories.

### Don’t:
1. **Don’t concatenate user input directly into SQL queries**: Avoid building queries using string interpolation or concatenation.
2. **Don’t rely solely on input validation**: Input validation is important but insufficient to prevent SQL injection on its own.
3. **Don’t disable query parameterization features**: Avoid workarounds that bypass parameterized query mechanisms in libraries or frameworks.
4. **Don’t log sensitive query details**: Avoid logging full SQL statements with sensitive user data in production environments.
5. **Don’t assume ORM tools are foolproof**: Always verify that the ORM is properly configured for parameterized queries.

---

## Core Content

### 1. Use Prepared Statements
- **What to Do**: Use PostgreSQL prepared statements with placeholders (`$1`, `$2`, etc.) to separate SQL code from data. For example:
  ```sql
  PREPARE stmt (text) AS SELECT * FROM users WHERE username = $1;
  EXECUTE stmt('john_doe');
  ```
- **Rationale**: Prepared statements ensure that user input is treated as data, not executable SQL code.

### 2. Use Parameterized Queries in Application Code
- **What to Do**: Use parameterized query APIs in your programming language or framework. Examples:
  - **Python (psycopg2)**:
    ```python
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    ```
  - **Node.js (pg library)**:
    ```javascript
    const query = 'SELECT * FROM users WHERE username = $1';
    const values = [username];
    const result = await client.query(query, values);
    ```
- **Rationale**: These libraries automatically escape and safely handle user input.

### 3. Validate Input Types
- **What to Do**: Validate and sanitize input to ensure it matches the expected type (e.g., integers, strings). For example:
  - Use Python’s `isinstance()` to check data types.
  - Use PostgreSQL’s `pg_typeof()` to verify column data types.
- **Rationale**: Prevents unexpected input types that could lead to errors or bypass parameterization.

### 4. Use ORM Safely
- **What to Do**: Configure ORM tools to use parameterized queries. Examples:
  - **SQLAlchemy**:
    ```python
    session.query(User).filter(User.username == username).all()
    ```
  - **Sequelize**:
    ```javascript
    User.findOne({ where: { username: username } });
    ```
- **Rationale**: ORMs abstract SQL queries but can still be vulnerable if misconfigured. Verify that they use parameterized queries internally.

### 5. Avoid Dynamic SQL Where Possible
- **What to Do**: Refactor dynamic SQL queries to use static queries with parameters. If dynamic SQL is unavoidable, use PostgreSQL’s `format()` function with `quote_ident()` or `quote_literal()`:
  ```sql
  EXECUTE format('SELECT * FROM %I WHERE id = %L', tablename, id);
  ```
- **Rationale**: Dynamic SQL increases the risk of injection if not handled properly.

### 6. Test for SQL Injection
- **What to Do**: Regularly test your application for SQL injection vulnerabilities using tools like OWASP ZAP or sqlmap. Include edge cases like:
  - `' OR '1'='1`
  - `'; DROP TABLE users; --`
- **Rationale**: Proactive testing helps identify and fix vulnerabilities before attackers exploit them.

---

## Links
- **OWASP SQL Injection Prevention Cheat Sheet**: Comprehensive guidelines for preventing SQL injection.
- **PostgreSQL Documentation on Prepared Statements**: Official documentation on using prepared statements in PostgreSQL.
- **SQLAlchemy Parameterized Queries**: Best practices for parameterized queries in SQLAlchemy.
- **OWASP ZAP**: Open-source tool for testing web application security.

---

## Proof / Confidence
- **OWASP Standards**: OWASP identifies parameterized queries as the primary defense against SQL injection.
- **PostgreSQL Documentation**: PostgreSQL officially recommends using prepared statements for secure query execution.
- **Industry Adoption**: Parameterization is a widely accepted best practice across programming languages and frameworks, including Python, Java, and JavaScript.
- **Real-World Incidents**: SQL injection remains a top vulnerability in the OWASP Top 10, emphasizing the need for robust prevention techniques.
