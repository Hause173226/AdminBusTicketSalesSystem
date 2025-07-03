import  { useEffect, useState } from "react";
import { userServices } from "../../services/userServices";
import BasicTable from "../tables/BasicTable";
import BasicModal from "../modal/BasicModal";
import { Users, Calendar as CalendarIcon, Phone, Mail, MapPin, User as UserIcon, Eye, Pencil, Trash2 } from "lucide-react";
import ConfirmPopover from "../common/ConfirmPopover";
import { toast } from "react-toastify";

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
let handleEdit: (user: any) => void;
let handleDelete: (user: any) => void;

const ManagerUser = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editFields, setEditFields] = useState<any>({});
  const [deletePopover, setDeletePopover] = useState<{ open: boolean; user: any | null }>({ open: false, user: null });

  handleView = (user: any) => {
    setSelectedUser(user);
    setShowModal(true);
  };
  handleEdit = (user: any) => {
    let gender = user.gender;
    if (gender === 'Nam') gender = 'male';
    else if (gender === 'Nữ') gender = 'female';
    else if (gender === 'Khác') gender = 'other';
    else if (!['male', 'female', 'other'].includes(gender)) gender = 'male';
    setEditUser(user);
    setEditFields({
      fullName: user.fullName || "",
      phone: user.phone || "",
      email: user.email || "",
      citizenId: user.citizenId || "",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
      gender,
      address: user.address || "",
      role: user.role || "user",
    });
    setShowEditModal(true);
  };
  handleDelete = (user: any) => {
    setDeletePopover({ open: true, user });
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditUser(null);
  };
  const handleEditFieldChange = (field: string, value: any) => {
    setEditFields((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleEditSubmit = async () => {
    if (!editUser) return;
    try {
      setLoading(true);
      const { _id, password, ...payload } = editFields;
      await userServices.updateUser(editUser._id, payload);
      setUsers(users => users.map(u => (u._id === editUser._id ? { ...u, ...payload } : u)));
      setShowEditModal(false);
      setEditUser(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Lỗi khi cập nhật người dùng");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteConfirm = async () => {
    if (!deletePopover.user) return;
    try {
      setLoading(true);
      await userServices.deleteUser(deletePopover.user._id);
      setUsers(users => users.filter(u => u._id !== deletePopover.user._id));
      setDeletePopover({ open: false, user: null });
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Lỗi khi xoá người dùng");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteCancel = () => {
    setDeletePopover({ open: false, user: null });
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

  const columnsWithActions = [
    ...columns.slice(0, 3),
    {
      key: "action",
      label: "Action",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2 relative">
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
            onClick={() => handleEdit(row)}
          >
            <Pencil size={18} />
          </button>
          <div className="relative">
            <button
              className="p-2 text-red-500 bg-transparent rounded hover:bg-red-50 text-xs flex items-center justify-center shadow-none border-none focus:outline-none"
              title="Xoá"
              onClick={() => handleDelete(row)}
            >
              <Trash2 size={18} />
            </button>
            {deletePopover.open && deletePopover.user && deletePopover.user._id === row._id && (
              <ConfirmPopover
                open={deletePopover.open}
                message={
                  <>
                  <div>Bạn có chắc chắn muốn</div>
                  <div className="font-bold text-red-600 text-base">xoá người dùng này?</div>
                </>}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
              />
            )}
          </div>
        </div>
      ),
    },
  ];

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
        <BasicTable columns={columnsWithActions} data={users} rowKey="_id" />
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
      {/* Modal chỉnh sửa người dùng */}
      {showEditModal && editUser && (
        <BasicModal
          open={showEditModal}
          onClose={handleCloseEditModal}
          title="Chỉnh sửa người dùng"
          icon={<Pencil size={28} />}
          readonly={false}
          onSubmit={handleEditSubmit}
          submitLabel="Lưu"
          rows={[
            [
              { label: "Họ tên", value: editFields.fullName, type: "text", icon: <UserIcon size={18} />, onChange: (e: any) => handleEditFieldChange("fullName", e.target.value) },
              { label: "Số điện thoại", value: editFields.phone, type: "text", icon: <Phone size={18} />, onChange: (e: any) => handleEditFieldChange("phone", e.target.value) },
            ],
            [
              { label: "Email", value: editFields.email, type: "email", icon: <Mail size={18} />, onChange: (e: any) => handleEditFieldChange("email", e.target.value) },
              { label: "CCCD", value: editFields.citizenId, type: "text", icon: <UserIcon size={18} />, onChange: (e: any) => handleEditFieldChange("citizenId", e.target.value) },
            ],
            [
              { label: "Ngày sinh", value: editFields.dateOfBirth, type: "date", icon: <CalendarIcon size={18} />, onChange: (e: any) => handleEditFieldChange("dateOfBirth", e.target.value) },
              { label: "Giới tính", value: editFields.gender, type: "select", options: [ { label: "Nam", value: "male" }, { label: "Nữ", value: "female" }, { label: "Khác", value: "other" } ], onChange: (e: any) => handleEditFieldChange("gender", e.target.value) },
            ],
            [
              { label: "Địa chỉ", value: editFields.address, type: "text", colSpan: 2, icon: <MapPin size={18} />, onChange: (e: any) => handleEditFieldChange("address", e.target.value) },
            ],
            [
              { label: "Vai trò", value: editFields.role, type: "select", options: [ { label: "User", value: "user" }, { label: "Admin", value: "admin" } ], onChange: (e: any) => handleEditFieldChange("role", e.target.value) },
            ],
          ]}
        />
      )}
    </div>
  );
};

export default ManagerUser;

