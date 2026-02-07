
import React, { useState, useEffect } from 'react';
import { SelfAwarenessData } from '../types';
import Card from './UI/Card';
import Button from './UI/Button';
import { useToast } from '../contexts/ToastContext';
import LinkedInDataFetcher from './LinkedInDataFetcher';

interface Props {
  initialData: SelfAwarenessData;
  onNext: (data: SelfAwarenessData) => void;
  onBack: () => void;
}

const InputWrapper = ({ 
  label, 
  required, 
  children, 
  error,
  description
}: { 
  label: string, 
  required?: boolean, 
  children?: React.ReactNode, 
  error?: string,
  description?: string
}) => (
  <div className={`mb-5 ${error ? 'animate-shake' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <label className={`block text-sm font-bold ${error ? 'text-red-600' : 'text-slate-700 dark:text-slate-200'}`}>
            {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">{description}</p>}
      
      <div className="relative">
          {children}
      </div>

      {error && <p className="text-xs text-red-500 mt-1.5 font-bold flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {error}
      </p>}
  </div>
);

type Tab = 'basics' | 'skills' | 'personality' | 'goals';

const dummyData: SelfAwarenessData = {
  name: 'عبدالله العتيبي',
  ageGroup: 'fresh',
  gender: 'male',
  location: 'الرياض',
  educationLevel: 'bachelor',
  major: 'هندسة برمجيات',
  currentRole: 'مطور واجهات أمامية',
  experienceYears: '1-3',
  skills: 'React, TypeScript, Tailwind CSS, Git, Problem Solving, التواصل الفعال',
  languages: 'العربية (اللغة الأم)، الإنجليزية (مهنية)',
  workValues: ['التطور المهني', 'بيئة عمل مرنة', 'الراتب المجزي'],
  workEnvironment: 'hybrid',
  personalityType: 'analytical',
  interests: 'تطوير الألعاب، الذكاء الاصطناعي، القراءة التقنية',
  financialGoal: '15,000 ريال',
  timeline: 'medium',
  constraints: 'أفضل العمل في الرياض أو عن بعد',
  strengths: 'التعلم السريع، العمل ضمن فريق',
  weaknesses: 'التحدث أمام الجمهور',
  riskTolerance: 'medium',
  autonomyLevel: 'collaborative',
  communicationStyle: 'direct',
  problemSolvingApproach: 'analytical',
  careerAspirations: 'الوصول لمنصب كبير المهندسين (Senior Engineer) خلال 3 سنوات'
};

const SelfAwarenessStep: React.FC<Props> = ({ initialData, onNext, onBack }) => {
  const [formData, setFormData] = useState<SelfAwarenessData>(initialData);
  const [activeTab, setActiveTab] = useState<Tab>('basics');
  const [errors, setErrors] = useState<Partial<Record<keyof SelfAwarenessData, string>>>({});
  const { showToast } = useToast();

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleLinkedInData = (data: Partial<SelfAwarenessData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    showToast('تم استيراد البيانات بنجاح! يرجى مراجعتها.', 'success');
  };

  const handleAutoFill = () => {
    setFormData(prev => ({ ...prev, ...dummyData }));
    showToast('تم تعبئة البيانات الافتراضية للتجربة السريعة 🚀', 'success');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof SelfAwarenessData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const toggleValue = (field: 'workValues', value: string) => {
    const current = formData[field] ? (Array.isArray(formData[field]) ? formData[field] : (formData[field] as string).split(',')) : [];
    const newValues = current.includes(value) 
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    
    setFormData(prev => ({ ...prev, [field]: newValues }));
  };

  const validateTab = (tab: Tab): boolean => {
    const newErrors: Partial<Record<keyof SelfAwarenessData, string>> = {};
    let isValid = true;

    if (tab === 'basics') {
       if (!formData.ageGroup) newErrors.ageGroup = "مطلوب";
       if (!formData.location) newErrors.location = "مطلوب";
       if (!formData.educationLevel) newErrors.educationLevel = "مطلوب";
    }

    if (tab === 'skills') {
        if (!formData.experienceYears) newErrors.experienceYears = "مطلوب";
        if (!formData.skills || formData.skills.length < 3) newErrors.skills = "يرجى ذكر بعض المهارات";
    }

    if (tab === 'personality') {
       if (!formData.personalityType) newErrors.personalityType = "مطلوب";
       if (!formData.interests || formData.interests.length < 3) newErrors.interests = "مطلوب";
    }
    
    if (tab === 'goals') {
       // Relaxed validation for goals to allow exploration
    }

    setErrors(prev => ({...prev, ...newErrors}));
    isValid = Object.keys(newErrors).length === 0;
    
    if (!isValid) showToast('يرجى إكمال الحقول المطلوبة', 'error');
    return isValid;
  };

  const handleNextTab = () => {
     if (validateTab(activeTab)) {
       if (activeTab === 'basics') setActiveTab('skills');
       else if (activeTab === 'skills') setActiveTab('personality');
       else if (activeTab === 'personality') setActiveTab('goals');
       else {
         onNext(formData);
       }
       window.scrollTo({ top: 0, behavior: 'smooth' });
     }
  };

  const inputClass = "w-full p-3 text-sm md:text-base bg-white dark:bg-surface-700 border border-slate-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all placeholder-slate-400";
  const selectClass = "w-full p-3 text-sm md:text-base bg-white dark:bg-surface-700 border border-slate-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all appearance-none cursor-pointer";

  const renderTabs = () => (
    <div className="flex overflow-x-auto pb-2 mb-6 gap-2 no-scrollbar">
       {[
         { id: 'basics', label: '1. الأساسيات', icon: '👤' },
         { id: 'skills', label: '2. المهارات', icon: '🛠️' },
         { id: 'personality', label: '3. الشخصية', icon: '🧠' },
         { id: 'goals', label: '4. الأهداف', icon: '🎯' },
       ].map(tab => (
         <button
           key={tab.id}
           onClick={() => validateTab(activeTab) && setActiveTab(tab.id as Tab)}
           className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-sm font-bold transition-all duration-300
             ${activeTab === tab.id 
               ? 'bg-primary-600 text-white shadow-lg scale-105' 
               : 'bg-white dark:bg-surface-800 text-slate-500 hover:bg-slate-50'
             }
           `}
         >
           <span>{tab.icon}</span>
           {tab.label}
         </button>
       ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto w-full p-2 md:p-6 animate-fade-in pb-24">
      <div className="text-center mb-6">
           <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">
             الملف الشخصي الشامل
           </h2>
           <p className="text-slate-500 text-sm mb-4">تساعدنا هذه المعلومات في بناء خطة دقيقة تناسب واقعك وطموحك.</p>
           
           {/* Auto-fill Button - Prominent for Testing */}
           <button 
             onClick={handleAutoFill}
             className="group relative inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-bold border border-amber-200 dark:border-amber-700 shadow-sm hover:shadow-md transition-all active:scale-95"
           >
             <span className="text-lg">⚡</span>
             <span>تعبئة تلقائية (تجربة سريعة)</span>
             <div className="absolute inset-0 rounded-full bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           </button>
      </div>

      <LinkedInDataFetcher onDataFetched={handleLinkedInData} />

      {renderTabs()}

      <div className="space-y-6 min-h-[400px]">
        {/* Animated Container for Tabs */}
        <div key={activeTab} className="animate-scale-in">
          {activeTab === 'basics' && (
             <Card variant="glass" padding="lg">
                <div className="grid md:grid-cols-2 gap-4">
                    <InputWrapper label="الاسم (اختياري)">
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputClass} placeholder="اسمك الكريم" />
                    </InputWrapper>
                    
                    <InputWrapper label="الفئة العمرية" required error={errors.ageGroup}>
                        <select name="ageGroup" value={formData.ageGroup} onChange={handleChange} className={selectClass}>
                            <option value="">اختر الفئة...</option>
                            <option value="teen">أقل من 18 (طالب مدرسة)</option>
                            <option value="student">18 - 22 (طالب جامعي)</option>
                            <option value="fresh">23 - 27 (خريج جديد / مبتدئ)</option>
                            <option value="mid">28 - 35 (متوسط الخبرة)</option>
                            <option value="senior">36 - 45 (خبير / قيادي)</option>
                            <option value="expert">أكبر من 45 (مستشار / تنفيذي)</option>
                        </select>
                    </InputWrapper>

                    <InputWrapper label="الجنس (للتحليل الديموغرافي)">
                         <select name="gender" value={formData.gender} onChange={handleChange} className={selectClass}>
                            <option value="">تفضل عدم الذكر</option>
                            <option value="male">ذكر</option>
                            <option value="female">أنثى</option>
                        </select>
                    </InputWrapper>

                    <InputWrapper label="الموقع الحالي" required error={errors.location}>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} placeholder="المدينة، الدولة" />
                    </InputWrapper>

                    <InputWrapper label="المستوى التعليمي" required error={errors.educationLevel}>
                        <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className={selectClass}>
                            <option value="">اختر المستوى...</option>
                            <option value="highschool">ثانوي</option>
                            <option value="diploma">دبلوم</option>
                            <option value="bachelor">بكالوريوس</option>
                            <option value="master">ماجستير</option>
                            <option value="phd">دكتوراه</option>
                            <option value="self">تعلم ذاتي</option>
                        </select>
                    </InputWrapper>

                    <InputWrapper label="التخصص / المجال الدراسي">
                        <input type="text" name="major" value={formData.major} onChange={handleChange} className={inputClass} placeholder="مثال: علوم حاسب، إدارة أعمال..." />
                    </InputWrapper>
                </div>
             </Card>
          )}

          {activeTab === 'skills' && (
            <Card variant="glass" padding="lg">
                <div className="grid md:grid-cols-2 gap-4">
                     <InputWrapper label="المسمى الوظيفي الحالي" description="إذا كنت طالباً اكتب 'طالب'">
                        <input type="text" name="currentRole" value={formData.currentRole} onChange={handleChange} className={inputClass} placeholder="مثال: محاسب، طالب..." />
                    </InputWrapper>

                    <InputWrapper label="سنوات الخبرة" required error={errors.experienceYears}>
                        <select name="experienceYears" value={formData.experienceYears} onChange={handleChange} className={selectClass}>
                            <option value="">اختر...</option>
                            <option value="0">بدون خبرة</option>
                            <option value="1-3">1 - 3 سنوات</option>
                            <option value="3-5">3 - 5 سنوات</option>
                            <option value="5-10">5 - 10 سنوات</option>
                            <option value="+10">أكثر من 10 سنوات</option>
                        </select>
                    </InputWrapper>
                </div>

                <InputWrapper label="المهارات (التقنية والناعمة)" required error={errors.skills} description="افصل بين المهارات بفاصلة. مثال: Python, إدارة الوقت, Excel, التواصل">
                    <textarea name="skills" value={formData.skills} onChange={handleChange} className={`${inputClass} min-h-[100px]`} placeholder="اكتب مهاراتك هنا..." />
                </InputWrapper>
                
                 <InputWrapper label="اللغات" description="مثال: العربية (أهلية)، الإنجليزية (متوسط)">
                    <input type="text" name="languages" value={formData.languages} onChange={handleChange} className={inputClass} placeholder="العربية، الإنجليزية..." />
                </InputWrapper>
            </Card>
          )}

          {activeTab === 'personality' && (
             <Card variant="glass" padding="lg">
                <div className="grid md:grid-cols-2 gap-4">
                    <InputWrapper label="نمط الشخصية / التفكير" required error={errors.personalityType}>
                        <select name="personalityType" value={formData.personalityType} onChange={handleChange} className={selectClass}>
                            <option value="">كيف تصف نفسك؟</option>
                            <option value="analytical">تحليلي (منطقي، يحب البيانات)</option>
                            <option value="creative">إبداعي (خيالي، يحب الابتكار)</option>
                            <option value="social">اجتماعي (يحب التعامل مع الناس)</option>
                            <option value="organized">تنظيمي (دقيق، يحب الإجراءات)</option>
                            <option value="leadership">قيادي (يحب اتخاذ القرارات)</option>
                        </select>
                    </InputWrapper>
                    
                    <InputWrapper label="بيئة العمل المفضلة">
                        <select name="workEnvironment" value={formData.workEnvironment} onChange={handleChange} className={selectClass}>
                             <option value="">اختر البيئة...</option>
                             <option value="remote">عمل عن بعد (من المنزل)</option>
                             <option value="office">مكتب تقليدي (روتيني)</option>
                             <option value="field">عمل ميداني (حركة مستمرة)</option>
                             <option value="hybrid">هجين (مختلط)</option>
                        </select>
                    </InputWrapper>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">ما هي أهم قيم العمل لديك؟ (اختر ما ينطبق)</label>
                    <div className="flex flex-wrap gap-2">
                        {['التطور المهني', 'التوازن (Work-Life Balance)', 'الدخل المرتفع', 'الأمان الوظيفي', 'التأثير الاجتماعي', 'الاستقلالية', 'بيئة مريحة'].map(val => (
                            <button
                                key={val}
                                onClick={() => toggleValue('workValues', val)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                    (Array.isArray(formData.workValues) ? formData.workValues : []).includes(val)
                                    ? 'bg-primary-100 text-primary-700 border-primary-300'
                                    : 'bg-white dark:bg-surface-700 border-slate-200 dark:border-surface-600 text-slate-500'
                                }`}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>
                
                <InputWrapper label="الاهتمامات والهوايات" required error={errors.interests} description="ماذا تفعل في وقت فراغك؟">
                    <textarea name="interests" value={formData.interests} onChange={handleChange} className={`${inputClass} min-h-[80px]`} placeholder="القراءة، الرياضة، التصميم..." />
                </InputWrapper>
             </Card>
          )}

          {activeTab === 'goals' && (
             <Card variant="glass" padding="lg">
                 <div className="grid md:grid-cols-2 gap-4">
                     <InputWrapper label="هدف الدخل (اختياري)" description="توقعك للراتب أو الدخل الشهري">
                        <input type="text" name="financialGoal" value={formData.financialGoal} onChange={handleChange} className={inputClass} placeholder="مثال: 10,000 ريال" />
                     </InputWrapper>
                     
                     <InputWrapper label="الإطار الزمني" description="متى تريد تحقيق أهدافك؟">
                         <select name="timeline" value={formData.timeline} onChange={handleChange} className={selectClass}>
                             <option value="immediate">فوري (أبحث عن عمل الآن)</option>
                             <option value="short">قصير المدى (6 أشهر)</option>
                             <option value="medium">متوسط (1-2 سنة)</option>
                             <option value="long">طويل المدى (خطة مستقبلية)</option>
                         </select>
                     </InputWrapper>
                 </div>

                 <InputWrapper label="القيود والتحديات" description="هل لديك قيود جغرافية، مالية، أو عائلية؟">
                     <textarea name="constraints" value={formData.constraints} onChange={handleChange} className={`${inputClass} min-h-[100px]`} placeholder="لا أستطيع الانتقال من مدينتي، أحتاج وظيفة بدوام جزئي..." />
                 </InputWrapper>
                 
                 <InputWrapper label="الطموح المهني (الحلم الكبير)" description="أين ترى نفسك في قمة مسارك؟">
                     <textarea name="careerAspirations" value={formData.careerAspirations} onChange={handleChange} className={`${inputClass} min-h-[80px]`} placeholder="رائد أعمال، مدير تنفيذي، خبير عالمي..." />
                 </InputWrapper>
             </Card>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8 items-center bg-white/80 dark:bg-surface-900/80 backdrop-blur p-4 rounded-2xl border border-slate-200 dark:border-surface-700 shadow-sm sticky bottom-4 z-40">
        <Button onClick={onBack} variant="secondary">
           {activeTab === 'basics' ? 'خروج' : 'السابق'}
        </Button>
        
        <Button onClick={handleNextTab} variant="gradient" className="min-w-[150px]">
           {activeTab === 'goals' ? 'التالي: تحليل السوق' : 'التالي'}
        </Button>
      </div>
    </div>
  );
};

export default SelfAwarenessStep;
