
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ProgressIndicator from '../components/UI/ProgressIndicator';
import AccessibilityToolbar from '../components/UI/AccessibilityToolbar';
import ScrollToTop from '../components/UI/ScrollToTop';
import SettingsPanel from '../components/SettingsPanel';
import { Step } from '../types';

interface MainLayoutProps {
  children: React.ReactNode;
  view: 'wizard' | 'resources';
  step: Step;
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
  onViewChange: (view: 'wizard' | 'resources') => void;
  onOpenSettings: () => void;
}

const StickyHeader: React.FC<{
  view: 'wizard' | 'resources';
  step: Step;
  theme: string;
  onViewChange: (view: 'wizard' | 'resources') => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}> = ({ view, step, theme, onViewChange, onToggleTheme, onOpenSettings }) => (
  <header className={`backdrop-blur-xl border-b sticky top-0 z-50 print:hidden shadow-sm transition-all duration-300 ${theme === 'dark' ? 'bg-surface-900/70 border-surface-700' : 'bg-white/70 border-surface-200/60'}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      {/* Logo & Name */}
      <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onViewChange('wizard')}>
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        </div>
        <span className={`font-bold text-xl tracking-tight group-hover:text-primary-600 transition-colors duration-300 ${theme === 'dark' ? 'text-surface-50' : 'text-surface-900'}`}>مسار AI</span>
      </div>
      
      {/* Navigation & Actions */}
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-2">
        <div className="flex gap-1 sm:gap-2">
          <button onClick={() => onViewChange('wizard')} className={`font-medium text-xs sm:text-sm px-3 py-2 rounded-xl transition-all ${view === 'wizard' ? 'text-primary-700 bg-primary-100/50 border border-primary-200/50' : 'text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'}`}>🧭 الأداة</button>
          <button onClick={() => onViewChange('resources')} className={`font-medium text-xs sm:text-sm px-3 py-2 rounded-xl transition-all ${view === 'resources' ? 'text-primary-700 bg-primary-100/50 border border-primary-200/50' : 'text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'}`}>📚 المركز</button>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 border-r border-surface-200/30 pr-2 sm:pr-4 mr-1 sm:mr-2">
            <button onClick={onToggleTheme} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" aria-label="Toggle Theme">
                {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <button onClick={onOpenSettings} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500" aria-label="Open Settings">
                ⚙️
            </button>
        </div>
      </div>
    </div>
    {view === 'wizard' && step > Step.WELCOME && step < Step.RESULT && (
        <div className="absolute bottom-0 left-0 w-full"><ProgressIndicator currentStep={step} totalSteps={4} /></div>
    )}
  </header>
);

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, view, step, isSettingsOpen, onCloseSettings, onViewChange, onOpenSettings 
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen font-sans selection:bg-primary-100 selection:text-primary-900 overflow-x-hidden transition-colors duration-500 bg-transparent text-surface-900 dark:text-surface-50`}>
      {/* Background Layer */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-60 -left-40 w-96 h-96 bg-secondary-DEFAULT/10 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-accent-DEFAULT/10 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen" style={{animationDelay: '4s'}}></div>
      </div>

      <StickyHeader 
        view={view} 
        step={step} 
        theme={theme} 
        onViewChange={onViewChange} 
        onToggleTheme={toggleTheme} 
        onOpenSettings={onOpenSettings}
      />

      <main className="flex flex-col items-center pt-6 sm:pt-10 pb-16 px-4 sm:px-6 lg:px-8 print:pt-0 print:px-0 relative z-10 w-full min-h-[calc(100vh-64px)]">
        {children}
      </main>

      <AccessibilityToolbar />
      <ScrollToTop />
      <SettingsPanel isOpen={isSettingsOpen} onClose={onCloseSettings} />
    </div>
  );
};

export default MainLayout;
