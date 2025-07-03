import axiosInstance from "./axiosInstance";

// Lấy tất cả bus operators
export const getAllBusOperators = async () => {
  const res = await axiosInstance.get("/bus-operator");
  return res.data;
};

// Tạo mới bus operator
export const createBusOperator = async (operator: any) => {
  const res = await axiosInstance.post("/bus-operator", operator);
  return res.data;
};

// Cập nhật bus operator
export const updateBusOperator = async (id: string, operator: any) => {
  const res = await axiosInstance.put(`/bus-operator/${id}`, operator);
  return res.data;
};

// Xoá bus operator
export const deleteBusOperator = async (id: string) => {
  const res = await axiosInstance.delete(`/bus-operator/${id}`);
  return res.data;
};
