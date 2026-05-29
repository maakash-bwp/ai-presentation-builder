import clsx from "clsx";
import { getSlideLayoutVariant } from "../utils/slideLayouts";
import { getSlideTheme } from "../utils/slideThemes";
import ProgressiveSlideImage from "./ProgressiveSlideImage";

const getImageTransform = (slide) => {
  const offsetX = Number(slide?.imageStyle?.offsetX ?? 50);
  const offsetY = Number(slide?.imageStyle?.offsetY ?? 50);
  const scale = Number(slide?.imageStyle?.scale ?? 100);

  return {
    objectPosition: `${offsetX}% ${offsetY}%`,
    transform: `scale(${scale / 100})`
  };
};

const renderBullets = (slide) => (
  <ul className="mt-4 space-y-2 text-sm text-slatePro-700">
    {slide?.bulletPoints?.map((point, index) => (
      <li key={index} className="flex gap-2">
        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-500" />
        <span>{point}</span>
      </li>
    ))}
  </ul>
);

const renderTextBlock = (slide, compact = false) => (
  <div className={clsx("flex flex-col", compact ? "p-5" : "p-6 md:p-8")}>
    <h3 className={clsx("font-display font-bold text-slatePro-900", compact ? "text-xl" : "text-3xl")}>
      {slide?.title}
    </h3>
    {renderBullets(slide)}
    <p className="mt-4 text-sm leading-6 text-slatePro-600">{slide?.summary}</p>
  </div>
);

const renderImage = (slide, className) => (
  <ProgressiveSlideImage
    slide={slide}
    className={className}
    style={getImageTransform(slide)}
    showLoadingState
  />
);

export default function SlideCanvasPreview({ slide, index, template = "Business", className = "" }) {
  const layout = slide?.layoutVariant || getSlideLayoutVariant(index);
  const theme = getSlideTheme(template);

  if (layout === "image-right") {
    return (
      <article className={clsx("overflow-hidden rounded-3xl border shadow-soft", theme.border, theme.shell, className)}>
        <div className="grid md:grid-cols-[1.1fr,0.9fr]">
          {renderTextBlock(slide)}
          {renderImage(slide, "h-64 w-full object-cover md:h-full")}
        </div>
      </article>
    );
  }

  if (layout === "image-top") {
    return (
      <article className={clsx("overflow-hidden rounded-3xl border shadow-soft", theme.border, theme.shell, className)}>
        {renderImage(slide, "h-60 w-full object-cover")}
        {renderTextBlock(slide, true)}
      </article>
    );
  }

  if (layout === "image-bottom") {
    return (
      <article className={clsx("overflow-hidden rounded-3xl border shadow-soft", theme.border, theme.shell, className)}>
        {renderTextBlock(slide, true)}
        {renderImage(slide, "h-56 w-full object-cover")}
      </article>
    );
  }

  if (layout === "image-background") {
    return (
      <article className={clsx("relative overflow-hidden rounded-3xl border shadow-soft", theme.border, className)}>
        {renderImage(slide, "h-[28rem] w-full object-cover")}
        <div className="absolute inset-0 bg-gradient-to-r from-slatePro-950/80 via-slatePro-900/55 to-transparent" />
        <div className="absolute inset-0 max-w-2xl p-6 md:p-8 text-white">
          <h3 className="font-display text-3xl font-bold">{slide?.title}</h3>
          <ul className="mt-5 space-y-3 text-sm md:text-base">
            {slide?.bulletPoints?.map((point, bulletIndex) => (
              <li key={bulletIndex} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-xl text-sm text-slate-100">{slide?.summary}</p>
        </div>
      </article>
    );
  }

  return (
    <article className={clsx("overflow-hidden rounded-3xl border shadow-soft", theme.border, theme.shell, className)}>
      <div className="grid md:grid-cols-[0.9fr,1.1fr]">
        {renderImage(slide, "h-64 w-full object-cover md:h-full")}
        {renderTextBlock(slide)}
      </div>
    </article>
  );
}
