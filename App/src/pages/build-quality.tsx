import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import {
  Shield, Activity, AlertTriangle, Target,
  ChevronDown, ChevronRight, CheckCircle2, XCircle, Loader2,
  FileText, Package, Layers, GitBranch,
  AlertOctagon, Wrench, TrendingUp, Download,
  Gauge, Boxes, Search, Database, Code, Lock,
  ArrowRight, Zap, Info,
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
  selectUnplannedGeneratedFiles,
  selectGateRows,
  selectFailureSummary,
  selectPackagingReconciliation,
  selectTrendSeries,
  selectTopBlockers,
  selectNextBestFix,
  selectTraceGaps,
  selectSufficiencyDimensions,
  selectSufficiencyGaps,
  selectInventoryByCategory,
  selectFailureRepairHints,
  selectUpstreamBlockers,
  selectMissingFileImpacts,
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

function CrossLink({ label, tabId, onClick }: { label: string; tabId: TabId; onClick: (tab: TabId) => void }) {
  return (
    <button
      onClick={() => onClick(tabId)}
      className="inline-flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline"
    >
      <ArrowRight className="w-3 h-3" />
      {label}
    </button>
  );
}

function OverviewTab({ artifacts, onNavigate }: { artifacts: BAQArtifacts; onNavigate: (tab: TabId) => void }) {
  const decision = selectFinalBuildDecision(artifacts);
  const coverage = selectCoverageMetrics(artifacts);
  const integrity = selectOutputIntegrityMetrics(artifacts);
  const blockers = selectTopBlockers(artifacts);
  const dimensions = selectSufficiencyDimensions(artifacts);
  const gaps = selectSufficiencyGaps(artifacts);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <GlassPanel solid className="p-4 col-span-2 lg:col-span-1">
          <div className="text-system-label mb-2">Final Decision</div>
          <StatusChip variant={decisionVariant(decision.decision)} label={decisionLabel(decision.decision)} size="md" />
          <div className="mt-2 text-2xl font-semibold tabular-nums text-[hsl(var(--foreground))]">{decision.qualityScore}<span className="text-sm text-[hsl(var(--muted-foreground))]">/100</span></div>
        </GlassPanel>
        <MetricCard icon={Target} label="Coverage" value={pct(coverage.requirementCoverage)} accent={coverage.requirementCoverage >= 80 ? "green" : "amber"} subtitle="requirement coverage" />
        <MetricCard icon={Gauge} label="Output Integrity" value={`${integrity.generatedFiles}/${integrity.totalFiles}`} accent="cyan" subtitle={`${integrity.missingRequired} missing`} />
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
          <div className="flex items-center justify-between mb-2">
            <div className="text-system-label">Active Blockers</div>
            <CrossLink label="View all gates" tabId="gates" onClick={onNavigate} />
          </div>
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

      {dimensions.length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Sufficiency Dimensions</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {dimensions.map((dim) => (
              <div key={dim.dimensionId} className={`rounded-md border p-3 ${dim.passed ? "border-[hsl(var(--status-success)/0.3)] bg-[hsl(var(--status-success)/0.05)]" : "border-[hsl(var(--status-failure)/0.3)] bg-[hsl(var(--status-failure)/0.05)]"}`}>
                <div className="text-xs text-system-label mb-1">{dim.name}</div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold tabular-nums">{dim.score}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">/ {dim.threshold} min</div>
                  {dim.passed ? <CheckCircle2 className="w-4 h-4 text-[hsl(var(--status-success))]" /> : <XCircle className="w-4 h-4 text-[hsl(var(--status-failure))]" />}
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{dim.detail}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {gaps.length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Sufficiency Gaps</div>
          {gaps.map((gap) => (
            <div key={gap.gapId} className="border-b border-[hsl(var(--border)/0.3)] pb-2 mb-2 last:border-0 last:mb-0">
              <div className="flex items-center gap-2 text-sm">
                <StatusChip variant={severityVariant(gap.severity)} label={gap.severity} />
                <span>{gap.description}</span>
              </div>
              {gap.recommendation && (
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 flex items-start gap-1">
                  <Wrench className="w-3 h-3 mt-0.5 shrink-0" />
                  {gap.recommendation}
                </div>
              )}
              {gap.affectedRefs.length > 0 && (
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Affected: {gap.affectedRefs.join(", ")}</div>
              )}
            </div>
          ))}
        </GlassPanel>
      )}

      <div className="flex gap-2 flex-wrap">
        <CrossLink label="View extraction details" tabId="extraction" onClick={onNavigate} />
        <CrossLink label="View traceability matrix" tabId="traceability" onClick={onNavigate} />
        <CrossLink label="View failure details" tabId="failures" onClick={onNavigate} />
        <CrossLink label="View packaging status" tabId="packaging" onClick={onNavigate} />
      </div>
    </div>
  );
}

function ExtractionTab({ artifacts }: { artifacts: BAQArtifacts }) {
  const rows = selectExtractionCoverageRows(artifacts);
  const obligations = selectCriticalObligationsByCategory(artifacts);
  const ext = artifacts.extraction;

  if (!ext) return <EmptyArtifact name="Kit Extraction" />;

  const missingSections = rows.filter((r) => r.status === "missing");
  const deferredSections = rows.filter((r) => r.status === "deferred");
  const invalidSections = rows.filter((r) => r.status === "invalid" || r.status === "not_applicable");

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
          headers={["Section", "Status", "Applicability", "Files", "Size", "Notes"]}
          rows={rows.map((r) => [
            <span className="font-mono text-xs">{r.sectionLabel}</span>,
            <StatusChip variant={r.status === "consumed" ? "success" : r.status === "missing" ? "failure" : "warning"} label={r.status} />,
            <span className="text-xs">{r.applicability}</span>,
            <span className="tabular-nums">{r.fileCount}</span>,
            <span className="text-xs tabular-nums">{(r.byteCount / 1024).toFixed(1)} KB</span>,
            <span className="text-xs text-[hsl(var(--muted-foreground))]">{r.notes.join(", ") || "—"}</span>,
          ])}
        />
      </GlassPanel>

      {missingSections.length > 0 && (
        <GlassPanel solid className="p-4" glow="red">
          <div className="text-system-label mb-3">Missing Sections ({missingSections.length})</div>
          <div className="space-y-2">
            {missingSections.map((s) => (
              <div key={s.sectionId} className="flex items-center gap-2 text-sm">
                <XCircle className="w-3.5 h-3.5 text-[hsl(var(--status-failure))]" />
                <span className="font-mono text-xs">{s.sectionId}</span>
                <span>{s.sectionLabel}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{s.applicability}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {deferredSections.length > 0 && (
        <GlassPanel solid className="p-4" glow="amber">
          <div className="text-system-label mb-3">Deferred Sections ({deferredSections.length})</div>
          <div className="space-y-2">
            {deferredSections.map((s) => (
              <div key={s.sectionId} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-[hsl(var(--status-warning))]" />
                <div>
                  <span className="font-mono text-xs mr-2">{s.sectionId}</span>
                  <span>{s.sectionLabel}</span>
                  {s.notes.length > 0 && <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.notes.join("; ")}</div>}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {invalidSections.length > 0 && (
        <GlassPanel solid className="p-4" glow="red">
          <div className="text-system-label mb-3">Invalid / Not Applicable Sections ({invalidSections.length})</div>
          <div className="space-y-2">
            {invalidSections.map((s) => (
              <div key={s.sectionId} className="flex items-center gap-2 text-sm">
                <Info className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                <span className="font-mono text-xs">{s.sectionId}</span>
                <span>{s.sectionLabel}</span>
                <StatusChip variant="neutral" label={s.status} />
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

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
                    {item.fulfillmentRef && <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">{item.fulfillmentRef}</span>}
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

      {(d.verification_obligations.length > 0 || d.ops_obligations.length > 0) && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Obligations</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-system-label mb-2">Verification ({d.verification_obligations.length})</div>
              {d.verification_obligations.map((v, i) => (
                <div key={i} className="text-xs text-[hsl(var(--foreground))] mb-1 flex items-start gap-1">
                  <Lock className="w-3 h-3 mt-0.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
                  {v.description}
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs text-system-label mb-2">Ops ({d.ops_obligations.length})</div>
              {d.ops_obligations.map((o, i) => (
                <div key={i} className="text-xs text-[hsl(var(--foreground))] mb-1 flex items-start gap-1">
                  <Zap className="w-3 h-3 mt-0.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
                  {o.description}
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      )}

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
  const categories = selectInventoryByCategory(artifacts);
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

      {categories.optional.length > 0 && (
        <GlassPanel solid className="p-4">
          <ExpandableRow title={<span className="text-system-label">Optional Files ({categories.optional.length})</span>}>
            <DataTable
              headers={["Path", "Role", "Layer", "Method"]}
              rows={categories.optional.map((f) => [
                <span className="font-mono text-xs">{f.path}</span>,
                <span className="text-xs">{f.role}</span>,
                <span className="text-xs">{f.layer}</span>,
                <StatusChip variant="neutral" label={f.generationMethod} />,
              ])}
            />
          </ExpandableRow>
        </GlassPanel>
      )}

      {categories.test.length > 0 && (
        <GlassPanel solid className="p-4">
          <ExpandableRow title={<span className="text-system-label">Test Files ({categories.test.length})</span>}>
            <DataTable
              headers={["Path", "Role", "Traces"]}
              rows={categories.test.map((f) => [
                <span className="font-mono text-xs">{f.path}</span>,
                <span className="text-xs">{f.role}</span>,
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{f.traceRefs.join(", ") || "—"}</span>,
              ])}
            />
          </ExpandableRow>
        </GlassPanel>
      )}

      {categories.config.length > 0 && (
        <GlassPanel solid className="p-4">
          <ExpandableRow title={<span className="text-system-label">Config Files ({categories.config.length})</span>}>
            <DataTable
              headers={["Path", "Layer", "Method"]}
              rows={categories.config.map((f) => [
                <span className="font-mono text-xs">{f.path}</span>,
                <span className="text-xs">{f.layer}</span>,
                <StatusChip variant="neutral" label={f.generationMethod} />,
              ])}
            />
          </ExpandableRow>
        </GlassPanel>
      )}

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

      {Object.keys(inv.summary.files_by_generation_method).length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Files by Generation Method</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(inv.summary.files_by_generation_method).map(([method, count]) => (
              <div key={method} className="glass-panel-solid p-3">
                <div className="text-xs text-system-label mb-1">{method.replace(/_/g, " ")}</div>
                <div className="text-lg font-semibold tabular-nums">{count as number}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      <GlassPanel solid className="p-4">
        <ExpandableRow title={<span className="text-system-label">All Manifest Targets ({allFiles.length})</span>}>
          <DataTable
            headers={["Path", "Role", "Layer", "Module", "Subsystem"]}
            rows={allFiles.map((f) => [
              <span className="font-mono text-xs">{f.path}</span>,
              <span className="text-xs">{f.role}</span>,
              <span className="text-xs">{f.layer}</span>,
              <span className="text-xs font-mono">{f.moduleRef}</span>,
              <span className="text-xs font-mono">{f.subsystemRef}</span>,
            ])}
          />
        </ExpandableRow>
      </GlassPanel>
    </div>
  );
}

function TraceabilityTab({ artifacts, onNavigate }: { artifacts: BAQArtifacts; onNavigate: (tab: TabId) => void }) {
  const summary = selectTraceCoverageSummary(artifacts);
  const chains = selectRequirementChains(artifacts);
  const traceGaps = selectTraceGaps(artifacts);
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

      {traceGaps.length > 0 && (
        <GlassPanel solid className="p-4" glow="amber">
          <div className="flex items-center justify-between mb-3">
            <div className="text-system-label">Trace Gaps ({traceGaps.length})</div>
            <CrossLink label="View failures" tabId="failures" onClick={onNavigate} />
          </div>
          <DataTable
            headers={["Requirement", "Status", "Missing Areas"]}
            rows={traceGaps.map((g) => [
              <div>
                <span className="font-mono text-xs">{g.requirementId}</span>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{g.description}</div>
              </div>,
              <StatusChip variant={g.coverageStatus === "partially_covered" ? "warning" : "failure"} label={g.coverageStatus.replace(/_/g, " ")} />,
              <div className="space-y-0.5">
                {g.missingAreas.map((area, i) => (
                  <div key={i} className="text-xs text-[hsl(var(--status-failure))]">{area}</div>
                ))}
              </div>,
            ])}
          />
        </GlassPanel>
      )}

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
              <div><span className="text-system-label">Verification:</span> {chain.verificationRefs.length > 0 ? chain.verificationRefs.join(", ") : "—"}</div>
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

function GenerationDeltaTab({ artifacts, onNavigate }: { artifacts: BAQArtifacts; onNavigate: (tab: TabId) => void }) {
  const integrity = selectOutputIntegrityMetrics(artifacts);
  const missingFiles = selectMissingRequiredFiles(artifacts);
  const missingFileImpacts = selectMissingFileImpacts(artifacts);
  const unplannedFiles = selectUnplannedGeneratedFiles(artifacts);
  const coverage = selectCoverageMetrics(artifacts);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={Database} label="Total Files" value={integrity.totalFiles} accent="cyan" />
        <MetricCard icon={Target} label="Required" value={integrity.requiredFiles} accent="green" />
        <MetricCard icon={CheckCircle2} label="Generated" value={integrity.generatedFiles} accent="green" subtitle="with traces" />
        <MetricCard icon={AlertTriangle} label="Missing Required" value={integrity.missingRequired} accent={integrity.missingRequired > 0 ? "red" : "green"} />
        <MetricCard icon={Search} label="Unplanned" value={unplannedFiles.length} accent={unplannedFiles.length > 0 ? "amber" : "green"} />
      </div>

      <GlassPanel solid className="p-4">
        <div className="text-system-label mb-3">Integrity Summary</div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="glass-panel-solid p-3">
            <div className="text-xs text-system-label mb-1">Placeholder Ratio</div>
            <div className={`text-lg font-semibold tabular-nums ${coverage.placeholderRatio > 20 ? "text-[hsl(var(--status-warning))]" : ""}`}>
              {pct(coverage.placeholderRatio)}
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">AI-assisted files as % of total</div>
          </div>
          <div className="glass-panel-solid p-3">
            <div className="text-xs text-system-label mb-1">Inventory Variance</div>
            <div className="text-lg font-semibold tabular-nums">{pct(coverage.inventoryVariance)}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Non-required as % of total</div>
          </div>
          <div className="glass-panel-solid p-3">
            <div className="text-xs text-system-label mb-1">Trace Coverage</div>
            <div className="text-lg font-semibold tabular-nums">{integrity.totalFiles > 0 ? pct((integrity.generatedFiles / integrity.totalFiles) * 100) : "N/A"}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Files with trace refs</div>
          </div>
        </div>
      </GlassPanel>

      {missingFileImpacts.length > 0 && (
        <GlassPanel solid className="p-4" glow="red">
          <div className="text-system-label mb-3">Missing Required Files — Impact Analysis ({missingFileImpacts.length})</div>
          {missingFileImpacts.map((impact) => (
            <ExpandableRow
              key={impact.fileId}
              defaultOpen={missingFileImpacts.length <= 3}
              title={
                <div className="flex items-center gap-3">
                  <XCircle className="w-3.5 h-3.5 text-[hsl(var(--status-failure))]" />
                  <span className="font-mono text-xs">{impact.path}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{impact.reason}</span>
                </div>
              }
            >
              <div className="space-y-3 text-sm">
                {impact.linkedRequirements.length > 0 && (
                  <div>
                    <div className="text-xs text-system-label mb-1 flex items-center gap-1">
                      <Target className="w-3 h-3" /> Linked Requirements ({impact.linkedRequirements.length})
                    </div>
                    {impact.linkedRequirements.map((req) => (
                      <div key={req.requirementId} className="flex items-center gap-2 text-xs ml-4 mb-0.5">
                        <StatusChip variant={req.coverageStatus === "fully_covered" ? "success" : req.coverageStatus === "partially_covered" ? "warning" : "failure"} label={req.coverageStatus.replace(/_/g, " ")} />
                        <span className="font-mono">{req.requirementId}</span>
                        <span className="text-[hsl(var(--muted-foreground))]">{req.description}</span>
                      </div>
                    ))}
                  </div>
                )}
                {impact.linkedAcceptanceItems.length > 0 && (
                  <div>
                    <div className="text-xs text-system-label mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Acceptance Items ({impact.linkedAcceptanceItems.length})
                    </div>
                    {impact.linkedAcceptanceItems.map((ai) => (
                      <div key={ai.acceptanceId} className="flex items-center gap-2 text-xs ml-4 mb-0.5">
                        {ai.fulfilled ? <CheckCircle2 className="w-3 h-3 text-[hsl(var(--status-success))]" /> : <XCircle className="w-3 h-3 text-[hsl(var(--status-failure))]" />}
                        <span>{ai.description}</span>
                      </div>
                    ))}
                  </div>
                )}
                {impact.gateImpact.length > 0 && (
                  <div>
                    <div className="text-xs text-system-label mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Gate Impact
                    </div>
                    {impact.gateImpact.map((g) => (
                      <div key={g.gateId} className="flex items-center gap-2 text-xs ml-4 mb-0.5">
                        <StatusChip variant="failure" label="FAIL" />
                        <span className="font-mono">{g.gateId}</span>
                        <span>{g.gateName}</span>
                      </div>
                    ))}
                    <CrossLink label="View gate details" tabId="gates" onClick={onNavigate} />
                  </div>
                )}
                {impact.packagingImpact.length > 0 && (
                  <div>
                    <div className="text-xs text-system-label mb-1 flex items-center gap-1">
                      <Package className="w-3 h-3" /> Packaging Impact
                    </div>
                    {impact.packagingImpact.map((p, i) => (
                      <div key={i} className="text-xs text-[hsl(var(--status-failure))] ml-4 mb-0.5">{p}</div>
                    ))}
                    <CrossLink label="View packaging" tabId="packaging" onClick={onNavigate} />
                  </div>
                )}
                {impact.linkedRequirements.length === 0 && impact.gateImpact.length === 0 && (
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">No linked requirements or gate impacts found for this file.</div>
                )}
              </div>
            </ExpandableRow>
          ))}
        </GlassPanel>
      )}

      {unplannedFiles.length > 0 && (
        <GlassPanel solid className="p-4" glow="amber">
          <div className="flex items-center justify-between mb-3">
            <div className="text-system-label">Unplanned Files ({unplannedFiles.length})</div>
            <CrossLink label="View inventory" tabId="inventory" onClick={onNavigate} />
          </div>
          <DataTable
            headers={["Path", "Reason"]}
            rows={unplannedFiles.map((f) => [
              <span className="font-mono text-xs">{f.path}</span>,
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{f.reason}</span>,
            ])}
          />
        </GlassPanel>
      )}

      {missingFiles.length === 0 && unplannedFiles.length === 0 && integrity.totalFiles === 0 && (
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

function GatesTab({ artifacts, onNavigate }: { artifacts: BAQArtifacts; onNavigate: (tab: TabId) => void }) {
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
                  <CrossLink label="View packaging impact" tabId="packaging" onClick={onNavigate} />
                </div>
              )}
            </div>
          </ExpandableRow>
        ))}
      </GlassPanel>
    </div>
  );
}

function FailuresTab({ artifacts, onNavigate }: { artifacts: BAQArtifacts; onNavigate: (tab: TabId) => void }) {
  const summary = selectFailureSummary(artifacts);
  const repairHints = selectFailureRepairHints(artifacts);
  const upstreamBlockers = selectUpstreamBlockers(artifacts);

  if (!artifacts.failureReport) return <EmptyArtifact name="Failure Report" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={AlertOctagon} label="Total Failures" value={summary.totalFailures} accent={summary.totalFailures > 0 ? "red" : "green"} />
        <MetricCard icon={AlertTriangle} label="Blocking" value={summary.blockingCount} accent={summary.blockingCount > 0 ? "red" : "green"} />
        <MetricCard icon={CheckCircle2} label="Resolved" value={summary.resolvedCount} accent="green" />
        <MetricCard icon={XCircle} label="Unresolved" value={summary.unresolvedCount} accent={summary.unresolvedCount > 0 ? "amber" : "green"} />
      </div>

      {upstreamBlockers.length > 0 && (
        <GlassPanel solid className="p-4" glow="red">
          <div className="flex items-center justify-between mb-3">
            <div className="text-system-label">Upstream Blockers ({upstreamBlockers.length})</div>
            <CrossLink label="View gates" tabId="gates" onClick={onNavigate} />
          </div>
          <DataTable
            headers={["Source", "Description", "Impact"]}
            rows={upstreamBlockers.map((b) => [
              <StatusChip variant="failure" label={b.source} />,
              <span className="text-sm">{b.description}</span>,
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{b.impact}</span>,
            ])}
          />
        </GlassPanel>
      )}

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
            headers={["ID", "Class", "Severity", "Phase", "Description", "File", "Resolved"]}
            rows={summary.failures.map((f) => [
              <span className="font-mono text-xs">{f.failure_id}</span>,
              <span className="text-xs">{f.failure_class.replace(/_/g, " ")}</span>,
              <StatusChip variant={severityVariant(f.severity)} label={f.severity} />,
              <span className="text-xs">{f.phase}</span>,
              <span className="text-sm">{f.description}</span>,
              <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">{f.file_ref || "—"}</span>,
              f.resolved ? <CheckCircle2 className="w-4 h-4 text-[hsl(var(--status-success))]" /> : <XCircle className="w-4 h-4 text-[hsl(var(--status-failure))]" />,
            ])}
          />
        </GlassPanel>
      )}

      {repairHints.length > 0 && (
        <GlassPanel solid className="p-4" glow="cyan">
          <div className="text-system-label mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Repair Hints
          </div>
          <div className="space-y-3">
            {repairHints.map((hint) => (
              <div key={hint.failureId} className="border-b border-[hsl(var(--border)/0.3)] pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusChip variant={severityVariant(hint.severity)} label={hint.severity} />
                  <span className="font-mono text-xs">{hint.failureId}</span>
                  {hint.isBlocking && <span className="text-xs text-[hsl(var(--status-failure))] font-medium">BLOCKING</span>}
                </div>
                <div className="text-sm text-[hsl(var(--foreground))]">{hint.description}</div>
                <div className="text-sm text-[hsl(var(--primary))] mt-1 flex items-start gap-1">
                  <Wrench className="w-3 h-3 mt-0.5 shrink-0" />
                  {hint.resolution}
                </div>
                {hint.fileRef && (
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-mono">File: {hint.fileRef}</div>
                )}
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {artifacts.packagingDecision && artifacts.packagingDecision.missing_artifacts.length > 0 && (
        <GlassPanel solid className="p-4" glow="red">
          <div className="flex items-center justify-between mb-3">
            <div className="text-system-label">Missing Artifacts</div>
            <CrossLink label="View packaging" tabId="packaging" onClick={onNavigate} />
          </div>
          <DataTable
            headers={["Artifact"]}
            rows={artifacts.packagingDecision.missing_artifacts.map((a) => [
              <span className="font-mono text-sm text-[hsl(var(--status-failure))]">{a}</span>,
            ])}
          />
        </GlassPanel>
      )}
    </div>
  );
}

function PackagingTab({ artifacts, onNavigate }: { artifacts: BAQArtifacts; onNavigate: (tab: TabId) => void }) {
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
          <div className="flex items-center justify-between mb-3">
            <div className="text-system-label">Gate Failures</div>
            <CrossLink label="View gate details" tabId="gates" onClick={onNavigate} />
          </div>
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

function HistoryTab({ artifacts, allRuns }: { artifacts: BAQArtifacts; allRuns: Array<{ runId: string; hasBAQ: boolean }> }) {
  const trend = selectTrendSeries(artifacts);
  const baqRuns = allRuns.filter((r) => r.hasBAQ);

  return (
    <div className="space-y-6">
      {trend.length > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-3">Current Run Quality</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {trend.map((t) => (
              <div key={t.runId} className="glass-panel-solid p-3">
                <div className="text-xs font-mono text-system-label mb-1">{t.runId}</div>
                <div className="text-lg font-semibold tabular-nums">{t.qualityScore}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{t.gatesPassed}/{t.gatesTotal} gates · {decisionLabel(t.decision)}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      <GlassPanel solid className="p-4">
        <div className="text-system-label mb-3">BAQ-Enabled Runs ({baqRuns.length})</div>
        {baqRuns.length === 0 ? (
          <div className="text-sm text-[hsl(var(--muted-foreground))]">No runs with BAQ data found.</div>
        ) : (
          <DataTable
            headers={["Run ID", "BAQ Status"]}
            rows={baqRuns.map((r) => [
              <span className="font-mono text-xs">{r.runId}</span>,
              <StatusChip variant="success" label="Available" />,
            ])}
          />
        )}
      </GlassPanel>

      <GlassPanel solid className="p-6">
        <div className="text-center text-[hsl(var(--muted-foreground))]">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm font-medium">Trend Analysis</div>
          <div className="text-xs mt-1">Cross-run trend charts will populate as more runs complete with BAQ artifacts.</div>
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

function UtilityRail({ artifacts, onNavigate, effectiveRunId, allRuns }: { artifacts: BAQArtifacts; onNavigate: (tab: TabId) => void; effectiveRunId: string; allRuns: Array<{ runId: string; hasBAQ: boolean }> }) {
  const blockers = selectTopBlockers(artifacts);
  const fix = selectNextBestFix(artifacts);
  const missing = selectMissingRequiredFiles(artifacts);
  const decision = selectFinalBuildDecision(artifacts);
  const trend = selectTrendSeries(artifacts);

  const baqRuns = allRuns.filter((r) => r.hasBAQ);
  const currentIdx = baqRuns.findIndex((r) => r.runId === effectiveRunId);
  const previousRunId = currentIdx > 0 ? baqRuns[currentIdx - 1].runId : null;

  const { data: prevData } = useQuery({
    queryKey: ["/api/baq/runs", previousRunId, "delta"],
    queryFn: () => apiRequest(`/api/baq/runs/${previousRunId}`),
    enabled: !!previousRunId,
  });

  const prevDecision = prevData?.qualityReport ? {
    score: prevData.qualityReport.overall_quality_score as number,
    decision: prevData.qualityReport.decision as string,
    gatesPassed: (prevData.qualityReport.gate_summary as { passed: number }).passed,
    gatesTotal: (prevData.qualityReport.gate_summary as { total_gates: number }).total_gates,
  } : null;

  const qualityDelta = prevDecision ? decision.qualityScore - prevDecision.score : null;

  const handleExport = useCallback((type: string) => {
    const url = `/api/baq/runs/${effectiveRunId}/artifact/${type}`;
    window.open(url, "_blank");
  }, [effectiveRunId]);

  return (
    <div className="space-y-4">
      {decision.qualityScore > 0 && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-2 flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Quality Score
          </div>
          <div className="text-3xl font-bold tabular-nums text-center text-[hsl(var(--foreground))]">
            {decision.qualityScore}
          </div>
          <div className="text-xs text-center text-[hsl(var(--muted-foreground))]">out of 100</div>
          {trend.length > 0 && (
            <div className="mt-2 text-xs text-center text-[hsl(var(--muted-foreground))]">
              {trend[0].decision === "approved" ? "✓ Approved" : trend[0].decision === "approved_with_warnings" ? "⚠ Warnings" : "✗ " + decisionLabel(trend[0].decision)}
            </div>
          )}
        </GlassPanel>
      )}

      {qualityDelta !== null && previousRunId && (
        <GlassPanel solid className="p-4">
          <div className="text-system-label mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Delta vs Previous
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold tabular-nums ${qualityDelta > 0 ? "text-[hsl(var(--status-success))]" : qualityDelta < 0 ? "text-[hsl(var(--status-failure))]" : "text-[hsl(var(--muted-foreground))]"}`}>
              {qualityDelta > 0 ? "+" : ""}{qualityDelta}
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              vs {previousRunId} ({prevDecision!.score}/100)
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              Gates: {prevDecision!.gatesPassed}/{prevDecision!.gatesTotal} → {decision.gatesPassed}/{decision.gatesTotal}
            </div>
          </div>
        </GlassPanel>
      )}

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
            <CrossLink label="View all gates" tabId="gates" onClick={onNavigate} />
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
          <CrossLink label="View gen delta" tabId="delta" onClick={onNavigate} />
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
          <button onClick={() => handleExport("quality-report")} className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] flex items-center gap-1">
            <Download className="w-3 h-3" /> Quality Report (JSON)
          </button>
          <button onClick={() => handleExport("failure-report")} className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] flex items-center gap-1">
            <Download className="w-3 h-3" /> Failure Report (JSON)
          </button>
          <button onClick={() => handleExport("trace-map")} className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] flex items-center gap-1">
            <Download className="w-3 h-3" /> Trace Map (JSON)
          </button>
          <button onClick={() => handleExport("sufficiency")} className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] flex items-center gap-1">
            <Download className="w-3 h-3" /> Sufficiency (JSON)
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

  const [assemblyFilter, setAssemblyFilter] = useState<string>("all");

  const runs: Array<{ runId: string; hasBAQ: boolean; artifacts: string[]; assemblyId: number | null; assemblyName: string | null }> = runsData?.runs ?? [];

  const assemblyNames = Array.from(new Set(runs.filter((r) => r.assemblyName).map((r) => r.assemblyName!)));

  const filteredRuns = assemblyFilter === "all" ? runs : runs.filter((r) => r.assemblyName === assemblyFilter);
  const effectiveRunId = selectedRunId ?? (filteredRuns.length > 0 ? filteredRuns[0].runId : null);

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

  const handleNavigate = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

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
              {assemblyNames.length > 0 && (
                <div className="relative">
                  <select
                    value={assemblyFilter}
                    onChange={(e) => { setAssemblyFilter(e.target.value); setSelectedRunId(null); }}
                    className="appearance-none bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] text-sm px-3 py-1.5 pr-8 rounded-md border border-[hsl(var(--border))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
                  >
                    <option value="all">All Assemblies</option>
                    {assemblyNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] pointer-events-none" />
                </div>
              )}
              <div className="relative">
                <select
                  value={effectiveRunId ?? ""}
                  onChange={(e) => setSelectedRunId(e.target.value || null)}
                  className="appearance-none bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] text-sm px-3 py-1.5 pr-8 rounded-md border border-[hsl(var(--border))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
                >
                  {filteredRuns.length === 0 && <option value="">No runs available</option>}
                  {filteredRuns.map((r) => (
                    <option key={r.runId} value={r.runId}>
                      {r.runId} {r.assemblyName ? `(${r.assemblyName})` : ""} {r.hasBAQ ? "" : "(no BAQ)"}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] pointer-events-none" />
              </div>
              {effectiveRunId && (
                <>
                  <StatusChip variant={decisionVariant(decision.decision)} label={decisionLabel(decision.decision)} size="md" />
                  {decision.qualityScore > 0 && (
                    <span className="text-sm font-semibold tabular-nums text-[hsl(var(--foreground))]">{decision.qualityScore}/100</span>
                  )}
                  <StatusChip variant={decision.packagingAllowed ? "success" : "failure"} label={decision.packagingAllowed ? "Pkg: Allowed" : "Pkg: Blocked"} />
                  {decision.gatesFailed > 0 && (
                    <button onClick={() => setActiveTab("gates")} className="text-xs text-[hsl(var(--status-failure))] hover:underline">
                      {decision.gatesFailed} gate(s) failed
                    </button>
                  )}
                  <div className="h-4 w-px bg-[hsl(var(--border))]" />
                  <div className="flex items-center gap-1">
                    <button onClick={() => setActiveTab("failures")} className="p-1 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" title="Failures">
                      <AlertOctagon className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setActiveTab("traceability")} className="p-1 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" title="Trace Gaps">
                      <GitBranch className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setActiveTab("delta")} className="p-1 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" title="Missing Files">
                      <Search className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setActiveTab("packaging")} className="p-1 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" title="Packaging">
                      <Package className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => window.open(`/api/baq/runs/${effectiveRunId}/artifact/failure-report`, "_blank")} className="p-1 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" title="Export Failure Report">
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => window.open(`/api/baq/runs/${effectiveRunId}/artifact/quality-report`, "_blank")} className="p-1 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" title="Export Quality Report">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {effectiveRunId && availability !== "empty" && (
            <div className="grid grid-cols-6 gap-3">
              <div className="glass-panel-solid px-3 py-2 text-center cursor-pointer hover:bg-[hsl(var(--accent)/0.5)]" onClick={() => setActiveTab("extraction")}>
                <div className="text-[10px] text-system-label">Extraction</div>
                <div className="text-sm font-semibold tabular-nums">{pct(coverage.extractionCoverage)}</div>
              </div>
              <div className="glass-panel-solid px-3 py-2 text-center cursor-pointer hover:bg-[hsl(var(--accent)/0.5)]" onClick={() => setActiveTab("traceability")}>
                <div className="text-[10px] text-system-label">Requirement</div>
                <div className="text-sm font-semibold tabular-nums">{pct(coverage.requirementCoverage)}</div>
              </div>
              <div className="glass-panel-solid px-3 py-2 text-center cursor-pointer hover:bg-[hsl(var(--accent)/0.5)]" onClick={() => setActiveTab("traceability")}>
                <div className="text-[10px] text-system-label">Acceptance</div>
                <div className="text-sm font-semibold tabular-nums">{pct(coverage.acceptanceCoverage)}</div>
              </div>
              <div className="glass-panel-solid px-3 py-2 text-center cursor-pointer hover:bg-[hsl(var(--accent)/0.5)]" onClick={() => setActiveTab("overview")}>
                <div className="text-[10px] text-system-label">Proof</div>
                <div className="text-sm font-semibold tabular-nums">{pct(coverage.proofCompletion)}</div>
              </div>
              <div className="glass-panel-solid px-3 py-2 text-center cursor-pointer hover:bg-[hsl(var(--accent)/0.5)]" onClick={() => setActiveTab("inventory")}>
                <div className="text-[10px] text-system-label">Inv. Variance</div>
                <div className="text-sm font-semibold tabular-nums">{pct(coverage.inventoryVariance)}</div>
              </div>
              <div className="glass-panel-solid px-3 py-2 text-center cursor-pointer hover:bg-[hsl(var(--accent)/0.5)]" onClick={() => setActiveTab("delta")}>
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
              {baqData?.invalid?.length > 0 && (
                <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-md bg-[hsl(var(--status-failure)/0.1)] border border-[hsl(var(--status-failure)/0.3)] text-sm text-[hsl(var(--status-failure))]">
                  <XCircle className="w-4 h-4 shrink-0" />
                  Invalid artifacts (corrupt or unparseable): {baqData.invalid.join(", ")}
                </div>
              )}
              {activeTab === "overview" && <OverviewTab artifacts={artifacts} onNavigate={handleNavigate} />}
              {activeTab === "extraction" && <ExtractionTab artifacts={artifacts} />}
              {activeTab === "derived" && <DerivedPlanTab artifacts={artifacts} />}
              {activeTab === "inventory" && <InventoryTab artifacts={artifacts} />}
              {activeTab === "traceability" && <TraceabilityTab artifacts={artifacts} onNavigate={handleNavigate} />}
              {activeTab === "delta" && <GenerationDeltaTab artifacts={artifacts} onNavigate={handleNavigate} />}
              {activeTab === "gates" && <GatesTab artifacts={artifacts} onNavigate={handleNavigate} />}
              {activeTab === "failures" && <FailuresTab artifacts={artifacts} onNavigate={handleNavigate} />}
              {activeTab === "packaging" && <PackagingTab artifacts={artifacts} onNavigate={handleNavigate} />}
              {activeTab === "history" && <HistoryTab artifacts={artifacts} allRuns={runs} />}
            </>
          )}
        </div>

        {effectiveRunId && availability !== "empty" && !baqLoading && (
          <div className="w-64 shrink-0 border-l border-[hsl(var(--border))] overflow-y-auto p-4 bg-[hsl(var(--card))]">
            <UtilityRail artifacts={artifacts} onNavigate={handleNavigate} effectiveRunId={effectiveRunId} allRuns={runs} />
          </div>
        )}
      </div>
    </div>
  );
}
