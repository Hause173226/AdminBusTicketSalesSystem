import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import ManagerRoute from "./components/manager/managerRoute";
import ManagerBus from "./components/manager/managerBus";
import ManagerUser from "./components/manager/managerUser";
import Login from "./components/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("routes");
  const { user, isAdmin } = useAuth();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
            <Route path="/" element={
              <PrivateRoute>
                <ManagerRoute />
              </PrivateRoute>
            } />
            <Route path="/bus" element={
              <PrivateRoute>
                <ManagerBus />
              </PrivateRoute>
            } />
            <Route path="/users" element={
              <PrivateRoute>
                <ManagerUser />
              </PrivateRoute>
            } />
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
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
