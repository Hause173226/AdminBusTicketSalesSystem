import React, { useEffect, useState } from "react";
import {
  Bus,
  Truck,
  UserCheck,
  Users,
  CreditCard,
  MessageSquare,
  Settings,
  Menu,
  X,
  BarChart3,
  Calendar,
  MapPin,
} from "lucide-react";
import { userServices } from "./services/userServices";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("routes");
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userServices.getUser();
        console.log("res", res);

        if (res.status === 200) {
          setUser(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      console.log("User data:", user);
    }
  }, [user]);

  const menuItems = [
    { id: "routes", label: "Quản lý tuyến xe", icon: Bus, isActive: true },
    { id: "vehicles", label: "Quản lý xe", icon: Truck, isActive: false },
    {
      id: "drivers",
      label: "Quản lý tài xế",
      icon: UserCheck,
      isActive: false,
    },
    { id: "users", label: "Quản lý người dùng", icon: Users, isActive: false },
    {
      id: "payments",
      label: "Quản lý thanh toán",
      icon: CreditCard,
      isActive: false,
    },
    { id: "feedback", label: "Phản hồi", icon: MessageSquare, isActive: false },
    { id: "settings", label: "Cài đặt", icon: Settings, isActive: false },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">BusSystem</h1>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeMenuItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenuItem(item.id)}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <IconComponent
                    className={`w-5 h-5 mr-3 ${
                      isActive ? "text-blue-600" : "text-gray-500"
                    }`}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Bottom User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@bussystem.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5 text-gray-500" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Quản lý tuyến xe
                </h2>
                <p className="text-sm text-gray-500">
                  Quản lý và theo dõi các tuyến xe trong hệ thống
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <Bus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
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
                      Tổng tuyến xe
                    </p>
                    <p className="text-2xl font-bold text-gray-900">24</p>
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
                      Hoạt động
                    </p>
                    <p className="text-2xl font-bold text-gray-900">18</p>
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
                    <p className="text-sm font-medium text-gray-600">
                      Điểm đến
                    </p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Routes Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Danh sách tuyến xe
                  </h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Thêm tuyến mới
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tuyến xe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Điểm đi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Điểm đến
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá vé
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        HN-HCM-001
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Hà Nội
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        TP. Hồ Chí Minh
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        18 giờ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        580.000 VND
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Hoạt động
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        HN-DN-002
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Hà Nội
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Đà Nẵng
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        14 giờ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        420.000 VND
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Hoạt động
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        HCM-NT-003
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        TP. Hồ Chí Minh
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Nha Trang
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        8 giờ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        280.000 VND
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Bảo trì
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}

export default App;
