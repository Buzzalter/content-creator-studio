import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

export function TaskProgress({ progress, label }: { progress?: number; label?: string }) {
  const value = typeof progress === "number" ? Math.max(0, Math.min(100, progress)) : undefined;
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="font-medium">{label || "Working on it…"}</span>
        {typeof value === "number" && (
          <span className="ml-auto text-xs text-muted-foreground">{Math.round(value)}%</span>
        )}
      </div>
      <Progress value={value ?? undefined} />
    </div>
  );
}
