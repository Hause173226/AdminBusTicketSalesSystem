import React, { useRef, useLayoutEffect, useState } from "react";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import busImg from '../../assets/bus1.png';
import avatarImg from '../../assets/avatar.png';
import { useUser } from '../../contexts/UserContext';

type HeaderProps = {
  toggleSidebar: () => void;
};

const headerInfo: Record<string, { title: string; subtitle: string }> = {
  "/trips": {
    title: "Quản lý chuyến xe",
    subtitle: "Quản lý và theo dõi các chuyến xe trong hệ thống",
  },
  "/routes": {
    title: "Quản lý tuyến đường",
    subtitle: "Quản lý và theo dõi các tuyến đường trong hệ thống",
  },
  "/stations": {
    title: "Quản lý trạm xe",
    subtitle: "Quản lý và theo dõi các trạm xe trong hệ thống",
  },
  "/bus": {
    title: "Quản lý xe",
    subtitle: "Quản lý và theo dõi các xe trong hệ thống",
  },
  "/drivers": {
    title: "Quản lý tài xế",
    subtitle: "Quản lý và theo dõi các tài xế trong hệ thống",
  },
  "/users": {
    title: "Quản lý người dùng",
    subtitle: "Quản lý và theo dõi người dùng trong hệ thống",
  },
  "/payments": {
    title: "Quản lý thanh toán",
    subtitle: "Quản lý và theo dõi thanh toán trong hệ thống",
  },
  "/feedback": {
    title: "Phản hồi",
    subtitle: "Quản lý và xử lý phản hồi từ khách hàng",
  },
  "/settings": {
    title: "Cài đặt",
    subtitle: "Cấu hình hệ thống và các tuỳ chọn",
  },
  "/bookings": {
    title: "Quản lý booking",
    subtitle: "Quản lý và theo dõi các booking/vé xe trong hệ thống",
  },
 
};

const getUserAvatar = () => {
  // Ưu tiên lấy avatar từ localStorage nếu đã lưu khi đăng nhập/profile
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.avatar && typeof user.avatar === 'string' && user.avatar.trim() !== '') {
        return user.avatar;
      }
    }
  } catch {}
  // Nếu không có thì dùng avatar mặc định
  return avatarImg;
};

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const headerRef = useRef<HTMLDivElement>(null);
  const [stopX, setStopX] = useState(0);
  const [busState, setBusState] = useState<'entering' | 'stopped'>('entering');
  const busWidth = 80; // px
  const avatarSize = 48; // px
  const paddingRight = 24; // px (tùy theo px-6)
  const { user } = useUser();

  useLayoutEffect(() => {
    if (headerRef.current) {
      const width = headerRef.current.offsetWidth;
      setStopX(width - busWidth - paddingRight);
    }
  }, []);

  // Lấy thông tin header theo route, fallback nếu không có
  const { title, subtitle } = headerInfo[location.pathname] || {
    title: "Quản lý hệ thống",
    subtitle: "Quản lý và theo dõi hệ thống",
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative overflow-hidden">
      <div ref={headerRef} className="flex items-center justify-between h-16 px-6 relative">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            title="Mở menu"
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        {/* Bus animation */}
        <motion.img
          src={busImg}
          alt="bus"
          initial={{ x: -busWidth }}
          animate={{ x: stopX }}
          transition={{ duration: 2, ease: "easeInOut" }}
          style={{ position: "absolute", top: 0, left: 0, zIndex: 10, width: busWidth, height: 60 }}
          onAnimationComplete={() => setBusState('stopped')}
        />
      </div>
    </header>
  );
};

export default Header; 