import React from "react";

interface ConfirmPopoverProps {
  open: boolean;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const ConfirmPopover: React.FC<ConfirmPopoverProps> = ({
  open,
  message,
  onConfirm,
  onCancel,
  className = "",
  style = {},
}) => {
  if (!open) return null;
  return (
    <div
      className={`absolute z-30 top-8 right-0 w-[180px] max-w-[90vw] bg-white border border-red-200 rounded-lg shadow-xl p-2 flex flex-col items-center animate-fade-in ${className}`}
      style={style}
    >
      <div className="absolute -top-2 right-4 w-0 h-0 border-l-6 border-r-6 border-b-6 border-l-transparent border-r-transparent border-b-red-200"></div>
      <div className="text-center mb-2">{message}</div>
      <div className="flex gap-1 w-full">
        <button
          className="flex-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition"
          onClick={onConfirm}
        >
          Xác nhận
        </button>
        <button
          className="flex-1 px-2 py-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded text-xs font-medium transition"
          onClick={onCancel}
        >
          Huỷ
        </button>
      </div>
    </div>
  );
};

export default ConfirmPopover;
