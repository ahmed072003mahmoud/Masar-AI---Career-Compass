
import React, { useState, useEffect } from 'react';
import { MarketData, MarketAnalysisResult } from '../types';
import { analyzeMarket } from '../services/geminiService';
import Card from './UI/Card';
import Button from './UI/Button';
import Autocomplete from './UI/Autocomplete';
import { useToast } from '../contexts/ToastContext';

interface Props {
  initialData: MarketData;
  initialAnalysis?: MarketAnalysisResult | null;
  onNext: (data: MarketData, analysis: MarketAnalysisResult) => void;
  onBack: () => void;
}

const commonJobs = ["مطور برمجيات", "أخصائي أمن سيبراني", "عالم بيانات", "مدير منتج", "مسوق رقمي", "محاسب", "مهندس مدني", "أخصائي موارد بشرية"];
const commonLocations = ["الرياض", "جدة", "الدمام", "دبي", "أبو ظبي", "القاهرة", "العمل عن بعد"];

// Loading State Component
const LoadingState = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = [
    "جاري الاتصال بقواعد بيانات السوق المباشرة...",
    "تحليل نطاقات الرواتب في منطقتك...",
    "فحص مستويات المنافسة والطلب...",
    "تجميع المهارات الأكثر طلباً...",
    "صياغة الملخص التنفيذي..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-surface-800 rounded-3xl p-8 border border-slate-100 dark:border-surface-700">
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 border-4 border-slate-100 dark:border-surface-600 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-primary-600">AI</div>
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 animate-pulse">
        {messages[msgIndex]}
      </h3>
      <p className="text-slate-500 text-sm">يستخدم هذا التحليل محرك Google Search المباشر</p>
    </div>
  );
};

