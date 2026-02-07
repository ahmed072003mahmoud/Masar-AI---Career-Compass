import React from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onRemove }) => {
  const icons = {
    success: (
      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const bgStyles = {
    success: 'bg-white border-green-100 shadow-green-100/50',
    error: 'bg-white border-red-100 shadow-red-100/50',
    warning: 'bg-white border-amber-100 shadow-amber-100/50',
    info: 'bg-white border-blue-100 shadow-blue-100/50',
  };

  return (
    <div 
      className={`
        pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300 transform translate-y-0 opacity-100 mb-3
        ${bgStyles[type]} dark:bg-surface-800 dark:border-surface-700
        animate-fade-in-up flex items-start p-4
      `}
      role="alert"
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="mr-3 w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{message}</p>
      </div>
      <div className="mr-4 flex flex-shrink-0">
        <button
          type="button"
          className="inline-flex rounded-md bg-transparent text-surface-400 hover:text-surface-500 focus:outline-none"
          onClick={() => onRemove(id)}
        >
          <span className="sr-only">إغلاق</span>
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: { id: string; message: string; type: ToastType }[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center p-4 pointer-events-none sm:items-end">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default ToastContainer;