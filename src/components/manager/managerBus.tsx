import React, { useEffect, useState } from "react";
import BasicTable from "../tables/BasicTable";
import { getAllBuses, deleteBus, updateBus } from "../../services/busServices";
import { Bus } from "../type";
import BasicModal from "../modal/BasicModal";
import { Bus as BusIcon, Users, Hash, Settings, CheckCircle, XCircle, Eye, Pencil, Trash2 } from "lucide-react";
import ConfirmPopover from "../common/ConfirmPopover";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBus, setEditBus] = useState<Bus | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const handleEdit = (bus: Bus) => {
    setEditBus({ ...bus });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditBus(null);
  };
  const handleUpdateBus = async () => {
    if (!editBus || !editBus._id) return;
    setEditLoading(true);
    try {
      await updateBus(editBus._id, editBus);
      setShowEditModal(false);
      setEditBus(null);
      await fetchBuses();
    } catch (err) {
      alert("Lỗi khi cập nhật xe bus");
    } finally {
      setEditLoading(false);
    }
  };
  const handleDelete = async (bus: Bus) => {
    if (!bus._id) return;
    try {
      await deleteBus(bus._id);
      await fetchBuses();
      setDeleteConfirmId(null);
    } catch (err) {
      alert("Lỗi khi xoá xe bus");
    }
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
                  <div className="font-bold text-red-600 text-base">xoá xe bus này?</div>
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
      {showEditModal && editBus && (
        <BasicModal
          open={showEditModal}
          onClose={handleCloseEditModal}
          title="Chỉnh sửa xe bus"
          subtitle={<span className="text-gray-500 text-xs">Cập nhật thông tin xe bus</span>}
          icon={<BusIcon size={28} />}
          readonly={false}
          onSubmit={handleUpdateBus}
          submitLabel={editLoading ? "Đang lưu..." : "Cập nhật"}
          rows={[
            [
              { label: "Biển số", value: editBus.licensePlate, type: "text", icon: <Hash size={18} />, onChange: (e: any) => setEditBus((b: any) => ({ ...b, licensePlate: e.target.value })) },
              { label: "Loại xe", value: editBus.busType, type: "select", options: [
                { label: "Thường", value: "standard" },
                { label: "Giường nằm", value: "sleeper" },
                { label: "Limousine", value: "limousine" },
                { label: "VIP", value: "vip" },
              ], icon: <Settings size={18} />, onChange: (e: any) => setEditBus((b: any) => ({ ...b, busType: e.target.value })) },
            ],
            [
              { label: "Số ghế", value: editBus.seatCount, type: "number", icon: <Users size={18} />, onChange: (e: any) => setEditBus((b: any) => ({ ...b, seatCount: e.target.value })) },
              { label: "Trạng thái", value: editBus.status, type: "select", options: [
                { label: "Hoạt động", value: "active" },
                { label: "Bảo trì", value: "maintenance" },
                { label: "Ngừng hoạt động", value: "inactive" },
              ], onChange: (e: any) => setEditBus((b: any) => ({ ...b, status: e.target.value })) },
            ],
          ]}
        />
      )}
    </div>
  );
};

export default ManagerBus;
