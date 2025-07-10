import React, { useState, useRef, useEffect } from "react";

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder, disabled }) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        className="w-full border rounded px-2 py-1 focus:outline-none focus:ring"
        placeholder={placeholder || "Chọn..."}
        value={open ? search : selected?.label || ""}
        onChange={e => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        disabled={disabled}
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-10 bg-white border rounded w-full mt-1 max-h-48 overflow-auto shadow">
          {filtered.length === 0 && (
            <div className="px-2 py-1 text-gray-400">Không có kết quả</div>
          )}
          {filtered.map(opt => (
            <div
              key={opt.value}
              className={`px-2 py-1 cursor-pointer hover:bg-blue-100 ${opt.value === value ? "bg-blue-50 font-bold" : ""}`}
              onMouseDown={e => {
                e.preventDefault(); // tránh mất focus
                setOpen(false);
                setSearch("");
                onChange({ target: { value: opt.value } });
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect; 