---
kid: "KID-LANG-SQL-CORE-0004"
title: "Migrations Discipline (baseline)"
type: procedure
pillar: LANGUAGES_AND_LIBRARIES
domains: [databases_postgres]
subdomains: []
tags: [sql, migrations, schema]
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

# Migrations Discipline (baseline)

# Migrations Discipline (Baseline)

## Summary
This procedure outlines the step-by-step discipline for managing database migrations in PostgreSQL. It ensures schema changes are applied consistently, safely, and in a version-controlled manner, minimizing risks to production systems. Following this process helps maintain database integrity while supporting collaborative development workflows.

## When to Use
- When introducing schema changes to a PostgreSQL database, such as creating, altering, or dropping tables, indexes, or constraints.
- When managing database migrations in a team environment to ensure consistency across development, staging, and production environments.
- When implementing migrations as part of continuous integration/continuous deployment (CI/CD) pipelines.

## Do / Don't
### Do:
1. **Use version control**: Store migration scripts in a version-controlled repository to track changes and collaborate effectively.
2. **Test migrations locally**: Verify that migration scripts work as expected on a local development database before applying them to staging or production.
3. **Apply migrations incrementally**: Run migrations in small, manageable batches to reduce risk and simplify debugging.

### Don't:
1. **Skip backups**: Never apply migrations to production without first creating a full database backup.
2. **Hard-code environment-specific values**: Avoid embedding environment-specific configurations (e.g., database URLs) directly in migration scripts.
3. **Ignore rollback plans**: Always design migrations with rollback procedures to recover from failures.

## Core Content

### Prerequisites
- PostgreSQL installed and configured on the target environments (development, staging, production).
- Access to the database with appropriate privileges for applying schema changes.
- A version control system (e.g., Git) for managing migration scripts.
- A database migration tool (e.g., Flyway, Liquibase, or Django migrations).

### Procedure

#### Step 1: Plan the Migration
- **Expected Outcome**: A clear understanding of the schema changes required.
- **Actions**:
  - Review the requirements for the schema change (e.g., adding a new table, modifying a column).
  - Consider the impact of the change on existing data and queries.
  - Document the intended changes and their rationale.
- **Common Failure Modes**:
  - Misinterpreting requirements, leading to incorrect schema changes.
  - Overlooking dependencies, such as foreign keys or indexes.

#### Step 2: Write the Migration Script
- **Expected Outcome**: A well-formed SQL or migration script ready for execution.
- **Actions**:
  - Write the migration script using your chosen migration tool or plain SQL.
  - Include comments explaining the purpose of each change.
  - Ensure idempotency where possible (e.g., using `IF NOT EXISTS` clauses).
- **Common Failure Modes**:
  - Syntax errors in the script.
  - Forgetting to handle edge cases, such as existing data constraints.

#### Step 3: Test Locally
- **Expected Outcome**: The migration script runs successfully on a local development database.
- **Actions**:
  - Apply the migration to a local database instance.
  - Verify that the schema changes match the expected outcome.
  - Test application functionality to ensure compatibility with the new schema.
- **Common Failure Modes**:
  - Migration fails due to missing dependencies or incorrect syntax.
  - Application errors caused by schema changes.

#### Step 4: Apply to Staging
- **Expected Outcome**: The migration is successfully applied to the staging environment without issues.
- **Actions**:
  - Deploy the migration script to the staging environment.
  - Run the script and verify the schema changes.
  - Conduct integration tests to ensure the application works as expected.
- **Common Failure Modes**:
  - Differences between staging and production environments causing unexpected behavior.
  - Insufficient testing leading to undetected issues.

#### Step 5: Apply to Production
- **Expected Outcome**: The migration is successfully applied to the production database with no downtime or errors.
- **Actions**:
  - Backup the production database before applying the migration.
  - Apply the migration during a maintenance window, if necessary.
  - Monitor the database and application for any issues post-migration.
- **Common Failure Modes**:
  - Migration causing downtime or errors due to unforeseen issues.
  - Rollback procedures failing due to incomplete planning.

### Rollback Procedure
- **Expected Outcome**: The database is restored to its pre-migration state.
- **Actions**:
  - Use the backup created before applying the migration to restore the database.
  - Alternatively, execute a rollback script designed to reverse the migration changes.
- **Common Failure Modes**:
  - Rollback script failing due to dependencies or irreversible changes.
  - Data loss if backups are incomplete or corrupted.

## Links
- **PostgreSQL Documentation**: Comprehensive guide to PostgreSQL features and best practices.
- **Flyway Database Migrations**: Overview of Flyway, a popular migration tool for PostgreSQL.
- **Schema Versioning Best Practices**: Industry standards for managing database schema changes.
- **Continuous Integration for Databases**: Strategies for integrating database migrations into CI/CD pipelines.

## Proof / Confidence
This procedure is based on widely accepted industry standards for database migrations, including practices recommended by PostgreSQL documentation, migration tools like Flyway and Liquibase, and CI/CD methodologies. It has been validated through real-world application in software engineering teams and aligns with best practices for minimizing risks in production environments.
