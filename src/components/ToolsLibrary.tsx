
import React, { useState, Suspense } from 'react';

// Lazy load tool components for code splitting
const JobFinder = React.lazy(() => import('./tools/JobFinder'));
const ResumeAnalyzer = React.lazy(() => import('./tools/ResumeAnalyzer'));
const MockInterviewer = React.lazy(() => import('./tools/MockInterviewer'));
const LinkedInHelper = React.lazy(() => import('./tools/LinkedInHelper'));
const LearningRoadmap = React.lazy(() => import('./tools/LearningRoadmap'));
const SkillQuiz = React.lazy(() => import('./tools/SkillQuiz'));

// --- MAIN WRAPPER ---
const ToolsLibrary: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'jobfinder' | 'resume' | 'interview' | 'linkedin' | 'roadmap' | 'quiz'>('jobfinder');

  const LoadingFallback = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
      <p>جاري تحميل الأداة...</p>
    </div>
  );

  const navItemClass = (id: string, colorClass: string) => `
    w-full text-right p-4 rounded-xl font-bold flex items-center gap-3 transition-all duration-300
    ${activeTool === id 
      ? `bg-white dark:bg-surface-800 shadow-md border-r-4 ${colorClass} text-slate-800 dark:text-white translate-x-[-4px]` 
      : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}
  `;

  return (
    <div className="animate-fade-in w-full pb-20">
      <div className="text-center mb-10">
         <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-3">🛠️ أدوات مهنية ذكية</h2>
         <p className="text-slate-500">مجموعة من الأدوات المدعومة بالذكاء الاصطناعي لرفع جاهزيتك الوظيفية.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
         {/* Sidebar Navigation */}
         <div className="md:col-span-1 space-y-2">
            <button onClick={() => setActiveTool('jobfinder')} className={navItemClass('jobfinder', 'border-amber-500')}>
               <span className="text-xl">🔍</span> باحث الوظائف
            </button>
            <button onClick={() => setActiveTool('resume')} className={navItemClass('resume', 'border-primary-500')}>
               <span className="text-xl">📄</span> محلل السيرة الذاتية
            </button>
            <button onClick={() => setActiveTool('roadmap')} className={navItemClass('roadmap', 'border-purple-500')}>
               <span className="text-xl">🗺️</span> خارطة التعلم
            </button>
            <button onClick={() => setActiveTool('interview')} className={navItemClass('interview', 'border-emerald-500')}>
               <span className="text-xl">🎤</span> محاكي المقابلات
            </button>
            <button onClick={() => setActiveTool('quiz')} className={navItemClass('quiz', 'border-rose-500')}>
               <span className="text-xl">🧠</span> الاختبار التقني
            </button>
            <button onClick={() => setActiveTool('linkedin')} className={navItemClass('linkedin', 'border-blue-500')}>
               <span className="text-xl">💼</span> مساعد LinkedIn
            </button>
         </div>

         {/* Content Area */}
         <div className="md:col-span-3 min-h-[500px]">
            <Suspense fallback={<LoadingFallback />}>
               {activeTool === 'jobfinder' && <JobFinder />}
               {activeTool === 'roadmap' && <LearningRoadmap />}
               {activeTool === 'resume' && <ResumeAnalyzer />}
               {activeTool === 'interview' && <MockInterviewer />}
               {activeTool === 'linkedin' && <LinkedInHelper />}
               {activeTool === 'quiz' && <SkillQuiz />}
            </Suspense>
         </div>
      </div>
    </div>
  );
};

export default ToolsLibrary;
