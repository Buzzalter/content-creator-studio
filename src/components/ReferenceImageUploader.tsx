import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fileToBase64 } from "@/lib/api";

export interface ReferenceImage {
  id: string;
  base64: string;
  preview: string;
  name: string;
}

interface Props {
  images: ReferenceImage[];
  onChange: (imgs: ReferenceImage[]) => void;
}

export function ReferenceImageUploader({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const next: ReferenceImage[] = [...images];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const b64 = await fileToBase64(file);
      next.push({
        id: crypto.randomUUID(),
        base64: b64,
        preview: URL.createObjectURL(file),
        name: file.name,
      });
    }
    onChange(next);
  };

  const remove = (id: string) => onChange(images.filter((i) => i.id !== id));

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          drag ? "border-primary bg-primary-soft" : "border-border bg-surface hover:border-primary/60"
        }`}
      >
        <ImagePlus className="h-6 w-6 text-muted-foreground" />
        <div className="text-sm font-medium">Drop reference images or click to upload</div>
        <div className="text-xs text-muted-foreground">
          Each upload is auto-labelled (Image 1, Image 2…) so you can refer to it in your prompt.
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-lg border border-border bg-card"
            >
              <div className="aspect-square w-full">
                <img src={img.preview} alt={img.name} className="h-full w-full object-cover" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                <div className="text-[11px] font-semibold text-white">Image {i + 1}</div>
              </div>
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(img.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
