import axiosInstance from "./axiosInstance";

// Khởi tạo ghế cho trip mới
export const initSeatsForTrip = async (tripId: string, busId: string) => {
  const response = await axiosInstance.post("/seat-booking/init", { tripId, busId });
  return response.data;
};

// Lấy sơ đồ ghế cho trip
export const getSeatMapByTrip = async (tripId: string) => {
  const response = await axiosInstance.get(`/seat-booking/trip/${tripId}`);
  return response.data;
};

// Chọn ghế (lock)
export const selectSeats = async (
  tripId: string,
  seatNumbers: string[],
  lockDurationMinutes?: number
) => {
  const response = await axiosInstance.post("/seat-booking/select", {
    tripId,
    seatNumbers,
    lockDurationMinutes,
  });
  return response.data;
};

// Hủy chọn ghế (release)
export const releaseSeats = async (tripId: string, seatNumbers: string[]) => {
  const response = await axiosInstance.post("/seat-booking/release", {
    tripId,
    seatNumbers,
  });
  return response.data;
};

// Xác nhận booking (chuyển selected -> booked)
export const confirmSeatBooking = async (
  tripId: string,
  seatNumbers: string[],
  bookingId: string
) => {
  const response = await axiosInstance.post("/seat-booking/confirm", {
    tripId,
    seatNumbers,
    bookingId,
  });
  return response.data;
};

// Lấy danh sách ghế đã chọn (selected)
export const getSelectedSeats = async (tripId: string, seatNumbers?: string[]) => {
  let url = `/seat-booking/selected/${tripId}`;
  if (seatNumbers && seatNumbers.length > 0) {
    url += `?seatNumbers=${seatNumbers.join(",")}`;
  }
  const response = await axiosInstance.get(url);
  return response.data;
};

// Cleanup expired locks
export const cleanupExpiredLocks = async (tripId?: string) => {
  const response = await axiosInstance.post("/seat-booking/cleanup", { tripId });
  return response.data;
};

// Hủy booking (chuyển booked -> available)
export const cancelBooking = async (tripId: string, seatNumbers: string[]) => {
  const response = await axiosInstance.post("/seat-booking/cancel", {
    tripId,
    seatNumbers,
  });
  return response.data;
}; 