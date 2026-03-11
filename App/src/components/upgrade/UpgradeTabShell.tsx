import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "../../lib/queryClient";
import { Loader2, ArrowUpCircle } from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";

import { UpgradeHeaderRail } from "./UpgradeHeaderRail";
import { UpgradeSessionLauncher } from "./UpgradeSessionLauncher";
import { CurrentUpgradeSessionCard } from "./CurrentUpgradeSessionCard";
import { RevisionTimeline } from "./RevisionTimeline";
import { UpgradeTabSwitcher } from "./UpgradeTabSwitcher";
import { UpgradePlanPanel } from "./UpgradePlanPanel";
import { UpgradeWorkspacePanel } from "./UpgradeWorkspacePanel";
import { RevisionComparePanel } from "./RevisionComparePanel";
import { UpgradeVerificationPanel } from "./UpgradeVerificationPanel";
import { UpgradePromotionPanel } from "./UpgradePromotionPanel";
import { UpgradeActionFooter } from "./UpgradeActionFooter";

import type {
  UpgradeInternalTabId, UpgradeRevisionSummary, UpgradeSessionSummary,
  UpgradePlanData, RevisionDiffData, RevisionVerificationDetail,
  UpgradeVerificationSummary, UpgradeLineagePreview,
  StartUpgradeSessionInput,
} from "../../../../shared/upgrade-types";
import { UPGRADE_MODE_OPTIONS } from "../../../../shared/upgrade-types";

function getErrorMessage(err: unknown): string | undefined {
  if (err && typeof err === "object" && "message" in err) return (err as { message: string }).message;
  return undefined;
}

interface UpgradeTabShellProps {
  assemblyId: number;
}

