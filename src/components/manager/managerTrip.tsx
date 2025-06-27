import React, { useEffect, useState } from "react";
import { Bus, BarChart3, Calendar, MapPin, Eye, Pencil, Trash2, CheckCircle, Clock, XCircle, Loader, DollarSign, Users, Info } from "lucide-react";
import BasicTable from "../tables/BasicTable";
import { getAllTrips, createTrip, updateTrip, deleteTrip } from "../../services/tripServices";
import { getAllRoutes } from "../../services/routeServices";
import { getAllBuses } from "../../services/busServices";
import BasicModal from "../modal/BasicModal";
import { Calendar as CalendarIcon } from "lucide-react";
import ConfirmPopover from "../common/ConfirmPopover";
import { toast } from "react-toastify";
import SearchInput from ".//SearchInput";

const statusColor: Record<string, string> = {
  "scheduled": "bg-blue-100 text-blue-700 border border-blue-300 font-bold",
  "in_progress": "bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold",
  "completed": "bg-green-100 text-green-700 border border-green-300 font-bold",
  "cancelled": "bg-red-100 text-red-700 border border-red-300 font-bold",
};

const statusIcon: Record<string, JSX.Element> = {
  "scheduled": <Clock size={16} className="inline mr-1" />,
  "in_progress": <Loader size={16} className="inline mr-1 animate-spin" />,
  "completed": <CheckCircle size={16} className="inline mr-1" />,
  "cancelled": <XCircle size={16} className="inline mr-1" />,
};

const statusLabel: Record<string, string> = {
  "scheduled": "Đã lên lịch",
  "in_progress": "Đang chạy",
  "completed": "Hoàn thành",
  "cancelled": "Đã huỷ",
};

