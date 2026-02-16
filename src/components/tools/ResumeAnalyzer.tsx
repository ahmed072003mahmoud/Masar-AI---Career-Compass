
import React, { useState, useRef } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import ReactMarkdown from 'react-markdown';
import { useToast } from '../../contexts/ToastContext';
import { analyzeResume } from '../../services/geminiService';
import { ResumeAnalysisResult } from '../../types';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [targetJob, setTargetJob] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      showToast('يرجى رفع ملف PDF فقط', 'error');
      return;
    }
    setFile(selectedFile);
    showToast('تم رفع الملف بنجاح', 'success');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !targetJob) {
      showToast('يرجى رفع السيرة الذاتية وتحديد المسمى الوظيفي', 'warning');
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
          const analysis = await analyzeResume(base64String, targetJob);
          setResult(analysis);
          showToast('تم التحليل بنجاح', 'success');
        } catch (err) {
          showToast('فشل تحليل الملف. تأكد من أنه نصي وليس صورة.', 'error');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const element = document.getElementById('resume-analysis-report');
    if (!element) return;
    const opt = {
      margin: 10,
      filename: `ats-report-${targetJob}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {!result ? (
        <Card className="product-card border-none shadow-xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">🔍 محلل السيرة الذاتية (ATS Scanner)</h3>
            <p className="text-slate-500">ارفع سيرتك الذاتية لنتحقق من توافقها مع الوظيفة المطلوبة باستخدام الذكاء الاصطناعي.</p>
          </div>
          
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">الوظيفة المستهدفة</label>
              <input 
                type="text" 
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                placeholder="مثال: Software Engineer..."
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-surface-600 bg-slate-50 dark:bg-surface-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>

            <div 
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all relative cursor-pointer group
                    ${isDragging 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-105' 
                        : 'border-slate-300 dark:border-surface-600 bg-slate-50 dark:bg-surface-800/50 hover:bg-slate-100 dark:hover:bg-surface-800'
                    }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
              <div className="pointer-events-none">
                 <div className="text-5xl mb-4 transition-transform group-hover:-translate-y-2">
                    {file ? '📄' : '📤'}
                 </div>
                 <p className="font-bold text-slate-700 dark:text-slate-200 text-lg mb-1">
                   {file ? file.name : 'اسحب الملف هنا أو اضغط للرفع'}
                 </p>
                 {!file && <p className="text-xs text-slate-400">ملفات PDF فقط (الحد الأقصى 2MB)</p>}
              </div>
              {file && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="absolute top-4 right-4 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                    title="إزالة الملف"
                  >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              )}
            </div>

            <Button onClick={handleAnalyze} isLoading={loading} fullWidth disabled={!file || !targetJob} className="btn-blue-gradient py-4 text-lg shadow-lg">
              بدء الفحص الشامل
            </Button>
          </div>
        </Card>
      ) : (
        <div className="animate-fade-in-up space-y-6" id="resume-analysis-report">
           <div className="grid md:grid-cols-3 gap-6">
              {/* Score Card */}
              <div className="product-card p-8 flex flex-col items-center justify-center text-center col-span-1 bg-white dark:bg-surface-800">
                 <div className="relative w-32 h-32 mb-4 group">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-100 dark:text-surface-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path className={`${result.matchScore > 75 ? 'text-green-500' : result.matchScore > 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`} strokeDasharray={`${result.matchScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-800 dark:text-white group-hover:scale-110 transition-transform">{result.matchScore}%</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">نسبة التطابق</span>
                    </div>
                 </div>
                 <h4 className="font-bold text-slate-700 dark:text-slate-200">{result.matchScore > 75 ? 'ممتاز! جاهز للتقديم' : 'يحتاج بعض التحسينات'}</h4>
              </div>

              {/* Summary */}
              <div className="product-card p-6 md:col-span-2 flex flex-col">
                 <div className="flex justify-between items-start mb-4 border-b pb-2">
                    <h4 className="font-bold text-slate-800 dark:text-white">📋 تقرير التحليل</h4>
                    <button onClick={downloadReport} className="text-xs flex items-center gap-1 text-primary-600 hover:text-primary-700 font-bold bg-primary-50 px-2 py-1 rounded">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        PDF
                    </button>
                 </div>
                 <div className="prose prose-sm dark:prose-invert flex-1 overflow-y-auto max-h-40">
                    <ReactMarkdown>{result.summary}</ReactMarkdown>
                 </div>
              </div>
           </div>

           <div className="grid md:grid-cols-2 gap-6">
              <div className="product-card p-6 border-t-4 border-green-500">
                  <h4 className="font-bold text-green-700 mb-4 flex items-center gap-2">✅ نقاط القوة</h4>
                  <ul className="space-y-3">
                    {result.strengths.map((s, i) => (
                       <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0 shadow-sm shadow-green-500/50"></span>
                          {s}
                       </li>
                    ))}
                  </ul>
              </div>
              <div className="product-card p-6 border-t-4 border-red-500">
                  <h4 className="font-bold text-red-700 mb-4 flex items-center gap-2">⚠️ نواقص هامة (Keywords)</h4>
                  <div className="flex flex-wrap gap-2 mb-6">
                  {result.missingKeywords.map((k, i) => (
                       <span key={i} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/30 font-bold">{k}</span>
                    ))}
                  </div>
                  <h5 className="font-bold text-slate-700 dark:text-slate-300 mt-6 mb-2 text-sm flex items-center gap-2">
                      <span className="text-amber-500">💡</span> نصائح التحسين:
                  </h5>
                  <ul className="space-y-2">
                    {result.improvementTips.slice(0, 3).map((tip, i) => (
                        <li key={i} className="text-xs text-slate-500 dark:text-slate-400 flex gap-2">
                            <span>•</span> {tip}
                        </li>
                    ))}
                  </ul>
              </div>
           </div>

           <div className="flex justify-center pt-6">
              <Button onClick={() => {setResult(null); setFile(null);}} variant="secondary" className="px-8">تحليل ملف جديد</Button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
