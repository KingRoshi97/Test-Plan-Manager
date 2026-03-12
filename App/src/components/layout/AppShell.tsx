import { ReactNode, useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { AppSidebar } from "../app-sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "../command-palette";
import { Toaster } from "sonner";
import { ConfirmProvider } from "../ui/confirm-dialog";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [location] = useLocation();
  const prevLocation = useRef(location);

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

  useEffect(() => {
    if (location !== prevLocation.current) {
      prevLocation.current = location;
      setShowProgress(true);
      const timer = setTimeout(() => setShowProgress(false), 450);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <ConfirmProvider>
      <div className="min-h-screen bg-[hsl(var(--background))]">
        {showProgress && (
          <div className="fixed top-0 left-0 right-0 z-[60] h-0.5">
            <div className="h-full bg-[hsl(var(--primary))] route-progress-bar" />
          </div>
        )}
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
    </ConfirmProvider>
  );
}
