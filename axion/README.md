# AXION System

The documentation generation engine powering Axiom Assembler.

## Structure

- `config/` - Domain and source document configuration
- `scripts/` - Pipeline stage scripts (init → generate → seed → draft → review → verify → lock → package)
- `source_docs/` - Product specs and registry documents
- `templates/` - Document templates for domain generation
- `domains/` - Generated domain-specific documentation

## Pipeline Stages

1. `init` - Initialize workspace
2. `generate` - AI generates source docs
3. `seed` - Seed domain templates
4. `draft` - Draft ERCs + execution specs
5. `review` - Review pass
6. `verify` - Verification (expanded gates)
7. `lock` - Lock final output
8. `package` - Create zip bundle
9. `scaffold` - Create monorepo scaffold (NEW)
10. `codegen` - Generate code stubs from specs (NEW)
11. `validate` - Lint/typecheck/tests for scaffold (NEW)
