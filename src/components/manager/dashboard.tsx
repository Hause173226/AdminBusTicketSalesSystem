import React, { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { userServices } from "../../services/userServices";
import { getAllBuses } from "../../services/busServices";
import { getAllDrivers } from "../../services/driverService";
import { getAllRoutes } from "../../services/routeServices";
import { getAllStations } from "../../services/stationServices";
import { bookingService } from "../../services/bookingServic";
import { getAllTrips } from "../../services/tripServices";
import { Booking } from "../type";

const lineData = [
  { name: "Sep", uv: 400, pv: 240 },
  { name: "Oct", uv: 300, pv: 139 },
  { name: "Nov", uv: 200, pv: 980 },
  { name: "Dec", uv: 278, pv: 390 },
  { name: "Jan", uv: 189, pv: 480 },
  { name: "Feb", uv: 239, pv: 380 },
];

const barData = [
  { name: "17", uv: 400, pv: 240 },
  { name: "18", uv: 300, pv: 139 },
  { name: "19", uv: 200, pv: 980 },
  { name: "20", uv: 278, pv: 390 },
  { name: "21", uv: 189, pv: 480 },
  { name: "22", uv: 239, pv: 380 },
  { name: "23", uv: 349, pv: 430 },
  { name: "24", uv: 200, pv: 210 },
  { name: "25", uv: 300, pv: 320 },
];

const pieData = [
  { name: "Your files", value: 63 },
  { name: "System", value: 25 },
  { name: "Other", value: 12 },
];
const COLORS = ["#4F46E5", "#38BDF8", "#A5B4FC"];

const tableData = [
  { name: "Horizon UI PRO", progress: "17.5%", quantity: 2458, date: "12 Jan 2021" },
  { name: "Horizon UI Free", progress: "10.8%", quantity: 1485, date: "21 Feb 2021" },
  { name: "Weekly Update", progress: "21.3%", quantity: 1024, date: "13 Mar 2021" },
  { name: "Venus 3D Asset", progress: "31.5%", quantity: 858, date: "24 Jan 2021" },
  { name: "Marketplace", progress: "12.2%", quantity: 258, date: "24 Oct 2022" },
];

const renderCustomLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, value
}: any) => {
  if (!value) return null;
  const RADIAN = Math.PI / 180;
  // Đặt label ở giữa sector
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={18}
      fontWeight={700}
      stroke="#333"
      strokeWidth={0.5}
    >
      {value}
    </text>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState([
    { label: "Earnings", value: "-", icon: "📈" },
    { label: "Total Bookings", value: "-", icon: "📝" },
    { label: "Total Users", value: "-", icon: "👤" },
    { label: "Total Trips", value: "-", icon: "🚌" },
    { label: "Total Buses", value: "-", icon: "🚍" },
    { label: "Total Drivers", value: "-", icon: "🧑‍✈️" },
    { label: "Total Stations", value: "-", icon: "🏢" },
    { label: "Total Routes", value: "-", icon: "🛣️" },
  ]);
  const [lineData, setLineData] = useState<{ name: string; value: number }[]>([]);
  const [barData, setBarData] = useState<{ name: string; value: number }[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [calendar, setCalendar] = useState<{ year: number; month: number; days: number[]; firstDay: number }>({ year: 0, month: 0, days: [], firstDay: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookingsRes, users, trips, buses, drivers, stations, routes] = await Promise.all([
          bookingService.getAllBookings(),
          userServices.getAllUsers().then(res => res.data),
          getAllTrips(),
          getAllBuses(),
          getAllDrivers(),
          getAllStations(),
          getAllRoutes(),
        ]);
        const bookings = Array.isArray(bookingsRes) ? bookingsRes : bookingsRes.data || [];
        // Đảm bảo bookings là mảng
        // Tính tổng doanh thu từ các booking đã thanh toán
        let earnings = 0;
        if (Array.isArray(bookings)) {
          earnings = bookings.filter(b => b.paymentStatus === "paid").reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        }
        setStats([
          { label: "Earnings", value: `${earnings.toLocaleString('vi-VN')} VNĐ`, icon: "📈" },
          { label: "Total Bookings", value: bookings.length, icon: "📝" },
          { label: "Total Users", value: users.length, icon: "👤" },
          { label: "Total Trips", value: trips.length, icon: "🚌" },
          { label: "Total Buses", value: buses.length, icon: "🚍" },
          { label: "Total Drivers", value: drivers.length, icon: "🧑‍✈️" },
          { label: "Total Stations", value: stations.length, icon: "🏢" },
          { label: "Total Routes", value: routes.length, icon: "🛣️" },
        ]);

        // Xử lý dữ liệu cho biểu đồ
        // 1. Line chart: Doanh thu từng tháng trong năm hiện tại
        const now = new Date();
        const currentYear = now.getFullYear();
        const monthly = Array(12).fill(0);
        bookings.forEach((b: Booking) => {
          if (b.paymentStatus === "paid" && b.paymentDate) {
            const d = new Date(b.paymentDate);
            if (d.getFullYear() === currentYear) {
              monthly[d.getMonth()] += b.totalAmount || 0;
            }
          }
        });
        setLineData([
          { name: "Jan", value: monthly[0] },
          { name: "Feb", value: monthly[1] },
          { name: "Mar", value: monthly[2] },
          { name: "Apr", value: monthly[3] },
          { name: "May", value: monthly[4] },
          { name: "Jun", value: monthly[5] },
          { name: "Jul", value: monthly[6] },
          { name: "Aug", value: monthly[7] },
          { name: "Sep", value: monthly[8] },
          { name: "Oct", value: monthly[9] },
          { name: "Nov", value: monthly[10] },
          { name: "Dec", value: monthly[11] },
        ]);

        // 2. Bar chart: Doanh thu từng ngày trong 7 ngày gần nhất
        const barDays: string[] = [];
        const barMap: { [key: string]: number } = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          barDays.push(key);
          barMap[key] = 0;
        }
        bookings.forEach((b: Booking) => {
          if (b.paymentStatus === "paid" && b.paymentDate) {
            const d = new Date(b.paymentDate).toISOString().slice(0, 10);
            if (barMap[d] !== undefined) {
              barMap[d] += b.totalAmount || 0;
            }
          }
        });
        setBarData(barDays.map(day => ({ name: day.slice(5), value: barMap[day] })));

        // 3. Pie chart: Tỷ lệ trạng thái booking
        const pieMap: { paid: number; unpaid: number; cancelled: number; other: number } = { paid: 0, unpaid: 0, cancelled: 0, other: 0 };
        bookings.forEach((b: Booking) => {
          if (b.paymentStatus === "paid") pieMap.paid++;
          else if (b.paymentStatus === "unpaid") pieMap.unpaid++;
          else if (b.bookingStatus === "cancelled") pieMap.cancelled++;
          else pieMap.other++;
        });
        setPieData([
          { name: "Paid", value: pieMap.paid },
          { name: "Unpaid", value: pieMap.unpaid },
          { name: "Cancelled", value: pieMap.cancelled },
          { name: "Other", value: pieMap.other },
        ]);

        // Table: 5 booking mới nhất
        const sortedBookings = [...bookings].sort((a: Booking, b: Booking) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentBookings(sortedBookings.slice(0, 9));
      } catch (err) {
        // Xử lý lỗi nếu cần
      }
    };
    fetchStats();
    // Calendar động
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    setCalendar({ year, month, days: Array.from({ length: daysInMonth }, (_, i) => i + 1), firstDay });
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Main Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {stats.slice(0, 6).map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-4 flex flex-col items-start">
            <span className="text-2xl mb-2">{stat.icon}</span>
            <span className="text-lg font-semibold">{stat.value}</span>
            <span className="text-gray-500 text-sm">{stat.label}</span>
          </div>
        ))}
      </div>
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Line Chart + Table */}
        <div className="col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg">This month</span>
              <span className="text-gray-400 text-sm">Total Spent</span>
            </div>
            <div className="flex items-end gap-4">
              <span className="text-3xl font-bold">{lineData.length ? lineData[new Date().getMonth()].value.toLocaleString('vi-VN') : 0} VNĐ</span>
              {/* Có thể thêm % tăng giảm nếu muốn */}
            </div>
            <div className="h-40 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Table */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold text-lg mb-4">Recent Bookings</div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm">
                  <th className="pb-2">BOOKING CODE</th>
                  <th className="pb-2">CUSTOMER</th>
                  <th className="pb-2">SEATS</th>
                  <th className="pb-2">AMOUNT</th>
                  <th className="pb-2">DATE</th>
                  <th className="pb-2">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((row, i) => (
                  <tr key={row._id} className="border-t">
                    <td className="py-2 font-medium">{row.bookingCode}</td>
                    <td>{row.customer?.fullName || '-'}</td>
                    <td>{row.seatNumbers?.join(', ')}</td>
                    <td>{row.totalAmount?.toLocaleString('vi-VN')} VNĐ</td>
                    <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td>{row.paymentStatus || row.bookingStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Right: Bar Chart, Pie Chart, Calendar */}
        <div className="flex flex-col gap-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold text-lg mb-2">Weekly Revenue</div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="font-semibold text-lg mb-2">Booking Status</div>
            <div className="h-32 w-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" label={renderCustomLabel} labelLine={false}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={["#4F46E5", "#38BDF8", "#A5B4FC", "#F59E42"][index % 4]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-between w-full mt-4 text-sm">
              {pieData.map((item, idx) => (
                <span key={item.name} className="mr-2" style={{ color: ["#4F46E5", "#38BDF8", "#A5B4FC", "#F59E42"][idx % 4] }}>{item.name} {item.value}</span>
              ))}
            </div>
          </div>
          {/* Calendar (dynamic) */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold text-lg mb-2">Lịch tháng {calendar.month + 1} năm {calendar.year}</div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
              {["T2","T3","T4","T5","T6","T7","CN"].map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array(calendar.firstDay === 0 ? 6 : calendar.firstDay - 1).fill(null).map((_, i) => <div key={"empty-"+i}></div>)}
              {calendar.days.map((d) => {
                const today = new Date();
                const isToday = d === today.getDate() && calendar.month === today.getMonth() && calendar.year === today.getFullYear();
                return (
                  <div key={d} className={`py-1 rounded-full ${isToday ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-indigo-100'}`}>{d}</div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
