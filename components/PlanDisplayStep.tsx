
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { AppState, GeneratedPlanData, SkillNode } from '../types';
import { generateCareerPlan } from '../services/geminiService';
import Card from './UI/Card';
import Button from './UI/Button';
import { useToast } from '../contexts/ToastContext';

interface Props {
  userData: AppState['userData'];
  marketData: AppState['marketData'];
  marketAnalysis: any; // Using formatted result from previous step
  initialPlan?: any;
  onRestart: () => void;
}

const SkillGalaxyGraph: React.FC<{ skills: SkillNode[] }> = ({ skills }) => {
  const width = 800;
  const height = 500;
  const cx = width / 2;
  const cy = height / 2;
  const centerRadius = 50;

  const hardSkills = skills.filter(s => s.type === 'hard');
  const softSkills = skills.filter(s => s.type === 'soft');

  const calculateNodes = (items: SkillNode[], startAngle: number, endAngle: number, radius: number) => {
    if (items.length === 0) return [];
    const span = endAngle - startAngle;
    const step = items.length > 1 ? span / (items.length - 1) : 0;
    
    return items.map((skill, i) => {
      // Center items if only one
      const angle = items.length === 1 ? startAngle + span/2 : startAngle + (i * step);
      // Add slight randomness to radius for "organic" look
      const r = radius + (i % 2 === 0 ? 15 : -15);
      
      return {
        ...skill,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        size: skill.importance === 'critical' ? 24 : 16
      };
    });
  };

  // Right side for Hard Skills (-60 to 60 degrees)
  const hardNodes = calculateNodes(hardSkills, -Math.PI / 3, Math.PI / 3, 200);
  
  // Left side for Soft Skills (120 to 240 degrees)
  const softNodes = calculateNodes(softSkills, Math.PI * 0.7, Math.PI * 1.3, 200);

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl relative" style={{ height: '500px' }}>
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
         <div className="flex items-center gap-2 text-xs text-white"><span className="w-3 h-3 rounded-full bg-blue-500"></span> مهارة تقنية</div>
         <div className="flex items-center gap-2 text-xs text-white"><span className="w-3 h-3 rounded-full bg-purple-500"></span> مهارة ناعمة</div>
      </div>
      
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Center Node */}
        <circle cx={cx} cy={cy} r={centerRadius} fill="#1e293b" stroke="#64748b" strokeWidth="2" />
        <text x={cx} y={cy} textAnchor="middle" dy=".3em" fill="#f8fafc" fontSize="14" fontWeight="bold">المسار المهني</text>
        <circle cx={cx} cy={cy} r={centerRadius + 10} fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="5,5" className="animate-[spin_10s_linear_infinite]" />

        {/* Links */}
        {[...hardNodes, ...softNodes].map((node, i) => (
          <line 
            key={`link-${i}`}
            x1={cx} y1={cy} x2={node.x} y2={node.y} 
            stroke={node.type === 'hard' ? '#3b82f6' : '#a855f7'} 
            strokeWidth="1" 
            opacity="0.3"
          />
        ))}

        {/* Nodes */}
        {[...hardNodes, ...softNodes].map((node, i) => (
           <g 
             key={`node-${i}`} 
             onMouseEnter={() => setHoveredNode(node.name)}
             onMouseLeave={() => setHoveredNode(null)}
             className="cursor-pointer transition-all duration-300"
             style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
           >
             <circle 
               cx={node.x} cy={node.y} r={node.size + (hoveredNode === node.name ? 5 : 0)} 
               fill={node.type === 'hard' ? '#3b82f6' : '#a855f7'} 
               className="transition-all duration-300 shadow-lg"
             />
             <circle 
               cx={node.x} cy={node.y} r={node.size + 8} 
               fill="none"
               stroke={node.type === 'hard' ? '#3b82f6' : '#a855f7'} 
               strokeWidth="1"
               opacity={hoveredNode === node.name ? 1 : 0}
               className="transition-opacity duration-300"
             />
             <text 
               x={node.x} 
               y={node.y + node.size + 15} 
               textAnchor="middle" 
               fill="#f8fafc" 
               fontSize="12" 
               fontWeight={hoveredNode === node.name ? "bold" : "normal"}
               className="select-none shadow-black drop-shadow-md"
             >
               {node.name}
             </text>
             
             {/* Tooltip on hover */}
             {hoveredNode === node.name && (
                <g>
                   <rect x={node.x - 60} y={node.y - node.size - 40} width="120" height="30" rx="4" fill="white" opacity="0.9" />
                   <text x={node.x} y={node.y - node.size - 20} textAnchor="middle" fill="black" fontSize="10" fontWeight="bold">
                     المستوى: {node.level === 'beginner' ? 'مبتدئ' : node.level === 'intermediate' ? 'متوسط' : 'متقدم'}
                   </text>
                </g>
             )}
           </g>
        ))}
      </svg>
    </div>
  );
};

