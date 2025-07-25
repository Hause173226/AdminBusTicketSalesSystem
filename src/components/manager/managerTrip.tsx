import { useEffect, useState } from "react";
import {
  Bus,
  BarChart3,
  Calendar,
  MapPin,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Loader,
  DollarSign,
  Users,
  Info,
} from "lucide-react";
import BasicTable from "../tables/BasicTable";
import {
  getAllTrips,
  createTrip,
  updateTrip,
  deleteTrip,
} from "../../services/tripServices";
import { getAllRoutes } from "../../services/routeServices";
import { getAllBuses } from "../../services/busServices";
import { getAllDrivers } from "../../services/driverService";
import BasicModal from "../modal/BasicModal";
import { Calendar as CalendarIcon } from "lucide-react";
import ConfirmPopover from "../common/ConfirmPopover";
import { toast } from "react-toastify";
import SearchInput from ".//SearchInput";
import {
  initSeatsForTrip,
  getSeatMapByTrip,
} from "../../services/seatBookingService";
import Pagination from "../common/Pagination";

const statusColor: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 border border-blue-300 font-bold",
  in_progress:
    "bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold",
  completed: "bg-green-100 text-green-700 border border-green-300 font-bold",
  cancelled: "bg-red-100 text-red-700 border border-red-300 font-bold",
};

const statusIcon: Record<string, JSX.Element> = {
  scheduled: <Clock size={16} className="inline mr-1" />,
  in_progress: <Loader size={16} className="inline mr-1 animate-spin" />,
  completed: <CheckCircle size={16} className="inline mr-1" />,
  cancelled: <XCircle size={16} className="inline mr-1" />,
};

const statusLabel: Record<string, string> = {
  scheduled: "Đã lên lịch",
  in_progress: "Đang chạy",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
};

// Utility: Lấy viết tắt tên địa danh (ví dụ: Hồ Chí Minh -> HCM)
function getShortName(name: string) {
  return name
    .split(/\s|-/)
    .filter(
      (w) =>
        w &&
        ![
          "thành",
          "phố",
          "tỉnh",
          "huyện",
          "xã",
          "phường",
          "quận",
          "thị",
          "trấn",
          "và",
          "-",
          "",
        ].includes(w.toLowerCase())
    )
    .map((w) => w[0].toUpperCase())
    .join("");
}

// Sinh mã chuyến duy nhất dựa trên các tripCode đã tồn tại
async function generateUniqueTripCode(route: any) {
  if (!route?.name) return "";
  const prefix = getShortName(route.name);
  const allTrips = await getAllTrips();
  const codes = allTrips
    .filter(
      (t: any) =>
        t.route && (t.route._id === route._id || t.route.code === route.code)
    )
    .map((t: any) => t.tripCode);
  let code = prefix;
  let i = 1;
  while (codes.includes(code)) {
    code = `${prefix}-${i}`;
    i++;
  }
  return code;
}

