import React, { useEffect, useState } from "react";
import { bookingService } from "../../services/bookingServic";
import BasicTable from "../tables/BasicTable";
import { Eye, Pencil, Trash2 } from "lucide-react";
import BasicModal from "../modal/BasicModal";
import Pagination from "../common/Pagination";
import { toast } from "react-toastify";
import SearchInput from "./SearchInput";

const ManagerBooking: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [searchValue, setSearchValue] = useState("");

  // Handler functions
  function handleView(row: any) {
    setSelectedBooking(row);
    setModalOpen(true);
  }
  function handleEdit(row: any) {
    // TODO: mở modal sửa booking
    console.log("Edit booking", row);
  }
  function handleDelete(row: any) {
    // TODO: xác nhận xoá booking
    // console.log("Delete booking", row);
    toast.info("Chức năng xoá booking chưa được triển khai");
  }

  // Helper để lấy tên chuyến xe từ trip
  function getTripName(trip: any) {
    if (trip?.route?.name) return trip.route.name;
    return trip?.tripCode || trip?._id || "Không xác định";
  }

  // Columns definition
  const columns = [
    { key: "bookingCode", label: "Mã Booking" },
    { key: "customer", label: "Khách hàng", render: (v: any) => v?.fullName || v?.name || v?._id || "" },
    { key: "trip", label: "Tuyến xe", render: (_: any, row: any) => getTripName(row.trip) },
    { key: "totalAmount", label: "Tổng tiền", render: (v: any) => v?.toLocaleString('vi-VN') + " VNĐ" },
    { key: "bookingStatus", label: "Trạng thái" },
    { key: "paymentStatus", label: "Thanh toán" },
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
          <button
            className="p-2 text-red-500 bg-transparent rounded hover:bg-red-50 text-xs flex items-center justify-center shadow-none border-none focus:outline-none"
            title="Xoá"
            onClick={() => handleDelete(row)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    bookingService.getAllBookings().then((data) => {
      const arr = Array.isArray(data.data) ? data.data : [];
      // Sort by createdAt descending (newest first)
      arr.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(arr);
      setLoading(false);
    });
  }, []);

  // Filter bookings by customer name
  const filteredBookings = bookings.filter(b => {
    const v = searchValue.toLowerCase();
    return (
      b.customer?.fullName?.toLowerCase().includes(v) ||
      b.customer?.name?.toLowerCase().includes(v)
    );
  });
  const totalPages = Math.ceil(filteredBookings.length / pageSize);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Detail rows for modal
  const detailRows = selectedBooking
    ? [
        [
          { label: "Mã Booking", value: selectedBooking.bookingCode },
          { label: "Ngày đặt", value: selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : "" },
        ],
        [
          { label: "Khách hàng", value: selectedBooking.customer?.fullName || selectedBooking.customer?.name || "" },
          { label: "Tuyến xe", value: getTripName(selectedBooking.trip) },
        ],
        [
          { label: "Điểm đi", value: selectedBooking.trip?.route?.originStation?.name || "" },
          { label: "Điểm đến", value: selectedBooking.trip?.route?.destinationStation?.name || "" },
        ],
        [
          { label: "Ghế", value: Array.isArray(selectedBooking.seatNumbers) ? selectedBooking.seatNumbers.join(", ") : (selectedBooking.seatNumbers || "") },
          { label: "Tổng tiền", value: selectedBooking.totalAmount?.toLocaleString('vi-VN') + " VNĐ" },
        ],
        [
          { label: "Trạng thái", value: selectedBooking.bookingStatus },
          { label: "Thanh toán", value: selectedBooking.paymentStatus },
        ],
        [
          { label: "Phương thức thanh toán", value: selectedBooking.paymentMethod || "Chưa chọn" },
          { label: "Ghi chú", value: selectedBooking.notes || "Không có" },
        ],
      ]
    : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Danh sách Booking</h3>
        <div className="flex items-center gap-2 ml-auto">
          <SearchInput
            value={searchValue}
            onChange={e => { setSearchValue(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm kiếm tên khách hàng..."
            debounceMs={1000}
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Thêm booking mới
          </button>
        </div>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <BasicTable columns={columns} data={paginatedBookings} rowKey="_id" />
          {/* Pagination controls */}
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
      {modalOpen && selectedBooking && (
        <BasicModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Chi tiết Booking"
          subtitle={<span className="text-gray-500 text-xs">Thông tin chi tiết vé</span>}
          rows={detailRows}
          readonly
        />
      )}
    </div>
  );
};

export default ManagerBooking;
