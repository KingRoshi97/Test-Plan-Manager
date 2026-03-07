# MUS CLI Usage

## Validate Registries
```bash
npx tsx Axion/src/cli/axion.ts mus validate --root ./Axion/libraries/maintenance
```
Checks all REG-*.json registries and policies for structural integrity, cross-registry reference resolution, duplicate detection, and active_map validity. Exit code 0 = PASS, 1 = FAIL.

## Run Health Check (MM-01)
```bash
npx tsx Axion/src/cli/axion.ts mus run --root ./Axion/libraries/maintenance --mode MM-01 --trigger manual --scope all
```
Executes DP-REG-01 (Registry Integrity Pack). Produces findings only (no proposals). Outputs: `run.json`, `findings.json`, `proof_bundle.json`.

## Run Drift Detection (MM-04)
```bash
npx tsx Axion/src/cli/axion.ts mus run --root ./Axion/libraries/maintenance --mode MM-04 --trigger manual --scope all
```
Executes DP-DRIFT-01 (Drift Detection Pack). Detects slug inconsistencies, reference mismatches, missing required fields. Produces findings AND proposal packs. Outputs: `run.json`, `findings.json`, `proposal_packs.json`, `blast_radius.json`, `proof_bundle.json`.

## Safety Constraints
- Scheduled runs are always proposal-only; publish is disabled
- Automation actors cannot apply or publish
- Apply/Publish commands are gated and return "not implemented" in v1
