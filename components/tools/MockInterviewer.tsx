
import React, { useState } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { getInterviewQuestion } from '../../services/geminiService';
import { ChatMessage } from '../../types';

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

export default MockInterviewer;
