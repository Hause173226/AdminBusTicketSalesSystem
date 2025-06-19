import React from "react";
import { Menu, Bus } from "lucide-react";

type HeaderProps = {
  toggleSidebar: () => void;
};

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => (
  <header className="bg-white shadow-sm border-b border-gray-200">
    <div className="flex items-center justify-between h-16 px-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          title="Mở menu"
        >
          <Menu className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quản lý tuyến xe</h2>
          <p className="text-sm text-gray-500">Quản lý và theo dõi các tuyến xe trong hệ thống</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors" title="Tuyến xe">
          <Bus className="w-4 h-4" />
        </button>
      </div>
    </div>
  </header>
);

export default Header; 