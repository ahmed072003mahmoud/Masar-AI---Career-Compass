
import React, { Suspense, useEffect } from 'react';
import { Step } from './types';
import ResourcesSection from './components/ResourcesSection';
import { ToastProvider } from './contexts/ToastContext';
import { useAppEngine } from './hooks/useAppEngine';
import MainLayout from './layouts/MainLayout';

// --- LAZY LOADING ---
const WelcomeStep = React.lazy(() => import('./components/WelcomeStep'));
const SelfAwarenessStep = React.lazy(() => import('./components/SelfAwarenessStep'));
const CareerSuggestionsStep = React.lazy(() => import('./components/CareerSuggestionsStep'));
const MarketResearchStep = React.lazy(() => import('./components/MarketResearchStep'));
const PlanDisplayStep = React.lazy(() => import('./components/PlanDisplayStep'));

declare const AOS: any;

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full animate-fade-in">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse text-lg">جاري التحميل...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { state, actions } = useAppEngine();
  const { step, view, userData, marketData, marketAnalysis, generatedPlan, direction, isExiting, isSettingsOpen } = state;

  // AOS Refresh
  useEffect(() => {
    if (typeof AOS !== 'undefined') {
      setTimeout(() => AOS.refresh(), 500);
    }
  }, [step, view]);

  const getStepAnimation = () => {
    if (isExiting) {
      return direction === 'forward' ? 'animate-slide-out-right' : 'animate-slide-out-left';
    }
    return direction === 'forward' ? 'animate-slide-in-left' : 'animate-slide-in-right';
  };
  
  return (
    <MainLayout
      view={view}
      step={step}
      isSettingsOpen={isSettingsOpen}
      onCloseSettings={() => actions.setIsSettingsOpen(false)}
      onOpenSettings={() => actions.setIsSettingsOpen(true)}
      onViewChange={actions.changeView}
    >
        {view === 'resources' ? (
          <div className={`w-full max-w-7xl ${isExiting ? 'animate-slide-out-left' : 'animate-slide-in-right'}`}>
            <ResourcesSection />
          </div>
        ) : (
          <div 
            className={`w-full ${step === Step.PLANNING ? 'max-w-4xl lg:max-w-5xl' : 'max-w-4xl'} ${getStepAnimation()}`} 
            key={step}
          >
            <Suspense fallback={<LoadingFallback />}>
              {step === Step.WELCOME && <WelcomeStep onNext={actions.nextStep} onLoadSaved={actions.handleLoadSavedLegacy} />}
              {step === Step.SELF_AWARENESS && <SelfAwarenessStep initialData={userData} onNext={actions.handleSelfAwarenessSubmit} onBack={actions.prevStep} />}
              {step === Step.SUGGESTIONS && <CareerSuggestionsStep userData={userData} onSelect={actions.handleSuggestionSelect} onBack={actions.prevStep} />}
              {step === Step.MARKET_RESEARCH && <MarketResearchStep initialData={marketData} initialAnalysis={marketAnalysis} onNext={actions.handleMarketSubmit} onBack={actions.prevStep} />}
              {step === Step.PLANNING && <PlanDisplayStep userData={userData} marketData={marketData} marketAnalysis={marketAnalysis} initialPlan={generatedPlan} onRestart={actions.handleRestart} />}
            </Suspense>
          </div>
        )}
    </MainLayout>
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
