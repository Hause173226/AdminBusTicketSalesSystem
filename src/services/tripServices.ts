import axiosInstance from "./axiosInstance";
import { Trip } from "../components/type/index";

export const getAllTrips = async (): Promise<Trip[]> => {
  try {
    const response = await axiosInstance.get("/trips");
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || err.response?.data?.message || err.message || "Lỗi khi lấy danh sách chuyến xe");
  }
};

export const getTripById = async (id: string): Promise<Trip> => {
  try {
    const response = await axiosInstance.get(`/trips/${id}`);
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || err.response?.data?.message || err.message || "Lỗi khi lấy chi tiết chuyến xe");
  }
};

export const searchTrips = async (params: {
  from: string;
  to: string;
  date: string;
  searchBy: "city" | "station";
}): Promise<Trip[]> => {
  try {
    const response = await axiosInstance.get("/trips/search", { params });
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || err.response?.data?.message || err.message || "Lỗi khi tìm kiếm chuyến xe");
  }
};

export const getTripsByRoute = async (routeId: string): Promise<Trip[]> => {
  try {
    const response = await axiosInstance.get(`/trips/route/${routeId}`);
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || err.response?.data?.message || err.message || "Lỗi khi lấy chuyến theo tuyến");
  }
};

export const createTrip = async (tripData: Partial<Trip>) => {
  // Không gửi arrivalTime, backend sẽ tự tính
  const { arrivalTime, ...payload } = tripData;
  try {
    const response = await axiosInstance.post("/trips", payload);
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || err.response?.data?.message || err.message || "Lỗi khi tạo chuyến xe mới");
  }
};

export const updateTrip = async (id: string, tripData: Partial<Trip>) => {
  try {
    const response = await axiosInstance.put(`/trips/${id}`, tripData);
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || err.response?.data?.message || err.message || "Lỗi khi cập nhật chuyến xe");
  }
};

export const deleteTrip = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/trips/${id}`);
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || err.response?.data?.message || err.message || "Lỗi khi xoá chuyến xe");
  }
};