// Thêm hàm định dạng số có dấu chấm
function formatNumberWithDot(value: string | number) {
  if (value === null || value === undefined) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
// Thêm hàm loại bỏ dấu chấm
function removeDot(value: string) {
  return value.replace(/\./g, "");
}

const ManagerTrip = () => {
  const [routeData, setRouteData] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTrip, setNewTrip] = useState<any>({
    tripCode: "",
    route: "",
    bus: "",
    driver: "",
    departureDate: "",
    departureTime: "",
    basePrice: "",
    availableSeats: "",
    status: "scheduled",
    notes: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [editTrip, setEditTrip] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchRoute, setSearchRoute] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [seatMap, setSeatMap] = useState<any[]>([]);
  const [availableSeatCount, setAvailableSeatCount] = useState<number>(0);
  // Thêm state lưu các busId và driverId đang bận
  const [busyBusIds, setBusyBusIds] = useState<string[]>([]);
  const [busyDriverIds, setBusyDriverIds] = useState<string[]>([]);

  const handleView = async (trip: any) => {
    setSelectedTrip(trip);
    setShowModal(true);

    // Fetch available seats count for this trip
    try {
      const seatMap = await getSeatMapByTrip(trip._id);
      const availableCount = seatMap.filter(
        (seat: any) => seat.status === "available"
      ).length;
      setAvailableSeatCount(availableCount);
    } catch (error) {
      console.error("Error fetching seat map:", error);
      setAvailableSeatCount(trip.availableSeats || 0);
    }
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTrip(null);
  };

  const handleEdit = (trip: any) => {
    setEditTrip({
      ...trip,
      route: typeof trip.route === "object" ? trip.route._id : trip.route,
      bus: typeof trip.bus === "object" ? trip.bus._id : trip.bus,
      driver: typeof trip.driver === "object" ? trip.driver._id : trip.driver,
      availableSeats: trip.availableSeats || 0,
    });
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
      render: (_: any, row: any) => {
        // Nếu row.route là object, lấy name; nếu là _id, tìm trong routes
        if (typeof row.route === "object") {
          return row.route.name || row.route.code || "";
        }
        const found = routes.find((r) => r._id === row.route);
        return found ? found.name || found.code : "";
      },
    },
    { key: "departureDateDisplay", label: "Ngày xuất phát" },
    {
      key: "status",
      label: "Trạng thái",
      render: (value: string) => (
        <span
          className={`px-1 py-0.5 text-xs rounded flex items-center gap-0.5 ${
            statusColor[value] || "bg-gray-100 text-gray-800"
          }`}
        >
          {statusIcon[value]} {statusLabel[value] || value}
        </span>
      ),
    },
    {
      key: "basePriceDisplay",
      label: "Giá vé",
    },
    {
      key: "availableSeats",
      label: "Ghế trống",
      render: (value: number) => value || 0,
    },
    {
      key: "action",
      label: "Action",
      render: (_: any, row: any) => {
        const canDelete =
          row.status === "cancelled" || row.status === "completed";
        return (
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
                className={`p-2 text-red-500 bg-transparent rounded ${
                  canDelete
                    ? "hover:bg-red-50"
                    : "opacity-50 cursor-not-allowed"
                } text-xs flex items-center justify-center shadow-none border-none focus:outline-none`}
                title={
                  canDelete
                    ? "Xoá"
                    : "Chỉ có thể xoá chuyến đã huỷ hoặc hoàn thành"
                }
                onClick={() => (canDelete ? setDeleteConfirmId(row._id) : null)}
                disabled={!canDelete}
              >
                <Trash2 size={18} />
              </button>
              <ConfirmPopover
                open={deleteConfirmId === row._id}
                message={
                  <>
                    <div>Bạn có chắc chắn muốn</div>
                    <div className="font-bold text-red-600 text-base">
                      xoá chuyến xe này?
                    </div>
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
        );
      },
    },
  ];

  // Định nghĩa fetchTrips ở đây để các hàm khác gọi lại được
  const fetchTrips = async () => {
    try {
      const trips = await getAllTrips();
      // Sort by createdAt descending (newest first)
      trips.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      // Chuyển đổi dữ liệu từ trip sang format cho bảng, giữ nguyên các trường gốc
      const mapped = trips.map((trip: any) => ({
        ...trip, // giữ nguyên tất cả trường gốc, đặc biệt là _id
        tripCode: trip.tripCode || trip._id,
        routeId: trip.route?.code || trip.route?._id || "",
        departureDateDisplay: trip.departureDate
          ? new Date(trip.departureDate).toLocaleDateString()
          : "",
        basePriceDisplay: trip.basePrice
          ? `${trip.basePrice.toLocaleString()} VND`
          : "",
        availableSeats: trip.availableSeats || 0,
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
    const fetchRoutesBusesDrivers = async () => {
      try {
        const [routesData, busesData, driversData] = await Promise.all([
          getAllRoutes(),
          getAllBuses(),
          getAllDrivers(),
        ]);
        setRoutes(
          Array.isArray(routesData)
            ? routesData.filter((r) => r.status === "active")
            : []
        );
        setBuses(
          Array.isArray(busesData)
            ? busesData.filter((b) => b.status === "active")
            : []
        );
        setDrivers(
          Array.isArray(driversData)
            ? driversData.filter((d) => d.status === "active")
            : []
        );
      } catch (err) {
        setRoutes([]);
        setBuses([]);
        setDrivers([]);
      }
    };
    fetchRoutesBusesDrivers();
  }, []);

  // Hàm kiểm tra hai khoảng thời gian có giao nhau không
  function isTimeOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
    return startA < endB && startB < endA;
  }

  // Hàm lấy thời gian bắt đầu và kết thúc của một trip
  function getTripTimeRange(trip: any, routes: any[]) {
    const route =
      typeof trip.route === "object"
        ? trip.route
        : routes.find((r) => r._id === trip.route);
    const estimatedDuration = route?.estimatedDuration || 0;
    const depDate = new Date(`${trip.departureDate}T${trip.departureTime}`);
    const arrDate = new Date(depDate.getTime() + estimatedDuration * 60000);
    return { start: depDate, end: arrDate };
  }

  // Hàm lọc xe có thể chọn
  const getAvailableBuses = () => {
    // Nếu chưa chọn đủ ngày, giờ, tuyến thì cho phép chọn tất cả
    if (!newTrip.departureDate || !newTrip.departureTime || !newTrip.route)
      return buses;

    const selectedRoute = routes.find((r) => r._id === newTrip.route);
    if (!selectedRoute) return buses;

    const newTripStart = new Date(
      `${newTrip.departureDate}T${newTrip.departureTime}`
    );
    const newTripEnd = new Date(
      newTripStart.getTime() + (selectedRoute.estimatedDuration || 0) * 60000
    );

    return buses.filter((b) => {
      // Cho phép chọn lại xe đang được chọn (khi edit)
      if (b._id === newTrip.bus) return true;

      // Kiểm tra các trip khác có trùng xe và trùng thời gian không
      const conflict = routeData.some((trip) => {
        if (
          trip.bus &&
          (typeof trip.bus === "object" ? trip.bus._id : trip.bus) === b._id &&
          ["scheduled", "in_progress"].includes(trip.status)
        ) {
          const { start, end } = getTripTimeRange(trip, routes);
          return isTimeOverlap(newTripStart, newTripEnd, start, end);
        }
        return false;
      });
      return !conflict;
    });
  };

  // Hàm lọc tài xế có thể chọn
  const getAvailableDrivers = () => {
    if (!newTrip.departureDate || !newTrip.departureTime || !newTrip.route)
      return drivers;

    const selectedRoute = routes.find((r) => r._id === newTrip.route);
    if (!selectedRoute) return drivers;

    const newTripStart = new Date(
      `${newTrip.departureDate}T${newTrip.departureTime}`
    );
    const newTripEnd = new Date(
      newTripStart.getTime() + (selectedRoute.estimatedDuration || 0) * 60000
    );

    return drivers.filter((d) => {
      if (d._id === newTrip.driver) return true;

      const conflict = routeData.some((trip) => {
        if (
          trip.driver &&
          (typeof trip.driver === "object" ? trip.driver._id : trip.driver) ===
            d._id &&
          ["scheduled", "in_progress"].includes(trip.status)
        ) {
          const { start, end } = getTripTimeRange(trip, routes);
          return isTimeOverlap(newTripStart, newTripEnd, start, end);
        }
        return false;
      });
      return !conflict;
    });
  };

  // Khi fetchTrips xong, xác định các bus/tài xế đang bận
  useEffect(() => {
    const updateBusyResources = () => {
      const busyTrips = routeData.filter((trip) =>
        ["scheduled", "in_progress"].includes(trip.status)
      );
      setBusyBusIds(
        busyTrips
          .map((trip) =>
            trip.bus && typeof trip.bus === "object" ? trip.bus._id : trip.bus
          )
          .filter(Boolean)
      );
      setBusyDriverIds(
        busyTrips
          .map((trip) =>
            trip.driver && typeof trip.driver === "object"
              ? trip.driver._id
              : trip.driver
          )
          .filter(Boolean)
      );
    };
    updateBusyResources();
  }, [routeData]);
  // Thêm hàm formatTime để chuẩn hóa giờ sang HH:mm
  const formatTime = (time: string) => {
    if (!time) return "";
    if (/^\d{2}:\d{2}$/.test(time)) return time;
    if (/^\d{1,2}$/.test(time)) return `${time.padStart(2, "0")}:00`;
    return time;
  };
  const handleCreateTrip = async () => {
    // Kiểm tra giờ xuất phát phải cách hiện tại ít nhất 1 phút
    const now = new Date();
    // Chuyển đổi giờ đi về dạng HH:mm 24h nếu cần
    let depTime = newTrip.departureTime;
    if (/SA|CH/i.test(depTime)) {
      // Nếu là định dạng 12h có SA/CH, chuyển về 24h
      const [time, period] = depTime.split(" ");
      let [h, m] = time.split(":").map(Number);
      if (/CH/i.test(period) && h < 12) h += 12;
      if (/SA/i.test(period) && h === 12) h = 0;
      depTime = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
    }
    const departureDateTime = new Date(`${newTrip.departureDate}T${depTime}`);
    if (departureDateTime.getTime() - now.getTime() < 60 * 1000) {
      toast.error("Giờ xuất phát phải cách thời điểm hiện tại ít nhất 1 phút!");
      return;
    }
    // Validate required fields
    if (!newTrip.route) {
      toast.error("Vui lòng chọn tuyến xe!");
      return;
    }
    if (!newTrip.bus) {
      toast.error("Vui lòng chọn xe!");
      return;
    }
    if (!newTrip.driver) {
      toast.error("Vui lòng chọn tài xế!");
      return;
    }
    if (!newTrip.departureDate) {
      toast.error("Vui lòng chọn ngày xuất phát!");
      return;
    }
    if (!newTrip.departureTime) {
      toast.error("Vui lòng chọn giờ đi!");
      return;
    }
    if (
      !newTrip.basePrice ||
      isNaN(Number(newTrip.basePrice)) ||
      Number(newTrip.basePrice) <= 0
    ) {
      toast.error("Vui lòng nhập giá vé hợp lệ!");
      return;
    }
    if (
      !newTrip.availableSeats ||
      isNaN(Number(newTrip.availableSeats)) ||
      Number(newTrip.availableSeats) <= 0
    ) {
      toast.error("Vui lòng chọn xe để tự động tính số ghế có sẵn!");
      return;
    }
    setCreateLoading(true);
    setCreateError("");
    try {
      let tripCode = newTrip.tripCode;
      // Nếu vì lý do nào đó chưa có tripCode, sinh lại
      const selectedRouteObj = routes.find((r) => r._id === newTrip.route);
      if (!tripCode && selectedRouteObj) {
        tripCode = await generateUniqueTripCode(selectedRouteObj);
      }
      const payload = {
        ...newTrip,
        tripCode,
        route: newTrip.route, // đã là _id
        bus: typeof newTrip.bus === "object" ? newTrip.bus._id : newTrip.bus,
        driver:
          typeof newTrip.driver === "object"
            ? newTrip.driver._id
            : newTrip.driver,
        basePrice: Number(newTrip.basePrice),
        departureTime: formatTime(newTrip.departureTime),
        status: newTrip.status || "scheduled",
        availableSeats: Number(newTrip.availableSeats), // Thêm availableSeats vào payload
      };
      // Không gửi arrivalTime
      delete payload.arrivalTime;
      // Tạo trip
      const createdTrip = await createTrip(payload);
      // Khởi tạo ghế cho trip vừa tạo
      await initSeatsForTrip(createdTrip._id, payload.bus);
      setShowCreateModal(false);
      setNewTrip({
        tripCode: "",
        route: "",
        bus: "",
        driver: "",
        departureDate: "",
        departureTime: "",
        basePrice: "",
        availableSeats: "",
        status: "scheduled",
        notes: "",
      });
      await fetchTrips();
      toast.success("Tạo chuyến xe và khởi tạo ghế thành công");
    } catch (err: any) {
      setCreateError("Lỗi khi tạo chuyến xe mới");
      toast.error(err.message || "Lỗi khi tạo chuyến xe mới");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateTrip = async () => {
    if (!editTrip || !editTrip._id) return;

    // Validate availableSeats
    if (
      !editTrip.availableSeats ||
      isNaN(Number(editTrip.availableSeats)) ||
      Number(editTrip.availableSeats) <= 0
    ) {
      toast.error("Vui lòng nhập số ghế có sẵn hợp lệ!");
      return;
    }

    setEditLoading(true);
    setEditError("");
    try {
      const payload = {
        ...editTrip,
        route:
          typeof editTrip.route === "object"
            ? editTrip.route._id
            : editTrip.route,
        bus: typeof editTrip.bus === "object" ? editTrip.bus._id : editTrip.bus,
        driver:
          typeof editTrip.driver === "object"
            ? editTrip.driver._id
            : editTrip.driver,
        basePrice: Number(editTrip.basePrice),
        availableSeats: Number(editTrip.availableSeats),
        departureTime: formatTime(editTrip.departureTime),
        status: editTrip.status || "scheduled",
      };
      // Không gửi arrivalTime
      delete payload.arrivalTime;
      await updateTrip(editTrip._id, payload);
      setShowEditModal(false);
      setEditTrip(null);
      await fetchTrips();
      toast.success("Cập nhật chuyến xe thành công");
    } catch (err: any) {
      setEditError("Lỗi khi cập nhật chuyến xe");
      toast.error(err.message || "Lỗi khi cập nhật chuyến xe");
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
      toast.error(err.message || "Lỗi khi xoá chuyến xe");
    }
  };

  const handleRouteChange = async (e: any) => {
    const selectedRouteId = e.target.value;
    const selectedRoute = routes.find((r) => r._id === selectedRouteId);
    if (selectedRoute) {
      const code = await generateUniqueTripCode(selectedRoute);
      setNewTrip((prev: any) => ({
        ...prev,
        route: selectedRouteId, // chỉ lưu _id
        tripCode: code,
      }));
    }
  };

  // Thêm handler cho việc chọn xe
  const handleBusChange = (e: any) => {
    const selectedBusId = e.target.value;
    const selectedBus = buses.find((b) => b._id === selectedBusId);
    setNewTrip((prev: any) => ({
      ...prev,
      bus: selectedBusId,
      availableSeats: selectedBus ? selectedBus.seatCount : "",
    }));
  };

  // Thêm handler cho việc chọn xe trong edit modal
  const handleEditBusChange = (e: any) => {
    const selectedBusId = e.target.value;
    const selectedBus = buses.find((b) => b._id === selectedBusId);
    setEditTrip((prev: any) => ({
      ...prev,
      bus: selectedBusId,
      availableSeats: selectedBus ? selectedBus.seatCount : prev.availableSeats,
    }));
  };

  const filteredRouteData = routeData.filter((trip) =>
    trip.route?.name?.toLowerCase().includes(searchRoute.toLowerCase())
  );
  const totalPages = Math.ceil(filteredRouteData.length / pageSize);
  const paginatedRouteData = filteredRouteData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Thống kê
  const totalTrips = routeData.length;
  const inProgressTrips = routeData.filter(
    (r) => r.status === "in_progress"
  ).length;
  const completedTrips = routeData.filter(
    (r) => r.status === "completed"
  ).length;
  const today = new Date();
  const todayTrips = routeData.filter((r) => {
    if (!r.departureDate) return false;
    const d = new Date(r.departureDate);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  }).length;

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
              <p className="text-sm font-medium text-gray-600">
                Tổng chuyến xe
              </p>
              <p className="text-2xl font-bold text-gray-900">{totalTrips}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Đang hoạt động
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {inProgressTrips}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Chuyến hôm nay
              </p>
              <p className="text-2xl font-bold text-gray-900">{todayTrips}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Chuyến hoàn thành
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {completedTrips}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Trips Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh sách chuyến xe
            </h3>
            <div className="flex items-center gap-2 ml-auto">
              <SearchInput
                value={searchRoute}
                onChange={(e) => setSearchRoute(e.target.value)}
                placeholder="Tìm kiếm tuyến..."
                debounceMs={1000}
              />
              <button
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={() => {
                  setShowCreateModal(true);
                  setNewTrip({
                    tripCode: "",
                    route: "",
                    bus: "",
                    driver: "",
                    departureDate: "",
                    departureTime: "",
                    basePrice: "",
                    availableSeats: "",
                    status: "scheduled",
                    notes: "",
                  });
                }}
              >
                Thêm chuyến mới
              </button>
            </div>
          </div>
        </div>
        <BasicTable columns={columns} data={paginatedRouteData} rowKey="_id" />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50, 100]}
        />
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
              {
                label: "Mã chuyến",
                value: selectedTrip.tripCode || "",
                type: "text",
                icon: <Info size={16} />,
              },
              {
                label: "Tuyến",
                value: selectedTrip.route.name || "",
                type: "text",
                icon: <Bus size={16} />,
              },
            ],
            [
              {
                label: "Điểm đi",
                value: selectedTrip.route?.originStation?.name || "",
                type: "text",
                icon: <MapPin size={16} />,
              },
              {
                label: "Điểm đến",
                value: selectedTrip.route?.destinationStation?.name || "",
                type: "text",
                icon: <MapPin size={16} />,
              },
            ],
            [
              {
                label: "Xe",
                value:
                  selectedTrip.bus?.licensePlate ||
                  selectedTrip.bus?.name ||
                  "",
                type: "text",
                icon: <Bus size={16} />,
              },
              {
                label: "Tài xế",
                value: selectedTrip.driver?.fullName || "",
                type: "text",
                icon: <Users size={16} />,
              },
            ],
            [
              // Giờ đi: luôn lấy departureTime + departureDate
              {
                label: "Giờ đi",
                value:
                  selectedTrip.departureTime && selectedTrip.departureDate
                    ? `${selectedTrip.departureTime} (${new Date(
                        selectedTrip.departureDate
                      ).toLocaleDateString()})`
                    : selectedTrip.departureTime || "",
                type: "text",
                icon: <Clock size={16} />,
              },
              // Giờ đến: nếu có arrivalDate thì dùng arrivalTime + arrivalDate, nếu không thì tính arrivalDate dựa trên departureDate + estimatedDuration (nếu có), nếu không thì chỉ hiển thị arrivalTime
              (() => {
                let arrivalDateStr = "";
                if (selectedTrip.arrivalTime) {
                  // Nếu có arrivalDate riêng, dùng arrivalDate
                  if (selectedTrip.arrivalDate) {
                    arrivalDateStr = `${selectedTrip.arrivalTime} (${new Date(
                      selectedTrip.arrivalDate
                    ).toLocaleDateString()})`;
                  } else if (
                    selectedTrip.departureDate &&
                    selectedTrip.route &&
                    selectedTrip.route.estimatedDuration
                  ) {
                    // Nếu có departureDate và estimatedDuration, tính arrivalDate
                    const depDate = new Date(selectedTrip.departureDate);
                    const [depHour, depMin] = selectedTrip.departureTime
                      ? selectedTrip.departureTime.split(":").map(Number)
                      : [0, 0];
                    depDate.setHours(depHour, depMin || 0, 0, 0);
                    const arr = new Date(
                      depDate.getTime() +
                        selectedTrip.route.estimatedDuration * 60 * 1000
                    ); // estimatedDuration phút
                    arrivalDateStr = `${
                      selectedTrip.arrivalTime
                    } (${arr.toLocaleDateString()})`;
                  } else if (
                    selectedTrip.departureDate &&
                    selectedTrip.arrivalTime
                  ) {
                    // fallback: nếu không có estimatedDuration, nhưng có departureDate
                    arrivalDateStr = `${selectedTrip.arrivalTime} (${new Date(
                      selectedTrip.departureDate
                    ).toLocaleDateString()})`;
                  } else {
                    arrivalDateStr = selectedTrip.arrivalTime;
                  }
                }
                return {
                  label: "Giờ đến",
                  value: arrivalDateStr,
                  type: "text",
                  icon: <Clock size={16} />,
                };
              })(),
            ],
            [
              {
                label: "Giá vé",
                value: selectedTrip.basePriceDisplay || "",
                type: "text",
                icon: <DollarSign size={16} />,
              },
              {
                label: "Ghế còn trống",
                value: availableSeatCount,
                type: "text",
                icon: <Users size={16} />,
              },
            ],
            [
              {
                label: "Trạng thái",
                value: statusLabel[selectedTrip.status] || selectedTrip.status,
                type: "text",
              },
              {
                label: "Ghi chú",
                value: selectedTrip.notes || "",
                type: "text",
                icon: <Info size={16} />,
                colSpan: 1,
              },
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
              {
                label: "Tuyến",
                value: newTrip.route,
                type: "searchable-select",
                options: routes.map((r) => ({
                  label: `${r.originStation?.name || ""} - ${
                    r.destinationStation?.name || ""
                  } (${r.name || r.code})`,
                  value: r._id,
                })),
                onChange: (e: any) => handleRouteChange(e),
                colSpan: 2,
              },
            ],
            [
              {
                label: "Ngày xuất phát",
                value: newTrip.departureDate,
                type: "date",
                onChange: (e: any) =>
                  setNewTrip((r: any) => ({
                    ...r,
                    departureDate: e.target.value,
                  })),
                min: new Date().toISOString().slice(0, 10),
              },
              {
                label: "Giờ đi",
                value: newTrip.departureTime,
                type: "time",
                onChange: (e: any) =>
                  setNewTrip((r: any) => ({
                    ...r,
                    departureTime: e.target.value,
                  })),
              },
            ],
            [
              {
                label: "Xe",
                value: newTrip.bus,
                type: "searchable-select",
                options: getAvailableBuses().map((b) => ({
                  label: b.licensePlate || b.name,
                  value: b._id,
                })),
                onChange: (e: any) => handleBusChange(e),
              },
              {
                label: "Tài xế",
                value: newTrip.driver,
                type: "searchable-select",
                options: getAvailableDrivers().map((d) => ({
                  label: d.fullName,
                  value: d._id,
                })),
                onChange: (e: any) =>
                  setNewTrip((r: any) => ({ ...r, driver: e.target.value })),
              },
            ],
            [
              {
                label: "Giá vé",
                value: formatNumberWithDot(newTrip.basePrice),
                type: "text",
                onChange: (e: any) => {
                  const raw = removeDot(e.target.value);
                  if (/^\d*$/.test(raw)) {
                    setNewTrip((r: any) => ({ ...r, basePrice: raw }));
                  }
                },
              },
              {
                label: "Ghi chú",
                value: newTrip.notes,
                type: "text",
                onChange: (e: any) =>
                  setNewTrip((r: any) => ({ ...r, notes: e.target.value })),
              },
              // Đã xoá trường Ghế có sẵn ở đây
            ],
            [],
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
              {
                label: "Tuyến",
                value: editTrip.route,
                type: "searchable-select",
                options: routes.map((r) => ({
                  label: `${r.originStation?.name || ""} - ${
                    r.destinationStation?.name || ""
                  } (${r.name || r.code})`,
                  value: r._id,
                })),
                onChange: (e: any) =>
                  setEditTrip((r: any) => ({ ...r, route: e.target.value })),
                colSpan: 2,
              },
            ],
            [
              {
                label: "Mã chuyến",
                value: editTrip.tripCode,
                type: "text",
                onChange: (e: any) =>
                  setEditTrip((r: any) => ({ ...r, tripCode: e.target.value })),
              },
              {
                label: "Giá vé",
                value: formatNumberWithDot(editTrip.basePrice),
                type: "text",
                onChange: (e: any) => {
                  const raw = removeDot(e.target.value);
                  if (/^\d*$/.test(raw)) {
                    setEditTrip((r: any) => ({ ...r, basePrice: raw }));
                  }
                },
              },
              // Trạng thái: chỉ cho phép chọn 'Đã huỷ' nếu đang ở 'scheduled' hoặc 'in_progress', còn lại chỉ hiển thị text
              // ["scheduled", "in_progress"].includes(editTrip.status)
              //   ? {
              //       label: "Trạng thái",
              //       value: editTrip.status,
              //       type: "select",
              //       options: [
              //         {
              //           label: statusLabel[editTrip.status],
              //           value: editTrip.status,
              //         },
              //         { label: "Đã huỷ", value: "cancelled" },
              //       ],
              //       onChange: (e: any) =>
              //         setEditTrip((r: any) => ({
              //           ...r,
              //           status: e.target.value,
              //         })),
              //     }
              //   : {
              //       label: "Trạng thái",
              //       value: statusLabel[editTrip.status] || editTrip.status,
              //       type: "text",
              //       readOnly: true,
              //     },
            ],
            [
              {
                label: "Xe",
                value: editTrip.bus,
                type: "searchable-select",
                options: buses.map((b) => ({
                  label: b.licensePlate || b.name,
                  value: b._id,
                })),
                onChange: (e: any) => handleEditBusChange(e),
              },
              {
                label: "Tài xế",
                value: editTrip.driver,
                type: "searchable-select",
                options: drivers.map((d) => ({
                  label: d.fullName,
                  value: d._id,
                })),
                onChange: (e: any) =>
                  setEditTrip((r: any) => ({ ...r, driver: e.target.value })),
              },
            ],
            [
              {
                label: "Giờ đi",
                value: editTrip.departureTime,
                type: "time",
                onChange: (e: any) =>
                  setEditTrip((r: any) => ({
                    ...r,
                    departureTime: e.target.value,
                  })),
              },
              {
                label: "Ngày xuất phát",
                value: editTrip.departureDate
                  ? new Date(editTrip.departureDate).toISOString().slice(0, 10)
                  : "",
                type: "date",
                onChange: (e: any) =>
                  setEditTrip((r: any) => ({
                    ...r,
                    departureDate: e.target.value,
                  })),
                min: new Date().toISOString().slice(0, 10),
              },
            ],
            [
              // {
              //   label: "Ghế có sẵn",
              //   value: editTrip.availableSeats,
              //   type: "number",
              //   onChange: (e: any) =>
              //     setEditTrip((r: any) => ({
              //       ...r,
              //       availableSeats: e.target.value,
              //     })),
              // },
              {
                label: "Ghi chú",
                value: editTrip.notes,
                type: "text",
                onChange: (e: any) =>
                  setEditTrip((r: any) => ({ ...r, notes: e.target.value })),
                colSpan: 2,
              },
            ],
          ]}
          updatedAt={editTrip.updatedAt}
        />
      )}
    </div>
  );
};

export default ManagerTrip;
