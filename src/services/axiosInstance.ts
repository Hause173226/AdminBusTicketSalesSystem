import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Custom event để thông báo loading state
const emitLoadingEvent = (isLoading: boolean) => {
  window.dispatchEvent(new CustomEvent('apiLoading', { detail: { isLoading } }));
};

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Hiển thị loading khi bắt đầu request
    emitLoadingEvent(true);
    
    return config;
  },
  (error) => {
    // Ẩn loading khi có lỗi request
    emitLoadingEvent(false);
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Ẩn loading khi response thành công
    emitLoadingEvent(false);
    return response;
  },
  async (error) => {
    // Ẩn loading khi có lỗi response
    emitLoadingEvent(false);
    
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
