const { body } = require("express-validator");

const passwordRule = body("password")
  .isLength({ min: 8, max: 64 })
  .withMessage("Password must be between 8 and 64 characters.");

const emailRule = body("email").trim().isEmail().withMessage("Valid email is required.");

const otpRule = body("otp")
  .trim()
  .matches(/^\d{6}$/)
  .withMessage("OTP must be a 6 digit code.");

const signupValidator = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be between 2 and 60 characters."),
  emailRule,
  passwordRule
];

const loginValidator = [emailRule, passwordRule];

const verifyEmailValidator = [emailRule, otpRule];

const resendVerificationValidator = [emailRule];

const forgotPasswordRequestValidator = [emailRule];

const verifyPasswordResetValidator = [emailRule, otpRule];

const resetPasswordValidator = [
  body("resetToken").trim().notEmpty().withMessage("resetToken is required."),
  passwordRule
];

const googleAuthValidator = [
  body("credential").trim().notEmpty().withMessage("Google credential is required.")
];

const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be between 2 and 60 characters."),
  body("avatarUrl")
    .optional()
    .isString()
    .isLength({ max: 2000000 })
    .withMessage("avatarUrl is too long.")
];

const changePasswordValidator = [
  body("currentPassword")
    .trim()
    .isLength({ min: 8, max: 64 })
    .withMessage("Current password must be between 8 and 64 characters."),
  body("newPassword")
    .trim()
    .isLength({ min: 8, max: 64 })
    .withMessage("New password must be between 8 and 64 characters.")
];

module.exports = {
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
};
