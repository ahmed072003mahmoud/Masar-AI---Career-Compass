
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
    const saved = localStorage.getItem('masar_app_state_v3');
    if (saved && onLoadSaved) {
      try {
        onLoadSaved(JSON.parse(saved));
        showToast('تم استعادة الجلسة السابقة', 'success');
      } catch (e) { showToast('لا توجد بيانات محفوظة صالحة', 'error'); }
    } else { showToast('لا توجد بيانات محفوظة', 'info'); }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] relative z-10 w-full animate-fade-in text-center px-4">
      {/* Hero Content */}
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 mb-12">
        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-4 animate-fade-in-up">
           ✨ مدعوم بواسطة Gemini 3.0 Pro
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] animate-slide-in-up">
          حدد مسارك المهني <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">بالذكاء الاصطناعي</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-slide-in-up delay-100">
          منصة ذكية تحلل شخصيتك، تقرأ سوق العمل المباشر، وتبني لك خطة تنفيذية للوصول لوظيفة أحلامك.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 animate-slide-in-up delay-200">
           <Button onClick={onNext} size="xl" variant="gradient" className="shadow-2xl shadow-primary-500/30 w-full sm:w-auto min-w-[200px]">
              ابدأ التحليل الآن
           </Button>
           <Button onClick={handleLoad} size="xl" variant="secondary" className="w-full sm:w-auto">
              استكمال جلسة سابقة
           </Button>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl animate-fade-in-up delay-300">
         <Card className="bg-white/60 dark:bg-surface-800/60 backdrop-blur border-white/50 dark:border-surface-700/50 p-6 hover:-translate-y-2 transition-transform duration-300">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">تحليل الشخصية</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">نستخدم نماذج نفسية متقدمة لفهم نقاط قوتك وشغفك الحقيقي.</p>
         </Card>
         <Card className="bg-white/60 dark:bg-surface-800/60 backdrop-blur border-white/50 dark:border-surface-700/50 p-6 hover:-translate-y-2 transition-transform duration-300">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">بيانات السوق الحية</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">ربط مباشر مع محركات البحث للحصول على الرواتب والطلب الحالي.</p>
         </Card>
         <Card className="bg-white/60 dark:bg-surface-800/60 backdrop-blur border-white/50 dark:border-surface-700/50 p-6 hover:-translate-y-2 transition-transform duration-300">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">خارطة طريق تنفيذية</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">خطة مفصلة بالمصادر والدورات والخطوات العملية للوصول لهدفك.</p>
         </Card>
      </div>
    </div>
  );
};

export default WelcomeStep;
