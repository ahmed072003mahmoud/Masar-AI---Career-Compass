
import React, { useState, useEffect, useRef } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { getInterviewQuestion } from '../../services/geminiService';
import { ChatMessage } from '../../types';

// Browser Speech Recognition Interface
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const MockInterviewer = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [active, setActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Speech Recognition Reference
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
      const SpeechRecognitionConstructor = SpeechRecognition || webkitSpeechRecognition;
      
      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = false;
        recognition.lang = 'ar-SA';
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 1;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const startInterview = async () => {
    if (!jobTitle) return;
    setActive(true);
    setLoading(true);
    const q = await getInterviewQuestion([], jobTitle);
    setMessages([{ id: '1', role: 'model', text: q }]);
    speakText(q);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Stop speaking if user interrupts
    window.speechSynthesis.cancel();

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = [...messages, userMsg].map(m => ({ role: m.role, text: m.text }));
    const aiResponse = await getInterviewQuestion(history, jobTitle);
    
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: aiResponse }]);
    speakText(aiResponse);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {!active ? (
        <Card className="product-card text-center p-10 shadow-xl border-none">
           <div className="mb-6 relative inline-block">
             <span className="text-6xl">🎤</span>
             <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-bounce">AI Voice</div>
           </div>
           <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">محاكي المقابلات الشخصية (صوت وكتابة)</h3>
           <p className="text-slate-500 mb-8 max-w-md mx-auto">
             تدرب بثقة. سيقوم الذكاء الاصطناعي بلعب دور مسؤول التوظيف، وسيتحدث معك صوتياً لتقييم إجاباتك.
           </p>
           <div className="flex gap-3 max-w-md mx-auto">
              <input 
                type="text" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="اسم الوظيفة (مثال: مدير مبيعات)"
                className="flex-1 p-4 rounded-xl border border-slate-200 dark:border-surface-600 bg-slate-50 dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
              <Button onClick={startInterview} disabled={!jobTitle} className="btn-blue-gradient px-6">ابدأ</Button>
           </div>
        </Card>
      ) : (
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-slate-200 dark:border-surface-700 flex flex-col h-[600px] shadow-2xl overflow-hidden product-card">
           {/* Header */}
           <div className="p-4 border-b border-slate-100 dark:border-surface-700 bg-slate-50 dark:bg-surface-900 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSpeaking ? 'bg-green-100 text-green-600 scale-110 shadow-green-200 shadow-lg' : 'bg-primary-100 dark:bg-primary-900 text-primary-600'}`}>
                   {isSpeaking ? (
                     <span className="animate-pulse text-xl">🔊</span>
                   ) : (
                     <span className="text-xl">🤖</span>
                   )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">المقابل الذكي</h3>
                  <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> متصل
                  </span>
                </div>
              </div>
              <Button size="sm" variant="danger" onClick={() => { setActive(false); setMessages([]); window.speechSynthesis.cancel(); }}>إنهاء</Button>
           </div>
           
           {/* Chat Area */}
           <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-surface-900/30 scroll-smooth">
              {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm relative group transition-all duration-300 ${
                        msg.role === 'user' 
                        ? 'bg-primary-600 text-white rounded-br-sm' 
                        : 'bg-white dark:bg-surface-700 border border-slate-100 dark:border-surface-600 rounded-bl-sm text-slate-700 dark:text-slate-200'
                    }`}>
                       {msg.text}
                       {msg.role === 'model' && (
                           <button 
                             onClick={() => speakText(msg.text)}
                             className="absolute -bottom-7 left-0 text-slate-400 hover:text-primary-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs" 
                             title="إعادة الاستماع"
                           >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                              استماع
                           </button>
                       )}
                    </div>
                 </div>
              ))}
              {loading && (
                 <div className="flex justify-start animate-fade-in">
                    <div className="bg-white dark:bg-surface-700 p-4 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center">
                       <span className="text-xs text-slate-400 font-bold ml-2">جاري التفكير</span>
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
              <div className="flex gap-3 items-end">
                 <div className="flex-1 relative">
                    <textarea 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={isListening ? "جاري الاستماع..." : "اكتب ردك هنا..."}
                      className={`w-full p-4 rounded-xl border transition-all resize-none max-h-32 focus:ring-2 outline-none
                        ${isListening 
                          ? 'border-red-400 ring-2 ring-red-100 bg-red-50 dark:bg-red-900/10 placeholder-red-400' 
                          : 'border-slate-200 dark:border-surface-600 bg-slate-50 dark:bg-surface-900 focus:ring-primary-500'
                        }
                      `}
                      rows={1}
                      disabled={loading}
                    />
                    {recognitionRef.current && (
                      <button 
                        onClick={toggleListening}
                        className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-red-500/50 shadow-lg' : 'text-slate-400 hover:text-primary-600 hover:bg-slate-200 dark:hover:bg-surface-700'}`}
                        title={isListening ? "إيقاف الاستماع" : "تحدث"}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {isListening ? (
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          )}
                        </svg>
                      </button>
                    )}
                 </div>
                 <button 
                   onClick={handleSend} 
                   disabled={loading || !input.trim()} 
                   className="w-14 h-14 rounded-xl btn-blue-gradient flex items-center justify-center shadow-lg disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all"
                 >
                    <svg className="w-6 h-6 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MockInterviewer;
