# FEAT-003 — Gate Engine Core: API Surface

## 1. Primary Entry Point

### `runGatesForStage(baseDir: string, runId: string, stageId: string): GateRunResult`

- **Module**: `src/core/gates/run.ts`
- **Purpose**: Orchestrates gate evaluation for a pipeline stage
- **Flow**: Loads gate registry → filters by stage → templates paths → evaluates checks → writes reports → updates manifest
- **Returns**: `{ reports: GateReportV1[], all_passed: boolean }`
- **Side Effects**: Writes gate report JSON files; updates run manifest; console output

## 2. Evaluator Functions

### `evalCheck(check: GateCheck): CheckResult`

- **Module**: `src/core/gates/evaluator.ts`
- **Purpose**: Dispatches a single check to the appropriate operator
- **Returns**: `{ pass: boolean, failure_code: string | null, evidence: EvidenceEntry[] }`

### `isRegisteredOperator(op: string): boolean`

- **Module**: `src/core/gates/evaluator.ts`
- **Purpose**: Checks if an operator string is in the `REGISTERED_OPS` set

## 3. Registry Functions

### `loadGateRegistry(registryPath: string): GateDefinition[]`

- **Module**: `src/core/gates/registry.ts`
- **Purpose**: Reads and parses `GATE_REGISTRY.json`, returns the `gates` array

### `filterGatesByStage(gates: GateDefinition[], stageId: string): GateDefinition[]`

- **Module**: `src/core/gates/registry.ts`
- **Purpose**: Filters gate definitions to those matching a specific `stage_id`

### `templateGatePaths(gate: GateDefinition, runId: string): GateDefinition`

- **Module**: `src/core/gates/registry.ts`
- **Purpose**: Recursively replaces `{{run_id}}` in all string values within a gate definition

## 4. Report Functions

### `writeGateReport(outputPath: string, report: GateReportV1): void`

- **Module**: `src/core/gates/report.ts`
- **Purpose**: Writes a gate report to disk via `writeCanonicalJson`

### `deriveTarget(gateId: string): string`

- **Module**: `src/core/gates/report.ts`
- **Purpose**: Maps a gate ID to its target artifact path
- **Returns**: Artifact path string (e.g., `"intake/validation_result.json"`) or `"run_manifest.json"` for unknown gates

### `checksToIssues(checks: CheckReport[], gateId: string): GateIssue[]`

- **Module**: `src/core/gates/report.ts`
- **Purpose**: Converts failed `CheckReport` entries into `GateIssue[]` with sequential `issue_id`

## 5. Evidence Policy Functions

### `loadProofTypeRegistry(baseDir: string): ProofTypeRegistry`

- **Module**: `src/core/gates/evidencePolicy.ts`
- **Purpose**: Loads `registries/PROOF_TYPE_REGISTRY.json` or returns empty registry

### `getRequiredProofTypes(gateId: string): string[]`

- **Module**: `src/core/gates/evidencePolicy.ts`
- **Purpose**: Returns required proof types for a gate from `GATE_EVIDENCE_MAP`

### `evaluateEvidenceCompleteness(gateId: string, availableProofTypes: string[]): EvidenceCompletenessResult`

- **Module**: `src/core/gates/evidencePolicy.ts`
- **Purpose**: Evaluates which required proof types are satisfied vs missing

## 6. DSL Functions (Stubs)

### `parseGate(raw: unknown): GateAST`

- **Module**: `src/core/gates/dsl.ts`
- **Status**: Stub — throws `NotImplementedError("parseGate")`

### `evalGate(ast: GateAST, evidence: Record<string, unknown>): boolean`

- **Module**: `src/core/gates/dsl.ts`
- **Status**: Stub — throws `NotImplementedError("evalGate")`

## 7. Types

### `GateCheck`
```typescript
{ op: string; path?: string; pointer?: string; min?: number; expected?: unknown; manifest_path?: string; bundle_root?: string }
```

### `GateDefinition`
```typescript
{ gate_id: string; stage_id: string; severity: string; checks: GateCheck[] }
```

### `GateRegistryFile`
```typescript
{ version: string; gates: GateDefinition[] }
```

### `CheckResult`
```typescript
{ pass: boolean; failure_code: string | null; evidence: EvidenceEntry[] }
```

### `EvidenceEntry`
```typescript
{ path: string; pointer: string; details: Record<string, unknown> }
```

### `GateReportV1`
```typescript
{ run_id: string; gate_id: string; stage_id: string; target: string; status: GateVerdict; evaluated_at: string; engine: { name: string; version: string }; issues: GateIssue[]; checks: CheckReport[]; failure_codes: string[]; evidence: EvidenceEntry[]; evidence_completeness?: EvidenceCompletenessResult }
```

### `GateVerdict`
```typescript
"pass" | "fail"
```

### `CheckReport`
```typescript
{ check_id: string; status: GateVerdict; failure_code: string | null; evidence: EvidenceEntry[] }
```

### `GateIssue`
```typescript
{ issue_id: string; severity: "error" | "warning"; error_code: string; rule_id: string; pointer: string; message: string; remediation: string }
```

### `GateRunResult`
```typescript
{ reports: GateReportV1[]; all_passed: boolean }
```

### `EvidenceCompletenessResult`
```typescript
{ gate_id: string; required_proof_types: string[]; satisfied: string[]; missing: string[]; complete: boolean }
```

### `GateOperator`
```typescript
"AND" | "OR" | "NOT" | "REQUIRES" | "THRESHOLD"
```

### `GateCondition`
```typescript
{ operator: GateOperator; operands: (GateCondition | string)[]; threshold?: number }
```

### `GateAST`
```typescript
{ gate_id: string; version: string; description: string; condition: GateCondition }
```

## 8. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (failure codes)
- SYS-03 (End-to-End Architecture)
