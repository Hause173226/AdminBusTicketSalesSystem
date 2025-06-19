import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to home
  const from = location.state?.from || '/';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Call login from AuthContext which will handle the API call
      await login(email, password);
      
      // Redirect to previous page or home
      navigate(from);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="pt-16 pb-12">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-144px)]">
        <motion.div
          className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-6 bg-blue-700 text-white">
            <h2 className="text-2xl font-bold">Đăng nhập</h2>
            <p className="mt-1">Đăng nhập để đặt vé và quản lý tài khoản</p>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="example@email.com"
                  />
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>
                <div className="flex justify-end mt-1">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 -mx-2 transition-colors duration-200"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-md transition-colors duration-200 flex items-center justify-center ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-700 hover:bg-blue-800 text-white'
                }`}
              >
                {loading ? 'Đang xử lý...' : (
                  <>
                    Đăng nhập
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-blue-700 hover:underline">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;