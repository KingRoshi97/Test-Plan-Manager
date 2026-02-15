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

## Connection Management

### Connection Pooling
- Use a connection pool (built-in to most ORMs, or PgBouncer)
- Pool size: 10-20 connections for most applications
- Set connection timeout: 5 seconds
- Set query timeout: 30 seconds (longer for batch jobs)
- Close idle connections after 10 minutes

## Backup and Recovery
- Automated daily backups with point-in-time recovery
- Test backup restoration regularly
- Keep backups for 30 days minimum
- Store backups in a different region than the primary database
