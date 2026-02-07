
import React, { useState } from 'react';
import Button from './UI/Button';

interface Article {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  content: string; // Markdown-like or HTML
  image: string;
  readTime: string;
  date: string;
  featured?: boolean;
}

const ARTICLES: Article[] = [
  {
    id: 1,
    category: "اتجاهات السوق",
    title: "مستقبل الوظائف في السعودية: تأثير رؤية 2030 والذكاء الاصطناعي",
    excerpt: "كيف تعيد المشاريع العملاقة مثل نيوم والقدية تشكيل خارطة الطلب الوظيفي، وما هي المهارات التي ستندثر مقابل التي ستزدهر؟",
    readTime: "5 دقائق",
    date: "أكتوبر 2023",
    image: "🇸🇦",
    featured: true,
    content: `
      <h3 class="font-bold text-xl mb-4 text-slate-800 dark:text-slate-100">التحول الجذري في سوق العمل</h3>
      <p class="mb-4 text-slate-600 dark:text-slate-300">لم يعد السوق السعودي يعتمد فقط على القطاع التقليدي. مع رؤية 2030، نشهد طلباً هائلاً في قطاعات السياحة، الترفيه، الطاقة المتجددة، والتقنية المتقدمة.</p>
      
      <h3 class="font-bold text-xl mb-4 text-slate-800 dark:text-slate-100">الذكاء الاصطناعي: عدو أم صديق؟</h3>
      <p class="mb-4 text-slate-600 dark:text-slate-300">تشير الدراسات إلى أن الذكاء الاصطناعي لن يستبدل البشر، بل سيستبدل "الشخص الذي لا يستخدم الذكاء الاصطناعي". المهن الروتينية (إدخال البيانات، المحاسبة التقليدية) في خطر، بينما المهن التي تتطلب تفكيراً نقدياً وإبداعاً في ازدهار.</p>
      
      <h3 class="font-bold text-xl mb-4 text-slate-800 dark:text-slate-100">أهم 5 قطاعات واعدة:</h3>
      <ul class="list-disc list-inside space-y-2 mb-4 text-slate-600 dark:text-slate-300">
        <li><strong>الأمن السيبراني:</strong> حماية البنية التحتية الرقمية.</li>
        <li><strong>السياحة والضيافة:</strong> مع مشاريع البحر الأحمر والعلا.</li>
        <li><strong>الطاقة النظيفة:</strong> مبادرة السعودية الخضراء.</li>
        <li><strong>التقنية المالية (FinTech):</strong> تحول رقمي شامل في القطاع البنكي.</li>
        <li><strong>الرياضات الإلكترونية والألعاب:</strong> استثمارات ضخمة من صندوق الاستثمارات العامة.</li>
      </ul>
    `
  },
  {
    id: 2,
    category: "تطوير الذات",
    title: "كيف تكتب سيرة ذاتية تتجاوز أنظمة الفرز الآلي (ATS)؟",
    excerpt: "دليلك الشامل لكتابة سيرة ذاتية احترافية تضمن لك الوصول لمرحلة المقابلة، مع نصائح حول الكلمات المفتاحية والتنسيق.",
    readTime: "7 دقائق",
    date: "سبتمبر 2023",
    image: "📄",
    content: `
      <h3 class="font-bold text-xl mb-4 text-slate-800 dark:text-slate-100">ما هو نظام ATS؟</h3>
      <p class="mb-4 text-slate-600 dark:text-slate-300">تستخدم 75% من الشركات الكبرى أنظمة تتبع المتقدمين (ATS) لفرز السير الذاتية قبل أن يراها أي بشري. إذا لم تكن سيرتك الذاتية منسقة بشكل صحيح، سيتم استبعادها تلقائياً.</p>
      
      <h3 class="font-bold text-xl mb-4 text-slate-800 dark:text-slate-100">قواعد ذهبية لتجاوز النظام:</h3>
      <ul class="list-disc list-inside space-y-2 mb-4 text-slate-600 dark:text-slate-300">
        <li><strong>استخدم الكلمات المفتاحية:</strong> اقرأ الوصف الوظيفي جيداً واستخدم نفس المصطلحات الموجودة فيه (مثال: إذا طلبوا "Project Management"، لا تكتب "Managing Projects").</li>
        <li><strong>التنسيق البسيط:</strong> تجنب الجداول، الأعمدة المعقدة، والرسومات البيانية. استخدم خطوطاً واضحة مثل Arial أو Calibri.</li>
        <li><strong>العناوين القياسية:</strong> استخدم "الخبرة المهنية"، "التعليم"، "المهارات" بدلاً من عناوين إبداعية غامضة.</li>
        <li><strong>صيغة الملف:</strong> احفظ الملف دائماً بصيغة PDF أو DOCX، وتجنب الصور.</li>
      </ul>
      
      <h3 class="font-bold text-xl mb-4 text-slate-800 dark:text-slate-100">هيكل السيرة الذاتية الناجحة:</h3>
      <p class="text-slate-600 dark:text-slate-300">1. ملخص مهني قوي (وليس هدف وظيفي).<br>2. الخبرات (الإنجازات بالأرقام، وليس فقط المسؤوليات).<br>3. المهارات التقنية والناعمة.<br>4. التعليم والشهادات.</p>
    `
  },
  {
    id: 3,
    category: "نصائح مهنية",
    title: "فن التفاوض على الراتب: لا تترك المال على الطاولة",
    excerpt: "متى وكيف تتفاوض على راتبك؟ استراتيجيات عملية لزيادة دخلك قبل توقيع العقد.",
    readTime: "4 دقائق",
    date: "أغسطس 2023",
    image: "💰",
    content: `
      <h3 class="font-bold text-xl mb-4 text-slate-800 dark:text-slate-100">القاعدة الأولى: لا تذكر رقماً أولاً</h3>
      <p class="mb-4 text-slate-600 dark:text-slate-300">من يذكر الرقم أولاً في المفاوضات غالباً ما يخسر. حاول تأجيل الحديث عن الراتب حتى تتأكد من أنهم يريدون توظيفك.</p>
      
      <h3 class="font-bold text-xl mb-4 text-slate-800 dark:text-slate-100">ابحث عن قيمتك السوقية</h3>
      <p class="mb-4 text-slate-600 dark:text-slate-300">استخدم مواقع مثل Glassdoor، LinkedIn، واستطلاعات الرواتب المحلية لمعرفة متوسط الرواتب لمسماك الوظيفي وخبرتك في منطقتك الجغرافية.</p>
      
      <h3 class="font-bold text-xl mb-4 text-slate-800 dark:text-slate-100">الراتب ليس كل شيء</h3>
      <p class="mb-4 text-slate-600 dark:text-slate-300">إذا كانت ميزانية الشركة محدودة، فاوض على المزايا الأخرى:</p>
      <ul class="list-disc list-inside space-y-2 mb-4 text-slate-600 dark:text-slate-300">
        <li>العمل عن بعد أو ساعات عمل مرنة.</li>
        <li>أيام إجازة إضافية.</li>
        <li>ميزانية للتدريب والتطوير.</li>
        <li>أسهم في الشركة (Stock Options).</li>
      </ul>
    `
  },
  {
    id: 4,
    category: "تطوير الذات",
    title: "التعلم المستمر: قاعدة الـ 5 ساعات",
    excerpt: "لماذا يخصص أنجح الأشخاص في العالم (مثل بيل غيتس وإيلون ماسك) ساعة يومياً للتعلم؟",
    readTime: "3 دقائق",
    date: "يوليو 2023",
    image: "🧠",
    content: `
      <h3 class="font-bold text-xl mb-4 text-slate-800 dark:text-slate-100">ما هي قاعدة الـ 5 ساعات؟</h3>
      <p class="mb-4 text-slate-600 dark:text-slate-300">هي مفهوم بسيط: تخصيص ساعة واحدة يومياً (أو 5 ساعات أسبوعياً) للتعلم المتعمد والممارسة. هذا لا يشمل العمل اليومي، بل تعلم شيء جديد تماماً.</p>
      
      <h3 class="font-bold text-xl mb-4 text-slate-800 dark:text-slate-100">كيف تطبقها؟</h3>
      <ul class="list-disc list-inside space-y-2 mb-4 text-slate-600 dark:text-slate-300">
        <li><strong>القراءة:</strong> اقرأ كتباً في مجالك أو مجالات مختلفة لتوسيع مداركك.</li>
        <li><strong>التأمل:</strong> فكر فيما تعلمته وكيف يمكن تطبيقه.</li>
        <li><strong>التجربة:</strong> جرب أفكاراً جديدة ولا تخف من الفشل.</li>
      </ul>
      
      <p class="text-slate-600 dark:text-slate-300">في عالم يتغير بسرعة، القدرة على التعلم أسرع من غيرك هي الميزة التنافسية الوحيدة المستدامة.</p>
    `
  }
];

