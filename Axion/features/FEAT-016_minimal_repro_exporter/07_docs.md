# FEAT-016 — Minimal Repro Exporter: Documentation Requirements

## 1. API Documentation

- `selectReproArtifacts(runDir, options?)` — JSDoc with parameter types and return type
- `buildReproPackage(runDir, outputPath, selection)` — JSDoc with parameter types and return type
- `cmdRepro(runDir, outputPath?)` — JSDoc with CLI usage notes

## 2. Architecture Documentation

- Data flow: `runDir` → `selectReproArtifacts()` → `ReproSelection` → `buildReproPackage()` → `ReproPackage` + files
- Artifact classification: core, stage_report, gate_report, verification, planning, state, supplementary
- Sensitive file exclusion pipeline (regex-based, pre-selection)

## 3. Operator Documentation

### 3.1 CLI Usage

```
cmdRepro(runDir: string, outputPath?: string)
```

- `runDir` — path to a completed pipeline run directory
- `outputPath` — (optional) destination path; defaults to `{runDir}/../repro_output`

### 3.2 Output Structure

```
{outputPath}/
  repro_manifest.json
  run_manifest.json
  artifact_index.json
  canonical/canonical_spec.json
  standards/resolved_standards_snapshot.json
  stage_reports/*.json
  gates/*.gate_report.json
  proof/proof_ledger.jsonl
  verification/completion_report.json
```

### 3.3 Troubleshooting

| Error Code | Cause | Fix |
|------------|-------|-----|
| `ERR-REPRO-001` | Run directory not found | Check path and permissions |
| `ERR-REPRO-002` | Run directory not found (build phase) | Verify directory wasn't deleted between select and build |
| `ERR-REPRO-003` | No artifacts selected | Use `minimal: false` or check run directory contents |

## 4. Change Log

- v1.0.0 — Initial implementation with minimal/full selection modes, SHA-256 integrity hashing, sensitive file exclusion

## 5. Cross-References

- SYS-09 (Terminology & Definitions)
- GOV-01 (Versioning Policy)
- GOV-02 (Change Control Rules)
