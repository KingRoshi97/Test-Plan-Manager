import { ReactNode } from "react";

type GlowColor = "cyan" | "green" | "amber" | "red" | "violet" | "none";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  glow?: GlowColor;
  solid?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

const glowMap: Record<GlowColor, string> = {
  cyan: "glow-border-cyan",
  green: "glow-border-green",
  amber: "glow-border-amber",
  red: "glow-border-red",
  violet: "glow-border-violet",
  none: "",
};

export function GlassPanel({
  children,
  className = "",
  glow = "none",
  solid = false,
  hover = false,
  onClick,
}: GlassPanelProps) {
  const base = solid ? "glass-panel-solid" : "glass-panel";
  const glowCls = glowMap[glow];
  const hoverCls = hover ? "premium-card" : "";
  const clickCls = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`${base} ${glowCls} ${hoverCls} ${clickCls} ${className}`}
      onClick={onClick}
      style={solid ? {} : undefined}
    >
      {children}
    </div>
  );
}
