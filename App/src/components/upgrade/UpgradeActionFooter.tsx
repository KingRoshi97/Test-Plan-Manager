import { ArrowRight, Loader2, RotateCcw, ArrowUpCircle, Shield, Wrench, FileText } from "lucide-react";
import type { UpgradeSessionSummary, UpgradeInternalTabId } from "../../../../shared/upgrade-types";

interface UpgradeActionFooterProps {
  session: UpgradeSessionSummary | null;
  currentTab: UpgradeInternalTabId;
  isLoading?: boolean;
  onNavigateTab: (tab: UpgradeInternalTabId) => void;
  onPrimaryAction?: () => void;
  primaryLabel?: string;
}

const sessionStatusNextTab: Partial<Record<string, UpgradeInternalTabId>> = {
  draft: "plan",
  planning: "plan",
  awaiting_approval: "plan",
  executing: "workspace",
  verifying: "verify",
  promotion_ready: "promote",
};

const nextTabConfig: Record<UpgradeInternalTabId, { next: UpgradeInternalTabId | null; label: string; icon: typeof ArrowRight }> = {
  plan: { next: "workspace", label: "Go to Workspace", icon: Wrench },
  workspace: { next: "compare", label: "View Compare", icon: ArrowRight },
  compare: { next: "verify", label: "Run Verification", icon: Shield },
  verify: { next: "promote", label: "Promote / Rollback", icon: ArrowUpCircle },
  promote: { next: null, label: "", icon: ArrowRight },
};

export function UpgradeActionFooter({
  session, currentTab, isLoading,
  onNavigateTab, onPrimaryAction, primaryLabel,
}: UpgradeActionFooterProps) {
  if (!session) return null;

  const suggestedTab = sessionStatusNextTab[session.status];
  const nextConfig = nextTabConfig[currentTab];

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
      <div className="flex items-center gap-2">
        {suggestedTab && suggestedTab !== currentTab && (
          <button
            onClick={() => onNavigateTab(suggestedTab)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-500/30 hover:bg-violet-500/10 text-xs text-violet-400 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Jump to {suggestedTab.charAt(0).toUpperCase() + suggestedTab.slice(1)}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onPrimaryAction && primaryLabel && (
          <button
            onClick={onPrimaryAction}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-medium transition-colors"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {primaryLabel}
          </button>
        )}
        {nextConfig.next && (
          <button
            onClick={() => onNavigateTab(nextConfig.next!)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-xs text-[hsl(var(--muted-foreground))] transition-colors"
          >
            {nextConfig.label}
            <nextConfig.icon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
