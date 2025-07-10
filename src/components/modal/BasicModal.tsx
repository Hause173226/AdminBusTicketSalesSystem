import React from "react";
import SearchableSelect from "../common/SearchableSelect";

interface Field {
  label: string;
  value: any;
  type?: string; // text, select, date, etc.
  options?: { label: string; value: any }[]; 
  placeholder?: string;
  icon?: React.ReactNode;
  colSpan?: number; 
  onChange?: (e: React.ChangeEvent<any>) => void;
  readOnly?: boolean;
  error?: string; 
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
  updatedAt?: string;
  children?: React.ReactNode;
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
  updatedAt,
  children,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl min-w-[340px] max-w-3xl w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center mb-2">
          {icon && <div className="mr-3 text-3xl">{icon}</div>}
          <div>
            <h2 className="text-2xl font-bold leading-tight text-blue-700 drop-shadow-md border-b-2 border-blue-200 pb-1">
              {title}
            </h2>
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
                      {field.type === "searchable-select" && field.options ? (
                        <SearchableSelect
                          options={field.options}
                          value={field.value}
                          onChange={field.onChange as any}
                          placeholder={field.placeholder || `Chọn ${field.label.toLowerCase()}`}
                          disabled={readonly}
                        />
                      ) : field.type === "select" && field.options ? (
                        <select
                          className="w-full border rounded px-3 py-2 bg-gray-100"
                          value={field.value}
                          disabled={readonly}
                          title={field.label}
                          onChange={field.onChange}
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
                            onChange={field.onChange}
                            readOnly={field.readOnly}
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
                            onChange={field.onChange}
                            readOnly={field.readOnly}
                          />
                          {field.icon && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                              {field.icon}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {field.error && (
                      <div className="text-xs text-red-600 mt-1">{field.error}</div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* Custom children content */}
          {children && <div className="mb-6">{children}</div>}
          <div className="flex items-center justify-between gap-2">
            {updatedAt ? (
              <div className="text-xs text-gray-500">
                {`Cập nhật lần cuối: ${new Date(updatedAt).toLocaleString('vi-VN')}`}
              </div>
            ) : <div />}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded hover:bg-red-200 transition-colors shadow"
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default BasicModal;
