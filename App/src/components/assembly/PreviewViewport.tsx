import { useRef } from "react";
import { Loader2, ExternalLink } from "lucide-react";

export type PreviewDeviceMode = "desktop" | "tablet" | "mobile";
export type PreviewFrameState = "idle" | "loading" | "ready" | "error";

interface PreviewViewportProps {
  status: string;
  previewUrl: string;
  deviceMode: PreviewDeviceMode;
  reloadNonce: number;
  embeddable?: boolean;
  onFrameLoad?: () => void;
  onFrameError?: () => void;
}

const deviceWidthClass: Record<PreviewDeviceMode, string> = {
  desktop: "w-full",
  tablet: "max-w-4xl mx-auto",
  mobile: "max-w-[420px] mx-auto",
};

export function PreviewViewport({
  status,
  previewUrl,
  deviceMode,
  reloadNonce,
  embeddable,
  onFrameLoad,
  onFrameError,
}: PreviewViewportProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameStateRef = useRef<PreviewFrameState>("loading");

  const handleLoad = () => {
    frameStateRef.current = "ready";
    onFrameLoad?.();
  };

  const handleError = () => {
    frameStateRef.current = "error";
    onFrameError?.();
  };

  if (status !== "ready") {
    return null;
  }

  return (
    <div className={`relative ${deviceWidthClass[deviceMode]} min-h-[70vh] transition-all duration-300`}>
      <iframe
        ref={iframeRef}
        key={`${previewUrl}-${reloadNonce}`}
        src={previewUrl}
        className="w-full h-full min-h-[70vh] rounded-lg border border-[hsl(var(--border))]"
        style={{ backgroundColor: "#ffffff" }}
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}
