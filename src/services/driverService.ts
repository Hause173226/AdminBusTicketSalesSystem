import axiosInstance from "./axiosInstance";
import { Driver } from "../components/type";

// Get all drivers
export const getAllDrivers = async (): Promise<Driver[]> => {
  const response = await axiosInstance.get("/drivers");
  return response.data;
};

// Create a new driver
export const createDriver = async (driver: Omit<Driver, "_id" | "createdAt" | "updatedAt">) => {
  const response = await axiosInstance.post("/drivers", driver);
  return response.data;
};

// Update a driver
export const updateDriver = async (id: string, driver: Partial<Driver>) => {
  const response = await axiosInstance.put(`/drivers/${id}`, driver);
  return response.data;
};

// Delete a driver
export const deleteDriver = async (id: string) => {
  const response = await axiosInstance.delete(`/drivers/${id}`);
  return response.data;
};
