import { RefreshCcw, ImagePlus } from "lucide-react";

export default function SlideEditorPanel({
  slide,
  onChange,
  onBulletChange,
  onRegenerateImage,
  onImageUrlChange
}) {
  if (!slide) {
    return <div className="saas-card p-6 text-slatePro-500">Select a slide to start editing.</div>;
  }

  return (
    <div className="saas-card space-y-6 p-5">
      <div className="grid gap-3">
        <label className="text-sm font-semibold text-slatePro-700">Slide Title</label>
        <input
          className="input-field"
          value={slide.title}
          onChange={(event) => onChange("title", event.target.value)}
        />
      </div>

      <div className="grid gap-3">
        <label className="text-sm font-semibold text-slatePro-700">Bullet Points</label>
        <div className="grid gap-2">
          {slide.bulletPoints.map((point, index) => (
            <input
              key={index}
              className="input-field"
              value={point}
              onChange={(event) => onBulletChange(index, event.target.value)}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <label className="text-sm font-semibold text-slatePro-700">Summary</label>
        <textarea
          className="input-field min-h-24"
          value={slide.summary}
          onChange={(event) => onChange("summary", event.target.value)}
        />
      </div>

      <div className="grid gap-3">
        <label className="text-sm font-semibold text-slatePro-700">Image URL</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="input-field"
            value={slide.imageUrl}
            onChange={(event) => onImageUrlChange(event.target.value)}
          />
          <button type="button" onClick={onRegenerateImage} className="btn-secondary whitespace-nowrap">
            <RefreshCcw className="h-4 w-4" />
            Regenerate
          </button>
        </div>
        <button type="button" className="btn-secondary w-fit">
          <ImagePlus className="h-4 w-4" />
          Replace Image
        </button>
      </div>
    </div>
  );
}