const MarketResearchStep: React.FC<Props> = ({ initialData, initialAnalysis, onNext, onBack }) => {
  const [field, setField] = useState(initialData.field);
  const [location, setLocation] = useState(initialData.location);
  // New input fields
  const [companies, setCompanies] = useState(initialData.targetCompanies || '');
  const [industry, setIndustry] = useState(initialData.industryFocus || '');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketAnalysisResult | null>(initialAnalysis || null);
  const { showToast } = useToast();

  const handleAnalyze = async () => {
    if (!field || !location) {
       showToast('يرجى تحديد المسار والموقع', 'warning');
       return;
    }
    setLoading(true);
    try {
      const data = await analyzeMarket(field, location, companies, undefined, industry);
      setResult(data);
      showToast('تم جلب بيانات السوق الحية', 'success');
    } catch (err) {
      showToast('فشل في تحليل السوق', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getSalaryWidth = (min: number, max: number, highestMax: number) => {
    const safeMax = highestMax || 1;
    const left = (min / safeMax) * 100;
    const width = ((max - min) / safeMax) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  const calculateAverageSalary = () => {
    if (!result || result.salaryData.length === 0) return 0;
    const total = result.salaryData.reduce((acc, curr) => acc + (curr.min + curr.max) / 2, 0);
    return total / result.salaryData.length;
  };

  const highestSalary = result ? Math.max(...result.salaryData.map(s => s.max)) * 1.15 : 10000;
  const averageSalary = calculateAverageSalary();

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto w-full p-2 md:p-6 pb-24 animate-fade-in">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">جاري مسح السوق...</h2>
        </div>
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full p-2 md:p-6 animate-fade-in pb-24">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">تحليل واقع السوق 📊</h2>
        <p className="text-slate-500">بيانات حية ومباشرة حول الرواتب، الطلب، والمنافسة.</p>
      </div>

      {!result && (
        <Card variant="gradient" padding="lg" className="mb-8 border-indigo-100 dark:border-indigo-900 shadow-xl">
           <div className="flex flex-col gap-4">
               <div className="flex flex-col md:flex-row items-end gap-4">
                  <div className="flex-1 w-full">
                     <Autocomplete 
                       label="المسار المهني المستهدف" 
                       options={commonJobs} 
                       value={field} 
                       onChange={setField} 
                       placeholder="اكتب اسم الوظيفة..." 
                       icon={<span className="text-lg">💼</span>}
                     />
                  </div>
                  <div className="flex-1 w-full">
                     <Autocomplete 
                       label="النطاق الجغرافي" 
                       options={commonLocations} 
                       value={location} 
                       onChange={setLocation} 
                       placeholder="المدينة أو المنطقة" 
                       icon={<span className="text-lg">📍</span>}
                     />
                  </div>
               </div>
               
               <div className="flex flex-col md:flex-row items-end gap-4">
                   <div className="flex-1 w-full">
                       <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">شركات مستهدفة (اختياري)</label>
                       <input 
                         type="text" 
                         className="w-full p-3 md:p-4 bg-slate-50 dark:bg-surface-800/50 border border-slate-200 dark:border-surface-600 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                         placeholder="مثال: أرامكو، STC..."
                         value={companies}
                         onChange={(e) => setCompanies(e.target.value)}
                       />
                   </div>
                   <div className="flex-1 w-full">
                       <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">القطاع / الصناعة (اختياري)</label>
                       <input 
                         type="text" 
                         className="w-full p-3 md:p-4 bg-slate-50 dark:bg-surface-800/50 border border-slate-200 dark:border-surface-600 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                         placeholder="مثال: التقنية المالية، الطاقة..."
                         value={industry}
                         onChange={(e) => setIndustry(e.target.value)}
                       />
                   </div>
               </div>
               
               <div className="w-full mt-2">
                 <Button onClick={handleAnalyze} isLoading={loading} variant="primary" size="lg" className="h-[52px] w-full shadow-lg shadow-primary-500/20">
                    بدء التحليل
                 </Button>
               </div>
           </div>
           
           <div className="mt-6 flex flex-wrap gap-2 justify-center">
             <span className="text-xs font-bold text-slate-400 ml-2">مقترحات سريعة:</span>
             {['مدير منتج', 'عالم بيانات', 'مسوق رقمي'].map(job => (
                <button 
                  key={job} 
                  onClick={() => setField(job)}
                  className="text-xs bg-white/50 dark:bg-black/20 hover:bg-white px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 transition-colors"
                >
                  {job}
                </button>
             ))}
           </div>
        </Card>
      )}

      {/* DASHBOARD RESULT */}
      {result && (
        <div className="space-y-6 animate-slide-in-up">
          {/* 1. Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Card className="text-center p-4 hover:scale-[1.02] transition-transform">
                <div className="text-2xl mb-2 bg-green-50 w-12 h-12 flex items-center justify-center rounded-full mx-auto">📈</div>
                <div className="text-xs text-slate-500 font-bold mb-1">معدل النمو</div>
                <div className="text-xl font-black text-green-600">{result.growthRate}</div>
             </Card>
             <Card className="text-center p-4 hover:scale-[1.02] transition-transform">
                <div className="text-2xl mb-2 bg-amber-50 w-12 h-12 flex items-center justify-center rounded-full mx-auto">⚔️</div>
                <div className="text-xs text-slate-500 font-bold mb-1">المنافسة</div>
                <div className={`text-xl font-black ${result.competitionLevel === 'High' ? 'text-red-500' : 'text-amber-500'}`}>
                   {result.competitionLevel === 'High' ? 'عالية' : result.competitionLevel === 'Medium' ? 'متوسطة' : 'منخفضة'}
                </div>
             </Card>
             <Card className="text-center p-4 hover:scale-[1.02] transition-transform">
                <div className="text-2xl mb-2 bg-blue-50 w-12 h-12 flex items-center justify-center rounded-full mx-auto">🚪</div>
                <div className="text-xs text-slate-500 font-bold mb-1">سهولة الدخول</div>
                <div className="text-xl font-black text-blue-600">{result.entryDifficulty || 'متوسط'}</div>
             </Card>
             <Card className="text-center p-4 hover:scale-[1.02] transition-transform">
                <div className="text-2xl mb-2 bg-purple-50 w-12 h-12 flex items-center justify-center rounded-full mx-auto">📅</div>
                <div className="text-xs text-slate-500 font-bold mb-1">تاريخ البيانات</div>
                <div className="text-xl font-black text-slate-700 dark:text-slate-300">2024/25</div>
             </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
             {/* 2. Salary Chart */}
             <div className="md:col-span-2">
                <Card title="💰 سلم الرواتب التقديري" className="h-full border-emerald-100 dark:border-emerald-900/30">
                   <div className="space-y-8 mt-6 px-2 relative">
                      {/* Average Line Indicator */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-slate-300 border-l border-dashed z-0" style={{ left: `${(averageSalary / highestSalary) * 100}%` }}>
                         <div className="absolute -top-6 -translate-x-1/2 text-[10px] bg-slate-200 text-slate-600 px-1 rounded whitespace-nowrap">المتوسط العام</div>
                      </div>

                      {result.salaryData.map((range, idx) => {
                         const style = getSalaryWidth(range.min, range.max, highestSalary);
                         const mid = (range.min + range.max) / 2;
                         const status = mid > averageSalary * 1.1 ? 'above' : mid < averageSalary * 0.9 ? 'below' : 'avg';
                         
                         return (
                           <div key={idx} className="relative group z-10">
                              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                 <span className="bg-slate-100 dark:bg-surface-700 px-2 py-1 rounded flex items-center gap-2">
                                    {range.level}
                                    {status === 'above' && <span className="text-green-500">▲</span>}
                                    {status === 'below' && <span className="text-red-500">▼</span>}
                                 </span>
                                 <span className="text-emerald-600 dark:text-emerald-400">{range.max.toLocaleString()} {range.currency}</span>
                              </div>
                              <div className="h-3 bg-slate-100 dark:bg-surface-700 rounded-full w-full relative overflow-hidden">
                                 <div 
                                   className="absolute h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full group-hover:from-emerald-300 group-hover:to-emerald-500 transition-all duration-500"
                                   style={{ left: style.left, width: style.width }}
                                 ></div>
                              </div>
                              {/* Floating Min Label */}
                              <div 
                                className="absolute top-8 text-[10px] font-bold text-slate-400 -translate-x-1/2"
                                style={{ left: style.left }}
                              >
                                {range.min.toLocaleString()}
                              </div>
                           </div>
                         );
                      })}
                   </div>
                   <div className="mt-8 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2 relative z-10">
                      <span className="text-lg">💡</span>
                      <p>هذه الأرقام تمثل المتوسط العام، قد تختلف بناءً على الشركة والمهارات الإضافية. الخط المتقطع يمثل متوسط السوق.</p>
                   </div>
                </Card>
             </div>

             {/* 3. Geo Distribution */}
             <div className="md:col-span-1">
                <Card title="📍 التوزيع الجغرافي للفرص" className="h-full">
                   <div className="space-y-5 mt-2">
                      {result.geoData.map((geo, idx) => (
                         <div key={idx}>
                            <div className="flex justify-between text-sm font-bold mb-1.5">
                               <span>{geo.city}</span>
                               <span className="text-indigo-600">{geo.percentage}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 dark:bg-surface-700 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500 rounded-full relative" style={{ width: `${geo.percentage}%` }}>
                                  <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </Card>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             {/* 4. Skills Cloud */}
             <Card title="🧠 المهارات الأكثر طلباً (Top Skills)">
                <div className="flex flex-wrap gap-2 mt-2">
                   {result.topSkills.map((skill, idx) => (
                      <span key={idx} className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all hover:-translate-y-1 cursor-default
                         ${idx < 3 ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/20' : 'bg-white dark:bg-surface-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-surface-600'}`}>
                         {skill}
                      </span>
                   ))}
                </div>
             </Card>

             {/* 5. Summary Text */}
             <Card variant="glass" className="bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 flex flex-col justify-center">
                <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                   <span className="text-xl">📝</span> ملخص الذكاء الاصطناعي
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm font-medium">
                   {result.summary}
                </p>
             </Card>
          </div>

          {/* Sources (if any) */}
          {result.sources && result.sources.length > 0 && (
             <div className="text-xs text-slate-400 mt-2">
                المصادر: {result.sources.map((s, i) => <a key={i} href={s.url} target="_blank" rel="noreferrer" className="underline hover:text-primary-500 mr-2">{s.title}</a>)}
             </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-surface-700 sticky bottom-4 z-20">
             <Button onClick={() => {setResult(null); window.scrollTo({top:0, behavior:'smooth'});}} variant="secondary">
                بحث جديد
             </Button>
             <Button onClick={() => onNext({ ...initialData, field, location, targetCompanies: companies, industryFocus: industry }, result)} variant="gradient" rightIcon={<span>←</span>} className="shadow-xl">
                اعتماد التحليل وبناء الخطة
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketResearchStep;
