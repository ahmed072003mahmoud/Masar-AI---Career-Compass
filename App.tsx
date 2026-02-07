
import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { AppState, SelfAwarenessData, MarketData, Step, MarketAnalysisResult } from './types';
import ResourcesSection from './components/ResourcesSection';
import SettingsPanel from './components/SettingsPanel';
import { useTheme } from './contexts/ThemeContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import ProgressIndicator from './components/UI/ProgressIndicator';
import AccessibilityToolbar from './components/UI/AccessibilityToolbar';
import ScrollToTop from './components/UI/ScrollToTop';

// --- PERFORMANCE STRATEGY: LAZY LOADING ---
const WelcomeStep = React.lazy(() => import('./components/WelcomeStep'));
const SelfAwarenessStep = React.lazy(() => import('./components/SelfAwarenessStep'));
const CareerSuggestionsStep = React.lazy(() => import('./components/CareerSuggestionsStep'));
const MarketResearchStep = React.lazy(() => import('./components/MarketResearchStep'));
const PlanDisplayStep = React.lazy(() => import('./components/PlanDisplayStep'));

declare const AOS: any;

// Initial empty state
const initialUserData: SelfAwarenessData = {
  name: '',
  ageGroup: '',
  gender: '',
  location: '',
  educationLevel: '',
  major: '',
  currentRole: '',
  experienceYears: '',
  skills: '',
  languages: '',
  workValues: [],
  workEnvironment: '',
  personalityType: '',
  interests: '',
  financialGoal: '',
  timeline: '',
  constraints: '',
  strengths: '',
  weaknesses: '',
  riskTolerance: 'medium',
  autonomyLevel: 'collaborative',
  communicationStyle: '',
  problemSolvingApproach: '',
  careerAspirations: ''
};

const initialMarketData: MarketData = {
  field: '',
  location: '',
  targetCompanies: '',
  industryFocus: '',
  companySize: '',
  keywords: '',
  specificSkills: ''
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full animate-fade-in">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse text-lg">جاري التحميل...</p>
    </div>
  </div>
);

// Updated storage key to v3 to avoid conflicts with new data structures
const STORAGE_KEY = 'masar_app_state_v3';

// --- STICKY HEADER COMPONENT ---
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

