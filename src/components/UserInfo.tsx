import React from "react";
import { Users } from "lucide-react";

type UserInfoProps = {
  user: { name: string; email: string } | null;
};

const UserInfo: React.FC<UserInfoProps> = ({ user }) => (
  <div className="p-4 border-t border-gray-200">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
        <Users className="w-4 h-4 text-gray-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{user ? user.name : "Admin User"}</p>
        <p className="text-xs text-gray-500">{user ? user.email : "admin@bussystem.com"}</p>
      </div>
    </div>
  </div>
);

export default UserInfo; 