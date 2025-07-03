import axiosInstance from "./axiosInstance";

export const bookingService = {
  getAllBookings: async () => {
    const res = await axiosInstance.get("/booking");
    return res.data;
  },
  createBooking: async (data: any) => {
    const res = await axiosInstance.post("/booking", data);
    return res.data;
  },
};
