import React, { useState, useEffect } from 'react';
import { userServices } from '../services/userServices';
import { useUser } from '../contexts/UserContext';

const defaultProfile = {
  fullName: '',
  email: '',
  phone: '',
  citizenId: '',
  dateOfBirth: '',
  role: '',
  gender: 'male',
  address: '',
  avatar: '',
};

const DEFAULT_AVATAR = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9KjLgZ_N1TQ4FL_851Y9ccuUXoMaxBM6JxA&s';

const AdminProfile: React.FC = () => {
  const [profile, setProfile] = useState(defaultProfile);
  const [editProfile, setEditProfile] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { setUser } = useUser();

  useEffect(() => {
    setLoading(true);
    userServices.getProfile()
      .then(res => {
        setProfile(res.data);
        setEditProfile(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Không thể tải thông tin cá nhân');
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
    setError('');
  };

  const handleSave = () => {
    setError('');
    userServices.updateProfile(editProfile)
      .then(res => {
        setProfile(res.data);
        setEditProfile(res.data);
        setIsEditing(false);
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data); // cập nhật context => header đổi avatar ngay
      })
      .catch(err => {
        setError(err?.response?.data?.error || 'Cập nhật thất bại');
      });
  };

  if (loading) return <div className="flex justify-center items-center min-h-[80vh]">Đang tải...</div>;

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50">
      <div className="bg-white rounded-2xl shadow-2xl flex w-full max-w-5xl overflow-hidden min-h-[600px]">
        {/* Left: Avatar & Basic Info */}
        <div className="bg-gradient-to-br from-pink-500 to-orange-400 flex flex-col items-center justify-center p-12 w-1/3 min-w-[240px]">
          <img
            src={
              isEditing
                ? editProfile.avatar || DEFAULT_AVATAR
                : profile.avatar || DEFAULT_AVATAR
            }
            alt="avatar"
            className="w-32 h-32 rounded-full border-4 border-white shadow mb-6"
            onError={e => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
            }}
          />
          {isEditing && (
            <input
              type="text"
              name="avatar"
              value={editProfile.avatar}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 mb-4"
              placeholder="Nhập link ảnh đại diện"
              title="Link ảnh đại diện"
              style={{ maxWidth: 220 }}
            />
          )}
          <h2 className="text-white text-2xl font-bold mb-1">{profile.fullName}</h2>
          <p className="text-orange-100 mb-2">{profile.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
          <button
            className="mt-2 text-white border border-white rounded-full px-4 py-2 text-sm hover:bg-white hover:text-orange-500 transition"
            onClick={handleEdit}
            disabled={isEditing}
          >
            Chỉnh sửa
          </button>
        </div>
        {/* Right: Info & Edit Form */}
        <div className="flex-1 p-12">
          <h3 className="text-xl font-semibold mb-6">Thông tin cá nhân</h3>
          {error && <div className="mb-4 text-red-500">{error}</div>}
          <form className="space-y-5" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="block text-gray-600 text-sm mb-1">Họ và tên</label>
              <input
                type="text"
                name="fullName"
                value={isEditing ? editProfile.fullName : profile.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100"
                placeholder="Nhập họ tên"
                title="Họ và tên"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={isEditing ? editProfile.email : profile.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100"
                  placeholder="Nhập email"
                  title="Email"
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={isEditing ? editProfile.phone : profile.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100"
                  placeholder="Nhập số điện thoại"
                  title="Số điện thoại"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-600 text-sm mb-1">CCCD/CMND</label>
                <input
                  type="text"
                  name="citizenId"
                  value={isEditing ? editProfile.citizenId : profile.citizenId}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100"
                  placeholder="Nhập số CCCD/CMND"
                  title="CCCD/CMND"
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Ngày sinh</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={isEditing ? editProfile.dateOfBirth?.slice(0, 10) : profile.dateOfBirth?.slice(0, 10)}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100"
                  placeholder="Chọn ngày sinh"
                  title="Ngày sinh"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Giới tính</label>
                <select
                  name="gender"
                  value={isEditing ? editProfile.gender : profile.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100"
                  title="Giới tính"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Vai trò</label>
                <input
                  type="text"
                  name="role"
                  value={profile.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                  disabled
                  className="w-full border rounded px-3 py-2 text-gray-700 bg-gray-100"
                  placeholder="Vai trò"
                  title="Vai trò"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">Địa chỉ</label>
              <input
                type="text"
                name="address"
                value={isEditing ? editProfile.address : profile.address}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100"
                placeholder="Nhập địa chỉ"
                title="Địa chỉ"
              />
            </div>
            {isEditing && (
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition"
                  onClick={handleSave}
                >
                  Lưu
                </button>
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition"
                  onClick={handleCancel}
                >
                  Hủy
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile; 