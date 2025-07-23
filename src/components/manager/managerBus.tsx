import  { useEffect, useState } from "react";
import BasicTable from "../tables/BasicTable";
import { getAllBuses, deleteBus, updateBus, createBus } from "../../services/busServices";
import { Bus } from "../type";
import BasicModal from "../modal/BasicModal";
import { Bus as BusIcon, Hash, Settings, CheckCircle, XCircle, Wrench, Eye, Pencil, Trash2 } from "lucide-react";
import ConfirmPopover from "../common/ConfirmPopover";
import { toast } from "react-toastify";
import SearchInput from "./SearchInput";
import Pagination from "../common/Pagination";

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700 border border-green-300 font-bold",
  maintenance: "bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold",
  inactive: "bg-gray-100 text-gray-800 border border-gray-300 font-bold",
};

const statusIcon: Record<string, JSX.Element> = {
  active: <CheckCircle size={16} className="inline mr-1" />,
  maintenance: <Wrench size={16} className="inline mr-1" />,
  inactive: <XCircle size={16} className="inline mr-1" />,
};

const statusLabel: Record<string, string> = {
  active: "Hoạt động",
  maintenance: "Bảo trì",
  inactive: "Ngừng hoạt động",
};

// Thêm hàm ánh xạ loại xe sang tiếng Việt
const busTypeLabel: Record<string, string> = {
  standard: "Thường",
  sleeper: "Giường nằm",
  limousine: "Limousine",
  vip: "VIP",
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newBus, setNewBus] = useState<any>({
    licensePlate: "",
    busType: "standard",
    seatCount: "",
    status: "active"
  });
  const [searchBusType, setSearchBusType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const data = await getAllBuses();
      // Sort by createdAt descending (newest first)
      data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
      toast.success("Cập nhật xe bus thành công");
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Lỗi khi cập nhật xe bus");
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
      toast.success("Xoá xe bus thành công");
    } catch (err: any) {
      // Log ra đúng lỗi trả về từ backend
      toast.error(err.response?.data?.error || err.response?.data?.message || err.message || "Lỗi khi xoá xe bus");
    }
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setCreateError("");
    setNewBus({ licensePlate: "", busType: "standard", seatCount: "", status: "active" });
  };
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };
  const handleCreateBus = async () => {
    // Validate required fields
    if (!newBus.licensePlate) {
      toast.error("Vui lòng nhập biển số xe!");
      return;
    }
    if (!newBus.busType) {
      toast.error("Vui lòng chọn loại xe!");
      return;
    }
    if (!newBus.seatCount || isNaN(Number(newBus.seatCount)) || Number(newBus.seatCount) <= 0) {
      toast.error("Vui lòng nhập số ghế hợp lệ!");
      return;
    }
    if (!newBus.status) {
      toast.error("Vui lòng chọn trạng thái!");
      return;
    }
    setCreateLoading(true);
    setCreateError("");
    try {
      const payload = {
        licensePlate: newBus.licensePlate,
        busType: newBus.busType,
        seatCount: Number(newBus.seatCount),
        status: newBus.status
      };
      await createBus(payload);
      setShowCreateModal(false);
      setNewBus({ licensePlate: "", busType: "standard", seatCount: "", status: "active" });
      await fetchBuses();
      toast.success("Tạo xe bus thành công");
    } catch (err: any) {
      setCreateError("Lỗi khi tạo xe bus mới");
      toast.error(err.response?.data?.error || err.response?.data?.message || "Lỗi khi tạo xe bus mới");
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredBuses = buses.filter(bus =>
    bus.busType?.toLowerCase().includes(searchBusType.toLowerCase())
  );
  const totalPages = Math.ceil(filteredBuses.length / pageSize);
  const paginatedBuses = filteredBuses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    { key: "licensePlate", label: "Biển số" },
    { key: "busType", label: "Loại xe", render: (value: string) => busTypeLabel[value] || value },
    { key: "seatCount", label: "Số ghế" },
    {
      key: "status",
      label: "Trạng thái",
      render: (value: string) => (
        <span className={`px-1 py-0.5 text-xs rounded inline-flex items-center justify-center min-w-[140px] ${statusColor[value] || "bg-gray-100 text-gray-800"}`}>
          {statusIcon[value]} {statusLabel[value] || value}
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
        <div className="flex items-center gap-2 ml-auto">
          <SearchInput
            value={searchBusType}
            onChange={e => setSearchBusType(e.target.value)}
            placeholder="Tìm kiếm loại xe... (VD: standard, sleeper, limousine, vip)"
            debounceMs={800}
          />
          <button className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium" onClick={handleOpenCreateModal}>
            Thêm xe mới
          </button>
        </div>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <BasicTable columns={columns} data={paginatedBuses} rowKey="_id" />
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
              { label: "Loại xe", value: busTypeLabel[selectedBus.busType] || selectedBus.busType || "", type: "text", icon: <Settings size={18} /> },
            ],
            [
              { label: "Số ghế", value: selectedBus.seatCount || "", type: "text", icon: <Hash size={18} /> },
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
              { label: "Số ghế", value: editBus.seatCount, type: "number", icon: <Hash size={18} />, onChange: (e: any) => setEditBus((b: any) => ({ ...b, seatCount: e.target.value })) },
              { label: "Trạng thái", value: editBus.status, type: "select", options: [
                { label: "Hoạt động", value: "active" },
                { label: "Bảo trì", value: "maintenance" },
                { label: "Ngừng hoạt động", value: "inactive" },
              ], onChange: (e: any) => setEditBus((b: any) => ({ ...b, status: e.target.value })) },
            ],
          ]}
        />
      )}
      {showCreateModal && (
        <BasicModal
          open={showCreateModal}
          onClose={handleCloseCreateModal}
          title="Tạo xe bus mới"
          subtitle={<span className="text-gray-500 text-xs">Nhập thông tin xe bus</span>}
          icon={<BusIcon size={28} />}
          readonly={false}
          onSubmit={handleCreateBus}
          submitLabel={createLoading ? "Đang lưu..." : "Tạo mới"}
          rows={[
            [
              { label: "Biển số", value: newBus.licensePlate, type: "text", icon: <Hash size={18} />, onChange: (e: any) => setNewBus((b: any) => ({ ...b, licensePlate: e.target.value })) },
              { label: "Loại xe", value: newBus.busType, type: "select", options: [
                { label: "Thường", value: "standard" },
                { label: "Giường nằm", value: "sleeper" },
                { label: "Limousine", value: "limousine" },
                { label: "VIP", value: "vip" },
              ], icon: <Settings size={18} />, onChange: (e: any) => setNewBus((b: any) => ({ ...b, busType: e.target.value })) },
            ],
            [
              { label: "Số ghế", value: newBus.seatCount, type: "number", icon: <Hash size={18} />, onChange: (e: any) => setNewBus((b: any) => ({ ...b, seatCount: e.target.value })) },
            ],
          ]}
        />
      )}
    </div>
  );
};

export default ManagerBus;
