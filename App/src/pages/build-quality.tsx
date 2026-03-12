import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import {
  Shield, Activity, AlertTriangle, Target, BarChart3,
  ChevronDown, ChevronRight, CheckCircle2, XCircle, Loader2,
  FileText, Package, Layers, GitBranch, List,
  AlertOctagon, Wrench, TrendingUp, Download, Eye,
  Gauge, Boxes, Search, Database, Code, Lock,
  type LucideIcon,
} from "lucide-react";
import { GlassPanel } from "../components/ui/glass-panel";
import { StatusChip, type StatusVariant } from "../components/ui/status-chip";
import { MetricCard } from "../components/ui/metric-card";
import type { BAQArtifacts } from "../lib/baq-selectors";
import {
  selectFinalBuildDecision,
  selectCoverageMetrics,
  selectOutputIntegrityMetrics,
  selectExtractionCoverageRows,
  selectCriticalObligationsByCategory,
  selectSubsystemSummary,
  selectSurfaceCounts,
  selectRequiredFileRows,
  selectManifestTargetRows,
  selectTraceCoverageSummary,
  selectRequirementChains,
  selectMissingRequiredFiles,
  selectGateRows,
  selectFailureSummary,
  selectPackagingReconciliation,
  selectTopBlockers,
  selectNextBestFix,
  getDataAvailability,
} from "../lib/baq-selectors";

type TabId = "overview" | "extraction" | "derived" | "inventory" | "traceability" | "delta" | "gates" | "failures" | "packaging" | "history";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "extraction", label: "Extraction", icon: FileText },
  { id: "derived", label: "Derived Plan", icon: Layers },
  { id: "inventory", label: "Repo Inventory", icon: Database },
  { id: "traceability", label: "Traceability", icon: GitBranch },
  { id: "delta", label: "Gen Delta", icon: Search },
  { id: "gates", label: "Gates", icon: Shield },
  { id: "failures", label: "Failures", icon: AlertOctagon },
  { id: "packaging", label: "Packaging", icon: Package },
  { id: "history", label: "History", icon: TrendingUp },
];

function decisionVariant(d: string): StatusVariant {
  switch (d) {
    case "approved": return "success";
    case "approved_with_warnings": return "warning";
    case "blocked": return "failure";
    case "failed": return "failure";
    default: return "neutral";
  }
}

function decisionLabel(d: string): string {
  switch (d) {
    case "approved": return "Approved";
    case "approved_with_warnings": return "Approved (Warnings)";
    case "blocked": return "Blocked";
    case "failed": return "Failed";
    default: return "Unknown";
  }
}

function severityVariant(s: string): StatusVariant {
  switch (s) {
    case "critical": return "failure";
    case "error": return "failure";
    case "warning": return "warning";
    case "info": return "processing";
    default: return "neutral";
  }
}

function gateStatusVariant(s: string): StatusVariant {
  switch (s) {
    case "pass": return "success";
    case "fail": return "failure";
    case "skip": return "warning";
    default: return "neutral";
  }
}

function pct(n: number): string {
  return `${Math.round(n)}%`;
}

