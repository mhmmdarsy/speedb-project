import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'large' | 'medium';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'large',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark shadow-lg',
    danger: 'bg-error text-white hover:bg-red-600 shadow-lg',
    outline:
      'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white',
  };

  const sizeStyles = {
    large: 'px-8 py-4 min-h-[60px]',
    medium: 'px-6 py-3 min-h-[48px]',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
