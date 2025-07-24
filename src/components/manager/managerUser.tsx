import  { useEffect, useState } from "react";
import { userServices } from "../../services/userServices";
import BasicTable from "../tables/BasicTable";
import BasicModal from "../modal/BasicModal";
import { Users, Calendar as CalendarIcon, Phone, Mail, MapPin, User as UserIcon, Eye, Pencil, Trash2, Lock, Unlock } from "lucide-react";
import ConfirmPopover from "../common/ConfirmPopover";
import { toast } from "react-toastify";
import SearchInput from "./SearchInput";
import Pagination from "../common/Pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [searchValue, setSearchValue] = useState("");
  const [editUserErrors, setEditUserErrors] = useState<{ email?: string; phone?: string }>({});
  const [showBlocked, setShowBlocked] = useState(false);

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
  // Validate helpers
  const validateEmail = (email: string) => {
    if (!email) return "";
    if (!/^\S+@gmail\.com$/.test(email)) return "Email phải có đuôi @gmail.com";
    return "";
  };
  const validatePhone = (phone: string) => {
    if (!phone) return "";
    if (!/^\d{10}$/.test(phone)) return "Số điện thoại phải đủ 10 số";
    return "";
  };
  const handleEditFieldChange = (field: string, value: any) => {
    setEditFields((prev: any) => ({ ...prev, [field]: value }));
    if (field === "email") {
      setEditUserErrors(errors => ({ ...errors, email: validateEmail(value) }));
    }
    if (field === "phone") {
      setEditUserErrors(errors => ({ ...errors, phone: validatePhone(value) }));
    }
  };
  const handleEditSubmit = async () => {
    if (!editUser) return;
    // Validate required fields
    const emailError = validateEmail(editFields.email);
    const phoneError = validatePhone(editFields.phone);
    setEditUserErrors({ email: emailError, phone: phoneError });
    if (emailError || phoneError) return;
    if (!editFields.fullName) {
      toast.error("Vui lòng nhập họ tên!");
      return;
    }
    if (!editFields.phone) {
      toast.error("Vui lòng nhập số điện thoại!");
      return;
    }
    if (!editFields.email) {
      toast.error("Vui lòng nhập email!");
      return;
    }
    if (!editFields.citizenId) {
      toast.error("Vui lòng nhập CCCD!");
      return;
    }
    if (!editFields.dateOfBirth) {
      toast.error("Vui lòng nhập ngày sinh!");
      return;
    }
    if (!editFields.gender) {
      toast.error("Vui lòng chọn giới tính!");
      return;
    }
    if (!editFields.address) {
      toast.error("Vui lòng nhập địa chỉ!");
      return;
    }
    if (!editFields.role) {
      toast.error("Vui lòng chọn vai trò!");
      return;
    }
    try {
      setLoading(true);
      const { _id, password, ...payload } = editFields;
      await userServices.updateUser(editUser._id, payload);
      setUsers(users => users.map(u => (u._id === editUser._id ? { ...u, ...payload } : u)));
      setShowEditModal(false);
      setEditUser(null);
      setEditUserErrors({});
      toast.success("Cập nhật người dùng thành công");
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Lỗi khi cập nhật người dùng");
    } finally {
      setLoading(false);
    }
  };
  const handleToggleActiveConfirm = async () => {
    if (!deletePopover.user) return;
    try {
      setLoading(true);
      if (deletePopover.user.isActive) {
        // Block user (set isActive: false)
        await userServices.deleteUser(deletePopover.user._id);
        setUsers(users => users.map(u =>
          u._id === deletePopover.user._id ? { ...u, isActive: false } : u
        ));
        toast.success("Block người dùng thành công");
      } else {
        // Mở khoá user (set isActive: true)
        await userServices.changeUserStatus(deletePopover.user._id, true);
        setUsers(users => users.map(u =>
          u._id === deletePopover.user._id ? { ...u, isActive: true } : u
        ));
        toast.success("Mở khoá người dùng thành công");
      }
      setDeletePopover({ open: false, user: null });
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || err.message || "Lỗi khi cập nhật trạng thái người dùng");
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
          const arr = Array.isArray(res.data) ? res.data : [res.data];
          // Sort by createdAt descending (newest first)
          arr.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setUsers(arr);
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

  // Lọc users theo searchValue
  const filteredUsers = users.filter(u => {
    const v = searchValue.toLowerCase();
    // Lọc theo trạng thái hoạt động hoặc block
    if (showBlocked ? u.isActive : !u.isActive) return false;
    return (
      u.fullName?.toLowerCase().includes(v) ||
      u.phone?.toLowerCase().includes(v) ||
      u.email?.toLowerCase().includes(v)
    );
  });
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
              className={`p-2 ${row.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'} bg-transparent rounded text-xs flex items-center justify-center shadow-none border-none focus:outline-none`}
              title={row.isActive ? 'Block tài khoản' : 'Mở khoá tài khoản'}
              onClick={() => handleDelete(row)}
            >
              {row.isActive ? <Lock size={18} /> : <Unlock size={18} />}
            </button>
            {deletePopover.open && deletePopover.user && deletePopover.user._id === row._id && (
              <ConfirmPopover
                open={deletePopover.open}
                message={
                  <>
                    <div>Bạn có chắc chắn muốn</div>
                    <div className={`font-bold text-base ${row.isActive ? 'text-red-600' : 'text-green-600'}`}>{row.isActive ? 'block tài khoản này?' : 'mở khoá tài khoản này?'}</div>
                  </>
                }
                onConfirm={() => {
                  setDeletePopover({ open: false, user: null }); // Đóng modal trước
                  setTimeout(() => handleToggleActiveConfirm(), 100); // Thực hiện logic sau
                }}
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
        <div className="flex items-center gap-4 ml-auto">
          <SearchInput
            value={searchValue}
            onChange={e => { setSearchValue(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm kiếm tên, số điện thoại, email..."
            debounceMs={1000}
          />
          <button
            onClick={() => setShowBlocked(v => !v)}
            className={`flex items-center px-3 py-1 rounded-full border transition-colors duration-200 focus:outline-none ${showBlocked ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400'}`}
            style={{ minWidth: 90 }}
          >
            <span className={`text-sm font-semibold ${showBlocked ? 'text-red-700' : 'text-green-700'}`}>{showBlocked ? 'Block' : 'Unblock'}</span>
            <span className={`ml-2 w-8 h-4 flex items-center bg-white rounded-full border ${showBlocked ? 'border-red-400' : 'border-green-400'}`}
              style={{ transition: 'background 0.2s' }}>
              <span className={`block w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${showBlocked ? 'bg-red-400 translate-x-4' : 'bg-green-400 translate-x-0'}`}></span>
            </span>
          </button>
        </div>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <BasicTable columns={columnsWithActions} data={paginatedUsers} rowKey="_id" />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={page => setCurrentPage(page)}
            onPageSizeChange={size => { setPageSize(size); setCurrentPage(1); }}
            pageSizeOptions={[6, 15, 30, 50, 100]}
          />
        </>
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
                {selectedUser.role === "admin"
                  ? "QUẢN TRỊ VIÊN"
                  : selectedUser.role === "user"
                  ? "NGƯỜI DÙNG"
                  : (selectedUser.role || "NGƯỜI DÙNG").toUpperCase()}
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
              { label: "Giới tính", value: selectedUser.gender === "male" ? "Nam" : selectedUser.gender === "female" ? "Nữ" : selectedUser.gender === "other" ? "Khác" : (selectedUser.gender || ""), type: "text" },
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
              { label: "Số điện thoại", value: editFields.phone, type: "text", icon: <Phone size={18} />, onChange: (e: any) => handleEditFieldChange("phone", e.target.value), error: editUserErrors.phone },
            ],
            [
              { label: "Email", value: editFields.email, type: "email", icon: <Mail size={18} />, onChange: (e: any) => handleEditFieldChange("email", e.target.value), error: editUserErrors.email },
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
              { label: "Vai trò", value: editFields.role, type: "select", options: [ { label: "Người dùng", value: "user" }, { label: "Quản trị viên", value: "admin" } ], onChange: (e: any) => handleEditFieldChange("role", e.target.value) },
            ],
          ]}
        />
      )}
    </div>
  );
};

export default ManagerUser;

