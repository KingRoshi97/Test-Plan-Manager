import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <Card 
      className={cn(
        "rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-sm shadow-lg",
        "dark:bg-card/60 dark:border-primary/15 dark:shadow-[0_0_30px_hsl(var(--primary)/0.08)]",
        "hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)] transition-all duration-300",
        className
      )} 
      {...props}
    >
      {children}
    </Card>
  );
}

interface GlassCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCardHeader({ children, className, ...props }: GlassCardHeaderProps) {
  return (
    <CardHeader className={cn("space-y-1.5", className)} {...props}>
      {children}
    </CardHeader>
  );
}

export function GlassCardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <CardTitle className={cn("text-lg font-semibold tracking-tight", className)} {...props}>
      {children}
    </CardTitle>
  );
}

export function GlassCardDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <CardDescription className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </CardDescription>
  );
}

export function GlassCardContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <CardContent className={cn("", className)} {...props}>
      {children}
    </CardContent>
  );
}

export function GlassCardFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <CardFooter className={cn("", className)} {...props}>
      {children}
    </CardFooter>
  );
}
