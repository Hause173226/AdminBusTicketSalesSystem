import axiosInstance from "./axiosInstance";
import { Trip } from "../components/type/index";

export const getAllTrips = async (): Promise<Trip[]> => {
  const response = await axiosInstance.get("/trips");
  return response.data;
};

export const getTripById = async (id: string): Promise<Trip> => {
  const response = await axiosInstance.get(`/trip/${id}`);
  return response.data;
};

export const searchTrips = async (params: {
  fromStationId?: string;
  toStationId?: string;
  departureDate?: string;
  routeId?: string;
}): Promise<Trip[]> => {
  const response = await axiosInstance.get("/trip/search", { params });
  return response.data;
};

export const getTripsByRoute = async (routeId: string): Promise<Trip[]> => {
  const response = await axiosInstance.get(`/trip/route/${routeId}`);
  return response.data;
};
