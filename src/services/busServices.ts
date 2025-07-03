import axiosInstance from "./axiosInstance";
import { Bus } from "../components/type";

// Get all buses
export const getAllBuses = async (): Promise<Bus[]> => {
  const response = await axiosInstance.get("/buses");
  return response.data;
};

// Create a new bus
export const createBus = async (bus: Omit<Bus, "_id" | "createdAt" | "updatedAt">) => {
  const response = await axiosInstance.post("/buses", bus);
  return response.data;
};

// Update a bus
export const updateBus = async (id: string, bus: Partial<Bus>) => {
  const response = await axiosInstance.put(`/buses/${id}`, bus);
  return response.data;
};

// Delete a bus
export const deleteBus = async (id: string) => {
  const response = await axiosInstance.delete(`/buses/${id}`);
  return response.data;
};
