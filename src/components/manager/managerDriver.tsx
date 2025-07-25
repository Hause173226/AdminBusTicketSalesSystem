import { useEffect, useState } from "react";
import BasicTable from "../tables/BasicTable";
import { getAllDrivers, deleteDriver, updateDriver, createDriver } from "../../services/driverService";
import { Driver } from "../type";
import BasicModal from "../modal/BasicModal";
import { UserCheck, Phone, Mail, Calendar as CalendarIcon, Users, Eye, Pencil, Trash2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import ConfirmPopover from "../common/ConfirmPopover";
import { toast } from "react-toastify";
import SearchInput from "./SearchInput";
import Pagination from "../common/Pagination";

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700 border border-green-300 font-bold",
  suspended: "bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold",
  inactive: "bg-gray-100 text-gray-800 border border-gray-300 font-bold",
};

const statusLabel: Record<string, string> = {
  active: "Hoạt động",
  suspended: "Tạm đình chỉ",
  inactive: "Ngừng hoạt động",
};

const statusIcon: Record<string, JSX.Element> = {
  active: <CheckCircle size={16} className="inline mr-1" />,
  suspended: <AlertTriangle size={16} className="inline mr-1 text-yellow-600" />,
  inactive: <XCircle size={16} className="inline mr-1" />,
};

let handleView: (driver: any) => void;

