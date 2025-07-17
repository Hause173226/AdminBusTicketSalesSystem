import axiosInstance from "./axiosInstance";

export const getAllStations = async () => {
  const response = await axiosInstance.get("/station");
  return response.data;
};

export const getStationById = async (id: string) => {
  const response = await axiosInstance.get(`/station/${id}`);
  return response.data;
};

export const createStation = async (data: any) => {
  const response = await axiosInstance.post("/station", data);
  return response.data;
};

export const updateStation = async (id: string, data: any) => {
  const response = await axiosInstance.put(`/station/${id}`, data);
  return response.data;
};

export const deleteStation = async (id: string) => {
  const response = await axiosInstance.delete(`/station/${id}`);
  return response.data;
};

export const getStationNamesAndCities = async () => {
  const response = await axiosInstance.get("/station/city-names");
  return response.data;
};

