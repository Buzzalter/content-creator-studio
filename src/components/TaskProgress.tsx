import { Loader2 } from "lucide-react";

interface Props {
  progress?: number;
  step?: string;
}

export function TaskProgress({ progress, step }: Props) {
  const hasValue = typeof progress === "number";
  const value = hasValue ? Math.max(0, Math.min(100, progress!)) : 0;

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
        <span className="font-medium text-foreground">{step || "Starting…"}</span>
        {hasValue && (
          <span className="ml-auto tabular-nums text-xs text-muted-foreground">
            {Math.round(value)}%
          </span>
        )}
      </div>

      <div
        role="progressbar"
        aria-valuenow={hasValue ? Math.round(value) : undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative h-2 w-full overflow-hidden rounded-full bg-secondary"
      >
        <div
          className="h-full rounded-full bg-[image:var(--gradient-primary,linear-gradient(135deg,var(--primary),var(--accent)))] transition-[width] duration-700 ease-out"
          style={{ width: `${hasValue ? value : 8}%` }}
        />
        {!hasValue && (
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20" />
        )}
      </div>
    </div>
  );
}
