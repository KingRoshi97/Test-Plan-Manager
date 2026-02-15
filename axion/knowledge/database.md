# Database Design Best Practices

## Schema Design

### Primary Keys
- Use auto-incrementing integers (`serial`) for internal-only tables
- Use UUIDs (`uuid_generate_v4()`) when IDs are exposed externally or in distributed systems
- Never use natural keys as primary keys (emails change, usernames change)
- Always name the primary key column `id`

### Naming Conventions
- Tables: plural snake_case (`user_profiles`, `order_items`)
- Columns: singular snake_case (`created_at`, `user_id`, `is_active`)
- Foreign keys: `{referenced_table_singular}_id` (e.g., `user_id`, `order_id`)
- Indexes: `idx_{table}_{columns}` (e.g., `idx_users_email`)
- Unique constraints: `uq_{table}_{columns}` (e.g., `uq_users_email`)

### Column Types
- Strings: Use `varchar(n)` with reasonable limits, `text` for unbounded (comments, descriptions)
- Money: `integer` (store cents) or `numeric(12,2)` — never `float`/`double`
- Dates: `timestamptz` (timestamp with timezone) — always store UTC
- Booleans: `boolean` with sensible defaults
- Enums: Use PostgreSQL `enum` type or `varchar` with CHECK constraint
- JSON: `jsonb` (not `json`) for semi-structured data — supports indexing

### Standard Columns
Every table should consider:
- `id` — Primary key
- `created_at` — `timestamptz NOT NULL DEFAULT now()`
- `updated_at` — `timestamptz NOT NULL DEFAULT now()` (update via trigger or application)
- Only add `deleted_at` (soft delete) if business rules require audit trail

### Relationships
- One-to-many: Foreign key on the "many" side
- Many-to-many: Junction table with composite primary key
- One-to-one: Foreign key with unique constraint, or merge into one table
- Always add foreign key constraints (ON DELETE CASCADE or RESTRICT based on business rules)

## Indexing

### When to Index
- Columns in WHERE clauses (especially equality and range queries)
- Columns in JOIN conditions (foreign keys)
- Columns in ORDER BY (if query is common)
- Columns in UNIQUE constraints (automatically indexed)

### When NOT to Index
- Small tables (< 1000 rows) — full scan is faster than index lookup
- Columns with very low cardinality (boolean, status with 3 values)
- Columns rarely used in queries
- Tables with very high write rates (indexes slow inserts/updates)

### Index Types
- **B-tree** (default): Equality and range queries
- **GIN**: JSONB fields, full-text search, array columns
- **Partial index**: `WHERE is_active = true` — index only relevant rows
- **Composite index**: Multiple columns (order matters — leftmost prefix rule)
- **Covering index**: `INCLUDE` additional columns to enable index-only scans
- **BRIN**: Very large tables with naturally ordered data (timestamps)

## Query Patterns

### N+1 Prevention
- Use JOINs for related data needed together
- Use subqueries for existence checks
- Use batch loading (WHERE id IN (...)) for lists of related items
- ORMs: use eager loading (`with` in Drizzle, `include` in Prisma)

### Pagination
- **Offset-based**: `LIMIT 20 OFFSET 40` — simple but slow for large offsets
- **Cursor-based**: `WHERE id > :last_id ORDER BY id LIMIT 20` — consistent, performant
- Always add an ORDER BY when paginating (results must be deterministic)
- Include total count only if the query is fast (use estimate for large tables)

### Transactions
- Wrap multi-step operations in transactions (transfer money = debit + credit)
- Keep transactions short (no external API calls inside transactions)
- Use appropriate isolation level (READ COMMITTED is default and usually correct)
- Handle deadlocks with retry logic

### Optimistic Concurrency
- Use a `version` column (integer) or `updated_at` timestamp for optimistic locking
- Pattern: `UPDATE ... SET version = version + 1 WHERE id = :id AND version = :expected_version`
- If zero rows updated, the record was modified by another process — return 409 Conflict
- Optimistic locking avoids holding database locks during user think time
- Preferred for web applications where conflicts are rare

### Distributed Transactions Awareness
- Avoid distributed transactions when possible — prefer eventual consistency
- Use the Saga pattern for multi-service operations (compensating actions on failure)
- Use the Outbox pattern to reliably publish events alongside database writes
- If two-phase commit is needed, understand its performance and availability trade-offs
- Document which operations span services and their consistency guarantees

## Migration Best Practices

### Safe Migrations
- Never drop columns in a single deployment (deploy code first, drop column later)
- Add new columns as nullable or with defaults (avoids table lock on large tables)
- Create indexes concurrently in PostgreSQL: `CREATE INDEX CONCURRENTLY`
- Test migrations against a copy of production data before deploying
- Always write rollback migrations

### Schema Evolution
- Use a migration tool (Drizzle Kit, Prisma Migrate, or raw SQL migrations)
- Number migrations sequentially with timestamps
- Each migration should be atomic and idempotent
- Document breaking changes in migration files

### Multi-Phase Migration Pattern
```
Phase 1: Add new column (nullable), deploy code that writes to both old and new
Phase 2: Backfill new column from old column data
Phase 3: Deploy code that reads from new column only
Phase 4: Drop old column in a separate migration
```

## Data Integrity

### Constraints
- NOT NULL on all columns unless null has business meaning
- CHECK constraints for valid ranges and patterns
- UNIQUE constraints on natural unique fields (email, username, slug)
- Foreign key constraints with appropriate ON DELETE behavior