function ExpandableRow({ title, children, defaultOpen = false }: { title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[hsl(var(--border)/0.5)] last:border-b-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[hsl(var(--accent)/0.5)] transition-colors text-left">
        {open ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />}
        <div className="flex-1 min-w-0">{title}</div>
      </button>
      {open && <div className="px-3 pb-3 pl-8">{children}</div>}
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[hsl(var(--border))]">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-3 py-2 text-system-label font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} className="px-3 py-4 text-center text-[hsl(var(--muted-foreground))]">No data</td></tr>
          ) : (
            rows.map((cells, i) => (
              <tr key={i} className="border-b border-[hsl(var(--border)/0.3)] hover:bg-[hsl(var(--accent)/0.3)]">
                {cells.map((cell, j) => (
                  <td key={j} className="px-3 py-2">{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function OverviewTab({ artifacts }: { artifacts: BAQArtifacts }) {
  const decision = selectFinalBuildDecision(artifacts);
  const coverage = selectCoverageMetrics(artifacts);
  const integrity = selectOutputIntegrityMetrics(artifacts);
  const blockers = selectTopBlockers(artifacts);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <GlassPanel solid className="p-4 col-span-2 lg:col-span-1">
          <div className="text-system-label mb-2">Final Decision</div>
          <StatusChip variant={decisionVariant(decision.decision)} label={decisionLabel(decision.decision)} size="md" />
          <div className="mt-2 text-2xl font-semibold tabular-nums text-[hsl(var(--foreground))]">{decision.qualityScore}<span className="text-sm text-[hsl(var(--muted-foreground))]">/100</span></div>
        </GlassPanel>
        <MetricCard icon={Target} label="Coverage" value={pct(coverage.requirementCoverage)} accent={coverage.requirementCoverage >= 80 ? "green" : "amber"} subtitle="requirement coverage" />
        <MetricCard icon={Gauge} label="Output Integrity" value={`${integrity.totalFiles}`} accent="cyan" subtitle={`${integrity.requiredFiles} required`} />
        <MetricCard icon={Shield} label="Gates" value={`${decision.gatesPassed}/${decision.gatesTotal}`} accent={decision.gatesFailed > 0 ? "red" : "green"} subtitle={decision.gatesFailed > 0 ? `${decision.gatesFailed} failed` : "all passed"} />
        <MetricCard icon={Package} label="Packaging" value={decision.packagingAllowed ? "Allowed" : "Blocked"} accent={decision.packagingAllowed ? "green" : "red"} />
      </div>

      {decision.reasons.length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-2">Decision Reasons</div>
          <ul className="space-y-1">
            {decision.reasons.map((r, i) => (
              <li key={i} className="text-sm text-[hsl(var(--foreground))] flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[hsl(var(--status-warning))]" />
                {r}
              </li>
            ))}
          </ul>
        </GlassPanel>
      )}

      {blockers.length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-2">Active Blockers</div>
          <div className="space-y-2">
            {blockers.map((b) => (
              <div key={b.id} className="flex items-start gap-2 text-sm">
                <StatusChip variant={severityVariant(b.severity)} label={b.severity} />
                <div className="flex-1">
                  <div className="text-[hsl(var(--foreground))]">{b.description}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{b.impact}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}

function ExtractionTab({ artifacts }: { artifacts: BAQArtifacts }) {
  const rows = selectExtractionCoverageRows(artifacts);
  const obligations = selectCriticalObligationsByCategory(artifacts);
  const ext = artifacts.extraction;

  if (!ext) return <EmptyArtifact name="Kit Extraction" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={FileText} label="Sections" value={`${ext.summary.consumed_count}/${ext.summary.total_sections}`} accent="cyan" subtitle="consumed" />
        <MetricCard icon={Target} label="Obligations" value={`${ext.summary.critical_obligations_fulfilled}/${ext.summary.critical_obligations_total}`} accent={ext.summary.critical_obligations_fulfilled === ext.summary.critical_obligations_total ? "green" : "amber"} subtitle="fulfilled" />
        <MetricCard icon={AlertTriangle} label="Warnings" value={`${ext.summary.blocking_warnings}`} accent={ext.summary.blocking_warnings > 0 ? "red" : "green"} subtitle="blocking" />
        <MetricCard icon={Activity} label="Result" value={ext.extraction_result} accent={ext.extraction_result === "passed" ? "green" : ext.extraction_result === "partial" ? "amber" : "red"} />
      </div>

      <GlassPanel solid className="p-4">
        <div className="text-system-label mb-3">Section Coverage</div>
        <DataTable
          headers={["Section", "Status", "Applicability", "Files", "Notes"]}
          rows={rows.map((r) => [
            <span className="font-mono text-xs">{r.sectionLabel}</span>,
            <StatusChip variant={r.status === "consumed" ? "success" : r.status === "missing" ? "failure" : "warning"} label={r.status} />,
            <span className="text-xs">{r.applicability}</span>,
            <span className="tabular-nums">{r.fileCount}</span>,
            <span className="text-xs text-[hsl(var(--muted-foreground))]">{r.notes.join(", ") || "—"}</span>,
          ])}
        />
      </GlassPanel>

      {obligations.length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Critical Obligations by Category</div>
          {obligations.map((g) => (
            <ExpandableRow
              key={g.category}
              title={
                <div className="flex items-center gap-3">
                  <span className="capitalize font-medium">{g.category}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{g.fulfilled}/{g.total} fulfilled</span>
                  {g.fulfilled < g.total && <StatusChip variant="warning" label={`${g.total - g.fulfilled} unfulfilled`} />}
                </div>
              }
            >
              <div className="space-y-1">
                {g.items.map((item) => (
                  <div key={item.obligationId} className="flex items-center gap-2 text-sm">
                    {item.fulfilled ? <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--status-success))]" /> : <XCircle className="w-3.5 h-3.5 text-[hsl(var(--status-failure))]" />}
                    <span>{item.description}</span>
                    <StatusChip variant={severityVariant(item.severity)} label={item.severity} />
                  </div>
                ))}
              </div>
            </ExpandableRow>
          ))}
        </GlassPanel>
      )}

      {ext.warnings.length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Extraction Warnings</div>
          <div className="space-y-2">
            {ext.warnings.map((w) => (
              <div key={w.warning_id} className="flex items-start gap-2 text-sm">
                <StatusChip variant={severityVariant(w.severity)} label={w.severity} />
                <div>
                  <span>{w.message}</span>
                  {w.blocks_forward_progress && <span className="ml-2 text-xs text-[hsl(var(--status-failure))] font-medium">BLOCKING</span>}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}

function DerivedPlanTab({ artifacts }: { artifacts: BAQArtifacts }) {
  const summary = selectSubsystemSummary(artifacts);
  const counts = selectSurfaceCounts(artifacts);
  const d = artifacts.derivedInputs;

  if (!d) return <EmptyArtifact name="Derived Build Inputs" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={Boxes} label="Subsystems" value={summary.subsystemCount} accent="cyan" />
        <MetricCard icon={Target} label="Features" value={summary.featureCount} accent="green" />
        <MetricCard icon={Database} label="Entities" value={summary.entityCount} accent="violet" />
        <MetricCard icon={Code} label="Endpoints" value={counts.endpoints} accent="amber" />
        <MetricCard icon={Gauge} label="Completeness" value={pct(summary.completeness)} accent={summary.completeness >= 80 ? "green" : "amber"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Subsystem Map</div>
          <div className="space-y-2">
            {d.subsystem_map.map((s) => (
              <div key={s.subsystem_id} className="text-sm border-b border-[hsl(var(--border)/0.3)] pb-2 last:border-0">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Layer: {s.layer} · {s.description}</div>
              </div>
            ))}
            {d.subsystem_map.length === 0 && <div className="text-sm text-[hsl(var(--muted-foreground))]">No subsystems mapped</div>}
          </div>
        </GlassPanel>

        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Feature Map</div>
          <div className="space-y-2">
            {d.feature_map.map((f) => (
              <div key={f.feature_id} className="text-sm border-b border-[hsl(var(--border)/0.3)] pb-2 last:border-0">
                <div className="font-medium">{f.name} <span className="text-xs text-[hsl(var(--muted-foreground))]">({f.priority})</span></div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{f.description}</div>
              </div>
            ))}
            {d.feature_map.length === 0 && <div className="text-sm text-[hsl(var(--muted-foreground))]">No features mapped</div>}
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassPanel solid className="p-3">
          <div className="text-system-label text-xs mb-1">Routes</div>
          <div className="text-lg font-semibold tabular-nums">{counts.routes}</div>
        </GlassPanel>
        <GlassPanel solid className="p-3">
          <div className="text-system-label text-xs mb-1">Pages</div>
          <div className="text-lg font-semibold tabular-nums">{counts.pages}</div>
        </GlassPanel>
        <GlassPanel solid className="p-3">
          <div className="text-system-label text-xs mb-1">Assumptions</div>
          <div className="text-lg font-semibold tabular-nums">{counts.assumptions}</div>
        </GlassPanel>
        <GlassPanel solid className="p-3">
          <div className="text-system-label text-xs mb-1">Risks</div>
          <div className="text-lg font-semibold tabular-nums">{counts.risks}</div>
        </GlassPanel>
      </div>

      {d.assumptions.length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Assumptions & Risks</div>
          <DataTable
            headers={["Type", "Description", "Impact", "Source"]}
            rows={[
              ...d.assumptions.map((a) => [
                <StatusChip variant="warning" label="Assumption" />,
                <span className="text-sm">{a.description}</span>,
                <StatusChip variant={severityVariant(a.impact)} label={a.impact} />,
                <span className="text-xs font-mono">{a.source_ref}</span>,
              ]),
              ...d.risks.map((r) => [
                <StatusChip variant="failure" label="Risk" />,
                <span className="text-sm">{r.description}{r.mitigation ? ` (Mitigation: ${r.mitigation})` : ""}</span>,
                <StatusChip variant={severityVariant(r.severity)} label={r.severity} />,
                <span className="text-xs font-mono">{r.source_ref}</span>,
              ]),
            ]}
          />
        </GlassPanel>
      )}
    </div>
  );
}

function InventoryTab({ artifacts }: { artifacts: BAQArtifacts }) {
  const requiredFiles = selectRequiredFileRows(artifacts);
  const allFiles = selectManifestTargetRows(artifacts);
  const inv = artifacts.inventory;

  if (!inv) return <EmptyArtifact name="Repo Inventory" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Database} label="Total Files" value={inv.summary.total_files} accent="cyan" />
        <MetricCard icon={Target} label="Required" value={requiredFiles.length} accent="green" />
        <MetricCard icon={Layers} label="Directories" value={inv.summary.total_directories} accent="violet" />
        <MetricCard icon={Boxes} label="Modules" value={inv.summary.total_modules} accent="amber" />
      </div>

      {inv.directories.length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Required Directories</div>
          <DataTable
            headers={["Path", "Purpose", "Layer", "Required"]}
            rows={inv.directories.map((d) => [
              <span className="font-mono text-xs">{d.path}</span>,
              <span className="text-sm">{d.purpose}</span>,
              <span className="text-xs">{d.layer}</span>,
              d.required ? <CheckCircle2 className="w-4 h-4 text-[hsl(var(--status-success))]" /> : <span className="text-xs text-[hsl(var(--muted-foreground))]">optional</span>,
            ])}
          />
        </GlassPanel>
      )}

      <GlassPanel solid className="p-4">
        <div className="text-system-label mb-3">Required Files ({requiredFiles.length})</div>
        <DataTable
          headers={["Path", "Role", "Layer", "Method", "Traces"]}
          rows={requiredFiles.map((f) => [
            <span className="font-mono text-xs">{f.path}</span>,
            <span className="text-xs">{f.role}</span>,
            <span className="text-xs">{f.layer}</span>,
            <StatusChip variant={f.generationMethod === "deterministic" ? "success" : "processing"} label={f.generationMethod} />,
            <span className="text-xs text-[hsl(var(--muted-foreground))]">{f.traceRefs.join(", ") || "—"}</span>,
          ])}
        />
      </GlassPanel>

      {Object.keys(inv.summary.files_by_layer).length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Files by Layer</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(inv.summary.files_by_layer).map(([layer, count]) => (
              <div key={layer} className="glass-panel-solid p-3">
                <div className="text-xs text-system-label mb-1">{layer}</div>
                <div className="text-lg font-semibold tabular-nums">{count as number}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}

function TraceabilityTab({ artifacts }: { artifacts: BAQArtifacts }) {
  const summary = selectTraceCoverageSummary(artifacts);
  const chains = selectRequirementChains(artifacts);
  const tm = artifacts.traceMap;

  if (!tm) return <EmptyArtifact name="Requirement Trace Map" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Target} label="Coverage" value={pct(summary.coveragePercent)} accent={summary.coveragePercent >= 80 ? "green" : "amber"} subtitle={`${summary.totalRequirements} requirements`} />
        <MetricCard icon={CheckCircle2} label="Fully Covered" value={summary.fullyCovered} accent="green" />
        <MetricCard icon={AlertTriangle} label="Partially" value={summary.partiallyCovered} accent="amber" />
        <MetricCard icon={XCircle} label="Not Covered" value={summary.notCovered} accent="red" />
      </div>

      {summary.unmappedTotal > 0 && (
        <GlassPanel solid className="p-4" glow={summary.unmappedCritical > 0 ? "red" : "amber"}>
          <div className="text-system-label mb-3">Unmapped Requirements ({summary.unmappedTotal})</div>
          <DataTable
            headers={["Requirement", "Type", "Severity", "Reason"]}
            rows={tm.unmapped_requirements.map((u) => [
              <span className="text-sm">{u.description}</span>,
              <span className="text-xs">{u.requirement_type}</span>,
              <StatusChip variant={severityVariant(u.severity)} label={u.severity} />,
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{u.reason}</span>,
            ])}
          />
        </GlassPanel>
      )}

      <GlassPanel solid className="p-4">
        <div className="text-system-label mb-3">Requirement Chains ({chains.length})</div>
        {chains.map((chain) => (
          <ExpandableRow
            key={chain.traceId}
            title={
              <div className="flex items-center gap-3">
                <StatusChip variant={chain.coverageStatus === "fully_covered" ? "success" : chain.coverageStatus === "partially_covered" ? "warning" : "failure"} label={chain.coverageStatus.replace(/_/g, " ")} />
                <span className="font-medium text-sm">{chain.requirementId}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] truncate">{chain.description}</span>
              </div>
            }
          >
            <div className="space-y-2 text-sm">
              <div><span className="text-system-label">Files:</span> {chain.fileRefs.length > 0 ? chain.fileRefs.map((f) => <span key={f} className="font-mono text-xs mr-2">{f}</span>) : "—"}</div>
              <div><span className="text-system-label">Features:</span> {chain.featureRefs.join(", ") || "—"}</div>
              {chain.workUnits.map((wu) => (
                <div key={wu.workUnitId} className="pl-3 border-l border-[hsl(var(--border))]">
                  <div className="font-medium text-xs">{wu.description}</div>
                  {wu.acceptanceItems.map((ai) => (
                    <div key={ai.acceptanceId} className="flex items-center gap-2 text-xs mt-1">
                      {ai.fulfilled ? <CheckCircle2 className="w-3 h-3 text-[hsl(var(--status-success))]" /> : <XCircle className="w-3 h-3 text-[hsl(var(--status-failure))]" />}
                      {ai.description}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ExpandableRow>
        ))}
      </GlassPanel>
    </div>
  );
}

function GenerationDeltaTab({ artifacts }: { artifacts: BAQArtifacts }) {
  const integrity = selectOutputIntegrityMetrics(artifacts);
  const missingFiles = selectMissingRequiredFiles(artifacts);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Database} label="Total Files" value={integrity.totalFiles} accent="cyan" />
        <MetricCard icon={Target} label="Required" value={integrity.requiredFiles} accent="green" />
        <MetricCard icon={AlertTriangle} label="Missing Required" value={missingFiles.length} accent={missingFiles.length > 0 ? "red" : "green"} />
        <MetricCard icon={Search} label="Unplanned" value={integrity.unplannedFiles} accent={integrity.unplannedFiles > 0 ? "amber" : "green"} />
      </div>

      {missingFiles.length > 0 && (
        <GlassPanel solid className="p-4" glow="red">
          <div className="text-system-label mb-3">Missing Required Files</div>
          <DataTable
            headers={["Path", "Reason", "Linked Traces"]}
            rows={missingFiles.map((f) => [
              <span className="font-mono text-xs">{f.path}</span>,
              <span className="text-sm">{f.reason}</span>,
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{f.traceRefs.join(", ") || "—"}</span>,
            ])}
          />
        </GlassPanel>
      )}

      {missingFiles.length === 0 && integrity.totalFiles === 0 && (
        <GlassPanel solid className="p-6">
          <div className="text-center text-[hsl(var(--muted-foreground))]">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div>No generation delta data available</div>
            <div className="text-xs mt-1">Run the pipeline to generate file inventory and packaging data</div>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}

function GatesTab({ artifacts }: { artifacts: BAQArtifacts }) {
  const gates = selectGateRows(artifacts);

  if (gates.length === 0) return <EmptyArtifact name="Gate Evaluation" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-7 gap-3">
        {gates.map((g) => (
          <GlassPanel key={g.gateId} solid className="p-3 text-center" glow={g.status === "pass" ? "green" : g.status === "fail" ? "red" : "amber"}>
            <div className="text-xs font-mono text-[hsl(var(--muted-foreground))] mb-1">{g.gateId}</div>
            <StatusChip variant={gateStatusVariant(g.status)} label={g.status.toUpperCase()} size="md" />
            <div className="text-xs mt-2 text-[hsl(var(--muted-foreground))]">{g.conditionsPassed}/{g.conditionsTotal}</div>
          </GlassPanel>
        ))}
      </div>

      <GlassPanel solid className="p-4">
        <div className="text-system-label mb-3">Gate Details</div>
        {gates.map((g) => (
          <ExpandableRow
            key={g.gateId}
            defaultOpen={g.status === "fail"}
            title={
              <div className="flex items-center gap-3">
                <StatusChip variant={gateStatusVariant(g.status)} label={g.status.toUpperCase()} />
                <span className="font-mono text-xs">{g.gateId}</span>
                <span className="font-medium text-sm">{g.gateName}</span>
                {g.blockers.length > 0 && <span className="text-xs text-[hsl(var(--status-failure))]">{g.blockers.length} blocker(s)</span>}
              </div>
            }
          >
            <div className="space-y-2">
              {g.conditions.map((c) => (
                <div key={c.conditionId} className="flex items-start gap-2 text-sm">
                  {c.passed ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-[hsl(var(--status-success))]" /> : <XCircle className="w-3.5 h-3.5 mt-0.5 text-[hsl(var(--status-failure))]" />}
                  <div className="flex-1">
                    <div>{c.description}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{c.message}</div>
                    {c.detail && <div className="text-xs text-[hsl(var(--muted-foreground))] font-mono mt-0.5">{c.detail}</div>}
                  </div>
                  <StatusChip variant={severityVariant(c.severity)} label={c.severity} />
                </div>
              ))}
              {g.blockers.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[hsl(var(--border)/0.5)]">
                  <div className="text-xs text-system-label mb-1">Blockers:</div>
                  {g.blockers.map((b, i) => (
                    <div key={i} className="text-xs text-[hsl(var(--status-failure))] flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3" /> {b}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ExpandableRow>
        ))}
      </GlassPanel>
    </div>
  );
}

function FailuresTab({ artifacts }: { artifacts: BAQArtifacts }) {
  const summary = selectFailureSummary(artifacts);

  if (!artifacts.failureReport) return <EmptyArtifact name="Failure Report" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={AlertOctagon} label="Total Failures" value={summary.totalFailures} accent={summary.totalFailures > 0 ? "red" : "green"} />
        <MetricCard icon={AlertTriangle} label="Blocking" value={summary.blockingCount} accent={summary.blockingCount > 0 ? "red" : "green"} />
        <MetricCard icon={CheckCircle2} label="Resolved" value={summary.resolvedCount} accent="green" />
        <MetricCard icon={XCircle} label="Unresolved" value={summary.unresolvedCount} accent={summary.unresolvedCount > 0 ? "amber" : "green"} />
      </div>

      {Object.keys(summary.byClass).length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Failures by Class</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(summary.byClass).filter(([, count]) => count > 0).map(([cls, count]) => (
              <div key={cls} className="glass-panel-solid p-3">
                <div className="text-xs text-system-label mb-1">{cls.replace(/_/g, " ")}</div>
                <div className="text-lg font-semibold tabular-nums">{count}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {summary.failures.length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Failure Details</div>
          <DataTable
            headers={["ID", "Class", "Severity", "Phase", "Description", "Resolved"]}
            rows={summary.failures.map((f) => [
              <span className="font-mono text-xs">{f.failure_id}</span>,
              <span className="text-xs">{f.failure_class.replace(/_/g, " ")}</span>,
              <StatusChip variant={severityVariant(f.severity)} label={f.severity} />,
              <span className="text-xs">{f.phase}</span>,
              <span className="text-sm">{f.description}</span>,
              f.resolved ? <CheckCircle2 className="w-4 h-4 text-[hsl(var(--status-success))]" /> : <XCircle className="w-4 h-4 text-[hsl(var(--status-failure))]" />,
            ])}
          />
        </GlassPanel>
      )}
    </div>
  );
}

function PackagingTab({ artifacts }: { artifacts: BAQArtifacts }) {
  const pkg = selectPackagingReconciliation(artifacts);

  return (
    <div className="space-y-6">
      <GlassPanel solid className="p-4" glow={pkg.allowed ? "green" : "red"}>
        <div className="flex items-center gap-4">
          <Package className={`w-8 h-8 ${pkg.allowed ? "text-[hsl(var(--status-success))]" : "text-[hsl(var(--status-failure))]"}`} />
          <div>
            <div className="text-lg font-semibold">{pkg.allowed ? "Packaging Allowed" : "Packaging Blocked"}</div>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">
              {pkg.blockReasons.length === 0 ? "All checks passed" : `${pkg.blockReasons.length} blocking issue(s)`}
            </div>
          </div>
        </div>
      </GlassPanel>

      {pkg.blockReasons.length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Block Reasons</div>
          <ul className="space-y-2">
            {pkg.blockReasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-[hsl(var(--status-failure))]" />
                {r}
              </li>
            ))}
          </ul>
        </GlassPanel>
      )}

      {pkg.gateFailures.length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Gate Failures</div>
          <DataTable
            headers={["Gate"]}
            rows={pkg.gateFailures.map((g) => [<span className="text-sm font-mono">{g}</span>])}
          />
        </GlassPanel>
      )}

      {pkg.missingArtifacts.length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Missing Artifacts</div>
          <DataTable
            headers={["Artifact"]}
            rows={pkg.missingArtifacts.map((a) => [<span className="text-sm font-mono">{a}</span>])}
          />
        </GlassPanel>
      )}

      {(pkg.inventoryMismatches.length > 0 || pkg.manifestMismatches.length > 0) && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Reconciliation Mismatches</div>
          <DataTable
            headers={["Source", "Path", "Reason"]}
            rows={[
              ...pkg.inventoryMismatches.map((m) => [
                <StatusChip variant="warning" label="Inventory" />,
                <span className="font-mono text-xs">{m.filePath}</span>,
                <span className="text-sm">{m.reason}</span>,
              ]),
              ...pkg.manifestMismatches.map((m) => [
                <StatusChip variant="failure" label="Manifest" />,
                <span className="font-mono text-xs">{m.filePath}</span>,
                <span className="text-sm">{m.reason}</span>,
              ]),
            ]}
          />
        </GlassPanel>
      )}
    </div>
  );
}

function HistoryTab() {
  return (
    <div className="space-y-6">
      <GlassPanel solid className="p-6">
        <div className="text-center text-[hsl(var(--muted-foreground))]">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm font-medium">History & Trends</div>
          <div className="text-xs mt-1">Trend data will populate as more runs complete with BAQ artifacts.</div>
          <div className="text-xs mt-1">Compare quality scores, gate pass rates, and failure trends across runs.</div>
        </div>
      </GlassPanel>
    </div>
  );
}

function EmptyArtifact({ name }: { name: string }) {
  return (
    <GlassPanel solid className="p-6">
      <div className="text-center text-[hsl(var(--muted-foreground))]">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <div className="text-sm font-medium">{name} not available</div>
        <div className="text-xs mt-1">This artifact has not been generated for the selected run.</div>
      </div>
    </GlassPanel>
  );
}

function UtilityRail({ artifacts }: { artifacts: BAQArtifacts }) {
  const blockers = selectTopBlockers(artifacts);
  const fix = selectNextBestFix(artifacts);
  const missing = selectMissingRequiredFiles(artifacts);

  return (
    <div className="space-y-4">
      <GlassPanel solid className="p-4">
        <div className="text-system-label mb-3 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4" />
          Active Blockers
        </div>
        {blockers.length === 0 ? (
          <div className="text-xs text-[hsl(var(--muted-foreground))]">No active blockers</div>
        ) : (
          <div className="space-y-2">
            {blockers.map((b) => (
              <div key={b.id} className="text-xs border-b border-[hsl(var(--border)/0.3)] pb-2 last:border-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <StatusChip variant={severityVariant(b.severity)} label={b.severity} />
                  <span className="text-[hsl(var(--muted-foreground))]">{b.category}</span>
                </div>
                <div className="text-[hsl(var(--foreground))]">{b.description}</div>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>

      {missing.length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Missing Artifacts
          </div>
          <div className="space-y-1">
            {missing.slice(0, 5).map((f) => (
              <div key={f.fileId} className="text-xs font-mono text-[hsl(var(--status-failure))]">{f.path}</div>
            ))}
            {missing.length > 5 && <div className="text-xs text-[hsl(var(--muted-foreground))]">+{missing.length - 5} more</div>}
          </div>
        </GlassPanel>
      )}

      {fix && (
        <GlassPanel solid className="p-4" glow="cyan">
          <div className="text-system-label mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Next Best Fix
          </div>
          <div className="text-sm font-medium text-[hsl(var(--foreground))]">{fix.action}</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{fix.target}</div>
          <div className="text-xs mt-2">
            <span className="text-[hsl(var(--status-processing))]">Impact:</span> {fix.impact}
          </div>
          <div className="text-xs">
            <span className="text-[hsl(var(--status-warning))]">Effort:</span> {fix.effort}
          </div>
        </GlassPanel>
      )}

      <GlassPanel solid className="p-4">
        <div className="text-system-label mb-3 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </div>
        <div className="space-y-2">
          <button className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            Quality Report (JSON)
          </button>
          <button className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            Failure Report (JSON)
          </button>
          <button className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            Full Evidence Bundle
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}

export default function BuildQualityPage() {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const { data: runsData, isLoading: runsLoading, isError: runsError, error: runsErrorObj } = useQuery({
    queryKey: ["/api/baq/runs"],
    queryFn: () => apiRequest("/api/baq/runs"),
    refetchInterval: 15000,
  });

  const runs: Array<{ runId: string; hasBAQ: boolean; artifacts: string[] }> = runsData?.runs ?? [];
  const effectiveRunId = selectedRunId ?? (runs.length > 0 ? runs[0].runId : null);

  const { data: baqData, isLoading: baqLoading, isError: baqError, error: baqErrorObj } = useQuery({
    queryKey: ["/api/baq/runs", effectiveRunId],
    queryFn: () => apiRequest(`/api/baq/runs/${effectiveRunId}`),
    enabled: !!effectiveRunId,
    refetchInterval: 10000,
  });

  const artifacts: BAQArtifacts = {
    extraction: baqData?.extraction ?? null,
    derivedInputs: baqData?.derivedInputs ?? null,
    inventory: baqData?.inventory ?? null,
    traceMap: baqData?.traceMap ?? null,
    qualityReport: baqData?.qualityReport ?? null,
    failureReport: baqData?.failureReport ?? null,
    sufficiency: baqData?.sufficiency ?? null,
    packagingDecision: baqData?.packagingDecision ?? null,
  };

  const availability = getDataAvailability(artifacts);
  const decision = selectFinalBuildDecision(artifacts);
  const coverage = selectCoverageMetrics(artifacts);

  if (runsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  if (runsError) {
    return (
      <div className="flex items-center justify-center h-full">
        <GlassPanel solid className="p-8 max-w-md" glow="red">
          <div className="text-center">
            <AlertOctagon className="w-10 h-10 mx-auto mb-3 text-[hsl(var(--status-failure))]" />
            <div className="text-lg font-medium text-[hsl(var(--foreground))]">Failed to Load Runs</div>
            <div className="text-sm text-[hsl(var(--muted-foreground))] mt-2">{(runsErrorObj as Error)?.message ?? "An unexpected error occurred while loading BAQ run data."}</div>
          </div>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[hsl(var(--primary))]" />
              <h1 className="text-lg font-semibold">Build Quality</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={effectiveRunId ?? ""}
                  onChange={(e) => setSelectedRunId(e.target.value || null)}
                  className="appearance-none bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] text-sm px-3 py-1.5 pr-8 rounded-md border border-[hsl(var(--border))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
                >
                  {runs.length === 0 && <option value="">No runs available</option>}
                  {runs.map((r) => (
                    <option key={r.runId} value={r.runId}>
                      {r.runId} {r.hasBAQ ? "" : "(no BAQ data)"}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] pointer-events-none" />
              </div>
              {effectiveRunId && (
                <>
                  <StatusChip variant={decisionVariant(decision.decision)} label={decisionLabel(decision.decision)} size="md" />
                  <StatusChip variant={decision.packagingAllowed ? "success" : "failure"} label={decision.packagingAllowed ? "Pkg: Allowed" : "Pkg: Blocked"} />
                </>
              )}
            </div>
          </div>

          {effectiveRunId && availability !== "empty" && (
            <div className="grid grid-cols-6 gap-3">
              <div className="glass-panel-solid px-3 py-2 text-center">
                <div className="text-[10px] text-system-label">Extraction</div>
                <div className="text-sm font-semibold tabular-nums">{pct(coverage.extractionCoverage)}</div>
              </div>
              <div className="glass-panel-solid px-3 py-2 text-center">
                <div className="text-[10px] text-system-label">Requirement</div>
                <div className="text-sm font-semibold tabular-nums">{pct(coverage.requirementCoverage)}</div>
              </div>
              <div className="glass-panel-solid px-3 py-2 text-center">
                <div className="text-[10px] text-system-label">Acceptance</div>
                <div className="text-sm font-semibold tabular-nums">{pct(coverage.acceptanceCoverage)}</div>
              </div>
              <div className="glass-panel-solid px-3 py-2 text-center">
                <div className="text-[10px] text-system-label">Proof</div>
                <div className="text-sm font-semibold tabular-nums">{pct(coverage.proofCompletion)}</div>
              </div>
              <div className="glass-panel-solid px-3 py-2 text-center">
                <div className="text-[10px] text-system-label">Inv. Variance</div>
                <div className="text-sm font-semibold tabular-nums">{pct(coverage.inventoryVariance)}</div>
              </div>
              <div className="glass-panel-solid px-3 py-2 text-center">
                <div className="text-[10px] text-system-label">Placeholder</div>
                <div className="text-sm font-semibold tabular-nums">{pct(coverage.placeholderRatio)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 flex gap-0 overflow-x-auto border-t border-[hsl(var(--border)/0.5)]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[12px] whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))] font-medium"
                    : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto p-6">
          {!effectiveRunId ? (
            <GlassPanel solid className="p-8">
              <div className="text-center text-[hsl(var(--muted-foreground))]">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <div className="text-lg font-medium">No Run Selected</div>
                <div className="text-sm mt-1">Select a pipeline run to inspect its build quality data.</div>
                <div className="text-xs mt-2">Build quality artifacts are generated during the pipeline execution.</div>
              </div>
            </GlassPanel>
          ) : baqError ? (
            <GlassPanel solid className="p-8" glow="red">
              <div className="text-center">
                <AlertOctagon className="w-10 h-10 mx-auto mb-3 text-[hsl(var(--status-failure))]" />
                <div className="text-lg font-medium text-[hsl(var(--foreground))]">Failed to Load Artifacts</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
                  {(baqErrorObj as Error)?.message ?? "Could not load BAQ artifacts for this run."}
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-2">Try selecting a different run or refreshing the page.</div>
              </div>
            </GlassPanel>
          ) : baqLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          ) : availability === "empty" ? (
            <GlassPanel solid className="p-8">
              <div className="text-center text-[hsl(var(--muted-foreground))]">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <div className="text-lg font-medium">No BAQ Data</div>
                <div className="text-sm mt-1">Run <span className="font-mono">{effectiveRunId}</span> does not have any build quality artifacts.</div>
                <div className="text-xs mt-2">BAQ artifacts are generated during the pipeline&apos;s build quality assessment pass.</div>
              </div>
            </GlassPanel>
          ) : (
            <>
              {availability === "partial" && (
                <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-md bg-[hsl(var(--status-warning)/0.1)] border border-[hsl(var(--status-warning)/0.3)] text-sm text-[hsl(var(--status-warning))]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Partial data: some BAQ artifacts are missing for this run. Available: {baqData?.available?.join(", ") ?? "unknown"}
                </div>
              )}
              {activeTab === "overview" && <OverviewTab artifacts={artifacts} />}
              {activeTab === "extraction" && <ExtractionTab artifacts={artifacts} />}
              {activeTab === "derived" && <DerivedPlanTab artifacts={artifacts} />}
              {activeTab === "inventory" && <InventoryTab artifacts={artifacts} />}
              {activeTab === "traceability" && <TraceabilityTab artifacts={artifacts} />}
              {activeTab === "delta" && <GenerationDeltaTab artifacts={artifacts} />}
              {activeTab === "gates" && <GatesTab artifacts={artifacts} />}
              {activeTab === "failures" && <FailuresTab artifacts={artifacts} />}
              {activeTab === "packaging" && <PackagingTab artifacts={artifacts} />}
              {activeTab === "history" && <HistoryTab />}
            </>
          )}
        </div>

        {effectiveRunId && availability !== "empty" && !baqLoading && (
          <div className="w-64 shrink-0 border-l border-[hsl(var(--border))] overflow-y-auto p-4 bg-[hsl(var(--card))]">
            <UtilityRail artifacts={artifacts} />
          </div>
        )}
      </div>
    </div>
  );
}
