import React, { useEffect, useState } from "react";
import { bookingService } from "../../services/bookingServic";
import BasicTable from "../tables/BasicTable";
import { Eye, Pencil, Trash2, CheckCircle, XCircle, Clock, CreditCard, DollarSign } from "lucide-react";
import BasicModal from "../modal/BasicModal";
import Pagination from "../common/Pagination";
import { toast } from "react-toastify";
import SearchInput from "./SearchInput";
import ConfirmPopover from "../common/ConfirmPopover";

// Status styling for booking status
const bookingStatusColor: Record<string, string> = {
  "confirmed": "bg-green-100 text-green-700 border border-green-300 font-bold",
  "pending": "bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold",
  "cancelled": "bg-red-100 text-red-700 border border-red-300 font-bold",
  "completed": "bg-blue-100 text-blue-700 border border-blue-300 font-bold",
};

const bookingStatusIcon: Record<string, JSX.Element> = {
  "confirmed": <CheckCircle size={16} className="inline mr-1" />,
  "pending": <Clock size={16} className="inline mr-1" />,
  "cancelled": <XCircle size={16} className="inline mr-1" />,
  "completed": <CheckCircle size={16} className="inline mr-1" />,
};

const bookingStatusLabel: Record<string, string> = {
  "confirmed": "Đã xác nhận",
  "pending": "Chờ xác nhận",
  "cancelled": "Đã huỷ",
  "completed": "Hoàn thành",
};

// Status styling for payment status
const paymentStatusColor: Record<string, string> = {
  "paid": "bg-green-100 text-green-700 border border-green-300 font-bold",
  "pending": "bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold",
  "failed": "bg-red-100 text-red-700 border border-red-300 font-bold",
  "refunded": "bg-gray-100 text-gray-700 border border-gray-300 font-bold",
  "unpaid": "bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold", // Đổi sang vàng
};

const paymentStatusIcon: Record<string, JSX.Element> = {
  "paid": <DollarSign size={16} className="inline mr-1" />,
  "pending": <Clock size={16} className="inline mr-1" />,
  "failed": <XCircle size={16} className="inline mr-1" />,
  "refunded": <CreditCard size={16} className="inline mr-1" />,
  "unpaid": <XCircle size={16} className="inline mr-1" />,
};

const paymentStatusLabel: Record<string, string> = {
  "paid": "Đã thanh toán",
  "pending": "Chờ thanh toán",
  "failed": "Thanh toán thất bại",
  "refunded": "Đã hoàn tiền",
  "unpaid": "Chưa thanh toán",
};

const ManagerBooking: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [searchValue, setSearchValue] = useState("");
  const [bookingToCancel, setBookingToCancel] = useState<any | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<string | false>(false);

  // Handler functions
  function handleView(row: any) {
    setSelectedBooking(row);
    setModalOpen(true);
  }
  function handleEdit(row: any) {
    toast.info("Chức năng chỉnh sửa booking chưa được triển khai");
    // TODO: mở modal sửa booking
    // console.log("Edit booking", row);
  }
  // Sửa nút huỷ trong columns
  const columns = [
    { key: "bookingCode", label: "Mã Booking" },
    { key: "customer", label: "Khách hàng", render: (v: any) => v?.fullName || v?.name || v?._id || "" },
    { key: "trip", label: "Tuyến xe", render: (_: any, row: any) => getTripName(row.trip) },
    { key: "totalAmount", label: "Tổng tiền", render: (v: any) => v?.toLocaleString('vi-VN') + " VNĐ" },
    { 
      key: "bookingStatus", 
      label: "Trạng thái",
      render: (value: string) => (
        <span className={`px-1 py-0.5 text-xs rounded flex items-center gap-0.5 ${bookingStatusColor[value] || "bg-gray-100 text-gray-800"}`}>
          {bookingStatusIcon[value]} {bookingStatusLabel[value] || value}
        </span>
      ),
    },
    { 
      key: "paymentStatus", 
      label: "Thanh toán",
      render: (value: string) => (
        <span className={`px-1 py-0.5 text-xs rounded flex items-center gap-0.5 ${paymentStatusColor[value] || "bg-gray-100 text-gray-800"}`}>
          {paymentStatusIcon[value]} {paymentStatusLabel[value] || value}
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
          <div className="relative">
            <button
              className="p-2 text-red-500 bg-transparent rounded hover:bg-red-50 text-xs flex items-center justify-center shadow-none border-none focus:outline-none"
              title="Huỷ booking"
              onClick={() => {
                setBookingToCancel(row);
                setConfirmOpen(row._id);
              }}
            >
              <Trash2 size={18} />
            </button>
            {confirmOpen === row._id && (
              <ConfirmPopover
                open={true}
                message={<span>Bạn có chắc chắn<br />muốn <b>huỷ booking</b> này?</span>}
                onCancel={() => {
                  setConfirmOpen(false);
                  setBookingToCancel(null);
                }}
                onConfirm={() => {
                  setConfirmOpen(false); // Đóng modal trước
                  setBookingToCancel(null);
                  setTimeout(() => {
                    bookingService.cancelBooking(row._id)
                      .then(res => {
                        toast.success("Huỷ booking thành công!");
                        setBookings(prev =>
                          prev.map(b =>
                            b._id === row._id ? { ...b, bookingStatus: "cancelled" } : b
                          )
                        );
                      })
                      .catch(err => {
                        toast.error("Huỷ booking thất bại: " + (err?.response?.data?.message || err.message));
                      });
                  }, 100);
                }}
              />
            )}
          </div>
        </div>
      ),
    },
  ];

  // Helper để lấy tên chuyến xe từ trip
  function getTripName(trip: any) {
    if (trip?.route?.name) return trip.route.name;
    return trip?.tripCode || trip?._id || "Không xác định";
  }

  useEffect(() => {
    bookingService.getAllBookings().then((data) => {
      const arr = Array.isArray(data.data) ? data.data : [];
      // Sort by createdAt descending (newest first)
      arr.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(arr);
      setLoading(false);
    });
  }, []);

  // Filter bookings by customer name or booking code
  const filteredBookings = bookings.filter(b => {
    const v = searchValue.toLowerCase();
    return (
      b.customer?.fullName?.toLowerCase().includes(v) ||
      b.customer?.name?.toLowerCase().includes(v) ||
      b.bookingCode?.toLowerCase().includes(v)
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
          { label: "Trạng thái", value: bookingStatusLabel[selectedBooking.bookingStatus] || selectedBooking.bookingStatus },
          { label: "Thanh toán", value: paymentStatusLabel[selectedBooking.paymentStatus] || selectedBooking.paymentStatus },
        ],
        [
          { label: "Phương thức thanh toán", value: selectedBooking.paymentMethod === "online" ? "Online" : selectedBooking.paymentMethod === "offline" ? "Tại quầy" : (selectedBooking.paymentMethod || "Chưa chọn") },
          { label: "Ghi chú", value: selectedBooking.notes || "Không có" },
        ],
      ]
    : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Danh sách Booking</h3>
        <div className="flex items-center gap-2 ml-auto">
          <SearchInput
            value={searchValue}
            onChange={e => { setSearchValue(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm kiếm..."
            debounceMs={1000}
          />
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
