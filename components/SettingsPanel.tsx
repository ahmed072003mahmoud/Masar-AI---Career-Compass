import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع البيانات المحفوظة؟\nسيتم إعادة تحميل الصفحة وفقدان أي تقدم غير محفوظ.')) {
      localStorage.removeItem('masar_saved_plan');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div className={`relative w-80 h-full shadow-2xl p-6 animate-slide-in-left overflow-y-auto border-l transition-colors duration-300
        ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>الإعدادات</h2>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-8">
          {/* Theme Section */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">المظهر</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
              >
                <div className="w-6 h-6 rounded-full bg-white border shadow-sm"></div>
                <span className="text-xs font-bold text-slate-600">فاتح</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary-500 bg-slate-700' : 'border-slate-200 hover:border-slate-300 bg-slate-800'}`}
              >
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 shadow-sm"></div>
                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-600'}`}>داكن</span>
              </button>
              <button
                onClick={() => setTheme('blue')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'blue' ? 'border-primary-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-blue-50'}`}
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 shadow-sm"></div>
                <span className="text-xs font-bold text-slate-600">أزرق</span>
              </button>
            </div>
          </section>

          {/* Data Section */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">البيانات</h3>
            <button
              onClick={handleReset}
              className="w-full py-3 px-4 flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-bold text-sm border border-red-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              حذف البيانات المحفوظة
            </button>
          </section>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
             <p className="text-xs text-center text-slate-400">
               Masar AI v2.5
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;