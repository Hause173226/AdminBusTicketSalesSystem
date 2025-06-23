import React from "react";

interface Field {
  label: string;
  value: any;
  type?: string; // text, select, date, etc.
  options?: { label: string; value: any }[]; // cho select
  placeholder?: string;
  icon?: React.ReactNode;
  colSpan?: number; // 2 nếu muốn chiếm full row
}

interface BasicModalProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  rows: Field[][];
  onClose: () => void;
  open: boolean;
  readonly?: boolean;
  onSubmit?: () => void;
  submitLabel?: string;
}

const BasicModal: React.FC<BasicModalProps> = ({
  title,
  subtitle,
  icon,
  rows,
  onClose,
  open,
  readonly = true,
  onSubmit,
  submitLabel = "Lưu",
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl min-w-[340px] max-w-3xl w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center mb-2">
          {icon && <div className="mr-3 text-3xl">{icon}</div>}
          <div>
            <h2 className="text-2xl font-bold leading-tight">{title}</h2>
            {subtitle && <div className="text-gray-500 text-sm mt-1">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-700 text-2xl font-bold">×</button>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (onSubmit) onSubmit();
          }}
        >
          {/* Fields grid by rows */}
          <div className="flex flex-col gap-4 mb-8 mt-6">
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                {row.map((field, idx) => (
                  <div
                    key={idx}
                    className={
                      field.colSpan === 2
                        ? "md:col-span-2 col-span-1"
                        : "col-span-1"
                    }
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <div className="relative">
                      {field.type === "select" && field.options ? (
                        <select
                          className="w-full border rounded px-3 py-2 bg-gray-100"
                          value={field.value}
                          disabled={readonly}
                          title={field.label}
                        >
                          <option value="" disabled hidden>
                            {field.placeholder || `Chọn ${field.label.toLowerCase()}`}
                          </option>
                          {field.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : field.type === "date" ? (
                        <>
                          <input
                            type="date"
                            className="w-full border rounded px-3 py-2 bg-gray-100 pr-10"
                            value={field.value}
                            disabled={readonly}
                            placeholder={field.placeholder || field.label}
                            title={field.label}
                          />
                          {field.icon && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                              {field.icon}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <input
                            type={field.type || "text"}
                            className="w-full border rounded px-3 py-2 bg-gray-100 pr-10"
                            value={field.value}
                            disabled={readonly}
                            placeholder={field.placeholder || field.label}
                            title={field.label}
                          />
                          {field.icon && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                              {field.icon}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Đóng
            </button>
            {!readonly && onSubmit && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {submitLabel}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BasicModal;
