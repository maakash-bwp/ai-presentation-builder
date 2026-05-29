import { ImagePlus, RefreshCcw } from "lucide-react";
import SlideCanvasPreview from "./SlideCanvasPreview";

export default function EditableSlideCard({
  slide,
  index,
  isImageLoading,
  onFieldChange,
  onBulletChange,
  onGenerateImage
}) {
  return (
    <article className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            Slide {index + 1}
          </p>
          <p className="text-sm text-slatePro-500">Edit content directly inside this slide card.</p>
        </div>
        <button
          type="button"
          onClick={onGenerateImage}
          className="btn-secondary"
          disabled={isImageLoading}
        >
          {isImageLoading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {isImageLoading ? "Generating..." : "Regenerate Image"}
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
        <SlideCanvasPreview slide={slide} index={index} className="min-h-[26rem]" />

        <div className="saas-card space-y-4 p-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slatePro-700">Title</label>
            <input
              className="input-field"
              value={slide.title}
              onChange={(event) => onFieldChange("title", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slatePro-700">Bullet Points</label>
            <div className="space-y-2">
              {slide.bulletPoints.map((point, bulletIndex) => (
                <input
                  key={bulletIndex}
                  className="input-field"
                  value={point}
                  onChange={(event) => onBulletChange(bulletIndex, event.target.value)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slatePro-700">Summary</label>
            <textarea
              className="input-field min-h-28"
              value={slide.summary}
              onChange={(event) => onFieldChange("summary", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slatePro-700">Image Prompt</label>
            <textarea
              className="input-field min-h-24"
              placeholder="Describe the image you want for this slide"
              value={slide.imagePrompt || ""}
              onChange={(event) => onFieldChange("imagePrompt", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slatePro-700">Image URL</label>
            <input
              className="input-field"
              value={slide.imageUrl || ""}
              onChange={(event) => onFieldChange("imageUrl", event.target.value)}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
