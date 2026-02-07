
import React from 'react';
import Card from './UI/Card';
import Button from './UI/Button';
import { useToast } from '../contexts/ToastContext';

interface Props {
  onNext: () => void;
  onLoadSaved?: (data: any) => void;
}

const WelcomeStep: React.FC<Props> = ({ onNext, onLoadSaved }) => {
  const { showToast } = useToast();

  const handleLoad = () => {
    const saved = localStorage.getItem('masar_saved_plan');
    if (saved && onLoadSaved) {
      try {
        const parsed = JSON.parse(saved);
        onLoadSaved(parsed);
        showToast('تم تحميل الخطة بنجاح!', 'success');
      } catch (e) {
        showToast('حدث خطأ أثناء تحميل الخطة المحفوظة.', 'error');
      }
    } else {
      showToast('لا توجد خطة محفوظة مسبقاً.', 'info');
    }
  };

  const FeatureIcon = ({ type, color }: { type: 'brain' | 'globe' | 'rocket', color: string }) => {
    const icons = {
      brain: (
        <svg className={`w-6 h-6 md:w-8 md:h-8 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" className="fill-current opacity-20" />
            <path d="M12 16V12M12 8H12.01M20.39 16.39L17.5 13.5" />
            <path d="M9.5 9.5C9.5 9.5 10 7 12 7C14 7 14.5 9.5 14.5 9.5" />
        </svg>
      ),
      globe: (
        <svg className={`w-6 h-6 md:w-8 md:h-8 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" className="fill-current opacity-20" />
            <path d="M2 12H22" />
            <path d="M12 2C14.5 2 16 6.5 16 12C16 17.5 14.5 22 12 22C9.5 22 8 17.5 8 12C8 6.5 9.5 2 12 2Z" />
        </svg>
      ),
      rocket: (
        <svg className={`w-6 h-6 md:w-8 md:h-8 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 22H22L12 2Z" className="fill-current opacity-20" />
            <path d="M12 16V20M8 12L12 2M16 12L12 2" />
        </svg>
      )
    };
    return icons[type];
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 md:space-y-12 animate-fade-in relative z-10 w-full py-4 md:py-8 min-h-[70vh]">
      
      {/* Decorative Background Elements specific to WelcomeStep */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 flex items-center justify-center select-none">
        <div className="w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] border border-slate-200/40 dark:border-slate-700/20 rounded-full animate-[spin_60s_linear_infinite] opacity-40"></div>
        <div className="absolute w-[60vw] h-[60vw] md:w-[450px] md:h-[450px] border border-slate-200/40 dark:border-slate-700/20 rounded-full animate-[spin_40s_linear_infinite_reverse] opacity-40 border-dashed"></div>
        <div className="absolute w-[40vw] h-[40vw] md:w-[300px] md:h-[300px] bg-gradient-to-tr from-primary-100/10 to-transparent dark:from-primary-900/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="text-center max-w-4xl mx-auto px-4 relative" data-aos="fade-down" data-aos-duration="800">
        <div className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white/70 dark:bg-surface-800/70 backdrop-blur-md border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 text-xs md:text-sm font-bold mb-4 md:mb-6 tracking-wide shadow-lg shadow-blue-500/10 dark:shadow-blue-500/5 animate-fade-in-up">
           ✨ الإصدار الذكي 2.5
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent mb-4 md:mb-6 tracking-tight leading-[1.2] pb-2 relative">
          <span className="text-gradient-animated bg-clip-text drop-shadow-sm">مسار AI</span> 
          <br className="md:hidden" /> 
          <span className="text-3xl sm:text-4xl md:text-5xl text-surface-700 dark:text-surface-200 font-bold block md:inline mt-2 md:mt-0 opacity-90">بوصلة مستقبلك</span>
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-surface-600 dark:text-surface-400 mb-6 md:mb-8 leading-relaxed font-medium max-w-2xl mx-auto drop-shadow-sm">
          دليلك الذكي لتحديد مسارك المهني بناءً على منهجية <span className="font-bold text-surface-800 dark:text-surface-200 decoration-4 decoration-primary-300/50 underline underline-offset-4 relative inline-block transition-colors hover:text-primary-600 hover:decoration-primary-400 cursor-default">المثلث الذهبي</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-6xl px-2">
        <Card 
          variant="glass" 
          hoverEffect 
          icon={<FeatureIcon type="brain" color="text-blue-600 dark:text-blue-400" />}
          title="1. فهم الذات"
          className="md:rounded-[2rem] border-white/40 dark:border-white/5 backdrop-blur-xl"
        >
          <p className="text-surface-600 dark:text-surface-400 leading-relaxed text-sm md:text-base font-medium">
             تحليل عميق للقدرات الذهنية والشغف الحقيقي لبناء أساس متين.
          </p>
        </Card>
        
        <Card 
          variant="glass" 
          hoverEffect 
          icon={<FeatureIcon type="globe" color="text-indigo-600 dark:text-indigo-400" />}
          title="2. واقع السوق"
          className="md:rounded-[2rem] border-white/40 dark:border-white/5 backdrop-blur-xl"
        >
          <p className="text-surface-600 dark:text-surface-400 leading-relaxed text-sm md:text-base font-medium">
             كشف الفرص الحقيقية في سوقك المحلي مقارنة بالسوق العالمي.
          </p>
        </Card>
        
        <Card 
          variant="glass" 
          hoverEffect 
          icon={<FeatureIcon type="rocket" color="text-emerald-600 dark:text-emerald-400" />}
          title="3. الانطلاق"
          className="md:rounded-[2rem] border-white/40 dark:border-white/5 backdrop-blur-xl"
        >
          <p className="text-surface-600 dark:text-surface-400 leading-relaxed text-sm md:text-base font-medium">
             خطة تنفيذية تشمل بناء الهوية المهنية ودمج المهارات.
          </p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 md:gap-5 mt-8 md:mt-12 w-full sm:w-auto items-center justify-center px-4" data-aos="zoom-in" data-aos-delay="400">
        <Button
          onClick={handleLoad}
          variant="secondary"
          size="lg"
          leftIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>}
          className="w-full sm:w-auto min-w-[200px] border-slate-300 dark:border-slate-600 dark:bg-surface-800 dark:text-white dark:hover:bg-surface-700"
        >
          تحميل خطة سابقة
        </Button>
        <Button
          onClick={onNext}
          variant="gradient"
          size="xl"
          rightIcon={<svg className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
          className="w-full sm:w-auto min-w-[260px] shadow-xl shadow-primary-500/20 group"
        >
          ابدأ الرحلة الآن
        </Button>
      </div>
      
      <p className="text-xs md:text-sm text-surface-500/80 dark:text-surface-400/60 mt-4 md:mt-8 font-medium">
         يعمل بواسطة Gemini 2.5 Flash & 3.0 Pro
      </p>
    </div>
  );
};

export default WelcomeStep;
