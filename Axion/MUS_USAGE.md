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

## Task-Based Runs (v2)

### List Available Tasks
```bash
npx tsx Axion/src/cli/axion.ts mus tasks --root ./Axion/libraries/maintenance
```
Lists all tasks from REG-TASKS.json (ID, name, intent, schedule_allowed).

### List Available Agents
```bash
npx tsx Axion/src/cli/axion.ts mus agents --root ./Axion/libraries/maintenance
```
Lists all agents from REG-AGENTS.json (ID, name, status, capabilities).

### Execute a Task Run
```bash
npx tsx Axion/src/cli/axion.ts mus task-run --root ./Axion/libraries/maintenance --task TASK-PERF-01
```
Creates and executes a task run. Options:
- `--task TASK-ID` (required) — task to execute (e.g. TASK-PERF-01, TASK-SYS-01, TASK-QUAL-02, TASK-COST-01)
- `--agent AGT-ID` — agent override; auto-resolved from REG-AGENTS.json if omitted
- `--scope all|csv` — asset class scope (default: all)
- `--token-cap N` — max token budget (default: 100000)
- `--time-cap N` — max time in ms (default: 300000)
- `--max-findings N` — max findings limit (default: 100)

Output: status, findings count, insights count, bottlenecks count, recommendations count, top insight narrative.

#### Available Tasks
| Task ID | Intent | Description |
|---------|--------|-------------|
| TASK-OPS-01 | audit | Registry integrity check |
| TASK-SYS-01 | audit | System drift detection + MCP contract compatibility |
| TASK-PERF-01 | observe | Pipeline bottleneck analysis |
| TASK-QUAL-01 | audit | Rendered document depth analysis |
| TASK-QUAL-02 | audit | Template quality + render envelope cross-reference |
| TASK-COST-01 | observe | Pipeline run cost analysis |

## MCP Integration

MUS v2 bridges MCP (Maintenance Control Plane) managers as additive task executors. The existing filesystem-based scanning remains the primary executor; MCP calls provide supplementary findings and insights.

### Architecture

```
MUS (Governance + Catalog)         MCP (Execution + Orchestration)
┌──────────────────────┐          ┌──────────────────────────────┐
│ Task Registry        │          │ AxionIntegrationMaintainer   │
│ Agent Registry       │──bridge──│ DependencyManager            │
│ Task Scheduler       │          │ TestMaintainer               │
│ executeTask()        │          │ RefactorManager              │
│ Findings / Insights  │          │ CIMaintainer                 │
└──────────────────────┘          │ MigrationManager             │
                                  │ ModeRunner                   │
                                  └──────────────────────────────┘
```

**Bridge layer** (`mcp-bridge.ts`):
- `mapTaskRunToMcpRun()` — converts MUS TaskRun + TaskDefinition into MCP MaintenanceRun
- `mapCompatibilityReportToFindings()` / `mapCompatibilityReportToInsight()` — converts AxionIntegrationMaintainer output
- `mapTestReportToInsight()` — converts TestMaintainer determinism checks
- `mapDependencyReportToInsight()` / `mapDependencyReportToFindings()` — converts DependencyManager analysis

### MCP Wiring by Task
| Task | MCP Manager | What It Adds |
|------|-------------|--------------|
| TASK-SYS-01 | AxionIntegrationMaintainer.checkCompatibility() | Contract break detection across 8 Axion artifacts |
| TASK-QUAL-02 | TestMaintainer.produceReport() | Determinism verification for template rendering tests |
| TASK-PERF-01 | AxionIntegrationMaintainer.produceReport() | Perf regression correlation with integration drift |
| TASK-COST-01 | DependencyManager.produceReport() | Dependency cost tracking + breaking change detection |
| (fallback) | AxionIntegrationMaintainer + DependencyManager | MCP fallback for unregistered task IDs |

## Safety Constraints
- Scheduled runs are always proposal-only; publish is disabled
- Automation actors cannot apply or publish
- Apply/Publish commands are gated and return "not implemented" in v1
