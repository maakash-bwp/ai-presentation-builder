const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  signupValidator,
  loginValidator,
  verifyEmailValidator,
  resendVerificationValidator,
  forgotPasswordRequestValidator,
  verifyPasswordResetValidator,
  resetPasswordValidator,
  googleAuthValidator,
  updateProfileValidator,
  changePasswordValidator
} = require("../validators/authValidators");
const {
  signupController,
  verifyEmailController,
  resendVerificationOtpController,
  loginController,
  requestPasswordResetController,
  verifyPasswordResetOtpController,
  resetPasswordController,
  googleAuthController,
  logoutController,
  meController,
  updateProfileController,
  changePasswordController,
  deleteAccountController
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signupValidator, validateRequest, signupController);
router.post("/verify-email", verifyEmailValidator, validateRequest, verifyEmailController);
router.post(
  "/verify-email/resend",
  resendVerificationValidator,
  validateRequest,
  resendVerificationOtpController
);
router.post("/login", loginValidator, validateRequest, loginController);
router.post(
  "/forgot-password",
  forgotPasswordRequestValidator,
  validateRequest,
  requestPasswordResetController
);
router.post(
  "/forgot-password/verify",
  verifyPasswordResetValidator,
  validateRequest,
  verifyPasswordResetOtpController
);
router.post(
  "/reset-password",
  resetPasswordValidator,
  validateRequest,
  resetPasswordController
);
router.post("/google", googleAuthValidator, validateRequest, googleAuthController);
router.post("/logout", logoutController);
router.get("/me", authMiddleware, meController);
router.put("/me", authMiddleware, updateProfileValidator, validateRequest, updateProfileController);
router.post(
  "/change-password",
  authMiddleware,
  changePasswordValidator,
  validateRequest,
  changePasswordController
);
router.delete("/me", authMiddleware, deleteAccountController);

module.exports = router;
