import type { CapabilityTabId } from "../../types/capabilities";

interface CapabilityTabsProps {
  activeTab: CapabilityTabId;
  onTabChange: (tab: CapabilityTabId) => void;
}

const tabs: { id: CapabilityTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "readiness", label: "Readiness" },
  { id: "dependencies", label: "Dependencies" },
  { id: "gates", label: "Gates" },
  { id: "modules", label: "Modules" },
  { id: "risk", label: "Risk" },
];

export function CapabilityTabs({ activeTab, onTabChange }: CapabilityTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-[hsl(var(--border))]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === tab.id
              ? "text-[hsl(var(--foreground))]"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--primary))]" />
          )}
        </button>
      ))}
    </div>
  );
}
