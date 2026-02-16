
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

const SelfAwarenessStep: React.FC<Props> = ({ initialData, onNext, onBack }) => {
  const [formData, setFormData] = useState<SelfAwarenessData>(initialData);
  const [activeTab, setActiveTab] = useState<'basics' | 'skills' | 'personality' | 'goals'>('basics');
  const [errors, setErrors] = useState<Partial<Record<keyof SelfAwarenessData, string>>>({});
  const { showToast } = useToast();

  useEffect(() => { setFormData(initialData); }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name as keyof SelfAwarenessData]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const toggleValue = (val: string) => {
    const current = Array.isArray(formData.workValues) ? formData.workValues : [];
    const newValues = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
    setFormData(prev => ({ ...prev, workValues: newValues }));
  };

  const validate = () => {
    const newErrors: any = {};
    if (activeTab === 'basics') {
       if (!formData.ageGroup) newErrors.ageGroup = "مطلوب";
       if (!formData.location) newErrors.location = "مطلوب";
       if (!formData.educationLevel) newErrors.educationLevel = "مطلوب";
    }
    if (activeTab === 'skills' && !formData.experienceYears) newErrors.experienceYears = "مطلوب";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return showToast('يرجى إكمال الحقول المطلوبة', 'error');
    
    if (activeTab === 'basics') setActiveTab('skills');
    else if (activeTab === 'skills') setActiveTab('personality');
    else if (activeTab === 'personality') setActiveTab('goals');
    else onNext(formData);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper Components for Inputs
  const Field = ({ label, required, error, children, desc }: any) => (
    <div className="mb-5">
      <label className={`block text-sm font-bold mb-2 ${error ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {desc && <p className="text-xs text-slate-500 mb-2">{desc}</p>}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  const Input = (props: any) => <input {...props} className="w-full p-3 rounded-xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 outline-none focus:ring-2 focus:ring-primary-500 transition-all" />;
  const Select = ({ options, ...props }: any) => (
    <select {...props} className="w-full p-3 rounded-xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none">
      {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );

  return (
    <div className="max-w-4xl mx-auto w-full p-2 md:p-6 animate-fade-in pb-24">
      <div className="text-center mb-8">
           <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">بناء الملف الشخصي</h2>
           <p className="text-slate-500 mt-2">دعنا نتعرف عليك لنصنع مستقبلك.</p>
      </div>

      <LinkedInDataFetcher onDataFetched={(data) => {
          setFormData(prev => ({...prev, ...data}));
          showToast('تم استيراد البيانات بنجاح', 'success');
      }} />

      {/* Tabs Navigation */}
      <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
        {[
            {id: 'basics', label: '1. الأساسيات'}, 
            {id: 'skills', label: '2. الخبرات'}, 
            {id: 'personality', label: '3. الشخصية'}, 
            {id: 'goals', label: '4. الأهداف'}
        ].map(t => (
            <button key={t.id} 
                onClick={() => validate() && setActiveTab(t.id as any)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === t.id ? 'bg-slate-800 text-white shadow-lg' : 'bg-white dark:bg-surface-800 text-slate-500'}`}
            >
                {t.label}
            </button>
        ))}
      </div>

      <Card variant="glass" padding="lg">
        {activeTab === 'basics' && (
            <div className="grid md:grid-cols-2 gap-4 animate-scale-in">
                <Field label="الاسم" desc="اختياري"><Input name="name" value={formData.name} onChange={handleChange} placeholder="الاسم الكريم" /></Field>
                <Field label="الموقع" required error={errors.location}><Input name="location" value={formData.location} onChange={handleChange} placeholder="المدينة، الدولة" /></Field>
                <Field label="الفئة العمرية" required error={errors.ageGroup}>
                    <Select name="ageGroup" value={formData.ageGroup} onChange={handleChange} options={[
                        {value: "", label: "اختر..."}, {value: "student", label: "طالب"}, {value: "fresh", label: "خريج حديث"}, {value: "mid", label: "متوسط الخبرة"}, {value: "senior", label: "خبير"}
                    ]} />
                </Field>
                <Field label="المستوى التعليمي" required error={errors.educationLevel}>
                    <Select name="educationLevel" value={formData.educationLevel} onChange={handleChange} options={[
                        {value: "", label: "اختر..."}, {value: "bachelor", label: "بكالوريوس"}, {value: "master", label: "ماجستير"}, {value: "phd", label: "دكتوراه"}, {value: "diploma", label: "دبلوم"}
                    ]} />
                </Field>
                <Field label="التخصص"><Input name="major" value={formData.major} onChange={handleChange} placeholder="علوم حاسب، إدارة..." /></Field>
            </div>
        )}

        {activeTab === 'skills' && (
            <div className="animate-scale-in">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <Field label="المسمى الحالي"><Input name="currentRole" value={formData.currentRole} onChange={handleChange} placeholder="مثال: طالب، محاسب..." /></Field>
                    <Field label="سنوات الخبرة" required error={errors.experienceYears}>
                        <Select name="experienceYears" value={formData.experienceYears} onChange={handleChange} options={[
                            {value: "", label: "اختر..."}, {value: "0", label: "بدون"}, {value: "1-3", label: "1-3 سنوات"}, {value: "3-5", label: "3-5 سنوات"}, {value: "+5", label: "+5 سنوات"}
                        ]} />
                    </Field>
                </div>
                <Field label="المهارات (التقنية والناعمة)" desc="افصل بينها بفاصلة"><textarea name="skills" value={formData.skills} onChange={handleChange} className="w-full p-4 rounded-xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 min-h-[120px] outline-none focus:ring-2 focus:ring-primary-500" placeholder="Excel, القيادة, Python..." /></Field>
            </div>
        )}

        {activeTab === 'personality' && (
            <div className="animate-scale-in">
                <Field label="قيم العمل" desc="اختر ما يهمك">
                    <div className="flex flex-wrap gap-2">
                        {['الراتب العالي', 'التوازن', 'التطور', 'بيئة مرنة', 'الاستقرار'].map(v => (
                            <button key={v} onClick={() => toggleValue(v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${formData.workValues.includes(v) ? 'bg-primary-600 text-white border-primary-600' : 'bg-slate-50 dark:bg-surface-700 text-slate-500'}`}>{v}</button>
                        ))}
                    </div>
                </Field>
                <Field label="الاهتمامات"><textarea name="interests" value={formData.interests} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800" placeholder="القراءة، السفر، التقنية..." /></Field>
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="نقاط القوة"><Input name="strengths" value={formData.strengths} onChange={handleChange} placeholder="التعلم السريع..." /></Field>
                    <Field label="بيئة العمل"><Select name="workEnvironment" value={formData.workEnvironment} onChange={handleChange} options={[{value:"", label:"اختر..."},{value:"remote", label:"عن بعد"},{value:"office", label:"مكتبي"},{value:"hybrid", label:"هجين"}]} /></Field>
                </div>
            </div>
        )}

        {activeTab === 'goals' && (
            <div className="animate-scale-in">
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="هدف الدخل"><Input name="financialGoal" value={formData.financialGoal} onChange={handleChange} placeholder="مثال: 15,000 ريال" /></Field>
                    <Field label="المدة الزمنية"><Select name="timeline" value={formData.timeline} onChange={handleChange} options={[{value:"immediate", label:"فوري"},{value:"short", label:"6 أشهر"},{value:"medium", label:"سنة-سنتين"}]} /></Field>
                </div>
                <Field label="الطموح المهني" desc="أين ترى نفسك مستقبلاً؟"><textarea name="careerAspirations" value={formData.careerAspirations} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 min-h-[100px]" placeholder="مدير تنفيذي، خبير تقني..." /></Field>
            </div>
        )}
      </Card>

      <div className="flex justify-between mt-8 sticky bottom-4 z-20">
        <Button onClick={onBack} variant="secondary">السابق</Button>
        <Button onClick={handleNext} variant="gradient" className="shadow-xl px-8">{activeTab === 'goals' ? 'تحليل النتائج 🚀' : 'التالي'}</Button>
      </div>
    </div>
  );
};

export default SelfAwarenessStep;
