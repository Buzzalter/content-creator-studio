import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, ImageOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, base64ToDataUrl, type SavedPost } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery · Postly" },
      { name: "description", content: "Browse and download saved AI social posts." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const [posts, setPosts] = useState<SavedPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<SavedPost | null>(null);

  const load = async () => {
    setError(null);
    try {
      const data = await api.listPosts();
      setPosts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load posts");
      setPosts([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your saved posts.</p>
        </div>
        <Button variant="outline" onClick={load}>Refresh</Button>
      </div>

      {posts === null && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {posts && posts.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface p-16 text-center">
          <ImageOff className="h-8 w-8 text-muted-foreground" />
          <div className="font-medium">No posts saved yet</div>
          <div className="text-sm text-muted-foreground">
            Generate a post and hit "Save Post" to see it here.
          </div>
        </div>
      )}

      {posts && posts.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {posts.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
            >
              <img
                src={base64ToDataUrl(p.image_base64)}
                alt={p.label}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3">
                <div className="text-left text-sm font-semibold text-white">{p.label}</div>
                <div className="mt-0.5 line-clamp-2 text-left text-xs text-white/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {p.caption}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <PostModal post={active} onClose={() => setActive(null)} />
    </div>
  );
}

function PostModal({ post, onClose }: { post: SavedPost | null; onClose: () => void }) {
  const open = !!post;
  const handleDownload = () => {
    if (!post) return;
    try {
      window.open(api.downloadUrl(post.id), "_blank");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{post?.label}</DialogTitle>
        </DialogHeader>
        {post && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-border bg-muted">
              <img
                src={base64ToDataUrl(post.image_base64)}
                alt={post.label}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Caption</div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{post.caption}</p>
              </div>
              {post.prompt && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Original prompt</div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{post.prompt}</p>
                </div>
              )}
              <Button onClick={handleDownload} className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Download Assets
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