const ManagerDriver = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newDriver, setNewDriver] = useState<any>({
    fullName: "",
    phone: "",
    email: "",
    licenseNumber: "",
    status: "active"
  });
  const [searchValue, setSearchValue] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [newDriverErrors, setNewDriverErrors] = useState<{ email?: string; phone?: string; licenseNumber?: string }>({});
  const [editDriverErrors, setEditDriverErrors] = useState<{ email?: string; phone?: string; licenseNumber?: string }>({});

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
  const validateLicenseNumber = (licenseNumber: string) => {
    if (!licenseNumber) return "";
    if (!/^\d{12}$/.test(licenseNumber)) return "Số GPLX phải gồm đúng 12 chữ số";
    return "";
  };

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await getAllDrivers();
      // Sort by createdAt descending (newest first)
      data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setDrivers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  handleView = (driver: any) => {
    setSelectedDriver(driver);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDriver(null);
  };

  const handleEdit = (driver: Driver) => {
    setEditDriver({ ...driver });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditDriver(null);
  };
  const handleEditDriverField = (field: string, value: string) => {
    setEditDriver((d: any) => ({ ...d, [field]: value }));
    if (field === "email") {
      setEditDriverErrors(errors => ({ ...errors, email: validateEmail(value) }));
    }
    if (field === "phone") {
      setEditDriverErrors(errors => ({ ...errors, phone: validatePhone(value) }));
    }
    if (field === "licenseNumber") {
      setEditDriverErrors(errors => ({ ...errors, licenseNumber: validateLicenseNumber(value) }));
    }
  };
  const handleNewDriverField = (field: string, value: string) => {
    setNewDriver((d: any) => ({ ...d, [field]: value }));
    if (field === "email") {
      setNewDriverErrors(errors => ({ ...errors, email: validateEmail(value) }));
    }
    if (field === "phone") {
      setNewDriverErrors(errors => ({ ...errors, phone: validatePhone(value) }));
    }
    if (field === "licenseNumber") {
      setNewDriverErrors(errors => ({ ...errors, licenseNumber: validateLicenseNumber(value) }));
    }
  };

  const handleUpdateDriver = async () => {
    if (!editDriver || !editDriver._id) return;
    // Validate
    const emailError = validateEmail(editDriver.email ?? "");
    const phoneError = validatePhone(editDriver.phone ?? "");
    const licenseNumberError = validateLicenseNumber(editDriver.licenseNumber ?? "");
    
    setEditDriverErrors({ email: emailError, phone: phoneError, licenseNumber: licenseNumberError });
    if (emailError || phoneError || licenseNumberError) return;
    setEditLoading(true);
    try {
      const payload = {
        ...editDriver
      };
      await updateDriver(editDriver._id, payload);
      setShowEditModal(false);
      setEditDriver(null);
      setEditDriverErrors({});
      await fetchDrivers();
      toast.success("Cập nhật tài xế thành công");
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Lỗi khi cập nhật tài xế");
    } finally {
      setEditLoading(false);
    }
  };
  const handleDelete = async (driver: Driver) => {
    if (!driver._id) return;
    try {
      await deleteDriver(driver._id);
      await fetchDrivers();
      setDeleteConfirmId(null);
      toast.success("Xoá tài xế thành công");
    } catch (err: any) {
      // Log ra đúng lỗi trả về từ backend
      toast.error(err.response?.data?.error || err.response?.data?.message || err.message || "Lỗi khi xoá tài xế");
    }
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setNewDriver({
      fullName: "",
      phone: "",
      email: "",
      licenseNumber: "",
      status: "active"
    });
    setNewDriverErrors({});
  };
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };
  const handleCreateDriver = async () => {
    // Validate required fields
    const emailError = validateEmail(newDriver.email);
    const phoneError = validatePhone(newDriver.phone);
    const licenseNumberError = validateLicenseNumber(newDriver.licenseNumber);
    setNewDriverErrors({ email: emailError, phone: phoneError, licenseNumber: licenseNumberError });
    if (emailError || phoneError || licenseNumberError) return;
    if (!newDriver.fullName) {
      toast.error("Vui lòng nhập họ tên tài xế!");
      return;
    }
    if (!newDriver.phone) {
      toast.error("Vui lòng nhập số điện thoại!");
      return;
    }
    if (!newDriver.email) {
      toast.error("Vui lòng nhập email!");
      return;
    }
    if (!newDriver.licenseNumber) {
      toast.error("Vui lòng nhập số GPLX!");
      return;
    }
    if (!newDriver.status) {
      toast.error("Vui lòng chọn trạng thái!");
      return;
    }
    setCreateLoading(true);
    try {
      const payload = {
        ...newDriver
      };
      await createDriver(payload);
      setShowCreateModal(false);
      setNewDriver({
        fullName: "",
        phone: "",
        email: "",
        licenseNumber: "",
        status: "active"
      });
      setNewDriverErrors({});
      await fetchDrivers();
      toast.success("Tạo tài xế thành công");
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Lỗi khi tạo tài xế mới");
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    (driver.fullName?.toLowerCase().includes(searchValue.toLowerCase()) ||
     driver.phone?.toLowerCase().includes(searchValue.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredDrivers.length / pageSize);
  const paginatedDrivers = filteredDrivers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    { key: "fullName", label: "Họ tên" },
    { key: "phone", label: "Số điện thoại" },
    { key: "email", label: "Email" },
    {
      key: "status",
      label: "Trạng thái",
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full min-w-[120px] flex items-center justify-center ${statusColor[value] || "bg-gray-100 text-gray-800 border border-gray-300 font-bold"}`}>
          {statusIcon[value]} {statusLabel[value] || value}
        </span>
      ),
    },
    { key: "licenseNumber", label: "Số GPLX" },
    
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
              onClick={() => setDeleteConfirmId(row._id!)}
            >
              <Trash2 size={18} />
            </button>
            <ConfirmPopover
              open={deleteConfirmId === row._id}
              message={
                <>
                  <div>Bạn có chắc chắn muốn</div>
                  <div className="font-bold text-red-600 text-base">xoá tài xế này?</div>
                </>
              }
              onConfirm={() => {
                setDeleteConfirmId(null); // Đóng modal trước
                setTimeout(() => handleDelete(row), 100); // Thực hiện xóa sau
              }}
              onCancel={() => setDeleteConfirmId(null)}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Danh sách tài xế</h3>
        <div className="flex items-center gap-2 ml-auto">
          <SearchInput
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Tìm kiếm tên hoặc số điện thoại..."
            debounceMs={800}
          />
          <button className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium" onClick={handleOpenCreateModal}>
            Thêm tài xế mới
          </button>
        </div>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <BasicTable columns={columns} data={paginatedDrivers} rowKey="_id" />
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
      {showModal && selectedDriver && (
        <BasicModal
          open={showModal}
          onClose={handleCloseModal}
          title="Chi tiết tài xế"
          subtitle={
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2 py-0.5 rounded ${statusColor[selectedDriver.status || "inactive"]} text-xs font-semibold uppercase`}>
                {statusLabel[selectedDriver.status || "inactive"]}
              </span>
              <span className="text-gray-500 text-xs">Thông tin chi tiết tài xế</span>
            </div>
          }
          icon={<UserCheck size={28} />}
          readonly
          rows={[
            [
              { label: "Họ tên", value: selectedDriver.fullName || "", type: "text", icon: <Users size={18} /> },
              { label: "Số điện thoại", value: selectedDriver.phone || "", type: "text", icon: <Phone size={18} /> },
            ],
            [
              { label: "Email", value: selectedDriver.email || "", type: "text", icon: <Mail size={18} /> },
              { label: "Số GPLX", value: selectedDriver.licenseNumber || "", type: "text" },
            ],
          ]}
        />
      )}
      {showEditModal && editDriver && (
        <BasicModal
          open={showEditModal}
          onClose={handleCloseEditModal}
          title="Chỉnh sửa tài xế"
          subtitle={<span className="text-gray-500 text-xs">Cập nhật thông tin tài xế</span>}
          icon={<UserCheck size={28} />}
          readonly={false}
          onSubmit={handleUpdateDriver}
          submitLabel={editLoading ? "Đang lưu..." : "Cập nhật"}
          rows={[
            [
              { label: "Họ tên", value: editDriver.fullName, type: "text", icon: <Users size={18} />, onChange: (e: any) => handleEditDriverField("fullName", e.target.value) },
              { label: "Số điện thoại", value: editDriver.phone, type: "text", icon: <Phone size={18} />, onChange: (e: any) => handleEditDriverField("phone", e.target.value), error: editDriverErrors.phone },
            ],
            [
              { label: "Email", value: editDriver.email, type: "text", icon: <Mail size={18} />, onChange: (e: any) => handleEditDriverField("email", e.target.value), error: editDriverErrors.email },
              { label: "Số GPLX", value: editDriver.licenseNumber, type: "text", onChange: (e: any) => handleEditDriverField("licenseNumber", e.target.value), error: editDriverErrors.licenseNumber },
            ],
            [
              { label: "Trạng thái", value: editDriver.status, type: "select", options: [
                { label: "Hoạt động", value: "active" },
                { label: "Tạm đình chỉ", value: "suspended" },
                { label: "Ngừng hoạt động", value: "inactive" },
              ], onChange: (e: any) => handleEditDriverField("status", e.target.value) },
            ],
          ]}
        />
      )}
      {showCreateModal && (
        <BasicModal
          open={showCreateModal}
          onClose={handleCloseCreateModal}
          title="Tạo tài xế mới"
          subtitle={<span className="text-gray-500 text-xs">Nhập thông tin tài xế</span>}
          icon={<UserCheck size={28} />}
          readonly={false}
          onSubmit={handleCreateDriver}
          submitLabel={createLoading ? "Đang lưu..." : "Tạo mới"}
          rows={[
            [
              { label: "Họ tên", value: newDriver.fullName, type: "text", icon: <Users size={18} />, onChange: (e: any) => handleNewDriverField("fullName", e.target.value) },
              { label: "Số điện thoại", value: newDriver.phone, type: "text", icon: <Phone size={18} />, onChange: (e: any) => handleNewDriverField("phone", e.target.value), error: newDriverErrors.phone },
            ],
            [
              { label: "Email", value: newDriver.email, type: "text", icon: <Mail size={18} />, onChange: (e: any) => handleNewDriverField("email", e.target.value), error: newDriverErrors.email },
              { label: "Số GPLX", value: newDriver.licenseNumber, type: "text", onChange: (e: any) => handleNewDriverField("licenseNumber", e.target.value), error: newDriverErrors.licenseNumber },
            ],
          ]}
        />
      )}
    </div>
  );
};

export default ManagerDriver;