const BlogSection: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const activeArticle = ARTICLES.find(a => a.id === selectedArticle);
  const featuredArticle = ARTICLES.find(a => a.featured) || ARTICLES[0];
  const otherArticles = ARTICLES.filter(a => a.id !== featuredArticle.id);

  return (
    <div className="animate-fade-in pb-20">
      
      {!selectedArticle ? (
        <div className="space-y-8">
            {/* Featured Article */}
            <div 
                onClick={() => setSelectedArticle(featuredArticle.id)}
                className="group cursor-pointer bg-white dark:bg-surface-800 rounded-3xl p-6 md:p-8 shadow-md hover:shadow-xl border border-slate-100 dark:border-surface-700 transition-all duration-300 flex flex-col md:flex-row gap-6 md:gap-8 items-start relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="w-full md:w-1/3 h-52 md:h-full min-h-[200px] bg-slate-50 dark:bg-surface-700 rounded-2xl flex items-center justify-center text-8xl shadow-inner relative z-10">
                    {featuredArticle.image}
                </div>
                
                <div className="flex-1 relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold text-primary-600 bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full">
                        ✨ مقال مميز
                        </span>
                        <span className="text-xs text-slate-400">{featuredArticle.date} • {featuredArticle.readTime}</span>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors leading-tight mb-4">
                        {featuredArticle.title}
                    </h2>
                    
                    <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-6 flex-1">
                        {featuredArticle.excerpt}
                    </p>
                    
                    <div className="mt-auto flex items-center text-primary-600 dark:text-primary-400 text-sm font-bold">
                        اقرأ المزيد
                        <svg className="w-5 h-5 mr-2 rtl:rotate-180 transition-transform group-hover:translate-x-[-4px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                </div>
            </div>

            {/* Other Articles Grid */}
            <div className="grid gap-6 md:grid-cols-3">
            {otherArticles.map((article) => (
                <div 
                key={article.id} 
                onClick={() => setSelectedArticle(article.id)}
                className="group cursor-pointer bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-sm hover:shadow-lg border border-slate-100 dark:border-surface-700 transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
                >
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-surface-700 px-2 py-1 rounded-md">
                    {article.category}
                    </span>
                    <span className="text-xs text-slate-400">{article.readTime}</span>
                </div>
                
                <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl shrink-0 bg-slate-50 dark:bg-surface-700 w-16 h-16 flex items-center justify-center rounded-xl">
                        {article.image}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors leading-tight mb-2">
                            {article.title}
                        </h3>
                    </div>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4 flex-1">
                    {article.excerpt}
                </p>
                </div>
            ))}
            </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-800 rounded-3xl shadow-xl border border-slate-100 dark:border-surface-700 overflow-hidden animate-fade-in-up max-w-4xl mx-auto">
           {activeArticle && (
             <>
               <div className="bg-slate-50 dark:bg-surface-900 p-6 md:p-10 border-b border-slate-100 dark:border-surface-700">
                  <div className="flex items-center gap-2 mb-4">
                    <button 
                      onClick={() => setSelectedArticle(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1 text-sm font-bold"
                    >
                      <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                      عودة للمقالات
                    </button>
                    <span className="text-slate-300">|</span>
                    <span className="text-primary-600 text-sm font-bold">{activeArticle.category}</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-slate-100 mb-4 leading-tight">
                    {activeArticle.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                     <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> {activeArticle.date}</span>
                     <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {activeArticle.readTime} قراءة</span>
                  </div>
               </div>
               
               <div className="p-6 md:p-10 prose prose-lg dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: activeArticle.content }} />
               </div>

               <div className="p-6 md:p-10 border-t border-slate-100 dark:border-surface-700 bg-slate-50 dark:bg-surface-900 flex justify-between items-center">
                  <p className="text-slate-500 font-medium text-sm">هل وجدت هذا المقال مفيداً؟</p>
                  <Button onClick={() => setSelectedArticle(null)} variant="primary">
                    قراءة مقال آخر
                  </Button>
               </div>
             </>
           )}
        </div>
      )}
    </div>
  );
};

export default BlogSection;
