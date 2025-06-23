import React, { useEffect, useState } from "react";
import { Bus, BarChart3, Calendar, MapPin } from "lucide-react";
import BasicTable from "../tables/BasicTable";
import { getAllTrips } from "../../services/tripServices";
import BasicModal from "../modal/BasicModal";
import { Calendar as CalendarIcon } from "lucide-react";

const statusColor: Record<string, string> = {
  "scheduled": "bg-blue-100 text-blue-800",
  "active": "bg-green-100 text-green-800",
  "inactive": "bg-gray-100 text-gray-800",
  "maintenance": "bg-yellow-100 text-yellow-800",
};

const ManagerTrip = () => {
  const [routeData, setRouteData] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleView = (trip: any) => {
    setSelectedTrip(trip);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTrip(null);
  };

  const columns = [
    { key: "tripCode", label: "Mã chuyến" },
    { key: "routeId", label: "Tuyến" },
    { key: "departureDate", label: "Ngày xuất phát" },
    {
      key: "status",
      label: "Trạng thái",
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[value] || "bg-gray-100 text-gray-800"}`}>
          {value}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (_: any, row: any) => (
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
          onClick={() => handleView(row)}
        >
          View
        </button>
      ),
    },
  ];

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const trips = await getAllTrips();
        // Chuyển đổi dữ liệu từ trip sang format cho bảng
        const mapped = trips.map((trip: any) => ({
          tripCode: trip.tripCode || trip._id,
          routeId: trip.route?.code || trip.route?._id || "",
          departureDate: trip.departureDate ? new Date(trip.departureDate).toLocaleDateString() : "",
          departureTime: trip.departureTime || "",
          arrivalTime: trip.arrivalTime || "",
          basePrice: trip.basePrice ? `${trip.basePrice.toLocaleString()} VND` : "",
          availableSeats: trip.availableSeats ?? "",
          status: trip.status || "",
          notes: trip.notes || "",
        }));
        setRouteData(mapped);
      } catch (error) {
        setRouteData([]);
      }
    };
    fetchTrips();
  }, []);

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
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Thêm chuyến mới
            </button>
          </div>
        </div>
        <BasicTable columns={columns} data={routeData} rowKey="tripCode" />
      </div>
      {/* Modal xem chi tiết chuyến xe */}
      {showModal && selectedTrip && (
        <BasicModal
          open={showModal}
          onClose={handleCloseModal}
          title="Chi tiết chuyến xe"
          subtitle="Thông tin chi tiết chuyến xe"
          readonly
          rows={[
            [
              { label: "Mã chuyến", value: selectedTrip.tripCode || "", type: "text" },
              { label: "Tuyến", value: selectedTrip.routeId || "", type: "text" },
            ],
            [
              { label: "Ngày xuất phát", value: selectedTrip.departureDate || "", type: "text", icon: <CalendarIcon size={18} /> },
               { label: "Giá vé", value: selectedTrip.basePrice || "", type: "text" },
            ],
            [ 
            { label: "Giờ đi", value: selectedTrip.departureTime || "", type: "text" },
              { label: "Giờ đến", value: selectedTrip.arrivalTime || "", type: "text" },
             
            ],
            [
              { label: "Ghế còn", value: selectedTrip.availableSeats ?? "", type: "text" },
              { label: "Trạng thái", value: selectedTrip.status || "", type: "text" },
            ],
            [
              { label: "Ghi chú", value: selectedTrip.notes || "", type: "text", colSpan: 2 },
            ],
          ]}
        />
      )}
    </div>
  );
};

export default ManagerTrip; 