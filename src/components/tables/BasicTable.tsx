import React from "react";

type Column = {
  key: string;
  label: string;
  render?: (value: any, row: Record<string, any>, rowIndex: number) => React.ReactNode;
};

type BasicTableProps = {
  columns: Column[];
  data: Record<string, any>[];
  rowKey?: string;
};

const BasicTable: React.FC<BasicTableProps> = ({ columns, data, rowKey = "id" }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row, rowIndex) => (
          <tr key={row[rowKey] || rowIndex} className="hover:bg-gray-50">
            {columns.map((col, colIdx) => (
              <td
                key={col.key}
                className={
                  `px-6 py-4 whitespace-nowrap text-sm ` +
                  (colIdx === 0
                    ? "font-medium text-gray-900"
                    : "text-gray-500")
                }
              >
                {col.render
                  ? col.render(row[col.key], row, rowIndex)
                  : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default BasicTable; 