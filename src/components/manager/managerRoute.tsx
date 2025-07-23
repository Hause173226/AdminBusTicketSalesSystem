import  { useEffect, useState } from "react";
import { getAllRoutes, createRoute, updateRoute, deleteRoute } from "../../services/routeServices";
import { getAllStations } from "../../services/stationServices";
import BasicTable from "../tables/BasicTable";
import BasicModal from "../modal/BasicModal";
import { MapPin, Hash, Clock, TrendingUp, Calendar as CalendarIcon,  Eye, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Route } from "../type";
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

const ManagerRoute = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [newRoute, setNewRoute] = useState<any>({
    code: "",
    name: "",
    originStation: "",
    destinationStation: "",
    distanceKm: "",
    estimatedDuration: "",
    status: "active",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRoute, setEditRoute] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchRoute, setSearchRoute] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const handleView = (route: Route) => {
    setSelectedRoute(route);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRoute(null);
  };

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const data = await getAllRoutes();
      const arr = Array.isArray(data) ? data : [data];
      // Sort by createdAt descending (newest first)
      arr.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRoutes(arr);
    } catch (err) {
      setError("Lỗi khi lấy dữ liệu tuyến đường");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await getAllStations();
        setStations(Array.isArray(data) ? data : [data]);
      } catch (err) {
        // ignore
      }
    };
    fetchStations();
  }, []);

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setCreateError("");
    setNewRoute({
      code: "",
      name: "",
      originStation: "",
      destinationStation: "",
      distanceKm: "",
      estimatedDuration: "",
      status: "active",
    });
  };
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateRoute = async () => {
    // Validate required fields
    if (!newRoute.code) {
      toast.error("Vui lòng nhập mã tuyến!");
      return;
    }
    if (!newRoute.originStation) {
      toast.error("Vui lòng chọn điểm đi!");
      return;
    }
    if (!newRoute.destinationStation) {
      toast.error("Vui lòng chọn điểm đến!");
      return;
    }
    if (!newRoute.distanceKm || isNaN(Number(newRoute.distanceKm)) || Number(newRoute.distanceKm) <= 0) {
      toast.error("Vui lòng nhập khoảng cách hợp lệ!");
      return;
    }
    if (!newRoute.estimatedDuration || isNaN(Number(newRoute.estimatedDuration)) || Number(newRoute.estimatedDuration) <= 0) {
      toast.error("Vui lòng nhập thời gian dự kiến hợp lệ!");
      return;
    }
    if (!newRoute.status) {
      toast.error("Vui lòng chọn trạng thái!");
      return;
    }
    setCreateLoading(true);
    setCreateError("");
    try {
      const name = updateRouteName(newRoute.originStation, newRoute.destinationStation);
      const payload = {
        ...newRoute,
        name,
        distanceKm: Number(newRoute.distanceKm),
        estimatedDuration: Number(newRoute.estimatedDuration),
        originStation: newRoute.originStation,
        destinationStation: newRoute.destinationStation,
      };
      await createRoute(payload);
      setShowCreateModal(false);
      setNewRoute({
        code: "",
        name: "",
        originStation: "",
        destinationStation: "",
        distanceKm: "",
        estimatedDuration: "",
        status: "active",
      });
      await fetchRoutes();
      toast.success("Tạo tuyến đường thành công");
    } catch (err: any) {
      setCreateError("Lỗi khi tạo tuyến đường mới");
      toast.error(err.response?.data?.error || err.response?.data?.message || "Lỗi khi tạo tuyến đường mới");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (route: any) => {
    setEditRoute({
      ...route,
      originStation: route.originStation?._id || route.originStation,
      destinationStation: route.destinationStation?._id || route.destinationStation,
    });
    setShowEditModal(true);
    setEditError("");
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditRoute(null);
  };
  const handleUpdateRoute = async () => {
    if (!editRoute || !editRoute._id) return;
    setEditLoading(true);
    setEditError("");
    try {
      const payload = {
        ...editRoute,
        distanceKm: Number(editRoute.distanceKm),
        estimatedDuration: Number(editRoute.estimatedDuration),
        originStation: editRoute.originStation,
        destinationStation: editRoute.destinationStation,
      };
      await updateRoute(editRoute._id, payload);
      setShowEditModal(false);
      setEditRoute(null);
      await fetchRoutes();
      toast.success("Cập nhật tuyến đường thành công");
    } catch (err: any) {
      setEditError("Lỗi khi cập nhật tuyến đường");
      toast.error(err.response?.data?.error || err.response?.data?.message || "Lỗi khi cập nhật tuyến đường");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (route: any) => {
    try {
      await deleteRoute(route._id);
      await fetchRoutes();
      setDeleteConfirmId(null);
      toast.success("Xoá tuyến đường thành công");
    } catch (err: any) {
      // Log ra đúng lỗi trả về từ backend
      toast.error(err.response?.data?.error || err.response?.data?.message || err.message || "Lỗi khi xoá tuyến đường");
    }
  };

  const getCityByStationId = (stationId: string) => {
    const station = stations.find((s) => s._id === stationId);
    return station?.address.city || "";
  };

  const updateRouteName = (originId: string, destinationId: string) => {
    const city1 = getCityByStationId(originId);
    const city2 = getCityByStationId(destinationId);
    return city1 && city2 ? `${city1} - ${city2}` : "";
  };

  const getCityCode = (city: string) => {
    if (!city) return "";
    return city
      .split(" ")
      .map(word => word[0]?.toUpperCase() || "")
      .join("");
  };

  const generateRouteCode = (city1: string, city2: string, existingCodes: string[]) => {
    let baseCode = `${getCityCode(city1)}-${getCityCode(city2)}`;
    let code = baseCode;
    let counter = 1;
    while (existingCodes.includes(code)) {
      code = `${baseCode}${counter.toString().padStart(2, '0')}`;
      counter++;
    }
    return code;
  };

  // Helper: lấy mã thành phố viết tắt (không dấu, in hoa, ghép lại)
  function getCityShortCode(city: string) {
    if (!city) return '';
    // Loại bỏ dấu tiếng Việt
    const from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
    const to   = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";
    let result = city.toLowerCase();
    for (let i = 0; i < from.length; ++i) {
      result = result.replace(new RegExp(from[i], "g"), to[i]);
    }
    // Lấy ký tự đầu các từ, in hoa
    return result.split(' ').map(w => w[0]?.toUpperCase() || '').join('');
  }

  // Sinh mã tuyến theo format ROU-HCMHN, nếu trùng thì thêm -01, -02...
  function generateRouteCodeV2(city1: string, city2: string, existingCodes: string[]) {
    let base = `ROU-${getCityShortCode(city1)}${getCityShortCode(city2)}`;
    let code = base;
    let counter = 1;
    while (existingCodes.includes(code)) {
      code = `${base}-${counter.toString().padStart(2, '2')}`;
      counter++;
    }
    return code;
  }

  // Khi chọn điểm đi/điểm đến, tự động sinh mã tuyến
  function handleOriginChange(e: any) {
    const originId = e.target.value;
    const city1 = getCityByStationId(originId);
    const city2 = getCityByStationId(newRoute.destinationStation);
    const name = updateRouteName(originId, newRoute.destinationStation);
    const code = (city1 && city2)
      ? generateRouteCodeV2(city1, city2, routes.map(r => r.code))
      : '';
    setNewRoute((r: any) => ({ ...r, originStation: originId, name, code }));
  }
  function handleDestinationChange(e: any) {
    const destId = e.target.value;
    const city1 = getCityByStationId(newRoute.originStation);
    const city2 = getCityByStationId(destId);
    const name = updateRouteName(newRoute.originStation, destId);
    const code = (city1 && city2)
      ? generateRouteCodeV2(city1, city2, routes.map(r => r.code))
      : '';
    setNewRoute((r: any) => ({ ...r, destinationStation: destId, name, code }));
  }

  const columns = [
    { key: "code", label: "Mã tuyến" },
    { key: "name", label: "Tên tuyến" },
    {
      key: "originStation",
      label: "Điểm đi",
      render: (value: any) => value && value.name ? value.name : "",
    },
    {
      key: "destinationStation",
      label: "Điểm đến",
      render: (value: any) => value && value.name ? value.name : "",
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (value: string) => (
        <span className={`px-1 py-0.5 text-xs rounded flex items-center gap-0.5 ${statusColor[value] || "bg-gray-100 text-gray-800"}`}>
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
                  <div className="font-bold text-red-600 text-base">xoá tuyến đường này?</div>
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

  const filteredRoutes = routes.filter(r => r.name?.toLowerCase().includes(searchRoute.toLowerCase()));
  const totalPages = Math.ceil(filteredRoutes.length / pageSize);
  const paginatedRoutes = filteredRoutes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Danh sách tuyến đường</h3>
        <div className="flex items-center gap-2 ml-auto">
          <SearchInput
            value={searchRoute}
            onChange={e => setSearchRoute(e.target.value)}
            placeholder="Tìm kiếm tuyến..."
            debounceMs={1000}
          />
          <button
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            onClick={handleOpenCreateModal}
          >
            Thêm tuyến mới
          </button>
        </div>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <BasicTable columns={columns} data={paginatedRoutes} rowKey="_id" />
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
      {/* Modal xem chi tiết tuyến đường */}
      {showModal && selectedRoute && (
        <BasicModal
          open={showModal}
          onClose={handleCloseModal}
          title="Chi tiết tuyến đường"
          subtitle={<span className="text-gray-500 text-xs">Thông tin chi tiết tuyến đường</span>}
          icon={<MapPin size={28} />}
          readonly
          rows={[
            [
              { label: "Mã tuyến", value: selectedRoute.code || "", type: "text", icon: <Hash size={18} /> },
              { label: "Tên tuyến", value: selectedRoute.name || "", type: "text", icon: <TrendingUp size={18} /> },
            ],
            [
              { label: "Điểm đi", value: Array.isArray(selectedRoute.originStation) ? ((selectedRoute.originStation[0] as any)?.name || "") : (selectedRoute.originStation && (selectedRoute.originStation as any).name ? (selectedRoute.originStation as any).name : ""), type: "text", icon: <MapPin size={18} /> },
              { label: "Điểm đến", value: Array.isArray(selectedRoute.destinationStation) ? ((selectedRoute.destinationStation[0] as any)?.name || "") : (selectedRoute.destinationStation && (selectedRoute.destinationStation as any).name ? (selectedRoute.destinationStation as any).name : ""), type: "text", icon: <MapPin size={18} /> },
           ],
            [
              { label: "Khoảng cách (km)", value: selectedRoute.distanceKm || "", type: "text", icon: <Clock size={18} /> },
              { label: "Thời gian dự kiến (phút)", value: selectedRoute.estimatedDuration || "", type: "text", icon: <CalendarIcon size={18} /> },
            ],
            [
              { label: "Trạng thái", value: statusLabel[selectedRoute.status] || selectedRoute.status, type: "text" },
              { label: "Ngày tạo", value: selectedRoute.createdAt ? new Date(selectedRoute.createdAt).toLocaleString('vi-VN') : "", type: "text" },
            ],
          ]}
          updatedAt={selectedRoute.updatedAt}
        />
      )}
      {/* Modal tạo mới tuyến đường */}
      {showCreateModal && (
        <BasicModal
          open={showCreateModal}
          onClose={handleCloseCreateModal}
          title="Tạo tuyến đường mới"
          subtitle={<span className="text-gray-500 text-xs">Nhập thông tin tuyến đường</span>}
          icon={<MapPin size={28} />}
          readonly={false}
          onSubmit={handleCreateRoute}
          submitLabel={createLoading ? "Đang lưu..." : "Tạo mới"}
          rows={[
           
            [
              { label: "Điểm đi", value: newRoute.originStation, type: "searchable-select", options: stations.map((s) => ({ label: `${s.name} (${s.address.city})`, value: s._id })), icon: <MapPin size={18} />, onChange: handleOriginChange },
              { label: "Điểm đến", value: newRoute.destinationStation, type: "searchable-select", options: stations.map((s) => ({ label: `${s.name} (${s.address.city})`, value: s._id })), icon: <MapPin size={18} />, onChange: handleDestinationChange },
            ],
            [
              { label: "Khoảng cách (km)", value: newRoute.distanceKm, type: "number", icon: <Clock size={18} />, onChange: (e: any) => setNewRoute((r: any) => ({ ...r, distanceKm: e.target.value })) },
              { label: "Thời gian dự kiến (phút)", value: newRoute.estimatedDuration, type: "number", icon: <CalendarIcon size={18} />, onChange: (e: any) => setNewRoute((r: any) => ({ ...r, estimatedDuration: e.target.value })) },
            ],
          ].map(row => row.map(field => ({ ...field, onChange: field.onChange, value: field.value })))}
        />
      )}
      {/* Modal chỉnh sửa tuyến đường */}
      {showEditModal && editRoute && (
        <BasicModal
          open={showEditModal}
          onClose={handleCloseEditModal}
          title="Chỉnh sửa tuyến đường"
          subtitle={<span className="text-gray-500 text-xs">Cập nhật thông tin tuyến đường</span>}
          icon={<MapPin size={28} />}
          readonly={false}
          onSubmit={handleUpdateRoute}
          submitLabel={editLoading ? "Đang lưu..." : "Lưu thay đổi"}
          rows={[
            [
              { label: "Mã tuyến", value: editRoute.code, type: "text", icon: <Hash size={18} />, onChange: (e: any) => setEditRoute((r: any) => ({ ...r, code: e.target.value })) },
              { label: "Tên tuyến", value: editRoute.name, type: "text", icon: <TrendingUp size={18} />, onChange: (e: any) => setEditRoute((r: any) => ({ ...r, name: e.target.value })) },
            ],
            [
              { label: "Điểm đi", value: editRoute.originStation, type: "searchable-select", options: stations.map((s) => ({ label: `${s.name} (${s.address.city})`, value: s._id })), icon: <MapPin size={18} />, onChange: (e: any) => {
                const originId = e.target.value;
                const city1 = getCityByStationId(originId);
                const city2 = getCityByStationId(editRoute.destinationStation);
                const name = updateRouteName(originId, editRoute.destinationStation);
                const code = city1 && city2 ? generateRouteCode(city1, city2, routes.map(r => r.code)) : editRoute.code;
                setEditRoute((r: any) => ({ ...r, originStation: originId, name, code }));
              }},
              { label: "Điểm đến", value: editRoute.destinationStation, type: "searchable-select", options: stations.map((s) => ({ label: `${s.name} (${s.address.city})`, value: s._id })), icon: <MapPin size={18} />, onChange: (e: any) => {
                const destId = e.target.value;
                const city1 = getCityByStationId(editRoute.originStation);
                const city2 = getCityByStationId(destId);
                const name = updateRouteName(editRoute.originStation, destId);
                const code = city1 && city2 ? generateRouteCode(city1, city2, routes.map(r => r.code)) : editRoute.code;
                setEditRoute((r: any) => ({ ...r, destinationStation: destId, name, code }));
              }},
            ],
            [
              { label: "Khoảng cách (km)", value: editRoute.distanceKm, type: "number", icon: <Clock size={18} />, onChange: (e: any) => setEditRoute((r: any) => ({ ...r, distanceKm: e.target.value })) },
              { label: "Thời gian dự kiến (phút)", value: editRoute.estimatedDuration, type: "number", icon: <CalendarIcon size={18} />, onChange: (e: any) => setEditRoute((r: any) => ({ ...r, estimatedDuration: e.target.value })) },
            ],
            [
              { label: "Trạng thái", value: editRoute.status, type: "select", options: [ { label: "Hoạt động", value: "active" }, { label: "Ngừng hoạt động", value: "inactive" } ], onChange: (e: any) => setEditRoute((r: any) => ({ ...r, status: e.target.value })) },
              { label: "Ngày tạo", value: editRoute.createdAt ? new Date(editRoute.createdAt).toLocaleString('vi-VN') : "", type: "text" },
            ],
          ].map(row => row.map(field => ({ ...field, onChange: field.onChange, value: field.value })))}
          updatedAt={editRoute.updatedAt}
        />
      )}
    </div>
  );
};

export default ManagerRoute;
