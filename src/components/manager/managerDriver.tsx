import React, { useEffect, useState } from "react";
import BasicTable from "../tables/BasicTable";
import { getAllDrivers, deleteDriver, updateDriver } from "../../services/driverService";
import { Driver } from "../type";
import BasicModal from "../modal/BasicModal";
import { UserCheck, Phone, Mail, Calendar as CalendarIcon, Users, Eye, Pencil, Trash2 } from "lucide-react";
import ConfirmPopover from "../common/ConfirmPopover";

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  suspended: "bg-yellow-100 text-yellow-800",
  inactive: "bg-gray-100 text-gray-800",
};

const statusLabel: Record<string, string> = {
  active: "Hoạt động",
  suspended: "Tạm đình chỉ",
  inactive: "Ngừng hoạt động",
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

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await getAllDrivers();
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
  const handleUpdateDriver = async () => {
    if (!editDriver || !editDriver._id) return;
    setEditLoading(true);
    try {
      await updateDriver(editDriver._id, editDriver);
      setShowEditModal(false);
      setEditDriver(null);
      await fetchDrivers();
    } catch (err) {
      alert("Lỗi khi cập nhật tài xế");
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
    } catch (err) {
      alert("Lỗi khi xoá tài xế");
    }
  };

  const columns = [
    { key: "fullName", label: "Họ tên" },
    { key: "phone", label: "Số điện thoại" },
    { key: "email", label: "Email" },
    { key: "licenseNumber", label: "Số GPLX" },
    {
      key: "status",
      label: "Trạng thái",
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[value] || "bg-gray-100 text-gray-800"}`}>
          {statusLabel[value] || value}
        </span>
      ),
    },
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
              onConfirm={() => handleDelete(row)}
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
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          Thêm tài xế mới
        </button>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <BasicTable columns={columns} data={drivers} rowKey="_id" />
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
            [
              { label: "Nhà xe", value: selectedDriver.operator || "", type: "text", colSpan: 2 },
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
              { label: "Họ tên", value: editDriver.fullName, type: "text", icon: <Users size={18} />, onChange: (e: any) => setEditDriver((d: any) => ({ ...d, fullName: e.target.value })) },
              { label: "Số điện thoại", value: editDriver.phone, type: "text", icon: <Phone size={18} />, onChange: (e: any) => setEditDriver((d: any) => ({ ...d, phone: e.target.value })) },
            ],
            [
              { label: "Email", value: editDriver.email, type: "text", icon: <Mail size={18} />, onChange: (e: any) => setEditDriver((d: any) => ({ ...d, email: e.target.value })) },
              { label: "Số GPLX", value: editDriver.licenseNumber, type: "text", onChange: (e: any) => setEditDriver((d: any) => ({ ...d, licenseNumber: e.target.value })) },
            ],
            [
              { label: "Nhà xe", value: editDriver.operator, type: "text", colSpan: 2, onChange: (e: any) => setEditDriver((d: any) => ({ ...d, operator: e.target.value })) },
            ],
            [
              { label: "Trạng thái", value: editDriver.status, type: "select", options: [
                { label: "Hoạt động", value: "active" },
                { label: "Tạm đình chỉ", value: "suspended" },
                { label: "Ngừng hoạt động", value: "inactive" },
              ], onChange: (e: any) => setEditDriver((d: any) => ({ ...d, status: e.target.value })) },
            ],
          ]}
        />
      )}
    </div>
  );
};

export default ManagerDriver;
