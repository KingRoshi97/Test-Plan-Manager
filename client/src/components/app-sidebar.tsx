import { useLocation, Link } from "wouter";
import { Layers, FolderTree, Zap, Plus, HeartPulse, ScrollText, Package, FlaskConical, HardDrive, BookOpen, LayoutList } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

const assemblyNav = [
  { title: "Assemblies", href: "/", icon: Layers },
  { title: "New Assembly", href: "/new", icon: Plus },
];

const toolsNav = [
  { title: "Workspaces", href: "/workspaces", icon: HardDrive },
  { title: "Files", href: "/files", icon: FolderTree },
  { title: "Docs", href: "/docs", icon: BookOpen },
  { title: "Health", href: "/health", icon: HeartPulse },
  { title: "Logs", href: "/logs", icon: ScrollText },
  { title: "Export", href: "/export", icon: Package },
  { title: "Tests", href: "/tests", icon: FlaskConical },
  { title: "Features", href: "/features", icon: LayoutList },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-1">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-md text-white text-sm font-bold shadow-[0_0_12px_rgba(99,130,255,0.4)]"
            style={{ background: "linear-gradient(135deg, hsl(230 80% 56%), hsl(260 80% 60%))" }}
            data-testid="logo"
          >
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-sidebar-foreground" data-testid="text-title">AXION</h1>
            <p className="text-xs text-sidebar-foreground/50">Assembler</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Assemblies</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {assemblyNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href || (item.href !== "/" && location.startsWith(item.href))}
                    tooltip={item.title}
                  >
                    <Link href={item.href} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start gap-2 text-sidebar-foreground/70"
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
