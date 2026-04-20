import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Wand2, Type, Save, Upload, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PostPreview } from "@/components/PostPreview";
import { TaskProgress } from "@/components/TaskProgress";
import { FetchFromGalleryDialog } from "@/components/FetchFromGalleryDialog";
import { api, fileToBase64, pollTask, type TaskStatus } from "@/lib/api";
import { usePostStore } from "@/store/postStore";
import { toast } from "sonner";

export const Route = createFileRoute("/edit")({
  head: () => ({
    meta: [
      { title: "Edit · Post Generator" },
      { name: "description", content: "Refine the image and caption of your generated post." },
    ],
  }),
  component: EditPage,
});

function EditPage() {
  const { draft, setDraft, openSaveModal } = usePostStore();
  const [image, setImage] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [prompt, setPrompt] = useState<string | undefined>(undefined);

  const [imagePrompt, setImagePrompt] = useState("");
  const [textPrompt, setTextPrompt] = useState("");

  const [imgLoading, setImgLoading] = useState(false);
  const [textLoading, setTextLoading] = useState(false);
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const busy = imgLoading || textLoading;

  useEffect(() => {
    if (draft) {
      setImage(draft.image_base64);
      setCaption(draft.caption);
      setPrompt(draft.prompt);
    }
  }, [draft]);

  const onUpload = async (f: File | null) => {
    if (!f) return;
    const b64 = await fileToBase64(f);
    setImage(b64);
  };

  const onRegenImage = async () => {
    if (!image) return toast.error("Upload or import an image first.");
    if (!imagePrompt.trim()) return toast.error("Add an edit instruction.");
    setImgLoading(true);
    setStatus(null);
    try {
      const { task_id } = await api.editImage({ image_base64: image, prompt: imagePrompt.trim() });
      const final = await pollTask(task_id, setStatus, 1000);
      const newImg = final.result?.image_base64 || "";
      if (newImg) {
        setImage(newImg);
        setDraft({ image_base64: newImg, caption, prompt });
      }
      toast.success("Image updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Image edit failed");
    } finally {
      setImgLoading(false);
    }
  };

  const onRegenCaption = async () => {
    if (!caption.trim()) return toast.error("No caption to edit.");
    if (!textPrompt.trim()) return toast.error("Add edit instructions.");
    setTextLoading(true);
    try {
      const { caption: next } = await api.editText({ caption, instructions: textPrompt.trim() });
      setCaption(next);
      setDraft({ image_base64: image, caption: next, prompt });
      toast.success("Caption updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Caption edit failed");
    } finally {
      setTextLoading(false);
    }
  };

  const hasContent = !!image || !!caption;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Refine the image and caption — or load one from the gallery.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setGalleryOpen(true)} disabled={busy}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Fetch from Gallery
          </Button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onUpload(e.target.files?.[0] || null)}
        />

        {!image && (
          <div
            onClick={() => fileRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface p-10 text-center hover:border-primary/60"
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <div className="text-sm font-medium">Upload an image to edit</div>
            <div className="text-xs text-muted-foreground">
              Or generate one, or pick a saved post from the gallery.
            </div>
          </div>
        )}

        <fieldset disabled={busy} className="space-y-6 disabled:opacity-60">
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Wand2 className="h-4 w-4 text-primary" />
              Image edit
            </h2>
            <div className="space-y-2">
              <Label htmlFor="img-prompt">Instruction</Label>
              <Input
                id="img-prompt"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Add a soft sunset glow, remove background clutter…"
              />
            </div>
            <Button onClick={onRegenImage} disabled={imgLoading} className="w-full">
              {imgLoading ? "Re-generating…" : "Re-generate Image"}
            </Button>
          </div>

          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Type className="h-4 w-4 text-primary" />
              Caption edit
            </h2>
            <div className="space-y-2">
              <Label htmlFor="caption-current">Current caption</Label>
              <Textarea
                id="caption-current"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-24 resize-none"
                placeholder="Your caption will appear here…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-prompt">Instruction</Label>
              <Input
                id="text-prompt"
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                placeholder="Make it shorter, add a CTA, friendlier tone…"
              />
            </div>
            <Button onClick={onRegenCaption} disabled={textLoading} className="w-full">
              {textLoading ? "Re-generating…" : "Re-generate Caption"}
            </Button>
          </div>
        </fieldset>
      </section>

      <section className="space-y-4">
        {imgLoading && <TaskProgress progress={status?.progress} step={status?.step || status?.status} />}

        {!imgLoading && hasContent && (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Social media preview
            </h2>
            <PostPreview imageBase64={image} caption={caption} />
            <Button
              className="w-full"
              size="lg"
              disabled={!image}
              onClick={() => openSaveModal({ image_base64: image, caption, prompt })}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Post
            </Button>
          </>
        )}
      </section>
    </div>
  );
}
