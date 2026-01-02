// src/api/auth.api.ts
import publicAxios from "./publicAxios";
import axiosClient from "./axios";

export const AuthApi = {
  // ========= LOGIN / LOGOUT =========
  login: (data: { email: string; password: string }) =>
    publicAxios.post("/auth/login", data),

  logout: () =>
    axiosClient.post("/auth/logout"),

  // ========= REGISTER (OTP) =========
  registerRequestOtp: (data: {
    email: string;
    password: string;
    fullName: string;
  }) =>
    publicAxios.post("/auth/register/request-otp", data),

  registerVerifyOtp: (otp: string) =>
    publicAxios.post("/auth/register/verify-otp", { otp }),

  // ========= FORGOT PASSWORD =========
  forgotRequestOtp: (email: string) =>
    publicAxios.post("/auth/forgot/request-otp", { email }),

  forgotVerifyOtp: (otp: string) =>
    publicAxios.post("/auth/forgot/verify-otp", { otp }),

  forgotResetPassword: (data: {
    newPassword: string;
    confirmNewPassword: string;
  }) =>
    publicAxios.post("/auth/forgot/reset-password", data),

  // ========= CHANGE PASSWORD (PROTECTED) =========
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) =>
    axiosClient.patch("/auth/change-password", data),
};
