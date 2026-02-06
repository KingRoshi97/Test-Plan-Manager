import { useState, useCallback, useEffect } from "react";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

let toastListeners: Array<(toast: Toast) => void> = [];
let dismissListeners: Array<(id: string) => void> = [];

export function toast(t: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  const newToast = { ...t, id };
  toastListeners.forEach((fn) => fn(newToast));
  setTimeout(() => {
    dismissListeners.forEach((fn) => fn(id));
  }, 4000);
  return id;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    toastListeners.push(addToast);
    dismissListeners.push(dismiss);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== addToast);
      dismissListeners = dismissListeners.filter((fn) => fn !== dismiss);
    };
  }, [addToast, dismiss]);

  return { toasts, dismiss };
}
