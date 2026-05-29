const { body, param } = require("express-validator");
const { PRESENTATION_TEMPLATES } = require("../utils/constants");

const slideValidatorRules = [
  body("slides.*.title")
    .optional()
    .isString()
    .isLength({ min: 1, max: 160 })
    .withMessage("Slide title must be between 1 and 160 characters."),
  body("slides.*.bulletPoints")
    .optional()
    .isArray({ max: 8 })
    .withMessage("bulletPoints must be an array."),
  body("slides.*.bulletPoints.*")
    .optional()
    .isString()
    .isLength({ min: 1, max: 240 })
    .withMessage("Each bullet point must be between 1 and 240 characters."),
  body("slides.*.summary")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Summary cannot exceed 500 characters."),
  body("slides.*.imageUrl")
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage("imageUrl is too long."),
  body("slides.*.imagePrompt")
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage("imagePrompt must be 1000 characters or fewer."),
  body("slides.*.layoutVariant")
    .optional()
    .isIn(["image-left", "image-right", "image-top", "image-bottom", "image-background"])
    .withMessage("layoutVariant is invalid."),
  body("slides.*.imageStyle.offsetX")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("imageStyle.offsetX must be between 0 and 100."),
  body("slides.*.imageStyle.offsetY")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("imageStyle.offsetY must be between 0 and 100."),
  body("slides.*.imageStyle.scale")
    .optional()
    .isFloat({ min: 50, max: 180 })
    .withMessage("imageStyle.scale must be between 50 and 180.")
];

const createPresentationValidator = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 160 })
    .withMessage("Title must be between 3 and 160 characters."),
  body("prompt")
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage("Prompt must be between 3 and 1000 characters."),
  body("template")
    .optional()
    .isIn(PRESENTATION_TEMPLATES)
    .withMessage(`Template must be one of: ${PRESENTATION_TEMPLATES.join(", ")}.`),
  body("outline").optional().isArray().withMessage("Outline must be an array."),
  body("outline.*")
    .optional()
    .isString()
    .isLength({ min: 1, max: 180 })
    .withMessage("Each outline item must be between 1 and 180 characters."),
  body("isFavorite")
    .optional()
    .isBoolean()
    .withMessage("isFavorite must be a boolean."),
  body("slides").optional().isArray().withMessage("Slides must be an array."),
  ...slideValidatorRules
];

const updatePresentationValidator = [
  param("id").isMongoId().withMessage("Invalid presentation id."),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 160 })
    .withMessage("Title must be between 3 and 160 characters."),
  body("prompt")
    .optional()
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage("Prompt must be between 3 and 1000 characters."),
  body("template")
    .optional()
    .isIn(PRESENTATION_TEMPLATES)
    .withMessage(`Template must be one of: ${PRESENTATION_TEMPLATES.join(", ")}.`),
  body("outline").optional().isArray().withMessage("Outline must be an array."),
  body("outline.*")
    .optional()
    .isString()
    .isLength({ min: 1, max: 180 })
    .withMessage("Each outline item must be between 1 and 180 characters."),
  body("isFavorite")
    .optional()
    .isBoolean()
    .withMessage("isFavorite must be a boolean."),
  body("slides").optional().isArray().withMessage("Slides must be an array."),
  ...slideValidatorRules
];

const presentationIdValidator = [
  param("id").isMongoId().withMessage("Invalid presentation id.")
];

module.exports = {
  createPresentationValidator,
  updatePresentationValidator,
  presentationIdValidator
};
