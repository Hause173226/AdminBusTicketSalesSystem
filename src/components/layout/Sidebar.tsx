import React from "react";
import { Bus, Truck, UserCheck, Users, CreditCard, MessageSquare, Settings, X, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  return (
    <div
      className={`$
        {isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:inset-0`}
    >
      <div className="flex flex-col h-full">
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
            title="Đóng menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeMenuItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {setActiveMenuItem(item.id);
                  if (item.id === "vehicles") navigate("/bus");
                  if (item.id === "trips") navigate("/");
                  if (item.id === "routes") navigate("/routes");
                  if (item.id === "users") navigate("/users");
                  if (item.id === "drivers") navigate("/drivers");
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