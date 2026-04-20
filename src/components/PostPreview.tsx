import { base64ToDataUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  imageBase64?: string | null;
  caption?: string | null;
  className?: string;
  compact?: boolean;
}

export function PostPreview({ imageBase64, caption, className, compact }: Props) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <div className="aspect-square w-full bg-muted">
        {imageBase64 ? (
          <img
            src={base64ToDataUrl(imageBase64)}
            alt="Generated post"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No image yet
          </div>
        )}
      </div>
      <div className={cn("space-y-2 p-4", compact && "p-3")}>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-[image:var(--gradient-primary,linear-gradient(135deg,var(--primary),var(--accent)))]" />
          <div className="text-sm font-semibold">your_brand</div>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {caption || <span className="text-muted-foreground">Caption will appear here…</span>}
        </p>
      </div>
    </div>
  );
}
