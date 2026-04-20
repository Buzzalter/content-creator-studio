import { useEffect, useState } from "react";
import { Loader2, ImageOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { api, base64ToDataUrl, type SavedPost } from "@/lib/api";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (post: SavedPost) => void;
}

export function FetchFromGalleryDialog({ open, onOpenChange, onSelect }: Props) {
  const [posts, setPosts] = useState<SavedPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPosts(null);
    setError(null);
    api
      .listPosts()
      .then((data) => !cancelled && setPosts(data))
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load posts");
        setPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Fetch from gallery</DialogTitle>
          <DialogDescription>Pick a saved post to load into the editor.</DialogDescription>
        </DialogHeader>

        {posts === null && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {posts && posts.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
            <ImageOff className="h-6 w-6" />
            No saved posts yet.
          </div>
        )}

        {posts && posts.length > 0 && (
          <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {posts.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p);
                  onOpenChange(false);
                }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card transition-transform hover:-translate-y-0.5 hover:border-primary"
              >
                <img
                  src={base64ToDataUrl(p.image_base64)}
                  alt={p.label}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2">
                  <div className="line-clamp-1 text-left text-xs font-semibold text-white">{p.label}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
