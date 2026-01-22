
import React from 'react';
import type { InputHTMLAttributes } from 'react';

interface NumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  currency?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({ label, error, currency = '€', className = '', ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={props.id} className="label mb-1">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <input
          type="number"
          step="0.01"
          className={`input-field pr-8 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-gray-500 sm:text-sm">{currency}</span>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