export function UpgradeTabShell({ assemblyId }: UpgradeTabShellProps) {
  const qc = useQueryClient();
  const [internalTab, setInternalTab] = useState<UpgradeInternalTabId>("plan");
  const [showLauncher, setShowLauncher] = useState(false);
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);
  const [launcherSourceRevisionId, setLauncherSourceRevisionId] = useState<string | null>(null);
  const base = `/api/assemblies/${assemblyId}`;

  const { data: bootData, isLoading: bootLoading } = useQuery<{
    revisions: UpgradeRevisionSummary[];
    sessions: UpgradeSessionSummary[];
    activeSession: UpgradeSessionSummary | null;
    activeRevision: UpgradeRevisionSummary | null;
    candidateRevision: UpgradeRevisionSummary | null;
    sourceRevision: UpgradeRevisionSummary | null;
    verificationSummary: UpgradeVerificationSummary | null;
  }>({
    queryKey: [base, "upgrade", "boot"],
    queryFn: () => apiRequest(`${base}/upgrade`),
    refetchInterval: 15000,
  });

  const activeSession = bootData?.activeSession ?? null;
  const revisions = bootData?.revisions ?? [];
  const activeRevision = bootData?.activeRevision ?? null;
  const candidateRevision = bootData?.candidateRevision ?? null;
  const verificationSummary = bootData?.verificationSummary ?? null;

  const rollbackTarget = revisions.find(r =>
    r.isRollbackTarget && r.id !== activeRevision?.id
  ) ?? null;

  const lastPromotedAt = revisions
    .filter(r => r.promotedAt)
    .sort((a, b) => new Date(b.promotedAt!).getTime() - new Date(a.promotedAt!).getTime())[0]?.promotedAt ?? null;

  const { data: planWrapper } = useQuery<{ plan: UpgradePlanData | null }>({
    queryKey: [base, "upgrade", "plan", activeSession?.id],
    queryFn: () => apiRequest(`${base}/upgrades/sessions/${activeSession!.id}/plan`),
    enabled: !!activeSession,
  });
  const planData = planWrapper?.plan ?? null;

  const { data: diffWrapper } = useQuery<{ diff: RevisionDiffData | null }>({
    queryKey: [base, "upgrade", "diff", activeRevision?.id, candidateRevision?.id],
    queryFn: () =>
      activeRevision && candidateRevision
        ? apiRequest(`${base}/upgrades/diffs/${activeRevision.id}/${candidateRevision.id}`)
        : Promise.resolve({ diff: null }),
    enabled: !!activeRevision && !!candidateRevision,
  });
  const diffData = diffWrapper?.diff ?? null;

  const { data: verificationWrapper } = useQuery<{ verification: RevisionVerificationDetail | null }>({
    queryKey: [base, "upgrade", "verification", candidateRevision?.id],
    queryFn: () =>
      candidateRevision
        ? apiRequest(`${base}/upgrades/verifications/${candidateRevision.id}`)
        : Promise.resolve({ verification: null }),
    enabled: !!candidateRevision,
  });
  const verificationDetail = verificationWrapper?.verification ?? null;

  const { data: lineageWrapper } = useQuery<{ lineagePreview: UpgradeLineagePreview | null }>({
    queryKey: [base, "upgrade", "lineage", candidateRevision?.id],
    queryFn: () =>
      candidateRevision
        ? apiRequest(`${base}/upgrades/lineage/${candidateRevision.id}`)
        : Promise.resolve({ lineagePreview: null }),
    enabled: !!candidateRevision,
  });
  const lineagePreview = lineageWrapper?.lineagePreview ?? null;

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: [base, "upgrade"] });
  }

  const baselineMutation = useMutation({
    mutationFn: () => apiRequest(`${base}/upgrade/baseline`, { method: "POST" }),
    onSuccess: () => { toast.success("Baseline revision created"); invalidateAll(); },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || "Failed to create baseline"),
  });

  const startSessionMutation = useMutation({
    mutationFn: (input: StartUpgradeSessionInput) =>
      apiRequest(`${base}/upgrades/sessions`, { method: "POST", body: JSON.stringify(input), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => { toast.success("Upgrade session started"); setShowLauncher(false); invalidateAll(); },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || "Failed to start session"),
  });

  const generatePlanMutation = useMutation({
    mutationFn: (sessionId: string) =>
      apiRequest(`${base}/upgrades/sessions/${sessionId}/plan/generate`, { method: "POST" }),
    onSuccess: () => { toast.success("Plan generated"); invalidateAll(); },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || "Failed to generate plan"),
  });

  const regeneratePlanMutation = useMutation({
    mutationFn: (sessionId: string) =>
      apiRequest(`${base}/upgrades/sessions/${sessionId}/plan/regenerate`, { method: "POST" }),
    onSuccess: () => { toast.success("Plan regenerated"); invalidateAll(); },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || "Failed to regenerate plan"),
  });

  const approvePlanMutation = useMutation({
    mutationFn: (sessionId: string) =>
      apiRequest(`${base}/upgrades/sessions/${sessionId}/plan/approve`, { method: "POST" }),
    onSuccess: () => { toast.success("Plan approved"); invalidateAll(); },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || "Failed to approve plan"),
  });

  const executeMutation = useMutation({
    mutationFn: (sessionId: string) =>
      apiRequest(`${base}/upgrades/sessions/${sessionId}/execute`, { method: "POST" }),
    onSuccess: () => { toast.success("Execution started"); invalidateAll(); },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || "Failed to start execution"),
  });

  const generateDiffMutation = useMutation({
    mutationFn: () => {
      if (!activeRevision || !candidateRevision) return Promise.reject(new Error("Missing revisions"));
      return apiRequest(`${base}/upgrades/diffs/generate`, {
        method: "POST",
        body: JSON.stringify({ sourceRevisionId: activeRevision.id, candidateRevisionId: candidateRevision.id }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => { toast.success("Diff generated"); invalidateAll(); },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || "Failed to generate diff"),
  });

  const runVerificationMutation = useMutation({
    mutationFn: () => {
      if (!candidateRevision) return Promise.reject(new Error("No candidate"));
      return apiRequest(`${base}/upgrades/verifications/${candidateRevision.id}/run`, { method: "POST" });
    },
    onSuccess: () => { toast.success("Verification started"); invalidateAll(); },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || "Failed to run verification"),
  });

  const promoteMutation = useMutation({
    mutationFn: (notes: string) =>
      apiRequest(`${base}/upgrades/promote`, {
        method: "POST",
        body: JSON.stringify({ revisionId: candidateRevision?.id, notes, confirm: true }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => { toast.success("Revision promoted successfully"); invalidateAll(); },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || "Failed to promote"),
  });

  const rollbackMutation = useMutation({
    mutationFn: ({ targetRevisionId, reason }: { targetRevisionId: string; reason: string }) =>
      apiRequest(`${base}/upgrades/rollback`, {
        method: "POST",
        body: JSON.stringify({ targetRevisionId, reason, confirm: true }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => { toast.success("Rollback executed"); invalidateAll(); },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || "Failed to rollback"),
  });

  const pauseMutation = useMutation({
    mutationFn: (sessionId: string) =>
      apiRequest(`${base}/upgrades/sessions/${sessionId}/pause`, { method: "POST" }),
    onSuccess: () => { toast.success("Execution paused"); invalidateAll(); },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || "Failed to pause"),
  });

  const saveCandidateMutation = useMutation({
    mutationFn: (sessionId: string) =>
      apiRequest(`${base}/upgrades/sessions/${sessionId}/save-candidate`, { method: "POST" }),
    onSuccess: () => { toast.success("Candidate saved"); invalidateAll(); },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || "Failed to save candidate"),
  });

  const retryStepMutation = useMutation({
    mutationFn: ({ sessionId, stepId }: { sessionId: string; stepId: string }) =>
      apiRequest(`${base}/upgrades/sessions/${sessionId}/retry-step`, {
        method: "POST",
        body: JSON.stringify({ stepId }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => { toast.success("Step retried"); invalidateAll(); },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || "Failed to retry step"),
  });

  const cancelSessionMutation = useMutation({
    mutationFn: (sessionId: string) =>
      apiRequest(`${base}/upgrades/sessions/${sessionId}/cancel`, { method: "POST" }),
    onSuccess: () => { toast.success("Session cancelled"); invalidateAll(); },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || "Failed to cancel session"),
  });

  const archiveSessionMutation = useMutation({
    mutationFn: (sessionId: string) =>
      apiRequest(`${base}/upgrades/sessions/${sessionId}/archive`, { method: "POST" }),
    onSuccess: () => { toast.success("Session archived"); invalidateAll(); },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || "Failed to archive session"),
  });

  if (bootLoading) {
    return (
      <GlassPanel solid>
        <div className="p-12 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          <div className="text-sm text-[hsl(var(--muted-foreground))]">Loading upgrade workspace...</div>
        </div>
      </GlassPanel>
    );
  }

  if (revisions.length === 0 && !activeSession) {
    return (
      <GlassPanel solid>
        <div className="p-8 space-y-4 text-center">
          <ArrowUpCircle className="w-12 h-12 text-violet-400/40 mx-auto" />
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Upgrade Workspace</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md mx-auto">
            No revisions exist yet. Create a baseline revision from the current assembly state to begin tracking upgrades.
          </p>
          <button
            onClick={() => baselineMutation.mutate()}
            disabled={baselineMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-medium transition-colors"
          >
            {baselineMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpCircle className="w-4 h-4" />}
            Create Baseline Revision
          </button>
          {baselineMutation.error && (
            <div className="text-sm text-red-400">{getErrorMessage(baselineMutation.error) || "Failed"}</div>
          )}
        </div>
      </GlassPanel>
    );
  }

  const hasActiveSession = !!activeSession;
  const disabledTabs: UpgradeInternalTabId[] = [];
  if (!hasActiveSession) {
    disabledTabs.push("workspace");
  }
  if (!candidateRevision) {
    disabledTabs.push("compare", "verify", "promote");
  }

  return (
    <div className="space-y-4">
      <UpgradeHeaderRail
        activeRevision={activeRevision}
        sourceRevision={activeRevision}
        candidateRevision={candidateRevision}
        activeSession={activeSession}
        verificationSummary={verificationSummary}
        rollbackTarget={rollbackTarget}
        lastPromotedAt={lastPromotedAt}
        onViewDiff={() => setInternalTab("compare")}
        onRunVerification={() => { setInternalTab("verify"); runVerificationMutation.mutate(); }}
        onPromote={() => setInternalTab("promote")}
        onRollback={() => setInternalTab("promote")}
      />

      <RevisionTimeline
        revisions={revisions}
        activeRevisionId={activeRevision?.id}
        candidateRevisionId={candidateRevision?.id}
        selectedRevisionId={selectedRevisionId}
        onSelectRevision={setSelectedRevisionId}
        onCompareToActive={(revId) => { setSelectedRevisionId(revId); setInternalTab("compare"); }}
        onStartUpgradeFromRevision={(revId) => {
          setLauncherSourceRevisionId(revId);
          setShowLauncher(true);
        }}
        onPromoteRevision={() => setInternalTab("promote")}
        onRollbackRevision={() => setInternalTab("promote")}
        onArchiveRevision={(revId) => {
          apiRequest(`${base}/revisions/${revId}/archive`, { method: "POST" })
            .then(() => { toast.success("Revision archived"); invalidateAll(); })
            .catch(() => toast.error("Failed to archive revision"));
        }}
      />

      {!hasActiveSession && !showLauncher && (
        <div className="flex justify-center">
          <button
            onClick={() => { setLauncherSourceRevisionId(activeRevision?.id ?? null); setShowLauncher(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <ArrowUpCircle className="w-4 h-4" /> Start Upgrade Session
          </button>
        </div>
      )}

      {showLauncher && !hasActiveSession && (
        <UpgradeSessionLauncher
          revisions={revisions}
          modeOptions={UPGRADE_MODE_OPTIONS}
          defaultSourceRevisionId={launcherSourceRevisionId}
          isSubmitting={startSessionMutation.isPending}
          submitError={getErrorMessage(startSessionMutation.error)}
          onStartSession={(input) => startSessionMutation.mutate(input)}
        />
      )}

      {hasActiveSession && (
        <>
          <CurrentUpgradeSessionCard
            session={activeSession!}
            sourceRevision={revisions.find(r => r.id === activeSession!.sourceRevisionId) ?? null}
            candidateRevision={candidateRevision}
            onOpenPlan={() => setInternalTab("plan")}
            onOpenWorkspace={() => setInternalTab("workspace")}
            onCancelSession={(id) => cancelSessionMutation.mutate(id)}
            onArchiveSession={(id) => archiveSessionMutation.mutate(id)}
          />

          <UpgradeTabSwitcher
            activeTab={internalTab}
            onChangeTab={setInternalTab}
            disabledTabs={disabledTabs}
          />

          <div className="min-h-[300px]">
            {internalTab === "plan" && (
              <UpgradePlanPanel
                session={activeSession!}
                plan={planData}
                isGenerating={generatePlanMutation.isPending}
                isApproving={approvePlanMutation.isPending}
                error={getErrorMessage(generatePlanMutation.error) || getErrorMessage(approvePlanMutation.error)}
                onGeneratePlan={(id) => generatePlanMutation.mutate(id)}
                onApprovePlan={(id) => approvePlanMutation.mutate(id)}
                onRegeneratePlan={(id) => regeneratePlanMutation.mutate(id)}
                onCancelSession={(id) => cancelSessionMutation.mutate(id)}
              />
            )}

            {internalTab === "workspace" && (
              <UpgradeWorkspacePanel
                session={activeSession!}
                candidateRevision={candidateRevision}
                executionSteps={[]}
                changedArtifacts={[]}
                isExecuting={activeSession?.status === "executing" || executeMutation.isPending}
                error={getErrorMessage(executeMutation.error) || getErrorMessage(pauseMutation.error)}
                onStartExecution={(id) => executeMutation.mutate(id)}
                onPauseExecution={(id) => pauseMutation.mutate(id)}
                onRetryStep={(sessionId, stepId) => retryStepMutation.mutate({ sessionId, stepId })}
                onSaveCandidate={(id) => saveCandidateMutation.mutate(id)}
              />
            )}

            {internalTab === "compare" && (
              <RevisionComparePanel
                sourceRevision={activeRevision}
                candidateRevision={candidateRevision}
                diff={diffData}
                isLoading={generateDiffMutation.isPending}
                error={getErrorMessage(generateDiffMutation.error)}
                onGenerateDiff={() => generateDiffMutation.mutate()}
                onRefreshDiff={() => invalidateAll()}
              />
            )}

            {internalTab === "verify" && (
              <UpgradeVerificationPanel
                verification={verificationDetail}
                isRunning={runVerificationMutation.isPending}
                error={getErrorMessage(runVerificationMutation.error)}
                onRunVerification={() => runVerificationMutation.mutate()}
                onRefreshVerification={() => invalidateAll()}
              />
            )}

            {internalTab === "promote" && (
              <UpgradePromotionPanel
                session={activeSession!}
                candidateRevision={candidateRevision}
                activeRevision={activeRevision}
                verificationSummary={verificationSummary}
                diffStats={diffData?.stats ?? null}
                lineagePreview={lineagePreview}
                rollbackTarget={rollbackTarget}
                isPromoting={promoteMutation.isPending}
                isRollingBack={rollbackMutation.isPending}
                error={getErrorMessage(promoteMutation.error) || getErrorMessage(rollbackMutation.error)}
                onPromote={(notes) => promoteMutation.mutate(notes)}
                onRollback={(targetRevisionId, reason) => rollbackMutation.mutate({ targetRevisionId, reason })}
              />
            )}
          </div>

          <UpgradeActionFooter
            session={activeSession}
            currentTab={internalTab}
            onNavigateTab={setInternalTab}
          />
        </>
      )}
    </div>
  );
}
