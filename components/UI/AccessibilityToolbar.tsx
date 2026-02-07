
import React, { useState, useEffect } from 'react';

const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [stopAnimations, setStopAnimations] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-large', 'text-huge', 'high-contrast', 'stop-animations');

    if (textSize === 'large') root.classList.add('text-large');
    if (textSize === 'huge') root.classList.add('text-huge');
    if (highContrast) root.classList.add('high-contrast');
    if (stopAnimations) root.classList.add('stop-animations');
  }, [textSize, highContrast, stopAnimations]);

  return (
    <div className="fixed left-4 bottom-4 z-50 print:hidden flex flex-col items-start gap-2">
      {isOpen && (
        <div className="bg-white dark:bg-surface-800 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-surface-700 w-64 animate-fade-in-up mb-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            أدوات الوصول
          </h3>
          
          <div className="space-y-4">
            {/* Text Size */}
            <div>
              <label className="text-xs text-slate-500 mb-2 block font-medium">حجم النص</label>
              <div className="flex bg-slate-100 dark:bg-surface-700 rounded-lg p-1">
                <button 
                  onClick={() => setTextSize('normal')} 
                  className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${textSize === 'normal' ? 'bg-white dark:bg-surface-600 shadow-sm text-primary-600' : 'text-slate-500'}`}
                >
                  عادي
                </button>
                <button 
                  onClick={() => setTextSize('large')} 
                  className={`flex-1 py-1 rounded text-sm font-bold transition-colors ${textSize === 'large' ? 'bg-white dark:bg-surface-600 shadow-sm text-primary-600' : 'text-slate-500'}`}
                >
                  كبير
                </button>
                <button 
                  onClick={() => setTextSize('huge')} 
                  className={`flex-1 py-1 rounded text-base font-bold transition-colors ${textSize === 'huge' ? 'bg-white dark:bg-surface-600 shadow-sm text-primary-600' : 'text-slate-500'}`}
                >
                  أكبر
                </button>
              </div>
            </div>

            {/* Contrast */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">تباين عالي</span>
              <button 
                onClick={() => setHighContrast(!highContrast)}
                className={`w-10 h-6 rounded-full transition-colors relative ${highContrast ? 'bg-primary-600' : 'bg-slate-300 dark:bg-surface-600'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${highContrast ? 'translate-x-4' : 'translate-x-0'}`}></span>
              </button>
            </div>

            {/* Animations */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">إيقاف الحركة</span>
              <button 
                onClick={() => setStopAnimations(!stopAnimations)}
                className={`w-10 h-6 rounded-full transition-colors relative ${stopAnimations ? 'bg-primary-600' : 'bg-slate-300 dark:bg-surface-600'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${stopAnimations ? 'translate-x-4' : 'translate-x-0'}`}></span>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white dark:bg-surface-800 text-primary-600 rounded-full shadow-lg border border-slate-200 dark:border-surface-700 flex items-center justify-center hover:scale-110 transition-transform focus:ring-4 focus:ring-primary-200"
        title="أدوات الوصول السريع"
        aria-label="فتح قائمة أدوات الوصول"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>
    </div>
  );
};

export default AccessibilityToolbar;
