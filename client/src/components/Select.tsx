import React from "react";

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select({
  label,
  options,
  error,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      <label className="block mb-2 text-gray-900">
        {label}
      </label>
      <select
        className={`w-full px-4 py-4 border-2 rounded-xl bg-white transition-colors appearance-none
          ${error ? "border-error" : "border-gray-300 focus:border-primary"}
          focus:outline-none focus:ring-2 focus:ring-primary/20
          ${className}`}
        {...props}
      >
        <option value="">Pilih...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-error">{error}</p>}
    </div>
  );
}