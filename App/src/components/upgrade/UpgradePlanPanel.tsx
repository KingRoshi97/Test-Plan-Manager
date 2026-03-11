import { useState } from "react";
import { FileText, Check, RefreshCw, X, Loader2, ChevronDown, ChevronUp, AlertTriangle, Shield } from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";
import { DiffStatStrip, formatTimeAgo } from "./shared";
import type { UpgradeSessionSummary, UpgradePlanData } from "../../../../shared/upgrade-types";

interface UpgradePlanPanelProps {
  session: UpgradeSessionSummary;
  plan: UpgradePlanData | null;
  isGenerating?: boolean;
  isApproving?: boolean;
  error?: string | null;
  onGeneratePlan: (sessionId: string) => void;
  onApprovePlan: (sessionId: string) => void;
  onRegeneratePlan: (sessionId: string) => void;
  onCancelSession: (sessionId: string) => void;
}

export function UpgradePlanPanel({
  session, plan, isGenerating, isApproving, error,
  onGeneratePlan, onApprovePlan, onRegeneratePlan, onCancelSession,
}: UpgradePlanPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["findings", "changes"]));

  function toggleSection(key: string) {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  if (!plan && !isGenerating) {
    return (
      <GlassPanel solid>
        <div className="p-8 text-center space-y-4">
          <FileText className="w-10 h-10 text-[hsl(var(--muted-foreground))]/40 mx-auto" />
          <div className="text-sm text-[hsl(var(--muted-foreground))]">No upgrade plan generated yet</div>
          <button
            onClick={() => onGeneratePlan(session.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <FileText className="w-4 h-4" /> Generate Upgrade Plan
          </button>
          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>
      </GlassPanel>
    );
  }

  if (isGenerating) {
    return (
      <GlassPanel solid>
        <div className="p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
          <div className="text-sm text-[hsl(var(--muted-foreground))]">Generating upgrade plan...</div>
        </div>
      </GlassPanel>
    );
  }

  if (!plan) return null;

  const isApproved = !!plan.approvedAt;

  return (
    <div className="space-y-3">
      <GlassPanel solid>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Upgrade Plan</h3>
              {isApproved && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Check className="w-3 h-3" /> Approved
                </span>
              )}
            </div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
              Generated {formatTimeAgo(plan.generatedAt)}
            </div>
          </div>

          {plan.agentSummary && (
            <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/20 text-xs text-[hsl(var(--foreground))] mb-3">
              {plan.agentSummary}
            </div>
          )}
        </div>
      </GlassPanel>

      <GlassPanel solid>
        <button onClick={() => toggleSection("findings")} className="w-full p-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Findings Summary</span>
          {expandedSections.has("findings") ? <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> : <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
        </button>
        {expandedSections.has("findings") && (
          <div className="px-4 pb-4 text-sm text-[hsl(var(--foreground))]">{plan.findingsSummary}</div>
        )}
      </GlassPanel>

      <GlassPanel solid>
        <button onClick={() => toggleSection("changes")} className="w-full p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Proposed Changes</span>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{plan.proposedChanges.length}</span>
          </div>
          {expandedSections.has("changes") ? <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> : <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
        </button>
        {expandedSections.has("changes") && (
          <div className="px-4 pb-4 space-y-2">
            {plan.proposedChanges.map((change, idx) => (
              <div key={change.id} className="p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-violet-400">#{idx + 1}</span>
                  <span className="text-xs font-medium text-[hsl(var(--foreground))]">{change.title}</span>
                  {change.priority && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                      change.priority === "high" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                      change.priority === "medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                      "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                    }`}>
                      {change.priority}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[hsl(var(--muted-foreground))]">{change.description}</div>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>

      {plan.risks.length > 0 && (
        <GlassPanel solid>
          <button onClick={() => toggleSection("risks")} className="w-full p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Risks</span>
            </div>
            {expandedSections.has("risks") ? <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> : <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
          </button>
          {expandedSections.has("risks") && (
            <div className="px-4 pb-4 space-y-2">
              {plan.risks.map(risk => (
                <div key={risk.id} className={`p-3 rounded-lg border ${
                  risk.level === "high" ? "border-red-500/30 bg-red-500/5" :
                  risk.level === "medium" ? "border-amber-500/30 bg-amber-500/5" :
                  "border-zinc-500/30 bg-zinc-500/5"
                }`}>
                  <div className="text-xs font-medium text-[hsl(var(--foreground))]">{risk.title}</div>
                  <div className="text-[11px] text-[hsl(var(--muted-foreground))]">{risk.description}</div>
                  {risk.mitigation && <div className="text-[11px] text-emerald-400 mt-1">Mitigation: {risk.mitigation}</div>}
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      )}

      <GlassPanel solid>
        <button onClick={() => toggleSection("rollback")} className="w-full p-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Rollback Plan</span>
          {expandedSections.has("rollback") ? <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> : <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
        </button>
        {expandedSections.has("rollback") && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${plan.rollbackPlan.isSafeRollbackAvailable ? "text-emerald-400" : "text-amber-400"}`} />
              <span className="text-xs text-[hsl(var(--foreground))]">
                {plan.rollbackPlan.isSafeRollbackAvailable ? "Safe rollback available" : "No safe rollback target"}
              </span>
            </div>
            {plan.rollbackPlan.notes && (
              <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">{plan.rollbackPlan.notes}</div>
            )}
          </div>
        )}
      </GlassPanel>

      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-400">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => onRegeneratePlan(session.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-xs text-[hsl(var(--muted-foreground))] transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
          </button>
          <button onClick={() => onCancelSession(session.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-xs text-red-400 transition-colors">
            <X className="w-3.5 h-3.5" /> Cancel Session
          </button>
        </div>
        {!isApproved && (
          <button
            onClick={() => onApprovePlan(session.id)}
            disabled={isApproving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-medium transition-colors"
          >
            {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Approve Plan
          </button>
        )}
      </div>
    </div>
  );
}
