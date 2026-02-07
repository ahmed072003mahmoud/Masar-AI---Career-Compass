import React, { useState } from 'react';
import Card from './UI/Card';
import Button from './UI/Button';

// Mock data for success stories (simulating a database)
const STORIES = [
  {
    id: 1,
    name: "سارة الأحمد",
    role: "عالمة بيانات",
    prevRole: "خريجة رياضيات",
    company: "شركة تقنية عالمية",
    image: "👩🏻‍💻",
    quote: "التحول من الرياضيات إلى علم البيانات كان تحدياً، لكن الشغف بالأرقام هو الرابط المشترك.",
    story: "بدأت رحلتي كمعلمة رياضيات، لكنني شعرت برغبة في تطبيق النظريات على أرض الواقع. بدأت بتعلم لغة Python في المساء، وحصلت على شهادة Google Data Analytics. التحدي الأكبر كان بناء معرض أعمال (Portfolio) حقيقي، لكن المشاريع التطوعية ساعدتني كثيراً.",
    keyTakeaways: ["المشاريع العملية أهم من الشهادات", "الاستمرار في التعلم الذاتي", "بناء شبكة علاقات على LinkedIn"]
  },
  {
    id: 2,
    name: "عمر خالد",
    role: "مدير منتج",
    prevRole: "مهندس مدني",
    company: "شركة ناشئة (FinTech)",
    image: "👨🏻‍💼",
    quote: "إدارة المشاريع الهندسية علمتني الانضباط، وإدارة المنتجات منحتني حرية الإبداع.",
    story: "بعد 5 سنوات في المواقع الإنشائية، أدركت أن شغفي يكمن في حل المشكلات التقنية وليس البناء. قرأت كتاب 'Inspired' ومارست دور مدير المنتج في مشروع جانبي صغير. الانتقال تطلب مني التنازل عن جزء من راتبي في البداية للانضمام لشركة ناشئة، لكن العائد المعرفي كان هائلاً.",
    keyTakeaways: ["التضحية المؤقتة من أجل النمو", "فهم احتياجات المستخدم", "العمل في بيئة مرنة"]
  },
  {
    id: 3,
    name: "نورة السديري",
    role: "أخصائية أمن سيبراني",
    prevRole: "دعم فني",
    company: "هيئة حكومية",
    image: "🧕🏻",
    quote: "الفضول هو المحرك الأول في مجال الأمن السيبراني. لا تتوقف عن السؤال 'كيف يعمل هذا؟'.",
    story: "كنت أعمل في الدعم الفني وألاحظ كثرة المشاكل الأمنية البسيطة التي يقع فيها الموظفون. قررت التخصص وحصلت على شهادة Security+. شاركت في مسابقات CTF (Capture The Flag) التي صقلت مهاراتي العملية وجعلت سيرتي الذاتية مميزة.",
    keyTakeaways: ["الشهادات الاحترافية ضرورية", "المسابقات العملية (CTF)", "التخصص الدقيق"]
  },
  {
    id: 4,
    name: "ياسر الحربي",
    role: "مصمم تجربة مستخدم (UX)",
    prevRole: "مصمم جرافيك",
    company: "وكالة إبداعية",
    image: "🎨",
    quote: "التصميم ليس مجرد شكل، بل هو طريقة تفكير وحل للمشاكل.",
    story: "الجماليات كانت اهتمامي الأول، لكنني أردت أن أجعل الأشياء قابلة للاستخدام وسهلة. درست سيكولوجية المستخدم وقمت بإعادة تصميم تطبيقات مشهورة كتدريب. المفتاح كان فهم 'لماذا' يقوم المستخدم بهذا الفعل، وليس فقط 'كيف' يبدو الشكل.",
    keyTakeaways: ["التعاطف مع المستخدم", "البحث والتجربة", "تقبل النقد البناء"]
  }
];

const SuccessStories: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState<number | null>(null);

  const activeStory = STORIES.find(s => s.id === selectedStory);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 animate-fade-in pb-20">
      <div className="text-center mb-10 md:mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-4 tracking-tight">
          🎙️ قصص نجاح ومقابلات
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          استلهم من تجارب محترفين خاضوا رحلة التغيير والتطور المهني. تجارب حقيقية، تحديات، ودروس مستفادة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {STORIES.map((story) => (
          <div 
            key={story.id} 
            onClick={() => setSelectedStory(story.id)}
            className="group cursor-pointer bg-white dark:bg-surface-800 rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-100 dark:border-surface-700 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
          >
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-50 to-transparent dark:from-primary-900/20 rounded-bl-[100px] -z-0 group-hover:scale-110 transition-transform"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-surface-700 flex items-center justify-center text-4xl shadow-inner">
                  {story.image}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors">{story.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{story.role}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  كان: <span className="text-slate-700 dark:text-slate-300 font-bold">{story.prevRole}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  الآن: <span className="text-green-700 dark:text-green-400 font-bold">{story.company}</span>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 italic mb-6 line-clamp-3">
                "{story.quote}"
              </p>

              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-surface-700 flex justify-between items-center">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400 group-hover:underline">اقرأ القصة كاملة</span>
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 rtl:rotate-180 transform group-hover:translate-x-[-4px] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Story Modal */}
      {selectedStory && activeStory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-800 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
            
            <div className="relative h-32 bg-gradient-to-r from-primary-600 to-indigo-600 shrink-0">
               <button 
                 onClick={() => setSelectedStory(null)}
                 className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-colors"
               >
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
               <div className="absolute -bottom-10 right-8 w-24 h-24 bg-white dark:bg-surface-800 rounded-3xl p-1 shadow-lg">
                  <div className="w-full h-full bg-slate-50 dark:bg-surface-700 rounded-2xl flex items-center justify-center text-5xl">
                    {activeStory.image}
                  </div>
               </div>
            </div>

            <div className="pt-12 px-8 pb-8 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-surface-600">
               <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{activeStory.name}</h3>
               <p className="text-primary-600 dark:text-primary-400 font-bold mb-6">{activeStory.role} @ {activeStory.company}</p>
               
               <div className="space-y-6">
                 <div>
                   <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">القصة</h4>
                   <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                     {activeStory.story}
                   </p>
                 </div>

                 <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-800">
                    <h4 className="text-amber-800 dark:text-amber-400 font-bold mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      أهم الدروس المستفادة
                    </h4>
                    <ul className="space-y-2">
                      {activeStory.keyTakeaways.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                          <span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                 </div>
               </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-surface-700 bg-slate-50 dark:bg-surface-900 flex justify-end">
               <Button onClick={() => setSelectedStory(null)} variant="primary">إغلاق</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessStories;