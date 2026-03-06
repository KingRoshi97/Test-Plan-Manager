import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import {
  Crosshair,
  Plus,
  List,
  Wrench,
  FolderOpen,
  Blocks,
  BookOpen,
  FileSearch,
  ShieldCheck,
  Heart,
  ScrollText,
  Settings,
  ClipboardList,
  Activity,
  Download,
  Hammer,
  ChevronDown,
  Library,
  type LucideIcon,
} from "lucide-react";
import type { Assembly } from "../../../shared/schema";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeVariant?: "cyan" | "amber" | "red";
}

interface NavGroup {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

function SidebarGroup({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(group.defaultOpen ?? true);
  const [location, setLocation] = useLocation();

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-system-label hover:text-[hsl(var(--foreground)/0.7)] transition-colors"
      >
        <span>{group.title}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <nav className="space-y-0.5 mt-0.5">
          {group.items.map(({ href, label, icon: Icon, badge, badgeVariant }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <button
                key={href}
                onClick={() => setLocation(href)}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-all duration-150 ${
                  active
                    ? "nav-item-active font-medium"
                    : "text-[hsl(var(--muted-foreground))] nav-item-hover"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1 text-left">{label}</span>
                {badge !== undefined && badge !== 0 && (
                  <span
                    className={`text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-full ${
                      badgeVariant === "cyan"
                        ? "bg-[hsl(var(--status-processing)/0.15)] text-[hsl(var(--status-processing))]"
                        : badgeVariant === "amber"
                        ? "bg-[hsl(var(--status-warning)/0.15)] text-[hsl(var(--status-warning))]"
                        : badgeVariant === "red"
                        ? "bg-[hsl(var(--status-failure)/0.15)] text-[hsl(var(--status-failure))]"
                        : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function KnowledgeSubgroup() {
  const [location, setLocation] = useLocation();

  const libraryLinks: NavItem[] = [
    { href: "/system", label: "System", icon: Library },
    { href: "/orchestration", label: "Orchestration", icon: Library },
    { href: "/gates", label: "Gates", icon: Library },
    { href: "/policy", label: "Policy", icon: Library },
    { href: "/canonical", label: "Canonical", icon: Library },
    { href: "/standards", label: "Standards", icon: Library },
    { href: "/templates-library", label: "Templates", icon: Library },
    { href: "/planning-library", label: "Planning", icon: Library },
    { href: "/verification-library", label: "Verification", icon: Library },
    { href: "/kit-library", label: "Kit", icon: Library },
    { href: "/telemetry-library", label: "Telemetry", icon: Library },
    { href: "/audit-library", label: "Audit", icon: Library },
    { href: "/intake-library", label: "Intake", icon: Library },
  ];

  const dashboardActive = location === "/knowledge";
  const anySubActive = libraryLinks.some(({ href }) => location.startsWith(href));
  const anyActive = dashboardActive || anySubActive;
  const [open, setOpen] = useState(anyActive);

  useEffect(() => {
    if (anyActive) setOpen(true);
  }, [anyActive]);

  return (
    <div>
      <div
        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-all duration-150 ${
          dashboardActive
            ? "nav-item-active font-medium"
            : anySubActive && !open
              ? "nav-item-active font-medium"
              : "text-[hsl(var(--muted-foreground))] nav-item-hover"
        }`}
      >
        <button
          onClick={() => setLocation("/knowledge")}
          className="flex items-center gap-2.5 flex-1 text-left min-w-0"
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span className="truncate flex-1">Knowledge Library</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
          className="p-0.5 rounded hover:bg-[hsl(var(--muted))] transition-colors"
        >
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
          />
        </button>
      </div>
      {open && (
        <nav className="ml-4 mt-0.5 space-y-0.5 border-l border-[hsl(var(--border))]">
          {libraryLinks.map(({ href, label }) => {
            const active = location.startsWith(href);
            return (
              <button
                key={href}
                onClick={() => setLocation(href)}
                className={`w-full flex items-center gap-2 pl-3 pr-3 py-1 rounded-r-md text-[12px] transition-all duration-150 ${
                  active
                    ? "text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] font-medium"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function IntelligenceGroup({ items }: { items: NavItem[] }) {
  const [location, setLocation] = useLocation();

  return (
    <div className="mb-1">
      <div className="px-3 py-1.5 text-system-label">Intelligence</div>
      <nav className="space-y-0.5 mt-0.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <button
              key={href}
              onClick={() => setLocation(href)}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-all duration-150 ${
                active
                  ? "nav-item-active font-medium"
                  : "text-[hsl(var(--muted-foreground))] nav-item-hover"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate flex-1 text-left">{label}</span>
            </button>
          );
        })}
        <KnowledgeSubgroup />
      </nav>
    </div>
  );
}

export function AppSidebar() {
  const { data: assemblies = [] } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    queryFn: () => apiRequest("/api/assemblies"),
    refetchInterval: 10000,
  });

  const activeRuns = assemblies.filter((a) => a.status === "running").length;
  const failedRuns = assemblies.filter((a) => a.status === "failed").length;

  const coreOps: NavGroup = {
    title: "Core Ops",
    items: [
      { href: "/", label: "Command Center", icon: Crosshair },
      { href: "/new", label: "New Run", icon: Plus },
      {
        href: "/runs",
        label: "Runs",
        icon: List,
        badge: activeRuns || undefined,
        badgeVariant: "cyan",
      },
      { href: "/files", label: "Artifacts", icon: FolderOpen },
    ],
    defaultOpen: true,
  };

  const intelligence: NavGroup = {
    title: "Intelligence",
    items: [
      { href: "/features", label: "Features", icon: Blocks },
      { href: "/docs", label: "Doc Inventory", icon: FileSearch },
    ],
    defaultOpen: true,
  };

  const system: NavGroup = {
    title: "System",
    items: [
      { href: "/health", label: "Health", icon: Heart },
      { href: "/logs", label: "Logs", icon: ScrollText },
      { href: "/maintenance", label: "Maintenance", icon: Settings },
    ],
    defaultOpen: false,
  };

  const output: NavGroup = {
    title: "Output",
    items: [
      { href: "/export", label: "Export", icon: Download },
    ],
    defaultOpen: false,
  };

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 z-50 flex flex-col border-r border-[hsl(var(--border))]"
      style={{
        width: "var(--sidebar-width)",
        background: "hsl(var(--card))",
      }}
    >
      <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--status-intelligence))] flex items-center justify-center">
            <span className="text-[11px] font-bold text-white">AX</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[hsl(var(--foreground))]">AXION</h1>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] leading-none">Lab OS</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        <SidebarGroup group={coreOps} />

        <div className="h-px bg-[hsl(var(--border))] mx-2 my-1.5" />

        <IntelligenceGroup items={intelligence.items} />


        <div className="h-px bg-[hsl(var(--border))] mx-2 my-1.5" />
        <SidebarGroup group={system} />

        <div className="h-px bg-[hsl(var(--border))] mx-2 my-1.5" />
        <SidebarGroup group={output} />
      </div>

      <div className="px-4 py-2.5 border-t border-[hsl(var(--border))] text-[10px] text-[hsl(var(--muted-foreground))]">
        <div className="flex items-center justify-between">
          <span>10 stages · 8 gates</span>
          <span className="font-mono-tech">v1.0</span>
        </div>
      </div>
    </aside>
  );
}
