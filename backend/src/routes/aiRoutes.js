const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  generateOutlineValidator,
  generateSlidesValidator,
  generateImageValidator
} = require("../validators/aiValidators");
const {
  generateOutlineController,
  generateSlidesController,
  generateImageController,
  proxyImageController,
  streamOutlineController,
  streamSlidesController
} = require("../controllers/aiController");

const router = express.Router();

router.get("/image/proxy", proxyImageController);
router.post("/image", generateImageValidator, validateRequest, generateImageController);

router.use(authMiddleware);

router.post("/outline", generateOutlineValidator, validateRequest, generateOutlineController);
router.post("/outline/stream", generateOutlineValidator, validateRequest, streamOutlineController);
router.post("/slides", generateSlidesValidator, validateRequest, generateSlidesController);
router.post("/slides/stream", generateSlidesValidator, validateRequest, streamSlidesController);

module.exports = router;
