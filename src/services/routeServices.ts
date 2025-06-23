import axiosInstance from "./axiosInstance";

export const getAllRoutes = async () => {
  const response = await axiosInstance.get("/route");
  return response.data;
};
