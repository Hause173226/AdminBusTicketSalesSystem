import { Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { MapPin } from "lucide-react";
import { Station } from "../type";

interface StationSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Station[];
  placeholder?: string;
}

export default function StationSelect({ label, value, onChange, options, placeholder }: StationSelectProps) {
  const selectedStation = options.find((s) => s._id === value);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {selectedStation ? (
              <span>
                <MapPin className="inline mr-1" size={16} />
                {selectedStation.name} ({selectedStation.address.city})
              </span>
            ) : (
              <span className="text-gray-400">{placeholder || "Chọn bến xe"}</span>
            )}
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none">
            {options.map((station) => (
              <Listbox.Option
                key={station._id}
                value={station._id}
                as={Fragment}
              >
                {({ active, selected }) => (
                  <li
                    className={`cursor-pointer select-none py-2 pl-4 pr-4 ${
                      active ? "bg-blue-100" : ""
                    } ${selected ? "font-bold text-blue-600" : ""}`}
                  >
                    {station.name} ({station.address.city})
                  </li>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
} 