import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Pencil, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ReferenceImageUploader, type ReferenceImage } from "@/components/ReferenceImageUploader";
import { PostPreview } from "@/components/PostPreview";
import { TaskProgress } from "@/components/TaskProgress";
import { api, pollTask, type TaskStatus } from "@/lib/api";
import { usePostStore } from "@/store/postStore";
import { toast } from "sonner";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [captionPrompt, setCaptionPrompt] = useState("");
  const [refs, setRefs] = useState<ReferenceImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [result, setResult] = useState<{ image: string; caption: string } | null>(null);

  const { setDraft, openSaveModal } = usePostStore();
  const navigate = useNavigate();

  const onGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Add a visual prompt first.");
      return;
    }
    setLoading(true);
    setStatus(null);
    setResult(null);
    try {
      const { task_id } = await api.generate({
        prompt: prompt.trim(),
        reference_images: refs.map((r) => r.base64),
        custom_caption_prompt: captionPrompt.trim() || undefined,
      });
      const final = await pollTask(task_id, setStatus, 1000);
      const image = final.result?.image_base64 || "";
      const caption = final.result?.caption || "";
      setResult({ image, caption });
      toast.success("Post ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const editPost = () => {
    if (!result) return;
    setDraft({ image_base64: result.image, caption: result.caption, prompt });
    navigate("/edit");
  };

  const hasOutput = !loading && !!result;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Generate a post</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe the visual, optionally guide the caption, and add references.
          </p>
        </div>

        <fieldset disabled={loading} className="space-y-5 disabled:opacity-60">
          <div className="space-y-2">
            <Label htmlFor="prompt">Visual prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A golden retriever sitting at a cafe, soft morning light, candid shot…"
              className="min-h-32 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">
              Caption instructions <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="caption"
              value={captionPrompt}
              onChange={(e) => setCaptionPrompt(e.target.value)}
              placeholder="A short description of post content..."
            />
          </div>

          <div className="space-y-2">
            <Label>Reference images</Label>
            <ReferenceImageUploader images={refs} onChange={setRefs} />
          </div>

          <Button onClick={onGenerate} disabled={loading} size="lg" className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Generating…" : "Generate Post"}
          </Button>
        </fieldset>
      </section>

      <section className="space-y-4">
        {loading && <TaskProgress progress={status?.progress} step={status?.step || status?.status} />}

        {hasOutput && (
          <>
            <PostPreview imageBase64={result!.image} caption={result!.caption} />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={editPost}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Post
              </Button>
              <Button
                className="flex-1"
                onClick={() =>
                  openSaveModal({ image_base64: result!.image, caption: result!.caption, prompt })
                }
              >
                <Save className="mr-2 h-4 w-4" />
                Save Post
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
