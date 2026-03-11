import { useState } from "react";
import { Loader2, Rocket } from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";
import { UpgradeModeBadge, RevisionStatusChip } from "./shared";
import type { UpgradeRevisionSummary, UpgradeModeOption, StartUpgradeSessionInput, UpgradeSessionSummary, UpgradeModeId } from "../../../../shared/upgrade-types";

interface UpgradeSessionLauncherProps {
  revisions: UpgradeRevisionSummary[];
  modeOptions: UpgradeModeOption[];
  defaultSourceRevisionId?: string | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onStartSession: (input: StartUpgradeSessionInput) => void;
  previousSessions?: UpgradeSessionSummary[];
}

export function UpgradeSessionLauncher({
  revisions, modeOptions, defaultSourceRevisionId,
  isSubmitting, submitError, onStartSession,
}: UpgradeSessionLauncherProps) {
  const activeRevisions = revisions.filter(r => r.status === "active" || r.status === "approved");
  const [sourceRevisionId, setSourceRevisionId] = useState(defaultSourceRevisionId || activeRevisions[0]?.id || "");
  const [modeId, setModeId] = useState<UpgradeModeId>(modeOptions[0]?.id || "" as UpgradeModeId);
  const [objective, setObjective] = useState("");
  const [scope, setScope] = useState("");
  const [instructions, setInstructions] = useState("");
  const [compatibilityRequired, setCompatibilityRequired] = useState(false);

  const canSubmit = sourceRevisionId && modeId && objective.trim().length > 0 && !isSubmitting;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onStartSession({
      sourceRevisionId,
      modeId,
      objective: objective.trim(),
      scope: scope.trim() || null,
      instructions: instructions.trim() || null,
      compatibilityRequired,
    });
  }

  return (
    <GlassPanel solid>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Rocket className="w-5 h-5 text-violet-400" />
          <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">Start Upgrade Session</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">
              Source Revision <span className="text-red-400">*</span>
            </label>
            <select
              value={sourceRevisionId}
              onChange={(e) => setSourceRevisionId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:border-violet-500/50"
            >
              <option value="">Select revision...</option>
              {revisions.map(r => (
                <option key={r.id} value={r.id}>
                  Rev #{r.revisionNumber} — {r.status}{r.title ? ` — ${r.title}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">
              Upgrade Mode <span className="text-red-400">*</span>
            </label>
            <select
              value={modeId}
              onChange={(e) => setModeId(e.target.value as UpgradeModeId)}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:border-violet-500/50"
            >
              {modeOptions.map(m => (
                <option key={m.id} value={m.id}>{m.label} ({m.id})</option>
              ))}
            </select>
            {modeId && (
              <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                {modeOptions.find(m => m.id === modeId)?.description}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">
            Objective <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="What should this upgrade accomplish?"
            className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:border-violet-500/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">Scope</label>
            <input
              type="text"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Optional scope constraints..."
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={compatibilityRequired}
                onChange={(e) => setCompatibilityRequired(e.target.checked)}
                className="rounded border-[hsl(var(--border))] bg-[hsl(var(--muted))]"
              />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Require compatibility check</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">Agent Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            placeholder="Optional instructions for the upgrade agent..."
            className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:border-violet-500/50 resize-none"
          />
        </div>

        {submitError && (
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-400">{submitError}</div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            Start Upgrade Session
          </button>
        </div>
      </form>
    </GlassPanel>
  );
}
