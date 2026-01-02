import axios from "./axios";

export const AuthApi = {
  // ========= LOGIN / LOGOUT =========
  login: (data: { email: string; password: string }) =>
    axios.post("/auth/login", data),

  logout: () => axios.post("/auth/logout"),

  // ========= REGISTER (OTP) =========
  registerRequestOtp: (data: {
    email: string;
    password: string;
    fullName: string;
  }) =>
    axios.post("/auth/register/request-otp", data),

  registerVerifyOtp: (otp: string) =>
    axios.post("/auth/register/verify-otp", { otp }),

  // ========= FORGOT PASSWORD =========
  forgotRequestOtp: (email: string) =>
    axios.post("/auth/forgot/request-otp", { email }),

  forgotVerifyOtp: (otp: string) =>
    axios.post("/auth/forgot/verify-otp", { otp }),

  forgotResetPassword: (data: {
    newPassword: string;
    confirmNewPassword: string;
  }) =>
    axios.post("/auth/forgot/reset-password", data),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) =>
    axios.patch("/auth/change-password", data),
};
