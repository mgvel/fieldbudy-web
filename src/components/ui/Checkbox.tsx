import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export function Checkbox({ 
  label, 
  description, 
  error, 
  className = '',
  ...props 
}: CheckboxProps) {
  const id = props.id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={id}
          type="checkbox"
          className={`
            h-4 w-4 rounded border-gray-300 text-blue-600 
            focus:ring-blue-500 focus:ring-offset-0
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label 
              htmlFor={id} 
              className={`font-medium ${error ? 'text-red-500' : 'text-gray-700'}`}
            >
              {label}
            </label>
          )}
          
          {description && (
            <p className="text-gray-500">{description}</p>
          )}
          
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}