import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
      await login(email, password);
      navigate(from);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: "url('/src/assets/bus-bg.png')" }}>
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="relative z-10 flex w-full max-w-3xl rounded-lg overflow-hidden shadow-2xl h-[500px]">
        {/* Left side - Bus image full */}
        <div className="hidden md:flex items-center justify-center bg-black bg-opacity-60 w-1/2 h-full">
          <img src="/src/assets/bus2.png" alt="Bus" className="w-full h-full object-cover rounded-none" />
        </div>
        {/* Right side - Form */}
        <div className="bg-white bg-opacity-90 p-10 w-full md:w-1/2 flex flex-col justify-center h-full">
          <h2 className="text-3xl font-extrabold mb-10 text-red-500 text-center drop-shadow">Đăng nhập</h2>
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
                  placeholder="admin@email.com"
                />
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="mb-4">
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
              className={`w-full py-3 rounded-md transition-colors duration-200 flex items-center justify-center text-white font-semibold text-lg shadow-md ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;