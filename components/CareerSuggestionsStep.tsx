
import React, { useEffect, useState } from 'react';
import { SelfAwarenessData, CareerSuggestion } from '../types';
import { getCareerSuggestions } from '../services/geminiService';
import Card from './UI/Card';
import Button from './UI/Button';
import { useToast } from '../contexts/ToastContext';

interface Props {
  userData: SelfAwarenessData;
  onSelect: (suggestion: string) => void;
  onBack: () => void;
}

const CareerSuggestionsStep: React.FC<Props> = ({ userData, onSelect, onBack }) => {
  const [suggestions, setSuggestions] = useState<CareerSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    // Check if we have cached suggestions in localStorage to avoid re-fetching on simple navigations
    const cached = localStorage.getItem('masar_career_suggestions');
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.length > 0) {
                setSuggestions(parsed);
                setLoading(false);
                return;
            }
        } catch (e) { /* ignore */ }
    }

    const fetchSuggestions = async () => {
      try {
        const results = await getCareerSuggestions(userData);
        if (isMounted) {
          if (results.length > 0) {
            setSuggestions(results);
            localStorage.setItem('masar_career_suggestions', JSON.stringify(results));
          } else {
             // Fallback if AI fails to return structured data
             setSuggestions([
               { title: userData.currentRole || 'مسار عام', matchPercentage: 80, reason: 'بناءً على خبرتك الحالية', difficulty: 'Low', trending: true }
             ]);
          }
        }
      } catch (error) {
        showToast('حدث خطأ أثناء تحليل المسارات المقترحة', 'error');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSuggestions();

    return () => { isMounted = false; };
  }, [userData, showToast]);

  const handleSelect = (title: string) => {
     window.scrollTo({ top: 0, behavior: 'smooth' });
     onSelect(title);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in text-center p-6">
        <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">جاري تحليل ملفك الشخصي...</h3>
        <p className="text-slate-500 dark:text-slate-400">نقوم الآن بمطابقة مهاراتك وشغفك مع أكثر من 500 مسار وظيفي.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full p-2 md:p-6 animate-fade-in pb-24">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">
          المسارات المهنية المقترحة
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          بناءً على تحليلك، هذه هي الوظائف الأكثر ملاءمة لك مع نسبة التطابق.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {suggestions.map((suggestion, idx) => (
          <Card 
            key={idx} 
            className="border-2 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-300 relative overflow-hidden group"
            padding="lg"
          >
             {/* Match Percentage Badge */}
             <div className="absolute top-4 left-4 z-10">
                <div className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full border-4 font-black text-sm md:text-base shadow-sm bg-white dark:bg-surface-800
                    ${suggestion.matchPercentage >= 85 ? 'border-green-500 text-green-600' : 
                      suggestion.matchPercentage >= 70 ? 'border-blue-500 text-blue-600' : 'border-amber-500 text-amber-600'}`}>
                    {suggestion.matchPercentage}%
                </div>
             </div>

             {suggestion.trending && (
                 <div className="absolute top-0 right-0 bg-gradient-to-l from-primary-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-md z-10">
                    🔥 مطلوب في السوق
                 </div>
             )}

             <div className="mt-2 mb-4 pr-2">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-primary-600 transition-colors">
                    {suggestion.title}
                </h3>
                <div className="flex gap-2 mb-3">
                   <span className={`text-xs px-2 py-1 rounded-md font-bold bg-slate-100 dark:bg-surface-700 text-slate-500 dark:text-slate-300`}>
                      صعوبة الدخول: {suggestion.difficulty === 'High' ? 'عالية' : suggestion.difficulty === 'Medium' ? 'متوسطة' : 'سهلة'}
                   </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                    {suggestion.reason}
                </p>
             </div>

             <Button 
                onClick={() => handleSelect(suggestion.title)} 
                fullWidth 
                variant={idx === 0 ? "gradient" : "secondary"}
                rightIcon={<svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
             >
                استكشاف هذا المسار
             </Button>
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-8 items-center bg-white/80 dark:bg-surface-900/80 backdrop-blur p-4 rounded-2xl border border-slate-200 dark:border-surface-700 shadow-sm sticky bottom-4 z-40">
        <Button onClick={onBack} variant="secondary">
           تعديل البيانات
        </Button>
        <p className="text-xs text-slate-400 hidden md:block">
           يمكنك دائماً البحث عن مسمى آخر في الخطوة القادمة
        </p>
      </div>
    </div>
  );
};

export default CareerSuggestionsStep;
