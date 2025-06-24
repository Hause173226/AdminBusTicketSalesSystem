import React, { useEffect, useState } from "react";
import { userServices } from "../../services/userServices";
import BasicTable from "../tables/BasicTable";
import BasicModal from "../modal/BasicModal";
import { Users, Calendar as CalendarIcon, Phone, Mail, MapPin, User as UserIcon, Eye, Pencil, Trash2 } from "lucide-react";

const columns = [
  { key: "fullName", label: "Họ tên" },
  { key: "phone", label: "Số điện thoại" },
  { key: "email", label: "Email" },
  {
    key: "action",
    label: "Action",
    render: (_: any, row: any) => (
      <div className="flex items-center gap-2">
        <button
          className="p-2 text-blue-500 bg-transparent rounded hover:bg-blue-50 text-xs flex items-center justify-center shadow-none border-none focus:outline-none"
          title="Xem chi tiết"
          onClick={() => handleView(row)}
        >
          <Eye size={18} />
        </button>
        <button
          className="p-2 text-yellow-500 bg-transparent rounded hover:bg-yellow-50 text-xs flex items-center justify-center shadow-none border-none focus:outline-none"
          title="Chỉnh sửa"
          // onClick={() => handleEdit(row)}
        >
          <Pencil size={18} />
        </button>
        <button
          className="p-2 text-red-500 bg-transparent rounded hover:bg-red-50 text-xs flex items-center justify-center shadow-none border-none focus:outline-none"
          title="Xoá"
          // onClick={() => handleDelete(row)}
        >
          <Trash2 size={18} />
        </button>
      </div>
    ),
  },
];

let handleView: (user: any) => void; // Will be assigned inside component

const ManagerUser = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  handleView = (user: any) => {
    setSelectedUser(user);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userServices.getAllUsers();
        if (res.status === 200) {
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
      {/* Modal xem chi tiết người dùng */}
      {showModal && selectedUser && (
        <BasicModal
          open={showModal}
          onClose={handleCloseModal}
          title="Chi tiết người dùng"
          subtitle={
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold uppercase">
                {selectedUser.role || "USER"}
              </span>
              <span className="text-gray-500 text-xs">Thông tin chi tiết người dùng</span>
            </div>
          }
          icon={<Users size={28} />}
          readonly
          rows={[
            [
              { label: "Họ tên", value: selectedUser.fullName || "", type: "text", icon: <UserIcon size={18} /> },
              { label: "Số điện thoại", value: selectedUser.phone || "", type: "text", icon: <Phone size={18} /> },
            ],
            [
              { label: "Email", value: selectedUser.email || "", type: "text", icon: <Mail size={18} /> },
              { label: "CCCD", value: selectedUser.citizenId || "", type: "text", icon: <UserIcon size={18} /> },
            ],
            [
              { label: "Ngày sinh", value: selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString("vi-VN") : "", type: "text", icon: <CalendarIcon size={18} /> },
              { label: "Giới tính", value: selectedUser.gender || "", type: "text" },
            ],
            [
              { label: "Địa chỉ", value: selectedUser.address || "", type: "text", colSpan: 2, icon: <MapPin size={18} /> },
            ],
          ]}
        />
      )}
    </div>
  );
};

export default ManagerUser;

