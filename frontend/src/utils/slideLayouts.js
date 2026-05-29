export const SLIDE_LAYOUT_VARIANTS = [
  "image-left",
  "image-right",
  "image-top",
  "image-bottom",
  // "image-background"
];

export const getSlideLayoutVariant = (index) =>
  SLIDE_LAYOUT_VARIANTS[index % SLIDE_LAYOUT_VARIANTS.length];

export const getNextSlideLayoutVariant = (currentVariant) => {
  const currentIndex = SLIDE_LAYOUT_VARIANTS.indexOf(currentVariant);
  return SLIDE_LAYOUT_VARIANTS[(currentIndex + 1) % SLIDE_LAYOUT_VARIANTS.length];
};
