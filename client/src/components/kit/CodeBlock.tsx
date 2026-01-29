import { cn } from "@/lib/utils";
import { CopyButton } from "./CopyButton";

interface CodeBlockProps {
  code: string;
  language?: string;
  showCopy?: boolean;
  className?: string;
  maxHeight?: string;
}

export function CodeBlock({ 
  code, 
  language, 
  showCopy = true,
  className,
  maxHeight = "400px"
}: CodeBlockProps) {
  return (
    <div className={cn("relative group rounded-lg", className)}>
      {language && (
        <div className="absolute top-2 left-3 text-xs text-muted-foreground font-mono uppercase">
          {language}
        </div>
      )}
      {showCopy && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton value={code} />
        </div>
      )}
      <pre 
        className={cn(
          "bg-muted/50 dark:bg-muted/30 p-4 rounded-lg overflow-auto text-sm font-mono",
          "border border-border/50",
          language && "pt-8"
        )}
        style={{ maxHeight }}
      >
        <code className="text-foreground">{code}</code>
      </pre>
    </div>
  );
}
