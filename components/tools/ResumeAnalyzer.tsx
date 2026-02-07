
import React, { useState } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import ReactMarkdown from 'react-markdown';
import { useToast } from '../../contexts/ToastContext';
import { analyzeResume } from '../../services/geminiService';
import { ResumeAnalysisResult } from '../../types';

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
                 {/* Detailed Report */}
                 <Card className="bg-slate-50/50 dark:bg-surface-700/50 border-slate-200 dark:border-surface-600">
                    <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2">📄 الملخص التنفيذي</h4>
                    <div className="prose prose-sm dark:prose-invert">
                        <ReactMarkdown>{result.summary}</ReactMarkdown>
                    </div>
                 </Card>

                 <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-green-50/50 border-green-100 dark:border-green-900/30">
                        <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">✅ نقاط القوة</h4>
                        <ul className="space-y-1">
                          {result.strengths.slice(0, 4).map((s, i) => (
                             <li key={i} className="text-xs font-medium text-green-800 flex items-start gap-1">
                                <span>•</span> {s}
                             </li>
                          ))}
                        </ul>
                    </Card>
                    <Card className="bg-red-50/50 border-red-100 dark:border-red-900/30">
                        <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">⚠️ كلمات مفتاحية مفقودة</h4>
                        <div className="flex flex-wrap gap-1">
                        {result.missingKeywords.slice(0, 6).map((k, i) => (
                             <span key={i} className="px-2 py-0.5 bg-white rounded text-[10px] text-red-800 border border-red-100 font-bold">{k}</span>
                          ))}
                        </div>
                    </Card>
                 </div>
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

export default ResumeAnalyzer;
