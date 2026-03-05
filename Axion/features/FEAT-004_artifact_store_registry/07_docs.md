# FEAT-004 — Artifact Store & Registry: Documentation Requirements

## 1. API Documentation

- All exported functions have JSDoc-style documentation
- Parameter types and return types documented in 08_api.md
- Error conditions and thrown error codes listed in 02_errors.md

## 2. Architecture Documentation

### Module Structure

```
src/core/artifactStore/
├── cas.ts    — Content-addressable store (put/get/has/delete/list)
├── refs.ts   — Named reference store (set/get/delete/list/resolve)
└── gc.ts     — Garbage collector (findUnreferenced, garbageCollect)
```

### Storage Layout

```
{storePath}/
├── objects/
│   ├── ab/
│   │   └── ab3f...  (full hash as filename)
│   ├── cd/
│   │   └── cd9a...
│   └── ...
└── refs/
    ├── latest-manifest.json
    ├── run-001-spec.json
    └── ...
```

### Data Flow

1. Pipeline stages produce artifacts → `cas.put(content)` → returns hash
2. Callers store named references → `refStore.set(name, { scheme: "cas", hash })`
3. Consumers resolve references → `refStore.get(name)` → `resolveRef(ref, storePath)` → read file
4. Operator triggers GC → `garbageCollect(storePath, referencedHashes, options)` → removes orphans

## 3. Integration Points

- FEAT-001 (Control Plane) — provides run context and store path
- FEAT-009 (Export Bundles) — uses CAS for kit artifact storage
- FEAT-008 (Proof Ledger) — may store proof artifacts in CAS

## 4. Change Log

- v1.0.0 — Initial implementation: CAS with SHA-256/512, RefStore, GC with dryRun/maxAge

## 5. Cross-References

- SYS-09 (Terminology & Definitions)
- GOV-01 (Versioning Policy)
- GOV-02 (Change Control Rules)
