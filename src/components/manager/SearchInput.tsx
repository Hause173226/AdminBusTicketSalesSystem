import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder,
  onDebouncedChange,
  debounceMs = 3000,
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (!onDebouncedChange) return;
    const handler = setTimeout(() => {
      onDebouncedChange(internalValue);
    }, debounceMs);
    return () => clearTimeout(handler);
  }, [internalValue, onDebouncedChange, debounceMs]);

  return (
    <div
      className="flex items-center border-2 border-blue-500 rounded-lg px-2 py-1 bg-white shadow focus-within:ring-2 focus-within:ring-blue-400"
      style={{ maxWidth: 440 }}
    >
      <Search className="text-blue-500 mr-2" size={18} />
      <input
        type="text"
        value={internalValue}
        onChange={e => {
          setInternalValue(e.target.value);
          onChange(e);
        }}
        placeholder={placeholder}
        className="flex-1 outline-none bg-transparent text-sm"
      />
    </div>
  );
};

export default SearchInput; 