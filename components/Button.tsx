import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg tracking-wide";
  
  const variants = {
    // Fresh Teal - High contrast text
    primary: "bg-teal-500 text-zinc-950 hover:bg-teal-400 focus:ring-teal-500 shadow-lg shadow-teal-900/20 border border-transparent",
    // Zinc secondary
    secondary: "bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 focus:ring-zinc-500",
    // Outline
    outline: "bg-transparent text-zinc-300 border border-zinc-700 hover:bg-zinc-800 hover:text-white hover:border-zinc-500 focus:ring-zinc-500",
    // Danger
    danger: "bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20 focus:ring-red-500",
    // Ghost
    ghost: "bg-transparent text-zinc-400 border-transparent hover:bg-zinc-800 hover:text-zinc-200"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-5 text-sm",
    lg: "h-12 px-8 text-base",
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};