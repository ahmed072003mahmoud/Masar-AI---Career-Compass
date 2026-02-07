
import React, { useState } from 'react';
import { getJobDetails, JobDetailsResponse } from '../services/geminiService';
import Card from './UI/Card';
import Button from './UI/Button';

// Database of Careers
const CAREER_DATABASE = {
  "التقنية والذكاء الاصطناعي": {
    icon: "💻",
    jobs: [
      "مطور برمجيات (Software Engineer)", "عالم بيانات (Data Scientist)", 
      "أخصائي أمن سيبراني", "مدير منتج تقني", "مهندس تعلم آلي", 
      "مصمم واجهات مستخدم (UI/UX)", "مهندس DevOps", "مطور تطبيقات جوال"
    ]
  },
  "الإدارة والأعمال": {
    icon: "💼",
    jobs: [
      "مدير مشاريع (PMP)", "محلل أعمال", "مدير تسويق رقمي", 
      "مدير موارد بشرية", "مستشار إداري", "مدير مالي", 
      "أخصائي سلاسل إمداد", "مدير مبيعات"
    ]
  },
  "الهندسة والصناعة": {
    icon: "🏗️",
    jobs: [
      "مهندس مدني", "مهندس ميكانيكا", "مهندس كهرباء", 
      "مهندس طاقة متجددة", "مهندس صناعي", "مدير سلامة وصحة مهنية",
      "مهندس معماري"
    ]
  },
  "الرعاية الصحية": {
    icon: "🩺",
    jobs: [
      "طبيب أسرة", "صيدلي سريري", "أخصائي معلوماتية صحية", 
      "ممرض عناية مركزة", "أخصائي علاج طبيعي", "إداري مستشفيات"
    ]
  },
  "الإبداع والإعلام": {
    icon: "🎨",
    jobs: [
      "مصمم جرافيك", "كاتب محتوى", "صانع أفلام", 
      "مخرج إبداعي", "أخصائي علاقات عامة", "مدير تواصل اجتماعي"
    ]
  },
  "وظائف المستقبل (2030)": {
    icon: "🚀",
    jobs: [
      "أخصائي ذكاء اصطناعي توليدي", "مهندس طاقة هيدروجينية", 
      "أخصائي سياحة مستدامة", "خبير أمن بيانات حيوية", "مهندس مدن ذكية"
    ]
  }
};

// --- Trigram Search Logic ---

// Helper: normalize text (simple normalization)
const normalize = (str: string) => str.toLowerCase().trim();

// Helper: Generate Trigrams (n=3)
const getTrigrams = (str: string): Set<string> => {
  const s = "  " + normalize(str) + "  ";
  const trigrams = new Set<string>();
  for (let i = 0; i < s.length - 2; i++) {
    trigrams.add(s.slice(i, i + 3));
  }
  return trigrams;
};

// Calculate Similarity (Jaccard Index of Trigrams)
const trigramSimilarity = (str1: string, str2: string): number => {
  const t1 = getTrigrams(str1);
  const t2 = getTrigrams(str2);
  
  if (t1.size === 0 && t2.size === 0) return 1;
  if (t1.size === 0 || t2.size === 0) return 0;
  
  let intersection = 0;
  t1.forEach(gram => {
    if (t2.has(gram)) intersection++;
  });
  
  const union = t1.size + t2.size - intersection;
  return intersection / union;
};

// Combined Fuzzy Match (Includes simple substring and trigram)
const robustFuzzyMatch = (text: string, query: string): boolean => {
    const t = normalize(text);
    const q = normalize(query);
    
    // 1. Exact substring match (highest priority)
    if (t.includes(q)) return true;
    
    // 2. Trigram Similarity for typos/variations
    // Threshold can be adjusted (0.2 is loose, 0.4 is strict)
    const sim = trigramSimilarity(t, q);
    
    // Adaptive threshold based on query length
    const threshold = q.length < 4 ? 0.4 : 0.25;
    
    return sim >= threshold;
};

const CareersLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ["الكل", ...Object.keys(CAREER_DATABASE)];

  const filteredJobs = () => {
    let jobs: {category: string, title: string}[] = [];
    
    Object.entries(CAREER_DATABASE).forEach(([cat, data]) => {
      data.jobs.forEach(job => {
        jobs.push({ category: cat, title: job });
      });
    });

    return jobs.filter(item => {
      const matchesCategory = selectedCategory === "الكل" || item.category === selectedCategory;
      const matchesSearch = !searchQuery || robustFuzzyMatch(item.title, searchQuery);
      return matchesCategory && matchesSearch;
    });
  };

  const handleJobClick = async (jobTitle: string) => {
    setSelectedJob(jobTitle);
    setLoading(true);
    setJobDetails(null);
    
    try {
      const details = await getJobDetails(jobTitle);
      setJobDetails(details);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedJob(null);
    setJobDetails(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-4 tracking-tight">
          🏛️ مكتبة المهن الشاملة
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          استكشف مئات المسارات المهنية وتعرف على تفاصيلها الدقيقة: من الرواتب إلى المهارات المطلوبة، مدعومة بالذكاء الاصطناعي.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-2xl mx-auto">
          <input 
            type="text" 
            placeholder="ابحث عن مهنة (مثال: مهندس برمجيات، محاسب...)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pr-12 rounded-2xl border border-slate-200 dark:border-surface-700 bg-white dark:bg-surface-800 shadow-sm focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900 focus:border-primary-500 outline-none transition-all text-slate-800 dark:text-slate-100"
          />
          <svg className="w-6 h-6 absolute top-1/2 -translate-y-1/2 right-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === cat 
                ? 'bg-slate-800 text-white shadow-lg' 
                : 'bg-white dark:bg-surface-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-surface-700 hover:bg-slate-50 dark:hover:bg-surface-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredJobs().map((item, idx) => (
          <div 
            key={idx}
            onClick={() => handleJobClick(item.title)}
            className="bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-2xl bg-slate-50 dark:bg-surface-700 w-10 h-10 flex items-center justify-center rounded-xl">
                {/* @ts-ignore */}
                {CAREER_DATABASE[item.category]?.icon || "💼"}
              </span>
              <span className="text-[10px] font-bold bg-slate-100 dark:bg-surface-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md">
                {item.category}
              </span>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-2 group-hover:text-primary-600 transition-colors">
              {item.title}
            </h3>
            <div className="mt-auto pt-4 flex items-center text-sm font-bold text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
              عرض التفاصيل
              <svg className="w-4 h-4 mr-1 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs().length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg">لم يتم العثور على مهن تطابق بحثك.</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-800 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up border border-white/20">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-surface-700 flex justify-between items-center bg-slate-50/50 dark:bg-surface-900/50">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100">{selectedJob}</h3>
                {!loading && <p className="text-xs font-bold text-green-600 mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  تحليل بواسطة Gemini 2.5 Flash Lite
                </p>}
              </div>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-surface-600 text-slate-500 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-surface-600">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-medium animate-pulse">جاري جلب تفاصيل المهنة...</p>
                </div>
              ) : jobDetails ? (
                <div className="space-y-8">
                  
                  {/* Description */}
                  <div>
                    <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                      {jobDetails.description}
                    </p>
                  </div>

                  {/* Salary Card */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-emerald-800 rounded-full flex items-center justify-center text-2xl shadow-sm">💰</div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">متوسط الراتب الشهري</h4>
                      <p className="text-xl md:text-2xl font-black text-emerald-700 dark:text-emerald-300">{jobDetails.salaryRange}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Tasks */}
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <span className="text-primary-500">⚡</span> المهام اليومية
                      </h4>
                      <ul className="space-y-2">
                        {jobDetails.tasks.map((task, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-2 shrink-0"></span>
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Path */}
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <span className="text-primary-500">📈</span> المسار الوظيفي
                      </h4>
                      <div className="relative border-r-2 border-slate-200 dark:border-surface-600 mr-2 space-y-4 pr-4">
                        {jobDetails.careerPath.map((step, i) => (
                          <div key={i} className="relative">
                            <div className="absolute top-1.5 -right-[21px] w-3 h-3 rounded-full bg-primary-500 border-2 border-white dark:border-surface-800"></div>
                            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <span className="text-primary-500">🛠️</span> المهارات المطلوبة
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {jobDetails.hardSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-bold border border-indigo-100 dark:border-indigo-800">
                          {skill}
                        </span>
                      ))}
                      {jobDetails.softSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-bold border border-amber-100 dark:border-amber-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Education & Certs */}
                  <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-surface-700">
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <span className="text-primary-500">🎓</span> المسار الأكاديمي
                        </h4>
                        <ul className="space-y-2">
                        {jobDetails.education && jobDetails.education.map((edu, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-2 shrink-0"></span>
                            {edu}
                            </li>
                        ))}
                        {(!jobDetails.education || jobDetails.education.length === 0) && <p className="text-sm text-slate-400">لا توجد بيانات متاحة</p>}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <span className="text-primary-500">📜</span> الشهادات الاحترافية
                        </h4>
                        <ul className="space-y-2">
                        {jobDetails.certifications && jobDetails.certifications.map((cert, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 shrink-0"></span>
                            {cert}
                            </li>
                        ))}
                        {(!jobDetails.certifications || jobDetails.certifications.length === 0) && <p className="text-sm text-slate-400">لا توجد بيانات متاحة</p>}
                        </ul>
                    </div>
                  </div>

                  {/* Courses */}
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <span className="text-primary-500">💻</span> دورات ومصادر تعلم مقترحة
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {jobDetails.courses && jobDetails.courses.map((course, i) => (
                        <a 
                            key={i}
                            href={`https://www.google.com/search?q=${encodeURIComponent(course.title + ' ' + course.provider)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-surface-600 bg-white hover:bg-slate-50 dark:bg-surface-700 dark:hover:bg-surface-600 transition-colors group"
                        >
                            <div>
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{course.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{course.provider}</p>
                            </div>
                            <svg className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                        ))}
                        {(!jobDetails.courses || jobDetails.courses.length === 0) && <p className="text-sm text-slate-400">لا توجد دورات مقترحة حالياً</p>}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center text-red-500">حدث خطأ في تحميل البيانات.</div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-surface-700 bg-white dark:bg-surface-800">
               <Button onClick={closeModal} variant="secondary" fullWidth>إغلاق</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CareersLibrary;