const ManagerTrip = () => {
  const [routeData, setRouteData] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTrip, setNewTrip] = useState<any>({
    tripCode: "",
    route: "",
    bus: "",
    departureDate: "",
    departureTime: "",
    arrivalTime: "",
    basePrice: "",
    availableSeats: "",
    status: "scheduled",
    notes: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [editTrip, setEditTrip] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchRoute, setSearchRoute] = useState("");

  const handleView = (trip: any) => {
    setSelectedTrip(trip);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTrip(null);
  };

  const handleEdit = (trip: any) => {
    setEditTrip({ ...trip });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditTrip(null);
    setEditError("");
  };

  const columns = [
    { key: "tripCode", label: "Mã chuyến" },
    { 
      key: "routeName", 
      label: "Tuyến",
      render: (_: any, row: any) => row.route?.name || row.route?.code || ""
    },
    { key: "departureDateDisplay", label: "Ngày xuất phát" },
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
      key: "basePriceDisplay", label: "Giá vé"
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
                  <div className="font-bold text-red-600 text-base">xoá chuyến xe này?</div>
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

  // Định nghĩa fetchTrips ở đây để các hàm khác gọi lại được
  const fetchTrips = async () => {
    try {
      const trips = await getAllTrips();
      // Chuyển đổi dữ liệu từ trip sang format cho bảng, giữ nguyên các trường gốc
      const mapped = trips.map((trip: any) => ({
        ...trip, // giữ nguyên tất cả trường gốc, đặc biệt là _id
        tripCode: trip.tripCode || trip._id,
        routeId: trip.route?.code || trip.route?._id || "",
        departureDateDisplay: trip.departureDate ? new Date(trip.departureDate).toLocaleDateString() : "",
        basePriceDisplay: trip.basePrice ? `${trip.basePrice.toLocaleString()} VND` : "",
      }));
      setRouteData(mapped);
    } catch (error) {
      setRouteData([]);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    const fetchRoutesAndBuses = async () => {
      try {
        const [routesData, busesData] = await Promise.all([
          getAllRoutes(),
          getAllBuses(),
        ]);
        setRoutes(Array.isArray(routesData) ? routesData : [routesData]);
        setBuses(Array.isArray(busesData) ? busesData : [busesData]);
      } catch (err) {
        setRoutes([]);
        setBuses([]);
      }
    };
    fetchRoutesAndBuses();
  }, []);

  // Thêm hàm formatTime để chuẩn hóa giờ sang HH:mm
  const formatTime = (time: string) => {
    if (!time) return "";
    if (/^\d{2}:\d{2}$/.test(time)) return time;
    if (/^\d{1,2}$/.test(time)) return `${time.padStart(2, '0')}:00`;
    return time;
  };

  const handleCreateTrip = async () => {
    setCreateLoading(true);
    setCreateError("");
    try {
      const payload = {
        ...newTrip,
        route: typeof newTrip.route === 'object' ? newTrip.route._id : newTrip.route,
        bus: typeof newTrip.bus === 'object' ? newTrip.bus._id : newTrip.bus,
        basePrice: Number(newTrip.basePrice),
        availableSeats: Number(newTrip.availableSeats),
        departureTime: formatTime(newTrip.departureTime),
        arrivalTime: formatTime(newTrip.arrivalTime),
        status: newTrip.status || 'scheduled',
      };
      console.log("Payload gửi lên:", payload);
      await createTrip(payload);
      setShowCreateModal(false);
      setNewTrip({
        tripCode: "",
        route: "",
        bus: "",
        departureDate: "",
        departureTime: "",
        arrivalTime: "",
        basePrice: "",
        availableSeats: "",
        status: "scheduled",
        notes: "",
      });
      await fetchTrips();
      toast.success("Tạo chuyến xe thành công");
    } catch (err: any) {
      setCreateError("Lỗi khi tạo chuyến xe mới");
      toast.error(err.response?.data?.error || err.response?.data?.message || "Lỗi khi tạo chuyến xe mới");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateTrip = async () => {
    if (!editTrip || !editTrip._id) return;
    setEditLoading(true);
    setEditError("");
    try {
      const payload = {
        ...editTrip,
        route: typeof editTrip.route === 'object' ? editTrip.route._id : editTrip.route,
        bus: typeof editTrip.bus === 'object' ? editTrip.bus._id : editTrip.bus,
        basePrice: Number(editTrip.basePrice),
        availableSeats: Number(editTrip.availableSeats),
        departureTime: formatTime(editTrip.departureTime),
        arrivalTime: formatTime(editTrip.arrivalTime),
        status: editTrip.status || 'scheduled',
      };
      await updateTrip(editTrip._id, payload);
      setShowEditModal(false);
      setEditTrip(null);
      await fetchTrips();
      toast.success("Cập nhật chuyến xe thành công");
    } catch (err: any) {
      setEditError("Lỗi khi cập nhật chuyến xe");
      toast.error(err.response?.data?.error || err.response?.data?.message || "Lỗi khi cập nhật chuyến xe");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (trip: any) => {
    try {
      await deleteTrip(trip._id);
      await fetchTrips();
      setDeleteConfirmId(null);
      toast.success("Xoá chuyến xe thành công");
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Lỗi khi xoá chuyến xe");
    }
  };

  const filteredRouteData = routeData.filter(trip =>
    trip.route?.name?.toLowerCase().includes(searchRoute.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bus className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng chuyến xe</p>
              <p className="text-2xl font-bold text-gray-900">{routeData.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">{routeData.filter(r => r.status === "active").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chuyến hôm nay</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Điểm đến</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>
      {/* Trips Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách chuyến xe</h3>
            <div className="flex items-center gap-2 ml-auto">
              <SearchInput
                value={searchRoute}
                onChange={e => setSearchRoute(e.target.value)}
                placeholder="Tìm kiếm tuyến..."
                debounceMs={1000}
              />
              <button className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium" onClick={() => setShowCreateModal(true)}>
                Thêm chuyến mới
              </button>
            </div>
          </div>
        </div>
        <BasicTable columns={columns} data={filteredRouteData} rowKey="tripCode" />
      </div>
      {/* Modal xem chi tiết chuyến xe */}
      {showModal && selectedTrip && (
        <BasicModal
          open={showModal}
          onClose={handleCloseModal}
          title="Chi tiết chuyến xe"
          subtitle="Thông tin chi tiết chuyến xe"
          icon={<Bus size={28} />}
          readonly
          rows={[
            [
              { label: "Mã chuyến", value: selectedTrip.tripCode || "", type: "text", icon: <Info size={16} /> },
              { label: "Tuyến", value: selectedTrip.route.name || "", type: "text", icon: <Bus size={16} /> },
            ],
            [
              { label: "Điểm đi", value: selectedTrip.route?.originStation?.name || "", type: "text", icon: <MapPin size={16} /> },
              { label: "Điểm đến", value: selectedTrip.route?.destinationStation?.name || "", type: "text", icon: <MapPin size={16} /> },
            ],
            [
              { label: "Ngày xuất phát", value: selectedTrip.departureDateDisplay || "", type: "text", icon: <CalendarIcon size={16} /> },
              { label: "Giá vé", value: selectedTrip.basePriceDisplay || "", type: "text", icon: <DollarSign size={16} /> },
            ],
            [
              { label: "Giờ đi", value: selectedTrip.departureTime || "", type: "text", icon: <Clock size={16} /> },
              { label: "Giờ đến", value: selectedTrip.arrivalTime || "", type: "text", icon: <Clock size={16} /> },
            ],
            [
              { label: "Ghế còn", value: selectedTrip.availableSeats ?? "", type: "text", icon: <Users size={16} /> },
              { label: "Trạng thái", value: statusLabel[selectedTrip.status] || selectedTrip.status, type: "text" },
            ],
            [
              { label: "Ghi chú", value: selectedTrip.notes || "", type: "text", icon: <Info size={16} />, colSpan: 2 },
            ],
          ]}
          updatedAt={selectedTrip.updatedAt}
        />
      )}
      {/* Modal tạo mới chuyến xe */}
      {showCreateModal && (
        <BasicModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Tạo chuyến xe mới"
          subtitle="Nhập thông tin chuyến xe"
          icon={<Bus size={28} />}
          readonly={false}
          onSubmit={handleCreateTrip}
          submitLabel={createLoading ? "Đang lưu..." : "Tạo mới"}
          rows={[
            [
              { label: "Tuyến", value: newTrip.route, type: "select", options: routes.map((r) => ({
                label: `${r.originStation?.name || ""} - ${r.destinationStation?.name || ""} (${r.name || r.code})`,
                value: r._id
              })), onChange: (e: any) => setNewTrip((r: any) => ({ ...r, route: e.target.value })),  colSpan: 2 },
            ],
            [
              { label: "Mã chuyến", value: newTrip.tripCode, type: "text", onChange: (e: any) => setNewTrip((r: any) => ({ ...r, tripCode: e.target.value })) },
              { label: "Xe", value: newTrip.bus, type: "select", options: buses.map((b) => ({ label: b.licensePlate || b.name, value: b._id })), onChange: (e: any) => setNewTrip((r: any) => ({ ...r, bus: e.target.value })) },
            ],
            [
              { label: "Trạng thái", value: newTrip.status, type: "select", options: [
                { label: "Đã lên lịch", value: "scheduled" },
                { label: "Đang chạy", value: "in_progress" },
                { label: "Hoàn thành", value: "completed" },
                { label: "Đã huỷ", value: "cancelled" },
              ], onChange: (e: any) => setNewTrip((r: any) => ({ ...r, status: e.target.value })) },
              { label: "Ngày xuất phát", value: newTrip.departureDate, type: "date", onChange: (e: any) => setNewTrip((r: any) => ({ ...r, departureDate: e.target.value })) },
            ],
            [
              { label: "Giờ đi", value: newTrip.departureTime, type: "text", onChange: (e: any) => setNewTrip((r: any) => ({ ...r, departureTime: e.target.value })) },
              { label: "Giờ đến", value: newTrip.arrivalTime, type: "text", onChange: (e: any) => setNewTrip((r: any) => ({ ...r, arrivalTime: e.target.value })) },
            ],
            [
              { label: "Giá vé", value: newTrip.basePrice, type: "number", onChange: (e: any) => setNewTrip((r: any) => ({ ...r, basePrice: e.target.value })) },
              { label: "Ghế còn", value: newTrip.availableSeats, type: "number", onChange: (e: any) => setNewTrip((r: any) => ({ ...r, availableSeats: e.target.value })) },
            ],
          
            [
              { label: "Ghi chú", value: newTrip.notes, type: "text", onChange: (e: any) => setNewTrip((r: any) => ({ ...r, notes: e.target.value })), colSpan: 2 },
            ],
          ]}
        />
      )}
      {/* Modal chỉnh sửa chuyến xe */}
      {showEditModal && editTrip && (
        <BasicModal
          open={showEditModal}
          onClose={handleCloseEditModal}
          title="Chỉnh sửa chuyến xe"
          subtitle="Cập nhật thông tin chuyến xe"
          icon={<Bus size={28} />}
          readonly={false}
          onSubmit={handleUpdateTrip}
          submitLabel={editLoading ? "Đang lưu..." : "Cập nhật"}
          rows={[
            [
              { label: "Tuyến", value: editTrip.route, type: "select", options: routes.map((r) => ({
                label: `${r.originStation?.name || ""} - ${r.destinationStation?.name || ""} (${r.name || r.code})`,
                value: r._id
              })), onChange: (e: any) => setEditTrip((r: any) => ({ ...r, route: e.target.value })), colSpan: 2 },
            ],
            [
              { label: "Mã chuyến", value: editTrip.tripCode, type: "text", onChange: (e: any) => setEditTrip((r: any) => ({ ...r, tripCode: e.target.value })) },
              { label: "Xe", value: editTrip.bus, type: "select", options: buses.map((b) => ({ label: b.licensePlate || b.name, value: b._id })), onChange: (e: any) => setEditTrip((r: any) => ({ ...r, bus: e.target.value })) },
            ],
            [
              { label: "Trạng thái", value: editTrip.status, type: "select", options: [
                { label: "Đã lên lịch", value: "scheduled" },
                { label: "Đang chạy", value: "in_progress" },
                { label: "Hoàn thành", value: "completed" },
                { label: "Đã huỷ", value: "cancelled" },
              ], onChange: (e: any) => setEditTrip((r: any) => ({ ...r, status: e.target.value })) },
              { label: "Ngày xuất phát", value: editTrip.departureDate ? new Date(editTrip.departureDate).toISOString().slice(0, 10) : "", type: "date", onChange: (e: any) => setEditTrip((r: any) => ({ ...r, departureDate: e.target.value })) },
            ],
            [
              { label: "Giờ đi", value: editTrip.departureTime, type: "text", onChange: (e: any) => setEditTrip((r: any) => ({ ...r, departureTime: e.target.value })) },
              { label: "Giờ đến", value: editTrip.arrivalTime, type: "text", onChange: (e: any) => setEditTrip((r: any) => ({ ...r, arrivalTime: e.target.value })) },
            ],
            [
              { label: "Giá vé", value: editTrip.basePrice, type: "number", onChange: (e: any) => setEditTrip((r: any) => ({ ...r, basePrice: e.target.value })) },
              { label: "Ghế còn", value: editTrip.availableSeats, type: "number", onChange: (e: any) => setEditTrip((r: any) => ({ ...r, availableSeats: e.target.value })) },
            ],
            [
              { label: "Ghi chú", value: editTrip.notes, type: "text", onChange: (e: any) => setEditTrip((r: any) => ({ ...r, notes: e.target.value })), colSpan: 2 },
            ],
          ]}
          updatedAt={editTrip.updatedAt}
        />
      )}
    </div>
  );
};

export default ManagerTrip; 