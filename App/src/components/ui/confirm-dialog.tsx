import { useState, useCallback, createContext, useContext, useRef, useEffect, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import { GlassPanel } from "./glass-panel";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setState({ ...options, resolve });
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    state?.resolve(result);
    setState(null);
    previousFocusRef.current?.focus();
  }, [state]);

  useEffect(() => {
    if (!state || !dialogRef.current) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose(false);
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [state, handleClose]);

  const variantStyles = {
    danger: {
      icon: "text-[hsl(var(--status-failure))]",
      iconBg: "bg-[hsl(var(--status-failure)/0.12)]",
      confirmBtn: "bg-[hsl(var(--status-failure))] text-white hover:opacity-90",
    },
    warning: {
      icon: "text-[hsl(var(--status-warning))]",
      iconBg: "bg-[hsl(var(--status-warning)/0.12)]",
      confirmBtn: "bg-[hsl(var(--status-warning))] text-white hover:opacity-90",
    },
    default: {
      icon: "text-[hsl(var(--primary))]",
      iconBg: "bg-[hsl(var(--primary)/0.12)]",
      confirmBtn: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90",
    },
  };

  const titleId = "confirm-dialog-title";
  const descId = "confirm-dialog-desc";

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          onClick={(e) => { if (e.target === backdropRef.current) handleClose(false); }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={state.description ? descId : undefined}
          >
            <GlassPanel solid glow={state.variant === "danger" ? "red" : state.variant === "warning" ? "amber" : "cyan"} className="relative z-10 w-full max-w-sm mx-4 p-5">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg ${variantStyles[state.variant || "default"].iconBg} flex items-center justify-center flex-shrink-0`}>
                  <AlertTriangle className={`w-5 h-5 ${variantStyles[state.variant || "default"].icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 id={titleId} className="text-sm font-semibold text-[hsl(var(--foreground))]">{state.title}</h3>
                  {state.description && (
                    <p id={descId} className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{state.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleClose(false)}
                  aria-label="Close"
                  className="p-1 rounded-md hover:bg-[hsl(var(--accent))] transition text-[hsl(var(--muted-foreground))]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-end gap-2 mt-5">
                <button
                  onClick={() => handleClose(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition"
                >
                  {state.cancelLabel || "Cancel"}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  autoFocus
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${variantStyles[state.variant || "default"].confirmBtn}`}
                >
                  {state.confirmLabel || "Confirm"}
                </button>
              </div>
            </GlassPanel>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
