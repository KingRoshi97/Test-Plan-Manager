import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle, XCircle, Clock, Ban } from "lucide-react";

type AssemblyState = "queued" | "running" | "completed" | "failed" | "canceled";

interface StatusBadgeProps {
  status: AssemblyState | string;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<AssemblyState, {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ReactNode;
  className: string;
}> = {
  queued: {
    label: "Queued",
    variant: "secondary",
    icon: <Clock className="h-3 w-3" />,
    className: "bg-muted text-muted-foreground",
  },
  running: {
    label: "Running",
    variant: "default",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-500/20",
  },
  completed: {
    label: "Completed",
    variant: "outline",
    icon: <CheckCircle className="h-3 w-3" />,
    className: "bg-green-500/10 text-green-500 border-green-500/20 dark:bg-green-500/20",
  },
  failed: {
    label: "Failed",
    variant: "destructive",
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-500/20",
  },
  canceled: {
    label: "Canceled",
    variant: "secondary",
    icon: <Ban className="h-3 w-3" />,
    className: "bg-muted text-muted-foreground",
  },
};

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status as AssemblyState] || {
    label: status,
    variant: "secondary" as const,
    icon: null,
    className: "",
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        "gap-1.5 font-medium border",
        config.className,
        className
      )}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
}
