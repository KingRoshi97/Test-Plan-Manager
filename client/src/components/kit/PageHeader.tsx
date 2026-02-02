import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, description, icon: Icon, actions, className }: PageHeaderProps) {
  const descText = description || subtitle;
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        {descText && (
          <p className="text-sm text-muted-foreground">{descText}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
