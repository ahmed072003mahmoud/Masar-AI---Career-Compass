
import React, { useState } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import ReactMarkdown from 'react-markdown';
import { generateLinkedInContent } from '../../services/geminiService';

const LinkedInHelper = () => {
  const [mode, setMode] = useState<'bio' | 'post'>('bio');
  const [tone, setTone] = useState<string>('Professional');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await generateLinkedInContent(mode, input, tone);
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
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">نبرة الصوت (Tone)</label>
                    <div className="flex gap-2">
                        {['Professional', 'Storytelling', 'Viral'].map((t) => (
                            <button 
                                key={t} 
                                onClick={() => setTone(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${tone === t ? 'bg-slate-800 text-white border-slate-800' : 'bg-white dark:bg-surface-800 border-slate-200 dark:border-surface-600'}`}
                            >
                                {t === 'Professional' ? 'رسمي' : t === 'Storytelling' ? 'قصصي' : 'تفاعلي (Viral)'}
                            </button>
                        ))}
                    </div>
                </div>

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

export default LinkedInHelper;
