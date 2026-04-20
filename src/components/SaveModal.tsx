import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePostStore } from "@/store/postStore";
import { api } from "@/lib/api";
import { PostPreview } from "@/components/PostPreview";
import { toast } from "sonner";

export function SaveModal() {
  const { saveTarget, closeSaveModal } = usePostStore();
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const open = !!saveTarget;

  const onSave = async () => {
    if (!saveTarget) return;
    if (!label.trim()) {
      toast.error("Add a label so you can find it later.");
      return;
    }
    setSaving(true);
    try {
      await api.savePost({
        label: label.trim(),
        image_base64: saveTarget.image_base64,
        caption: saveTarget.caption,
        prompt: saveTarget.prompt,
      });
      toast.success("Saved to gallery");
      setLabel("");
      closeSaveModal();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeSaveModal()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Save post</DialogTitle>
          <DialogDescription>Give it a label so you can spot it in the gallery.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
          <div>
            <PostPreview
              imageBase64={saveTarget?.image_base64}
              caption={saveTarget?.caption}
              compact
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-label">Post label</Label>
            <Input
              id="post-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Cafe Dog – Launch"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={closeSaveModal}>Cancel</Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Confirm Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
