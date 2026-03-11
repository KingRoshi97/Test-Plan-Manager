---
kid: "KID-LANGSEQU-CHECK-0001"
title: "Sequelize Production Readiness Checklist"
content_type: "checklist"
primary_domain: "sequelize"
industry_refs: []
stack_family_refs:
  - "sequelize"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "sequelize"
  - "checklist"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/04_databases_and_orms/sequelize/checklists/KID-LANGSEQU-CHECK-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Sequelize Production Readiness Checklist

# Sequelize Production Readiness Checklist

## Summary
This checklist provides actionable steps to ensure your Sequelize-based application is production-ready. It covers database configuration, query optimization, security practices, and monitoring to minimize risks and maximize performance. Following this checklist will help you deploy reliable and scalable applications using Sequelize.

## When to Use
Use this checklist when deploying a Sequelize-based Node.js application to production. It applies to scenarios such as launching a new application, migrating an existing app to production, or auditing production readiness for an established Sequelize project.

## Do / Don't

### Do:
1. **Do enable connection pooling**  
   Optimize database connections by configuring Sequelize's `pool` settings to handle concurrent requests efficiently.
   
2. **Do use environment variables for sensitive credentials**  
   Store database URLs, usernames, and passwords securely using environment variables to prevent accidental exposure.

3. **Do validate and sanitize user input**  
   Protect against SQL injection by using Sequelize's parameterized queries and input validation libraries.

### Don't:
1. **Don't use SQLite in production**  
   SQLite is not designed for high-concurrency production environments; use a robust database like PostgreSQL or MySQL instead.

2. **Don't disable logging blindly**  
   While excessive logging can impact performance, completely disabling Sequelize logging can make debugging production issues difficult.

3. **Don't use `sync({force: true})` in production**  
   This operation drops and recreates tables, leading to data loss. Use migrations for schema changes instead.

## Core Content

### Database Configuration
1. **Set up connection pooling**  
   Configure the `pool` settings in your Sequelize initialization:
   ```javascript
   const sequelize = new Sequelize(process.env.DB_URL, {
     pool: {
       max: 10,
       min: 0,
       acquire: 30000,
       idle: 10000,
     },
   });
   ```
   Rationale: Connection pooling prevents resource exhaustion and improves performance under load.

2. **Use production-grade databases**  
   Choose databases like PostgreSQL, MySQL, or MariaDB for production. Ensure proper indexing and storage engine configuration for optimal performance.

3. **Enable SSL for database connections**  
   Secure communication between your application and the database by enabling SSL:
   ```javascript
   const sequelize = new Sequelize(process.env.DB_URL, {
     dialectOptions: {
       ssl: {
         require: true,
         rejectUnauthorized: false,
       },
     },
   });
   ```

### Security Practices
1. **Sanitize user input**  
   Always use Sequelize's parameterized queries to prevent SQL injection:
   ```javascript
   const user = await User.findOne({ where: { email: req.body.email } });
   ```
   Rationale: Parameterized queries prevent malicious input from altering SQL commands.

2. **Restrict database privileges**  
   Use a database user with limited permissions (e.g., read/write access only) to minimize the impact of compromised credentials.

### Query Optimization
1. **Avoid N+1 queries**  
   Use Sequelize's `include` option to fetch related data efficiently:
   ```javascript
   const users = await User.findAll({
     include: [{ model: Profile }],
   });
   ```
   Rationale: N+1 queries cause excessive database calls, degrading performance.

2. **Enable query logging selectively**  
   Use Sequelize's logging option for debugging but disable it for production unless troubleshooting:
   ```javascript
   const sequelize = new Sequelize(process.env.DB_URL, {
     logging: process.env.NODE_ENV === 'development' ? console.log : false,
   });
   ```

### Monitoring and Error Handling
1. **Integrate monitoring tools**  
   Use tools like New Relic, Datadog, or custom logging to monitor query performance and database health.

2. **Implement error handling**  
   Catch and log errors using Sequelize's built-in error classes:
   ```javascript
   try {
     await sequelize.authenticate();
   } catch (error) {
     console.error('Database connection error:', error);
   }
   ```

### Migrations
1. **Use migrations for schema changes**  
   Manage schema changes using Sequelize migrations:
   ```bash
   sequelize-cli migration:create --name add-users-table
   sequelize-cli db:migrate
   ```
   Rationale: Migrations ensure reproducible and controlled schema updates.

## Links
1. [Sequelize Documentation](https://sequelize.org/docs/v6/)  
   Official Sequelize documentation covering configuration, migrations, and advanced features.

2. [OWASP SQL Injection Prevention](https://owasp.org/www-community/attacks/SQL_Injection)  
   A guide to preventing SQL injection attacks.

3. [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)  
   Comprehensive best practices for Node.js applications, including database handling.

4. [Sequelize CLI](https://sequelize.org/docs/v6/other-topics/migrations/)  
   Documentation for Sequelize CLI, including migration management.

## Proof / Confidence
Sequelize is widely adopted in the Node.js ecosystem for ORM functionality. Industry standards such as connection pooling, input sanitization, and migrations are critical for production-grade applications. Following these practices aligns with common recommendations from OWASP, database vendors, and the broader software engineering community.
