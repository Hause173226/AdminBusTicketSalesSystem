import React from "react";
import BasicTable from "../tables/BasicTable";

const busList = [
  { id: "BUS-001", name: "Xe 45 chỗ", license: "29A-12345", status: "Hoạt động" },
  { id: "BUS-002", name: "Xe 29 chỗ", license: "30B-67890", status: "Bảo trì" },
  { id: "BUS-003", name: "Xe 16 chỗ", license: "31C-11122", status: "Hoạt động" },
];

const statusColor: Record<string, string> = {
  "Hoạt động": "bg-green-100 text-green-800",
  "Bảo trì": "bg-yellow-100 text-yellow-800",
};

const columns = [
  { key: "id", label: "Mã xe" },
  { key: "name", label: "Tên xe" },
  { key: "license", label: "Biển số" },
  {
    key: "status",
    label: "Trạng thái",
    render: (value: string) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[value] || "bg-gray-100 text-gray-800"}`}>
        {value}
      </span>
    ),
  },
];

const ManagerBus = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Danh sách xe bus</h3>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
        Thêm xe mới
      </button>
    </div>
    <BasicTable columns={columns} data={busList} rowKey="id" />
  </div>
);

export default ManagerBus;
