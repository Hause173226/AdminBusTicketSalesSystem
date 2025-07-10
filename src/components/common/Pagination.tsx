import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 15, 30, 50, 100],
}) => {
  return (
    <div className="flex items-center justify-end gap-4 w-full mt-4">
      <span className="text-sm text-gray-700 mr-2">
        Trang <b>{currentPage}</b> / <b>{totalPages}</b>
      </span>
      <button
        className="px-2 py-1 border rounded disabled:opacity-50 text-sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Trước
      </button>
      <button
        className="px-2 py-1 border rounded disabled:opacity-50 text-sm"
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Sau
      </button>
      <select
        className="ml-2 px-2 py-1 border rounded text-sm bg-white"
        value={pageSize}
        onChange={e => onPageSizeChange(Number(e.target.value))}
        aria-label="Chọn số lượng bản ghi mỗi trang"
        style={{ minWidth: 60 }}
      >
        {pageSizeOptions.map(size => (
          <option key={size} value={size}>{size} / trang</option>
        ))}
      </select>
    </div>
  );
};

export default Pagination; 