# FEAT-002 — Operator UI Core: Documentation Requirements

## 1. Built-in Help

The CLI includes a `USAGE` constant in `axion.ts` that documents:

- All supported commands and their syntax
- The 10 pipeline stages in Mechanics order (S1–S10)
- The gate registry mapping (stage → gate) for all 8 gates
- The 3 control planes (ICP, KCP, MCP)

Accessible via `axion help` or any unrecognized command.

## 2. Module Documentation

| Module | Description |
|--------|-------------|
| `axion.ts` | Entry point — argument parsing, base directory resolution, command dispatch |
| `index.ts` | Public re-exports for programmatic use of CLI commands |
| `initAxion.ts` | `.axion/` directory initialization and run counter setup |
| `runControlPlane.ts` | Run creation (`cmdRunStart`), full pipeline orchestration (`cmdRunFull`), `RunController` factory |
| `runStage.ts` | Single-stage execution with `STAGE_IO` contracts, stage work dispatch, gate integration |
| `runGates.ts` | Standalone gate execution for a stage |
| `planWork.ts` | Sequencing report generation |
| `packageKit.ts` | Kit manifest, entrypoint, and version stamp generation |
| `verify.ts` | Completion report generation |
| `writeState.ts` | State snapshot, resume plan, and handoff directory creation |
| `writeProof.ts` | Proof ledger entry creation |

## 3. Stage I/O Contract

`STAGE_IO` in `runStage.ts` declares the `consumed` and `produced` artifact paths for each of the 10 stages. This serves as the authoritative reference for stage input/output contracts.

## 4. Cross-References

- SYS-03 (End-to-End Architecture)
- SYS-09 (Terminology & Definitions)
- GOV-01 (Versioning Policy)
- ORD-01 (Build Order Graph)
