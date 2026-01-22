
import React from 'react';
import type { SelectHTMLAttributes } from 'react';

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({ label, options, error, className = '', ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={props.id} className="label mb-1">
        {label}
      </label>
      <select
        className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      >
        <option value="">Sélectionner...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
