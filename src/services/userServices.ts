import axiosInstance from "./axiosInstance";

export const userServices = {
  getAllUsers: () => {
    return axiosInstance.get("/users");
  },
  getUser: (id: string) => {
    return axiosInstance.get(`/users/${id}`);
  },
  register: (
    fullName: string,
    phone: string,
    email: string,
    password: string
  ) => {
    return axiosInstance.post("/users/signup", {
      fullName,
      phone,
      email,
      password,
    });
  },
  signin: (email: string, password: string) => {
    return axiosInstance.post("/users/signin", {
      email,
      password,
      role: "admin"
    });
  },
  forgotPassword: (email: string) => {
    return axiosInstance.post("/users/forgot-password", {
      email,
    });
  },
  resendOTP: (email: string) => {
    return axiosInstance.post("/users/resend-otp", {
      email,
    });
  },
  resetPassword: (email: string, otp: string, newPassword: string) => {
    return axiosInstance.post("/users/reset-password", {
      email,
      otp,
      newPassword,
    });
  },
};
