import React, { useEffect, useState } from "react";
import BasicTable from "../tables/BasicTable";
import { getAllBuses, deleteBus } from "../../services/busServices";
import { Bus } from "../type";
import BasicModal from "../modal/BasicModal";
import { Bus as BusIcon, Users, Hash, Settings, CheckCircle, XCircle, Eye } from "lucide-react";

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  maintenance: "bg-yellow-100 text-yellow-800",
  inactive: "bg-gray-100 text-gray-800",
};

const statusLabel: Record<string, string> = {
  active: "Hoạt động",
  maintenance: "Bảo trì",
  inactive: "Ngừng hoạt động",
};

let handleView: (bus: any) => void;

const ManagerBus = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const data = await getAllBuses();
      setBuses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  handleView = (bus: any) => {
    setSelectedBus(bus);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBus(null);
  };

  const columns = [
    { key: "licensePlate", label: "Biển số" },
    { key: "busType", label: "Loại xe" },
    { key: "seatCount", label: "Số ghế" },
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
        <h3 className="text-lg font-semibold text-gray-900">Danh sách xe bus</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          Thêm xe mới
        </button>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <BasicTable columns={columns} data={buses} rowKey="_id" />
      )}
      {showModal && selectedBus && (
        <BasicModal
          open={showModal}
          onClose={handleCloseModal}
          title="Chi tiết xe bus"
          subtitle={<span className="text-gray-500 text-xs">Thông tin chi tiết xe bus</span>}
          icon={<BusIcon size={28} />}
          readonly
          rows={[
            [
              { label: "Biển số", value: selectedBus.licensePlate || "", type: "text", icon: <Hash size={18} /> },
              { label: "Loại xe", value: selectedBus.busType || "", type: "text", icon: <Settings size={18} /> },
            ],
            [
              { label: "Số ghế", value: selectedBus.seatCount || "", type: "text", icon: <Users size={18} /> },
              { label: "Trạng thái", value: statusLabel[selectedBus.status || "inactive"], type: "text" },
            ],
          ]}
        />
      )}
    </div>
  );
};

export default ManagerBus;
