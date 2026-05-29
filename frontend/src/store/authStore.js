import { create } from "zustand";
import {
  changePasswordRequest,
  deleteAccountRequest,
  forgotPasswordRequest,
  googleAuthRequest,
  loginRequest,
  logoutRequest,
  meRequest,
  resendVerificationRequest,
  resetPasswordRequest,
  signupRequest,
  updateProfileRequest,
  verifyEmailRequest,
  verifyForgotPasswordOtpRequest
} from "../services/authService";

const getSavedToken = () => localStorage.getItem("apb_token");

const saveToken = (token) => {
  if (token) {
    localStorage.setItem("apb_token", token);
  } else {
    localStorage.removeItem("apb_token");
  }
};

const finalizeAuth = (set, response) => {
  saveToken(response.token);
  set({
    token: response.token,
    user: response.user,
    isLoading: false,
    isInitialized: true
  });
  return response.user;
};

export const useAuthStore = create((set, get) => ({
  token: getSavedToken(),
  user: null,
  isLoading: false,
  isInitialized: false,
  pendingVerificationEmail: "",
  passwordResetEmail: "",
  passwordResetToken: "",
  async initialize() {
    if (get().isInitialized || !get().token) {
      set({ isInitialized: true });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await meRequest();
      set({ user, isInitialized: true, isLoading: false });
    } catch {
      saveToken(null);
      set({ token: null, user: null, isInitialized: true, isLoading: false });
    }
  },
  async signup(payload) {
    set({ isLoading: true });
    try {
      const response = await signupRequest(payload);
      set({
        isLoading: false,
        isInitialized: true,
        pendingVerificationEmail: response.user.email
      });
      return response;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  async verifyEmail(payload) {
    set({ isLoading: true });
    try {
      const response = await verifyEmailRequest(payload);
      set({
        pendingVerificationEmail: ""
      });
      return finalizeAuth(set, response);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  async resendVerification(email) {
    set({ isLoading: true });
    try {
      const response = await resendVerificationRequest({ email });
      set({
        isLoading: false,
        pendingVerificationEmail: email
      });
      return response;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  async login(payload) {
    set({ isLoading: true });
    try {
      const response = await loginRequest(payload);
      return finalizeAuth(set, response);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  async continueWithGoogle(credential) {
    set({ isLoading: true });
    try {
      const response = await googleAuthRequest({ credential });
      return finalizeAuth(set, response);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  async requestPasswordReset(email) {
    set({ isLoading: true });
    try {
      const response = await forgotPasswordRequest({ email });
      set({
        isLoading: false,
        passwordResetEmail: email
      });
      return response;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  async verifyPasswordResetOtp(payload) {
    set({ isLoading: true });
    try {
      const response = await verifyForgotPasswordOtpRequest(payload);
      set({
        isLoading: false,
        passwordResetToken: response.resetToken
      });
      return response;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  async resetPassword(password) {
    set({ isLoading: true });
    try {
      const response = await resetPasswordRequest({
        resetToken: get().passwordResetToken,
        password
      });
      set({
        passwordResetToken: "",
        passwordResetEmail: ""
      });
      return finalizeAuth(set, response);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  async logout() {
    set({ isLoading: true });
    try {
      await logoutRequest();
    } finally {
      saveToken(null);
      set({
        token: null,
        user: null,
        isLoading: false,
        isInitialized: true,
        pendingVerificationEmail: "",
        passwordResetEmail: "",
        passwordResetToken: ""
      });
    }
  },
  async updateProfile(payload) {
    set({ isLoading: true });
    try {
      const user = await updateProfileRequest(payload);
      set((state) => ({
        user,
        token: state.token,
        isLoading: false,
        isInitialized: true
      }));
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  async changePassword(payload) {
    set({ isLoading: true });
    try {
      const response = await changePasswordRequest(payload);
      return finalizeAuth(set, response);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  async deleteAccount() {
    set({ isLoading: true });
    try {
      await deleteAccountRequest();
    } finally {
      saveToken(null);
      set({
        token: null,
        user: null,
        isLoading: false,
        isInitialized: true,
        pendingVerificationEmail: "",
        passwordResetEmail: "",
        passwordResetToken: ""
      });
    }
  }
}));
