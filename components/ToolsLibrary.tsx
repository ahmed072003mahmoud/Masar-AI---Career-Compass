
import React, { useState } from 'react';
import Card from './UI/Card';
import Button from './UI/Button';
import { useToast } from '../contexts/ToastContext';
import { analyzeResume, getInterviewQuestion, generateLinkedInContent, searchJobsSmart } from '../services/geminiService';
import { ResumeAnalysisResult, ChatMessage, JobListing } from '../types';
import ReactMarkdown from 'react-markdown';

// --- SUB-COMPONENT: JOB FINDER ---
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

// --- SUB-COMPONENT: RESUME ANALYZER ---
const ResumeAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [targetJob, setTargetJob] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        showToast('يرجى رفع ملف PDF فقط', 'error');
        return;
      }
      setFile(selected);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !targetJob) {
      showToast('يرجى رفع السيرة الذاتية وتحديد المسمى الوظيفي', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
          const analysis = await analyzeResume(base64String, targetJob);
          setResult(analysis);
          showToast('تم التحليل بنجاح', 'success');
        } catch (err) {
          showToast('فشل تحليل الملف. تأكد من أنه نصي وليس صورة ممسوحة ضوئياً.', 'error');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {!result ? (
        <Card title="📄 محلل السيرة الذاتية الذكي (ATS)">
          <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
            ارفع سيرتك الذاتية (PDF) لنتحقق من توافقها مع أنظمة التوظيف ونقترح عليك كلمات مفتاحية مفقودة.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">المسمى الوظيفي المستهدف</label>
              <input 
                type="text" 
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                placeholder="مثال: Project Manager, Software Engineer..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-surface-600 rounded-xl p-8 text-center bg-slate-50 dark:bg-surface-800/50 hover:bg-slate-100 transition-colors relative cursor-pointer">
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="pointer-events-none">
                 <div className="text-4xl mb-2">📤</div>
                 <p className="font-bold text-slate-600 dark:text-slate-400">
                   {file ? file.name : 'اضغط لرفع ملف PDF (الحد الأقصى 2MB)'}
                 </p>
              </div>
            </div>

            <Button onClick={handleAnalyze} isLoading={loading} fullWidth disabled={!file || !targetJob} variant="gradient">
              تحليل السيرة الذاتية
            </Button>
          </div>
        </Card>
      ) : (
        <div className="animate-fade-in-up space-y-6">
           {/* Score Card */}
           <div className="grid md:grid-cols-3 gap-4">
              <Card className="col-span-1 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100">
                 <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-indigo-100 dark:text-indigo-900" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path className={`${result.matchScore > 75 ? 'text-green-500' : result.matchScore > 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000`} strokeDasharray={`${result.matchScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-800 dark:text-slate-100">{result.matchScore}%</div>
                 </div>
                 <p className="font-bold text-slate-500 mt-2">نسبة التطابق مع ATS</p>
              </Card>

              <div className="col-span-2 space-y-4">
                 <Card className="bg-green-50/50 border-green-100">
                    <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">✅ نقاط القوة</h4>
                    <div className="flex flex-wrap gap-2">
                       {result.strengths.map((s, i) => <span key={i} className="px-2 py-1 bg-white rounded text-xs text-green-800 border border-green-100 font-bold">{s}</span>)}
                    </div>
                 </Card>
                 <Card className="bg-red-50/50 border-red-100">
                    <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">⚠️ كلمات مفتاحية مفقودة</h4>
                    <div className="flex flex-wrap gap-2">
                       {result.missingKeywords.map((k, i) => <span key={i} className="px-2 py-1 bg-white rounded text-xs text-red-800 border border-red-100 font-bold">{k}</span>)}
                    </div>
                 </Card>
              </div>
           </div>

           <Card title="💡 نصائح للتحسين">
              <ul className="space-y-2">
                 {result.improvementTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 text-sm">
                       <span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>
                       {tip}
                    </li>
                 ))}
              </ul>
           </Card>

           <Button onClick={() => {setResult(null); setFile(null);}} variant="secondary" fullWidth>تحليل ملف آخر</Button>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENT: MOCK INTERVIEWER ---
const MockInterviewer = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [active, setActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => scrollToBottom(), [messages]);

  const startInterview = async () => {
    if (!jobTitle) return;
    setActive(true);
    setLoading(true);
    const q = await getInterviewQuestion([], jobTitle);
    setMessages([{ id: '1', role: 'model', text: q }]);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = [...messages, userMsg].map(m => ({ role: m.role, text: m.text }));
    const aiResponse = await getInterviewQuestion(history, jobTitle);
    
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: aiResponse }]);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {!active ? (
        <Card title="🎤 المقابلات الشخصية الافتراضية">
           <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
             تخيل أنك أمام مسؤول التوظيف الآن. حدد الوظيفة وسيقوم الذكاء الاصطناعي بإجراء مقابلة كاملة معك وتقييم إجاباتك.
           </p>
           <div className="flex gap-2">
              <input 
                type="text" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="مثال: Sales Manager..."
                className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800"
              />
              <Button onClick={startInterview} disabled={!jobTitle} variant="gradient">ابدأ</Button>
           </div>
        </Card>
      ) : (
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-slate-200 dark:border-surface-700 flex flex-col h-[500px] shadow-sm overflow-hidden">
           {/* Header */}
           <div className="p-4 border-b border-slate-100 dark:border-surface-700 bg-slate-50 dark:bg-surface-900 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">مقابلة: {jobTitle}</h3>
                <span className="text-xs text-green-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> متصل</span>
              </div>
              <Button size="sm" variant="danger" onClick={() => { setActive(false); setMessages([]); }}>إنهاء</Button>
           </div>
           
           {/* Chat Area */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-surface-900/50">
              {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user' 
                        ? 'bg-primary-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-surface-700 border border-slate-200 dark:border-surface-600 rounded-bl-none text-slate-700 dark:text-slate-200'
                    }`}>
                       {msg.text}
                    </div>
                 </div>
              ))}
              {loading && (
                 <div className="flex justify-start">
                    <div className="bg-white dark:bg-surface-700 p-3 rounded-2xl rounded-bl-none border border-slate-200 dark:border-surface-600 flex gap-1">
                       <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                       <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
           </div>

           {/* Input Area */}
           <div className="p-4 bg-white dark:bg-surface-800 border-t border-slate-100 dark:border-surface-700">
              <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                   placeholder="اكتب إجابتك هنا..."
                   className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-surface-600 bg-slate-50 dark:bg-surface-900 focus:ring-2 focus:ring-primary-500 outline-none"
                   disabled={loading}
                 />
                 <Button onClick={handleSend} disabled={loading || !input.trim()} variant="primary">
                    <svg className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENT: LINKEDIN HELPER ---
const LinkedInHelper = () => {
  const [mode, setMode] = useState<'bio' | 'post'>('bio');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await generateLinkedInContent(mode, input);
      setOutput(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('تم النسخ!');
  };

  return (
    <div className="animate-fade-in">
       <Card title="💼 مساعد LinkedIn الذكي">
          <div className="flex gap-4 border-b border-slate-200 dark:border-surface-600 mb-6">
             <button onClick={() => setMode('bio')} className={`pb-2 px-4 font-bold text-sm border-b-2 transition-colors ${mode === 'bio' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'}`}>
                تحديث النبذة (Bio)
             </button>
             <button onClick={() => setMode('post')} className={`pb-2 px-4 font-bold text-sm border-b-2 transition-colors ${mode === 'post' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'}`}>
                كتابة منشور (Post)
             </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                   {mode === 'bio' ? 'أدخل معلوماتك الأساسية (الدور، الخبرة، الاهتمامات)' : 'عن ماذا تريد أن تكتب اليوم؟'}
                </label>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  placeholder={mode === 'bio' ? "مثال: مهندس برمجيات، 3 سنوات خبرة، مهتم بالذكاء الاصطناعي..." : "مثال: حصلت على شهادة جديدة وأريد مشاركة تجربتي..."}
                />
                <Button onClick={handleGenerate} isLoading={loading} fullWidth variant="primary">توليد المحتوى ✨</Button>
             </div>

             <div className="bg-slate-50 dark:bg-surface-900 rounded-xl p-6 border border-slate-200 dark:border-surface-700 relative min-h-[200px]">
                {output ? (
                   <>
                     <button onClick={copyToClipboard} className="absolute top-4 left-4 text-xs bg-white dark:bg-surface-700 px-2 py-1 rounded shadow-sm hover:text-primary-600">نسخ النص</button>
                     <ReactMarkdown className="prose prose-sm dark:prose-invert whitespace-pre-wrap mt-4">{output}</ReactMarkdown>
                   </>
                ) : (
                   <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                      سيظهر المحتوى المولد هنا...
                   </div>
                )}
             </div>
          </div>
       </Card>
    </div>
  );
};

// --- MAIN WRAPPER ---
const ToolsLibrary: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'jobfinder' | 'resume' | 'interview' | 'linkedin'>('jobfinder');

  return (
    <div className="animate-fade-in w-full pb-20">
      <div className="text-center mb-10">
         <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-3">🛠️ أدوات مهنية ذكية</h2>
         <p className="text-slate-500">مجموعة من الأدوات المدعومة بالذكاء الاصطناعي لرفع جاهزيتك الوظيفية.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
         {/* Sidebar Navigation */}
         <div className="md:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTool('jobfinder')}
              className={`w-full text-right p-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTool === 'jobfinder' ? 'bg-amber-600 text-white shadow-lg' : 'bg-white dark:bg-surface-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-surface-700'}`}
            >
               <span>🔍</span> باحث الوظائف
            </button>
            <button 
              onClick={() => setActiveTool('resume')}
              className={`w-full text-right p-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTool === 'resume' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-surface-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-surface-700'}`}
            >
               <span>📄</span> محلل السيرة الذاتية
            </button>
            <button 
              onClick={() => setActiveTool('interview')}
              className={`w-full text-right p-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTool === 'interview' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-surface-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-surface-700'}`}
            >
               <span>🎤</span> محاكي المقابلات
            </button>
            <button 
              onClick={() => setActiveTool('linkedin')}
              className={`w-full text-right p-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTool === 'linkedin' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-surface-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-surface-700'}`}
            >
               <span>💼</span> مساعد LinkedIn
            </button>
         </div>

         {/* Content Area */}
         <div className="md:col-span-3 min-h-[500px]">
            {activeTool === 'jobfinder' && <JobFinder />}
            {activeTool === 'resume' && <ResumeAnalyzer />}
            {activeTool === 'interview' && <MockInterviewer />}
            {activeTool === 'linkedin' && <LinkedInHelper />}
         </div>
      </div>
    </div>
  );
};

export default ToolsLibrary;
