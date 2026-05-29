const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createPresentationValidator,
  updatePresentationValidator,
  presentationIdValidator
} = require("../validators/presentationValidators");
const {
  getPresentationsController,
  createPresentationController,
  getPresentationByIdController,
  updatePresentationController,
  deletePresentationController,
  duplicatePresentationController
} = require("../controllers/presentationController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getPresentationsController);
router.post("/", createPresentationValidator, validateRequest, createPresentationController);
router.get("/:id", presentationIdValidator, validateRequest, getPresentationByIdController);
router.put("/:id", updatePresentationValidator, validateRequest, updatePresentationController);
router.post(
  "/:id/duplicate",
  presentationIdValidator,
  validateRequest,
  duplicatePresentationController
);
router.delete("/:id", presentationIdValidator, validateRequest, deletePresentationController);

module.exports = router;
