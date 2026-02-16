
import React, { useState } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import ReactMarkdown from 'react-markdown';
import { searchJobsSmart } from '../../services/geminiService';
import { JobListing } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const JobFinder = () => {
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ text: string, jobs?: JobListing[] } | null>(null);
  const { showToast } = useToast();

  const handleSearch = async () => {
    let query = role.trim();
    
    if (!query) {
       if (skills) query = `Jobs requiring ${skills}`;
       else if (experience) query = `${experience} level jobs`;
       else if (!isAdvanced && !query) return;
    }

    if (isAdvanced) {
       if (experience) query = `${experience} ${query}`;
       if (skills) query += ` requiring skills: ${skills}`;
       if (location) query += ` in ${location}`;
    }

    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);
    try {
      const res = await searchJobsSmart(query);
      setResponse(res);
    } catch (e) {
      console.error(e);
      showToast('حدث خطأ أثناء البحث', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveJob = (jobId: string) => {
    const newSaved = new Set(savedJobs);
    if (newSaved.has(jobId)) {
        newSaved.delete(jobId);
        showToast('تمت إزالة الوظيفة من المحفوظات', 'info');
    } else {
        newSaved.add(jobId);
        showToast('تم حفظ الوظيفة بنجاح', 'success');
    }
    setSavedJobs(newSaved);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <Card className="product-card border-none shadow-xl" padding="lg">
         <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    🔍 باحث الوظائف الذكي
                    <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">Live API</span>
                </h3>
                <p className="text-slate-500 text-sm mt-1">ابحث عن فرص حقيقية باستخدام محرك Adzuna والذكاء الاصطناعي.</p>
            </div>
            {savedJobs.size > 0 && (
                <div className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                    {savedJobs.size} محفوظة
                </div>
            )}
         </div>
         
         <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-2">
                <div className="flex-1 relative group">
                    <input 
                    type="text" 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={isAdvanced ? "المسمى الوظيفي (مثال: مدير مشاريع)" : "ابحث عن وظيفة (مثال: مطور React في الرياض)"}
                    className="w-full p-4 pl-12 rounded-xl border border-slate-200 dark:border-surface-600 bg-slate-50 dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-surface-900 outline-none transition-all shadow-inner"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                
                <Button 
                   onClick={() => setIsAdvanced(!isAdvanced)} 
                   variant={isAdvanced ? "primary" : "outline"}
                   className="px-4 rounded-xl border-2"
                   aria-label="Toggle Advanced Search"
                >
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                   </svg>
                </Button>
                
                <Button onClick={handleSearch} isLoading={loading} variant="gradient" className="px-8 shadow-lg shadow-primary-500/20">بحث</Button>
            </div>

            {isAdvanced && (
                <div className="grid md:grid-cols-3 gap-4 p-5 bg-slate-50 dark:bg-surface-800/50 rounded-2xl border border-slate-200 dark:border-surface-600 animate-fade-in-up">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">الموقع</label>
                        <input 
                            type="text" 
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="المدينة أو الدولة"
                            className="w-full p-3 rounded-lg border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm focus:ring-2 focus:ring-primary-200 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">الخبرة</label>
                        <select 
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className="w-full p-3 rounded-lg border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm focus:ring-2 focus:ring-primary-200 outline-none appearance-none"
                        >
                            <option value="">جميع المستويات</option>
                            <option value="Entry Level">مبتدئ (Entry Level)</option>
                            <option value="Junior">جونيور (Junior)</option>
                            <option value="Mid Level">متوسط (Mid-Senior)</option>
                            <option value="Senior">خبير (Senior)</option>
                            <option value="Manager">مدير (Manager)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">المهارات</label>
                        <input 
                            type="text" 
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="مثال: Python, SEO"
                            className="w-full p-3 rounded-lg border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm focus:ring-2 focus:ring-primary-200 outline-none"
                        />
                    </div>
                </div>
            )}
         </div>

         {response && (
           <div className="animate-fade-in-up space-y-6">
              {/* AI Summary */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-white dark:bg-indigo-800 flex items-center justify-center text-2xl shadow-sm shrink-0">🤖</div>
                 <div className="prose prose-sm dark:prose-invert max-w-none pt-1">
                    <ReactMarkdown>{response.text}</ReactMarkdown>
                 </div>
              </div>

              {/* Job Cards */}
              {response.jobs && response.jobs.length > 0 ? (
                 <div className="grid gap-4">
                    {response.jobs.map((job) => {
                       const isSaved = savedJobs.has(job.id);
                       return (
                        <div key={job.id} className="group bg-white dark:bg-surface-800 p-5 rounded-2xl border border-slate-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all duration-300 relative">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors">{job.title}</h4>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-3 mt-1">
                                        <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> {job.company.display_name}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> {job.location.display_name}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">{job.description}</p>
                                    
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className="text-xs bg-slate-100 dark:bg-surface-700 px-2 py-1 rounded text-slate-500 border border-slate-200 dark:border-surface-600">{new Date(job.created).toLocaleDateString('ar-SA')}</span>
                                        {job.salary_min && (
                                            <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded font-bold border border-green-100 dark:border-green-900/30">
                                                💰 {job.salary_min.toLocaleString()} ريال
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <a 
                                      href={job.redirect_url} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="bg-primary-600 hover:bg-primary-700 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 text-center"
                                    >
                                        تقديم الآن
                                    </a>
                                    <button 
                                        onClick={() => toggleSaveJob(job.id)}
                                        className={`p-2 rounded-xl border transition-colors ${isSaved ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-white dark:bg-surface-700 border-slate-200 dark:border-surface-600 text-slate-400 hover:text-amber-500'}`}
                                        title="حفظ الوظيفة"
                                    >
                                        <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                       );
                    })}
                 </div>
              ) : (
                 !loading && (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-surface-700 rounded-2xl">
                        <div className="text-4xl mb-3">📭</div>
                        <p className="text-slate-500 font-medium">لم يتم العثور على وظائف مطابقة للبحث.</p>
                        <p className="text-xs text-slate-400 mt-1">جرب كلمات مفتاحية أعم أو موقعاً مختلفاً.</p>
                    </div>
                 )
              )}
           </div>
         )}
      </Card>
    </div>
  );
};

export default JobFinder;
