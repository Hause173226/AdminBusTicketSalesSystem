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
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40 transition-opacity z-40"
        onClick={onCancel}
      />
      {/* Modal */}
      <div
        className={`relative z-50 w-[320px] max-w-[90vw] bg-white border border-red-200 rounded-lg shadow-xl p-4 flex flex-col items-center animate-fade-in ${className}`}
        style={style}
      >
        <div className="text-center mb-4">{message}</div>
        <div className="flex gap-2 w-full">
          <button
            className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition"
            onClick={onConfirm}
          >
            Xác nhận
          </button>
          <button
            className="flex-1 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded text-sm font-medium transition"
            onClick={onCancel}
          >
            Huỷ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopover;
