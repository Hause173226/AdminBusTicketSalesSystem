import React, { useEffect, useState } from "react";
import { userServices } from "../../services/userServices";
import BasicTable from "../tables/BasicTable";

const columns = [
  { key: "fullName", label: "Họ tên" },
  { key: "phone", label: "Số điện thoại" },
  { key: "email", label: "Email" },
  { key: "citizenId", label: "CCCD" },
  {
    key: "dateOfBirth",
    label: "Ngày sinh",
    render: (value: string) => value ? new Date(value).toLocaleDateString("vi-VN") : "",
  },
  { key: "gender", label: "Giới tính" },
  { key: "address", label: "Địa chỉ" },
];

const ManagerUser = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userServices.getAllUsers();
        if (res.status === 200) {
          console.log("User data:", res.data); // Thêm dòng này
          setUsers(Array.isArray(res.data) ? res.data : [res.data]);
        } else {
          setError("Không thể lấy dữ liệu người dùng");
        }
      } catch (err) {
        setError("Lỗi khi lấy dữ liệu người dùng");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Danh sách người dùng</h3>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <BasicTable columns={columns} data={users} rowKey="_id" />
      )}
    </div>
  );
};

export default ManagerUser;

