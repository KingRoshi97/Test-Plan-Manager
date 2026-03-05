# FEAT-009 — Export Bundles: Observability

## 1. Metrics

| Metric | Source | Description |
|--------|--------|-------------|
| `kit.files.count` | `KitBuildResult.fileCount` | Total number of files in the assembled kit |
| `kit.content_hash` | `KitBuildResult.contentHash` | SHA-256 content hash of the complete kit |
| `kit.slots.populated` | `slotContents` | Number of domain slots with rendered documents |
| `kit.slots.na` | `slotContents` | Number of domain slots with `00_NA.md` markers |
| `kit.core_artifacts.available` | `safeRead` results | Count of core artifacts successfully read from source |

## 2. Logging

### 2.1 Key Events

- Kit build started — `runId`, `runDir`
- Core artifact read success/fallback — per artifact, whether source was available or placeholder used
- Rendered doc → slot mapping — `templateId`, `outputPath`, resolved `targetSlot`
- Unmapped rendered doc → default to `11_documentation`
- Kit manifest written — `kitId`, `fileCount`, `contentHash`
- Kit build complete — `fileCount`, `contentHash`

### 2.2 Structured Log Fields

- `feature`: `FEAT-009`
- `domain`: `kit`
- `operation`: `buildRealKit` | `slotForOutputPath`
- `run_id`: Pipeline run identifier
- `kit_id`: Kit identifier (`KIT-{runId}`)

### 2.3 Log Levels

- `ERROR`: File system write failures
- `WARN`: Source artifacts missing (fallback to placeholder)
- `INFO`: Kit build started, kit build complete
- `DEBUG`: Per-file hash computation, slot mapping decisions

## 3. Traceability

- `kit_manifest.json` provides full file inventory with SHA-256 hashes
- `packaging_manifest.json` provides integrity verification data
- `version_stamp.json` records all component versions used
- `00_KIT_MANIFEST.md` embeds manifest data in human-readable format

## 4. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
