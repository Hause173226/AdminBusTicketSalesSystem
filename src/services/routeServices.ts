import axiosInstance from "./axiosInstance";

export const getAllRoutes = async () => {
  const response = await axiosInstance.get("/route");
  return response.data;
};

export const createRoute = async (data: any) => {
  const response = await axiosInstance.post("/route", data);
  return response.data;
};

export const updateRoute = async (id: string, data: any) => {
  const response = await axiosInstance.put(`/route/${id}`, data);
  return response.data;
};

export const deleteRoute = async (id: string) => {
  const response = await axiosInstance.delete(`/route/${id}`);
  return response.data;
};
