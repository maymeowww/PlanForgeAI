import React from "react";

type InputTextProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
};

const InputText: React.FC<InputTextProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  className = "",
  id,
  name,
  type = "text",
  disabled = false,
  required = false,
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:opacity-50"
      />
    </div>
  );
};

export default InputText;
