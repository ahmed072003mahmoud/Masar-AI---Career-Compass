
import React, { useState, Suspense } from 'react';
import Card from './UI/Card';

// Lazy load the heavy sub-components
const CareersLibrary = React.lazy(() => import('./CareersLibrary'));
const SuccessStories = React.lazy(() => import('./SuccessStories'));
const BlogSection = React.lazy(() => import('./BlogSection'));
const ToolsLibrary = React.lazy(() => import('./ToolsLibrary'));

type Tab = 'tools' | 'blog' | 'careers' | 'stories' | 'media';

const ResourcesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('tools');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'tools', label: 'أدوات ذكية', icon: '🛠️' },
    { id: 'blog', label: 'المدونة والمقالات', icon: '📰' },
    { id: 'careers', label: 'مكتبة المهن', icon: '🏛️' },
    { id: 'stories', label: 'قصص النجاح', icon: '🎙️' },
    { id: 'media', label: 'وسائط وأدوات', icon: '📺' }
  ];

  const LoadingFallback = () => (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
      <p>جاري التحميل...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 animate-fade-in w-full">
      
      {/* Hub Header */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-slate-100 mb-4 tracking-tight">
          📚 مركز المعرفة والأدوات
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          كل ما تحتاجه لتطوير مسارك المهني في مكان واحد: أدوات ذكية، مقالات، أدلة، وقصص ملهمة.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12 sticky top-20 z-30 bg-surface-50/90 dark:bg-surface-900/90 backdrop-blur-md p-2 rounded-2xl mx-auto max-w-fit shadow-sm border border-slate-200 dark:border-surface-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl font-bold text-sm md:text-base transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105' 
                : 'bg-white dark:bg-surface-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-700'
              }
            `}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="hidden md:inline">{tab.label}</span>
            <span className="md:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        <Suspense fallback={<LoadingFallback />}>
          <div key={activeTab} className="animate-scale-in">
            {activeTab === 'tools' && <ToolsLibrary />}

            {activeTab === 'blog' && <BlogSection />}

            {activeTab === 'careers' && <CareersLibrary />}

            {activeTab === 'stories' && <SuccessStories />}

            {activeTab === 'media' && (
              <div className="max-w-5xl mx-auto">
                  <div className="grid md:grid-cols-2 gap-6">
                      <a href="https://youtu.be/rD77bJfuocM" target="_blank" rel="noopener noreferrer" className="block">
                          <Card hoverEffect className="h-full cursor-pointer hover:-translate-y-1 transition-all">
                              <div className="flex items-start justify-between mb-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                              <span className="text-xs font-bold bg-slate-100 dark:bg-surface-700 text-slate-500 dark:text-slate-300 px-3 py-1 rounded-full">فيديو</span>
                              </div>
                              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-primary-600 transition-colors">كيف تختار مجالك المهني؟ (الجزء 1)</h3>
                              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">مرحلة التأسيس والاختيار: العقلية، فهم النفس والسوق.</p>
                          </Card>
                      </a>
                      
                      <a href="https://youtu.be/pSZAuKcd73w?si=NTjW8Tibwqd4CbHG" target="_blank" rel="noopener noreferrer" className="block">
                          <Card hoverEffect className="h-full cursor-pointer hover:-translate-y-1 transition-all">
                              <div className="flex items-start justify-between mb-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                              <span className="text-xs font-bold bg-slate-100 dark:bg-surface-700 text-slate-500 dark:text-slate-300 px-3 py-1 rounded-full">فيديو</span>
                              </div>
                              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-primary-600 transition-colors">كيف تختار مجالك المهني؟ (الجزء 2)</h3>
                              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">مرحلة الانطلاق والتميز: خارطة الطريق للتنفيذ.</p>
                          </Card>
                      </a>

                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-primary-900/20 dark:to-indigo-900/20 p-8 rounded-3xl border border-primary-100 dark:border-primary-900 text-center col-span-1 md:col-span-2 mt-8">
                          <h3 className="text-xl font-bold text-primary-800 dark:text-primary-200 mb-2">هل لديك اقتراح لمحتوى؟</h3>
                          <p className="text-primary-600 dark:text-primary-400 mb-6">نحن نبني هذه المكتبة باستمرار لخدمة سوق العمل العربي.</p>
                          <button className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                          اقترح موضوعاً
                          </button>
                      </div>
                  </div>
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default ResourcesSection;
