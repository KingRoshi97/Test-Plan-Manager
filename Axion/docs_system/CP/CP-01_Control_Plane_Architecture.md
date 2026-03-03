CP-01 — Control Plane Architecture

1) Purpose
Define the overall architecture of Axion's three control planes, their roles, boundaries, and interactions.

2) Overview
Axion operates through three distinct control planes, each owning a specific lifecycle phase:

- Internal Control Plane (ICP): Orchestrates the deterministic build pipeline from intake through kit packaging. Owns the run lifecycle, state machine, gate evaluation, and all artifact production.
- Kit Control Plane (KCP): Manages kit-local execution by an external or internal agent. Validates kits, tracks work units, runs verification commands, captures proofs, and enforces guardrails.
- Maintenance Control Plane (MCP): Manages post-delivery maintenance including dependency upgrades, migrations, test hardening, refactoring, CI maintenance, and Axion compatibility checks.

3) Boundary Rules

3.1 ICP Boundaries
- Owns: run_lifecycle, stage_progression, gate_evaluation, artifact_production, proof_capture, kit_packaging
- Does not own: kit_execution, code_generation, external_agent_behavior, maintenance_actions
- The ICP never executes user code or generates implementation artifacts. It produces the kit that contains instructions and contracts for execution.

3.2 KCP Boundaries
- Owns: kit_validation, work_unit_tracking, verification_execution, kit_proof_capture, guardrail_enforcement
- Does not own: run_lifecycle, gate_evaluation, standards_resolution, template_rendering, maintenance_actions
- The KCP operates within the kit directory and cannot modify ICP artifacts or state.

3.3 MCP Boundaries
- Owns: dependency_management, migration_planning, test_maintenance, refactoring, ci_maintenance, axion_compatibility
- Does not own: run_lifecycle, kit_execution, gate_evaluation, standards_resolution, template_rendering
- The MCP operates on an existing codebase and cannot trigger ICP runs or modify kit outputs.

4) Interaction Model

4.1 ICP → KCP
- ICP produces a kit bundle that KCP consumes
- The kit contains: manifest, entrypoint, plan units, verification policy, standards snapshot, rendered templates
- KCP validates the kit against the kit structure contract before execution begins

4.2 KCP → ICP
- KCP produces proof artifacts and result files that ICP can consume for gate evaluation
- Kit run reports feed back into the ICP proof ledger
- Completion status flows back to ICP for run release decisions

4.3 ICP → MCP
- ICP-produced artifacts (schemas, registries, templates) are the targets MCP maintains compatibility with
- MCP uses ICP's pinset and registry versions as baselines for compatibility checks

4.4 MCP → ICP
- MCP compatibility reports can trigger ICP re-runs if artifacts have drifted
- Updated dependencies and migrations may require ICP re-evaluation

5) Shared Infrastructure

5.1 Shared Types
All three control planes share types defined in `Axion/src/types/controlPlane.ts`:
- State enums: RunState, StageState, KitRunState, MaintenanceRunState, WorkUnitState
- Classification types: RiskClass, ExecutorType, FailureClassification
- Common interfaces: RunContext, Pinset, EvidencePointer, RemediationStep, ProofObject

5.2 Shared Registries
- CONTROL_PLANE_REGISTRY.json: Defines all 3 CPs with their modules and boundaries
- OPERATOR_ACTIONS_REGISTRY.json: Defines allowed operator actions per CP
- FAILURE_CODES_REGISTRY.json: Defines failure codes across all classifications
- PROOF_TYPE_REGISTRY.json: Defines allowed proof types per CP
- GATE_REGISTRY.json: Defines gate predicates and checks (ICP-specific)

6) File Layout

```
Axion/src/core/controlPlane/       — ICP modules
Axion/src/core/kitControlPlane/    — KCP modules
Axion/src/core/maintenanceControlPlane/ — MCP modules
Axion/src/types/controlPlane.ts    — Shared types
Axion/registries/                  — Shared registries
Axion/docs_system/CP/              — Control plane specifications
```
