
import React, { useState } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import ReactMarkdown from 'react-markdown';
import { searchJobsSmart } from '../../services/geminiService';
import { JobListing } from '../../types';

const JobFinder = () => {
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [isAdvanced, setIsAdvanced] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ text: string, jobs?: JobListing[] } | null>(null);

  const handleSearch = async () => {
    // Construct a natural language query based on active filters
    let query = role.trim();
    
    if (!query) {
       // If no role is typed but filters are present, try to construct a valid query
       if (skills) query = `Jobs requiring ${skills}`;
       else if (experience) query = `${experience} level jobs`;
       else if (!isAdvanced && !query) return; // Basic mode empty
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <Card title="🔍 باحث الوظائف الذكي (Function Calling)">
         <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
            ابحث عن فرص وظيفية حقيقية. استخدم البحث المتقدم لتحديد المهارات والموقع والخبرة بدقة.
         </p>
         
         <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <input 
                    type="text" 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={isAdvanced ? "المسمى الوظيفي (مثال: مدير مشاريع)" : "ابحث عن وظيفة (مثال: مطور React في الرياض)"}
                    className="w-full p-3 pl-10 rounded-xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                
                <Button 
                   onClick={() => setIsAdvanced(!isAdvanced)} 
                   variant={isAdvanced ? "primary" : "secondary"}
                   className="px-3"
                   aria-label="Toggle Advanced Search"
                >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                   </svg>
                </Button>
                
                <Button onClick={handleSearch} isLoading={loading} variant="gradient">بحث</Button>
            </div>

            {isAdvanced && (
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-surface-800/50 rounded-xl border border-slate-200 dark:border-surface-600 animate-fade-in-up">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">الموقع</label>
                        <input 
                            type="text" 
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="المدينة أو الدولة"
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm focus:ring-2 focus:ring-primary-200 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">الخبرة</label>
                        <select 
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm focus:ring-2 focus:ring-primary-200 outline-none"
                        >
                            <option value="">غير محدد</option>
                            <option value="Entry Level">مبتدئ (Entry Level)</option>
                            <option value="Junior">جونيور (Junior)</option>
                            <option value="Mid Level">متوسط (Mid-Senior)</option>
                            <option value="Senior">خبير (Senior)</option>
                            <option value="Manager">مدير (Manager)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">المهارات (اختياري)</label>
                        <input 
                            type="text" 
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="مثال: Python, SEO"
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm focus:ring-2 focus:ring-primary-200 outline-none"
                        />
                    </div>
                </div>
            )}
         </div>

         {response && (
           <div className="animate-fade-in-up">
              {/* AI Summary */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-6">
                 <div className="flex items-start gap-3">
                    <span className="text-2xl">🤖</span>
                    <div className="prose prose-sm dark:prose-invert">
                       <ReactMarkdown>{response.text}</ReactMarkdown>
                    </div>
                 </div>
              </div>

              {/* Job Cards */}
              {response.jobs && response.jobs.length > 0 ? (
                 <div className="grid gap-4">
                    {response.jobs.map((job) => (
                       <div key={job.id} className="bg-white dark:bg-surface-800 p-4 rounded-xl border border-slate-200 dark:border-surface-700 hover:shadow-md transition-shadow flex justify-between items-start">
                          <div>
                             <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{job.title}</h4>
                             <p className="text-sm text-slate-500 font-medium mb-2">{job.company.display_name} • {job.location.display_name}</p>
                             <p className="text-xs text-slate-400 line-clamp-2 mb-3">{job.description}</p>
                             <div className="flex gap-2">
                                <span className="text-[10px] bg-slate-100 dark:bg-surface-700 px-2 py-1 rounded text-slate-500">{new Date(job.created).toLocaleDateString('ar-SA')}</span>
                                {job.salary_min && <span className="text-[10px] bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-green-600 font-bold">{job.salary_min.toLocaleString()} ريال</span>}
                             </div>
                          </div>
                          <a href={job.redirect_url} target="_blank" rel="noreferrer" className="bg-primary-600 hover:bg-primary-700 text-white text-xs px-4 py-2 rounded-lg font-bold transition-colors">
                             تقديم
                          </a>
                       </div>
                    ))}
                 </div>
              ) : (
                 !loading && <p className="text-center text-slate-400">لم يتم العثور على وظائف مطابقة.</p>
              )}
           </div>
         )}
      </Card>
    </div>
  );
};

export default JobFinder;
