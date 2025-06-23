import React, { useEffect, useState } from "react";
import BasicTable from "../tables/BasicTable";
import { getAllDrivers, deleteDriver } from "../../services/driverService";
import { Driver } from "../type";
import BasicModal from "../modal/BasicModal";
import { UserCheck, Phone, Mail, Calendar as CalendarIcon, Users, Eye } from "lucide-react";

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
        <button
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs flex items-center justify-center"
          title="Xem chi tiết"
          onClick={() => handleView(row)}
        >
          <Eye size={18} />
        </button>
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
    </div>
  );
};

export default ManagerDriver;
