import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
  showLabel?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps, 
  className = '',
  showLabel = false
}) => {
  // حساب النسبة المئوية بناءً على الخطوات
  const percentage = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
          <span>التقدم</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div 
        className="w-full h-2 overflow-hidden relative bg-surface-100/50 dark:bg-surface-800 rounded-full"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div 
          className="h-full bg-gradient-to-r from-primary-400 via-primary-600 to-secondary-600 transition-all duration-700 ease-out relative overflow-hidden rounded-full"
          style={{ 
            width: `${percentage}%`,
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}
        >
          {/* تأثير اللمعان المتحرك */}
          <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;