const mongoose = require("mongoose");
const Presentation = require("../models/Presentation");
const ApiError = require("../utils/ApiError");

const normalizeSlides = (slides = []) =>
  slides.map((slide, index) => ({
    title: String(slide.title || `Slide ${index + 1}`).trim(),
    bulletPoints: Array.isArray(slide.bulletPoints)
      ? slide.bulletPoints.map((item) => String(item).trim()).filter(Boolean)
      : [],
    summary: String(slide.summary || "").trim(),
    imageUrl: String(slide.imageUrl || "").trim(),
    imagePrompt: String(slide.imagePrompt || "").trim(),
    layoutVariant: String(slide.layoutVariant || "").trim() || "image-right",
    imageStyle: {
      offsetX: Number(slide.imageStyle?.offsetX ?? 50),
      offsetY: Number(slide.imageStyle?.offsetY ?? 50),
      scale: Number(slide.imageStyle?.scale ?? 100)
    },
    order: Number(slide.order) || index + 1
  }));

const ensureValidObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid presentation id.");
  }
};

const createPresentation = async (userId, data) => {
  const payload = {
    userId,
    title: data.title.trim(),
    prompt: data.prompt.trim(),
    template: data.template,
    outline: Array.isArray(data.outline)
      ? data.outline.map((item) => String(item).trim()).filter(Boolean)
      : [],
    isFavorite: Boolean(data.isFavorite),
    slides: normalizeSlides(data.slides)
  };

  return Presentation.create(payload);
};

const getUserPresentations = async (userId) => {
  const presentations = await Presentation.find({ userId })
    .sort({ updatedAt: -1 })
    .lean();

  return presentations.map((presentation) => ({
    ...presentation,
    slideCount: presentation.slides.length
  }));
};

const getPresentationById = async (userId, presentationId) => {
  ensureValidObjectId(presentationId);

  const presentation = await Presentation.findOne({
    _id: presentationId,
    userId
  });

  if (!presentation) {
    throw new ApiError(404, "Presentation not found.");
  }

  return presentation;
};

const updatePresentationById = async (userId, presentationId, data) => {
  const presentation = await getPresentationById(userId, presentationId);

  const fields = ["title", "prompt", "template", "outline", "slides", "isFavorite"];
  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      if (field === "outline") {
        presentation.outline = Array.isArray(data.outline)
          ? data.outline.map((item) => String(item).trim()).filter(Boolean)
          : [];
        return;
      }

      if (field === "slides") {
        presentation.slides = normalizeSlides(data.slides);
        return;
      }

      if (field === "isFavorite") {
        presentation.isFavorite = Boolean(data.isFavorite);
        return;
      }

      presentation[field] =
        typeof data[field] === "string" ? data[field].trim() : data[field];
    }
  });

  return presentation.save();
};

const deletePresentationById = async (userId, presentationId) => {
  ensureValidObjectId(presentationId);
  const deleted = await Presentation.findOneAndDelete({
    _id: presentationId,
    userId
  });

  if (!deleted) {
    throw new ApiError(404, "Presentation not found.");
  }

  return deleted;
};

const duplicatePresentationById = async (userId, presentationId) => {
  const presentation = await getPresentationById(userId, presentationId);

  return Presentation.create({
    userId,
    title: `${presentation.title} Copy`,
    prompt: presentation.prompt,
    template: presentation.template,
    outline: [...presentation.outline],
    isFavorite: false,
    slides: normalizeSlides(presentation.slides)
  });
};

module.exports = {
  createPresentation,
  getUserPresentations,
  getPresentationById,
  updatePresentationById,
  deletePresentationById,
  duplicatePresentationById
};
