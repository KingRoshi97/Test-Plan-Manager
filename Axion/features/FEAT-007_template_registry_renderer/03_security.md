# FEAT-007 — Template Registry & Renderer: Security Requirements

## 1. Scope

Security requirements for the template selection, filling, rendering, and completeness checking pipeline.

## 2. Security Requirements

- Template source files in `libraries/templates/` are read-only at runtime — enforced by `assertNotTemplateLibrary` guardrail
- Rendered output is written exclusively to `runs/<runId>/templates/rendered_docs/`
- No secrets or PII should appear in template output — all content derives from canonical spec entities, routing, rules, and standards
- Template content is not executed — it is treated as data (markdown strings)
- Path traversal is mitigated by using `node:path.join` and `node:path.resolve` for all file operations

## 3. Data Classification

| Data | Classification | Notes |
|------|---------------|-------|
| Template index | Internal | Read-only registry |
| Template source files | Internal | Read-only markdown |
| Canonical spec | Internal | Contains project entities |
| Rendered documents | Internal | Generated output |
| Selection/render reports | Internal | Metadata only |
| Knowledge context | Internal | KID citations |

## 4. Access Control

- Template library is read-only for all pipeline operations
- Run directory is write-only during pipeline execution
- No authentication/authorization layer exists within the module — access control is inherited from the run controller (FEAT-001)

## 5. Threat Mitigations

| Threat | Mitigation |
|--------|------------|
| Write-back to template library | `assertNotTemplateLibrary` checks every write path against `libraries/templates/` |
| Path traversal via template paths | All paths constructed via `node:path.join`; `source_abs_path` is prefixed with `libraries/templates/` |
| Content injection via spec data | `formatCellValue` serializes all values to strings; no eval/execution of content |
| Information leakage via error messages | Errors include file paths but not file contents |

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- FEAT-012 (Secrets & PII Scanner / Quarantine)
- TMP-02 (Template File Contract)
