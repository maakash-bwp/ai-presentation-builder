const { body } = require("express-validator");

const generateOutlineValidator = [
  body("topic")
    .trim()
    .isLength({ min: 3, max: 240 })
    .withMessage("Topic must be between 3 and 240 characters."),
  body("numberOfSlides")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("numberOfSlides must be between 1 and 20.")
];

const generateSlidesValidator = [
  body("topic")
    .trim()
    .isLength({ min: 3, max: 240 })
    .withMessage("Topic must be between 3 and 240 characters."),
  body("outline")
    .isArray({ min: 1, max: 20 })
    .withMessage("outline must be an array of 1 to 20 headings."),
  body("outline.*")
    .isString()
    .isLength({ min: 1, max: 180 })
    .withMessage("Each outline heading must be between 1 and 180 characters.")
];

const generateImageValidator = [
  body("query")
    .trim()
    .isLength({ min: 2, max: 1400 })
    .withMessage("query must be between 2 and 1400 characters.")
];

module.exports = {
  generateOutlineValidator,
  generateSlidesValidator,
  generateImageValidator
};