const PlanDisplayStep: React.FC<Props> = ({ userData, marketData, marketAnalysis, initialPlan, onRestart }) => {
  const [planData, setPlanData] = useState<GeneratedPlanData | null>(initialPlan ? (typeof initialPlan === 'string' ? null : initialPlan) : null);
  const [loading, setLoading] = useState(!initialPlan);
  const [activeTab, setActiveTab] = useState<'timeline' | 'skills' | 'risks' | 'report'>('timeline');
  const { showToast } = useToast();
  
  // Local state for interactive features
  const [completedMilestones, setCompletedMilestones] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (planData) { setLoading(false); return; }

    const fetchPlan = async () => {
      try {
        const result = await generateCareerPlan(userData, marketData, marketAnalysis);
        setPlanData(result);
      } catch (err) {
        showToast('حدث خطأ في توليد الخطة', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [userData, marketData, marketAnalysis]);

  const toggleMilestone = (milestone: string) => {
    const newSet = new Set(completedMilestones);
    if (newSet.has(milestone)) {
        newSet.delete(milestone);
    } else {
        newSet.add(milestone);
    }
    setCompletedMilestones(newSet);
  };

  const addToCalendar = (text: string) => {
     // Create a Google Calendar link for "Tomorrow at 9 AM"
     const now = new Date();
     now.setDate(now.getDate() + 1);
     now.setHours(9, 0, 0, 0);
     
     const startStr = now.toISOString().replace(/-|:|\.\d\d\d/g, "");
     const end = new Date(now.getTime() + 60 * 60 * 1000);
     const endStr = end.toISOString().replace(/-|:|\.\d\d\d/g, "");
     
     const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${startStr}/${endStr}&details=${encodeURIComponent("تذكير من تطبيق مسار AI")}`;
     window.open(url, '_blank');
     showToast('تم فتح التقويم لإضافة التذكير', 'info');
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('career-plan-report');
    if (!element) return;
    
    const opt = {
      margin: [10, 10],
      filename: `masar-plan-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    showToast('جاري تحضير ملف PDF...', 'info');
    // @ts-ignore
    html2pdf().set(opt).from(element).save().then(() => {
        showToast('تم تحميل الخطة بنجاح', 'success');
    }).catch(() => {
        showToast('فشل تحميل ملف PDF', 'error');
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8">
        <div className="w-24 h-24 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-8"></div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">جاري هندسة مسارك المهني...</h2>
        <p className="text-slate-500">يقوم النظام ببناء خارطة زمنية، شجرة مهارات، وتحليل مخاطر مخصص لك.</p>
      </div>
    );
  }

  if (!planData) return <div>Error loading plan.</div>;

  const tabs = [
    { id: 'timeline', label: '🗺️ الخارطة الزمنية' },
    { id: 'skills', label: '🌳 شجرة المهارات' },
    { id: 'risks', label: '🛡️ المخاطر والبدائل' },
    { id: 'report', label: '📄 التقرير الكامل' },
  ];

  return (
    <div className="w-full pb-24 max-w-6xl mx-auto">
      {/* Top Navigation for Plan Views */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 sticky top-20 z-30 bg-surface-50/90 dark:bg-surface-900/90 backdrop-blur p-2 rounded-2xl border border-slate-200 shadow-sm">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id 
              ? 'bg-slate-800 text-white shadow-lg' 
              : 'bg-white dark:bg-surface-800 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VIEW: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="animate-fade-in space-y-8">
           <h2 className="text-2xl font-black text-center mb-8 text-slate-800 dark:text-slate-100">رحلتك خلال السنوات القادمة</h2>
           <div className="relative border-r-4 border-slate-200 dark:border-surface-700 mr-4 md:mr-8 space-y-12">
              {planData.timeline.map((phase, idx) => (
                <div key={idx} className="relative pr-8 md:pr-12">
                   <div className="absolute top-0 -right-[21px] w-10 h-10 rounded-full bg-primary-600 border-4 border-white dark:border-surface-900 flex items-center justify-center text-white font-bold shadow-md z-10">
                      {idx + 1}
                   </div>
                   <Card className="hover:-translate-y-1 transition-transform duration-300">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-slate-100 dark:border-surface-700 pb-4">
                         <div>
                            <h3 className="text-xl font-bold text-primary-700 dark:text-primary-400">{phase.phaseName}</h3>
                            <p className="text-sm font-bold text-slate-400">{phase.duration}</p>
                         </div>
                         <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold mt-2 md:mt-0">
                            التركيز: {phase.focus}
                         </span>
                      </div>
                      <ul className="space-y-3">
                         {phase.milestones.map((m, i) => {
                            const isCompleted = completedMilestones.has(m);
                            return (
                                <li key={i} className={`flex items-start gap-3 text-sm transition-all ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                <button 
                                    onClick={() => toggleMilestone(m)}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isCompleted ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-green-500'}`}
                                >
                                    {isCompleted && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                </button>
                                <span className="cursor-pointer" onClick={() => toggleMilestone(m)}>{m}</span>
                                </li>
                            );
                         })}
                      </ul>
                   </Card>
                </div>
              ))}
           </div>
           
           {/* Action Plan with Reminders */}
           <Card title="⚡ خطوات تنفيذية فورية" className="mt-8 border-amber-200 bg-amber-50/50 dark:bg-surface-800 dark:border-surface-600">
               <div className="grid md:grid-cols-2 gap-6">
                   <div>
                       <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-3">المدى القصير</h4>
                       <ul className="space-y-2">
                           {planData.actionPlan.shortTerm.map((item, i) => (
                               <li key={i} className="flex items-center justify-between gap-2 text-sm bg-white dark:bg-surface-700 p-2 rounded-lg border border-amber-100 dark:border-surface-600">
                                   <span>{item}</span>
                                   <button 
                                      onClick={() => addToCalendar(item)}
                                      className="text-slate-400 hover:text-amber-600 p-1"
                                      title="إضافة تذكير للتقويم"
                                   >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                   </button>
                               </li>
                           ))}
                       </ul>
                   </div>
                   <div>
                       <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-3">المدى المتوسط</h4>
                       <ul className="space-y-2">
                           {planData.actionPlan.mediumTerm.map((item, i) => (
                               <li key={i} className="flex items-center justify-between gap-2 text-sm bg-white dark:bg-surface-700 p-2 rounded-lg border border-blue-100 dark:border-surface-600">
                                   <span>{item}</span>
                                   <button 
                                      onClick={() => addToCalendar(item)}
                                      className="text-slate-400 hover:text-blue-600 p-1"
                                      title="إضافة تذكير للتقويم"
                                   >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                   </button>
                               </li>
                           ))}
                       </ul>
                   </div>
               </div>
           </Card>
        </div>
      )}

      {/* VIEW: SKILL TREE */}
      {activeTab === 'skills' && (
        <div className="animate-fade-in">
           <h2 className="text-2xl font-black text-center mb-8 text-slate-800 dark:text-slate-100">المجرات المهارية (Skill Galaxy)</h2>
           <p className="text-center text-slate-500 mb-6">تصور تفاعلي لعلاقات مهاراتك التقنية والسلوكية</p>
           
           <SkillGalaxyGraph skills={planData.skillTree} />
           
           <div className="grid md:grid-cols-2 gap-8 mt-12">
              {/* Detailed Lists below chart */}
              <div>
                 <h3 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📐</span> المهارات التقنية (Hard Skills)
                 </h3>
                 <div className="space-y-4">
                    {planData.skillTree.filter(s => s.type === 'hard').map((skill, idx) => (
                       <div key={idx} className="bg-white dark:bg-surface-800 p-4 rounded-xl border border-slate-200 dark:border-surface-700 shadow-sm flex items-center justify-between">
                          <div>
                             <p className="font-bold text-slate-800 dark:text-slate-200">{skill.name}</p>
                             <span className={`text-[10px] px-2 py-0.5 rounded ${skill.importance === 'critical' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                {skill.importance === 'critical' ? 'أساسية' : 'إضافية'}
                             </span>
                          </div>
                          <div className="text-right">
                             <div className="text-xs text-slate-400 mb-1">المستوى المطلوب</div>
                             <div className="flex gap-1">
                                <div className={`w-3 h-3 rounded-full ${['beginner','intermediate','advanced'].includes(skill.level) ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                                <div className={`w-3 h-3 rounded-full ${['intermediate','advanced'].includes(skill.level) ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                                <div className={`w-3 h-3 rounded-full ${['advanced'].includes(skill.level) ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div>
                 <h3 className="text-lg font-bold text-purple-600 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🤝</span> المهارات الناعمة (Soft Skills)
                 </h3>
                 <div className="space-y-4">
                    {planData.skillTree.filter(s => s.type === 'soft').map((skill, idx) => (
                       <div key={idx} className="bg-white dark:bg-surface-800 p-4 rounded-xl border border-slate-200 dark:border-surface-700 shadow-sm flex items-center justify-between">
                          <div>
                             <p className="font-bold text-slate-800 dark:text-slate-200">{skill.name}</p>
                             <span className={`text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-600`}>
                                سلوكية
                             </span>
                          </div>
                          <div className="text-right">
                             <div className="text-xs text-slate-400 mb-1">الأهمية</div>
                             <span className="font-bold text-sm text-purple-500">{skill.importance}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* VIEW: RISKS */}
      {activeTab === 'risks' && (
        <div className="animate-fade-in">
           <h2 className="text-2xl font-black text-center mb-8 text-slate-800 dark:text-slate-100">تحليل المخاطر والخطط البديلة</h2>
           <div className="grid gap-6">
              {planData.risks.map((risk, idx) => (
                 <Card key={idx} className={`border-l-8 ${risk.impact === 'High' ? 'border-l-red-500' : risk.impact === 'Medium' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{risk.risk}</h3>
                       <span className={`text-xs font-bold px-3 py-1 rounded-full ${risk.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          تأثير: {risk.impact}
                       </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-surface-700 p-3 rounded-lg mt-3">
                       <p className="text-sm font-bold text-slate-500 mb-1">🛡️ خطة التخفيف (Mitigation):</p>
                       <p className="text-slate-700 dark:text-slate-300 text-sm">{risk.mitigation}</p>
                    </div>
                 </Card>
              ))}
           </div>
        </div>
      )}

      {/* VIEW: FULL REPORT */}
      {activeTab === 'report' && (
         <div className="animate-fade-in">
             <div className="flex justify-end mb-4">
                 <Button onClick={handleDownloadPDF} variant="outline" leftIcon={<span className="text-lg">📄</span>}>
                     تحميل الخطة (PDF)
                 </Button>
             </div>
             
             <div id="career-plan-report" className="bg-white dark:bg-surface-800 p-8 rounded-3xl border border-slate-200 shadow-xl">
                {/* Header for PDF only */}
                <div className="mb-6 border-b pb-4 hidden print:block">
                    <h1 className="text-2xl font-bold text-primary-600">مسار AI - خطة التطوير المهني</h1>
                    <p className="text-sm text-slate-500">تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</p>
                </div>
                
                <ReactMarkdown className="prose prose-lg dark:prose-invert max-w-none font-sans">
                   {planData.markdownPlan}
                </ReactMarkdown>
                
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-surface-700 text-center text-xs text-slate-400">
                    تم توليد هذا التقرير بواسطة مساعد الذكاء الاصطناعي في منصة مسار AI
                </div>
             </div>
         </div>
      )}

      <div className="mt-12 flex justify-center">
         <Button onClick={onRestart} variant="secondary">ابدأ من جديد</Button>
      </div>
    </div>
  );
};

export default PlanDisplayStep;
