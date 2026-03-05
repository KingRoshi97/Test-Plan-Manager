# FEAT-003 — Gate Engine Core: Documentation Requirements

## 1. System Documentation References

| Document | Relevance |
|----------|-----------|
| SYS-03 (End-to-End Architecture) | Gate engine's place in the pipeline |
| SYS-07 (Compliance & Gate Model) | Gate enforcement model and compliance rules |
| ORD-02 (Gate DSL & Gate Rules) | Gate definition format and DSL operators |
| ORD-03 (Per-Doc Gate Checklist Format) | Gate report structure contract |
| VER-01 (Proof Types & Evidence Rules) | Proof types required by each gate |

## 2. Schema References

| Schema | Location |
|--------|----------|
| Gate DSL schema | `Axion/libraries/gates/gate_dsl.schema.v1.json` |
| Gate model schema | `Axion/libraries/gates/ORD-03.gate_model.schema.v1.json` |
| Gate registry | `registries/GATE_REGISTRY.json` |
| Proof type registry | `registries/PROOF_TYPE_REGISTRY.json` |

## 3. Module Documentation

| Module | Key Exports |
|--------|-------------|
| `evaluator.ts` | `evalCheck()`, `isRegisteredOperator()`, `CheckResult`, `EvidenceEntry` |
| `registry.ts` | `loadGateRegistry()`, `filterGatesByStage()`, `templateGatePaths()`, `GateDefinition`, `GateCheck` |
| `report.ts` | `writeGateReport()`, `deriveTarget()`, `checksToIssues()`, `GateReportV1`, `GateVerdict` |
| `run.ts` | `runGatesForStage()`, `GateRunResult` |
| `evidencePolicy.ts` | `loadProofTypeRegistry()`, `getRequiredProofTypes()`, `evaluateEvidenceCompleteness()` |
| `dsl.ts` | `GateAST`, `GateCondition`, `GateOperator` (types); `parseGate()`, `evalGate()` (stubs) |
| `index.ts` | Barrel re-exports of all public API |

## 4. Cross-References

- SYS-09 (Terminology & Definitions)
- GOV-01 (Versioning Policy)
- GOV-02 (Change Control Rules)
