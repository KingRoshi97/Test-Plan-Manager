import { FileText, Wrench, GitCompare, Shield, ArrowUpCircle } from "lucide-react";
import type { UpgradeInternalTabId } from "../../../../shared/upgrade-types";

const tabs: { id: UpgradeInternalTabId; label: string; icon: typeof FileText }[] = [
  { id: "plan", label: "Plan", icon: FileText },
  { id: "workspace", label: "Workspace", icon: Wrench },
  { id: "compare", label: "Compare", icon: GitCompare },
  { id: "verify", label: "Verify", icon: Shield },
  { id: "promote", label: "Promote", icon: ArrowUpCircle },
];

interface UpgradeTabSwitcherProps {
  activeTab: UpgradeInternalTabId;
  onChangeTab: (tab: UpgradeInternalTabId) => void;
  disabledTabs?: UpgradeInternalTabId[];
  badges?: Partial<Record<UpgradeInternalTabId, number>>;
}

export function UpgradeTabSwitcher({ activeTab, onChangeTab, disabledTabs = [], badges = {} }: UpgradeTabSwitcherProps) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))]">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const isDisabled = disabledTabs.includes(tab.id);
        const badge = badges[tab.id];
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onChangeTab(tab.id)}
            disabled={isDisabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive
                ? "bg-violet-600 text-white shadow-sm"
                : isDisabled
                  ? "text-[hsl(var(--muted-foreground))]/40 cursor-not-allowed"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {tab.label}
            {badge != null && badge > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                isActive ? "bg-white/20 text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
              }`}>
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
