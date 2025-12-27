import React from "react";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      <label className="block mb-2 text-gray-900">
        {label}
      </label>
      <input
        className={`w-full px-4 py-4 border-2 rounded-xl bg-white transition-colors
          ${error ? "border-error" : "border-gray-300 focus:border-primary"}
          focus:outline-none focus:ring-2 focus:ring-primary/20
          ${className}`}
        {...props}
      />
      {error && <p className="mt-2 text-error">{error}</p>}
    </div>
  );
}