const AppContent: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.WELCOME);
  const [view, setView] = useState<'wizard' | 'resources'>('wizard');
  const [userData, setUserData] = useState<SelfAwarenessData>(initialUserData);
  const [marketData, setMarketData] = useState<MarketData>(initialMarketData);
  
  // Updated type: now accepts MarketAnalysisResult object or null
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysisResult | null>(null);
  
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isExiting, setIsExiting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const isFirstRender = useRef(true);

  // --- STATE PERSISTENCE LOGIC ---
  
  // Load State on Mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed: AppState = JSON.parse(savedState);
        setUserData(prev => ({ ...prev, ...parsed.userData }));
        setMarketData(prev => ({ ...prev, ...parsed.marketData }));
        
        // Ensure marketAnalysis is restored correctly if it exists
        if (parsed.marketAnalysis) {
          setMarketAnalysis(parsed.marketAnalysis);
        }
        
        setGeneratedPlan(parsed.generatedPlan);
        
        // Don't jump to later steps if data is empty to avoid confusion
        if (parsed.step > Step.WELCOME) {
           setStep(parsed.step);
           showToast('تم استعادة تقدمك السابق بنجاح 👋', 'info');
        }
      } catch (e) {
        console.error("Failed to restore state", e);
      }
    }
    setIsRestored(true);
  }, [showToast]);

  // Save State on Change - OPTIMIZED WITH DEBOUNCE
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Only save if we have restored
    if (isRestored) {
      // Debounce the save operation by 1 second to avoid main-thread blocking during typing
      const timeoutId = setTimeout(() => {
        const stateToSave: AppState = {
          step,
          view,
          userData,
          marketData,
          generatedPlan,
          marketAnalysis
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [step, view, userData, marketData, generatedPlan, marketAnalysis, isRestored]);

  // --- AOS & Scroll ---
  useEffect(() => {
    if (typeof AOS !== 'undefined') {
      setTimeout(() => AOS.refresh(), 500);
    }
  }, [step, view]);

  useEffect(() => {
    if (!isExiting) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, isExiting]);

  const transitionDuration = 400;

  // --- NAVIGATION (Memoized) ---
  const nextStep = useCallback(() => {
    if (isExiting) return;
    setDirection('forward');
    setIsExiting(true);
    setTimeout(() => {
      setStep((prev) => prev + 1);
      setIsExiting(false);
    }, transitionDuration);
  }, [isExiting]);
  
  const prevStep = useCallback(() => {
    if (isExiting) return;
    setDirection('backward');
    setIsExiting(true);
    setTimeout(() => {
      setStep((prev) => prev - 1);
      setIsExiting(false);
    }, transitionDuration);
  }, [isExiting]);

  const handleSelfAwarenessSubmit = useCallback((data: SelfAwarenessData) => {
    setUserData(data);
    nextStep();
  }, [nextStep]);

  const handleSuggestionSelect = useCallback((title: string) => {
    setMarketData(prev => ({ ...prev, field: title }));
    nextStep();
  }, [nextStep]);

  const handleMarketSubmit = useCallback((data: MarketData, analysis: MarketAnalysisResult) => {
    setMarketData(data);
    setMarketAnalysis(analysis);
    nextStep();
  }, [nextStep]);

  const handleRestart = useCallback(() => {
    if (window.confirm("هل أنت متأكد من البدء من جديد؟ سيتم مسح التقدم الحالي.")) {
        if (isExiting) return;
        setDirection('backward');
        setIsExiting(true);
        setTimeout(() => {
            setStep(Step.WELCOME);
            setUserData(initialUserData);
            setMarketData(initialMarketData);
            setMarketAnalysis(null);
            setGeneratedPlan(null);
            setView('wizard');
            
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem('masar_career_suggestions'); 
            setIsExiting(false);
        }, transitionDuration);
    }
  }, [isExiting]);

  const handleLoadSavedLegacy = useCallback((data: any) => {
    if (isExiting) return;
    setDirection('forward');
    setIsExiting(true);
    setTimeout(() => {
        if (data.userData) setUserData(prev => ({...prev, ...data.userData}));
        if (data.marketData) setMarketData(data.marketData);
        if (data.marketAnalysis) setMarketAnalysis(data.marketAnalysis);
        
        if (data.plan) {
          setGeneratedPlan(data.plan);
          setStep(Step.PLANNING);
        } else {
          setStep(Step.SELF_AWARENESS);
        }
        setIsExiting(false);
    }, transitionDuration);
  }, [isExiting]);

  const handleViewChange = useCallback((newView: 'wizard' | 'resources') => {
    if (newView === view) return;
    setIsExiting(true);
    setTimeout(() => {
      setView(newView);
      setIsExiting(false);
    }, transitionDuration);
  }, [view]);

  // Determine animation classes based on RTL direction
  // In RTL, "Next" (Forward) should generally enter from the left and exit to the right
  const getStepAnimation = () => {
    if (isExiting) {
      return direction === 'forward' ? 'animate-slide-out-right' : 'animate-slide-out-left';
    }
    return direction === 'forward' ? 'animate-slide-in-left' : 'animate-slide-in-right';
  };
  
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
        onViewChange={handleViewChange} 
        onToggleTheme={toggleTheme} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex flex-col items-center pt-6 sm:pt-10 pb-16 px-4 sm:px-6 lg:px-8 print:pt-0 print:px-0 relative z-10 w-full min-h-[calc(100vh-64px)]">
        {view === 'resources' ? (
          <div className={`w-full max-w-7xl ${isExiting ? 'animate-slide-out-left' : 'animate-slide-in-right'}`}><ResourcesSection /></div>
        ) : (
          <div 
            className={`w-full ${step === Step.PLANNING ? 'max-w-4xl lg:max-w-5xl' : 'max-w-4xl'} ${getStepAnimation()}`} 
            key={step}
          >
            <Suspense fallback={<LoadingFallback />}>
              {step === Step.WELCOME && <WelcomeStep onNext={nextStep} onLoadSaved={handleLoadSavedLegacy} />}
              {step === Step.SELF_AWARENESS && <SelfAwarenessStep initialData={userData} onNext={handleSelfAwarenessSubmit} onBack={prevStep} />}
              {step === Step.SUGGESTIONS && <CareerSuggestionsStep userData={userData} onSelect={handleSuggestionSelect} onBack={prevStep} />}
              {step === Step.MARKET_RESEARCH && <MarketResearchStep initialData={marketData} initialAnalysis={marketAnalysis} onNext={handleMarketSubmit} onBack={prevStep} />}
              {step === Step.PLANNING && <PlanDisplayStep userData={userData} marketData={marketData} marketAnalysis={marketAnalysis} initialPlan={generatedPlan} onRestart={handleRestart} />}
            </Suspense>
          </div>
        )}
      </main>

      <AccessibilityToolbar />
      <ScrollToTop />
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
