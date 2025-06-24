import React, { useState } from "react";
import { Bus, Truck, UserCheck, Users, CreditCard, MessageSquare, Settings, X, MapPin, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
const menuItems = [
 
  { id: "trips", label: "Quản lý chuyến xe", icon: Bus },
  { id: "routes", label: "Quản lý tuyến đường", icon: MapPin },
  { id: "vehicles", label: "Quản lý xe", icon: Truck },
  { id: "drivers", label: "Quản lý tài xế", icon: UserCheck },
  { id: "users", label: "Quản lý người dùng", icon: Users },
  { id: "payments", label: "Quản lý thanh toán", icon: CreditCard },
  { id: "feedback", label: "Phản hồi", icon: MessageSquare },
  { id: "settings", label: "Cài đặt", icon: Settings },
];

type SidebarProps = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeMenuItem: string;
  setActiveMenuItem: (id: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar, activeMenuItem, setActiveMenuItem }) => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  return (
    <div
      className={`$
        {isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:inset-0`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200 relative">
          <motion.h1
            className="text-2xl font-extrabold text-blue-700 tracking-wide drop-shadow-lg"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            style={{ textAlign: 'center', width: '100%' }}
          >
            BusSystem
          </motion.h1>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 absolute right-4 top-1/2 -translate-y-1/2"
            title="Đóng menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeMenuItem === item.id;
            if (item.id === "settings") {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      setActiveMenuItem(item.id);
                      setIsSettingsOpen((prev) => !prev);
                    }}
                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    title={item.label}
                  >
                    <IconComponent className={`w-5 h-5 mr-3 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                    {item.label}
                  </button>
                  {isSettingsOpen && (
                    <div className="ml-8 mt-1 flex flex-col gap-1">
                      <button
                        onClick={() => { navigate("/profile"); setIsSettingsOpen(false); }}
                        className="flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-blue-100 text-gray-700 hover:text-blue-700 transition-all"
                      >
                        <User className="w-4 h-4 text-blue-500" />
                        Xem hồ sơ
                      </button>
                      <button
                        onClick={() => { navigate("/logout"); setIsSettingsOpen(false); }}
                        className="flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-red-100 text-gray-700 hover:text-red-600 transition-all"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => {setActiveMenuItem(item.id);
                  if (item.id === "trips") navigate("/");
                  if (item.id === "routes") navigate("/routes");
                  if (item.id === "vehicles") navigate("/bus");
                  if (item.id === "drivers") navigate("/drivers");
                  if (item.id === "users") navigate("/users");
                }}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={item.label}
              >
                <IconComponent className={`w-5 h-5 mr-3 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 