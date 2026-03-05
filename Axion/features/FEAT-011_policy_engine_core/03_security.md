# FEAT-011 — Policy Engine Core: Security Requirements

## 1. Scope

Security considerations for the policy evaluation engine and its data flows.

## 2. Data Flow

- **Input**: On-disk JSON files (policy registry, risk classes, override policy) read via `readJson`. Runtime context objects passed in-memory.
- **Processing**: Pure evaluation logic — no network calls, no database access, no external service dependencies.
- **Output**: In-memory `PolicyEvaluationResult` objects returned to caller.

## 3. Data Classification

- Policy registry files: Internal configuration — should be version-controlled and access-restricted
- Risk-class definitions: Internal — define hard stops and required evidence per class
- Override policy rules: Sensitive — control which safety overrides are permitted
- Evaluation results: Internal — contain violation details including `risk_class` and `stage_id`
- `PolicyContext`: May contain run identifiers, gate results, evidence lists, and override records

## 4. Access Control

- Policy files are read from the local filesystem; access is controlled by OS-level file permissions
- No authentication or authorization is enforced within the module itself
- Callers (Control Plane) are responsible for ensuring appropriate access before invoking policy evaluation

## 5. Threat Mitigations

- **Condition injection**: `matchesCondition()` uses pattern matching against a fixed set of known patterns; arbitrary condition strings that don't match any pattern return `false`
- **Hard-stop patterns**: Only `security.gates.fail` and `privacy.data_handling.missing` are recognized as hard-stop conditions
- **Override safety**: Override context is checked but override records must be supplied by the caller; the engine does not create or persist overrides

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- FEAT-012 (Secrets & PII Scanner / Quarantine)
