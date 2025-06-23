import React, { useEffect, useState } from "react";
import { getAllRoutes } from "../../services/routeServices";
import BasicTable from "../tables/BasicTable";
import BasicModal from "../modal/BasicModal";
import { MapPin, Hash, Clock, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { Route } from "../type";

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
};

const statusLabel: Record<string, string> = {
  active: "Hoạt động",
  inactive: "Ngừng hoạt động",
};

const ManagerRoute = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const handleView = (route: Route) => {
    setSelectedRoute(route);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRoute(null);
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await getAllRoutes();
        setRoutes(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError("Lỗi khi lấy dữ liệu tuyến đường");
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  const columns = [
    { key: "code", label: "Mã tuyến" },
    { key: "name", label: "Tên tuyến" },
    {
      key: "originStation",
      label: "Điểm đi",
      render: (value: any) => value && value.length > 0 ? value[0].name : "",
    },
    {
      key: "destinationStation",
      label: "Điểm đến",
      render: (value: any) => value && value.length > 0 ? value[0].name : "",
    },
    { key: "distanceKm", label: "Km" },
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
          <MapPin size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Danh sách tuyến đường</h3>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <BasicTable columns={columns} data={routes} rowKey="_id" />
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
              { label: "Điểm đi", value: selectedRoute.originStation && selectedRoute.originStation[0]?.name || "", type: "text", icon: <MapPin size={18} /> },
              { label: "Điểm đến", value: selectedRoute.destinationStation && selectedRoute.destinationStation[0]?.name || "", type: "text", icon: <MapPin size={18} /> },
            ],
            [
              { label: "Khoảng cách (km)", value: selectedRoute.distanceKm || "", type: "text", icon: <Clock size={18} /> },
              { label: "Thời gian dự kiến (phút)", value: selectedRoute.estimatedDuration || "", type: "text", icon: <CalendarIcon size={18} /> },
            ],
            [
              { label: "Trạng thái", value: statusLabel[selectedRoute.status] || selectedRoute.status, type: "text" },
            ],
          ]}
        />
      )}
    </div>
  );
};

export default ManagerRoute;
