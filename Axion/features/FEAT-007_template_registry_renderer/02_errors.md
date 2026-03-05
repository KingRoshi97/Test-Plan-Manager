# FEAT-007 — Template Registry & Renderer: Error Codes

## 1. Error Code Format

All error codes follow the `ERR-DOMAIN-NNN` format defined in the ERROR_CODE_REGISTRY.

## 2. Domain

`TMP`

## 3. Error Codes

| Code | Severity | Message | Retryable | Action |
|------|----------|---------|-----------|--------|
| `ERR-TMP-001` | error | Template index file not found at `libraries/templates/template_index.json` | false | Verify template library is present in the base directory |
| `ERR-TMP-002` | error | Placeholder catalog file not found at `libraries/templates/placeholder_catalog.v1.json` | false | Verify placeholder catalog exists in template library |
| `ERR-TMP-003` | error | Template source file unreadable | false | Verify `source_abs_path` in selection result points to valid file |
| `ERR-TMP-004` | error | Guardrail violation: attempted write to template library directory | false | Rendered output must go to `runs/<runId>/templates/rendered_docs/`, not `libraries/templates/` |
| `ERR-TMP-005` | error | Selection result file not found when rendering | false | Run template selection stage before rendering |
| `ERR-TMP-006` | warning | Knowledge resolution failed during selection | true | Check knowledge library structure; selection proceeds without knowledge boost |
| `ERR-TMP-007` | warning | Canonical spec missing during rendering | true | Filled documents will have entity sections with placeholder text |
| `ERR-TMP-008` | error | Completeness gate failed: blocking unresolved fields on required template | false | Resolve all required fields or mark them UNKNOWN_ALLOWED in template spec |

## 4. Error Handling Rules

- `readJson` failures propagate as uncaught exceptions, halting the pipeline stage
- Knowledge resolution errors are caught silently — selection/rendering continue without knowledge context
- Missing upstream artifacts (canonical spec, standards, work breakdown, acceptance map) are caught silently — rendering continues with empty data
- `assertNotTemplateLibrary` throws immediately if output path falls within `libraries/templates/`
- All `NotImplementedError` throws in `completenessGate.ts` indicate the legacy gate interface is not yet replaced by `completeness.ts`

## 5. Cross-References

- ERROR_CODE_REGISTRY.json
- FEAT-017 (Error Taxonomy & Registry)
- SYS-07 (Compliance & Gate Model)
