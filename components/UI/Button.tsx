
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  'aria-label'?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  'aria-label': ariaLabel,
  ...props
}) => {
  
  const baseStyles = "relative inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 active:scale-[0.98] overflow-hidden outline-none";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 focus:ring-primary-200",
    gradient: "bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.02] border-0 focus:ring-primary-200",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md focus:ring-slate-200",
    outline: "bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-200",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-primary-600 shadow-none focus:ring-slate-200",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 focus:ring-red-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-8 py-3.5 text-base gap-2.5",
    xl: "px-10 py-4 text-lg gap-3",
  };

  const widthStyles = fullWidth ? "w-full" : "";

  // Derive aria-label if not provided and button contains only icons
  const derivedAriaLabel = ariaLabel || (typeof children === 'string' ? undefined : 'زر تفاعلي');

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${widthStyles}
        ${className}
      `}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-label={derivedAriaLabel}
      {...props}
    >
      {/* Shine Effect for Gradient Variant */}
      {variant === 'gradient' && !disabled && !isLoading && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0 pointer-events-none" />
      )}

      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-0 h-5 w-5 text-current opacity-80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="opacity-90 pr-2">جاري التحميل...</span>
        </>
      ) : (
        <>
          {rightIcon && <span className="z-10 shrink-0" aria-hidden="true">{rightIcon}</span>}
          <span className="z-10">{children}</span>
          {leftIcon && <span className="z-10 shrink-0" aria-hidden="true">{leftIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
