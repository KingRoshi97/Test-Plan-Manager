import { ReactNode } from "react";
import { AppSidebar } from "../app-sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <AppSidebar />
      <Topbar />
      <main
        className="overflow-auto"
        style={{
          marginLeft: "var(--sidebar-width)",
          marginTop: "var(--topbar-height)",
          height: "calc(100vh - var(--topbar-height))",
          padding: "1.5rem",
        }}
      >
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
