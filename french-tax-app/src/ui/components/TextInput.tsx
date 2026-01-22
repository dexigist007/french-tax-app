
import React from 'react';
import type { InputHTMLAttributes } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={props.id} className="label mb-1">
        {label}
      </label>
      <input
        type="text"
        className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
