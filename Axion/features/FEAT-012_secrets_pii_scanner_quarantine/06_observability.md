# FEAT-012 — Secrets & PII Scanner / Quarantine: Observability

  ## 1. Metrics

  - `scanner.scans.total`
- `scanner.findings.secrets`
- `scanner.findings.pii`
- `scanner.quarantine.entries`
- `scanner.false_positives`

  ## 2. Logging

  ### 2.1 Structured Log Fields

  - `feature`: `FEAT-012`
  - `domain`: `scanner`
  - `operation`: Name of the function/operation
  - `duration_ms`: Execution time
  - `status`: success | failure
  - `error_code`: Error code if applicable (ERR-SCAN-NNN)

  ### 2.2 Log Levels

  - `ERROR`: Operation failures requiring attention
  - `WARN`: Degraded operations or policy warnings
  - `INFO`: Normal operation milestones
  - `DEBUG`: Detailed execution traces (development only)

  ## 3. Traces

  - Each operation generates a trace span with:
    - `span_name`: `scanner.{operation}`
    - `feature_id`: `FEAT-012`
    - `run_id`: Current pipeline run identifier

  ## 4. Alerting

  - Alert on sustained error rates exceeding threshold
  - Alert on operation duration exceeding SLO
  - Alert on resource exhaustion (storage, memory)

  ## 5. Cross-References

  - SYS-06 (Data & Traceability Model)
  - GOV-04 (Audit & Traceability Rules)
  