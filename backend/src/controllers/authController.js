const asyncHandler = require("../utils/asyncHandler");
const env = require("../config/env");
const {
  signup,
  verifyEmail,
  resendVerificationOtp,
  login,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
  authenticateWithGoogle,
  updateProfile,
  changePassword,
  deleteAccount
} = require("../services/authService");

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.nodeEnv === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const attachTokenCookie = (res, token) => {
  res.cookie("token", token, cookieOptions);
};

const signupController = asyncHandler(async (req, res) => {
  const result = await signup(req.body);

  return res.status(201).json({
    success: true,
    message: "Signup successful. Please verify your email to continue.",
    data: result
  });
});

const verifyEmailController = asyncHandler(async (req, res) => {
  const result = await verifyEmail(req.body);
  attachTokenCookie(res, result.token);

  return res.status(200).json({
    success: true,
    message: "Email verified successfully.",
    data: result
  });
});

const resendVerificationOtpController = asyncHandler(async (req, res) => {
  const result = await resendVerificationOtp(req.body);

  return res.status(200).json({
    success: true,
    message: "A new verification code has been sent.",
    data: result
  });
});

const loginController = asyncHandler(async (req, res) => {
  const result = await login(req.body);
  attachTokenCookie(res, result.token);

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    data: result
  });
});

const requestPasswordResetController = asyncHandler(async (req, res) => {
  const result = await requestPasswordReset(req.body);

  return res.status(200).json({
    success: true,
    message: "If your account exists, a reset code has been prepared.",
    data: result
  });
});

const verifyPasswordResetOtpController = asyncHandler(async (req, res) => {
  const result = await verifyPasswordResetOtp(req.body);

  return res.status(200).json({
    success: true,
    message: "Reset code verified.",
    data: result
  });
});

const resetPasswordController = asyncHandler(async (req, res) => {
  const result = await resetPassword(req.body);
  attachTokenCookie(res, result.token);

  return res.status(200).json({
    success: true,
    message: "Password updated successfully.",
    data: result
  });
});

const googleAuthController = asyncHandler(async (req, res) => {
  const result = await authenticateWithGoogle(req.body);
  attachTokenCookie(res, result.token);

  return res.status(200).json({
    success: true,
    message: "Google sign-in successful.",
    data: result
  });
});

const logoutController = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    success: true,
    message: "Logout successful."
  });
});

const meController = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user
  });
});

const updateProfileController = asyncHandler(async (req, res) => {
  const user = await updateProfile(req.user._id, req.body);

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: user
  });
});

const changePasswordController = asyncHandler(async (req, res) => {
  const result = await changePassword(req.user._id, req.body);
  attachTokenCookie(res, result.token);

  return res.status(200).json({
    success: true,
    message: "Password updated successfully.",
    data: result
  });
});

const deleteAccountController = asyncHandler(async (req, res) => {
  await deleteAccount(req.user._id);
  res.clearCookie("token");

  return res.status(200).json({
    success: true,
    message: "Account deleted successfully."
  });
});

module.exports = {
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
};
