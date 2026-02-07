
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'outline' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
  title?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverEffect = false,
  interactive = false,
  className = '',
  onClick,
  title,
  icon,
  footer
}) => {
  const baseStyles = "relative rounded-2xl transition-all duration-500 border overflow-hidden outline-none";
  
  const variants = {
    default: "bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 shadow-sm",
    glass: "glass-panel border-white/50 dark:border-surface-700/50",
    outline: "bg-transparent border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700",
    gradient: "bg-gradient-to-br from-white to-surface-50 dark:from-surface-800 dark:to-surface-900 border-surface-200 dark:border-surface-700",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  const hoverStyles = hoverEffect 
    ? "hover:-translate-y-2 hover:shadow-vivid-hover group" 
    : "";

  const isInteractive = interactive || !!onClick;
  const interactiveStyles = isInteractive
    ? "cursor-pointer active:scale-[0.98] focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900" 
    : "";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isInteractive && onClick) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }
  };

  return (
    <div 
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverStyles}
        ${interactiveStyles}
        ${className}
      `}
      onClick={onClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {/* Glow Effect for Glass/Hover Cards */}
      {hoverEffect && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/10 rounded-full blur-3xl group-hover:bg-primary-400/20 transition-colors duration-500 pointer-events-none"></div>
      )}

      {/* Header */}
      {(title || icon) && (
        <div className="flex items-center gap-4 mb-4">
          {icon && (
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm
              ${variant === 'glass' 
                ? 'bg-white/80 text-primary-600 shadow-md backdrop-blur' 
                : 'bg-primary-50 text-primary-600 dark:bg-surface-700 dark:text-primary-400'
              }
              ${hoverEffect ? 'group-hover:scale-110 group-hover:rotate-3' : ''}
            `} aria-hidden="true">
              {icon}
            </div>
          )}
          {title && (
            <h3 className="text-xl font-bold text-surface-900 dark:text-surface-50">
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-6 pt-4 border-t border-surface-100 dark:border-surface-700/50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
