import { useLocation } from "wouter";
import {
  LayoutDashboard,
  Plus,
  FolderOpen,
  Heart,
  ScrollText,
  BookOpen,
  Download,
  Blocks,
  Server,
  GitBranch,
  Shield,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/new", label: "New Assembly", icon: Plus },
  { href: "/features", label: "Features", icon: Blocks },
  { href: "/system", label: "System Library", icon: Server },
  { href: "/orchestration", label: "Orchestration", icon: GitBranch },
  { href: "/gates", label: "Gates Library", icon: Shield },
  { href: "/files", label: "Files", icon: FolderOpen },
  { href: "/health", label: "Health", icon: Heart },
  { href: "/logs", label: "Logs", icon: ScrollText },
  { href: "/docs", label: "Doc Inventory", icon: BookOpen },
  { href: "/export", label: "Export", icon: Download },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();

  return (
    <aside className="w-60 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] flex flex-col min-h-screen">
      <div className="p-4 border-b border-[hsl(var(--border))]">
        <h1 className="text-lg font-bold tracking-tight">AXION</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">Control Suite</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <button
              key={href}
              onClick={() => setLocation(href)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
        10 stages / 8 gates / 395 KIDs
      </div>
    </aside>
  );
}
