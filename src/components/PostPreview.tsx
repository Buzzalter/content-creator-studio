import { base64ToDataUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  imageBase64?: string | null;
  caption?: string | null;
  className?: string;
  compact?: boolean;
}

export function PostPreview({ imageBase64, caption, className, compact }: Props) {
  if (!imageBase64 && !caption) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {imageBase64 && (
        <div className="aspect-square w-full bg-muted">
          <img
            src={base64ToDataUrl(imageBase64)}
            alt="Generated post"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      {caption && (
        <div className={cn("p-4", compact && "p-3")}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{caption}</p>
        </div>
      )}
    </div>
  );
}