### Soft Deletes vs. Hard Deletes
- **Soft delete** (`deleted_at` column): When audit trail is required, when data may need recovery
- **Hard delete**: When data must be removed (GDPR), when table size is a concern
- If using soft deletes: add `deleted_at` to all unique constraints, filter in all queries

## Read/Write Patterns

### Read Replicas
- Route read-heavy queries to read replicas to reduce primary load
- Understand replication lag — replicas may be seconds behind primary
- Never read from replica immediately after a write (use primary for read-after-write consistency)
- Use connection-level routing (application-level or proxy like PgBouncer)

### Read Models / CQRS Patterns
- For complex read queries, consider materialized views or denormalized read tables
- Update read models asynchronously via events or triggers
- Use materialized views for expensive aggregations refreshed on schedule
- CQRS (Command Query Responsibility Segregation): separate write model from read model when complexity justifies it

### Write Patterns
- Batch inserts for bulk data loading (use `INSERT ... VALUES` with multiple rows)
- Use `UPSERT` (`INSERT ... ON CONFLICT DO UPDATE`) for idempotent writes
- Use advisory locks for application-level mutual exclusion
- Partition large tables by date or tenant for write scalability

## Data Access Layer Patterns

### ORM and Query Builder Conventions
- Use a single ORM/query builder consistently across the project
- Define models/schemas in one place (single source of truth for table structure)
- Use repository or service pattern to encapsulate data access logic
- Never write raw SQL in route handlers — always go through the data access layer

### Query Builder Best Practices
- Use parameterized queries for all user input (ORMs do this automatically)
- Select only needed columns (`select('id', 'name')` not `select('*')`)
- Use query scopes/helpers for common filters (active users, published posts)
- Log slow queries in development for optimization

### Connection-Level Patterns
- Use a single shared pool across the application
- Do not create new connections per request
- Use middleware to manage transaction lifecycle (begin on request, commit/rollback on response)

## Connection Management

### Connection Pooling
- Use a connection pool (built-in to most ORMs, or PgBouncer)
- Pool size: 10-20 connections for most applications
- Set connection timeout: 5 seconds
- Set query timeout: 30 seconds (longer for batch jobs)
- Close idle connections after 10 minutes

### Pool Tuning
- Pool size = (number of CPU cores * 2) + number of disks (as starting point)
- Monitor pool utilization: high wait times indicate pool is too small
- Monitor active connections: near max indicates pool is too large or queries too slow
- Use PgBouncer in transaction mode for serverless/high-connection environments

### Database Performance Monitoring
- Track query duration (p50, p95, p99) and alert on regressions
- Monitor active connections, idle connections, and waiting queries
- Use `pg_stat_statements` for query performance analysis
- Set up slow query logging (threshold: 100ms for web apps)
- Monitor table sizes, index sizes, and bloat
- Track cache hit ratio — should be > 99% for well-tuned databases

## Data Lifecycle

### Data Archival
- Define retention policies per table/data type (e.g., logs: 90 days, orders: 7 years)
- Move old data to archive tables or cold storage on schedule
- Partition tables by date for efficient archival and pruning
- Ensure archived data is still queryable if needed (separate connection, read-only)

### Data Deletion and GDPR
- Implement hard delete for user data on account deletion request (GDPR right to erasure)
- Cascade delete or nullify references when deleting user data
- Log deletion requests and completions for compliance audit
- Anonymize data instead of deleting when analytics require historical records
- Provide data export functionality (GDPR right to data portability)

### Retention Automation
- Schedule automated cleanup jobs for expired data (cron or job queue)
- Use `pg_partman` or similar for automated partition management
- Monitor table sizes and set alerts for unexpected growth
- Test data deletion scripts against production-like data before running

## Backup and Recovery
- Automated daily backups with point-in-time recovery
- Test backup restoration regularly (at least monthly)
- Keep backups for 30 days minimum
- Store backups in a different region than the primary database
- Document and practice the recovery procedure
- Measure and document Recovery Time Objective (RTO) and Recovery Point Objective (RPO)

## Performance Optimization

### Query Optimization
- Use `EXPLAIN ANALYZE` to understand query execution plans
- Identify sequential scans on large tables and add indexes
- Avoid `SELECT *` — select only needed columns
- Use CTEs (WITH queries) for readability but be aware of optimization barriers in older PostgreSQL
- Prefer `EXISTS` over `IN` for large subquery result sets
- Use `UNION ALL` instead of `UNION` when duplicates are acceptable

### Table Design for Performance
- Normalize to 3NF by default, denormalize only when queries are proven slow
- Partition large tables by date range, tenant, or other natural boundaries
- Use materialized views for expensive aggregation queries (refresh on schedule)
- Archive old data to separate tables to keep active tables small
- Consider column ordering: frequently accessed columns first (cache line optimization)

### Monitoring and Alerting
- Monitor active connections vs pool size — alert at 80% capacity
- Track long-running queries (> 5 seconds) and investigate
- Monitor table bloat and schedule `VACUUM` appropriately
- Track index usage — drop unused indexes to reduce write overhead
- Set up alerts for: replication lag, connection exhaustion, disk usage > 80%

### Caching Strategies
- Use application-level caching (Redis) for frequently read, rarely written data
- Set appropriate TTLs based on data freshness requirements
- Implement cache invalidation on writes (write-through or write-behind)
- Use database query result caching for expensive reports
- Consider read-through cache pattern for simple key-value lookups
