import axiosInstance from "./axiosInstance";
import { Trip } from "../components/type/index";

export const getAllTrips = async (): Promise<Trip[]> => {
  const response = await axiosInstance.get("/trips");
  return response.data;
};

export const getTripById = async (id: string): Promise<Trip> => {
  const response = await axiosInstance.get(`/trips/${id}`);
  return response.data;
};

export const searchTrips = async (params: {
  from: string;
  to: string;
  date: string;
  searchBy: "city" | "station";
}): Promise<Trip[]> => {
  const response = await axiosInstance.get("/trips/search", { params });
  return response.data;
};

export const getTripsByRoute = async (routeId: string): Promise<Trip[]> => {
  const response = await axiosInstance.get(`/trips/route/${routeId}`);
  return response.data;
};

export const createTrip = async (tripData: Partial<Trip>) => {
  const response = await axiosInstance.post("/trips", tripData);
  return response.data;
};

export const createMultipleTrips = async (
  tripData: Partial<Trip>,
  startTime: string,
  endTime: string,
  intervalHours: number = 2
) => {
  const response = await axiosInstance.post("/trips/multiple", {
    tripData,
    startTime,
    endTime,
    intervalHours,
  });
  return response.data;
};

export const updateTrip = async (id: string, tripData: Partial<Trip>) => {
  const response = await axiosInstance.put(`/trips/${id}`, tripData);
  return response.data;
};

export const deleteTrip = async (id: string) => {
  const response = await axiosInstance.delete(`/trips/${id}`);
  return response.data;
};
