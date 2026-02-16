
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, SelfAwarenessData, MarketData, Step, MarketAnalysisResult } from '../types';
import { useToast } from '../contexts/ToastContext';

// Default Data
const initialUserData: SelfAwarenessData = {
  name: '', ageGroup: '', gender: '', location: '', educationLevel: '', major: '', currentRole: '', experienceYears: '',
  skills: '', languages: '', workValues: [], workEnvironment: '', personalityType: '', interests: '',
  financialGoal: '', timeline: '', constraints: '', strengths: '', weaknesses: '', riskTolerance: 'medium',
  autonomyLevel: 'collaborative', communicationStyle: '', problemSolvingApproach: '', careerAspirations: ''
};

const initialMarketData: MarketData = {
  field: '', location: '', targetCompanies: '', industryFocus: '', companySize: '', keywords: '', specificSkills: ''
};

const STORAGE_KEY = 'masar_app_state_v3';

export const useAppEngine = () => {
  const [step, setStep] = useState<Step>(Step.WELCOME);
  const [view, setView] = useState<'wizard' | 'resources'>('wizard');
  const [userData, setUserData] = useState<SelfAwarenessData>(initialUserData);
  const [marketData, setMarketData] = useState<MarketData>(initialMarketData);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysisResult | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  
  // UI State
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isExiting, setIsExiting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { showToast } = useToast();
  const isFirstRender = useRef(true);
  const [isRestored, setIsRestored] = useState(false);

  // Load State
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed: AppState = JSON.parse(savedState);
        setUserData(prev => ({ ...prev, ...parsed.userData }));
        setMarketData(prev => ({ ...prev, ...parsed.marketData }));
        if (parsed.marketAnalysis) setMarketAnalysis(parsed.marketAnalysis);
        setGeneratedPlan(parsed.generatedPlan);
        
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

  // Save State (Debounced)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (isRestored) {
      const timeoutId = setTimeout(() => {
        const stateToSave: AppState = { step, view, userData, marketData, generatedPlan, marketAnalysis };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [step, view, userData, marketData, generatedPlan, marketAnalysis, isRestored]);

  // Navigation Logic
  const transition = useCallback((newStep: Step, dir: 'forward' | 'backward') => {
    if (isExiting) return;
    setDirection(dir);
    setIsExiting(true);
    setTimeout(() => {
      setStep(newStep);
      setIsExiting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  }, [isExiting]);

  const nextStep = useCallback(() => transition(step + 1, 'forward'), [step, transition]);
  const prevStep = useCallback(() => transition(step - 1, 'backward'), [step, transition]);

  // Handlers
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
        }, 400);
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
    }, 400);
  }, [isExiting]);

  const changeView = useCallback((newView: 'wizard' | 'resources') => {
    if (newView === view) return;
    setIsExiting(true);
    setTimeout(() => {
      setView(newView);
      setIsExiting(false);
    }, 400);
  }, [view]);

  return {
    state: { step, view, userData, marketData, marketAnalysis, generatedPlan, direction, isExiting, isSettingsOpen },
    actions: { 
        nextStep, prevStep, changeView, setIsSettingsOpen, 
        handleSelfAwarenessSubmit, handleSuggestionSelect, handleMarketSubmit, handleRestart, handleLoadSavedLegacy 
    }
  };
};
