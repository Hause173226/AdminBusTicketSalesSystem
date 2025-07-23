import { useEffect, useState } from "react";
import { getAllStations, createStation, updateStation, deleteStation } from "../../services/stationServices";
import BasicTable from "../tables/BasicTable";
import BasicModal from "../modal/BasicModal";
import { MapPin, Hash, Eye, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Station } from "../type";
import ConfirmPopover from "../common/ConfirmPopover";
import { toast } from "react-toastify";
import SearchInput from "./SearchInput";
import Pagination from "../common/Pagination";

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700 border border-green-300 font-bold",
  inactive: "bg-gray-100 text-gray-800 border border-gray-300 font-bold",
};

const statusLabel: Record<string, string> = {
  active: "Hoạt động",
  inactive: "Ngừng hoạt động",
};

const statusIcon: Record<string, JSX.Element> = {
  active: <CheckCircle size={16} className="inline mr-1" />,
  inactive: <XCircle size={16} className="inline mr-1" />,
};

const ManagerStation = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStation, setNewStation] = useState<any>({
    name: "",
    code: "",
    address: { street: "", ward: "", district: "", city: "" },
    status: "active",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStation, setEditStation] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchStation, setSearchStation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const handleView = (station: Station) => {
    setSelectedStation(station);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStation(null);
  };

  const fetchStations = async () => {
    setLoading(true);
    try {
      const data = await getAllStations();
      const arr = Array.isArray(data) ? data : [data];
      arr.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setStations(arr);
    } catch (err) {
      setError("Lỗi khi lấy dữ liệu trạm xe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setCreateError("");
    setNewStation({
      name: "",
      code: "",
      address: { street: "", ward: "", district: "", city: "" },
      status: "active",
    });
  };
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateStation = async () => {
    if (!newStation.name) {
      toast.error("Vui lòng nhập tên trạm!");
      return;
    }
    if (!newStation.code) {
      toast.error("Vui lòng nhập mã trạm!");
      return;
    }
    if (!newStation.address.city) {
      toast.error("Vui lòng nhập thành phố!");
      return;
    }
    setCreateLoading(true);
    setCreateError("");
    try {
      await createStation(newStation);
      setShowCreateModal(false);
      setNewStation({
        name: "",
        code: "",
        address: { street: "", ward: "", district: "", city: "" },
        status: "active",
      });
      await fetchStations();
      toast.success("Tạo trạm xe thành công");
    } catch (err: any) {
      setCreateError("Lỗi khi tạo trạm xe mới");
      toast.error(err.response?.data?.error || err.response?.data?.message || "Lỗi khi tạo trạm xe mới");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (station: any) => {
    setEditStation({ ...station });
    setShowEditModal(true);
    setEditError("");
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditStation(null);
  };
  const handleUpdateStation = async () => {
    if (!editStation || !editStation._id) return;
    setEditLoading(true);
    setEditError("");
    try {
      await updateStation(editStation._id, editStation);
      setShowEditModal(false);
      setEditStation(null);
      await fetchStations();
      toast.success("Cập nhật trạm xe thành công");
    } catch (err: any) {
      setEditError("Lỗi khi cập nhật trạm xe");
      toast.error(err.response?.data?.error || err.response?.data?.message || "Lỗi khi cập nhật trạm xe");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (station: any) => {
    try {
      await deleteStation(station._id);
      await fetchStations();
      setDeleteConfirmId(null);
      toast.success("Xoá trạm xe thành công");
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Lỗi khi xoá trạm xe");
    }
  };

  const columns = [
    { key: "code", label: "Mã trạm" },
    { key: "name", label: "Tên trạm" },
    {
      key: "address.city",
      label: "Thành phố",
      render: (_: any, row: any) => row.address?.city || "",
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (value: string) => (
        <span className={`px-1 py-0.5 text-xs rounded min-w-[140px] flex items-center justify-center gap-0.5 ${statusColor[value] || "bg-gray-100 text-gray-800"}`}>
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
              onClick={() => setDeleteConfirmId(row._id)}
            >
              <Trash2 size={18} />
            </button>
            <ConfirmPopover
              open={deleteConfirmId === row._id}
              message={
                <>
                  <div>Bạn có chắc chắn muốn</div>
                  <div className="font-bold text-red-600 text-base">xoá trạm xe này?</div>
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

  const filteredStations = stations.filter(r => r.name?.toLowerCase().includes(searchStation.toLowerCase()) || r.code?.toLowerCase().includes(searchStation.toLowerCase()) || r.address?.city?.toLowerCase().includes(searchStation.toLowerCase()));
  const totalPages = Math.ceil(filteredStations.length / pageSize);
  const paginatedStations = filteredStations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Hàm loại bỏ dấu tiếng Việt và lấy ký tự đầu các từ (bỏ 'bến', 'xe' ở đầu)
  function toCode(str: string) {
    if (!str) return "";
    // Loại bỏ dấu
    const from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
    const to   = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";
    let result = str.toLowerCase();
    for (let i = 0; i < from.length; ++i) {
      result = result.replace(new RegExp(from[i], "g"), to[i]);
    }
    // Loại bỏ các từ 'bến', 'xe' ở đầu
    let words = result.split(" ").filter(Boolean);
    if (words[0] === "bến") words.shift();
    if (words[0] === "xe") words.shift();
    // Lấy ký tự đầu các từ còn lại, viết hoa
    return words.map(w => w[0]?.toUpperCase() || "").join("");
  }

  // Sinh mã trạm tự động
  function generateStationCode(name: string, existingCodes: string[]) {
    if (!name) return "";
    let code = toCode(name);
    if (!code.startsWith("BX")) {
      code = "BX" + code;
    }
    let finalCode = code;
    let counter = 1;
    while (existingCodes.includes(finalCode)) {
      finalCode = code + counter.toString().padStart(2, '0');
      counter++;
    }
    return finalCode;
  }

  // Khi nhập tên trạm, tự động sinh mã trạm
  const handleStationNameChange = (e: any) => {
    const name = e.target.value;
    const existingCodes = stations.map(s => s.code);
    const code = generateStationCode(name, existingCodes);
    setNewStation((r: any) => ({ ...r, name, code }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Danh sách trạm xe</h3>
        <div className="flex items-center gap-2 ml-auto">
          <SearchInput
            value={searchStation}
            onChange={e => setSearchStation(e.target.value)}
            placeholder="Tìm kiếm trạm..."
            debounceMs={1000}
          />
          <button
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            onClick={handleOpenCreateModal}
          >
            Thêm trạm mới
          </button>
        </div>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <BasicTable columns={columns} data={paginatedStations} rowKey="_id" />
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
      {/* Modal xem chi tiết trạm xe */}
      {showModal && selectedStation && (
        <BasicModal
          open={showModal}
          onClose={handleCloseModal}
          title="Chi tiết trạm xe"
          subtitle={<span className="text-gray-500 text-xs">Thông tin chi tiết trạm xe</span>}
          icon={<MapPin size={28} />}
          readonly
          rows={[
            [
              { label: "Mã trạm", value: selectedStation.code || "", type: "text", icon: <Hash size={18} /> },
              { label: "Tên trạm", value: selectedStation.name || "", type: "text", icon: <MapPin size={18} /> },
            ],
            [
              { label: "Thành phố", value: selectedStation.address?.city || "", type: "text", icon: <MapPin size={18} /> },
              { label: "Trạng thái", value: statusLabel[selectedStation.status] || selectedStation.status, type: "text" },
            ],
            [
              { label: "Ngày tạo", value: selectedStation.createdAt ? new Date(selectedStation.createdAt).toLocaleString('vi-VN') : "", type: "text" },
              { label: "Ngày cập nhật", value: selectedStation.updatedAt ? new Date(selectedStation.updatedAt).toLocaleString('vi-VN') : "", type: "text" },
            ],
          ]}
          updatedAt={selectedStation.updatedAt}
        />
      )}
      {/* Modal tạo mới trạm xe */}
      {showCreateModal && (
        <BasicModal
          open={showCreateModal}
          onClose={handleCloseCreateModal}
          title="Tạo trạm xe mới"
          subtitle={<span className="text-gray-500 text-xs">Nhập thông tin trạm xe</span>}
          icon={<MapPin size={28} />}
          readonly={false}
          onSubmit={handleCreateStation}
          submitLabel={createLoading ? "Đang lưu..." : "Tạo mới"}
          rows={[
            [
              { label: "Tên trạm", value: newStation.name, type: "text", icon: <MapPin size={18} />, onChange: handleStationNameChange },
              { label: "Thành phố", value: newStation.address.city, type: "text", icon: <MapPin size={18} />, onChange: (e: any) => setNewStation((r: any) => ({ ...r, address: { ...r.address, city: e.target.value } })) },
            ],
            [
                { label: "Địa chỉ (đường)", value: newStation.address.street, type: "text", onChange: (e: any) => setNewStation((r: any) => ({ ...r, address: { ...r.address, street: e.target.value } })) },
                { label: "Phường/Xã", value: newStation.address.ward, type: "text", onChange: (e: any) => setNewStation((r: any) => ({ ...r, address: { ...r.address, ward: e.target.value } })) },
              ],
            [
                { label: "Quận/Huyện", value: newStation.address.district, type: "text", onChange: (e: any) => setNewStation((r: any) => ({ ...r, address: { ...r.address, district: e.target.value } })) },
            ],
          ]}
        />
      )}
      {/* Modal chỉnh sửa trạm xe */}
      {showEditModal && editStation && (
        <BasicModal
          open={showEditModal}
          onClose={handleCloseEditModal}
          title="Chỉnh sửa trạm xe"
          subtitle={<span className="text-gray-500 text-xs">Cập nhật thông tin trạm xe</span>}
          icon={<MapPin size={28} />}
          readonly={false}
          onSubmit={handleUpdateStation}
          submitLabel={editLoading ? "Đang lưu..." : "Lưu thay đổi"}
          rows={[
            [
              { label: "Mã trạm", value: editStation.code, type: "text", icon: <Hash size={18} />, onChange: (e: any) => setEditStation((r: any) => ({ ...r, code: e.target.value })) },
              { label: "Tên trạm", value: editStation.name, type: "text", icon: <MapPin size={18} />, onChange: (e: any) => setEditStation((r: any) => ({ ...r, name: e.target.value })) },
            ],
            [
              { label: "Thành phố", value: editStation.address?.city, type: "text", icon: <MapPin size={18} />, onChange: (e: any) => setEditStation((r: any) => ({ ...r, address: { ...r.address, city: e.target.value } })) },
              { label: "Trạng thái", value: editStation.status, type: "select", options: [ { label: "Hoạt động", value: "active" }, { label: "Ngừng hoạt động", value: "inactive" } ], onChange: (e: any) => setEditStation((r: any) => ({ ...r, status: e.target.value })) },
            ],
            [
              { label: "Địa chỉ (đường)", value: editStation.address?.street, type: "text", onChange: (e: any) => setEditStation((r: any) => ({ ...r, address: { ...r.address, street: e.target.value } })) },
              { label: "Phường/Xã", value: editStation.address?.ward, type: "text", onChange: (e: any) => setEditStation((r: any) => ({ ...r, address: { ...r.address, ward: e.target.value } })) },
            ],
            [
              { label: "Quận/Huyện", value: editStation.address?.district, type: "text", onChange: (e: any) => setEditStation((r: any) => ({ ...r, address: { ...r.address, district: e.target.value } })) },
            ],
            [
              { label: "Ngày tạo", value: editStation.createdAt ? new Date(editStation.createdAt).toLocaleString('vi-VN') : "", type: "text" },
              { label: "Ngày cập nhật", value: editStation.updatedAt ? new Date(editStation.updatedAt).toLocaleString('vi-VN') : "", type: "text" },
            ],
          ]}
          updatedAt={editStation.updatedAt}
        />
      )}
    </div>
  );
};

export default ManagerStation;
