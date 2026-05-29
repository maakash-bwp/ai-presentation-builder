const asyncHandler = require("../utils/asyncHandler");
const presentationService = require("../services/presentationService");

const getPresentationsController = asyncHandler(async (req, res) => {
  const data = await presentationService.getUserPresentations(req.user._id);
  return res.status(200).json({
    success: true,
    data
  });
});

const createPresentationController = asyncHandler(async (req, res) => {
  const presentation = await presentationService.createPresentation(req.user._id, req.body);
  return res.status(201).json({
    success: true,
    message: "Presentation created successfully.",
    data: presentation
  });
});

const getPresentationByIdController = asyncHandler(async (req, res) => {
  const presentation = await presentationService.getPresentationById(req.user._id, req.params.id);
  return res.status(200).json({
    success: true,
    data: presentation
  });
});

const updatePresentationController = asyncHandler(async (req, res) => {
  const presentation = await presentationService.updatePresentationById(
    req.user._id,
    req.params.id,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: "Presentation updated successfully.",
    data: presentation
  });
});

const deletePresentationController = asyncHandler(async (req, res) => {
  await presentationService.deletePresentationById(req.user._id, req.params.id);
  return res.status(200).json({
    success: true,
    message: "Presentation deleted successfully."
  });
});

const duplicatePresentationController = asyncHandler(async (req, res) => {
  const presentation = await presentationService.duplicatePresentationById(
    req.user._id,
    req.params.id
  );

  return res.status(201).json({
    success: true,
    message: "Presentation duplicated successfully.",
    data: presentation
  });
});

module.exports = {
  getPresentationsController,
  createPresentationController,
  getPresentationByIdController,
  updatePresentationController,
  deletePresentationController,
  duplicatePresentationController
};
