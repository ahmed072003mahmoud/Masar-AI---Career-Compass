
import React, { useState } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { generateQuiz, QuizQuestion } from '../../services/geminiService';

const SkillQuiz = () => {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [submitted, setSubmitted] = useState(false);

  const startQuiz = async () => {
    if (!topic) return;
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    try {
      const qs = await generateQuiz(topic, 'Intermediate');
      setQuestions(qs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIdx: number, option: string) => {
    if (submitted) return;
    setAnswers(prev => ({...prev, [qIdx]: option}));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) score++;
    });
    return score;
  };

  return (
    <div className="animate-fade-in space-y-6">
      <Card className="product-card p-8 border-none shadow-xl">
        <div className="text-center mb-6">
           <h3 className="text-2xl font-bold text-slate-800 dark:text-white">🧠 الاختبار التقني الذكي</h3>
           <p className="text-slate-500">اختبر معلوماتك في أي مجال. الذكاء الاصطناعي سيولد لك أسئلة جديدة في كل مرة.</p>
        </div>

        <div className="flex gap-3 max-w-lg mx-auto mb-8">
            <input 
              type="text" 
              value={topic} 
              onChange={(e) => setTopic(e.target.value)}
              placeholder="موضوع الاختبار (مثال: React Basics, Python...)"
              className="flex-1 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <Button onClick={startQuiz} isLoading={loading} disabled={!topic} className="btn-blue-gradient px-6">ابدأ</Button>
        </div>

        {questions.length > 0 && (
          <div className="space-y-8 text-right animate-fade-in-up">
             {questions.map((q, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-surface-900/50 p-6 rounded-2xl border border-slate-200 dark:border-surface-700">
                   <h4 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">س{idx+1}: {q.question}</h4>
                   <div className="space-y-2">
                      {q.options.map((opt) => {
                         let btnClass = "w-full p-3 rounded-lg text-right border transition-all ";
                         if (submitted) {
                            if (opt === q.correct) btnClass += "bg-green-100 border-green-500 text-green-800 font-bold";
                            else if (answers[idx] === opt && opt !== q.correct) btnClass += "bg-red-100 border-red-500 text-red-800";
                            else btnClass += "bg-white border-slate-200 opacity-60";
                         } else {
                            btnClass += answers[idx] === opt 
                              ? "bg-primary-50 border-primary-500 text-primary-700 font-bold shadow-sm" 
                              : "bg-white border-slate-200 hover:bg-slate-50";
                         }

                         return (
                           <button 
                             key={opt} 
                             onClick={() => handleSelect(idx, opt)}
                             className={btnClass}
                           >
                             {opt}
                           </button>
                         )
                      })}
                   </div>
                   {submitted && (
                      <div className="mt-4 text-sm text-slate-600 bg-white p-3 rounded border border-slate-100">
                         <strong>💡 الشرح:</strong> {q.explanation}
                      </div>
                   )}
                </div>
             ))}

             {!submitted && (
                <Button onClick={() => setSubmitted(true)} fullWidth className="btn-blue-gradient py-3">تسليم الإجابات</Button>
             )}

             {submitted && (
                <div className="text-center p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                   <h3 className="text-xl font-bold text-indigo-900">النتيجة: {calculateScore()} / {questions.length}</h3>
                   <Button onClick={startQuiz} variant="ghost" className="mt-2">اختبار جديد</Button>
                </div>
             )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SkillQuiz;
