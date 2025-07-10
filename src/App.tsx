import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import ManagerRoute from "./components/manager/managerRoute";
import ManagerTrip from "./components/manager/managerTrip";
import ManagerBus from "./components/manager/managerBus";
import ManagerUser from "./components/manager/managerUser";
import ManagerDriver from "./components/manager/managerDriver";
import Login from "./components/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import AdminProfile from "./components/AdminProfile";
import ManagerBooking from "./components/manager/managerbooking";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/manager/dashboard";
import { UserProvider } from './contexts/UserContext';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  React.useEffect(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);
  return null;
};

const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("dashboard");
  const location = useLocation();
  const { user, isAdmin, loading } = useAuth();

  // Map path to menu id
  const pathToMenuId = (pathname: string) => {
    if (pathname === "/" || pathname.startsWith("/dashboard")) return "dashboard";
    if (pathname.startsWith("/trips")) return "trips";
    if (pathname.startsWith("/routes")) return "routes";
    if (pathname.startsWith("/bus")) return "vehicles";
    if (pathname.startsWith("/drivers")) return "drivers";
    if (pathname.startsWith("/users")) return "users";
    if (pathname.startsWith("/bookings")) return "bookings";
    if (pathname.startsWith("/payments")) return "payments";
    if (pathname.startsWith("/feedback")) return "feedback";
    if (pathname.startsWith("/settings")) return "settings";
    if (pathname.startsWith("/profile")) return "profile";
    return "dashboard";
  };

  React.useEffect(() => {
    setActiveMenuItem(pathToMenuId(location.pathname));
  }, [location.pathname]);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return <div>Đang kiểm tra đăng nhập...</div>;
  }
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // Redirect non-admin users to appropriate page
  if (!isAdmin) {
    return (
      <Routes>
        <Route path="/dashboard" element={<div>User Dashboard</div>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        activeMenuItem={activeMenuItem} 
        setActiveMenuItem={setActiveMenuItem} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/trips" element={
              <PrivateRoute>
                <ManagerTrip />
              </PrivateRoute>
            } />
            <Route path="/routes" element={
              <PrivateRoute>
                <ManagerRoute />
              </PrivateRoute>
            } />
            <Route path="/bus" element={
              <PrivateRoute>
                <ManagerBus />
              </PrivateRoute>
            } />
            <Route path="/drivers" element={
              <PrivateRoute>
                <ManagerDriver />
              </PrivateRoute>
            } />
            <Route path="/users" element={
              <PrivateRoute>
                <ManagerUser />
              </PrivateRoute>
            } />
            <Route path="/bookings" element={
              <PrivateRoute>
                <ManagerBooking />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <AdminProfile />
              </PrivateRoute>
            } />
            <Route path="/logout" element={<Logout />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleSidebar} />
      )}
    </div>
  );
};

function App() {
  return (
    <UserProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      </Router>
    </UserProvider>
  );
}

export default App;
