import api from "./api";

export const signupRequest = async (payload) => {
  const { data } = await api.post("/auth/signup", payload);
  return data.data;
};

export const verifyEmailRequest = async (payload) => {
  const { data } = await api.post("/auth/verify-email", payload);
  return data.data;
};

export const resendVerificationRequest = async (payload) => {
  const { data } = await api.post("/auth/verify-email/resend", payload);
  return data.data;
};

export const loginRequest = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data.data;
};

export const forgotPasswordRequest = async (payload) => {
  const { data } = await api.post("/auth/forgot-password", payload);
  return data.data;
};

export const verifyForgotPasswordOtpRequest = async (payload) => {
  const { data } = await api.post("/auth/forgot-password/verify", payload);
  return data.data;
};

export const resetPasswordRequest = async (payload) => {
  const { data } = await api.post("/auth/reset-password", payload);
  return data.data;
};

export const googleAuthRequest = async (payload) => {
  const { data } = await api.post("/auth/google", payload);
  return data.data;
};

export const logoutRequest = async () => {
  await api.post("/auth/logout");
};

export const meRequest = async () => {
  const { data } = await api.get("/auth/me");
  return data.data;
};

export const updateProfileRequest = async (payload) => {
  const { data } = await api.put("/auth/me", payload);
  return data.data;
};

export const changePasswordRequest = async (payload) => {
  const { data } = await api.post("/auth/change-password", payload);
  return data.data;
};

export const deleteAccountRequest = async () => {
  await api.delete("/auth/me");
};
