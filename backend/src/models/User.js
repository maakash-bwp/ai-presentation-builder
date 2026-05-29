const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      minlength: 8,
      select: false
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: ""
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationOtpHash: {
      type: String,
      select: false,
      default: ""
    },
    emailVerificationExpiresAt: {
      type: Date,
      select: false,
      default: null
    },
    passwordResetOtpHash: {
      type: String,
      select: false,
      default: ""
    },
    passwordResetExpiresAt: {
      type: Date,
      select: false,
      default: null
    },
    passwordResetVerifiedAt: {
      type: Date,
      select: false,
      default: null
    },
    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model("User", userSchema);
