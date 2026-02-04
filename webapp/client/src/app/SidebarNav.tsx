import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  Plus, 
  Layers, 
  Settings, 
  FileText, 
  Sparkles,
  BarChart3,
  Bookmark,
  CreditCard,
  User,
  TrendingUp,
  Cpu
} from "lucide-react";
import axiomLogo from "@/assets/axiom-logo.png";

const mainNavItems = [
  { id: "create", label: "Create", icon: Sparkles, href: "/create" },
  { id: "assemblies", label: "Assemblies", icon: Layers, href: "/assemblies" },
  { id: "templates", label: "Templates", icon: Bookmark, href: "/templates" },
];

const accountNavItems = [
  { id: "usage", label: "Usage", icon: TrendingUp, href: "/usage" },
  { id: "billing", label: "Billing", icon: CreditCard, href: "/billing" },
  { id: "profile", label: "Profile", icon: User, href: "/profile" },
];

const systemNavItems = [
  { id: "axion", label: "AXION Controller", icon: Cpu, href: "/axion" },
  { id: "ops", label: "Operations", icon: BarChart3, href: "/ops" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  { id: "docs", label: "API Docs", icon: FileText, href: "/docs" },
];

export function SidebarNav() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/assemblies") {
      return location.startsWith("/assemblies");
    }
    return location === href;
  };

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <Link href="/create">
          <img 
            src={axiomLogo} 
            alt="Axiom Assembler" 
            className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            data-testid="link-logo"
          />
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Build</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.href)}
                    data-testid={`nav-${item.id}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNavItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.href)}
                    data-testid={`nav-${item.id}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNavItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.href)}
                    data-testid={`nav-${item.id}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent className="px-2 space-y-2">
            <Link href="/create">
              <Button 
                className="w-full justify-start gap-2" 
                size="sm"
                data-testid="button-new-assembly-sidebar"
              >
                <Plus className="h-4 w-4" />
                New Assembly
              </Button>
            </Link>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="text-xs text-muted-foreground">
          <p>Axiom Assembler v1.0</p>
          <p className="opacity-60">Docs-first agent kits</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
