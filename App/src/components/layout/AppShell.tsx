import { ReactNode, useState, useEffect, useCallback } from "react";
import { AppSidebar } from "../app-sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "../command-palette";
import { Toaster } from "sonner";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <AppSidebar />
      <Topbar onSearchClick={() => setCommandPaletteOpen(true)} />
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "hsl(220 14% 12%)",
            border: "1px solid hsl(220 10% 20%)",
            color: "hsl(220 10% 85%)",
          },
        }}
      />
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
